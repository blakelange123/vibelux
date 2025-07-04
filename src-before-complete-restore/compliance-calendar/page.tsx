'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  FileText,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Building,
  Users,
  Bell,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: 'License' | 'Report' | 'Inspection' | 'Training' | 'Audit' | 'Payment';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Overdue';
  responsible: string;
  department: string;
}

export default function ComplianceCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Mock data
  const events: CalendarEvent[] = [
    {
      id: '1',
      date: '2024-03-15',
      title: 'State Cannabis License Renewal',
      type: 'License',
      priority: 'Critical',
      status: 'Upcoming',
      responsible: 'John Smith',
      department: 'Compliance'
    },
    {
      id: '2',
      date: '2024-03-20',
      title: 'Monthly METRC Report',
      type: 'Report',
      priority: 'High',
      status: 'Upcoming',
      responsible: 'Sarah Johnson',
      department: 'Operations'
    },
    {
      id: '3',
      date: '2024-03-25',
      title: 'Fire Safety Inspection',
      type: 'Inspection',
      priority: 'High',
      status: 'Upcoming',
      responsible: 'Mike Davis',
      department: 'Facilities'
    },
    {
      id: '4',
      date: '2024-03-30',
      title: 'Employee Safety Training',
      type: 'Training',
      priority: 'Medium',
      status: 'Upcoming',
      responsible: 'Lisa Anderson',
      department: 'HR'
    }
  ];

  const upcomingDeadlines = [
    { title: 'State License Renewal', daysLeft: 5, priority: 'Critical' },
    { title: 'Monthly Tax Filing', daysLeft: 12, priority: 'High' },
    { title: 'Annual Audit Prep', daysLeft: 30, priority: 'Medium' },
    { title: 'OSHA Training Renewal', daysLeft: 45, priority: 'Low' }
  ];

  const complianceScore = {
    overall: 94,
    byCategory: {
      'State Regulatory': 98,
      'Local Compliance': 92,
      'Financial': 95,
      'Safety': 90,
      'Quality': 96
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'License': return 'bg-purple-500';
      case 'Report': return 'bg-blue-500';
      case 'Inspection': return 'bg-orange-500';
      case 'Training': return 'bg-green-500';
      case 'Audit': return 'bg-red-500';
      case 'Payment': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-green-400" />
            Compliance Calendar
          </h1>
          <p className="text-gray-400 text-lg">
            Track regulatory deadlines, licenses, and compliance requirements
          </p>
        </div>

        {/* Compliance Score */}
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-600/30 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Compliance Score</h3>
              <p className="text-gray-400">Overall regulatory compliance health</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-400">{complianceScore.overall}%</div>
              <div className="text-sm text-gray-500">Excellent</div>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-4 mt-6">
            {Object.entries(complianceScore.byCategory).map(([category, score]) => (
              <div key={category} className="text-center">
                <div className="text-2xl font-bold">{score}%</div>
                <div className="text-xs text-gray-400">{category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Upcoming</span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-gray-500">Next 30 days</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Overdue</span>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-red-400">2</div>
            <div className="text-sm text-gray-500">Require attention</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">156</div>
            <div className="text-sm text-gray-500">This year</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active Licenses</span>
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-gray-500">All current</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigateMonth(-1)}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => navigateMonth(1)}
                      className="p-1 hover:bg-gray-700 rounded"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
                  >
                    {viewMode === 'calendar' ? 'List View' : 'Calendar View'}
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add Event
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm text-gray-400 font-medium py-2">
                    {day}
                  </div>
                ))}
                
                {/* Empty cells for days before month starts */}
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {/* Calendar days */}
                {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvents = events.filter(e => e.date === dateStr);
                  
                  return (
                    <div
                      key={day}
                      className="aspect-square border border-gray-700 rounded-lg p-1 hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                    >
                      <div className="text-sm mb-1">{day}</div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event, idx) => (
                          <div
                            key={idx}
                            className={`text-xs px-1 py-0.5 rounded ${getEventColor(event.type)} text-white truncate`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-400" />
                Urgent Deadlines
              </h3>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between pb-3 border-b border-gray-700 last:border-0">
                    <div>
                      <p className="font-medium">{deadline.title}</p>
                      <p className={`text-sm ${getPriorityColor(deadline.priority)}`}>
                        {deadline.priority} Priority
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        deadline.daysLeft <= 7 ? 'text-red-400' : 
                        deadline.daysLeft <= 14 ? 'text-yellow-400' : 
                        'text-green-400'
                      }`}>
                        {deadline.daysLeft}
                      </p>
                      <p className="text-xs text-gray-500">days left</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* License Status */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                License Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">State Cannabis</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Business License</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Fire Permit</span>
                  <span className="text-yellow-400">Expires in 45d</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Building Permit</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
              <Link href="/compliance-calendar/licenses" className="block w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white text-center text-sm px-3 py-2 rounded-lg">
                Manage Licenses
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-2 rounded-lg flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Submit Report
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-2 rounded-lg flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Schedule Training
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-2 rounded-lg flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" />
                  Request Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}