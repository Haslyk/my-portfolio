export interface LiveQuizStatusSnapshot {
  active: boolean;
  sessionId: string | null;
  status: string | null;
  currentQuestionIndex: number;
  participantCount: number;
  answeredCount: number;
}

const g = globalThis as unknown as {
  __liveQuizStatusCache?: Map<
    string,
    { data: LiveQuizStatusSnapshot; cachedAt: number }
  >;
};

function getCache() {
  if (!g.__liveQuizStatusCache) {
    g.__liveQuizStatusCache = new Map();
  }
  return g.__liveQuizStatusCache;
}

export function getCachedLiveQuizStatus(
  courseCode: string,
  ttlMs = 2000
): LiveQuizStatusSnapshot | null {
  const entry = getCache().get(courseCode);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > ttlMs) return null;
  return entry.data;
}

export function setCachedLiveQuizStatus(
  courseCode: string,
  data: LiveQuizStatusSnapshot
) {
  getCache().set(courseCode, { data, cachedAt: Date.now() });
}

export function invalidateLiveQuizStatusCache(courseCode: string) {
  getCache().delete(courseCode);
}
