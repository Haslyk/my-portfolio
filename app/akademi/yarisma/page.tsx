'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Zap } from 'lucide-react';

function YarismaContent() {
  const searchParams = useSearchParams();
  const courseCode = searchParams.get('course') || 'ag-temelleri';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <Link
            href={`/akademi/${courseCode}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Derse Dön
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <h1 className="text-base font-bold">Bilgi Yarışması</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Zap className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Bilgi Yarışması Yakında Eklenecek
          </h2>
          <p className="text-sm text-slate-400">
            Bu bölüm şu anda hazırlanıyor. Ders içi etkinliklerine devam edebilirsin.
          </p>
          <Link
            href={`/akademi/${courseCode}`}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Derse Dön
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function LiveQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <Loader2 className="h-7 w-7 animate-spin text-sky-400" />
        </div>
      }
    >
      <YarismaContent />
    </Suspense>
  );
}
