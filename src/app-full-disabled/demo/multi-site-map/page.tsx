'use client';

import React, { useState } from 'react';
import { MultiSiteMap } from '@/components/MultiSiteMap';
import { 
  MapPin, 
  Building, 
  Activity, 
  TrendingUp,
  Zap,
  Droplets,
  BarChart3,
  Clock,
  Calendar,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';

// Demo site data
const demoSites = [
  {
    id: 'denver-main',
    name: 'Denver Main Facility',
    location: 'Denver, CO',
    type: 'greenhouse' as const,
    status: 'active' as const,
    metrics: {
      totalFixtures: 248,
      totalPower: 186,
      avgPPFD: 850,
      yield: 3240,
      energyUsage: 134000,
      waterUsage: 4860
    },
    manager: 'John Martinez',
    size: 25000,
    alerts: []
  },
  {
    id: 'portland-vertical',
    name: 'Portland Vertical Farm',
    location: 'Portland, OR',
    type: 'vertical-farm' as const,
    status: 'active' as const,
    metrics: {
      totalFixtures: 512,
      totalPower: 384,
      avgPPFD: 920,
      yield: 6800,
      energyUsage: 276000,
      waterUsage: 8500
    },
    manager: 'Sarah Chen',
    size: 15000,
    alerts: [{ type: 'maintenance', message: 'HVAC filter replacement due' }]
  },
  {
    id: 'chicago-indoor',
    name: 'Chicago Indoor Grow',
    location: 'Chicago, IL',
    type: 'indoor' as const,
    status: 'active' as const,
    metrics: {
      totalFixtures: 186,
      totalPower: 140,
      avgPPFD: 780,
      yield: 2100,
      energyUsage: 100800,
      waterUsage: 3150
    },
    manager: 'Mike Johnson',
    size: 18000,
    alerts: []
  },
  {
    id: 'austin-greenhouse',
    name: 'Austin Greenhouse Complex',
    location: 'Austin, TX',
    type: 'greenhouse' as const,
    status: 'maintenance' as const,
    metrics: {
      totalFixtures: 324,
      totalPower: 243,
      avgPPFD: 800,
      yield: 4200,
      energyUsage: 175000,
      waterUsage: 5250
    },
    manager: 'Lisa Rodriguez',
    size: 30000,
    alerts: [
      { type: 'equipment', message: 'LED Panel #42 showing degradation' },
      { type: 'environmental', message: 'High temperature warning' }
    ]
  },
  {
    id: 'sacramento-hybrid',
    name: 'Sacramento Hybrid Facility',
    location: 'Sacramento, CA',
    type: 'hybrid' as const,
    status: 'active' as const,
    metrics: {
      totalFixtures: 428,
      totalPower: 321,
      avgPPFD: 900,
      yield: 5600,
      energyUsage: 231000,
      waterUsage: 7000
    },
    manager: 'David Kim',
    size: 35000,
    alerts: []
  },
  {
    id: 'phoenix-indoor',
    name: 'Phoenix Climate Control',
    location: 'Phoenix, AZ',
    type: 'indoor' as const,
    status: 'active' as const,
    metrics: {
      totalFixtures: 298,
      totalPower: 224,
      avgPPFD: 880,
      yield: 3800,
      energyUsage: 161000,
      waterUsage: 4750
    },
    manager: 'Carlos Mendez',
    size: 22000,
    alerts: []
  },
  {
    id: 'seattle-vertical',
    name: 'Seattle Urban Farm',
    location: 'Seattle, WA',
    type: 'vertical-farm' as const,
    status: 'active' as const,
    metrics: {
      totalFixtures: 456,
      totalPower: 342,
      avgPPFD: 940,
      yield: 6200,
      energyUsage: 246000,
      waterUsage: 7750
    },
    manager: 'Emily Thompson',
    size: 20000,
    alerts: []
  },
  {
    id: 'boston-research',
    name: 'Boston Research Facility',
    location: 'Boston, MA',
    type: 'indoor' as const,
    status: 'offline' as const,
    metrics: {
      totalFixtures: 124,
      totalPower: 93,
      avgPPFD: 750,
      yield: 1200,
      energyUsage: 67000,
      waterUsage: 1800
    },
    manager: 'Dr. Rachel Green',
    size: 12000,
    alerts: [
      { type: 'critical', message: 'System offline for upgrades' }
    ]
  },
  {
    id: 'miami-greenhouse',
    name: 'Miami Tropical Greenhouse',
    location: 'Miami, FL',
    type: 'greenhouse' as const,
    status: 'active' as const,
    metrics: {
      totalFixtures: 276,
      totalPower: 207,
      avgPPFD: 820,
      yield: 3600,
      energyUsage: 149000,
      waterUsage: 5400
    },
    manager: 'Roberto Silva',
    size: 28000,
    alerts: []
  },
  {
    id: 'minneapolis-indoor',
    name: 'Minneapolis Indoor Gardens',
    location: 'Minneapolis, MN',
    type: 'indoor' as const,
    status: 'active' as const,
    metrics: {
      totalFixtures: 342,
      totalPower: 257,
      avgPPFD: 860,
      yield: 4400,
      energyUsage: 185000,
      waterUsage: 5500
    },
    manager: 'Jennifer Anderson',
    size: 26000,
    alerts: []
  }
];

export default function MultiSiteMapDemo() {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSiteClick = (siteId: string) => {
    setSelectedSiteId(siteId);
  };

  const calculateTotals = () => {
    const totals = demoSites.reduce((acc, site) => ({
      fixtures: acc.fixtures + site.metrics.totalFixtures,
      power: acc.power + site.metrics.totalPower,
      yield: acc.yield + site.metrics.yield,
      energy: acc.energy + site.metrics.energyUsage,
      water: acc.water + site.metrics.waterUsage,
      area: acc.area + site.size
    }), { fixtures: 0, power: 0, yield: 0, energy: 0, water: 0, area: 0 });

    return totals;
  };

  const totals = calculateTotals();
  const activeSites = demoSites.filter(s => s.status === 'active').length;
  const totalAlerts = demoSites.reduce((sum, site) => sum + site.alerts.length, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <MapPin className="w-6 h-6 text-purple-400" />
                Multi-Site Network Map
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Real-time monitoring and analysis of {demoSites.length} cultivation facilities
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Active Sites</p>
                <p className="text-lg font-semibold">{activeSites}/{demoSites.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Power</p>
                <p className="text-lg font-semibold">{totals.power.toLocaleString()} kW</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Monthly Yield</p>
                <p className="text-lg font-semibold">{totals.yield.toLocaleString()} lbs</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Water Usage</p>
                <p className="text-lg font-semibold">{(totals.water / 1000).toFixed(1)}k gal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Area</p>
                <p className="text-lg font-semibold">{(totals.area / 1000).toFixed(0)}k sq ft</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Active Alerts</p>
                <p className="text-lg font-semibold">{totalAlerts}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1" style={{ height: 'calc(100vh - 180px)' }}>
        <MultiSiteMap
          key={refreshKey}
          sites={demoSites}
          onSiteClick={handleSiteClick}
          selectedSiteId={selectedSiteId}
        />
      </div>

      {/* Feature Highlights */}
      <div className="absolute bottom-4 right-4 bg-gray-900/95 rounded-lg p-4 max-w-sm">
        <h3 className="text-sm font-semibold text-white mb-2">Interactive Features</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Zoom with mouse wheel or buttons</li>
          <li>• Pan by clicking and dragging</li>
          <li>• Click sites for detailed information</li>
          <li>• Toggle clustering for better overview</li>
          <li>• Enable heat maps for performance metrics</li>
          <li>• Compare up to 2 sites side-by-side</li>
          <li>• Real-time data updates every 5 seconds</li>
          <li>• Automatic geocoding of new locations</li>
        </ul>
      </div>

      {/* Selected Site Info */}
      {selectedSiteId && (
        <div className="absolute top-40 left-4 bg-gray-900/95 rounded-lg p-4 max-w-xs">
          <h3 className="text-sm font-semibold text-white mb-2">Selected Site</h3>
          <p className="text-sm text-gray-300">
            {demoSites.find(s => s.id === selectedSiteId)?.name}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Click the site marker again to view full details
          </p>
        </div>
      )}
    </div>
  );
}