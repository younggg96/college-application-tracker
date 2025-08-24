import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, name, graduationYear, parentStudentEmail } = await request.json();

    // Validate required fields
    if (!email || !password || !role || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role.toUpperCase()
        }
      });

      // Create role-specific profile
      if (role.toUpperCase() === 'STUDENT') {
        const student = await tx.student.create({
          data: {
            userId: user.id,
            name,
            graduationYear: graduationYear ? parseInt(graduationYear) : null
          }
        });
        return { user, profile: student };
      } else if (role.toUpperCase() === 'PARENT') {
        const parent = await tx.parent.create({
          data: {
            userId: user.id,
            name
          }
        });

        // If parentStudentEmail is provided, link to student
        if (parentStudentEmail) {
          const studentUser = await tx.user.findUnique({
            where: { email: parentStudentEmail },
            include: { student: true }
          });

          if (studentUser?.student) {
            await tx.parentStudent.create({
              data: {
                parentId: parent.id,
                studentId: studentUser.student.id
              }
            });
          }
        }

        return { user, profile: parent };
      }

      return { user, profile: null };
    });

    // Generate token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role
    });

    const response = NextResponse.json({
      message: 'User created successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        profile: result.profile
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
