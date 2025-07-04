'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  Play, 
  Pause,
  Calendar,
  Zap,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit2,
  Check,
  X,
  GitBranch,
  Timer,
  Repeat
} from 'lucide-react';
import { EquipmentDefinition } from '@/lib/hmi/equipment-registry';

export interface Schedule {
  id: string;
  name: string;
  equipmentId: string;
  enabled: boolean;
  type: 'daily' | 'weekly' | 'custom';
  startTime: string;
  endTime: string;
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  actions: ScheduleAction[];
}

export interface ScheduleAction {
  controlPointId: string;
  value: any;
  delay?: number; // delay in minutes after schedule start
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  actions: RuleAction[];
  cooldown?: number; // minutes before rule can trigger again
  lastTriggered?: Date;
}

export interface RuleTrigger {
  type: 'telemetry' | 'time' | 'equipment' | 'manual';
  equipmentId?: string;
  telemetryId?: string;
  operator?: '>' | '<' | '=' | '>=' | '<=';
  value?: number;
  time?: string;
}

export interface RuleCondition {
  type: 'and' | 'or';
  equipmentId: string;
  telemetryId?: string;
  controlPointId?: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number | boolean;
}

export interface RuleAction {
  equipmentId: string;
  controlPointId: string;
  value: any;
  delay?: number; // delay in minutes
}

interface AutomationRulesBuilderProps {
  equipment: EquipmentDefinition[];
  schedules: Schedule[];
  rules: AutomationRule[];
  onScheduleUpdate: (schedules: Schedule[]) => void;
  onRuleUpdate: (rules: AutomationRule[]) => void;
  onTestRule: (rule: AutomationRule) => void;
}

