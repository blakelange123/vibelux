'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
  MessageSquare,
  Navigation,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Check,
  X,
  MapPin,
  Zap
} from 'lucide-react';

interface MobileTask {
  id: string;
  title: string;
  description: string;
  room: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: number;
  status: 'pending' | 'in-progress' | 'completed';
  checklist?: string[];
  completedSteps?: string[];
  notes?: string;
  images?: string[];
  environmentalTrigger?: {
    parameter: string;
    value: number;
    threshold: number;
  };
}

export function MobileTaskView() {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [taskTimer, setTaskTimer] = useState<{ [key: string]: number }>({});

  const tasks: MobileTask[] = [
    {
      id: 'task-1',
      title: 'Adjust Light Height - Row 3',
      room: 'Flower A',
      priority: 'high',
      estimatedTime: 20,
      status: 'pending',
      description: 'Plants reaching canopy limit. Raise lights 6 inches.',
      checklist: [
        'Turn off lights in affected area',
        'Loosen height adjustment cables',
        'Raise fixture 6 inches',
        'Verify even coverage with PAR meter',
        'Secure cables and turn lights back on'
      ],
      environmentalTrigger: {
        parameter: 'Canopy Height',
        value: 38,
        threshold: 36
      }
    },
    {
      id: 'task-2',
      title: 'pH Dosing Pump Check',
      room: 'Nutrient Room',
      priority: 'critical',
      estimatedTime: 15,
      status: 'in-progress',
      description: 'pH drift detected in Tank B. Verify pump operation.',
      checklist: [
        'Check pump power connection',
        'Verify dosing line not clogged',
        'Calibrate pH probe',
        'Test manual pump operation',
        'Check controller settings'
      ],
      completedSteps: ['Check pump power connection', 'Verify dosing line not clogged']
    },
    {
      id: 'task-3',
      title: 'Weekly IPM Inspection',
      room: 'Veg Room',
      priority: 'medium',
      estimatedTime: 45,
      status: 'pending',
      description: 'Inspect all plants for pests/disease signs.',
      checklist: [
        'Check leaf undersides with loupe',
        'Inspect new growth for abnormalities',
        'Look for webbing or eggs',
        'Document any findings with photos',
        'Apply preventive treatment if needed'
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleTask = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const startTask = (taskId: string) => {
    setActiveTask(taskId);
    // Start timer logic here
  };

  const completeTask = (taskId: string) => {
    setActiveTask(null);
    // Complete task logic here
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">My Tasks</h1>
            <p className="text-sm text-gray-400">3 tasks pending</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-gray-800 rounded-lg">
              <User className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">1</p>
          <p className="text-xs text-gray-400">Active</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-400">12</p>
          <p className="text-xs text-gray-400">Today</p>
        </div>
      </div>

      {/* Task List */}
      <div className="px-4 space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
          >
            {/* Task Header */}
            <div
              onClick={() => toggleTask(task.id)}
              className="p-4 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`w-1 h-12 rounded-full ${getPriorityColor(task.priority)}`} />
                <div className="flex-1">
                  <h3 className="font-medium text-white">{task.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {task.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.estimatedTime} min
                    </span>
                    {task.environmentalTrigger && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Zap className="w-3 h-3" />
                        Auto
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-gray-400">
                  {expandedTask === task.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedTask === task.id && (
              <div className="px-4 pb-4 border-t border-gray-800 pt-4">
                <p className="text-sm text-gray-300 mb-4">{task.description}</p>

                {/* Environmental Trigger Info */}
                {task.environmentalTrigger && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-300">
                      Auto-generated: {task.environmentalTrigger.parameter} reached{' '}
                      <span className="font-bold">{task.environmentalTrigger.value}</span>{' '}
                      (threshold: {task.environmentalTrigger.threshold})
                    </p>
                  </div>
                )}

                {/* Checklist */}
                {task.checklist && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Checklist</h4>
                    <div className="space-y-2">
                      {task.checklist.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center ${
                            task.completedSteps?.includes(item)
                              ? 'bg-green-600 border-green-600'
                              : 'border-gray-600'
                          }`}>
                            {task.completedSteps?.includes(item) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <p className={`text-sm ${
                            task.completedSteps?.includes(item)
                              ? 'text-gray-500 line-through'
                              : 'text-gray-300'
                          }`}>
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => startTask(task.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Start Task
                    </button>
                  )}
                  {task.status === 'in-progress' && activeTask === task.id && (
                    <>
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                      <button
                        onClick={() => completeTask(task.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Complete
                      </button>
                    </>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
                    <Camera className="w-4 h-4" />
                    Photo
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    Note
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
                    <Navigation className="w-4 h-4" />
                    Navigate
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="grid grid-cols-4 gap-1">
          <button className="py-3 text-center">
            <CheckCircle className="w-5 h-5 mx-auto text-purple-400" />
            <span className="text-xs text-purple-400 mt-1 block">Tasks</span>
          </button>
          <button className="py-3 text-center">
            <Calendar className="w-5 h-5 mx-auto text-gray-400" />
            <span className="text-xs text-gray-400 mt-1 block">Schedule</span>
          </button>
          <button className="py-3 text-center">
            <AlertCircle className="w-5 h-5 mx-auto text-gray-400" />
            <span className="text-xs text-gray-400 mt-1 block">Alerts</span>
          </button>
          <button className="py-3 text-center">
            <User className="w-5 h-5 mx-auto text-gray-400" />
            <span className="text-xs text-gray-400 mt-1 block">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}