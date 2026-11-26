import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

export async function getParticipantsForSession(
  prisma: PrismaClient,
  sessionId: string
): Promise<{ id: string; sessionId: string; studentId: string; joinedAt: Date }[]> {
  if ((prisma as any).liveQuizParticipant) {
    return (prisma as any).liveQuizParticipant.findMany({
      where: { sessionId },
      orderBy: { joinedAt: 'asc' }
    });
  }
  return prisma.$queryRawUnsafe(
    `SELECT "id", "sessionId", "studentId", "joinedAt" FROM "LiveQuizParticipant" WHERE "sessionId" = $1 ORDER BY "joinedAt" ASC`,
    sessionId
  );
}

export async function upsertParticipantForSession(
  prisma: PrismaClient,
  sessionId: string,
  studentId: string
): Promise<void> {
  if ((prisma as any).liveQuizParticipant) {
    const existing = await (prisma as any).liveQuizParticipant.findUnique({
      where: { sessionId_studentId: { sessionId, studentId } }
    });
    if (!existing) {
      await (prisma as any).liveQuizParticipant.create({
        data: { sessionId, studentId }
      });
    }
    return;
  }
  const id = crypto.randomUUID();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "LiveQuizParticipant" ("id", "sessionId", "studentId", "joinedAt") VALUES ($1, $2, $3, NOW()) ON CONFLICT ("sessionId", "studentId") DO NOTHING`,
    id,
    sessionId,
    studentId
  );
}
