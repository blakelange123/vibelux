'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Save,
  X,
  Clock,
  Coffee,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { TimeEntry, ClockMethod } from '@/lib/workforce/workforce-types';

// Mock timesheet data
const mockTimesheetData = [
  {
    employeeId: '1',
    employeeName: 'Sarah Johnson',
    week: [
      { date: '2024-01-15', clockIn: '08:00', clockOut: '16:30', breakStart: '12:00', breakEnd: '12:30', hours: 8.0, overtime: 0 },
      { date: '2024-01-16', clockIn: '08:00', clockOut: '16:30', breakStart: '12:00', breakEnd: '12:30', hours: 8.0, overtime: 0 },
      { date: '2024-01-17', clockIn: '08:15', clockOut: '16:30', breakStart: '12:00', breakEnd: '12:30', hours: 7.75, overtime: 0 },
      { date: '2024-01-18', clockIn: '08:00', clockOut: '17:00', breakStart: '12:00', breakEnd: '12:30', hours: 8.5, overtime: 0.5 },
      { date: '2024-01-19', clockIn: '08:00', clockOut: '16:30', breakStart: '12:00', breakEnd: '12:30', hours: 8.0, overtime: 0 },
      { date: '2024-01-20', clockIn: null, clockOut: null, breakStart: null, breakEnd: null, hours: 0, overtime: 0 }, // Weekend
      { date: '2024-01-21', clockIn: null, clockOut: null, breakStart: null, breakEnd: null, hours: 0, overtime: 0 }  // Weekend
    ],
    totalHours: 40.25,
    totalOvertime: 0.5
  },
  {
    employeeId: '2',
    employeeName: 'Mike Chen',
    week: [
      { date: '2024-01-15', clockIn: '06:00', clockOut: '14:15', breakStart: '10:00', breakEnd: '10:15', hours: 8.0, overtime: 0 },
      { date: '2024-01-16', clockIn: '06:00', clockOut: '14:15', breakStart: '10:00', breakEnd: '10:15', hours: 8.0, overtime: 0 },
      { date: '2024-01-17', clockIn: '06:00', clockOut: '14:15', breakStart: '10:00', breakEnd: '10:15', hours: 8.0, overtime: 0 },
      { date: '2024-01-18', clockIn: '06:00', clockOut: '14:15', breakStart: '10:00', breakEnd: '10:15', hours: 8.0, overtime: 0 },
      { date: '2024-01-19', clockIn: '06:00', clockOut: '15:00', breakStart: '10:00', breakEnd: '10:15', hours: 8.75, overtime: 0.75 },
      { date: '2024-01-20', clockIn: null, clockOut: null, breakStart: null, breakEnd: null, hours: 0, overtime: 0 },
      { date: '2024-01-21', clockIn: null, clockOut: null, breakStart: null, breakEnd: null, hours: 0, overtime: 0 }
    ],
    totalHours: 40.75,
    totalOvertime: 0.75
  },
  {
    employeeId: '3',
    employeeName: 'Jessica Martinez',
    week: [
      { date: '2024-01-15', clockIn: '10:00', clockOut: '18:00', breakStart: '14:00', breakEnd: '14:30', hours: 7.5, overtime: 0 },
      { date: '2024-01-16', clockIn: '10:00', clockOut: '18:00', breakStart: '14:00', breakEnd: '14:30', hours: 7.5, overtime: 0 },
      { date: '2024-01-17', clockIn: null, clockOut: null, breakStart: null, breakEnd: null, hours: 0, overtime: 0 }, // Sick day
      { date: '2024-01-18', clockIn: '10:00', clockOut: '18:30', breakStart: '14:00', breakEnd: '14:30', hours: 8.0, overtime: 0 },
      { date: '2024-01-19', clockIn: '10:00', clockOut: '18:00', breakStart: '14:00', breakEnd: '14:30', hours: 7.5, overtime: 0 },
      { date: '2024-01-20', clockIn: null, clockOut: null, breakStart: null, breakEnd: null, hours: 0, overtime: 0 },
      { date: '2024-01-21', clockIn: null, clockOut: null, breakStart: null, breakEnd: null, hours: 0, overtime: 0 }
    ],
    totalHours: 30.5,
    totalOvertime: 0
  }
];

