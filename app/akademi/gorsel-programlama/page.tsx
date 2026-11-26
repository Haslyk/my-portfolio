'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GpActivityDefinition,
  getGpActivityByCode
} from '@/lib/akademi/gorsel-programlama';
import {
  apiFetch,
  getStoredLeaseToken,
  setStoredLeaseToken,
  clearAllStudentLocalData,
  SaveIndicatorState
} from '@/lib/akademi/pc-donanimi/api';
import { GpActivityWorkspace } from '@/components/akademi/gorsel-programlama/GpActivityWorkspace';
import { LiveQuizNavButton } from '@/components/akademi/LiveQuizNavButton';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code2,
  Loader2,
  Lock,
  LogOut,
  Play,
  RefreshCw,
  Target,
  User,
  WifiOff,
  Wrench,
  Zap
} from 'lucide-react';

interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  visibleCourses: string[];
}

interface GpWeekItem {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  objectives: string[];
  status: 'LOCKED' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  unlocked: boolean;
  completedMandatoryCount: number;
  totalMandatoryCount: number;
  activities: {
    id: string;
    code: string;
    title: string;
    difficulty: string;
    durationMinutes: number;
    environment: 'web' | 'web+excel';
    widgetType: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    supportedCompletion: boolean;
    teacherVerified: boolean;
    excelChecklistState: Record<string, boolean>;
  }[];
}

