import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';
import { AKADEMI_COURSES_CATALOG } from '@/lib/akademi/shared';
import {
  ALL_STUDENT_GROUPS,
  resolveTargetGroups
} from '@/lib/akademi/services/progressService';

function formatCourseSettings(dbSettings: any[]) {
  return AKADEMI_COURSES_CATALOG.map((cat) => {
    const dbMatch = dbSettings.find((c) => c.code === cat.code);
    const rawGroups = dbMatch ? dbMatch.visibleGroups : undefined;
    const visibleGroups: string[] = Array.isArray(rawGroups)
      ? rawGroups.map(String)
      : (dbMatch ? dbMatch.defaultVisible : cat.defaultVisible)
      ? [...ALL_STUDENT_GROUPS]
      : [];
    return {
      code: cat.code,
      title: cat.title,
      shortTitle: cat.shortTitle,
      defaultVisible: visibleGroups.length > 0,
      visibleGroups,
      isReady: dbMatch ? dbMatch.isReady : cat.isReady
    };
  });
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const prisma = await getPrismaAsync();
    const dbSettings = await prisma.courseSetting.findMany();
    return NextResponse.json({ courses: formatCourseSettings(dbSettings) });
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
  groupKey: z.string().optional(), // 'ALL' | '1' | '2' | '1-A' | '1-B' | '2-A' | '2-B'
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
    const targetGroups = resolveTargetGroups(parsed.data.groupKey);

    const existing = await prisma.courseSetting.findUnique({
      where: { code: parsed.data.code }
    });

    const currentGroups: string[] = Array.isArray((existing as any)?.visibleGroups)
      ? (existing as any).visibleGroups.map(String)
      : existing?.defaultVisible ?? catalogItem.defaultVisible
      ? [...ALL_STUDENT_GROUPS]
      : [];

    const nextGroups = parsed.data.defaultVisible
      ? Array.from(new Set([...currentGroups, ...targetGroups]))
      : currentGroups.filter((g) => !targetGroups.includes(g));

    await prisma.courseSetting.upsert({
      where: { code: parsed.data.code },
      update: {
        defaultVisible: nextGroups.length > 0,
        visibleGroups: nextGroups
      },
      create: {
        code: parsed.data.code,
        title: catalogItem.title,
        defaultVisible: nextGroups.length > 0,
        visibleGroups: nextGroups,
        isReady: catalogItem.isReady
      }
    });

    // Update ONLY students belonging to targetGroups who had custom allowedCourses
    if (parsed.data.applyToAllStudents !== false) {
      const targetPairs = targetGroups.map((g) => {
        const [cls, sec] = g.split('-');
        return { classLevel: parseInt(cls, 10), section: sec };
      });

      const affectedStudents = await prisma.student.findMany({
        where: { OR: targetPairs }
      });

      for (const stu of affectedStudents) {
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
        }
      }
    }

    const dbSettings = await prisma.courseSetting.findMany();
    return NextResponse.json({
      courses: formatCourseSettings(dbSettings),
      message: `${catalogItem.shortTitle} dersi görünürlüğü güncellendi.`
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
