"use client";
import React from 'react';
import {
  ActivityPublicConfig,
  ValidationFeedbackItem
} from '@/lib/akademi/shared';
import {
  Radio,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Printer,
  CreditCard
} from 'lucide-react';

interface WidgetProps {
  config: ActivityPublicConfig;
  state: Record<string, any>;
  onChange: (nextState: Record<string, any>) => void;
  feedbackItems: ValidationFeedbackItem[];
}

export const ArpSimulationWidget: React.FC<WidgetProps> = ({
  config,
  state,
  onChange,
  feedbackItems
}) => {
  const arp = config.arpSimulation;
  if (!arp) return null;

  const broadcastSent = Boolean(state.broadcastSent);
  const selectedTargetId = String(state.selectedTargetId || '');
  const selectedMacCardId = String(state.selectedMacCardId || '');

  return (
    <div className="space-y-6">
      {/* Subnet Info Banner */}
      <div className="bg-brand-navy text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border-b-4 border-brand-orange">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {arp.subnetInfo}
          </div>
          <div className="text-base sm:text-lg font-extrabold mt-0.5">
            Hedef: <span className="text-brand-orange font-mono">{arp.targetIpToFind}</span> IP
            adresli yazÄ±cÄ±nÄ±n MAC adresini ARP ile Ã¶ÄŸrenmek
          </div>
        </div>
      </div>

      {/* Visual SVG Diagram distinguishing Broadcast Request vs Unicast Reply */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs font-extrabold">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-amber-700 inline-block" />
            Kesik Ã‡izgi: ARP YayÄ±n Ä°steÄŸi (Broadcast - TÃ¼m AÄŸa)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-3 h-1 bg-emerald-600 inline-block" />
            DÃ¼z YeÅŸil Ã‡izgi: ARP YanÄ±tÄ± (Unicast - YalnÄ±zca Hedef Cihazdan)
          </span>
        </div>

        <svg
          viewBox="0 0 660 210"
          className="w-full h-auto bg-slate-900 rounded-xl border border-slate-700"
          role="img"
          aria-label="ARP Ä°steÄŸi ve YanÄ±tÄ± GÃ¶rselleÅŸtirmesi"
        >
          {/* Sender Host A */}
          <g transform="translate(20, 60)">
            <rect
              x="0"
              y="0"
              width="145"
              height="85"
              rx="10"
              fill="#1E1B38"
              stroke="#F5A000"
              strokeWidth="3"
            />
            <text
              x="72"
              y="26"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="bold"
            >
              Bilgisayar A
            </text>
            <text x="72" y="46" textAnchor="middle" fill="#FDE68A" fontSize="12">
              IP: {arp.sender.ip}
            </text>
            <text x="72" y="66" textAnchor="middle" fill="#CBD5E1" fontSize="11">
              MAC: {arp.sender.mac}
            </text>
          </g>

          {/* Switch */}
          <g transform="translate(255, 75)">
            <rect
              x="0"
              y="0"
              width="110"
              height="55"
              rx="8"
              fill="#334155"
              stroke="#94A3B8"
              strokeWidth="2"
            />
            <text
              x="55"
              y="32"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="bold"
            >
              Switch
            </text>
          </g>

          {/* Target 1: Bilgisayar B (.30) */}
          <g transform="translate(475, 16)">
            <rect
              x="0"
              y="0"
              width="160"
              height="75"
              rx="10"
              fill="#1E293B"
              stroke={
                selectedTargetId === 'host_b'
                  ? '#EF4444'
                  : broadcastSent
                  ? '#F5A000'
                  : '#64748B'
              }
              strokeWidth="2.5"
            />
            <text
              x="80"
              y="26"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="bold"
            >
              Bilgisayar B
            </text>
            <text x="80" y="46" textAnchor="middle" fill="#CBD5E1" fontSize="12">
              IP: 192.168.1.30
            </text>
            <text x="80" y="64" textAnchor="middle" fill="#94A3B8" fontSize="10">
              {broadcastSent ? 'ARP Ä°steÄŸi UlaÅŸtÄ± (.20 DeÄŸil)' : 'AÄŸda Bekliyor'}
            </text>
          </g>

          {/* Target 2: YazÄ±cÄ± (.20) */}
          <g transform="translate(475, 112)">
            <rect
              x="0"
              y="0"
              width="160"
              height="80"
              rx="10"
              fill="#1E1B38"
              stroke={
                selectedTargetId === 'host_printer'
                  ? '#10B981'
                  : broadcastSent
                  ? '#F5A000'
                  : '#64748B'
              }
              strokeWidth="3"
            />
            <text
              x="80"
              y="26"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="bold"
            >
              AÄŸ YazÄ±cÄ±sÄ±
            </text>
            <text x="80" y="46" textAnchor="middle" fill="#6EE7B7" fontSize="12">
              IP: 192.168.1.20
            </text>
            <text x="80" y="66" textAnchor="middle" fill="#FDE68A" fontSize="11">
              {selectedTargetId === 'host_printer'
                ? 'YanÄ±t Verdi (Unicast)'
                : broadcastSent
                ? 'ARP Ä°steÄŸi UlaÅŸtÄ±!'
                : 'AÄŸda Bekliyor'}
            </text>
          </g>

          {/* Broadcast Dashed Lines */}
          {broadcastSent && (
            <>
              <line
                x1="165"
                y1="95"
                x2="255"
                y2="95"
                stroke="#F5A000"
                strokeWidth="3"
                strokeDasharray="7 5"
              />
              <line
                x1="365"
                y1="90"
                x2="475"
                y2="52"
                stroke="#F5A000"
                strokeWidth="3"
                strokeDasharray="7 5"
              />
              <line
                x1="365"
                y1="108"
                x2="475"
                y2="142"
                stroke="#F5A000"
                strokeWidth="3"
                strokeDasharray="7 5"
              />
            </>
          )}

          {/* Unicast Solid Green Reply Line when printer is selected */}
          {broadcastSent && selectedTargetId === 'host_printer' && (
            <>
              <line
                x1="475"
                y1="160"
                x2="365"
                y2="118"
                stroke="#10B981"
                strokeWidth="5"
              />
              <line
                x1="255"
                y1="112"
                x2="165"
                y2="112"
                stroke="#10B981"
                strokeWidth="5"
              />
            </>
          )}
        </svg>
      </div>

      {/* Step 1: Start ARP Broadcast */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
        <h4 className="font-extrabold text-brand-navy text-base mb-2">
          AdÄ±m 1: ARP YayÄ±n (Broadcast) Ä°steÄŸini BaÅŸlat
        </h4>
        <p className="text-sm text-slate-600 mb-3">
          Bilgisayar Aâ€™dan yerel aÄŸdaki tÃ¼m cihazlara{' '}
          <strong>"{arp.targetIpToFind} IP adresi kimde?"</strong> sorusunu
          gÃ¶nder.
        </p>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...state,
              broadcastSent: true
            })
          }
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm sm:text-base transition-all ${
            broadcastSent
              ? 'bg-emerald-700 text-white'
              : 'bg-brand-orange hover:bg-brand-orangeDark text-brand-navy'
          }`}
        >
          <Radio className="w-5 h-5" aria-hidden="true" />
          <span>
            {broadcastSent
              ? 'ARP YayÄ±n Ä°steÄŸi TÃ¼m Yerel AÄŸa GÃ¶nderildi'
              : '1. ARP YayÄ±n Ä°steÄŸini BaÅŸlat'}
          </span>
        </button>
      </div>

      {/* Step 2: Select Responding Device */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
        <h4 className="font-extrabold text-brand-navy text-base mb-2">
          AdÄ±m 2: Hangi Cihaz Bu ARP Ä°steÄŸine YanÄ±t Verir? ({arp.targetIpToFind}{' '}
          Sahibini SeÃ§)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {arp.targets.map((t) => {
            const active = selectedTargetId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={!broadcastSent}
                onClick={() =>
                  onChange({
                    ...state,
                    selectedTargetId: t.id
                  })
                }
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all disabled:opacity-40 ${
                  active
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-300'
                }`}
              >
                {t.deviceType === 'printer' ? (
                  <Printer className="w-6 h-6 text-brand-orange shrink-0" />
                ) : (
                  <Monitor className="w-6 h-6 text-brand-orange shrink-0" />
                )}
                <div>
                  <div className="font-extrabold text-base">{t.label}</div>
                  <div
                    className={`font-mono text-xs font-bold ${
                      active ? 'text-amber-300' : 'text-slate-600'
                    }`}
                  >
                    IP: {t.ip}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Match Printer's MAC Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
        <h4 className="font-extrabold text-brand-navy text-base mb-2">
          AdÄ±m 3: YazÄ±cÄ±nÄ±n DÃ¶ndÃ¼rdÃ¼ÄŸÃ¼ MAC Adresi KartÄ±nÄ± EÅŸleÅŸtir
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {arp.macCards.map((card) => {
            const active = selectedMacCardId === card.id;
            return (
              <button
                key={card.id}
                type="button"
                disabled={!selectedTargetId}
                onClick={() =>
                  onChange({
                    ...state,
                    selectedMacCardId: card.id
                  })
                }
                className={`p-4 rounded-xl border-2 text-left transition-all disabled:opacity-40 ${
                  active
                    ? 'bg-brand-purple text-white border-brand-purple'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span className="font-mono font-extrabold text-sm">
                    {card.mac}
                  </span>
                </div>
                <div
                  className={`text-xs font-medium ${
                    active ? 'text-purple-100' : 'text-slate-600'
                  }`}
                >
                  {card.hintLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback items */}
      {feedbackItems.length > 0 && (
        <div className="space-y-2">
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
};

