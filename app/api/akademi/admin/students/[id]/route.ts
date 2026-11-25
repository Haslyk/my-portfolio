import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  computeAllowedCoursesForStudent,
  getPrismaAsync
} from '@/lib/akademi/services/db';
import { config } from '@/lib/akademi/config';
import { getAuthenticatedAdmin } from '@/lib/akademi/services/sessionService';
import {
  buildNormalizedFullName,
  cleanWhitespace,
  isValidTurkishName
} from '@/lib/akademi/services/normalization';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const { id: studentId } = await context.params;
    const prisma = await getPrismaAsync();
    const student: any = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        weekProgresses: true,
        attempts: {
          include: { activity: true },
          orderBy: { startedAt: 'asc' }
        },
        auditLogs: {
          include: { admin: { select: { username: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        {
          error: 'STUDENT_NOT_FOUND',
          message: 'Öğrenci kaydı bulunamadı.'
        },
        { status: 404 }
      );
    }

    const url = new URL(req.url);
    const courseFilter = url.searchParams.get('course') || undefined;

    const weeks = await prisma.week.findMany({
      ...(courseFilter ? { where: { courseCode: courseFilter } } : {}),
      orderBy: [{ courseCode: 'asc' }, { order: 'asc' }],
      include: {
        activities: { orderBy: { orderInWeek: 'asc' } }
      }
    });

    const weeksDetail = weeks.map((w) => {
      const wp = student.weekProgresses.find((p: any) => p.weekId === w.id);
      let weekRequiredActiveSeconds = 0;
      let weekHomeworkActiveSeconds = 0;
      let weekPracticeActiveSeconds = 0;

      const activities = w.activities.map((act) => {
        const actAttempts = student.attempts.filter(
          (a: any) => a.activityId === act.id
        );
        const normalAttempt = actAttempts.find((a: any) => a.mode === 'NORMAL');
        const practiceAttempts = actAttempts.filter(
          (a: any) => a.mode === 'PRACTICE'
        );

        if (normalAttempt) {
          if (act.required) {
            weekRequiredActiveSeconds += normalAttempt.activeSeconds;
          } else {
            weekHomeworkActiveSeconds += normalAttempt.activeSeconds;
          }
        }

        const practiceSec = practiceAttempts.reduce(
          (acc: number, p: any) => acc + p.activeSeconds,
          0
        );
        weekPracticeActiveSeconds += practiceSec;

        const elapsedSeconds =
          normalAttempt?.completedAt && normalAttempt?.startedAt
            ? Math.max(
                1,
                Math.floor(
                  (normalAttempt.completedAt.getTime() -
                    normalAttempt.startedAt.getTime()) /
                    1000
                )
              )
            : null;

        return {
          id: act.id,
          code: act.code,
          title: act.title,
          type: act.type,
          required: act.required,
          expectedSeconds: act.expectedSeconds,
          allocatedSeconds: act.allocatedSeconds,
          status: normalAttempt ? normalAttempt.status : 'NOT_STARTED',
          firstAttempt: normalAttempt
            ? {
                id: normalAttempt.id,
                status: normalAttempt.status,
                startedAt: normalAttempt.startedAt,
                completedAt: normalAttempt.completedAt,
                activeSeconds: normalAttempt.activeSeconds,
                elapsedSeconds,
                checkCount: normalAttempt.checkCount,
                revision: normalAttempt.revision,
                state: normalAttempt.state,
                isEarlyFinisher:
                  normalAttempt.status === 'COMPLETED' &&
                  normalAttempt.activeSeconds < act.allocatedSeconds
              }
            : null,
          practiceAttempts: practiceAttempts.map((pa: any) => ({
            id: pa.id,
            status: pa.status,
            startedAt: pa.startedAt,
            completedAt: pa.completedAt,
            activeSeconds: pa.activeSeconds,
            checkCount: pa.checkCount,
            state: pa.state
          }))
        };
      });

      return {
        id: w.id,
        courseCode: w.courseCode || 'ag-temelleri',
        order: w.order,
        title: w.title,
        status: wp?.status || (w.order === 1 ? 'NOT_STARTED' : 'LOCKED'),
        completedAt: wp?.completedAt || null,
        weekRequiredActiveSeconds,
        weekHomeworkActiveSeconds,
        weekPracticeActiveSeconds,
        activities
      };
    });

    const effectiveCourses = await computeAllowedCoursesForStudent(
      prisma,
      student
    );

    return NextResponse.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentNumber: student.studentNumber,
        classLevel: student.classLevel ?? 2,
        section: student.section || 'A',
        allowedCourses: student.allowedCourses ?? null,
        effectiveCourses,
        createdAt: student.createdAt,
        lastSeenAt: student.lastSeenAt,
        isRecentlySeen: Date.now() - student.lastSeenAt.getTime() <= 60 * 1000
      },
      weeks: weeksDetail,
      auditLogs: student.auditLogs
    });
  } catch (err) {
    console.error('Admin student detail error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Öğrenci detayları yüklenirken hata oluştu.'
      },
      { status: 500 }
    );
  }
}

