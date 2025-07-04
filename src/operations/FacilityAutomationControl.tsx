'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wifi,
  Power,
  Gauge,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  Timer,
  Shield,
  Database,
  ChevronRight,
  TrendingUp,
  Save
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'time' | 'sensor' | 'event' | 'manual';
    condition: string;
    value: any;
  };
  actions: {
    device: string;
    action: string;
    value: any;
  }[];
  enabled: boolean;
  lastTriggered?: Date;
  status: 'active' | 'inactive' | 'error';
}

interface DeviceStatus {
  id: string;
  name: string;
  type: 'light' | 'hvac' | 'pump' | 'fan' | 'sensor';
  status: 'online' | 'offline' | 'error';
  currentValue?: any;
  targetValue?: any;
  powerUsage?: number;
  lastUpdate: Date;
}

interface SystemHealth {
  category: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  metrics: {
    label: string;
    value: number;
    unit: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
}

export function FacilityAutomationControl() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'devices' | 'schedules'>('overview');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [automationMode, setAutomationMode] = useState<'auto' | 'manual' | 'override'>('auto');
  const [showAddRule, setShowAddRule] = useState(false);

  // System status
  const [systemStatus, setSystemStatus] = useState({
    connected: true,
    activeRules: 12,
    totalDevices: 48,
    onlineDevices: 46,
    powerUsage: 145.2,
    dataPoints: 1847
  });

  // Automation rules
  const automationRules: AutomationRule[] = [
    {
      id: 'rule-1',
      name: 'Morning Ramp-Up',
      description: 'Gradually increase light intensity and adjust climate for day cycle',
      trigger: {
        type: 'time',
        condition: 'equals',
        value: '06:00'
      },
      actions: [
        { device: 'LED-Array-1', action: 'dim', value: 100 },
        { device: 'HVAC-System', action: 'setTemp', value: 78 },
        { device: 'CO2-Controller', action: 'enable', value: 1200 }
      ],
      enabled: true,
      lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: 'rule-2',
      name: 'High Temperature Protection',
      description: 'Emergency cooling when temperature exceeds threshold',
      trigger: {
        type: 'sensor',
        condition: 'greater_than',
        value: { sensor: 'temp', threshold: 85 }
      },
      actions: [
        { device: 'HVAC-System', action: 'boost_cooling', value: true },
        { device: 'Exhaust-Fans', action: 'speed', value: 100 },
        { device: 'LED-Array-1', action: 'dim', value: 80 }
      ],
      enabled: true,
      status: 'inactive'
    },
    {
      id: 'rule-3',
      name: 'Fertigation Schedule',
      description: 'Automated nutrient delivery based on growth stage',
      trigger: {
        type: 'time',
        condition: 'multiple',
        value: ['08:00', '14:00', '20:00']
      },
      actions: [
        { device: 'Pump-A', action: 'run', value: 180 },
        { device: 'Pump-B', action: 'run', value: 180 },
        { device: 'Mixer', action: 'enable', value: true }
      ],
      enabled: true,
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: 'rule-4',
      name: 'VPD Optimization',
      description: 'Maintain optimal VPD by adjusting temperature and humidity',
      trigger: {
        type: 'sensor',
        condition: 'out_of_range',
        value: { sensor: 'vpd', min: 0.8, max: 1.2 }
      },
      actions: [
        { device: 'HVAC-System', action: 'adjust_vpd', value: 'auto' },
        { device: 'Humidifier', action: 'adjust', value: 'auto' }
      ],
      enabled: true,
      status: 'active'
    }
  ];

  // Device status
  const devices: DeviceStatus[] = [
    {
      id: 'led-1',
      name: 'LED Array - Flower A',
      type: 'light',
      status: 'online',
      currentValue: 850,
      targetValue: 850,
      powerUsage: 42.5,
      lastUpdate: new Date()
    },
    {
      id: 'hvac-1',
      name: 'HVAC Unit 1',
      type: 'hvac',
      status: 'online',
      currentValue: { temp: 75.2, humidity: 55 },
      targetValue: { temp: 75, humidity: 55 },
      powerUsage: 28.3,
      lastUpdate: new Date()
    },
    {
      id: 'pump-1',
      name: 'Nutrient Pump A',
      type: 'pump',
      status: 'online',
      currentValue: 'idle',
      powerUsage: 0.5,
      lastUpdate: new Date()
    },
    {
      id: 'fan-1',
      name: 'Exhaust Fan 1',
      type: 'fan',
      status: 'online',
      currentValue: 60,
      targetValue: 60,
      powerUsage: 2.1,
      lastUpdate: new Date()
    },
    {
      id: 'sensor-1',
      name: 'Environmental Sensor Grid',
      type: 'sensor',
      status: 'error',
      currentValue: { nodes: 23, active: 22 },
      lastUpdate: new Date(Date.now() - 5 * 60 * 1000)
    }
  ];

