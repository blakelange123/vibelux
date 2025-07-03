'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Send,
  Users,
  Clock,
  AlertCircle,
  Check,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { Department, EmployeeRole } from '@/lib/workforce/workforce-types';

// Mock schedule data
const mockSchedule = {
  weekOf: new Date('2024-01-15'),
  published: false,
  shifts: [
    {
      id: '1',
      employeeName: 'Sarah Johnson',
      employeeId: '1',
      department: Department.CULTIVATION,
      monday: { start: '08:00', end: '16:00', room: 'Flower Room 1' },
      tuesday: { start: '08:00', end: '16:00', room: 'Flower Room 1' },
      wednesday: { start: '08:00', end: '16:00', room: 'Flower Room 2' },
      thursday: { start: '08:00', end: '16:00', room: 'Flower Room 2' },
      friday: { start: '08:00', end: '16:00', room: 'Veg Room' },
      saturday: null,
      sunday: null,
      totalHours: 40
    },
    {
      id: '2',
      employeeName: 'Mike Chen',
      employeeId: '2',
      department: Department.CULTIVATION,
      monday: { start: '06:00', end: '14:00', room: 'Clone Room' },
      tuesday: { start: '06:00', end: '14:00', room: 'Clone Room' },
      wednesday: { start: '06:00', end: '14:00', room: 'Veg Room' },
      thursday: { start: '06:00', end: '14:00', room: 'Veg Room' },
      friday: { start: '06:00', end: '14:00', room: 'Veg Room' },
      saturday: null,
      sunday: null,
      totalHours: 40
    },
    {
      id: '3',
      employeeName: 'Jessica Martinez',
      employeeId: '3',
      department: Department.CULTIVATION,
      monday: { start: '10:00', end: '18:00', room: 'All Rooms - IPM' },
      tuesday: { start: '10:00', end: '18:00', room: 'All Rooms - IPM' },
      wednesday: { start: '10:00', end: '18:00', room: 'All Rooms - IPM' },
      thursday: { start: '10:00', end: '18:00', room: 'All Rooms - IPM' },
      friday: { start: '10:00', end: '18:00', room: 'All Rooms - IPM' },
      saturday: null,
      sunday: null,
      totalHours: 40
    }
  ]
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SchedulingPage() {
  const [selectedWeek, setSelectedWeek] = useState(new Date('2024-01-15'));
  const [selectedDepartment, setSelectedDepartment] = useState<Department>(Department.CULTIVATION);
  const [editingShift, setEditingShift] = useState<string | null>(null);

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

  const getShiftColor = (room: string) => {
    if (room.includes('Flower')) return 'bg-purple-600';
    if (room.includes('Veg')) return 'bg-green-600';
    if (room.includes('Clone')) return 'bg-blue-600';
    if (room.includes('IPM')) return 'bg-orange-600';
    if (room.includes('Processing')) return 'bg-pink-600';
    return 'bg-gray-600';
  };

  const calculateCoverage = () => {
    const requiredStaff = {
      [Department.CULTIVATION]: { morning: 4, afternoon: 3, evening: 2 },
      [Department.PROCESSING]: { morning: 2, afternoon: 2, evening: 1 },
      [Department.PACKAGING]: { morning: 2, afternoon: 2, evening: 0 }
    };

    // This would calculate actual coverage based on shifts
    return {
      morning: { required: 4, scheduled: 3, coverage: 75 },
      afternoon: { required: 3, scheduled: 3, coverage: 100 },
      evening: { required: 2, scheduled: 0, coverage: 0 }
    };
  };

  const coverage = calculateCoverage();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/workforce"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Schedule Management</h1>
                <p className="text-gray-400">Create and manage employee schedules</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Copy Last Week
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" />
                Publish Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
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
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value as Department)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
            >
              {Object.values(Department).map(dept => (
                <option key={dept} value={dept}>
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </option>
              ))}
            </select>
            
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Shift
            </button>
          </div>
        </div>

        {/* Coverage Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(coverage).map(([shift, data]) => (
            <div key={shift} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium capitalize">{shift} Shift</h3>
                <span className={`text-sm ${
                  data.coverage >= 100 ? 'text-green-400' :
                  data.coverage >= 75 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {data.coverage}% Coverage
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <span>{data.scheduled}/{data.required} Staff</span>
                {data.coverage < 100 && (
                  <AlertCircle className="w-4 h-4 text-yellow-400 ml-auto" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Grid */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 text-sm font-medium text-gray-400 sticky left-0 bg-gray-900">
                    Employee
                  </th>
                  {daysOfWeek.map((day, index) => (
                    <th key={day} className="text-center p-4 text-sm font-medium text-gray-400">
                      <div>{shortDays[index]}</div>
                      <div className="text-xs text-gray-500 font-normal">
                        {new Date(selectedWeek.getTime() + (index - selectedWeek.getDay() + 1) * 24 * 60 * 60 * 1000).getDate()}
                      </div>
                    </th>
                  ))}
                  <th className="text-center p-4 text-sm font-medium text-gray-400">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockSchedule.shifts.map((shift) => (
                  <tr key={shift.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-4 sticky left-0 bg-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {shift.employeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium">{shift.employeeName}</span>
                      </div>
                    </td>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                      const dayShift = (shift as any)[day];
                      return (
                        <td key={day} className="p-2">
                          {dayShift ? (
                            <div
                              className={`${getShiftColor(dayShift.room)} rounded-lg p-2 text-center cursor-pointer hover:opacity-80 transition-opacity`}
                              onClick={() => setEditingShift(`${shift.id}-${day}`)}
                            >
                              <div className="text-xs font-medium">
                                {dayShift.start} - {dayShift.end}
                              </div>
                              <div className="text-xs opacity-90 truncate">
                                {dayShift.room}
                              </div>
                            </div>
                          ) : (
                            <button
                              className="w-full h-full min-h-[60px] border-2 border-dashed border-gray-700 rounded-lg hover:border-gray-600 hover:bg-gray-800/50 transition-all flex items-center justify-center"
                              onClick={() => setEditingShift(`${shift.id}-${day}`)}
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-4 text-center">
                      <div className="font-medium">{shift.totalHours}h</div>
                      <div className="text-xs text-gray-500">
                        ${(shift.totalHours * 25).toFixed(0)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-800">
                  <td className="p-4 font-medium sticky left-0 bg-gray-900">
                    Daily Totals
                  </td>
                  {daysOfWeek.map((day) => (
                    <td key={day} className="p-4 text-center">
                      <div className="text-sm font-medium">24h</div>
                      <div className="text-xs text-gray-500">3 staff</div>
                    </td>
                  ))}
                  <td className="p-4 text-center">
                    <div className="font-bold text-green-400">120h</div>
                    <div className="text-xs text-gray-500">$3,000</div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Schedule Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Schedule Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Hours</span>
                <span className="font-medium">120</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Overtime Hours</span>
                <span className="font-medium text-yellow-400">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Labor Cost</span>
                <span className="font-medium">$3,240</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Staff Distribution
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Cultivation</span>
                <span className="font-medium">8 employees</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Processing</span>
                <span className="font-medium">4 employees</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Packaging</span>
                <span className="font-medium">3 employees</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Alerts
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5"></div>
                <span className="text-gray-300">3 shifts need coverage</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5"></div>
                <span className="text-gray-300">2 employees approaching overtime</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                <span className="text-gray-300">Schedule not yet published</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}