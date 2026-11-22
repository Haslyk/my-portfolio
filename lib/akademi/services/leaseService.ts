import { Prisma, PrismaClient } from '@prisma/client';
import { config } from '../config';
import { generateOpaqueToken, hashToken } from './sessionService';

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Bir öğrenci için tek bir aktif çalışma lease'i üretir veya devralır (takeover).
 * Böylece aynı öğrenci iki sekmede aynı anda açık bıraktığında aktif süre çift sayılmaz.
 */
export async function issueOrTakeoverLease(
  tx: DbClient,
  studentId: string,
  attemptId: string
): Promise<string> {
  const rawLeaseToken = generateOpaqueToken();
  const tokenHash = hashToken(rawLeaseToken);
  const expiresAt = new Date(Date.now() + config.leaseTtlMs);

  await tx.activityLease.upsert({
    where: { studentId },
    update: {
      attemptId,
      tokenHash,
      expiresAt
    },
    create: {
      studentId,
      attemptId,
      tokenHash,
      expiresAt
    }
  });

  return rawLeaseToken;
}

/**
 * İstemciden gelen leaseToken'ın geçerli olup olmadığını kontrol eder.
 * Eğer başka bir sekme lease'i devralmışsa LEASE_CONFLICT döner.
 */
export async function verifyAndTouchLease(
  tx: DbClient,
  studentId: string,
  attemptId: string,
  rawLeaseToken?: string
): Promise<{ valid: boolean; reason?: 'LEASE_CONFLICT' | 'LEASE_MISSING' }> {
  const lease = await tx.activityLease.findUnique({
    where: { studentId }
  });

  if (!rawLeaseToken) {
    return { valid: false, reason: 'LEASE_MISSING' };
  }

  const incomingHash = hashToken(rawLeaseToken);

  if (!lease) {
    // If no lease exists in DB yet, re-register this token
    await tx.activityLease.create({
      data: {
        studentId,
        attemptId,
        tokenHash: incomingHash,
        expiresAt: new Date(Date.now() + config.leaseTtlMs)
      }
    });
    return { valid: true };
  }

  const isExpired =
    new Date(lease.expiresAt).getTime() < Date.now();

  if (lease.tokenHash !== incomingHash) {
    if (!isExpired) {
      return { valid: false, reason: 'LEASE_CONFLICT' };
    }
    // Previous lease expired (>65s without heartbeat), allow this tab to take over seamlessly
    await tx.activityLease.update({
      where: { studentId },
      data: {
        attemptId,
        tokenHash: incomingHash,
        expiresAt: new Date(Date.now() + config.leaseTtlMs)
      }
    });
    return { valid: true };
  }

  // Valid token matches active lease -> extend expiration
  await tx.activityLease.update({
    where: { studentId },
    data: {
      attemptId,
      expiresAt: new Date(Date.now() + config.leaseTtlMs)
    }
  });

  return { valid: true };
}

/**
 * Sunucu saatine göre son heartbeat zamanından bu yana geçen süreyi hesaplar
 * ve en fazla config.maxHeartbeatDeltaSec (30 sn) ile sınırlandırır.
 * İstemcinin gönderdiği toplam süreyi asla doğrudan kabul etmez.
 */
export function computeBoundedActiveDeltaSeconds(
  lastHeartbeatAt: Date,
  now: Date
): number {
  const diffSec = Math.floor((now.getTime() - lastHeartbeatAt.getTime()) / 1000);
  if (diffSec <= 0) return 0;
  return Math.min(diffSec, config.maxHeartbeatDeltaSec);
}
