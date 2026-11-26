'use client';

import React, { useState } from 'react';
import {
  GpFormBuilderPayload,
  VbaControlType,
  VbaFormControl
} from '@/lib/akademi/gorsel-programlama';
import { UserFormPreview } from '../UserFormPreview';
import { ArrowDown, ArrowUp, Plus, Trash2, Play, Wrench } from 'lucide-react';

interface FormBuilderWidgetProps {
  formTitle: string;
  payload: GpFormBuilderPayload;
  controls: VbaFormControl[];
  onChange: (nextControls: VbaFormControl[]) => void;
}

const DEFAULT_PREFIX: Record<VbaControlType, string> = {
  Label: 'lbl',
  TextBox: 'txt',
  CommandButton: 'btn',
  CheckBox: 'chk',
  OptionButton: 'opt',
  ListBox: 'lst',
  Shape: 'shp'
};

export function FormBuilderWidget({
  formTitle,
  payload,
  controls,
  onChange
}: FormBuilderWidgetProps) {
  const [mode, setMode] = useState<'design' | 'run'>('design');
  const [selectedId, setSelectedId] = useState<string | null>(
    controls[0]?.id ?? null
  );

  const selectedCtrl = controls.find((c) => c.id === selectedId) ?? null;

  const addControl = (type: VbaControlType) => {
    const count = controls.filter((c) => c.type === type).length + 1;
    const prefix = DEFAULT_PREFIX[type] || 'ctrl';
    const newCtrl: VbaFormControl = {
      id: `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      name: `${prefix}Yeni${count}`,
      caption:
        type === 'Label'
          ? `Etiket ${count}`
          : type === 'CommandButton'
          ? `Buton ${count}`
          : type === 'CheckBox' || type === 'OptionButton'
          ? `Seçenek ${count}`
          : undefined,
      value: type === 'TextBox' ? '' : undefined,
      items: type === 'ListBox' ? ['Örnek 1', 'Örnek 2'] : undefined,
      fontSize: 13
    };
    const next = [...controls, newCtrl];
    onChange(next);
    setSelectedId(newCtrl.id);
    setMode('design');
  };

  const moveControl = (id: string, dir: -1 | 1) => {
    const idx = controls.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= controls.length) return;
    const next = [...controls];
    const [item] = next.splice(idx, 1);
    next.splice(targetIdx, 0, item);
    onChange(next);
  };

  const removeControl = (id: string) => {
    const next = controls.filter((c) => c.id !== id);
    onChange(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id ?? null);
    }
  };

  const updateSelected = (patch: Partial<VbaFormControl>) => {
    if (!selectedCtrl) return;
    onChange(
      controls.map((c) => (c.id === selectedCtrl.id ? { ...c, ...patch } : c))
    );
  };

  return (
    <div className="space-y-4">
      {/* Mode Switch & Toolbox */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-600 mr-1">
            Araç Kutusu:
          </span>
          {payload.allowedControls.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addControl(type)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 hover:border-sky-500 hover:bg-sky-50"
            >
              <Plus className="h-3 w-3 text-sky-600" />
              {type} ekle
            </button>
          ))}
        </div>

        {payload.allowRunPreview && (
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setMode('design')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                mode === 'design'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              <Wrench className="h-3 w-3" /> Tasarım
            </button>
            <button
              type="button"
              onClick={() => setMode('run')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                mode === 'run'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              <Play className="h-3 w-3" /> Çalıştır
            </button>
          </div>
        )}
      </div>

      {/* Form Preview */}
      <UserFormPreview
        title={formTitle}
        controls={controls}
        mode={mode}
        selectedControlId={selectedId}
        onSelectControl={setSelectedId}
        onControlChange={(name, val) => {
          onChange(
            controls.map((c) =>
              c.name === name ? { ...c, value: val } : c
            )
          );
        }}
      />

      {/* Component Order & Properties Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Component List with Up/Down */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
          <div className="text-xs font-semibold text-slate-700">
            Formdaki Bileşenler ({controls.length})
          </div>
          {controls.length === 0 ? (
            <p className="text-xs text-slate-400">Henüz bileşen eklenmedi.</p>
          ) : (
            <ul className="space-y-1.5">
              {controls.map((c, idx) => (
                <li
                  key={c.id}
                  className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs ${
                    selectedId === c.id
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className="flex-1 text-left font-medium text-slate-800"
                  >
                    <span className="font-mono text-sky-700">{c.name}</span>{' '}
                    <span className="text-slate-400">({c.type})</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveControl(c.id, -1)}
                      aria-label="Yukarı taşı"
                      title="Yukarı taşı"
                      className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === controls.length - 1}
                      onClick={() => moveControl(c.id, 1)}
                      aria-label="Aşağı taşı"
                      title="Aşağı taşı"
                      className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeControl(c.id)}
                      aria-label="Bileşeni sil"
                      title="Sil"
                      className="rounded p-1 text-rose-500 hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Properties Panel */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2.5">
          <div className="text-xs font-semibold text-slate-700">
            Özellikler (Properties)
          </div>
          {!selectedCtrl ? (
            <p className="text-xs text-slate-400">
              Düzenlemek için bir bileşen seç.
            </p>
          ) : (
            <div className="space-y-2 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-0.5">
                  Name (VBA Adı)
                </label>
                <input
                  type="text"
                  value={selectedCtrl.name}
                  onChange={(e) => updateSelected({ name: e.target.value })}
                  className="w-full rounded border border-slate-300 px-2 py-1 font-mono text-xs text-slate-900"
                />
              </div>

              {(selectedCtrl.type === 'Label' ||
                selectedCtrl.type === 'CommandButton' ||
                selectedCtrl.type === 'CheckBox' ||
                selectedCtrl.type === 'OptionButton') && (
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">
                    Caption (Görünen Yazı)
                  </label>
                  <input
                    type="text"
                    value={selectedCtrl.caption || ''}
                    onChange={(e) => updateSelected({ caption: e.target.value })}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900"
                  />
                </div>
              )}

              {selectedCtrl.type === 'TextBox' && (
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">
                    Value (Başlangıç Değeri)
                  </label>
                  <input
                    type="text"
                    value={String(selectedCtrl.value ?? '')}
                    onChange={(e) => updateSelected({ value: e.target.value })}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">
                    Font.Size
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={24}
                    value={selectedCtrl.fontSize ?? 13}
                    onChange={(e) =>
                      updateSelected({ fontSize: Number(e.target.value) || 13 })
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-0.5">
                    ForeColor
                  </label>
                  <select
                    value={selectedCtrl.foreColor || '#0f172a'}
                    onChange={(e) => updateSelected({ foreColor: e.target.value })}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900"
                  >
                    <option value="#0f172a">Siyah (Varsayılan)</option>
                    <option value="#ffffff">Beyaz (vbWhite)</option>
                    <option value="#16a34a">Yeşil (vbGreen)</option>
                    <option value="#dc2626">Kırmızı (vbRed)</option>
                    <option value="#2563eb">Mavi (vbBlue)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
