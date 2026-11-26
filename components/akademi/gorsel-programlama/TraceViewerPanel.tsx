'use client';

import React from 'react';
import { VbaTraceStep } from '@/lib/akademi/gorsel-programlama';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';

interface TraceViewerPanelProps {
  trace: VbaTraceStep[];
  currentIndex: number;
  onChangeIndex: (idx: number) => void;
}

export function TraceViewerPanel({
  trace,
  currentIndex,
  onChangeIndex
}: TraceViewerPanelProps) {
  if (trace.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        Adım adım izlemeyi görmek için <strong>Adım Adım</strong> veya{' '}
        <strong>Çalıştır</strong> butonuna bas.
      </div>
    );
  }

  const safeIdx = Math.min(Math.max(0, currentIndex), trace.length - 1);
  const step = trace[safeIdx];
  const varEntries = Object.entries(step.variables);
  const loopEntries = Object.entries(step.loopCounters);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/40 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-amber-200 bg-amber-100/60 px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-950">
          <Activity className="h-3.5 w-3.5 text-amber-700" />
          <span>
            Yürütme İzi: Adım {safeIdx + 1} / {trace.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safeIdx <= 0}
            onClick={() => onChangeIndex(safeIdx - 1)}
            className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-900 disabled:opacity-40 hover:bg-amber-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Önceki
          </button>
          <button
            type="button"
            disabled={safeIdx >= trace.length - 1}
            onClick={() => onChangeIndex(safeIdx + 1)}
            className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-900 disabled:opacity-40 hover:bg-amber-50"
          >
            Sonraki <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3 text-xs">
        <div className="rounded-lg border border-slate-200 bg-white p-2.5">
          <div className="text-[11px] font-semibold text-slate-500 mb-1">
            Satır {step.line} — {step.note}
          </div>
          <code className="block font-mono text-xs text-slate-900">
            {step.code || '(satır)'}
          </code>
        </div>

        {loopEntries.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-slate-600 mb-1">
              Döngü Sayaçları
            </div>
            <div className="flex flex-wrap gap-2">
              {loopEntries.map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 font-mono text-xs font-semibold text-amber-950"
                >
                  {k} = {v}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="text-[11px] font-semibold text-slate-600 mb-1">
            Değişken Değerleri
          </div>
          {varEntries.length === 0 ? (
            <div className="text-slate-500 italic">Henüz tanımlı değişken yok.</div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {varEntries.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded border border-slate-200 bg-white px-2 py-1 font-mono"
                >
                  <span className="text-slate-600">{k}</span>
                  <span className="font-semibold text-slate-900">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
