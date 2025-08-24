import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Verify the application belongs to a student linked to this parent
    const application = await prisma.application.findFirst({
      where: {
        id: params.id,
        student: {
          parentLinks: {
            some: {
              parentId: parent.id
            }
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found or access denied' },
        { status: 404 }
      );
    }

    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      );
    }

    const note = await prisma.parentNote.create({
      data: {
        parentId: parent.id,
        applicationId: params.id,
        content: content.trim()
      },
      include: {
        parent: true
      }
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error creating parent note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
