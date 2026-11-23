import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';

const unlockSchema = z.object({
  courseCode: z.string().min(1),
  weekOrder: z.number().int().min(1).max(10),
  studentId: z.string().optional(),
  unlockAll: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const parsed = unlockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Geçersiz hafta kilit açma isteği.' },
        { status: 400 }
      );
    }

    const { courseCode, weekOrder, studentId, unlockAll } = parsed.data;
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
            status: 'NOT_STARTED'
          }
        });
      } else if (existing.status === 'LOCKED') {
        await prisma.weekProgress.update({
          where: { id: existing.id },
          data: { status: 'NOT_STARTED' }
        });
      }

      return NextResponse.json({
        unlocked: true,
        message: `${weekOrder}. hafta kilidi öğrenci için açıldı.`
      });
    }

    if (unlockAll) {
      const allStudents = await prisma.student.findMany({
        select: { id: true }
      });

      await prisma.$transaction(async (tx) => {
        // 1) Update all existing LOCKED rows for this week to NOT_STARTED
        await tx.weekProgress.updateMany({
          where: {
            weekId: week.id,
            status: 'LOCKED'
          },
          data: {
            status: 'NOT_STARTED'
          }
        });

        // 2) Create missing rows as NOT_STARTED
        if (allStudents.length > 0) {
          await tx.weekProgress.createMany({
            data: allStudents.map((s) => ({
              studentId: s.id,
              weekId: week.id,
              status: 'NOT_STARTED'
            })),
            skipDuplicates: true
          });
        }
      });

      return NextResponse.json({
        unlocked: true,
        count: allStudents.length,
        message: `${weekOrder}. hafta tüm öğrenciler için açıldı.`
      });
    }

    return NextResponse.json(
      { error: 'BAD_REQUEST', message: 'studentId veya unlockAll belirtilmelidir.' },
      { status: 400 }
    );
  } catch (err) {
    console.error('Admin week unlock error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Hafta kilidi açılırken hata oluştu.' },
      { status: 500 }
    );
  }
}
