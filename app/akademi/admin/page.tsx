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
  Sparkles,
  Network,
  Cpu,
  Code2,
  AlertCircle,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Lock,
  Unlock,
  HelpCircle,
} from 'lucide-react';
import {
  ApiError,
  apiRequest,
  formatDurationTr,
  formatIstanbulDateTime,
} from '@/lib/akademi/apiClient';
import { CustomSelect } from '@/components/akademi/CustomSelect';
import { AKADEMI_COURSES_CATALOG } from '@/lib/akademi/shared';

const COURSE_TABS = [
  { code: 'ag-temelleri', label: 'Ağ Temelleri', Icon: Network },
  { code: 'pc-donanimi', label: 'Bilgisayar Donanımı', Icon: Cpu },
  { code: 'gorsel-programlama', label: 'Görsel Programlama', Icon: Code2 },
];

const cleanCode = (code: string | null | undefined) =>
  code ? code.replace(/^D-/, '') : '';

export default function AkademiAdminPage() {
  const queryClient = useQueryClient();

  const [admin, setAdmin] = useState<{ id: string; username: string } | null>(
    null
  );
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Selected Course & Filters
  const [selectedCourse, setSelectedCourse] = useState<string>('ag-temelleri');
  const [selectedWeekOrder, setSelectedWeekOrder] = useState<number>(1);
  const [selectedActivityCode, setSelectedActivityCode] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTabVisible, setIsTabVisible] = useState<boolean>(
    typeof document !== 'undefined'
      ? document.visibilityState === 'visible'
      : true
  );

  // Student Detail Modal
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);
  const [detailCourseTab, setDetailCourseTab] = useState<string>('ag-temelleri');
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
  const [updatingCourseStudentId, setUpdatingCourseStudentId] = useState<
    string | null
  >(null);
  const [updatingGlobalCourseCode, setUpdatingGlobalCourseCode] = useState<
    string | null
  >(null);
  const [unlockingWeek, setUnlockingWeek] = useState<boolean>(false);
  const [deletingStudent, setDeletingStudent] = useState<boolean>(false);
  const [resolvingHelpId, setResolvingHelpId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

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
        body: JSON.stringify({ username, password }),
      });
      setAdmin(res.admin);
    } catch (err) {
      setLoginError(
        err instanceof ApiError ? err.message : 'Giriş yapılamadı.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const summaryQuery = useQuery({
    queryKey: [
      'admin-summary',
      selectedCourse,
      selectedWeekOrder,
      selectedActivityCode,
    ],
    queryFn: () => {
      const params = new URLSearchParams({
        course: selectedCourse,
        weekOrder: String(selectedWeekOrder),
      });
      if (selectedActivityCode) {
        params.set('activityCode', selectedActivityCode);
      }
      return apiRequest<any>(`/api/akademi/admin/summary?${params.toString()}`);
    },
    enabled: Boolean(admin),
    refetchInterval: isTabVisible ? 15000 : false,
    refetchIntervalInBackground: false,
  });

  const studentsQuery = useQuery({
    queryKey: [
      'admin-students',
      selectedCourse,
      selectedWeekOrder,
      selectedActivityCode,
      statusFilter,
      searchQuery,
    ],
    queryFn: () => {
      const params = new URLSearchParams({
        course: selectedCourse,
        weekOrder: String(selectedWeekOrder),
        status: statusFilter,
        search: searchQuery,
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
    refetchIntervalInBackground: false,
  });

  const studentDetailQuery = useQuery({
    queryKey: ['admin-student-detail', detailStudentId],
    queryFn: () =>
      apiRequest<any>(`/api/akademi/admin/students/${detailStudentId}`),
    enabled: Boolean(admin && detailStudentId),
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
          : ['ag-temelleri'],
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
          applyToAllStudents: true,
        }),
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
          allowedCourses: nextCourses,
        }),
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
            allowedCourses: editForm.effectiveCourses,
          }),
        }
      );
      setEditMessage({ isError: false, text: res.message });
      studentDetailQuery.refetch();
      studentsQuery.refetch();
      summaryQuery.refetch();
    } catch (err) {
      setEditMessage({
        isError: true,
        text: err instanceof ApiError ? err.message : 'Güncellenemedi.',
      });
    }
  };

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  const handleDeleteStudent = async (studentId: string, fullName: string) => {
    const ok = window.confirm(
      `"${fullName}" kaydını ve tüm ilerleme verilerini kalıcı olarak silmek istediğinize emin misiniz?`
    );
    if (!ok) return;

    setDeletingStudent(true);
    try {
      const res = await apiRequest<{ message: string }>(
        `/api/akademi/admin/students/${studentId}`,
        { method: 'DELETE' }
      );
      setDetailStudentId(null);
      await summaryQuery.refetch();
      await studentsQuery.refetch();
      showToast(res.message);
    } catch (err) {
      setEditMessage({
        isError: true,
        text: err instanceof ApiError ? err.message : 'Öğrenci silinemedi.',
      });
    } finally {
      setDeletingStudent(false);
    }
  };

  const handleToggleWeekLockForAll = async (
    weekOrder: number,
    action: 'unlock' | 'lock'
  ) => {
    const courseLabel =
      COURSE_TABS.find((c) => c.code === selectedCourse)?.label ||
      selectedCourse;
    const actionText = action === 'lock' ? 'kilitlemek' : 'açmak';
    const ok = window.confirm(
      `${courseLabel} dersi ${weekOrder}. haftasını ${actionText} istediğinize emin misiniz?`
    );
    if (!ok) return;

    setUnlockingWeek(true);
    try {
      const res = await apiRequest<{ message: string }>(
        '/api/akademi/admin/weeks/unlock',
        {
          method: 'POST',
          body: JSON.stringify({
            courseCode: selectedCourse,
            weekOrder,
            action,
            applyToAll: true,
          }),
        }
      );
      await summaryQuery.refetch();
      await studentsQuery.refetch();
      showToast(res.message);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Hafta kilidi güncellenemedi.'
      );
    } finally {
      setUnlockingWeek(false);
    }
  };

  const handleToggleWeekLockForStudent = async (
    studentId: string,
    courseCode: string,
    weekOrder: number,
    action: 'unlock' | 'lock'
  ) => {
    setUnlockingWeek(true);
    try {
      const res = await apiRequest<{ message: string }>(
        '/api/akademi/admin/weeks/unlock',
        {
          method: 'POST',
          body: JSON.stringify({
            courseCode,
            weekOrder,
            action,
            studentId,
          }),
        }
      );
      await studentDetailQuery.refetch();
      await studentsQuery.refetch();
      await summaryQuery.refetch();
      showToast(res.message);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Hafta kilidi güncellenemedi.'
      );
    } finally {
      setUnlockingWeek(false);
    }
  };

  const handleResolveHelpRequest = async (id: string) => {
    setResolvingHelpId(id);
    try {
      await apiRequest('/api/akademi/admin/help', {
        method: 'PATCH',
        body: JSON.stringify({ id }),
      });
      await summaryQuery.refetch();
    } catch {
      // ignore
    } finally {
      setResolvingHelpId(null);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple mb-2" />
        <p className="text-sm font-bold text-brand-navy">Yükleniyor...</p>
      </div>
    );
  }

  // LOGIN VIEW
  if (!admin) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between">
        <header className="bg-brand-navy text-white border-b-4 border-brand-orange py-3.5 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-orange text-brand-navy flex items-center justify-center font-extrabold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-base sm:text-lg font-extrabold">
                Halimaslyk Akademi · Öğretmen Paneli
              </h1>
            </div>
            <Link
              href="/akademi"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-brand-orange"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Akademi</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
            <h2 className="text-xl font-extrabold text-brand-navy mb-4">
              Öğretmen Girişi
            </h2>

            {loginError && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="admin_username"
                  className="block text-xs font-bold text-slate-700 mb-1"
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
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-brand-purple focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="admin_password"
                  className="block text-xs font-bold text-slate-700 mb-1"
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
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-brand-purple focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white font-extrabold text-sm shadow-sm disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Giriş Yapılıyor...</span>
                  </>
                ) : (
                  <span>Giriş Yap</span>
                )}
              </button>
            </form>
          </div>
        </main>
        <div />
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>Tamamlandı</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900">
            Devam Ediyor
          </span>
        );
      case 'LOCKED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-200 text-slate-600">
            Kilitli
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
            Başlamadı
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Compact Header */}
      <header className="bg-brand-navy text-white border-b-4 border-brand-orange shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/akademi"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4 text-brand-orange" />
              <span>Akademi</span>
            </Link>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
              Öğretmen Paneli
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              title="Verileri Yenile"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  summaryQuery.isFetching ? 'animate-spin' : ''
                }`}
              />
              <span>Yenile</span>
            </button>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-600 text-white text-xs font-bold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-4 py-5 space-y-4 flex-1">
        {actionToast && (
          <div className="bg-emerald-50 border border-emerald-400 text-emerald-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between">
            <span>{actionToast}</span>
            <button
              type="button"
              onClick={() => setActionToast(null)}
              className="text-emerald-700 hover:text-emerald-950"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Open Help Requests Banner (only shown when students ask for help) */}
        {Array.isArray(summaryQuery.data?.helpRequests) &&
          summaryQuery.data.helpRequests.length > 0 && (
            <section className="bg-amber-50 rounded-2xl border-2 border-amber-400 p-4 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-amber-950 font-extrabold text-sm">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>
                  Yardım İstekleri ({summaryQuery.data.helpRequests.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {summaryQuery.data.helpRequests.map((hr: any) => (
                  <div
                    key={hr.id}
                    className="bg-white rounded-xl border border-amber-200 p-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-brand-navy truncate">
                        {hr.studentName}{' '}
                        <span className="font-mono text-slate-500">
                          ({hr.studentNumber})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-700 mt-0.5 truncate">
                        <strong>{hr.activityCode}</strong> · {hr.activityTitle}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={resolvingHelpId === hr.id}
                      onClick={() => handleResolveHelpRequest(hr.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 disabled:opacity-50"
                    >
                      Çözüldü
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Top Bar: Course Switcher + Compact Global Visibility Toggles */}
        <section className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          {/* Course Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">
              İncelenen Ders:
            </span>
            {COURSE_TABS.map((tab) => {
              const IconComp = tab.Icon;
              const isSelected = selectedCourse === tab.code;
              const courseInfo = courseSettings.find(
                (c: any) => c.code === tab.code
              );
              const isReady = courseInfo ? courseInfo.isReady : tab.code !== 'gorsel-programlama';

              return (
                <button
                  key={tab.code}
                  type="button"
                  disabled={!isReady}
                  onClick={() => {
                    setSelectedCourse(tab.code);
                    setSelectedWeekOrder(1);
                    setSelectedActivityCode('');
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition ${
                    isSelected
                      ? 'bg-brand-navy text-white shadow-sm'
                      : isReady
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <IconComp
                    className={`w-4 h-4 ${
                      isSelected ? 'text-brand-orange' : ''
                    }`}
                  />
                  <span>{tab.label}</span>
                  {!isReady && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                      Yakında
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Global Default Course Visibility Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Genel Görünürlük:
            </span>
            {courseSettings.map((course: any) => {
              const isVisible = Boolean(course.defaultVisible);
              const isBusy = updatingGlobalCourseCode === course.code;

              return (
                <button
                  key={course.code}
                  type="button"
                  disabled={isBusy}
                  onClick={() =>
                    handleToggleGlobalCourse(course.code, isVisible)
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    isVisible
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 hover:bg-emerald-100'
                      : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Tüm öğrenciler için varsayılan görünürlüğü aç/kapat"
                >
                  {isBusy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isVisible ? (
                    <ToggleRight className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{course.shortTitle || course.title}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      isVisible
                        ? 'bg-emerald-200/80 text-emerald-950'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isVisible ? 'Açık' : 'Gizli'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4 Compact Stat Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500">
                Kayıtlı Öğrenci
              </div>
              <div className="text-2xl font-extrabold text-brand-navy mt-0.5">
                {summaryQuery.data?.metrics?.totalStudents ?? 0}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-brand-navy flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-700">
                Şu An Aktif
              </div>
              <div className="text-2xl font-extrabold text-emerald-800 mt-0.5">
                {summaryQuery.data?.metrics?.recentlySeenCount ?? 0}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-brand-purple">
                {selectedWeekOrder}. Haftayı Bitiren
              </div>
              <div className="text-2xl font-extrabold text-brand-navy mt-0.5">
                {summaryQuery.data?.metrics?.selectedWeekCompletedCount ?? 0}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-700">
                {selectedWeekOrder}. Haftada Çalışan
              </div>
              <div className="text-2xl font-extrabold text-amber-800 mt-0.5">
                {summaryQuery.data?.metrics?.selectedWeekInProgressCount ?? 0}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Single-Row Filters & CSV Export Bar */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Hafta
              </label>
              <CustomSelect
                id="filter_week"
                value={String(selectedWeekOrder)}
                options={[1, 2, 3, 4, 5].map((order) => {
                  const w = weeksCatalog.find((x: any) => x.order === order);
                  return {
                    value: String(order),
                    badge: `Hafta ${order}`,
                    label: w ? w.title : `${order}. Hafta`,
                  };
                })}
                onChange={(val) => {
                  setSelectedWeekOrder(Number(val));
                  setSelectedActivityCode('');
                }}
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Etkinlik
              </label>
              <CustomSelect
                id="filter_activity"
                value={selectedActivityCode}
                placeholder="Tüm Hafta"
                allowClear={true}
                options={[
                  { value: '', label: 'Tüm Hafta' },
                  ...activitiesInSelectedWeek.map((act: any) => ({
                    value: act.code,
                    badge: cleanCode(act.code),
                    label: act.title,
                  })),
                ]}
                onChange={(val) => setSelectedActivityCode(val)}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Durum
              </label>
              <CustomSelect
                id="filter_status"
                value={statusFilter}
                options={[
                  { value: 'ALL', label: 'Tümü' },
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
                          label: 'Erken Bitiren',
                        },
                      ]
                    : []),
                ]}
                onChange={(val) => setStatusFilter(val)}
              />
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="filter_search"
                className="block text-xs font-bold text-slate-600 mb-1"
              >
                Öğrenci Ara
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="filter_search"
                  type="text"
                  placeholder="Ad veya numara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-sm font-semibold text-slate-900 focus:border-brand-purple focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="lg:col-span-2 flex items-center justify-end gap-2">
              <a
                href={`/api/akademi/admin/export?course=${encodeURIComponent(
                  selectedCourse
                )}&weekOrder=${selectedWeekOrder}${
                  selectedActivityCode
                    ? `&activityCode=${encodeURIComponent(
                        selectedActivityCode
                      )}`
                    : ''
                }`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white text-xs sm:text-sm font-extrabold"
              >
                <Download className="w-4 h-4" />
                <span>CSV İndir</span>
              </a>
            </div>
          </div>

          {/* Always-visible 5-Week Admin Lock / Unlock Strip */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Hafta Kilitleri ({COURSE_TABS.find((c) => c.code === selectedCourse)?.label}):
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((order) => {
                const w = weeksCatalog.find((x: any) => x.order === order);
                const isOpen = order === 1 ? true : Boolean(w?.isAdminUnlocked);
                return (
                  <button
                    key={order}
                    type="button"
                    disabled={unlockingWeek || order === 1}
                    onClick={() =>
                      handleToggleWeekLockForAll(
                        order,
                        isOpen ? 'lock' : 'unlock'
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold border transition ${
                      order === 1
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 cursor-default'
                        : isOpen
                        ? 'bg-emerald-100 hover:bg-emerald-200 border-emerald-400 text-emerald-950'
                        : 'bg-slate-100 hover:bg-amber-100 border-slate-300 text-slate-700 hover:text-amber-950'
                    }`}
                    title={
                      order === 1
                        ? '1. Hafta her zaman açıktır'
                        : isOpen
                        ? `${order}. Haftayı tekrar kilitle`
                        : `${order}. Haftanın kilidini aç (önceki haftayı bitirenler girebilir)`
                    }
                  >
                    {isOpen ? (
                      <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{order}. Hafta</span>
                    <span className="text-[10px] opacity-80">
                      {isOpen ? 'Açık' : 'Kilitli'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Activity Completion Ranking (Only when an activity is selected) */}
        {selectedActivityCode && summaryQuery.data?.activityCompletions && (
          <section className="bg-white rounded-2xl border border-purple-200 p-4 shadow-sm">
            <h2 className="text-sm font-extrabold text-brand-navy flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-purple" />
              <span>
                {cleanCode(selectedActivityCode)} Tamamlama Sıralaması (
                {summaryQuery.data.activityCompletions.length} Öğrenci)
              </span>
            </h2>

            {summaryQuery.data.activityCompletions.length === 0 ? (
              <p className="text-xs text-slate-500">
                Henüz tamamlayan öğrenci yok.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {summaryQuery.data.activityCompletions.map((item: any) => (
                  <div
                    key={item.studentId}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-brand-navy text-brand-orange font-extrabold text-[11px] flex items-center justify-center shrink-0">
                          {item.completionOrder}
                        </span>
                        <span className="font-bold text-xs text-brand-navy truncate">
                          {item.fullName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        Süre: <strong>{formatDurationTr(item.activeSeconds)}</strong>
                        {item.isEarlyFinisher && (
                          <span className="ml-1.5 text-brand-purple font-bold">
                            ★ Erken
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailCourseTab(selectedCourse);
                        setDetailStudentId(item.studentId);
                      }}
                      className="text-xs font-bold text-brand-purple hover:underline shrink-0"
                    >
                      Detay
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Clean Student Progress Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-extrabold text-brand-navy text-sm">
              Öğrenci Listesi ({studentsQuery.data?.filteredCount ?? 0})
            </h2>
            <span className="text-xs text-slate-500">
              Ders rozetlerine tıklayarak öğrenci yetkisini değiştirebilirsiniz
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold text-xs">
                  <th className="py-2.5 px-4">Öğrenci</th>
                  <th className="py-2.5 px-3">Numara</th>
                  <th className="py-2.5 px-3">Açık Dersler</th>
                  <th className="py-2.5 px-3">
                    {selectedWeekOrder}. Hafta ({COURSE_TABS.find((c) => c.code === selectedCourse)?.label})
                  </th>
                  <th className="py-2.5 px-3">Ödev</th>
                  <th className="py-2.5 px-3">Etkin Süre</th>
                  <th className="py-2.5 px-3">Son Etkinlik</th>
                  <th className="py-2.5 px-3">Son Görülme</th>
                  <th className="py-2.5 px-4 text-right">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(studentsQuery.data?.students || []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-8 text-center text-slate-500 font-medium"
                    >
                      Öğrenci kaydı bulunamadı.
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
                        <td className="py-2.5 px-4 font-bold text-brand-navy">
                          <div className="flex items-center gap-2">
                            <span>{row.fullName}</span>
                            {row.isRecentlySeen && (
                              <span
                                className="w-2 h-2 rounded-full bg-emerald-500 inline-block"
                                title="Şu an aktif"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                          {row.studentNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap items-center gap-1">
                            {AKADEMI_COURSES_CATALOG.map((cat) => {
                              const active = effectiveList.includes(cat.code);
                              const shortLabel =
                                cat.code === 'ag-temelleri'
                                  ? 'Ağ'
                                  : cat.code === 'pc-donanimi'
                                  ? 'Donanım'
                                  : 'Görsel';
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
                                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition ${
                                    active
                                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200 line-through'
                                  }`}
                                >
                                  {shortLabel}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-brand-navy text-xs">
                              {row.selectedWeekProgressText}
                            </span>
                            {renderStatusPill(row.selectedWeekStatus)}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {renderStatusPill(row.selectedWeekHomeworkStatus)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700 text-xs">
                          {formatDurationTr(row.selectedWeekActiveSeconds)}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-600">
                          {row.lastWorkedActivityCode ? (
                            <span>
                              <strong className="text-slate-800">
                                {cleanCode(row.lastWorkedActivityCode)}
                              </strong>{' '}
                              · {row.lastWorkedActivityTitle}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-500">
                          {formatIstanbulDateTime(row.lastSeenAt)}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setDetailCourseTab(selectedCourse);
                              setDetailStudentId(row.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-navy hover:text-white text-slate-800 text-xs font-bold transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>İncele</span>
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

      {/* Student Detail Modal */}
      {detailStudentId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-300 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-brand-navy">
                  {studentDetailQuery.data?.student
                    ? `${studentDetailQuery.data.student.firstName} ${studentDetailQuery.data.student.lastName} (${studentDetailQuery.data.student.studentNumber})`
                    : 'Öğrenci Detayı'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailStudentId(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {studentDetailQuery.isLoading ? (
              <div className="py-10 text-center text-slate-600 font-bold text-sm">
                Yükleniyor...
              </div>
            ) : (
              studentDetailQuery.data && (
                <div className="space-y-5">
                  {/* Compact Identity & Course Access Form */}
                  {editForm && (
                    <form
                      onSubmit={handleSaveStudentIdentity}
                      className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-brand-purple" />
                          <span>Öğrenci Bilgileri ve Ders Yetkisi</span>
                        </span>
                        {editMessage && (
                          <span
                            className={`text-xs font-bold ${
                              editMessage.isError
                                ? 'text-red-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {editMessage.text}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          type="text"
                          required
                          placeholder="Ad"
                          value={editForm.firstName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              firstName: e.target.value,
                            })
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Soyad"
                          value={editForm.lastName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              lastName: e.target.value,
                            })
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Öğrenci No"
                          value={editForm.studentNumber}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              studentNumber: e.target.value.replace(
                                /[^0-9]/g,
                                ''
                              ),
                            })
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-mono font-bold"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex flex-wrap gap-2">
                          {AKADEMI_COURSES_CATALOG.map((cat) => {
                            const checked = editForm.effectiveCourses.includes(
                              cat.code
                            );
                            return (
                              <label
                                key={cat.code}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-xs font-bold ${
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
                                      : [
                                          ...editForm.effectiveCourses,
                                          cat.code,
                                        ];
                                    setEditForm({
                                      ...editForm,
                                      effectiveCourses: next,
                                    });
                                  }}
                                />
                                <span>{cat.shortTitle}</span>
                              </label>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={deletingStudent}
                            onClick={() =>
                              handleDeleteStudent(
                                detailStudentId,
                                `${editForm.firstName} ${editForm.lastName}`
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 text-xs font-extrabold transition disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Öğrenciyi Sil</span>
                          </button>

                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-extrabold"
                          >
                            Kaydet
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Course Tab Selector inside Modal */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    {COURSE_TABS.filter(
                      (t) => t.code !== 'gorsel-programlama'
                    ).map((tab) => {
                      const active = detailCourseTab === tab.code;
                      return (
                        <button
                          key={tab.code}
                          type="button"
                          onClick={() => setDetailCourseTab(tab.code)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                            active
                              ? 'bg-brand-navy text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {tab.label} İlerlemesi
                        </button>
                      );
                    })}
                  </div>

                  {/* Weeks Breakdown for Selected Course in Modal */}
                  <div className="space-y-3">
                    {studentDetailQuery.data.weeks
                      .filter(
                        (w: any) =>
                          (w.courseCode || 'ag-temelleri') === detailCourseTab
                      )
                      .map((w: any) => (
                        <div
                          key={w.id}
                          className="rounded-xl border border-slate-200 p-3.5 space-y-2.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-brand-navy text-sm">
                                {w.order}. Hafta: {w.title}
                              </span>
                              {renderStatusPill(w.status)}
                              {w.order > 1 && w.status === 'LOCKED' && (
                                <button
                                  type="button"
                                  disabled={unlockingWeek}
                                  onClick={() =>
                                    handleToggleWeekLockForStudent(
                                      detailStudentId,
                                      detailCourseTab,
                                      w.order,
                                      'unlock'
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-[11px] font-bold transition"
                                >
                                  <Unlock className="w-3 h-3" />
                                  <span>Kilidi Aç</span>
                                </button>
                              )}
                              {w.order > 1 && w.status !== 'LOCKED' && (
                                <button
                                  type="button"
                                  disabled={unlockingWeek}
                                  onClick={() =>
                                    handleToggleWeekLockForStudent(
                                      detailStudentId,
                                      detailCourseTab,
                                      w.order,
                                      'lock'
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold transition"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Kilitle</span>
                                </button>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-slate-600 flex gap-3">
                              <span>
                                Süre:{' '}
                                <strong>
                                  {formatDurationTr(
                                    w.weekRequiredActiveSeconds
                                  )}
                                </strong>
                              </span>
                              <span>
                                Ödev:{' '}
                                <strong>
                                  {formatDurationTr(
                                    w.weekHomeworkActiveSeconds
                                  )}
                                </strong>
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {w.activities.map((act: any) => (
                              <div
                                key={act.id}
                                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-brand-navy truncate">
                                    {cleanCode(act.code)} · {act.title}
                                  </span>
                                  {renderStatusPill(act.status)}
                                </div>

                                {act.firstAttempt ? (
                                  <div className="text-slate-600 flex flex-wrap items-center justify-between gap-2 pt-0.5">
                                    <span>
                                      Etkin:{' '}
                                      <strong>
                                        {formatDurationTr(
                                          act.firstAttempt.activeSeconds
                                        )}
                                      </strong>{' '}
                                      · Kontrol:{' '}
                                      <strong>
                                        {act.firstAttempt.checkCount}
                                      </strong>
                                    </span>
                                    <span>
                                      {formatIstanbulDateTime(
                                        act.firstAttempt.completedAt ||
                                          act.firstAttempt.startedAt
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-slate-400">
                                    Henüz başlanmadı
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
