"use client";

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  CloudOff,
  Loader2,
  LogOut,
  Network,
  User
} from 'lucide-react';

export type SaveIndicatorState = 'IDLE' | 'SAVING' | 'SAVED' | 'OFFLINE_RETRY';

interface StudentHeaderProps {
  studentName?: string;
  studentNumber?: string;
  saveState: SaveIndicatorState;
  onLogout?: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  studentName,
  studentNumber,
  saveState,
  onLogout
}) => {
  return (
    <header className="bg-brand-navy text-white shadow-md border-b-4 border-brand-orange">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back to Course Selection & Application Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/akademi"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-navyLight hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-bold border border-slate-600 transition-colors"
            title="Ders Seçimi Ekranına Dön"
          >
            <ArrowLeft className="w-4 h-4 text-brand-orange" />
            <span>Derslerim</span>
          </Link>

          <div className="w-10 h-10 rounded-xl bg-brand-orange text-brand-navy flex items-center justify-center font-bold shadow-sm">
            <Network className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Ağ Atölyem
              </span>
              <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-brand-purple text-white font-semibold">
                5 Haftalık Uygulama
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">
              Ağ Temelleri · Halim Akademi
            </p>
          </div>
        </div>

        {/* Right: Student Name, Save Status & Logout */}
        {studentName && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Save Status Pill */}
            <div
              role="status"
              aria-live="polite"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border ${
                saveState === 'SAVING'
                  ? 'bg-amber-950/80 border-amber-400 text-amber-200'
                  : saveState === 'OFFLINE_RETRY'
                  ? 'bg-red-950/90 border-red-400 text-red-200'
                  : 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
              }`}
            >
              {saveState === 'SAVING' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Kaydediliyor...</span>
                </>
              )}
              {saveState === 'OFFLINE_RETRY' && (
                <>
                  <CloudOff className="w-4 h-4" aria-hidden="true" />
                  <span>Bağlantı yok, yeniden denenecek</span>
                </>
              )}
              {(saveState === 'SAVED' || saveState === 'IDLE') && (
                <>
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>Kaydedildi</span>
                </>
              )}
            </div>

            {/* Student Name Badge */}
            <div className="flex items-center gap-2 bg-brand-navyLight px-3 py-1.5 rounded-lg border border-slate-600">
              <User className="w-4 h-4 text-brand-orange" aria-hidden="true" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-white">{studentName}</span>
                {studentNumber && (
                  <span className="ml-1.5 text-slate-300 font-mono text-xs">
                    ({studentNumber})
                  </span>
                )}
              </div>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-red-700 text-white text-xs sm:text-sm font-bold transition-colors border border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                title="Oturumu kapat ve bu bilgisayardaki kişisel verileri temizle"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Çıkış</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
