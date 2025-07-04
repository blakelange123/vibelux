'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Droplets,
  Wind,
  Sun,
  Gauge,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Thermometer,
  Clock,
  Calendar,
  Map,
  Layers,
  Grid3x3,
  Zap,
  Shield,
  Database,
  Cloud,
  Wifi,
  Monitor,
  Server,
  HardDrive,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Users,
  UserCheck,
  Key,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Play,
  Pause,
  Square,
  SkipForward,
  Target,
  Sliders,
  Power,
  X,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface Zone {
  id: string;
  name: string;
  type: 'greenhouse' | 'nursery' | 'storage' | 'processing';
  status: 'optimal' | 'warning' | 'critical' | 'offline';
  climate: {
    temperature: number;
    humidity: number;
    co2: number;
    light: number;
  };
  setpoints: {
    temperature: number;
    humidity: number;
    co2: number;
    light: number;
  };
}

interface ControlStrategy {
  id: string;
  name: string;
  category: 'climate' | 'irrigation' | 'lighting' | 'security';
  priority: number;
  enabled: boolean;
  conditions: Array<{
    type: string;
    operator?: string;
    value?: number;
    start?: string;
    end?: string;
  }>;
  actions: Array<{
    type: string;
    target?: string | number;
    rate?: number;
    position?: number;
    activate?: boolean;
    duration?: number;
    interval?: number;
  }>;
}

