import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';

const resolveSchema = z.union([
  z.object({ id: z.string().min(1) }),
  z.object({
    resolveAll: z.literal(true),
    courseCode: z.string().optional()
  })
]);

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const parsed = resolveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Geçersiz yardım isteği verisi.' },
        { status: 400 }
      );
    }

    const prisma = await getPrismaAsync();

    if ('resolveAll' in parsed.data && parsed.data.resolveAll) {
      const res = await prisma.helpRequest.updateMany({
        where: {
          resolved: false,
          ...(parsed.data.courseCode
            ? { courseCode: parsed.data.courseCode }
            : {})
        },
        data: {
          resolved: true,
          resolvedAt: new Date()
        }
      });

      return NextResponse.json({
        resolved: true,
        count: res.count,
        message: `${res.count} yardım isteği topluca çözüldü olarak işaretlendi.`
      });
    }

    await prisma.helpRequest.update({
      where: { id: (parsed.data as { id: string }).id },
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
