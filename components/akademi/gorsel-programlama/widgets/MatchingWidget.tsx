'use client';

import React, { useState } from 'react';
import { GpMatchingPayload } from '@/lib/akademi/gorsel-programlama';
import { Link2, X } from 'lucide-react';

interface MatchingWidgetProps {
  payload: GpMatchingPayload;
  pairs: Record<string, string>;
  onChange: (nextPairs: Record<string, string>) => void;
}

export function MatchingWidget({ payload, pairs, onChange }: MatchingWidgetProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [draggedLeft, setDraggedLeft] = useState<string | null>(null);

  const assignPair = (leftId: string, targetId: string) => {
    const next = { ...pairs };
    // Remove target if already assigned to another left item
    for (const [k, v] of Object.entries(next)) {
      if (v === targetId && k !== leftId) {
        delete next[k];
      }
    }
    next[leftId] = targetId;
    onChange(next);
    setSelectedLeft(null);
  };

  const clearPair = (leftId: string) => {
    const next = { ...pairs };
    delete next[leftId];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
        Soldan bir karta tıklayıp (veya sürükleyip) sağdaki uygun açıklamaya bırakarak eşleştir.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Öğeler
          </div>
          {payload.leftItems.map((item) => {
            const isSelected = selectedLeft === item.id;
            const matchedTarget = payload.rightTargets.find(
              (t) => t.id === pairs[item.id]
            );
            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggedLeft(item.id)}
                onDragEnd={() => setDraggedLeft(null)}
                onClick={() =>
                  setSelectedLeft(isSelected ? null : item.id)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedLeft(isSelected ? null : item.id);
                  }
                }}
                className={`rounded-xl border p-3 text-left transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isSelected
                    ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-200'
                    : matchedTarget
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {item.label}
                    </div>
                    {item.subtitle && (
                      <div className="text-xs text-slate-500">{item.subtitle}</div>
                    )}
                  </div>
                  {matchedTarget && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearPair(item.id);
                      }}
                      className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      title="Eşleştirmeyi kaldır"
                      aria-label={`${item.label} eşleştirmesini kaldır`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {matchedTarget && (
                  <div className="mt-2 flex items-start gap-1.5 rounded bg-white/80 px-2 py-1 text-[11px] text-emerald-800 border border-emerald-200">
                    <Link2 className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>{matchedTarget.text}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Görev / Tanım
          </div>
          {payload.rightTargets.map((target) => {
            const pairedLeftId = Object.entries(pairs).find(
              ([, v]) => v === target.id
            )?.[0];
            const pairedLeft = payload.leftItems.find((l) => l.id === pairedLeftId);

            return (
              <button
                key={target.id}
                type="button"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedLeft) assignPair(draggedLeft, target.id);
                }}
                onClick={() => {
                  if (selectedLeft) {
                    assignPair(selectedLeft, target.id);
                  }
                }}
                className={`w-full rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  selectedLeft
                    ? 'border-sky-300 bg-white hover:border-sky-600 hover:bg-sky-50/40'
                    : pairedLeft
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="text-xs leading-relaxed text-slate-800">
                  {target.text}
                </div>
                {pairedLeft && (
                  <div className="mt-1.5 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-900">
                    Eşleşen: {pairedLeft.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
