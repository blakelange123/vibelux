'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, Wifi, Activity, AlertTriangle, CheckCircle,
  TrendingUp, Clock, Settings, Download, Share2,
  BarChart3, Zap, Droplets, Eye, TreePine, Shield,
  MessageSquare, Lightbulb, Thermometer, Wind
} from 'lucide-react';
import { 
  SapFlowSensor, 
  StomatalConductanceSensor, 
  Dendrometer, 
  LeafWetnessSensor, 
  PlantElectricalSensor 
} from './AdvancedPlantSensors';

// Integration with existing VibeLux systems
interface PlantResponse {
  timestamp: Date;
  trigger: string;
  response: string;
  action: string;
  success: boolean;
}

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    sensor: 'sap-flow' | 'stomatal' | 'dendrometer' | 'wetness' | 'electrical';
    condition: string;
    threshold: number;
  };
  actions: {
    type: 'lighting' | 'climate' | 'irrigation' | 'alert';
    adjustment: string;
    value: number;
  }[];
  cooldown: number; // minutes
  lastTriggered?: Date;
}

interface PlantInsight {
  id: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  recommendations: string[];
  affectedSystems: string[];
}

export function PlantCommunicationHub() {
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'automation' | 'insights' | 'history'>('dashboard');
  const [plantResponses, setPlantResponses] = useState<PlantResponse[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: 'rule-001',
      name: 'Water Stress Response',
      enabled: true,
      trigger: {
        sensor: 'sap-flow',
        condition: 'flow_rate_below',
        threshold: 50
      },
      actions: [
        { type: 'irrigation', adjustment: 'increase_duration', value: 20 },
        { type: 'climate', adjustment: 'reduce_vpd', value: 0.2 },
        { type: 'alert', adjustment: 'notify_grower', value: 1 }
      ],
      cooldown: 60
    },
    {
      id: 'rule-002',
      name: 'Stomata Closure Protection',
      enabled: true,
      trigger: {
        sensor: 'stomatal',
        condition: 'conductance_below',
        threshold: 100
      },
      actions: [
        { type: 'lighting', adjustment: 'reduce_intensity', value: 20 },
        { type: 'climate', adjustment: 'increase_humidity', value: 10 }
      ],
      cooldown: 30
    },
    {
      id: 'rule-003',
      name: 'Disease Prevention',
      enabled: true,
      trigger: {
        sensor: 'wetness',
        condition: 'wetness_hours_above',
        threshold: 4
      },
      actions: [
        { type: 'climate', adjustment: 'activate_dehumidifier', value: 1 },
        { type: 'climate', adjustment: 'increase_airflow', value: 30 }
      ],
      cooldown: 120
    }
  ]);

  const [insights, setInsights] = useState<PlantInsight[]>([]);

  // Mock sensor data for demonstration
  const [sensorData, setSensorData] = useState({
    sapFlow: { current: 125, trend: 'stable' },
    stomatal: { conductance: 280, status: 'open' },
    dendrometer: { growth: 0.3, phase: 'expansion' },
    wetness: { level: 15, risk: 'low' },
    electrical: { pattern: 'normal', stress: false }
  });

  // Simulate plant communication events
  useEffect(() => {
    const interval = setInterval(() => {
      // Check for stress conditions
      const stressDetected = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.8;
      
      if (stressDetected) {
        const newResponse: PlantResponse = {
          timestamp: new Date(),
          trigger: 'Electrical signal spike detected',
          response: 'Plant showing early stress response',
          action: 'Adjusted VPD from 1.4 to 1.2 kPa',
          success: true
        };
        
        setPlantResponses(prev => [newResponse, ...prev.slice(0, 19)]);
        
        // Generate insight
        const newInsight: PlantInsight = {
          id: `insight-${Date.now()}`,
          timestamp: new Date(),
          severity: 'warning',
          title: 'Early Stress Detection',
          description: 'Electrical signals indicate developing stress 48 hours before visual symptoms',
          recommendations: [
            'Monitor sap flow rate closely',
            'Consider preventive irrigation',
            'Reduce light intensity by 10% if stress persists'
          ],
          affectedSystems: ['irrigation', 'lighting', 'climate']
        };
        
        setInsights(prev => [newInsight, ...prev.slice(0, 9)]);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Real-time communication status
  const getCommunicationStatus = () => {
    const statuses = [
      { system: 'Sap Flow Network', status: 'online', latency: 12 },
      { system: 'Stomatal Sensors', status: 'online', latency: 8 },
      { system: 'Dendrometer Array', status: 'online', latency: 15 },
      { system: 'Wetness Grid', status: 'online', latency: 10 },
      { system: 'Electrical Network', status: 'online', latency: 5 }
    ];
    
    return statuses;
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Communication Status */}
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Wifi className="w-5 h-5 text-green-400" />
            Plant Communication Network
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">All Systems Online</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {getCommunicationStatus().map((system) => (
            <div key={system.system} className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400">{system.system}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-medium text-green-400">Online</span>
                <span className="text-xs text-gray-500">{system.latency}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Plant Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Water Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-400" />
              Water Communication
            </h4>
            <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Message</span>
              <span className="text-xs text-blue-400">Adequate hydration</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Sap Flow</span>
              <span className="text-sm font-medium text-white">{sensorData.sapFlow.current} g/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Response</span>
              <span className="text-xs text-green-400">Normal uptake</span>
            </div>
          </div>
        </div>

        {/* Gas Exchange Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-400" />
              Stomatal Communication
            </h4>
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Message</span>
              <span className="text-xs text-green-400">Optimal gas exchange</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Conductance</span>
              <span className="text-sm font-medium text-white">{sensorData.stomatal.conductance} mmol</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Stomata</span>
              <span className="text-xs text-green-400">Fully open</span>
            </div>
          </div>
        </div>

        {/* Growth Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <TreePine className="w-4 h-4 text-amber-400" />
              Growth Communication
            </h4>
            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Message</span>
              <span className="text-xs text-amber-400">Active growth</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Daily Rate</span>
              <span className="text-sm font-medium text-white">+{sensorData.dendrometer.growth} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Phase</span>
              <span className="text-xs text-green-400">Expansion</span>
            </div>
          </div>
        </div>

        {/* Disease Risk */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Disease Prevention
            </h4>
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Message</span>
              <span className="text-xs text-cyan-400">Low risk conditions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Wetness</span>
              <span className="text-sm font-medium text-white">{sensorData.wetness.level}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Action</span>
              <span className="text-xs text-green-400">Monitoring</span>
            </div>
          </div>
        </div>

        {/* Electrical Signals */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Electrical Communication
            </h4>
            <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Message</span>
              <span className="text-xs text-yellow-400">Normal signals</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Pattern</span>
              <span className="text-sm font-medium text-white">Baseline</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Stress</span>
              <span className="text-xs text-green-400">Not detected</span>
            </div>
          </div>
        </div>

        {/* AI Integration */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              AI Interpretation
            </h4>
            <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Status</span>
              <span className="text-xs text-purple-400">Analyzing patterns</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Confidence</span>
              <span className="text-sm font-medium text-white">94%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Next Action</span>
              <span className="text-xs text-green-400">Continue monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Plant Responses */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          Recent Plant Communications
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {plantResponses.length > 0 ? (
            plantResponses.map((response, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-3 flex items-start gap-3">
                <div className="mt-1">
                  {response.success ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-white">{response.trigger}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(response.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{response.response}</p>
                  <p className="text-xs text-purple-400">Action: {response.action}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              No recent communications. Plants are content.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderAutomation = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Automated Response Rules</h3>
          <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
            Add Rule
          </button>
        </div>
        
        <div className="space-y-4">
          {automationRules.map((rule) => (
            <div key={rule.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">{rule.name}</h4>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => {
                        setAutomationRules(prev => prev.map(r => 
                          r.id === rule.id ? { ...r, enabled: e.target.checked } : r
                        ));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                  <Settings className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-pointer" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Trigger</p>
                  <p className="text-gray-300">
                    {rule.trigger.sensor} {rule.trigger.condition} {rule.trigger.threshold}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Actions</p>
                  <ul className="text-gray-300 space-y-1">
                    {rule.actions.map((action, idx) => (
                      <li key={idx} className="text-xs">
                        • {action.type}: {action.adjustment} ({action.value})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {rule.lastTriggered && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    Last triggered: {new Date(rule.lastTriggered).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Plant Communication Insights</h3>
        
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {insight.severity === 'critical' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                  {insight.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  {insight.severity === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{insight.title}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(insight.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Recommendations:</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {insight.recommendations.map((rec, idx) => (
                        <li key={idx}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2">
                    <p className="text-xs text-gray-400">Affected:</p>
                    <div className="flex gap-2">
                      {insight.affectedSystems.map((system) => (
                        <span key={system} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                          {system}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Plant Communication Hub
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-red-400'}`} />
            <span className="text-sm text-gray-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {['dashboard', 'automation', 'insights', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'automation' && renderAutomation()}
      {activeTab === 'insights' && renderInsights()}
      {activeTab === 'history' && (
        <div className="bg-gray-700 rounded-lg p-6">
          <p className="text-gray-400">Communication history and analytics coming soon...</p>
        </div>
      )}
    </div>
  );
}