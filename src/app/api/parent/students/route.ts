import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
      include: {
        studentLinks: {
          include: {
            student: {
              include: {
                applications: {
                  include: {
                    university: true,
                    requirements: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!parent) {
      return NextResponse.json(
        { error: 'Parent profile not found' },
        { status: 404 }
      );
    }

    const students = parent.studentLinks.map(link => link.student);

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching parent students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { studentEmail } = await request.json();

    if (!studentEmail) {
      return NextResponse.json(
        { error: 'Student email is required' },
        { status: 400 }
      );
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: user.id }
    });

    if (!parent) {
      return NextResponse.json(
        { error: 'Parent profile not found' },
        { status: 404 }
      );
    }

    // Find student by email
    const studentUser = await prisma.user.findUnique({
      where: { email: studentEmail },
      include: { student: true }
    });

    if (!studentUser || !studentUser.student || studentUser.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if link already exists
    const existingLink = await prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId: parent.id,
          studentId: studentUser.student.id
        }
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Student is already linked to this parent' },
        { status: 400 }
      );
    }

    // Create link
    const link = await prisma.parentStudent.create({
      data: {
        parentId: parent.id,
        studentId: studentUser.student.id
      },
      include: {
        student: {
          include: {
            applications: {
              include: {
                university: true,
                requirements: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ student: link.student });
  } catch (error) {
    console.error('Error linking student to parent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