const updateStudentSchema = z.object({
  firstName: z.string().min(1, 'Ad boş olamaz.').optional(),
  lastName: z.string().min(1, 'Soyad boş olamaz.').optional(),
  studentNumber: z.string().min(1, 'Öğrenci numarası boş olamaz.').optional(),
  classLevel: z.coerce.number().int().min(1).max(2).optional(),
  section: z.enum(['A', 'B']).optional(),
  allowedCourses: z.array(z.string()).nullable().optional()
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const { id: targetStudentId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const parsed = updateStudentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message:
            parsed.error.issues[0]?.message || 'Geçersiz öğrenci bilgisi.'
        },
        { status: 400 }
      );
    }

    const prisma = await getPrismaAsync();
    const existingStudent: any = await prisma.student.findUnique({
      where: { id: targetStudentId }
    });

    if (!existingStudent) {
      return NextResponse.json(
        {
          error: 'STUDENT_NOT_FOUND',
          message: 'Öğrenci bulunamadı.'
        },
        { status: 404 }
      );
    }

    const firstName = parsed.data.firstName
      ? cleanWhitespace(parsed.data.firstName)
      : existingStudent.firstName;
    const lastName = parsed.data.lastName
      ? cleanWhitespace(parsed.data.lastName)
      : existingStudent.lastName;
    const studentNumber = parsed.data.studentNumber
      ? parsed.data.studentNumber.trim().replace(/\s+/g, '')
      : existingStudent.studentNumber;

    if (!isValidTurkishName(firstName) || !isValidTurkishName(lastName)) {
      return NextResponse.json(
        {
          error: 'INVALID_NAME',
          message:
            'Ad ve soyad en az 2 karakter olmalı ve yalnızca harf içermelidir.'
        },
        { status: 400 }
      );
    }

    const digitRegex = new RegExp(
      `^[0-9]{${config.studentNumberMinLen},${config.studentNumberMaxLen}}$`
    );
    if (!digitRegex.test(studentNumber)) {
      return NextResponse.json(
        {
          error: 'INVALID_STUDENT_NUMBER',
          message: `Öğrenci numarası yalnızca rakamlardan oluşmalı ve ${config.studentNumberMinLen}-${config.studentNumberMaxLen} hane olmalıdır.`
        },
        { status: 400 }
      );
    }

    if (studentNumber !== existingStudent.studentNumber) {
      const collision = await prisma.student.findUnique({
        where: { studentNumber }
      });
      if (collision && collision.id !== existingStudent.id) {
        return NextResponse.json(
          {
            error: 'STUDENT_NUMBER_CONFLICT',
            message: `Bu öğrenci numarası (${studentNumber}) başka bir öğrenci kaydında zaten kullanılıyor.`
          },
          { status: 409 }
        );
      }
    }

    const normalizedName = buildNormalizedFullName(firstName, lastName);
    const classLevel = parsed.data.classLevel ?? existingStudent.classLevel ?? 2;
    const section = parsed.data.section ?? existingStudent.section ?? 'A';
    const hasCoursesUpdate = parsed.data.allowedCourses !== undefined;
    const nextAllowedCourses = hasCoursesUpdate
      ? parsed.data.allowedCourses
      : existingStudent.allowedCourses;

    const updated = await prisma.$transaction(async (tx) => {
      const upd = await tx.student.update({
        where: { id: existingStudent.id },
        data: {
          firstName,
          lastName,
          normalizedName,
          studentNumber,
          classLevel,
          section,
          ...(hasCoursesUpdate
            ? {
                allowedCourses:
                  nextAllowedCourses === null
                    ? Prisma.DbNull
                    : nextAllowedCourses
              }
            : {})
        }
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: auth.admin.id,
          studentId: existingStudent.id,
          action: hasCoursesUpdate
            ? 'UPDATE_STUDENT_COURSES'
            : 'UPDATE_STUDENT_IDENTITY',
          oldValue: {
            firstName: existingStudent.firstName,
            lastName: existingStudent.lastName,
            studentNumber: existingStudent.studentNumber,
            allowedCourses: existingStudent.allowedCourses ?? null
          },
          newValue: {
            firstName,
            lastName,
            studentNumber,
            allowedCourses: nextAllowedCourses ?? null
          }
        }
      });

      return upd;
    });

    const effectiveCourses = await computeAllowedCoursesForStudent(
      prisma,
      updated as any
    );

    return NextResponse.json({
      student: {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        studentNumber: updated.studentNumber,
        allowedCourses: (updated as any).allowedCourses ?? null,
        effectiveCourses
      },
      message: 'Öğrenci bilgileri ve ders yetkileri güncellendi.'
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return NextResponse.json(
        {
          error: 'STUDENT_NUMBER_CONFLICT',
          message: 'Bu öğrenci numarası başka bir kayıtta kullanılıyor.'
        },
        { status: 409 }
      );
    }
    console.error('Admin patch student error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Güncelleme sırasında hata oluştu.'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedAdmin(req);
    if (!auth.ok) return auth.response;

    const { id: targetStudentId } = await context.params;
    const prisma = await getPrismaAsync();
    const existingStudent = await prisma.student.findUnique({
      where: { id: targetStudentId }
    });

    if (!existingStudent) {
      return NextResponse.json(
        {
          error: 'STUDENT_NOT_FOUND',
          message: 'Öğrenci kaydı bulunamadı.'
        },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.adminAuditLog.create({
        data: {
          adminId: auth.admin.id,
          studentId: null,
          action: 'DELETE_STUDENT',
          oldValue: {
            id: existingStudent.id,
            firstName: existingStudent.firstName,
            lastName: existingStudent.lastName,
            studentNumber: existingStudent.studentNumber
          }
        }
      });

      await tx.student.delete({
        where: { id: existingStudent.id }
      });
    });

    return NextResponse.json({
      deletedId: existingStudent.id,
      message: `${existingStudent.firstName} ${existingStudent.lastName} kaydı silindi.`
    });
  } catch (err) {
    console.error('Admin delete student error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Öğrenci silinirken hata oluştu.'
      },
      { status: 500 }
    );
  }
}
