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

    const targetStatus = action === 'lock' ? 'LOCKED' : 'NOT_STARTED';

    if (studentId) {
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

    if (isAll) {
      const allStudents = await prisma.student.findMany({
        select: { id: true }
      });

      await prisma.$transaction(async (tx) => {
        if (action === 'unlock') {
          await tx.weekProgress.updateMany({
            where: {
              weekId: week.id,
              status: 'LOCKED'
            },
            data: {
              status: 'NOT_STARTED'
            }
          });
        } else {
          await tx.weekProgress.updateMany({
            where: {
              weekId: week.id
            },
            data: {
              status: 'LOCKED'
            }
          });
        }

        if (allStudents.length > 0) {
          await tx.weekProgress.createMany({
            data: allStudents.map((s) => ({
              studentId: s.id,
              weekId: week.id,
              status: targetStatus
            })),
            skipDuplicates: true
          });
        }
      });

      return NextResponse.json({
        ok: true,
        action,
        count: allStudents.length,
        message:
          action === 'lock'
            ? `${weekOrder}. hafta tüm öğrenciler için kilitlendi.`
            : `${weekOrder}. hafta tüm öğrenciler için açıldı.`
      });
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
