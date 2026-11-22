import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import {
  checkWeekUnlocked,
  recalculateAndSyncWeekProgress
} from '@/lib/akademi/services/progressService';
import { issueOrTakeoverLease } from '@/lib/akademi/services/leaseService';
import { getPublicActivityByCode } from '@/lib/akademi/pc-donanimi';

async function resolveActivity(param: string) {
  const prisma = await getPrismaAsync();
  const byId = await prisma.activity.findUnique({
    where: { id: param },
    include: { week: true }
  });
  if (byId) return byId;
  return prisma.activity.findUnique({
    where: { code: param },
    include: { week: true }
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ activityId: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const { activityId } = await context.params;
    const prisma = await getPrismaAsync();
    const studentId = auth.student.id;
    const activity = await resolveActivity(activityId);

    if (!activity) {
      return NextResponse.json(
        {
          error: 'ACTIVITY_NOT_FOUND',
          message: 'Etkinlik bulunamadı.'
        },
        { status: 404 }
      );
    }

    const lockCheck = await checkWeekUnlocked(
      prisma,
      studentId,
      activity.weekId
    );
    if (!lockCheck.unlocked) {
      return NextResponse.json(
        {
          error: 'WEEK_LOCKED',
          code: 'WEEK_LOCKED',
          message:
            'Bu haftanın kilidi henüz açılmadı. Önce önceki haftayı tamamlamalısın.'
        },
        { status: 403 }
      );
    }

    // For PC Donanımı Quiz: ensure both required applications are completed before starting quiz
    if (
      activity.courseCode === 'pc-donanimi' &&
      activity.type === 'QUIZ'
    ) {
      const weekApps = await prisma.activity.findMany({
        where: {
          weekId: activity.weekId,
          type: 'REQUIRED_ACTIVITY',
          required: true
        }
      });
      const completedApps = await prisma.activityAttempt.findMany({
        where: {
          studentId,
          activityId: { in: weekApps.map((a) => a.id) },
          status: 'COMPLETED'
        }
      });
      const doneSet = new Set(completedApps.map((a) => a.activityId));
      if (!weekApps.every((a) => doneSet.has(a.id))) {
        return NextResponse.json(
          {
            error:
              'Değerlendirmeye başlamadan önce bu haftanın iki zorunlu uygulamasını tamamlamalısın.',
            code: 'QUIZ_PREREQUISITES_INCOMPLETE',
            message:
              'Değerlendirmeye başlamadan önce bu haftanın iki zorunlu uygulamasını tamamlamalısın.'
          },
          { status: 403 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: studentId },
        data: { lastSeenAt: new Date() }
      });

      let attempt = await tx.activityAttempt.findFirst({
        where: {
          studentId,
          activityId: activity.id,
          mode: 'NORMAL'
        }
      });

      if (!attempt) {
        try {
          attempt = await tx.activityAttempt.create({
            data: {
              studentId,
              activityId: activity.id,
              mode: 'NORMAL',
              isFirstSuccess: false,
              contentVersion: activity.contentVersion,
              state: {},
              revision: 1,
              status: 'IN_PROGRESS',
              startedAt: new Date(),
              lastHeartbeatAt: new Date()
            }
          });
        } catch (err) {
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002'
          ) {
            attempt = await tx.activityAttempt.findFirst({
              where: {
                studentId,
                activityId: activity.id,
                mode: 'NORMAL'
              }
            });
          } else {
            throw err;
          }
        }
      } else {
        attempt = await tx.activityAttempt.update({
          where: { id: attempt.id },
          data: {
            lastHeartbeatAt: new Date()
          }
        });
      }

      if (!attempt) {
        throw new Error('ATTEMPT_CREATION_FAILED');
      }

      await recalculateAndSyncWeekProgress(tx, studentId, activity.weekId);

      const leaseToken = await issueOrTakeoverLease(tx, studentId, attempt.id);
      return { attempt, leaseToken };
    });

    const donanimPublicDef =
      activity.courseCode === 'pc-donanimi'
        ? getPublicActivityByCode(activity.code)
        : undefined;

    const elapsedSeconds =
      result.attempt.completedAt && result.attempt.startedAt
        ? Math.max(
            1,
            Math.floor(
              (result.attempt.completedAt.getTime() -
                result.attempt.startedAt.getTime()) /
                1000
            )
          )
        : null;

    return NextResponse.json({
      attempt: {
        id: result.attempt.id,
        activityId: result.attempt.activityId,
        activityCode: activity.code,
        weekOrder: activity.week.order,
        weekId: activity.weekId,
        mode: result.attempt.mode,
        status: result.attempt.status,
        isFirstSuccess: result.attempt.isFirstSuccess,
        state: result.attempt.state,
        revision: result.attempt.revision,
        startedAt: result.attempt.startedAt,
        completedAt: result.attempt.completedAt,
        elapsedSeconds,
        activeSeconds: result.attempt.activeSeconds,
        checkCount: result.attempt.checkCount,
        firstSuccessSummary:
          result.attempt.status === 'COMPLETED'
            ? {
                completedAt: result.attempt.completedAt,
                elapsedSeconds,
                activeSeconds: result.attempt.activeSeconds
              }
            : null,
        hasOpenHelp: false
      },
      activity: donanimPublicDef,
      leaseToken: result.leaseToken
    });
  } catch (err) {
    console.error('Start activity error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Etkinlik başlatılırken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
