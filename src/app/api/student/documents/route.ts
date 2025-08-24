import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleFileUpload, getDocumentTypeFromFilename } from '@/lib/server-upload';

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

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const requirementId = searchParams.get('requirementId');
    const documentType = searchParams.get('documentType');

    const where: {
      studentId: string;
      applicationId?: string;
      requirementId?: string;
      documentType?: import('@prisma/client').DocumentType;
    } = {
      studentId: student.id
    };

    if (applicationId) {
      where.applicationId = applicationId;
    }

    if (requirementId) {
      where.requirementId = requirementId;
    }

    if (documentType) {
      where.documentType = documentType as import('@prisma/client').DocumentType;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        application: {
          include: {
            university: true
          }
        },
        requirement: true
      },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
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

    // 从表单数据获取额外信息
    const formData = await request.formData();
    const applicationId = formData.get('applicationId') as string;
    const requirementId = formData.get('requirementId') as string;
    const documentType = formData.get('documentType') as string;

    // 处理文件上传
    const uploadedFiles = await handleFileUpload(formData, student.id);

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

    // 保存文档记录到数据库
    const documents = [];
    for (const file of uploadedFiles) {
      const finalDocumentType = documentType || getDocumentTypeFromFilename(file.originalName, file.mimeType);
      
      const document = await prisma.document.create({
        data: {
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          path: file.path,
          documentType: finalDocumentType as import('@prisma/client').DocumentType,
          studentId: student.id,
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

      documents.push(document);
    }

    return NextResponse.json({ 
      message: 'Files uploaded successfully',
      documents 
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
