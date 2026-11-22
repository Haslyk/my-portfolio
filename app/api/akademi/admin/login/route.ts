import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { createAdminSessionCookie } from '@/lib/akademi/services/sessionService';

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Kullanıcı adı zorunludur.'),
  password: z.string().min(1, 'Parola zorunludur.')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Lütfen kullanıcı adı ve parolayı girin.'
        },
        { status: 400 }
      );
    }

    const prisma = await getPrismaAsync();
    const username = parsed.data.username.trim();
    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return NextResponse.json(
        {
          error: 'INVALID_CREDENTIALS',
          message: 'Kullanıcı adı veya parola hatalı.'
        },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(
      parsed.data.password,
      admin.passwordHash
    );
    if (!validPassword) {
      return NextResponse.json(
        {
          error: 'INVALID_CREDENTIALS',
          message: 'Kullanıcı adı veya parola hatalı.'
        },
        { status: 401 }
      );
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    });

    const response = NextResponse.json({
      admin: {
        id: admin.id,
        username: admin.username
      },
      message: 'Öğretmen paneline giriş başarılı.'
    });

    await createAdminSessionCookie(admin.id, response, req);
    return response;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Giriş sırasında hata oluştu.'
      },
      { status: 500 }
    );
  }
}
