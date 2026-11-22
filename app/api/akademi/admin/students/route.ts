import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';
import { computeAdminDataset } from '@/lib/akademi/services/adminDatasetService';

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
    const statusFilter = (url.searchParams.get('status') || 'ALL').trim();
    const search = (url.searchParams.get('search') || '')
      .trim()
      .toLocaleLowerCase('tr-TR');

    const { rows, courseSettings } = await computeAdminDataset(
      weekOrder,
      activityCode,
      courseCode
    );

    let filtered = rows;

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.fullName.toLocaleLowerCase('tr-TR').includes(search) ||
          r.studentNumber.includes(search)
      );
    }

    if (statusFilter && statusFilter !== 'ALL') {
      if (activityCode) {
        if (statusFilter === 'EARLY_FINISHER') {
          filtered = filtered.filter(
            (r) =>
              r.selectedActivityStatus === 'COMPLETED' &&
              r.selectedActivityEarlyFinisher
          );
        } else {
          filtered = filtered.filter(
            (r) => r.selectedActivityStatus === statusFilter
          );
        }
      } else {
        filtered = filtered.filter(
          (r) => r.selectedWeekStatus === statusFilter
        );
      }
    }

    if (
      activityCode &&
      (statusFilter === 'COMPLETED' || statusFilter === 'EARLY_FINISHER')
    ) {
      filtered.sort((a, b) => {
        if (!a.selectedActivityCompletedAt) return 1;
        if (!b.selectedActivityCompletedAt) return -1;
        return (
          new Date(a.selectedActivityCompletedAt).getTime() -
          new Date(b.selectedActivityCompletedAt).getTime()
        );
      });
    }

    return NextResponse.json({
      students: filtered,
      courseSettings,
      totalCount: rows.length,
      filteredCount: filtered.length
    });
  } catch (err) {
    console.error('Admin students list error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Öğrenci listesi yüklenirken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
