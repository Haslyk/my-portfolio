import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';
import { computeAdminDataset } from '@/lib/akademi/services/adminDatasetService';

function sanitizeCsvCell(
  value: string | number | null | undefined,
  forceTextForLeadingZeros = false
): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  if (forceTextForLeadingZeros && /^0[0-9]+$/.test(str)) {
    str = `'${str}`;
  }

  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

function formatIstanbulDate(isoStr: string | null): string {
  if (!isoStr) return '-';
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(isoStr));
  } catch {
    return isoStr;
  }
}

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

    const { rows } = await computeAdminDataset(
      weekOrder,
      activityCode,
      courseCode,
      groupFilter
    );

    const headers = [
      'Öğrenci Numarası (Metin)',
      'Ad',
      'Soyad',
      'Sınıf / Grup',
      'Gösterilen Dersler',
      'Son Tamamlanan Hafta',
      'İlk Tamamlanmamış Hafta',
      'Son Çalışılan Etkinlik',
      `Hafta ${weekOrder} Durumu`,
      `Hafta ${weekOrder} Zorunlu İlerleme`,
      `Hafta ${weekOrder} Etkin Süre (sn)`,
      `Hafta ${weekOrder} Ödev Durumu`,
      'Toplam Zorunlu Etkin Süre (sn)',
      'Toplam Ödev Süresi (sn)',
      'Toplam Tekrar (Practice) Süresi (sn)',
      'Seçili Etkinlik Tamamlanma Zamanı (Europe/Istanbul)',
      'Son Görülme (Europe/Istanbul)'
    ];

    const csvLines: string[] = [
      headers.map((h) => sanitizeCsvCell(h)).join(';')
    ];

    for (const r of rows) {
      const line = [
        sanitizeCsvCell(r.studentNumber, true),
        sanitizeCsvCell(r.firstName),
        sanitizeCsvCell(r.lastName),
        sanitizeCsvCell(`${r.classLevel}. Sınıf - ${r.section}`),
        sanitizeCsvCell(r.effectiveCourses.join(', ')),
        sanitizeCsvCell(
          r.lastCompletedWeekOrder
            ? `Hafta ${r.lastCompletedWeekOrder}`
            : 'Henüz Yok'
        ),
        sanitizeCsvCell(
          r.firstIncompleteWeekOrder
            ? `Hafta ${r.firstIncompleteWeekOrder}`
            : 'Tüm Haftalar Tamamlandı'
        ),
        sanitizeCsvCell(
          r.lastWorkedActivityCode
            ? `${r.lastWorkedActivityCode} (${r.lastWorkedActivityTitle})`
            : '-'
        ),
        sanitizeCsvCell(r.selectedWeekStatus),
        sanitizeCsvCell(
          `${r.selectedWeekRequiredCompleted} / ${r.selectedWeekRequiredTotal}`
        ),
        sanitizeCsvCell(r.selectedWeekActiveSeconds),
        sanitizeCsvCell(r.selectedWeekHomeworkStatus),
        sanitizeCsvCell(r.totalCourseRequiredActiveSeconds),
        sanitizeCsvCell(r.totalHomeworkActiveSeconds),
        sanitizeCsvCell(r.totalPracticeActiveSeconds),
        sanitizeCsvCell(formatIstanbulDate(r.selectedActivityCompletedAt)),
        sanitizeCsvCell(formatIstanbulDate(r.lastSeenAt))
      ];
      csvLines.push(line.join(';'));
    }

    const csvContent = '\uFEFF' + csvLines.join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="halim-akademi-${courseCode}-hafta-${weekOrder}.csv"`
      }
    });
  } catch (err) {
    console.error('Admin CSV export error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'CSV dışa aktarılırken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
