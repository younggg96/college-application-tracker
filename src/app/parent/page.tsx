'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Plus,
  AlertCircle,
  CheckCircle,
  DollarSign,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface User {
  id: string;
  email: string;
  role: string;
  parent: {
    id: string;
    name: string;
  };
}

interface Student {
  id: string;
  name: string;
  graduationYear?: number;
  gpa?: number;
  satScore?: number;
  actScore?: number;
  applications: Application[];
}

interface Application {
  id: string;
  applicationType: string;
  status: string;
  deadline?: string;
  submittedDate?: string;
  decisionDate?: string;
  decisionType?: string;
  university: {
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
  }>;
}

export default function ParentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userResponse, studentsResponse] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/parent/students')
      ]);

      if (!userResponse.ok) {
        router.push('/login');
        return;
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!studentEmail.trim()) {
      alert('Please enter student email');
      return;
    }

    setAddingStudent(true);
    try {
      const response = await fetch('/api/parent/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentEmail: studentEmail.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(prev => [...prev, data.student]);
        setStudentEmail('');
        setShowAddStudent(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student, please try again');
    } finally {
      setAddingStudent(false);
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

  const getOverallStatistics = () => {
    const allApplications = students.flatMap(student => student.applications);
    const total = allApplications.length;
    const submitted = allApplications.filter(app => 
      ['SUBMITTED', 'UNDER_REVIEW', 'DECISION_RECEIVED'].includes(app.status)
    ).length;
    const decisions = allApplications.filter(app => app.status === 'DECISION_RECEIVED').length;
    const accepted = allApplications.filter(app => app.decisionType === 'ACCEPTED').length;
    
    return { total, submitted, decisions, accepted };
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const twoWeeksFromNow = addDays(now, 14);
    
    return students.flatMap(student => 
      student.applications
        .filter(app => app.deadline && isAfter(new Date(app.deadline), now) && isBefore(new Date(app.deadline), twoWeeksFromNow))
        .map(app => ({ ...app, studentName: student.name }))
    ).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  };

  const calculateTotalCosts = () => {
    const acceptedApplications = students.flatMap(student => 
      student.applications.filter(app => app.decisionType === 'ACCEPTED')
    );
    
    const totalTuition = acceptedApplications.reduce((sum, app) => {
      const tuition = app.university.tuitionOutState || app.university.tuitionInState || 0;
      return sum + tuition;
    }, 0);

    return { acceptedApplications, totalTuition };
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

  const stats = getOverallStatistics();
  const upcomingDeadlines = getUpcomingDeadlines();
  const { acceptedApplications, totalTuition } = calculateTotalCosts();

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.parent?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your child&apos;s college application progress
            </p>
          </div>
          <Button onClick={() => setShowAddStudent(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Link Student
          </Button>
        </div>

        {/* Add Student Modal */}
        {showAddStudent && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Link Student Account</CardTitle>
              <CardDescription>
                Enter your child&apos;s email address to link their applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Input
                  placeholder="Student email address"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddStudent}
                  loading={addingStudent}
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddStudent(false);
                    setStudentEmail('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {students.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No students linked yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Link student accounts using their email addresses to view application progress
              </p>
              <Button onClick={() => setShowAddStudent(true)}>
                Link First Student
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    All children&apos;s applications
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.submitted}</div>
                  <p className="text-xs text-muted-foreground">
                    Submitted applications
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Decisions Received</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.decisions}</div>
                  <p className="text-xs text-muted-foreground">
                    Decisions received
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Acceptances</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                  <p className="text-xs text-muted-foreground">
                    Accepted applications
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                    Upcoming Deadlines
                  </CardTitle>
                  <CardDescription>
                    Important dates in the next two weeks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingDeadlines.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No upcoming deadlines
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingDeadlines.slice(0, 5).map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {app.university.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {app.studentName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                              {format(new Date(app.deadline!), 'MM/dd')}
                            </p>
                            <Badge variant="warning" className="text-xs">
                              {getStatusText(app.status)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-green-500" />
                    Financial Overview
                  </CardTitle>
                  <CardDescription>
                    Tuition estimates for accepted schools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {acceptedApplications.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No acceptances yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Accepted Schools
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {acceptedApplications.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Estimated Annual Tuition Total
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(totalTuition)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {acceptedApplications.slice(0, 3).map((app) => (
                          <div key={app.id} className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{app.university.name}</span>
                            <span className="float-right">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                maximumFractionDigits: 0
                              }).format(app.university.tuitionOutState || app.university.tuitionInState || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Students Overview */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Student Applications Overview
              </h2>
              {students.map((student) => (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <BookOpen className="mr-2 h-5 w-5" />
                          {student.name}
                        </CardTitle>
                        <CardDescription>
                          {student.graduationYear && `Graduation Year: ${student.graduationYear}`}
                          {student.gpa && ` • GPA: ${student.gpa}`}
                          {student.satScore && ` • SAT: ${student.satScore}`}
                          {student.actScore && ` • ACT: ${student.actScore}`}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/parent/applications?studentId=${student.id}`)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {student.applications.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No applications yet
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {student.applications.slice(0, 6).map((app) => (
                          <div key={app.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                {app.university.name}
                              </h4>
                              <Badge variant={getStatusColor(app.status)} className="text-xs">
                                {getStatusText(app.status)}
                              </Badge>
                            </div>
                            {app.decisionType && (
                              <Badge variant={getDecisionColor(app.decisionType)} className="text-xs mb-2">
                                {getDecisionTypeText(app.decisionType)}
                              </Badge>
                            )}
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {app.university.city}, {app.university.state || app.university.country}
                            </p>
                            {app.deadline && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Deadline: {format(new Date(app.deadline), 'yyyy-MM-dd')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {student.applications.length > 6 && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/parent/applications?studentId=${student.id}`)}
                        >
                          View All {student.applications.length} Applications
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
