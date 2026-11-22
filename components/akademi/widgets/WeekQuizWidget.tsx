"use client";
import React from 'react';
import {
  ActivityPublicConfig,
  ValidationFeedbackItem
} from '@/lib/akademi/shared';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface WidgetProps {
  config: ActivityPublicConfig;
  state: Record<string, any>;
  onChange: (nextState: Record<string, any>) => void;
  feedbackItems: ValidationFeedbackItem[];
}

export const WeekQuizWidget: React.FC<WidgetProps> = ({
  config,
  state,
  onChange,
  feedbackItems
}) => {
  const quiz = config.quiz;
  if (!quiz) return null;

  const answers: Record<string, string> =
    state.answers && typeof state.answers === 'object' ? state.answers : {};

  const handleSelect = (questionId: string, optionId: string) => {
    onChange({
      ...state,
      answers: {
        ...answers,
        [questionId]: optionId
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-brand-navy font-medium">
        <strong>DeÄŸerlendirme Bilgisi:</strong> Bu deÄŸerlendirme Ã¶ÄŸrenme
        odaklÄ±dÄ±r; sÄ±nÄ±rsÄ±z tekrar hakkÄ±n vardÄ±r. DoÄŸru iÅŸaretlediÄŸin sorular
        korunur, aÃ§Ä±klayÄ±cÄ± geri bildirimleri okuyarak diÄŸer sorularÄ±
        dÃ¼zeltebilirsin.
      </div>

      {quiz.questions.map((q) => {
        const chosen = answers[q.id] || '';
        const fb = feedbackItems.find((f) => f.fieldId === q.id);

        return (
          <div
            key={q.id}
            className={`bg-white rounded-2xl border-2 p-5 transition-all ${
              fb
                ? fb.isCorrect
                  ? 'border-emerald-500'
                  : 'border-amber-500'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="w-8 h-8 rounded-xl bg-brand-navy text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                {q.number}
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-brand-navy">
                {q.question}
              </h4>
            </div>

            <div className="space-y-2.5">
              {q.options.map((opt) => {
                const active = chosen === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(q.id, opt.id)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left text-sm sm:text-base font-semibold transition-all ${
                      active
                        ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 uppercase ${
                        active
                          ? 'bg-brand-orange text-brand-navy'
                          : 'bg-white text-slate-700 border border-slate-300'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {fb && (
              <div
                className={`mt-4 flex items-start gap-2.5 p-3.5 rounded-xl text-sm font-semibold ${
                  fb.isCorrect
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                    : 'bg-amber-50 text-amber-950 border border-amber-300'
                }`}
              >
                {fb.isCorrect ? (
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : (
                  <AlertCircle
                    className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
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

