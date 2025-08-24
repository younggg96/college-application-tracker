import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        university: true,
        requirements: true,
        parentNotes: {
          include: {
            parent: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.id }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const { universityId, applicationType, deadline, notes } = await request.json();

    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_universityId_applicationType: {
          studentId: student.id,
          universityId,
          applicationType
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Application already exists for this university and type' },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        universityId,
        applicationType,
        deadline: deadline ? new Date(deadline) : null,
        notes,
        status: 'NOT_STARTED'
      },
      include: {
        university: true,
        requirements: true
      }
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
