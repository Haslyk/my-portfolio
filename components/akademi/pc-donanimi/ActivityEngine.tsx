"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PublicActivityDefinition,
  ValidationFeedbackItem,
} from '@/lib/akademi/pc-donanimi';
import {
  apiFetch,
  ApiError,
  getStoredLeaseToken,
  setStoredLeaseToken,
  saveOfflineDraftBackup,
  getOfflineDraftBackup,
  clearOfflineDraftBackup,
  formatDurationSeconds,
  SaveIndicatorState,
} from '@/lib/akademi/pc-donanimi/api';
import { CategorizeCardsWidget } from './widgets/CategorizeCardsWidget';
import { CaseExplorerWidget } from './widgets/CaseExplorerWidget';
import { Quiz3QWidget } from './widgets/Quiz3QWidget';
import { ScenarioMatcherWidget } from './widgets/ScenarioMatcherWidget';
import { RamSimulatorWidget } from './widgets/RamSimulatorWidget';
import { AirflowSimulatorWidget } from './widgets/AirflowSimulatorWidget';
import { MonitorTroubleshootWidget } from './widgets/MonitorTroubleshootWidget';
import { CableConnectorWidget } from './widgets/CableConnectorWidget';
import { NetworkSwitchIpWidget } from './widgets/NetworkSwitchIpWidget';
import { SystemCardHomeworkWidget } from './widgets/SystemCardHomeworkWidget';
import { ActivityLeaderboardCard } from '@/components/akademi/ActivityLeaderboardCard';
import {
  ArrowLeft,
  Clock,
  Lightbulb,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Check,
  RefreshCw,
} from 'lucide-react';

interface AttemptData {
  id: string;
  activityId: string;
  activityCode: string;
  weekOrder: number;
  weekId: string;
  mode: 'normal' | 'practice';
  status: 'IN_PROGRESS' | 'COMPLETED';
  isFirstSuccess: boolean;
  state: Record<string, any>;
  revision: number;
  startedAt: string;
  completedAt: string | null;
  elapsedSeconds: number | null;
  activeSeconds: number;
  checkCount: number;
  firstSuccessSummary: {
    completedAt: string | null;
    elapsedSeconds: number | null;
    activeSeconds: number;
  } | null;
  hasOpenHelp: boolean;
}

interface ActivityEngineProps {
  studentId: string;
  initialAttempt: AttemptData;
  activity: PublicActivityDefinition;
  onSaveStateChange: (state: SaveIndicatorState) => void;
  onBackToWeek: () => void;
  onActivityCompleted: () => void;
}

