'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  Thermometer,
  Droplets,
  Wind,
  Zap,
  Shield,
  Plus,
  Heart,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  FileText,
  Bell,
  Package,
  Battery,
  Gauge,
  Filter,
  Search,
  ChevronRight,
  Info,
  Database,
  Network,
  Server,
  Monitor,
  Smartphone,
  Wifi,
  Radio,
  CircuitBoard,
  Timer,
  BarChart3,
  LineChart,
  PieChart,
  Hash,
  Layers,
  GitBranch,
  Target,
  Flag,
  MapPin,
  Navigation,
  Compass
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  Scatter,
  ScatterChart
} from 'recharts';

interface SystemComponent {
  id: string;
  name: string;
  type: 'hardware' | 'software' | 'network' | 'sensor' | 'actuator';
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  health: number;
  lastMaintenance: Date;
  nextMaintenance: Date;
  operatingHours: number;
  errorCount: number;
  efficiency: number;
  location: string;
  model: string;
  serialNumber: string;
  firmware: string;
}

interface MaintenanceTask {
  id: string;
  componentId: string;
  componentName: string;
  type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedTime: number; // hours
  dueDate: Date;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  assignee?: string;
  cost: number;
}

interface DiagnosticTest {
  id: string;
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'warning' | 'running';
  lastRun: Date;
  duration: number; // seconds
  details: string;
}

