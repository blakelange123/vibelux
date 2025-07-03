'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Leaf,
  Sun,
  Moon,
  Play,
  Pause,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  Cpu,
  Database,
  Network,
  Gauge,
  RefreshCw,
  Power,
  Lightbulb,
  Wrench,
  Calendar,
  Users,
  Bell,
  Download,
  Upload,
  Save,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  category: 'lighting' | 'climate' | 'irrigation' | 'nutrition' | 'security' | 'energy';
  priority: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  conditions: Array<{
    parameter: string;
    operator: 'gt' | 'lt' | 'eq' | 'between';
    value: number | string;
    value2?: number;
  }>;
  actions: Array<{
    system: string;
    command: string;
    parameters: Record<string, any>;
  }>;
  schedule?: {
    type: 'continuous' | 'scheduled' | 'conditional';
    cron?: string;
    triggers?: string[];
  };
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
}

interface SystemStatus {
  id: string;
  name: string;
  category: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  autonomy: 'manual' | 'assisted' | 'autonomous';
  lastUpdate: Date;
  metrics: {
    efficiency: number;
    uptime: number;
    responseTime: number;
  };
  controls: {
    current: number | string;
    target: number | string;
    unit: string;
    range: [number, number];
  };
}

interface AutoPilotSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'paused' | 'completed' | 'error';
  mode: 'learning' | 'optimizing' | 'maintaining' | 'emergency';
  objectives: string[];
  metrics: {
    decisionsExecuted: number;
    optimizationsApplied: number;
    issuesResolved: number;
    energySaved: number;
    yieldImprovement: number;
  };
  confidence: number;
}

