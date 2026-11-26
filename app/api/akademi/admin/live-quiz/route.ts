import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';
import { getLiveQuizQuestions } from '@/lib/akademi/liveQuizBank';
import { invalidateLiveQuizStatusCache } from '@/lib/akademi/services/liveQuizCache';

const actionSchema = z.object({
  courseCode: z.enum(['ag-temelleri', 'pc-donanimi', 'gorsel-programlama']),
  action: z.enum([
    'CREATE',
    'CLOSE_LOBBY',
    'START_QUESTION',
    'SHOW_RESULTS',
    'NEXT_QUESTION',
    'FINISH'
  ]),
  weekOrder: z.number().int().min(0).max(5).optional(),
  sessionId: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Geçersiz yarışma komutu.' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaAsync();
    const { courseCode, action, weekOrder = 0, sessionId } = parsed.data;
    invalidateLiveQuizStatusCache(courseCode);

    if (action === 'CREATE') {
      const title =
        weekOrder === 0
          ? 'Ders Sonu Büyük Özet Yarışması'
          : `Hafta ${weekOrder} Bilgi Yarışması`;
      const created = await (prisma as any).liveQuizSession.create({
        data: {
          courseCode,
          weekOrder,
          title,
          status: 'LOBBY_OPEN',
          currentQuestionIndex: 0,
          questionStartedAt: null
        }
      });
      return NextResponse.json({ ok: true, session: created });
    }

    const session = sessionId
      ? await (prisma as any).liveQuizSession.findUnique({
          where: { id: sessionId }
        })
      : (
          await (prisma as any).liveQuizSession.findMany({
            where: { courseCode },
            orderBy: { createdAt: 'desc' }
          })
        )[0];

    if (!session) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Aktif yarışma oturumu bulunamadı.' },
        { status: 404 }
      );
    }

    const questions = getLiveQuizQuestions(courseCode, session.weekOrder);

    if (action === 'CLOSE_LOBBY') {
      const updated = await (prisma as any).liveQuizSession.update({
        where: { id: session.id },
        data: { status: 'LOBBY_CLOSED' }
      });
      return NextResponse.json({ ok: true, session: updated });
    }

    if (action === 'START_QUESTION') {
      const updated = await (prisma as any).liveQuizSession.update({
        where: { id: session.id },
        data: {
          status: 'QUESTION_ACTIVE',
          questionStartedAt: new Date()
        }
      });
      return NextResponse.json({ ok: true, session: updated });
    }

    if (action === 'SHOW_RESULTS') {
      const updated = await (prisma as any).liveQuizSession.update({
        where: { id: session.id },
        data: { status: 'QUESTION_RESULTS' }
      });
      return NextResponse.json({ ok: true, session: updated });
    }

    if (action === 'NEXT_QUESTION') {
      const nextIdx = session.currentQuestionIndex + 1;
      if (nextIdx >= questions.length) {
        const updated = await (prisma as any).liveQuizSession.update({
          where: { id: session.id },
          data: { status: 'FINISHED' }
        });
        return NextResponse.json({ ok: true, session: updated });
      }
      const updated = await (prisma as any).liveQuizSession.update({
        where: { id: session.id },
        data: {
          currentQuestionIndex: nextIdx,
          status: 'QUESTION_ACTIVE',
          questionStartedAt: new Date()
        }
      });
      return NextResponse.json({ ok: true, session: updated });
    }

    if (action === 'FINISH') {
      const updated = await (prisma as any).liveQuizSession.update({
        where: { id: session.id },
        data: { status: 'FINISHED' }
      });
      return NextResponse.json({ ok: true, session: updated });
    }

    return NextResponse.json({ ok: true, session });
  } catch (err) {
    console.error('Admin live quiz error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Yarışma işlemi başarısız.' },
      { status: 500 }
    );
  }
}
