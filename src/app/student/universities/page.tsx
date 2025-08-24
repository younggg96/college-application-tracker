'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Search, MapPin, TrendingUp, DollarSign, Calendar, Plus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  student: {
    id: string;
    name: string;
  };
}

interface University {
  id: string;
  name: string;
  country: string;
  state?: string;
  city: string;
  usNewsRanking?: number;
  acceptanceRate?: number;
  applicationSystem: string;
  tuitionInState?: number;
  tuitionOutState?: number;
  applicationFee?: number;
  deadlines: string;
}

export default function UniversitiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    state: '',
    minRanking: '',
    maxRanking: '',
    maxAcceptanceRate: '',
    applicationSystem: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    searchUniversities();
  }, [filters, pagination.page]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const userData = await response.json();
      setUser(userData.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const searchUniversities = async () => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/universities?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUniversities(data.universities);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error searching universities:', error);
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAddApplication = async (universityId: string) => {
    try {
      // For now, we'll redirect to a detailed view where they can choose application type
      // In a full implementation, this might open a modal
      router.push(`/student/applications/new?universityId=${universityId}`);
    } catch (error) {
      console.error('Error adding application:', error);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const parseDeadlines = (deadlines: string) => {
    try {
      return JSON.parse(deadlines);
    } catch {
      return {};
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

  return (
    <DashboardLayout user={user as User}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            University Search
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search and filter universities that suit you
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Search and Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="University Name"
                placeholder="Search universities..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country
                </label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Countries</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>

              <Input
                label="State/Province"
                placeholder="e.g., California"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
              />

              <Input
                label="Min Ranking"
                type="number"
                placeholder="e.g., 1"
                value={filters.minRanking}
                onChange={(e) => handleFilterChange('minRanking', e.target.value)}
              />

              <Input
                label="Max Ranking"
                type="number"
                placeholder="e.g., 50"
                value={filters.maxRanking}
                onChange={(e) => handleFilterChange('maxRanking', e.target.value)}
              />

              <Input
                label="Max Acceptance Rate (%)"
                type="number"
                placeholder="e.g., 20"
                value={filters.maxAcceptanceRate}
                onChange={(e) => handleFilterChange('maxAcceptanceRate', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Search Results ({pagination.total} universities)
            </h2>
          </div>

          {searchLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : universities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No matching universities found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please try adjusting your search criteria or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {universities.map((university) => {
                const deadlines = parseDeadlines(university.deadlines);
                return (
                  <Card key={university.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{university.name}</CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {university.city}, {university.state || university.country}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Rankings and Stats */}
                      <div className="flex flex-wrap gap-2">
                        {university.usNewsRanking && (
                          <Badge variant="secondary">
                            Ranked #{university.usNewsRanking}
                          </Badge>
                        )}
                        {university.acceptanceRate && (
                          <Badge variant="outline" className="flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Acceptance Rate {university.acceptanceRate}%
                          </Badge>
                        )}
                      </div>

                      {/* Application System */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Application System: {university.applicationSystem}
                        </p>
                      </div>

                      {/* Tuition */}
                      {(university.tuitionInState || university.tuitionOutState) && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tuition:
                          </p>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {university.tuitionInState && (
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                In-State: {formatCurrency(university.tuitionInState)}
                              </div>
                            )}
                            {university.tuitionOutState && university.tuitionOutState !== university.tuitionInState && (
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Out-of-State: {formatCurrency(university.tuitionOutState)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Application Fee */}
                      {university.applicationFee && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Application Fee: 
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-1">
                            {formatCurrency(university.applicationFee)}
                          </span>
                        </div>
                      )}

                      {/* Key Deadlines */}
                      {Object.keys(deadlines).length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Key Deadlines:
                          </p>
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {deadlines.early_decision && (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Early Decision: {deadlines.early_decision}
                              </div>
                            )}
                            {deadlines.early_action && (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Early Action: {deadlines.early_action}
                              </div>
                            )}
                            {deadlines.regular_decision && (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Regular Decision: {deadlines.regular_decision}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => handleAddApplication(university.id)}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Application
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
