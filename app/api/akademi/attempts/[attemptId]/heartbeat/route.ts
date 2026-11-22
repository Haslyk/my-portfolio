import { NextRequest, NextResponse } from 'next/server';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';
import { checkWeekUnlocked } from '@/lib/akademi/services/progressService';
import {
  computeBoundedActiveDeltaSeconds,
  issueOrTakeoverLease,
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
    const takeover = Boolean(body?.takeover);

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
          message: 'Kilitli hafta.'
        },
        { status: 403 }
      );
    }

    if (takeover) {
      const result = await prisma.$transaction(async (tx) => {
        const newLeaseToken = await issueOrTakeoverLease(
          tx,
          studentId,
          attempt.id
        );
        const now = new Date();
        await tx.student.update({
          where: { id: studentId },
          data: { lastSeenAt: now }
        });
        const upd = await tx.activityAttempt.update({
          where: { id: attempt.id },
          data: { lastHeartbeatAt: now }
        });
        return { newLeaseToken, activeSeconds: upd.activeSeconds };
      });

      return NextResponse.json({
        status: 'TAKEN_OVER',
        leaseToken: result.newLeaseToken,
        activeSeconds: result.activeSeconds
      });
    }

    const leaseCheck = await verifyAndTouchLease(
      prisma,
      studentId,
      attempt.id,
      leaseToken
    );

    if (!leaseCheck.valid) {
      return NextResponse.json(
        {
          error: 'LEASE_CONFLICT',
          message:
            'Bu etkinlik başka bir sekmede açık görünüyor. Sürenin çift sayılmaması için bu sekmede sayaç duraklatıldı.'
        },
        { status: 409 }
      );
    }

    const now = new Date();
    const deltaSec =
      attempt.status === 'COMPLETED'
        ? 0
        : computeBoundedActiveDeltaSeconds(attempt.lastHeartbeatAt, now);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: studentId },
        data: { lastSeenAt: now }
      });

      return tx.activityAttempt.update({
        where: { id: attempt.id },
        data: {
          activeSeconds: { increment: deltaSec },
          lastHeartbeatAt: now
        }
      });
    });

    return NextResponse.json({
      attemptId: updated.id,
      activeSeconds: updated.activeSeconds,
      deltaAdded: deltaSec,
      overAllocatedTime:
        updated.activeSeconds > attempt.activity.allocatedSeconds
    });
  } catch (err) {
    console.error('Heartbeat error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Süre güncellenirken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
