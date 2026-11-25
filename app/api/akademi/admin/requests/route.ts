import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';

const reviewRequestsSchema = z.object({
  studentIds: z.array(z.string().min(1)).min(1, 'En az bir istek seçmelisiniz.'),
  action: z.enum(['approve', 'reject'])
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const parsed = reviewRequestsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Geçersiz istek.'
        },
        { status: 400 }
      );
    }

    const { studentIds, action } = parsed.data;
    const prisma = await getPrismaAsync();

    if (action === 'approve') {
      const allWeeks = await prisma.week.findMany({
        select: { id: true, order: true }
      });

      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.student.updateMany({
          where: {
            id: { in: studentIds },
            approvalStatus: 'PENDING'
          },
          data: {
            approvalStatus: 'APPROVED'
          }
        });

        // Pre-create initial WeekProgress rows for approved students
        if (allWeeks.length > 0 && studentIds.length > 0) {
          const rows: { studentId: string; weekId: string; status: string }[] = [];
          for (const sid of studentIds) {
            for (const w of allWeeks) {
              rows.push({
                studentId: sid,
                weekId: w.id,
                status: w.order === 1 ? 'NOT_STARTED' : 'LOCKED'
              });
            }
          }
          await tx.weekProgress.createMany({
            data: rows,
            skipDuplicates: true
          });
        }

        return updated.count;
      });

      return NextResponse.json({
        ok: true,
        action: 'approve',
        processedCount: result,
        message: `${result} öğrenci kayıt isteği onaylandı.`
      });
    } else {
      const deleted = await prisma.student.deleteMany({
        where: {
          id: { in: studentIds },
          approvalStatus: 'PENDING'
        }
      });

      return NextResponse.json({
        ok: true,
        action: 'reject',
        processedCount: deleted.count,
        message: `${deleted.count} kayıt isteği reddedildi ve silindi.`
      });
    }
  } catch (err) {
    console.error('Review registration requests error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Kayıt istekleri işlenirken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