  // System health metrics
  const systemHealth: SystemHealth[] = [
    {
      category: 'Network',
      status: 'healthy',
      message: 'All devices connected',
      metrics: [
        { label: 'Latency', value: 12, unit: 'ms', trend: 'stable' },
        { label: 'Packet Loss', value: 0.1, unit: '%', trend: 'down' },
        { label: 'Bandwidth', value: 45, unit: 'Mbps', trend: 'up' }
      ]
    },
    {
      category: 'Power',
      status: 'warning',
      message: 'Approaching peak capacity',
      metrics: [
        { label: 'Current Draw', value: 145.2, unit: 'kW', trend: 'up' },
        { label: 'Peak Capacity', value: 160, unit: 'kW', trend: 'stable' },
        { label: 'Power Factor', value: 0.92, unit: '', trend: 'stable' }
      ]
    },
    {
      category: 'Data',
      status: 'healthy',
      message: 'All sensors reporting',
      metrics: [
        { label: 'Data Points/min', value: 1847, unit: '', trend: 'stable' },
        { label: 'Storage Used', value: 68, unit: '%', trend: 'up' },
        { label: 'Sync Status', value: 100, unit: '%', trend: 'stable' }
      ]
    }
  ];

  // Real-time monitoring data
  const monitoringData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    temperature: 72 + Math.sin(i / 4) * 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
    humidity: 55 + Math.cos(i / 3) * 8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3,
    co2: 1000 + Math.sin(i / 6) * 200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50,
    power: 100 + Math.sin(i / 4) * 40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
      case 'inactive':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'offline':
      case 'error':
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'light': return <Sun className="w-5 h-5" />;
      case 'hvac': return <Thermometer className="w-5 h-5" />;
      case 'pump': return <Droplets className="w-5 h-5" />;
      case 'fan': return <Wind className="w-5 h-5" />;
      case 'sensor': return <Activity className="w-5 h-5" />;
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Facility Automation Control</h2>
          <p className="text-gray-400">Integrated environmental management system</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={automationMode}
            onChange={(e) => setAutomationMode(e.target.value as any)}
            className={`px-4 py-2 rounded-lg border font-medium ${
              automationMode === 'auto' ? 'bg-green-900/20 border-green-600 text-green-400' :
              automationMode === 'manual' ? 'bg-yellow-900/20 border-yellow-600 text-yellow-400' :
              'bg-red-900/20 border-red-600 text-red-400'
            }`}
          >
            <option value="auto">Auto Mode</option>
            <option value="manual">Manual Mode</option>
            <option value="override">Override Mode</option>
          </select>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="grid grid-cols-6 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Wifi className={`w-4 h-4 ${systemStatus.connected ? 'text-green-400' : 'text-red-400'}`} />
              <span className="text-sm text-gray-400">Network</span>
            </div>
            <p className={`text-lg font-bold ${systemStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
              {systemStatus.connected ? 'Connected' : 'Offline'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Active Rules</p>
            <p className="text-lg font-bold text-white">{systemStatus.activeRules}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Devices Online</p>
            <p className="text-lg font-bold text-white">
              {systemStatus.onlineDevices}/{systemStatus.totalDevices}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Power Usage</p>
            <p className="text-lg font-bold text-yellow-400">{systemStatus.powerUsage} kW</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Data Points/min</p>
            <p className="text-lg font-bold text-blue-400">{systemStatus.dataPoints}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">System Load</p>
            <p className="text-lg font-bold text-green-400">32%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'rules', 'devices', 'schedules'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* System Health */}
          <div className="grid grid-cols-3 gap-4">
            {systemHealth.map((health, idx) => (
              <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">{health.category}</h3>
                  {getStatusIcon(health.status)}
                </div>
                <p className="text-sm text-gray-400 mb-3">{health.message}</p>
                <div className="space-y-2">
                  {health.metrics.map((metric, midx) => (
                    <div key={midx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {metric.value}{metric.unit}
                        </span>
                        {metric.trend && (
                          <TrendingUp className={`w-3 h-3 ${
                            metric.trend === 'up' ? 'text-green-400' :
                            metric.trend === 'down' ? 'text-red-400 rotate-180' :
                            'text-gray-400'
                          }`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Monitoring */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">24-Hour Environmental Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monitoringData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis yAxisId="left" stroke="#9CA3AF" />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} name="Temp (°F)" />
                  <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#3B82F6" strokeWidth={2} name="RH (%)" />
                  <Line yAxisId="right" type="monotone" dataKey="co2" stroke="#10B981" strokeWidth={2} name="CO2 (ppm)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-600/30">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-4">
              <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-center">
                <Play className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Start Day Cycle</p>
              </button>
              <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-center">
                <Moon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Night Mode</p>
              </button>
              <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-center">
                <Shield className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">Emergency Stop</p>
              </button>
              <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-center">
                <RotateCcw className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">System Reset</p>
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'rules' && (
        <>
          {/* Automation Rules */}
          <div className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Automation Rules</h3>
              <button
                onClick={() => setShowAddRule(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Rule
              </button>
            </div>
            <div className="divide-y divide-gray-800">
              {automationRules.map((rule) => (
                <div key={rule.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-white">{rule.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          rule.status === 'active' ? 'bg-green-900/20 text-green-400' :
                          rule.status === 'inactive' ? 'bg-gray-900/20 text-gray-400' :
                          'bg-red-900/20 text-red-400'
                        }`}>
                          {rule.status}
                        </span>
                        <div className="flex items-center gap-2 ml-auto">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={rule.enabled} className="sr-only" />
                            <div className="w-10 h-5 bg-gray-700 rounded-full"></div>
                            <div className={`absolute left-1 top-1 w-3 h-3 rounded-full transition-transform ${
                              rule.enabled ? 'bg-green-400 translate-x-5' : 'bg-gray-400'
                            }`}></div>
                          </label>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{rule.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-gray-500">Trigger:</span>
                          <span className="text-gray-300 ml-2">
                            {rule.trigger.type === 'time' ? `Time = ${rule.trigger.value}` :
                             rule.trigger.type === 'sensor' ? `Sensor ${rule.trigger.condition}` :
                             rule.trigger.type}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Actions:</span>
                          <span className="text-gray-300 ml-2">{rule.actions.length} devices</span>
                        </div>
                        {rule.lastTriggered && (
                          <div>
                            <span className="text-gray-500">Last triggered:</span>
                            <span className="text-gray-300 ml-2">
                              {new Date(rule.lastTriggered).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'devices' && (
        <>
          {/* Device Grid */}
          <div className="grid grid-cols-3 gap-4">
            {devices.map((device) => (
              <div key={device.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      device.status === 'online' ? 'bg-green-900/20 text-green-400' :
                      device.status === 'offline' ? 'bg-gray-900/20 text-gray-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {getDeviceIcon(device.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{device.name}</h4>
                      <p className="text-xs text-gray-400">{device.type}</p>
                    </div>
                  </div>
                  {getStatusIcon(device.status)}
                </div>

                <div className="space-y-2 text-sm">
                  {device.currentValue && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Current</span>
                      <span className="text-white font-medium">
                        {typeof device.currentValue === 'object' 
                          ? `${device.currentValue.temp}°F / ${device.currentValue.humidity}%`
                          : device.currentValue}
                      </span>
                    </div>
                  )}
                  {device.powerUsage !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Power</span>
                      <span className="text-yellow-400">{device.powerUsage} kW</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Update</span>
                    <span className="text-gray-300">
                      {new Date(device.lastUpdate).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm transition-colors">
                  Configure
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'schedules' && (
        <>
          {/* Schedule Timeline */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Schedule Timeline</h3>
            <div className="relative">
              {/* Time markers */}
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                {Array.from({ length: 25 }, (_, i) => (
                  <span key={i}>{i === 24 ? '0' : i}</span>
                ))}
              </div>
              
              {/* Schedule bars */}
              <div className="space-y-2">
                <div className="relative h-8 bg-gray-800 rounded">
                  <div className="absolute left-[25%] w-[50%] h-full bg-yellow-600/30 rounded flex items-center justify-center text-xs text-yellow-400">
                    Lights On
                  </div>
                </div>
                <div className="relative h-8 bg-gray-800 rounded">
                  <div className="absolute left-[29%] w-[46%] h-full bg-blue-600/30 rounded flex items-center justify-center text-xs text-blue-400">
                    CO2 Injection
                  </div>
                </div>
                <div className="relative h-8 bg-gray-800 rounded">
                  <div className="absolute left-[33%] w-[4%] h-full bg-green-600/30 rounded"></div>
                  <div className="absolute left-[58%] w-[4%] h-full bg-green-600/30 rounded"></div>
                  <div className="absolute left-[83%] w-[4%] h-full bg-green-600/30 rounded"></div>
                  <div className="absolute top-9 left-[33%] text-xs text-green-400">Fertigation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Scheduled Events</h3>
            <div className="space-y-3">
              {[
                { time: '14:00', event: 'Midday Fertigation', duration: '3 min', status: 'scheduled' },
                { time: '18:00', event: 'Sunset Transition', duration: '30 min', status: 'scheduled' },
                { time: '18:30', event: 'Night Climate Mode', duration: '11.5 hrs', status: 'scheduled' },
                { time: '20:00', event: 'Evening Fertigation', duration: '3 min', status: 'scheduled' }
              ].map((event, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Timer className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-white">{event.event}</p>
                      <p className="text-xs text-gray-400">Duration: {event.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{event.time}</p>
                    <p className="text-xs text-green-400">{event.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}