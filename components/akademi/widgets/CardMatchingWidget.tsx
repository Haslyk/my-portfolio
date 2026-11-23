"use client";

import React, { useState } from 'react';
import {
  ActivityPublicConfig,
  ValidationFeedbackItem
} from '@/lib/akademi/shared';
import {
  CheckCircle2,
  AlertCircle,
  Radio,
  Compass,
  Network,
  Wifi,
  Link2,
  Sparkles,
  Zap
} from 'lucide-react';
import { CustomSelect } from '../CustomSelect';

interface WidgetProps {
  config: ActivityPublicConfig;
  state: Record<string, any>;
  onChange: (nextState: Record<string, any>) => void;
  feedbackItems: ValidationFeedbackItem[];
}

function getIcon(name: string) {
  switch (name) {
    case 'Radio':
      return <Radio className="w-5 h-5" aria-hidden="true" />;
    case 'Compass':
      return <Compass className="w-5 h-5" aria-hidden="true" />;
    case 'Wifi':
      return <Wifi className="w-5 h-5" aria-hidden="true" />;
    default:
      return <Network className="w-5 h-5" aria-hidden="true" />;
  }
}

export const CardMatchingWidget: React.FC<WidgetProps> = ({
  config,
  state,
  onChange,
  feedbackItems
}) => {
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const matching = config.matching;
  if (!matching) return null;

  const pairs: Record<string, string> =
    state.pairs && typeof state.pairs === 'object' ? state.pairs : {};

  const handleSelectLeft = (leftId: string) => {
    setSelectedLeftId((prev) => (prev === leftId ? null : leftId));
  };

  const handleAssignRight = (rightId: string) => {
    if (!selectedLeftId) return;
    const nextPairs = { ...pairs, [selectedLeftId]: rightId };
    onChange({ ...state, pairs: nextPairs });
    setSelectedLeftId(null);
  };

  const handleDirectSelectChange = (leftId: string, rightId: string) => {
    const nextPairs = { ...pairs };
    if (!rightId) {
      delete nextPairs[leftId];
    } else {
      nextPairs[leftId] = rightId;
    }
    onChange({ ...state, pairs: nextPairs });
  };

  const getFeedbackFor = (fieldId: string) =>
    feedbackItems.find((f) => f.fieldId === fieldId);

  const matchedCount = matching.leftItems.filter((li) =>
    Boolean(pairs[li.id])
  ).length;
  const totalCount = matching.leftItems.length;

  const customSelectOptions = matching.rightTargets.map((rt, idx) => ({
    value: rt.id,
    badge: `Görev ${String.fromCharCode(65 + idx)}`,
    label: rt.text
  }));

  return (
    <div className="space-y-6">
      {/* Gamified Mission Meter */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navyLight text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm border-b-4 border-brand-orange">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-orange text-brand-navy flex items-center justify-center font-extrabold">
            <Zap className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Donanım & Görev Eşleştirme İstasyonu
            </div>
            <div className="text-sm sm:text-base font-extrabold">
              {matchedCount === totalCount
                ? 'Tüm cihazların görev kartları takıldı! "Kontrol Et" ile enerjiyi ver.'
                : `${totalCount} ağ cihazından ${matchedCount} tanesine görev atadın.`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-32 sm:w-44 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
            <div
              className="h-full bg-brand-orange transition-all duration-300"
              style={{
                width: `${Math.round((matchedCount / totalCount) * 100)}%`
              }}
            />
          </div>
          <span className="font-mono font-extrabold text-sm text-brand-orange">
            {matchedCount}/{totalCount}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-sm text-blue-950 font-medium flex items-center gap-2.5">
        <Sparkles className="w-5 h-5 text-blue-700 shrink-0" />
        <span>
          <strong>İki Kolay Yöntem:</strong> İster soldan bir cihaza tıklayıp
          sağdaki görev kartına tıkla, istersen cihazın altındaki şık görev
          seçicisinden doğrudan seç!
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Devices */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-navy">
            1. Ağ Cihazları ({matchedCount}/{totalCount} Hazır)
          </h4>
          {matching.leftItems.map((item) => {
            const isSelected = selectedLeftId === item.id;
            const assignedTargetId = pairs[item.id] || '';
            const assignedTarget = matching.rightTargets.find(
              (r) => r.id === assignedTargetId
            );
            const fb = getFeedbackFor(item.id);

            return (
              <div
                key={item.id}
                className={`rounded-2xl border-2 p-4 transition-all bg-white shadow-sm ${
                  isSelected
                    ? 'border-brand-purple ring-4 ring-brand-purple/15'
                    : fb
                    ? fb.isCorrect
                      ? 'border-emerald-500'
                      : 'border-amber-500'
                    : assignedTarget
                    ? 'border-brand-navy/40'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => handleSelectLeft(item.id)}
                    className={`flex items-center gap-3 text-left flex-1 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                      isSelected
                        ? 'bg-brand-purple text-white shadow-sm'
                        : assignedTarget
                        ? 'bg-brand-navy text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-brand-navy'
                    }`}
                  >
                    <span className="p-2 rounded-lg bg-white text-brand-navy shrink-0 shadow-sm">
                      {getIcon(item.iconName)}
                    </span>
                    <div className="flex-1">
                      <div className="text-base font-extrabold flex items-center justify-between">
                        <span>{item.label}</span>
                        {isSelected && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-orange text-brand-navy font-extrabold">
                            Şimdi Sağdan Görev Seç →
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div
                          className={`text-xs font-medium ${
                            isSelected || assignedTarget
                              ? 'text-slate-200'
                              : 'text-slate-600'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Styled CustomSelect Dropdown */}
                <div className="mt-2">
                  <label className="block text-xs font-extrabold text-slate-600 mb-1.5">
                    {item.label} Görev Kartı:
                  </label>
                  <CustomSelect
                    id={`select_${item.id}`}
                    value={assignedTargetId}
                    options={customSelectOptions}
                    placeholder="— Bu Cihaz İçin Görev Seçin —"
                    allowClear={true}
                    onChange={(val) => handleDirectSelectChange(item.id, val)}
                  />
                </div>

                {/* Per-item feedback */}
                {fb && (
                  <div
                    className={`mt-3 flex items-start gap-2 p-3 rounded-xl text-xs sm:text-sm font-semibold ${
                      fb.isCorrect
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-amber-50 text-amber-950 border border-amber-300'
                    }`}
                  >
                    {fb.isCorrect ? (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertCircle
                        className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
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

        {/* Right column: Target Role Cards */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-brand-navy">
            2. Görev Kartları{' '}
            {selectedLeftId && (
              <span className="text-brand-purple font-extrabold normal-case">
                (Seçili cihaza atamak istediğin karta tıkla!)
              </span>
            )}
          </h4>
          {matching.rightTargets.map((target, idx) => {
            const matchedLeftItems = matching.leftItems.filter(
              (li) => pairs[li.id] === target.id
            );

            return (
              <button
                key={target.id}
                type="button"
                onClick={() => handleAssignRight(target.id)}
                disabled={!selectedLeftId}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-all shadow-sm ${
                  selectedLeftId
                    ? 'bg-purple-50 hover:bg-purple-100 border-brand-purple cursor-pointer ring-2 ring-brand-purple/20 scale-[1.01]'
                    : matchedLeftItems.length > 0
                    ? 'bg-white border-brand-navy/50'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-8 h-8 rounded-xl bg-brand-navy text-brand-orange font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {target.text}
                    </p>
                    {matchedLeftItems.length > 0 ? (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {matchedLeftItems.map((ml) => (
                          <span
                            key={ml.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-brand-orange text-brand-navy shadow-sm"
                          >
                            <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Bağlı Cihaz: {ml.label}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-xs font-semibold text-slate-400">
                        Henüz bir cihaza atanmadı
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
