import path from 'path';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { createEmbeddedPostgresClient } from './embeddedPgService';
import { seedCurriculum } from './seedService';

const globalForAkademiDb = globalThis as unknown as {
  akademiPrisma: PrismaClient | null;
  akademiInitPromise: Promise<PrismaClient> | null;
  akademiUsingEmbeddedPg: boolean;
};

async function initAkademiDbInternal(): Promise<PrismaClient> {
  if (globalForAkademiDb.akademiPrisma) {
    return globalForAkademiDb.akademiPrisma;
  }

  const dbUrl = process.env.DATABASE_URL || '';
  const isLocalDummyUrl =
    !dbUrl ||
    dbUrl.includes('localhost:5432/agatolyem') ||
    dbUrl.startsWith('pglite://');
  const forceEmbedded =
    process.env.USE_EMBEDDED_PG === 'true' || isLocalDummyUrl;

  let client: PrismaClient;

  if (forceEmbedded) {
    const isVercel = Boolean(process.env.VERCEL);
    const dataDir = isVercel
      ? '/tmp/akademi-pgdata'
      : path.resolve(process.cwd(), '.pgdata');
    const embedded = await createEmbeddedPostgresClient({ dataDir });
    client = embedded.prisma as PrismaClient;
    globalForAkademiDb.akademiUsingEmbeddedPg = true;
  } else {
    let connectedPrisma: PrismaClient | null = null;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const candidate = new PrismaClient();
      try {
        await candidate.$connect();
        await candidate.$queryRaw`SELECT 1`;
        connectedPrisma = candidate;
        break;
      } catch (err) {
        lastError = err;
        await candidate.$disconnect().catch(() => {});
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, attempt * 400));
        }
      }
    }

    if (connectedPrisma) {
      client = connectedPrisma;
      globalForAkademiDb.akademiUsingEmbeddedPg = false;
    } else if (process.env.VERCEL) {
      // Never silently fall back to ephemeral /tmp PGlite on Vercel when DATABASE_URL is configured
      console.error('Vercel PostgreSQL bağlantısı 3 denemede başarısız:', lastError);
      throw lastError;
    } else {
      console.warn(
        'Harici PostgreSQL bağlantısı kurulamadı, PGlite gömülü veritabanına geçiliyor:',
        lastError
      );
      const dataDir = path.resolve(process.cwd(), '.pgdata');
      const embedded = await createEmbeddedPostgresClient({ dataDir });
      client = embedded.prisma as PrismaClient;
      globalForAkademiDb.akademiUsingEmbeddedPg = true;
    }
  }

  // Seed curriculum, courses, and default admin account idempotently
  await seedCurriculum(client);

  const envAdminUser = (process.env.ADMIN_USERNAME || 'halimaslyk').trim();
  const envAdminPass = (process.env.ADMIN_PASSWORD || 'hAlim123.').trim();
  if (envAdminUser && envAdminPass.length >= 6) {
    const existingAdmin = await client.admin.findUnique({
      where: { username: envAdminUser }
    });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(envAdminPass, 10);
      await client.admin.create({
        data: {
          username: envAdminUser,
          passwordHash
        }
      });
    }
  }

  globalForAkademiDb.akademiPrisma = client;
  return client;
}

export async function getPrismaAsync(): Promise<PrismaClient> {
  if (globalForAkademiDb.akademiPrisma) {
    return globalForAkademiDb.akademiPrisma;
  }
  if (!globalForAkademiDb.akademiInitPromise) {
    globalForAkademiDb.akademiInitPromise = initAkademiDbInternal().catch(
      (err) => {
        globalForAkademiDb.akademiInitPromise = null;
        throw err;
      }
    );
  }
  return globalForAkademiDb.akademiInitPromise;
}

export async function computeAllowedCoursesForStudent(
  prisma: PrismaClient,
  student: { allowedCourses?: any }
): Promise<string[]> {
  if (Array.isArray(student.allowedCourses)) {
    return student.allowedCourses.map(String);
  }
  const settings = await prisma.courseSetting.findMany();
  return settings.filter((s) => s.defaultVisible).map((s) => s.code);
}
