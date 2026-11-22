const LEASE_STORAGE_PREFIX = 'da_lease_';
const DRAFT_CACHE_PREFIX = 'da_draft_';
const ACTIVE_STUDENT_ID_KEY = 'da_active_student_id';

export type SaveIndicatorState = 'saved' | 'saving' | 'offline';

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: any;

  constructor(message: string, status: number, code?: string, data?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export function setScopedStudentId(studentId: string | null) {
  try {
    const prev = sessionStorage.getItem(ACTIVE_STUDENT_ID_KEY);
    if (prev && prev !== studentId) {
      clearAllStudentLocalData();
    }
    if (studentId) {
      sessionStorage.setItem(ACTIVE_STUDENT_ID_KEY, studentId);
    } else {
      clearAllStudentLocalData();
    }
  } catch {
    // ignore storage errors
  }
}

export function clearAllStudentLocalData() {
  try {
    sessionStorage.removeItem(ACTIVE_STUDENT_ID_KEY);
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith(LEASE_STORAGE_PREFIX) || k.startsWith(DRAFT_CACHE_PREFIX))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}

export function getStoredLeaseToken(studentId: string): string | undefined {
  try {
    return sessionStorage.getItem(`${LEASE_STORAGE_PREFIX}${studentId}`) || undefined;
  } catch {
    return undefined;
  }
}

export function setStoredLeaseToken(studentId: string, token?: string) {
  try {
    if (token) {
      sessionStorage.setItem(`${LEASE_STORAGE_PREFIX}${studentId}`, token);
    }
  } catch {
    // ignore
  }
}

export function saveOfflineDraftBackup(studentId: string, attemptId: string, state: any, revision: number) {
  try {
    sessionStorage.setItem(
      `${DRAFT_CACHE_PREFIX}${studentId}_${attemptId}`,
      JSON.stringify({ state, revision, updatedAt: Date.now() })
    );
  } catch {
    // ignore
  }
}

export function getOfflineDraftBackup(
  studentId: string,
  attemptId: string
): { state: any; revision: number } | null {
  try {
    const raw = sessionStorage.getItem(`${DRAFT_CACHE_PREFIX}${studentId}_${attemptId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearOfflineDraftBackup(studentId: string, attemptId: string) {
  try {
    sessionStorage.removeItem(`${DRAFT_CACHE_PREFIX}${studentId}_${attemptId}`);
  } catch {
    // ignore
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { leaseToken?: string } = {}
): Promise<T> {
  const normalizedPath = path.startsWith('/api/akademi/')
    ? path
    : path.replace(/^\/api\//, '/api/akademi/');

  const headers = new Headers(options.headers || {});
  headers.set('X-Requested-With', 'DonanimAtolyem');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.leaseToken) {
    headers.set('X-Activity-Lease', options.leaseToken);
  }

  let response: Response;
  try {
    response = await fetch(normalizedPath, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError(
      'Bağlantı yok, yeniden denenecek.',
      0,
      'NETWORK_OFFLINE'
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'Bir hata oluştu.',
        response.status,
        data.code || data.error,
        data
      );
    }
    return data as T;
  }

  if (!response.ok) {
    throw new ApiError('İstek başarısız oldu.', response.status);
  }

  return (await response.text()) as unknown as T;
}

export function formatDurationSeconds(sec: number | null | undefined): string {
  if (sec === null || sec === undefined) return '-';
  const total = Math.max(0, Math.floor(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s} sn`;
  return `${m} dk ${s.toString().padStart(2, '0')} sn`;
}

export function formatIstanbulDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return '-';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  } catch {
    return '-';
  }
}
