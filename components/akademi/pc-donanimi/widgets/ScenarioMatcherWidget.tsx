"use client";

import React from 'react';
import {
  PublicScenarioItem,
  ValidationFeedbackItem,
} from '@/lib/akademi/pc-donanimi';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ScenarioMatcherWidgetProps {
  activityCode: string;
  scenarios: PublicScenarioItem[];
  sharedOptions?: { id: string; label: string }[];
  state: Record<string, any>;
  onChangeState: (nextState: Record<string, any>) => void;
  feedbackItems?: ValidationFeedbackItem[];
}

export const ScenarioMatcherWidget: React.FC<ScenarioMatcherWidgetProps> = ({
  activityCode,
  scenarios,
  sharedOptions,
  state,
  onChangeState,
  feedbackItems,
}) => {
  const selections: Record<string, string> =
    typeof state.selections === 'object' && state.selections !== null
      ? state.selections
      : {};

  const feedbackByItem = new Map(
    (feedbackItems || []).map((f) => [f.itemId, f])
  );

  const handleSelect = (scenarioId: string, optionId: string) => {
    onChangeState({
      ...state,
      selections: {
        ...selections,
        [scenarioId]: optionId,
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Special visual monitor spec label banner for W3-H (Ekran Etiketini Anlıyorum) */}
      {(activityCode === 'W3-H' || activityCode === 'D-W3-H') && (
        <div className="bg-[#1E1B38] text-white p-5 rounded-2xl border-2 border-[#F5A000] shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#F5A000] mb-2">
            Örnek Monitör Bilgi Etiketi
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 p-3 rounded-xl border border-white/15">
              <div className="text-xl sm:text-2xl font-extrabold text-[#F5A000]">24 inç</div>
              <div className="text-xs text-slate-300 mt-1">1. Etiket Alanı</div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/15">
              <div className="text-xl sm:text-2xl font-extrabold text-white">1920 × 1080</div>
              <div className="text-xs text-slate-300 mt-1">2. Etiket Alanı</div>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/15">
              <div className="text-xl sm:text-2xl font-extrabold text-purple-300">75 Hz</div>
              <div className="text-xs text-slate-300 mt-1">3. Etiket Alanı</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {scenarios.map((sc, idx) => {
          const opts = sc.options || sharedOptions || [];
          const chosen = selections[sc.id];
          const fb = feedbackByItem.get(sc.id);

          return (
            <div
              key={sc.id}
              className={`rounded-2xl border-2 p-4 sm:p-5 transition ${
                fb
                  ? fb.correct
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : 'border-amber-500 bg-amber-50/40'
                  : chosen
                  ? 'border-purple-300 bg-white'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="font-bold text-slate-900 text-base mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1E1B38] text-white text-xs font-bold mr-2">
                  {idx + 1}
                </span>
                “{sc.prompt}”
              </div>

              <div className="flex flex-wrap gap-2">
                {opts.map((opt) => {
                  const active = chosen === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(sc.id, opt.id)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border-2 transition ${
                        active
                          ? 'border-[#1E1B38] bg-[#1E1B38] text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      {active ? `✓ ${opt.label}` : opt.label}
                    </button>
                  );
                })}
              </div>

              {fb && (
                <div
                  className={`mt-3 flex items-start gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-medium ${
                    fb.correct
                      ? 'bg-emerald-100/90 text-emerald-950'
                      : 'bg-amber-100/90 text-amber-950'
                  }`}
                >
                  {fb.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  )}
                  <span>{fb.message}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
