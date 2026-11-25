import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getPrismaAsync } from './db';
import { config } from '../config';

export const STUDENT_COOKIE_NAME = 'ag_student_sid';
export const ADMIN_COOKIE_NAME = 'ag_admin_sid';

export function hashToken(rawToken: string): string {
  return crypto
    .createHmac('sha256', config.sessionSecret)
    .update(rawToken)
    .digest('hex');
}

export function generateOpaqueToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function shouldUseSecureCookie(req?: NextRequest): boolean {
  if (!config.isProd) return false;
  if (!req) return true;
  const proto = req.headers.get('x-forwarded-proto');
  if (proto) return proto === 'https';
  try {
    return new URL(req.url).protocol === 'https:';
  } catch {
    return false;
  }
}

export async function createStudentSessionCookie(
  studentId: string,
  response: NextResponse,
  req?: NextRequest
) {
  const prisma = await getPrismaAsync();
  const rawToken = generateOpaqueToken();
  const tokenHash = hashToken(rawToken);
  const csrfToken = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + config.sessionTtlMs);

  await prisma.session.create({
    data: {
      tokenHash,
      role: 'STUDENT',
      studentId,
      csrfToken,
      expiresAt
    }
  });

  response.cookies.set(STUDENT_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: shouldUseSecureCookie(req),
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(config.sessionTtlMs / 1000)
  });

  return { csrfToken };
}

export async function createAdminSessionCookie(
  adminId: string,
  response: NextResponse,
  req?: NextRequest
) {
  const prisma = await getPrismaAsync();
  const rawToken = generateOpaqueToken();
  const tokenHash = hashToken(rawToken);
  const csrfToken = generateOpaqueToken();
  const ttlMs = 1000 * 60 * 60 * 12; // 12 hours
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.session.create({
    data: {
      tokenHash,
      role: 'ADMIN',
      adminId,
      csrfToken,
      expiresAt
    }
  });

  response.cookies.set(ADMIN_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: shouldUseSecureCookie(req),
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(ttlMs / 1000)
  });

  return { csrfToken };
}

export async function revokeSessionCookie(
  req: NextRequest,
  response: NextResponse,
  cookieName: string
) {
  const prisma = await getPrismaAsync();
  const rawToken = req.cookies.get(cookieName)?.value;
  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    const session = await prisma.session.findUnique({ where: { tokenHash } });
    if (session?.studentId) {
      await prisma.activityLease.deleteMany({
        where: { studentId: session.studentId }
      });
    }
    await prisma.session.deleteMany({ where: { tokenHash } });
  }
  response.cookies.delete(cookieName);
}

export interface AuthenticatedStudent {
  id: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  approvalStatus: string;
  allowedCourses: any;
  sessionId: string;
  csrfToken: string;
}

export interface AuthenticatedAdmin {
  id: string;
  username: string;
  sessionId: string;
  csrfToken: string;
}

export async function getAuthenticatedStudent(
  req: NextRequest,
  options?: { allowPending?: boolean }
): Promise<
  | { ok: true; student: AuthenticatedStudent }
  | { ok: false; response: NextResponse }
> {
  const rawToken = req.cookies.get(STUDENT_COOKIE_NAME)?.value;
  if (!rawToken) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'UNAUTHORIZED',
          message:
            'Oturumunuz bulunamadı veya süresi doldu. Lütfen atölyeye tekrar giriş yapın.'
        },
        { status: 401 }
      )
    };
  }

  const prisma = await getPrismaAsync();
  const tokenHash = hashToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { student: true }
  });

  if (
    !session ||
    session.role !== 'STUDENT' ||
    !session.student ||
    session.expiresAt.getTime() < Date.now()
  ) {
    if (session) {
      await prisma.session.deleteMany({ where: { id: session.id } });
    }
    const res = NextResponse.json(
      {
        error: 'SESSION_EXPIRED',
        message:
          'Oturum süreniz doldu. Lütfen ad, soyad ve öğrenci numaranızla yeniden giriş yapın.'
      },
      { status: 401 }
    );
    res.cookies.delete(STUDENT_COOKIE_NAME);
    return { ok: false, response: res };
  }

  const approvalStatus = (session.student as any).approvalStatus || 'APPROVED';
  if (approvalStatus !== 'APPROVED' && !options?.allowPending) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'PENDING_APPROVAL',
          message:
            'Kayıt isteğiniz öğretmen onayı bekliyor. Onaylandıktan sonra derslere erişebilirsiniz.'
        },
        { status: 403 }
      )
    };
  }

  return {
    ok: true,
    student: {
      id: session.student.id,
      firstName: session.student.firstName,
      lastName: session.student.lastName,
      studentNumber: session.student.studentNumber,
      approvalStatus,
      allowedCourses: (session.student as any).allowedCourses ?? null,
      sessionId: session.id,
      csrfToken: session.csrfToken
    }
  };
}

export async function getAuthenticatedAdmin(
  req: NextRequest
): Promise<
  | { ok: true; admin: AuthenticatedAdmin }
  | { ok: false; response: NextResponse }
> {
  const rawToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!rawToken) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'ADMIN_UNAUTHORIZED',
          message: 'Bu işlem için öğretmen (admin) girişi gereklidir.'
        },
        { status: 401 }
      )
    };
  }

  const prisma = await getPrismaAsync();
  const tokenHash = hashToken(rawToken);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { admin: true }
  });

  if (
    !session ||
    session.role !== 'ADMIN' ||
    !session.admin ||
    session.expiresAt.getTime() < Date.now()
  ) {
    if (session) {
      await prisma.session.deleteMany({ where: { id: session.id } });
    }
    const res = NextResponse.json(
      {
        error: 'ADMIN_SESSION_EXPIRED',
        message: 'Öğretmen oturumunuz sona erdi. Lütfen tekrar giriş yapın.'
      },
      { status: 401 }
    );
    res.cookies.delete(ADMIN_COOKIE_NAME);
    return { ok: false, response: res };
  }

  return {
    ok: true,
    admin: {
      id: session.admin.id,
      username: session.admin.username,
      sessionId: session.id,
      csrfToken: session.csrfToken
    }
  };
}
