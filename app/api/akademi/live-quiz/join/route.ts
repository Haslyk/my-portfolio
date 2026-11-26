import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import { upsertParticipantForSession } from '@/lib/akademi/services/liveQuizDb';
import { invalidateLiveQuizStatusCache } from '@/lib/akademi/services/liveQuizCache';

const joinSchema = z.object({
  sessionId: z.string().min(1)
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const parsed = joinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Geçersiz oturum bilgisi.' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaAsync();
    const session = await (prisma as any).liveQuizSession.findUnique({
      where: { id: parsed.data.sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Yarışma bulunamadı.' },
        { status: 404 }
      );
    }

    if (session.status !== 'LOBBY_OPEN') {
      return NextResponse.json(
        {
          error: 'LOBBY_CLOSED',
          message: 'Yarışmaya girişler öğretmen tarafından kapatıldı.'
        },
        { status: 403 }
      );
    }

    await upsertParticipantForSession(prisma, session.id, auth.student.id);
    invalidateLiveQuizStatusCache(session.courseCode);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Live quiz join error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Yarışmaya katılınamadı.' },
      { status: 500 }
    );
  }
}
