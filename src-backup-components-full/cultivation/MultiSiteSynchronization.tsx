'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Building2,
  Network,
  Wifi,
  WifiOff,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Calendar,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Eye,
  EyeOff,
  MapPin,
  Zap,
  Droplets,
  Thermometer,
  Sun,
  DollarSign,
  GitBranch,
  Cloud,
  CloudOff,
  Server,
  Database,
  Shield,
  Bell,
  ChevronRight,
  MoreVertical,
  Copy,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Site {
  id: string;
  name: string;
  location: string;
  timezone: string;
  coordinates: { lat: number; lng: number };
  status: 'online' | 'offline' | 'maintenance' | 'alarm';
  connectionStrength: number; // 0-100
  lastSync: Date;
  facilities: {
    rooms: number;
    totalCanopy: number; // sq ft
    activeCanopy: number; // sq ft
  };
  performance: {
    yield: number; // g/sq ft
    quality: number; // 0-100
    efficiency: number; // 0-100
  };
  currentConditions: {
    avgTemp: number;
    avgHumidity: number;
    avgCO2: number;
    avgPPFD: number;
    powerUsage: number; // kW
  };
  alerts: Alert[];
}

interface Alert {
  id: string;
  siteId: string;
  type: 'critical' | 'warning' | 'info';
  category: 'environmental' | 'equipment' | 'security' | 'compliance';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface SyncConfig {
  id: string;
  name: string;
  description: string;
  syncInterval: number; // minutes
  dataTypes: string[];
  sites: string[];
  lastRun: Date;
  status: 'active' | 'paused' | 'error';
}

interface CentralizedMetric {
  metric: string;
  sites: {
    siteId: string;
    siteName: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
    change: number; // percentage
  }[];
  aggregate: {
    total: number;
    average: number;
    min: number;
    max: number;
  };
}

interface BatchOperation {
  id: string;
  name: string;
  type: 'lighting' | 'climate' | 'irrigation' | 'schedule';
  targetSites: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number; // 0-100
  results?: {
    siteId: string;
    success: boolean;
    message?: string;
  }[];
}

const mockSites: Site[] = [
  {
    id: 'site-1',
    name: 'California Facility',
    location: 'Sacramento, CA',
    timezone: 'America/Los_Angeles',
    coordinates: { lat: 38.5816, lng: -121.4944 },
    status: 'online',
    connectionStrength: 95,
    lastSync: new Date(Date.now() - 5 * 60000),
    facilities: {
      rooms: 12,
      totalCanopy: 50000,
      activeCanopy: 42000
    },
    performance: {
      yield: 52.3,
      quality: 92,
      efficiency: 88
    },
    currentConditions: {
      avgTemp: 24.5,
      avgHumidity: 65,
      avgCO2: 1100,
      avgPPFD: 750,
      powerUsage: 485
    },
    alerts: [
      {
        id: 'alert-1',
        siteId: 'site-1',
        type: 'warning',
        category: 'environmental',
        message: 'Room 3 humidity trending high',
        timestamp: new Date(Date.now() - 30 * 60000),
        acknowledged: false
      }
    ]
  },
  {
    id: 'site-2',
    name: 'Colorado Facility',
    location: 'Denver, CO',
    timezone: 'America/Denver',
    coordinates: { lat: 39.7392, lng: -104.9903 },
    status: 'online',
    connectionStrength: 88,
    lastSync: new Date(Date.now() - 3 * 60000),
    facilities: {
      rooms: 8,
      totalCanopy: 35000,
      activeCanopy: 32000
    },
    performance: {
      yield: 48.7,
      quality: 89,
      efficiency: 91
    },
    currentConditions: {
      avgTemp: 23.8,
      avgHumidity: 62,
      avgCO2: 950,
      avgPPFD: 680,
      powerUsage: 325
    },
    alerts: []
  },
  {
    id: 'site-3',
    name: 'Michigan Facility',
    location: 'Detroit, MI',
    timezone: 'America/Detroit',
    coordinates: { lat: 42.3314, lng: -83.0458 },
    status: 'maintenance',
    connectionStrength: 100,
    lastSync: new Date(Date.now() - 15 * 60000),
    facilities: {
      rooms: 6,
      totalCanopy: 25000,
      activeCanopy: 0
    },
    performance: {
      yield: 0,
      quality: 0,
      efficiency: 0
    },
    currentConditions: {
      avgTemp: 22.0,
      avgHumidity: 55,
      avgCO2: 450,
      avgPPFD: 0,
      powerUsage: 45
    },
    alerts: [
      {
        id: 'alert-2',
        siteId: 'site-3',
        type: 'info',
        category: 'equipment',
        message: 'Scheduled maintenance in progress',
        timestamp: new Date(Date.now() - 120 * 60000),
        acknowledged: true
      }
    ]
  }
];

export function MultiSiteSynchronization() {
  const [sites, setSites] = useState<Site[]>(mockSites);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'sites' | 'sync' | 'analytics' | 'operations' | 'alerts'>('overview');
  const [syncConfigs, setSyncConfigs] = useState<SyncConfig[]>([
    {
      id: 'sync-1',
      name: 'Environmental Data Sync',
      description: 'Synchronize temperature, humidity, CO2, and light data',
      syncInterval: 5,
      dataTypes: ['temperature', 'humidity', 'co2', 'light'],
      sites: ['site-1', 'site-2', 'site-3'],
      lastRun: new Date(Date.now() - 4 * 60000),
      status: 'active'
    },
    {
      id: 'sync-2',
      name: 'Production Metrics',
      description: 'Sync yield, quality, and efficiency metrics',
      syncInterval: 60,
      dataTypes: ['yield', 'quality', 'efficiency', 'inventory'],
      sites: ['site-1', 'site-2'],
      lastRun: new Date(Date.now() - 45 * 60000),
      status: 'active'
    }
  ]);
  const [showOfflineSites, setShowOfflineSites] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'yield' | 'quality' | 'efficiency' | 'power'>('yield');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSites(prev => prev.map(site => ({
        ...site,
        lastSync: new Date(),
        currentConditions: {
          ...site.currentConditions,
          avgTemp: site.currentConditions.avgTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.2,
          avgHumidity: site.currentConditions.avgHumidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1,
          avgCO2: site.currentConditions.avgCO2 + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20,
          powerUsage: site.currentConditions.powerUsage + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5
        }
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate aggregated metrics
  const getAggregatedMetrics = (): CentralizedMetric[] => {
    const onlineSites = sites.filter(s => s.status === 'online');
    
    return [
      {
        metric: 'Total Yield',
        sites: onlineSites.map(site => ({
          siteId: site.id,
          siteName: site.name,
          value: site.performance.yield,
          trend: 'up',
          change: 5.2
        })),
        aggregate: {
          total: onlineSites.reduce((sum, s) => sum + (s.performance.yield * s.facilities.activeCanopy), 0),
          average: onlineSites.reduce((sum, s) => sum + s.performance.yield, 0) / onlineSites.length,
          min: Math.min(...onlineSites.map(s => s.performance.yield)),
          max: Math.max(...onlineSites.map(s => s.performance.yield))
        }
      },
      {
        metric: 'Power Usage',
        sites: sites.map(site => ({
          siteId: site.id,
          siteName: site.name,
          value: site.currentConditions.powerUsage,
          trend: site.currentConditions.powerUsage > 400 ? 'up' : 'stable',
          change: 2.1
        })),
        aggregate: {
          total: sites.reduce((sum, s) => sum + s.currentConditions.powerUsage, 0),
          average: sites.reduce((sum, s) => sum + s.currentConditions.powerUsage, 0) / sites.length,
          min: Math.min(...sites.map(s => s.currentConditions.powerUsage)),
          max: Math.max(...sites.map(s => s.currentConditions.powerUsage))
        }
      }
    ];
  };

  // Generate comparison data
  const getComparisonData = () => {
    return sites.map(site => ({
      site: site.name,
      yield: site.performance.yield,
      quality: site.performance.quality,
      efficiency: site.performance.efficiency,
      powerEfficiency: site.facilities.activeCanopy > 0 
        ? (site.performance.yield * site.facilities.activeCanopy) / site.currentConditions.powerUsage 
        : 0
    }));
  };

  // Generate timeline data
  const getTimelineData = () => {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      ...sites.reduce((acc, site) => ({
        ...acc,
        [site.name]: 45 + Math.sin(hour * 0.3 + sites.indexOf(site)) * 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5
      }), {})
    }));
  };

  // Get all alerts across sites
  const getAllAlerts = () => {
    return sites.flatMap(site => 
      site.alerts.map(alert => ({
        ...alert,
        siteName: site.name
      }))
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getStatusColor = (status: Site['status']) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      case 'alarm': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getConnectionIcon = (strength: number) => {
    if (strength >= 80) return <Wifi className="w-4 h-4 text-green-500" />;
    if (strength >= 50) return <Wifi className="w-4 h-4 text-yellow-500" />;
    if (strength > 0) return <Wifi className="w-4 h-4 text-red-500" />;
    return <WifiOff className="w-4 h-4 text-gray-500" />;
  };

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Multi-Site Synchronization
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Centralized management across {sites.length} facilities
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Site
          </button>
        </div>
      </div>

      {/* Global Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Sites</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{sites.length}</p>
          <p className="text-xs text-green-500 mt-1">
            {sites.filter(s => s.status === 'online').length} online
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Active Canopy</span>
            <Package className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(sites.reduce((sum, s) => sum + s.facilities.activeCanopy, 0) / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-gray-500 mt-1">sq ft</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Avg Yield</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(sites.filter(s => s.status === 'online').reduce((sum, s) => sum + s.performance.yield, 0) / sites.filter(s => s.status === 'online').length).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">g/sq ft</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Power</span>
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {(sites.reduce((sum, s) => sum + s.currentConditions.powerUsage, 0) / 1000).toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">MW</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Active Alerts</span>
            <Bell className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {getAllAlerts().filter(a => !a.acknowledged).length}
          </p>
          <p className="text-xs text-red-500 mt-1">
            {getAllAlerts().filter(a => a.type === 'critical').length} critical
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'sites', label: 'Sites', icon: Building2 },
          { id: 'sync', label: 'Sync Config', icon: RefreshCw },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'operations', label: 'Operations', icon: Settings },
          { id: 'alerts', label: 'Alerts', icon: Bell }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
              activeView === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'alerts' && getAllAlerts().filter(a => !a.acknowledged).length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {getAllAlerts().filter(a => !a.acknowledged).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Views */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Site Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sites.map(site => (
              <div 
                key={site.id} 
                className={`bg-gray-50 dark:bg-gray-900 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedSite?.id === site.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedSite(site)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{site.name}</h3>
                    <p className="text-sm text-gray-500">{site.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getConnectionIcon(site.connectionStrength)}
                    <span className={`w-2 h-2 rounded-full ${
                      site.status === 'online' ? 'bg-green-500' :
                      site.status === 'offline' ? 'bg-red-500' :
                      site.status === 'maintenance' ? 'bg-yellow-500' :
                      'bg-orange-500'
                    }`} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Temperature</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {site.currentConditions.avgTemp.toFixed(1)}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Humidity</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {site.currentConditions.avgHumidity.toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Power</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {site.currentConditions.powerUsage.toFixed(0)} kW
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Yield</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {site.performance.yield.toFixed(1)} g/ft²
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Last sync: {Math.round((Date.now() - site.lastSync.getTime()) / 60000)}m ago
                  </span>
                  {site.alerts.length > 0 && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <AlertCircle className="w-3 h-3" />
                      {site.alerts.length} alert{site.alerts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Performance Comparison */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Site Performance Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getComparisonData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="site" tick={{ fill: '#6B7280' }} />
                <YAxis tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Legend />
                <Bar dataKey="yield" fill="#8B5CF6" name="Yield (g/ft²)" />
                <Bar dataKey="quality" fill="#3B82F6" name="Quality (%)" />
                <Bar dataKey="efficiency" fill="#10B981" name="Efficiency (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Real-time Sync Status */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Synchronization Status
                </h4>
              </div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                All systems synchronized
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 dark:text-blue-300">Data Upload</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">2.4 MB/s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700 dark:text-blue-300">Data Download</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">1.8 MB/s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700 dark:text-blue-300">Last Full Sync</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">5 min ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'sites' && (
        <div className="space-y-6">
          {/* Site Management Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOfflineSites}
                  onChange={(e) => setShowOfflineSites(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show offline sites</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Detailed Site List */}
          <div className="space-y-4">
            {sites
              .filter(site => showOfflineSites || site.status !== 'offline')
              .map(site => (
                <div key={site.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        site.status === 'online' ? 'bg-green-100 dark:bg-green-900/30' :
                        site.status === 'offline' ? 'bg-red-100 dark:bg-red-900/30' :
                        site.status === 'maintenance' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        <Building2 className={`w-6 h-6 ${getStatusColor(site.status)}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {site.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {site.location} • {site.timezone}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {site.facilities.rooms} rooms
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {(site.facilities.totalCanopy / 1000).toFixed(0)}k sq ft total
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {((site.facilities.activeCanopy / site.facilities.totalCanopy) * 100).toFixed(0)}% active
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <Settings className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Site Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Connection</span>
                        {getConnectionIcon(site.connectionStrength)}
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {site.connectionStrength}%
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Temperature</span>
                        <Thermometer className="w-4 h-4 text-red-500" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {site.currentConditions.avgTemp.toFixed(1)}°C
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Humidity</span>
                        <Droplets className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {site.currentConditions.avgHumidity}%
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Power</span>
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {site.currentConditions.powerUsage} kW
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Yield</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {site.performance.yield} g/ft²
                      </p>
                    </div>
                  </div>
                  
                  {/* Site Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 text-sm">
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="flex items-center gap-1 text-purple-600 hover:text-purple-700">
                        <Activity className="w-4 h-4" />
                        Real-time Monitor
                      </button>
                      <button className="flex items-center gap-1 text-green-600 hover:text-green-700">
                        <GitBranch className="w-4 h-4" />
                        Compare
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      Last sync: {Math.round((Date.now() - site.lastSync.getTime()) / 60000)}m ago
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeView === 'sync' && (
        <div className="space-y-6">
          {/* Sync Configuration List */}
          <div className="space-y-4">
            {syncConfigs.map(config => (
              <div key={config.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{config.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{config.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      config.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      config.status === 'paused' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {config.status}
                    </span>
                    <button className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500">Interval</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Every {config.syncInterval} minutes
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Sites</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {config.sites.length} connected
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Data Types</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {config.dataTypes.length} selected
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Run</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {Math.round((Date.now() - config.lastRun.getTime()) / 60000)}m ago
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {config.dataTypes.map((type, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Sync Config */}
          <button className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
            <Plus className="w-5 h-5 mx-auto mb-1" />
            Add Sync Configuration
          </button>

          {/* Sync Architecture */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Synchronization Architecture
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <p className="font-medium mb-1">Central Database</p>
                <p>PostgreSQL with TimescaleDB for time-series data</p>
              </div>
              <div>
                <p className="font-medium mb-1">Edge Computing</p>
                <p>Local processing at each site for real-time control</p>
              </div>
              <div>
                <p className="font-medium mb-1">Data Pipeline</p>
                <p>Apache Kafka for reliable message streaming</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'analytics' && (
        <div className="space-y-6">
          {/* Metric Selector */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cross-Site Analytics
            </h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="yield">Yield Performance</option>
              <option value="quality">Quality Metrics</option>
              <option value="efficiency">Energy Efficiency</option>
              <option value="power">Power Consumption</option>
            </select>
          </div>

          {/* Time Series Comparison */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              24-Hour {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trends
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getTimelineData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fill: '#6B7280' }}
                  label={{ value: 'Hour', position: 'insideBottom', offset: -5, fill: '#6B7280' }}
                />
                <YAxis tick={{ fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Legend />
                {sites.map((site, idx) => (
                  <Line
                    key={site.id}
                    type="monotone"
                    dataKey={site.name}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Site Performance Radar
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={[
                  { metric: 'Yield', ...sites.reduce((acc, site) => ({ ...acc, [site.name]: site.performance.yield }), {}) },
                  { metric: 'Quality', ...sites.reduce((acc, site) => ({ ...acc, [site.name]: site.performance.quality }), {}) },
                  { metric: 'Efficiency', ...sites.reduce((acc, site) => ({ ...acc, [site.name]: site.performance.efficiency }), {}) },
                  { metric: 'Uptime', ...sites.reduce((acc, site) => ({ ...acc, [site.name]: site.status === 'online' ? 95 : 0 }), {}) },
                  { metric: 'Compliance', ...sites.reduce((acc, site) => ({ ...acc, [site.name]: 88 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 }), {}) }
                ]}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#6B7280' }} />
                  <PolarRadiusAxis tick={{ fill: '#6B7280' }} />
                  {sites.map((site, idx) => (
                    <Radar
                      key={site.id}
                      name={site.name}
                      dataKey={site.name}
                      stroke={COLORS[idx % COLORS.length]}
                      fill={COLORS[idx % COLORS.length]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Aggregated Metrics */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Aggregated Performance Metrics
              </h4>
              {getAggregatedMetrics().map((metric, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                    {metric.metric}
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Total</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {metric.aggregate.total.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Average</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {metric.aggregate.average.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Min</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {metric.aggregate.min.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Max</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {metric.aggregate.max.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'operations' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Batch Operations
          </h3>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Sync All Sites', icon: RefreshCw, color: 'blue', description: 'Force sync across all online sites' },
              { name: 'Update Lighting', icon: Sun, color: 'yellow', description: 'Deploy lighting schedule changes' },
              { name: 'Climate Adjustment', icon: Thermometer, color: 'red', description: 'Batch climate setpoint updates' },
              { name: 'Emergency Shutdown', icon: AlertCircle, color: 'red', description: 'Emergency stop all systems' }
            ].map((action, idx) => (
              <button
                key={idx}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <action.icon className={`w-8 h-8 text-${action.color}-500 mb-3`} />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">{action.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
              </button>
            ))}
          </div>

          {/* Recent Operations */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              Recent Batch Operations
            </h4>
            <div className="space-y-3">
              {[
                { name: 'Lighting Schedule Update', sites: 3, status: 'completed', time: '2 hours ago' },
                { name: 'Climate Setpoint Adjustment', sites: 2, status: 'in-progress', time: '30 minutes ago' },
                { name: 'Emergency Dehumidification', sites: 1, status: 'completed', time: '4 hours ago' }
              ].map((op, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      op.status === 'completed' ? 'bg-green-500' :
                      op.status === 'in-progress' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{op.name}</p>
                      <p className="text-sm text-gray-500">{op.sites} sites affected</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{op.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'alerts' && (
        <div className="space-y-6">
          {/* Alert Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Critical', count: getAllAlerts().filter(a => a.type === 'critical').length, color: 'red' },
              { label: 'Warnings', count: getAllAlerts().filter(a => a.type === 'warning').length, color: 'yellow' },
              { label: 'Info', count: getAllAlerts().filter(a => a.type === 'info').length, color: 'blue' },
              { label: 'Acknowledged', count: getAllAlerts().filter(a => a.acknowledged).length, color: 'gray' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</p>
              </div>
            ))}
          </div>

          {/* Alert List */}
          <div className="space-y-3">
            {getAllAlerts().map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${
                alert.acknowledged 
                  ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.type === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                      alert.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <AlertCircle className={`w-5 h-5 ${
                        alert.type === 'critical' ? 'text-red-600' :
                        alert.type === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        alert.acknowledged 
                          ? 'text-gray-600 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {alert.message}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {alert.siteName} • {alert.category} • {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm">
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}