import { PrismaClient } from '@prisma/client';
import {
  AKADEMI_COURSES_CATALOG,
  CURRICULUM_WEEKS
} from '@/lib/akademi/shared';
import { PUBLIC_CURRICULUM_WEEKS } from '@/lib/akademi/pc-donanimi';

export async function seedCurriculum(prisma: PrismaClient, force = false) {
  // Fast-path: if curriculum & courses are already seeded in DB, skip 50+ sequential upserts on serverless cold starts
  if (!force) {
    const [courseCount, activityCount] = await Promise.all([
      prisma.courseSetting.count(),
      prisma.activity.count()
    ]);
    if (courseCount >= AKADEMI_COURSES_CATALOG.length && activityCount >= 40) {
      return;
    }
  }

  // 1) Seed 3 Courses in CourseSetting (always keep title and isReady synced with catalog)
  for (const course of AKADEMI_COURSES_CATALOG) {
    const existingCourse = await prisma.courseSetting.findUnique({
      where: { code: course.code }
    });
    if (!existingCourse) {
      await prisma.courseSetting.create({
        data: {
          code: course.code,
          title: course.title,
          defaultVisible: course.defaultVisible,
          isReady: course.isReady
        }
      });
    } else if (
      existingCourse.isReady !== course.isReady ||
      existingCourse.title !== course.title
    ) {
      await prisma.courseSetting.update({
        where: { code: course.code },
        data: {
          title: course.title,
          isReady: course.isReady
        }
      });
    }
  }

  // 2) Seed 5 weeks & 20 activities for Ağ Temelleri ('ag-temelleri')
  for (const weekData of CURRICULUM_WEEKS) {
    const week = await prisma.week.upsert({
      where: {
        courseCode_order: {
          courseCode: 'ag-temelleri',
          order: weekData.order
        }
      },
      update: {
        title: weekData.title
      },
      create: {
        courseCode: 'ag-temelleri',
        order: weekData.order,
        title: weekData.title
      }
    });

    for (const actData of weekData.activities) {
      await prisma.activity.upsert({
        where: { code: actData.code },
        update: {
          courseCode: 'ag-temelleri',
          weekId: week.id,
          orderInWeek: actData.orderInWeek,
          title: actData.title,
          type: actData.category,
          widgetType: actData.config.widgetType,
          required: actData.required,
          expectedSeconds: actData.expectedSeconds,
          allocatedSeconds: actData.allocatedSeconds,
          contentVersion: actData.contentVersion
        },
        create: {
          courseCode: 'ag-temelleri',
          code: actData.code,
          weekId: week.id,
          orderInWeek: actData.orderInWeek,
          title: actData.title,
          type: actData.category,
          widgetType: actData.config.widgetType,
          required: actData.required,
          expectedSeconds: actData.expectedSeconds,
          allocatedSeconds: actData.allocatedSeconds,
          contentVersion: actData.contentVersion
        }
      });
    }
  }

  // 3) Seed 5 weeks & 20 activities for Bilgisayar Donanımı ('pc-donanimi')
  for (const weekDef of PUBLIC_CURRICULUM_WEEKS) {
    const week = await prisma.week.upsert({
      where: {
        courseCode_order: {
          courseCode: 'pc-donanimi',
          order: weekDef.order
        }
      },
      update: {
        title: weekDef.title
      },
      create: {
        courseCode: 'pc-donanimi',
        order: weekDef.order,
        title: weekDef.title
      }
    });

    for (let idx = 0; idx < weekDef.activities.length; idx++) {
      const actDef = weekDef.activities[idx];
      const mappedType =
        actDef.type === 'application'
          ? 'REQUIRED_ACTIVITY'
          : actDef.type === 'quiz'
          ? 'QUIZ'
          : 'HOMEWORK';

      await prisma.activity.upsert({
        where: { code: actDef.code },
        update: {
          courseCode: 'pc-donanimi',
          weekId: week.id,
          orderInWeek: idx + 1,
          title: actDef.title,
          type: mappedType,
          widgetType: actDef.widgetType,
          required: actDef.required,
          expectedSeconds: actDef.expectedSeconds,
          allocatedSeconds: actDef.allocatedSeconds,
          contentVersion: 1
        },
        create: {
          courseCode: 'pc-donanimi',
          code: actDef.code,
          weekId: week.id,
          orderInWeek: idx + 1,
          title: actDef.title,
          type: mappedType,
          widgetType: actDef.widgetType,
          required: actDef.required,
          expectedSeconds: actDef.expectedSeconds,
          allocatedSeconds: actDef.allocatedSeconds,
          contentVersion: 1
        }
      });
    }
  }
}
