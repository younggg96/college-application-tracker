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

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const parent = await prisma.parent.findUnique({
      where: { userId: user.id }
    });

    if (!parent) {
      return NextResponse.json(
        { error: 'Parent profile not found' },
        { status: 404 }
      );
    }

    // Build where clause
    const where: {
      student: {
        parentLinks: {
          some: {
            parentId: string;
          };
        };
      };
      studentId?: string;
    } = {
      student: {
        parentLinks: {
          some: {
            parentId: parent.id
          }
        }
      }
    };

    if (studentId) {
      where.studentId = studentId;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        university: true,
        requirements: true,
        student: true,
        parentNotes: {
          where: { parentId: parent.id },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching parent applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
