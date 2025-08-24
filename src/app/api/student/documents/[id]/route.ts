import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
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
      },
      include: {
        application: {
          include: {
            university: true
          }
        },
        requirement: true
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
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

    const { documentType, applicationId, requirementId } = await request.json();

    // 验证文档是否属于该学生
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: params.id,
        studentId: student.id
      }
    });

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // 验证关联的申请是否属于该学生
    if (applicationId) {
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          studentId: student.id
        }
      });

      if (!application) {
        return NextResponse.json(
          { error: 'Application not found or access denied' },
          { status: 404 }
        );
      }
    }

    // 验证关联的要求是否属于该学生
    if (requirementId) {
      const requirement = await prisma.applicationRequirement.findFirst({
        where: {
          id: requirementId,
          application: {
            studentId: student.id
          }
        }
      });

      if (!requirement) {
        return NextResponse.json(
          { error: 'Requirement not found or access denied' },
          { status: 404 }
        );
      }
    }

    const document = await prisma.document.update({
      where: { id: params.id },
      data: {
        documentType,
        applicationId: applicationId || null,
        requirementId: requirementId || null
      },
      include: {
        application: {
          include: {
            university: true
          }
        },
        requirement: true
      }
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error updating document:', error);
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

    // 删除文件
    try {
      const filePath = path.join(process.cwd(), document.path);
      await unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      // 继续删除数据库记录，即使文件删除失败
    }

    // 删除数据库记录
    await prisma.document.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
