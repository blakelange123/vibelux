'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings, Plus, Play, Pause, Trash2, Edit2,
  Clock, Zap, AlertTriangle, CheckCircle, Info,
  Download, Upload, History, TrendingUp
} from 'lucide-react';
import { 
  GreenhouseAutomationEngine, 
  type Rule, 
  type Condition, 
  type Action,
  type RuleLog,
  RULE_TEMPLATES
} from '@/lib/greenhouse-automation-rules';

interface GreenhouseAutomationPanelProps {
  sensorData?: {
    temperature: number;
    humidity: number;
    co2: number;
    lightLevel: number;
    vpd: number;
  };
}

export function GreenhouseAutomationPanel({ sensorData }: GreenhouseAutomationPanelProps) {
  const [automationEngine] = useState(() => new GreenhouseAutomationEngine());
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [ruleHistory, setRuleHistory] = useState<RuleLog[]>([]);
  const [isAutomationActive, setIsAutomationActive] = useState(true);

  // Initialize rules
  useEffect(() => {
    // Get initial rules from engine
    const engineRules = automationEngine.exportRules();
    setRules(JSON.parse(engineRules));
    
    // Register default actuators
    const actuators = [
      { id: 'heating_system', type: 'heating' as const, state: 'off' as const, lastChange: new Date() },
      { id: 'cooling_system', type: 'cooling' as const, state: 'off' as const, lastChange: new Date() },
      { id: 'ventilation', type: 'ventilation' as const, state: 'off' as const, lastChange: new Date() },
      { id: 'co2_system', type: 'co2' as const, state: 'off' as const, lastChange: new Date() },
      { id: 'irrigation_zone_1', type: 'irrigation' as const, state: 'off' as const, lastChange: new Date() },
      { id: 'shade_screen', type: 'shade' as const, state: 'off' as const, lastChange: new Date() }
    ];
    
    actuators.forEach(actuator => automationEngine.registerActuator(actuator));
  }, [automationEngine]);

  // Run automation engine periodically
  useEffect(() => {
    if (!isAutomationActive || !sensorData) return;

    const interval = setInterval(() => {
      const sensorDataWithTimestamp = {
        ...sensorData,
        timestamp: new Date()
      };
      
      automationEngine.evaluateRules(sensorDataWithTimestamp);
      
      // Update history
      const history = automationEngine.getRuleHistory(undefined, 50);
      setRuleHistory(history);
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isAutomationActive, sensorData, automationEngine]);

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    automationEngine.toggleRule(ruleId, enabled);
    const updatedRules = JSON.parse(automationEngine.exportRules());
    setRules(updatedRules);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      automationEngine.removeRule(ruleId);
      const updatedRules = JSON.parse(automationEngine.exportRules());
      setRules(updatedRules);
    }
  };

  const handleExportRules = () => {
    const rulesJson = automationEngine.exportRules();
    const blob = new Blob([rulesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'greenhouse-automation-rules.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportRules = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        automationEngine.importRules(content);
        const updatedRules = JSON.parse(automationEngine.exportRules());
        setRules(updatedRules);
        alert('Rules imported successfully!');
      } catch (error) {
        alert('Failed to import rules. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const getConditionDescription = (condition: Condition): string => {
    const param = condition.parameter.charAt(0).toUpperCase() + condition.parameter.slice(1);
    const value = Array.isArray(condition.value) 
      ? `${condition.value[0]} - ${condition.value[1]}`
      : condition.value;
    
    return `${param} ${condition.operator} ${value}`;
  };

  const getActionDescription = (action: Action): string => {
    const actuator = action.actuatorId.replace(/_/g, ' ');
    if (action.command === 'set' && action.value !== undefined) {
      return `Set ${actuator} to ${action.value}%`;
    }
    return `Turn ${actuator} ${action.command}`;
  };

  const getRulePriorityColor = (priority: number): string => {
    if (priority >= 15) return 'text-red-600';
    if (priority >= 10) return 'text-orange-600';
    if (priority >= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-500" />
          Greenhouse Automation Rules
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAutomationActive(!isAutomationActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isAutomationActive
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isAutomationActive ? (
              <>
                <Play className="w-4 h-4" />
                Active
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Paused
              </>
            )}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="View History"
          >
            <History className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Active Rules</p>
          <p className="text-2xl font-bold text-purple-600">
            {rules.filter(r => r.enabled).length}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Rules</p>
          <p className="text-2xl font-bold text-gray-700">{rules.length}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Recent Triggers</p>
          <p className="text-2xl font-bold text-green-600">
            {ruleHistory.filter(log => log.triggered && 
              (Date.now() - new Date(log.timestamp).getTime()) < 3600000
            ).length}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">System Status</p>
          <p className="text-lg font-bold text-green-600">
            {isAutomationActive ? 'Running' : 'Paused'}
          </p>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-2 mb-6">
        {rules.map(rule => (
          <div
            key={rule.id}
            className={`p-4 border rounded-lg transition-all ${
              rule.enabled 
                ? 'border-gray-200 bg-white hover:shadow-md' 
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={`font-semibold ${rule.enabled ? '' : 'text-gray-500'}`}>
                    {rule.name}
                  </h4>
                  <span className={`text-sm font-medium ${getRulePriorityColor(rule.priority)}`}>
                    Priority: {rule.priority}
                  </span>
                  {rule.cooldownMinutes && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rule.cooldownMinutes}min cooldown
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Conditions:</span>
                    <div className="flex flex-wrap gap-2">
                      {rule.conditions.map((condition, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {getConditionDescription(condition)}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Actions:</span>
                    <div className="flex flex-wrap gap-2">
                      {rule.actions.map((action, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                        >
                          {getActionDescription(action)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    rule.enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => {
                    setSelectedRule(rule);
                    setShowRuleEditor(true);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Edit Rule"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                  title="Delete Rule"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setSelectedRule(null);
            setShowRuleEditor(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
        
        <button
          onClick={handleExportRules}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Rules
        </button>
        
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          Import Rules
          <input
            type="file"
            accept=".json"
            onChange={handleImportRules}
            className="hidden"
          />
        </label>
      </div>

      {/* Rule History */}
      {showHistory && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-600" />
            Recent Rule Activity
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {ruleHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No rule activity yet</p>
            ) : (
              ruleHistory.map((log, idx) => {
                const rule = rules.find(r => r.id === log.ruleId);
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded text-sm ${
                      log.triggered ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {rule?.name || log.ruleId}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.triggered && log.actionsExecuted.length > 0 && (
                      <div className="text-xs text-green-700 mt-1">
                        Executed: {log.actionsExecuted.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Rule Templates */}
      <div className="mt-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Quick Templates
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(RULE_TEMPLATES).map(([category, templates]) => (
            <div key={category} className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700 capitalize">
                {category.replace(/_/g, ' ')}
              </h5>
              {Object.values(templates).map((template: any, index) => (
                <button
                  key={`${category}-${template.id || index}`}
                  onClick={() => {
                    automationEngine.addRule(template);
                    const updatedRules = JSON.parse(automationEngine.exportRules());
                    setRules(updatedRules);
                  }}
                  className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition-colors"
                >
                  <div className="font-medium text-gray-700">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}