import { NextRequest, NextResponse } from 'next/server';
import {
  computeAllowedCoursesForStudent,
  getPrismaAsync
} from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const prisma = await getPrismaAsync();
    const freshStudent = await prisma.student.update({
      where: { id: auth.student.id },
      data: { lastSeenAt: new Date() }
    });

    const visibleCourses = await computeAllowedCoursesForStudent(
      prisma,
      freshStudent as any
    );

    return NextResponse.json({
      student: {
        id: freshStudent.id,
        firstName: freshStudent.firstName,
        lastName: freshStudent.lastName,
        studentNumber: freshStudent.studentNumber,
        classLevel: freshStudent.classLevel,
        section: freshStudent.section,
        visibleCourses
      },
      csrfToken: auth.student.csrfToken
    });
  } catch (err) {
    console.error('Student me error:', err);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Sunucuda beklenmeyen bir hata oluştu.'
      },
      { status: 500 }
    );
  }
}
