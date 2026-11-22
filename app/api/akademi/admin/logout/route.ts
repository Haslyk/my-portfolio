import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  revokeSessionCookie
} from '@/lib/akademi/services/sessionService';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      message: 'Öğretmen oturumu kapatıldı.'
    });
    await revokeSessionCookie(req, response, ADMIN_COOKIE_NAME);
    return response;
  } catch (err) {
    console.error('Admin logout error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Çıkış yapılırken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
