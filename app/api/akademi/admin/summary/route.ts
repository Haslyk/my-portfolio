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
    const weekOrder =
      parseInt(url.searchParams.get('weekOrder') || '1', 10) || 1;
    const rawAct = url.searchParams.get('activityCode');
    const activityCode = rawAct && rawAct.trim() ? rawAct.trim() : undefined;

    const { weeks, targetWeek, targetActivity, rows, courseSettings } =
      await computeAdminDataset(weekOrder, activityCode, courseCode);

    const prisma = await getPrismaAsync();
    const openHelpRequests = await prisma.helpRequest.findMany({
      where: {
        courseCode,
        resolved: false
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, studentNumber: true }
        },
        activity: {
          select: { code: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

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
          .sort(
            (a, b) =>
              new Date(a.selectedActivityCompletedAt!).getTime() -
              new Date(b.selectedActivityCompletedAt!).getTime()
          )
          .map((r, idx) => ({
            completionOrder: idx + 1,
            studentId: r.id,
            fullName: r.fullName,
            studentNumber: r.studentNumber,
            completedAt: r.selectedActivityCompletedAt,
            activeSeconds: r.selectedActivityActiveSeconds,
            elapsedSeconds: r.selectedActivityElapsedSeconds,
            allocatedSeconds: targetActivity.allocatedSeconds,
            isEarlyFinisher: r.selectedActivityEarlyFinisher,
            earlyFinisherRuleExplanation: `Yaklaşık etkin çalışma süresi (activeSeconds = ${r.selectedActivityActiveSeconds} sn), ayrılan süreden (${targetActivity.allocatedSeconds} sn / 10 dk) kısa olduğu için "Ayrılan süreden önce tamamladı" etiketi verilmiştir.`
          }))
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
