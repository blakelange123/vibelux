'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Cpu,
  HardDrive,
  Network,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Wifi,
  Globe,
  Lock,
  Battery,
  Gauge,
  BarChart3,
  Eye,
  RefreshCw,
  Download,
  Settings,
  Bell,
  X,
  FileDown,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: number;
  icon: React.ElementType;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: number;
  latency: number;
  lastCheck: Date;
}

export function SystemHealthMonitor() {
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('cpu');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [alertThresholds, setAlertThresholds] = useState({
    cpu: 80,
    memory: 85,
    storage: 90,
    network: 150
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');

  // Simulated real-time data
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU Usage',
      value: 42,
      unit: '%',
      status: 'healthy',
      trend: -2.3,
      icon: Cpu
    },
    {
      name: 'Memory',
      value: 68,
      unit: '%',
      status: 'warning',
      trend: 5.1,
      icon: HardDrive
    },
    {
      name: 'Network',
      value: 124,
      unit: 'Mbps',
      status: 'healthy',
      trend: 12.4,
      icon: Network
    },
    {
      name: 'Storage',
      value: 73,
      unit: '%',
      status: 'warning',
      trend: 1.2,
      icon: Database
    }
  ]);

  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatus[]>([
    { name: 'API Gateway', status: 'online', uptime: 99.99, latency: 23, lastCheck: new Date() },
    { name: 'Database', status: 'online', uptime: 99.95, latency: 5, lastCheck: new Date() },
    { name: 'MQTT Broker', status: 'online', uptime: 99.98, latency: 8, lastCheck: new Date() },
    { name: 'Analytics Engine', status: 'degraded', uptime: 98.5, latency: 145, lastCheck: new Date() },
    { name: 'File Storage', status: 'online', uptime: 99.97, latency: 34, lastCheck: new Date() },
    { name: 'Cache Server', status: 'online', uptime: 99.91, latency: 2, lastCheck: new Date() }
  ]);

  // Performance history data
  const [performanceHistory] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      time: i,
      cpu: 35 + Math.sin(i * 0.1) * 15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      memory: 60 + Math.cos(i * 0.08) * 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
      network: 100 + Math.sin(i * 0.05) * 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
      disk: 70 + Math.sin(i * 0.03) * 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3
    }))
  );

  // Health score calculation
  const calculateHealthScore = () => {
    const weights = { cpu: 0.3, memory: 0.3, network: 0.2, storage: 0.2 };
    let score = 100;
    
    if (systemMetrics[0].value > 80) score -= weights.cpu * 30;
    else if (systemMetrics[0].value > 60) score -= weights.cpu * 10;
    
    if (systemMetrics[1].value > 85) score -= weights.memory * 30;
    else if (systemMetrics[1].value > 70) score -= weights.memory * 10;
    
    if (systemMetrics[3].value > 90) score -= weights.storage * 30;
    else if (systemMetrics[3].value > 80) score -= weights.storage * 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();

  const getHealthColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#fbbf24';
    return '#ef4444';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-500';
      case 'warning':
      case 'degraded':
        return 'text-yellow-500';
      case 'critical':
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate data updates
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.name === 'Network' 
          ? Math.max(0, metric.value + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20)
          : Math.max(0, Math.min(100, metric.value + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5))
      })));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const radialData = [{ name: 'Health', value: healthScore, fill: getHealthColor(healthScore) }];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1920px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">System Health Monitor</h1>
            <p className="text-gray-400">Real-time infrastructure and service monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm">Auto-refresh:</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-1 bg-gray-900 border border-gray-800 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            </div>
            <button 
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-4 gap-6">
          {/* Health Score */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">System Health Score</h2>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData}>
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill={getHealthColor(healthScore)}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center -mt-32">
              <p className="text-4xl font-bold text-white">{healthScore.toFixed(0)}</p>
              <p className="text-gray-400">Overall Health</p>
            </div>
            <div className="mt-20 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="text-white font-medium">99.98%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Incidents</span>
                <span className="text-white font-medium">0</span>
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="col-span-3">
            <div className="grid grid-cols-4 gap-4">
              {systemMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.name}
                    className="bg-gray-900 rounded-lg border border-gray-800 p-4 cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => setSelectedMetric(metric.name.toLowerCase().replace(' ', ''))}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={`w-5 h-5 ${getStatusColor(metric.status)}`} />
                      <span className={`text-xs font-medium ${
                        metric.trend > 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {metric.trend > 0 ? '+' : ''}{metric.trend}%
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{metric.name}</p>
                    <p className="text-2xl font-bold text-white">
                      {metric.value}
                      <span className="text-lg text-gray-400 ml-1">{metric.unit}</span>
                    </p>
                    <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          metric.status === 'healthy' ? 'bg-green-500' :
                          metric.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${metric.name === 'Network' ? Math.min(100, (metric.value / 200) * 100) : metric.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mt-6 bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Performance History (Last Hour)</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-gray-400 text-sm">CPU</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-gray-400 text-sm">Memory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-400 text-sm">Network</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-gray-400 text-sm">Disk I/O</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="memory" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="network" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Area type="monotone" dataKey="disk" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Status Grid */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Service Status</h2>
            <div className="space-y-3">
              {serviceStatuses.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      service.status === 'online' ? 'bg-green-500' :
                      service.status === 'degraded' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="text-white font-medium">{service.name}</p>
                      <p className="text-gray-400 text-xs">
                        Uptime: {service.uptime}% • Latency: {service.latency}ms
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Alerts */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Security & Alerts</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="text-white font-medium">Security Status</span>
                  </div>
                  <span className="text-green-400 text-sm">Secure</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">SSL/TLS</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Firewall</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">DDoS Protection</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Backup</span>
                    <Clock className="w-4 h-4 text-yellow-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4 text-yellow-500" />
                  Recent Alerts
                </h3>
                <div className="space-y-2">
                  <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm">
                    <p className="text-yellow-400">High memory usage on analytics engine</p>
                    <p className="text-gray-500 text-xs">15 minutes ago</p>
                  </div>
                  <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-sm">
                    <p className="text-blue-400">Scheduled maintenance completed</p>
                    <p className="text-gray-500 text-xs">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Infrastructure Overview */}
        <div className="mt-6 bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Infrastructure Overview</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <Server className="w-12 h-12 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-medium">12 Servers</p>
              <p className="text-gray-400 text-sm">All operational</p>
            </div>
            <div className="text-center">
              <Database className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-white font-medium">4 Databases</p>
              <p className="text-gray-400 text-sm">324 GB used</p>
            </div>
            <div className="text-center">
              <Globe className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p className="text-white font-medium">3 Regions</p>
              <p className="text-gray-400 text-sm">Global coverage</p>
            </div>
            <div className="text-center">
              <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <p className="text-white font-medium">256-bit SSL</p>
              <p className="text-gray-400 text-sm">End-to-end</p>
            </div>
            <div className="text-center">
              <Activity className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <p className="text-white font-medium">2.4M Requests</p>
              <p className="text-gray-400 text-sm">Last 24 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Monitor Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Alert Thresholds */}
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Alert Thresholds
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">CPU Usage Alert (%)</label>
                    <input
                      type="number"
                      value={alertThresholds.cpu}
                      onChange={(e) => setAlertThresholds(prev => ({ ...prev, cpu: Number(e.target.value) }))}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Memory Usage Alert (%)</label>
                    <input
                      type="number"
                      value={alertThresholds.memory}
                      onChange={(e) => setAlertThresholds(prev => ({ ...prev, memory: Number(e.target.value) }))}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Storage Usage Alert (%)</label>
                    <input
                      type="number"
                      value={alertThresholds.storage}
                      onChange={(e) => setAlertThresholds(prev => ({ ...prev, storage: Number(e.target.value) }))}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Network Usage Alert (Mbps)</label>
                    <input
                      type="number"
                      value={alertThresholds.network}
                      onChange={(e) => setAlertThresholds(prev => ({ ...prev, network: Number(e.target.value) }))}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-500" />
                  Notifications
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Enable in-app notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-white">Enable email alerts</span>
                  </label>
                  {emailAlerts && (
                    <input
                      type="email"
                      placeholder="Alert email address"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save settings logic here
                  setShowSettingsModal(false);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Export Data</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400">Select export format:</p>
              
              <button
                onClick={() => {
                  // Export as CSV logic
                  const csvData = `Time,CPU,Memory,Network,Storage\n${performanceHistory.map(d => 
                    `${d.time},${d.cpu.toFixed(2)},${d.memory.toFixed(2)},${d.network.toFixed(2)},${d.disk.toFixed(2)}`
                  ).join('\n')}`;
                  const blob = new Blob([csvData], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `system-health-${new Date().toISOString()}.csv`;
                  a.click();
                  setShowExportModal(false);
                }}
                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <FileSpreadsheet className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <p className="text-white font-medium">CSV Format</p>
                  <p className="text-gray-400 text-sm">Performance data in spreadsheet format</p>
                </div>
              </button>

              <button
                onClick={() => {
                  // Export as JSON logic
                  const jsonData = {
                    exportDate: new Date().toISOString(),
                    systemMetrics,
                    serviceStatuses,
                    performanceHistory,
                    healthScore
                  };
                  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `system-health-${new Date().toISOString()}.json`;
                  a.click();
                  setShowExportModal(false);
                }}
                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <FileJson className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="text-white font-medium">JSON Format</p>
                  <p className="text-gray-400 text-sm">Complete data with all metrics</p>
                </div>
              </button>

              <button
                onClick={() => {
                  // Export report logic
                  const report = `System Health Report\n${new Date().toISOString()}\n\nOverall Health Score: ${healthScore.toFixed(0)}%\n\nSystem Metrics:\n${systemMetrics.map(m => 
                    `- ${m.name}: ${m.value}${m.unit} (${m.status})`
                  ).join('\n')}\n\nService Status:\n${serviceStatuses.map(s => 
                    `- ${s.name}: ${s.status} (Uptime: ${s.uptime}%, Latency: ${s.latency}ms)`
                  ).join('\n')}`;
                  const blob = new Blob([report], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `system-health-report-${new Date().toISOString()}.txt`;
                  a.click();
                  setShowExportModal(false);
                }}
                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <FileDown className="w-5 h-5 text-purple-400" />
                <div className="text-left">
                  <p className="text-white font-medium">Text Report</p>
                  <p className="text-gray-400 text-sm">Summary report in plain text</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}