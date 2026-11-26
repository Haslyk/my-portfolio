'use client';

import React, { useState, useRef } from 'react';
import { Minus, Plus, Terminal } from 'lucide-react';

interface VbaCodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  errorLine?: number | null;
  activeTraceLine?: number | null;
  quickCommands?: string[];
  readOnly?: boolean;
}

export function VbaCodeEditor({
  value,
  onChange,
  errorLine,
  activeTraceLine,
  quickCommands = [],
  readOnly = false
}: VbaCodeEditorProps) {
  const [fontSize, setFontSize] = useState<number>(14);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const lines = value.split('\n');

  const insertSnippet = (snippet: string) => {
    if (readOnly) return;
    const el = textareaRef.current;
    if (!el) {
      onChange(value + (value.endsWith('\n') ? '' : '\n') + snippet);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = value.slice(0, start) + snippet + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-700 bg-slate-950 text-slate-100 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <Terminal className="h-3.5 w-3.5 text-sky-400" />
          <span>VBA Eğitim Editörü</span>
          {errorLine ? (
            <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
              Hata Satırı: {errorLine}
            </span>
          ) : null}
          {activeTraceLine ? (
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
              İzlenen Satır: {activeTraceLine}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Yazı boyutu ayarları">
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.max(12, s - 1))}
            className="rounded border border-slate-700 bg-slate-800 p-1 text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            title="Yazıyı küçült"
            aria-label="Yazıyı küçült"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="px-1.5 text-[11px] text-slate-400">{fontSize}px</span>
          <button
            type="button"
            onClick={() => setFontSize((s) => Math.min(20, s + 1))}
            className="rounded border border-slate-700 bg-slate-800 p-1 text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            title="Yazıyı büyüt"
            aria-label="Yazıyı büyüt"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Quick Commands */}
      {quickCommands.length > 0 && !readOnly && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 bg-slate-900/60 px-3 py-1.5">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Hızlı Ekle:</span>
          {quickCommands.map((cmd, i) => (
            <button
              key={i}
              type="button"
              onClick={() => insertSnippet(cmd)}
              className="rounded border border-slate-700 bg-slate-800/90 px-2 py-0.5 font-mono text-[11px] text-sky-300 hover:border-sky-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Code Area with Line Numbers */}
      <div className="relative flex min-h-[280px] max-h-[440px] overflow-auto">
        <div
          aria-hidden="true"
          className="select-none border-r border-slate-800 bg-slate-900/50 py-3 px-2.5 text-right font-mono text-slate-500"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.55' }}
        >
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isErr = errorLine === lineNum;
            const isTrace = activeTraceLine === lineNum;
            return (
              <div
                key={lineNum}
                className={`px-1 rounded ${
                  isErr
                    ? 'bg-rose-500/30 text-rose-200 font-bold'
                    : isTrace
                    ? 'bg-amber-500/30 text-amber-200 font-bold'
                    : ''
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          aria-label="VBA Kod Editörü"
          className="w-full flex-1 resize-none bg-transparent p-3 font-mono text-slate-100 focus:outline-none"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.55',
            tabSize: 2
          }}
        />
      </div>
    </div>
  );
}
