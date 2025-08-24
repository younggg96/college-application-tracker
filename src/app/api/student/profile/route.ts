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
      where: { userId: user.id },
      include: {
        applications: {
          include: {
            university: true,
            requirements: true,
            parentNotes: {
              include: {
                parent: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, graduationYear, gpa, satScore, actScore, targetCountries, intendedMajors } = await request.json();

    const student = await prisma.student.update({
      where: { userId: user.id },
      data: {
        name,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        gpa: gpa ? parseFloat(gpa) : null,
        satScore: satScore ? parseInt(satScore) : null,
        actScore: actScore ? parseInt(actScore) : null,
        targetCountries: targetCountries ? JSON.stringify(targetCountries) : null,
        intendedMajors: intendedMajors ? JSON.stringify(intendedMajors) : null
      }
    });

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
