"use client"

import { useState } from 'react'
import { 
  Leaf, 
  Shield, 
  BarChart3, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  Database,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  Activity,
  Zap,
  Target,
  Settings,
  RefreshCw,
  Eye,
  Download
} from 'lucide-react'

interface Plant {
  id: string
  tag: string
  strain: string
  plantedDate: string
  currentStage: 'vegetative' | 'flowering' | 'harvested' | 'destroyed'
  room: string
  parentPackage?: string
  harvestDate?: string
  dryWeight?: number
  compliance: 'compliant' | 'warning' | 'violation'
  metrcId: string
  climateMetrics: {
    avgTemp: number
    avgHumidity: number
    avgDli: number
    co2Levels: number
  }
  yieldPrediction?: number
}

interface Package {
  id: string
  tag: string
  productType: 'flower' | 'trim' | 'waste' | 'seeds'
  quantity: number
  unit: 'grams' | 'ounces' | 'pounds'
  strain: string
  packagedDate: string
  lab: {
    tested: boolean
    results?: {
      thc: number
      cbd: number
      moisture: number
      pesticides: 'pass' | 'fail'
      microbials: 'pass' | 'fail'
    }
  }
  compliance: 'compliant' | 'pending' | 'violation'
  metrcId: string
}

interface ComplianceAlert {
  id: string
  type: 'missing_test' | 'tag_discrepancy' | 'harvest_overdue' | 'transfer_pending'
  severity: 'critical' | 'warning' | 'info'
  plantId?: string
  packageId?: string
  message: string
  dueDate?: string
  resolution?: string
}

interface YieldAnalytics {
  strainPerformance: {
    strain: string
    avgYield: number
    avgDli: number
    avgTemp: number
    avgHumidity: number
    efficiency: number
  }[]
  roomPerformance: {
    room: string
    plantsActive: number
    avgYield: number
    complianceRate: number
    climateOptimal: boolean
  }[]
  predictions: {
    nextHarvest: string
    estimatedYield: number
    strainBreakdown: { strain: string; yield: number }[]
  }
}

type ViewType = 'dashboard' | 'tracking' | 'compliance' | 'analytics' | 'settings'

const mockPlants: Plant[] = [
  {
    id: '1',
    tag: '1A4060300002EE1000000123',
    strain: 'Blue Dream',
    plantedDate: '2024-09-15',
    currentStage: 'flowering',
    room: 'Flower Room A',
    metrcId: 'BD-FL-001',
    compliance: 'compliant',
    climateMetrics: {
      avgTemp: 78,
      avgHumidity: 55,
      avgDli: 42,
      co2Levels: 1200
    },
    yieldPrediction: 125
  },
  {
    id: '2',
    tag: '1A4060300002EE1000000124',
    strain: 'OG Kush',
    plantedDate: '2024-09-01',
    currentStage: 'flowering',
    room: 'Flower Room B',
    metrcId: 'OG-FL-002',
    compliance: 'warning',
    climateMetrics: {
      avgTemp: 82,
      avgHumidity: 48,
      avgDli: 38,
      co2Levels: 1100
    },
    yieldPrediction: 98
  }
]

const mockPackages: Package[] = [
  {
    id: '1',
    tag: '1A4060300002EE1000000456',
    productType: 'flower',
    quantity: 454,
    unit: 'grams',
    strain: 'Purple Haze',
    packagedDate: '2024-11-01',
    lab: {
      tested: true,
      results: {
        thc: 24.2,
        cbd: 0.8,
        moisture: 11.5,
        pesticides: 'pass',
        microbials: 'pass'
      }
    },
    compliance: 'compliant',
    metrcId: 'PH-PKG-001'
  }
]

const mockAlerts: ComplianceAlert[] = [
  {
    id: '1',
    type: 'harvest_overdue',
    severity: 'warning',
    plantId: '2',
    message: 'OG Kush plant approaching maximum flowering time',
    dueDate: '2024-12-15'
  },
  {
    id: '2',
    type: 'missing_test',
    severity: 'critical',
    packageId: '1',
    message: 'Package requires mandatory testing before sale',
    dueDate: '2024-12-10'
  }
]

const mockAnalytics: YieldAnalytics = {
  strainPerformance: [
    { strain: 'Blue Dream', avgYield: 125, avgDli: 42, avgTemp: 78, avgHumidity: 55, efficiency: 92 },
    { strain: 'OG Kush', avgYield: 98, avgDli: 38, avgTemp: 82, avgHumidity: 48, efficiency: 78 },
    { strain: 'Purple Haze', avgYield: 142, avgDli: 45, avgTemp: 76, avgHumidity: 58, efficiency: 95 }
  ],
  roomPerformance: [
    { room: 'Flower Room A', plantsActive: 24, avgYield: 125, complianceRate: 100, climateOptimal: true },
    { room: 'Flower Room B', plantsActive: 18, avgYield: 108, complianceRate: 89, climateOptimal: false }
  ],
  predictions: {
    nextHarvest: '2024-12-20',
    estimatedYield: 2840,
    strainBreakdown: [
      { strain: 'Blue Dream', yield: 1250 },
      { strain: 'OG Kush', yield: 890 },
      { strain: 'Purple Haze', yield: 700 }
    ]
  }
}

