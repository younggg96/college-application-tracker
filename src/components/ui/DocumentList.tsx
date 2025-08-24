'use client';

import React from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { 
  Download, 
  Trash2, 
  Edit, 
  File, 
  FileText, 
  Image,
  Calendar,
  Building
} from 'lucide-react';
import { formatFileSize, isImageFile, isPdfFile, isDocumentFile } from '@/lib/upload';
import { format } from 'date-fns';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  documentType: string;
  uploadedAt: string;
  application?: {
    university: {
      name: string;
    };
  };
  requirement?: {
    requirementType: string;
  };
}

interface DocumentListProps {
  documents: Document[];
  onDownload: (documentId: string) => void;
  onDelete: (documentId: string) => void;
  onEdit?: (documentId: string) => void;
  loading?: boolean;
}

const DOCUMENT_TYPE_LABELS: { [key: string]: string } = {
  ESSAY: 'Application Essay',
  PERSONAL_STATEMENT: 'Personal Statement',
  TRANSCRIPT: 'Transcript',
  RECOMMENDATION_LETTER: 'Recommendation Letter',
  TEST_SCORES: 'Test Scores',
  PORTFOLIO: 'Portfolio',
  RESUME: 'Resume',
  FINANCIAL_AID: 'Financial Aid Documents',
  SUPPLEMENTAL_ESSAY: 'Supplemental Essay',
  OTHER: 'Other'
};

const REQUIREMENT_TYPE_LABELS: { [key: string]: string } = {
  ESSAY: 'Application Essay',
  RECOMMENDATION_LETTER: 'Recommendation Letter',
  TRANSCRIPT: 'Transcript',
  TEST_SCORES: 'Test Scores',
  PORTFOLIO: 'Portfolio',
  INTERVIEW: 'Interview',
  SUPPLEMENTAL_MATERIALS: 'Supplemental Materials'
};

export default function DocumentList({
  documents,
  onDownload,
  onDelete,
  onEdit,
  loading = false
}: DocumentListProps) {
  const getFileIcon = (mimeType: string) => {
    if (isImageFile(mimeType)) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (isPdfFile(mimeType)) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (isDocumentFile(mimeType)) {
      return <File className="h-5 w-5 text-blue-600" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'ESSAY':
      case 'PERSONAL_STATEMENT':
      case 'SUPPLEMENTAL_ESSAY':
        return 'info';
      case 'TRANSCRIPT':
      case 'TEST_SCORES':
        return 'success';
      case 'RECOMMENDATION_LETTER':
        return 'warning';
      case 'PORTFOLIO':
        return 'secondary';
      case 'RESUME':
        return 'outline';
      case 'FINANCIAL_AID':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No documents uploaded yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your application materials such as essays, transcripts, recommendation letters, etc.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
        >
          {/* File Icon */}
          <div className="flex-shrink-0 mt-1">
            {getFileIcon(document.mimeType)}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {document.originalName}
                </h4>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(document.size)}
                  </span>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(document.uploadedAt), 'yyyy-MM-dd HH:mm')}
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center space-x-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownload(document.id)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(document.id)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(document.id)}
                  title="Delete"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Document Type and Associations */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant={getDocumentTypeColor(document.documentType)}>
                {DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}
              </Badge>

              {document.application && (
                <Badge variant="outline" className="flex items-center">
                  <Building className="h-3 w-3 mr-1" />
                  {document.application.university.name}
                </Badge>
              )}

              {document.requirement && (
                <Badge variant="secondary">
                  {REQUIREMENT_TYPE_LABELS[document.requirement.requirementType] || document.requirement.requirementType}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
