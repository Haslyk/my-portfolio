import { NextRequest, NextResponse } from 'next/server';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';

export function formatDurationMsTr(ms: number): string {
  const safe = Math.max(1, ms);
  const totalSec = Math.floor(safe / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const centis = Math.floor((safe % 1000) / 10);
  return mins > 0
    ? `${mins} dk ${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')} sn`
    : `${secs}.${String(centis).padStart(2, '0')} sn`;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const url = new URL(req.url);
    const activityCode = url.searchParams.get('activityCode');
    const courseCode = url.searchParams.get('course') || 'ag-temelleri';

    const prisma = await getPrismaAsync();
    const currentStudent = await prisma.student.findUnique({
      where: { id: auth.student.id },
      select: { id: true, classLevel: true, section: true }
    });

    if (!activityCode) {
      return NextResponse.json({ entries: [] });
    }

    const activity = await prisma.activity.findUnique({
      where: { code: activityCode }
    });
    if (!activity || activity.courseCode !== courseCode) {
      return NextResponse.json({ entries: [] });
    }

    const attempts = await prisma.activityAttempt.findMany({
      where: {
        activityId: activity.id,
        mode: 'NORMAL',
        status: 'COMPLETED'
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            classLevel: true,
            section: true,
            approvalStatus: true
          }
        }
      }
    });

    const filtered = attempts
      .filter(
        (a) =>
          a.student.approvalStatus === 'APPROVED' &&
          a.student.classLevel === currentStudent?.classLevel &&
          a.student.section === currentStudent?.section &&
          a.completedAt &&
          a.startedAt
      )
      .map((a) => {
        const elapsedMs = Math.max(
          1,
          a.completedAt!.getTime() - a.startedAt.getTime()
        );
        return {
          studentId: a.student.id,
          displayName: `${a.student.firstName} ${a.student.lastName.charAt(0)}.`,
          isSelf: a.student.id === auth.student.id,
          checkCount: a.checkCount || 1,
          isFirstTry: (a.checkCount || 1) <= 1,
          elapsedMs,
          durationFormatted: formatDurationMsTr(elapsedMs),
          completedAt: a.completedAt!.toISOString()
        };
      })
      .sort((a, b) => {
        if (a.checkCount !== b.checkCount) return a.checkCount - b.checkCount;
        if (a.elapsedMs !== b.elapsedMs) return a.elapsedMs - b.elapsedMs;
        return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
      })
      .map((item, idx) => ({
        rank: idx + 1,
        ...item
      }));

    return NextResponse.json({
      activityCode: activity.code,
      activityTitle: activity.title,
      entries: filtered
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Sıralama yüklenemedi.' },
      { status: 500 }
    );
  }
}
