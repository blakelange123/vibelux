'use client';

import React, { useState, useEffect } from 'react';
import {
  Scan,
  CheckSquare,
  Camera,
  Clipboard,
  AlertCircle,
  Wifi,
  WifiOff,
  Battery,
  Home,
  Menu,
  User,
  Settings,
  Cloud,
  CloudOff,
  Upload,
  Activity,
  Package,
  Leaf,
  Calendar,
  Bell,
  BarChart3
} from 'lucide-react';
import { 
  MobileApp, 
  QuickActions, 
  MobileNotification,
  TaskStatus,
  Priority,
  OfflineTask
} from '@/lib/mobile/mobile-types';
import { OfflineSyncManager } from '@/lib/mobile/offline-sync';
import { BarcodeScannerImpl } from '@/lib/mobile/barcode-scanner';
import VisualOpsButton from '@/components/mobile/VisualOpsButton';

export function MobileAppComponent() {
  const [activeView, setActiveView] = useState<'home' | 'tasks' | 'scan' | 'inventory' | 'alerts'>('home');
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [notifications, setNotifications] = useState<MobileNotification[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  // Initialize offline sync
  const syncManager = new OfflineSyncManager();
  const scanner = new BarcodeScannerImpl();

  useEffect(() => {
    // Monitor network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sample tasks
  const tasks: OfflineTask[] = [
    {
      id: 'task-1',
      type: 'Watering',
      title: 'Water Flower Room A',
      description: 'Standard feeding schedule',
      assignedTo: 'current-user',
      dueDate: new Date(),
      priority: 'High',
      status: 'Pending',
      room: 'Flower A',
      data: {},
      createdOffline: false,
      syncStatus: 'synced'
    },
    {
      id: 'task-2',
      type: 'Scouting',
      title: 'IPM Scout Veg Room',
      description: 'Weekly pest inspection',
      assignedTo: 'current-user',
      dueDate: new Date(),
      priority: 'Normal',
      status: 'Pending',
      room: 'Veg',
      data: {},
      createdOffline: false,
      syncStatus: 'synced'
    }
  ];

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-400 bg-red-900/20';
      case 'High': return 'text-orange-400 bg-orange-900/20';
      case 'Normal': return 'text-blue-400 bg-blue-900/20';
      case 'Low': return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'Completed': return <CheckSquare className="w-4 h-4 text-green-400" />;
      case 'In Progress': return <Activity className="w-4 h-4 text-blue-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      await syncManager.syncData();
      setSyncStatus('idle');
    } catch (error) {
      setSyncStatus('error');
    }
  };

  const handleBarcodeScan = async () => {
    try {
      const result = await scanner.scan();
      // Handle scan result
    } catch (error) {
      console.error('Scan failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Status Bar */}
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span>VibeLux Mobile</span>
          {isOnline ? (
            <Wifi className="w-3 h-3 text-green-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-400" />
          )}
        </div>
        <div className="flex items-center gap-3">
          {syncStatus === 'syncing' && (
            <Cloud className="w-3 h-3 text-blue-400 animate-pulse" />
          )}
          {syncStatus === 'error' && (
            <CloudOff className="w-3 h-3 text-red-400" />
          )}
          <div className="flex items-center gap-1">
            <Battery className="w-3 h-3 text-green-400" />
            <span>{batteryLevel}%</span>
          </div>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">
          {activeView === 'home' && 'Dashboard'}
          {activeView === 'tasks' && 'My Tasks'}
          {activeView === 'scan' && 'Scanner'}
          {activeView === 'inventory' && 'Inventory'}
          {activeView === 'alerts' && 'Alerts'}
        </h1>
        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeView === 'home' && (
          <div className="p-4 space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBarcodeScan}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <Scan className="w-8 h-8 text-purple-400" />
                <span className="text-sm">Scan Plant</span>
              </button>
              <button className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-gray-800 transition-colors">
                <Camera className="w-8 h-8 text-blue-400" />
                <span className="text-sm">Take Photo</span>
              </button>
              <button className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-gray-800 transition-colors">
                <Clipboard className="w-8 h-8 text-green-400" />
                <span className="text-sm">Complete Task</span>
              </button>
              <button className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-center gap-2 hover:bg-gray-800 transition-colors">
                <Package className="w-8 h-8 text-orange-400" />
                <span className="text-sm">Count Inventory</span>
              </button>
            </div>

            {/* Today's Tasks Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h2 className="font-semibold mb-3">Today's Tasks</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Tasks</span>
                  <span className="font-medium">{tasks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Completed</span>
                  <span className="font-medium text-green-400">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Pending</span>
                  <span className="font-medium text-yellow-400">{tasks.length}</span>
                </div>
              </div>
            </div>

            {/* Sync Status */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Sync Status</h3>
                <button
                  onClick={handleSync}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  disabled={syncStatus === 'syncing'}
                >
                  <Upload className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="text-sm">
                <p className="text-gray-400">
                  Status: <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </p>
                <p className="text-gray-400">
                  Last sync: <span className="text-white">5 min ago</span>
                </p>
                <p className="text-gray-400">
                  Pending: <span className="text-white">0 items</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeView === 'tasks' && (
          <div className="p-4 space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <h3 className="font-medium">{task.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{task.room}</span>
                  <span>{task.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {task.syncStatus === 'pending' && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
                    <CloudOff className="w-3 h-3" />
                    <span>Pending sync</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeView === 'scan' && (
          <div className="p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 flex flex-col items-center">
              <Scan className="w-16 h-16 text-purple-400 mb-4" />
              <h2 className="text-lg font-semibold mb-2">Ready to Scan</h2>
              <p className="text-sm text-gray-400 text-center mb-6">
                Point camera at barcode or QR code
              </p>
              <button
                onClick={handleBarcodeScan}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
              >
                Start Scanner
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="font-semibold">Recent Scans</h3>
              <p className="text-sm text-gray-400">No recent scans</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => setActiveView('home')}
            className={`p-3 flex flex-col items-center gap-1 ${
              activeView === 'home' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveView('tasks')}
            className={`p-3 flex flex-col items-center gap-1 ${
              activeView === 'tasks' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-xs">Tasks</span>
          </button>
          <button
            onClick={() => setActiveView('scan')}
            className={`p-3 flex flex-col items-center gap-1 ${
              activeView === 'scan' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <Scan className="w-5 h-5" />
            <span className="text-xs">Scan</span>
          </button>
          <button
            onClick={() => setActiveView('inventory')}
            className={`p-3 flex flex-col items-center gap-1 ${
              activeView === 'inventory' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">Inventory</span>
          </button>
          <button
            onClick={() => setActiveView('alerts')}
            className={`p-3 flex flex-col items-center gap-1 ${
              activeView === 'alerts' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-xs">Alerts</span>
          </button>
        </div>
      </div>

      {/* Side Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowMenu(false)}>
          <div className="w-64 h-full bg-gray-900 border-r border-gray-800 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">John Grower</p>
                <p className="text-sm text-gray-400">Cultivation Tech</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <span>Analytics</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Schedule</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Leaf className="w-5 h-5 text-gray-400" />
                <span>Plants</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Visual Operations Button */}
      <VisualOpsButton
        facilityId="default-facility"
        userId="current-user"
        position="bottom-right"
        compact={true}
      />
    </div>
  );
}