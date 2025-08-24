'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Plus,
  MapPin,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  role: string;
  student: {
    id: string;
    name: string;
  };
}

interface Application {
  id: string;
  applicationType: string;
  status: string;
  deadline?: string;
  submittedDate?: string;
  decisionDate?: string;
  decisionType?: string;
  notes?: string;
  university: {
    id: string;
    name: string;
    city: string;
    state?: string;
    country: string;
    usNewsRanking?: number;
    acceptanceRate?: number;
  };
  requirements: Array<{
    id: string;
    requirementType: string;
    status: string;
    deadline?: string;
  }>;
}

export default function ApplicationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    applicationType: '',
    decisionType: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  const fetchData = async () => {
    try {
      const [userResponse, applicationsResponse] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/student/applications')
      ]);

      if (!userResponse.ok) {
        router.push('/login');
        return;
      }

      const userData = await userResponse.json();
      setUser(userData.user);

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
    let filtered = applications;

    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    if (filters.applicationType) {
      filtered = filtered.filter(app => app.applicationType === filters.applicationType);
    }

    if (filters.decisionType) {
      filtered = filtered.filter(app => app.decisionType === filters.decisionType);
    }

    setFilteredApplications(filtered);
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/student/applications/${applicationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setApplications(prev => prev.filter(app => app.id !== applicationId));
      } else {
        alert('Delete failed, please try again');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Delete failed, please try again');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'outline';
      case 'IN_PROGRESS':
        return 'warning';
      case 'SUBMITTED':
        return 'info';
      case 'UNDER_REVIEW':
        return 'info';
      case 'DECISION_RECEIVED':
        return 'success';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'Not Started';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'SUBMITTED':
        return 'Submitted';
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'DECISION_RECEIVED':
        return 'Decision Received';
      default:
        return status;
    }
  };

  const getApplicationTypeText = (type: string) => {
    switch (type) {
      case 'EARLY_DECISION':
        return 'Early Decision';
      case 'EARLY_ACTION':
        return 'Early Action';
      case 'REGULAR_DECISION':
        return 'Regular Decision';
      case 'ROLLING_ADMISSION':
        return 'Rolling Admission';
      default:
        return type;
    }
  };

  const getDecisionTypeText = (type?: string) => {
    switch (type) {
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Rejected';
      case 'WAITLISTED':
        return 'Waitlisted';
      case 'DEFERRED':
        return 'Deferred';
      default:
        return '';
    }
  };

  const getDecisionColor = (type?: string) => {
    switch (type) {
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'destructive';
      case 'WAITLISTED':
        return 'warning';
      case 'DEFERRED':
        return 'info';
      default:
        return 'outline';
    }
  };

  const getCompletedRequirements = (requirements: Application['requirements']) => {
    const completed = requirements.filter(req => req.status === 'COMPLETED' || req.status === 'SUBMITTED').length;
    return `${completed}/${requirements.length}`;
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

  return (
    <DashboardLayout user={user as User}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Applications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your college applications and progress
            </p>
          </div>
          <Button onClick={() => router.push('/student/universities')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Application Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Statuses</option>
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="DECISION_RECEIVED">Decision Received</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Application Type
                </label>
                <select
                  value={filters.applicationType}
                  onChange={(e) => setFilters(prev => ({ ...prev, applicationType: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Types</option>
                  <option value="EARLY_DECISION">Early Decision</option>
                  <option value="EARLY_ACTION">Early Action</option>
                  <option value="REGULAR_DECISION">Regular Decision</option>
                  <option value="ROLLING_ADMISSION">Rolling Admission</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Admission Decision
                </label>
                <select
                  value={filters.decisionType}
                  onChange={(e) => setFilters(prev => ({ ...prev, decisionType: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Results</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WAITLISTED">Waitlisted</option>
                  <option value="DEFERRED">Deferred</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Grid */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {applications.length === 0 ? 'No applications yet' : 'No matching applications'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {applications.length === 0 
                  ? 'Start searching universities and add your first application'
                  : 'Try adjusting the filter criteria'
                }
              </p>
              {applications.length === 0 && (
                <Button onClick={() => router.push('/student/universities')}>
                  Search Universities
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {application.university.name}
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {application.university.city}, {application.university.state || application.university.country}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/student/applications/${application.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteApplication(application.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* University Info */}
                  <div className="flex flex-wrap gap-2">
                    {application.university.usNewsRanking && (
                      <Badge variant="secondary">
                        Ranked #{application.university.usNewsRanking}
                      </Badge>
                    )}
                    {application.university.acceptanceRate && (
                      <Badge variant="outline" className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Acceptance Rate {application.university.acceptanceRate}%
                      </Badge>
                    )}
                  </div>

                  {/* Application Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Application Type:
                      </span>
                      <Badge variant="outline">
                        {getApplicationTypeText(application.applicationType)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status:
                      </span>
                      <Badge variant={getStatusColor(application.status)}>
                        {getStatusText(application.status)}
                      </Badge>
                    </div>

                    {application.decisionType && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Admission Result:
                        </span>
                        <Badge variant={getDecisionColor(application.decisionType)}>
                          {getDecisionTypeText(application.decisionType)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Requirements Progress */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Application Materials:
                    </span>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getCompletedRequirements(application.requirements)} Completed
                      </span>
                    </div>
                  </div>

                  {/* Important Dates */}
                  <div className="space-y-1">
                    {application.deadline && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        Deadline: {format(new Date(application.deadline), 'yyyy-MM-dd')}
                      </div>
                    )}
                    {application.submittedDate && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        Submitted: {format(new Date(application.submittedDate), 'yyyy-MM-dd')}
                      </div>
                    )}
                    {application.decisionDate && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Decision Date: {format(new Date(application.decisionDate), 'yyyy-MM-dd')}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {application.notes && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {application.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
