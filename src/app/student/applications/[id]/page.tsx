'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquare
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

interface Requirement {
  id: string;
  requirementType: string;
  status: string;
  deadline?: string;
  notes?: string;
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
  requirements: Requirement[];
  parentNotes: Array<{
    id: string;
    content: string;
    createdAt: string;
    parent: {
      name: string;
    };
  }>;
}

export default function ApplicationDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null);
  const [newRequirement, setNewRequirement] = useState({
    requirementType: '',
    deadline: '',
    notes: ''
  });
  const [showNewRequirement, setShowNewRequirement] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [userResponse, applicationResponse] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/student/applications/${params.id}`)
      ]);

      if (!userResponse.ok) {
        router.push('/login');
        return;
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      if (applicationResponse.ok) {
        const applicationData = await applicationResponse.json();
        setApplication(applicationData.application);
      } else {
        router.push('/student/applications');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      router.push('/student/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplication = async (updates: Partial<Application>) => {
    if (!application) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/student/applications/${application.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
      } else {
        alert('Update failed, please try again');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Update failed, please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRequirement = async () => {
    if (!application || !newRequirement.requirementType) return;

    try {
      const response = await fetch(`/api/student/applications/${application.id}/requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRequirement)
      });

      if (response.ok) {
        const data = await response.json();
        setApplication(prev => prev ? {
          ...prev,
          requirements: [...prev.requirements, data.requirement]
        } : null);
        setNewRequirement({ requirementType: '', deadline: '', notes: '' });
        setShowNewRequirement(false);
      } else {
        alert('Failed to add requirement, please try again');
      }
    } catch (error) {
      console.error('Error adding requirement:', error);
      alert('Failed to add requirement, please try again');
    }
  };

  const handleUpdateRequirement = async (requirementId: string, updates: Partial<Requirement>) => {
    try {
      const response = await fetch(`/api/student/requirements/${requirementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        setApplication(prev => prev ? {
          ...prev,
          requirements: prev.requirements.map(req => 
            req.id === requirementId ? data.requirement : req
          )
        } : null);
        setEditingRequirement(null);
      } else {
        alert('Failed to update requirement, please try again');
      }
    } catch (error) {
      console.error('Error updating requirement:', error);
      alert('Failed to update requirement, please try again');
    }
  };

  const handleDeleteRequirement = async (requirementId: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;

    try {
      const response = await fetch(`/api/student/requirements/${requirementId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setApplication(prev => prev ? {
          ...prev,
          requirements: prev.requirements.filter(req => req.id !== requirementId)
        } : null);
      } else {
        alert('Failed to delete requirement, please try again');
      }
    } catch (error) {
      console.error('Error deleting requirement:', error);
      alert('Failed to delete requirement, please try again');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'outline';
      case 'IN_PROGRESS':
        return 'warning';
      case 'COMPLETED':
      case 'SUBMITTED':
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
      case 'COMPLETED':
        return 'Completed';
      case 'SUBMITTED':
        return 'Submitted';
      default:
        return status;
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout user={user as User}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Application Not Found
          </h2>
          <Button onClick={() => router.push('/student/applications')}>
            Back to Applications
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user as User}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/student/applications')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {application.university.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Application details and progress management
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Application Status
                    </label>
                    <select
                      value={application.status}
                      onChange={(e) => handleUpdateApplication({ status: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="DECISION_RECEIVED">Decision Received</option>
                    </select>
                  </div>

                  {application.status === 'DECISION_RECEIVED' && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Admission Result
                      </label>
                      <select
                        value={application.decisionType || ''}
                        onChange={(e) => handleUpdateApplication({ decisionType: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select Result</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="WAITLISTED">Waitlisted</option>
                        <option value="DEFERRED">Deferred</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Deadline"
                    type="date"
                    value={application.deadline ? format(new Date(application.deadline), 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleUpdateApplication({ deadline: e.target.value })}
                  />

                  {application.status === 'SUBMITTED' && (
                    <Input
                      label="Submission Date"
                      type="date"
                      value={application.submittedDate ? format(new Date(application.submittedDate), 'yyyy-MM-dd') : ''}
                      onChange={(e) => handleUpdateApplication({ submittedDate: e.target.value })}
                    />
                  )}

                  {application.status === 'DECISION_RECEIVED' && (
                    <Input
                      label="Decision Date"
                      type="date"
                      value={application.decisionDate ? format(new Date(application.decisionDate), 'yyyy-MM-dd') : ''}
                      onChange={(e) => handleUpdateApplication({ decisionDate: e.target.value })}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={application.notes || ''}
                    onChange={(e) => handleUpdateApplication({ notes: e.target.value })}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Add application notes..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Application Materials</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowNewRequirement(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Requirement
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showNewRequirement && (
                  <Card className="border-dashed">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Requirement Type
                          </label>
                          <select
                            value={newRequirement.requirementType}
                            onChange={(e) => setNewRequirement(prev => ({ ...prev, requirementType: e.target.value }))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">Select Requirement Type</option>
                            <option value="ESSAY">Application Essay</option>
                            <option value="RECOMMENDATION_LETTER">Recommendation Letter</option>
                            <option value="TRANSCRIPT">Transcript</option>
                            <option value="TEST_SCORES">Test Scores</option>
                            <option value="PORTFOLIO">Portfolio</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="SUPPLEMENTAL_MATERIALS">Supplemental Materials</option>
                          </select>
                        </div>

                        <Input
                          label="Deadline"
                          type="date"
                          value={newRequirement.deadline}
                          onChange={(e) => setNewRequirement(prev => ({ ...prev, deadline: e.target.value }))}
                        />

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes
                          </label>
                          <textarea
                            value={newRequirement.notes}
                            onChange={(e) => setNewRequirement(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Add notes..."
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleAddRequirement}>
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowNewRequirement(false);
                              setNewRequirement({ requirementType: '', deadline: '', notes: '' });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {application.requirements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No application requirements added yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {application.requirements.map((requirement) => (
                      <div
                        key={requirement.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Badge variant={getStatusColor(requirement.status)}>
                              {getStatusText(requirement.status)}
                            </Badge>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {getRequirementTypeText(requirement.requirementType)}
                            </span>
                          </div>
                          {requirement.deadline && (
                            <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4 mr-1" />
                              Deadline: {format(new Date(requirement.deadline), 'yyyy-MM-dd')}
                            </div>
                          )}
                          {requirement.notes && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              {requirement.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <select
                            value={requirement.status}
                            onChange={(e) => handleUpdateRequirement(requirement.id, { status: e.target.value })}
                            className="text-sm rounded-md border border-input bg-background px-2 py-1"
                          >
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="SUBMITTED">Submitted</option>
                          </select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRequirement(requirement.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* University Info */}
            <Card>
              <CardHeader>
                <CardTitle>University Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {application.university.city}, {application.university.state || application.university.country}
                  </p>
                </div>
                {application.university.usNewsRanking && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Ranking</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      #{application.university.usNewsRanking}
                    </p>
                  </div>
                )}
                {application.university.acceptanceRate && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Acceptance Rate</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {application.university.acceptanceRate}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parent Notes */}
            {application.parentNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Parent Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {application.parentNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{note.parent.name}</span>
                        <span>{format(new Date(note.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
