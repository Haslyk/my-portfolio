import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';

const reviewSchema = z.object({
  attemptId: z.string().min(1),
  teacherVerified: z.boolean().optional(),
  teacherFeedback: z.string().max(500).optional(),
  reopenForRetry: z.boolean().optional()
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Geçersiz değerlendirme verisi.' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaAsync();
    const attempt = await prisma.activityAttempt.findUnique({
      where: { id: parsed.data.attemptId }
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'ATTEMPT_NOT_FOUND', message: 'Çalışma kaydı bulunamadı.' },
        { status: 404 }
      );
    }

    const currentState =
      attempt.state && typeof attempt.state === 'object'
        ? (attempt.state as Record<string, any>)
        : {};

    const nextState: Record<string, any> = {
      ...currentState,
      ...(typeof parsed.data.teacherVerified === 'boolean'
        ? { teacherVerified: parsed.data.teacherVerified }
        : {}),
      ...(typeof parsed.data.teacherFeedback === 'string'
        ? { teacherFeedback: parsed.data.teacherFeedback.trim() }
        : {})
    };

    const updated = await prisma.activityAttempt.update({
      where: { id: attempt.id },
      data: {
        state: nextState,
        ...(parsed.data.reopenForRetry
          ? { status: 'IN_PROGRESS', completedAt: null }
          : {})
      }
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: auth.admin.id,
        studentId: attempt.studentId,
        action: parsed.data.reopenForRetry
          ? 'REOPEN_ACTIVITY_ATTEMPT'
          : 'TEACHER_REVIEW_UPDATE',
        newValue: {
          attemptId: attempt.id,
          teacherVerified: nextState.teacherVerified ?? false,
          teacherFeedback: nextState.teacherFeedback ?? ''
        }
      }
    });

    return NextResponse.json({ ok: true, attempt: updated });
  } catch (err) {
    console.error('GP teacher review error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Öğretmen onayı kaydedilemedi.' },
      { status: 500 }
    );
  }
}
