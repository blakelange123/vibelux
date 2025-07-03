'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Settings,
  Tool,
  Users,
  Package,
  FileText,
  Bell,
  TrendingUp,
  Repeat,
  Shield
} from 'lucide-react';
import { 
  MaintenanceSchedule, 
  WorkOrder,
  Equipment,
  MaintenanceType,
  Priority,
  Frequency
} from '@/lib/maintenance/maintenance-types';

interface MaintenanceSchedulerProps {
  equipment: Equipment[];
  schedules: MaintenanceSchedule[];
  workOrders: WorkOrder[];
  onCreateWorkOrder: (schedule: MaintenanceSchedule) => void;
}

export function MaintenanceScheduler({ 
  equipment, 
  schedules, 
  workOrders,
  onCreateWorkOrder 
}: MaintenanceSchedulerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Get the first day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get the first day of the week for the calendar
  const firstDayOfCalendar = new Date(firstDayOfMonth);
  firstDayOfCalendar.setDate(firstDayOfCalendar.getDate() - firstDayOfCalendar.getDay());

  // Generate calendar days
  const calendarDays: Date[] = [];
  const currentDay = new Date(firstDayOfCalendar);
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.nextDue);
      return scheduleDate.toDateString() === date.toDateString();
    }).filter(schedule => {
      const matchesType = filterType === 'all' || schedule.type === filterType;
      const matchesPriority = filterPriority === 'all' || schedule.priority === filterPriority;
      return matchesType && matchesPriority;
    });
  };

  // Get work orders for a specific date
  const getWorkOrdersForDate = (date: Date) => {
    return workOrders.filter(wo => {
      const woDate = wo.scheduledDate || wo.requestedDate;
      return woDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getMaintenanceTypeColor = (type: MaintenanceType) => {
    switch (type) {
      case MaintenanceType.Preventive: return 'bg-blue-900/20 text-blue-400 border-blue-600/30';
      case MaintenanceType.Predictive: return 'bg-purple-900/20 text-purple-400 border-purple-600/30';
      case MaintenanceType.Corrective: return 'bg-orange-900/20 text-orange-400 border-orange-600/30';
      case MaintenanceType.Emergency: return 'bg-red-900/20 text-red-400 border-red-600/30';
      case MaintenanceType.Calibration: return 'bg-green-900/20 text-green-400 border-green-600/30';
      case MaintenanceType.Inspection: return 'bg-cyan-900/20 text-cyan-400 border-cyan-600/30';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-600/30';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case Priority.Emergency: return <AlertTriangle className="w-3 h-3" />;
      case Priority.High: return <TrendingUp className="w-3 h-3" />;
      default: return null;
    }
  };

  // Calculate maintenance metrics
  const upcomingCount = schedules.filter(s => {
    const daysUntil = Math.ceil((s.nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 7;
  }).length;

  const overdueCount = schedules.filter(s => s.nextDue < new Date()).length;

  const thisMonthCount = schedules.filter(s => {
    const scheduleMonth = s.nextDue.getMonth();
    const scheduleYear = s.nextDue.getFullYear();
    return scheduleMonth === currentDate.getMonth() && scheduleYear === currentDate.getFullYear();
  }).length;

  const totalHours = schedules
    .filter(s => {
      const scheduleMonth = s.nextDue.getMonth();
      const scheduleYear = s.nextDue.getFullYear();
      return scheduleMonth === currentDate.getMonth() && scheduleYear === currentDate.getFullYear();
    })
    .reduce((sum, s) => sum + s.estimatedDuration, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold text-white">Maintenance Calendar</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'month' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'week' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              List
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
          >
            <option value="all">All Types</option>
            {Object.values(MaintenanceType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
          >
            <option value="all">All Priorities</option>
            {Object.values(Priority).map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowScheduleModal(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5 inline" />
            Schedule
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-gray-500">Next 7 days</span>
          </div>
          <p className="text-2xl font-bold text-white">{upcomingCount}</p>
          <p className="text-xs text-gray-400">Upcoming</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-xs text-red-400">Action needed</span>
          </div>
          <p className="text-2xl font-bold text-white">{overdueCount}</p>
          <p className="text-xs text-gray-400">Overdue</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-500">This month</span>
          </div>
          <p className="text-2xl font-bold text-white">{thisMonthCount}</p>
          <p className="text-xs text-gray-400">Scheduled</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-500">Est. hours</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalHours}</p>
          <p className="text-xs text-gray-400">Total Hours</p>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'month' && (
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h3 className="text-lg font-semibold text-white">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();
                const daySchedules = getSchedulesForDate(date);
                const dayWorkOrders = getWorkOrdersForDate(date);
                const hasOverdue = daySchedules.some(s => s.nextDue < new Date());

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`min-h-[100px] p-2 rounded-lg border cursor-pointer transition-all ${
                      isCurrentMonth 
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                        : 'bg-gray-900/50 border-gray-800'
                    } ${isToday ? 'ring-2 ring-purple-600' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        isCurrentMonth ? 'text-white' : 'text-gray-500'
                      }`}>
                        {date.getDate()}
                      </span>
                      {hasOverdue && (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      {daySchedules.slice(0, 2).map((schedule, idx) => {
                        const eq = equipment.find(e => e.id === schedule.equipmentId);
                        return (
                          <div
                            key={idx}
                            className={`text-xs px-1.5 py-0.5 rounded border ${getMaintenanceTypeColor(schedule.type)}`}
                          >
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(schedule.priority)}
                              <span className="truncate">{eq?.assetTag}</span>
                            </div>
                          </div>
                        );
                      })}
                      {daySchedules.length > 2 && (
                        <div className="text-xs text-gray-400 text-center">
                          +{daySchedules.length - 2} more
                        </div>
                      )}
                      {dayWorkOrders.length > 0 && (
                        <div className="text-xs px-1.5 py-0.5 rounded bg-purple-900/20 text-purple-400 border border-purple-600/30">
                          {dayWorkOrders.length} WO
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Upcoming Maintenance</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {schedules
              .filter(s => s.nextDue >= new Date())
              .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime())
              .slice(0, 10)
              .map((schedule) => {
                const eq = equipment.find(e => e.id === schedule.equipmentId);
                const daysUntil = Math.ceil((schedule.nextDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={schedule.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-white">{eq?.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getMaintenanceTypeColor(schedule.type)}`}>
                            {schedule.type}
                          </span>
                          {schedule.priority === Priority.High || schedule.priority === Priority.Emergency ? (
                            <span className={`flex items-center gap-1 text-sm ${
                              schedule.priority === Priority.Emergency ? 'text-red-400' : 'text-orange-400'
                            }`}>
                              {getPriorityIcon(schedule.priority)}
                              {schedule.priority}
                            </span>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Asset</p>
                            <p className="text-gray-300">{eq?.assetTag}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Due Date</p>
                            <p className="text-gray-300">
                              {schedule.nextDue.toLocaleDateString()}
                              <span className={`ml-2 ${daysUntil <= 3 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                ({daysUntil} days)
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Duration</p>
                            <p className="text-gray-300">{schedule.estimatedDuration} hours</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Assigned</p>
                            <p className="text-gray-300">{schedule.assignedTo || 'Unassigned'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Location</p>
                            <p className="text-gray-300">{eq?.location.room}</p>
                          </div>
                        </div>
                        {schedule.requiredParts.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                            <Package className="w-4 h-4" />
                            <span>{schedule.requiredParts.length} parts required</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onCreateWorkOrder(schedule)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Create WO
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {selectedDate.toLocaleDateString('default', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-300"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            {getSchedulesForDate(selectedDate).length === 0 && 
             getWorkOrdersForDate(selectedDate).length === 0 ? (
              <p className="text-gray-400 text-center py-8">No maintenance scheduled for this date</p>
            ) : (
              <>
                {getSchedulesForDate(selectedDate).map((schedule) => {
                  const eq = equipment.find(e => e.id === schedule.equipmentId);
                  return (
                    <div key={schedule.id} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-white mb-1">{eq?.name}</h4>
                          <p className="text-sm text-gray-400 mb-2">{schedule.type} Maintenance</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-300">{schedule.estimatedDuration} hours</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Tool className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-300">{schedule.requiredSkills.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onCreateWorkOrder(schedule)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors"
                        >
                          Schedule
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}