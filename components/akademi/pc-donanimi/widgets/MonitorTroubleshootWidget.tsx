"use client";

import React, { useState } from 'react';
import { ValidationFeedbackItem } from '@/lib/akademi/pc-donanimi';
import {
  Monitor,
  Power,
  Cable,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface MonitorTroubleshootWidgetProps {
  state: Record<string, any>;
  onChangeState: (nextState: Record<string, any>) => void;
  feedbackItems?: ValidationFeedbackItem[];
}

export const MonitorTroubleshootWidget: React.FC<MonitorTroubleshootWidgetProps> = ({
  state,
  onChangeState,
  feedbackItems,
}) => {
  const [menuOpen, setMenuOpen] = useState(Boolean(state.menuOpen));

  const powerChecked = Boolean(state.powerChecked);
  const cableChecked = Boolean(state.cableChecked);
  const selectedInput: string = state.selectedInput || 'VGA';
  const creatorChoice: string = state.creatorChoice || '';
  const displayerChoice: string = state.displayerChoice || '';

  const hasSignal = selectedInput === 'HDMI';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Simulated Monitor Screen & Controls */}
        <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Örnek Senaryo: Monitör Açık · HDMI Kablosu Takılı
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                hasSignal
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              Seçili Kaynak: {selectedInput}
            </span>
          </div>

          {/* Monitor Frame */}
          <div className="relative rounded-2xl bg-slate-950 border-8 border-slate-800 p-6 min-h-[210px] flex flex-col justify-between text-white">
            {/* Top OSD badge */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-white/10 text-amber-300">
                Giriş: {selectedInput}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Güç: AÇIK
              </span>
            </div>

            {/* Center screen content */}
            <div className="my-6 text-center">
              {hasSignal ? (
                <div className="space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    <Monitor className="w-7 h-7" />
                  </div>
                  <div className="text-lg font-extrabold text-emerald-300">
                    Görüntü Geldi! (Hitit Üniversitesi Masaüstü Ekranı)
                  </div>
                  <p className="text-xs text-slate-300">
                    HDMI kablosu ile monitördeki HDMI giriş kaynağı eşleşti.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-lg font-bold text-amber-400">
                    Sinyal Yok (Giriş Kaynağı: {selectedInput})
                  </div>
                  <p className="text-xs text-slate-400">
                    Monitör şu anda {selectedInput} girişini dinliyor.
                  </p>
                </div>
              )}
            </div>

            {/* On-Screen Input Source Menu */}
            {menuOpen && (
              <div className="bg-[#1E1B38] border-2 border-[#F5A000] rounded-xl p-3">
                <div className="text-xs font-bold text-[#F5A000] mb-2">
                  Monitör Giriş Kaynağı Menüsü (Bir kaynak seçin):
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['VGA', 'HDMI', 'DisplayPort'].map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() =>
                        onChangeState({
                          ...state,
                          menuOpen: true,
                          selectedInput: src,
                        })
                      }
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
                        selectedInput === src
                          ? 'bg-[#F5A000] text-[#1E1B38]'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {selectedInput === src ? `✓ ${src}` : src}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3 Inspection Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
            <button
              type="button"
              onClick={() =>
                onChangeState({
                  ...state,
                  powerChecked: true,
                })
              }
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
                powerChecked
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}
            >
              <Power className="w-4 h-4 shrink-0" />
              <span>Monitörün Gücünü Kontrol Et</span>
            </button>

            <button
              type="button"
              onClick={() =>
                onChangeState({
                  ...state,
                  cableChecked: true,
                })
              }
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
                cableChecked
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
              }`}
            >
              <Cable className="w-4 h-4 shrink-0" />
              <span>Kabloyu Kontrol Et</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(true);
                onChangeState({
                  ...state,
                  menuOpen: true,
                });
              }}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
                menuOpen || selectedInput === 'HDMI'
                  ? 'border-[#6D28D9] bg-purple-50 text-[#6D28D9]'
                  : 'border-[#F5A000] bg-[#F5A000] text-[#1E1B38]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>Giriş Kaynağı</span>
            </button>
          </div>

          {/* Inspection Status Findings */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div
              className={`p-2.5 rounded-xl border ${
                powerChecked
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              {powerChecked
                ? '✓ Güç Kontrolü: Monitörün güç ışığı yanıyor (Açık).'
                : '• Monitör gücü henüz kontrol edilmedi.'}
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                cableChecked
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              {cableChecked
                ? '✓ Kablo Kontrolü: Kasa ile monitör arasında HDMI kablosu takılı.'
                : '• Görüntü kablosu henüz kontrol edilmedi.'}
            </div>
          </div>
        </div>

        {/* Right: Role Matching (Görüntüyü oluşturan / gösteren) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm space-y-4">
          <h4 className="font-bold text-base text-slate-900">
            Görev Eşleştirmesi: Oluşturan ve Gösteren
          </h4>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-sm text-slate-900 mb-2">
              1. “Görüntüyü oluşturan” parça hangisidir?
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'grafik_birimi', label: 'Grafik birimi' },
                { id: 'monitor', label: 'Monitör' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onChangeState({
                      ...state,
                      creatorChoice: opt.id,
                    })
                  }
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
                    creatorChoice === opt.id
                      ? 'border-[#1E1B38] bg-[#1E1B38] text-white'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {creatorChoice === opt.id ? `✓ ${opt.label}` : opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-sm text-slate-900 mb-2">
              2. “Görüntüyü gösteren” birim hangisidir?
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'grafik_birimi', label: 'Grafik birimi' },
                { id: 'monitor', label: 'Monitör' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onChangeState({
                      ...state,
                      displayerChoice: opt.id,
                    })
                  }
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
                    displayerChoice === opt.id
                      ? 'border-[#1E1B38] bg-[#1E1B38] text-white'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {displayerChoice === opt.id ? `✓ ${opt.label}` : opt.label}
                </button>
              ))}
            </div>
          </div>

          {feedbackItems && feedbackItems.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              {feedbackItems.map((fb) => (
                <div
                  key={fb.itemId}
                  className={`flex items-start gap-2 p-2.5 rounded-xl text-xs font-medium ${
                    fb.correct
                      ? 'bg-emerald-50 text-emerald-950'
                      : 'bg-amber-50 text-amber-950'
                  }`}
                >
                  {fb.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  )}
                  <span>{fb.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
