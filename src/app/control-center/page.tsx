"use client"

import { useState } from 'react'
import { UnifiedControlCenter } from '@/components/UnifiedControlCenter'
import { MultiZoneClimateManager } from '@/components/MultiZoneClimateManager'
import { AutomatedLogisticsControl } from '@/components/AutomatedLogisticsControl'
import { PredictiveAnalyticsControl } from '@/components/PredictiveAnalyticsControl'
import { 
  Settings, 
  Layers, 
  Move,
  Home,
  Brain,
  Activity
} from 'lucide-react'

type TabType = 'overview' | 'climate' | 'logistics' | 'automation'

export default function ControlCenterPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs: { id: TabType; label: string; icon: any; description: string }[] = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: Home,
      description: 'Unified system monitoring and control'
    },
    { 
      id: 'climate', 
      label: 'Multi-Zone Climate', 
      icon: Layers,
      description: 'Zone-based environmental management'
    },
    { 
      id: 'logistics', 
      label: 'Logistics', 
      icon: Move,
      description: 'Automated plant movement and scheduling'
    },
    { 
      id: 'automation', 
      label: 'AI Automation', 
      icon: Brain,
      description: 'Intelligent automation rules and predictions'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Advanced Control Center</h1>
            <p className="text-sm text-gray-400 mt-1">
              Complete facility automation inspired by industry leaders
            </p>
          </div>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-900 border-b border-gray-800 px-6">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group relative px-4 py-3 text-sm font-medium rounded-t-lg transition-all
                  ${activeTab === tab.id 
                    ? 'text-white bg-gray-950 border-t border-l border-r border-gray-800' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="bg-gray-900/50 px-6 py-3 border-b border-gray-800">
        <p className="text-sm text-gray-400">
          {tabs.find(t => t.id === activeTab)?.description}
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && <UnifiedControlCenter />}
        {activeTab === 'climate' && <MultiZoneClimateManager />}
        {activeTab === 'logistics' && <AutomatedLogisticsControl />}
        {activeTab === 'automation' && <PredictiveAnalyticsControl />}
      </div>

      {/* System Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-400">All Systems Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">32 Active Processes</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>CPU: 42%</span>
            <span>Memory: 68%</span>
            <span>Network: 12 Mbps</span>
          </div>
        </div>
      </div>
    </div>
  )
}