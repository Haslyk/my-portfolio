"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivityPublicConfig,
  CheckResultResponse,
  ValidationFeedbackItem
} from '@/lib/akademi/shared';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  Clock,
  Sparkles,
  RefreshCw,
  Loader2,
  Layers,
  Trophy,
  Award,
  Flame
} from 'lucide-react';
import {
  ApiError,
  apiRequest,
  clearOfflineDraft,
  formatDurationTr,
  loadOfflineDraft,
  saveOfflineDraft
} from '@/lib/akademi/apiClient';
import { SaveIndicatorState } from './StudentHeader';
import { CardMatchingWidget } from './widgets/CardMatchingWidget';
import { ScenarioChoiceWidget } from './widgets/ScenarioChoiceWidget';
import { OrderingWidget } from './widgets/OrderingWidget';
import { NetworkBuilderWidget } from './widgets/NetworkBuilderWidget';
import { IpAssignmentWidget } from './widgets/IpAssignmentWidget';
import { ArpSimulationWidget } from './widgets/ArpSimulationWidget';
import { PathTrackerWidget } from './widgets/PathTrackerWidget';
import { MultiStepHomeworkWidget } from './widgets/MultiStepHomeworkWidget';
import { WeekQuizWidget } from './widgets/WeekQuizWidget';

export interface ActiveAttemptSession {
  attemptId: string;
  activityId: string;
  activityCode: string;
  title: string;
  shortPurpose: string;
  category: string;
  required: boolean;
  expectedSeconds: number;
  allocatedSeconds: number;
  mode: 'NORMAL' | 'PRACTICE';
  status: 'IN_PROGRESS' | 'COMPLETED';
  initialState: Record<string, any>;
  initialRevision: number;
  initialActiveSeconds: number;
  leaseToken: string;
  config: ActivityPublicConfig;
}

interface ActivityEngineProps {
  studentId: string;
  session: ActiveAttemptSession;
  onSaveStateChange: (state: SaveIndicatorState) => void;
  onBackToWeek: () => void;
  onActivityCompleted: () => void;
}

