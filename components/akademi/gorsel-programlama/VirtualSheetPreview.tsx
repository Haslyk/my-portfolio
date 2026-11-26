'use client';

import React from 'react';
import { VirtualSheetData } from '@/lib/akademi/gorsel-programlama';
import { Table2, Info } from 'lucide-react';

interface VirtualSheetPreviewProps {
  sheet: VirtualSheetData;
  readCells?: string[];
  writtenCells?: string[];
}

export function VirtualSheetPreview({
  sheet,
  readCells = [],
  writtenCells = []
}: VirtualSheetPreviewProps) {
  const readSet = new Set(readCells);
  const writtenSet = new Set(writtenCells);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Table2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Sanal Çalışma Sayfası: {sheet.name}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="inline-flex items-center gap-1 text-sky-700">
            <span className="h-2 w-2 rounded-full bg-sky-500" /> Okunan
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Yazılan
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="w-8 border border-slate-200 px-2 py-1 text-center font-semibold">
                #
              </th>
              {sheet.columns.map((col) => (
                <th
                  key={col}
                  className="border border-slate-200 px-2.5 py-1 text-center font-semibold"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: sheet.rows }, (_, rIdx) => {
              const rowNum = rIdx + 1;
              return (
                <tr key={rowNum}>
                  <td className="border border-slate-200 bg-slate-50 px-2 py-1 text-center font-mono text-[11px] text-slate-500">
                    {rowNum}
                  </td>
                  {sheet.columns.map((_, cIdx) => {
                    const colNum = cIdx + 1;
                    const key = `${rowNum},${colNum}`;
                    const val = sheet.cells[key];
                    const isWritten = writtenSet.has(key);
                    const isRead = readSet.has(key);
                    return (
                      <td
                        key={key}
                        className={`border border-slate-200 px-2.5 py-1 font-mono text-xs transition ${
                          isWritten
                            ? 'bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-inset ring-emerald-400'
                            : isRead
                            ? 'bg-sky-50 text-sky-900 ring-1 ring-inset ring-sky-300'
                            : 'text-slate-800'
                        }`}
                      >
                        {val !== undefined && val !== '' ? String(val) : ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
        <Info className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
        <span>
          Bu tablo tarayıcı içi sanal çalışma sayfasıdır; bilgisayarındaki gerçek bir Excel (.xlsx/.xlsm) dosyasını değiştirmez.
        </span>
      </div>
    </div>
  );
}
