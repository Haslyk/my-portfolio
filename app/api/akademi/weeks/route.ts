import { NextRequest, NextResponse } from 'next/server';
import { CURRICULUM_WEEKS } from '@/lib/akademi/shared';
import { PUBLIC_CURRICULUM_WEEKS } from '@/lib/akademi/pc-donanimi';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import {
  ensureStudentWeekProgresses,
  getStudentGroupKey,
  isWeekUnlockedForGroup
} from '@/lib/akademi/services/progressService';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const url = new URL(req.url);
    const courseCode = url.searchParams.get('course') || 'ag-temelleri';

    const prisma = await getPrismaAsync();
    const studentId = auth.student.id;

    await ensureStudentWeekProgresses(prisma, studentId, courseCode);

    const [studentInfo, dbWeeks, attempts] = await Promise.all([
      prisma.student.findUnique({
        where: { id: studentId },
        select: { classLevel: true, section: true }
      }),
      prisma.week.findMany({
        where: { courseCode },
        orderBy: { order: 'asc' },
        include: {
          activities: {
            orderBy: { orderInWeek: 'asc' }
          },
          weekProgresses: {
            where: { studentId }
          }
        }
      }),
      prisma.activityAttempt.findMany({
        where: { studentId },
        orderBy: { startedAt: 'asc' }
      })
    ]);

    const groupKey = getStudentGroupKey(
      studentInfo?.classLevel,
      studentInfo?.section
    );

    if (courseCode === 'pc-donanimi') {
      const result = dbWeeks.map((dbWeek) => {
        const publicWeek = PUBLIC_CURRICULUM_WEEKS.find(
          (pw) => pw.order === dbWeek.order
        );
        const wp = dbWeek.weekProgresses[0];
        const prevWeek =
          dbWeek.order > 1
            ? dbWeeks.find((w) => w.order === dbWeek.order - 1)
            : null;
        const prevCompleted = prevWeek?.weekProgresses[0]?.status === 'COMPLETED';
        const isAdminLocked =
          dbWeek.order > 1 && !isWeekUnlockedForGroup(dbWeek, groupKey);

        let status = wp
          ? wp.status
          : dbWeek.order === 1
          ? 'NOT_STARTED'
          : 'LOCKED';

        if (isAdminLocked) {
          status = 'LOCKED';
        } else if (dbWeek.order > 1 && status === 'LOCKED' && prevCompleted) {
          status = 'NOT_STARTED';
        }
        const unlocked = status !== 'LOCKED';

        const weekActivities = dbWeek.activities.map((dbAct) => {
          const actAttempts = attempts.filter((a) => a.activityId === dbAct.id);
          const firstSuccess = actAttempts.find(
            (a) =>
              a.status === 'COMPLETED' &&
              (a.isFirstSuccess || a.mode === 'NORMAL')
          );
          const activeNormal = actAttempts.find(
            (a) => a.mode === 'NORMAL' && a.status === 'IN_PROGRESS'
          );
          const activePractice = [...actAttempts]
            .reverse()
            .find((a) => a.mode === 'PRACTICE' && a.status === 'IN_PROGRESS');

          let actStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' =
            'NOT_STARTED';
          if (firstSuccess) {
            actStatus = 'COMPLETED';
          } else if (activeNormal) {
            actStatus = 'IN_PROGRESS';
          }

          const mappedType =
            dbAct.type === 'REQUIRED_ACTIVITY'
              ? 'application'
              : dbAct.type === 'QUIZ'
              ? 'quiz'
              : 'homework';

          const elapsed =
            firstSuccess?.completedAt && firstSuccess?.startedAt
              ? Math.max(
                  1,
                  Math.floor(
                    (firstSuccess.completedAt.getTime() -
                      firstSuccess.startedAt.getTime()) /
                      1000
                  )
                )
              : null;

          return {
            id: dbAct.id,
            code: dbAct.code,
            displayCode: dbAct.code.replace(/^D-/, ''),
            title: dbAct.title,
            type: mappedType,
            required: dbAct.required,
            expectedSeconds: dbAct.expectedSeconds,
            allocatedSeconds: dbAct.allocatedSeconds,
            status: actStatus,
            firstCompletedAt: firstSuccess?.completedAt ?? null,
            firstElapsedSeconds: elapsed,
            firstActiveSeconds:
              firstSuccess?.activeSeconds ?? activeNormal?.activeSeconds ?? 0,
            activeAttemptId:
              activePractice?.id ??
              activeNormal?.id ??
              firstSuccess?.id ??
              null,
            practiceCount: actAttempts.filter((a) => a.mode === 'PRACTICE')
              .length
          };
        });

        const requiredTotal = weekActivities.filter((a) => a.required).length;
        const requiredCompleted = weekActivities.filter(
          (a) => a.required && a.status === 'COMPLETED'
        ).length;
        const appsCompleted = weekActivities
          .filter((a) => a.type === 'application' && a.required)
          .every((a) => a.status === 'COMPLETED');

        return {
          id: dbWeek.id,
          order: dbWeek.order,
          title: dbWeek.title,
          shortTitle: publicWeek?.shortTitle || `Hafta ${dbWeek.order}`,
          status,
          unlocked,
          hasOverride: false,
          completedMandatoryCount: requiredCompleted,
          totalMandatoryCount: requiredTotal || 3,
          appsCompleted,
          learningObjectives: publicWeek?.learningObjectives ?? ['', ''],
          animation: publicWeek?.animation ?? null,
          activities: weekActivities
        };
      });

      return NextResponse.json({ weeks: result });
    }

    // Default: Ağ Temelleri ('ag-temelleri')
    const result = dbWeeks.map((dbWeek) => {
      const currWeek = CURRICULUM_WEEKS.find((cw) => cw.order === dbWeek.order);
      const wp = dbWeek.weekProgresses[0];
      const prevWeek =
        dbWeek.order > 1
          ? dbWeeks.find((w) => w.order === dbWeek.order - 1)
          : null;
      const prevCompleted = prevWeek?.weekProgresses[0]?.status === 'COMPLETED';
      const isAdminLocked =
        dbWeek.order > 1 && !isWeekUnlockedForGroup(dbWeek, groupKey);

      let status = wp
        ? wp.status
        : dbWeek.order === 1
        ? 'NOT_STARTED'
        : 'LOCKED';

      if (isAdminLocked) {
        status = 'LOCKED';
      } else if (dbWeek.order > 1 && status === 'LOCKED' && prevCompleted) {
        status = 'NOT_STARTED';
      }

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
