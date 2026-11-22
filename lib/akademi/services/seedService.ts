import { PrismaClient } from '@prisma/client';
import {
  AKADEMI_COURSES_CATALOG,
  CURRICULUM_WEEKS
} from '@/lib/akademi/shared';

export async function seedCurriculum(prisma: PrismaClient) {
  // 1) Seed 3 Courses in CourseSetting
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
    }
  }

  // 2) Seed 5 weeks & 20 activities for Ağ Temelleri
  for (const weekData of CURRICULUM_WEEKS) {
    const week = await prisma.week.upsert({
      where: { order: weekData.order },
      update: {
        title: weekData.title
      },
      create: {
        order: weekData.order,
        title: weekData.title
      }
    });

    for (const actData of weekData.activities) {
      await prisma.activity.upsert({
        where: { code: actData.code },
        update: {
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

  // 3) Ensure existing students have WeekProgress records
  const allWeeks = await prisma.week.findMany({ orderBy: { order: 'asc' } });
  const allStudents = await prisma.student.findMany({ select: { id: true } });

  for (const student of allStudents) {
    for (const week of allWeeks) {
      const existing = await prisma.weekProgress.findUnique({
        where: {
          studentId_weekId: {
            studentId: student.id,
            weekId: week.id
          }
        }
      });
      if (!existing) {
        await prisma.weekProgress.create({
          data: {
            studentId: student.id,
            weekId: week.id,
            status: week.order === 1 ? 'NOT_STARTED' : 'LOCKED'
          }
        });
      }
    }
  }
}
