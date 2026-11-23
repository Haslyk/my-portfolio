import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';

const weekLockSchema = z.object({
  courseCode: z.string().min(1),
  weekOrder: z.number().int().min(1).max(10),
  action: z.enum(['unlock', 'lock']).optional().default('unlock'),
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

    const { courseCode, weekOrder, action, studentId, unlockAll, applyToAll } =
      parsed.data;
    const isAll = Boolean(unlockAll || applyToAll);

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

    // Individual student override (still respects global Week.isAdminUnlocked on lock)
    if (studentId) {
      const targetStatus = action === 'lock' ? 'LOCKED' : 'NOT_STARTED';
      const existing = await prisma.weekProgress.findUnique({
        where: {
          studentId_weekId: {
            studentId,
            weekId: week.id
          }
        }
      });

      if (action === 'unlock' && !week.isAdminUnlocked) {
        await prisma.week.update({
          where: { id: week.id },
          data: { isAdminUnlocked: true }
        });
      }

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

    // Course-wide admin week lock / unlock
    if (isAll) {
      if (action === 'unlock') {
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
          // 1) Mark week as admin-unlocked
          await tx.week.update({
            where: { id: week.id },
            data: { isAdminUnlocked: true }
          });

          // 2) Unlock WeekProgress ONLY for students who have completed the previous week
          if (prevWeek) {
            const completedPrev = await tx.weekProgress.findMany({
              where: {
                weekId: prevWeek.id,
                status: 'COMPLETED'
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
          message: `${weekOrder}. hafta kilidi açıldı (önceki haftayı tamamlayan öğrenciler erişebilir).`
        });
      } else {
        // Lock week globally by setting isAdminUnlocked = false (preserves existing student progress!)
        await prisma.week.update({
          where: { id: week.id },
          data: { isAdminUnlocked: false }
        });

        return NextResponse.json({
          ok: true,
          action: 'lock',
          message: `${weekOrder}. hafta kilitlendi (öğrencilerin önceki ilerlemeleri korunur).`
        });
      }
    }

    return NextResponse.json(
      { error: 'BAD_REQUEST', message: 'studentId veya applyToAll belirtilmelidir.' },
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
