'use client';

import React from 'react';
import { GpFillBlanksPayload } from '@/lib/akademi/gorsel-programlama';

interface FillBlanksWidgetProps {
  payload: GpFillBlanksPayload;
  answers: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}

export function FillBlanksWidget({
  payload,
  answers,
  onChange
}: FillBlanksWidgetProps) {
  return (
    <div className="space-y-4">
      {/* Code Template Preview */}
      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs sm:text-sm text-slate-100 space-y-1.5 overflow-x-auto">
        {payload.templateLines.map((line, i) => {
          const parts = line.split(/(\{\{b\d+\}\})/g);
          return (
            <div key={i} className="leading-relaxed whitespace-pre-wrap">
              <span className="select-none text-slate-500 mr-3">{i + 1}</span>
              {parts.map((part, pIdx) => {
                const match = part.match(/^\{\{(b\d+)\}\}$/);
                if (!match) return <span key={pIdx}>{part}</span>;
                const blankId = match[1];
                const chosen = answers[blankId];
                return (
                  <span
                    key={pIdx}
                    className={`inline-block rounded px-2 py-0.5 mx-0.5 font-bold ${
                      chosen
                        ? 'bg-sky-500/30 text-sky-200 border border-sky-400/50'
                        : 'bg-amber-500/20 text-amber-300 border border-dashed border-amber-400/50'
                    }`}
                  >
                    {chosen || `[${blankId}]`}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Blank Selectors */}
      <div className="space-y-3">
        {payload.blanks.map((blank) => (
          <div
            key={blank.id}
            className="rounded-xl border border-slate-200 bg-white p-3 space-y-2"
          >
            <div className="text-xs font-semibold text-slate-800">
              {blank.label}
            </div>
            <div className="flex flex-wrap gap-2">
              {(blank.options || []).map((opt) => {
                const active = answers[blank.id] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChange({ ...answers, [blank.id]: opt })}
                    className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition ${
                      active
                        ? 'border-sky-600 bg-sky-600 text-white'
                        : 'border-slate-300 bg-slate-50 text-slate-800 hover:border-sky-400'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
