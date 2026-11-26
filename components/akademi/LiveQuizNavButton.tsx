'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface LiveQuizNavButtonProps {
  courseCode: 'ag-temelleri' | 'pc-donanimi' | 'gorsel-programlama';
}

export function LiveQuizNavButton({ courseCode: _courseCode }: LiveQuizNavButtonProps) {
  return (
    <button
      type="button"
      disabled
      title="Bilgi yarışması yakında eklenecek"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-slate-300 border border-white/15 text-xs sm:text-sm font-bold cursor-not-allowed opacity-80"
    >
      <Zap className="w-4 h-4 shrink-0 text-[#F5A000]" aria-hidden="true" />
      <span>Bilgi Yarışması</span>
      <span className="rounded-full bg-[#F5A000]/20 text-[#F5A000] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
        Yakında
      </span>
    </button>
  );
}
