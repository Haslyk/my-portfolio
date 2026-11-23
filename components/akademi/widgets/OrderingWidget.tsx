"use client";

import React from 'react';
import {
  ActivityPublicConfig,
  ValidationFeedbackItem
} from '@/lib/akademi/shared';
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface WidgetProps {
  config: ActivityPublicConfig;
  state: Record<string, any>;
  onChange: (nextState: Record<string, any>) => void;
  feedbackItems: ValidationFeedbackItem[];
}

export const OrderingWidget: React.FC<WidgetProps> = ({
  config,
  state,
  onChange,
  feedbackItems
}) => {
  // Mode A: Standard card ordering with Up/Down buttons (W3-A1)
  if (config.ordering) {
    const initialCards = config.ordering.initialCards;
    const currentOrderIds: string[] =
      Array.isArray(state.cardOrder) && state.cardOrder.length === initialCards.length
        ? state.cardOrder
        : initialCards.map((c) => c.id);

    const orderedCards = currentOrderIds
      .map((id) => initialCards.find((c) => c.id === id))
      .filter(Boolean) as typeof initialCards;

    const moveCard = (index: number, direction: -1 | 1) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= currentOrderIds.length) return;
      const next = [...currentOrderIds];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      onChange({ ...state, cardOrder: next });
    };

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-sm text-blue-950 font-medium">
          Kartların sağındaki <strong>Yukarı Taşı</strong> ve{' '}
          <strong>Aşağı Taşı</strong> düğmelerini kullanarak adımları 1’den 4’e
          doğru sırala.
        </div>

        <div className="space-y-3">
          {orderedCards.map((card, idx) => {
            const fb = feedbackItems.find((f) => f.fieldId === `pos_${idx + 1}`);
            return (
              <div
                key={card.id}
                className={`bg-white rounded-xl border-2 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  fb
                    ? fb.isCorrect
                      ? 'border-emerald-500'
                      : 'border-amber-500'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-navy text-white font-extrabold text-base flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-brand-navy text-base">
                      {card.title}
                    </h4>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {card.description}
                    </p>
                    {fb && (
                      <div
                        className={`mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
                          fb.isCorrect
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-amber-50 text-amber-900'
                        }`}
                      >
                        {fb.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                        <span>{fb.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Keyboard & click accessible Up/Down buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => moveCard(idx, -1)}
                    disabled={idx === 0}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs sm:text-sm font-bold border border-slate-300"
                    aria-label={`${card.title} kartını yukarı taşı`}
                  >
                    <ArrowUp className="w-4 h-4" aria-hidden="true" />
                    <span>Yukarı</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCard(idx, 1)}
                    disabled={idx === orderedCards.length - 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs sm:text-sm font-bold border border-slate-300"
                    aria-label={`${card.title} kartını aşağı taşı`}
                  >
                    <ArrowDown className="w-4 h-4" aria-hidden="true" />
                    <span>Aşağı</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Mode B: Missing Packet TCP Reliable Delivery Simulation (W3-A2)
  if (config.missingPacket) {
    const mp = config.missingPacket;
    const selectedMissingNumber: number | null =
      state.selectedMissingNumber !== undefined
        ? Number(state.selectedMissingNumber)
        : null;
    const requestedRetransmit = Boolean(state.requestedRetransmit);
    const placedSlotIndex: number | null =
      state.placedSlotIndex !== undefined ? Number(state.placedSlotIndex) : null;
    const isMerged = Boolean(state.isMerged);

    return (
      <div className="space-y-6">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-brand-navy font-medium">
          <strong>TCP Güvenilir İletim Notu:</strong> {mp.protocolNote}
        </div>

        {/* Visual Buffer Display */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 mb-3">
            Alıcı Cihaza Ulaşan Fotoğraf Parçaları
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((num) => {
              const isInitiallyPresent = mp.receivedPackets.includes(num);
              const isPlacedHere =
                num === 3 && requestedRetransmit && placedSlotIndex === 3;

              return (
                <div
                  key={num}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${
                    isInitiallyPresent
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : isPlacedHere
                      ? 'bg-brand-orange/20 border-brand-orange text-brand-navy'
                      : 'bg-red-50 border-dashed border-red-400 text-red-900'
                  }`}
                >
                  <div className="text-xs font-bold uppercase">
                    {num}. Konum
                  </div>
                  <div className="text-lg font-extrabold mt-1">
                    {isInitiallyPresent
                      ? `Parça #${num} (Var)`
                      : isPlacedHere
                      ? 'Parça #3 (Eklendi)'
                      : 'EKSİK PARÇA!'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Choose missing packet number */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
          <h4 className="font-extrabold text-brand-navy text-base mb-2">
            Adım 1: Eksik Olan Parça Numarasını Seç
          </h4>
          <div className="flex flex-wrap gap-3">
            {mp.candidateMissingNumbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() =>
                  onChange({
                    ...state,
                    selectedMissingNumber: num,
                    requestedRetransmit: false,
                    placedSlotIndex: null,
                    isMerged: false
                  })
                }
                className={`px-5 py-3 rounded-xl font-extrabold text-sm sm:text-base border-2 transition-all ${
                  selectedMissingNumber === num
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-300'
                }`}
              >
                Parça #{num}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Request retransmission */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
          <h4 className="font-extrabold text-brand-navy text-base mb-2">
            Adım 2: Eksik Parçayı Göndericiden Yeniden İste (TCP Retransmission)
          </h4>
          <button
            type="button"
            disabled={!selectedMissingNumber}
            onClick={() =>
              onChange({
                ...state,
                requestedRetransmit: true
              })
            }
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm sm:text-base transition-all ${
              requestedRetransmit
                ? 'bg-emerald-700 text-white'
                : 'bg-brand-purple hover:bg-purple-800 text-white disabled:opacity-40'
            }`}
          >
            <RefreshCw className="w-5 h-5" aria-hidden="true" />
            <span>
              {requestedRetransmit
                ? `Parça #${selectedMissingNumber} Göndericiden Geldi!`
                : selectedMissingNumber
                ? `Parça #${selectedMissingNumber} İçin Yeniden İstek Gönder`
                : 'Önce Adım 1’de Eksik Numarayı Seç'}
            </span>
          </button>
        </div>

        {/* Step 3: Place received packet in correct slot */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
          <h4 className="font-extrabold text-brand-navy text-base mb-2">
            Adım 3: Gelen Parçayı Doğru Konuma Yerleştir
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {mp.slotLabels.map((label, idx) => {
              const slotNum = idx + 1;
              const active = placedSlotIndex === slotNum;
              return (
                <button
                  key={slotNum}
                  type="button"
                  disabled={!requestedRetransmit}
                  onClick={() =>
                    onChange({
                      ...state,
                      placedSlotIndex: slotNum,
                      isMerged: false
                    })
                  }
                  className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    active
                      ? 'bg-brand-orange text-brand-navy border-brand-navy'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300 disabled:opacity-40'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Merge packets */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-5">
          <h4 className="font-extrabold text-brand-navy text-base mb-2">
            Adım 4: Sıralı Parçaları Birleştir ve Fotoğrafı Göster
          </h4>
          <button
            type="button"
            disabled={!placedSlotIndex}
            onClick={() =>
              onChange({
                ...state,
                isMerged: true
              })
            }
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-sm sm:text-base transition-all ${
              isMerged
                ? 'bg-emerald-700 text-white'
                : 'bg-brand-navy hover:bg-brand-navyLight text-white disabled:opacity-40'
            }`}
          >
            <Layers className="w-5 h-5" aria-hidden="true" />
            <span>
              {isMerged
                ? 'Parçalar (1-2-3-4) Birleştirildi!'
                : 'Fotoğrafı Birleştir'}
            </span>
          </button>

          {isMerged &&
            selectedMissingNumber === 3 &&
            requestedRetransmit &&
            placedSlotIndex === 3 && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-3 text-emerald-950">
                <ImageIcon className="w-8 h-8 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-extrabold text-sm sm:text-base">
                    Kampus_Fotografi.jpg (4/4 Parça Tamamlandı)
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-800">
                    TCP protokolü eksik olan 3. parçayı yeniden istedi ve fotoğrafı
                    bozulmadan ekranda oluşturdu. Şimdi "Kontrol Et" düğmesine
                    basabilirsin!
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Step feedbacks */}
        {feedbackItems.length > 0 && (
          <div className="space-y-2">
            {feedbackItems.map((fb) => (
              <div
                key={fb.fieldId}
                className={`flex items-start gap-2 p-3 rounded-xl text-sm font-semibold ${
                  fb.isCorrect
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                    : 'bg-amber-50 text-amber-950 border border-amber-300'
                }`}
              >
                {fb.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{fb.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};
