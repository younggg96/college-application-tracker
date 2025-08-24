'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import FileUpload from '@/components/ui/FileUpload';
import DocumentList from '@/components/ui/DocumentList';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter,
  Plus,
  FolderOpen
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  student: {
    id: string;
    name: string;
  };
}

interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  documentType: string;
  uploadedAt: string;
  application?: {
    id: string;
    university: {
      name: string;
    };
  };
  requirement?: {
    requirementType: string;
  };
}

interface Application {
  id: string;
  university: {
    name: string;
  };
}

export default function DocumentsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    documentType: '',
    applicationId: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, filters]);

  const fetchData = async () => {
    try {
      const [userResponse, documentsResponse, applicationsResponse] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/student/documents'),
        fetch('/api/student/applications')
      ]);

      if (!userResponse.ok) {
        router.push('/login');
        return;
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData.documents);
      }

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData.applications);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = documents;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.originalName.toLowerCase().includes(search) ||
        doc.documentType.toLowerCase().includes(search)
      );
    }

    if (filters.documentType) {
      filtered = filtered.filter(doc => doc.documentType === filters.documentType);
    }

    if (filters.applicationId) {
      filtered = filtered.filter(doc => doc.application?.id === filters.applicationId);
    }

    setFilteredDocuments(filtered);
  };

  const handleUpload = async (files: FileList) => {
    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      // 添加元数据
      if (filters.applicationId) {
        formData.append('applicationId', filters.applicationId);
      }

      const response = await fetch('/api/student/documents', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setDocuments(prev => [...data.documents, ...prev]);
      setUploadSuccess(`Successfully uploaded ${data.documents.length} files`);
      setShowUpload(false);

      // 清除成功消息
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/student/documents/${documentId}/download`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // 获取文件名
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";]+)['"]?/);
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Download failed, please try again');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/student/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Delete failed, please try again');
    }
  };

  const getDocumentTypeOptions = () => {
    const types = [
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
    return types;
  };

  const getDocumentStats = () => {
    const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
    const typeCount = documents.reduce((acc, doc) => {
      acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return { totalSize, typeCount, totalCount: documents.length };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getDocumentStats();

  return (
    <DashboardLayout user={user as User}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Document Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload and manage your application materials
            </p>
          </div>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalSize / (1024 * 1024)).toFixed(1)} MB
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Common Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(stats.typeCount).length > 0
                  ? Object.entries(stats.typeCount).sort((a, b) => b[1] - a[1])[0][0]
                  : 'N/A'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Upload your application materials. Supports PDF, DOC, DOCX, TXT, JPG, PNG, GIF formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onUpload={handleUpload}
                applicationId={filters.applicationId}
                loading={uploadLoading}
                error={uploadError}
                success={uploadSuccess}
              />
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter and Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Document Type
                </label>
                <select
                  value={filters.documentType}
                  onChange={(e) => setFilters(prev => ({ ...prev, documentType: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Types</option>
                  {getDocumentTypeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Associated Application
                </label>
                <select
                  value={filters.applicationId}
                  onChange={(e) => setFilters(prev => ({ ...prev, applicationId: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Applications</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.university.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="mr-2 h-5 w-5" />
              My Documents ({filteredDocuments.length})
            </CardTitle>
            <CardDescription>
              Manage your uploaded application materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentList
              documents={filteredDocuments}
              onDownload={handleDownload}
              onDelete={handleDelete}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
