import { NextRequest, NextResponse } from 'next/server';
import { getPrismaAsync } from '@/lib/akademi/services/db';
import { getAuthenticatedStudent } from '@/lib/akademi/services/sessionService';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const auth = await getAuthenticatedStudent(req);
    if (!auth.ok) return auth.response;

    const { attemptId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const prisma = await getPrismaAsync();
    const studentId = auth.student.id;

    const attempt = await prisma.activityAttempt.findUnique({
      where: { id: attemptId },
      include: { activity: true }
    });

    if (!attempt || attempt.studentId !== studentId) {
      return NextResponse.json(
        { error: 'ATTEMPT_NOT_FOUND', message: 'Çalışma kaydı bulunamadı.' },
        { status: 404 }
      );
    }

    const existing = await prisma.helpRequest.findFirst({
      where: {
        studentId,
        activityId: attempt.activityId,
        resolved: false
      }
    });

    if (existing) {
      return NextResponse.json({
        alreadyOpen: true,
        helpRequestId: existing.id,
        message: 'Yardım isteğin öğretmene iletildi.'
      });
    }

    const cleanCode = attempt.activity.code.replace(/^D-/, '');
    const customMsg =
      typeof body?.message === 'string' && body.message.trim()
        ? body.message.trim().slice(0, 200)
        : `${cleanCode} (${attempt.activity.title}) etkinliğinde yardım istiyor.`;

    const created = await prisma.helpRequest.create({
      data: {
        studentId,
        activityId: attempt.activityId,
        courseCode: attempt.activity.courseCode || 'pc-donanimi',
        message: customMsg
      }
    });

    return NextResponse.json({
      alreadyOpen: false,
      helpRequestId: created.id,
      message: 'Yardım isteğin öğretmene iletildi.'
    });
  } catch (err) {
    console.error('Create help request error:', err);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'Yardım isteği gönderilemedi.' },
      { status: 500 }
    );
  }
}
