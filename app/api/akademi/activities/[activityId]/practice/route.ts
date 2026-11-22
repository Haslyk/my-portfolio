import { NextRequest, NextResponse } from 'next/server';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import { checkWeekUnlocked } from '@/lib/akademi/services/progressService';
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
    const body = await req.json().catch(() => ({}));
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
          message: 'Bu haftanın kilidi henüz açılmadı.'
        },
        { status: 403 }
      );
    }

    const firstSuccess = await prisma.activityAttempt.findFirst({
      where: {
        studentId,
        activityId: activity.id,
        status: 'COMPLETED',
        mode: 'NORMAL'
      }
    });

    if (!firstSuccess) {
      return NextResponse.json(
        {
          error: 'FIRST_COMPLETION_REQUIRED',
          message:
            'Tekrar çalış modunu açmak için önce etkinliği normal modda tamamlamalısın.'
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: studentId },
        data: { lastSeenAt: new Date() }
      });

      const forceNew = Boolean(body?.forceNew || body?.reset);
      let practiceAttempt = !forceNew
        ? await tx.activityAttempt.findFirst({
            where: {
              studentId,
              activityId: activity.id,
              mode: 'PRACTICE',
              status: 'IN_PROGRESS'
            },
            orderBy: { startedAt: 'desc' }
          })
        : null;

      if (!practiceAttempt) {
        practiceAttempt = await tx.activityAttempt.create({
          data: {
            studentId,
            activityId: activity.id,
            mode: 'PRACTICE',
            isFirstSuccess: false,
            contentVersion: activity.contentVersion,
            state: {},
            revision: 1,
            status: 'IN_PROGRESS',
            startedAt: new Date(),
            lastHeartbeatAt: new Date()
          }
        });
      } else {
        practiceAttempt = await tx.activityAttempt.update({
          where: { id: practiceAttempt.id },
          data: { lastHeartbeatAt: new Date() }
        });
      }

      const leaseToken = await issueOrTakeoverLease(
        tx,
        studentId,
        practiceAttempt.id
      );

      return { practiceAttempt, leaseToken };
    });

    const donanimPublicDef =
      activity.courseCode === 'pc-donanimi'
        ? getPublicActivityByCode(activity.code)
        : undefined;

    const firstElapsedSeconds =
      firstSuccess.completedAt && firstSuccess.startedAt
        ? Math.max(
            1,
            Math.floor(
              (firstSuccess.completedAt.getTime() -
                firstSuccess.startedAt.getTime()) /
                1000
            )
          )
        : null;

    return NextResponse.json({
      attempt: {
        id: result.practiceAttempt.id,
        activityId: result.practiceAttempt.activityId,
        activityCode: activity.code,
        weekOrder: activity.week.order,
        weekId: activity.weekId,
        mode: result.practiceAttempt.mode,
        status: result.practiceAttempt.status,
        isFirstSuccess: false,
        state: result.practiceAttempt.state,
        revision: result.practiceAttempt.revision,
        startedAt: result.practiceAttempt.startedAt,
        completedAt: result.practiceAttempt.completedAt,
        activeSeconds: result.practiceAttempt.activeSeconds,
        checkCount: result.practiceAttempt.checkCount,
        firstSuccessSummary: {
          completedAt: firstSuccess.completedAt,
          elapsedSeconds: firstElapsedSeconds,
          activeSeconds: firstSuccess.activeSeconds
        },
        hasOpenHelp: false
      },
      activity: donanimPublicDef,
      leaseToken: result.leaseToken
    });
  } catch (err) {
    console.error('Practice activity error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Tekrar çalış modu başlatılırken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
