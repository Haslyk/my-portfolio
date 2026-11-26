'use client';

import React from 'react';
import { GpOutputPredictionPayload } from '@/lib/akademi/gorsel-programlama';
import { Play } from 'lucide-react';

interface OutputPredictionWidgetProps {
  payload: GpOutputPredictionPayload;
  prediction: string;
  predictionLocked: boolean;
  onChangePrediction: (val: string) => void;
  onRunAndCompare: () => void;
}

export function OutputPredictionWidget({
  payload,
  prediction,
  predictionLocked,
  onChangePrediction,
  onRunAndCompare
}: OutputPredictionWidgetProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs sm:text-sm text-slate-100 overflow-x-auto whitespace-pre">
        {payload.codeToRead}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="text-sm font-semibold text-slate-900">
          {payload.question}
        </div>

        {payload.options && payload.options.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {payload.options.map((opt) => {
              const selected = prediction === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChangePrediction(opt)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                    selected
                      ? 'border-sky-600 bg-sky-50 text-sky-900 ring-2 ring-sky-200'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            value={prediction}
            onChange={(e) => onChangePrediction(e.target.value)}
            placeholder="Tahminini yaz..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        )}

        <div className="pt-1 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!prediction.trim()}
            onClick={onRunAndCompare}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5" />
            {predictionLocked ? 'Tekrar Çalıştır' : 'Simülatörde Çalıştır ve Karşılaştır'}
          </button>
          {!prediction.trim() && (
            <span className="text-[11px] text-slate-500">
              Önce yukarıdan tahminini seç.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
