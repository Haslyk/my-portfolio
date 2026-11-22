"use client";
import React, { useState } from 'react';
import {
  ActivityPublicConfig,
  NetworkEdgeDraft,
  ValidationFeedbackItem
} from '@/lib/akademi/shared';
import {
  Smartphone,
  Tv,
  Monitor,
  Cable,
  Wifi,
  CheckCircle2,
  AlertCircle,
  Info,
  Printer,
  Router as RouterIcon
} from 'lucide-react';
import { NetworkBuilderCanvas } from './NetworkBuilderWidget';
import { OrderedPathSelector } from './PathTrackerWidget';
import { CustomSelect } from '../CustomSelect';

interface WidgetProps {
  config: ActivityPublicConfig;
  state: Record<string, any>;
  onChange: (nextState: Record<string, any>) => void;
  feedbackItems: ValidationFeedbackItem[];
}

export const MultiStepHomeworkWidget: React.FC<WidgetProps> = ({
  config,
  state,
  onChange,
  feedbackItems
}) => {
  const hw = config.multiStepHomework;
  const [activeCapstoneStep, setActiveCapstoneStep] = useState<number>(1);
  if (!hw) return null;

  // ==========================================================================
  // W1-H: Evimin BaÄŸlantÄ±larÄ±nÄ± TanÄ±yorum
  // ==========================================================================
  if (hw.weekCode === 'W1-H' && hw.homeDevices) {
    const prefs: Record<string, string> =
      state.devicePreferences && typeof state.devicePreferences === 'object'
        ? state.devicePreferences
        : {};
    const sameLanAnswer = String(state.sameLanAnswer || '');

    const getDeviceIcon = (iconName: string) => {
      if (iconName === 'Smartphone')
        return <Smartphone className="w-6 h-6 text-brand-purple" />;
      if (iconName === 'Tv') return <Tv className="w-6 h-6 text-brand-purple" />;
      return <Monitor className="w-6 h-6 text-brand-purple" />;
    };

    return (
      <div className="space-y-6">
        {hw.assumptionNote && (
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-950 font-medium">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <span>{hw.assumptionNote}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hw.homeDevices.map((dev) => {
            const currentPref = prefs[dev.id] || '';
            const fb = feedbackItems.find((f) => f.fieldId === dev.id);

            return (
              <div
                key={dev.id}
                className={`bg-white rounded-2xl border-2 p-5 flex flex-col justify-between transition-all ${
                  fb
                    ? fb.isCorrect
                      ? 'border-emerald-500'
                      : 'border-amber-500'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-purple-50">
                      {getDeviceIcon(dev.iconName)}
                    </div>
                    <h4 className="font-extrabold text-brand-navy text-base">
                      {dev.label}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-4">
                    {dev.description}
                  </p>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...state,
                          devicePreferences: {
                            ...prefs,
                            [dev.id]: 'wired'
                          }
                        })
                      }
                      className={`w-full flex items-center gap-2.5 p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                        currentPref === 'wired'
                          ? 'bg-brand-navy text-white border-brand-navy'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-300'
                      }`}
                    >
                      <Cable className="w-4 h-4 shrink-0" />
                      <span>Kablolu (Ethernet)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...state,
                          devicePreferences: {
                            ...prefs,
                            [dev.id]: 'wireless'
                          }
                        })
                      }
                      className={`w-full flex items-center gap-2.5 p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                        currentPref === 'wireless'
                          ? 'bg-brand-purple text-white border-brand-purple'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-300'
                      }`}
                    >
                      <Wifi className="w-4 h-4 shrink-0" />
                      <span>Kablosuz (Wi-Fi)</span>
                    </button>
                  </div>
                </div>

                {fb && (
                  <div
                    className={`mt-3 p-2.5 rounded-lg text-xs font-semibold flex items-start gap-1.5 ${
                      fb.isCorrect
                        ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                        : 'bg-amber-50 text-amber-950 border border-amber-300'
                    }`}
                  >
                    {fb.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <span>{fb.message}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final Question: Can they connect to the same LAN? */}
        {hw.finalQuestion && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
            <h4 className="font-extrabold text-brand-navy text-base sm:text-lg mb-3">
              {hw.finalQuestion.prompt}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hw.finalQuestion.options.map((opt) => {
                const active = sameLanAnswer === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...state,
                        sameLanAnswer: opt.id
                      })
                    }
                    className={`p-3.5 rounded-xl border-2 text-left font-bold text-sm sm:text-base transition-all ${
                      active
                        ? 'bg-brand-navy text-white border-brand-navy'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {feedbackItems.find((f) => f.fieldId === 'sameLanAnswer') && (
              <div
                className={`mt-3 p-3 rounded-xl text-sm font-semibold flex items-start gap-2 ${
                  feedbackItems.find((f) => f.fieldId === 'sameLanAnswer')
                    ?.isCorrect
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                    : 'bg-amber-50 text-amber-950 border border-amber-300'
                }`}
              >
                <span>
                  {
                    feedbackItems.find((f) => f.fieldId === 'sameLanAnswer')
                      ?.message
                  }
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // W5-H: KÃ¼Ã§Ã¼k AÄŸÄ±mÄ± TamamlÄ±yorum (4 AdÄ±mlÄ± Final Ã–ncesi Ã–dev)
  // ==========================================================================
  if (hw.weekCode === 'W5-H' && hw.capstone) {
    const cap = hw.capstone;
    const edges: NetworkEdgeDraft[] = Array.isArray(state.edges)
      ? state.edges
      : [];
    const ipAssignments: Record<string, string> =
      state.ipAssignments && typeof state.ipAssignments === 'object'
        ? state.ipAssignments
        : {};
    const localPath: string[] = Array.isArray(state.localPath)
      ? state.localPath
      : [];
    const externalPath: string[] = Array.isArray(state.externalPath)
      ? state.externalPath
      : [];

    const stepFeedbacks = [
      feedbackItems.find((f) => f.fieldId === 'step1_topology'),
      feedbackItems.find((f) => f.fieldId === 'step2_ip'),
      feedbackItems.find((f) => f.fieldId === 'step3_local_path'),
      feedbackItems.find((f) => f.fieldId === 'step4_external_path')
    ];

    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-950 font-semibold">
          <strong>Final Ã–ncesi Uygulama Ã–devi:</strong> Bu Ã¶devde 4 adÄ±mÄ± sÄ±rayla
          tamamlayacaksÄ±n. Her adÄ±mdaki Ã§alÄ±ÅŸman otomatik kaydedilir ve sayfa
          yenilense bile korunur.
        </div>

        {/* 4 Step Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { num: 1, label: '1. AÄŸ BaÄŸlantÄ±larÄ±' },
            { num: 2, label: '2. IP Adresleme' },
            { num: 3, label: '3. Yerel YazÄ±cÄ± Yolu' },
            { num: 4, label: '4. DÄ±ÅŸ AÄŸ Yolu' }
          ].map((tab, idx) => {
            const fb = stepFeedbacks[idx];
            const isCurrent = activeCapstoneStep === tab.num;
            return (
              <button
                key={tab.num}
                type="button"
                onClick={() => setActiveCapstoneStep(tab.num)}
                className={`p-3 rounded-xl border-2 text-left font-extrabold text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${
                  isCurrent
                    ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                    : fb?.isCorrect
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-400'
                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                {fb && (
                  <span>
                    {fb.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Step 1: Connections */}
        {activeCapstoneStep === 1 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h4 className="font-extrabold text-brand-navy text-base">
                AdÄ±m 1: CihazlarÄ± BaÄŸla
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                PC 1, PC 2 ve YazÄ±cÄ± cihazlarÄ±nÄ± â†” Switchâ€™e; Switchâ€™i de â†”
                YÃ¶nlendiriciye (.1) kablolu olarak baÄŸla (Toplam 4 kablolu
                baÄŸlantÄ±).
              </p>
            </div>
            <NetworkBuilderCanvas
              nodes={cap.nodes.filter((n) => n.id !== 'remote_server')}
              allowedConnectionTypes={['wired']}
              defaultConnectionType="wired"
              edges={edges}
              onEdgesChange={(nextEdges) =>
                onChange({ ...state, edges: nextEdges })
              }
              feedbackItems={stepFeedbacks[0] ? [stepFeedbacks[0]] : []}
            />
          </div>
        )}

        {/* Step 2: IP Addressing */}
        {activeCapstoneStep === 2 && (
          <div className="space-y-4">
            <div className="bg-brand-navy text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <RouterIcon className="w-5 h-5 text-brand-orange" />
                <span className="font-bold text-sm">
                  YÃ¶nlendirici (GeÃ§it):{' '}
                  <strong className="text-brand-orange font-mono">
                    {cap.gatewayIp}
                  </strong>
                </span>
              </div>
              <span className="font-mono text-xs sm:text-sm bg-brand-navyLight px-3 py-1 rounded-lg">
                Maske: {cap.subnetMask}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cap.ipDevices.map((dev) => {
                const currentIp = ipAssignments[dev.id] || '';
                const ipOptions = cap.ipPool.map((ip) => ({
                  value: ip,
                  label: ip,
                  badge: ip.startsWith('192.168.1.') ? '192.168.1.x' : 'FarklÄ± AÄŸ',
                  sublabel: ip.startsWith('192.168.1.')
                    ? 'Yerel aÄŸ geÃ§idi (.1) ile uyumlu'
                    : 'Dikkat: FarklÄ± alt aÄŸ!'
                }));
                return (
                  <div
                    key={dev.id}
                    className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {dev.deviceType === 'printer' ? (
                        <Printer className="w-5 h-5 text-brand-navy" />
                      ) : (
                        <Monitor className="w-5 h-5 text-brand-navy" />
                      )}
                      <h5 className="font-extrabold text-brand-navy">
                        {dev.label}
                      </h5>
                    </div>
                    <CustomSelect
                      value={currentIp}
                      options={ipOptions}
                      placeholder="â€” IP Adresi SeÃ§in â€”"
                      monospace={true}
                      allowClear={true}
                      onChange={(val) =>
                        onChange({
                          ...state,
                          ipAssignments: {
                            ...ipAssignments,
                            [dev.id]: val
                          }
                        })
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Local Path */}
        {activeCapstoneStep === 3 && (
          <OrderedPathSelector
            missionId="localPath"
            title={cap.localMission.title}
            description={cap.localMission.description}
            nodes={cap.nodes}
            selectedPath={localPath}
            onPathChange={(nextPath) =>
              onChange({ ...state, localPath: nextPath })
            }
            feedback={stepFeedbacks[2]}
          />
        )}

        {/* Step 4: External Path */}
        {activeCapstoneStep === 4 && (
          <OrderedPathSelector
            missionId="externalPath"
            title={cap.externalMission.title}
            description={cap.externalMission.description}
            nodes={cap.nodes}
            selectedPath={externalPath}
            onPathChange={(nextPath) =>
              onChange({ ...state, externalPath: nextPath })
            }
            feedback={stepFeedbacks[3]}
          />
        )}

        {/* Step Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={activeCapstoneStep === 1}
            onClick={() => setActiveCapstoneStep((s) => Math.max(1, s - 1))}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-sm font-bold border border-slate-300"
          >
            â† Ã–nceki AdÄ±m
          </button>
          <button
            type="button"
            disabled={activeCapstoneStep === 4}
            onClick={() => setActiveCapstoneStep((s) => Math.min(4, s + 1))}
            className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-purple-800 disabled:opacity-40 text-white text-sm font-bold"
          >
            Sonraki AdÄ±m â†’
          </button>
        </div>

        {/* Summary of all 4 steps feedback */}
        {feedbackItems.length > 0 && (
          <div className="space-y-2 pt-2">
            {feedbackItems.map((fb) => (
              <div
                key={fb.fieldId}
                className={`flex items-start gap-2 p-3 rounded-xl text-sm font-semibold ${
                  fb.isCorrect
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                    : 'bg-amber-50 text-amber-950 border border-amber-300'
                }`}
              >
                {fb.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{fb.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

