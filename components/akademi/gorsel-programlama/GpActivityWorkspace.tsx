'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GpActivityDefinition,
  VbaFormControl,
  VbaRunResult,
  VirtualSheetData
} from '@/lib/akademi/gorsel-programlama';
import { runVbaInWorker } from '@/lib/akademi/gorsel-programlama/vbaSimulator/workerRunner';
import { apiFetch, ApiError, SaveIndicatorState } from '@/lib/akademi/pc-donanimi/api';
import { VbaCodeEditor } from './VbaCodeEditor';
import { UserFormPreview } from './UserFormPreview';
import { VirtualSheetPreview } from './VirtualSheetPreview';
import { TraceViewerPanel } from './TraceViewerPanel';
import { MatchingWidget } from './widgets/MatchingWidget';
import { FormBuilderWidget } from './widgets/FormBuilderWidget';
import { FillBlanksWidget } from './widgets/FillBlanksWidget';
import { CodeOrderingWidget } from './widgets/CodeOrderingWidget';
import { OutputPredictionWidget } from './widgets/OutputPredictionWidget';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CloudOff,
  Eye,
  HelpCircle,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  StepForward,
  XCircle
} from 'lucide-react';

interface GpActivityWorkspaceProps {
  activity: GpActivityDefinition;
  attempt: any;
  leaseToken: string;
  saveState: SaveIndicatorState;
  onSaveStateChange: (s: SaveIndicatorState) => void;
  onBackToWeek: () => void;
  onCompleted: () => void;
  onNavigateActivity?: (direction: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function GpActivityWorkspace({
  activity,
  attempt,
  leaseToken,
  saveState,
  onSaveStateChange,
  onBackToWeek,
  onCompleted,
  onNavigateActivity,
  hasPrev = false,
  hasNext = false
}: GpActivityWorkspaceProps) {
  const localDraftKey = `gp_draft_${attempt.id}_${activity.code}`;

  const [state, setState] = useState<Record<string, any>>(() => {
    const serverState =
      attempt.state && typeof attempt.state === 'object' ? attempt.state : {};
    let merged = { ...serverState };
    if (typeof window !== 'undefined') {
      try {
        const rawLocal = localStorage.getItem(localDraftKey);
        if (rawLocal) {
          const parsedLocal = JSON.parse(rawLocal);
          if (
            parsedLocal &&
            typeof parsedLocal === 'object' &&
            (parsedLocal.updatedAt || 0) > (serverState.updatedAt || 0)
          ) {
            merged = { ...merged, ...parsedLocal };
          }
        }
      } catch {
        // ignore local parse error
      }
    }
    return {
      code: activity.starterCode,
      controls: activity.starterForm.controls,
      pairs: {},
      answers: {},
      order: activity.codeOrderingPayload?.blocks.map((b) => b.id) || [],
      prediction: '',
      excelChecklist: {},
      ...merged
    };
  });

  const [revision, setRevision] = useState<number>(attempt.revision || 1);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'guide' | 'work' | 'preview'>('work');

  // Hints & Solution
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // Simulator state
  const [runningSim, setRunningSim] = useState(false);
  const [simResult, setSimResult] = useState<VbaRunResult | null>(null);
  const [previewControls, setPreviewControls] = useState<VbaFormControl[]>(
    () => state.controls || activity.starterForm.controls
  );
  const [previewSheet, setPreviewSheet] = useState<VirtualSheetData | undefined>(
    () => activity.starterSheet
  );
  const [traceIndex, setTraceIndex] = useState<number>(0);
  const [traceMode, setTraceMode] = useState<boolean>(false);

  // Check / Grading state
  const [checking, setChecking] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState<{
    passed: boolean;
    summaryMessage: string;
    items: { itemId: string; correct: boolean; message: string }[];
  } | null>(null);

  // Help request (Öğretmene göster)
  const [helpSent, setHelpSent] = useState(Boolean(attempt.hasOpenHelp));
  const [sendingHelp, setSendingHelp] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local draft synced immediately
  const updateState = useCallback(
    (updater: (prev: Record<string, any>) => Record<string, any>) => {
      setState((prev) => {
        const next = { ...updater(prev), updatedAt: Date.now() };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(localDraftKey, JSON.stringify(next));
          } catch {
            // ignore quota
          }
        }
        return next;
      });
    },
    [localDraftKey]
  );

