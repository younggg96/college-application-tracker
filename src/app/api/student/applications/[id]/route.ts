import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const application = await prisma.application.findFirst({
      where: {
        id: params.id,
        studentId: student.id
      },
      include: {
        university: true,
        requirements: {
          orderBy: { createdAt: 'asc' }
        },
        parentNotes: {
          include: {
            parent: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { status, deadline, submittedDate, decisionDate, decisionType, notes } = await request.json();

    const application = await prisma.application.updateMany({
      where: {
        id: params.id,
        studentId: student.id
      },
      data: {
        status,
        deadline: deadline ? new Date(deadline) : undefined,
        submittedDate: submittedDate ? new Date(submittedDate) : undefined,
        decisionDate: decisionDate ? new Date(decisionDate) : undefined,
        decisionType,
        notes
      }
    });

    if (application.count === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Fetch updated application
    const updatedApplication = await prisma.application.findFirst({
      where: {
        id: params.id,
        studentId: student.id
      },
      include: {
        university: true,
        requirements: true,
        parentNotes: {
          include: {
            parent: true
          }
        }
      }
    });

    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const application = await prisma.application.deleteMany({
      where: {
        id: params.id,
        studentId: student.id
      }
    });

    if (application.count === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
