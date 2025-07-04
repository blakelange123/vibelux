'use client';

import React, { useState, useEffect } from 'react';
import { AlertBuilder, getNotificationService } from '@/lib/notifications/notification-service';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  Clock,
  MoreVertical,
  ChevronDown,
  AlertCircle,
  Activity
} from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  read: boolean;
  acknowledged: boolean;
  roomName?: string;
  value?: number;
  threshold?: number;
}

export function AlertDashboard() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    critical: 0,
    todayCount: 0
  });

  // Load alerts (mock data for demo)
  useEffect(() => {
    const mockAlerts: AlertItem[] = [
      {
        id: '1',
        type: 'critical',
        severity: 'critical',
        title: 'High Temperature Alert',
        message: 'Temperature in Flower Room A has exceeded 85°F',
        source: 'temperature-sensor-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
        acknowledged: false,
        roomName: 'Flower Room A',
        value: 87.5,
        threshold: 85
      },
      {
        id: '2',
        type: 'warning',
        severity: 'medium',
        title: 'Low Humidity Warning',
        message: 'Humidity in Veg Room B dropped below 40%',
        source: 'humidity-sensor-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
        acknowledged: false,
        roomName: 'Veg Room B',
        value: 38,
        threshold: 40
      },
      {
        id: '3',
        type: 'info',
        severity: 'low',
        title: 'CO₂ Levels Optimized',
        message: 'CO₂ supplementation successfully maintaining 800-1000 ppm',
        source: 'co2-controller',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        read: true,
        acknowledged: true,
        roomName: 'Flower Room A',
        value: 850
      },
      {
        id: '4',
        type: 'alert',
        severity: 'high',
        title: 'pH Drift Detected',
        message: 'Reservoir pH has drifted from 5.8 to 6.4',
        source: 'ph-sensor-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        read: true,
        acknowledged: false,
        roomName: 'Nutrient Room',
        value: 6.4,
        threshold: 6.2
      },
      {
        id: '5',
        type: 'success',
        severity: 'low',
        title: 'Equipment Check Complete',
        message: 'All HVAC systems operating within normal parameters',
        source: 'system-monitor',
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        read: true,
        acknowledged: true
      }
    ];

    setAlerts(mockAlerts);
    updateStats(mockAlerts);
  }, []);

  const updateStats = (alertList: AlertItem[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setStats({
      total: alertList.length,
      unread: alertList.filter(a => !a.read).length,
      critical: alertList.filter(a => a.severity === 'critical').length,
      todayCount: alertList.filter(a => a.timestamp >= today).length
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.read;
    if (filter === 'critical') return alert.severity === 'critical';
    return true;
  });

  const markAsRead = (alertId: string) => {
    setAlerts(prev => {
      const updated = prev.map(a =>
        a.id === alertId ? { ...a, read: true } : a
      );
      updateStats(updated);
      return updated;
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => {
      const updated = prev.map(a =>
        a.id === alertId ? { ...a, acknowledged: true, read: true } : a
      );
      updateStats(updated);
      return updated;
    });
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => {
      const updated = prev.filter(a => a.id !== alertId);
      updateStats(updated);
      return updated;
    });
  };

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-purple-500" />
            Alert Center
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and manage all system alerts
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-300">Unread</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.unread}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-300">Critical</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.critical}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-300">Today</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.todayCount}</p>
            </div>
            <Clock className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'critical'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Critical
            </button>
          </div>
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <Filter className="w-4 h-4" />
            More Filters
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`bg-white dark:bg-gray-800 rounded-lg border ${
              !alert.read
                ? 'border-purple-500 shadow-md'
                : 'border-gray-200 dark:border-gray-700'
            } transition-all hover:shadow-lg`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${
                        !alert.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {alert.title}
                      </h4>
                      {!alert.read && (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {alert.roomName && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {alert.roomName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(alert.timestamp)}
                      </span>
                      {alert.value !== undefined && (
                        <span>
                          Value: {alert.value} {alert.threshold && `(Threshold: ${alert.threshold})`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!alert.acknowledged && alert.severity !== 'low' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No alerts found</p>
        </div>
      )}
    </div>
  );
}