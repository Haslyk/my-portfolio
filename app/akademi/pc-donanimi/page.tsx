"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  PublicActivityDefinition,
  LearningAnimationSpec,
  WeekStatus,
} from '@/lib/akademi/pc-donanimi';
import {
  apiFetch,
  ApiError,
  getStoredLeaseToken,
  setStoredLeaseToken,
  clearAllStudentLocalData,
  formatDurationSeconds,
  SaveIndicatorState,
} from '@/lib/akademi/pc-donanimi/api';
import { LearningAnimationCard } from '@/components/akademi/pc-donanimi/LearningAnimationCard';
import { ActivityEngine } from '@/components/akademi/pc-donanimi/ActivityEngine';
import { LiveQuizNavButton } from '@/components/akademi/LiveQuizNavButton';
import {
  Cpu,
  Lock,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Target,
  BookOpen,
  ClipboardCheck,
  Wrench,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  WifiOff,
  LogOut,
  User,
  Loader2,
} from 'lucide-react';

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  visibleCourses: string[];
}

interface WeekListItem {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  status: WeekStatus;
  unlocked: boolean;
  hasOverride: boolean;
  completedMandatoryCount: number;
  totalMandatoryCount: number;
  appsCompleted: boolean;
  learningObjectives: [string, string];
  animation: LearningAnimationSpec | null;
  activities: {
    id: string;
    code: string;
    title: string;
    type: 'application' | 'quiz' | 'homework';
    required: boolean;
    expectedSeconds: number;
    allocatedSeconds: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    firstCompletedAt: string | null;
    firstElapsedSeconds: number | null;
    firstActiveSeconds: number | null;
    activeAttemptId: string | null;
    practiceCount: number;
  }[];
}

