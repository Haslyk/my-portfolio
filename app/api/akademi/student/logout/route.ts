import { NextRequest, NextResponse } from 'next/server';
import {
  STUDENT_COOKIE_NAME,
  revokeSessionCookie
} from '@/lib/akademi/services/sessionService';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      message:
        'Çıkış yapıldı. Ortak bilgisayardaki oturumunuz güvenli biçimde kapatıldı.'
    });
    await revokeSessionCookie(req, response, STUDENT_COOKIE_NAME);
    return response;
  } catch (err) {
    console.error('Student logout error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Çıkış yapılırken bir hata oluştu.'
      },
      { status: 500 }
    );
  }
}
