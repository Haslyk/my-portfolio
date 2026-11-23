import { NextRequest, NextResponse } from 'next/server';
import { CURRICULUM_WEEKS } from '@/lib/akademi/shared';
import { PUBLIC_CURRICULUM_WEEKS } from '@/lib/akademi/pc-donanimi';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import {
  checkWeekUnlocked,
  recalculateAndSyncWeekProgress
} from '@/lib/akademi/services/progressService';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ weekId: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const url = new URL(req.url);
    const courseCode = url.searchParams.get('course') || 'ag-temelleri';
    const { weekId: param } = await context.params;
    const prisma = await getPrismaAsync();
    const studentId = auth.student.id;

    const isOrderNum = /^[1-5]$/.test(param);
    const dbWeek = isOrderNum
      ? await prisma.week.findUnique({
          where: {
            courseCode_order: {
              courseCode,
              order: parseInt(param, 10)
            }
          },
          include: {
            activities: { orderBy: { orderInWeek: 'asc' } }
          }
        })
      : await prisma.week.findUnique({
          where: { id: param },
          include: {
            activities: { orderBy: { orderInWeek: 'asc' } }
          }
        });

    if (!dbWeek) {
      return NextResponse.json(
        {
          error: 'WEEK_NOT_FOUND',
          message: 'İstenen hafta bulunamadı.'
        },
        { status: 404 }
      );
    }

    const lockCheck = await checkWeekUnlocked(prisma, studentId, dbWeek.id);
    if (!lockCheck.unlocked) {
      return NextResponse.json(
        {
          error: 'WEEK_LOCKED',
          message: lockCheck.adminLocked
            ? `${dbWeek.order}. Hafta henüz ders öğretmeni tarafından açılmadı.`
            : `${dbWeek.order}. Hafta henüz kilitli. Önce bir önceki haftanın iki zorunlu etkinliğini ve değerlendirmesini tamamlamalısın.`
        },
        { status: 403 }
      );
    }

    const { weekStatus } = await recalculateAndSyncWeekProgress(
      prisma,
      studentId,
      dbWeek.id
    );

    const currWeek =
      dbWeek.courseCode === 'pc-donanimi'
        ? undefined
        : CURRICULUM_WEEKS.find((cw) => cw.order === dbWeek.order);
    const donanimWeek =
      dbWeek.courseCode === 'pc-donanimi'
        ? PUBLIC_CURRICULUM_WEEKS.find((pw) => pw.order === dbWeek.order)
        : undefined;

    const attempts = await prisma.activityAttempt.findMany({
      where: {
        studentId,
        activityId: { in: dbWeek.activities.map((a) => a.id) }
      },
      orderBy: { startedAt: 'asc' }
    });

    const activities = dbWeek.activities.map((dbAct) => {
      const currAct = currWeek?.activities.find((ca) => ca.code === dbAct.code);
      const donanimAct = donanimWeek?.activities.find(
        (da) => da.code === dbAct.code
      );
      const actAttempts = attempts.filter((a) => a.activityId === dbAct.id);
      const firstSuccess = actAttempts.find(
        (a) =>
          a.status === 'COMPLETED' &&
          (a.isFirstSuccess || a.mode === 'NORMAL')
      );
      const normalAttempt = actAttempts.find((a) => a.mode === 'NORMAL');
      const activePractice = [...actAttempts]
        .reverse()
        .find((a) => a.mode === 'PRACTICE' && a.status === 'IN_PROGRESS');

      let actStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';
      if (firstSuccess) {
        actStatus = 'COMPLETED';
      } else if (normalAttempt) {
        actStatus = 'IN_PROGRESS';
      }

      const currentAttempt = activePractice || normalAttempt || null;

      return {
        id: dbAct.id,
        code: dbAct.code,
        orderInWeek: dbAct.orderInWeek,
        title: dbAct.title,
        shortPurpose: currAct?.shortPurpose || donanimAct?.purpose || '',
        category: dbAct.type,
        widgetType: dbAct.widgetType,
        required: dbAct.required,
        expectedSeconds: dbAct.expectedSeconds,
        allocatedSeconds: dbAct.allocatedSeconds,
        contentVersion: dbAct.contentVersion,
        status: actStatus,
        firstCompletion: firstSuccess
          ? {
              attemptId: firstSuccess.id,
              startedAt: firstSuccess.startedAt,
              completedAt: firstSuccess.completedAt,
              activeSeconds: firstSuccess.activeSeconds,
              elapsedSeconds:
                firstSuccess.completedAt && firstSuccess.startedAt
                  ? Math.max(
                      1,
                      Math.floor(
                        (firstSuccess.completedAt.getTime() -
                          firstSuccess.startedAt.getTime()) /
                          1000
                      )
                    )
                  : null,
              checkCount: firstSuccess.checkCount
            }
          : null,
        currentAttempt: currentAttempt
          ? {
              id: currentAttempt.id,
              mode: currentAttempt.mode,
              status: currentAttempt.status,
              state: currentAttempt.state,
              revision: currentAttempt.revision,
              startedAt: currentAttempt.startedAt,
              completedAt: currentAttempt.completedAt,
              activeSeconds: currentAttempt.activeSeconds,
              checkCount: currentAttempt.checkCount
            }
          : null,
        config: currAct?.config,
        publicDefinition: donanimAct
      };
    });

    return NextResponse.json({
      week: {
        id: dbWeek.id,
        order: dbWeek.order,
        title: dbWeek.title,
        shortDescription: currWeek?.shortDescription || '',
        learningObjectives:
          currWeek?.learningObjectives ||
          donanimWeek?.learningObjectives ||
          ['', ''],
        status: weekStatus,
        animation: currWeek?.animation || donanimWeek?.animation || null,
        activities
      }
    });
  } catch (err) {
    console.error('Get week detail error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Hafta detayı yüklenirken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
