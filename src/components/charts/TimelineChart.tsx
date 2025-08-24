'use client';

import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface Application {
  id: string;
  status: string;
  deadline?: string;
  submittedDate?: string;
  decisionDate?: string;
  decisionType?: string;
  university: {
    name: string;
  };
}

interface TimelineChartProps {
  applications: Application[];
}

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'deadline' | 'submitted' | 'decision';
  application: Application;
  title: string;
  description: string;
}

export default function TimelineChart({ applications }: TimelineChartProps) {
  // Create timeline events
  const events: TimelineEvent[] = [];

  applications.forEach(app => {
    if (app.deadline) {
      events.push({
        id: `${app.id}-deadline`,
        date: parseISO(app.deadline),
        type: 'deadline',
        application: app,
        title: 'Application Deadline',
        description: `${app.university.name} application deadline`
      });
    }

    if (app.submittedDate) {
      events.push({
        id: `${app.id}-submitted`,
        date: parseISO(app.submittedDate),
        type: 'submitted',
        application: app,
        title: 'Application Submitted',
        description: `Submitted application to ${app.university.name}`
      });
    }

    if (app.decisionDate) {
      events.push({
        id: `${app.id}-decision`,
        date: parseISO(app.decisionDate),
        type: 'decision',
        application: app,
        title: 'Decision Received',
        description: `${app.university.name} application result`
      });
    }
  });

  // Sort events by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group events by month
  const eventsByMonth: { [key: string]: TimelineEvent[] } = {};
  events.forEach(event => {
    const monthKey = format(event.date, 'yyyy-MM');
    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = [];
    }
    eventsByMonth[monthKey].push(event);
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <AlertTriangle className="h-4 w-4" />;
      case 'submitted':
        return <CheckCircle className="h-4 w-4" />;
      case 'decision':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'submitted':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'decision':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const isPastEvent = (date: Date) => {
    return date.getTime() < new Date().getTime();
  };

  const isUpcoming = (date: Date) => {
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return date.getTime() > now.getTime() && date.getTime() <= twoWeeksFromNow.getTime();
  };

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No timeline events</p>
          <p className="text-sm mt-2">Timeline will appear here after adding application deadlines, submission dates, and other information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(eventsByMonth).map(([monthKey, monthEvents]) => (
        <div key={monthKey}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            {format(parseISO(`${monthKey}-01`), 'MMMM yyyy')}
          </h3>
          
          <div className="space-y-4">
            {monthEvents.map((event, index) => (
              <div
                key={event.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 ${
                  isPastEvent(event.date)
                    ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 opacity-75'
                    : isUpcoming(event.date)
                    ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/10'
                    : 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
                }`}
              >
                <div className={`flex-shrink-0 p-2 rounded-full ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                      {format(event.date, 'MMM dd')}
                    </time>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {event.description}
                  </p>
                  
                  {/* Additional info based on event type */}
                  {event.type === 'deadline' && event.application.status !== 'SUBMITTED' && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        {event.application.status === 'NOT_STARTED' ? 'Not Started' : 'In Progress'}
                      </span>
                    </div>
                  )}
                  
                  {event.type === 'decision' && event.application.status === 'DECISION_RECEIVED' && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.application.decisionType === 'ACCEPTED'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : event.application.decisionType === 'REJECTED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {event.application.decisionType === 'ACCEPTED' && 'Accepted'}
                        {event.application.decisionType === 'REJECTED' && 'Rejected'}
                        {event.application.decisionType === 'WAITLISTED' && 'Waitlisted'}
                        {event.application.decisionType === 'DEFERRED' && 'Deferred'}
                      </span>
                    </div>
                  )}
                  
                  {isUpcoming(event.date) && event.type === 'deadline' && (
                    <div className="mt-2 flex items-center text-xs text-orange-600 dark:text-orange-400">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Due Soon
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Summary */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Timeline Statistics</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {events.filter(e => e.type === 'deadline').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Deadlines</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {events.filter(e => e.type === 'submitted').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Submitted</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {events.filter(e => e.type === 'decision').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Decisions Received</div>
          </div>
        </div>
      </div>
    </div>
  );
}
