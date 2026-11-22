import { NextRequest, NextResponse } from 'next/server';
import { CURRICULUM_WEEKS } from '@/lib/akademi/shared';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import { ensureStudentWeekProgresses } from '@/lib/akademi/services/progressService';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const prisma = await getPrismaAsync();
    const studentId = auth.student.id;

    await ensureStudentWeekProgresses(prisma, studentId);

    const dbWeeks = await prisma.week.findMany({
      orderBy: { order: 'asc' },
      include: {
        activities: {
          orderBy: { orderInWeek: 'asc' }
        },
        weekProgresses: {
          where: { studentId }
        }
      }
    });

    const attempts = await prisma.activityAttempt.findMany({
      where: { studentId },
      orderBy: { startedAt: 'asc' }
    });

    const result = dbWeeks.map((dbWeek) => {
      const currWeek = CURRICULUM_WEEKS.find((cw) => cw.order === dbWeek.order);
      const wp = dbWeek.weekProgresses[0];
      const status = wp
        ? wp.status
        : dbWeek.order === 1
        ? 'NOT_STARTED'
        : 'LOCKED';

      const activitiesSummary = dbWeek.activities.map((dbAct) => {
        const currAct = currWeek?.activities.find(
          (ca) => ca.code === dbAct.code
        );
        const actAttempts = attempts.filter((a) => a.activityId === dbAct.id);
        const firstSuccess = actAttempts.find(
          (a) =>
            a.status === 'COMPLETED' &&
            (a.isFirstSuccess || a.mode === 'NORMAL')
        );
        const normalAttempt = actAttempts.find((a) => a.mode === 'NORMAL');
        const latestPractice = [...actAttempts]
          .reverse()
          .find((a) => a.mode === 'PRACTICE');

        let actStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' =
          'NOT_STARTED';
        if (firstSuccess) {
          actStatus = 'COMPLETED';
        } else if (normalAttempt) {
          actStatus = 'IN_PROGRESS';
        }

        return {
          id: dbAct.id,
          code: dbAct.code,
          orderInWeek: dbAct.orderInWeek,
          title: dbAct.title,
          shortPurpose: currAct?.shortPurpose || '',
          category: dbAct.type,
          widgetType: dbAct.widgetType,
          required: dbAct.required,
          expectedSeconds: dbAct.expectedSeconds,
          allocatedSeconds: dbAct.allocatedSeconds,
          status: actStatus,
          startedAt: firstSuccess?.startedAt ?? normalAttempt?.startedAt ?? null,
          completedAt: firstSuccess?.completedAt ?? null,
          activeSeconds:
            firstSuccess?.activeSeconds ?? normalAttempt?.activeSeconds ?? 0,
          elapsedSeconds:
            firstSuccess?.completedAt && firstSuccess?.startedAt
              ? Math.max(
                  1,
                  Math.floor(
                    (firstSuccess.completedAt.getTime() -
                      firstSuccess.startedAt.getTime()) /
                      1000
                  )
                )
              : null,
          checkCount: firstSuccess?.checkCount ?? normalAttempt?.checkCount ?? 0,
          practiceCount: actAttempts.filter((a) => a.mode === 'PRACTICE')
            .length,
          hasActivePractice: latestPractice?.status === 'IN_PROGRESS'
        };
      });

      const requiredTotal = activitiesSummary.filter((a) => a.required).length;
      const requiredCompleted = activitiesSummary.filter(
        (a) => a.required && a.status === 'COMPLETED'
      ).length;
      const weekActiveSeconds = activitiesSummary
        .filter((a) => a.required)
        .reduce((acc, item) => acc + item.activeSeconds, 0);

      const homeworkItem = activitiesSummary.find((a) => !a.required);

      return {
        id: dbWeek.id,
        order: dbWeek.order,
        title: dbWeek.title,
        shortDescription: currWeek?.shortDescription || '',
        learningObjectives: currWeek?.learningObjectives || ['', ''],
        hasAnimation: Boolean(currWeek?.animation),
        status,
        completedAt: wp?.completedAt ?? null,
        progress: {
          requiredCompleted,
          requiredTotal,
          weekActiveSeconds,
          homeworkStatus: homeworkItem?.status || 'NOT_STARTED'
        },
        activities: status === 'LOCKED' ? [] : activitiesSummary
      };
    });

    return NextResponse.json({ weeks: result });
  } catch (err) {
    console.error('Get weeks error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Haftalar yüklenirken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
