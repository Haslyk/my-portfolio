'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/akademi/pc-donanimi/api';
import { Award, CheckCircle2, Clock, Trophy } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  studentId: string;
  displayName: string;
  isSelf: boolean;
  checkCount: number;
  isFirstTry: boolean;
  elapsedMs: number;
  durationFormatted: string;
}

export function ActivityLeaderboardCard({
  courseCode,
  activityCode
}: {
  courseCode: string;
  activityCode: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['activity-leaderboard', courseCode, activityCode],
    queryFn: () =>
      apiFetch<{ entries: LeaderboardEntry[] }>(
        `/api/akademi/leaderboard?course=${encodeURIComponent(
          courseCode
        )}&activityCode=${encodeURIComponent(activityCode)}`
      ),
    enabled: Boolean(courseCode && activityCode),
    refetchInterval: 15000
  });

  const entries = data?.entries || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span>Sınıf Hız & Doğruluk Sıralaması ({activityCode})</span>
        </div>
        <span className="text-[11px] text-slate-500">
          Önce tekte doğru, sonra süre (sn.salise)
        </span>
      </div>

      {isLoading ? (
        <div className="text-xs text-slate-400">Sıralama yükleniyor...</div>
      ) : entries.length === 0 ? (
        <div className="text-xs text-slate-500">
          Bu etkinlikte henüz tamamlayan öğrenci yok. İlk sen ol!
        </div>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {entries.slice(0, 10).map((e) => (
            <div
              key={e.studentId}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${
                e.isSelf
                  ? 'border-sky-300 bg-sky-50 font-semibold text-sky-950'
                  : 'border-slate-100 bg-slate-50/70 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    e.rank === 1
                      ? 'bg-amber-400 text-amber-950'
                      : e.rank === 2
                      ? 'bg-slate-300 text-slate-900'
                      : e.rank === 3
                      ? 'bg-amber-700/20 text-amber-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {e.rank}
                </span>
                <span>
                  {e.displayName}
                  {e.isSelf ? ' (Sen)' : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {e.isFirstTry ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" /> Tekte
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    <Award className="h-3 w-3" /> {e.checkCount} deneme
                  </span>
                )}
                <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-900">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {e.durationFormatted}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
