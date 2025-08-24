'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ApplicationProgressChart from '@/components/charts/ApplicationProgressChart';
import TimelineChart from '@/components/charts/TimelineChart';
import { BarChart3, PieChart, TrendingUp, Clock } from 'lucide-react';

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

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
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

  const getUniversityRankingDistribution = () => {
    const rankingRanges = {
      'Top 10 (1-10)': 0,
      'Top 25 (11-25)': 0,
      'Top 50 (26-50)': 0,
      'Top 100 (51-100)': 0,
      '100+ or Unranked': 0
    };

    applications.forEach(app => {
      const ranking = app.university.usNewsRanking;
      if (!ranking) {
        rankingRanges['100+ or Unranked']++;
      } else if (ranking <= 10) {
        rankingRanges['Top 10 (1-10)']++;
      } else if (ranking <= 25) {
        rankingRanges['Top 25 (11-25)']++;
      } else if (ranking <= 50) {
        rankingRanges['Top 50 (26-50)']++;
      } else if (ranking <= 100) {
        rankingRanges['Top 100 (51-100)']++;
      } else {
        rankingRanges['100+ or Unranked']++;
      }
    });

    return Object.entries(rankingRanges).map(([range, count]) => ({
      range,
      count
    })).filter(item => item.count > 0);
  };

  const getAcceptanceRateDistribution = () => {
    const acceptanceRanges = {
      '< 10% (Extremely Hard)': 0,
      '10-25% (Very Hard)': 0,
      '25-50% (Moderate)': 0,
      '50-75% (Easier)': 0,
      '75%+ (Easy)': 0,
      'Unknown': 0
    };

    applications.forEach(app => {
      const rate = app.university.acceptanceRate;
      if (!rate) {
        acceptanceRanges['Unknown']++;
      } else if (rate < 10) {
        acceptanceRanges['< 10% (Extremely Hard)']++;
      } else if (rate < 25) {
        acceptanceRanges['10-25% (Very Hard)']++;
      } else if (rate < 50) {
        acceptanceRanges['25-50% (Moderate)']++;
      } else if (rate < 75) {
        acceptanceRanges['50-75% (Easier)']++;
      } else {
        acceptanceRanges['75%+ (Easy)']++;
      }
    });

    return Object.entries(acceptanceRanges).map(([range, count]) => ({
      range,
      count
    })).filter(item => item.count > 0);
  };

  const getApplicationTypeDistribution = () => {
    const types = {
      'EARLY_DECISION': 'Early Decision',
      'EARLY_ACTION': 'Early Action',
      'REGULAR_DECISION': 'Regular Decision',
      'ROLLING_ADMISSION': 'Rolling Admission'
    };

    return Object.entries(types).map(([type, label]) => ({
      type: label,
      count: applications.filter(app => app.applicationType === type).length
    })).filter(item => item.count > 0);
  };

  const getFinancialAnalysis = () => {
    const acceptedApps = applications.filter(app => app.decisionType === 'ACCEPTED');
    
    const costs = acceptedApps.map(app => ({
      university: app.university.name,
      tuition: app.university.tuitionOutState || app.university.tuitionInState || 0
    })).filter(item => item.tuition > 0);

    const totalCost = costs.reduce((sum, item) => sum + item.tuition, 0);
    const averageCost = costs.length > 0 ? totalCost / costs.length : 0;

    return {
      acceptedCount: acceptedApps.length,
      totalCost,
      averageCost,
      costs: costs.sort((a, b) => b.tuition - a.tuition)
    };
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

  const rankingDistribution = getUniversityRankingDistribution();
  const acceptanceDistribution = getAcceptanceRateDistribution();
  const applicationTypeDistribution = getApplicationTypeDistribution();
  const financialAnalysis = getFinancialAnalysis();

  return (
    <DashboardLayout user={user as User}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Application Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Deep insights into your application portfolio and progress
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Application Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Once you add some applications, detailed analytics charts will appear here
              </p>
              <Button onClick={() => router.push('/student/universities')}>
                Start Adding Applications
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Chart Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Chart Options</CardTitle>
                <CardDescription>
                  Choose different chart types to view your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button
                    variant={chartType === 'pie' ? 'default' : 'outline'}
                    onClick={() => setChartType('pie')}
                    size="sm"
                  >
                    <PieChart className="h-4 w-4 mr-2" />
                    Pie Chart
                  </Button>
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    onClick={() => setChartType('bar')}
                    size="sm"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Bar Chart
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Progress Charts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Application Progress Analysis
                </CardTitle>
                <CardDescription>
                  View your application status and admission results distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApplicationProgressChart applications={applications} type={chartType} />
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Application Timeline
                </CardTitle>
                <CardDescription>
                  View timeline of important dates and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimelineChart applications={applications} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* University Rankings */}
              {rankingDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>University Ranking Distribution</CardTitle>
                    <CardDescription>
                      Application distribution grouped by US News rankings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rankingDistribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.range}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / applications.length) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Acceptance Rate Distribution */}
              {acceptanceDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Admission Difficulty Distribution</CardTitle>
                    <CardDescription>
                      Application distribution grouped by acceptance rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {acceptanceDistribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.range}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / applications.length) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Application Type Distribution */}
              {applicationTypeDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Application Type Distribution</CardTitle>
                    <CardDescription>
                      Distribution of different application types
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {applicationTypeDistribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.type}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / applications.length) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Financial Analysis */}
              {financialAnalysis.acceptedCount > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Analysis</CardTitle>
                    <CardDescription>
                      Tuition analysis for accepted schools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {financialAnalysis.acceptedCount}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Accepted Schools
                          </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0
                            }).format(financialAnalysis.averageCost)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Average Tuition
                          </div>
                        </div>
                      </div>
                      
                      {financialAnalysis.costs.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tuition Ranking:
                          </h5>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {financialAnalysis.costs.slice(0, 5).map((cost, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400 truncate">
                                  {cost.university}
                                </span>
                                <span className="font-medium">
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    maximumFractionDigits: 0
                                  }).format(cost.tuition)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
