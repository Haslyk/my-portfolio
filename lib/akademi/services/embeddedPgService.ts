import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { PGlite } from '@electric-sql/pglite';
import { Prisma } from '@prisma/client';

export async function createEmbeddedPostgresClient(options?: {
  dataDir?: string;
}) {
  const pg = options?.dataDir ? new PGlite(options.dataDir) : new PGlite();
  await pg.exec("SET TIME ZONE 'UTC';");

  const candidates = [
    path.resolve(
      process.cwd(),
      'prisma/migrations/20260101000000_init/migration.sql'
    ),
    path.resolve(
      process.cwd(),
      '../Ağ Temelleri/backend/prisma/migrations/20260101000000_init/migration.sql'
    )
  ];

  const migrationPath = candidates.find((p) => fs.existsSync(p));
  if (!migrationPath) {
    throw new Error('migration.sql dosyası bulunamadı.');
  }

  const tableCheck = await pg.query(
    `SELECT to_regclass('public."Student"') AS exists_flag`
  );
  const alreadyMigrated = Boolean((tableCheck.rows[0] as any)?.exists_flag);

  if (!alreadyMigrated) {
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    await pg.exec(migrationSql);
  }
  await pg.exec(`
    ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "allowedCourses" JSONB;
    CREATE TABLE IF NOT EXISTS "CourseSetting" (
      "code" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "defaultVisible" BOOLEAN NOT NULL DEFAULT true,
      "isReady" BOOLEAN NOT NULL DEFAULT false,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CourseSetting_pkey" PRIMARY KEY ("code")
    );
    ALTER TABLE "Week" ADD COLUMN IF NOT EXISTS "courseCode" TEXT NOT NULL DEFAULT 'ag-temelleri';
    ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "courseCode" TEXT NOT NULL DEFAULT 'ag-temelleri';
    DROP INDEX IF EXISTS "Week_order_key";
    CREATE UNIQUE INDEX IF NOT EXISTS "Week_courseCode_order_key" ON "Week"("courseCode", "order");
    CREATE TABLE IF NOT EXISTS "LiveQuizSession" (
      "id" TEXT NOT NULL,
      "courseCode" TEXT NOT NULL,
      "weekOrder" INTEGER NOT NULL DEFAULT 0,
      "title" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'WAITING',
      "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
      "questionStartedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LiveQuizSession_pkey" PRIMARY KEY ("id")
    );
    CREATE TABLE IF NOT EXISTS "LiveQuizParticipant" (
      "id" TEXT NOT NULL,
      "sessionId" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LiveQuizParticipant_pkey" PRIMARY KEY ("id")
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "LiveQuizParticipant_sessionId_studentId_key"
      ON "LiveQuizParticipant"("sessionId", "studentId");
    CREATE TABLE IF NOT EXISTS "LiveQuizAnswer" (
      "id" TEXT NOT NULL,
      "sessionId" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "questionIndex" INTEGER NOT NULL,
      "selectedOption" TEXT NOT NULL,
      "isCorrect" BOOLEAN NOT NULL,
      "responseTimeMs" INTEGER NOT NULL,
      "points" INTEGER NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LiveQuizAnswer_pkey" PRIMARY KEY ("id")
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "LiveQuizAnswer_sessionId_studentId_questionIndex_key"
      ON "LiveQuizAnswer"("sessionId", "studentId", "questionIndex");
  `);

  const parseRowDates = (row: any) => {
    if (!row || typeof row !== 'object') return row;
    const copy: Record<string, any> = { ...row };
    for (const key of [
      'createdAt',
      'lastSeenAt',
      'lastLoginAt',
      'expiresAt',
      'startedAt',
      'completedAt',
      'lastHeartbeatAt',
      'questionStartedAt',
      'updatedAt'
    ]) {
      const val = copy[key];
      if (val !== null && val !== undefined) {
        if (val instanceof Date) {
          copy[key] = new Date(
            val.getTime() - val.getTimezoneOffset() * 60 * 1000
          );
        } else {
          const rawStr = String(val);
          const utcStr =
            rawStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(rawStr)
              ? rawStr
              : `${rawStr.replace(' ', 'T')}Z`;
          copy[key] = new Date(utcStr);
        }
      }
    }
    for (const jsonKey of ['state', 'oldValue', 'newValue', 'allowedCourses']) {
      if (typeof copy[jsonKey] === 'string') {
        try {
          copy[jsonKey] = JSON.parse(copy[jsonKey]);
        } catch {
          // keep
        }
      }
    }
    return copy;
  };

  const wrapPgError = (err: any): never => {
    const code = err?.code;
    if (code === '23505') {
      throw new Prisma.PrismaClientKnownRequestError(
        err.message || 'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '6.3.1'
        }
      );
    }
    throw err;
  };

  function buildWhereClause(
    where: Record<string, any> | undefined,
    params: any[]
  ): string {
    if (!where || Object.keys(where).length === 0) return 'TRUE';
    const parts: string[] = [];

    for (const [rawKey, val] of Object.entries(where)) {
      if (val === undefined) continue;

      if (rawKey === 'studentId_weekId' && val && typeof val === 'object') {
        params.push(val.studentId);
        parts.push(`"studentId" = $${params.length}`);
        params.push(val.weekId);
        parts.push(`"weekId" = $${params.length}`);
        continue;
      }

      if (rawKey === 'courseCode_order' && val && typeof val === 'object') {
        params.push(val.courseCode);
        parts.push(`"courseCode" = $${params.length}`);
        params.push(val.order);
        parts.push(`"order" = $${params.length}`);
        continue;
      }

      if (val === null) {
        parts.push(`"${rawKey}" IS NULL`);
      } else if (
        typeof val === 'object' &&
        !Array.isArray(val) &&
        !(val instanceof Date)
      ) {
        if ('in' in val && Array.isArray(val.in)) {
          if (val.in.length === 0) {
            parts.push('FALSE');
          } else {
            const placeholders = val.in.map((item: any) => {
              params.push(item);
              return `$${params.length}`;
            });
            parts.push(`"${rawKey}" IN (${placeholders.join(', ')})`);
          }
        }
      } else {
        params.push(val instanceof Date ? val.toISOString() : val);
        parts.push(`"${rawKey}" = $${params.length}`);
      }
    }

    return parts.length > 0 ? parts.join(' AND ') : 'TRUE';
  }

  function buildOrderBy(orderBy: any): string {
    if (!orderBy) return '';
    const list = Array.isArray(orderBy) ? orderBy : [orderBy];
    const clauses: string[] = [];
    for (const item of list) {
      for (const [k, dir] of Object.entries(item)) {
        clauses.push(
          `"${k}" ${String(dir).toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`
        );
      }
    }
    return clauses.length ? `ORDER BY ${clauses.join(', ')}` : '';
  }

  async function hydrateRelations(
    tableName: string,
    rows: any[],
    include?: Record<string, any>
  ) {
    if (!include || rows.length === 0) return rows;

    for (const row of rows) {
      if (tableName === 'Session') {
        if (include.student && row.studentId) {
          row.student = await client.student.findUnique({
            where: { id: row.studentId }
          });
        }
        if (include.admin && row.adminId) {
          row.admin = await client.admin.findUnique({
            where: { id: row.adminId }
          });
        }
      }

      if (tableName === 'Week') {
        if (include.activities) {
          const orderBy =
            typeof include.activities === 'object'
              ? include.activities.orderBy
              : undefined;
          row.activities = await client.activity.findMany({
            where: { weekId: row.id },
            orderBy
          });
        }
        if (include.weekProgresses) {
          const subWhere =
            typeof include.weekProgresses === 'object'
              ? include.weekProgresses.where
              : {};
          row.weekProgresses = await client.weekProgress.findMany({
            where: { ...subWhere, weekId: row.id }
          });
        }
      }

      if (tableName === 'Activity') {
        if (include.week && row.weekId) {
          row.week = await client.week.findUnique({
            where: { id: row.weekId }
          });
        }
      }

      if (tableName === 'ActivityAttempt') {
        if (include.activity && row.activityId) {
          const actInclude =
            typeof include.activity === 'object'
              ? include.activity.include
              : undefined;
          row.activity = await client.activity.findUnique({
            where: { id: row.activityId },
            include: actInclude
          });
        }
      }

      if (tableName === 'Student') {
        if (include.weekProgresses) {
          row.weekProgresses = await client.weekProgress.findMany({
            where: { studentId: row.id }
          });
        }
        if (include.attempts) {
          const attInclude =
            typeof include.attempts === 'object'
              ? include.attempts.include
              : undefined;
          const attOrder =
            typeof include.attempts === 'object'
              ? include.attempts.orderBy
              : undefined;
          row.attempts = await client.activityAttempt.findMany({
            where: { studentId: row.id },
            include: attInclude,
            orderBy: attOrder
          });
        }
        if (include.auditLogs) {
          const logs = await client.adminAuditLog.findMany({
            where: { studentId: row.id },
            orderBy: { createdAt: 'desc' }
          });
          for (const l of logs) {
            l.admin = await client.admin.findUnique({
              where: { id: l.adminId }
            });
          }
          row.auditLogs = logs;
        }
      }
    }

    return rows;
  }

  function makeModel(
    tableName: string,
    defaults: () => Record<string, any>,
    pkField: string = 'id'
  ) {
    return {
      async findUnique(args: { where: Record<string, any>; include?: any }) {
        const params: any[] = [];
        const whereSql = buildWhereClause(args.where, params);
        const res = await pg.query(
          `SELECT * FROM "${tableName}" WHERE ${whereSql} LIMIT 1`,
          params
        );
        if (res.rows.length === 0) return null;
        const parsed = [parseRowDates(res.rows[0])];
        await hydrateRelations(tableName, parsed, args.include);
        return parsed[0];
      },

      async findFirst(args?: {
        where?: Record<string, any>;
        orderBy?: any;
        include?: any;
      }) {
        const params: any[] = [];
        const whereSql = buildWhereClause(args?.where, params);
        const orderSql = buildOrderBy(args?.orderBy);
        const res = await pg.query(
          `SELECT * FROM "${tableName}" WHERE ${whereSql} ${orderSql} LIMIT 1`,
          params
        );
        if (res.rows.length === 0) return null;
        const parsed = [parseRowDates(res.rows[0])];
        await hydrateRelations(tableName, parsed, args?.include);
        return parsed[0];
      },

      async findMany(args?: {
        where?: Record<string, any>;
        orderBy?: any;
        include?: any;
        select?: any;
      }) {
        const params: any[] = [];
        const whereSql = buildWhereClause(args?.where, params);
        const orderSql = buildOrderBy(args?.orderBy);
        const res = await pg.query(
          `SELECT * FROM "${tableName}" WHERE ${whereSql} ${orderSql}`,
          params
        );
        const parsed = res.rows.map(parseRowDates);
        await hydrateRelations(tableName, parsed, args?.include);
        return parsed;
      },

      async create(args: { data: Record<string, any>; include?: any }) {
        try {
          const fullData: Record<string, any> = {
            ...defaults(),
            ...args.data
          };
          const cols: string[] = [];
          const placeholders: string[] = [];
          const params: any[] = [];

          for (const [k, v] of Object.entries(fullData)) {
            if (v === undefined) continue;
            cols.push(`"${k}"`);
            if (v instanceof Date) {
              params.push(v.toISOString());
            } else if (
              v !== null &&
              typeof v === 'object' &&
              (k === 'state' ||
                k === 'oldValue' ||
                k === 'newValue' ||
                k === 'allowedCourses')
            ) {
              params.push(JSON.stringify(v));
            } else {
              params.push(v);
            }
            placeholders.push(`$${params.length}`);
          }

          const sql = `INSERT INTO "${tableName}" (${cols.join(
            ', '
          )}) VALUES (${placeholders.join(', ')}) RETURNING *`;
          const res = await pg.query(sql, params);
          const parsed = [parseRowDates(res.rows[0])];
          await hydrateRelations(tableName, parsed, args.include);
          return parsed[0];
        } catch (err) {
          return wrapPgError(err);
        }
      },

      async update(args: {
        where: Record<string, any>;
        data: Record<string, any>;
        include?: any;
      }) {
        try {
          const setParts: string[] = [];
          const params: any[] = [];

          const dataWithUpdated = { ...args.data };
          if (
            tableName === 'WeekProgress' ||
            tableName === 'ActivityLease' ||
            tableName === 'CourseSetting'
          ) {
            dataWithUpdated.updatedAt = new Date();
          }

          for (const [k, v] of Object.entries(dataWithUpdated)) {
            if (v === undefined) continue;
            if (
              v !== null &&
              typeof v === 'object' &&
              !(v instanceof Date) &&
              !Array.isArray(v) &&
              'increment' in v
            ) {
              params.push(v.increment);
              setParts.push(`"${k}" = "${k}" + $${params.length}`);
            } else if (v instanceof Date) {
              params.push(v.toISOString());
              setParts.push(`"${k}" = $${params.length}`);
            } else if (
              v !== null &&
              typeof v === 'object' &&
              (k === 'state' ||
                k === 'oldValue' ||
                k === 'newValue' ||
                k === 'allowedCourses')
            ) {
              params.push(JSON.stringify(v));
              setParts.push(`"${k}" = $${params.length}`);
            } else {
              params.push(v);
              setParts.push(`"${k}" = $${params.length}`);
            }
          }

          const whereSql = buildWhereClause(args.where, params);
          const sql = `UPDATE "${tableName}" SET ${setParts.join(
            ', '
          )} WHERE ${whereSql} RETURNING *`;
          const res = await pg.query(sql, params);
          const parsed = [parseRowDates(res.rows[0])];
          await hydrateRelations(tableName, parsed, args.include);
          return parsed[0];
        } catch (err) {
          return wrapPgError(err);
        }
      },

      async upsert(args: {
        where: Record<string, any>;
        update: Record<string, any>;
        create: Record<string, any>;
      }) {
        const existing = await this.findUnique({ where: args.where });
        if (existing) {
          return this.update({
            where: { [pkField]: existing[pkField] },
            data: args.update
          });
        }
        try {
          return await this.create({ data: args.create });
        } catch (err) {
          const retry = await this.findUnique({ where: args.where });
          if (retry) {
            return this.update({
              where: { [pkField]: retry[pkField] },
              data: args.update
            });
          }
          throw err;
        }
      },

      async deleteMany(args?: { where?: Record<string, any> }) {
        const params: any[] = [];
        const whereSql = buildWhereClause(args?.where, params);
        const res = await pg.query(
          `DELETE FROM "${tableName}" WHERE ${whereSql}`,
          params
        );
        return { count: res.affectedRows ?? 0 };
      }
    };
  }

  const client: any = {
    student: makeModel('Student', () => ({
      id: crypto.randomUUID(),
      allowedCourses: null,
      createdAt: new Date(),
      lastSeenAt: new Date()
    })),
    courseSetting: makeModel(
      'CourseSetting',
      () => ({
        defaultVisible: true,
        isReady: false,
        updatedAt: new Date()
      }),
      'code'
    ),
    admin: makeModel('Admin', () => ({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      lastLoginAt: null
    })),
    session: makeModel('Session', () => ({
      id: crypto.randomUUID(),
      createdAt: new Date()
    })),
    week: makeModel('Week', () => ({
      id: crypto.randomUUID()
    })),
    activity: makeModel('Activity', () => ({
      id: crypto.randomUUID(),
      required: true,
      expectedSeconds: 300,
      allocatedSeconds: 600,
      contentVersion: 1
    })),
    activityAttempt: makeModel('ActivityAttempt', () => ({
      id: crypto.randomUUID(),
      isFirstSuccess: false,
      contentVersion: 1,
      state: {},
      revision: 1,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      completedAt: null,
      activeSeconds: 0,
      checkCount: 0,
      lastHeartbeatAt: new Date()
    })),
    weekProgress: makeModel('WeekProgress', () => ({
      id: crypto.randomUUID(),
      status: 'LOCKED',
      completedAt: null,
      updatedAt: new Date()
    })),
    activityLease: makeModel('ActivityLease', () => ({
      id: crypto.randomUUID(),
      updatedAt: new Date()
    })),
    adminAuditLog: makeModel('AdminAuditLog', () => ({
      id: crypto.randomUUID(),
      createdAt: new Date()
    })),
    liveQuizSession: makeModel('LiveQuizSession', () => ({
      id: crypto.randomUUID(),
      weekOrder: 0,
      status: 'LOBBY_OPEN',
      currentQuestionIndex: 0,
      questionStartedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })),
    liveQuizParticipant: makeModel('LiveQuizParticipant', () => ({
      id: crypto.randomUUID(),
      joinedAt: new Date()
    })),
    liveQuizAnswer: makeModel('LiveQuizAnswer', () => ({
      id: crypto.randomUUID(),
      createdAt: new Date()
    })),
    async $transaction(fn: (tx: any) => Promise<any>) {
      return fn(client);
    },
    async $queryRaw(_strings: TemplateStringsArray) {
      const res = await pg.query('SELECT 1 as ok');
      return res.rows;
    },
    async $connect() {
      return;
    },
    async $disconnect() {
      await pg.close();
    }
  };

  return { prisma: client, pg };
}
