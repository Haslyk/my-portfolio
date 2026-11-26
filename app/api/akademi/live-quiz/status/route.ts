import { NextRequest, NextResponse } from 'next/server';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import {
  getCachedLiveQuizStatus,
  setCachedLiveQuizStatus,
  LiveQuizStatusSnapshot
} from '@/lib/akademi/services/liveQuizCache';
import { getParticipantsForSession } from '@/lib/akademi/services/liveQuizDb';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const courseCode = url.searchParams.get('course') || 'ag-temelleri';

    const cached = getCachedLiveQuizStatus(courseCode, 2000);
    if (cached) {
      return NextResponse.json(cached);
    }

    const prisma = await getPrismaAsync();
    const sessions = await (prisma as any).liveQuizSession.findMany({
      where: { courseCode },
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    const latest = sessions[0] || null;
    if (!latest) {
      const empty: LiveQuizStatusSnapshot = {
        active: false,
        sessionId: null,
        status: null,
        currentQuestionIndex: 0,
        participantCount: 0,
        answeredCount: 0
      };
      setCachedLiveQuizStatus(courseCode, empty);
      return NextResponse.json(empty);
    }

    const [participants, answersForQ] = await Promise.all([
      getParticipantsForSession(prisma, latest.id),
      (prisma as any).liveQuizAnswer.findMany({
        where: {
          sessionId: latest.id,
          questionIndex: latest.currentQuestionIndex
        },
        select: { id: true }
      })
    ]);

    const snapshot: LiveQuizStatusSnapshot = {
      active: Boolean(latest.status && latest.status !== 'FINISHED'),
      sessionId: latest.id,
      status: latest.status,
      currentQuestionIndex: latest.currentQuestionIndex,
      participantCount: participants.length,
      answeredCount: answersForQ.length
    };

    setCachedLiveQuizStatus(courseCode, snapshot);
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json({
      active: false,
      sessionId: null,
      status: null,
      currentQuestionIndex: 0,
      participantCount: 0,
      answeredCount: 0
    });
  }
}
