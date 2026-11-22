import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';
import { AKADEMI_COURSES_CATALOG } from '@/lib/akademi/shared';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const prisma = await getPrismaAsync();
    const dbSettings = await prisma.courseSetting.findMany();

    const courses = AKADEMI_COURSES_CATALOG.map((cat) => {
      const dbMatch = dbSettings.find((c) => c.code === cat.code);
      return {
        code: cat.code,
        title: cat.title,
        shortTitle: cat.shortTitle,
        defaultVisible: dbMatch ? dbMatch.defaultVisible : cat.defaultVisible,
        isReady: dbMatch ? dbMatch.isReady : cat.isReady
      };
    });

    return NextResponse.json({ courses });
  } catch (err) {
    console.error('Get course settings error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Ders ayarları yüklenirken hata oluştu.'
      },
      { status: 500 }
    );
  }
}

const patchCourseSchema = z.object({
  code: z.enum(['ag-temelleri', 'pc-donanimi', 'gorsel-programlama']),
  defaultVisible: z.boolean(),
  applyToAllStudents: z.boolean().optional()
});

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await req.json().catch(() => ({}));
    const parsed = patchCourseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Geçersiz ders görünürlük verisi.'
        },
        { status: 400 }
      );
    }

    const prisma = await getPrismaAsync();
    const catalogItem = AKADEMI_COURSES_CATALOG.find(
      (c) => c.code === parsed.data.code
    )!;

    await prisma.courseSetting.upsert({
      where: { code: parsed.data.code },
      update: {
        defaultVisible: parsed.data.defaultVisible
      },
      create: {
        code: parsed.data.code,
        title: catalogItem.title,
        defaultVisible: parsed.data.defaultVisible,
        isReady: catalogItem.isReady
      }
    });

    // If applyToAllStudents is true, update existing students with custom allowedCourses too
    if (parsed.data.applyToAllStudents) {
      const allStudents = await prisma.student.findMany();
      const dbSettings = await prisma.courseSetting.findMany();
      const defaultVisibleCodes = AKADEMI_COURSES_CATALOG.filter((cat) => {
        const m = dbSettings.find((x) => x.code === cat.code);
        return m ? m.defaultVisible : cat.defaultVisible;
      }).map((c) => c.code);

      for (const stu of allStudents) {
        const raw = (stu as any).allowedCourses;
        if (Array.isArray(raw)) {
          const set = new Set<string>(raw.map(String));
          if (parsed.data.defaultVisible) {
            set.add(parsed.data.code);
          } else {
            set.delete(parsed.data.code);
          }
          await prisma.student.update({
            where: { id: stu.id },
            data: { allowedCourses: Array.from(set) }
          });
        } else if (defaultVisibleCodes) {
          // Student uses default setting (null), which automatically reflects the new defaultVisible
        }
      }
    }

    const dbSettings = await prisma.courseSetting.findMany();
    const courses = AKADEMI_COURSES_CATALOG.map((cat) => {
      const dbMatch = dbSettings.find((c) => c.code === cat.code);
      return {
        code: cat.code,
        title: cat.title,
        shortTitle: cat.shortTitle,
        defaultVisible: dbMatch ? dbMatch.defaultVisible : cat.defaultVisible,
        isReady: dbMatch ? dbMatch.isReady : cat.isReady
      };
    });

    return NextResponse.json({
      courses,
      message: `${catalogItem.shortTitle} dersi genel görünürlüğü güncellendi.`
    });
  } catch (err) {
    console.error('Patch course settings error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Ders ayarları güncellenirken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
