'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieLabel } from 'recharts';
import { PieLabelProps } from 'recharts/types/polar/Pie';

interface Application {
  id: string;
  status: string;
  decisionType?: string;
  university: {
    name: string;
  };
}

interface ApplicationProgressChartProps {
  applications: Application[];
  type?: 'pie' | 'bar';
}

const COLORS = {
  NOT_STARTED: '#64748b',
  IN_PROGRESS: '#f59e0b',
  SUBMITTED: '#3b82f6',
  UNDER_REVIEW: '#6366f1',
  DECISION_RECEIVED: '#10b981',
  ACCEPTED: '#10b981',
  REJECTED: '#ef4444',
  WAITLISTED: '#f59e0b',
  DEFERRED: '#6366f1'
};

const STATUS_LABELS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  DECISION_RECEIVED: 'Decision Received'
};

const DECISION_LABELS = {
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WAITLISTED: 'Waitlisted',
  DEFERRED: 'Deferred'
};

export default function ApplicationProgressChart({ applications, type = 'pie' }: ApplicationProgressChartProps) {
  // Prepare data for status chart
  const statusData = Object.entries(STATUS_LABELS).map(([status, label]) => ({
    name: label,
    value: applications.filter(app => app.status === status).length,
    color: COLORS[status as keyof typeof COLORS]
  })).filter(item => item.value > 0);

  // Prepare data for decision chart
  const decisionApplications = applications.filter(app => app.status === 'DECISION_RECEIVED');
  const decisionData = Object.entries(DECISION_LABELS).map(([decision, label]) => ({
    name: label,
    value: decisionApplications.filter(app => app.decisionType === decision).length,
    color: COLORS[decision as keyof typeof COLORS]
  })).filter(item => item.value > 0);

  // Prepare data for bar chart
  const barData = statusData.map(item => ({
    status: item.name,
    count: item.value,
    fill: item.color
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            {`${payload[0].name || label}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number }) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No application data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Application Status Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Application Status Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'pie' ? (
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel as PieLabel<PieLabelProps>}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : (
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="status" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {statusData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Results Chart */}
      {decisionData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Admission Results Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={decisionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel as PieLabel<PieLabelProps>}
                  outerRadius={80}  
                  fill="#8884d8"
                  dataKey="value"
                >
                  {decisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {decisionData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {applications.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Applications
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {applications.filter(app => ['SUBMITTED', 'UNDER_REVIEW', 'DECISION_RECEIVED'].includes(app.status)).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Submitted
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {applications.filter(app => app.status === 'DECISION_RECEIVED').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Decisions Received
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {applications.filter(app => app.decisionType === 'ACCEPTED').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Acceptances
          </div>
        </div>
      </div>
    </div>
  );
}
