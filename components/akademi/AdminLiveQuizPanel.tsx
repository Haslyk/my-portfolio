'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface AdminLiveQuizPanelProps {
  courseCode: string;
}

export function AdminLiveQuizPanel({ courseCode: _courseCode }: AdminLiveQuizPanelProps) {
  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
            Canlı Bilgi Yarışması
          </h3>
          <p className="text-xs text-slate-500">
            Bu modül şu anda pasif durumdadır; öğrenci panelinde &ldquo;Yakında&rdquo; etiketiyle gösterilmektedir.
          </p>
        </div>
      </div>

      <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-extrabold text-amber-900">
        Yakında Eklenecek
      </span>
    </div>
  );
}
