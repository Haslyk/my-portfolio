import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';
import {
  getStudentGroupKey,
  resolveTargetGroups
} from '@/lib/akademi/services/progressService';

const weekLockSchema = z.object({
  courseCode: z.string().min(1),
  weekOrder: z.number().int().min(1).max(10),
  action: z.enum(['unlock', 'lock']).optional().default('unlock'),
  groupKey: z.string().optional(), // 'ALL' | '1-A' | '1-B' | '2-A' | '2-B'
  studentId: z.string().optional(),
  unlockAll: z.boolean().optional(),
  applyToAll: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const parsed = weekLockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Geçersiz hafta kilit isteği.' },
        { status: 400 }
      );
    }

    const {
      courseCode,
      weekOrder,
      action,
      groupKey,
      studentId,
      unlockAll,
      applyToAll
    } = parsed.data;
    const isAllOrGroup = Boolean(unlockAll || applyToAll || groupKey);

    if (action === 'lock' && weekOrder === 1) {
      return NextResponse.json(
        {
          error: 'CANNOT_LOCK_WEEK_1',
          message: '1. hafta başlangıç haftası olduğu için kilitlenemez.'
        },
        { status: 400 }
      );
    }

    const prisma = await getPrismaAsync();

    const week = await prisma.week.findUnique({
      where: {
        courseCode_order: {
          courseCode,
          order: weekOrder
        }
      }
    });

    if (!week) {
      return NextResponse.json(
        { error: 'WEEK_NOT_FOUND', message: 'İlgili ders haftası bulunamadı.' },
        { status: 404 }
      );
    }

    const currentGroups: string[] = Array.isArray((week as any).unlockedGroups)
      ? (week as any).unlockedGroups.map(String)
      : [];

    // 1) Individual student override
    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { classLevel: true, section: true }
      });
      const stuGroup = getStudentGroupKey(student?.classLevel, student?.section);

      if (action === 'unlock' && !currentGroups.includes(stuGroup)) {
        const nextGroups = Array.from(new Set([...currentGroups, stuGroup]));
        await prisma.week.update({
          where: { id: week.id },
          data: {
            isAdminUnlocked: true,
            unlockedGroups: nextGroups
          }
        });
      }

      const targetStatus = action === 'lock' ? 'LOCKED' : 'NOT_STARTED';
      const existing = await prisma.weekProgress.findUnique({
        where: {
          studentId_weekId: {
            studentId,
            weekId: week.id
          }
        }
      });

      if (!existing) {
        await prisma.weekProgress.create({
          data: {
            studentId,
            weekId: week.id,
            status: targetStatus
          }
        });
      } else if (action === 'unlock' && existing.status === 'LOCKED') {
        await prisma.weekProgress.update({
          where: { id: existing.id },
          data: { status: 'NOT_STARTED' }
        });
      } else if (action === 'lock' && existing.status !== 'LOCKED') {
        await prisma.weekProgress.update({
          where: { id: existing.id },
          data: { status: 'LOCKED' }
        });
      }

      return NextResponse.json({
        ok: true,
        action,
        message:
          action === 'lock'
            ? `${weekOrder}. hafta öğrenci için kilitlendi.`
            : `${weekOrder}. hafta kilidi öğrenci için açıldı.`
      });
    }

    // 2) Group-based, Class-based ('1' | '2'), or All-groups lock/unlock
    if (isAllOrGroup) {
      const targetGroups = resolveTargetGroups(groupKey);
      const isAll = !groupKey || groupKey === 'ALL';

      const groupLabel = isAll
        ? 'Tüm Gruplar'
        : groupKey === '1'
        ? '1. Sınıf (A ve B)'
        : groupKey === '2'
        ? '2. Sınıf (A ve B)'
        : `${groupKey.split('-')[0]}. Sınıf ${groupKey.split('-')[1]} Grubu`;

      if (action === 'unlock') {
        const nextGroups = Array.from(
          new Set([...currentGroups, ...targetGroups])
        );

        const prevWeek =
          weekOrder > 1
            ? await prisma.week.findUnique({
                where: {
                  courseCode_order: {
                    courseCode,
                    order: weekOrder - 1
                  }
                }
              })
            : null;

        await prisma.$transaction(async (tx) => {
          await tx.week.update({
            where: { id: week.id },
            data: {
              isAdminUnlocked: nextGroups.length > 0,
              unlockedGroups: nextGroups
            }
          });

          // Unlock WeekProgress ONLY for students in targetGroups who completed the previous week
          if (prevWeek) {
            const targetPairs = targetGroups.map((g) => {
              const [cls, sec] = g.split('-');
              return { classLevel: parseInt(cls, 10), section: sec };
            });

            const completedPrev = await tx.weekProgress.findMany({
              where: {
                weekId: prevWeek.id,
                status: 'COMPLETED',
                ...(isAll ? {} : { student: { OR: targetPairs } })
              },
              select: { studentId: true }
            });
            const eligibleStudentIds = completedPrev.map((p) => p.studentId);
            if (eligibleStudentIds.length > 0) {
              await tx.weekProgress.updateMany({
                where: {
                  weekId: week.id,
                  studentId: { in: eligibleStudentIds },
                  status: 'LOCKED'
                },
                data: { status: 'NOT_STARTED' }
              });
              await tx.weekProgress.createMany({
                data: eligibleStudentIds.map((sid) => ({
                  studentId: sid,
                  weekId: week.id,
                  status: 'NOT_STARTED'
                })),
                skipDuplicates: true
              });
            }
          }
        });

        return NextResponse.json({
          ok: true,
          action: 'unlock',
          unlockedGroups: nextGroups,
          message: `${weekOrder}. hafta kilidi ${groupLabel} için açıldı (önceki haftayı tamamlayanlar girebilir).`
        });
      } else {
        const nextGroups = isAll
          ? []
          : currentGroups.filter((g) => !targetGroups.includes(g));

        await prisma.week.update({
          where: { id: week.id },
          data: {
            isAdminUnlocked: nextGroups.length > 0,
            unlockedGroups: nextGroups
          }
        });

        return NextResponse.json({
          ok: true,
          action: 'lock',
          unlockedGroups: nextGroups,
          message: `${weekOrder}. hafta ${groupLabel} için kilitlendi.`
        });
      }
    }

    return NextResponse.json(
      { error: 'BAD_REQUEST', message: 'studentId veya groupKey belirtilmelidir.' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Admin week lock/unlock error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Hafta kilidi güncellenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