export const ActivityEngine: React.FC<ActivityEngineProps> = ({
  studentId,
  session,
  onSaveStateChange,
  onBackToWeek,
  onActivityCompleted
}) => {
  const [draftState, setDraftState] = useState<Record<string, any>>(() => {
    const offline = loadOfflineDraft(studentId, session.attemptId);
    if (offline && offline.revision >= session.initialRevision) {
      return offline.state;
    }
    return session.initialState || {};
  });
  const [revision, setRevision] = useState<number>(() => {
    const offline = loadOfflineDraft(studentId, session.attemptId);
    if (offline && offline.revision >= session.initialRevision) {
      return offline.revision;
    }
    return session.initialRevision || 1;
  });
  const [leaseToken, setLeaseToken] = useState<string>(session.leaseToken);
  const [activeSeconds, setActiveSeconds] = useState<number>(
    session.initialActiveSeconds || 0
  );
  const [attemptStatus, setAttemptStatus] = useState<'IN_PROGRESS' | 'COMPLETED'>(
    session.status
  );
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showEarlyFinisherAnswer, setShowEarlyFinisherAnswer] =
    useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkCountLocal, setCheckCountLocal] = useState<number>(0);
  const [checkSummary, setCheckSummary] = useState<{
    passed: boolean;
    message: string;
    nextWeekUnlocked?: boolean;
  } | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<ValidationFeedbackItem[]>(
    []
  );
  const [leaseConflict, setLeaseConflict] = useState<boolean>(false);
  const [isIdlePaused, setIsIdlePaused] = useState<boolean>(false);

  const lastInteractionRef = useRef<number>(Date.now());
  const pendingStateRef = useRef<Record<string, any> | null>(null);
  const revisionRef = useRef<number>(revision);
  const leaseTokenRef = useRef<string>(leaseToken);

  useEffect(() => {
    revisionRef.current = revision;
  }, [revision]);

  useEffect(() => {
    leaseTokenRef.current = leaseToken;
  }, [leaseToken]);

  // Save draft helper
  const persistDraftToServer = useCallback(
    async (stateToSave: Record<string, any>, revToUse: number) => {
      onSaveStateChange('SAVING');
      try {
        const res = await apiRequest<{
          attemptId: string;
          revision: number;
          state: Record<string, any>;
        }>(`/api/attempts/${session.attemptId}/state`, {
          method: 'PATCH',
          body: JSON.stringify({
            state: stateToSave,
            revision: revToUse,
            leaseToken: leaseTokenRef.current
          })
        });
        setRevision(res.revision);
        revisionRef.current = res.revision;
        pendingStateRef.current = null;
        clearOfflineDraft(studentId, session.attemptId);
        onSaveStateChange('SAVED');
      } catch (err) {
        if (err instanceof ApiError && err.code === 'STALE_REVISION') {
          if (err.payload?.currentRevision) {
            setRevision(err.payload.currentRevision);
            revisionRef.current = err.payload.currentRevision;
          }
          onSaveStateChange('SAVED');
          return;
        }
        // Network error or offline: preserve draft locally and retry when online
        saveOfflineDraft(
          studentId,
          session.attemptId,
          stateToSave,
          revToUse
        );
        onSaveStateChange('OFFLINE_RETRY');
      }
    },
    [onSaveStateChange, session.attemptId, studentId]
  );

  // Debounced auto-save on meaningful state change
  useEffect(() => {
    if (!pendingStateRef.current) return;
    const timer = setTimeout(() => {
      if (pendingStateRef.current) {
        persistDraftToServer(pendingStateRef.current, revisionRef.current);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [draftState, persistDraftToServer]);

  // Retry offline draft when browser regains connection
  useEffect(() => {
    const handleOnline = () => {
      const offline = loadOfflineDraft(studentId, session.attemptId);
      if (offline) {
        persistDraftToServer(offline.state, offline.revision);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [persistDraftToServer, session.attemptId, studentId]);

  const handleStateChange = (nextState: Record<string, any>) => {
    lastInteractionRef.current = Date.now();
    if (isIdlePaused) setIsIdlePaused(false);
    setDraftState(nextState);
    pendingStateRef.current = nextState;
    saveOfflineDraft(studentId, session.attemptId, nextState, revisionRef.current);
  };

  // Track user interactions for 90-second inactivity pause rule
  useEffect(() => {
    const markInteraction = () => {
      lastInteractionRef.current = Date.now();
      setIsIdlePaused((prev) => (prev ? false : prev));
    };
    window.addEventListener('keydown', markInteraction, { passive: true });
    window.addEventListener('pointerdown', markInteraction, { passive: true });
    window.addEventListener('mousemove', markInteraction, { passive: true });
    window.addEventListener('touchstart', markInteraction, { passive: true });

    return () => {
      window.removeEventListener('keydown', markInteraction);
      window.removeEventListener('pointerdown', markInteraction);
      window.removeEventListener('mousemove', markInteraction);
      window.removeEventListener('touchstart', markInteraction);
    };
  }, []);

  // Pause when tab becomes hidden or component unmounts
  const sendPause = useCallback(async () => {
    try {
      await apiRequest(`/api/attempts/${session.attemptId}/pause`, {
        method: 'POST',
        body: JSON.stringify({ leaseToken: leaseTokenRef.current })
      });
    } catch {
      // Ignore network errors on pause
    }
  }, [session.attemptId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendPause();
      } else {
        lastInteractionRef.current = Date.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sendPause();
    };
  }, [sendPause]);

  // 20-second Heartbeat loop while visible, not idle (>90s), and not lease-conflicted
  useEffect(() => {
    if (leaseConflict) return;

    const interval = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;

      const idleMs = Date.now() - lastInteractionRef.current;
      if (idleMs > 90 * 1000) {
        if (!isIdlePaused) {
          setIsIdlePaused(true);
          sendPause();
        }
        return;
      }

      try {
        const res = await apiRequest<{
          activeSeconds: number;
        }>(`/api/attempts/${session.attemptId}/heartbeat`, {
          method: 'POST',
          body: JSON.stringify({ leaseToken: leaseTokenRef.current })
        });
        setActiveSeconds(res.activeSeconds);
      } catch (err) {
        if (err instanceof ApiError && err.code === 'LEASE_CONFLICT') {
          setLeaseConflict(true);
        }
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [isIdlePaused, leaseConflict, sendPause, session.attemptId]);

  const handleTakeoverLease = async () => {
    try {
      const res = await apiRequest<{
        leaseToken: string;
        activeSeconds: number;
      }>(`/api/attempts/${session.attemptId}/heartbeat`, {
        method: 'POST',
        body: JSON.stringify({ takeover: true })
      });
      setLeaseToken(res.leaseToken);
      leaseTokenRef.current = res.leaseToken;
      setActiveSeconds(res.activeSeconds);
      setLeaseConflict(false);
      lastInteractionRef.current = Date.now();
    } catch {
      // ignore
    }
  };

  // Reset only clears the current working draft, NEVER deletes previous completion
  const handleResetDraft = () => {
    const emptyState: Record<string, any> = {};
    setDraftState(emptyState);
    setFeedbackItems([]);
    setCheckSummary(null);
    pendingStateRef.current = emptyState;
    persistDraftToServer(emptyState, revisionRef.current);
  };

  // Server-authoritative Check ("Kontrol Et")
  const handleCheck = async () => {
    setIsChecking(true);
    setCheckSummary(null);
    try {
      const res = await apiRequest<CheckResultResponse & { revision?: number }>(
        `/api/attempts/${session.attemptId}/check`,
        {
          method: 'POST',
          body: JSON.stringify({
            state: draftState
          })
        }
      );

      setFeedbackItems(res.feedbackItems || []);
      setActiveSeconds(res.activeSeconds);
      setCheckCountLocal(res.checkCount || 1);
      if (res.revision) {
        setRevision(res.revision);
        revisionRef.current = res.revision;
      }
      clearOfflineDraft(studentId, session.attemptId);
      onSaveStateChange('SAVED');

      if (res.passed) {
        setAttemptStatus('COMPLETED');
        setCheckSummary({
          passed: true,
          message: res.summaryMessage,
          nextWeekUnlocked: res.nextWeekUnlocked
        });
        onActivityCompleted();
      } else {
        setCheckSummary({
          passed: false,
          message: res.summaryMessage
        });
      }
    } catch (err) {
      // Never show fake completion on network disconnect!
      onSaveStateChange('OFFLINE_RETRY');
      setCheckSummary({
        passed: false,
        message:
          err instanceof ApiError
            ? err.message
            : 'Sunucuya ulaşılamadı. Bağlantınız geldiğinde çalışmanız korunacak; lütfen tekrar "Kontrol Et" düğmesine basın.'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const isOverAllocatedTime = activeSeconds > session.allocatedSeconds;
  const isEarlyFinisher =
    attemptStatus === 'COMPLETED' && activeSeconds < session.allocatedSeconds;

  const renderWidget = () => {
    switch (session.config.widgetType) {
      case 'CARD_MATCHING':
        return (
          <CardMatchingWidget
            config={session.config}
            state={draftState}
            onChange={handleStateChange}
            feedbackItems={feedbackItems}
          />
        );
      case 'SCENARIO_CHOICE':
        return (
          <ScenarioChoiceWidget
            config={session.config}
            state={draftState}
            onChange={handleStateChange}
            feedbackItems={feedbackItems}
          />
        );
      case 'ORDERING':
        return (
          <OrderingWidget
            config={session.config}
            state={draftState}
            onChange={handleStateChange}
            feedbackItems={feedbackItems}
          />
        );
      case 'NETWORK_BUILDER':
        return (
          <NetworkBuilderWidget
            config={session.config}
            state={draftState}
            onChange={handleStateChange}
            feedbackItems={feedbackItems}
          />
        );
      case 'IP_ASSIGNMENT':
        return (
          <IpAssignmentWidget
            config={session.config}
            state={draftState}
            onChange={handleStateChange}
            feedbackItems={feedbackItems}
          />
        );
      case 'ARP_SIMULATION':
        return (
          <ArpSimulationWidget
            config={session.config}
            state={draftState}
            onChange={handleStateChange}
            feedbackItems={feedbackItems}
          />
        );
      case 'PATH_TRACKER':
        return (
          <PathTrackerWidget
            config={session.config}
            state={draftState}
            onChange={handleStateChange}
            feedbackItems={feedbackItems}
          />
        );
      case 'MULTI_STEP_HOMEWORK':
        return (
          <MultiStepHomeworkWidget
            config={session.config}
            state={draftState}
            onChange={handleStateChange}
            feedbackItems={feedbackItems}
          />
        );
      case 'WEEK_QUIZ':
        return (
          <WeekQuizWidget
            config={session.config}
            state={draftState}
            onChange={handleStateChange}
            feedbackItems={feedbackItems}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Multi-tab Lease Conflict Banner */}
      {leaseConflict && (
        <div
          role="alert"
          className="bg-amber-100 border-2 border-amber-500 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-amber-950"
        >
          <div className="flex items-start gap-3">
            <Layers className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-base">
                Başka Bir Sekmede Açık
              </h4>
              <p className="text-sm font-medium">
                Sürenin iki sekmede çift sayılmaması için bu sekmede süre sayacı
                duraklatıldı. Bu sekmeden devam etmek istiyorsan çalışmayı
                devralabilirsin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleTakeoverLease}
            className="px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white text-sm font-extrabold"
          >
            Bu Sekmede Devral ve Devam Et
          </button>
        </div>
      )}

      {/* Top Activity Header Bar */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <button
            type="button"
            onClick={onBackToWeek}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-brand-navy text-sm font-extrabold border border-slate-300"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Hafta Ekranına Dön</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {session.mode === 'PRACTICE' && (
              <span className="px-3 py-1 rounded-full bg-purple-100 text-brand-purple border border-purple-300 text-xs font-extrabold">
                Tekrar Çalışma Modu (İlk Başarın Korunuyor)
              </span>
            )}

            {/* Time Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-xs sm:text-sm font-bold text-slate-800">
              <Clock className="w-4 h-4 text-brand-purple" aria-hidden="true" />
              <span>
                Etkin Süre: <strong>{formatDurationTr(activeSeconds)}</strong> /{' '}
                Ayrılan: {Math.round(session.allocatedSeconds / 60)} dk
              </span>
            </div>

            {/* Status Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold border ${
                attemptStatus === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {attemptStatus === 'COMPLETED' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Tamamlandı</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-amber-700" />
                  <span>Devam Ediyor</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand-purple mb-1">
          <span>{session.activityCode}</span>
          <span>·</span>
          <span>
            Tahmini Çalışma {Math.round(session.expectedSeconds / 60)} dk
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy">
          {session.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-700 mt-1 font-medium">
          <strong>Amaç:</strong> {session.shortPurpose}
        </p>

        {/* Non-punitive 10-minute exceeded message */}
        {isOverAllocatedTime && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-900">
            Ayrılan 10 dakikalık süre doldu ancak hiç sorun değil —{' '}
            <strong>Devam edebilirsin!</strong> Çalışman kapanmaz ve puan
            kaybı yaşanmaz.
          </div>
        )}

        {/* Numbered Instructions */}
        <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-2">
            Adım Adım Yönergeler
          </h3>
          <ol className="space-y-1.5">
            {session.config.instructions.map((inst, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm text-slate-800 font-medium"
              >
                <span className="w-5 h-5 rounded-full bg-brand-navy text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{inst}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Main Interactive Widget Area */}
      <div>{renderWidget()}</div>

      {/* Validation Summary Banner with Gamified Achievement Badges */}
      {checkSummary && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-3xl border-2 p-6 shadow-md transition-all ${
            checkSummary.passed
              ? 'bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 border-emerald-500 text-emerald-950'
              : 'bg-amber-50 border-amber-500 text-amber-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              {checkSummary.passed ? (
                <div className="w-14 h-14 rounded-2xl bg-brand-orange text-brand-navy flex items-center justify-center shrink-0 shadow-md border-2 border-brand-navy">
                  <Trophy className="w-8 h-8" aria-hidden="true" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-7 h-7" aria-hidden="true" />
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-extrabold text-lg sm:text-xl text-brand-navy">
                    {checkSummary.passed
                      ? 'Görev Tamamlandı! Ağ Bağlantısı Onaylandı!'
                      : 'Bazı Noktaları Düzeltmemiz Gerekiyor'}
                  </h4>
                  {checkSummary.passed && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-xs font-extrabold">
                      <Award className="w-3.5 h-3.5" />
                      <span>+100 Atölye Puanı</span>
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-800">
                  {checkSummary.message}
                </p>

                {/* Gamified Achievement Pills on Pass */}
                {checkSummary.passed && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {checkCountLocal === 1 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 text-brand-purple border border-purple-300 text-xs font-extrabold">
                        <Flame className="w-4 h-4 text-brand-orangeDark" />
                        <span>Kusursuz Tek Atış! (İlk Denemede Doğru)</span>
                      </span>
                    )}
                    {isEarlyFinisher && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 text-xs font-extrabold">
                        <Sparkles className="w-4 h-4 text-amber-700" />
                        <span>Hızlı Teknisyen (10 dk Süreden Önce Tamamladın)</span>
                      </span>
                    )}
                  </div>
                )}

                {checkSummary.nextWeekUnlocked && (
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-navy text-brand-orange font-extrabold text-xs sm:text-sm shadow-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      Harika! Bu haftanın tüm zorunlu görevlerini bitirdin ve
                      SONRAKİ HAFTANIN KİLİDİ AÇILDI!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {checkSummary.passed && (
              <button
                type="button"
                onClick={onBackToWeek}
                className="px-6 py-3.5 rounded-2xl bg-brand-navy hover:bg-brand-navyLight text-white text-sm sm:text-base font-extrabold shrink-0 shadow-md"
              >
                Hafta Ekranına Dön →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Optional Early Finisher Thinking Prompt (not added to unlock requirement) */}
      {isEarlyFinisher && session.config.earlyFinisherPrompt && (
        <div className="bg-purple-50 border-2 border-brand-purple/40 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-brand-purple shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-purple text-white">
                  Erken Bitirenlere Mini Düşünme Sorusu (İsteğe Bağlı)
                </span>
              </div>
              <p className="text-base font-extrabold text-brand-navy mt-2">
                {session.config.earlyFinisherPrompt.question}
              </p>
              {!showEarlyFinisherAnswer ? (
                <button
                  type="button"
                  onClick={() => setShowEarlyFinisherAnswer(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-white hover:bg-purple-100 text-brand-purple border border-purple-300 text-xs sm:text-sm font-extrabold"
                >
                  Açıklamayı Gör
                </button>
              ) : (
                <p className="mt-2 text-sm text-slate-800 bg-white p-3.5 rounded-xl border border-purple-200 font-medium">
                  {session.config.earlyFinisherPrompt.explanation}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hint Box */}
      {showHint && (
        <div className="bg-amber-50 border-2 border-brand-orange rounded-2xl p-4 text-sm text-amber-950 font-semibold flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-brand-orangeDark shrink-0 mt-0.5" />
          <div>
            <div className="font-extrabold text-brand-navy mb-0.5">İpucu:</div>
            <div>{session.config.hint}</div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar: Kontrol Et, İpucu, Sıfırla */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowHint((h) => !h)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-sm font-extrabold border border-amber-300"
          >
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            <span>{showHint ? 'İpucunu Gizle' : 'İpucu Göster'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetDraft}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-extrabold border border-slate-300"
            title="Yalnızca ekrandaki mevcut çalışma taslağını temizler; önceki başarı kaydını silmez"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Taslağı Sıfırla</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCheck}
          disabled={isChecking}
          className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orangeDark text-brand-navy text-base font-extrabold shadow-md transition-all disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-brand-orange/40"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span>Kontrol Ediliyor...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              <span>Kontrol Et</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
