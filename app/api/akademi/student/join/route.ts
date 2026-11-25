import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  computeAllowedCoursesForStudent,
  getPrismaAsync
} from '@/lib/akademi/services/db';
import { config } from '@/lib/akademi/config';
import {
  buildNormalizedFullName,
  cleanWhitespace,
  isValidTurkishName
} from '@/lib/akademi/services/normalization';
import { createStudentSessionCookie } from '@/lib/akademi/services/sessionService';
import { ensureStudentWeekProgresses } from '@/lib/akademi/services/progressService';

const joinSchema = z.object({
  firstName: z.string().min(1, 'Lütfen adınızı girin.'),
  lastName: z.string().min(1, 'Lütfen soyadınızı girin.'),
  studentNumber: z.string().min(1, 'Lütfen öğrenci numaranızı girin.'),
  classLevel: z.coerce.number().int().min(1).max(2).optional().default(2),
  section: z.enum(['A', 'B']).optional().default('A')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = joinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message:
            parsed.error.issues[0]?.message ||
            'Lütfen tüm alanları doğru doldurun.'
        },
        { status: 400 }
      );
    }

    const firstName = cleanWhitespace(parsed.data.firstName);
    const lastName = cleanWhitespace(parsed.data.lastName);
    const studentNumber = parsed.data.studentNumber.trim().replace(/\s+/g, '');

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
          message: `Öğrenci numarası yalnızca rakamlardan oluşmalı ve ${config.studentNumberMinLen} ile ${config.studentNumberMaxLen} hane arasında olmalıdır.`
        },
        { status: 400 }
      );
    }

    const normalizedName = buildNormalizedFullName(firstName, lastName);
    const prisma = await getPrismaAsync();

    let student = await prisma.student.findUnique({
      where: { studentNumber }
    });

    if (!student) {
      try {
        student = await prisma.student.create({
          data: {
            firstName,
            lastName,
            normalizedName,
            studentNumber,
            classLevel: parsed.data.classLevel,
            section: parsed.data.section,
            approvalStatus: 'PENDING',
            lastSeenAt: new Date()
          }
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          student = await prisma.student.findUnique({
            where: { studentNumber }
          });
        } else {
          throw err;
        }
      }
    }

    if (!student) {
      return NextResponse.json(
        {
          error: 'JOIN_FAILED',
          message: 'Öğrenci kaydı oluşturulamadı. Lütfen tekrar deneyin.'
        },
        { status: 500 }
      );
    }

    if (student.normalizedName !== normalizedName) {
      return NextResponse.json(
        {
          error: 'STUDENT_NUMBER_NAME_MISMATCH',
          message:
            'Bu öğrenci numarası sistemde farklı bir ad/soyad bilgisiyle kayıtlıdır. Bilgilerinizi kontrol edin veya düzeltme için ders öğretmeninize başvurun.'
        },
        { status: 409 }
      );
    }

    const isApproved = (student as any).approvalStatus === 'APPROVED';

    await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: student!.id },
        data: { lastSeenAt: new Date() }
      });
      if (isApproved) {
        await ensureStudentWeekProgresses(tx, student!.id);
      }
    });

    const visibleCourses = isApproved
      ? await computeAllowedCoursesForStudent(prisma, student as any)
      : [];

    const response = NextResponse.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentNumber: student.studentNumber,
        classLevel: student.classLevel,
        section: student.section,
        approvalStatus: (student as any).approvalStatus || 'PENDING',
        visibleCourses
      },
      message: isApproved
        ? 'Akademiye hoş geldin!'
        : 'Kayıt isteğiniz gönderildi. Öğretmen onayı bekleniyor.'
    });

    await createStudentSessionCookie(student.id, response, req);
    return response;
  } catch (err: any) {
    console.error('Student join error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Sunucuda beklenmeyen bir hata oluştu.'
      },
      { status: 500 }
    );
  }
}
