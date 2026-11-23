"use client";

import React, { useState, useEffect } from 'react';
import { WeekAnimationPublic } from '@/lib/akademi/shared';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Film
} from 'lucide-react';

interface WeekAnimationCardProps {
  animation: WeekAnimationPublic;
}

export const WeekAnimationCard: React.FC<WeekAnimationCardProps> = ({
  animation
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = animation.steps;
  const activeStep = steps[currentStepIndex] || steps[0];

  useEffect(() => {
    if (!isPlaying) return;
    const duration = activeStep?.durationMs || 16000;
    const timer = setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, activeStep, steps.length]);

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const renderSvgIllustration = () => {
    const stepNum = currentStepIndex + 1;

    if (animation.code === 'ANIM-W3') {
      // Fotoğrafın Yolculuğu
      return (
        <svg
          viewBox="0 0 680 220"
          className="w-full h-auto max-h-56 bg-slate-900 rounded-xl border border-slate-700"
          role="img"
          aria-label={`Fotoğrafın yolculuğu adım ${stepNum}`}
        >
          {/* Gönderici PC */}
          <g transform="translate(30, 55)">
            <rect
              x="0"
              y="0"
              width="110"
              height="75"
              rx="10"
              fill="#1E1B38"
              stroke="#F5A000"
              strokeWidth="3"
            />
            <text
              x="55"
              y="32"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="bold"
            >
              Ayşe (Gönderici)
            </text>
            <text x="55" y="52" textAnchor="middle" fill="#FDE68A" fontSize="11">
              Kampus.jpg
            </text>
          </g>

          {/* Ağ Yolu (Switch & Router) */}
          <line
            x1="140"
            y1="92"
            x2="530"
            y2="92"
            stroke="#475569"
            strokeWidth="4"
            strokeDasharray="8 6"
          />

          {/* Paketler */}
          {stepNum === 1 && (
            <g transform="translate(175, 55)">
              <rect
                x="0"
                y="0"
                width="140"
                height="75"
                rx="8"
                fill="#6D28D9"
                stroke="#DDD6FE"
                strokeWidth="2"
              />
              <text
                x="70"
                y="34"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="13"
                fontWeight="bold"
              >
                Bütün Fotoğraf
              </text>
              <text
                x="70"
                y="54"
                textAnchor="middle"
                fill="#E9D5FF"
                fontSize="11"
              >
                (Henüz Bölünmedi)
              </text>
            </g>
          )}

          {(stepNum === 2 || stepNum === 3) && (
            <g transform={stepNum === 2 ? 'translate(165, 50)' : 'translate(260, 50)'}>
              {[1, 2, 3, 4].map((pkt, idx) => (
                <g key={pkt} transform={`translate(${idx * 78}, 0)`}>
                  <rect
                    x="0"
                    y="12"
                    width="68"
                    height="60"
                    rx="8"
                    fill="#F5A000"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <text
                    x="34"
                    y="38"
                    textAnchor="middle"
                    fill="#1E1B38"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    Parça {pkt}/4
                  </text>
                  <text
                    x="34"
                    y="56"
                    textAnchor="middle"
                    fill="#1E1B38"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    Sıra #{pkt}
                  </text>
                </g>
              ))}
            </g>
          )}

          {stepNum === 4 && (
            <g transform="translate(360, 55)">
              <rect
                x="0"
                y="0"
                width="155"
                height="75"
                rx="8"
                fill="#059669"
                stroke="#A7F3D0"
                strokeWidth="2"
              />
              <text
                x="77"
                y="32"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="13"
                fontWeight="bold"
              >
                1-2-3-4 Birleştirildi!
              </text>
              <text
                x="77"
                y="54"
                textAnchor="middle"
                fill="#D1FAE5"
                fontSize="11"
              >
                Eksiksiz Teslim (TCP)
              </text>
            </g>
          )}

          {/* Alıcı PC */}
          <g transform="translate(535, 55)">
            <rect
              x="0"
              y="0"
              width="115"
              height="75"
              rx="10"
              fill="#1E1B38"
              stroke={stepNum === 4 ? '#10B981' : '#94A3B8'}
              strokeWidth="3"
            />
            <text
              x="57"
              y="32"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="bold"
            >
              Ali (Alıcı)
            </text>
            <text
              x="57"
              y="52"
              textAnchor="middle"
              fill={stepNum === 4 ? '#6EE7B7' : '#CBD5E1'}
              fontSize="11"
            >
              {stepNum === 4 ? 'Fotoğraf Açıldı' : 'Bekliyor...'}
            </text>
          </g>

          {/* Alt Bilgi */}
          <text
            x="340"
            y="195"
            textAnchor="middle"
            fill="#E2E8F0"
            fontSize="13"
            fontWeight="bold"
          >
            {activeStep.title}
          </text>
        </svg>
      );
    }

    if (animation.code === 'ANIM-W4') {
      // Bu IP Kimde? (ARP)
      return (
        <svg
          viewBox="0 0 680 230"
          className="w-full h-auto max-h-60 bg-slate-900 rounded-xl border border-slate-700"
          role="img"
          aria-label={`ARP animasyonu adım ${stepNum}`}
        >
          {/* Bilgisayar A */}
          <g transform="translate(25, 65)">
            <rect
              x="0"
              y="0"
              width="145"
              height="85"
              rx="10"
              fill="#1E1B38"
              stroke="#F5A000"
              strokeWidth="3"
            />
            <text
              x="72"
              y="26"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="bold"
            >
              Bilgisayar A
            </text>
            <text x="72" y="46" textAnchor="middle" fill="#FDE68A" fontSize="12">
              IP: 192.168.1.10
            </text>
            <text x="72" y="66" textAnchor="middle" fill="#CBD5E1" fontSize="11">
              MAC: 02:00:00:00:00:10
            </text>
          </g>

          {/* Switch */}
          <g transform="translate(275, 80)">
            <rect
              x="0"
              y="0"
              width="115"
              height="55"
              rx="8"
              fill="#334155"
              stroke="#94A3B8"
              strokeWidth="2"
            />
            <text
              x="57"
              y="32"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="bold"
            >
              Yerel Switch
            </text>
          </g>

          {/* Bilgisayar B (192.168.1.30) */}
          <g transform="translate(495, 18)">
            <rect
              x="0"
              y="0"
              width="160"
              height="75"
              rx="10"
              fill="#1E293B"
              stroke={stepNum === 2 ? '#F5A000' : '#64748B'}
              strokeWidth="2"
            />
            <text
              x="80"
              y="24"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="bold"
            >
              Bilgisayar B
            </text>
            <text x="80" y="43" textAnchor="middle" fill="#CBD5E1" fontSize="12">
              IP: 192.168.1.30
            </text>
            <text x="80" y="61" textAnchor="middle" fill="#94A3B8" fontSize="11">
              {stepNum >= 3 ? '(Yoksaydı: Ben .20 değilim)' : 'MAC: 02:00:00:00:00:30'}
            </text>
          </g>

          {/* Yazıcı (192.168.1.20) */}
          <g transform="translate(495, 118)">
            <rect
              x="0"
              y="0"
              width="160"
              height="80"
              rx="10"
              fill="#1E1B38"
              stroke={stepNum >= 3 ? '#10B981' : '#F5A000'}
              strokeWidth="3"
            />
            <text
              x="80"
              y="25"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="bold"
            >
              Ağ Yazıcısı (Hedef)
            </text>
            <text x="80" y="45" textAnchor="middle" fill="#6EE7B7" fontSize="12">
              IP: 192.168.1.20
            </text>
            <text x="80" y="65" textAnchor="middle" fill="#FDE68A" fontSize="11">
              MAC: 02:00:00:00:00:20
            </text>
          </g>

          {/* Bağlantı Çizgileri */}
          <line
            x1="170"
            y1="107"
            x2="275"
            y2="107"
            stroke={stepNum === 2 ? '#F5A000' : stepNum >= 3 ? '#10B981' : '#64748B'}
            strokeWidth="4"
            strokeDasharray={stepNum === 2 ? '8 5' : undefined}
          />
          <line
            x1="390"
            y1="95"
            x2="495"
            y2="55"
            stroke={stepNum === 2 ? '#F5A000' : '#475569'}
            strokeWidth="3"
            strokeDasharray={stepNum === 2 ? '8 5' : undefined}
          />
          <line
            x1="390"
            y1="118"
            x2="495"
            y2="155"
            stroke={stepNum === 2 ? '#F5A000' : stepNum >= 3 ? '#10B981' : '#64748B'}
            strokeWidth="4"
            strokeDasharray={stepNum === 2 ? '8 5' : undefined}
          />

          {/* Durum Balonu */}
          <text
            x="330"
            y="216"
            textAnchor="middle"
            fill="#FDE68A"
            fontSize="13"
            fontWeight="bold"
          >
            {stepNum === 1 && 'Hedef: 192.168.1.20 · MAC: ??? (Henüz Bilinmiyor)'}
            {stepNum === 2 && 'ARP Yayın (Broadcast - Kesik Oklar): "192.168.1.20 Kimde?"'}
            {stepNum === 3 && 'ARP Yanıtı (Unicast - Düz Yeşil Hat): "192.168.1.20 bende: 02:00:00:00:00:20"'}
            {stepNum === 4 && 'ARP Tablosuna Kaydedildi: 192.168.1.20 ↔ 02:00:00:00:00:20'}
          </text>
        </svg>
      );
    }

    // ANIM-W5: Aynı Ağ mı, Başka Ağ mı?
    return (
      <svg
        viewBox="0 0 680 230"
        className="w-full h-auto max-h-60 bg-slate-900 rounded-xl border border-slate-700"
        role="img"
        aria-label={`Ağlar arası iletişim adım ${stepNum}`}
      >
        {/* Bilgisayar */}
        <g transform="translate(20, 70)">
          <rect
            x="0"
            y="0"
            width="120"
            height="70"
            rx="10"
            fill="#1E1B38"
            stroke="#F5A000"
            strokeWidth="3"
          />
          <text
            x="60"
            y="28"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="13"
            fontWeight="bold"
          >
            Bilgisayar
          </text>
          <text x="60" y="48" textAnchor="middle" fill="#FDE68A" fontSize="11">
            192.168.1.10
          </text>
        </g>

        {/* Switch */}
        <g transform="translate(185, 75)">
          <rect
            x="0"
            y="0"
            width="105"
            height="60"
            rx="8"
            fill="#334155"
            stroke="#CBD5E1"
            strokeWidth="2"
          />
          <text
            x="52"
            y="34"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="13"
            fontWeight="bold"
          >
            Switch
          </text>
        </g>

        {/* Yerel Yazıcı */}
        <g transform="translate(175, 162)">
          <rect
            x="0"
            y="0"
            width="125"
            height="55"
            rx="8"
            fill="#064E3B"
            stroke={stepNum === 2 ? '#10B981' : '#64748B'}
            strokeWidth={stepNum === 2 ? '3' : '2'}
          />
          <text
            x="62"
            y="24"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="bold"
          >
            Yerel Yazıcı
          </text>
          <text x="62" y="42" textAnchor="middle" fill="#A7F3D0" fontSize="11">
            192.168.1.20 (LAN)
          </text>
        </g>

        {/* Yönlendirici */}
        <g transform="translate(345, 70)">
          <rect
            x="0"
            y="0"
            width="135"
            height="70"
            rx="10"
            fill="#4C1D95"
            stroke={stepNum >= 3 ? '#F5A000' : '#94A3B8'}
            strokeWidth="3"
          />
          <text
            x="67"
            y="28"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="13"
            fontWeight="bold"
          >
            Yönlendirici
          </text>
          <text x="67" y="48" textAnchor="middle" fill="#DDD6FE" fontSize="11">
            Geçit: 192.168.1.1
          </text>
        </g>

        {/* Uzak Sunucu */}
        <g transform="translate(530, 70)">
          <rect
            x="0"
            y="0"
            width="130"
            height="70"
            rx="10"
            fill="#1E1B38"
            stroke={stepNum === 4 ? '#F5A000' : '#64748B'}
            strokeWidth="3"
          />
          <text
            x="65"
            y="28"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="13"
            fontWeight="bold"
          >
            Uzak Sunucu
          </text>
          <text x="65" y="48" textAnchor="middle" fill="#FDE68A" fontSize="11">
            Dış Ağ (İnternet)
          </text>
        </g>

        {/* Çizgiler */}
        <line
          x1="140"
          y1="105"
          x2="185"
          y2="105"
          stroke={stepNum === 2 ? '#10B981' : stepNum >= 3 ? '#F5A000' : '#94A3B8'}
          strokeWidth="4"
        />
        <line
          x1="237"
          y1="135"
          x2="237"
          y2="162"
          stroke={stepNum === 2 ? '#10B981' : '#64748B'}
          strokeWidth={stepNum === 2 ? '5' : '3'}
        />
        <line
          x1="290"
          y1="105"
          x2="345"
          y2="105"
          stroke={stepNum >= 3 ? '#F5A000' : '#64748B'}
          strokeWidth={stepNum >= 3 ? '5' : '3'}
        />
        <line
          x1="480"
          y1="105"
          x2="530"
          y2="105"
          stroke={stepNum === 4 ? '#F5A000' : '#64748B'}
          strokeWidth={stepNum === 4 ? '5' : '3'}
          strokeDasharray="6 4"
        />
      </svg>
    );
  };

  return (
    <section
      aria-label={animation.title}
      className="bg-white rounded-2xl border-2 border-brand-purple/30 shadow-sm p-5 sm:p-6 mb-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-purple text-white flex items-center justify-center shrink-0">
            <Film className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-extrabold text-brand-navy">
                {animation.title}
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-brand-purple border border-purple-200">
                İsteğe Bağlı Görsel Rehber (~{animation.totalDurationSeconds} sn)
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-0.5">{animation.subtitle}</p>
          </div>
        </div>

        {/* Controls: Oynat/Duraklat, Baştan Başlat, Adım Adım */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-purple hover:bg-purple-800 text-white text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" aria-hidden="true" />
                <span>Duraklat</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" aria-hidden="true" />
                <span>Otomatik Oynat</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold border border-slate-300"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Baştan Başlat</span>
          </button>
        </div>
      </div>

      {/* SVG Stage */}
      <div className="mb-4">{renderSvgIllustration()}</div>

      {/* Step Indicator Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-4">
        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            setCurrentStepIndex((i) => Math.max(0, i - 1));
          }}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-sm font-bold text-slate-800 disabled:opacity-40 hover:bg-slate-100"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>Önceki Adım</span>
        </button>

        <div className="flex items-center gap-2">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(idx);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border transition-colors ${
                idx === currentStepIndex
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Adım {idx + 1}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            setCurrentStepIndex((i) => Math.min(steps.length - 1, i + 1));
          }}
          disabled={currentStepIndex === steps.length - 1}
          className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-sm font-bold text-slate-800 disabled:opacity-40 hover:bg-slate-100"
        >
          <span>Sonraki Adım</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Active Step Explanation */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 mb-4">
        <h4 className="font-extrabold text-brand-navy text-base mb-1">
          {activeStep.title}
        </h4>
        <p className="text-slate-800 text-sm sm:text-base font-medium mb-2">
          {activeStep.caption}
        </p>
        <div className="flex items-start gap-2 text-xs sm:text-sm text-brand-purple font-semibold">
          <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>Teknik Not: {activeStep.technicalNote}</span>
        </div>
      </div>

      {/* Key Takeaways (preventing technical misconceptions) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
          Unutulmaması Gereken Teknik Doğrular
        </p>
        <ul className="space-y-1.5">
          {animation.keyTakeaways.map((note, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs sm:text-sm text-slate-700"
            >
              <CheckCircle2
                className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
