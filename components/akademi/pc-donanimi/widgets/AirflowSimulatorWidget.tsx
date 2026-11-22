"use client";

import React, { useState } from 'react';
import { ValidationFeedbackItem } from '@/lib/akademi/pc-donanimi';
import {
  Wind,
  Laptop,
  Box,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AirflowSimulatorWidgetProps {
  state: Record<string, any>;
  onChangeState: (nextState: Record<string, any>) => void;
  feedbackItems?: ValidationFeedbackItem[];
}

export const AirflowSimulatorWidget: React.FC<AirflowSimulatorWidgetProps> = ({
  state,
  onChangeState,
  feedbackItems,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<'laptop' | 'obstacle' | null>(null);

  const airflowShown = Boolean(state.airflowShown);
  const laptopMovedToHardSurface = Boolean(state.laptopMovedToHardSurface);
  const caseObstacleRemoved = Boolean(state.caseObstacleRemoved);
  const fanQuestionAnswer = state.fanQuestionAnswer || '';

  const feedbackByItem = new Map(
    (feedbackItems || []).map((f) => [f.itemId, f])
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar: Hava Akışını Göster */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-4 rounded-2xl border border-slate-200">
        <div>
          <div className="font-bold text-slate-900 text-sm sm:text-base">
            Adım 1: Hava Akışı Oklarını İncele
          </div>
          <div className="text-xs text-slate-600">
            Oklar yalnız çizilen örnek kasanın düzenini temsil eder; gerçek sıcaklık hesabı yapılmaz.
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            onChangeState({
              ...state,
              airflowShown: true,
            })
          }
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-sm ${
            airflowShown
              ? 'bg-emerald-700 text-white'
              : 'bg-[#F5A000] hover:bg-amber-500 text-[#1E1B38]'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>{airflowShown ? '✓ Hava Akışı Gösteriliyor' : 'Hava Akışını Göster'}</span>
        </button>
      </div>

      {/* Two Interactive Panels: 1. Laptop on bed -> Hard surface, 2. Case with blocked front intake */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Panel 1: Laptop */}
        <div
          onClick={() => setSelectedTarget('laptop')}
          className={`rounded-2xl border-2 p-5 transition cursor-pointer ${
            laptopMovedToHardSurface
              ? 'border-emerald-500 bg-emerald-50/30'
              : selectedTarget === 'laptop'
              ? 'border-[#F5A000] bg-amber-50/40'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-[#1E1B38]" />
              <h4 className="font-bold text-base text-slate-900">
                1. Dizüstü Bilgisayarın Zemini
              </h4>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                laptopMovedToHardSurface
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {laptopMovedToHardSurface ? '✓ Sert Zeminde' : 'Yumuşak Yatak Üzerinde'}
            </span>
          </div>

          <svg
            viewBox="0 0 320 160"
            className="w-full h-auto rounded-xl bg-slate-900 border border-slate-700 mb-4"
            role="img"
            aria-label="Dizüstü bilgisayar zemin ve hava kanalı şeması"
          >
            {/* Surface: Soft pillow/bed vs Flat Hard Desk */}
            {laptopMovedToHardSurface ? (
              <rect x="25" y="118" width="270" height="16" rx="3" fill="#475569" />
            ) : (
              <path
                d="M 25 125 Q 80 100 160 120 Q 240 100 295 125 L 295 145 L 25 145 Z"
                fill="#A855F7"
                opacity="0.75"
              />
            )}
            {/* Laptop Screen & Base */}
            <rect x="95" y="32" width="130" height="72" rx="6" fill="#1E293B" stroke="#94A3B8" strokeWidth="3" />
            <rect x="75" y="104" width="170" height="12" rx="4" fill="#CBD5E1" />

            {/* Airflow Arrows */}
            {airflowShown && (
              <g>
                {laptopMovedToHardSurface ? (
                  <>
                    <path d="M 110 132 L 110 116" stroke="#22C55E" strokeWidth="3" />
                    <path d="M 210 132 L 210 116" stroke="#22C55E" strokeWidth="3" />
                    <text x="160" y="150" textAnchor="middle" fill="#4ADE80" fontSize="11" fontWeight="bold">
                      Sert masa: Alt hava kanalları açık →
                    </text>
                  </>
                ) : (
                  <>
                    <text x="160" y="142" textAnchor="middle" fill="#FBBF24" fontSize="11" fontWeight="bold">
                      ✖ Yatak/yorgan alt hava girişini kapatıyor
                    </text>
                  </>
                )}
              </g>
            )}
          </svg>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-600">
              {selectedTarget === 'laptop' ? 'Dizüstü seçildi.' : 'Dizüstünü seçip sert zemine taşıyın.'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTarget('laptop');
                onChangeState({
                  ...state,
                  laptopMovedToHardSurface: true,
                });
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                laptopMovedToHardSurface
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1E1B38] hover:bg-slate-800 text-white'
              }`}
            >
              {laptopMovedToHardSurface ? '✓ Sert Zemine Taşındı' : 'Sert Zemine Taşı'}
            </button>
          </div>
        </div>

        {/* Panel 2: Desktop Case with blocked front intake */}
        <div
          onClick={() => setSelectedTarget('obstacle')}
          className={`rounded-2xl border-2 p-5 transition cursor-pointer ${
            caseObstacleRemoved
              ? 'border-emerald-500 bg-emerald-50/30'
              : selectedTarget === 'obstacle'
              ? 'border-[#F5A000] bg-amber-50/40'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-[#1E1B38]" />
              <h4 className="font-bold text-base text-slate-900">
                2. Örnek Kasa Ön Hava Girişi
              </h4>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                caseObstacleRemoved
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {caseObstacleRemoved ? '✓ Hava Girişi Açık' : 'Ön Giriş Kapalı'}
            </span>
          </div>

          <svg
            viewBox="0 0 320 160"
            className="w-full h-auto rounded-xl bg-slate-900 border border-slate-700 mb-4"
            role="img"
            aria-label="Örnek kasa hava girişi ve çıkışı şeması"
          >
            {/* Example PC Case */}
            <rect x="65" y="22" width="150" height="115" rx="10" fill="#1E293B" stroke="#94A3B8" strokeWidth="3" />
            <text x="140" y="45" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="bold">
              Örnek Kasa
            </text>

            {/* Obstacle blocking front intake (right side of case) */}
            {!caseObstacleRemoved && (
              <g>
                <rect
                  x="220"
                  y="35"
                  width="48"
                  height="98"
                  rx="6"
                  fill="#DC2626"
                  stroke="#FCA5A5"
                  strokeWidth="2.5"
                />
                <text x="244" y="88" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">
                  Engel
                </text>
              </g>
            )}

            {/* Airflow Arrows */}
            {airflowShown && (
              <g>
                {caseObstacleRemoved ? (
                  <>
                    {/* Intake from front */}
                    <path d="M 285 80 L 222 80" stroke="#22C55E" strokeWidth="3.5" />
                    {/* Through case */}
                    <path d="M 185 80 L 95 80" stroke="#38BDF8" strokeWidth="3.5" />
                    {/* Exhaust from back */}
                    <path d="M 60 65 L 22 65" stroke="#F5A000" strokeWidth="3.5" />
                    <text x="160" y="152" textAnchor="middle" fill="#4ADE80" fontSize="11" fontWeight="bold">
                      Hava önden girip arkadan rahatça çıkıyor
                    </text>
                  </>
                ) : (
                  <text x="160" y="152" textAnchor="middle" fill="#FBBF24" fontSize="11" fontWeight="bold">
                    ✖ Ön hava girişi nesneyle kapatılmış!
                  </text>
                )}
              </g>
            )}
          </svg>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-600">
              {selectedTarget === 'obstacle' ? 'Engel nesnesi seçildi.' : 'Hava girişini kapatan nesneyi seçin.'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTarget('obstacle');
                onChangeState({
                  ...state,
                  caseObstacleRemoved: true,
                });
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                caseObstacleRemoved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#1E1B38] hover:bg-slate-800 text-white'
              }`}
            >
              {caseObstacleRemoved ? '✓ Engel Kaldırıldı' : 'Engeli Kaldır'}
            </button>
          </div>
        </div>
      </div>

      {/* Question: Fanın görevi nedir? */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
        <h4 className="font-bold text-base text-slate-900 mb-3">
          3. Kontrol Sorusu: Fanın görevi nedir?
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'hava_dolasimina_yardim', label: 'Hava dolaşımına yardım etmek' },
            { id: 'dosyalari_kaydetmek', label: 'Dosyaları kalıcı kaydetmek' },
            { id: 'goruntu_cozunurlugu', label: 'Ekran çözünürlüğünü artırmak' },
          ].map((opt) => {
            const active = fanQuestionAnswer === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  onChangeState({
                    ...state,
                    fanQuestionAnswer: opt.id,
                  })
                }
                className={`p-3.5 rounded-xl border-2 font-bold text-xs sm:text-sm text-left transition ${
                  active
                    ? 'border-[#1E1B38] bg-[#1E1B38] text-white'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                {active ? `✓ ${opt.label}` : opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {feedbackItems && feedbackItems.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-2">
          {feedbackItems.map((fb) => (
            <div
              key={fb.itemId}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-medium ${
                fb.correct
                  ? 'bg-emerald-50 text-emerald-950'
                  : 'bg-amber-50 text-amber-950'
              }`}
            >
              {fb.correct ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              )}
              <span>{fb.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
