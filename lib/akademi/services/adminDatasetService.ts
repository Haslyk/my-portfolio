import { getPrismaAsync } from './db';
import { AKADEMI_COURSES_CATALOG } from '@/lib/akademi/shared';
import { seedCurriculum } from './seedService';

export interface ComputedStudentRow {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  studentNumber: string;
  allowedCourses: string[] | null;
  effectiveCourses: string[];
  createdAt: string;
  lastSeenAt: string;
  isRecentlySeen: boolean;
  lastCompletedWeekOrder: number | null;
  lastCompletedWeekTitle: string | null;
  firstIncompleteWeekOrder: number | null;
  firstIncompleteWeekTitle: string | null;
  lastWorkedActivityCode: string | null;
  lastWorkedActivityTitle: string | null;
  lastWorkedAt: string | null;
  selectedWeekOrder: number;
  selectedWeekStatus: string;
  selectedWeekProgressText: string;
  selectedWeekRequiredCompleted: number;
  selectedWeekRequiredTotal: number;
  selectedWeekActiveSeconds: number;
  totalCourseRequiredActiveSeconds: number;
  totalHomeworkActiveSeconds: number;
  totalPracticeActiveSeconds: number;
  selectedWeekHomeworkStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  selectedActivityStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | null;
  selectedActivityCompletedAt: string | null;
  selectedActivityActiveSeconds: number | null;
  selectedActivityElapsedSeconds: number | null;
  selectedActivityEarlyFinisher: boolean;
}

let curriculumEnsured = false;

