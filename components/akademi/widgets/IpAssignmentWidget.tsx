"use client";

import React, { useEffect } from 'react';
import {
  ActivityPublicConfig,
  ValidationFeedbackItem
} from '@/lib/akademi/shared';
import {
  CheckCircle2,
  AlertCircle,
  Monitor,
  Printer,
  Router as RouterIcon,
  ShieldCheck,
  Wifi
} from 'lucide-react';
import { CustomSelect } from '../CustomSelect';

interface WidgetProps {
  config: ActivityPublicConfig;
  state: Record<string, any>;
  onChange: (nextState: Record<string, any>) => void;
  feedbackItems: ValidationFeedbackItem[];
}

export const IpAssignmentWidget: React.FC<WidgetProps> = ({
  config,
  state,
  onChange,
  feedbackItems
}) => {
  const ipa = config.ipAssignment;
  if (!ipa) return null;

  const assignments: Record<string, string> =
    state.ipAssignments && typeof state.ipAssignments === 'object'
      ? state.ipAssignments
      : {};

  // Pre-populate initialIp if state doesn't have assignments yet (for W4-H conflict resolution)
  useEffect(() => {
    const hasInitial = ipa.devices.some((d) => d.initialIp);
    if (hasInitial && Object.keys(assignments).length === 0) {
      const initialMap: Record<string, string> = {};
      for (const dev of ipa.devices) {
        if (dev.initialIp) {
          initialMap[dev.id] = dev.initialIp;
        }
      }
      onChange({ ...state, ipAssignments: initialMap });
    }
  }, [ipa.devices]);

  const handleAssignIp = (deviceId: string, ip: string) => {
    onChange({
      ...state,
      ipAssignments: {
        ...assignments,
        [deviceId]: ip
      }
    });
  };

  // Detect live duplicates & subnet status for gamified live radar
  const ipCounts: Record<string, number> = {};
  Object.values(assignments).forEach((ip) => {
    if (ip) ipCounts[ip] = (ipCounts[ip] || 0) + 1;
  });

  const gatewayPrefix = ipa.gatewayIp.split('.').slice(0, 3).join('.'); // "192.168.1"

  const customIpOptions = ipa.ipPool.map((ip) => {
    const inSameSubnet = ip.startsWith(gatewayPrefix + '.');
    return {
      value: ip,
      label: ip,
      badge: inSameSubnet ? '192.168.1.x' : 'Farklı Ağ',
      sublabel: inSameSubnet
        ? 'Yerel ağ geçidi ile aynı alt ağda (/24)'
        : 'Dikkat: 192.168.2.x farklı bir alt ağdır!'
    };
  });

  return (
    <div className="space-y-6">
      {/* Gamified Gateway & Subnet Console Header Box */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navyLight text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 border-b-4 border-brand-orange shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-brand-orange text-brand-navy shadow-sm">
            <RouterIcon className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Ağ Geçidi (Yönlendirici) Konsolu
            </div>
            <div className="text-lg sm:text-xl font-extrabold font-mono text-white">
              Geçit IP: <span className="text-brand-orange">{ipa.gatewayIp}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-600">
            <div className="text-xs font-bold text-slate-300">
              Alt Ağ Maskesi (/24)
            </div>
            <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-400">
              {ipa.subnetMask} → {gatewayPrefix}.x
            </div>
          </div>
        </div>
      </div>

      {/* Devices IP Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {ipa.devices.map((dev) => {
          const currentIp = assignments[dev.id] ?? dev.initialIp ?? '';
          const isDuplicate = Boolean(
            currentIp && (ipCounts[currentIp] || 0) > 1
          );
          const isWrongSubnet = Boolean(
            currentIp && !currentIp.startsWith(gatewayPrefix + '.')
          );
          const isCleanOnline = Boolean(
            currentIp && !isDuplicate && !isWrongSubnet
          );
          const fb = feedbackItems.find((f) => f.fieldId === dev.id);

          return (
            <div
              key={dev.id}
              className={`bg-white rounded-2xl border-2 p-5 flex flex-col justify-between shadow-sm transition-all ${
                fb
                  ? fb.isCorrect
                    ? 'border-emerald-500 ring-2 ring-emerald-500/15'
                    : 'border-amber-500'
                  : isDuplicate || isWrongSubnet
                  ? 'border-red-500 ring-2 ring-red-500/15'
                  : isCleanOnline
                  ? 'border-emerald-500/70'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Device Top Status Header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isCleanOnline
                          ? 'bg-emerald-100 text-emerald-800'
                          : isDuplicate || isWrongSubnet
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-brand-navy'
                      }`}
                    >
                      {dev.deviceType === 'printer' ? (
                        <Printer className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <Monitor className="w-5 h-5" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-brand-navy text-base">
                        {dev.label}
                      </h4>
                      <span className="text-xs text-slate-500 font-semibold">
                        Yerel Ağ İstemcisi
                      </span>
                    </div>
                  </div>

                  {/* Gamified Ping LED Status */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                      isCleanOnline
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : isDuplicate
                        ? 'bg-red-50 text-red-800 border-red-300'
                        : isWrongSubnet
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {isCleanOnline
                        ? 'Ağda Hazır'
                        : isDuplicate
                        ? 'Çakışma!'
                        : isWrongSubnet
                        ? 'Farklı Ağ!'
                        : 'IP Bekliyor'}
                    </span>
                  </span>
                </div>

                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  IPv4 Adresi Ata:
                </label>
                <CustomSelect
                  id={`ip_select_${dev.id}`}
                  value={currentIp}
                  options={customIpOptions}
                  placeholder="— IP Adresi Seçin —"
                  monospace={true}
                  allowClear={true}
                  onChange={(val) => handleAssignIp(dev.id, val)}
                />

                {/* Quick Click IP Pill Buttons */}
                <div className="mt-3.5">
                  <div className="text-[11px] font-bold text-slate-500 mb-1.5">
                    Hızlı IP Tuşları:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ipa.ipPool.map((ip) => {
                      const active = currentIp === ip;
                      return (
                        <button
                          key={ip}
                          type="button"
                          onClick={() => handleAssignIp(dev.id, ip)}
                          className={`px-2.5 py-2 rounded-xl font-mono text-xs font-extrabold border-2 transition-all ${
                            active
                              ? 'bg-brand-navy text-brand-orange border-brand-navy shadow-sm'
                              : 'bg-slate-50 hover:bg-purple-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          {ip}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {isDuplicate && (
                <div className="mt-3.5 p-3 rounded-xl bg-red-50 border border-red-300 text-xs font-bold text-red-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>
                    IP Çakışması Alarmı! <code>{currentIp}</code> adresi birden
                    fazla cihaza verildi.
                  </span>
                </div>
              )}

              {isWrongSubnet && !isDuplicate && (
                <div className="mt-3.5 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-950 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Alt Ağ Uyarısı: <code>{currentIp}</code> adresi{' '}
                    <code>{gatewayPrefix}.x</code> yerel ağıyla aynı ağda değil!
                  </span>
                </div>
              )}

              {isCleanOnline && !fb && (
                <div className="mt-3.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Alt ağ uyumlu ve benzersiz IP seçildi.</span>
                </div>
              )}

              {fb && (
                <div
                  className={`mt-3.5 p-3 rounded-xl text-xs font-semibold flex items-start gap-1.5 ${
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

      {/* Follow-up control question if present (W4-H) */}
      {ipa.followUpQuestion && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm">
          <h4 className="font-extrabold text-brand-navy text-base mb-3">
            {ipa.followUpQuestion.prompt}
          </h4>
          <div className="space-y-2.5">
            {ipa.followUpQuestion.options.map((opt) => {
              const active = state.followUpAnswer === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...state,
                      followUpAnswer: opt.id
                    })
                  }
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left text-sm font-bold transition-all ${
                    active
                      ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      active
                        ? 'border-brand-orange bg-brand-orange'
                        : 'border-slate-400'
                    }`}
                  />
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {feedbackItems.find((f) => f.fieldId === 'followUpAnswer') && (
            <div
              className={`mt-3 p-3 rounded-xl text-sm font-semibold flex items-start gap-2 ${
                feedbackItems.find((f) => f.fieldId === 'followUpAnswer')
                  ?.isCorrect
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                  : 'bg-amber-50 text-amber-950 border border-amber-300'
              }`}
            >
              <span>
                {
                  feedbackItems.find((f) => f.fieldId === 'followUpAnswer')
                    ?.message
                }
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
