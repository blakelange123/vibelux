'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  Zap,
  TrendingUp,
  BarChart3,
  FileText,
  Settings,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  Lightbulb,
  Droplets,
  Scissors,
  Bug,
  Camera,
  X
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'lighting' | 'irrigation' | 'maintenance' | 'harvest' | 'ipm';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignedTo?: string;
  room: string;
  dueDate: Date;
  estimatedTime: number; // minutes
  actualTime?: number;
  environmentalTrigger?: {
    parameter: string;
    condition: string;
    value: number;
  };
  completionNotes?: string;
  images?: string[];
}

interface WorkerProductivity {
  name: string;
  tasksCompleted: number;
  avgCompletionTime: number;
  qualityScore: number;
  efficiency: number;
}

export function TaskAutomation() {
  const [selectedView, setSelectedView] = useState<'tasks' | 'schedule' | 'analytics'>('tasks');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);

  // Sample tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Adjust Light Height - Row 3',
      description: 'Plants reaching canopy limit. Raise lights 6 inches.',
      type: 'lighting',
      priority: 'high',
      status: 'pending',
      room: 'Flower A',
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
      estimatedTime: 20,
      environmentalTrigger: {
        parameter: 'Canopy Height',
        condition: '>',
        value: 36
      }
    },
    {
      id: 'task-2',
      title: 'Check pH Dosing Pump',
      description: 'pH drift detected in Tank B. Verify pump operation.',
      type: 'irrigation',
      priority: 'critical',
      status: 'in-progress',
      assignedTo: 'John D.',
      room: 'Nutrient Room',
      dueDate: new Date(Date.now() + 30 * 60 * 1000),
      estimatedTime: 15,
      environmentalTrigger: {
        parameter: 'pH Drift',
        condition: '>',
        value: 0.3
      }
    },
    {
      id: 'task-3',
      title: 'Weekly IPM Inspection',
      description: 'Inspect all plants in Veg room for pests/disease.',
      type: 'ipm',
      priority: 'medium',
      status: 'pending',
      room: 'Veg Room',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      estimatedTime: 45
    },
    {
      id: 'task-4',
      title: 'Clean Light Reflectors',
      description: 'Monthly cleaning due. 15% efficiency loss detected.',
      type: 'maintenance',
      priority: 'medium',
      status: 'pending',
      room: 'Flower B',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      estimatedTime: 120,
      environmentalTrigger: {
        parameter: 'Light Output',
        condition: '<',
        value: 85
      }
    }
  ]);

  // Worker productivity data
  const workerStats: WorkerProductivity[] = [
    { name: 'John D.', tasksCompleted: 45, avgCompletionTime: 18, qualityScore: 94, efficiency: 112 },
    { name: 'Sarah M.', tasksCompleted: 52, avgCompletionTime: 22, qualityScore: 96, efficiency: 98 },
    { name: 'Mike R.', tasksCompleted: 38, avgCompletionTime: 25, qualityScore: 91, efficiency: 85 },
    { name: 'Lisa K.', tasksCompleted: 41, avgCompletionTime: 20, qualityScore: 93, efficiency: 95 }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
    }
  };

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'lighting': return <Lightbulb className="w-4 h-4" />;
      case 'irrigation': return <Droplets className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'harvest': return <Scissors className="w-4 h-4" />;
      case 'ipm': return <Bug className="w-4 h-4" />;
    }
  };

  const getTimeUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return 'Overdue';
    if (hours > 24) return `${Math.floor(hours / 24)}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Task Automation & Management</h2>
          <p className="text-gray-400">Environment-driven task generation</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutomationEnabled(!automationEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              automationEnabled
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {automationEnabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            Auto-Generate: {automationEnabled ? 'ON' : 'OFF'}
          </button>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Rooms</option>
            <option value="flower-a">Flower A</option>
            <option value="flower-b">Flower B</option>
            <option value="veg">Veg Room</option>
          </select>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {['tasks', 'schedule', 'analytics'].map((view) => (
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

      {selectedView === 'tasks' && (
        <>
          {/* Task Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Pending</span>
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {tasks.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">In Progress</span>
                <RefreshCw className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Critical</span>
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {tasks.filter(t => t.priority === 'critical').length}
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Today\'s Hours</span>
                <Clock className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {(tasks.reduce((sum, t) => sum + t.estimatedTime, 0) / 60).toFixed(1)}
              </p>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">Active Tasks</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {tasks
                .filter(t => selectedRoom === 'all' || t.room.toLowerCase().includes(selectedRoom.replace('-', ' ')))
                .sort((a, b) => {
                  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)}`}>
                      {getTaskIcon(task.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-white">{task.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                          {task.environmentalTrigger && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <Zap className="w-3 h-3" />
                              Auto-generated: {task.environmentalTrigger.parameter} {task.environmentalTrigger.condition} {task.environmentalTrigger.value}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            task.status === 'overdue' ? 'text-red-400' : 'text-gray-300'
                          }`}>
                            {mounted ? getTimeUntilDue(task.dueDate) : '...'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{task.room}</p>
                          {task.assignedTo && (
                            <p className="text-xs text-purple-400 mt-1">{task.assignedTo}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-gray-500">
                          Est: {task.estimatedTime} min
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'pending' ? 'bg-gray-700 text-gray-300' :
                          task.status === 'in-progress' ? 'bg-blue-900/20 text-blue-400' :
                          task.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                          'bg-red-900/20 text-red-400'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedView === 'analytics' && (
        <>
          {/* Worker Productivity */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Worker Productivity</h3>
            <div className="space-y-4">
              {workerStats.map((worker, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{worker.name}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">Tasks: {worker.tasksCompleted}</span>
                      <span className={`font-medium ${
                        worker.efficiency > 100 ? 'text-green-400' : 
                        worker.efficiency > 90 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {worker.efficiency}% Efficiency
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Avg Time</p>
                      <p className="text-white font-medium">{worker.avgCompletionTime} min</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quality Score</p>
                      <p className="text-white font-medium">{worker.qualityScore}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Completed/Week</p>
                      <p className="text-white font-medium">{Math.round(worker.tasksCompleted / 4)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Insights */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Task Distribution by Type</h3>
              <div className="space-y-3">
                {['lighting', 'irrigation', 'maintenance', 'harvest', 'ipm'].map((type) => {
                  const count = tasks.filter(t => t.type === type).length;
                  const percentage = (count / tasks.length) * 100;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300 capitalize">{type}</span>
                        <span className="text-sm text-gray-400">{count} tasks</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Environment-Triggered Tasks</h3>
              <div className="space-y-3">
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-300">Auto-Generated Today</span>
                    <span className="text-2xl font-bold text-white">12</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Saved 3.2 hours of manual inspection time
                  </p>
                </div>
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-300">Prevented Issues</span>
                    <span className="text-2xl font-bold text-white">4</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Early detection saved potential crop loss
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-4">
          <button 
            onClick={() => setShowPhotoModal(true)}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            <Camera className="w-5 h-5 text-purple-400 mb-2" />
            <p className="font-medium text-white">Photo Check-In</p>
            <p className="text-xs text-gray-400">Document task completion</p>
          </button>
          <button 
            onClick={() => setShowReportModal(true)}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            <FileText className="w-5 h-5 text-blue-400 mb-2" />
            <p className="font-medium text-white">Generate Report</p>
            <p className="text-xs text-gray-400">Daily task summary</p>
          </button>
          <button 
            onClick={() => setShowAssignModal(true)}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            <Users className="w-5 h-5 text-green-400 mb-2" />
            <p className="font-medium text-white">Assign Tasks</p>
            <p className="text-xs text-gray-400">Optimize workload</p>
          </button>
          <button 
            onClick={() => setShowConfigModal(true)}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            <Settings className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="font-medium text-white">Configure Triggers</p>
            <p className="text-xs text-gray-400">Set automation rules</p>
          </button>
        </div>
      </div>

      {/* Photo Check-In Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Photo Check-In</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Click to upload photo or drag and drop</p>
                <input type="file" accept="image/*" className="hidden" />
              </div>
              <textarea
                placeholder="Add completion notes..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none"
                rows={3}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Photo check-in completed!');
                    setShowPhotoModal(false);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Submit Check-In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Generate Task Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>Daily Task Summary</option>
                  <option>Weekly Performance Report</option>
                  <option>Worker Productivity Analysis</option>
                  <option>Environmental Trigger Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                  <input type="date" className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Report generated successfully!');
                    setShowReportModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Tasks Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Assign Tasks</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Worker</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>John D.</option>
                  <option>Sarah M.</option>
                  <option>Mike R.</option>
                  <option>Lisa K.</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Available Tasks</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tasks.filter(t => t.status === 'pending' && !t.assignedTo).map(task => (
                    <label key={task.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700">
                      <input type="checkbox" className="rounded" />
                      <div className="flex-1">
                        <p className="text-sm text-white">{task.title}</p>
                        <p className="text-xs text-gray-400">{task.room} - {task.estimatedTime} min</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Tasks assigned successfully!');
                    setShowAssignModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Assign Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configure Triggers Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Configure Automation Triggers</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Parameter</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>Temperature</option>
                  <option>Humidity</option>
                  <option>pH Level</option>
                  <option>Light Intensity</option>
                  <option>Canopy Height</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                  <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option>Greater than</option>
                    <option>Less than</option>
                    <option>Equals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Value</label>
                  <input type="number" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
                <input
                  type="text"
                  placeholder="e.g., Adjust light height, Check pH pump"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Automation trigger configured!');
                    setShowConfigModal(false);
                  }}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Save Trigger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}