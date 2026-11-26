import { runVbaSimulation } from './interpreter';
import { VbaRunOptions, VbaRunResult } from './types';

self.onmessage = (event: MessageEvent<{ id: string; options: VbaRunOptions }>) => {
  const { id, options } = event.data;
  try {
    const result: VbaRunResult = runVbaSimulation(options);
    self.postMessage({ id, result });
  } catch (err: any) {
    self.postMessage({
      id,
      result: {
        ok: false,
        error: {
          line: 1,
          message: err?.message || 'Simülatör işçisinde beklenmeyen hata.'
        },
        msgBoxes: [],
        controls: options.controls || [],
        sheet: options.sheet,
        readCells: [],
        writtenCells: [],
        trace: [],
        stepsExecuted: 0
      } satisfies VbaRunResult
    });
  }
};
