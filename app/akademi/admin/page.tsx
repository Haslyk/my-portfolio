"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Activity,
  CheckCircle2,
  Clock,
  Search,
  Download,
  RefreshCw,
  LogOut,
  Eye,
  Edit3,
  X,
  Info,
  Sparkles,
  Network,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  BookOpen,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import {
  ApiError,
  apiRequest,
  formatDurationTr,
  formatIstanbulDateTime
} from '@/lib/akademi/apiClient';
import { CustomSelect } from '@/components/akademi/CustomSelect';
import { AKADEMI_COURSES_CATALOG } from '@/lib/akademi/shared';

export default function AkademiAdminPage() {
  const queryClient = useQueryClient();

  const [admin, setAdmin] = useState<{ id: string; username: string } | null>(
    null
  );
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Filters & States
  const [selectedWeekOrder, setSelectedWeekOrder] = useState<number>(1);
  const [selectedActivityCode, setSelectedActivityCode] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTabVisible, setIsTabVisible] = useState<boolean>(
    typeof document !== 'undefined'
      ? document.visibilityState === 'visible'
      : true
  );
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    firstName: string;
    lastName: string;
    studentNumber: string;
    effectiveCourses: string[];
  } | null>(null);
  const [editMessage, setEditMessage] = useState<{
    isError: boolean;
    text: string;
  } | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [updatingCourseStudentId, setUpdatingCourseStudentId] = useState<
    string | null
  >(null);
  const [updatingGlobalCourseCode, setUpdatingGlobalCourseCode] = useState<
    string | null
  >(null);

  useEffect(() => {
    let mounted = true;
    async function checkAdminSession() {
      try {
        const res = await apiRequest<{
          admin: { id: string; username: string };
        }>('/api/akademi/admin/me');
        if (mounted) setAdmin(res.admin);
      } catch {
        if (mounted) setAdmin(null);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    }
    checkAdminSession();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleVis = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await apiRequest<{
        admin: { id: string; username: string };
      }>('/api/akademi/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      setAdmin(res.admin);
    } catch (err) {
      setLoginError(
        err instanceof ApiError
          ? err.message
          : 'Giriş yapılamadı. Lütfen bağlantınızı kontrol edin.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const summaryQuery = useQuery({
    queryKey: ['admin-summary', selectedWeekOrder, selectedActivityCode],
    queryFn: () => {
      const params = new URLSearchParams({
        weekOrder: String(selectedWeekOrder)
      });
      if (selectedActivityCode) {
        params.set('activityCode', selectedActivityCode);
      }
      return apiRequest<any>(`/api/akademi/admin/summary?${params.toString()}`);
    },
    enabled: Boolean(admin),
    refetchInterval: isTabVisible ? 15000 : false,
    refetchIntervalInBackground: false
  });

  const studentsQuery = useQuery({
    queryKey: [
      'admin-students',
      selectedWeekOrder,
      selectedActivityCode,
      statusFilter,
      searchQuery
    ],
    queryFn: () => {
      const params = new URLSearchParams({
        weekOrder: String(selectedWeekOrder),
        status: statusFilter,
        search: searchQuery
      });
      if (selectedActivityCode) {
        params.set('activityCode', selectedActivityCode);
      }
      return apiRequest<{
        students: any[];
        courseSettings: any[];
        totalCount: number;
        filteredCount: number;
      }>(`/api/akademi/admin/students?${params.toString()}`);
    },
    enabled: Boolean(admin),
    refetchInterval: isTabVisible ? 15000 : false,
    refetchIntervalInBackground: false
  });

  const studentDetailQuery = useQuery({
    queryKey: ['admin-student-detail', detailStudentId],
    queryFn: () =>
      apiRequest<any>(`/api/akademi/admin/students/${detailStudentId}`),
    enabled: Boolean(admin && detailStudentId)
  });

  useEffect(() => {
    if (studentDetailQuery.data?.student) {
      const s = studentDetailQuery.data.student;
      setEditForm({
        firstName: s.firstName,
        lastName: s.lastName,
        studentNumber: s.studentNumber,
        effectiveCourses: Array.isArray(s.effectiveCourses)
          ? s.effectiveCourses
          : ['ag-temelleri']
      });
      setEditMessage(null);
    }
  }, [studentDetailQuery.data]);

  const handleManualRefresh = () => {
    summaryQuery.refetch();
    studentsQuery.refetch();
    if (detailStudentId) {
      studentDetailQuery.refetch();
    }
  };

  const handleAdminLogout = async () => {
    try {
      await apiRequest('/api/akademi/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      queryClient.clear();
      setAdmin(null);
    }
  };

  const handleToggleGlobalCourse = async (
    courseCode: string,
    currentVisible: boolean
  ) => {
    setUpdatingGlobalCourseCode(courseCode);
    try {
      await apiRequest('/api/akademi/admin/courses', {
        method: 'PATCH',
        body: JSON.stringify({
          code: courseCode,
          defaultVisible: !currentVisible,
          applyToAllStudents: true
        })
      });
      await summaryQuery.refetch();
      await studentsQuery.refetch();
    } catch {
      // ignore
    } finally {
      setUpdatingGlobalCourseCode(null);
    }
  };

  const handleQuickToggleStudentCourse = async (
    studentRow: any,
    courseCode: string
  ) => {
    setUpdatingCourseStudentId(studentRow.id);
    try {
      const currentList: string[] = Array.isArray(studentRow.effectiveCourses)
        ? studentRow.effectiveCourses
        : [];
      const hasCourse = currentList.includes(courseCode);
      const nextCourses = hasCourse
        ? currentList.filter((c) => c !== courseCode)
        : [...currentList, courseCode];

      await apiRequest(`/api/akademi/admin/students/${studentRow.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          allowedCourses: nextCourses
        })
      });
      await studentsQuery.refetch();
      if (detailStudentId === studentRow.id) {
        await studentDetailQuery.refetch();
      }
    } catch {
      // ignore
    } finally {
      setUpdatingCourseStudentId(null);
    }
  };

  const handleSaveStudentIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailStudentId || !editForm) return;
    setEditMessage(null);
    try {
      const res = await apiRequest<{ message: string }>(
        `/api/akademi/admin/students/${detailStudentId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            firstName: editForm.firstName,
            lastName: editForm.lastName,
            studentNumber: editForm.studentNumber,
            allowedCourses: editForm.effectiveCourses
          })
        }
      );
      setEditMessage({ isError: false, text: res.message });
      studentDetailQuery.refetch();
      studentsQuery.refetch();
      summaryQuery.refetch();
    } catch (err) {
      setEditMessage({
        isError: true,
        text:
          err instanceof ApiError
            ? err.message
            : 'Öğrenci bilgisi güncellenemedi.'
      });
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-purple mb-3" />
        <p className="text-base font-extrabold text-brand-navy">
          Öğretmen Paneli kontrol ediliyor...
        </p>
      </div>
    );
  }

  // LOGIN VIEW
  if (!admin) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between">
        <header className="bg-brand-navy text-white border-b-4 border-brand-orange py-4 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-orange text-brand-navy flex items-center justify-center font-extrabold">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold">
                  Halim Akademi · Öğretmen Paneli
                </h1>
                <p className="text-xs text-slate-300">
                  Ders Görünürlüğü ve Öğrenci İlerleme Yönetimi
                </p>
              </div>
            </div>

            <Link
              href="/akademi"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-200 hover:text-brand-orange"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Öğrenci Girişine Dön</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-brand-navy text-brand-orange flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy mb-1">
              Öğretmen Girişi
            </h2>
            <p className="text-sm text-slate-600 mb-6 font-medium">
              Hangi dersin hangi öğrenciye gösterileceğini ayarlamak ve öğrenci
              ilerlemelerini izlemek için giriş yapın.
            </p>

            {loginError && (
              <div
                role="alert"
                className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-950 text-sm font-semibold flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin_username"
                  className="block text-sm font-extrabold text-brand-navy mb-1"
                >
                  Kullanıcı Adı
                </label>
                <input
                  id="admin_username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-2.5 text-base font-semibold text-slate-900 focus:border-brand-purple focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="admin_password"
                  className="block text-sm font-extrabold text-brand-navy mb-1"
                >
                  Parola
                </label>
                <input
                  id="admin_password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-2.5 text-base font-semibold text-slate-900 focus:border-brand-purple focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white font-extrabold text-base shadow-sm disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Giriş Yapılıyor...</span>
                  </>
                ) : (
                  <span>Panele Giriş Yap</span>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
          Halim Akademi Öğretmen Paneli · Yetkisiz erişim engellenmiştir
        </footer>
      </div>
    );
  }

  const weeksCatalog = summaryQuery.data?.weeksCatalog || [];
  const courseSettings =
    summaryQuery.data?.courseSettings || AKADEMI_COURSES_CATALOG;
  const currentWeekCatalog = weeksCatalog.find(
    (w: any) => w.order === selectedWeekOrder
  );
  const activitiesInSelectedWeek = currentWeekCatalog?.activities || [];

  const renderStatusPill = (status: string | null) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tamamlandı</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            <span>Devam Ediyor</span>
          </span>
        );
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-200 text-slate-700">
            <span>Kilitli</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-300">
            <span>Başlamadı</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-brand-navy text-white border-b-4 border-brand-orange shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/akademi"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-brand-navyLight hover:bg-slate-700 text-xs font-bold border border-slate-600"
            >
              <ArrowLeft className="w-4 h-4 text-brand-orange" />
              <span>Akademi Portalı</span>
            </Link>
            <div className="w-10 h-10 rounded-xl bg-brand-orange text-brand-navy flex items-center justify-center font-extrabold">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold">
                Halim Akademi · Öğretmen Kontrol Paneli
              </h1>
              <p className="text-xs text-slate-300">
                Ders Görünürlüğü Atama ve Öğrenci İlerleme Takibi
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              Son Yenileme:{' '}
              <strong className="text-white">
                {formatIstanbulDateTime(summaryQuery.data?.refreshedAt)}
              </strong>
            </span>

            <button
              type="button"
              onClick={handleManualRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-navyLight hover:bg-slate-700 text-white text-xs sm:text-sm font-bold border border-slate-600"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  summaryQuery.isFetching ? 'animate-spin' : ''
                }`}
              />
              <span>Elle Yenile</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-purple hover:bg-purple-800 text-white text-xs sm:text-sm font-bold"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ölçüm & Kimlik Notu</span>
            </button>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-700 text-white text-xs sm:text-sm font-bold border border-slate-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış ({admin.username})</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 py-6 space-y-6 flex-1">
        {/* Global Course Visibility Management Card */}
        <section className="bg-white rounded-2xl border-2 border-brand-navy/15 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-brand-purple" />
              <div>
                <h2 className="text-base font-extrabold text-brand-navy">
                  Ders Görünürlüğü Yönetimi (Varsayılan & Tüm Öğrenciler)
                </h2>
                <p className="text-xs text-slate-600">
                  Yeni giriş yapan öğrencilere hangi derslerin varsayılan olarak
                  gösterileceğini buradan açıp kapatabilirsiniz. Ayrıca aşağıdaki
                  tablodan <strong>öğrenci bazlı</strong> tek tek de ders açıp
                  kapatabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courseSettings.map((course: any) => {
              const isVisible = Boolean(course.defaultVisible);
              const isBusy = updatingGlobalCourseCode === course.code;

              return (
                <div
                  key={course.code}
                  className={`rounded-xl border-2 p-4 flex items-center justify-between gap-3 transition-all ${
                    isVisible
                      ? 'bg-emerald-50/40 border-emerald-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-brand-navy">
                        {course.shortTitle || course.title}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                          course.isReady
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {course.isReady ? 'Panel Aktif' : 'Yakında'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {isVisible
                        ? 'Öğrencilere ders seçim ekranında gösteriliyor'
                        : 'Öğrencilerin ders seçim ekranında gizli'}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      handleToggleGlobalCourse(course.code, isVisible)
                    }
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                      isVisible
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isVisible ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    <span>{isVisible ? 'Açık' : 'Gizli'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <span>Toplam Kayıtlı Öğrenci</span>
              <Users className="w-5 h-5 text-brand-navy" />
            </div>
            <div className="text-3xl font-extrabold text-brand-navy mt-2">
              {summaryQuery.data?.metrics?.totalStudents ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Veritabanına katılan benzersiz öğrenci sayısı
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              <span>Yakın Zamanda Görülenler</span>
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-800 mt-2">
              {summaryQuery.data?.metrics?.recentlySeenCount ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Son 60 saniyede etkinlik/sayfa etkileşimi olanlar
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-brand-purple">
              <span>{selectedWeekOrder}. Haftayı Tamamlayanlar</span>
              <CheckCircle2 className="w-5 h-5 text-brand-purple" />
            </div>
            <div className="text-3xl font-extrabold text-brand-navy mt-2">
              {summaryQuery.data?.metrics?.selectedWeekCompletedCount ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              2 zorunlu etkinlik + değerlendirmeyi bitirenler
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-amber-700">
              <span>{selectedWeekOrder}. Haftada Devam Edenler</span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-800 mt-2">
              {summaryQuery.data?.metrics?.selectedWeekInProgressCount ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Haftaya başlamış, henüz tamamlamamış öğrenciler
            </p>
          </div>
        </section>

        {/* Filters & CSV Export Bar */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                Hafta Filtresi
              </label>
              <CustomSelect
                id="filter_week"
                value={String(selectedWeekOrder)}
                options={[1, 2, 3, 4, 5].map((order) => {
                  const w = weeksCatalog.find((x: any) => x.order === order);
                  return {
                    value: String(order),
                    badge: `${order}. Hafta`,
                    label: w ? w.title : `${order}. Hafta`
                  };
                })}
                onChange={(val) => {
                  setSelectedWeekOrder(Number(val));
                  setSelectedActivityCode('');
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                Etkinlik Filtresi (Erken Bitiren Takibi)
              </label>
              <CustomSelect
                id="filter_activity"
                value={selectedActivityCode}
                placeholder="— Tüm Hafta Genel Görünümü —"
                allowClear={true}
                options={[
                  {
                    value: '',
                    label: 'Tüm Hafta Genel Görünümü'
                  },
                  ...activitiesInSelectedWeek.map((act: any) => ({
                    value: act.code,
                    badge: act.code,
                    label: act.title
                  }))
                ]}
                onChange={(val) => setSelectedActivityCode(val)}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                Durum Filtresi
              </label>
              <CustomSelect
                id="filter_status"
                value={statusFilter}
                options={[
                  { value: 'ALL', label: 'Tüm Durumlar' },
                  { value: 'COMPLETED', label: 'Tamamlandı' },
                  { value: 'IN_PROGRESS', label: 'Devam Ediyor' },
                  { value: 'NOT_STARTED', label: 'Başlamadı' },
                  ...(!selectedActivityCode
                    ? [{ value: 'LOCKED', label: 'Kilitli' }]
                    : []),
                  ...(selectedActivityCode
                    ? [
                        {
                          value: 'EARLY_FINISHER',
                          badge: '< 10 dk',
                          label: 'Ayrılan Süreden Önce Tamamladı'
                        }
                      ]
                    : [])
                ]}
                onChange={(val) => setStatusFilter(val)}
              />
            </div>

            <div>
              <label
                htmlFor="filter_search"
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1"
              >
                Ad / Soyad / Öğrenci No Ara
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="filter_search"
                  type="text"
                  placeholder="İsim veya numara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2 text-xs text-slate-600 max-w-3xl">
              <Info className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
              <span>
                <strong>CSV ve Baştaki Sıfırlar Notu:</strong> Dışa aktarılan CSV
                dosyası Türkçe karakterler için UTF-8 BOM içerir ve öğrenci
                numaralarındaki baştaki sıfırların (örn. <code>02401...</code>)
                Excel’de kaybolmaması için metin önekiyle güvenli üretilir.
              </span>
            </div>

            <a
              href={`/api/akademi/admin/export?weekOrder=${selectedWeekOrder}${
                selectedActivityCode
                  ? `&activityCode=${encodeURIComponent(selectedActivityCode)}`
                  : ''
              }`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white text-xs sm:text-sm font-extrabold shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>CSV Olarak Dışa Aktar</span>
            </a>
          </div>
        </section>

        {/* Selected Activity Completion Order & Early Finishers Panel */}
        {selectedActivityCode && summaryQuery.data?.activityCompletions && (
          <section className="bg-white rounded-2xl border-2 border-brand-purple/40 p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-brand-navy flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-purple" />
                  <span>
                    {selectedActivityCode} Etkinliğini Tamamlayanlar (İlk Başarı
                    Zamanı <code>completedAt</code> Sırasıyla)
                  </span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {summaryQuery.data.earlyFinisherDefinition}
                </p>
              </div>
            </div>

            {summaryQuery.data.activityCompletions.length === 0 ? (
              <p className="text-sm text-slate-500 font-medium">
                Bu etkinliği henüz tamamlayan öğrenci bulunmuyor.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {summaryQuery.data.activityCompletions.map((item: any) => (
                  <div
                    key={item.studentId}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-navy text-brand-orange font-extrabold text-xs flex items-center justify-center">
                          #{item.completionOrder}
                        </span>
                        <span className="font-extrabold text-sm text-brand-navy">
                          {item.fullName}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-600 mt-1">
                        No: {item.studentNumber} · Bitirme:{' '}
                        {formatIstanbulDateTime(item.completedAt)}
                      </div>
                      <div className="text-xs text-slate-700 mt-1">
                        Etkin Süre:{' '}
                        <strong>{formatDurationTr(item.activeSeconds)}</strong>{' '}
                        (Takvim: {formatDurationTr(item.elapsedSeconds)})
                      </div>
                      {item.isEarlyFinisher && (
                        <div
                          className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-brand-purple text-xs font-extrabold border border-purple-200"
                          title={item.earlyFinisherRuleExplanation}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>
                            Ayrılan süreden önce tamamladı (Etkin süre &lt; 10
                            dk)
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailStudentId(item.studentId)}
                      className="text-xs font-extrabold text-brand-purple hover:underline shrink-0"
                    >
                      Detay
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Main Student Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-extrabold text-brand-navy text-base">
              Öğrenci İlerleme ve Ders Yetki Tablosu (
              {studentsQuery.data?.filteredCount ?? 0} /{' '}
              {studentsQuery.data?.totalCount ?? 0})
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              İpucu: "Gösterilen Dersler" sütunundaki ders rozetlerine tıklayarak
              o öğrenci için dersi anında açıp kapatabilirsiniz.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-extrabold">
                  <th className="py-3 px-4">Ad Soyad</th>
                  <th className="py-3 px-3">Öğrenci Numarası</th>
                  <th className="py-3 px-3">
                    Gösterilen Dersler (Tıkla Aç/Kapat)
                  </th>
                  <th className="py-3 px-3">Son Tamamlanan Hafta</th>
                  <th className="py-3 px-3">Son Çalışılan Etkinlik</th>
                  <th className="py-3 px-3">
                    {selectedWeekOrder}. Hafta İlerlemesi
                  </th>
                  <th className="py-3 px-3">
                    Yaklaşık Etkin Süre ({selectedWeekOrder}. Hafta)
                  </th>
                  <th className="py-3 px-3">
                    {selectedWeekOrder}. Hafta Ödev
                  </th>
                  <th className="py-3 px-3">Son Görülme</th>
                  <th className="py-3 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(studentsQuery.data?.students || []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-8 text-center text-slate-500 font-medium"
                    >
                      Filtre kriterlerine uygun öğrenci kaydı bulunamadı.
                    </td>
                  </tr>
                ) : (
                  (studentsQuery.data?.students || []).map((row: any) => {
                    const effectiveList: string[] = Array.isArray(
                      row.effectiveCourses
                    )
                      ? row.effectiveCourses
                      : [];
                    const isRowUpdating = updatingCourseStudentId === row.id;

                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-4 font-extrabold text-brand-navy">
                          <div className="flex items-center gap-2">
                            <span>{row.fullName}</span>
                            {row.isRecentlySeen && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300"
                                title="Son 60 saniyede etkinlik gönderdi"
                              >
                                Aktif
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {row.studentNumber}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {AKADEMI_COURSES_CATALOG.map((cat) => {
                              const active = effectiveList.includes(cat.code);
                              return (
                                <button
                                  key={cat.code}
                                  type="button"
                                  disabled={isRowUpdating}
                                  onClick={() =>
                                    handleQuickToggleStudentCourse(
                                      row,
                                      cat.code
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all ${
                                    active
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400 hover:bg-emerald-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200 line-through'
                                  }`}
                                  title={`${row.fullName} için ${
                                    cat.shortTitle
                                  } dersini ${active ? 'gizle' : 'göster'}`}
                                >
                                  {cat.shortTitle}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {row.lastCompletedWeekOrder
                            ? `${row.lastCompletedWeekOrder}. Hafta`
                            : 'Henüz Yok'}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {row.lastWorkedActivityCode ? (
                            <span>
                              <strong>{row.lastWorkedActivityCode}</strong> ·{' '}
                              {row.lastWorkedActivityTitle}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-brand-navy">
                              {row.selectedWeekProgressText}
                            </span>
                            {renderStatusPill(row.selectedWeekStatus)}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          <div>
                            {formatDurationTr(row.selectedWeekActiveSeconds)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Ödev:{' '}
                            {formatDurationTr(row.totalHomeworkActiveSeconds)} |
                            Tekrar:{' '}
                            {formatDurationTr(row.totalPracticeActiveSeconds)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {renderStatusPill(row.selectedWeekHomeworkStatus)}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600">
                          {formatIstanbulDateTime(row.lastSeenAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setDetailStudentId(row.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-extrabold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detay / Düzenle</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Student Detail & Identity/Course Edit Modal */}
      {detailStudentId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl border-2 border-slate-300 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-brand-navy">
                  Öğrenci Detayı, Ders Yetkileri ve Çalışma Geçmişi
                </h3>
                {studentDetailQuery.data?.student && (
                  <p className="text-sm text-slate-600 font-semibold">
                    {studentDetailQuery.data.student.firstName}{' '}
                    {studentDetailQuery.data.student.lastName} (
                    {studentDetailQuery.data.student.studentNumber})
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDetailStudentId(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {studentDetailQuery.isLoading ? (
              <div className="py-12 text-center text-slate-600 font-bold">
                Öğrenci detayları yükleniyor...
              </div>
            ) : (
              studentDetailQuery.data && (
                <div className="space-y-6">
                  {editForm && (
                    <form
                      onSubmit={handleSaveStudentIdentity}
                      className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-4"
                    >
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-navy">
                        <Edit3 className="w-4 h-4 text-brand-purple" />
                        <span>
                          Öğrenci Bilgileri ve Gösterilecek Dersler (Yalnızca
                          Öğretmen)
                        </span>
                      </div>

                      {editMessage && (
                        <div
                          className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                            editMessage.isError
                              ? 'bg-red-50 text-red-900 border border-red-300'
                              : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{editMessage.text}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Ad
                          </label>
                          <input
                            type="text"
                            required
                            value={editForm.firstName}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                firstName: e.target.value
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Soyad
                          </label>
                          <input
                            type="text"
                            required
                            value={editForm.lastName}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                lastName: e.target.value
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Öğrenci Numarası
                          </label>
                          <input
                            type="text"
                            required
                            value={editForm.studentNumber}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                studentNumber: e.target.value.replace(
                                  /[^0-9]/g,
                                  ''
                                )
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          Bu Öğrenciye Gösterilecek Dersler:
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {AKADEMI_COURSES_CATALOG.map((cat) => {
                            const checked = editForm.effectiveCourses.includes(
                              cat.code
                            );
                            return (
                              <label
                                key={cat.code}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 cursor-pointer text-xs sm:text-sm font-bold transition-all ${
                                  checked
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                                    : 'bg-white border-slate-300 text-slate-600'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    const next = checked
                                      ? editForm.effectiveCourses.filter(
                                          (c) => c !== cat.code
                                        )
                                      : [...editForm.effectiveCourses, cat.code];
                                    setEditForm({
                                      ...editForm,
                                      effectiveCourses: next
                                    });
                                  }}
                                  className="rounded text-brand-purple focus:ring-brand-purple"
                                />
                                <span>{cat.shortTitle}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-purple-800 text-white text-sm font-extrabold"
                        >
                          Bilgileri ve Ders Yetkilerini Kaydet
                        </button>
                      </div>
                    </form>
                  )}

                  {/* 5 Weeks Breakdown */}
                  <div className="space-y-4">
                    {studentDetailQuery.data.weeks.map((w: any) => (
                      <div
                        key={w.id}
                        className="rounded-2xl border border-slate-200 p-4 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-brand-navy text-base">
                              {w.order}. Hafta: {w.title}
                            </span>
                            {renderStatusPill(w.status)}
                          </div>
                          <div className="text-xs font-bold text-slate-600 flex flex-wrap gap-3">
                            <span>
                              Hafta Zorunlu Etkin Süre:{' '}
                              <strong className="text-brand-navy">
                                {formatDurationTr(w.weekRequiredActiveSeconds)}
                              </strong>
                            </span>
                            <span>
                              Ödev Süresi:{' '}
                              <strong>
                                {formatDurationTr(w.weekHomeworkActiveSeconds)}
                              </strong>
                            </span>
                            <span>
                              Tekrar (Practice) Süresi:{' '}
                              <strong>
                                {formatDurationTr(w.weekPracticeActiveSeconds)}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {w.activities.map((act: any) => (
                            <div
                              key={act.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-brand-navy">
                                  {act.code} · {act.title}
                                </span>
                                {renderStatusPill(act.status)}
                              </div>

                              {act.firstAttempt ? (
                                <div className="space-y-1 text-slate-700">
                                  <div>
                                    İlk Başlangıç:{' '}
                                    <strong>
                                      {formatIstanbulDateTime(
                                        act.firstAttempt.startedAt
                                      )}
                                    </strong>
                                  </div>
                                  <div>
                                    İlk Bitiş:{' '}
                                    <strong>
                                      {formatIstanbulDateTime(
                                        act.firstAttempt.completedAt
                                      )}
                                    </strong>
                                  </div>
                                  <div>
                                    Yaklaşık Etkin Süre:{' '}
                                    <strong>
                                      {formatDurationTr(
                                        act.firstAttempt.activeSeconds
                                      )}
                                    </strong>{' '}
                                    | Takvim Süresi:{' '}
                                    <strong>
                                      {formatDurationTr(
                                        act.firstAttempt.elapsedSeconds
                                      )}
                                    </strong>{' '}
                                    | Kontrol Sayısı:{' '}
                                    <strong>
                                      {act.firstAttempt.checkCount}
                                    </strong>
                                  </div>
                                  {act.firstAttempt.isEarlyFinisher && (
                                    <div className="text-brand-purple font-extrabold">
                                      ★ Ayrılan süreden (10 dk) önce tamamladı
                                    </div>
                                  )}
                                  <details className="mt-1">
                                    <summary className="cursor-pointer font-bold text-slate-600 hover:text-brand-navy">
                                      Son Kaydedilen Çalışma Verisini Gör (Rev #
                                      {act.firstAttempt.revision})
                                    </summary>
                                    <pre className="mt-1 p-2 rounded bg-slate-900 text-slate-100 overflow-x-auto text-[11px]">
                                      {JSON.stringify(
                                        act.firstAttempt.state,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  </details>
                                </div>
                              ) : (
                                <div className="text-slate-400">
                                  Henüz başlanmadı.
                                </div>
                              )}

                              {act.practiceAttempts &&
                                act.practiceAttempts.length > 0 && (
                                  <div className="pt-1.5 border-t border-slate-200 text-brand-purple font-semibold">
                                    Tekrar Çalışma (Practice) Sayısı:{' '}
                                    {act.practiceAttempts.length} deneme
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Audit Logs */}
                  {studentDetailQuery.data.auditLogs?.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                        Öğretmen İşlem Kayıtları (Audit Log)
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {studentDetailQuery.data.auditLogs.map((log: any) => (
                          <li key={log.id}>
                            <strong>
                              {formatIstanbulDateTime(log.createdAt)}
                            </strong>{' '}
                            ({log.admin?.username}):{' '}
                            <code>{JSON.stringify(log.oldValue)}</code> →{' '}
                            <code>{JSON.stringify(log.newValue)}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl border-2 border-slate-300 max-w-2xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-extrabold text-brand-navy">
                Öğretmen Yardımı: Ders Görünürlüğü ve Süre Ölçümü
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
              <p>
                <strong>1. Ders Görünürlüğü Yönetimi:</strong> Üstteki panelden
                hangi derslerin yeni katılan öğrencilere varsayılan olarak
                gösterileceğini belirleyebilirsiniz. Ayrıca öğrenci tablosundaki{' '}
                <em>"Gösterilen Dersler"</em> sütunundan veya öğrenci detay
                penceresinden her öğrenci için ayrı ayrı ders açıp
                kapatabilirsiniz.
              </p>
              <p>
                <strong>2. Kimlik ve Katılım Modeli:</strong> Öğrenciler{' '}
                <code>/akademi</code> adresinden Ad, Soyad ve Öğrenci Numarası
                ile giriş yapar. Yanlış yazılan ad veya numaraları öğrenci detay
                penceresinden düzeltebilirsiniz.
              </p>
              <p>
                <strong>3. Yaklaşık Etkin Çalışma Süresi (activeSeconds):</strong>{' '}
                Süre yalnızca öğrenci etkinlikte "Başla" düğmesine bastıktan
                sonra açık ve görünür sekmede çalışırken 20 saniyelik
                heartbeat’lerle sunucu saatine göre ölçülür.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