export function SystemDiagnostics() {
  const [activeView, setActiveView] = useState<'overview' | 'components' | 'maintenance' | 'diagnostics'>('overview');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [autoMode, setAutoMode] = useState(true);

  // System components data
  const [components] = useState<SystemComponent[]>([
    {
      id: 'hvac-1',
      name: 'HVAC Unit 1',
      type: 'hardware',
      status: 'healthy',
      health: 92,
      lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      operatingHours: 4320,
      errorCount: 3,
      efficiency: 94,
      location: 'Zone A',
      model: 'Carrier 30XA',
      serialNumber: 'CA30XA-2023-1234',
      firmware: 'v3.2.1'
    },
    {
      id: 'light-array-1',
      name: 'LED Array A1',
      type: 'hardware',
      status: 'warning',
      health: 78,
      lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      operatingHours: 8760,
      errorCount: 12,
      efficiency: 85,
      location: 'Tier 1-3',
      model: 'Fluence VYPR 3p',
      serialNumber: 'FL-VYPR-2023-0456',
      firmware: 'v2.8.4'
    },
    {
      id: 'pump-1',
      name: 'Irrigation Pump 1',
      type: 'hardware',
      status: 'critical',
      health: 45,
      lastMaintenance: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Overdue
      operatingHours: 12500,
      errorCount: 28,
      efficiency: 62,
      location: 'Pump Room',
      model: 'Grundfos CR95',
      serialNumber: 'GF-CR95-2022-7890',
      firmware: 'v1.9.2'
    },
    {
      id: 'sensor-network',
      name: 'Sensor Network',
      type: 'network',
      status: 'healthy',
      health: 98,
      lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
      operatingHours: 8760,
      errorCount: 1,
      efficiency: 99,
      location: 'Distributed',
      model: 'LoRaWAN Network',
      serialNumber: 'NET-LORA-2023',
      firmware: 'v4.1.0'
    },
    {
      id: 'controller-1',
      name: 'Master Controller',
      type: 'software',
      status: 'healthy',
      health: 95,
      lastMaintenance: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      nextMaintenance: new Date(Date.now() + 76 * 24 * 60 * 60 * 1000),
      operatingHours: 8760,
      errorCount: 5,
      efficiency: 98,
      location: 'Server Room',
      model: 'Vibelux MC-1000',
      serialNumber: 'VB-MC-2023-0001',
      firmware: 'v5.2.3'
    }
  ]);

  // Maintenance tasks
  const [maintenanceTasks] = useState<MaintenanceTask[]>([
    {
      id: 'mt-1',
      componentId: 'pump-1',
      componentName: 'Irrigation Pump 1',
      type: 'corrective',
      priority: 'critical',
      description: 'Replace worn impeller and shaft seal',
      estimatedTime: 4,
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'overdue',
      cost: 450
    },
    {
      id: 'mt-2',
      componentId: 'light-array-1',
      componentName: 'LED Array A1',
      type: 'preventive',
      priority: 'high',
      description: 'Clean lenses and check driver connections',
      estimatedTime: 2,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'scheduled',
      assignee: 'Tech Team A',
      cost: 150
    },
    {
      id: 'mt-3',
      componentId: 'hvac-1',
      componentName: 'HVAC Unit 1',
      type: 'preventive',
      priority: 'medium',
      description: 'Replace air filters and check refrigerant levels',
      estimatedTime: 3,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'pending',
      cost: 280
    },
    {
      id: 'mt-4',
      componentId: 'controller-1',
      componentName: 'Master Controller',
      type: 'predictive',
      priority: 'low',
      description: 'Software update and database optimization',
      estimatedTime: 1,
      dueDate: new Date(Date.now() + 76 * 24 * 60 * 60 * 1000),
      status: 'pending',
      cost: 0
    }
  ]);

  // Diagnostic tests
  const [diagnosticTests] = useState<DiagnosticTest[]>([
    { id: 'dt-1', name: 'Network Connectivity', category: 'Network', status: 'pass', lastRun: new Date(), duration: 12, details: 'All nodes responding' },
    { id: 'dt-2', name: 'Sensor Calibration', category: 'Sensors', status: 'warning', lastRun: new Date(), duration: 45, details: '3 sensors need recalibration' },
    { id: 'dt-3', name: 'Power System', category: 'Electrical', status: 'pass', lastRun: new Date(), duration: 8, details: 'Voltage stable, UPS healthy' },
    { id: 'dt-4', name: 'Database Integrity', category: 'Software', status: 'pass', lastRun: new Date(), duration: 120, details: 'No corruption detected' },
    { id: 'dt-5', name: 'Mechanical Systems', category: 'Hardware', status: 'fail', lastRun: new Date(), duration: 180, details: 'Pump 1 vibration exceeds threshold' },
    { id: 'dt-6', name: 'Environmental Control', category: 'Control', status: 'pass', lastRun: new Date(), duration: 60, details: 'All zones within setpoints' }
  ]);

  // Performance history data
  const [performanceData] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      systemHealth: 85 + Math.sin(i * 0.2) * 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
      uptime: 99 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1,
      efficiency: 88 + Math.cos(i * 0.15) * 8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
      errors: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5)
    }))
  );

  // Component health distribution
  const [healthDistribution] = useState([
    { status: 'Healthy', count: 23, percentage: 65, color: '#10b981' },
    { status: 'Warning', count: 8, percentage: 23, color: '#fbbf24' },
    { status: 'Critical', count: 3, percentage: 8, color: '#ef4444' },
    { status: 'Offline', count: 1, percentage: 4, color: '#6b7280' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
      case 'offline': return XCircle;
      default: return Info;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hardware': return CircuitBoard;
      case 'software': return Cpu;
      case 'network': return Network;
      case 'sensor': return Activity;
      case 'actuator': return Zap;
      default: return Package;
    }
  };

  // Simulate diagnostics run
  useEffect(() => {
    if (runningDiagnostics) {
      const timer = setTimeout(() => {
        setRunningDiagnostics(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [runningDiagnostics]);

  const systemHealthScore = components.reduce((sum, comp) => sum + comp.health, 0) / components.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Wrench className="w-8 h-8 text-orange-500" />
              System Diagnostics & Maintenance
            </h2>
            <p className="text-gray-400 mt-1">
              Comprehensive system health monitoring and predictive maintenance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Auto Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoMode}
                  onChange={(e) => setAutoMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </label>
            <button
              onClick={() => setRunningDiagnostics(true)}
              disabled={runningDiagnostics}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                runningDiagnostics
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {runningDiagnostics ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Diagnostics
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2">
          {['overview', 'components', 'maintenance', 'diagnostics'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view as any)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                activeView === view
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'overview' && (
        <>
          {/* System Health Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <Heart className="w-6 h-6 text-red-500" />
                <span className={`text-sm font-medium ${
                  systemHealthScore >= 90 ? 'text-green-400' :
                  systemHealthScore >= 70 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {systemHealthScore >= 90 ? 'Excellent' :
                   systemHealthScore >= 70 ? 'Good' :
                   'Needs Attention'}
                </span>
              </div>
              <p className="text-3xl font-bold text-white">{systemHealthScore.toFixed(0)}%</p>
              <p className="text-gray-400 text-sm mt-1">System Health Score</p>
              <div className="mt-3 w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    systemHealthScore >= 90 ? 'bg-green-500' :
                    systemHealthScore >= 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${systemHealthScore}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-6 h-6 text-blue-500" />
                <span className="text-xs text-gray-400">Last 30 days</span>
              </div>
              <p className="text-3xl font-bold text-white">99.8%</p>
              <p className="text-gray-400 text-sm mt-1">System Uptime</p>
              <p className="text-xs text-gray-500 mt-3">17 min downtime</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <Wrench className="w-6 h-6 text-orange-500" />
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">12</p>
              <p className="text-gray-400 text-sm mt-1">Pending Tasks</p>
              <p className="text-xs text-red-400 mt-3">3 overdue</p>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <span className="text-xs text-yellow-400">Active</span>
              </div>
              <p className="text-3xl font-bold text-white">4</p>
              <p className="text-gray-400 text-sm mt-1">Active Alerts</p>
              <p className="text-xs text-gray-500 mt-3">1 critical, 3 warnings</p>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">30-Day Performance Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Area type="monotone" dataKey="systemHealth" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Health %" />
                  <Area type="monotone" dataKey="efficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Efficiency %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Component Health Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={healthDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {healthDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {healthDistribution.map((item) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-400 text-sm">{item.status}</span>
                    <span className="text-white text-sm ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent System Events</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Irrigation Pump 1 - Critical Status</p>
                  <p className="text-gray-400 text-sm">Vibration levels exceeded threshold, immediate maintenance required</p>
                  <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">LED Array A1 - Maintenance Due</p>
                  <p className="text-gray-400 text-sm">Scheduled maintenance in 7 days</p>
                  <p className="text-gray-500 text-xs mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">System Update Completed</p>
                  <p className="text-gray-400 text-sm">Controller firmware updated to v5.2.3</p>
                  <p className="text-gray-500 text-xs mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeView === 'components' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Component List */}
          <div className="col-span-2 bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">System Components</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {components.map((component) => {
                const StatusIcon = getStatusIcon(component.status);
                const TypeIcon = getTypeIcon(component.type);
                
                return (
                  <div
                    key={component.id}
                    onClick={() => setSelectedComponent(component.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedComponent === component.id
                        ? 'bg-purple-600/20 border-purple-500'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          component.status === 'healthy' ? 'bg-green-500/20' :
                          component.status === 'warning' ? 'bg-yellow-500/20' :
                          component.status === 'critical' ? 'bg-red-500/20' :
                          'bg-gray-500/20'
                        }`}>
                          <TypeIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{component.name}</h4>
                          <p className="text-gray-400 text-sm">{component.model} • {component.location}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="text-gray-500">Health: {component.health}%</span>
                            <span className="text-gray-500">Hours: {component.operatingHours.toLocaleString()}</span>
                            <span className="text-gray-500">Errors: {component.errorCount}</span>
                          </div>
                        </div>
                      </div>
                      <StatusIcon className={`w-5 h-5 ${getStatusColor(component.status)}`} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="w-full bg-gray-700 rounded-full h-2 mr-4">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            component.health >= 80 ? 'bg-green-500' :
                            component.health >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${component.health}%` }}
                        />
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Component Details */}
          {selectedComponent && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Component Details</h3>
              {(() => {
                const component = components.find(c => c.id === selectedComponent);
                if (!component) return null;
                
                return (
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Serial Number</p>
                      <p className="text-white font-mono">{component.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Firmware Version</p>
                      <p className="text-white">{component.firmware}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Efficiency</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white text-lg font-medium">{component.efficiency}%</p>
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Maintenance Schedule</p>
                      <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">Last Service</span>
                          <span className="text-white text-sm">
                            {component.lastMaintenance.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">Next Service</span>
                          <span className={`text-sm font-medium ${
                            component.nextMaintenance < new Date() ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {component.nextMaintenance.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Wrench className="w-4 h-4" />
                      Schedule Service
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {activeView === 'maintenance' && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Maintenance Schedule</h3>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
          
          <div className="space-y-3">
            {maintenanceTasks.map((task) => (
              <div key={task.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{task.componentName}</h4>
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type</span>
                    <p className="text-white capitalize">{task.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date</span>
                    <p className={`font-medium ${
                      task.status === 'overdue' ? 'text-red-400' : 'text-white'
                    }`}>
                      {task.dueDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration</span>
                    <p className="text-white">{task.estimatedTime}h</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cost</span>
                    <p className="text-white">${task.cost}</p>
                  </div>
                </div>
                {task.assignee && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Assigned to: {task.assignee}</span>
                    <button className="text-purple-400 hover:text-purple-300 text-sm">
                      View Details →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Diagnostic Tests</h3>
            <div className="grid grid-cols-2 gap-4">
              {diagnosticTests.map((test) => {
                const statusColor = test.status === 'pass' ? 'bg-green-500' :
                                  test.status === 'warning' ? 'bg-yellow-500' :
                                  test.status === 'fail' ? 'bg-red-500' :
                                  'bg-blue-500';
                
                return (
                  <div key={test.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{test.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${statusColor} ${
                        test.status === 'running' ? 'animate-pulse' : ''
                      }`} />
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{test.category}</p>
                    <p className="text-gray-300 text-xs">{test.details}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>Duration: {test.duration}s</span>
                      <span>{test.lastRun.toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Diagnostic Report</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Test Coverage</span>
                  <span className="text-white font-medium">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pass Rate</span>
                  <span className="text-green-400 font-medium">83%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Issues Found</span>
                  <span className="text-yellow-400 font-medium">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Full Scan</span>
                  <span className="text-white">2 hours ago</span>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
                <FileText className="w-4 h-4" />
                Generate Full Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}