export default function TimesheetPage() {
  const [selectedWeek, setSelectedWeek] = useState(new Date('2024-01-15'));
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const formatWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    const end = new Date(start);
    end.setDate(end.getDate() + 6); // Sunday
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newDate);
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDateNumber = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  const startEdit = (cellId: string, currentValue: string) => {
    setEditingCell(cellId);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    // In a real app, this would save to the backend
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const calculateWeeklyTotals = () => {
    return mockTimesheetData.reduce((acc, employee) => {
      acc.totalHours += employee.totalHours;
      acc.totalOvertime += employee.totalOvertime;
      return acc;
    }, { totalHours: 0, totalOvertime: 0 });
  };

  const weeklyTotals = calculateWeeklyTotals();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/workforce/time-tracking"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Weekly Timesheet</h1>
                <p className="text-gray-400">Review and edit employee time entries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold">
              Week of {formatWeekRange(selectedWeek)}
            </h2>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Total Hours: <span className="font-medium text-white">{weeklyTotals.totalHours}</span>
            </div>
            <div className="text-sm text-gray-400">
              Overtime: <span className="font-medium text-yellow-400">{weeklyTotals.totalOvertime}</span>
            </div>
          </div>
        </div>

        {/* Timesheet Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-sm font-medium text-gray-400 sticky left-0 bg-gray-800">
                    Employee
                  </th>
                  {mockTimesheetData[0]?.week.map((day, index) => (
                    <th key={day.date} className="text-center p-4 text-sm font-medium text-gray-400 min-w-[120px]">
                      <div>{getDayName(day.date)}</div>
                      <div className="text-xs text-gray-500 font-normal">
                        {getDateNumber(day.date)}
                      </div>
                    </th>
                  ))}
                  <th className="text-center p-4 text-sm font-medium text-gray-400">
                    Total
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-gray-400">
                    OT
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockTimesheetData.map((employee) => (
                  <tr key={employee.employeeId} className="border-b border-gray-700">
                    <td className="p-4 sticky left-0 bg-gray-800">
                      <div className="font-medium">{employee.employeeName}</div>
                    </td>
                    {employee.week.map((day, dayIndex) => (
                      <td key={`${employee.employeeId}-${dayIndex}`} className="p-2">
                        {day.clockIn ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-green-400">In: {day.clockIn}</span>
                              <button
                                onClick={() => startEdit(`${employee.employeeId}-${dayIndex}-in`, day.clockIn)}
                                className="p-1 hover:bg-gray-700 rounded"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-red-400">Out: {day.clockOut}</span>
                              <button
                                onClick={() => startEdit(`${employee.employeeId}-${dayIndex}-out`, day.clockOut || '')}
                                className="p-1 hover:bg-gray-700 rounded"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                            {day.breakStart && day.breakEnd && (
                              <div className="flex items-center gap-1 text-xs text-yellow-400">
                                <Coffee className="w-3 h-3" />
                                <span>{day.breakStart}-{day.breakEnd}</span>
                              </div>
                            )}
                            <div className="text-xs font-medium text-center">
                              {day.hours}h
                              {day.overtime > 0 && (
                                <span className="text-yellow-400 ml-1">+{day.overtime}OT</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 text-xs py-4">
                            {getDayName(day.date).includes('Sat') || getDayName(day.date).includes('Sun') ? 
                              'Weekend' : 'No Entry'
                            }
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="p-4 text-center">
                      <div className="font-medium">{employee.totalHours}h</div>
                      <div className="text-xs text-gray-500">
                        ${(employee.totalHours * 25).toFixed(0)}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {employee.totalOvertime > 0 ? (
                        <div className="text-yellow-400 font-medium">
                          {employee.totalOvertime}h
                        </div>
                      ) : (
                        <div className="text-gray-500">-</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-700 bg-gray-750">
                  <td className="p-4 font-medium sticky left-0 bg-gray-750">
                    Weekly Totals
                  </td>
                  {Array.from({ length: 7 }, (_, index) => (
                    <td key={index} className="p-4 text-center">
                      <div className="text-sm font-medium">
                        {mockTimesheetData.reduce((sum, emp) => sum + emp.week[index].hours, 0)}h
                      </div>
                    </td>
                  ))}
                  <td className="p-4 text-center">
                    <div className="font-bold text-green-400">{weeklyTotals.totalHours}h</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-bold text-yellow-400">{weeklyTotals.totalOvertime}h</div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400">Regular Hours</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {weeklyTotals.totalHours - weeklyTotals.totalOvertime}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400">Overtime Hours</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {weeklyTotals.totalOvertime}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">Attendance Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-400">95%</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Coffee className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400">Break Compliance</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">100%</div>
          </div>
        </div>

        {/* Alerts and Issues */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Timesheet Issues</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400">Sarah Johnson: Late arrival on Wednesday (8:15 AM)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">Jessica Martinez: Missing entry for Wednesday (Sick day?)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400">All other entries look good</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCell && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Time Entry</h3>
            <input
              type="time"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-500 focus:outline-none text-white mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}