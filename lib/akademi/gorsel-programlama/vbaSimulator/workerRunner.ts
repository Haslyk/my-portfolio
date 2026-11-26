'use client';

import { runVbaSimulation } from './interpreter';
import { VbaRunOptions, VbaRunResult } from './types';

export function runVbaInWorker(
  options: VbaRunOptions,
  timeoutMs = 2000
): Promise<VbaRunResult> {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return Promise.resolve(runVbaSimulation(options));
  }

  return new Promise((resolve) => {
    let worker: Worker | null = null;
    let settled = false;
    const id = Math.random().toString(36).slice(2);

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      if (worker) {
        worker.terminate();
      }
      resolve({
        ok: false,
        error: {
          line: 1,
          message: `Zaman aşımı: Kod ${timeoutMs} ms içinde tamamlanamadı. Sonsuz döngü olabilir.`,
          isLimitExceeded: true
        },
        msgBoxes: [],
        controls: options.controls,
        sheet: options.sheet,
        readCells: [],
        writtenCells: [],
        trace: [],
        stepsExecuted: 0
      });
    }, timeoutMs);

    try {
      worker = new Worker(new URL('./vbaWorker.ts', import.meta.url));
      worker.onmessage = (event: MessageEvent<{ id: string; result: VbaRunResult }>) => {
        if (settled || event.data?.id !== id) return;
        settled = true;
        clearTimeout(timer);
        worker?.terminate();
        resolve(event.data.result);
      };
      worker.onerror = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        worker?.terminate();
        // Fallback to bounded synchronous execution if worker bundle fails
        resolve(runVbaSimulation({ ...options, maxTimeMs: Math.min(options.maxTimeMs ?? 1200, 1200) }));
      };
      worker.postMessage({ id, options });
    } catch {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(runVbaSimulation({ ...options, maxTimeMs: Math.min(options.maxTimeMs ?? 1200, 1200) }));
      }
    }
  });
}
