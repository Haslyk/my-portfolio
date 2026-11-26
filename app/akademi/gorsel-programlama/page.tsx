'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GpActivityDefinition,
  exportGpCurriculumToMarkdown,
  getGpActivityByCode
} from '@/lib/akademi/gorsel-programlama';
import {
  apiFetch,
  getStoredLeaseToken,
  setStoredLeaseToken,
  SaveIndicatorState
} from '@/lib/akademi/pc-donanimi/api';
import { GpActivityWorkspace } from '@/components/akademi/gorsel-programlama/GpActivityWorkspace';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code2,
  Download,
  Loader2,
  Lock,
  Play,
  Presentation,
  RefreshCw,
  Sparkles,
  User
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
    isLoading: weeksLoading,
    refetch: refetchWeeks
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
  const overallPercent =
    totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0;

  // Find "Kaldığın yerden devam et" target
  const resumeTarget = (() => {
    for (const w of weeks) {
      if (!w.unlocked) continue;
      const inProg = w.activities.find((a) => a.status === 'IN_PROGRESS');
      if (inProg) return { weekOrder: w.order, code: inProg.code, title: inProg.title };
    }
    for (const w of weeks) {
      if (!w.unlocked) continue;
      const notStarted = w.activities.find((a) => a.status === 'NOT_STARTED');
      if (notStarted) return { weekOrder: w.order, code: notStarted.code, title: notStarted.title };
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

  const handleDownloadMarkdown = () => {
    const md = exportGpCurriculumToMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gorsel-programlama-sunum-yonergesi.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNavigateInWeek = (direction: 'prev' | 'next') => {
    if (!activeSession || !currentWeek) return;
    const idx = currentWeek.activities.findIndex(
      (a) => a.code === activeSession.activity.code
    );
    if (idx < 0) return;
    const nextIdx = direction === 'prev' ? idx - 1 : idx + 1;
    const target = currentWeek.activities[nextIdx];
    if (target) {
      startActivity(target.code);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-slate-700" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/akademi"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Portal
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Code2 className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900">
                  Görsel Programlama Atölyesi
                </h1>
                <p className="text-[11px] text-slate-500">
                  Excel VBA & UserForm Etkileşimli Eğitim Paneli
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/akademi/gorsel-programlama/sunum"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Presentation className="h-3.5 w-3.5 text-sky-600" /> Sunum Modu
            </Link>
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" /> Yönerge (.md)
            </button>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>
                {student.firstName} {student.lastName}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {!isCourseAllowed ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
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
        ) : (
          <>
            {/* Welcome + Resume + Overall Progress */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
                    <Sparkles className="h-3 w-3" /> 5 Hafta · 25 Uygulamalı Etkinlik
                  </div>
                  <h2 className="text-xl font-bold">
                    Hoş geldin, {student.firstName}!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                    Form tasarımı, değişkenler, koşullar, listeler, döngüler ve Excel VBA kayıt işlemlerini adım adım uygulayarak öğren.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {resumeTarget ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWeekOrder(resumeTarget.weekOrder);
                        startActivity(resumeTarget.code);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 hover:bg-sky-400 transition"
                    >
                      <Play className="h-4 w-4" />
                      Kaldığın Yerden Devam Et ({resumeTarget.code})
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" /> Açık olan tüm etkinlikler tamamlandı!
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    Genel İlerleme
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900">
                      {completedActivities} / {totalActivities || 25}
                    </span>
                    <span className="text-sm font-semibold text-sky-700">
                      %{overallPercent}
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-600 transition-all"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
                <div className="text-xs text-slate-600">
                  Tamamlanan etkinlik sayısı ilerlemeni gösterir; sonraki haftalar önceki hafta tamamlanınca ve öğretmen izniyle açılır.
                </div>
              </div>
            </section>

            {actionError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
                {actionError}
              </div>
            )}

            {/* 5 Week Tabs */}
            {weeksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    {weeks.map((w) => {
                      const active = w.order === selectedWeekOrder;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setSelectedWeekOrder(w.order)}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${
                            active
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : w.unlocked
                              ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
                              : 'border-slate-200 bg-slate-100 text-slate-500'
                          }`}
                        >
                          {!w.unlocked && <Lock className="h-3.5 w-3.5" />}
                          {w.status === 'COMPLETED' && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                          <span>
                            Hafta {w.order}: {w.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => refetchWeeks()}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Yenile
                  </button>
                </div>

                {/* Selected Week Content */}
                {currentWeek && (
                  <section className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-xs font-bold uppercase tracking-wider text-sky-700">
                            Hafta {currentWeek.order}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {currentWeek.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600">
                            {currentWeek.description}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                          {currentWeek.completedMandatoryCount} /{' '}
                          {currentWeek.totalMandatoryCount} Tamamlandı
                        </div>
                      </div>

                      {!currentWeek.unlocked && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                          <Lock className="h-4 w-4 shrink-0 text-amber-600" />
                          <span>
                            Bu hafta kilitli. Önceki haftanın beş etkinliğini tamamladığında ve öğretmenin haftayı açtığında erişebilirsin.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 5 Activity Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentWeek.activities.map((act) => {
                        const isLocked = !currentWeek.unlocked;
                        const statusLabel = isLocked
                          ? 'Kilitli'
                          : act.status === 'COMPLETED'
                          ? 'Tamamlandı'
                          : act.status === 'IN_PROGRESS'
                          ? 'Devam Ediyor'
                          : 'Başlanmadı';

                        const excelDone =
                          act.environment === 'web+excel' &&
                          Object.values(act.excelChecklistState || {}).some(Boolean);

                        return (
                          <div
                            key={act.id}
                            className={`rounded-2xl border bg-white p-4 shadow-sm flex flex-col justify-between gap-4 transition ${
                              isLocked
                                ? 'border-slate-200 opacity-75'
                                : act.status === 'COMPLETED'
                                ? 'border-emerald-200'
                                : 'border-slate-200 hover:border-sky-300'
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                                  {act.code}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                    isLocked
                                      ? 'bg-slate-100 text-slate-600'
                                      : act.status === 'COMPLETED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : act.status === 'IN_PROGRESS'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {isLocked ? (
                                    <Lock className="h-3 w-3" />
                                  ) : act.status === 'COMPLETED' ? (
                                    <CheckCircle2 className="h-3 w-3" />
                                  ) : (
                                    <Clock className="h-3 w-3" />
                                  )}
                                  {statusLabel}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-slate-900">
                                {act.title}
                              </h4>

                              <div className="flex flex-wrap gap-1.5 text-[11px]">
                                <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                                  Süre: {act.durationMinutes} dk
                                </span>
                                <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                                  Zorluk: {act.difficulty}
                                </span>
                                <span
                                  className={`rounded px-2 py-0.5 font-medium ${
                                    act.environment === 'web+excel'
                                      ? 'bg-indigo-50 text-indigo-800'
                                      : 'bg-sky-50 text-sky-800'
                                  }`}
                                >
                                  {act.environment === 'web+excel'
                                    ? 'Web + Excel'
                                    : 'Web'}
                                </span>
                              </div>

                              {/* Separate Web vs Excel Status */}
                              {act.environment === 'web+excel' && (
                                <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-[11px] space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Web Bölümü:</span>
                                    <span className="font-semibold text-slate-800">
                                      {statusLabel}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Excel Beyanı:</span>
                                    <span className="font-semibold text-slate-800">
                                      {act.teacherVerified
                                        ? 'Öğretmen Doğruladı'
                                        : excelDone
                                        ? 'Öğrenci İşaretledi'
                                        : 'Bekleniyor'}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {act.supportedCompletion && (
                                <div className="text-[11px] font-medium text-sky-700">
                                  Destekle tamamlandı
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={isLocked || startingCode === act.code}
                              onClick={() => startActivity(act.code)}
                              className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                                isLocked
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : act.status === 'COMPLETED'
                                  ? 'border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                                  : 'bg-slate-900 text-white hover:bg-slate-800'
                              }`}
                            >
                              {startingCode === act.code ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Play className="h-3.5 w-3.5" />
                              )}
                              {isLocked
                                ? 'Kilitli'
                                : act.status === 'COMPLETED'
                                ? 'Tekrar İncele'
                                : act.status === 'IN_PROGRESS'
                                ? 'Devam Et'
                                : 'Başla'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
