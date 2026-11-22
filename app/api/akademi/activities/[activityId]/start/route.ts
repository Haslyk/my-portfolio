import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import {
  checkWeekUnlocked,
  recalculateAndSyncWeekProgress
} from '@/lib/akademi/services/progressService';
import { issueOrTakeoverLease } from '@/lib/akademi/services/leaseService';

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
          message:
            'Bu haftanın kilidi henüz açılmadı. Önce önceki haftayı tamamlamalısın.'
        },
        { status: 403 }
      );
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

    return NextResponse.json({
      attempt: {
        id: result.attempt.id,
        activityId: result.attempt.activityId,
        activityCode: activity.code,
        mode: result.attempt.mode,
        status: result.attempt.status,
        state: result.attempt.state,
        revision: result.attempt.revision,
        startedAt: result.attempt.startedAt,
        completedAt: result.attempt.completedAt,
        activeSeconds: result.attempt.activeSeconds,
        checkCount: result.attempt.checkCount
      },
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