export default function MetrcIntegration() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [plants] = useState<Plant[]>(mockPlants)
  const [packages] = useState<Package[]>(mockPackages)
  const [alerts] = useState<ComplianceAlert[]>(mockAlerts)
  const [analytics] = useState<YieldAnalytics>(mockAnalytics)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tracking', label: 'Plant Tracking', icon: Leaf },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'METRC Settings', icon: Settings }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Leaf className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Plants</p>
              <p className="text-xl font-bold text-white">{plants.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Packages</p>
              <p className="text-xl font-bold text-white">{packages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Alerts</p>
              <p className="text-xl font-bold text-white">{alerts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Compliance Rate</p>
              <p className="text-xl font-bold text-white">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent METRC Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <div className="flex-1">
              <p className="text-sm text-white">Plant tag 1A4060300002EE1000000123 moved to flowering</p>
              <p className="text-xs text-gray-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <FileText className="w-4 h-4 text-blue-400" />
            <div className="flex-1">
              <p className="text-sm text-white">Package 1A4060300002EE1000000456 lab results uploaded</p>
              <p className="text-xs text-gray-400">4 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button className="p-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync METRC
          </button>
          <button className="p-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="p-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Eye className="w-4 h-4" />
            View Reports
          </button>
          <button className="p-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configure
          </button>
        </div>
      </div>
    </div>
  )

  const renderTracking = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Plant Tracking</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
          Add New Plant
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tag</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Strain</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Room</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">DLI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Predicted Yield</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {plants.map((plant) => (
                <tr key={plant.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-white font-mono">{plant.tag}</td>
                  <td className="px-4 py-3 text-sm text-white">{plant.strain}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      plant.currentStage === 'flowering' ? 'bg-purple-500/20 text-purple-400' :
                      plant.currentStage === 'vegetative' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {plant.currentStage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{plant.room}</td>
                  <td className="px-4 py-3 text-sm text-white">{plant.climateMetrics.avgDli}</td>
                  <td className="px-4 py-3 text-sm text-white">{plant.yieldPrediction}g</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      plant.compliance === 'compliant' ? 'bg-green-500/20 text-green-400' :
                      plant.compliance === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {plant.compliance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Active Alerts
        </h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
              alert.severity === 'critical' ? 'bg-red-500/10 border-red-500' :
              alert.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
              'bg-blue-500/10 border-blue-500'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{alert.message}</p>
                  {alert.dueDate && (
                    <p className="text-xs text-gray-400 mt-1">Due: {alert.dueDate}</p>
                  )}
                </div>
                <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors">
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Compliance Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">Tag Compliance</p>
            <p className="text-xl font-bold text-white">98%</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400">Testing Rate</p>
            <p className="text-xl font-bold text-white">94%</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-sm text-gray-400">On-Time Reports</p>
            <p className="text-xl font-bold text-white">91%</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-400">Audit Score</p>
            <p className="text-xl font-bold text-white">A-</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Strain Performance Analytics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Strain</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Avg Yield (g)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Avg DLI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Optimal Temp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {analytics.strainPerformance.map((strain, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-white font-medium">{strain.strain}</td>
                  <td className="px-4 py-3 text-sm text-white">{strain.avgYield}</td>
                  <td className="px-4 py-3 text-sm text-white">{strain.avgDli}</td>
                  <td className="px-4 py-3 text-sm text-white">{strain.avgTemp}°F</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${strain.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white">{strain.efficiency}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Next Harvest Prediction</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Estimated Date</p>
              <p className="text-xl font-bold text-white">{analytics.predictions.nextHarvest}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Yield</p>
              <p className="text-xl font-bold text-white">{analytics.predictions.estimatedYield}g</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Strain Breakdown</p>
              {analytics.predictions.strainBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-white">{item.strain}</span>
                  <span className="text-sm text-gray-400">{item.yield}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Climate Optimization</h3>
          <div className="space-y-4">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-400">✓ Flower Room A</p>
              <p className="text-xs text-gray-400">Optimal climate conditions maintained</p>
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm font-medium text-yellow-400">⚠ Flower Room B</p>
              <p className="text-xs text-gray-400">Temperature running high - consider adjusting HVAC</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Climate-Yield Correlation</p>
              <p className="text-xs text-gray-500">
                Analysis shows 23% yield increase when maintaining DLI above 40 and humidity between 50-60%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">METRC API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">State License</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Enter your state license number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
            <input 
              type="password" 
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Enter METRC API key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">User Key</label>
            <input 
              type="password" 
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Enter METRC user key"
            />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="auto-sync" className="rounded" />
            <label htmlFor="auto-sync" className="text-sm text-gray-400">
              Enable automatic synchronization every 15 minutes
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Integration Status</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white">API Connection Active</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white">Plant Data Sync Enabled</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-white">Package Sync Pending</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return renderDashboard()
      case 'tracking': return renderTracking()
      case 'compliance': return renderCompliance()
      case 'analytics': return renderAnalytics()
      case 'settings': return renderSettings()
      default: return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">METRC Integration</h1>
          <p className="text-gray-400">Seed-to-sale tracking and yield optimization for cannabis cultivation</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg border border-gray-800">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as ViewType)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                  activeView === tab.id
                    ? 'text-white bg-purple-600 rounded-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  )
}