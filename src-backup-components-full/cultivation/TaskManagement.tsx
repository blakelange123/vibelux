'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  Plus,
  Filter,
  Droplets,
  Scissors,
  Leaf,
  Package,
  FlaskConical,
  ThermometerSun,
  Eye,
  Repeat,
  BarChart3
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'watering' | 'pruning' | 'transplant' | 'harvest' | 'ipm' | 'feeding' | 'environmental' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  zone: string;
  assignedTo: string[];
  dueDate: Date;
  completedDate?: Date;
  recurringSchedule?: string;
  notes?: string;
  checklist?: ChecklistItem[];
}

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'overdue'>('today');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'John Doe', role: 'Head Grower' },
    { id: '2', name: 'Jane Smith', role: 'Cultivation Tech' },
    { id: '3', name: 'Mike Johnson', role: 'IPM Specialist' },
    { id: '4', name: 'Sarah Williams', role: 'Harvest Manager' }
  ]);

  // Initialize sample tasks
  useEffect(() => {
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Morning Watering - Veg Room 1',
        description: 'Water all plants in vegetative room 1. Check for any signs of stress.',
        type: 'watering',
        priority: 'high',
        status: 'pending',
        zone: 'veg-1',
        assignedTo: ['2'],
        dueDate: new Date(),
        recurringSchedule: 'Daily',
        checklist: [
          { id: '1-1', task: 'Check soil moisture levels', completed: false },
          { id: '1-2', task: 'Adjust pH if needed', completed: false },
          { id: '1-3', task: 'Record water volume used', completed: false }
        ]
      },
      {
        id: '2',
        title: 'Defoliation - Flower Room A',
        description: 'Remove lower fan leaves and any dead foliage. Focus on improving airflow.',
        type: 'pruning',
        priority: 'medium',
        status: 'in-progress',
        zone: 'flower-a',
        assignedTo: ['1', '2'],
        dueDate: new Date(),
        checklist: [
          { id: '2-1', task: 'Sanitize tools', completed: true },
          { id: '2-2', task: 'Remove lower 1/3 fan leaves', completed: false },
          { id: '2-3', task: 'Check for pest/disease', completed: false }
        ]
      },
      {
        id: '3',
        title: 'IPM Inspection - All Rooms',
        description: 'Weekly integrated pest management inspection. Document any findings.',
        type: 'ipm',
        priority: 'high',
        status: 'pending',
        zone: 'all',
        assignedTo: ['3'],
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        recurringSchedule: 'Weekly',
        checklist: [
          { id: '3-1', task: 'Check sticky traps', completed: false },
          { id: '3-2', task: 'Inspect canopy for pests', completed: false },
          { id: '3-3', task: 'Apply preventive treatment', completed: false }
        ]
      },
      {
        id: '4',
        title: 'Nutrient Solution Change - Flower Room B',
        description: 'Complete reservoir change and prepare fresh nutrient solution.',
        type: 'feeding',
        priority: 'critical',
        status: 'overdue',
        zone: 'flower-b',
        assignedTo: ['1'],
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        notes: 'EC target: 1.8, pH target: 5.8'
      },
      {
        id: '5',
        title: 'Harvest - Flower Room A (Row 3-4)',
        description: 'Harvest mature plants in rows 3-4. Follow SOP for drying preparation.',
        type: 'harvest',
        priority: 'high',
        status: 'pending',
        zone: 'flower-a',
        assignedTo: ['4', '2'],
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        checklist: [
          { id: '5-1', task: 'Check trichomes (30% amber)', completed: false },
          { id: '5-2', task: 'Prepare drying room', completed: false },
          { id: '5-3', task: 'Document wet weights', completed: false }
        ]
      }
    ];
    setTasks(sampleTasks);
  }, []);

  // Filter tasks based on selection
  useEffect(() => {
    let filtered = tasks;

    // Zone filter
    if (selectedZone !== 'all') {
      filtered = filtered.filter(task => task.zone === selectedZone || task.zone === 'all');
    }

    // Time filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    switch (selectedFilter) {
      case 'today':
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.dueDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });
        break;
      case 'week':
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= today && taskDate <= weekFromNow;
        });
        break;
      case 'overdue':
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate < today && task.status !== 'completed';
        });
        break;
    }

    setFilteredTasks(filtered);
  }, [tasks, selectedFilter, selectedZone]);

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'watering': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'pruning': return <Scissors className="w-5 h-5 text-green-400" />;
      case 'transplant': return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'harvest': return <Package className="w-5 h-5 text-amber-400" />;
      case 'ipm': return <Eye className="w-5 h-5 text-red-400" />;
      case 'feeding': return <FlaskConical className="w-5 h-5 text-purple-400" />;
      case 'environmental': return <ThermometerSun className="w-5 h-5 text-orange-400" />;
      case 'inspection': return <Eye className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-900/50';
      case 'high': return 'text-orange-500 bg-orange-900/50';
      case 'medium': return 'text-yellow-500 bg-yellow-900/50';
      case 'low': return 'text-green-500 bg-green-900/50';
    }
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status, completedDate: status === 'completed' ? new Date() : undefined }
        : task
    ));
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.checklist) {
        const updatedChecklist = task.checklist.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...task, checklist: updatedChecklist };
      }
      return task;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Cultivation Tasks</h1>
            <p className="text-gray-400">Manage daily operations and workflows</p>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedFilter === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setSelectedFilter('today')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedFilter === 'today' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedFilter('week')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedFilter === 'week' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedFilter('overdue')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedFilter === 'overdue' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Overdue
            </button>
          </div>

          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
          >
            <option value="all">All Zones</option>
            <option value="flower-a">Flower Room A</option>
            <option value="flower-b">Flower Room B</option>
            <option value="veg-1">Veg Room 1</option>
            <option value="clone">Clone Room</option>
          </select>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</p>
                <p className="text-sm text-gray-400">Pending</p>
              </div>
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in-progress').length}</p>
                <p className="text-sm text-gray-400">In Progress</p>
              </div>
              <Repeat className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'overdue').length}</p>
                <p className="text-sm text-gray-400">Overdue</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div key={task.id} className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {getTaskIcon(task.type)}
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{task.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">Zone: {task.zone}</span>
                      {task.recurringSchedule && (
                        <span className="text-gray-500 flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          {task.recurringSchedule}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {task.assignedTo.map(memberId => {
                      const member = teamMembers.find(m => m.id === memberId);
                      return member ? (
                        <div
                          key={memberId}
                          className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium border-2 border-gray-900"
                          title={member.name}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      ) : null;
                    })}
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      task.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                      task.status === 'in-progress' ? 'bg-blue-900/50 text-blue-400' :
                      task.status === 'overdue' ? 'bg-red-900/50 text-red-400' :
                      'bg-gray-800 text-gray-300'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Checklist */}
              {task.checklist && task.checklist.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-400 mb-2">Checklist:</p>
                  {task.checklist.map(item => (
                    <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(task.id, item.id)}
                        className="rounded border-gray-600 bg-gray-800 text-purple-600"
                      />
                      <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                        {item.task}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Notes */}
              {task.notes && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-300">{task.notes}</p>
                </div>
              )}

              {/* Due Date */}
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Due: {task.dueDate.toLocaleDateString()}</span>
                {task.completedDate && (
                  <span className="ml-4">Completed: {task.completedDate.toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks found for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}