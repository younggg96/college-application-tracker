'use client';

import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { 
  Upload, 
  X, 
  File, 
  FileText, 
  Image, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatFileSize, isImageFile, isPdfFile, isDocumentFile, validateFile } from '@/lib/upload';

interface FileUploadProps {
  onUpload: (files: FileList) => Promise<void>;
  applicationId?: string;
  requirementId?: string;
  documentType?: string;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  loading?: boolean;
  error?: string;
  success?: string;
}

const DEFAULT_ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
];

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'ESSAY', label: 'Application Essay' },
  { value: 'PERSONAL_STATEMENT', label: 'Personal Statement' },
  { value: 'TRANSCRIPT', label: 'Transcript' },
  { value: 'RECOMMENDATION_LETTER', label: 'Recommendation Letter' },
  { value: 'TEST_SCORES', label: 'Test Scores' },
  { value: 'PORTFOLIO', label: 'Portfolio' },
  { value: 'RESUME', label: 'Resume' },
  { value: 'FINANCIAL_AID', label: 'Financial Aid Documents' },
  { value: 'SUPPLEMENTAL_ESSAY', label: 'Supplemental Essay' },
  { value: 'OTHER', label: 'Other' }
];

export default function FileUpload({
  onUpload,
  applicationId,
  requirementId,
  documentType,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  loading = false,
  error,
  success
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(documentType || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      validFiles.push(file);
    }

    // Check file count
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return;
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const fileList = new DataTransfer();
    selectedFiles.forEach(file => fileList.items.add(file));

    await onUpload(fileList.files);
    
    // Clear selected files
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (isImageFile(file.type)) {
      return <Image className="h-4 w-4 text-blue-500" />;
    } else if (isPdfFile(file.type)) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (isDocumentFile(file.type)) {
      return <File className="h-4 w-4 text-blue-600" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Document Type Selection */}
      {!documentType && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Document Type
          </label>
          <select
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select Document Type</option>
            {DOCUMENT_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Drag files here or click to upload
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supports PDF, DOC, DOCX, TXT, JPG, PNG, GIF formats
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Maximum file size: {formatFileSize(maxSize)}, up to {maxFiles} files
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
        >
          Select Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            loading={loading}
            disabled={selectedFiles.length === 0 || (!documentType && !selectedDocumentType)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files ({selectedFiles.length})
          </Button>
        </div>
      )}

      {/* Hidden form fields for metadata */}
      {applicationId && (
        <input type="hidden" name="applicationId" value={applicationId} />
      )}
      {requirementId && (
        <input type="hidden" name="requirementId" value={requirementId} />
      )}
      {(documentType || selectedDocumentType) && (
        <input 
          type="hidden" 
          name="documentType" 
          value={documentType || selectedDocumentType} 
        />
      )}
    </div>
  );
}
