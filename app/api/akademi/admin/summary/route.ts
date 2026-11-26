import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';
import { computeAdminDataset } from '@/lib/akademi/services/adminDatasetService';
import { getPrismaAsync } from '@/lib/akademi/services/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const url = new URL(req.url);
    const courseCode = url.searchParams.get('course') || 'ag-temelleri';
    const groupFilter = url.searchParams.get('group') || undefined;
    const weekOrder =
      parseInt(url.searchParams.get('weekOrder') || '1', 10) || 1;
    const rawAct = url.searchParams.get('activityCode');
    const activityCode = rawAct && rawAct.trim() ? rawAct.trim() : undefined;

    const { weeks, targetWeek, targetActivity, rows, courseSettings } =
      await computeAdminDataset(weekOrder, activityCode, courseCode, groupFilter);

    const prisma = await getPrismaAsync();
    const [openHelpRequests, pendingStudents] = await Promise.all([
      prisma.helpRequest.findMany({
        where: {
          courseCode,
          resolved: false
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentNumber: true
            }
          },
          activity: {
            select: { code: true, title: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.student.findMany({
        where: { approvalStatus: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentNumber: true,
          classLevel: true,
          section: true,
          createdAt: true
        }
      })
    ]);

    const totalStudents = rows.length;
    const recentlySeenCount = rows.filter((r) => r.isRecentlySeen).length;
    const selectedWeekCompletedCount = rows.filter(
      (r) => r.selectedWeekStatus === 'COMPLETED'
    ).length;
    const selectedWeekInProgressCount = rows.filter(
      (r) => r.selectedWeekStatus === 'IN_PROGRESS'
    ).length;

    const activityCompletions = targetActivity
      ? rows
          .filter(
            (r) =>
              r.selectedActivityStatus === 'COMPLETED' &&
              r.selectedActivityCompletedAt
          )
          .sort((a, b) => {
            const cA = a.selectedActivityCheckCount ?? 999;
            const cB = b.selectedActivityCheckCount ?? 999;
            if (cA !== cB) return cA - cB;
            const msA = a.selectedActivityElapsedMs ?? Number.MAX_SAFE_INTEGER;
            const msB = b.selectedActivityElapsedMs ?? Number.MAX_SAFE_INTEGER;
            if (msA !== msB) return msA - msB;
            return (
              new Date(a.selectedActivityCompletedAt!).getTime() -
              new Date(b.selectedActivityCompletedAt!).getTime()
            );
          })
          .map((r, idx) => {
            const ms = r.selectedActivityElapsedMs ?? 1000;
            const totalSec = Math.floor(ms / 1000);
            const mins = Math.floor(totalSec / 60);
            const secs = totalSec % 60;
            const centis = Math.floor((ms % 1000) / 10);
            const durationMsFormatted =
              mins > 0
                ? `${mins} dk ${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')} sn`
                : `${secs}.${String(centis).padStart(2, '0')} sn`;
            return {
              completionOrder: idx + 1,
              studentId: r.id,
              fullName: r.fullName,
              studentNumber: r.studentNumber,
              completedAt: r.selectedActivityCompletedAt,
              activeSeconds: r.selectedActivityActiveSeconds,
              elapsedSeconds: r.selectedActivityElapsedSeconds,
              elapsedMs: ms,
              durationMsFormatted,
              checkCount: r.selectedActivityCheckCount ?? 1,
              isFirstTry: r.selectedActivityIsFirstTry,
              allocatedSeconds: targetActivity.allocatedSeconds,
              isEarlyFinisher: r.selectedActivityEarlyFinisher,
              earlyFinisherRuleExplanation: `${
                r.selectedActivityIsFirstTry
                  ? 'Tekte doğru'
                  : `${r.selectedActivityCheckCount ?? 1} denemede doğru`
              } · Süre: ${durationMsFormatted}`
            };
          })
      : [];

    return NextResponse.json({
      refreshedAt: new Date().toISOString(),
      recentlySeenDefinition:
        'Son 60 saniye içinde etkinlik veya sayfa etkileşimi gönderen öğrenciler (kesin çevrimiçi gözetim iddiası taşımaz).',
      earlyFinisherDefinition:
        'İlk başarılı tamamlamadaki yaklaşık etkin çalışma süresi (activeSeconds) ayrılan 600 saniyeden (10 dakika) az olan öğrenciler. Tamamlama sırası ilk başarılı doğrulama zamanına (completedAt) göre sıralanır.',
      selectedWeekOrder: targetWeek?.order || 1,
      selectedActivityCode: targetActivity?.code || null,
      courseSettings,
      metrics: {
        totalStudents,
        recentlySeenCount,
        selectedWeekCompletedCount,
        selectedWeekInProgressCount
      },
      weeksCatalog: weeks.map((w) => ({
        id: w.id,
        order: w.order,
        title: w.title,
        isAdminUnlocked: w.isAdminUnlocked,
        unlockedGroups: Array.isArray((w as any).unlockedGroups)
          ? (w as any).unlockedGroups.map(String)
          : [],
        activities: w.activities.map((a) => ({
          id: a.id,
          code: a.code,
          title: a.title,
          type: a.type,
          required: a.required,
          allocatedSeconds: a.allocatedSeconds
        }))
      })),
      activityCompletions,
      helpRequests: openHelpRequests.map((hr) => ({
        id: hr.id,
        studentId: hr.studentId,
        studentName: `${hr.student.firstName} ${hr.student.lastName}`,
        studentNumber: hr.student.studentNumber,
        activityCode: hr.activity.code.replace(/^D-/, ''),
        activityTitle: hr.activity.title,
        message: hr.message,
        createdAt: hr.createdAt.toISOString()
      })),
      pendingRequestsCount: pendingStudents.length,
      pendingRequests: pendingStudents.map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        fullName: `${s.firstName} ${s.lastName}`,
        studentNumber: s.studentNumber,
        classLevel: s.classLevel ?? 2,
        section: s.section || 'A',
        groupKey: `${s.classLevel ?? 2}-${s.section || 'A'}`,
        createdAt: s.createdAt.toISOString()
      }))
    });
  } catch (err) {
    console.error('Admin summary error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Özet verileri yüklenirken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
