'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Save, Calendar } from 'lucide-react';

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
  city: string;
  state?: string;
  country: string;
  usNewsRanking?: number;
  acceptanceRate?: number;
  deadlines: string;
}

export default function NewApplicationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    applicationType: 'REGULAR_DECISION',
    deadline: '',
    notes: ''
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const universityId = searchParams.get('universityId');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userResponse = await fetch('/api/auth/me');
      
      if (!userResponse.ok) {
        router.push('/login');
        return;
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      if (universityId) {
        // Fetch university details
        const universityResponse = await fetch(`/api/universities?search=&page=1&limit=1000`);
        if (universityResponse.ok) {
          const universitiesData = await universityResponse.json();
          const foundUniversity = universitiesData.universities.find((u: University) => u.id === universityId);
          if (foundUniversity) {
            setUniversity(foundUniversity);
            
            // Set default deadline based on university deadlines
            const deadlines = JSON.parse(foundUniversity.deadlines);
            if (deadlines.regular_decision) {
              setFormData(prev => ({ ...prev, deadline: deadlines.regular_decision }));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!universityId) {
      alert('No university selected');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/student/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          universityId,
          ...formData
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/student/applications/${data.application.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create application');
      }
    } catch (error) {
      console.error('Error creating application:', error);
      alert('Failed to create application, please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getApplicationTypeDeadline = (type: string) => {
    if (!university) return '';
    
    try {
      const deadlines = JSON.parse(university.deadlines);
      switch (type) {
        case 'EARLY_DECISION':
          return deadlines.early_decision || '';
        case 'EARLY_ACTION':
          return deadlines.early_action || '';
        case 'REGULAR_DECISION':
          return deadlines.regular_decision || '';
        case 'ROLLING_ADMISSION':
          return deadlines.rolling || '';
        default:
          return '';
      }
    } catch {
      return '';
    }
  };

  const handleApplicationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    const suggestedDeadline = getApplicationTypeDeadline(type);
    
    setFormData(prev => ({
      ...prev,
      applicationType: type,
      deadline: suggestedDeadline || prev.deadline
    }));
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

  if (!university) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            University Information Not Found
          </h2>
          <Button onClick={() => router.push('/student/universities')}>
            Back to University Search
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/universities')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Add Application
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create new application for {university.name}
            </p>
          </div>
        </div>

        {/* University Info */}
        <Card>
          <CardHeader>
            <CardTitle>{university.name}</CardTitle>
            <CardDescription>
              {university.city}, {university.state || university.country}
              {university.usNewsRanking && ` • Ranked #${university.usNewsRanking}`}
              {university.acceptanceRate && ` • Acceptance Rate ${university.acceptanceRate}%`}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
            <CardDescription>
              Fill in basic application information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Application Type
                </label>
                <select
                  name="applicationType"
                  value={formData.applicationType}
                  onChange={handleApplicationTypeChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="REGULAR_DECISION">Regular Decision</option>
                  <option value="EARLY_DECISION">Early Decision</option>
                  <option value="EARLY_ACTION">Early Action</option>
                  <option value="ROLLING_ADMISSION">Rolling Admission</option>
                </select>
              </div>

              <Input
                label="Application Deadline"
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                helperText="Auto-filled based on application type, you can modify"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Add notes about this application..."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  loading={saving}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Application
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/student/universities')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Available Deadlines Info */}
        {university.deadlines && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Important Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  try {
                    const deadlines = JSON.parse(university.deadlines);
                    return Object.entries(deadlines).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {key === 'early_decision' && 'Early Decision'}
                          {key === 'early_action' && 'Early Action'}
                          {key === 'regular_decision' && 'Regular Decision'}
                          {key === 'rolling' && 'Rolling Admission'}
                          {!['early_decision', 'early_action', 'regular_decision', 'rolling'].includes(key) && key}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {value as string}
                        </span>
                      </div>
                    ));
                  } catch {
                    return <p className="text-sm text-gray-500">Deadline information format error</p>;
                  }
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
