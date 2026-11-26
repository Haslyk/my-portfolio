'use client';

import React from 'react';
import { GpCodeOrderingPayload } from '@/lib/akademi/gorsel-programlama';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';

interface CodeOrderingWidgetProps {
  payload: GpCodeOrderingPayload;
  order: string[];
  onChange: (nextOrder: string[]) => void;
}

export function CodeOrderingWidget({
  payload,
  order,
  onChange
}: CodeOrderingWidgetProps) {
  const effectiveOrder =
    order.length === payload.blocks.length
      ? order
      : payload.blocks.map((b) => b.id);

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= effectiveOrder.length) return;
    const next = [...effectiveOrder];
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-700">
        {payload.prompt}
      </div>
      <div className="space-y-2">
        {effectiveOrder.map((blockId, idx) => {
          const block = payload.blocks.find((b) => b.id === blockId);
          if (!block) return null;
          return (
            <div
              key={block.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <GripVertical className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <code className="block font-mono text-xs text-slate-900 break-all">
                    {block.code}
                  </code>
                  {block.note && (
                    <span className="text-[11px] text-slate-500">{block.note}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  aria-label="Yukarı taşı"
                  className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === effectiveOrder.length - 1}
                  onClick={() => move(idx, 1)}
                  aria-label="Aşağı taşı"
                  className="rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
