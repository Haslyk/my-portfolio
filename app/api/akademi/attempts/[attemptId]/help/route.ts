import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedStudent(req);
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    alreadyOpen: false,
    message: 'Yardım isteğin öğretmene iletildi.'
  });
}