export default function GorselProgramlamaPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedWeekOrder, setSelectedWeekOrder] = useState<number>(1);
  const [saveState, setSaveState] = useState<SaveIndicatorState>('saved');
  const [startingCode, setStartingCode] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<{
    attempt: any;
    activity: GpActivityDefinition;
    leaseToken: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function verify() {
      try {
        const res = await apiFetch<{ student: StudentInfo }>(
          '/api/akademi/student/me'
        );
        if (mounted) setStudent(res.student);
      } catch {
        if (mounted) router.replace('/akademi');
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    }
    verify();
    return () => {
      mounted = false;
    };
  }, [router]);

  const isCourseAllowed = Boolean(
    student &&
      (!Array.isArray(student.visibleCourses) ||
        student.visibleCourses.length === 0 ||
        student.visibleCourses.includes('gorsel-programlama'))
  );

  const {
    data: weeksData,
    isLoading: weeksLoading
  } = useQuery({
    queryKey: ['gp-weeks', student?.id],
    queryFn: () =>
      apiFetch<{ weeks: GpWeekItem[] }>(
        '/api/akademi/weeks?course=gorsel-programlama'
      ),
    enabled: Boolean(student && isCourseAllowed)
  });

  const weeks = weeksData?.weeks || [];
  const currentWeek =
    weeks.find((w) => w.order === selectedWeekOrder) || weeks[0];

  const totalActivities = weeks.reduce(
    (sum, w) => sum + w.activities.length,
    0
  );
  const completedActivities = weeks.reduce(
    (sum, w) =>
      sum + w.activities.filter((a) => a.status === 'COMPLETED').length,
    0
  );

  const resumeTarget = (() => {
    for (const w of weeks) {
      if (!w.unlocked) continue;
      const inProg = w.activities.find((a) => a.status === 'IN_PROGRESS');
      if (inProg) return { weekOrder: w.order, code: inProg.code };
    }
    for (const w of weeks) {
      if (!w.unlocked) continue;
      const notStarted = w.activities.find((a) => a.status === 'NOT_STARTED');
      if (notStarted) return { weekOrder: w.order, code: notStarted.code };
    }
    return null;
  })();

  const startActivity = async (code: string) => {
    setStartingCode(code);
    setActionError(null);
    try {
      const res = await apiFetch<{
        attempt: any;
        activity?: GpActivityDefinition;
        leaseToken: string;
      }>(`/api/akademi/activities/${code}/start`, {
        method: 'POST',
        body: JSON.stringify({
          existingLeaseToken: getStoredLeaseToken(code) || undefined
        })
      });
      if (res.leaseToken) {
        setStoredLeaseToken(code, res.leaseToken);
      }
      const def = res.activity || getGpActivityByCode(code);
      if (!def) {
        throw new Error('Etkinlik tanımı yüklenemedi.');
      }
      setActiveSession({
        attempt: res.attempt,
        activity: def,
        leaseToken: res.leaseToken
      });
    } catch (err: any) {
      setActionError(err?.message || 'Etkinlik başlatılamadı.');
    } finally {
      setStartingCode(null);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await apiFetch('/api/akademi/student/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      clearAllStudentLocalData();
      router.replace('/akademi');
    }
  };

  const handleNavigateInWeek = (direction: 'prev' | 'next') => {
    if (!activeSession || !currentWeek) return;
    const idx = currentWeek.activities.findIndex(
      (a) => a.code === activeSession.activity.code
    );
    if (idx < 0) return;
    const nextIdx = direction === 'prev' ? idx - 1 : idx + 1;
    const target = currentWeek.activities[nextIdx];
    if (target) startActivity(target.code);
  };

  const getWeekStatusLabel = (status: string, unlocked: boolean) => {
    if (!unlocked || status === 'LOCKED') {
      return {
        text: 'Kilitli',
        Icon: Lock,
        badgeClass: 'bg-slate-200 text-slate-700 border border-slate-300'
      };
    }
    if (status === 'COMPLETED') {
      return {
        text: 'Tamamlandı',
        Icon: CheckCircle2,
        badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300'
      };
    }
    if (status === 'IN_PROGRESS') {
      return {
        text: 'Devam ediyor',
        Icon: Clock,
        badgeClass: 'bg-amber-100 text-amber-950 border border-amber-300'
      };
    }
    return {
      text: 'Başlamadı',
      Icon: Play,
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-300'
    };
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E1B38]" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header matching Ağ Temelleri & Bilgisayar Donanımı */}
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
              <Code2 className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold tracking-tight leading-tight">
                Görsel Programlama Atölyesi
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">
                Excel VBA &amp; UserForm · Hitit Üniversitesi
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            <LiveQuizNavButton courseCode="gorsel-programlama" />

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
                  <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Bağlantı yok</span>
                </>
              ) : saveState === 'saving' ? (
                <>
                  <RefreshCw className="w-4 h-4 text-purple-300 animate-spin shrink-0" />
                  <span>Kaydediliyor</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kaydedildi</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs sm:text-sm">
              <User className="w-4 h-4 text-[#F5A000] shrink-0" />
              <span className="font-semibold">
                {student.firstName} {student.lastName}
              </span>
              <span className="text-slate-300 font-mono text-xs hidden sm:inline">
                ({student.studentNumber})
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sticky 5 Week Tabs */}
      {!activeSession && isCourseAllowed && (
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
                    onClick={() => setSelectedWeekOrder(w.order)}
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
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {!isCourseAllowed ? (
          <div className="bg-white rounded-3xl border-2 border-amber-200 p-8 text-center text-sm font-semibold text-amber-900">
            Bu ders şu anda sınıf grubunuz için görünür değil. Öğretmeninizle iletişime geçin.
          </div>
        ) : activeSession ? (
          <GpActivityWorkspace
            key={activeSession.activity.code}
            activity={activeSession.activity}
            attempt={activeSession.attempt}
            leaseToken={activeSession.leaseToken}
            saveState={saveState}
            onSaveStateChange={setSaveState}
            onBackToWeek={() => {
              setActiveSession(null);
              queryClient.invalidateQueries({ queryKey: ['gp-weeks'] });
            }}
            onCompleted={() => {
              queryClient.invalidateQueries({ queryKey: ['gp-weeks'] });
            }}
            onNavigateActivity={handleNavigateInWeek}
            hasPrev={
              Boolean(
                currentWeek &&
                  currentWeek.activities.findIndex(
                    (a) => a.code === activeSession.activity.code
                  ) > 0
              )
            }
            hasNext={
              Boolean(
                currentWeek &&
                  currentWeek.activities.findIndex(
                    (a) => a.code === activeSession.activity.code
                  ) <
                    currentWeek.activities.length - 1
              )
            }
          />
        ) : weeksLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-[#1E1B38]" />
          </div>
        ) : currentWeek ? (
          <div className="space-y-6">
            {actionError && (
              <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800">
                {actionError}
              </div>
            )}

            {/* Week Banner */}
            <section className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
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
                  <p className="text-sm text-slate-600 mt-1">
                    {currentWeek.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {resumeTarget && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWeekOrder(resumeTarget.weekOrder);
                        startActivity(resumeTarget.code);
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#1E1B38] hover:bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-[#F5A000] transition shadow-sm"
                    >
                      <Play className="w-4 h-4" />
                      <span>Kaldığın Yerden Devam Et ({resumeTarget.code})</span>
                    </button>
                  )}

                  <div className="bg-slate-100 px-4 py-2.5 rounded-2xl border border-slate-200 text-right">
                    <div className="text-xs font-bold text-slate-600">
                      Genel İlerleme
                    </div>
                    <div className="text-lg font-extrabold text-[#1E1B38]">
                      {completedActivities} / {totalActivities || 25} Etkinlik
                    </div>
                  </div>
                </div>
              </div>

              {currentWeek.objectives.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#6D28D9] mb-2">
                    <Target className="w-4 h-4" />
                    <span>Bu Haftanın Öğrenme Hedefleri</span>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm font-medium text-slate-800">
                    {currentWeek.objectives.map((obj, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#6D28D9]/15 text-[#6D28D9] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!currentWeek.unlocked && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-950">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Bu hafta kilitli. Önceki haftanın beş etkinliğini tamamladığında ve öğretmenin haftayı açtığında erişebilirsin.
                  </span>
                </div>
              )}
            </section>

            {/* 5 Activity Cards */}
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1E1B38] flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#6D28D9]" />
                <span>Haftalık Uygulama Etkinlikleri</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentWeek.activities.map((act) => {
                  const isLocked = !currentWeek.unlocked;
                  const statusLabel = isLocked
                    ? 'Kilitli'
                    : act.status === 'COMPLETED'
                    ? 'Tamamlandı'
                    : act.status === 'IN_PROGRESS'
                    ? 'Devam ediyor'
                    : 'Başlamadı';

                  const excelDone =
                    act.environment === 'web+excel' &&
                    Object.values(act.excelChecklistState || {}).some(Boolean);

                  return (
                    <div
                      key={act.id}
                      className={`bg-white rounded-3xl border-2 p-5 flex flex-col justify-between shadow-sm transition ${
                        isLocked
                          ? 'border-slate-200 opacity-75'
                          : act.status === 'COMPLETED'
                          ? 'border-emerald-400'
                          : act.status === 'IN_PROGRESS'
                          ? 'border-[#F5A000]'
                          : 'border-slate-200 hover:border-[#6D28D9]/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-[#1E1B38] text-white font-mono text-xs font-extrabold">
                            {act.code}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isLocked
                                ? 'bg-slate-100 text-slate-600'
                                : act.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-900'
                                : act.status === 'IN_PROGRESS'
                                ? 'bg-amber-100 text-amber-950'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isLocked ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : act.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            <span>{statusLabel}</span>
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                          {act.title}
                        </h3>

                        <div className="flex flex-wrap gap-1.5 text-xs font-semibold text-slate-700 mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100">
                            {act.durationMinutes} dk
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100">
                            {act.difficulty}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg ${
                              act.environment === 'web+excel'
                                ? 'bg-purple-100 text-[#6D28D9]'
                                : 'bg-sky-50 text-sky-900'
                            }`}
                          >
                            {act.environment === 'web+excel'
                              ? 'Web + Excel'
                              : 'Web'}
                          </span>
                        </div>

                        {act.environment === 'web+excel' && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs space-y-1 mb-3">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Web:</span>
                              <span className="font-bold text-slate-800">
                                {statusLabel}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Excel Beyanı:</span>
                              <span className="font-bold text-slate-800">
                                {act.teacherVerified
                                  ? 'Öğretmen Doğruladı'
                                  : excelDone
                                  ? 'Öğrenci İşaretledi'
                                  : 'Bekleniyor'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isLocked || startingCode === act.code}
                        onClick={() => startActivity(act.code)}
                        className={`mt-2 w-full py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition ${
                          isLocked
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : act.status === 'COMPLETED'
                            ? 'bg-purple-100 hover:bg-purple-200 text-[#6D28D9]'
                            : 'bg-[#1E1B38] hover:bg-slate-800 text-white'
                        }`}
                      >
                        {startingCode === act.code ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>
                          {isLocked
                            ? 'Kilitli'
                            : act.status === 'COMPLETED'
                            ? 'Tekrar İncele'
                            : act.status === 'IN_PROGRESS'
                            ? 'Devam Et'
                            : 'Başla'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
