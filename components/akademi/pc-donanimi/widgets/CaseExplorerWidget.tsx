"use client";

import React, { useState } from 'react';
import {
  PublicHotspotPart,
  ValidationFeedbackItem,
} from '@/lib/akademi/pc-donanimi';
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  Tag,
  CircuitBoard,
  Cpu,
  MemoryStick,
  HardDrive,
} from 'lucide-react';

interface CaseExplorerWidgetProps {
  hotspotParts: PublicHotspotPart[];
  allowOptional3D?: boolean;
  state: Record<string, any>;
  onChangeState: (nextState: Record<string, any>) => void;
  feedbackItems?: ValidationFeedbackItem[];
}

export const CaseExplorerWidget: React.FC<CaseExplorerWidgetProps> = ({
  hotspotParts,
  allowOptional3D,
  state,
  onChangeState,
  feedbackItems,
}) => {
  const [activePartId, setActivePartId] = useState<string | null>(null);
  const [selectedLabelCardId, setSelectedLabelCardId] = useState<string | null>(null);

  const inspectedParts: string[] = Array.isArray(state.inspectedParts)
    ? state.inspectedParts
    : [];
  const labelingMode = Boolean(state.labelingMode);
  const labels: Record<string, string> =
    typeof state.labels === 'object' && state.labels !== null ? state.labels : {};

  const feedbackByItem = new Map(
    (feedbackItems || []).map((f) => [f.itemId, f])
  );

  const handleInspectPart = (partId: string) => {
    setActivePartId(partId);
    if (labelingMode && selectedLabelCardId) {
      // Assign selected label card to this part
      onChangeState({
        ...state,
        labels: {
          ...labels,
          [partId]: selectedLabelCardId,
        },
      });
      setSelectedLabelCardId(null);
      return;
    }

    if (!inspectedParts.includes(partId)) {
      onChangeState({
        ...state,
        inspectedParts: [...inspectedParts, partId],
      });
    }
  };

  const handleStartLabeling = () => {
    onChangeState({
      ...state,
      labelingMode: true,
    });
  };

  const handleAssignLabelDirectly = (targetPartId: string, labelId: string) => {
    const nextInspected = inspectedParts.includes(targetPartId)
      ? inspectedParts
      : [...inspectedParts, targetPartId];
    onChangeState({
      ...state,
      inspectedParts: nextInspected,
      labelingMode: true,
      labels: {
        ...labels,
        [targetPartId]: labelId,
      },
    });
    setSelectedLabelCardId(null);
  };

  const activePart = hotspotParts.find((p) => p.id === activePartId) || null;

  return (
    <div className="space-y-6">
      {/* Top status bar: Inspected count + Optional 3D toggle + Etiketleri Yerleştir button */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-slate-800">
            <Eye className="w-4 h-4 text-[#6D28D9]" />
            <span>İncelenen Görev Kartı: {inspectedParts.length} / {hotspotParts.length}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-bold text-slate-800">
            <Tag className="w-4 h-4 text-[#F5A000]" />
            <span>Yerleştirilen Etiket: {Object.keys(labels).length} / {hotspotParts.length}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartLabeling}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
              labelingMode
                ? 'bg-emerald-700 text-white'
                : 'bg-[#F5A000] hover:bg-amber-500 text-[#1E1B38]'
            }`}
          >
            Etiketleri Yerleştir
          </button>
        </div>
      </div>

      {/* Main 2D Case Diagram + Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Clean 2D SVG Case Schematic */}
        <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            2D Kasa İçi Şeması (Parçalara tıklayarak inceleyin ve etiketleyin)
          </div>

          <svg
            viewBox="0 0 560 320"
            className="w-full h-auto rounded-xl bg-slate-900 border border-slate-700 select-none"
            role="img"
            aria-label="Kasa içi anakart, işlemci, RAM ve SSD şeması"
          >
            {/* Outer PC Case Frame */}
            <rect
              x="12"
              y="12"
              width="536"
              height="296"
              rx="16"
              fill="#0F172A"
              stroke="#475569"
              strokeWidth="4"
            />

            {/* 1. Motherboard hotspot */}
            {(() => {
              const isInspected = inspectedParts.includes('anakart');
              const assigned = labels['anakart'];
              const assignedPart = hotspotParts.find((p) => p.id === assigned);
              return (
                <g
                  onClick={() => handleInspectPart('anakart')}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Anakart bölgesi"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleInspectPart('anakart');
                  }}
                >
                  <rect
                    x="40"
                    y="35"
                    width="340"
                    height="250"
                    rx="12"
                    fill="#1E3A5F"
                    stroke={activePartId === 'anakart' ? '#F5A000' : isInspected ? '#38BDF8' : '#64748B'}
                    strokeWidth={activePartId === 'anakart' ? '4' : '2.5'}
                  />
                  {/* Circuit traces */}
                  <path
                    d="M 60 245 H 350 M 60 260 H 320"
                    stroke="#38BDF8"
                    strokeOpacity="0.35"
                    strokeWidth="2"
                  />
                  <text
                    x="58"
                    y="64"
                    fill="#FFFFFF"
                    fontSize="15"
                    fontWeight="bold"
                  >
                    {labelingMode
                      ? assignedPart
                        ? `Etiket: ${assignedPart.label}`
                        : '[1. Bölge: Etiket Seç]'
                      : '1. Anakart'}
                  </text>
                </g>
              );
            })()}

            {/* 2. CPU (İşlemci) hotspot */}
            {(() => {
              const isInspected = inspectedParts.includes('islemci');
              const assigned = labels['islemci'];
              const assignedPart = hotspotParts.find((p) => p.id === assigned);
              return (
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspectPart('islemci');
                  }}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="İşlemci bölgesi"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleInspectPart('islemci');
                  }}
                >
                  <rect
                    x="110"
                    y="95"
                    width="105"
                    height="105"
                    rx="10"
                    fill="#334155"
                    stroke={activePartId === 'islemci' ? '#F5A000' : isInspected ? '#A855F7' : '#94A3B8'}
                    strokeWidth="3.5"
                  />
                  <rect x="128" y="113" width="69" height="69" rx="6" fill="#94A3B8" />
                  <text
                    x="162"
                    y="152"
                    textAnchor="middle"
                    fill="#0F172A"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    {labelingMode
                      ? assignedPart
                        ? assignedPart.label
                        : '[2. Bölge]'
                      : '2. İşlemci'}
                  </text>
                </g>
              );
            })()}

            {/* 3. RAM hotspot */}
            {(() => {
              const isInspected = inspectedParts.includes('ram');
              const assigned = labels['ram'];
              const assignedPart = hotspotParts.find((p) => p.id === assigned);
              return (
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspectPart('ram');
                  }}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="RAM bölgesi"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleInspectPart('ram');
                  }}
                >
                  <rect
                    x="255"
                    y="75"
                    width="90"
                    height="145"
                    rx="8"
                    fill="#14532D"
                    stroke={activePartId === 'ram' ? '#F5A000' : isInspected ? '#4ADE80' : '#94A3B8'}
                    strokeWidth="3.5"
                  />
                  <rect x="272" y="88" width="18" height="118" rx="3" fill="#22C55E" />
                  <rect x="305" y="88" width="18" height="118" rx="3" fill="#22C55E" />
                  <text
                    x="300"
                    y="238"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    {labelingMode
                      ? assignedPart
                        ? assignedPart.label
                        : '[3. Bölge]'
                      : '3. RAM'}
                  </text>
                </g>
              );
            })()}

            {/* 4. SSD hotspot */}
            {(() => {
              const isInspected = inspectedParts.includes('ssd');
              const assigned = labels['ssd'];
              const assignedPart = hotspotParts.find((p) => p.id === assigned);
              return (
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspectPart('ssd');
                  }}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="SSD bölgesi"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleInspectPart('ssd');
                  }}
                >
                  <rect
                    x="405"
                    y="155"
                    width="125"
                    height="90"
                    rx="10"
                    fill="#4C1D95"
                    stroke={activePartId === 'ssd' ? '#F5A000' : isInspected ? '#C084FC' : '#94A3B8'}
                    strokeWidth="3.5"
                  />
                  <text
                    x="467"
                    y="204"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {labelingMode
                      ? assignedPart
                        ? assignedPart.label
                        : '[4. Bölge]'
                      : '4. SSD'}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Right Side: Single-Sentence Role Cards & Accessible Label Placement */}
        <div className="lg:col-span-5 space-y-4">
          {/* Task Card / Inspection Panel */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
            <h4 className="font-bold text-slate-900 text-base mb-2">
              Parça Görev Kartları (4 Parçaya Tıklayarak Okuyun)
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {hotspotParts.map((part, idx) => {
                const inspected = inspectedParts.includes(part.id);
                const isCurrent = activePart?.id === part.id;
                const PartIcon =
                  part.id === 'anakart'
                    ? CircuitBoard
                    : part.id === 'islemci'
                    ? Cpu
                    : part.id === 'ram'
                    ? MemoryStick
                    : HardDrive;

                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => handleInspectPart(part.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition flex items-start gap-3 ${
                      isCurrent
                        ? 'border-[#F5A000] bg-amber-50'
                        : inspected
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        inspected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <PartIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">
                          {labelingMode ? `${idx + 1}. Bölge Görevi` : part.label}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200">
                          {inspected ? '✓ İncelendi' : 'Tıkla & Oku'}
                        </span>
                      </div>
                      {inspected && (
                        <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
                          {part.roleSentence}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label Matching Controls */}
          <div className="bg-white rounded-2xl border-2 border-purple-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 text-base">
                İsim Kartlarını Parçalarla Eşleştir
              </h4>
              {!labelingMode && (
                <button
                  type="button"
                  onClick={handleStartLabeling}
                  className="text-xs font-bold px-3 py-1 rounded-lg bg-[#F5A000] text-[#1E1B38]"
                >
                  Etiketleri Yerleştir
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Bir isim kartını seçip şemadaki parçaya tıklayabilir veya her bölge için aşağıdaki düğmelerden doğrudan etiket seçebilirsiniz:
            </p>

            {/* Selectable name cards */}
            <div className="flex flex-wrap gap-2 mb-4">
              {hotspotParts.map((labelCard) => {
                const isSelected = selectedLabelCardId === labelCard.id;
                return (
                  <button
                    key={labelCard.id}
                    type="button"
                    onClick={() => {
                      if (!labelingMode) handleStartLabeling();
                      setSelectedLabelCardId((prev) =>
                        prev === labelCard.id ? null : labelCard.id
                      );
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition ${
                      isSelected
                        ? 'border-[#F5A000] bg-[#F5A000] text-[#1E1B38] shadow'
                        : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    🏷️ {labelCard.label}
                  </button>
                );
              })}
            </div>

            {/* Direct region selector rows */}
            <div className="space-y-2.5">
              {hotspotParts.map((targetPart, idx) => {
                const currentLabel = labels[targetPart.id] || '';
                const fb = feedbackByItem.get(targetPart.id);
                return (
                  <div
                    key={targetPart.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {idx + 1}. Bölge ({targetPart.roleSentence})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {hotspotParts.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleAssignLabelDirectly(targetPart.id, opt.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              currentLabel === opt.id
                                ? 'bg-[#1E1B38] text-white'
                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {fb && (
                      <div
                        className={`mt-2 flex items-center gap-1.5 text-xs font-medium p-1.5 rounded-lg ${
                          fb.correct
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-950'
                        }`}
                      >
                        {fb.correct ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
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
      </div>
    </div>
  );
};
