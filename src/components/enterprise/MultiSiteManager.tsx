'use client';

import React, { useState, useEffect } from 'react';
import {
  Building,
  MapPin,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  Plus,
  Settings,
  Eye,
  BarChart3,
  Zap,
  Droplets,
  Thermometer,
  Wind
} from 'lucide-react';

interface FacilityData {
  id: string;
  name: string;
  location: string;
  type: 'cultivation' | 'processing' | 'distribution' | 'retail';
  area: number; // square feet
  status: 'operational' | 'maintenance' | 'offline';
  manager: string;
  lastUpdate: Date;
  kpis: {
    production: number; // kg/month
    efficiency: number; // %
    energyConsumption: number; // kWh/day
    waterUsage: number; // gallons/day
    temperature: number; // °C
    humidity: number; // %
    co2: number; // ppm
    activeGrows: number;
    harvestsThisMonth: number;
  };
  alarms: {
    critical: number;
    warning: number;
    info: number;
  };
  financials: {
    revenue: number; // monthly
    costs: number; // monthly
    profit: number; // monthly
    profitMargin: number; // %
  };
}

interface MultiSiteManagerProps {
  organizationId: string;
}

export function MultiSiteManager({ organizationId }: MultiSiteManagerProps) {
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'map'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    // Load facilities data
    loadFacilities();
  }, [organizationId]);

  const loadFacilities = async () => {
    // In real implementation, this would fetch from API
    const mockFacilities: FacilityData[] = [
      {
        id: 'facility-1',
        name: 'North Valley Cultivation',
        location: 'Denver, CO',
        type: 'cultivation',
        area: 25000,
        status: 'operational',
        manager: 'Sarah Johnson',
        lastUpdate: new Date(),
        kpis: {
          production: 450,
          efficiency: 94,
          energyConsumption: 1250,
          waterUsage: 850,
          temperature: 24,
          humidity: 65,
          co2: 1200,
          activeGrows: 12,
          harvestsThisMonth: 8
        },
        alarms: { critical: 0, warning: 2, info: 5 },
        financials: {
          revenue: 125000,
          costs: 75000,
          profit: 50000,
          profitMargin: 40
        }
      },
      {
        id: 'facility-2',
        name: 'Mountain View Processing',
        location: 'Boulder, CO',
        type: 'processing',
        area: 15000,
        status: 'operational',
        manager: 'Mike Chen',
        lastUpdate: new Date(),
        kpis: {
          production: 680,
          efficiency: 88,
          energyConsumption: 980,
          waterUsage: 420,
          temperature: 22,
          humidity: 45,
          co2: 800,
          activeGrows: 0,
          harvestsThisMonth: 15
        },
        alarms: { critical: 1, warning: 3, info: 2 },
        financials: {
          revenue: 185000,
          costs: 95000,
          profit: 90000,
          profitMargin: 48.6
        }
      },
      {
        id: 'facility-3',
        name: 'Eastside Distribution Hub',
        location: 'Aurora, CO',
        type: 'distribution',
        area: 35000,
        status: 'maintenance',
        manager: 'Lisa Park',
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        kpis: {
          production: 0,
          efficiency: 0,
          energyConsumption: 450,
          waterUsage: 120,
          temperature: 18,
          humidity: 40,
          co2: 400,
          activeGrows: 0,
          harvestsThisMonth: 0
        },
        alarms: { critical: 3, warning: 1, info: 0 },
        financials: {
          revenue: 95000,
          costs: 85000,
          profit: 10000,
          profitMargin: 10.5
        }
      },
      {
        id: 'facility-4',
        name: 'West Metro Retail',
        location: 'Lakewood, CO',
        type: 'retail',
        area: 3500,
        status: 'operational',
        manager: 'David Rodriguez',
        lastUpdate: new Date(),
        kpis: {
          production: 0,
          efficiency: 96,
          energyConsumption: 180,
          waterUsage: 25,
          temperature: 21,
          humidity: 35,
          co2: 450,
          activeGrows: 0,
          harvestsThisMonth: 0
        },
        alarms: { critical: 0, warning: 0, info: 1 },
        financials: {
          revenue: 65000,
          costs: 35000,
          profit: 30000,
          profitMargin: 46.2
        }
      }
    ];

    setFacilities(mockFacilities);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cultivation': return Building;
      case 'processing': return Settings;
      case 'distribution': return MapPin;
      case 'retail': return Users;
      default: return Building;
    }
  };

  const getTotalAlarms = (alarms: FacilityData['alarms']) => {
    return alarms.critical + alarms.warning + alarms.info;
  };

  const filteredFacilities = facilities.filter(facility => {
    if (filterType === 'all') return true;
    return facility.type === filterType;
  });

  const sortedFacilities = [...filteredFacilities].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'status': return a.status.localeCompare(b.status);
      case 'production': return b.kpis.production - a.kpis.production;
      case 'efficiency': return b.kpis.efficiency - a.kpis.efficiency;
      case 'profit': return b.financials.profit - a.financials.profit;
      default: return 0;
    }
  });

  // Calculate organization-wide totals
  const orgTotals = facilities.reduce((acc, facility) => ({
    totalArea: acc.totalArea + facility.area,
    totalProduction: acc.totalProduction + facility.kpis.production,
    totalRevenue: acc.totalRevenue + facility.financials.revenue,
    totalProfit: acc.totalProfit + facility.financials.profit,
    totalEnergy: acc.totalEnergy + facility.kpis.energyConsumption,
    totalAlarms: acc.totalAlarms + getTotalAlarms(facility.alarms),
    avgEfficiency: acc.avgEfficiency + facility.kpis.efficiency,
    operationalCount: acc.operationalCount + (facility.status === 'operational' ? 1 : 0)
  }), {
    totalArea: 0,
    totalProduction: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalEnergy: 0,
    totalAlarms: 0,
    avgEfficiency: 0,
    operationalCount: 0
  });

  orgTotals.avgEfficiency = orgTotals.avgEfficiency / facilities.length;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Multi-Site Operations</h1>
            <p className="text-gray-400">Manage all facilities from one dashboard</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Facility
          </button>
        </div>

        {/* Organization Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Facilities</p>
                <p className="text-2xl font-bold">{facilities.length}</p>
              </div>
              <Building className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-sm text-green-400 mt-2">
              {orgTotals.operationalCount} operational
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Monthly Production</p>
                <p className="text-2xl font-bold">{orgTotals.totalProduction.toLocaleString()} kg</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {orgTotals.avgEfficiency.toFixed(1)}% avg efficiency
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold">${orgTotals.totalRevenue.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-sm text-green-400 mt-2">
              ${orgTotals.totalProfit.toLocaleString()} profit
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Alarms</p>
                <p className="text-2xl font-bold">{orgTotals.totalAlarms}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-sm text-yellow-400 mt-2">
              {facilities.filter(f => f.alarms.critical > 0).length} critical
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Types</option>
              <option value="cultivation">Cultivation</option>
              <option value="processing">Processing</option>
              <option value="distribution">Distribution</option>
              <option value="retail">Retail</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
              <option value="production">Sort by Production</option>
              <option value="efficiency">Sort by Efficiency</option>
              <option value="profit">Sort by Profit</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600' : 'bg-gray-800'}`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-purple-600' : 'bg-gray-800'}`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedFacilities.map(facility => {
            const TypeIcon = getTypeIcon(facility.type);
            
            return (
              <div 
                key={facility.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500 transition-colors cursor-pointer"
                onClick={() => setSelectedFacility(facility.id)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TypeIcon className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="font-semibold">{facility.name}</h3>
                      <p className="text-sm text-gray-400">{facility.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(facility.status)}`} />
                    <span className="text-sm capitalize">{facility.status}</span>
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">Production</span>
                    </div>
                    <p className="font-semibold">{facility.kpis.production} kg/mo</p>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Efficiency</span>
                    </div>
                    <p className="font-semibold">{facility.kpis.efficiency}%</p>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-400">Energy</span>
                    </div>
                    <p className="font-semibold">{facility.kpis.energyConsumption} kWh/day</p>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-400">Profit</span>
                    </div>
                    <p className="font-semibold">${facility.financials.profit.toLocaleString()}</p>
                  </div>
                </div>

                {/* Environmental */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <Thermometer className="w-4 h-4 text-red-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Temp</p>
                    <p className="text-sm font-medium">{facility.kpis.temperature}°C</p>
                  </div>
                  <div className="text-center">
                    <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Humidity</p>
                    <p className="text-sm font-medium">{facility.kpis.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <Wind className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">CO₂</p>
                    <p className="text-sm font-medium">{facility.kpis.co2} ppm</p>
                  </div>
                </div>

                {/* Alarms */}
                {getTotalAlarms(facility.alarms) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Alarms:</span>
                    <div className="flex items-center gap-2">
                      {facility.alarms.critical > 0 && (
                        <span className="text-red-400">{facility.alarms.critical} critical</span>
                      )}
                      {facility.alarms.warning > 0 && (
                        <span className="text-yellow-400">{facility.alarms.warning} warning</span>
                      )}
                      {facility.alarms.info > 0 && (
                        <span className="text-blue-400">{facility.alarms.info} info</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Manager */}
                <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-gray-800">
                  <span className="text-gray-400">Manager: {facility.manager}</span>
                  <span className="text-xs text-gray-500">
                    Updated {facility.lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Facility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Production
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Efficiency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Alarms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Manager
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedFacilities.map(facility => {
                const TypeIcon = getTypeIcon(facility.type);
                
                return (
                  <tr 
                    key={facility.id}
                    className="hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedFacility(facility.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <TypeIcon className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-sm font-medium">{facility.name}</div>
                          <div className="text-sm text-gray-400">{facility.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(facility.status)}`} />
                        <span className="text-sm capitalize">{facility.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {facility.kpis.production} kg/mo
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {facility.kpis.efficiency}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ${facility.financials.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getTotalAlarms(facility.alarms) > 0 ? (
                        <div className="flex items-center gap-1">
                          {facility.alarms.critical > 0 && (
                            <span className="text-red-400">{facility.alarms.critical}C</span>
                          )}
                          {facility.alarms.warning > 0 && (
                            <span className="text-yellow-400">{facility.alarms.warning}W</span>
                          )}
                          {facility.alarms.info > 0 && (
                            <span className="text-blue-400">{facility.alarms.info}I</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-green-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {facility.manager}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}