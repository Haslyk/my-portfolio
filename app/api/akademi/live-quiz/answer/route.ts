import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import { getLiveQuizQuestions } from '@/lib/akademi/liveQuizBank';
import { formatDurationMsTr } from '@/app/api/akademi/leaderboard/route';
import { getParticipantsForSession } from '@/lib/akademi/services/liveQuizDb';
import { invalidateLiveQuizStatusCache } from '@/lib/akademi/services/liveQuizCache';

const answerSchema = z.object({
  sessionId: z.string().min(1),
  questionIndex: z.number().int().min(0),
  selectedOption: z.enum(['A', 'B', 'C', 'D'])
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const parsed = answerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Geçersiz yanıt formatı.' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaAsync();
    const session = await (prisma as any).liveQuizSession.findUnique({
      where: { id: parsed.data.sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Yarışma oturumu bulunamadı.' },
        { status: 404 }
      );
    }

    if (
      session.status !== 'QUESTION_ACTIVE' ||
      session.currentQuestionIndex !== parsed.data.questionIndex
    ) {
      return NextResponse.json(
        { error: 'QUESTION_CLOSED', message: 'Bu soru şu an yanıta açık değil.' },
        { status: 400 }
      );
    }

    const participants = await getParticipantsForSession(prisma, session.id);
    const isParticipant = participants.some((p) => p.studentId === auth.student.id);
    if (!isParticipant) {
      return NextResponse.json(
        {
          error: 'NOT_A_PARTICIPANT',
          message: 'Girişler kapanmadan önce yarışmaya katılmamışsınız.'
        },
        { status: 403 }
      );
    }

    const questions = getLiveQuizQuestions(session.courseCode, session.weekOrder);
    const q = questions[parsed.data.questionIndex];
    if (!q) {
      return NextResponse.json(
        { error: 'INVALID_QUESTION', message: 'Soru bulunamadı.' },
        { status: 404 }
      );
    }

    const existing = await (prisma as any).liveQuizAnswer.findUnique({
      where: {
        sessionId_studentId_questionIndex: {
          sessionId: session.id,
          studentId: auth.student.id,
          questionIndex: parsed.data.questionIndex
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'ALREADY_ANSWERED', message: 'Bu soruyu zaten yanıtladın.' },
        { status: 409 }
      );
    }

    const startedAtMs = session.questionStartedAt
      ? new Date(session.questionStartedAt).getTime()
      : Date.now();
    const responseTimeMs = Math.max(50, Date.now() - startedAtMs);
    const isCorrect = parsed.data.selectedOption === q.correctOption;
    const points = isCorrect
      ? Math.max(500, 1000 - Math.floor(responseTimeMs / 30))
      : 0;

    const created = await (prisma as any).liveQuizAnswer.create({
      data: {
        sessionId: session.id,
        studentId: auth.student.id,
        questionIndex: parsed.data.questionIndex,
        selectedOption: parsed.data.selectedOption,
        isCorrect,
        responseTimeMs,
        points
      }
    });

    // Check if ALL joined participants have answered this question -> auto-reveal!
    const allAnswersForQ = await (prisma as any).liveQuizAnswer.findMany({
      where: {
        sessionId: session.id,
        questionIndex: parsed.data.questionIndex
      }
    });

    if (participants.length > 0 && allAnswersForQ.length >= participants.length) {
      await (prisma as any).liveQuizSession.update({
        where: { id: session.id },
        data: { status: 'QUESTION_RESULTS' }
      });
    }

    invalidateLiveQuizStatusCache(session.courseCode);

    return NextResponse.json({
      ok: true,
      answer: {
        selectedOption: created.selectedOption,
        responseTimeMs: created.responseTimeMs,
        durationFormatted: formatDurationMsTr(created.responseTimeMs)
      }
    });
  } catch (err) {
    console.error('Live quiz answer error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Yanıt kaydedilemedi.' },
      { status: 500 }
    );
  }
}
