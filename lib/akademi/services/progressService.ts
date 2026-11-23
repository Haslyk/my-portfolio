import { Prisma, PrismaClient } from '@prisma/client';
import { WeekStatus } from '@/lib/akademi/shared';

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function ensureStudentWeekProgresses(
  tx: DbClient,
  studentId: string,
  courseCode?: string
) {
  const [weeks, existing] = await Promise.all([
    tx.week.findMany({
      where: courseCode ? { courseCode } : undefined,
      orderBy: { order: 'asc' },
      select: { id: true, order: true }
    }),
    tx.weekProgress.findMany({
      where: { studentId },
      select: { weekId: true }
    })
  ]);

  const existingIds = new Set(existing.map((wp) => wp.weekId));
  const missing = weeks
    .filter((w) => !existingIds.has(w.id))
    .map((w) => ({
      studentId,
      weekId: w.id,
      status: w.order === 1 ? 'NOT_STARTED' : 'LOCKED'
    }));

  if (missing.length > 0) {
    await tx.weekProgress.createMany({
      data: missing,
      skipDuplicates: true
    });
  }
}

export async function checkWeekUnlocked(
  tx: DbClient,
  studentId: string,
  weekId: string
): Promise<{
  unlocked: boolean;
  status: WeekStatus;
  weekOrder: number;
  adminLocked?: boolean;
}> {
  // Fast-path: check existing weekProgress + week in a single query
  const wp = await tx.weekProgress.findUnique({
    where: {
      studentId_weekId: {
        studentId,
        weekId
      }
    },
    include: {
      week: { select: { order: true, courseCode: true, isAdminUnlocked: true } }
    }
  });

  if (wp) {
    // Rule: Weeks 2..5 require BOTH admin unlock AND previous week completion
    if (wp.week.order > 1 && !wp.week.isAdminUnlocked) {
      return {
        unlocked: false,
        status: 'LOCKED',
        weekOrder: wp.week.order,
        adminLocked: true
      };
    }

    if (wp.week.order === 1 && wp.status === 'LOCKED') {
      await tx.weekProgress.update({
        where: { id: wp.id },
        data: { status: 'NOT_STARTED' }
      });
      return { unlocked: true, status: 'NOT_STARTED', weekOrder: 1 };
    }

    // If admin unlocked this week, verify if previous week is completed and unlock if still LOCKED
    if (wp.week.order > 1 && wp.week.isAdminUnlocked && wp.status === 'LOCKED') {
      const prevWeek = await tx.week.findUnique({
        where: {
          courseCode_order: {
            courseCode: wp.week.courseCode,
            order: wp.week.order - 1
          }
        },
        select: { id: true }
      });
      if (prevWeek) {
        const prevWp = await tx.weekProgress.findUnique({
          where: {
            studentId_weekId: {
              studentId,
              weekId: prevWeek.id
            }
          },
          select: { status: true }
        });
        if (prevWp?.status === 'COMPLETED') {
          await tx.weekProgress.update({
            where: { id: wp.id },
            data: { status: 'NOT_STARTED' }
          });
          return {
            unlocked: true,
            status: 'NOT_STARTED',
            weekOrder: wp.week.order
          };
        }
      }
    }

    return {
      unlocked: wp.status !== 'LOCKED',
      status: wp.status as WeekStatus,
      weekOrder: wp.week.order
    };
  }

  const week = await tx.week.findUnique({ where: { id: weekId } });
  if (!week) {
    throw new Error('WEEK_NOT_FOUND');
  }

  await ensureStudentWeekProgresses(tx, studentId, week.courseCode);

  if (week.order > 1 && !week.isAdminUnlocked) {
    return {
      unlocked: false,
      status: 'LOCKED',
      weekOrder: week.order,
      adminLocked: true
    };
  }

  return {
    unlocked: week.order === 1,
    status: week.order === 1 ? 'NOT_STARTED' : 'LOCKED',
    weekOrder: week.order
  };
}

export async function recalculateAndSyncWeekProgress(
  tx: DbClient,
  studentId: string,
  weekId: string
): Promise<{
  weekStatus: WeekStatus;
  nextWeekUnlocked: boolean;
  completedMandatoryCount: number;
  totalMandatoryCount: number;
}> {
  const week = await tx.week.findUnique({
    where: { id: weekId },
    include: {
      activities: true
    }
  });

  if (!week) {
    throw new Error('WEEK_NOT_FOUND');
  }

  await ensureStudentWeekProgresses(tx, studentId, week.courseCode);

  const currentWp = await tx.weekProgress.findUnique({
    where: {
      studentId_weekId: {
        studentId,
        weekId
      }
    }
  });

  const requiredActivities = week.activities.filter((a) => a.required);
  const attempts = await tx.activityAttempt.findMany({
    where: {
      studentId,
      activityId: { in: week.activities.map((a) => a.id) }
    }
  });

  const completedRequiredIds = new Set<string>();
  for (const att of attempts) {
    if (
      att.status === 'COMPLETED' &&
      (att.isFirstSuccess || att.mode === 'NORMAL' || att.mode === 'normal')
    ) {
      if (requiredActivities.some((ra) => ra.id === att.activityId)) {
        completedRequiredIds.add(att.activityId);
      }
    }
  }

  const completedMandatoryCount = completedRequiredIds.size;
  const totalMandatoryCount = requiredActivities.length || 3;
  const allRequiredDone =
    requiredActivities.length > 0 &&
    requiredActivities.every((reqAct) => completedRequiredIds.has(reqAct.id));

  let newStatus: WeekStatus =
    (currentWp?.status as WeekStatus) || 'NOT_STARTED';
  let completedAt = currentWp?.completedAt || null;

  if (currentWp?.status === 'COMPLETED' || allRequiredDone) {
    newStatus = 'COMPLETED';
    if (!completedAt) {
      completedAt = new Date();
    }
  } else if (attempts.length > 0) {
    newStatus = 'IN_PROGRESS';
  } else if (week.order === 1 || currentWp?.status !== 'LOCKED') {
    newStatus = 'NOT_STARTED';
  }

  await tx.weekProgress.update({
    where: {
      studentId_weekId: {
        studentId,
        weekId
      }
    },
    data: {
      status: newStatus,
      completedAt
    }
  });

  let nextWeekUnlocked = false;
  if (newStatus === 'COMPLETED') {
    const nextWeek = await tx.week.findUnique({
      where: {
        courseCode_order: {
          courseCode: week.courseCode,
          order: week.order + 1
        }
      }
    });
    // Next week only unlocks if admin has ALSO unlocked that week
    if (nextWeek && nextWeek.isAdminUnlocked) {
      const nextWp = await tx.weekProgress.findUnique({
        where: {
          studentId_weekId: {
            studentId,
            weekId: nextWeek.id
          }
        }
      });
      if (nextWp && nextWp.status === 'LOCKED') {
        await tx.weekProgress.update({
          where: { id: nextWp.id },
          data: { status: 'NOT_STARTED' }
        });
        nextWeekUnlocked = true;
      } else if (nextWp && nextWp.status !== 'LOCKED') {
        nextWeekUnlocked = true;
      }
    }
  }

  return {
    weekStatus: newStatus,
    nextWeekUnlocked,
    completedMandatoryCount,
    totalMandatoryCount
  };
}
