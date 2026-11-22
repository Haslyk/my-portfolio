import { NextRequest, NextResponse } from 'next/server';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import {
  checkWeekUnlocked,
  recalculateAndSyncWeekProgress
} from '@/lib/akademi/services/progressService';
import { computeBoundedActiveDeltaSeconds } from '@/lib/akademi/services/leaseService';
import { validateActivitySubmission } from '@/lib/akademi/validators/activityValidators';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const { attemptId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const prisma = await getPrismaAsync();
    const studentId = auth.student.id;

    const attempt = await prisma.activityAttempt.findUnique({
      where: { id: attemptId },
      include: { activity: true }
    });

    if (!attempt) {
      return NextResponse.json(
        {
          error: 'ATTEMPT_NOT_FOUND',
          message: 'Çalışma kaydı bulunamadı.'
        },
        { status: 404 }
      );
    }

    if (attempt.studentId !== studentId) {
      return NextResponse.json(
        {
          error: 'FORBIDDEN_ATTEMPT_ACCESS',
          message: 'Başka bir öğrencinin çalışma kaydına erişemezsiniz.'
        },
        { status: 403 }
      );
    }

    const lockCheck = await checkWeekUnlocked(
      prisma,
      studentId,
      attempt.activity.weekId
    );
    if (!lockCheck.unlocked) {
      return NextResponse.json(
        {
          error: 'WEEK_LOCKED',
          message:
            'Bu haftanın kilidi henüz açılmadığı için doğrulama yapılamaz.'
        },
        { status: 403 }
      );
    }

    const candidateState =
      body && typeof body.state === 'object' && body.state !== null
        ? body.state
        : attempt.state;

    const validation = validateActivitySubmission(
      attempt.activity.code,
      candidateState
    );

    const now = new Date();

    const txResult = await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: studentId },
        data: { lastSeenAt: now }
      });

      const currentAttempt = await tx.activityAttempt.findUnique({
        where: { id: attempt.id }
      });
      if (!currentAttempt) {
        throw new Error('ATTEMPT_NOT_FOUND');
      }

      if (currentAttempt.status === 'COMPLETED') {
        const progress = await recalculateAndSyncWeekProgress(
          tx,
          studentId,
          attempt.activity.weekId
        );
        return {
          updatedAttempt: currentAttempt,
          weekStatus: progress.weekStatus,
          nextWeekUnlocked: progress.nextWeekUnlocked
        };
      }

      const deltaSec = computeBoundedActiveDeltaSeconds(
        currentAttempt.lastHeartbeatAt,
        now
      );
      const newActiveSeconds = Math.max(
        1,
        currentAttempt.activeSeconds + deltaSec
      );

      const newStatus = validation.passed ? 'COMPLETED' : 'IN_PROGRESS';
      const completedAt = validation.passed ? now : null;
      const isFirstSuccess =
        validation.passed && currentAttempt.mode === 'NORMAL';

      const updatedAttempt = await tx.activityAttempt.update({
        where: { id: currentAttempt.id },
        data: {
          state: candidateState,
          revision: { increment: 1 },
          status: newStatus,
          completedAt,
          isFirstSuccess,
          activeSeconds: newActiveSeconds,
          checkCount: { increment: 1 },
          lastHeartbeatAt: now
        }
      });

      const progress = await recalculateAndSyncWeekProgress(
        tx,
        studentId,
        attempt.activity.weekId
      );

      return {
        updatedAttempt,
        weekStatus: progress.weekStatus,
        nextWeekUnlocked: progress.nextWeekUnlocked
      };
    });

    const elapsedSeconds =
      txResult.updatedAttempt.completedAt && txResult.updatedAttempt.startedAt
        ? Math.max(
            1,
            Math.floor(
              (txResult.updatedAttempt.completedAt.getTime() -
                txResult.updatedAttempt.startedAt.getTime()) /
                1000
            )
          )
        : null;

    return NextResponse.json({
      passed: validation.passed,
      summaryMessage: validation.summaryMessage,
      feedbackItems: validation.feedbackItems,
      attemptStatus: txResult.updatedAttempt.status,
      completedAt: txResult.updatedAttempt.completedAt
        ? txResult.updatedAttempt.completedAt.toISOString()
        : null,
      activeSeconds: txResult.updatedAttempt.activeSeconds,
      elapsedSeconds,
      checkCount: txResult.updatedAttempt.checkCount,
      revision: txResult.updatedAttempt.revision,
      weekStatus: txResult.weekStatus,
      nextWeekUnlocked: txResult.nextWeekUnlocked
    });
  } catch (err) {
    console.error('Check attempt error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Doğrulama sırasında hata oluştu.'
      },
      { status: 500 }
    );
  }
}
