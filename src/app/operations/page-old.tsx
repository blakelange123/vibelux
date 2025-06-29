'use client';

import React, { useState } from 'react';
import { 
  Activity,
  Layers,
  Droplets,
  Thermometer,
  FileText,
  AlertCircle,
  Settings,
  BarChart3,
  Zap,
  TrendingUp,
  CheckCircle,
  XCircle,
  Wind,
  Sun
} from 'lucide-react';
import { RecipeControlSystem } from '@/components/cultivation/RecipeControlSystem';
import { MultiLevelRackControl } from '@/components/cultivation/MultiLevelRackControl';
import { IrrigationControlPanel } from '@/components/cultivation/IrrigationControlPanel';
import { HVACSystemDashboard } from '@/components/cultivation/HVACSystemDashboard';
import { EnvironmentalMonitoringGrid } from '@/components/cultivation/EnvironmentalMonitoringGrid';

type TabType = 'main' | 'mode-control' | 'mode-settings' | 'mode-monitor' | 'level-settings' | 'light-control' | 'irrigation' | 'pump-filter' | 'nutrient' | 'recipe' | 'environmental' | 'alarms';

interface SystemStatus {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'critical' | 'offline';
  value?: string | number;
  unit?: string;
  lastUpdate: string;
}

export default function IndustrialOperationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [showGrid, setShowGrid] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  
  const systemStatuses: SystemStatus[] = [
    { id: 'recipe', name: 'Recipe Control', status: 'operational', value: 'Day 15/45', lastUpdate: '2 min ago' },
    { id: 'racks', name: 'Rack Systems', status: 'operational', value: '7/8 Active', lastUpdate: 'Real-time' },
    { id: 'irrigation', name: 'Irrigation', status: 'warning', value: '2.4 GPM', lastUpdate: 'Real-time' },
    { id: 'hvac', name: 'HVAC System', status: 'operational', value: '72.4°F', lastUpdate: 'Real-time' },
    { id: 'power', name: 'Power Systems', status: 'operational', value: '185.2 kW', lastUpdate: '5 sec ago' },
    { id: 'alarms', name: 'Active Alarms', status: 'warning', value: 3, lastUpdate: '1 hour ago' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'offline':
        return <div className="w-5 h-5 rounded-full bg-gray-500" />;
      default:
        return null;
    }
  };

  // AeroFarms-style tab structure
  const tabs = [
    { id: 'main', label: 'Main' },
    { id: 'mode-control', label: 'Mode Control' },
    { id: 'mode-settings', label: 'Mode Settings' },
    { id: 'mode-monitor', label: 'Mode Monitor' },
    { id: 'level-settings', label: 'Level Settings' },
    { id: 'light-control', label: 'Light Control' },
    { id: 'irrigation', label: 'Irrigation' },
    { id: 'pump-filter', label: 'Pump & Filter' },
    { id: 'nutrient', label: 'Nutrient' },
    { id: 'recipe', label: 'Recipe' },
    { id: 'environmental', label: 'Environmental' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* AeroFarms-style Industrial Header */}
      <div className="bg-gray-900 border-b-2 border-gray-700">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-white">VIBELUX</div>
              <div className="text-gray-400">AlphaFarm</div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* User Session */}
            <div className="text-sm">
              <span className="text-gray-400">User:</span>
              <span className="text-white ml-2 font-medium">ChristianLi</span>
            </div>
            
            {/* Date/Time */}
            <div className="text-sm">
              <span className="text-white font-mono">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
            </div>
            
            {/* System Controls */}
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors">
                Setup
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors">
                Restart
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors">
                Quit
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors">
                Lock
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors">
                Minimize
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AeroFarms-style Navigation Tabs */}
      <div className="bg-gray-800 border-b-2 border-gray-700">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between px-2">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'bg-gray-700 text-white border-green-500'
                    : 'text-gray-400 hover:text-white border-transparent hover:bg-gray-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-3 py-1 text-sm rounded ${
                showGrid ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Show Grid
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto p-6">
        {activeTab === 'main' && (
          <div className="space-y-6">
            {/* System Status Grid */}
            <div className="grid grid-cols-6 gap-4">
              {systemStatuses.map(system => (
                <div key={system.id} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium">{system.name}</h3>
                    {getStatusIcon(system.status)}
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{system.value}</p>
                  {system.unit && <p className="text-sm text-gray-400">{system.unit}</p>}
                  <p className="text-xs text-gray-500 mt-2">Updated: {system.lastUpdate}</p>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Sun className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Daily Light Integral</p>
                    <p className="text-2xl font-bold text-white">42.3 mol/m²/d</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+5.2% from target</span>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Droplets className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Water Efficiency</p>
                    <p className="text-2xl font-bold text-white">2.8 L/kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">-12.5% improvement</span>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Wind className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">VPD Average</p>
                    <p className="text-2xl font-bold text-white">1.2 kPa</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Within optimal range</span>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Zap className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Energy Usage</p>
                    <p className="text-2xl font-bold text-white">28.5 kWh/kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">-8.7% from last cycle</span>
                </div>
              </div>
            </div>

            {/* Real-time Monitoring Grid */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Zone Monitoring</h2>
              <div className="grid grid-cols-8 gap-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-4 text-center">
                    <h4 className="text-gray-400 text-sm mb-2">Zone {i + 1}</h4>
                    <p className="text-2xl font-bold text-white mb-1">
                      {(72 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2).toFixed(1)}°F
                    </p>
                    <p className="text-sm text-gray-400">
                      {(63 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4).toFixed(1)}% RH
                    </p>
                    <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mode-control' && <RecipeControlSystem />}
        {activeTab === 'mode-settings' && <MultiLevelRackControl />}
        {activeTab === 'mode-monitor' && <EnvironmentalMonitoringGrid />}
        {activeTab === 'level-settings' && <MultiLevelRackControl />}
        {activeTab === 'light-control' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Light Control System</h2>
            <div className="text-center text-gray-400 py-12">
              <Sun className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p>Light control system interface coming soon</p>
            </div>
          </div>
        )}
        {activeTab === 'irrigation' && <IrrigationControlPanel />}
        {activeTab === 'pump-filter' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Pump & Filter System</h2>
            <div className="text-center text-gray-400 py-12">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p>Pump and filter control interface coming soon</p>
            </div>
          </div>
        )}
        {activeTab === 'nutrient' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Nutrient Management</h2>
            <div className="text-center text-gray-400 py-12">
              <Droplets className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p>Nutrient dosing control interface coming soon</p>
            </div>
          </div>
        )}
        {activeTab === 'recipe' && <RecipeControlSystem />}
        {activeTab === 'environmental' && <HVACSystemDashboard />}
        
        {activeTab === 'alarms' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Active Alarms & Alerts</h2>
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="text-white font-medium">High Temperature - Zone 3</h3>
                    <p className="text-gray-400 text-sm">Temperature exceeded 75°F threshold</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">15 min ago</span>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                  <div>
                    <h3 className="text-white font-medium">Low Tank Level - Tank B</h3>
                    <p className="text-gray-400 text-sm">Tank B at 25% capacity</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">1 hour ago</span>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                  <div>
                    <h3 className="text-white font-medium">Maintenance Due - HVAC Unit 2</h3>
                    <p className="text-gray-400 text-sm">Filter replacement scheduled</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">3 hours ago</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}