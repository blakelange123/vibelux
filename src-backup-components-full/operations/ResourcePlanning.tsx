'use client';

import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Plus,
  Minus,
  BarChart3,
  Target,
  Activity,
  DollarSign,
  Layers,
  UserCheck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StaffMember {
  id: string;
  name: string;
  role: 'grower' | 'technician' | 'manager' | 'assistant';
  skills: string[];
  availability: 'available' | 'busy' | 'off';
  currentTask?: string;
  efficiency: number;
  hoursWorked: number;
  tasksCompleted: number;
}

interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  requiredStaff: {
    grower: number;
    technician: number;
    assistant: number;
  };
  assignedStaff: string[];
  tasks: string[];
}

interface ResourceAllocation {
  room: string;
  phase: 'clone' | 'veg' | 'flower' | 'harvest';
  laborHours: number;
  waterUsage: number;
  nutrientCost: number;
  energyUsage: number;
}

export function ResourcePlanning() {
  const [selectedView, setSelectedView] = useState<'schedule' | 'staff' | 'allocation' | 'forecast'>('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sample staff data
  const staff: StaffMember[] = [
    {
      id: 'staff-1',
      name: 'John Davis',
      role: 'grower',
      skills: ['IPM', 'Nutrients', 'Cloning'],
      availability: 'available',
      currentTask: 'Flower Room A - Defoliation',
      efficiency: 115,
      hoursWorked: 32,
      tasksCompleted: 45
    },
    {
      id: 'staff-2',
      name: 'Sarah Miller',
      role: 'technician',
      skills: ['HVAC', 'Electrical', 'Irrigation'],
      availability: 'busy',
      currentTask: 'Fixing pH dosing pump',
      efficiency: 98,
      hoursWorked: 35,
      tasksCompleted: 52
    },
    {
      id: 'staff-3',
      name: 'Mike Roberts',
      role: 'assistant',
      skills: ['Harvesting', 'Trimming', 'Packaging'],
      availability: 'available',
      efficiency: 92,
      hoursWorked: 28,
      tasksCompleted: 38
    },
    {
      id: 'staff-4',
      name: 'Lisa Kim',
      role: 'manager',
      skills: ['Scheduling', 'Quality Control', 'Training'],
      availability: 'available',
      efficiency: 105,
      hoursWorked: 40,
      tasksCompleted: 62
    }
  ];

  // Sample resource allocation
  const resourceAllocations: ResourceAllocation[] = [
    { room: 'Clone Room', phase: 'clone', laborHours: 4, waterUsage: 50, nutrientCost: 25, energyUsage: 120 },
    { room: 'Veg A', phase: 'veg', laborHours: 8, waterUsage: 200, nutrientCost: 150, energyUsage: 450 },
    { room: 'Veg B', phase: 'veg', laborHours: 8, waterUsage: 180, nutrientCost: 140, energyUsage: 430 },
    { room: 'Flower A', phase: 'flower', laborHours: 12, waterUsage: 350, nutrientCost: 280, energyUsage: 850 },
    { room: 'Flower B', phase: 'flower', laborHours: 12, waterUsage: 320, nutrientCost: 260, energyUsage: 820 }
  ];

  // Labor forecast data
  const laborForecast = [
    { week: 'W1', actual: 280, planned: 300, tasks: 85 },
    { week: 'W2', actual: 295, planned: 300, tasks: 92 },
    { week: 'W3', actual: 310, planned: 300, tasks: 95 },
    { week: 'W4', actual: 290, planned: 300, tasks: 88 },
    { week: 'W5', planned: 320, projected: true },
    { week: 'W6', planned: 340, projected: true }
  ];

  // Resource distribution for pie chart
  const resourceDistribution = [
    { name: 'Labor', value: 45, color: '#8B5CF6' },
    { name: 'Energy', value: 25, color: '#3B82F6' },
    { name: 'Water', value: 10, color: '#06B6D4' },
    { name: 'Nutrients', value: 15, color: '#10B981' },
    { name: 'Other', value: 5, color: '#6B7280' }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'grower': return 'text-green-400 bg-green-900/20';
      case 'technician': return 'text-blue-400 bg-blue-900/20';
      case 'manager': return 'text-purple-400 bg-purple-900/20';
      case 'assistant': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'busy': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'off': return <Minus className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const totalLaborHours = resourceAllocations.reduce((sum, r) => sum + r.laborHours, 0);
  const totalWaterUsage = resourceAllocations.reduce((sum, r) => sum + r.waterUsage, 0);
  const totalNutrientCost = resourceAllocations.reduce((sum, r) => sum + r.nutrientCost, 0);
  const totalEnergyUsage = resourceAllocations.reduce((sum, r) => sum + r.energyUsage, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Resource Planning</h2>
          <p className="text-gray-400">Optimize labor and resource allocation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          <Calendar className="w-4 h-4" />
          Schedule Optimizer
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {['schedule', 'staff', 'allocation', 'forecast'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === view
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {selectedView === 'schedule' && (
        <>
          {/* Weekly Schedule Overview */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Schedule</h3>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div key={day} className="text-center">
                  <p className="text-sm text-gray-400 mb-2">{day}</p>
                  <div className={`bg-gray-800 rounded-lg p-4 border ${
                    idx === new Date().getDay() - 1 ? 'border-purple-600' : 'border-gray-700'
                  }`}>
                    <p className="text-xl font-bold text-white">{12 + idx}</p>
                    <p className="text-xs text-gray-400">tasks</p>
                    <div className="mt-2">
                      <p className="text-sm text-green-400">{3 + (idx % 2)}</p>
                      <p className="text-xs text-gray-500">staff</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Task Distribution */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Today's Tasks</h3>
              <div className="space-y-3">
                {[
                  { time: '8:00 AM', task: 'Morning inspection - All rooms', staff: 2, urgent: false },
                  { time: '9:00 AM', task: 'Nutrient mixing - Flower rooms', staff: 1, urgent: true },
                  { time: '10:00 AM', task: 'Defoliation - Flower A', staff: 3, urgent: false },
                  { time: '2:00 PM', task: 'IPM application - Veg rooms', staff: 2, urgent: true },
                  { time: '4:00 PM', task: 'Data collection & logging', staff: 1, urgent: false }
                ].map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">{task.time}</span>
                      <div>
                        <p className="text-white font-medium">{task.task}</p>
                        <p className="text-xs text-gray-500">{task.staff} staff required</p>
                      </div>
                    </div>
                    {task.urgent && (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Staff Availability</h3>
              <div className="space-y-2">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-xs text-gray-400">{member.currentTask || 'Available'}</p>
                      </div>
                    </div>
                    {getAvailabilityIcon(member.availability)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedView === 'staff' && (
        <>
          {/* Staff Performance Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Staff</span>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{staff.length}</p>
              <p className="text-sm text-gray-500">3 available</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Avg Efficiency</span>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {(staff.reduce((sum, s) => sum + s.efficiency, 0) / staff.length).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-500">+5% this week</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Tasks Today</span>
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {staff.reduce((sum, s) => sum + s.tasksCompleted, 0)}
              </p>
              <p className="text-sm text-gray-500">Above target</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Labor Cost</span>
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">$2,450</p>
              <p className="text-sm text-gray-500">This week</p>
            </div>
          </div>

          {/* Staff Details */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Staff Performance</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {staff.map((member) => (
                <div key={member.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{member.name}</h4>
                        <p className={`text-sm mt-1 inline-flex px-2 py-0.5 rounded-full ${getRoleColor(member.role)}`}>
                          {member.role}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {member.skills.map((skill, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        {getAvailabilityIcon(member.availability)}
                        <span className="text-sm text-gray-400">{member.availability}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="text-gray-400">Efficiency:</span>{' '}
                          <span className={`font-medium ${
                            member.efficiency > 100 ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {member.efficiency}%
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-400">Hours:</span>{' '}
                          <span className="text-white">{member.hoursWorked}h</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-400">Tasks:</span>{' '}
                          <span className="text-white">{member.tasksCompleted}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedView === 'allocation' && (
        <>
          {/* Resource Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Labor Hours</span>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{totalLaborHours}h</p>
              <p className="text-sm text-gray-500">Daily allocation</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Water Usage</span>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{totalWaterUsage}L</p>
              <p className="text-sm text-gray-500">Daily average</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Nutrient Cost</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">${totalNutrientCost}</p>
              <p className="text-sm text-gray-500">Daily spend</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Energy Use</span>
                <BarChart3 className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">{totalEnergyUsage}kWh</p>
              <p className="text-sm text-gray-500">Daily total</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Room Allocation Table */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Resource by Room</h3>
              <div className="space-y-3">
                {resourceAllocations.map((allocation, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{allocation.room}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        allocation.phase === 'flower' ? 'bg-purple-900/20 text-purple-400' :
                        allocation.phase === 'veg' ? 'bg-green-900/20 text-green-400' :
                        'bg-blue-900/20 text-blue-400'
                      }`}>
                        {allocation.phase}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Labor:</span>
                        <span className="text-white ml-1">{allocation.laborHours}h</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Water:</span>
                        <span className="text-white ml-1">{allocation.waterUsage}L</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Nutrients:</span>
                        <span className="text-white ml-1">${allocation.nutrientCost}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Energy:</span>
                        <span className="text-white ml-1">{allocation.energyUsage}kWh</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Distribution Pie Chart */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Cost Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resourceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {resourceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => `${value}%`}
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {resourceDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-300">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedView === 'forecast' && (
        <>
          {/* Labor Forecast Chart */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">6-Week Labor Forecast</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={laborForecast}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                    name="Actual Hours"
                  />
                  <Line
                    type="monotone"
                    dataKey="planned"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#8B5CF6' }}
                    name="Planned Hours"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Insights */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Peaks</h3>
              <div className="space-y-3">
                <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-yellow-300">Harvest Week</h4>
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-sm text-gray-300">Week 5: +20% labor requirement</p>
                  <p className="text-xs text-gray-400 mt-1">Recommend scheduling 2 additional trimmers</p>
                </div>
                <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-300">Transplant Day</h4>
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-300">Week 6: Veg room transition</p>
                  <p className="text-xs text-gray-400 mt-1">4 staff needed for 6 hours</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Resource Optimization</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Predicted Efficiency Gain</span>
                  <span className="text-green-400 font-medium">+12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cost Savings Potential</span>
                  <span className="text-green-400 font-medium">$3,200/mo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Recommended Staff Adjustment</span>
                  <span className="text-blue-400 font-medium">+1 PT</span>
                </div>
                <button className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                  Generate Optimization Report
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}