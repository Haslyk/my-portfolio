"use client";

import React, { useState } from 'react';
import {
  PublicCardItem,
  PublicCategoryBox,
  ValidationFeedbackItem,
} from '@/lib/akademi/pc-donanimi';
import {
  Keyboard,
  Mouse,
  Monitor,
  AppWindow,
  Globe,
  FileText,
  Cpu,
  ZapOff,
  Image,
  FileCheck,
  Mic,
  Volume2,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Keyboard,
  Mouse,
  Monitor,
  AppWindow,
  Globe,
  FileText,
  Cpu,
  ZapOff,
  Image,
  FileCheck,
  Mic,
  Volume2,
  Smartphone,
};

interface CategorizeCardsWidgetProps {
  cards: PublicCardItem[];
  categories: PublicCategoryBox[];
  state: Record<string, any>;
  onChangeState: (nextState: Record<string, any>) => void;
  feedbackItems?: ValidationFeedbackItem[];
}

export const CategorizeCardsWidget: React.FC<CategorizeCardsWidgetProps> = ({
  cards,
  categories,
  state,
  onChangeState,
  feedbackItems,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const placements: Record<string, string> =
    typeof state.placements === 'object' && state.placements !== null
      ? state.placements
      : {};

  const feedbackByItem = new Map(
    (feedbackItems || []).map((f) => [f.itemId, f])
  );

  const handleAssignToCategory = (categoryId: string, cardIdToAssign?: string) => {
    const targetCardId = cardIdToAssign || selectedCardId;
    if (!targetCardId) return;

    const nextPlacements = {
      ...placements,
      [targetCardId]: categoryId,
    };
    onChangeState({
      ...state,
      placements: nextPlacements,
    });
    setSelectedCardId(null);
  };

  const handleUnassignCard = (cardId: string) => {
    const nextPlacements = { ...placements };
    delete nextPlacements[cardId];
    onChangeState({
      ...state,
      placements: nextPlacements,
    });
  };

  return (
    <div className="space-y-6">
      {categories.some((c) => c.id === 'ram') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-[#1E1B38] p-3.5 text-white text-xs">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/10 p-2.5">
            <Cpu className="h-5 w-5 text-[#F5A000] shrink-0" />
            <div>
              <div className="font-extrabold text-[#F5A000]">RAM — Çalışma Masası</div>
              <div className="text-slate-300">Çok hızlıdır ama elektrik gidince masa temizlenir.</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white/10 p-2.5">
            <FileCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-extrabold text-emerald-300">Depolama — Dosya Dolabı</div>
              <div className="text-slate-300">Daha yavaştır ama kapansa da içindekiler durur.</div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Selectable Cards Pool */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm sm:text-base font-bold text-slate-800">
            1. İncelenecek Kartlar (Bir kartı seçip aşağıdaki uygun kutuya tıklayın)
          </h4>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Yerleştirilen: {Object.keys(placements).length} / {cards.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card) => {
            const IconComp = ICON_MAP[card.iconName] || Cpu;
            const assignedCatId = placements[card.id];
            const assignedCat = categories.find((c) => c.id === assignedCatId);
            const isSelected = selectedCardId === card.id;
            const fb = feedbackByItem.get(card.id);

            return (
              <div
                key={card.id}
                className={`rounded-2xl border-2 p-3.5 transition flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-[#F5A000] bg-amber-50/90 ring-2 ring-[#F5A000]/40'
                    : fb
                    ? fb.correct
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-amber-500 bg-amber-50/40'
                    : assignedCat
                    ? 'border-purple-300 bg-purple-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCardId((prev) => (prev === card.id ? null : card.id))
                  }
                  className="text-left flex items-start gap-3 w-full focus:outline-none"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[#F5A000] text-[#1E1B38]'
                        : 'bg-[#1E1B38]/10 text-[#1E1B38]'
                    }`}
                  >
                    <IconComp className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-base leading-snug">
                      {card.label}
                    </div>
                    {card.description && (
                      <div className="text-xs text-slate-600 mt-0.5">{card.description}</div>
                    )}
                  </div>
                </button>

                {/* Direct accessible quick-select buttons for each category (Keyboard/Touch friendly, no drag-drop required) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                  {categories.map((cat) => {
                    const active = assignedCatId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleAssignToCategory(cat.id, card.id)}
                        className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition ${
                          active
                            ? 'bg-[#1E1B38] text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {active ? `✓ ${cat.label}` : cat.label}
                      </button>
                    );
                  })}
                </div>

                {fb && (
                  <div
                    className={`flex items-start gap-2 text-xs p-2.5 rounded-xl font-medium ${
                      fb.correct
                        ? 'bg-emerald-100/80 text-emerald-900'
                        : 'bg-amber-100/90 text-amber-950'
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

      {/* Step 2: Category Target Boxes */}
      <div>
        <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-3">
          2. Kutular {selectedCardId ? '(Seçili kartı yerleştirmek için kutuya tıklayın)' : ''}
        </h4>
        <div
          className={`grid grid-cols-1 ${
            categories.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
          } gap-4`}
        >
          {categories.map((cat) => {
            const assignedCards = cards.filter((c) => placements[c.id] === cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => {
                  if (selectedCardId) handleAssignToCategory(cat.id);
                }}
                role="region"
                aria-label={`${cat.label} kutusu`}
                className={`rounded-2xl border-2 p-4 transition min-h-[150px] flex flex-col justify-between ${
                  selectedCardId
                    ? 'border-[#F5A000] bg-amber-50/40 cursor-pointer hover:bg-amber-50'
                    : 'border-slate-300 bg-slate-50/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-200">
                    <div>
                      <h5 className="font-bold text-base text-[#1E1B38]">{cat.label}</h5>
                      {cat.subtitle && (
                        <p className="text-xs text-slate-600">{cat.subtitle}</p>
                      )}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1E1B38] text-white">
                      {assignedCards.length}
                    </span>
                  </div>

                  {assignedCards.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      Henüz kart yerleştirilmedi.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {assignedCards.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 shadow-sm"
                        >
                          <span>{c.label}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnassignCard(c.id);
                            }}
                            aria-label={`${c.label} kartını kutudan çıkar`}
                            className="text-slate-400 hover:text-red-600 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCardId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignToCategory(cat.id);
                    }}
                    className="mt-3 w-full py-2 rounded-xl bg-[#F5A000] hover:bg-amber-500 text-[#1E1B38] font-bold text-xs shadow-sm"
                  >
                    Seçili Kartı “{cat.label}” Kutusuna Yerleştir
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