export default function PcDonanimiCoursePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedWeekOrder, setSelectedWeekOrder] = useState<number>(1);
  const [saveState, setSaveState] = useState<SaveIndicatorState>('saved');
  const [activeSession, setActiveSession] = useState<{
    attempt: any;
    activity: PublicActivityDefinition;
  } | null>(null);
  const [startingActivityCode, setStartingActivityCode] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function verifyStudent() {
      try {
        const res = await apiFetch<{ student: StudentInfo }>(
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
    student?.visibleCourses?.includes('pc-donanimi')
  );

  const weeksQuery = useQuery({
    queryKey: ['pc-donanimi-weeks', student?.id],
    queryFn: async () => {
      const resp = await apiFetch<{ weeks: WeekListItem[] }>(
        '/api/akademi/weeks?course=pc-donanimi'
      );
      return resp.weeks;
    },
    enabled: Boolean(student && isCourseAllowed),
  });

  const handleSelectWeekTab = (week: WeekListItem) => {
    setActionError(null);
    if (!week.unlocked) {
      setActionError(
        `Hafta ${week.order} kilitli. Önce Hafta ${
          week.order - 1
        } içindeki iki zorunlu etkinliği ve değerlendirmeyi tamamlamalısın!`
      );
      return;
    }
    setActiveSession(null);
    setSelectedWeekOrder(week.order);
  };

  const handleStartOrResumeActivity = async (
    activityIdOrCode: string,
    mode: 'normal' | 'practice' = 'normal',
    takeover: boolean = false
  ) => {
    if (!student) return;
    setActionError(null);
    setStartingActivityCode(activityIdOrCode);
    try {
      const leaseToken = getStoredLeaseToken(student.id);
      const endpoint =
        mode === 'practice'
          ? `/api/akademi/activities/${activityIdOrCode}/practice`
          : `/api/akademi/activities/${activityIdOrCode}/start`;

      const resp = await apiFetch<{
        attempt: any;
        activity: PublicActivityDefinition;
        leaseToken?: string;
      }>(endpoint, {
        method: 'POST',
        leaseToken,
        body: JSON.stringify({
          takeover,
          reset: mode === 'practice',
        }),
      });

      if (resp.leaseToken) {
        setStoredLeaseToken(student.id, resp.leaseToken);
      }

      setActiveSession({
        attempt: resp.attempt,
        activity: resp.activity,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'ACTIVE_LEASE_CONFLICT') {
          const confirmTakeover = window.confirm(
            'Başka bir sekmede açık çalışma tespit edildi. Çalışmayı bu sekmeye devralmak ister misiniz?'
          );
          if (confirmTakeover) {
            await handleStartOrResumeActivity(activityIdOrCode, mode, true);
            return;
          }
        }
        setActionError(err.message);
      } else {
        setActionError('Etkinlik başlatılamadı.');
      }
    } finally {
      setStartingActivityCode(null);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await apiFetch('/api/akademi/student/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clearAllStudentLocalData();
    queryClient.clear();
    router.replace('/akademi');
  };

  if (checkingAuth || !student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#6D28D9] mb-3" />
        <p className="text-base font-extrabold text-[#1E1B38]">
          Donanım Atölyem yükleniyor...
        </p>
      </div>
    );
  }

  if (!isCourseAllowed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-md space-y-4">
          <Lock className="w-12 h-12 text-amber-600 mx-auto" />
          <h1 className="text-xl font-extrabold text-[#1E1B38]">
            Bu Derse Erişim Yetkiniz Kapalı
          </h1>
          <p className="text-sm text-slate-600">
            Bilgisayar Donanımı dersi şu anda hesabınız için aktif görünmüyor. Ders
            seçim ekranına dönebilir veya ders öğretmeninizle iletişime
            geçebilirsiniz.
          </p>
          <button
            type="button"
            onClick={() => router.push('/akademi')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E1B38] text-white text-sm font-extrabold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ders Seçimine Dön</span>
          </button>
        </div>
      </div>
    );
  }

  const weeks = weeksQuery.data || [];
  const currentWeek =
    weeks.find((w) => w.order === selectedWeekOrder) ||
    weeks.find((w) => w.unlocked) ||
    weeks[0];

  const getWeekStatusLabel = (status: WeekStatus, unlocked: boolean) => {
    if (!unlocked || status === 'LOCKED') {
      return { text: 'Kilitli', Icon: Lock, badgeClass: 'bg-slate-200 text-slate-700' };
    }
    if (status === 'COMPLETED') {
      return {
        text: 'Tamamlandı',
        Icon: CheckCircle2,
        badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      };
    }
    if (status === 'IN_PROGRESS') {
      return {
        text: 'Devam ediyor',
        Icon: Clock,
        badgeClass: 'bg-amber-100 text-amber-950 border border-amber-300',
      };
    }
    return {
      text: 'Başlamadı',
      Icon: Play,
      badgeClass: 'bg-purple-100 text-[#6D28D9]',
    };
  };

  const getActivityStatusInfo = (status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (status === 'COMPLETED') {
      return {
        text: 'Tamamlandı',
        Icon: CheckCircle2,
        badgeClass: 'bg-emerald-100 text-emerald-950 border border-emerald-300',
      };
    }
    if (status === 'IN_PROGRESS') {
      return {
        text: 'Devam ediyor',
        Icon: Clock,
        badgeClass: 'bg-amber-100 text-amber-950 border border-amber-300',
      };
    }
    return {
      text: 'Başlamadı',
      Icon: Play,
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-300',
    };
  };

  const cleanCode = (code: string) => code.replace(/^D-/, '');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-[#1E1B38] text-white shadow-md sticky top-0 z-30 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/akademi"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition border border-white/15"
              title="Ders Seçim Ekranına Dön"
            >
              <ArrowLeft className="w-4 h-4 text-[#F5A000]" aria-hidden="true" />
              <span className="hidden sm:inline">Derslerim</span>
            </Link>

            <div className="w-11 h-11 rounded-xl bg-[#F5A000] text-[#1E1B38] flex items-center justify-center shadow-sm shrink-0">
              <Cpu className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold tracking-tight leading-tight">
                Donanım Atölyem
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                Bilgisayar Donanımı · Hitit Üniversitesi
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 sm:gap-4">
            <LiveQuizNavButton courseCode="pc-donanimi" />
            <div
              role="status"
              aria-live="polite"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${
                saveState === 'offline'
                  ? 'bg-amber-950/90 border-amber-400 text-amber-200'
                  : saveState === 'saving'
                  ? 'bg-purple-950/80 border-purple-400 text-purple-100'
                  : 'bg-emerald-950/80 border-emerald-400/80 text-emerald-100'
              }`}
            >
              {saveState === 'offline' ? (
                <>
                  <WifiOff className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                  <span>Bağlantı yok, yeniden denenecek</span>
                </>
              ) : saveState === 'saving' ? (
                <>
                  <RefreshCw className="w-4 h-4 text-purple-300 animate-spin shrink-0" aria-hidden="true" />
                  <span>Kaydediliyor</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span>Kaydedildi</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs sm:text-sm">
              <User className="w-4 h-4 text-[#F5A000] shrink-0" aria-hidden="true" />
              <span className="font-semibold">
                {student.firstName} {student.lastName}
              </span>
              <span className="text-slate-300 font-mono text-xs">
                ({student.studentNumber})
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white text-xs sm:text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#F5A000]"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* Horizontal Scrollable 5 Week Tabs */}
      <nav
        aria-label="Hafta Sekmeleri"
        className="bg-white border-b border-slate-200 shadow-sm sticky top-[68px] z-20"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
            {weeks.map((w) => {
              const isSelected = currentWeek?.order === w.order;
              const stInfo = getWeekStatusLabel(w.status, w.unlocked);
              const StatusIcon = stInfo.Icon;

              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleSelectWeekTab(w)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 text-left shrink-0 transition ${
                    isSelected
                      ? 'border-[#1E1B38] bg-[#1E1B38] text-white shadow-sm'
                      : w.unlocked
                      ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900'
                      : 'border-slate-200 bg-slate-100/80 text-slate-500 opacity-80'
                  }`}
                >
                  <StatusIcon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected
                        ? 'text-[#F5A000]'
                        : w.status === 'COMPLETED'
                        ? 'text-emerald-600'
                        : !w.unlocked
                        ? 'text-slate-400'
                        : 'text-[#6D28D9]'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider">
                        Hafta {w.order}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/15 text-amber-300'
                            : stInfo.badgeClass
                        }`}
                      >
                        {stInfo.text}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold truncate max-w-[190px]">
                      {w.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {actionError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-[#F5A000] text-amber-950 flex items-start justify-between gap-3 text-sm font-semibold"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#F5A000] shrink-0 mt-0.5" />
              <span>{actionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-xs font-bold underline"
            >
              Kapat
            </button>
          </div>
        )}

        {weeksQuery.isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-600 font-semibold">
            Atölye içeriği yükleniyor...
          </div>
        ) : activeSession ? (
          <ActivityEngine
            studentId={student.id}
            initialAttempt={activeSession.attempt}
            activity={activeSession.activity}
            onSaveStateChange={setSaveState}
            onBackToWeek={() => {
              setActiveSession(null);
              weeksQuery.refetch();
            }}
            onActivityCompleted={() => {
              weeksQuery.refetch();
            }}
          />
        ) : currentWeek ? (
          <div className="space-y-6">
            {/* Week Banner & Two Short Learning Objectives */}
            <section className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#1E1B38] text-[#F5A000] text-xs font-extrabold">
                      Hafta {currentWeek.order}
                    </span>
                    {(() => {
                      const st = getWeekStatusLabel(
                        currentWeek.status,
                        currentWeek.unlocked
                      );
                      const IconComp = st.Icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${st.badgeClass}`}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                          <span>{st.text}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B38] mt-1.5">
                    {currentWeek.title}
                  </h1>
                </div>

                <div className="bg-slate-100 px-4 py-2.5 rounded-2xl border border-slate-200 text-right">
                  <div className="text-xs font-bold text-slate-600">
                    Haftalık Zorunlu İlerleme
                  </div>
                  <div className="text-lg font-extrabold text-[#1E1B38]">
                    {currentWeek.completedMandatoryCount} / {currentWeek.totalMandatoryCount} Görev
                  </div>
                </div>
              </div>

              {/* Two Learning Objectives */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#6D28D9] mb-2">
                  <Target className="w-4 h-4" />
                  <span>Bu Haftanın Öğrenme Hedefleri</span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm font-medium text-slate-800">
                  {currentWeek.learningObjectives.map((obj, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#F5A000] text-[#1E1B38] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Optional Learning Animation Card (Weeks 1, 2, 3) */}
            {currentWeek.animation && (
              <LearningAnimationCard animation={currentWeek.animation} />
            )}

            {/* Mandatory Activities Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#1E1B38] flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#F5A000]" />
                  <span>Zorunlu Sınıf Etkinlikleri ve Hafta Değerlendirmesi (3/3)</span>
                </h2>
                <span className="text-xs font-semibold text-slate-600">
                  Sayfayı açmak süreyi başlatmaz; Başla düğmesine basınca başlar.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {currentWeek.activities
                  .filter((a) => a.required)
                  .map((act) => {
                    const st = getActivityStatusInfo(act.status);
                    const StatusIcon = st.Icon;
                    const isQuiz = act.type === 'quiz';
                    const quizBlocked =
                      isQuiz &&
                      !currentWeek.appsCompleted &&
                      act.status !== 'COMPLETED';

                    return (
                      <div
                        key={act.id}
                        className={`rounded-3xl border-2 p-5 flex flex-col justify-between transition shadow-sm ${
                          act.status === 'COMPLETED'
                            ? 'border-emerald-400 bg-white'
                            : quizBlocked
                            ? 'border-slate-200 bg-slate-100/80'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="px-2.5 py-1 rounded-lg bg-[#1E1B38] text-[#F5A000] font-mono text-xs font-bold">
                              {cleanCode(act.code)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${st.badgeClass}`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              <span>{st.text}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-1">
                            {isQuiz ? (
                              <ClipboardCheck className="w-5 h-5 text-[#6D28D9] shrink-0" />
                            ) : (
                              <Wrench className="w-5 h-5 text-[#1E1B38] shrink-0" />
                            )}
                            <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                              {act.title}
                            </h3>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100">
                              Tahmini çalışma: 5 dk
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100">
                              Ayrılan süre: 10 dk
                            </span>
                            {(act as any).difficulty && (
                              <span
                                className={`px-2.5 py-1 rounded-lg font-bold ${
                                  (act as any).difficulty === 'Kolay'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : (act as any).difficulty === 'Orta'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                Zorluk: {(act as any).difficulty}
                              </span>
                            )}
                          </div>

                          {act.status === 'COMPLETED' && (
                            <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                              <div className="font-bold">
                                ✓ İlk Bitirme Süresi:{' '}
                                {formatDurationSeconds(act.firstElapsedSeconds)}
                              </div>
                              <div>
                                Yaklaşık Etkin Çalışma:{' '}
                                {formatDurationSeconds(act.firstActiveSeconds)}
                              </div>
                            </div>
                          )}

                          {quizBlocked && (
                            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-950 flex items-start gap-2">
                              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                              <span>
                                Değerlendirmeye başlamak için önce bu haftanın iki zorunlu uygulamasını tamamlamalısın.
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                          {act.status === 'COMPLETED' ? (
                            <button
                              type="button"
                              disabled={startingActivityCode === act.code}
                              onClick={() =>
                                handleStartOrResumeActivity(act.code, 'practice')
                              }
                              className="w-full py-3 px-4 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#6D28D9] font-extrabold text-sm flex items-center justify-center gap-2 transition"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>
                                {startingActivityCode === act.code
                                  ? 'Açılıyor...'
                                  : 'Tekrar Çalış'}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={quizBlocked || startingActivityCode === act.code}
                              onClick={() =>
                                handleStartOrResumeActivity(act.code, 'normal')
                              }
                              className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-sm ${
                                quizBlocked
                                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                  : 'bg-[#F5A000] hover:bg-amber-500 text-[#1E1B38]'
                              }`}
                            >
                              <Play className="w-4 h-4 fill-current" />
                              <span>
                                {startingActivityCode === act.code
                                  ? 'Başlatılıyor...'
                                  : act.status === 'IN_PROGRESS'
                                  ? 'Devam Et'
                                  : 'Başla'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>

            {/* Separate Application Homework Card */}
            {currentWeek.activities
              .filter((a) => a.type === 'homework')
              .map((hw) => {
                const st = getActivityStatusInfo(hw.status);
                const StatusIcon = st.Icon;

                return (
                  <section
                    key={hw.id}
                    className="bg-white rounded-3xl border-2 border-purple-200 p-5 sm:p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#6D28D9] text-white font-mono text-xs font-bold">
                            {cleanCode(hw.code)} · Uygulama Ödevi
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${st.badgeClass}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{st.text}</span>
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            (Ödev durumu ayrı izlenir; sonraki haftayı açmak için zorunlu değildir)
                          </span>
                        </div>

                        <h3 className="text-xl font-extrabold text-[#1E1B38] flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-[#6D28D9]" />
                          <span>{hw.title}</span>
                        </h3>

                        <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                          <span>Tahmini çalışma: 5–10 dk</span>
                          {hw.status === 'COMPLETED' && (
                            <span className="text-emerald-800 font-bold">
                              ✓ Bitirme süresi: {formatDurationSeconds(hw.firstElapsedSeconds)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        {hw.status === 'COMPLETED' ? (
                          <button
                            type="button"
                            disabled={startingActivityCode === hw.code}
                            onClick={() =>
                              handleStartOrResumeActivity(hw.code, 'practice')
                            }
                            className="py-3 px-6 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#6D28D9] font-extrabold text-sm flex items-center justify-center gap-2 transition"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Tekrar Çalış</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={startingActivityCode === hw.code}
                            onClick={() =>
                              handleStartOrResumeActivity(hw.code, 'normal')
                            }
                            className="py-3 px-6 rounded-xl bg-[#1E1B38] hover:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-sm"
                          >
                            <Play className="w-4 h-4 fill-current text-[#F5A000]" />
                            <span>
                              {startingActivityCode === hw.code
                                ? 'Açılıyor...'
                                : hw.status === 'IN_PROGRESS'
                                ? 'Devam Et'
                                : 'Başla'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </section>
                );
              })}
          </div>
        ) : null}
      </main>
    </div>
  );
}
