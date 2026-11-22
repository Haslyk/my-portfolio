import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import { checkWeekUnlocked } from '@/lib/akademi/services/progressService';
import { validateAndApplyRamState } from '@/lib/akademi/pc-donanimi';

const patchStateSchema = z.object({
  state: z.record(z.any()),
  revision: z.number().int().min(1),
  leaseToken: z.string().optional()
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const { attemptId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const parsed = patchStateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Geçersiz taslak verisi.'
        },
        { status: 400 }
      );
    }

    const prisma = await getPrismaAsync();
    const studentId = auth.student.id;
    const attempt = await prisma.activityAttempt.findUnique({
      where: { id: attemptId },
      include: { activity: true }
    });

    if (!attempt) {
      return NextResponse.json(
        {
          error: 'ATTEMPT_NOT_FOUND',
          message: 'Çalışma kaydı bulunamadı.'
        },
        { status: 404 }
      );
    }

    if (attempt.studentId !== studentId) {
      return NextResponse.json(
        {
          error: 'FORBIDDEN_ATTEMPT_ACCESS',
          message: 'Başka bir öğrencinin çalışma kaydına erişemezsiniz.'
        },
        { status: 403 }
      );
    }

    const lockCheck = await checkWeekUnlocked(
      prisma,
      studentId,
      attempt.activity.weekId
    );
    if (!lockCheck.unlocked) {
      return NextResponse.json(
        {
          error: 'WEEK_LOCKED',
          message: 'Bu hafta kilitli olduğu için taslak kaydedilemez.'
        },
        { status: 403 }
      );
    }

    if (parsed.data.revision < attempt.revision) {
      return NextResponse.json(
        {
          error: 'STALE_REVISION',
          message:
            'Daha yeni bir çalışma taslağı mevcut olduğu için eski taslak uygulanmadı.',
          currentRevision: attempt.revision,
          state: attempt.state
        },
        { status: 409 }
      );
    }

    let nextState = parsed.data.state;
    if (attempt.activity.code === 'D-W2-A2' || attempt.activity.code === 'W2-A2') {
      if (attempt.activity.courseCode === 'pc-donanimi' || attempt.activity.code === 'D-W2-A2') {
        const prevState =
          typeof attempt.state === 'object' && attempt.state !== null
            ? (attempt.state as Record<string, any>)
            : {};
        const ramValidation = validateAndApplyRamState(prevState, nextState);
        if (!ramValidation.valid) {
          return NextResponse.json(
            {
              error: ramValidation.errorMessage,
              message: ramValidation.errorMessage,
              code: 'INVALID_RAM_TRANSITION',
              state: ramValidation.sanitizedState,
            },
            { status: 400 }
          );
        }
        nextState = ramValidation.sanitizedState;
      }
    }

    const newRevision = parsed.data.revision + 1;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: studentId },
        data: { lastSeenAt: new Date() }
      });

      return tx.activityAttempt.update({
        where: { id: attempt.id },
        data: {
          state: nextState,
          revision: newRevision
        }
      });
    });

    return NextResponse.json({
      attemptId: updated.id,
      revision: updated.revision,
      state: updated.state,
      savedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Patch attempt state error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Taslak kaydedilirken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
