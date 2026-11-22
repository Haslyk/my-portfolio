"use client";

import React from 'react';
import {
  PublicQuizQuestion,
  ValidationFeedbackItem,
} from '@/lib/akademi/pc-donanimi';
import { CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface Quiz3QWidgetProps {
  questions: PublicQuizQuestion[];
  state: Record<string, any>;
  onChangeState: (nextState: Record<string, any>) => void;
  feedbackItems?: ValidationFeedbackItem[];
}

export const Quiz3QWidget: React.FC<Quiz3QWidgetProps> = ({
  questions,
  state,
  onChangeState,
  feedbackItems,
}) => {
  const answers: Record<string, string> =
    typeof state.answers === 'object' && state.answers !== null
      ? state.answers
      : {};
  const lockedCorrect: Record<string, boolean> =
    typeof state.lockedCorrect === 'object' && state.lockedCorrect !== null
      ? state.lockedCorrect
      : {};

  const feedbackByItem = new Map(
    (feedbackItems || []).map((f) => [f.itemId, f])
  );

  const handleSelectOption = (questionCode: string, optionKey: 'A' | 'B' | 'C') => {
    if (lockedCorrect[questionCode]) return; // Preserve already verified correct answer
    onChangeState({
      ...state,
      answers: {
        ...answers,
        [questionCode]: optionKey,
      },
    });
  };

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => {
        const chosen = answers[q.code];
        const isLockedCorrect = Boolean(lockedCorrect[q.code]);
        const fb = feedbackByItem.get(q.code);

        return (
          <div
            key={q.code}
            className={`rounded-2xl border-2 p-5 transition ${
              isLockedCorrect || fb?.correct
                ? 'border-emerald-500 bg-emerald-50/40'
                : fb && !fb.correct
                ? 'border-amber-500 bg-amber-50/30'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h4 className="font-bold text-base sm:text-lg text-slate-900">
                <span className="text-[#6D28D9] mr-2">Soru {idx + 1}:</span>
                {q.prompt}
              </h4>
              {isLockedCorrect && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Doğru Cevap Korundu</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {q.options.map((opt) => {
                const isSelected = chosen === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isLockedCorrect}
                    onClick={() => handleSelectOption(q.code, opt.key)}
                    className={`text-left p-3.5 rounded-xl border-2 font-semibold text-sm transition flex items-center gap-2.5 ${
                      isSelected
                        ? isLockedCorrect
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-[#1E1B38] bg-[#1E1B38] text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    } ${isLockedCorrect && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? 'bg-[#F5A000] text-[#1E1B38]'
                          : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {fb && (
              <div
                className={`mt-3 flex items-start gap-2 p-3 rounded-xl text-xs sm:text-sm font-medium ${
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
  );
};