  // Debounced server auto-save
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    onSaveStateChange('saving');

    saveTimerRef.current = setTimeout(async () => {
      try {
        const nextRev = revision + 1;
        await apiFetch(`/api/akademi/attempts/${attempt.id}/state`, {
          method: 'PATCH',
          body: JSON.stringify({
            state,
            revision: nextRev,
            leaseToken
          })
        });
        setRevision(nextRev);
        setLastSavedAt(
          new Date().toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        );
        onSaveStateChange('saved');
      } catch (err) {
        onSaveStateChange('offline');
      }
    }, 900);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Heartbeat every 25s
  useEffect(() => {
    const timer = setInterval(() => {
      apiFetch(`/api/akademi/attempts/${attempt.id}/heartbeat`, {
        method: 'POST',
        body: JSON.stringify({ leaseToken })
      }).catch(() => {});
    }, 25000);
    return () => clearInterval(timer);
  }, [attempt.id, leaseToken]);

  const handleRunSimulator = async (eventSubName?: string, enableTrace = false) => {
    setRunningSim(true);
    setTraceMode(enableTrace);
    const codeToRun =
      activity.widgetType === 'output_prediction'
        ? activity.outputPredictionPayload?.codeToRead || activity.starterCode
        : state.code || activity.starterCode;

    const targetEvent =
      eventSubName ||
      activity.outputPredictionPayload?.simEvent ||
      activity.supportedEvents?.[0];

    const listSelections: Record<string, number> = {};
    for (const c of previewControls) {
      if (c.type === 'ListBox' && typeof c.listIndex === 'number') {
        listSelections[c.name] = c.listIndex;
      }
    }

    const res = await runVbaInWorker({
      code: codeToRun,
      controls: previewControls,
      sheet: previewSheet,
      eventSubName: targetEvent,
      listSelections,
      captureTrace: true
    });

    setSimResult(res);
    setPreviewControls(res.controls);
    if (res.sheet) setPreviewSheet(res.sheet);
    setTraceIndex(0);
    setRunningSim(false);
    setMobileTab('preview');
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      const res = await apiFetch<{
        passed: boolean;
        summaryMessage: string;
        donanimItems?: { itemId: string; correct: boolean; message: string }[];
        feedbackItems?: { fieldId: string; isCorrect: boolean; message: string }[];
      }>(`/api/akademi/attempts/${attempt.id}/check`, {
        method: 'POST',
        body: JSON.stringify({
          state,
          leaseToken
        })
      });

      const items =
        res.donanimItems ||
        (res.feedbackItems || []).map((f) => ({
          itemId: f.fieldId,
          correct: f.isCorrect,
          message: f.message
        }));

      setCheckFeedback({
        passed: res.passed,
        summaryMessage: res.summaryMessage,
        items
      });
      setMobileTab('preview');
      if (res.passed) {
        onCompleted();
      }
    } catch (err: any) {
      setCheckFeedback({
        passed: false,
        summaryMessage: err?.message || 'Kontrol sırasında bir hata oluştu.',
        items: []
      });
    } finally {
      setChecking(false);
    }
  };

  const handleResetWork = () => {
    updateState((prev) => ({
      ...prev,
      code: activity.starterCode,
      controls: activity.starterForm.controls,
      pairs: {},
      answers: {},
      order: activity.codeOrderingPayload?.blocks.map((b) => b.id) || [],
      prediction: ''
    }));
    setPreviewControls(activity.starterForm.controls);
    setPreviewSheet(activity.starterSheet);
    setSimResult(null);
    setCheckFeedback(null);
    setConfirmReset(false);
  };

  const handleRequestHelp = async () => {
    setSendingHelp(true);
    try {
      await apiFetch(`/api/akademi/attempts/${attempt.id}/help`, {
        method: 'POST',
        body: JSON.stringify({ message: `${activity.code} etkinliğinde destek istiyorum.` })
      });
      setHelpSent(true);
    } catch {
      // ignore
    } finally {
      setSendingHelp(false);
    }
  };

  const handleRevealSolution = () => {
    setShowSolution(true);
    updateState((prev) => ({ ...prev, supportedCompletion: true }));
  };

  const activeTraceLine =
    traceMode && simResult?.trace[traceIndex]
      ? simResult.trace[traceIndex].line
      : null;

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToWeek}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Haftaya Dön
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
                {activity.code}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {activity.title}
              </h2>
              {state.supportedCompletion && (
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">
                  Destekle tamamlandı
                </span>
              )}
              {state.teacherVerified && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  Öğretmen tarafından doğrulandı
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Save Status + Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
            {saveState === 'saving' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
                <span className="text-slate-600">Kaydediliyor...</span>
              </>
            ) : saveState === 'offline' ? (
              <>
                <CloudOff className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-amber-700 font-medium">
                  Bağlantı bekleniyor (yerel taslak korundu)
                </span>
              </>
            ) : (
              <>
                <Cloud className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  Kaydedildi{lastSavedAt ? ` · ${lastSavedAt}` : ''}
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleRequestHelp}
            disabled={sendingHelp || helpSent}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              helpSent
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {helpSent ? 'Öğretmene Bildirildi' : 'Öğretmene Göster'}
          </button>

          {onNavigateActivity && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!hasPrev}
                onClick={() => onNavigateActivity('prev')}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                title="Önceki etkinlik"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={!hasNext}
                onClick={() => onNavigateActivity('next')}
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                title="Sonraki etkinlik"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="flex lg:hidden rounded-xl border border-slate-200 bg-white p-1">
        {(
          [
            { id: 'guide', label: 'Yönerge & İpucu' },
            { id: 'work', label: 'Çalışma Alanı' },
            { id: 'preview', label: 'Önizleme & Sonuç' }
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobileTab(tab.id)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              mobileTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT: Amaç, Yönerge, Adımlar, 3-Seviyeli İpucu */}
        <aside
          className={`lg:col-span-3 space-y-3 ${
            mobileTab === 'guide' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Zorluk: {activity.difficulty}</span>
              <span>Süre: {activity.durationMinutes} dk</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div>
                <div className="font-bold text-slate-900">Ne yapacağım?</div>
                <p>{activity.instructions.whatToDo}</p>
              </div>
              <div>
                <div className="font-bold text-slate-900">Nereden başlayacağım?</div>
                <p>{activity.instructions.whereToStart}</p>
              </div>
              <div>
                <div className="font-bold text-slate-900">Hangi verileri kullanacağım?</div>
                <p>{activity.instructions.whichData}</p>
              </div>
              <div>
                <div className="font-bold text-slate-900">Nasıl bir sonuç görmeliyim?</div>
                <p>{activity.instructions.expectedResult}</p>
              </div>
              <div>
                <div className="font-bold text-slate-900">Tamamlandığını nasıl anlayacağım?</div>
                <p>{activity.instructions.howToKnowDone}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="text-xs font-bold text-slate-900 mb-1.5">Adımlar</div>
              <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside">
                {activity.instructions.steps.map((st, idx) => (
                  <li key={idx}>{st}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* 3-Level Hints */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <span>İpuçları ({hintLevel}/3)</span>
              </div>
              {hintLevel < 3 && (
                <button
                  type="button"
                  onClick={() => setHintLevel((h) => Math.min(3, h + 1))}
                  className="rounded-lg bg-amber-200/80 px-2.5 py-1 text-[11px] font-semibold text-amber-950 hover:bg-amber-300"
                >
                  İpucu Al
                </button>
              )}
            </div>

            {hintLevel === 0 ? (
              <p className="text-xs text-amber-900/80">
                Takıldığında sırayla 3 seviyeli ipucu alabilirsin.
              </p>
            ) : (
              <div className="space-y-2">
                {activity.hints.slice(0, hintLevel).map((h, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-amber-200 bg-white p-2.5 text-xs text-slate-800"
                  >
                    <span className="font-bold text-amber-700">
                      Seviye {i + 1}:{' '}
                    </span>
                    {h}
                  </div>
                ))}
              </div>
            )}

            {/* Separate Solution Action */}
            {activity.teacherSolution && (
              <div className="border-t border-amber-200 pt-2">
                {!showSolution ? (
                  <button
                    type="button"
                    onClick={handleRevealSolution}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <Eye className="h-3.5 w-3.5" /> Tam Çözümü Gör (Destekle Tamamla)
                  </button>
                ) : (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-sky-800">
                      Örnek Çözüm (Bu etkinlik “Destekle tamamlandı” olarak işaretlenir):
                    </div>
                    <pre className="rounded bg-slate-900 p-2 font-mono text-[11px] text-slate-100 overflow-x-auto whitespace-pre-wrap">
                      {activity.teacherSolution}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* CENTER: Etkileşim Alanı veya Kod Editörü */}
        <section
          className={`lg:col-span-5 space-y-3 ${
            mobileTab === 'work' ? 'block' : 'hidden lg:block'
          }`}
        >
          {activity.widgetType === 'matching' && activity.matchingPayload && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <MatchingWidget
                payload={activity.matchingPayload}
                pairs={state.pairs || {}}
                onChange={(pairs) => updateState((p) => ({ ...p, pairs }))}
              />
            </div>
          )}

          {activity.widgetType === 'form_builder' && activity.formBuilderPayload && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <FormBuilderWidget
                formTitle={activity.starterForm.title}
                payload={activity.formBuilderPayload}
                controls={state.controls || activity.starterForm.controls}
                onChange={(controls) => updateState((p) => ({ ...p, controls }))}
              />
            </div>
          )}

          {activity.widgetType === 'fill_blanks' && activity.fillBlanksPayload && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <FillBlanksWidget
                payload={activity.fillBlanksPayload}
                answers={state.answers || {}}
                onChange={(answers) => updateState((p) => ({ ...p, answers }))}
              />
            </div>
          )}

          {activity.widgetType === 'code_ordering' && activity.codeOrderingPayload && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <CodeOrderingWidget
                payload={activity.codeOrderingPayload}
                order={state.order || []}
                onChange={(order) => updateState((p) => ({ ...p, order }))}
              />
            </div>
          )}

          {(activity.widgetType === 'output_prediction' ||
            activity.widgetType === 'trace_viewer') &&
            activity.outputPredictionPayload && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <OutputPredictionWidget
                  payload={activity.outputPredictionPayload}
                  prediction={state.prediction || ''}
                  predictionLocked={Boolean(simResult)}
                  onChangePrediction={(prediction) =>
                    updateState((p) => ({ ...p, prediction }))
                  }
                  onRunAndCompare={() =>
                    handleRunSimulator(
                      activity.outputPredictionPayload?.simEvent,
                      activity.widgetType === 'trace_viewer'
                    )
                  }
                />
              </div>
            )}

          {(activity.widgetType === 'code_editor' ||
            activity.widgetType === 'bug_hunt') && (
            <VbaCodeEditor
              value={state.code ?? activity.starterCode}
              onChange={(code) => updateState((p) => ({ ...p, code }))}
              errorLine={simResult?.error?.line ?? null}
              activeTraceLine={activeTraceLine}
              quickCommands={activity.quickCommands}
            />
          )}

          {/* Bottom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {(activity.widgetType === 'code_editor' ||
                activity.widgetType === 'bug_hunt' ||
                activity.widgetType === 'trace_viewer') && (
                <>
                  <button
                    type="button"
                    disabled={runningSim}
                    onClick={() => handleRunSimulator(undefined, false)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                  >
                    {runningSim ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    Çalıştır
                  </button>
                  <button
                    type="button"
                    disabled={runningSim}
                    onClick={() => handleRunSimulator(undefined, true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                  >
                    <StepForward className="h-3.5 w-3.5" />
                    Adım Adım
                  </button>
                </>
              )}

              <button
                type="button"
                disabled={checking}
                onClick={handleCheck}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {checking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Kontrol Et
              </button>
            </div>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Baştan Başla
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs">
                <span className="text-rose-800 font-medium">Mevcut çalışma silinsin mi?</span>
                <button
                  type="button"
                  onClick={handleResetWork}
                  className="rounded bg-rose-600 px-2 py-0.5 font-semibold text-white"
                >
                  Evet, Sıfırla
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="text-slate-600 hover:underline"
                >
                  Vazgeç
                </button>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: Önizleme, Sanal Sayfa, İzleme, Sonuç ve Excel Kontrol Listesi */}
        <aside
          className={`lg:col-span-4 space-y-3 ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* UserForm Preview for coding / prediction / trace activities */}
          {activity.widgetType !== 'form_builder' &&
            previewControls.length > 0 && (
              <UserFormPreview
                title={activity.starterForm.title}
                controls={previewControls}
                mode="run"
                onControlChange={(name, val, listIdx) => {
                  setPreviewControls((prev) =>
                    prev.map((c) =>
                      c.name === name
                        ? {
                            ...c,
                            value: typeof listIdx === 'number' ? c.value : val,
                            listIndex: typeof listIdx === 'number' ? listIdx : c.listIndex
                          }
                        : c
                    )
                  );
                }}
                onButtonClick={(btnName) =>
                  handleRunSimulator(`${btnName}_Click`, traceMode)
                }
                onInputFocus={(name) => {
                  const ev = `${name}_Enter`;
                  if (activity.supportedEvents?.includes(ev)) {
                    handleRunSimulator(ev, traceMode);
                  }
                }}
                onInputBlur={(name) => {
                  const ev = `${name}_Exit`;
                  if (activity.supportedEvents?.includes(ev)) {
                    handleRunSimulator(ev, traceMode);
                  }
                }}
              />
            )}

          {/* Virtual Worksheet */}
          {previewSheet && (
            <VirtualSheetPreview
              sheet={previewSheet}
              readCells={simResult?.readCells}
              writtenCells={simResult?.writtenCells}
            />
          )}

          {/* Trace Viewer */}
          {traceMode && simResult && (
            <TraceViewerPanel
              trace={simResult.trace}
              currentIndex={traceIndex}
              onChangeIndex={setTraceIndex}
            />
          )}

          {/* Simulator Output & Errors */}
          {simResult && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>VBA Eğitim Simülatörü Çıktısı</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {simResult.stepsExecuted} adım
                </span>
              </div>

              {!simResult.ok && simResult.error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-900">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <div className="font-bold">Satır {simResult.error.line}</div>
                    <div>{simResult.error.message}</div>
                  </div>
                </div>
              )}

              {simResult.msgBoxes.length > 0 && (
                <div className="space-y-1">
                  {simResult.msgBoxes.map((msg, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-950"
                    >
                      <span className="font-bold mr-1">MsgBox:</span>
                      {msg}
                    </div>
                  ))}
                </div>
              )}

              {simResult.ok && simResult.msgBoxes.length === 0 && (
                <div className="text-xs text-emerald-700 font-medium">
                  Kod başarıyla çalıştı.
                </div>
              )}
            </div>
          )}

          {/* Grading Feedback */}
          {checkFeedback && (
            <div
              className={`rounded-2xl border p-4 space-y-2.5 shadow-sm ${
                checkFeedback.passed
                  ? 'border-emerald-300 bg-emerald-50/70'
                  : 'border-rose-200 bg-rose-50/70'
              }`}
            >
              <div className="flex items-start gap-2">
                {checkFeedback.passed ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-rose-600" />
                )}
                <div className="text-xs font-bold text-slate-900">
                  {checkFeedback.summaryMessage}
                </div>
              </div>

              {checkFeedback.items.length > 0 && (
                <ul className="space-y-1.5">
                  {checkFeedback.items.map((it, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${
                        it.correct
                          ? 'border-emerald-200 bg-white text-emerald-900'
                          : 'border-rose-200 bg-white text-rose-900'
                      }`}
                    >
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{it.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Excel Checklist (Student Declaration vs Teacher Verification) */}
          {activity.excelChecklist.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Excel Uygulaması Kontrol Listesi
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {activity.environment === 'web+excel' ? 'Zorunlu (Öğrenci Beyanı)' : 'İsteğe Bağlı'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Panel bilgisayarındaki Excel’i doğrudan izlemez; bu liste öğrenci beyanıdır ve öğretmen onayıyla kesinleşir.
              </p>
              <div className="space-y-1.5">
                {activity.excelChecklist.map((item, idx) => {
                  const checked = Boolean(state.excelChecklist?.[String(idx)]);
                  return (
                    <label
                      key={idx}
                      className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-xs text-slate-800 cursor-pointer hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          updateState((prev) => ({
                            ...prev,
                            excelChecklist: {
                              ...(prev.excelChecklist || {}),
                              [String(idx)]: e.target.checked
                            }
                          }))
                        }
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600"
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Teacher Feedback if present */}
          {state.teacherFeedback && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-950">
              <div className="font-bold mb-0.5">Öğretmen Geri Bildirimi:</div>
              <p>{state.teacherFeedback}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
