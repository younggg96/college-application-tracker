// 客户端工具函数 - 不包含Node.js特定的导入

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

// 验证函数 - 可以在客户端和服务端使用
export function validateFile(file: File): string | null {
  // 验证文件类型
  if (!ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]) {
    return `文件类型 ${file.type} 不被支持`;
  }

  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    return `文件 ${file.name} 过大，最大支持 10MB`;
  }

  return null;
}

export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.substring(lastDotIndex).toLowerCase() : '';
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

export function isDocumentFile(mimeType: string): boolean {
  return mimeType === 'application/msword' || 
         mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
         mimeType === 'text/plain';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
  } else if (isImageFile(mimeType) || isPdfFile(mimeType)) {
    return 'OTHER';
  } else {
    return 'OTHER';
  }
}