export async function computeAdminDataset(
  selectedWeekOrder: number,
  selectedActivityCode?: string,
  courseCode: string = 'ag-temelleri'
) {
  const prisma = await getPrismaAsync();
  if (!curriculumEnsured) {
    await seedCurriculum(prisma);
    curriculumEnsured = true;
  }

  const weeks = await prisma.week.findMany({
    where: { courseCode },
    orderBy: { order: 'asc' },
    include: {
      activities: { orderBy: { orderInWeek: 'asc' } }
    }
  });

  const dbCourseSettings = await prisma.courseSetting.findMany();
  const courseSettings = AKADEMI_COURSES_CATALOG.map((cat) => {
    const dbMatch = dbCourseSettings.find((c) => c.code === cat.code);
    return {
      code: cat.code,
      title: cat.title,
      shortTitle: cat.shortTitle,
      defaultVisible: dbMatch ? dbMatch.defaultVisible : cat.defaultVisible,
      isReady: dbMatch ? dbMatch.isReady : cat.isReady
    };
  });

  const defaultVisibleCodes = courseSettings
    .filter((c) => c.defaultVisible)
    .map((c) => c.code);

  const students = await prisma.student.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: {
      weekProgresses: true,
      attempts: {
        include: { activity: { include: { week: true } } },
        orderBy: { startedAt: 'asc' }
      }
    }
  });

  const targetWeek =
    weeks.find((w) => w.order === selectedWeekOrder) || weeks[0];
  const targetActivity = selectedActivityCode
    ? weeks
        .flatMap((w) => w.activities)
        .find(
          (a) =>
            a.code === selectedActivityCode || a.id === selectedActivityCode
        )
    : undefined;

  const nowMs = Date.now();

  const rows: ComputedStudentRow[] = students.map((student) => {
    const isRecentlySeen = nowMs - student.lastSeenAt.getTime() <= 60 * 1000;

    const rawAllowed = (student as any).allowedCourses;
    const allowedCourses: string[] | null = Array.isArray(rawAllowed)
      ? rawAllowed.map(String)
      : null;
    const effectiveCourses: string[] =
      allowedCourses !== null ? allowedCourses : defaultVisibleCodes;

    const courseAttempts = student.attempts.filter(
      (att) =>
        (att.activity.courseCode || 'ag-temelleri') === courseCode ||
        weeks.some((w) => w.id === att.activity.weekId)
    );

    let lastCompletedWeekOrder: number | null = null;
    let lastCompletedWeekTitle: string | null = null;
    let firstIncompleteWeekOrder: number | null = null;
    let firstIncompleteWeekTitle: string | null = null;

    for (const w of weeks) {
      const wp = student.weekProgresses.find((p) => p.weekId === w.id);
      const reqActs = w.activities.filter((a) => a.required);
      const allReqDone =
        reqActs.length > 0 &&
        reqActs.every((ra) =>
          courseAttempts.some(
            (att) =>
              att.activityId === ra.id &&
              att.status === 'COMPLETED' &&
              (att.isFirstSuccess || att.mode === 'NORMAL')
          )
        );

      const isWeekCompleted = wp?.status === 'COMPLETED' || allReqDone;

      if (isWeekCompleted) {
        lastCompletedWeekOrder = w.order;
        lastCompletedWeekTitle = w.title;
      } else if (firstIncompleteWeekOrder === null) {
        firstIncompleteWeekOrder = w.order;
        firstIncompleteWeekTitle = w.title;
      }
    }

    let latestAttempt = courseAttempts[0] || null;
    for (const att of courseAttempts) {
      if (
        !latestAttempt ||
        att.lastHeartbeatAt.getTime() > latestAttempt.lastHeartbeatAt.getTime()
      ) {
        latestAttempt = att;
      }
    }

    let totalCourseRequiredActiveSeconds = 0;
    let totalHomeworkActiveSeconds = 0;
    let totalPracticeActiveSeconds = 0;

    for (const att of courseAttempts) {
      if (att.mode === 'PRACTICE') {
        totalPracticeActiveSeconds += att.activeSeconds;
      } else if (att.activity.required) {
        totalCourseRequiredActiveSeconds += att.activeSeconds;
      } else {
        totalHomeworkActiveSeconds += att.activeSeconds;
      }
    }

    let selectedWeekRequiredCompleted = 0;
    let selectedWeekRequiredTotal = 0;
    let selectedWeekActiveSeconds = 0;
    let selectedWeekHomeworkStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' =
      'NOT_STARTED';
    let selectedWeekStatus = 'LOCKED';

    if (targetWeek) {
      const wp = student.weekProgresses.find((p) => p.weekId === targetWeek.id);
      selectedWeekStatus =
        wp?.status || (targetWeek.order === 1 ? 'NOT_STARTED' : 'LOCKED');

      const reqActs = targetWeek.activities.filter((a) => a.required);
      selectedWeekRequiredTotal = reqActs.length;

      for (const ra of reqActs) {
        const normalAtt = student.attempts.find(
          (a) => a.activityId === ra.id && a.mode === 'NORMAL'
        );
        if (normalAtt) {
          selectedWeekActiveSeconds += normalAtt.activeSeconds;
          if (normalAtt.status === 'COMPLETED') {
            selectedWeekRequiredCompleted++;
          }
        }
      }

      if (
        selectedWeekRequiredTotal > 0 &&
        selectedWeekRequiredCompleted === selectedWeekRequiredTotal
      ) {
        selectedWeekStatus = 'COMPLETED';
      } else if (
        selectedWeekStatus === 'NOT_STARTED' &&
        student.attempts.some((a) => a.activity.weekId === targetWeek.id)
      ) {
        selectedWeekStatus = 'IN_PROGRESS';
      }

      const hwAct = targetWeek.activities.find((a) => !a.required);
      if (hwAct) {
        const hwAtt = student.attempts.find(
          (a) => a.activityId === hwAct.id && a.mode === 'NORMAL'
        );
        if (hwAtt?.status === 'COMPLETED') {
          selectedWeekHomeworkStatus = 'COMPLETED';
        } else if (hwAtt) {
          selectedWeekHomeworkStatus = 'IN_PROGRESS';
        }
      }
    }

    let selectedActivityStatus:
      | 'NOT_STARTED'
      | 'IN_PROGRESS'
      | 'COMPLETED'
      | null = null;
    let selectedActivityCompletedAt: string | null = null;
    let selectedActivityActiveSeconds: number | null = null;
    let selectedActivityElapsedSeconds: number | null = null;
    let selectedActivityEarlyFinisher = false;

    if (targetActivity) {
      const normalAtt = student.attempts.find(
        (a) => a.activityId === targetActivity.id && a.mode === 'NORMAL'
      );
      if (!normalAtt) {
        selectedActivityStatus = 'NOT_STARTED';
      } else if (normalAtt.status === 'COMPLETED') {
        selectedActivityStatus = 'COMPLETED';
        selectedActivityCompletedAt = normalAtt.completedAt
          ? normalAtt.completedAt.toISOString()
          : null;
        selectedActivityActiveSeconds = normalAtt.activeSeconds;
        selectedActivityElapsedSeconds =
          normalAtt.completedAt && normalAtt.startedAt
            ? Math.max(
                1,
                Math.floor(
                  (normalAtt.completedAt.getTime() -
                    normalAtt.startedAt.getTime()) /
                    1000
                )
              )
            : null;
        selectedActivityEarlyFinisher =
          normalAtt.activeSeconds < targetActivity.allocatedSeconds;
      } else {
        selectedActivityStatus = 'IN_PROGRESS';
        selectedActivityActiveSeconds = normalAtt.activeSeconds;
      }
    }

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`,
      studentNumber: student.studentNumber,
      allowedCourses,
      effectiveCourses,
      createdAt: student.createdAt.toISOString(),
      lastSeenAt: student.lastSeenAt.toISOString(),
      isRecentlySeen,
      lastCompletedWeekOrder,
      lastCompletedWeekTitle,
      firstIncompleteWeekOrder,
      firstIncompleteWeekTitle,
      lastWorkedActivityCode: latestAttempt?.activity.code || null,
      lastWorkedActivityTitle: latestAttempt?.activity.title || null,
      lastWorkedAt: latestAttempt
        ? latestAttempt.lastHeartbeatAt.toISOString()
        : null,
      selectedWeekOrder: targetWeek?.order || 1,
      selectedWeekStatus,
      selectedWeekProgressText: `${selectedWeekRequiredCompleted}/${selectedWeekRequiredTotal}`,
      selectedWeekRequiredCompleted,
      selectedWeekRequiredTotal,
      selectedWeekActiveSeconds,
      totalCourseRequiredActiveSeconds,
      totalHomeworkActiveSeconds,
      totalPracticeActiveSeconds,
      selectedWeekHomeworkStatus,
      selectedActivityStatus,
      selectedActivityCompletedAt,
      selectedActivityActiveSeconds,
      selectedActivityElapsedSeconds,
      selectedActivityEarlyFinisher
    };
  });

  return { weeks, targetWeek, targetActivity, rows, courseSettings };
}
