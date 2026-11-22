import { NextRequest, NextResponse } from 'next/server';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import {
  computeBoundedActiveDeltaSeconds,
  verifyAndTouchLease
} from '@/lib/akademi/services/leaseService';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const { attemptId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const prisma = await getPrismaAsync();
    const studentId = auth.student.id;
    const leaseToken =
      typeof body?.leaseToken === 'string' ? body.leaseToken : undefined;

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

    const leaseCheck = await verifyAndTouchLease(
      prisma,
      studentId,
      attempt.id,
      leaseToken
    );

    const now = new Date();
    const deltaSec =
      leaseCheck.valid && attempt.status !== 'COMPLETED'
        ? computeBoundedActiveDeltaSeconds(attempt.lastHeartbeatAt, now)
        : 0;

    const updated = await prisma.activityAttempt.update({
      where: { id: attempt.id },
      data: {
        activeSeconds: { increment: deltaSec },
        lastHeartbeatAt: now
      }
    });

    return NextResponse.json({
      attemptId: updated.id,
      activeSeconds: updated.activeSeconds,
      pausedAt: now.toISOString()
    });
  } catch (err) {
    console.error('Pause attempt error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Duraklatma sırasında hata oluştu.'
      },
      { status: 500 }
    );
  }
}
