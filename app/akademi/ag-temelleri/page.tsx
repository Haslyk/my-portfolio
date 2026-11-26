"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Lock,
  CheckCircle2,
  PlayCircle,
  CircleDot,
  Clock,
  Target,
  BookOpen,
  ClipboardCheck,
  Wrench,
  RotateCcw,
  AlertCircle,
  Loader2,
  Award,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import {
  StudentHeader,
  SaveIndicatorState
} from '@/components/akademi/StudentHeader';
import { WeekAnimationCard } from '@/components/akademi/WeekAnimationCard';
import {
  ActiveAttemptSession,
  ActivityEngine
} from '@/components/akademi/ActivityEngine';
import {
  ApiError,
  apiRequest,
  clearAllClientDraftsAndCache,
  formatDurationTr
} from '@/lib/akademi/apiClient';

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  visibleCourses: string[];
}

export default function AgTemelleriCoursePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedWeekOrder, setSelectedWeekOrder] = useState<number>(1);
  const [saveState, setSaveState] = useState<SaveIndicatorState>('SAVED');
  const [activeSession, setActiveSession] =
    useState<ActiveAttemptSession | null>(null);
  const [startingActivityId, setStartingActivityId] = useState<string | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function verifyStudent() {
      try {
        const res = await apiRequest<{ student: StudentInfo }>(
          '/api/akademi/student/me'
        );
        if (mounted) {
          setStudent(res.student);
        }
      } catch {
        if (mounted) {
          router.replace('/akademi');
        }
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    }
    verifyStudent();
    return () => {
      mounted = false;
    };
  }, [router]);

  const isCourseAllowed = Boolean(
    student?.visibleCourses?.includes('ag-temelleri')
  );

  const weeksQuery = useQuery({
    queryKey: ['weeks-list'],
    queryFn: () => apiRequest<{ weeks: any[] }>('/api/akademi/weeks'),
    enabled: Boolean(student && isCourseAllowed)
  });

  const weekDetailQuery = useQuery({
    queryKey: ['week-detail', selectedWeekOrder],
    queryFn: () =>
      apiRequest<{ week: any }>(`/api/akademi/weeks/${selectedWeekOrder}`),
    retry: false,
    enabled: Boolean(student && isCourseAllowed)
  });

  const handleSelectWeekTab = (order: number) => {
    setActionError(null);
    setActiveSession(null);
    setSelectedWeekOrder(order);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/akademi/student/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clearAllClientDraftsAndCache();
      queryClient.clear();
      router.replace('/akademi');
    }
  };

  const handleStartOrResume = async (act: any) => {
    setActionError(null);
    setStartingActivityId(act.id);
    try {
      const res = await apiRequest<{
        attempt: any;
        leaseToken: string;
      }>(`/api/akademi/activities/${act.id}/start`, {
        method: 'POST'
      });

      setActiveSession({
        attemptId: res.attempt.id,
        activityId: act.id,
        activityCode: act.code,
        title: act.title,
        shortPurpose: act.shortPurpose,
        category: act.category,
        required: act.required,
        expectedSeconds: act.expectedSeconds,
        allocatedSeconds: act.allocatedSeconds,
        mode: 'NORMAL',
        status: res.attempt.status,
        initialState: res.attempt.state || {},
        initialRevision: res.attempt.revision || 1,
        initialActiveSeconds: res.attempt.activeSeconds || 0,
        leaseToken: res.leaseToken,
        config: act.config
      });
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : 'Etkinlik başlatılamadı. Lütfen bağlantınızı kontrol edin.'
      );
    } finally {
      setStartingActivityId(null);
    }
  };

  const handleStartPractice = async (act: any) => {
    setActionError(null);
    setStartingActivityId(act.id);
    try {
      const res = await apiRequest<{
        attempt: any;
        leaseToken: string;
      }>(`/api/akademi/activities/${act.id}/practice`, {
        method: 'POST',
        body: JSON.stringify({ forceNew: true })
      });

      setActiveSession({
        attemptId: res.attempt.id,
        activityId: act.id,
        activityCode: act.code,
        title: act.title,
        shortPurpose: act.shortPurpose,
        category: act.category,
        required: act.required,
        expectedSeconds: act.expectedSeconds,
        allocatedSeconds: act.allocatedSeconds,
        mode: 'PRACTICE',
        status: res.attempt.status,
        initialState: res.attempt.state || {},
        initialRevision: res.attempt.revision || 1,
        initialActiveSeconds: res.attempt.activeSeconds || 0,
        leaseToken: res.leaseToken,
        config: act.config
      });
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : 'Tekrar çalış modu başlatılamadı.'
      );
    } finally {
      setStartingActivityId(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'LOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-200 text-slate-700">
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Kilitli</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2
              className="w-3.5 h-3.5 text-emerald-700"
              aria-hidden="true"
            />
            <span>Tamamlandı</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            <PlayCircle
              className="w-3.5 h-3.5 text-amber-700"
              aria-hidden="true"
            />
            <span>Devam ediyor</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-900 border border-blue-200">
            <CircleDot
              className="w-3.5 h-3.5 text-blue-700"
              aria-hidden="true"
            />
            <span>Başlamadı</span>
          </span>
        );
    }
  };

  if (checkingAuth || !student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-purple mb-3" />
        <p className="text-base font-extrabold text-brand-navy">
          Ağ Atölyem yükleniyor...
        </p>
      </div>
    );
  }

  if (!isCourseAllowed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-md space-y-4">
          <Lock className="w-12 h-12 text-amber-600 mx-auto" />
          <h1 className="text-xl font-extrabold text-brand-navy">
            Bu Derse Erişim Yetkiniz Kapalı
          </h1>
          <p className="text-sm text-slate-600">
            Ağ Temelleri dersi şu anda hesabınız için aktif görünmüyor. Ders
            seçim ekranına dönebilir veya ders öğretmeninizle iletişime
            geçebilirsiniz.
          </p>
          <button
            type="button"
            onClick={() => router.push('/akademi')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-navy text-white text-sm font-extrabold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ders Seçimine Dön</span>
          </button>
        </div>
      </div>
    );
  }

  const weeksList = weeksQuery.data?.weeks || [];
  const completedWeeksCount = weeksList.filter(
    (w: any) => w.status === 'COMPLETED'
  ).length;
  const rankTitles = [
    'Çırak Ağ Gözlemcisi (Seviye 1)',
    'Kablo & Topoloji Ustası (Seviye 2)',
    'Paket & Protokol İzleyici (Seviye 3)',
    'IP & ARP Dedektifi (Seviye 4)',
    'Kıdemli Ağ Teknisyeni (Seviye 5)',
    'Ağ Atölyesi Baş Mimarı (Mezun!)'
  ];
  const currentRankTitle =
    rankTitles[Math.min(completedWeeksCount, rankTitles.length - 1)];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <StudentHeader
        studentName={`${student.firstName} ${student.lastName}`}
        studentNumber={student.studentNumber}
        saveState={saveState}
        onLogout={handleLogout}
      />

      {/* Horizontal Scrollable 5-Week Tabs Bar */}
      <nav
        aria-label="Haftalar"
        className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10"
      >
        <div className="max-w-6xl mx-auto px-4 py-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2.5 min-w-max">
            {weeksList.map((w: any) => {
              const isSelected = w.order === selectedWeekOrder;
              const isLocked = w.status === 'LOCKED';

              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleSelectWeekTab(w.order)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                      : isLocked
                      ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/70'
                      : 'bg-white text-brand-navy border-slate-300 hover:border-brand-purple'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg font-extrabold text-sm flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-brand-orange text-brand-navy'
                        : isLocked
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-slate-100 text-brand-navy'
                    }`}
                  >
                    {w.order}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wider opacity-80">
                      {w.order}. Hafta
                    </div>
                    <div className="text-xs sm:text-sm font-bold line-clamp-1 max-w-[180px]">
                      {w.title}
                    </div>
                  </div>
                  <div className="ml-1">{renderStatusBadge(w.status)}</div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Workspace Container */}
      <main className="max-w-6xl w-full mx-auto px-4 py-6 flex-1">
        {actionError && (
          <div
            role="alert"
            className="mb-6 bg-red-50 border-2 border-red-400 text-red-950 rounded-2xl p-4 flex items-start gap-3 text-sm font-semibold"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}

        {activeSession ? (
          <ActivityEngine
            studentId={student.id}
            session={activeSession}
            onSaveStateChange={setSaveState}
            onBackToWeek={() => {
              setActiveSession(null);
              weeksQuery.refetch();
              weekDetailQuery.refetch();
            }}
            onActivityCompleted={() => {
              weeksQuery.refetch();
              weekDetailQuery.refetch();
            }}
          />
        ) : weekDetailQuery.isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-purple mx-auto mb-3" />
            <p className="text-base font-bold text-brand-navy">
              Hafta içeriği yükleniyor...
            </p>
          </div>
        ) : weekDetailQuery.isError ? (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 sm:p-10 text-center max-w-2xl mx-auto my-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-brand-navy flex items-center justify-center mx-auto mb-4 border border-slate-300">
              <Lock className="w-8 h-8" aria-hidden="true" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy mb-2">
              {selectedWeekOrder}. Hafta Henüz Kilitli
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium mb-6">
              {weekDetailQuery.error instanceof ApiError
                ? weekDetailQuery.error.message
                : 'Bu haftaya geçebilmek için önce bir önceki haftanın iki zorunlu etkinliğini ve 3 soruluk değerlendirmesini tamamlamalısın.'}
            </p>
            <button
              type="button"
              onClick={() => {
                const firstOpen =
                  weeksList.find(
                    (w: any) =>
                      w.status === 'IN_PROGRESS' || w.status === 'NOT_STARTED'
                  )?.order || 1;
                handleSelectWeekTab(firstOpen);
              }}
              className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orangeDark text-brand-navy font-extrabold text-sm sm:text-base shadow-sm"
            >
              Açık Haftaya Git
            </button>
          </div>
        ) : (
          weekDetailQuery.data?.week && (
            <div className="space-y-6">
              {/* Week Overview Banner & Learning Objectives */}
              <section className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm">
                <div className="mb-5 bg-gradient-to-r from-brand-navy via-brand-navyLight to-brand-purple text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border-b-4 border-brand-orange">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-orange text-brand-navy flex items-center justify-center font-extrabold shadow-sm">
                      <Award className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Atölye Rütben</span>
                      </div>
                      <div className="text-base sm:text-lg font-extrabold">
                        {currentRankTitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-200">
                        Genel Atölye İlerlemesi
                      </div>
                      <div className="text-sm font-extrabold text-brand-orange">
                        {completedWeeksCount} / 5 Hafta Tamamlandı
                      </div>
                    </div>
                    <div className="w-28 sm:w-36 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-600">
                      <div
                        className="h-full bg-brand-orange transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            8,
                            Math.round((completedWeeksCount / 5) * 100)
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="px-3 py-1 rounded-full bg-brand-navy text-brand-orange text-xs font-extrabold uppercase tracking-wider">
                        {weekDetailQuery.data.week.order}. Hafta
                      </span>
                      {renderStatusBadge(weekDetailQuery.data.week.status)}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
                      {weekDetailQuery.data.week.title}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
                      {weekDetailQuery.data.week.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-purple mb-2.5">
                    <Target className="w-4 h-4" aria-hidden="true" />
                    <span>Bu Haftanın Öğrenme Hedefleri</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weekDetailQuery.data.week.learningObjectives.map(
                      (obj: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200 text-sm text-slate-800 font-semibold"
                        >
                          <span className="w-6 h-6 rounded-lg bg-brand-orange/20 text-brand-navy font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{obj}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </section>

              {weekDetailQuery.data.week.animation && (
                <WeekAnimationCard
                  animation={weekDetailQuery.data.week.animation}
                />
              )}

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-extrabold text-brand-navy flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-brand-purple" />
                    <span>Zorunlu Etkinlikler ve Hafta Değerlendirmesi</span>
                  </h2>
                  <span className="text-xs sm:text-sm font-bold text-slate-600">
                    Sonraki haftayı açmak için 2 etkinlik + 1 değerlendirme
                    tamamlanmalıdır
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {weekDetailQuery.data.week.activities
                    .filter((a: any) => a.required)
                    .map((act: any) => {
                      const isQuiz = act.category === 'QUIZ';
                      const isDone = act.status === 'COMPLETED';
                      const isInProgress = act.status === 'IN_PROGRESS';
                      const isBusy = startingActivityId === act.id;

                      return (
                        <div
                          key={act.id}
                          className={`bg-white rounded-2xl border-2 p-5 flex flex-col justify-between shadow-sm transition-all ${
                            isDone
                              ? 'border-emerald-500/80'
                              : isInProgress
                              ? 'border-brand-orange'
                              : 'border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                                  isQuiz
                                    ? 'bg-purple-100 text-brand-purple'
                                    : 'bg-brand-navy text-white'
                                }`}
                              >
                                {isQuiz ? (
                                  <ClipboardCheck className="w-3.5 h-3.5" />
                                ) : (
                                  <Wrench className="w-3.5 h-3.5" />
                                )}
                                <span>
                                  {act.code} ·{' '}
                                  {isQuiz ? 'Değerlendirme' : 'Zorunlu Etkinlik'}
                                </span>
                              </span>
                              {renderStatusBadge(act.status)}
                            </div>

                            <h3 className="text-lg font-extrabold text-brand-navy mb-1.5 flex flex-wrap items-center gap-2">
                              <span>{act.title}</span>
                              {(act as any).difficulty && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    (act as any).difficulty === 'Kolay'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : (act as any).difficulty === 'Orta'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {(act as any).difficulty}
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-slate-600 font-medium mb-4">
                              {act.shortPurpose}
                            </p>

                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs text-slate-700 space-y-1 mb-4 font-semibold">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  Tahmini Çalışma:
                                </span>
                                <strong>
                                  {Math.round(act.expectedSeconds / 60)} dk
                                </strong>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Ayrılan Süre:</span>
                                <strong>
                                  {Math.round(act.allocatedSeconds / 60)} dk
                                </strong>
                              </div>
                              {isDone && act.firstCompletion && (
                                <div className="flex items-center justify-between text-emerald-800 pt-1 border-t border-slate-200">
                                  <span>İlk Bitirme Süresi:</span>
                                  <strong>
                                    {formatDurationTr(
                                      act.firstCompletion.activeSeconds
                                    )}
                                  </strong>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            {!isDone ? (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleStartOrResume(act)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-orange hover:bg-brand-orangeDark text-brand-navy font-extrabold text-sm shadow-sm transition-all disabled:opacity-50"
                              >
                                {isBusy ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <PlayCircle className="w-4 h-4" />
                                )}
                                <span>
                                  {isInProgress ? 'Devam Et' : 'Başla'}
                                </span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleStartPractice(act)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-brand-navy border border-slate-300 font-extrabold text-sm transition-all disabled:opacity-50"
                              >
                                {isBusy ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-4 h-4" />
                                )}
                                <span>Tekrar Çalış</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>

              {weekDetailQuery.data.week.activities
                .filter((a: any) => !a.required)
                .map((hw: any) => {
                  const isDone = hw.status === 'COMPLETED';
                  const isInProgress = hw.status === 'IN_PROGRESS';
                  const isBusy = startingActivityId === hw.id;

                  return (
                    <section
                      key={hw.id}
                      aria-label="Uygulama Ödevi"
                      className="bg-white rounded-3xl border-2 border-brand-purple/40 p-6 shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="space-y-2 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple text-white text-xs font-extrabold">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{hw.code} · Ayrı Uygulama Ödevi</span>
                            </span>
                            {renderStatusBadge(hw.status)}
                            <span className="text-xs font-bold text-slate-500">
                              (Sonraki hafta kilidini engellemez, öğretmen
                              panelinde ayrıca takip edilir)
                            </span>
                          </div>

                          <h3 className="text-xl font-extrabold text-brand-navy">
                            {hw.title}
                          </h3>
                          <p className="text-sm sm:text-base text-slate-600 font-medium">
                            {hw.shortPurpose}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 pt-1">
                            <span>
                              Tahmini Çalışma:{' '}
                              {Math.round(hw.expectedSeconds / 60)} dk
                            </span>
                            <span>·</span>
                            <span>
                              Ayrılan Süre:{' '}
                              {Math.round(hw.allocatedSeconds / 60)} dk
                            </span>
                            {isDone && hw.firstCompletion && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-700 font-extrabold">
                                  Bitirme Süresi:{' '}
                                  {formatDurationTr(
                                    hw.firstCompletion.activeSeconds
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {!isDone ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleStartOrResume(hw)}
                              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-purple hover:bg-purple-800 text-white font-extrabold text-sm sm:text-base shadow-sm"
                            >
                              {isBusy ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <PlayCircle className="w-5 h-5" />
                              )}
                              <span>
                                {isInProgress
                                  ? 'Ödeve Devam Et'
                                  : 'Ödeve Başla'}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleStartPractice(hw)}
                              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-brand-navy border border-slate-300 font-extrabold text-sm"
                            >
                              {isBusy ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RotateCcw className="w-4 h-4" />
                              )}
                              <span>Ödevi Tekrar Çalış</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </section>
                  );
                })}
            </div>
          )
        )}
      </main>
    </div>
  );
}
