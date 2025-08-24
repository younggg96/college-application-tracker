'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  role: string;
  parent: {
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
    tuitionInState?: number;
    tuitionOutState?: number;
  };
  requirements: Array<{
    id: string;
    requirementType: string;
    status: string;
    deadline?: string;
  }>;
  student: {
    id: string;
    name: string;
    graduationYear?: number;
    gpa?: number;
    satScore?: number;
    actScore?: number;
  };
  parentNotes: Array<{
    id: string;
    content: string;
    createdAt: string;
    parent: {
      name: string;
    };
  }>;
}

export default function ParentApplicationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNotes, setNewNotes] = useState<{[key: string]: string}>({});
  const [addingNote, setAddingNote] = useState<{[key: string]: boolean}>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');

  const fetchData = useCallback(async () => {
    try {
      const [userResponse, applicationsResponse] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/parent/applications${studentId ? `?studentId=${studentId}` : ''}`)
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
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddNote = async (applicationId: string) => {
    const content = newNotes[applicationId]?.trim();
    if (!content) return;

    setAddingNote(prev => ({ ...prev, [applicationId]: true }));
    try {
      const response = await fetch(`/api/parent/applications/${applicationId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, parentNotes: [data.note, ...app.parentNotes] }
            : app
        ));
        setNewNotes(prev => ({ ...prev, [applicationId]: '' }));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note, please try again');
    } finally {
      setAddingNote(prev => ({ ...prev, [applicationId]: false }));
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

  const getRequirementTypeText = (type: string) => {
    switch (type) {
      case 'ESSAY':
        return 'Application Essay';
      case 'RECOMMENDATION_LETTER':
        return 'Recommendation Letter';
      case 'TRANSCRIPT':
        return 'Transcript';
      case 'TEST_SCORES':
        return 'Test Scores';
      case 'PORTFOLIO':
        return 'Portfolio';
      case 'INTERVIEW':
        return 'Interview';
      case 'SUPPLEMENTAL_MATERIALS':
        return 'Supplemental Materials';
      default:
        return type;
    }
  };

  const getCompletedRequirements = (requirements: Application['requirements']) => {
    const completed = requirements.filter(req => req.status === 'COMPLETED' || req.status === 'SUBMITTED').length;
    return `${completed}/${requirements.length}`;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
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
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/parent')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {studentId ? 'Student Application Details' : 'All Applications'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage application progress, add parent notes
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No application records
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your linked students haven&apos;t added any applications yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <Card key={application.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl">
                          {application.university.name}
                        </CardTitle>
                        <Badge variant={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                        {application.decisionType && (
                          <Badge variant={getDecisionColor(application.decisionType)}>
                            {getDecisionTypeText(application.decisionType)}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {application.university.city}, {application.university.state || application.university.country}
                        </span>
                        <span className="font-medium">
                          Student: {application.student.name}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* University Details */}
                      <div className="flex flex-wrap gap-2 mb-4">
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
                        <Badge variant="outline">
                          {getApplicationTypeText(application.applicationType)}
                        </Badge>
                      </div>

                      {/* Application Progress */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Application Progress</h4>
                        
                        {/* Requirements */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Application Materials Completion:
                          </span>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {getCompletedRequirements(application.requirements)}
                            </span>
                          </div>
                        </div>

                        {/* Requirements Details */}
                        {application.requirements.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Materials:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {application.requirements.map((req) => (
                                <div key={req.id} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {getRequirementTypeText(req.requirementType)}
                                  </span>
                                  <Badge variant={getStatusColor(req.status)} className="text-xs">
                                    {getStatusText(req.status)}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Important Dates */}
                        <div className="space-y-2">
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

                        {/* Student Notes */}
                        {application.notes && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student Notes:</h5>
                            <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                              {application.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                      {/* Financial Info */}
                      {(application.university.tuitionInState || application.university.tuitionOutState) && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Tuition Information
                          </h5>
                          <div className="space-y-1 text-sm">
                            {application.university.tuitionInState && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">In-State:</span>
                                <span className="font-medium">{formatCurrency(application.university.tuitionInState)}</span>
                              </div>
                            )}
                            {application.university.tuitionOutState && application.university.tuitionOutState !== application.university.tuitionInState && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Out-of-State:</span>
                                <span className="font-medium">{formatCurrency(application.university.tuitionOutState)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Student Info */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Student Information</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Name:</span>
                            <span className="font-medium">{application.student.name}</span>
                          </div>
                          {application.student.graduationYear && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Graduation Year:</span>
                              <span className="font-medium">{application.student.graduationYear}</span>
                            </div>
                          )}
                          {application.student.gpa && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">GPA:</span>
                              <span className="font-medium">{application.student.gpa}</span>
                            </div>
                          )}
                          {application.student.satScore && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">SAT:</span>
                              <span className="font-medium">{application.student.satScore}</span>
                            </div>
                          )}
                          {application.student.actScore && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">ACT:</span>
                              <span className="font-medium">{application.student.actScore}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parent Notes Section */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Parent Notes
                    </h4>

                    {/* Add New Note */}
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <textarea
                        value={newNotes[application.id] || ''}
                        onChange={(e) => setNewNotes(prev => ({ ...prev, [application.id]: e.target.value }))}
                        placeholder="Add your notes or suggestions..."
                        rows={3}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddNote(application.id)}
                          loading={addingNote[application.id]}
                          disabled={!newNotes[application.id]?.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                      </div>
                    </div>

                    {/* Existing Notes */}
                    {application.parentNotes.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No notes added yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {application.parentNotes.map((note) => (
                          <div key={note.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                              {note.content}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>{note.parent.name}</span>
                              <span>{format(new Date(note.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
