'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ClipboardCheck,
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Square,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Flag
} from 'lucide-react';
import {
  Task,
  TaskPriority,
  TaskCategory,
  Department,
  EmployeeRole
} from '@/lib/workforce/workforce-types';

// Mock tasks data
const mockTasks: (Task & { assignedTo?: string, employeeName?: string, status: 'pending' | 'in_progress' | 'completed' | 'overdue' })[] = [
  {
    id: '1',
    title: 'Water Flower Room 1',
    description: 'Complete watering cycle for all plants in Flower Room 1',
    estimatedMinutes: 45,
    actualMinutes: 50,
    priority: TaskPriority.HIGH,
    category: TaskCategory.WATERING,
    requiredSkills: [],
    assignedTo: '1',
    employeeName: 'Sarah Johnson',
    roomId: 'flower-1',
    status: 'completed',
    completedAt: new Date('2024-01-22T10:30:00'),
    completedBy: '1',
    checklist: [
      { id: '1', text: 'Check pH levels', completed: true, completedAt: new Date(), completedBy: '1' },
      { id: '2', text: 'Adjust nutrient solution', completed: true, completedAt: new Date(), completedBy: '1' },
      { id: '3', text: 'Water all plants', completed: true, completedAt: new Date(), completedBy: '1' },
      { id: '4', text: 'Record readings', completed: true, completedAt: new Date(), completedBy: '1' }
    ]
  },
  {
    id: '2',
    title: 'IPM Inspection - All Rooms',
    description: 'Conduct weekly IPM inspection across all cultivation rooms',
    estimatedMinutes: 120,
    priority: TaskPriority.CRITICAL,
    category: TaskCategory.IPM,
    requiredSkills: [],
    assignedTo: '3',
    employeeName: 'Jessica Martinez',
    status: 'in_progress',
    checklist: [
      { id: '1', text: 'Visual inspection for pests', completed: true, completedAt: new Date(), completedBy: '3' },
      { id: '2', text: 'Check sticky traps', completed: true, completedAt: new Date(), completedBy: '3' },
      { id: '3', text: 'Document findings', completed: false },
      { id: '4', text: 'Apply treatments if needed', completed: false }
    ]
  },
  {
    id: '3',
    title: 'Prune Veg Room Plants',
    description: 'Pruning and training for vegetative plants',
    estimatedMinutes: 90,
    priority: TaskPriority.MEDIUM,
    category: TaskCategory.PRUNING,
    requiredSkills: [],
    assignedTo: '2',
    employeeName: 'Mike Chen',
    roomId: 'veg-1',
    status: 'pending',
    checklist: [
      { id: '1', text: 'Sanitize tools', completed: false },
      { id: '2', text: 'Prune lower branches', completed: false },
      { id: '3', text: 'LST training', completed: false },
      { id: '4', text: 'Clean work area', completed: false }
    ]
  },
  {
    id: '4',
    title: 'Feed Clone Room',
    description: 'Nutrient feeding for clone propagation area',
    estimatedMinutes: 30,
    priority: TaskPriority.HIGH,
    category: TaskCategory.FEEDING,
    requiredSkills: [],
    assignedTo: '2',
    employeeName: 'Mike Chen',
    roomId: 'clone-1',
    status: 'overdue',
    checklist: [
      { id: '1', text: 'Prepare nutrient solution', completed: false },
      { id: '2', text: 'Check EC/pH', completed: false },
      { id: '3', text: 'Feed all trays', completed: false }
    ]
  },
  {
    id: '5',
    title: 'Harvest Flower Room 2 - Section A',
    description: 'Harvest mature plants from designated section',
    estimatedMinutes: 180,
    priority: TaskPriority.CRITICAL,
    category: TaskCategory.HARVESTING,
    requiredSkills: [],
    assignedTo: '1',
    employeeName: 'Sarah Johnson',
    roomId: 'flower-2',
    status: 'pending',
    checklist: [
      { id: '1', text: 'Prepare harvest tools', completed: false },
      { id: '2', text: 'Cut plants at base', completed: false },
      { id: '3', text: 'Hang in drying room', completed: false },
      { id: '4', text: 'Update harvest log', completed: false }
    ]
  }
];

export default function TasksPage() {
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    
    return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
  });

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL: return 'bg-red-500/20 text-red-400 border-red-500/30';
      case TaskPriority.HIGH: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case TaskPriority.MEDIUM: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case TaskPriority.LOW: return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case TaskCategory.WATERING: return '💧';
      case TaskCategory.FEEDING: return '🍽️';
      case TaskCategory.PRUNING: return '✂️';
      case TaskCategory.TRANSPLANTING: return '🌱';
      case TaskCategory.IPM: return '🐛';
      case TaskCategory.HARVESTING: return '🌾';
      case TaskCategory.DRYING: return '🌬️';
      case TaskCategory.CURING: return '📦';
      case TaskCategory.TRIMMING: return '✂️';
      case TaskCategory.PACKAGING: return '📦';
      case TaskCategory.CLEANING: return '🧹';
      case TaskCategory.MAINTENANCE: return '🔧';
      case TaskCategory.QUALITY_CHECK: return '🔍';
      default: return '📋';
    }
  };

  const getTaskProgress = (task: Task & { status: string }) => {
    if (!task.checklist) return 0;
    const completed = task.checklist.filter(item => item.completed).length;
    return Math.round((completed / task.checklist.length) * 100);
  };

  const taskStats = {
    total: mockTasks.length,
    pending: mockTasks.filter(t => t.status === 'pending').length,
    inProgress: mockTasks.filter(t => t.status === 'in_progress').length,
    completed: mockTasks.filter(t => t.status === 'completed').length,
    overdue: mockTasks.filter(t => t.status === 'overdue').length
  };

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
                <h1 className="text-2xl font-bold">Task Management</h1>
                <p className="text-gray-400">Assign and track cultivation tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{taskStats.total}</div>
            <div className="text-sm text-gray-400">Total Tasks</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-400">{taskStats.pending}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">{taskStats.inProgress}</div>
            <div className="text-sm text-gray-400">In Progress</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{taskStats.completed}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">{taskStats.overdue}</div>
            <div className="text-sm text-gray-400">Overdue</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-800 rounded-lg">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Priorities</option>
                {Object.values(TaskPriority).map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TaskCategory | 'all')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {Object.values(TaskCategory).map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer"
              onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-3">{task.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    {task.assignedTo && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{task.employeeName}</span>
                      </div>
                    )}
                    {task.roomId && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{task.roomId}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{task.estimatedMinutes}min est.</span>
                      {task.actualMinutes && (
                        <span className="text-green-400">({task.actualMinutes}min actual)</span>
                      )}
                    </div>
                    {task.checklist && (
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4" />
                        <span>{getTaskProgress(task)}% complete</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {task.status === 'pending' && (
                    <button className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <>
                      <button className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors">
                        <Pause className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Task Progress Bar */}
              {task.checklist && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${getTaskProgress(task)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Expanded Task Details */}
              {selectedTask === task.id && task.checklist && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h4 className="font-semibold mb-4">Task Checklist</h4>
                  <div className="space-y-3">
                    {task.checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => {}}
                          className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                        />
                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                          {item.text}
                        </span>
                        {item.completed && item.completedAt && (
                          <span className="text-xs text-gray-500">
                            {item.completedAt.toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || selectedPriority !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'
              }
            </p>
            <button className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
              Create Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}