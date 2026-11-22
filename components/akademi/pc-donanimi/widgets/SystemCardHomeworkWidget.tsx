"use client";

import React from 'react';
import {
  PublicScenarioItem,
  ValidationFeedbackItem,
} from '@/lib/akademi/pc-donanimi';
import {
  CircuitBoard,
  Cpu,
  MemoryStick,
  HardDrive,
  MonitorPlay,
  Network,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const PART_ICONS: Record<string, React.FC<{ className?: string }>> = {
  CircuitBoard,
  Cpu,
  MemoryStick,
  HardDrive,
  MonitorPlay,
  Network,
};

interface SystemCardHomeworkWidgetProps {
  systemParts: { id: string; label: string; iconName: string }[];
  roleOptions: { id: string; label: string }[];
  scenarios: PublicScenarioItem[];
  state: Record<string, any>;
  onChangeState: (nextState: Record<string, any>) => void;
  feedbackItems?: ValidationFeedbackItem[];
}

export const SystemCardHomeworkWidget: React.FC<SystemCardHomeworkWidgetProps> = ({
  systemParts,
  roleOptions,
  scenarios,
  state,
  onChangeState,
  feedbackItems,
}) => {
  const partRoles: Record<string, string> =
    typeof state.partRoles === 'object' && state.partRoles !== null
      ? state.partRoles
      : {};
  const scenarioSelections: Record<string, string> =
    typeof state.scenarios === 'object' && state.scenarios !== null
      ? state.scenarios
      : {};

  const feedbackByItem = new Map(
    (feedbackItems || []).map((f) => [f.itemId, f])
  );

  const handleSelectPartRole = (partId: string, roleId: string) => {
    onChangeState({
      ...state,
      partRoles: {
        ...partRoles,
        [partId]: roleId,
      },
    });
  };

  const handleSelectScenario = (scenarioId: string, optionId: string) => {
    onChangeState({
      ...state,
      scenarios: {
        ...scenarioSelections,
        [scenarioId]: optionId,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Imaginary System Spec Card Header */}
      <div className="bg-[#1E1B38] text-white p-5 rounded-2xl border-2 border-[#F5A000] shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-[#F5A000]">
          Hayalî Sistem Kartı · Öğrenci Atölye Bilgisayarı
        </div>
        <h4 className="text-lg font-extrabold mt-0.5">
          Bölüm 1: Altı Temel Parçayı Tek Cümlelik Göreviyle Eşleştir
        </h4>
        <p className="text-xs text-slate-300 mt-1">
          Gerçek bilgisayar bilgisi veya fotoğrafı gerekmez; aşağıdaki hayalî sistem parçalarının görevlerini seçin.
        </p>
      </div>

      {/* Section 1: 6 Parts Role Matching */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemParts.map((part) => {
          const IconComp = PART_ICONS[part.iconName] || Cpu;
          const chosenRole = partRoles[part.id] || '';
          const fb = feedbackByItem.get(`part_${part.id}`);

          return (
            <div
              key={part.id}
              className={`rounded-2xl border-2 p-4 transition ${
                fb
                  ? fb.correct
                    ? 'border-emerald-500 bg-emerald-50/40'
                    : 'border-amber-500 bg-amber-50/40'
                  : chosenRole
                  ? 'border-purple-300 bg-white'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#1E1B38] text-[#F5A000] flex items-center justify-center shrink-0">
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-base text-slate-900">{part.label}</h5>
                  <span className="text-xs text-slate-500">Görevi nedir?</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {roleOptions.map((ro) => {
                  const active = chosenRole === ro.id;
                  return (
                    <button
                      key={ro.id}
                      type="button"
                      onClick={() => handleSelectPartRole(part.id, ro.id)}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        active
                          ? 'border-[#1E1B38] bg-[#1E1B38] text-white'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      {active ? `✓ ${ro.label}` : ro.label}
                    </button>
                  );
                })}
              </div>

              {fb && (
                <div
                  className={`mt-2.5 flex items-start gap-1.5 p-2 rounded-xl text-xs font-medium ${
                    fb.correct
                      ? 'bg-emerald-100 text-emerald-950'
                      : 'bg-amber-100 text-amber-950'
                  }`}
                >
                  {fb.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  )}
                  <span>{fb.message}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section 2: 3 Troubleshooting / Upgrade Scenarios */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 space-y-4">
        <h4 className="font-bold text-base sm:text-lg text-slate-900">
          Bölüm 2: Üç Durum Senaryosu
        </h4>

        <div className="space-y-3">
          {scenarios.map((sc, idx) => {
            const chosen = scenarioSelections[sc.id];
            const fb = feedbackByItem.get(sc.id);

            return (
              <div
                key={sc.id}
                className={`p-4 rounded-xl border-2 ${
                  fb
                    ? fb.correct
                      ? 'border-emerald-500 bg-emerald-50/40'
                      : 'border-amber-500 bg-amber-50/40'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="font-bold text-sm sm:text-base text-slate-900 mb-2.5">
                  {idx + 1}. Durum: “{sc.prompt}”
                </div>
                <div className="flex flex-wrap gap-2">
                  {(sc.options || []).map((opt) => {
                    const active = chosen === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectScenario(sc.id, opt.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition ${
                          active
                            ? 'border-[#1E1B38] bg-[#1E1B38] text-white'
                            : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        {active ? `✓ ${opt.label}` : opt.label}
                      </button>
                    );
                  })}
                </div>

                {fb && (
                  <div
                    className={`mt-2.5 flex items-start gap-2 p-2.5 rounded-xl text-xs font-medium ${
                      fb.correct
                        ? 'bg-emerald-100 text-emerald-950'
                        : 'bg-amber-100 text-amber-950'
                    }`}
                  >
                    {fb.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    )}
                    <span>{fb.message}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
