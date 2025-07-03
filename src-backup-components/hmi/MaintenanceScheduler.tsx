'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Tool, AlertTriangle, CheckCircle, 
  Plus, Edit2, Trash2, FileText, Download, Filter,
  User, BarChart3, TrendingUp, AlertCircle, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  title: string;
  description: string;
  type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  scheduledDate: Date;
  completedDate?: Date;
  dueDate: Date;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  assignedTo?: string;
  completedBy?: string;
  notes?: string;
  checklist?: ChecklistItem[];
  parts?: MaintenancePart[];
  cost?: number;
  recurrence?: RecurrenceRule;
  lastPerformed?: Date;
}

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  notes?: string;
}

interface MaintenancePart {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  supplier?: string;
}

interface RecurrenceRule {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'hours' | 'cycles';
  interval: number;
  endDate?: Date;
}

interface MaintenanceHistory {
  id: string;
  taskId: string;
  performedDate: Date;
  performedBy: string;
  duration: number;
  notes: string;
  partsUsed: MaintenancePart[];
  totalCost: number;
}

interface MaintenanceSchedulerProps {
  equipmentList: Array<{ id: string; name: string; type: string }>;
  onTaskUpdate?: (task: MaintenanceTask) => void;
}

export function MaintenanceScheduler({ equipmentList, onTaskUpdate }: MaintenanceSchedulerProps) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [history, setHistory] = useState<MaintenanceHistory[]>([]);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterEquipment, setFilterEquipment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  // Sample maintenance templates
  const maintenanceTemplates = {
    'HVAC': [
      { title: 'Filter Replacement', interval: 30, type: 'preventive', duration: 30 },
      { title: 'Coil Cleaning', interval: 90, type: 'preventive', duration: 120 },
      { title: 'Belt Inspection', interval: 60, type: 'preventive', duration: 45 },
      { title: 'Refrigerant Check', interval: 180, type: 'preventive', duration: 90 }
    ],
    'Lighting': [
      { title: 'Bulb Replacement', interval: 365, type: 'preventive', duration: 20 },
      { title: 'Driver Testing', interval: 180, type: 'preventive', duration: 30 },
      { title: 'Fixture Cleaning', interval: 90, type: 'preventive', duration: 45 }
    ],
    'Irrigation': [
      { title: 'Valve Inspection', interval: 30, type: 'preventive', duration: 60 },
      { title: 'Line Flushing', interval: 90, type: 'preventive', duration: 90 },
      { title: 'Pump Maintenance', interval: 180, type: 'preventive', duration: 120 },
      { title: 'Sensor Calibration', interval: 60, type: 'preventive', duration: 45 }
    ]
  };

  // Check for overdue tasks
  useEffect(() => {
    const checkOverdueTasks = () => {
      const now = new Date();
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.status === 'scheduled' && new Date(task.dueDate) < now) {
            return { ...task, status: 'overdue' as const };
          }
          return task;
        })
      );
    };

    checkOverdueTasks();
    const interval = setInterval(checkOverdueTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Generate next maintenance date based on recurrence
  const getNextMaintenanceDate = (lastDate: Date, recurrence: RecurrenceRule): Date => {
    const next = new Date(lastDate);
    
    switch (recurrence.type) {
      case 'daily':
        next.setDate(next.getDate() + recurrence.interval);
        break;
      case 'weekly':
        next.setDate(next.getDate() + (recurrence.interval * 7));
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + recurrence.interval);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + recurrence.interval);
        break;
      case 'hours':
        next.setHours(next.getHours() + recurrence.interval);
        break;
    }
    
    return next;
  };

  // Create maintenance task
  const createTask = (taskData: Partial<MaintenanceTask>) => {
    const newTask: MaintenanceTask = {
      id: `task-${Date.now()}`,
      equipmentId: taskData.equipmentId || '',
      equipmentName: equipmentList.find(e => e.id === taskData.equipmentId)?.name || '',
      title: taskData.title || '',
      description: taskData.description || '',
      type: taskData.type || 'preventive',
      priority: taskData.priority || 'medium',
      status: 'scheduled',
      scheduledDate: taskData.scheduledDate || new Date(),
      dueDate: taskData.dueDate || new Date(),
      estimatedDuration: taskData.estimatedDuration || 60,
      checklist: taskData.checklist || [],
      parts: taskData.parts || [],
      recurrence: taskData.recurrence,
      ...taskData
    };

    setTasks(prev => [...prev, newTask]);
    onTaskUpdate?.(newTask);
    return newTask;
  };

  // Complete maintenance task
  const completeTask = (taskId: string, completionData: {
    actualDuration: number;
    completedBy: string;
    notes: string;
    partsUsed: MaintenancePart[];
  }) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Update task
    const completedTask = {
      ...task,
      status: 'completed' as const,
      completedDate: new Date(),
      actualDuration: completionData.actualDuration,
      completedBy: completionData.completedBy,
      notes: completionData.notes
    };

    setTasks(prev => prev.map(t => t.id === taskId ? completedTask : t));

    // Add to history
    const historyEntry: MaintenanceHistory = {
      id: `history-${Date.now()}`,
      taskId: taskId,
      performedDate: new Date(),
      performedBy: completionData.completedBy,
      duration: completionData.actualDuration,
      notes: completionData.notes,
      partsUsed: completionData.partsUsed,
      totalCost: completionData.partsUsed.reduce((sum, part) => sum + (part.cost * part.quantity), 0)
    };

    setHistory(prev => [...prev, historyEntry]);

    // Create next recurring task if applicable
    if (task.recurrence) {
      const nextTask = {
        ...task,
        id: `task-${Date.now()}`,
        scheduledDate: getNextMaintenanceDate(new Date(), task.recurrence),
        dueDate: getNextMaintenanceDate(new Date(), task.recurrence),
        status: 'scheduled' as const,
        lastPerformed: new Date()
      };
      createTask(nextTask);
    }

    onTaskUpdate?.(completedTask);
  };

  // Get task statistics
  const getStatistics = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    const upcoming = tasks.filter(t => {
      const daysUntilDue = Math.ceil((new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return t.status === 'scheduled' && daysUntilDue <= 7 && daysUntilDue > 0;
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalCost = history.reduce((sum, h) => sum + h.totalCost, 0);
    const avgDuration = history.length > 0 
      ? Math.round(history.reduce((sum, h) => sum + h.duration, 0) / history.length)
      : 0;

    return { total, completed, overdue, upcoming, completionRate, totalCost, avgDuration };
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterEquipment !== 'all' && task.equipmentId !== filterEquipment) return false;
    return true;
  });

  // Export maintenance data
  const exportData = () => {
    const data = {
      tasks: tasks,
      history: history,
      exported: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `maintenance-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Maintenance Scheduler</h2>
          <p className="text-gray-400">Track and manage equipment maintenance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowTaskForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          <Button
            variant="outline"
            onClick={exportData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Overdue Tasks</p>
              <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Upcoming (7 days)</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.upcoming}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold text-white">${stats.totalCost}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filters:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={filterEquipment}
            onChange={(e) => setFilterEquipment(e.target.value)}
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
          >
            <option value="all">All Equipment</option>
            {equipmentList.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Tasks List */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-white">{task.title}</h4>
                      <Badge 
                        variant={
                          task.priority === 'critical' ? 'destructive' :
                          task.priority === 'high' ? 'default' :
                          task.priority === 'medium' ? 'secondary' :
                          'outline'
                        }
                      >
                        {task.priority}
                      </Badge>
                      <Badge 
                        variant={
                          task.status === 'overdue' ? 'destructive' :
                          task.status === 'completed' ? 'default' :
                          task.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{task.equipmentName}</p>
                    <p className="text-sm text-gray-300">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Est: {task.estimatedDuration} min
                      </span>
                      {task.assignedTo && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTask(task)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {task.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          // Start task
                          setTasks(prev => prev.map(t => 
                            t.id === task.id ? { ...t, status: 'in_progress' as const } : t
                          ));
                        }}
                      >
                        Start
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          // Complete task modal would open here
                          completeTask(task.id, {
                            actualDuration: task.estimatedDuration,
                            completedBy: 'Current User',
                            notes: 'Completed successfully',
                            partsUsed: []
                          });
                        }}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card className="p-6">
            <div className="text-center text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4" />
              <p>Calendar view coming soon</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="space-y-4">
            {history.map(entry => {
              const task = tasks.find(t => t.id === entry.taskId);
              return (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white">{task?.title}</h4>
                      <p className="text-sm text-gray-400">{task?.equipmentName}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>Performed: {new Date(entry.performedDate).toLocaleDateString()}</span>
                        <span>By: {entry.performedBy}</span>
                        <span>Duration: {entry.duration} min</span>
                        <span>Cost: ${entry.totalCost}</span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-300 mt-2">{entry.notes}</p>
                      )}
                    </div>
                    <History className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Templates */}
      <Card className="p-4">
        <h3 className="text-lg font-medium text-white mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(maintenanceTemplates).map(([equipmentType, templates]) => (
            <div key={equipmentType}>
              <h4 className="text-sm font-medium text-gray-400 mb-2">{equipmentType}</h4>
              <div className="space-y-2">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const equipment = equipmentList.find(e => e.type === equipmentType);
                      if (equipment) {
                        createTask({
                          equipmentId: equipment.id,
                          title: template.title,
                          type: template.type as MaintenanceTask['type'],
                          estimatedDuration: template.duration,
                          scheduledDate: new Date(),
                          dueDate: new Date(Date.now() + template.interval * 24 * 60 * 60 * 1000),
                          recurrence: {
                            type: 'daily',
                            interval: template.interval
                          }
                        });
                      }
                    }}
                    className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
                  >
                    {template.title} <span className="text-gray-500">({template.interval} days)</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}