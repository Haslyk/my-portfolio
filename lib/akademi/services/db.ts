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
    try {
      const realPrisma = new PrismaClient();
      await realPrisma.$connect();
      await realPrisma.$queryRaw`SELECT 1`;
      client = realPrisma;
      globalForAkademiDb.akademiUsingEmbeddedPg = false;
    } catch (err) {
      console.warn(
        'Harici PostgreSQL bağlantısı kurulamadı, PGlite gömülü veritabanına geçiliyor:',
        err
      );
      const isVercel = Boolean(process.env.VERCEL);
      const dataDir = isVercel
        ? '/tmp/akademi-pgdata'
        : path.resolve(process.cwd(), '.pgdata');
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
