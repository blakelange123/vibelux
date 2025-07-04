'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  Pause,
  Plus,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle,
  Activity,
  GitBranch,
  Zap,
  Calendar,
  Filter,
  Save,
  Code,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Edit,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Droplets,
  Thermometer,
  Wind,
  X,
  FileText,
  Target,
  Timer
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggers: Trigger[];
  conditions: Condition[];
  actions: Action[];
  schedule?: Schedule;
  lastRun?: Date;
  runCount: number;
  status: 'active' | 'paused' | 'error' | 'disabled';
}

interface Trigger {
  id: string;
  type: 'time' | 'sensor' | 'event' | 'manual';
  config: any;
}

interface Condition {
  id: string;
  type: 'threshold' | 'range' | 'boolean' | 'time';
  parameter: string;
  operator: string;
  value: any;
  logic?: 'AND' | 'OR';
}

interface Action {
  id: string;
  type: 'control' | 'notification' | 'log' | 'recipe' | 'scene';
  target: string;
  config: any;
  delay?: number;
}

interface Schedule {
  type: 'recurring' | 'once' | 'sunrise' | 'sunset';
  config: any;
}

export function AutomationEngine() {
  const [mounted, setMounted] = useState(false);
  const [automations, setAutomations] = useState<AutomationRule[]>([
    {
      id: 'auto-1',
      name: 'High Temperature Response',
      description: 'Activate cooling when temperature exceeds threshold',
      enabled: true,
      triggers: [{
        id: 't1',
        type: 'sensor',
        config: { sensor: 'TEMP-001', event: 'value_change' }
      }],
      conditions: [
        {
          id: 'c1',
          type: 'threshold',
          parameter: 'temperature',
          operator: '>',
          value: 28,
          logic: 'AND'
        },
        {
          id: 'c2',
          type: 'time',
          parameter: 'time_of_day',
          operator: 'between',
          value: { start: '06:00', end: '22:00' },
          logic: 'AND'
        }
      ],
      actions: [
        {
          id: 'a1',
          type: 'control',
          target: 'HVAC-001',
          config: { command: 'set_mode', value: 'cooling' }
        },
        {
          id: 'a2',
          type: 'control',
          target: 'FAN-001',
          config: { command: 'set_speed', value: 100 },
          delay: 5
        },
        {
          id: 'a3',
          type: 'notification',
          target: 'admin',
          config: { message: 'High temperature alert - cooling activated' }
        }
      ],
      runCount: 47,
      lastRun: new Date(Date.now() - 3600000),
      status: 'active'
    },
    {
      id: 'auto-2',
      name: 'Daily Light Schedule',
      description: 'Automated photoperiod control for vegetative growth',
      enabled: true,
      triggers: [{
        id: 't2',
        type: 'time',
        config: { schedule: 'daily' }
      }],
      conditions: [],
      actions: [
        {
          id: 'a4',
          type: 'scene',
          target: 'veg-lighting',
          config: { scene: 'lights_on', time: '06:00' }
        },
        {
          id: 'a5',
          type: 'scene',
          target: 'veg-lighting',
          config: { scene: 'lights_off', time: '00:00' }
        }
      ],
      schedule: {
        type: 'recurring',
        config: { frequency: 'daily', time: '00:00' }
      },
      runCount: 156,
      lastRun: new Date(Date.now() - 7200000),
      status: 'active'
    },
    {
      id: 'auto-3',
      name: 'VPD Optimization',
      description: 'Maintain optimal VPD by adjusting temperature and humidity',
      enabled: true,
      triggers: [{
        id: 't3',
        type: 'sensor',
        config: { sensors: ['TEMP-001', 'HUM-001'], event: 'value_change' }
      }],
      conditions: [
        {
          id: 'c3',
          type: 'range',
          parameter: 'vpd',
          operator: 'outside',
          value: { min: 0.8, max: 1.2 }
        }
      ],
      actions: [
        {
          id: 'a6',
          type: 'recipe',
          target: 'climate-control',
          config: { recipe: 'vpd_correction', parameters: 'auto' }
        }
      ],
      runCount: 234,
      lastRun: new Date(Date.now() - 1800000),
      status: 'active'
    }
  ]);

  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerIcons = {
    time: Clock,
    sensor: Activity,
    event: Zap,
    manual: Play
  };

  const actionIcons = {
    control: Settings,
    notification: AlertCircle,
    log: Activity,
    recipe: GitBranch,
    scene: Sun
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'paused':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'error':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'disabled':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
      default:
        return 'text-gray-500';
    }
  };

  const generateCode = (automation: AutomationRule) => {
    return `// ${automation.name}
// ${automation.description}

const automation = {
  triggers: ${JSON.stringify(automation.triggers, null, 2)},
  
  conditions: ${JSON.stringify(automation.conditions, null, 2)},
  
  actions: ${JSON.stringify(automation.actions, null, 2)},
  
  execute: async (context) => {
    // Check conditions
    const conditionsMet = await checkConditions(context);
    
    if (conditionsMet) {
      // Execute actions
      for (const action of automation.actions) {
        await executeAction(action, context);
      }
    }
  }
};`;
  };

  const createAutomation = (formData: any) => {
    const newAutomation: AutomationRule = {
      id: `auto-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      enabled: true,
      triggers: formData.triggers || [],
      conditions: formData.conditions || [],
      actions: formData.actions || [],
      runCount: 0,
      status: 'active'
    };
    
    setAutomations([...automations, newAutomation]);
    setShowEditor(false);
  };

  const runAutomation = (automationId: string) => {
    setAutomations(prev => prev.map(automation => {
      if (automation.id === automationId) {
        return {
          ...automation,
          runCount: automation.runCount + 1,
          lastRun: new Date(),
          status: 'active' as const
        };
      }
      return automation;
    }));
    
    // Show success feedback
    alert(`Automation "${automations.find(a => a.id === automationId)?.name}" executed successfully!`);
  };

  const duplicateAutomation = (automation: AutomationRule) => {
    const duplicated: AutomationRule = {
      ...automation,
      id: `auto-${Date.now()}`,
      name: `${automation.name} (Copy)`,
      runCount: 0,
      lastRun: undefined,
      status: 'active'
    };
    
    setAutomations([...automations, duplicated]);
  };

  const deleteAutomation = (automationId: string) => {
    const automation = automations.find(a => a.id === automationId);
    if (automation && confirm(`Are you sure you want to delete "${automation.name}"?`)) {
      setAutomations(prev => prev.filter(a => a.id !== automationId));
      if (selectedAutomation === automationId) {
        setSelectedAutomation(null);
      }
    }
  };

  const editAutomation = (automationId: string) => {
    // For now, just show alert - could implement edit modal later
    const automation = automations.find(a => a.id === automationId);
    alert(`Edit functionality for "${automation?.name}" would open here. This could be enhanced with a full edit modal.`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1920px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Automation Engine</h1>
            <p className="text-gray-400">Create intelligent rules to automate your cultivation operations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditor(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Automation
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Automations</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-white">
              {automations.filter(a => a.enabled && a.status === 'active').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Running smoothly</p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Executions</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-white">
              {automations.reduce((sum, a) => sum + a.runCount, 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Actions Today</span>
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-white">342</p>
            <p className="text-xs text-green-400 mt-1">+12% from yesterday</p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Energy Saved</span>
              <Cpu className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-white">284 kWh</p>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </div>
        </div>

        {/* Automation List */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-gray-900 rounded-lg border border-gray-800">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Automation Rules</h2>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded flex items-center gap-2 transition-colors">
                    <Filter className="w-3 h-3" />
                    Filter
                  </button>
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded flex items-center gap-2 transition-colors"
                  >
                    <Code className="w-3 h-3" />
                    {showCode ? 'Hide' : 'Show'} Code
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {automations.map((automation) => (
                  <div
                    key={automation.id}
                    className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAutomation === automation.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedAutomation(automation.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-purple-400" />
                        <div>
                          <h3 className="text-white font-medium">{automation.name}</h3>
                          <p className="text-gray-400 text-sm">{automation.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(automation.status)}`}>
                          {automation.status}
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={automation.enabled}
                            onChange={(e) => {
                              e.stopPropagation();
                              setAutomations(prev => prev.map(a =>
                                a.id === automation.id ? { ...a, enabled: !a.enabled } : a
                              ));
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Triggers</p>
                        <div className="flex items-center gap-2">
                          {automation.triggers.map((trigger) => {
                            const Icon = triggerIcons[trigger.type];
                            return (
                              <div key={trigger.id} className="flex items-center gap-1">
                                <Icon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-white capitalize">{trigger.type}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Actions</p>
                        <p className="text-sm text-white">{automation.actions.length} actions</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Last Run</p>
                        <p className="text-sm text-white">
                          {mounted && automation.lastRun ? new Date(automation.lastRun).toLocaleTimeString() : 'Never'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Executed {automation.runCount} times
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            runAutomation(automation.id);
                          }}
                          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-green-400 transition-colors"
                          title="Run automation now"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editAutomation(automation.id);
                          }}
                          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-blue-400 transition-colors"
                          title="Edit automation"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateAutomation(automation);
                          }}
                          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-purple-400 transition-colors"
                          title="Duplicate automation"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAutomation(automation.id);
                          }}
                          className="p-1 hover:bg-gray-700 rounded text-red-400 hover:text-red-300 transition-colors"
                          title="Delete automation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {showCode && selectedAutomation === automation.id && (
                      <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          <code>{generateCode(automation)}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Automation Details */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            {selectedAutomation ? (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Automation Details</h3>
                {(() => {
                  const automation = automations.find(a => a.id === selectedAutomation);
                  if (!automation) return null;

                  return (
                    <div className="space-y-4">
                      {/* Triggers */}
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          Triggers
                        </h4>
                        <div className="space-y-2">
                          {automation.triggers.map((trigger) => {
                            const Icon = triggerIcons[trigger.type];
                            return (
                              <div key={trigger.id} className="bg-gray-800 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-gray-400" />
                                  <span className="text-white capitalize">{trigger.type}</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-1">
                                  {JSON.stringify(trigger.config)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Conditions */}
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Filter className="w-4 h-4 text-blue-400" />
                          Conditions
                        </h4>
                        <div className="space-y-2">
                          {automation.conditions.map((condition, index) => (
                            <div key={condition.id} className="bg-gray-800 rounded-lg p-3">
                              {index > 0 && (
                                <p className="text-purple-400 text-xs mb-2">{condition.logic}</p>
                              )}
                              <p className="text-white text-sm">
                                {condition.parameter} {condition.operator} {JSON.stringify(condition.value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          Actions
                        </h4>
                        <div className="space-y-2">
                          {automation.actions.map((action) => {
                            const Icon = actionIcons[action.type];
                            return (
                              <div key={action.id} className="bg-gray-800 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4 text-gray-400" />
                                  <span className="text-white capitalize">{action.type}</span>
                                  {action.delay && (
                                    <span className="text-gray-400 text-xs">+{action.delay}s</span>
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm mt-1">
                                  Target: {action.target}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Execution History */}
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-400" />
                          Recent Executions
                        </h4>
                        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Total Runs</span>
                            <span className="text-white">{automation.runCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Success Rate</span>
                            <span className="text-green-400">98.7%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Avg Duration</span>
                            <span className="text-white">1.2s</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Cpu className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p>Select an automation to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Templates */}
        <div className="mt-8 bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Start Templates</h2>
          <div className="grid grid-cols-4 gap-4">
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
              <Thermometer className="w-8 h-8 text-orange-400 mb-2" />
              <h3 className="text-white font-medium">Temperature Control</h3>
              <p className="text-gray-400 text-sm">Maintain optimal temperature ranges</p>
            </button>
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
              <Droplets className="w-8 h-8 text-blue-400 mb-2" />
              <h3 className="text-white font-medium">Irrigation Schedule</h3>
              <p className="text-gray-400 text-sm">Automated watering cycles</p>
            </button>
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
              <Sun className="w-8 h-8 text-yellow-400 mb-2" />
              <h3 className="text-white font-medium">Photoperiod Control</h3>
              <p className="text-gray-400 text-sm">Light schedule automation</p>
            </button>
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left">
              <Wind className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="text-white font-medium">VPD Optimization</h3>
              <p className="text-gray-400 text-sm">Vapor pressure deficit control</p>
            </button>
          </div>
        </div>

        {/* Automation Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white">Create New Automation</h3>
                <button
                  onClick={() => setShowEditor(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createAutomation({
                    name: formData.get('name'),
                    description: formData.get('description'),
                    triggers: [{
                      id: `trigger-${Date.now()}`,
                      type: formData.get('triggerType') as any,
                      config: { sensor: formData.get('triggerConfig') }
                    }],
                    conditions: [{
                      id: `condition-${Date.now()}`,
                      type: 'threshold',
                      parameter: formData.get('conditionParam') as string,
                      operator: formData.get('conditionOperator') as string,
                      value: Number(formData.get('conditionValue')),
                      logic: 'AND'
                    }],
                    actions: [{
                      id: `action-${Date.now()}`,
                      type: formData.get('actionType') as any,
                      target: formData.get('actionTarget') as string,
                      config: { command: formData.get('actionCommand') }
                    }]
                  });
                }}
                className="space-y-6"
              >
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Automation Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., High Temperature Alert"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <input
                      name="description"
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Brief description of what this automation does"
                    />
                  </div>
                </div>

                {/* Trigger */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    Trigger
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Trigger Type</label>
                      <select
                        name="triggerType"
                        required
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="sensor">Sensor Reading</option>
                        <option value="time">Time Based</option>
                        <option value="event">System Event</option>
                        <option value="manual">Manual Trigger</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Configuration</label>
                      <input
                        name="triggerConfig"
                        type="text"
                        placeholder="e.g., TEMP-001, daily, system_start"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Condition */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Condition
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Parameter</label>
                      <select
                        name="conditionParam"
                        required
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="temperature">Temperature</option>
                        <option value="humidity">Humidity</option>
                        <option value="light_level">Light Level</option>
                        <option value="co2">CO2 Level</option>
                        <option value="ph">pH Level</option>
                        <option value="ec">EC Level</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Operator</label>
                      <select
                        name="conditionOperator"
                        required
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      >
                        <option value=">">Greater than</option>
                        <option value="<">Less than</option>
                        <option value="=">Equal to</option>
                        <option value=">=">Greater than or equal</option>
                        <option value="<=">Less than or equal</option>
                        <option value="between">Between</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Value</label>
                      <input
                        name="conditionValue"
                        type="number"
                        step="0.1"
                        required
                        placeholder="25.0"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Action
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Action Type</label>
                      <select
                        name="actionType"
                        required
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="control">Device Control</option>
                        <option value="notification">Send Notification</option>
                        <option value="recipe">Apply Recipe</option>
                        <option value="scene">Activate Scene</option>
                        <option value="log">Create Log Entry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Target</label>
                      <input
                        name="actionTarget"
                        type="text"
                        required
                        placeholder="e.g., HVAC-001, admin, lighting-zone-1"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Command</label>
                      <input
                        name="actionCommand"
                        type="text"
                        required
                        placeholder="e.g., turn_on, set_temp_25, alert"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditor(false)}
                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Create Automation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}