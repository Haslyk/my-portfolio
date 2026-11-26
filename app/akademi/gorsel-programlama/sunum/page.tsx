'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GP_CURRICULUM_WEEKS,
  exportGpCurriculumToMarkdown
} from '@/lib/akademi/gorsel-programlama';
import { runVbaInWorker } from '@/lib/akademi/gorsel-programlama/vbaSimulator/workerRunner';
import { VbaRunResult } from '@/lib/akademi/gorsel-programlama';
import { TraceViewerPanel } from '@/components/akademi/gorsel-programlama/TraceViewerPanel';
import { apiRequest } from '@/lib/akademi/apiClient';
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  Loader2,
  Play,
  Presentation,
  StepForward
} from 'lucide-react';

export default function GpSunumModuPage() {
  const router = useRouter();
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [weekOrder, setWeekOrder] = useState(1);
  const [actIndex, setActIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [simResult, setSimResult] = useState<VbaRunResult | null>(null);
  const [traceIndex, setTraceIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    apiRequest('/api/akademi/admin/me')
      .then(() => {
        if (mounted) setIsAdmin(true);
      })
      .catch(() => {
        if (mounted) router.replace('/akademi/admin');
      })
      .finally(() => {
        if (mounted) setCheckingAdmin(false);
      });
    return () => {
      mounted = false;
    };
  }, [router]);

  if (checkingAdmin || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-7 w-7 animate-spin text-sky-400" />
      </div>
    );
  }

  const week =
    GP_CURRICULUM_WEEKS.find((w) => w.order === weekOrder) ||
    GP_CURRICULUM_WEEKS[0];
  const activity = week.activities[actIndex] || week.activities[0];

  const handleRunTrace = async () => {
    const code = activity.teacherSolution || activity.starterCode;
    if (!code) return;
    const res = await runVbaInWorker({
      code,
      controls: activity.starterForm.controls,
      sheet: activity.starterSheet,
      eventSubName: activity.supportedEvents?.[0] || activity.outputPredictionPayload?.simEvent,
      captureTrace: true
    });
    setSimResult(res);
    setTraceIndex(0);
  };

  const handleExportMd = () => {
    const md = exportGpCurriculumToMarkdown(week.order);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hafta-${week.order}-sunum.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/akademi/gorsel-programlama"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Atölyeye Dön
            </Link>
            <div className="flex items-center gap-2">
              <Presentation className="h-5 w-5 text-sky-400" />
              <span className="text-base font-bold">
                Öğretmen Sunum Modu
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={weekOrder}
              onChange={(e) => {
                setWeekOrder(Number(e.target.value));
                setActIndex(0);
                setShowAnswer(false);
                setSimResult(null);
              }}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-white"
            >
              {GP_CURRICULUM_WEEKS.map((w) => (
                <option key={w.order} value={w.order}>
                  Hafta {w.order}: {w.title}
                </option>
              ))}
            </select>

            <select
              value={actIndex}
              onChange={(e) => {
                setActIndex(Number(e.target.value));
                setShowAnswer(false);
                setSimResult(null);
              }}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-white"
            >
              {week.activities.map((a, idx) => (
                <option key={a.code} value={idx}>
                  {a.code} — {a.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleExportMd}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
            >
              <Download className="h-3.5 w-3.5" /> Hafta {week.order} (.md)
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-sky-500 px-4 py-1.5 font-mono text-xl font-extrabold text-slate-950">
                {activity.code}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {activity.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="rounded-lg bg-slate-800 px-3 py-1">
                {activity.difficulty}
              </span>
              <span className="rounded-lg bg-slate-800 px-3 py-1">
                {activity.durationMinutes} dakika
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-base sm:text-lg leading-relaxed">
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Görev Yönergesi
              </div>
              <p className="text-slate-100">{activity.instructions.whatToDo}</p>
              <p className="text-sm text-slate-400">
                <strong>Başlangıç:</strong> {activity.instructions.whereToStart}
              </p>
              <p className="text-sm text-slate-400">
                <strong>Beklenen Sonuç:</strong> {activity.instructions.expectedResult}
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Öğretmen Notu & Adımlar
              </div>
              <p className="text-sm text-amber-200/90">{activity.teacherNotes}</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                {activity.instructions.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Controls: Show/Hide Answer + Step-by-Step Execution */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAnswer((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-sky-400"
            >
              {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showAnswer ? 'Cevabı Gizle' : 'Cevabı Aç'}
            </button>

            {(activity.teacherSolution || activity.starterCode) &&
              activity.widgetType !== 'matching' &&
              activity.widgetType !== 'form_builder' && (
                <button
                  type="button"
                  onClick={handleRunTrace}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/20 px-4 py-2.5 text-sm font-bold text-amber-200 hover:bg-amber-500/30"
                >
                  <StepForward className="h-4 w-4" />
                  Adım Adım Yürütmeyi Göster
                </button>
              )}
          </div>

          {showAnswer && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-5 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Örnek Çözüm / Cevap
              </div>
              <pre className="font-mono text-sm sm:text-base text-emerald-100 whitespace-pre-wrap overflow-x-auto">
                {activity.teacherSolution}
              </pre>
            </div>
          )}

          {simResult && (
            <div className="rounded-xl bg-white text-slate-900 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Play className="h-4 w-4 text-emerald-600" />
                <span>Simülatör Çıktısı ({simResult.stepsExecuted} adım)</span>
              </div>
              {simResult.msgBoxes.length > 0 && (
                <div className="text-sm text-sky-900 bg-sky-50 border border-sky-200 rounded-lg p-3">
                  <strong>MsgBox:</strong> {simResult.msgBoxes.join(' | ')}
                </div>
              )}
              <TraceViewerPanel
                trace={simResult.trace}
                currentIndex={traceIndex}
                onChangeIndex={setTraceIndex}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
