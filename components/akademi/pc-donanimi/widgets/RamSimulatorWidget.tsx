"use client";

import React, { useState } from 'react';
import { ValidationFeedbackItem } from '@/lib/akademi/pc-donanimi';
import {
  Power,
  PlugZap,
  RotateCw,
  ArrowUpFromLine,
  ArrowDownToLine,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface RamSimulatorWidgetProps {
  allowOptional3D?: boolean;
  state: Record<string, any>;
  onChangeState: (nextState: Record<string, any>) => void;
  feedbackItems?: ValidationFeedbackItem[];
}

export const RamSimulatorWidget: React.FC<RamSimulatorWidgetProps> = ({
  allowOptional3D,
  state,
  onChangeState,
  feedbackItems,
}) => {
  const [safetyHint, setSafetyHint] = useState<string | null>(null);

  const powerOff = Boolean(state.powerOff);
  const unplugged = Boolean(state.unplugged);
  const leftLatchOpen = Boolean(state.leftLatchOpen);
  const rightLatchOpen = Boolean(state.rightLatchOpen);
  const ramRemoved = Boolean(state.ramRemoved);
  const notchAligned = Boolean(state.notchAligned);
  const ramInserted = Boolean(state.ramInserted);
  const latchesClosedAfterInsert = Boolean(state.latchesClosedAfterInsert);
  const ramSelected = Boolean(state.ramSelected);
  const slotSelected = Boolean(state.slotSelected);
  const stepLog: string[] = Array.isArray(state.stepLog) ? state.stepLog : [];

  const appendLog = (currentLog: string[], event: string) => {
    const next = [...currentLog];
    if (next[next.length - 1] !== event) {
      next.push(event);
    }
    return next;
  };

  const handlePowerOff = () => {
    setSafetyHint(null);
    const nextLog = appendLog(stepLog, 'POWER_OFF');
    onChangeState({
      ...state,
      powerOff: true,
      stepLog: nextLog,
    });
  };

  const handleUnplug = () => {
    setSafetyHint(null);
    const nextLog = appendLog(stepLog, 'UNPLUG');
    onChangeState({
      ...state,
      unplugged: true,
      stepLog: nextLog,
    });
  };

  const handleToggleLatch = (side: 'left' | 'right') => {
    if (!powerOff || !unplugged) {
      setSafetyHint(
        'Güvenlik İpucu: Kasa fişteyken el uzatmayalım, saçlar dikelmesin! Önce “Gücü Kapat” ve “Fişi Çek” düğmelerine bas.'
      );
      return;
    }
    setSafetyHint(null);

    const nextLeft = side === 'left' ? !leftLatchOpen : leftLatchOpen;
    const nextRight = side === 'right' ? !rightLatchOpen : rightLatchOpen;

    let nextLog = [...stepLog];
    let nextClosedAfterInsert = latchesClosedAfterInsert;

    if (nextLeft && nextRight && !ramRemoved) {
      nextLog = appendLog(nextLog, 'LATCHES_OPEN');
    }

    if (!nextLeft && !nextRight && ramInserted) {
      nextLog = appendLog(nextLog, 'CLOSE_LATCHES');
      nextClosedAfterInsert = true;
    }

    onChangeState({
      ...state,
      leftLatchOpen: nextLeft,
      rightLatchOpen: nextRight,
      latchesClosedAfterInsert: nextClosedAfterInsert,
      stepLog: nextLog,
    });
  };

  const handleCloseLatchesButton = () => {
    if (!ramInserted) {
      setSafetyHint('Mandalları kapatmadan önce RAM’i doğru yönde yuvaya yerleştirmelisin.');
      return;
    }
    setSafetyHint(null);
    const nextLog = appendLog(stepLog, 'CLOSE_LATCHES');
    onChangeState({
      ...state,
      leftLatchOpen: false,
      rightLatchOpen: false,
      latchesClosedAfterInsert: true,
      stepLog: nextLog,
    });
  };

  const handleRemoveRam = () => {
    if (!powerOff || !unplugged) {
      setSafetyHint(
        'Güvenlik İpucu: Elektrik açıkken veya fiş takılıyken RAM sökülemez! Önce Gücü Kapat ve Fişi Çek düğmelerine bas.'
      );
      return;
    }
    if (!leftLatchOpen || !rightLatchOpen) {
      setSafetyHint(
        'İpucu: RAM’i çıkarmadan önce yuvanın iki ucundaki mandala tıklayarak ikisini de açmalısın.'
      );
      return;
    }
    setSafetyHint(null);
    const nextLog = appendLog(stepLog, 'REMOVE_RAM');
    onChangeState({
      ...state,
      ramSelected: true,
      ramRemoved: true,
      ramInserted: false,
      notchAligned: false, // requires student to inspect notch and press Yönü Çevir
      latchesClosedAfterInsert: false,
      stepLog: nextLog,
    });
  };

  const handleFlipOrientation = () => {
    if (!ramRemoved || ramInserted) {
      setSafetyHint('Yönü çevirmek için önce RAM’i yuvadan çıkarmış olmalısın.');
      return;
    }
    setSafetyHint(null);
    const nextAligned = !notchAligned;
    const nextLog = nextAligned ? appendLog(stepLog, 'ALIGN_NOTCH') : stepLog;
    onChangeState({
      ...state,
      notchAligned: nextAligned,
      stepLog: nextLog,
    });
  };

  const handleInsertRam = () => {
    if (!powerOff || !unplugged) {
      setSafetyHint('Önce Gücü Kapat ve Fişi Çek adımlarını tamamlamalısın.');
      return;
    }
    if (!ramRemoved) {
      setSafetyHint('Önce mevcut RAM’i mandalları açarak çıkarmalısın.');
      return;
    }
    if (!leftLatchOpen || !rightLatchOpen) {
      setSafetyHint('Mandallar kapalıyken bastırırsak RAM değil anakart üzülür! İki mandalı da aç.');
      return;
    }
    if (!notchAligned) {
      setSafetyHint(
        'Çentik tutmuyor! Kare parçayı yuvarlak deliğe zorlamayalım; önce “Yönü Çevir” düğmesine basarak çentiği hizala.'
      );
      return;
    }
    setSafetyHint(null);
    const nextLog = appendLog(stepLog, 'INSERT_RAM');
    onChangeState({
      ...state,
      ramSelected: true,
      slotSelected: true,
      ramInserted: true,
      stepLog: nextLog,
    });
  };

  return (
    <div className="space-y-5">
      {/* Visual 6-Step Progress Strip */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#6D28D9]">
            Güvenli Montaj İlerleyişi
          </span>
          <span className="text-xs font-bold text-slate-600">
            {[
              powerOff && unplugged,
              leftLatchOpen && rightLatchOpen,
              ramRemoved,
              notchAligned,
              ramInserted,
              latchesClosedAfterInsert
            ].filter(Boolean).length}{' '}
            / 6 Adım
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[11px] font-bold">
          {[
            { label: '1. Gücü Kes', done: powerOff && unplugged },
            { label: '2. Mandal Aç', done: leftLatchOpen && rightLatchOpen },
            { label: '3. Çıkar', done: ramRemoved },
            { label: '4. Çentik Hizala', done: notchAligned },
            { label: '5. Yerleştir', done: ramInserted },
            { label: '6. Mandal Kapat', done: latchesClosedAfterInsert },
          ].map((st, idx) => (
            <div
              key={idx}
              className={`rounded-xl px-2 py-1.5 text-center border transition ${
                st.done
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              {st.done ? '✓ ' : ''}
              {st.label}
            </div>
          ))}
        </div>
      </div>

      {/* Safety / Pedagogical Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3.5 rounded-2xl border border-slate-200">
        <div className="text-xs sm:text-sm font-semibold text-slate-700">
          Ekranda yalnızca bir RAM ve uyumlu, iki mandallı bir yuva bulunur. İşlem eğitim simülasyonudur.
        </div>
      </div>

      {/* Safety Alert Banner (Non-punitive explanatory hint) */}
      {safetyHint && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border-2 border-[#F5A000] text-amber-950 text-sm font-semibold"
        >
          <AlertTriangle className="w-5 h-5 text-[#F5A000] shrink-0 mt-0.5" />
          <span>{safetyHint}</span>
        </div>
      )}

      {/* Step 1: Power & Cable Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
          <div className="text-xs font-bold text-[#6D28D9] uppercase tracking-wider mb-2">
            Adım 1 · Enerjiyi Güvenle Kes
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handlePowerOff}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border-2 transition ${
                powerOff
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{powerOff ? '✓ Güç Kapatıldı' : 'Gücü Kapat'}</span>
            </button>

            <button
              type="button"
              onClick={handleUnplug}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border-2 transition ${
                unplugged
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}
            >
              <PlugZap className="w-4 h-4" />
              <span>{unplugged ? '✓ Fiş Çekildi' : 'Fişi Çek'}</span>
            </button>
          </div>
        </div>

        {/* Step 2..5 Action Buttons */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
          <div className="text-xs font-bold text-[#6D28D9] uppercase tracking-wider mb-2">
            Adım 2–5 · Mandal, Sökme, Çentik Yönü ve Takma
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRemoveRam}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
                ramRemoved && !ramInserted
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}
            >
              <ArrowUpFromLine className="w-4 h-4" />
              <span>Çıkar</span>
            </button>

            <button
              type="button"
              onClick={handleFlipOrientation}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
                ramRemoved && notchAligned
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-[#F5A000] bg-amber-50 hover:bg-amber-100 text-[#1E1B38]'
              }`}
            >
              <RotateCw className="w-4 h-4" />
              <span>Yönü Çevir</span>
            </button>

            <button
              type="button"
              onClick={handleInsertRam}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
                ramInserted
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Yerleştir</span>
            </button>

            <button
              type="button"
              onClick={handleCloseLatchesButton}
              className={`flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
                latchesClosedAfterInsert
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Mandalları Kapat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 2D SVG RAM & Two-Latch Slot Schematic */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            2D RAM ve İki Mandallı Yuva Simülasyonu (Mandallara, RAM’e ve Yuvaya Tıklayabilirsiniz)
          </span>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span
              className={`px-2.5 py-1 rounded-full ${
                powerOff && unplugged
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-red-100 text-red-900'
              }`}
            >
              {powerOff && unplugged ? '⚡ Enerji Kesildi (Güvenli)' : '⚠️ Elektrik Açık / Fiş Takılı'}
            </span>
          </div>
        </div>

        <svg
          viewBox="0 0 600 270"
          className="w-full h-auto rounded-xl bg-slate-900 border border-slate-700 select-none"
          role="img"
          aria-label="RAM modülü, çentik hizası ve iki mandallı RAM yuvası"
        >
          {/* Alignment guide line for slot notch key at x=250 */}
          <line
            x1="250"
            y1="40"
            x2="250"
            y2="215"
            stroke="#F5A000"
            strokeDasharray="5 5"
            strokeWidth="2"
          />
          <text x="250" y="28" textAnchor="middle" fill="#F5A000" fontSize="11" fontWeight="bold">
            Çentik Hiza Çizgisi
          </text>

          {/* RAM Stick Group */}
          {(() => {
            const yOffset = ramRemoved && !ramInserted ? 38 : 115;
            // When notchAligned is true (or before removal), notch is at x=250; when reversed after removal, notch is at x=350
            const notchX = !ramRemoved || notchAligned ? 250 : 350;

            return (
              <g
                onClick={() =>
                  onChangeState({
                    ...state,
                    ramSelected: !ramSelected,
                  })
                }
                className="cursor-pointer"
              >
                {/* Green PCB body */}
                <rect
                  x="130"
                  y={yOffset}
                  width="340"
                  height="64"
                  rx="6"
                  fill="#15803D"
                  stroke={ramSelected ? '#F5A000' : '#4ADE80'}
                  strokeWidth={ramSelected ? '4' : '2.5'}
                />
                {/* Memory chips */}
                {[155, 200, 275, 320, 365, 410].map((cx) => (
                  <rect
                    key={cx}
                    x={cx}
                    y={yOffset + 12}
                    width="30"
                    height="36"
                    rx="3"
                    fill="#0F172A"
                  />
                ))}
                {/* Gold Contact Strip */}
                <rect
                  x="138"
                  y={yOffset + 64}
                  width="324"
                  height="12"
                  fill="#EAB308"
                />
                {/* Physical Notch Cutout on RAM */}
                <rect
                  x={notchX - 10}
                  y={yOffset + 58}
                  width="20"
                  height="20"
                  rx="4"
                  fill="#0F172A"
                  stroke="#F5A000"
                  strokeWidth="2.5"
                />
                <text
                  x="300"
                  y={yOffset + 35}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="13"
                  fontWeight="bold"
                >
                  {ramRemoved && !ramInserted
                    ? notchAligned
                      ? 'RAM Seçili · Çentik Yuvayla Hizalı (Doğru Yön)'
                      : 'RAM Çıkarıldı · Çentik Ters Yönde ("Yönü Çevir"e Bas)'
                    : ramInserted
                    ? 'RAM Yuvaya Doğru Yönde Yerleştirildi'
                    : 'RAM Modülü (Seçmek için Tıkla)'}
                </text>
              </g>
            );
          })()}

          {/* Left Latch (Sol Mandal) */}
          <g
            onClick={() => handleToggleLatch('left')}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label="Sol mandal"
          >
            <rect
              x={leftLatchOpen ? '72' : '98'}
              y="165"
              width="32"
              height="52"
              rx="6"
              fill={leftLatchOpen ? '#F5A000' : '#475569'}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <text
              x={leftLatchOpen ? '88' : '114'}
              y="234"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
            >
              Sol Mandal ({leftLatchOpen ? 'Açık' : 'Kapalı'})
            </text>
          </g>

          {/* Right Latch (Sağ Mandal) */}
          <g
            onClick={() => handleToggleLatch('right')}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label="Sağ mandal"
          >
            <rect
              x={rightLatchOpen ? '496' : '470'}
              y="165"
              width="32"
              height="52"
              rx="6"
              fill={rightLatchOpen ? '#F5A000' : '#475569'}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <text
              x={rightLatchOpen ? '512' : '486'}
              y="234"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
            >
              Sağ Mandal ({rightLatchOpen ? 'Açık' : 'Kapalı'})
            </text>
          </g>

          {/* Motherboard RAM Slot */}
          <g
            onClick={() =>
              onChangeState({
                ...state,
                slotSelected: !slotSelected,
              })
            }
            className="cursor-pointer"
          >
            <rect
              x="130"
              y="188"
              width="340"
              height="28"
              rx="5"
              fill="#1E293B"
              stroke={slotSelected ? '#F5A000' : '#94A3B8'}
              strokeWidth="3"
            />
            {/* Slot Notch Ridge (Çıkıntı) at x=250 */}
            <rect
              x="242"
              y="180"
              width="16"
              height="18"
              rx="3"
              fill="#F5A000"
            />
            <text
              x="300"
              y="207"
              textAnchor="middle"
              fill="#E2E8F0"
              fontSize="12"
              fontWeight="bold"
            >
              Anakart RAM Yuvası (Çentik Çıkıntısı Sol-Orta Hizada)
            </text>
          </g>
        </svg>

        {/* Accessible Latch Toggle Buttons below SVG */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleToggleLatch('left')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold"
            >
              {leftLatchOpen ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Sol Mandalı {leftLatchOpen ? 'Kapat' : 'Aç'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleLatch('right')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold"
            >
              {rightLatchOpen ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Sağ Mandalı {rightLatchOpen ? 'Kapat' : 'Aç'}</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-600">
            Tamamlanan Güvenli Adım Kaydı: {stepLog.length}
          </div>
        </div>
      </div>

      {/* Step Checklist Feedback */}
      {feedbackItems && feedbackItems.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-2">
          <h4 className="font-bold text-sm text-slate-900 mb-2">Güvenli Sökme/Takma Doğrulama Listesi:</h4>
          {feedbackItems.map((fb) => (
            <div
              key={fb.itemId}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-medium ${
                fb.correct
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                  : 'bg-amber-50 text-amber-950 border border-amber-200'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${
                  fb.correct ? 'text-emerald-600' : 'text-amber-600'
                }`}
              />
              <span>{fb.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
