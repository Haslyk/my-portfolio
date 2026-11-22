import { Prisma, PrismaClient } from '@prisma/client';
import { WeekStatus } from '@/lib/akademi/shared';

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Bir öğrencinin tüm haftalarının (1..5) WeekProgress kayıtlarını kontrol eder,
 * eksikse oluşturur (1. hafta NOT_STARTED, diğerleri LOCKED).
 */
export async function ensureStudentWeekProgresses(
  tx: DbClient,
  studentId: string
) {
  const weeks = await tx.week.findMany({ orderBy: { order: 'asc' } });
  const existing = await tx.weekProgress.findMany({
    where: { studentId }
  });
  const map = new Map(existing.map((wp) => [wp.weekId, wp]));

  for (const w of weeks) {
    if (!map.has(w.id)) {
      const created = await tx.weekProgress.create({
        data: {
          studentId,
          weekId: w.id,
          status: w.order === 1 ? 'NOT_STARTED' : 'LOCKED'
        }
      });
      map.set(w.id, created);
    }
  }
}

/**
 * Bir öğrencinin ilgili haftaya erişim izni olup olmadığını kontrol eder.
 * Hafta 1 her zaman açıktır. Hafta N (N>1) yalnızca Hafta N-1 COMPLETED ise açıktır.
 */
export async function checkWeekUnlocked(
  tx: DbClient,
  studentId: string,
  weekId: string
): Promise<{ unlocked: boolean; status: WeekStatus; weekOrder: number }> {
  await ensureStudentWeekProgresses(tx, studentId);

  const week = await tx.week.findUnique({ where: { id: weekId } });
  if (!week) {
    throw new Error('WEEK_NOT_FOUND');
  }

  const wp = await tx.weekProgress.findUnique({
    where: {
      studentId_weekId: {
        studentId,
        weekId
      }
    }
  });

  if (!wp) {
    return {
      unlocked: week.order === 1,
      status: week.order === 1 ? 'NOT_STARTED' : 'LOCKED',
      weekOrder: week.order
    };
  }

  // Extra safety: if week.order === 1 and status is somehow LOCKED, unlock it
  if (week.order === 1 && wp.status === 'LOCKED') {
    await tx.weekProgress.update({
      where: { id: wp.id },
      data: { status: 'NOT_STARTED' }
    });
    return { unlocked: true, status: 'NOT_STARTED', weekOrder: 1 };
  }

  return {
    unlocked: wp.status !== 'LOCKED',
    status: wp.status as WeekStatus,
    weekOrder: week.order
  };
}

/**
 * Bir haftadaki zorunlu etkinliklerin (2 zorunlu etkinlik + 1 değerlendirme = required:true)
 * ilk başarı (isFirstSuccess=true veya mode='NORMAL' & status='COMPLETED') durumuna bakarak
 * haftanın durumunu günceller ve tamamlandıysa bir sonraki haftanın kilidini açar.
 * Ödev (required: false) hafta tamamlama koşuluna dahil değildir.
 * Tamamlanmış bir hafta asla geriye (IN_PROGRESS/LOCKED) düşmez.
 */
export async function recalculateAndSyncWeekProgress(
  tx: DbClient,
  studentId: string,
  weekId: string
): Promise<{ weekStatus: WeekStatus; nextWeekUnlocked: boolean }> {
  await ensureStudentWeekProgresses(tx, studentId);

  const week = await tx.week.findUnique({
    where: { id: weekId },
    include: {
      activities: true
    }
  });

  if (!week) {
    throw new Error('WEEK_NOT_FOUND');
  }

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
    if (att.status === 'COMPLETED' && (att.isFirstSuccess || att.mode === 'NORMAL')) {
      completedRequiredIds.add(att.activityId);
    }
  }

  const allRequiredDone =
    requiredActivities.length > 0 &&
    requiredActivities.every((reqAct) => completedRequiredIds.has(reqAct.id));

  let newStatus: WeekStatus = (currentWp?.status as WeekStatus) || 'NOT_STARTED';
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
      where: { order: week.order + 1 }
    });
    if (nextWeek) {
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

  return { weekStatus: newStatus, nextWeekUnlocked };
}
