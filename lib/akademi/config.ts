export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  sessionSecret:
    process.env.SESSION_SECRET ||
    'ag-atolyem-hitit-universitesi-gelistirme-gizli-oturum-anahtari-2026',
  studentNumberMinLen: parseInt(process.env.STUDENT_NUMBER_MIN_LEN || '5', 10),
  studentNumberMaxLen: parseInt(process.env.STUDENT_NUMBER_MAX_LEN || '15', 10),
  sessionTtlMs: 1000 * 60 * 60 * 24 * 14, // 14 days
  leaseTtlMs: 1000 * 65, // 65 seconds
  maxHeartbeatDeltaSec: 30
};
