import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';

const resolveSchema = z.object({
  id: z.string().min(1)
});

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const parsed = resolveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Geçersiz yardım isteği ID.' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaAsync();
    await prisma.helpRequest.update({
      where: { id: parsed.data.id },
      data: {
        resolved: true,
        resolvedAt: new Date()
      }
    });

    return NextResponse.json({
      resolved: true,
      message: 'Yardım isteği çözüldü olarak işaretlendi.'
    });
  } catch (err) {
    console.error('Resolve help request error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Yardım isteği güncellenemedi.' },
      { status: 500 }
    );
  }
}