export function VibeluxBMS() {
  const [activeTab, setActiveTab] = useState<'overview' | 'zones' | 'strategies' | 'analytics' | 'settings'>('overview');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showZoneWarning, setShowZoneWarning] = useState(false);
  
  // IT System Health Status (in production, this would come from the monitoring system)
  const [itSystemHealth] = useState({
    status: 'operational' as 'operational' | 'degraded' | 'critical',
    uptime: 99.9,
    latency: 23,
    network: true,
    security: true,
    lastIncident: null as string | null
  });
  
  // Load zones from configuration, filtering only BMS-controlled zones
  const loadBMSZones = (): Zone[] => {
    if (typeof window === 'undefined') return [];
    
    const configuredZones = JSON.parse(localStorage.getItem('facility-zones') || '[]');
    const bmsZones = configuredZones
      .filter((zone: any) => zone.controlSystem === 'bms' || zone.controlAuthority.climate === 'bms')
      .map((zone: any) => ({
        id: zone.id,
        name: zone.name,
        type: zone.type,
        status: 'optimal' as const,
        climate: {
          temperature: 24 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4 - 2,
          humidity: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 - 10,
          co2: 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 - 50,
          light: 80 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 - 10
        },
        setpoints: {
          temperature: (zone.setpoints?.temperature?.min + zone.setpoints?.temperature?.max) / 2 || 24,
          humidity: (zone.setpoints?.humidity?.min + zone.setpoints?.humidity?.max) / 2 || 60,
          co2: (zone.setpoints?.co2?.min + zone.setpoints?.co2?.max) / 2 || 400,
          light: (zone.setpoints?.light?.min + zone.setpoints?.light?.max) / 2 || 80
        }
      }));
    
    return bmsZones;
  };
  
  const [zones, setZones] = useState<Zone[]>(loadBMSZones());
  
  // Check if no zones are configured
  useEffect(() => {
    const bmsZones = loadBMSZones();
    if (bmsZones.length === 0) {
      setShowZoneWarning(true);
    } else {
      setZones(bmsZones);
      setSelectedZone(bmsZones[0]?.id || '');
    }
  }, []);

  const [strategies, setStrategies] = useState<ControlStrategy[]>([
    {
      id: 'strategy-1',
      name: 'Morning Temperature Rise',
      category: 'climate',
      priority: 1,
      enabled: true,
      conditions: [
        { type: 'time', start: '06:00', end: '08:00' },
        { type: 'temperature', operator: '<', value: 22 }
      ],
      actions: [
        { type: 'heating', target: 'gradual', rate: 2 },
        { type: 'screens', position: 0 },
        { type: 'windows', position: 0 }
      ]
    },
    {
      id: 'strategy-2',
      name: 'High Radiation Cooling',
      category: 'climate',
      priority: 2,
      enabled: true,
      conditions: [
        { type: 'radiation', operator: '>', value: 800 },
        { type: 'temperature', operator: '>', value: 28 }
      ],
      actions: [
        { type: 'screens', position: 80 },
        { type: 'windows', position: 100 },
        { type: 'cooling', activate: true }
      ]
    },
    {
      id: 'strategy-3',
      name: 'Night Irrigation',
      category: 'irrigation',
      priority: 1,
      enabled: true,
      conditions: [
        { type: 'time', start: '22:00', end: '04:00' },
        { type: 'moisture', operator: '<', value: 60 }
      ],
      actions: [
        { type: 'irrigation', duration: 10, interval: 120 },
        { type: 'ec', target: 2.5 },
        { type: 'ph', target: 5.8 }
      ]
    }
  ]);

  const updateZoneSetpoint = (zoneId: string, parameter: string, value: number) => {
    setZones(zones.map(zone => 
      zone.id === zoneId 
        ? { ...zone, setpoints: { ...zone.setpoints, [parameter]: value } }
        : zone
    ));
  };

  const toggleStrategy = (strategyId: string) => {
    setStrategies(strategies.map(strategy =>
      strategy.id === strategyId
        ? { ...strategy, enabled: !strategy.enabled }
        : strategy
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-400 bg-green-400/10';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10';
      case 'critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatCondition = (condition: any) => {
    if (condition.type === 'time') {
      return `Time: ${condition.start} - ${condition.end}`;
    }
    return `${condition.type} ${condition.operator} ${condition.value}`;
  };

  const formatAction = (action: any) => {
    if (action.type === 'heating') {
      return `Heating: ${action.target} rise at ${action.rate}°C/h`;
    }
    if (action.type === 'screens' || action.type === 'windows') {
      return `${action.type}: ${action.position}% position`;
    }
    if (action.type === 'cooling') {
      return `Cooling: ${action.activate ? 'ON' : 'OFF'}`;
    }
    if (action.type === 'irrigation') {
      return `Irrigation: ${action.duration}min every ${action.interval}min`;
    }
    if (action.type === 'ec' || action.type === 'ph') {
      return `${action.type.toUpperCase()}: target ${action.target}`;
    }
    return JSON.stringify(action);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Vibelux BMS</h1>
              <p className="text-gray-400">Building Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400">System Online</span>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mt-6">
          {[
            { id: 'overview', label: 'Overview', icon: Grid3x3 },
            { id: 'zones', label: 'Zone Control', icon: Map },
            { id: 'strategies', label: 'Control Strategies', icon: Target },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* No Zones Warning */}
        {showZoneWarning && zones.length === 0 && (
          <div className="mb-6 p-6 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">No BMS Zones Configured</h3>
                <p className="text-yellow-300 mb-4">
                  No zones are currently assigned to BMS control. You need to configure zones before using the BMS system.
                </p>
                <a
                  href="/settings/zones"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Configure Zones
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* IT System Health Widget */}
            <div className={`bg-gray-900 rounded-lg p-4 border ${
              itSystemHealth.status === 'operational' ? 'border-gray-800' :
              itSystemHealth.status === 'degraded' ? 'border-yellow-600/50' :
              'border-red-600/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Activity className={`w-5 h-5 ${
                      itSystemHealth.status === 'operational' ? 'text-purple-400' :
                      itSystemHealth.status === 'degraded' ? 'text-yellow-400' :
                      'text-red-400'
                    }`} />
                    <h3 className="font-medium text-white">IT System Status</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      itSystemHealth.status === 'operational' ? 'bg-green-400 animate-pulse' :
                      itSystemHealth.status === 'degraded' ? 'bg-yellow-400' :
                      'bg-red-400 animate-pulse'
                    }`}></div>
                    <span className={`text-sm ${
                      itSystemHealth.status === 'operational' ? 'text-green-400' :
                      itSystemHealth.status === 'degraded' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {itSystemHealth.status === 'operational' ? 'All Systems Operational' :
                       itSystemHealth.status === 'degraded' ? 'Systems Degraded' :
                       'Critical Issues Detected'}
                    </span>
                  </div>
                </div>
                <a 
                  href="/monitoring" 
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  View Details
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${
                    itSystemHealth.uptime > 99 ? 'text-white' : 'text-yellow-400'
                  }`}>{itSystemHealth.uptime}%</p>
                  <p className="text-xs text-gray-400">Uptime</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${
                    itSystemHealth.latency < 100 ? 'text-white' : 'text-yellow-400'
                  }`}>{itSystemHealth.latency}ms</p>
                  <p className="text-xs text-gray-400">Latency</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${
                    itSystemHealth.network ? 'text-green-400' : 'text-red-400'
                  }`}>{itSystemHealth.network ? '✓' : '✗'}</p>
                  <p className="text-xs text-gray-400">Network</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${
                    itSystemHealth.security ? 'text-green-400' : 'text-red-400'
                  }`}>{itSystemHealth.security ? '✓' : '✗'}</p>
                  <p className="text-xs text-gray-400">Security</p>
                </div>
              </div>
              {itSystemHealth.lastIncident && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <p className="text-xs text-gray-400">
                    Last incident: <span className="text-yellow-400">{itSystemHealth.lastIncident}</span>
                  </p>
                </div>
              )}
            </div>

            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                  <span className="text-green-400 text-sm">Normal</span>
                </div>
                <p className="text-2xl font-bold text-white">24.2°C</p>
                <p className="text-sm text-gray-400">Average Temperature</p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <span className="text-green-400 text-sm">Normal</span>
                </div>
                <p className="text-2xl font-bold text-white">62%</p>
                <p className="text-sm text-gray-400">Average Humidity</p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Wind className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 text-sm">Normal</span>
                </div>
                <p className="text-2xl font-bold text-white">415 ppm</p>
                <p className="text-sm text-gray-400">Average CO₂</p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Sun className="w-5 h-5 text-yellow-400" />
                  <span className="text-green-400 text-sm">Normal</span>
                </div>
                <p className="text-2xl font-bold text-white">82%</p>
                <p className="text-sm text-gray-400">Average Light</p>
              </div>
            </div>

            {/* Zone Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {zones.map(zone => (
                <div key={zone.id} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">{zone.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(zone.status)}`}>
                      {zone.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Temperature</span>
                      <span className="text-white">{zone.climate.temperature}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Humidity</span>
                      <span className="text-white">{zone.climate.humidity}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">CO₂</span>
                      <span className="text-white">{zone.climate.co2} ppm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Light</span>
                      <span className="text-white">{zone.climate.light}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zone Control Tab */}
        {activeTab === 'zones' && (
          <div className="space-y-6">
            {/* Zone Selector */}
            <div className="flex gap-2">
              {zones.map(zone => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedZone === zone.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {zone.name}
                </button>
              ))}
            </div>

            {/* Selected Zone Controls */}
            {zones.filter(z => z.id === selectedZone).map(zone => (
              <div key={zone.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Temperature Control */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Thermometer className="w-5 h-5 text-orange-400" />
                      <h3 className="font-semibold text-white">Temperature Control</h3>
                    </div>
                    <span className="text-orange-400">{zone.climate.temperature}°C</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Setpoint: {zone.setpoints.temperature}°C
                      </label>
                      <input
                        type="range"
                        min="15"
                        max="35"
                        step="0.5"
                        value={zone.setpoints.temperature}
                        onChange={(e) => updateZoneSetpoint(zone.id, 'temperature', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>15°C</span>
                        <span>35°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Humidity Control */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Droplets className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-white">Humidity Control</h3>
                    </div>
                    <span className="text-blue-400">{zone.climate.humidity}%</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Setpoint: {zone.setpoints.humidity}%
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="90"
                        step="1"
                        value={zone.setpoints.humidity}
                        onChange={(e) => updateZoneSetpoint(zone.id, 'humidity', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>30%</span>
                        <span>90%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CO2 Control */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Wind className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-white">CO₂ Control</h3>
                    </div>
                    <span className="text-green-400">{zone.climate.co2} ppm</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Setpoint: {zone.setpoints.co2} ppm
                      </label>
                      <input
                        type="range"
                        min="300"
                        max="1000"
                        step="10"
                        value={zone.setpoints.co2}
                        onChange={(e) => updateZoneSetpoint(zone.id, 'co2', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>300 ppm</span>
                        <span>1000 ppm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Light Control */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5 text-yellow-400" />
                      <h3 className="font-semibold text-white">Light Control</h3>
                    </div>
                    <span className="text-yellow-400">{zone.climate.light}%</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        Setpoint: {zone.setpoints.light}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={zone.setpoints.light}
                        onChange={(e) => updateZoneSetpoint(zone.id, 'light', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Control Strategies Tab */}
        {activeTab === 'strategies' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Control Strategies</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Add Strategy
              </button>
            </div>

            <div className="space-y-4">
              {strategies.map(strategy => (
                <div key={strategy.id} className="bg-gray-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{strategy.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        strategy.category === 'climate' ? 'bg-blue-900/30 text-blue-400' :
                        strategy.category === 'irrigation' ? 'bg-green-900/30 text-green-400' :
                        strategy.category === 'lighting' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-purple-900/30 text-purple-400'
                      }`}>
                        {strategy.category}
                      </span>
                      <span className="text-gray-400 text-sm">Priority: {strategy.priority}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStrategy(strategy.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          strategy.enabled ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            strategy.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Conditions</h4>
                      <ul className="space-y-1">
                        {strategy.conditions.map((condition, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            {formatCondition(condition)}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-300 mb-2">Actions</h4>
                      <ul className="space-y-1">
                        {strategy.actions.map((action, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            {formatAction(action)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">System Analytics</h2>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300 hover:bg-gray-700">Today</button>
                <button className="px-3 py-1 bg-purple-600 rounded text-sm text-white">7 Days</button>
                <button className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300 hover:bg-gray-700">30 Days</button>
              </div>
            </div>
            
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Energy Saved</span>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">2,847 kWh</p>
                <p className="text-xs text-green-400 mt-1">+12.5% from last week</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Avg Temperature</span>
                  <TrendingDown className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">23.8°C</p>
                <p className="text-xs text-blue-400 mt-1">-0.5°C from target</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">System Efficiency</span>
                  <Gauge className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">94.2%</p>
                <p className="text-xs text-purple-400 mt-1">Above target</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Active Alerts</span>
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-xs text-yellow-400 mt-1">2 warnings, 1 info</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Energy Consumption Chart */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Energy Consumption Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={Array.from({ length: 24 }, (_, i) => ({
                      hour: i,
                      hvac: 20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
                      lighting: 15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 25,
                      irrigation: 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
                      other: 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#E5E7EB' }}
                    />
                    <Area type="monotone" dataKey="hvac" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="lighting" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="irrigation" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="other" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-gray-400">HVAC</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-gray-400">Lighting</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-400">Irrigation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-gray-400">Other</span>
                  </div>
                </div>
              </div>
              
              {/* Climate Performance */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Climate Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={Array.from({ length: 48 }, (_, i) => ({
                      time: i,
                      temperature: 24 + Math.sin(i * 0.2) * 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.5,
                      humidity: 60 + Math.cos(i * 0.15) * 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
                      vpd: 1.2 + Math.sin(i * 0.1) * 0.3 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.1
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis yAxisId="temp" stroke="#9CA3AF" />
                    <YAxis yAxisId="vpd" orientation="right" stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#E5E7EB' }}
                    />
                    <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} dot={false} />
                    <Line yAxisId="temp" type="monotone" dataKey="humidity" stroke="#06B6D4" strokeWidth={2} dot={false} />
                    <Line yAxisId="vpd" type="monotone" dataKey="vpd" stroke="#A855F7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-400">Temperature (°C)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                    <span className="text-gray-400">Humidity (%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-gray-400">VPD (kPa)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zone Performance Comparison */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="font-semibold text-white mb-4">Zone Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={zones.map(zone => ({
                    name: zone.name,
                    efficiency: 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
                    targetHit: 75 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 25,
                    energySaved: 60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#E5E7EB' }}
                  />
                  <Bar dataKey="efficiency" fill="#8B5CF6" />
                  <Bar dataKey="targetHit" fill="#10B981" />
                  <Bar dataKey="energySaved" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-gray-400">Efficiency %</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-400">Target Hit %</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-gray-400">Energy Saved %</span>
                </div>
              </div>
            </div>

            {/* System Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Energy Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'HVAC', value: 45, color: '#3B82F6' },
                        { name: 'Lighting', value: 30, color: '#8B5CF6' },
                        { name: 'Irrigation', value: 15, color: '#10B981' },
                        { name: 'Other', value: 10, color: '#F59E0B' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'HVAC', value: 45, color: '#3B82F6' },
                        { name: 'Lighting', value: 30, color: '#8B5CF6' },
                        { name: 'Irrigation', value: 15, color: '#10B981' },
                        { name: 'Other', value: 10, color: '#F59E0B' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#E5E7EB' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Monthly Savings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Energy</span>
                    <span className="text-green-400 font-medium">+$3,240</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Water</span>
                    <span className="text-green-400 font-medium">+$890</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Maintenance</span>
                    <span className="text-green-400 font-medium">+$450</span>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Total Saved</span>
                      <span className="text-green-400 font-bold text-xl">$4,580</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Alert Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-red-900/20 rounded">
                    <span className="text-red-400 text-sm">Critical</span>
                    <span className="text-red-400 font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-900/20 rounded">
                    <span className="text-yellow-400 text-sm">Warning</span>
                    <span className="text-yellow-400 font-medium">2</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-900/20 rounded">
                    <span className="text-blue-400 text-sm">Info</span>
                    <span className="text-blue-400 font-medium">5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">System Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Temperature Unit</span>
                    <select className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white">
                      <option>Celsius</option>
                      <option>Fahrenheit</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Auto Backup</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Alert Notifications</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Email Reports</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">System Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-4">Connection Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Server Address</label>
                      <input
                        type="text"
                        defaultValue="192.168.1.100"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Port</label>
                      <input
                        type="number"
                        defaultValue="502"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-4">Data Logging</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Enable Data Logging</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Log Interval (minutes)</label>
                      <input
                        type="number"
                        defaultValue="5"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                  Save Settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: 2px solid #ffffff;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: 2px solid #ffffff;
        }
      `}</style>
    </div>
  );
}