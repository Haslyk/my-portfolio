'use client';

import React from 'react';
import { VbaFormControl } from '@/lib/akademi/gorsel-programlama';
import { AppWindow } from 'lucide-react';

interface UserFormPreviewProps {
  title: string;
  controls: VbaFormControl[];
  onControlChange?: (controlName: string, value: string | boolean, listIndex?: number) => void;
  onButtonClick?: (buttonName: string) => void;
  onInputFocus?: (controlName: string) => void;
  onInputBlur?: (controlName: string) => void;
  mode?: 'design' | 'run';
  selectedControlId?: string | null;
  onSelectControl?: (id: string) => void;
}

export function UserFormPreview({
  title,
  controls,
  onControlChange,
  onButtonClick,
  onInputFocus,
  onInputBlur,
  mode = 'run',
  selectedControlId,
  onSelectControl
}: UserFormPreviewProps) {
  return (
    <div className="rounded-xl border border-slate-300 bg-slate-100 shadow-sm overflow-hidden">
      {/* Window Title Bar */}
      <div className="flex items-center justify-between bg-slate-800 px-3 py-2 text-xs font-semibold text-white">
        <div className="flex items-center gap-2">
          <AppWindow className="h-3.5 w-3.5 text-sky-400" />
          <span>{title || 'UserForm1'}</span>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
            mode === 'design'
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-emerald-500/20 text-emerald-300'
          }`}
        >
          {mode === 'design' ? 'Tasarım Modu' : 'Çalıştırma Modu'}
        </span>
      </div>

      {/* Form Surface */}
      <div className="p-4 space-y-3 min-h-[180px] bg-[#f1f5f9]">
        {controls.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-xs text-slate-500">
            Form yüzeyi boş. Soldan bileşen ekleyebilirsin.
          </div>
        ) : (
          controls.map((ctrl) => {
            const isSelected = mode === 'design' && selectedControlId === ctrl.id;
            const wrapperClass = `rounded-lg p-1.5 transition ${
              mode === 'design'
                ? isSelected
                  ? 'ring-2 ring-sky-600 bg-sky-50/70 cursor-pointer'
                  : 'hover:ring-1 hover:ring-slate-400 cursor-pointer'
                : ''
            }`;

            const styleText: React.CSSProperties = {
              color: ctrl.foreColor || '#0f172a',
              backgroundColor:
                ctrl.type === 'Label' ? ctrl.backColor || 'transparent' : undefined,
              fontSize: ctrl.fontSize ? `${ctrl.fontSize}px` : '13px'
            };

            return (
              <div
                key={ctrl.id}
                className={wrapperClass}
                onClick={() => {
                  if (mode === 'design' && onSelectControl) {
                    onSelectControl(ctrl.id);
                  }
                }}
              >
                {ctrl.type === 'Label' && (
                  <div style={styleText} className="font-medium px-1 py-0.5 rounded">
                    {ctrl.caption || ctrl.name}
                  </div>
                )}

                {ctrl.type === 'TextBox' && (
                  <input
                    type="text"
                    readOnly={mode === 'design'}
                    value={String(ctrl.value ?? '')}
                    onChange={(e) =>
                      mode === 'run' && onControlChange?.(ctrl.name, e.target.value)
                    }
                    onFocus={() => mode === 'run' && onInputFocus?.(ctrl.name)}
                    onBlur={() => mode === 'run' && onInputBlur?.(ctrl.name)}
                    aria-label={ctrl.name}
                    placeholder={mode === 'design' ? `[TextBox: ${ctrl.name}]` : ''}
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-inner focus:border-sky-500 focus:outline-none"
                  />
                )}

                {ctrl.type === 'CommandButton' && (
                  <button
                    type="button"
                    onClick={() => mode === 'run' && onButtonClick?.(ctrl.name)}
                    style={{
                      backgroundColor: ctrl.backColor || '#1e293b',
                      color: ctrl.foreColor || '#ffffff',
                      fontSize: ctrl.fontSize ? `${ctrl.fontSize}px` : '13px'
                    }}
                    className="rounded-md px-4 py-1.5 font-semibold shadow-sm hover:opacity-90 active:scale-[0.99] transition"
                  >
                    {ctrl.caption || ctrl.name}
                  </button>
                )}

                {ctrl.type === 'CheckBox' && (
                  <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={mode === 'design'}
                      checked={Boolean(ctrl.value)}
                      onChange={(e) =>
                        mode === 'run' && onControlChange?.(ctrl.name, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-sky-600"
                    />
                    <span>{ctrl.caption || ctrl.name}</span>
                  </label>
                )}

                {ctrl.type === 'OptionButton' && (
                  <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name={ctrl.groupName || 'optGroup'}
                      disabled={mode === 'design'}
                      checked={Boolean(ctrl.value)}
                      onChange={(e) =>
                        mode === 'run' && onControlChange?.(ctrl.name, e.target.checked)
                      }
                      className="h-4 w-4 border-slate-300 text-sky-600"
                    />
                    <span>{ctrl.caption || ctrl.name}</span>
                  </label>
                )}

                {ctrl.type === 'ListBox' && (
                  <div className="rounded border border-slate-300 bg-white overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-500 flex justify-between">
                      <span>{ctrl.name} (ListBox)</span>
                      <span>{(ctrl.items || []).length} öğe</span>
                    </div>
                    <ul className="max-h-32 overflow-auto divide-y divide-slate-100">
                      {(ctrl.items || []).length === 0 ? (
                        <li className="px-2.5 py-2 text-xs text-slate-400 italic">
                          Liste boş
                        </li>
                      ) : (
                        (ctrl.items || []).map((item, idx) => {
                          const selected = ctrl.listIndex === idx;
                          return (
                            <li key={idx}>
                              <button
                                type="button"
                                disabled={mode === 'design'}
                                onClick={() =>
                                  mode === 'run' &&
                                  onControlChange?.(ctrl.name, item, idx)
                                }
                                className={`w-full text-left px-2.5 py-1.5 text-xs transition ${
                                  selected
                                    ? 'bg-sky-600 text-white font-semibold'
                                    : 'text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                <span className="opacity-60 mr-1.5">[{idx}]</span>
                                {item}
                              </button>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                )}

                {ctrl.type === 'Shape' && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-slate-500">
                      {ctrl.name} (Genişlik: {ctrl.width ?? 120}px, Yükseklik: {ctrl.height ?? 24}px)
                    </span>
                    <div
                      style={{
                        backgroundColor: ctrl.backColor || '#64748b',
                        width: `${Math.min(Math.max(ctrl.width ?? 120, 24), 320)}px`,
                        height: `${Math.min(Math.max(ctrl.height ?? 24, 12), 80)}px`
                      }}
                      className="rounded-md border border-slate-400/50 transition-all"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
