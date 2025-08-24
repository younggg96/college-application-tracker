'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  BookOpen,
  Target,
  Search,
  User
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface User {
  id: string;
  email: string;
  role: string;
  student: {
    id: string;
    name: string;
    graduationYear?: number;
    gpa?: number;
    satScore?: number;
    actScore?: number;
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
  university: {
    name: string;
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

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

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

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const twoWeeksFromNow = addDays(now, 14);
    
    return applications
      .filter(app => app.deadline && isAfter(new Date(app.deadline), now) && isBefore(new Date(app.deadline), twoWeeksFromNow))
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  };

  const getStatistics = () => {
    const total = applications.length;
    const submitted = applications.filter(app => ['SUBMITTED', 'UNDER_REVIEW', 'DECISION_RECEIVED'].includes(app.status)).length;
    const decisions = applications.filter(app => app.status === 'DECISION_RECEIVED').length;
    const accepted = applications.filter(app => app.decisionType === 'ACCEPTED').length;
    
    return { total, submitted, decisions, accepted };
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

  const stats = getStatistics();
  const upcomingDeadlines = getUpcomingDeadlines();

  return (
    <DashboardLayout user={user as User}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.student?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your application overview and important reminders
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Number of universities applied to
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
                Applications submitted
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
                Applications with decisions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptances</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
              <p className="text-xs text-muted-foreground">
                Applications accepted
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
                          {getApplicationTypeText(app.applicationType)}
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

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
                Recent Applications
              </CardTitle>
              <CardDescription>
                Your recently added or updated applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    You haven't added any applications yet
                  </p>
                  <Button onClick={() => router.push('/student/universities')}>
                    Start searching universities
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {app.university.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getApplicationTypeText(app.applicationType)}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(app.status)}>
                        {getStatusText(app.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Quick access to common features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => router.push('/student/universities')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <Search className="h-6 w-6 mb-2" />
                Search Universities
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/student/applications')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <FileText className="h-6 w-6 mb-2" />
                Manage Applications
              </Button>
              {/* <Button 
                variant="outline"
                onClick={() => router.push('/student/profile')}
                className="h-20 flex flex-col items-center justify-center"
              >
                <User className="h-6 w-6 mb-2" />
                更新资料
              </Button> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
