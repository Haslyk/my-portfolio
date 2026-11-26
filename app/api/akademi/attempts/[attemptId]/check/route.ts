import { NextRequest, NextResponse } from 'next/server';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import {
  checkWeekUnlocked,
  recalculateAndSyncWeekProgress
} from '@/lib/akademi/services/progressService';
import { computeBoundedActiveDeltaSeconds } from '@/lib/akademi/services/leaseService';
import { validateActivitySubmission } from '@/lib/akademi/validators/activityValidators';
import {
  gradeActivitySubmission,
  validateAndApplyRamState
} from '@/lib/akademi/pc-donanimi/activityGraders';
import { gradeGpActivitySubmission } from '@/lib/akademi/gorsel-programlama';

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

    let candidateState =
      body && typeof body.state === 'object' && body.state !== null
        ? body.state
        : (attempt.state as Record<string, any>);

    const isDonanim =
      attempt.activity.courseCode === 'pc-donanimi' ||
      attempt.activity.code.startsWith('D-');
    const isGorsel =
      attempt.activity.courseCode === 'gorsel-programlama' ||
      /^H[1-5]-E[1-5]$/.test(attempt.activity.code);

    let passed = false;
    let summaryMessage = '';
    let feedbackItems: any[] = [];
    let donanimItems: any[] = [];
    let preservedState: Record<string, any> = candidateState;

    if (isGorsel) {
      const graded = gradeGpActivitySubmission(
        attempt.activity.code,
        candidateState
      );
      passed = graded.passed;
      summaryMessage = graded.summaryMessage;
      feedbackItems = graded.feedbackItems;
      donanimItems = graded.feedbackItems.map((it) => ({
        itemId: it.fieldId,
        correct: it.isCorrect,
        message: it.message
      }));
      preservedState = graded.preservedState;
    } else if (isDonanim) {
      if (attempt.activity.code === 'D-W2-A2') {
        const prevState =
          typeof attempt.state === 'object' && attempt.state !== null
            ? (attempt.state as Record<string, any>)
            : {};
        const ramCheck = validateAndApplyRamState(prevState, candidateState);
        if (!ramCheck.valid) {
          return NextResponse.json(
            {
              error: ramCheck.errorMessage,
              code: 'INVALID_RAM_TRANSITION',
              message: ramCheck.errorMessage
            },
            { status: 400 }
          );
        }
        candidateState = ramCheck.sanitizedState;
      }

      const graded = gradeActivitySubmission(
        attempt.activity.code,
        '2026.1',
        candidateState
      );
      passed = graded.passed;
      summaryMessage = graded.summaryMessage;
      donanimItems = graded.items;
      feedbackItems = graded.items.map((it) => ({
        fieldId: it.itemId,
        isCorrect: it.correct,
        message: it.message
      }));
      preservedState = graded.preservedState as Record<string, any>;
    } else {
      const validation = validateActivitySubmission(
        attempt.activity.code,
        candidateState
      );
      passed = validation.passed;
      summaryMessage = validation.summaryMessage;
      feedbackItems = validation.feedbackItems;
      donanimItems = validation.feedbackItems.map((it) => ({
        itemId: it.fieldId,
        correct: it.isCorrect,
        message: it.message
      }));
      preservedState = candidateState;
    }

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

      const newStatus = passed ? 'COMPLETED' : 'IN_PROGRESS';
      const completedAt = passed ? now : null;
      const isFirstSuccess = passed && currentAttempt.mode === 'NORMAL';

      const updatedAttempt = await tx.activityAttempt.update({
        where: { id: currentAttempt.id },
        data: {
          state: preservedState,
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

    const elapsedMs =
      txResult.updatedAttempt.completedAt && txResult.updatedAttempt.startedAt
        ? Math.max(
            1,
            txResult.updatedAttempt.completedAt.getTime() -
              txResult.updatedAttempt.startedAt.getTime()
          )
        : null;
    const elapsedSeconds =
      elapsedMs !== null ? Math.max(1, Math.floor(elapsedMs / 1000)) : null;

    const earlyFinisher =
      passed &&
      txResult.updatedAttempt.activeSeconds < attempt.activity.allocatedSeconds;

    return NextResponse.json({
      passed,
      status: txResult.updatedAttempt.status,
      attemptStatus: txResult.updatedAttempt.status,
      summaryMessage,
      feedbackItems,
      items: donanimItems,
      preservedState: txResult.updatedAttempt.state,
      completedAt: txResult.updatedAttempt.completedAt
        ? txResult.updatedAttempt.completedAt.toISOString()
        : null,
      activeSeconds: txResult.updatedAttempt.activeSeconds,
      elapsedSeconds,
      elapsedMs,
      checkCount: txResult.updatedAttempt.checkCount,
      isFirstTry: txResult.updatedAttempt.checkCount <= 1,
      revision: txResult.updatedAttempt.revision,
      weekStatus: txResult.weekStatus,
      weekCompleted: txResult.weekStatus === 'COMPLETED',
      nextWeekUnlocked: txResult.nextWeekUnlocked,
      earlyFinisher
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
