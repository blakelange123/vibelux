'use client'

import React from 'react'
import {
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Lightbulb,
  Thermometer,
  Droplets
} from 'lucide-react'
import { ResponsiveCard, ResponsiveStat, ResponsiveGrid } from '@/components/ui/ResponsiveCard'
import { ResponsiveTable, ResponsiveDataList } from '@/components/ui/ResponsiveTable'
import { useMobile } from '@/hooks/useMobile'

// Sample data
const recentProjects = [
  {
    id: '1',
    name: 'Greenhouse A - Section 1',
    status: 'Active',
    ppfd: '650 μmol',
    fixtures: 48,
    lastUpdated: '2 hours ago'
  },
  {
    id: '2',
    name: 'Vertical Farm - Tower 3',
    status: 'Planning',
    ppfd: '450 μmol',
    fixtures: 32,
    lastUpdated: '1 day ago'
  },
  {
    id: '3',
    name: 'Indoor Cultivation Room',
    status: 'Active',
    ppfd: '800 μmol',
    fixtures: 64,
    lastUpdated: '5 minutes ago'
  }
]

const environmentalData = [
  { label: 'Temperature', value: '23.5°C' },
  { label: 'Humidity', value: '65%' },
  { label: 'CO₂', value: '800 ppm' },
  { label: 'VPD', value: '1.2 kPa' },
  { label: 'Light Hours', value: '18h' },
  { label: 'DLI', value: '42.1 mol' }
]

export default function MobileDashboardPage() {
  const { isMobile, isTablet, viewport } = useMobile()

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Welcome back! Here's your facility overview.
        </p>
        {/* Debug info - remove in production */}
        <p className="text-xs text-gray-600 mt-2">
          Viewport: {viewport.width}x{viewport.height} | 
          {isMobile ? ' Mobile' : isTablet ? ' Tablet' : ' Desktop'}
        </p>
      </div>

      {/* Stats Grid */}
      <ResponsiveGrid
        cols={{ mobile: 2, tablet: 2, desktop: 4 }}
        className="mb-6"
      >
        <ResponsiveStat
          label="Total Power"
          value="12.4 kW"
          change={{ value: 5.2, trend: 'up' }}
          icon={<Zap className="w-5 h-5 text-yellow-400" />}
          color="warning"
        />
        <ResponsiveStat
          label="Avg PPFD"
          value="625"
          change={{ value: 2.8, trend: 'up' }}
          icon={<Lightbulb className="w-5 h-5 text-purple-400" />}
          color="info"
        />
        <ResponsiveStat
          label="Active Zones"
          value="8/10"
          icon={<Activity className="w-5 h-5 text-green-400" />}
          color="success"
        />
        <ResponsiveStat
          label="Monthly Cost"
          value="$4,285"
          change={{ value: 3.1, trend: 'down' }}
          icon={<DollarSign className="w-5 h-5 text-green-400" />}
          color="default"
        />
      </ResponsiveGrid>

      {/* Main Content Grid */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <ResponsiveCard
            title="Recent Projects"
            description="Your active and recent lighting designs"
            icon={<Activity className="w-5 h-5 text-purple-400" />}
            actions={
              <button className="text-xs text-purple-400 hover:text-purple-300">
                View All
              </button>
            }
          >
            <ResponsiveTable
              data={recentProjects}
              columns={[
                { key: 'name', label: 'Project Name', sortable: true },
                { key: 'status', label: 'Status', render: (item) => (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'Active' 
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-yellow-900/50 text-yellow-400'
                  }`}>
                    {item.status}
                  </span>
                )},
                { key: 'ppfd', label: 'PPFD', mobileHidden: true },
                { key: 'fixtures', label: 'Fixtures', sortable: true },
                { key: 'lastUpdated', label: 'Updated', mobileHidden: true }
              ]}
            />
          </ResponsiveCard>
        </div>

        {/* Environmental Status */}
        <div>
          <ResponsiveCard
            title="Environmental Status"
            description="Current facility conditions"
            icon={<Thermometer className="w-5 h-5 text-orange-400" />}
            collapsible={isMobile}
          >
            <ResponsiveDataList items={environmentalData} />
            
            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors">
                  Adjust Temp
                </button>
                <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors">
                  Set Schedule
                </button>
              </div>
            </div>
          </ResponsiveCard>
        </div>
      </div>

      {/* Alerts Section */}
      <ResponsiveCard
        title="System Alerts"
        description="Important notifications and warnings"
        className="mt-6"
        collapsible={true}
        defaultCollapsed={isMobile}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
            <TrendingUp className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-200">High Temperature Warning</p>
              <p className="text-xs text-gray-400 mt-1">
                Zone 3 temperature exceeds threshold by 2.5°C
              </p>
            </div>
            <button className="text-xs text-yellow-400 hover:text-yellow-300">
              View
            </button>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
            <Droplets className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-200">Maintenance Reminder</p>
              <p className="text-xs text-gray-400 mt-1">
                Scheduled filter cleaning for HVAC Unit 2
              </p>
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-300">
              Schedule
            </button>
          </div>
        </div>
      </ResponsiveCard>

      {/* Mobile Bottom Navigation Preview */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2">
          <div className="grid grid-cols-4 gap-1">
            <button className="flex flex-col items-center gap-1 p-2 text-purple-400">
              <Activity className="w-5 h-5" />
              <span className="text-xs">Dashboard</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-gray-400">
              <Lightbulb className="w-5 h-5" />
              <span className="text-xs">Designer</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-gray-400">
              <Zap className="w-5 h-5" />
              <span className="text-xs">Lighting</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-gray-400">
              <Users className="w-5 h-5" />
              <span className="text-xs">Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}