export function AutoPilotEngine() {
  const [autopilotActive, setAutopilotActive] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'monitor' | 'assist' | 'autonomous'>('monitor');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [showRuleEditor, setShowRuleEditor] = useState(false);

  const [currentSession, setCurrentSession] = useState<AutoPilotSession>({
    id: 'session-1',
    name: 'Autonomous Cultivation - Week 3',
    startTime: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
    status: 'active',
    mode: 'optimizing',
    objectives: [
      'Maximize photosynthetic efficiency',
      'Minimize energy consumption',
      'Maintain optimal VPD',
      'Prevent pest/disease issues',
      'Optimize harvest timing'
    ],
    metrics: {
      decisionsExecuted: 1247,
      optimizationsApplied: 89,
      issuesResolved: 23,
      energySaved: 18.4,
      yieldImprovement: 12.7
    },
    confidence: 94.2
  });

  const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([
    {
      id: 'lighting',
      name: 'LED Lighting System',
      category: 'Environmental',
      status: 'online',
      autonomy: 'autonomous',
      lastUpdate: new Date(),
      metrics: {
        efficiency: 97.3,
        uptime: 99.8,
        responseTime: 0.3
      },
      controls: {
        current: 850,
        target: 850,
        unit: 'PPFD',
        range: [200, 1500]
      }
    },
    {
      id: 'hvac',
      name: 'Climate Control',
      category: 'Environmental',
      status: 'online',
      autonomy: 'autonomous',
      lastUpdate: new Date(),
      metrics: {
        efficiency: 94.8,
        uptime: 99.2,
        responseTime: 1.2
      },
      controls: {
        current: 24.3,
        target: 24.5,
        unit: '°C',
        range: [18, 30]
      }
    },
    {
      id: 'irrigation',
      name: 'Irrigation System',
      category: 'Nutrition',
      status: 'online',
      autonomy: 'autonomous',
      lastUpdate: new Date(),
      metrics: {
        efficiency: 96.1,
        uptime: 98.7,
        responseTime: 0.8
      },
      controls: {
        current: 1.8,
        target: 1.8,
        unit: 'EC',
        range: [0.8, 2.5]
      }
    },
    {
      id: 'co2',
      name: 'CO₂ Injection',
      category: 'Environmental',
      status: 'online',
      autonomy: 'autonomous',
      lastUpdate: new Date(),
      metrics: {
        efficiency: 91.7,
        uptime: 97.4,
        responseTime: 2.1
      },
      controls: {
        current: 1205,
        target: 1200,
        unit: 'ppm',
        range: [400, 1500]
      }
    },
    {
      id: 'ventilation',
      name: 'Air Circulation',
      category: 'Environmental',
      status: 'warning',
      autonomy: 'assisted',
      lastUpdate: new Date(),
      metrics: {
        efficiency: 87.2,
        uptime: 94.1,
        responseTime: 1.8
      },
      controls: {
        current: 0.85,
        target: 0.90,
        unit: 'VPD',
        range: [0.4, 1.6]
      }
    },
    {
      id: 'security',
      name: 'Security Systems',
      category: 'Security',
      status: 'online',
      autonomy: 'autonomous',
      lastUpdate: new Date(),
      metrics: {
        efficiency: 99.1,
        uptime: 99.9,
        responseTime: 0.1
      },
      controls: {
        current: 'Armed',
        target: 'Armed',
        unit: 'Mode',
        range: [0, 1]
      }
    }
  ]);

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: 'rule-1',
      name: 'Dynamic Light Intensity',
      category: 'lighting',
      priority: 'high',
      enabled: true,
      conditions: [
        { parameter: 'plant_age', operator: 'between', value: 21, value2: 70 },
        { parameter: 'time_of_day', operator: 'between', value: 6, value2: 18 }
      ],
      actions: [
        {
          system: 'lighting',
          command: 'adjust_intensity',
          parameters: { calculation: 'DLI_optimization', max_ppfd: 1200 }
        }
      ],
      schedule: {
        type: 'continuous',
        triggers: ['sensor_update', 'growth_stage_change']
      },
      lastExecuted: new Date(Date.now() - 5 * 60 * 1000),
      executionCount: 2847,
      successRate: 99.3
    },
    {
      id: 'rule-2',
      name: 'VPD Optimization',
      category: 'climate',
      priority: 'critical',
      enabled: true,
      conditions: [
        { parameter: 'vpd', operator: 'lt', value: 0.4 },
        { parameter: 'vpd', operator: 'gt', value: 1.6 }
      ],
      actions: [
        {
          system: 'hvac',
          command: 'adjust_humidity',
          parameters: { target_vpd: 0.8, gradual: true }
        }
      ],
      schedule: {
        type: 'continuous',
        triggers: ['vpd_deviation']
      },
      lastExecuted: new Date(Date.now() - 2 * 60 * 1000),
      executionCount: 1423,
      successRate: 97.8
    },
    {
      id: 'rule-3',
      name: 'Predictive Irrigation',
      category: 'irrigation',
      priority: 'high',
      enabled: true,
      conditions: [
        { parameter: 'substrate_moisture', operator: 'lt', value: 65 },
        { parameter: 'plant_stress_index', operator: 'gt', value: 0.3 }
      ],
      actions: [
        {
          system: 'irrigation',
          command: 'schedule_fertigation',
          parameters: { volume_per_plant: 'calculated', ec_adjustment: true }
        }
      ],
      schedule: {
        type: 'conditional',
        triggers: ['moisture_threshold', 'stress_detection']
      },
      lastExecuted: new Date(Date.now() - 45 * 60 * 1000),
      executionCount: 342,
      successRate: 98.5
    },
    {
      id: 'rule-4',
      name: 'Energy Peak Shaving',
      category: 'energy',
      priority: 'medium',
      enabled: true,
      conditions: [
        { parameter: 'grid_demand', operator: 'gt', value: 0.85 },
        { parameter: 'energy_price', operator: 'gt', value: 0.15 }
      ],
      actions: [
        {
          system: 'lighting',
          command: 'reduce_intensity',
          parameters: { reduction_percent: 15, duration_minutes: 60 }
        }
      ],
      schedule: {
        type: 'conditional',
        triggers: ['peak_demand_alert', 'high_price_signal']
      },
      lastExecuted: new Date(Date.now() - 3 * 60 * 60 * 1000),
      executionCount: 89,
      successRate: 94.4
    }
  ]);

  useEffect(() => {
    if (autopilotActive) {
      const interval = setInterval(() => {
        // Simulate real-time system updates
        setSystemStatuses(prev => prev.map(system => ({
          ...system,
          lastUpdate: new Date(),
          metrics: {
            ...system.metrics,
            efficiency: Math.max(85, Math.min(100, system.metrics.efficiency + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.5))
          }
        })));

        // Update session metrics
        setCurrentSession(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            decisionsExecuted: prev.metrics.decisionsExecuted + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3),
            energySaved: prev.metrics.energySaved + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1
          }
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [autopilotActive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getAutonomyColor = (autonomy: string) => {
    switch (autonomy) {
      case 'autonomous': return 'text-purple-500';
      case 'assisted': return 'text-blue-500';
      case 'manual': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lighting': return <Lightbulb className="w-5 h-5" />;
      case 'climate': return <Thermometer className="w-5 h-5" />;
      case 'irrigation': return <Droplets className="w-5 h-5" />;
      case 'nutrition': return <Leaf className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      case 'energy': return <Zap className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const toggleAutopilot = () => {
    setAutopilotActive(!autopilotActive);
    setCurrentSession(prev => ({
      ...prev,
      status: autopilotActive ? 'paused' : 'active'
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              AutoPilot Engine
            </h1>
            <p className="text-gray-400">Fully autonomous cultivation management with AI-powered decision making</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg border ${
              autopilotActive 
                ? 'bg-green-600/20 border-green-500/30 text-green-400' 
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${autopilotActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-sm font-medium">
                  {autopilotActive ? 'AUTONOMOUS' : 'STANDBY'}
                </span>
              </div>
            </div>
            
            <button
              onClick={toggleAutopilot}
              className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
                autopilotActive 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {autopilotActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {autopilotActive ? 'Pause AutoPilot' : 'Engage AutoPilot'}
            </button>
          </div>
        </div>

        {/* Session Overview */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{currentSession.name}</h2>
              <p className="text-sm text-gray-400">
                Started: {currentSession.startTime.toLocaleString()} • 
                Mode: {currentSession.mode} • 
                Confidence: {currentSession.confidence.toFixed(1)}%
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-sm rounded-full ${
                currentSession.status === 'active' 
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {currentSession.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-400">Decisions Executed</div>
              <div className="text-xl font-bold text-purple-400">{currentSession.metrics.decisionsExecuted.toLocaleString()}</div>
            </div>
            
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-400">Optimizations Applied</div>
              <div className="text-xl font-bold text-blue-400">{currentSession.metrics.optimizationsApplied}</div>
            </div>
            
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-400">Issues Resolved</div>
              <div className="text-xl font-bold text-green-400">{currentSession.metrics.issuesResolved}</div>
            </div>
            
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-400">Energy Saved</div>
              <div className="text-xl font-bold text-yellow-400">{currentSession.metrics.energySaved.toFixed(1)}%</div>
            </div>
            
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-400">Yield Improvement</div>
              <div className="text-xl font-bold text-orange-400">+{currentSession.metrics.yieldImprovement.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'monitor', label: 'Monitor Mode', description: 'Watch AI recommendations' },
            { id: 'assist', label: 'Assist Mode', description: 'AI suggests, human approves' },
            { id: 'autonomous', label: 'Autonomous Mode', description: 'Full AI control' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id as any)}
              className={`px-4 py-3 rounded-lg transition-all ${
                selectedMode === mode.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <div className="text-sm font-medium">{mode.label}</div>
              <div className="text-xs opacity-75">{mode.description}</div>
            </button>
          ))}
        </div>

        {/* Mode-Specific Content */}
        {selectedMode === 'monitor' && (
          <div className="space-y-6">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Monitor Mode Active</h3>
              </div>
              <p className="text-blue-200 text-sm">You're in read-only monitoring mode. View AI recommendations and system status without making changes.</p>
            </div>
            
            {/* Read-only System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  Live Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Temperature</span>
                    <span className="text-white">24.5°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Humidity</span>
                    <span className="text-white">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">PPFD</span>
                    <span className="text-white">680 μmol/m²/s</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI Insights
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <p className="text-green-200 text-sm">Growth rate optimal</p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <p className="text-yellow-200 text-sm">Consider reducing irrigation in 2 hours</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Yield Prediction</span>
                    <span className="text-green-400">+12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Energy Efficiency</span>
                    <span className="text-blue-400">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMode === 'assist' && (
          <div className="space-y-6">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Assist Mode Active</h3>
              </div>
              <p className="text-blue-200 text-sm">AI provides recommendations that require your approval before execution.</p>
            </div>
            
            {/* Pending Recommendations */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                Pending Recommendations
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Adjust Lighting Schedule</h4>
                    <span className="text-xs text-yellow-400">High Priority</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    AI suggests reducing light intensity by 15% for the next 4 hours to optimize energy efficiency.
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">
                      Reject
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                      Modify
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Climate Adjustment</h4>
                    <span className="text-xs text-blue-400">Medium Priority</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Increase humidity to 70% to support current growth phase.
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMode === 'autonomous' && (
          <div className="space-y-6">
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-white">Autonomous Mode Active</h3>
              </div>
              <p className="text-purple-200 text-sm">AI has full control and makes real-time decisions automatically.</p>
            </div>
            
            {/* Real-time AI Decisions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Recent AI Actions
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <div>
                      <p className="text-green-200 text-sm">Lighting adjusted</p>
                      <p className="text-green-400 text-xs">2 minutes ago</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                    <div>
                      <p className="text-blue-200 text-sm">Climate optimized</p>
                      <p className="text-blue-400 text-xs">5 minutes ago</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded">
                    <div>
                      <p className="text-purple-200 text-sm">Nutrient dosing initiated</p>
                      <p className="text-purple-400 text-xs">8 minutes ago</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  Autonomous Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Auto-adjustments</span>
                    <div className="flex items-center">
                      <div className="w-8 h-4 bg-green-500 rounded-full relative">
                        <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Emergency override</span>
                    <div className="flex items-center">
                      <div className="w-8 h-4 bg-green-500 rounded-full relative">
                        <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Learning mode</span>
                    <div className="flex items-center">
                      <div className="w-8 h-4 bg-gray-600 rounded-full relative">
                        <div className="absolute left-0 top-0 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">
                    Emergency Stop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Status Grid - Always visible below mode content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-8">
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              System Status
            </h2>
            
            <div className="space-y-4">
              {systemStatuses.map(system => (
                <div 
                  key={system.id} 
                  className={`p-4 bg-gray-800 rounded-lg cursor-pointer transition-all ${
                    selectedSystem === system.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedSystem(selectedSystem === system.id ? null : system.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(system.category)}
                      <span className="font-medium text-white">{system.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getStatusColor(system.status)}`}>
                        {system.status.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getAutonomyColor(system.autonomy)} bg-current/10`}>
                        {system.autonomy.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Efficiency</div>
                      <div className="font-semibold text-white">{system.metrics.efficiency.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Current</div>
                      <div className="font-semibold text-white">
                        {typeof system.controls.current === 'number' 
                          ? system.controls.current.toFixed(1) 
                          : system.controls.current} {system.controls.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Target</div>
                      <div className="font-semibold text-green-400">
                        {typeof system.controls.target === 'number' 
                          ? system.controls.target.toFixed(1) 
                          : system.controls.target} {system.controls.unit}
                      </div>
                    </div>
                  </div>
                  
                  {selectedSystem === system.id && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="text-gray-400">Uptime</div>
                          <div className="text-white">{system.metrics.uptime.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Response Time</div>
                          <div className="text-white">{system.metrics.responseTime.toFixed(1)}s</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Last Update</div>
                          <div className="text-white">{system.lastUpdate.toLocaleTimeString()}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-all">
                          Override
                        </button>
                        <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-all">
                          Calibrate
                        </button>
                        <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-all">
                          History
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Automation Rules */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-yellow-400" />
                Active Rules
              </h2>
              <button 
                onClick={() => setShowRuleEditor(true)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-all"
              >
                Add Rule
              </button>
            </div>
            
            <div className="space-y-3">
              {automationRules.filter(rule => rule.enabled).map(rule => (
                <div key={rule.id} className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(rule.category)}
                      <span className="font-medium text-white">{rule.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        rule.priority === 'critical' ? 'bg-red-600' :
                        rule.priority === 'high' ? 'bg-orange-600' :
                        rule.priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}>
                        {rule.priority.toUpperCase()}
                      </span>
                      
                      <button className={`w-6 h-6 rounded-full ${
                        rule.enabled ? 'bg-green-500' : 'bg-gray-600'
                      }`}>
                        <CheckCircle className="w-4 h-4 text-white mx-auto" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-gray-400">Executions</div>
                      <div className="text-white">{rule.executionCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Success Rate</div>
                      <div className="text-green-400">{rule.successRate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Last Run</div>
                      <div className="text-white">
                        {rule.lastExecuted ? rule.lastExecuted.toLocaleTimeString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Objectives */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Current Objectives
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSession.objectives.map((objective, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-white">{objective}</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${75 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 25}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-400 mt-1">
                  Progress: {(75 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 25).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Footer */}
        <div className="fixed bottom-6 right-6 bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autopilotActive ? 'bg-purple-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm text-gray-400">
                AutoPilot {autopilotActive ? 'Active' : 'Standby'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {autopilotActive ? `${currentSession.metrics.decisionsExecuted} decisions executed` : 'Ready to engage'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}