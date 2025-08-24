import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

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

    const document = await prisma.document.findFirst({
      where: {
        id: params.id,
        studentId: student.id
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    try {
      const filePath = path.join(process.cwd(), document.path);
      const fileBuffer = await readFile(filePath);

      const response = new NextResponse(fileBuffer);
      response.headers.set('Content-Type', document.mimeType);
      response.headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(document.originalName)}"`);
      response.headers.set('Content-Length', document.size.toString());

      return response;
    } catch (error) {
      console.error('Error reading file:', error);
      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
