import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedAdmin(req);
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    admin: {
      id: auth.admin.id,
      username: auth.admin.username
    },
    csrfToken: auth.admin.csrfToken
  });
}
