'use client';

import React, { useState } from 'react';
import {
  Network,
  Wifi,
  Activity,
  Cpu,
  Layers,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Settings,
  AlertCircle,
  CheckCircle,
  Radio,
  Server,
  Cable,
  Database,
  Cloud,
  Shield,
  Eye,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Gauge,
  Link2,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Download,
  Bell,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface DeviceCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  count: number;
  link: string;
  description: string;
  status: 'operational' | 'partial' | 'offline';
}

interface QuickStat {
  label: string;
  value: string;
  trend?: string;
  icon: React.ElementType;
  color: string;
}

export function UnifiedDeviceCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const deviceCategories: DeviceCategory[] = [
    {
      id: 'iot',
      name: 'IoT Devices',
      icon: Wifi,
      count: 248,
      link: '/iot-devices',
      description: 'Wireless sensors, controllers, and smart devices',
      status: 'operational'
    },
    {
      id: 'sensors',
      name: 'Environmental Sensors',
      icon: Activity,
      count: 156,
      link: '/sensors',
      description: 'Temperature, humidity, CO2, light, and VPD sensors',
      status: 'operational'
    },
    {
      id: 'industrial',
      name: 'Industrial Equipment',
      icon: Cpu,
      count: 84,
      link: '/integration',
      description: 'BACnet, Modbus, OPC UA connected devices',
      status: 'operational'
    },
    {
      id: 'lighting',
      name: 'Lighting Systems',
      icon: Sun,
      count: 96,
      link: '/fixtures',
      description: 'LED fixtures, drivers, and controllers',
      status: 'operational'
    },
    {
      id: 'hvac',
      name: 'HVAC Equipment',
      icon: Wind,
      count: 24,
      link: '/operations?tab=hvac',
      description: 'Air handlers, chillers, exhaust fans',
      status: 'partial'
    },
    {
      id: 'irrigation',
      name: 'Irrigation Systems',
      icon: Droplets,
      count: 32,
      link: '/operations?tab=irrigation',
      description: 'Pumps, valves, fertigation units',
      status: 'operational'
    },
    {
      id: 'security',
      name: 'Security & Access',
      icon: Shield,
      count: 18,
      link: '/integrations',
      description: 'Cameras, access control, monitoring',
      status: 'operational'
    },
    {
      id: 'analytics',
      name: 'Data Analytics',
      icon: BarChart3,
      count: 12,
      link: '/analytics',
      description: 'Data loggers, edge computing devices',
      status: 'operational'
    }
  ];

  const quickStats: QuickStat[] = [
    { label: 'Total Devices', value: '670', icon: Network, color: 'text-blue-500' },
    { label: 'Online', value: '648', trend: '+2', icon: CheckCircle, color: 'text-green-500' },
    { label: 'Warnings', value: '18', trend: '-3', icon: AlertCircle, color: 'text-yellow-500' },
    { label: 'Offline', value: '4', trend: '+1', icon: Radio, color: 'text-red-500' }
  ];

  const recentActivity = [
    { device: 'ENV-SENSOR-042', event: 'High CO2 alert cleared', time: '2 min ago', type: 'success' },
    { device: 'HVAC-UNIT-03', event: 'Maintenance required', time: '15 min ago', type: 'warning' },
    { device: 'LED-DRIVER-A12', event: 'Firmware updated to v3.2.1', time: '1 hour ago', type: 'info' },
    { device: 'PUMP-STATION-02', event: 'Flow rate normalized', time: '2 hours ago', type: 'success' }
  ];

  const protocols = [
    { name: 'BACnet/IP', devices: 84, status: 'connected', icon: Network },
    { name: 'Modbus TCP', devices: 42, status: 'connected', icon: Server },
    { name: 'MQTT', devices: 156, status: 'connected', icon: Radio },
    { name: 'OPC UA', devices: 12, status: 'error', icon: Cable },
    { name: 'REST API', devices: 324, status: 'connected', icon: Cloud },
    { name: 'LoRaWAN', devices: 52, status: 'connected', icon: Wifi }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'connected':
        return 'border-green-500/30 bg-green-500/5';
      case 'partial':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'offline':
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      default:
        return 'border-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1920px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Unified Device Center</h1>
            <p className="text-gray-400">Complete overview of all connected devices and systems</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/integration"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Device
            </Link>
            <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">{stat.label}</span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  {stat.trend && (
                    <p className={`text-xs ${stat.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.trend}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices by name, type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <button className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Device Categories */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Device Categories</h2>
            <div className="grid grid-cols-2 gap-4">
              {deviceCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.id}
                    href={category.link}
                    className={`bg-gray-900 rounded-lg border p-4 hover:bg-gray-800 transition-all ${getStatusColor(category.status)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 rounded-lg">
                          <Icon className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{category.name}</h3>
                          <p className="text-gray-400 text-sm">{category.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-white">{category.count}</p>
                      <p className={`text-xs font-medium ${
                        category.status === 'operational' ? 'text-green-400' :
                        category.status === 'partial' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {category.status}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Protocol Status */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <h3 className="text-lg font-medium text-white mb-4">Protocol Status</h3>
              <div className="space-y-3">
                {protocols.map((protocol) => {
                  const Icon = protocol.icon;
                  return (
                    <div key={protocol.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-white text-sm">{protocol.name}</p>
                          <p className="text-gray-400 text-xs">{protocol.devices} devices</p>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        protocol.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Recent Activity</h3>
                <Link href="/operations?tab=alarms" className="text-purple-400 hover:text-purple-300 text-sm">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.device}</p>
                      <p className="text-gray-400 text-xs">{activity.event}</p>
                      <p className="text-gray-500 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-4">
            <Link
              href="/integration"
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Network className="w-5 h-5 text-purple-400" />
                <span className="text-white">Configure Protocols</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/operations?tab=monitoring"
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-blue-400" />
                <span className="text-white">Live Monitoring</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/operations?tab=alarms"
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Manage Alarms</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/reports"
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="text-white">Schedule Reports</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}