import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// 允许的文件类型
const ALLOWED_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif'
};

// 最大文件大小 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}

export async function handleFileUpload(
  formData: FormData,
  studentId: string
): Promise<UploadedFile[]> {
  const files = formData.getAll('files') as File[];

  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  const uploadedFiles: UploadedFile[] = [];

  // 创建上传目录
  const uploadDir = path.join(process.cwd(), 'uploads', studentId);
  await mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    // 验证文件类型
    if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} is too large. Maximum size is 10MB`);
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const extension = ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES];
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}${extension}`;
    const filePath = path.join(uploadDir, filename);

    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    uploadedFiles.push({
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: path.relative(process.cwd(), filePath)
    });
  }

  return uploadedFiles;
}

export function getDocumentTypeFromFilename(filename: string, mimeType: string): string {
  const name = filename.toLowerCase();
  
  if (name.includes('transcript') || name.includes('成绩单')) {
    return 'TRANSCRIPT';
  } else if (name.includes('essay') || name.includes('文书') || name.includes('作文')) {
    return 'ESSAY';
  } else if (name.includes('personal') && name.includes('statement')) {
    return 'PERSONAL_STATEMENT';
  } else if (name.includes('recommendation') || name.includes('推荐信')) {
    return 'RECOMMENDATION_LETTER';
  } else if (name.includes('test') && name.includes('score')) {
    return 'TEST_SCORES';
  } else if (name.includes('resume') || name.includes('简历')) {
    return 'RESUME';
  } else if (name.includes('portfolio') || name.includes('作品集')) {
    return 'PORTFOLIO';
  } else if (name.includes('financial') || name.includes('aid')) {
    return 'FINANCIAL_AID';
  } else {
    return 'OTHER';
  }
}
