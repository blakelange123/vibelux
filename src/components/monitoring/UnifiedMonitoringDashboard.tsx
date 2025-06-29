'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  QrCode,
  Bell,
  Settings,
  TrendingUp,
  Users,
  Package,
  Zap
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EnvironmentalData {
  temperature: number;
  humidity: number;
  co2: number;
  vpd: number;
  light: number;
  timestamp: string;
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface SensorDevice {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline';
  lastReading: Date;
}

export function UnifiedMonitoringDashboard() {
  const [environmentData, setEnvironmentData] = useState<EnvironmentalData[]>([]);
  const [currentEnv, setCurrentEnv] = useState<EnvironmentalData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('flower-1');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data on mount and set up polling
  useEffect(() => {
    fetchDevices();
    fetchEnvironmentData();
    fetchAlerts();

    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchEnvironmentData();
        fetchAlerts();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedRoom, autoRefresh]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/sensors/trolmaster?action=devices');
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const fetchEnvironmentData = async () => {
    try {
      // Fetch from Trolmaster
      const trolmasterResponse = await fetch(
        `/api/sensors/trolmaster?action=environment&deviceId=${selectedRoom}`
      );
      const trolmasterData = await trolmasterResponse.json();
      
      // Fetch from LI-COR
      const licorResponse = await fetch(
        `/api/sensors/licor?action=readings&sensorId=LI-190R-001`
      );
      const licorData = await licorResponse.json();
      
      // Combine data
      if (trolmasterData.environment) {
        const env: EnvironmentalData = {
          ...trolmasterData.environment,
          light: licorData.readings?.[0]?.ppfd || 0,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setCurrentEnv(env);
        setEnvironmentData(prev => [...prev.slice(-50), env]);
      }
    } catch (error) {
      console.error('Failed to fetch environment data:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/automation/alerts');
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch('/api/automation/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge', alertId })
      });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const generateQRCode = async () => {
    try {
      const response = await fetch(
        `/api/tracking?action=generateQR&entityType=plant&entityId=${Date.now()}&strain=BlueDream`
      );
      const data = await response.json();
      
      // Open QR code in new window
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <html>
            <head><title>Plant QR Code</title></head>
            <body style="text-align: center; padding: 20px;">
              <h2>Plant Tag: ${data.tagId}</h2>
              <img src="${data.qrCode}" alt="QR Code" />
              <p>Print this tag and attach to plant</p>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Unified Monitoring Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time facility monitoring and control</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              autoRefresh 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          
          <button
            onClick={generateQRCode}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Generate Tag
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
              <div>
                <h3 className="font-semibold text-red-400">
                  {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-red-300">{criticalAlerts[0].message}</p>
              </div>
            </div>
            <button
              onClick={() => acknowledgeAlert(criticalAlerts[0].id)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Room Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['flower-1', 'flower-2', 'veg-1', 'clone'].map(room => (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedRoom === room
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {room.charAt(0).toUpperCase() + room.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Current Conditions */}
      {currentEnv && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Temperature</span>
              <Thermometer className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-2xl font-bold">{currentEnv.temperature}°F</div>
            <div className={`text-sm ${
              currentEnv.temperature >= 68 && currentEnv.temperature <= 78 
                ? 'text-green-400' 
                : 'text-yellow-400'
            }`}>
              {currentEnv.temperature >= 68 && currentEnv.temperature <= 78 ? 'Optimal' : 'Check'}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Humidity</span>
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold">{currentEnv.humidity}%</div>
            <div className={`text-sm ${
              currentEnv.humidity >= 45 && currentEnv.humidity <= 65 
                ? 'text-green-400' 
                : 'text-yellow-400'
            }`}>
              VPD: {currentEnv.vpd} kPa
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">CO₂</span>
              <Wind className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{currentEnv.co2} ppm</div>
            <div className={`text-sm ${
              currentEnv.co2 >= 800 && currentEnv.co2 <= 1200 
                ? 'text-green-400' 
                : 'text-yellow-400'
            }`}>
              {currentEnv.co2 >= 800 && currentEnv.co2 <= 1200 ? 'Enhanced' : 'Adjust'}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">PPFD</span>
              <Sun className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold">{Math.round(currentEnv.light)}</div>
            <div className="text-sm text-gray-400">μmol/m²/s</div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Devices</span>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold">
              {devices.filter(d => d.status === 'online').length}/{devices.length}
            </div>
            <div className="text-sm text-green-400">Online</div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Environmental Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={environmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#f97316" 
                  name="Temp (°F)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  name="RH (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Light Intensity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={environmentData}>
                <defs>
                  <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="timestamp" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="light"
                  stroke="#fbbf24"
                  fillOpacity={1}
                  fill="url(#lightGradient)"
                  name="PPFD"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Active Alerts</h3>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">{activeAlerts.length} active</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              <p>All systems operating normally</p>
            </div>
          ) : (
            activeAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'critical' 
                    ? 'bg-red-900/20 border-red-600' 
                    : alert.severity === 'error'
                    ? 'bg-orange-900/20 border-orange-600'
                    : alert.severity === 'warning'
                    ? 'bg-yellow-900/20 border-yellow-600'
                    : 'bg-blue-900/20 border-blue-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}