'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Play,
  Pause,
  Square,
  Calendar,
  Download,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Timer,
  Coffee,
  User,
  MapPin
} from 'lucide-react';
import { ClockMethod, TimeEntry, EmployeeStatus } from '@/lib/workforce/workforce-types';

// Mock data
const mockTimeEntries: TimeEntry[] = [
  {
    id: '1',
    employeeId: '1',
    clockIn: new Date('2024-01-22T08:00:00'),
    clockOut: new Date('2024-01-22T16:30:00'),
    breakStart: new Date('2024-01-22T12:00:00'),
    breakEnd: new Date('2024-01-22T12:30:00'),
    totalHours: 8,
    overtimeHours: 0,
    location: 'Flower Room 1',
    method: ClockMethod.BIOMETRIC,
    notes: 'Normal shift'
  },
  {
    id: '2',
    employeeId: '2',
    clockIn: new Date('2024-01-22T06:00:00'),
    clockOut: new Date('2024-01-22T14:15:00'),
    breakStart: new Date('2024-01-22T10:00:00'),
    breakEnd: new Date('2024-01-22T10:15:00'),
    totalHours: 8,
    overtimeHours: 0,
    location: 'Clone Room',
    method: ClockMethod.BADGE,
    notes: ''
  },
  {
    id: '3',
    employeeId: '3',
    clockIn: new Date('2024-01-22T10:00:00'),
    clockOut: undefined, // Still clocked in
    location: 'IPM Station',
    method: ClockMethod.MOBILE,
    notes: 'IPM rounds'
  }
];

const mockEmployees = [
  { id: '1', name: 'Sarah Johnson', status: 'clocked-out', location: 'Flower Room 1', clockedInAt: null },
  { id: '2', name: 'Mike Chen', status: 'clocked-out', location: 'Clone Room', clockedInAt: null },
  { id: '3', name: 'Jessica Martinez', status: 'clocked-in', location: 'IPM Station', clockedInAt: new Date('2024-01-22T10:00:00') },
  { id: '4', name: 'David Wilson', status: 'on-break', location: 'Processing Room', clockedInAt: new Date('2024-01-22T08:30:00') },
  { id: '5', name: 'Lisa Thompson', status: 'clocked-in', location: 'Veg Room', clockedInAt: new Date('2024-01-22T07:00:00') }
];

export default function TimeTrackingPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'live' | 'timesheet' | 'reports'>('live');
  const [searchTerm, setSearchTerm] = useState('');

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clocked-in': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'clocked-out': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'on-break': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMethodIcon = (method: ClockMethod) => {
    switch (method) {
      case ClockMethod.BIOMETRIC: return '👤';
      case ClockMethod.BADGE: return '🏷️';
      case ClockMethod.MOBILE: return '📱';
      case ClockMethod.PIN: return '🔢';
      case ClockMethod.MANUAL: return '✏️';
      default: return '⏰';
    }
  };

  const filteredEmployees = mockEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTimeEntries = mockTimeEntries.filter(entry => {
    const entryDate = entry.clockIn.toISOString().split('T')[0];
    return entryDate === selectedDate;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/workforce"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Time & Attendance</h1>
                <p className="text-gray-400">Track employee hours and attendance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/workforce/time-tracking/timesheet"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Timer className="w-4 h-4" />
                View Timesheet
              </Link>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex">
            {[
              { id: 'live', label: 'Live Status', icon: Clock },
              { id: 'timesheet', label: 'Daily Timesheet', icon: Calendar },
              { id: 'reports', label: 'Reports', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Live Status Tab */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">Present</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {mockEmployees.filter(e => e.status !== 'clocked-out').length}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Coffee className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-400">On Break</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {mockEmployees.filter(e => e.status === 'on-break').length}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Timer className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-400">Total Hours</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">42.5</div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-gray-400">Overtime</span>
                </div>
                <div className="text-2xl font-bold text-red-400">3.5</div>
              </div>
            </div>

            {/* Employee Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Live Employee Status */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Employee Status</h3>
              </div>
              <div className="divide-y divide-gray-700">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{employee.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="w-4 h-4" />
                            {employee.location}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {employee.clockedInAt && (
                            <div className="text-sm text-gray-400">
                              Since {formatTime(employee.clockedInAt)}
                            </div>
                          )}
                          <div className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(employee.status)}`}>
                            {employee.status.replace('-', ' ').toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {employee.status === 'clocked-out' ? (
                            <button className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                              <Play className="w-4 h-4" />
                            </button>
                          ) : employee.status === 'on-break' ? (
                            <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                              <Play className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors">
                                <Coffee className="w-4 h-4" />
                              </button>
                              <button className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                                <Square className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Daily Timesheet Tab */}
        {activeTab === 'timesheet' && (
          <div className="space-y-6">
            {/* Date Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-400">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Timesheet Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Employee</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Clock In</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Clock Out</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Break</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Total Hours</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Location</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimeEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="font-medium">Employee {entry.employeeId}</span>
                        </div>
                      </td>
                      <td className="p-4 text-green-400">{formatTime(entry.clockIn)}</td>
                      <td className="p-4">
                        {entry.clockOut ? (
                          <span className="text-red-400">{formatTime(entry.clockOut)}</span>
                        ) : (
                          <span className="text-yellow-400">Still working</span>
                        )}
                      </td>
                      <td className="p-4">
                        {entry.breakStart && entry.breakEnd ? (
                          <span className="text-blue-400">
                            {formatTime(entry.breakStart)} - {formatTime(entry.breakEnd)}
                          </span>
                        ) : (
                          <span className="text-gray-500">No break</span>
                        )}
                      </td>
                      <td className="p-4">
                        {entry.totalHours ? (
                          <span className="font-medium">{formatDuration(entry.totalHours)}</span>
                        ) : (
                          <span className="text-gray-500">In progress</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-300">{entry.location}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-2">
                          <span>{getMethodIcon(entry.method)}</span>
                          <span className="text-sm text-gray-400">{entry.method}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Hours</span>
                    <span className="font-medium">180.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Regular Hours</span>
                    <span className="font-medium">168.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Overtime Hours</span>
                    <span className="font-medium text-yellow-400">12.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average Daily Hours</span>
                    <span className="font-medium">8.2</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Attendance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Attendance Rate</span>
                    <span className="font-medium text-green-400">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Late Arrivals</span>
                    <span className="font-medium text-yellow-400">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Early Departures</span>
                    <span className="font-medium text-yellow-400">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Absences</span>
                    <span className="font-medium text-red-400">2</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Export Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-left">
                  <h4 className="font-medium mb-2">Daily Timesheet</h4>
                  <p className="text-sm text-gray-400">Export daily time entries</p>
                </button>
                <button className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-left">
                  <h4 className="font-medium mb-2">Payroll Report</h4>
                  <p className="text-sm text-gray-400">Hours summary for payroll</p>
                </button>
                <button className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-left">
                  <h4 className="font-medium mb-2">Attendance Report</h4>
                  <p className="text-sm text-gray-400">Attendance analytics</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}