export const ActivityEngine: React.FC<ActivityEngineProps> = ({
  studentId,
  initialAttempt,
  activity,
  onSaveStateChange,
  onBackToWeek,
  onActivityCompleted,
}) => {
  const [attempt, setAttempt] = useState<AttemptData>(initialAttempt);
  const [draftState, setDraftState] = useState<Record<string, any>>(() => {
    const offline = getOfflineDraftBackup(studentId, initialAttempt.id);
    if (offline && offline.revision > initialAttempt.revision) {
      return offline.state;
    }
    return initialAttempt.state || {};
  });
  const [revision, setRevision] = useState<number>(initialAttempt.revision || 1);
  const [showHint, setShowHint] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState<ValidationFeedbackItem[] | undefined>(
    undefined
  );
  const [summaryBanner, setSummaryBanner] = useState<{
    passed: boolean;
    message: string;
    earlyFinisher?: boolean;
    nextWeekUnlocked?: boolean;
  } | null>(null);
  const [leaseConflict, setLeaseConflict] = useState(false);
  const [helpStatusMsg, setHelpStatusMsg] = useState<string | null>(
    initialAttempt.hasOpenHelp ? 'Yardım isteğin öğretmene iletildi.' : null
  );
  const [helpSent, setHelpSent] = useState(Boolean(initialAttempt.hasOpenHelp));
  const [activeSecondsDisplay, setActiveSecondsDisplay] = useState<number>(
    initialAttempt.activeSeconds || 0
  );

  const lastInteractionRef = useRef<number>(Date.now());
  const isDirtyRef = useRef<boolean>(false);
  const latestDraftRef = useRef<Record<string, any>>(draftState);
  const latestRevisionRef = useRef<number>(revision);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  latestDraftRef.current = draftState;
  latestRevisionRef.current = revision;

  // Record user interaction to pause heartbeat after 90s idle
  useEffect(() => {
    const markInteraction = () => {
      lastInteractionRef.current = Date.now();
    };
    window.addEventListener('pointerdown', markInteraction, { passive: true });
    window.addEventListener('keydown', markInteraction, { passive: true });
    window.addEventListener('touchstart', markInteraction, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', markInteraction);
      window.removeEventListener('keydown', markInteraction);
      window.removeEventListener('touchstart', markInteraction);
    };
  }, []);

  const syncDraftToServer = useCallback(
    async (
      stateToSave: Record<string, any>,
      revToSave: number,
      takeover: boolean = false
    ): Promise<boolean> => {
      onSaveStateChange('saving');
      try {
        const leaseToken = getStoredLeaseToken(studentId);
        const resp = await apiFetch<{
          attemptId: string;
          revision: number;
          state: Record<string, any>;
          leaseToken?: string;
        }>(`/api/attempts/${attempt.id}/state`, {
          method: 'PATCH',
          leaseToken,
          body: JSON.stringify({
            state: stateToSave,
            revision: revToSave,
            takeover,
          }),
        });

        if (resp.leaseToken) {
          setStoredLeaseToken(studentId, resp.leaseToken);
        }
        setRevision(resp.revision);
        latestRevisionRef.current = resp.revision;
        isDirtyRef.current = false;
        setLeaseConflict(false);
        clearOfflineDraftBackup(studentId, attempt.id);
        onSaveStateChange('saved');
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.code === 'ACTIVE_LEASE_CONFLICT') {
            setLeaseConflict(true);
            onSaveStateChange('saved');
            return false;
          }
          if (err.code === 'STALE_REVISION' && err.data?.currentRevision) {
            setRevision(err.data.currentRevision);
            latestRevisionRef.current = err.data.currentRevision;
            if (err.data?.state) {
              setDraftState(err.data.state);
            }
            onSaveStateChange('saved');
            return true;
          }
          if (err.code === 'INVALID_RAM_TRANSITION') {
            setSummaryBanner({
              passed: false,
              message: err.message,
            });
            if (err.data?.state) {
              setDraftState(err.data.state);
            }
            onSaveStateChange('saved');
            return false;
          }
        }
        // Network / offline error: keep in sessionStorage and retry when online
        saveOfflineDraftBackup(studentId, attempt.id, stateToSave, revToSave);
        onSaveStateChange('offline');
        return false;
      }
    },
    [attempt.id, onSaveStateChange, studentId]
  );

  // Retry offline draft automatically when browser comes back online
  useEffect(() => {
    const handleOnline = () => {
      if (isDirtyRef.current) {
        syncDraftToServer(latestDraftRef.current, latestRevisionRef.current);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncDraftToServer]);

  // 20-second heartbeat for approximate active time measurement
  useEffect(() => {
    const sendPause = () => {
      const leaseToken = getStoredLeaseToken(studentId);
      apiFetch(`/api/attempts/${attempt.id}/pause`, {
        method: 'POST',
        leaseToken,
      }).catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendPause();
      } else {
        lastInteractionRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(async () => {
      const isVisible = document.visibilityState === 'visible';
      const idleMs = Date.now() - lastInteractionRef.current;
      const isInteractive = idleMs < 90 * 1000; // 90 seconds inactivity threshold

      if (!isVisible || !isInteractive || leaseConflict) {
        return;
      }

      try {
        const leaseToken = getStoredLeaseToken(studentId);
        const resp = await apiFetch<{
          activeSeconds: number;
          leaseToken?: string;
        }>(`/api/attempts/${attempt.id}/heartbeat`, {
          method: 'POST',
          leaseToken,
          body: JSON.stringify({
            visible: isVisible,
            interactive: isInteractive,
          }),
        });
        if (resp.leaseToken) {
          setStoredLeaseToken(studentId, resp.leaseToken);
        }
        setActiveSecondsDisplay(resp.activeSeconds);
      } catch (err) {
        if (err instanceof ApiError && err.code === 'ACTIVE_LEASE_CONFLICT') {
          setLeaseConflict(true);
        }
      }
    }, 25000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sendPause();
    };
  }, [attempt.id, leaseConflict, studentId]);

  const handleUpdateDraft = (nextState: Record<string, any>) => {
    setDraftState(nextState);
    isDirtyRef.current = true;
    saveOfflineDraftBackup(studentId, attempt.id, nextState, latestRevisionRef.current);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      syncDraftToServer(nextState, latestRevisionRef.current);
    }, 1000);
  };

  /**
   * "Sıfırla" only clears the current working draft; never deletes completion record!
   */
  const handleResetDraft = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const emptyState: Record<string, any> = {};
    setDraftState(emptyState);
    setFeedbackItems(undefined);
    setSummaryBanner(null);
    await syncDraftToServer(emptyState, latestRevisionRef.current);
  };

  /**
   * Takeover active lease from another open tab
   */
  const handleTakeoverLease = async () => {
    const ok = await syncDraftToServer(
      latestDraftRef.current,
      latestRevisionRef.current,
      true
    );
    if (ok) {
      setLeaseConflict(false);
    }
  };

  /**
   * "Kontrol Et" / "Ödevi Gönder":
   * Flushes latest draft to server first and waits for server validation response before showing completion.
   */
  const handleCheckSubmission = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsChecking(true);
    onSaveStateChange('saving');

    try {
      const leaseToken = getStoredLeaseToken(studentId);
      const idempotencyKey = `${attempt.id}-${latestRevisionRef.current}-${Date.now()}`;

      const result = await apiFetch<{
        passed: boolean;
        status: 'IN_PROGRESS' | 'COMPLETED';
        summaryMessage: string;
        items: ValidationFeedbackItem[];
        preservedState: Record<string, any>;
        revision: number;
        completedAt: string | null;
        elapsedSeconds: number | null;
        activeSeconds: number;
        checkCount: number;
        firstSuccessSummary: AttemptData['firstSuccessSummary'];
        weekCompleted: boolean;
        nextWeekUnlocked: boolean;
        earlyFinisher: boolean;
        leaseToken?: string;
      }>(`/api/attempts/${attempt.id}/check`, {
        method: 'POST',
        leaseToken,
        body: JSON.stringify({
          state: latestDraftRef.current,
          idempotencyKey,
        }),
      });

      if (result.leaseToken) {
        setStoredLeaseToken(studentId, result.leaseToken);
      }

      setRevision(result.revision);
      latestRevisionRef.current = result.revision;
      setDraftState(result.preservedState || latestDraftRef.current);
      setFeedbackItems(result.items);
      setActiveSecondsDisplay(result.activeSeconds);
      isDirtyRef.current = false;
      clearOfflineDraftBackup(studentId, attempt.id);
      onSaveStateChange('saved');

      setAttempt((prev) => ({
        ...prev,
        status: result.status,
        completedAt: result.completedAt,
        elapsedSeconds: result.elapsedSeconds,
        activeSeconds: result.activeSeconds,
        checkCount: result.checkCount,
        firstSuccessSummary: result.firstSuccessSummary || prev.firstSuccessSummary,
      }));

      setSummaryBanner({
        passed: result.passed,
        message: result.summaryMessage,
        earlyFinisher: result.earlyFinisher,
        nextWeekUnlocked: result.nextWeekUnlocked,
      });

      if (result.passed) {
        onActivityCompleted();
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'ACTIVE_LEASE_CONFLICT') {
          setLeaseConflict(true);
          onSaveStateChange('saved');
        } else if (err.code === 'NETWORK_OFFLINE') {
          onSaveStateChange('offline');
          setSummaryBanner({
            passed: false,
            message:
              'Sunucuya ulaşılamadı (Bağlantı yok). Çalışma taslağın korundu; bağlantı geldiğinde tekrar deneyebilirsin.',
          });
        } else {
          onSaveStateChange('saved');
          setSummaryBanner({
            passed: false,
            message: err.message,
          });
        }
      } else {
        onSaveStateChange('offline');
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleRequestHelp = async () => {
    try {
      const leaseToken = getStoredLeaseToken(studentId);
      const resp = await apiFetch<{
        message: string;
      }>(`/api/attempts/${attempt.id}/help`, {
        method: 'POST',
        leaseToken,
        body: JSON.stringify({
          message: `${activity.code} etkinliğinde yardım istiyor.`,
        }),
      });
      setHelpSent(true);
      setHelpStatusMsg(resp.message || 'Yardım isteğin öğretmene iletildi.');
    } catch (err) {
      if (err instanceof ApiError) {
        setHelpStatusMsg(err.message);
      }
    }
  };

  const isCompletedOnce =
    attempt.status === 'COMPLETED' || Boolean(attempt.firstSuccessSummary?.completedAt);
  const overAllocatedTime = activeSecondsDisplay > activity.allocatedSeconds;

  return (
    <div className="space-y-6">
      {/* Multi-Tab Active Lease Conflict Banner */}
      {leaseConflict && (
        <div
          role="alert"
          className="bg-amber-50 border-2 border-[#F5A000] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-[#F5A000] shrink-0" />
            <div>
              <div className="font-bold text-slate-900 text-sm sm:text-base">
                Başka bir sekmede açık
              </div>
              <div className="text-xs sm:text-sm text-slate-700">
                Aktif çalışma süresinin çift sayılmaması için aynı anda tek sekmede çalışılır.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTakeoverLease}
            className="px-4 py-2 rounded-xl bg-[#1E1B38] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold"
          >
            Bu Sekmeden Devral
          </button>
        </div>
      )}

      {/* Top Breadcrumb + Back button + Status Badge */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToWeek}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Hafta Ekranına Dön</span>
            </button>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#1E1B38] text-[#F5A000]">
              {activity.code.replace(/^D-/, '')}
            </span>
            {String(attempt.mode).toLowerCase() === 'practice' && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 text-[#6D28D9]">
                Tekrar Çalışma Modu (İlk Başarı Korunur)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Non-closing friendly duration info */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
              <Clock className="w-4 h-4 text-[#6D28D9]" />
              <span>
                Tahmini {activity.estimatedMinutes} dk · Ayrılan {activity.allocatedMinutes} dk · Etkin:{' '}
                {formatDurationSeconds(activeSecondsDisplay)}
              </span>
            </div>

            {isCompletedOnce && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-400 text-emerald-950 text-xs sm:text-sm font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Tamamlandı · Kaydedildi</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & Purpose & Numbered Instructions */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Panel yolu: {activity.panelPath}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B38]">
              {activity.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-medium mt-1">
              <strong className="text-slate-900">Amaç:</strong> {activity.purpose}
            </p>
            {activity.pedagogicalNote && (
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-2">
                ℹ️ {activity.pedagogicalNote}
              </p>
            )}

            {overAllocatedTime && (
              <p className="text-xs font-semibold text-purple-900 bg-purple-50 border border-purple-200 rounded-xl p-2.5 mt-2">
                ⏱️ 10 dakikalık sınıf süresi aşıldı: Devam edebilirsin, çalışman kapanmaz.
              </p>
            )}
          </div>

          <div className="lg:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6D28D9] mb-2">
              Numaralı Yönergeler
            </h3>
            <ol className="space-y-1.5 text-xs sm:text-sm text-slate-800 font-medium list-decimal list-inside">
              {activity.instructions.map((inst, i) => (
                <li key={i} className="leading-snug">
                  {inst}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Validation Result Summary Banner */}
      {summaryBanner && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border-2 p-5 shadow-sm ${
            summaryBanner.passed
              ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
              : 'bg-amber-50 border-[#F5A000] text-amber-950'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {summaryBanner.passed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-extrabold text-base sm:text-lg">
                  {summaryBanner.passed
                    ? 'Tamamlandı · Kaydedildi'
                    : 'Bazı Adımları Düzeltelim'}
                </div>
                <p className="text-sm font-medium mt-0.5">{summaryBanner.message}</p>
                {summaryBanner.nextWeekUnlocked && (
                  <p className="text-xs sm:text-sm font-bold text-emerald-800 mt-1">
                    🎉 Bu haftanın tüm zorunlu görevlerini tamamladın; sonraki hafta açıldı!
                  </p>
                )}
              </div>
            </div>

            {summaryBanner.passed && (
              <button
                type="button"
                onClick={onBackToWeek}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm"
              >
                Hafta Ekranına Geç
              </button>
            )}
          </div>

          {/* Optional Early Finisher Thinking Prompt (Never required for week unlock) */}
          {summaryBanner.passed && activity.earlyFinisherPrompt && (
            <div className="mt-4 pt-3 border-t border-emerald-200 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-800">
                <strong className="text-[#6D28D9]">
                  Düşünme Sorusu (İsteğe Bağlı · Kilit Açma Şartı Değildir):
                </strong>{' '}
                {activity.earlyFinisherPrompt}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Activity Widget Body */}
      <div className="bg-slate-50/50">
        {activity.widgetType === 'categorize_cards' && (
          <CategorizeCardsWidget
            cards={activity.payload.cards || []}
            categories={activity.payload.categories || []}
            state={draftState}
            onChangeState={handleUpdateDraft}
            feedbackItems={feedbackItems}
          />
        )}

        {activity.widgetType === 'case_explorer_2d_3d' && (
          <CaseExplorerWidget
            hotspotParts={activity.payload.hotspotParts || []}
            allowOptional3D={activity.payload.allowOptional3D}
            state={draftState}
            onChangeState={handleUpdateDraft}
            feedbackItems={feedbackItems}
          />
        )}

        {activity.widgetType === 'quiz_3q' && (
          <Quiz3QWidget
            questions={activity.payload.questions || []}
            state={draftState}
            onChangeState={handleUpdateDraft}
            feedbackItems={feedbackItems}
          />
        )}

        {activity.widgetType === 'scenario_matcher' && (
          <ScenarioMatcherWidget
            activityCode={activity.code}
            scenarios={activity.payload.scenarios || []}
            sharedOptions={activity.payload.sharedOptions}
            state={draftState}
            onChangeState={handleUpdateDraft}
            feedbackItems={feedbackItems}
          />
        )}

        {activity.widgetType === 'ram_simulator' && (
          <RamSimulatorWidget
            allowOptional3D={activity.payload.allowOptional3D}
            state={draftState}
            onChangeState={handleUpdateDraft}
            feedbackItems={feedbackItems}
          />
        )}

        {activity.widgetType === 'airflow_simulator' && (
          <AirflowSimulatorWidget
            state={draftState}
            onChangeState={handleUpdateDraft}
            feedbackItems={feedbackItems}
          />
        )}

        {activity.widgetType === 'monitor_troubleshoot' && (
          <MonitorTroubleshootWidget
            state={draftState}
            onChangeState={handleUpdateDraft}
            feedbackItems={feedbackItems}
          />
        )}

        {activity.widgetType === 'cable_connector' && (
          <CableConnectorWidget
            cables={activity.payload.cables || []}
            ports={activity.payload.ports || []}
            state={draftState}
            onChangeState={handleUpdateDraft}
            feedbackItems={feedbackItems}
          />
        )}

        {activity.widgetType === 'network_switch_ip' && (
          <NetworkSwitchIpWidget
            networkConfig={activity.payload.networkConfig}
            state={draftState}
            onChangeState={handleUpdateDraft}
            feedbackItems={feedbackItems}
          />
        )}

        {activity.widgetType === 'system_card_homework' && (
          <SystemCardHomeworkWidget
            systemParts={activity.payload.systemParts || []}
            roleOptions={activity.payload.roleOptions || []}
            scenarios={activity.payload.scenarios || []}
            state={draftState}
            onChangeState={handleUpdateDraft}
            feedbackItems={feedbackItems}
          />
        )}
      </div>

      {/* Hint Box */}
      {showHint && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 flex items-start gap-3 text-sm text-purple-950 font-medium">
          <Lightbulb className="w-5 h-5 text-[#6D28D9] shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">İpucu:</strong> {activity.hint}
          </div>
        </div>
      )}

      {/* Bottom Action Bar: Kontrol Et / Ödevi Gönder, İpucu, Sıfırla, Yardım İste */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHint((p) => !p)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6D28D9] text-xs sm:text-sm font-bold transition"
          >
            <Lightbulb className="w-4 h-4" />
            <span>{showHint ? 'İpucunu Gizle' : 'İpucu Göster'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetDraft}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sıfırla</span>
          </button>

          <button
            type="button"
            onClick={handleRequestHelp}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              helpSent
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#F5A000]" />
            <span>{helpSent ? 'Yardım İsteği Açık' : 'Yardım İste'}</span>
          </button>
          {helpStatusMsg && (
            <span className="text-xs font-semibold text-slate-600">{helpStatusMsg}</span>
          )}
        </div>

        <button
          type="button"
          disabled={isChecking}
          onClick={handleCheckSubmission}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5A000] hover:bg-amber-500 active:bg-amber-600 text-[#1E1B38] text-sm sm:text-base font-extrabold shadow-md transition disabled:opacity-60"
        >
          {isChecking ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Kontrol Ediliyor...</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>{activity.submitButtonText}</span>
            </>
          )}
        </button>
      </div>

      {/* Live Class Speed & Accuracy Leaderboard */}
      <ActivityLeaderboardCard
        courseCode="pc-donanimi"
        activityCode={activity.code}
      />
    </div>
  );
};
