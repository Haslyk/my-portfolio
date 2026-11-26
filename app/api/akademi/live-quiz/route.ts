import { NextRequest, NextResponse } from 'next/server';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import {
  getAuthenticatedAdmin,
  getAuthenticatedStudent
} from '@/lib/akademi/services/sessionService';
import { getLiveQuizQuestions } from '@/lib/akademi/liveQuizBank';
import { formatDurationMsTr } from '@/app/api/akademi/leaderboard/route';
import { getParticipantsForSession } from '@/lib/akademi/services/liveQuizDb';

function computeRankedBoard(
  participantIds: string[],
  answers: any[],
  maxQuestionIdxInclusive: number,
  studentMap: Map<string, { id: string; firstName: string; lastName: string }>
) {
  const totals = new Map<
    string,
    { points: number; correctCount: number; totalMs: number }
  >();

  for (const pid of participantIds) {
    totals.set(pid, { points: 0, correctCount: 0, totalMs: 0 });
  }

  for (const a of answers) {
    if (a.questionIndex > maxQuestionIdxInclusive) continue;
    const prev = totals.get(a.studentId) || {
      points: 0,
      correctCount: 0,
      totalMs: 0
    };
    totals.set(a.studentId, {
      points: prev.points + (a.points || 0),
      correctCount: prev.correctCount + (a.isCorrect ? 1 : 0),
      totalMs: prev.totalMs + (a.isCorrect ? a.responseTimeMs : 0)
    });
  }

  return Array.from(totals.entries())
    .map(([sid, agg]) => {
      const st = studentMap.get(sid);
      return {
        studentId: sid,
        displayName: st
          ? `${st.firstName} ${st.lastName.charAt(0)}.`
          : 'Öğrenci',
        points: agg.points,
        correctCount: agg.correctCount,
        totalMs: agg.totalMs,
        durationFormatted: formatDurationMsTr(agg.totalMs || 1)
      };
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.correctCount !== a.correctCount)
        return b.correctCount - a.correctCount;
      return a.totalMs - b.totalMs;
    })
    .map((item, idx) => ({ rank: idx + 1, ...item }));
}

export async function GET(req: NextRequest) {
  try {
    const studentAuth = await getAuthenticatedStudent(req);
    const adminAuth = studentAuth.ok ? null : await getAuthenticatedAdmin(req);
    if (!studentAuth.ok && (!adminAuth || !adminAuth.ok)) {
      return studentAuth.response;
    }

    const url = new URL(req.url);
    const courseCode = url.searchParams.get('course') || 'ag-temelleri';
    const prisma = await getPrismaAsync();

    const sessions = await (prisma as any).liveQuizSession.findMany({
      where: { courseCode },
      orderBy: { createdAt: 'desc' }
    });
    const session = sessions[0] || null;

    if (!session) {
      return NextResponse.json({ session: null });
    }

    const questions = getLiveQuizQuestions(courseCode, session.weekOrder);
    const currentQ = questions[session.currentQuestionIndex] || null;

    const [participants, answers]: [any[], any[]] = await Promise.all([
      getParticipantsForSession(prisma, session.id),
      (prisma as any).liveQuizAnswer.findMany({
        where: { sessionId: session.id }
      })
    ]);

    const allStudentIds = Array.from(
      new Set([
        ...participants.map((p) => p.studentId),
        ...answers.map((a) => a.studentId)
      ])
    );

    const students =
      allStudentIds.length > 0
        ? await prisma.student.findMany({
            where: { id: { in: allStudentIds } },
            select: { id: true, firstName: true, lastName: true }
          })
        : [];
    const studentMap = new Map(students.map((s) => [s.id, s]));

    const currentAnswers = answers.filter(
      (a) => a.questionIndex === session.currentQuestionIndex
    );

    const showQuestionResults =
      session.status === 'QUESTION_RESULTS' || session.status === 'FINISHED';

    const top3Fastest = showQuestionResults
      ? currentAnswers
          .filter((a) => a.isCorrect)
          .sort((a, b) => a.responseTimeMs - b.responseTimeMs)
          .slice(0, 3)
          .map((a, idx) => {
            const st = studentMap.get(a.studentId);
            return {
              rank: idx + 1,
              studentId: a.studentId,
              displayName: st
                ? `${st.firstName} ${st.lastName.charAt(0)}.`
                : 'Öğrenci',
              responseTimeMs: a.responseTimeMs,
              durationFormatted: formatDurationMsTr(a.responseTimeMs),
              points: a.points
            };
          })
      : [];

    let leaderboard: any[] = [];
    if (showQuestionResults || Boolean(adminAuth?.ok)) {
      const currentBoard = computeRankedBoard(
        allStudentIds,
        answers,
        session.currentQuestionIndex,
        studentMap
      );
      const prevBoard =
        session.currentQuestionIndex > 0
          ? computeRankedBoard(
              allStudentIds,
              answers,
              session.currentQuestionIndex - 1,
              studentMap
            )
          : [];
      const prevRankMap = new Map(prevBoard.map((r) => [r.studentId, r.rank]));

      leaderboard = currentBoard.map((row) => {
        const prevRank = prevRankMap.get(row.studentId) ?? row.rank;
        return {
          ...row,
          prevRank,
          rankDelta: prevRank - row.rank // > 0 means moved UP, < 0 means dropped
        };
      });
    }

    const isParticipant = studentAuth.ok
      ? participants.some((p) => p.studentId === studentAuth.student.id)
      : false;

    const myAnswer = studentAuth.ok
      ? currentAnswers.find((a) => a.studentId === studentAuth.student.id) ||
        null
      : null;

    return NextResponse.json({
      session: {
        id: session.id,
        courseCode: session.courseCode,
        weekOrder: session.weekOrder,
        title: session.title,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: questions.length,
        questionStartedAt: session.questionStartedAt
          ? new Date(session.questionStartedAt).toISOString()
          : null,
        participantCount: participants.length,
        answeredCount: currentAnswers.length
      },
      isParticipant,
      participants: participants.map((p) => {
        const st = studentMap.get(p.studentId);
        return {
          studentId: p.studentId,
          displayName: st
            ? `${st.firstName} ${st.lastName.charAt(0)}.`
            : 'Öğrenci'
        };
      }),
      currentQuestion: currentQ
        ? {
            id: currentQ.id,
            prompt: currentQ.prompt,
            options: currentQ.options,
            ...(showQuestionResults || adminAuth?.ok
              ? {
                  correctOption: currentQ.correctOption,
                  explanation: currentQ.explanation
                }
              : {})
          }
        : null,
      allQuestions: questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options
      })),
      myAnswer: myAnswer
        ? {
            selectedOption: myAnswer.selectedOption,
            // Answers & correctness remain hidden while QUESTION_ACTIVE!
            isCorrect: showQuestionResults ? myAnswer.isCorrect : null,
            responseTimeMs: myAnswer.responseTimeMs,
            durationFormatted: formatDurationMsTr(myAnswer.responseTimeMs),
            points: showQuestionResults ? myAnswer.points : null
          }
        : null,
      top3Fastest,
      leaderboard
    });
  } catch (err) {
    console.error('Live quiz GET error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Yarışma bilgisi yüklenemedi.' },
      { status: 500 }
    );
  }
}
