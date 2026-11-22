"use client";
import React from 'react';
import {
  ActivityPublicConfig,
  ValidationFeedbackItem
} from '@/lib/akademi/shared';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  HelpCircle,
  Sparkles,
  CornerDownRight
} from 'lucide-react';

interface WidgetProps {
  config: ActivityPublicConfig;
  state: Record<string, any>;
  onChange: (nextState: Record<string, any>) => void;
  feedbackItems: ValidationFeedbackItem[];
}

export const ScenarioChoiceWidget: React.FC<WidgetProps> = ({
  config,
  state,
  onChange,
  feedbackItems
}) => {
  const scenarios = config.scenarios;
  if (!scenarios) return null;

  const answers: Record<string, string> =
    state.answers && typeof state.answers === 'object' ? state.answers : {};
  const reasons: Record<string, string> =
    state.reasons && typeof state.reasons === 'object' ? state.reasons : {};

  const handleSelectOption = (
    questionId: string,
    optionId: string,
    hasFollowUpReasons: boolean
  ) => {
    const nextAnswers = {
      ...answers,
      [questionId]: optionId
    };
    const nextReasons = { ...reasons };

    // EÄŸer soru Evet/HayÄ±r + gerekÃ§e sorusuysa ve Ã¶ÄŸrenci "Evet" (YES) dediyse,
    // HayÄ±r'Ä±n gerekÃ§eleri gÃ¶sterilmeyeceÄŸi iÃ§in Ã¶nceki gerekÃ§e seÃ§imini temizle.
    if (hasFollowUpReasons && optionId !== 'NO') {
      delete nextReasons[questionId];
    }

    onChange({
      ...state,
      answers: nextAnswers,
      reasons: nextReasons
    });
  };

  const handleSelectReason = (questionId: string, reasonId: string) => {
    onChange({
      ...state,
      reasons: {
        ...reasons,
        [questionId]: reasonId
      }
    });
  };

  // Gamified completion counter
  const totalQuestions = scenarios.questions.length;
  const completedQuestionsCount = scenarios.questions.filter((q) => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (q.followUpReasons && q.followUpReasons.length > 0) {
      return ans === 'YES' || (ans === 'NO' && Boolean(reasons[q.id]));
    }
    return true;
  }).length;

  return (
    <div className="space-y-6">
      {/* Gamified Mission Progress Bar */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navyLight text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm border-b-4 border-brand-orange">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-orange text-brand-navy flex items-center justify-center font-extrabold">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Saha Vaka Analizi GÃ¶revi
            </div>
            <div className="text-sm sm:text-base font-extrabold">
              {completedQuestionsCount === totalQuestions
                ? 'TÃ¼m vakalarÄ± inceledin! Åimdi "Kontrol Et" dÃ¼ÄŸmesiyle analizini doÄŸrula.'
                : `${totalQuestions} aÄŸ vakasÄ±ndan ${completedQuestionsCount} tanesini yanÄ±tladÄ±n.`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {scenarios.questions.map((q, idx) => {
            const done = Boolean(answers[q.id]);
            return (
              <span
                key={q.id}
                className={`w-8 h-8 rounded-lg font-extrabold text-xs flex items-center justify-center border-2 transition-all ${
                  done
                    ? 'bg-brand-orange text-brand-navy border-white scale-105'
                    : 'bg-brand-navy text-slate-300 border-slate-600'
                }`}
              >
                #{idx + 1}
              </span>
            );
          })}
        </div>
      </div>

      {scenarios.note && (
        <div className="flex items-start gap-2.5 bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 text-sm font-semibold text-amber-950">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{scenarios.note}</span>
        </div>
      )}

      {scenarios.questions.map((q, qIdx) => {
        const selectedOption = answers[q.id] || '';
        const selectedReason = reasons[q.id] || '';
        const fb = feedbackItems.find((f) => f.fieldId === q.id);
        const hasFollowUp = Boolean(
          q.followUpReasons && q.followUpReasons.length > 0
        );

        return (
          <div
            key={q.id}
            className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all ${
              fb
                ? fb.isCorrect
                  ? 'border-emerald-500 ring-2 ring-emerald-500/15'
                  : 'border-amber-500 ring-2 ring-amber-500/15'
                : selectedOption
                ? 'border-brand-navy/40'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-brand-purple text-xs font-extrabold">
                Vaka #{qIdx + 1}
              </span>
              {selectedOption && (
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  SeÃ§im YapÄ±ldÄ±
                </span>
              )}
            </div>

            <h4 className="text-base sm:text-lg font-extrabold text-brand-navy mb-1.5">
              {q.prompt}
            </h4>
            {q.context && (
              <div className="text-sm text-slate-700 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                <span>
                  <strong>Sahadaki Durum:</strong> {q.context}
                </span>
              </div>
            )}

            {/* Main Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {q.options.map((opt) => {
                const active = selectedOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      handleSelectOption(q.id, opt.id, hasFollowUp)
                    }
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left font-extrabold text-sm sm:text-base transition-all ${
                      active
                        ? 'bg-brand-navy text-white border-brand-navy shadow-md scale-[1.01]'
                        : 'bg-slate-50 hover:bg-purple-50/50 hover:border-brand-purple/50 text-slate-900 border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        active
                          ? 'border-brand-orange bg-brand-orange text-brand-navy'
                          : 'border-slate-400 bg-white'
                      }`}
                    >
                      {active && (
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-navy" />
                      )}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Follow-up Reasons: ONLY shown when student selects "NO" (HayÄ±r)! */}
            {hasFollowUp && selectedOption === 'NO' && (
              <div className="mt-4 pt-4 border-t-2 border-dashed border-purple-200 bg-purple-50/40 -mx-2 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-brand-purple mb-2.5">
                  <CornerDownRight className="w-4 h-4 shrink-0" />
                  <span>
                    "HayÄ±r" dedin! Åimdi bunun teknik gerekÃ§esini ÅŸÄ±klardan
                    seÃ§:
                  </span>
                </div>
                <div className="space-y-2.5">
                  {q.followUpReasons!.map((r, rIdx) => {
                    const activeReason = selectedReason === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelectReason(q.id, r.id)}
                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left text-sm font-bold transition-all ${
                          activeReason
                            ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                            : 'bg-white hover:bg-purple-50 border-slate-300 text-slate-800'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                            activeReason
                              ? 'bg-brand-orange text-brand-navy'
                              : 'bg-slate-100 text-brand-navy border border-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + rIdx)}
                        </span>
                        <span>{r.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Helpful prompt when "YES" is selected on a Yes/No question */}
            {hasFollowUp && selectedOption === 'YES' && (
              <div className="mt-3 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                Tercihin kaydedildi. HazÄ±r olduÄŸunda alttaki{' '}
                <strong>"Kontrol Et"</strong> dÃ¼ÄŸmesiyle cevabÄ±nÄ± test
                edebilirsin.
              </div>
            )}

            {fb && (
              <div
                className={`mt-4 flex items-start gap-2.5 p-3.5 rounded-xl text-sm font-semibold ${
                  fb.isCorrect
                    ? 'bg-emerald-50 text-emerald-950 border-2 border-emerald-300'
                    : 'bg-amber-50 text-amber-950 border-2 border-amber-300'
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

