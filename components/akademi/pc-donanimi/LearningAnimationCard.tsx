"use client";

import React, { useState, useEffect } from 'react';
import { LearningAnimationSpec } from '@/lib/akademi/pc-donanimi';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ChevronRight,
  Sparkles,
  Cpu,
  HardDrive,
  MemoryStick,
  CircuitBoard,
  Monitor,
  Cable,
} from 'lucide-react';

interface LearningAnimationCardProps {
  animation: LearningAnimationSpec;
}

export const LearningAnimationCard: React.FC<LearningAnimationCardProps> = ({
  animation,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = animation.steps;
  const activeStep = steps[currentStepIdx] || steps[0];

  useEffect(() => {
    if (!isPlaying) return;
    const stepMs = Math.max(4000, Math.floor((animation.durationSeconds * 1000) / steps.length));
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev + 1 >= steps.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, stepMs);
    return () => clearInterval(timer);
  }, [isPlaying, animation.durationSeconds, steps.length]);

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => (prev + 1) % steps.length);
  };

  return (
    <section
      aria-label={`Görsel Anlatım: ${animation.title}`}
      className="bg-white rounded-2xl border-2 border-purple-200 shadow-sm p-5 mb-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#6D28D9]/10 text-[#6D28D9] flex items-center justify-center">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#6D28D9]/10 text-[#6D28D9]">
                İsteğe Bağlı Görsel Anlatım ({animation.durationSeconds} sn)
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{animation.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600">{animation.subtitle}</p>
          </div>
        </div>

        {/* Play / Pause / Restart / Step-by-step controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6D28D9] hover:bg-purple-800 text-white text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#6D28D9]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" aria-hidden="true" />
                <span>Duraklat</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" aria-hidden="true" />
                <span>Oynat</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition"
          >
            <SkipForward className="w-4 h-4" aria-hidden="true" />
            <span>Adım Adım</span>
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Baştan</span>
          </button>
        </div>
      </div>

      {/* Visual SVG diagram per week */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="lg:col-span-7 flex justify-center">
          {animation.weekOrder === 1 && (
            <div className="w-full max-w-md grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-slate-200">
              {[
                { id: 'anakart', label: 'Anakart', sub: 'Parçaları bağlar', Icon: CircuitBoard },
                { id: 'islemci', label: 'İşlemci (CPU)', sub: 'Komutları işler', Icon: Cpu },
                { id: 'ram', label: 'RAM', sub: 'Geçici çalışma alanı', Icon: MemoryStick },
                { id: 'ssd', label: 'SSD', sub: 'Kalıcı dosya saklama', Icon: HardDrive },
              ].map((item) => {
                const highlighted = activeStep.highlightTarget === item.id;
                const IconComp = item.Icon;
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border-2 flex items-center gap-3 transition ${
                      highlighted
                        ? 'border-[#F5A000] bg-amber-50/80 shadow-sm'
                        : 'border-slate-200 bg-slate-50/60 opacity-75'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        highlighted ? 'bg-[#F5A000] text-[#1E1B38]' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <IconComp className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{item.label}</div>
                      <div className="text-xs text-slate-600">{item.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {animation.weekOrder === 2 && (
            <div className="w-full max-w-md grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <div
                className={`p-3.5 rounded-xl border-2 ${
                  activeStep.highlightTarget === 'ram_unsaved' ||
                  activeStep.highlightTarget === 'load_to_ram'
                    ? 'border-[#F5A000] bg-amber-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
                  <MemoryStick className="w-4 h-4 text-[#6D28D9]" />
                  <span>RAM (Çalışma Alanı)</span>
                </div>
                <p className="text-xs text-slate-600">
                  {activeStep.highlightTarget === 'power_loss'
                    ? 'Elektrik kesildi: Kaydedilmemiş satırlar temizlendi.'
                    : 'Açık belge ve henüz kaydedilmemiş değişiklikler burada.'}
                </p>
              </div>

              <div
                className={`p-3.5 rounded-xl border-2 ${
                  activeStep.highlightTarget === 'ssd_saved' ||
                  activeStep.highlightTarget === 'power_loss'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
                  <HardDrive className="w-4 h-4 text-emerald-700" />
                  <span>SSD (Kalıcı Depolama)</span>
                </div>
                <p className="text-xs text-slate-600">
                  Kaydedilmiş dosya elektrik kesilse de güvenle korunur.
                </p>
              </div>
            </div>
          )}

          {animation.weekOrder === 3 && (
            <div className="w-full max-w-md flex items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200">
              <div
                className={`flex-1 p-3 rounded-xl border-2 text-center ${
                  activeStep.highlightTarget === 'gpu'
                    ? 'border-[#F5A000] bg-amber-50'
                    : 'border-slate-200'
                }`}
              >
                <Cpu className="w-6 h-6 mx-auto text-[#1E1B38] mb-1" />
                <div className="text-xs font-bold">1. Grafik Birimi</div>
                <div className="text-[11px] text-slate-500">Görüntüyü oluşturur</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              <div
                className={`flex-1 p-3 rounded-xl border-2 text-center ${
                  activeStep.highlightTarget === 'hdmi'
                    ? 'border-[#F5A000] bg-amber-50'
                    : 'border-slate-200'
                }`}
              >
                <Cable className="w-6 h-6 mx-auto text-[#6D28D9] mb-1" />
                <div className="text-xs font-bold">2. HDMI Kablo</div>
                <div className="text-[11px] text-slate-500">Sinyali taşır</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              <div
                className={`flex-1 p-3 rounded-xl border-2 text-center ${
                  activeStep.highlightTarget === 'monitor'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200'
                }`}
              >
                <Monitor className="w-6 h-6 mx-auto text-emerald-700 mb-1" />
                <div className="text-xs font-bold">3. Monitör (HDMI)</div>
                <div className="text-[11px] text-slate-500">Görüntüyü gösterir</div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-[#6D28D9] uppercase tracking-wider mb-1">
              Adım {currentStepIdx + 1} / {steps.length}
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">{activeStep.title}</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{activeStep.description}</p>

            {/* Static clickable step pills */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
              {steps.map((st, idx) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIdx(idx);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    idx === currentStepIdx
                      ? 'bg-[#1E1B38] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}. Adım
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
