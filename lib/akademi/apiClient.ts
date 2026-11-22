export class ApiError extends Error {
  status: number;
  code: string;
  payload?: any;

  constructor(status: number, code: string, message: string, payload?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedPath = path.startsWith('/api/akademi/')
    ? path
    : path.startsWith('/api/')
    ? `/api/akademi/${path.slice(5)}`
    : path;

  const headers = new Headers(options.headers || {});
  headers.set('X-Requested-With', 'ag-atolyem');
  if (
    options.body &&
    typeof options.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(normalizedPath, {
    ...options,
    headers,
    credentials: 'include'
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const code =
      typeof data === 'object' && data?.error ? data.error : 'API_ERROR';
    const msg =
      typeof data === 'object' && data?.message
        ? data.message
        : 'İstek sırasında bir hata oluştu.';
    throw new ApiError(res.status, code, msg, data);
  }

  return data as T;
}

const DRAFT_PREFIX = 'ag_atolyem_draft_v1_';

export function saveOfflineDraft(
  studentId: string,
  attemptId: string,
  state: Record<string, any>,
  revision: number
) {
  try {
    const key = `${DRAFT_PREFIX}${studentId}_${attemptId}`;
    sessionStorage.setItem(
      key,
      JSON.stringify({
        studentId,
        attemptId,
        state,
        revision,
        updatedAt: Date.now()
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function loadOfflineDraft(
  studentId: string,
  attemptId: string
): { state: Record<string, any>; revision: number } | null {
  try {
    const key = `${DRAFT_PREFIX}${studentId}_${attemptId}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.studentId !== studentId || parsed.attemptId !== attemptId) {
      return null;
    }
    return { state: parsed.state, revision: parsed.revision };
  } catch {
    return null;
  }
}

export function clearOfflineDraft(studentId: string, attemptId: string) {
  try {
    sessionStorage.removeItem(`${DRAFT_PREFIX}${studentId}_${attemptId}`);
  } catch {
    // ignore
  }
}

export function clearAllClientDraftsAndCache() {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith('ag_atolyem_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));

    const localKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('ag_atolyem_')) {
        localKeys.push(k);
      }
    }
    localKeys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

export function formatDurationTr(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || seconds <= 0) return '0 sn';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} sn`;
  if (secs === 0) return `${mins} dk`;
  return `${mins} dk ${secs} sn`;
}

export function formatIstanbulDateTime(iso: string | null | undefined): string {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