export function AutomationRulesBuilder({
  equipment,
  schedules,
  rules,
  onScheduleUpdate,
  onRuleUpdate,
  onTestRule
}: AutomationRulesBuilderProps) {
  const [activeTab, setActiveTab] = useState<'schedules' | 'rules'>('schedules');
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const createNewSchedule = (): Schedule => ({
    id: `schedule-${Date.now()}`,
    name: 'New Schedule',
    equipmentId: equipment[0]?.id || '',
    enabled: false,
    type: 'daily',
    startTime: '08:00',
    endTime: '20:00',
    actions: []
  });

  const createNewRule = (): AutomationRule => ({
    id: `rule-${Date.now()}`,
    name: 'New Rule',
    enabled: false,
    trigger: {
      type: 'telemetry',
      equipmentId: equipment[0]?.id || '',
      operator: '>',
      value: 0
    },
    conditions: [],
    actions: []
  });

  const saveSchedule = (schedule: Schedule) => {
    const updatedSchedules = editingSchedule?.id
      ? schedules.map(s => s.id === schedule.id ? schedule : s)
      : [...schedules, schedule];
    onScheduleUpdate(updatedSchedules);
    setEditingSchedule(null);
  };

  const saveRule = (rule: AutomationRule) => {
    const updatedRules = editingRule?.id
      ? rules.map(r => r.id === rule.id ? rule : r)
      : [...rules, rule];
    onRuleUpdate(updatedRules);
    setEditingRule(null);
  };

  const deleteSchedule = (id: string) => {
    onScheduleUpdate(schedules.filter(s => s.id !== id));
  };

  const deleteRule = (id: string) => {
    onRuleUpdate(rules.filter(r => r.id !== id));
  };

  const toggleSchedule = (id: string) => {
    onScheduleUpdate(schedules.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const toggleRule = (id: string) => {
    onRuleUpdate(rules.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const getEquipmentName = (id: string) => {
    return equipment.find(e => e.id === id)?.name || 'Unknown';
  };

  const getDayName = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Automation & Scheduling</h2>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'schedules') {
                setEditingSchedule(createNewSchedule());
              } else {
                setEditingRule(createNewRule());
              }
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create {activeTab === 'schedules' ? 'Schedule' : 'Rule'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'schedules' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Schedules ({schedules.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'rules' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-4 h-4 inline mr-2" />
            Rules ({rules.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'schedules' ? (
          <div className="space-y-4">
            {schedules.length === 0 && !editingSchedule ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No schedules created yet</p>
                <p className="text-sm mt-1">Create schedules to automate equipment operation</p>
              </div>
            ) : (
              <>
                {schedules.map(schedule => {
                  const isExpanded = expandedItems.has(schedule.id);
                  const equipmentItem = equipment.find(e => e.id === schedule.equipmentId);
                  
                  return (
                    <div
                      key={schedule.id}
                      className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
                    >
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => toggleExpanded(schedule.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSchedule(schedule.id);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                schedule.enabled 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-gray-700 hover:bg-gray-600'
                              }`}
                            >
                              {schedule.enabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </button>
                            <div>
                              <h3 className="font-medium">{schedule.name}</h3>
                              <p className="text-sm text-gray-400">
                                {getEquipmentName(schedule.equipmentId)} • 
                                {schedule.type === 'daily' ? ' Daily' : schedule.type === 'weekly' ? ' Weekly' : ' Custom'} • 
                                {schedule.startTime} - {schedule.endTime}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSchedule(schedule);
                              }}
                              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSchedule(schedule.id);
                              }}
                              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-800 p-4 bg-gray-800/50">
                          {schedule.type === 'weekly' && schedule.daysOfWeek && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-400 mb-2">Active Days:</p>
                              <div className="flex gap-2">
                                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                                  <span
                                    key={day}
                                    className={`px-2 py-1 rounded text-xs ${
                                      schedule.daysOfWeek?.includes(day)
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-700 text-gray-400'
                                    }`}
                                  >
                                    {getDayName(day)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {schedule.actions.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-400 mb-2">Actions:</p>
                              <div className="space-y-2">
                                {schedule.actions.map((action, idx) => {
                                  const controlPoint = equipmentItem?.controlPoints.find(cp => cp.id === action.controlPointId);
                                  return (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <Timer className="w-4 h-4 text-gray-500" />
                                      {action.delay ? `+${action.delay}min: ` : 'Start: '}
                                      Set {controlPoint?.name} to {action.value}{controlPoint?.unit || ''}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {rules.length === 0 && !editingRule ? (
              <div className="text-center py-8 text-gray-500">
                <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No automation rules created yet</p>
                <p className="text-sm mt-1">Create rules to automate equipment based on conditions</p>
              </div>
            ) : (
              <>
                {rules.map(rule => {
                  const isExpanded = expandedItems.has(rule.id);
                  
                  return (
                    <div
                      key={rule.id}
                      className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
                    >
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => toggleExpanded(rule.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRule(rule.id);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                rule.enabled 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-gray-700 hover:bg-gray-600'
                              }`}
                            >
                              {rule.enabled ? <Zap className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </button>
                            <div>
                              <h3 className="font-medium">{rule.name}</h3>
                              <p className="text-sm text-gray-400">
                                Trigger: {rule.trigger.type}
                                {rule.lastTriggered && (
                                  <span className="ml-2">
                                    • Last triggered: {new Date(rule.lastTriggered).toLocaleString()}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTestRule(rule);
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                            >
                              Test
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingRule(rule);
                              }}
                              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRule(rule.id);
                              }}
                              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-800 p-4 bg-gray-800/50 space-y-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Trigger:</p>
                            <div className="bg-gray-900 p-3 rounded text-sm">
                              {rule.trigger.type === 'telemetry' && (
                                <>
                                  When {getEquipmentName(rule.trigger.equipmentId!)} 
                                  {' '}{rule.trigger.telemetryId} 
                                  {' '}{rule.trigger.operator} 
                                  {' '}{rule.trigger.value}
                                </>
                              )}
                              {rule.trigger.type === 'time' && (
                                <>At {rule.trigger.time}</>
                              )}
                            </div>
                          </div>

                          {rule.conditions.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-400 mb-2">Conditions:</p>
                              <div className="space-y-2">
                                {rule.conditions.map((condition, idx) => (
                                  <div key={idx} className="bg-gray-900 p-3 rounded text-sm">
                                    {idx > 0 && <span className="text-purple-400 mr-2">{condition.type.toUpperCase()}</span>}
                                    {getEquipmentName(condition.equipmentId)} 
                                    {' '}{condition.telemetryId || condition.controlPointId}
                                    {' '}{condition.operator}
                                    {' '}{condition.value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {rule.actions.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-400 mb-2">Actions:</p>
                              <div className="space-y-2">
                                {rule.actions.map((action, idx) => (
                                  <div key={idx} className="bg-gray-900 p-3 rounded text-sm">
                                    {action.delay && <Timer className="w-4 h-4 inline mr-1" />}
                                    {action.delay ? `After ${action.delay}min: ` : ''}
                                    Set {getEquipmentName(action.equipmentId)} 
                                    {' '}{action.controlPointId} to {action.value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {rule.cooldown && (
                            <div className="text-sm text-gray-400">
                              <Repeat className="w-4 h-4 inline mr-1" />
                              Cooldown: {rule.cooldown} minutes
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {(editingSchedule || editingRule) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingSchedule ? 'Edit Schedule' : 'Edit Rule'}
              </h3>
              
              {/* Form content would go here - simplified for brevity */}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={editingSchedule?.name || editingRule?.name}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
                />
                
                <p className="text-sm text-gray-400">
                  Full form implementation would include equipment selection, 
                  trigger configuration, conditions, and actions setup.
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingSchedule(null);
                    setEditingRule(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingSchedule) saveSchedule(editingSchedule);
                    if (editingRule) saveRule(editingRule);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}