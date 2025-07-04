"use client"

import { useState } from 'react'
import { 
  Plane,
  Brain,
  Activity,
  Settings,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Gauge,
  Target,
  Clock,
  Cpu,
  Wifi,
  Database,
  BarChart3,
  Play,
  Pause,
  RefreshCw,
  Info,
  ChevronRight,
  Eye,
  Lightbulb,
  Droplets,
  Thermometer,
  Wind,
  Calendar,
  Bot,
  Wrench,
  Truck
} from 'lucide-react'

interface AutomationProfile {
  id: string
  name: string
  strain: string
  description: string
  isActive: boolean
  createdDate: string
  successRate: number
  parameters: {
    temperature: { min: number; max: number; optimal: number }
    humidity: { min: number; max: number; optimal: number }
    co2: { min: number; max: number; optimal: number }
    vpd: { min: number; max: number; optimal: number }
    lightIntensity: { vegetative: number; flowering: number }
    photoperiod: { vegetative: string; flowering: string }
    irrigationFrequency: { vegetative: number; flowering: number }
    nutrientStrength: { vegetative: number; flowering: number }
  }
}

interface SystemStatus {
  component: string
  status: 'online' | 'offline' | 'warning'
  health: number
  lastCheck: string
  autoControl: boolean
}

interface AutomationEvent {
  id: string
  timestamp: string
  type: 'adjustment' | 'alert' | 'milestone' | 'prediction'
  severity: 'info' | 'warning' | 'success' | 'error'
  component: string
  message: string
  action?: string
  impact?: string
}

interface PerformanceMetric {
  metric: string
  current: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  optimizationPotential: number
}

interface PredictiveInsight {
  id: string
  type: 'yield' | 'issue' | 'optimization' | 'harvest'
  title: string
  description: string
  confidence: number
  timeframe: string
  recommendations: string[]
}

export function AutoPilotSystem() {
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(true)
  const [activeView, setActiveView] = useState<'dashboard' | 'profiles' | 'insights' | 'robotics' | 'settings'>('dashboard')
  const [selectedProfile, setSelectedProfile] = useState<string>('profile-001')

  // Automation profiles
  const automationProfiles: AutomationProfile[] = [
    {
      id: 'profile-001',
      name: 'Blue Dream Optimal',
      strain: 'Blue Dream',
      description: 'AI-optimized profile for maximum yield and quality',
      isActive: true,
      createdDate: '2024-01-01',
      successRate: 94,
      parameters: {
        temperature: { min: 20, max: 28, optimal: 24 },
        humidity: { min: 40, max: 70, optimal: 55 },
        co2: { min: 800, max: 1500, optimal: 1200 },
        vpd: { min: 0.8, max: 1.4, optimal: 1.1 },
        lightIntensity: { vegetative: 400, flowering: 650 },
        photoperiod: { vegetative: '18/6', flowering: '12/12' },
        irrigationFrequency: { vegetative: 3, flowering: 2 },
        nutrientStrength: { vegetative: 1.2, flowering: 1.8 }
      }
    },
    {
      id: 'profile-002',
      name: 'OG Kush Premium',
      strain: 'OG Kush',
      description: 'Stress-inducing profile for enhanced terpene production',
      isActive: false,
      createdDate: '2024-01-10',
      successRate: 91,
      parameters: {
        temperature: { min: 18, max: 26, optimal: 22 },
        humidity: { min: 35, max: 65, optimal: 50 },
        co2: { min: 900, max: 1400, optimal: 1100 },
        vpd: { min: 0.9, max: 1.5, optimal: 1.2 },
        lightIntensity: { vegetative: 350, flowering: 600 },
        photoperiod: { vegetative: '18/6', flowering: '12/12' },
        irrigationFrequency: { vegetative: 2, flowering: 2 },
        nutrientStrength: { vegetative: 1.0, flowering: 1.6 }
      }
    }
  ]

  // System components status
  const systemStatus: SystemStatus[] = [
    { component: 'Climate Control', status: 'online', health: 98, lastCheck: '2 min ago', autoControl: true },
    { component: 'Lighting System', status: 'online', health: 100, lastCheck: '1 min ago', autoControl: true },
    { component: 'Irrigation System', status: 'online', health: 95, lastCheck: '5 min ago', autoControl: true },
    { component: 'Nutrient Dosing', status: 'online', health: 92, lastCheck: '3 min ago', autoControl: true },
    { component: 'CO2 Management', status: 'warning', health: 87, lastCheck: '1 min ago', autoControl: true },
    { component: 'IPM System', status: 'online', health: 96, lastCheck: '10 min ago', autoControl: false },
    { component: 'Robotic Fleet', status: 'offline', health: 0, lastCheck: 'Development Phase', autoControl: false },
    { component: 'AI Coordination', status: 'online', health: 98, lastCheck: '1 min ago', autoControl: true }
  ]

  // Recent automation events
  const automationEvents: AutomationEvent[] = [
    {
      id: 'event-001',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      type: 'adjustment',
      severity: 'info',
      component: 'Climate Control',
      message: 'Increased humidity by 5% to maintain optimal VPD',
      action: 'Foggers activated for 30 seconds',
      impact: 'VPD returned to optimal range (1.1 kPa)'
    },
    {
      id: 'event-002',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'milestone',
      severity: 'success',
      component: 'Growth Tracking',
      message: 'Plants reached expected height for Week 5',
      impact: 'On track for projected yield'
    },
    {
      id: 'event-003',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'alert',
      severity: 'warning',
      component: 'CO2 Management',
      message: 'CO2 levels dropped below optimal range',
      action: 'Increased CO2 injection rate by 15%',
      impact: 'Levels stabilizing, monitoring continues'
    },
    {
      id: 'event-004',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      type: 'prediction',
      severity: 'info',
      component: 'AI Engine',
      message: 'Predicted optimal harvest window: 10-14 days',
      impact: 'Trichome development on schedule'
    },
    {
      id: 'event-005',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      type: 'alert',
      severity: 'info',
      component: 'Robotic Fleet',
      message: 'Robotic systems ready for integration',
      action: 'Level 5 automation infrastructure prepared',
      impact: 'Hardware integration will enable full autonomy'
    }
  ]

  // Performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    { metric: 'Energy Efficiency', current: 2.8, target: 2.5, unit: 'g/kWh', trend: 'up', optimizationPotential: 12 },
    { metric: 'Water Usage', current: 3.2, target: 3.5, unit: 'L/plant/day', trend: 'down', optimizationPotential: 8 },
    { metric: 'Growth Rate', current: 2.4, target: 2.2, unit: 'cm/day', trend: 'up', optimizationPotential: 5 },
    { metric: 'Nutrient Efficiency', current: 94, target: 95, unit: '%', trend: 'stable', optimizationPotential: 3 }
  ]

  // Predictive insights
  const predictiveInsights: PredictiveInsight[] = [
    {
      id: 'insight-001',
      type: 'yield',
      title: 'Yield Projection Update',
      description: 'Based on current growth patterns, expecting 15% above initial projections',
      confidence: 89,
      timeframe: '2 weeks',
      recommendations: [
        'Maintain current environmental parameters',
        'Consider slight increase in P/K ratio next week',
        'Monitor trichome development closely'
      ]
    },
    {
      id: 'insight-002',
      type: 'issue',
      title: 'Potential Calcium Deficiency',
      description: 'Early indicators suggest possible Ca deficiency developing in 3-5 days',
      confidence: 72,
      timeframe: '3-5 days',
      recommendations: [
        'Increase Cal-Mag supplementation by 0.5ml/L',
        'Check pH levels more frequently',
        'Review recent tissue analysis data'
      ]
    },
    {
      id: 'insight-003',
      type: 'optimization',
      title: 'Light Intensity Optimization',
      description: 'Plants can handle 8% more light intensity without stress',
      confidence: 85,
      timeframe: 'Immediate',
      recommendations: [
        'Gradually increase PPFD to 700 μmol/m²/s',
        'Monitor leaf temperature closely',
        'Adjust if signs of light stress appear'
      ]
    }
  ]

  const activeProfile = automationProfiles.find(p => p.id === selectedProfile)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400'
      case 'offline': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-400 bg-green-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/20'
      case 'error': return 'text-red-400 bg-red-500/20'
      case 'info': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${isAutoPilotActive ? 'bg-green-500/20' : 'bg-gray-700'}`}>
              <Plane className={`w-6 h-6 ${isAutoPilotActive ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Auto Pilot System</h2>
              <p className="text-sm text-gray-400 mt-1">
                AI-powered autonomous cultivation management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoPilotActive(!isAutoPilotActive)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isAutoPilotActive
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {isAutoPilotActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  Auto Pilot Active
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Activate Auto Pilot
                </>
              )}
            </button>
            <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {(['dashboard', 'profiles', 'insights', 'robotics', 'settings'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeView === view
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {view === 'robotics' ? (
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Robotics
                  <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                    Dev
                  </span>
                </div>
              ) : (
                view
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <>
          {/* System Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {systemStatus.map((system) => (
              <div key={system.component} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      system.status === 'online' ? 'bg-green-400' :
                      system.status === 'warning' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`} />
                    <h4 className="font-medium text-white">{system.component}</h4>
                  </div>
                  <span className={`text-sm ${getStatusColor(system.status)}`}>
                    {system.health}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Auto Control</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={system.autoControl}
                      className="sr-only peer"
                      readOnly
                    />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Last check: {system.lastCheck}</p>
              </div>
            ))}
          </div>

          {/* Active Profile Overview */}
          {activeProfile && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{activeProfile.name}</h3>
                  <p className="text-sm text-gray-400">{activeProfile.strain} • {activeProfile.successRate}% success rate</p>
                </div>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Switch Profile
                </button>
              </div>

              {/* Key Parameters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-400">Temperature</span>
                  </div>
                  <p className="text-lg font-medium text-white">{activeProfile.parameters.temperature.optimal}°C</p>
                  <p className="text-xs text-gray-500">Range: {activeProfile.parameters.temperature.min}-{activeProfile.parameters.temperature.max}°C</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Humidity</span>
                  </div>
                  <p className="text-lg font-medium text-white">{activeProfile.parameters.humidity.optimal}%</p>
                  <p className="text-xs text-gray-500">Range: {activeProfile.parameters.humidity.min}-{activeProfile.parameters.humidity.max}%</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-400">CO2</span>
                  </div>
                  <p className="text-lg font-medium text-white">{activeProfile.parameters.co2.optimal} ppm</p>
                  <p className="text-xs text-gray-500">Range: {activeProfile.parameters.co2.min}-{activeProfile.parameters.co2.max} ppm</p>
                </div>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">Light (Flower)</span>
                  </div>
                  <p className="text-lg font-medium text-white">{activeProfile.parameters.lightIntensity.flowering} PPFD</p>
                  <p className="text-xs text-gray-500">Photoperiod: {activeProfile.parameters.photoperiod.flowering}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Events */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Automation Activity</h3>
            <div className="space-y-3">
              {automationEvents.map((event) => {
                const EventIcon = 
                  event.type === 'adjustment' ? Settings :
                  event.type === 'alert' ? AlertTriangle :
                  event.type === 'milestone' ? CheckCircle :
                  Brain
                
                return (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(event.severity).split(' ')[1]}`}>
                      <EventIcon className={`w-4 h-4 ${getSeverityColor(event.severity).split(' ')[0]}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white">{event.message}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{event.component}</p>
                      {event.action && (
                        <p className="text-sm text-gray-500 mt-1">Action: {event.action}</p>
                      )}
                      {event.impact && (
                        <p className="text-sm text-green-400 mt-1">Impact: {event.impact}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Profiles View */}
      {activeView === 'profiles' && (
        <div className="space-y-4">
          {automationProfiles.map((profile) => (
            <div
              key={profile.id}
              className={`bg-gray-900 rounded-xl border p-6 cursor-pointer transition-all ${
                selectedProfile === profile.id
                  ? 'border-purple-600 shadow-lg shadow-purple-600/20'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => setSelectedProfile(profile.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${profile.isActive ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                    <Brain className={`w-6 h-6 ${profile.isActive ? 'text-green-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                    <p className="text-sm text-gray-400">{profile.strain} • Created {new Date(profile.createdDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{profile.successRate}%</p>
                  <p className="text-sm text-gray-400">Success Rate</p>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{profile.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="p-2 bg-gray-800 rounded">
                  <span className="text-gray-400">Temp:</span>
                  <span className="text-white ml-2">{profile.parameters.temperature.optimal}°C</span>
                </div>
                <div className="p-2 bg-gray-800 rounded">
                  <span className="text-gray-400">RH:</span>
                  <span className="text-white ml-2">{profile.parameters.humidity.optimal}%</span>
                </div>
                <div className="p-2 bg-gray-800 rounded">
                  <span className="text-gray-400">CO2:</span>
                  <span className="text-white ml-2">{profile.parameters.co2.optimal} ppm</span>
                </div>
                <div className="p-2 bg-gray-800 rounded">
                  <span className="text-gray-400">VPD:</span>
                  <span className="text-white ml-2">{profile.parameters.vpd.optimal} kPa</span>
                </div>
              </div>

              {profile.isActive && (
                <div className="mt-4 p-3 bg-green-900/20 rounded-lg border border-green-800">
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Currently Active Profile
                  </p>
                </div>
              )}
            </div>
          ))}

          <button className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-colors flex items-center justify-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-white">Create New Profile</span>
          </button>
        </div>
      )}

      {/* Insights View */}
      {activeView === 'insights' && (
        <>
          {/* Performance Metrics */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Optimization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performanceMetrics.map((metric) => (
                <div key={metric.metric} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{metric.metric}</h4>
                    <span className={`text-sm ${
                      metric.trend === 'up' ? 'text-green-400' :
                      metric.trend === 'down' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      <TrendingUp className={`w-4 h-4 inline ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">{metric.current}</span>
                    <span className="text-sm text-gray-400">{metric.unit}</span>
                    <span className="text-sm text-gray-500">/ Target: {metric.target}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${100 - metric.optimizationPotential}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{metric.optimizationPotential}% potential</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Insights */}
          <div className="space-y-4">
            {predictiveInsights.map((insight) => {
              const InsightIcon = 
                insight.type === 'yield' ? TrendingUp :
                insight.type === 'issue' ? AlertTriangle :
                insight.type === 'optimization' ? Target :
                Calendar
              
              return (
                <div key={insight.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      insight.type === 'yield' ? 'bg-green-500/20' :
                      insight.type === 'issue' ? 'bg-yellow-500/20' :
                      insight.type === 'optimization' ? 'bg-blue-500/20' :
                      'bg-purple-500/20'
                    }`}>
                      <InsightIcon className={`w-6 h-6 ${
                        insight.type === 'yield' ? 'text-green-400' :
                        insight.type === 'issue' ? 'text-yellow-400' :
                        insight.type === 'optimization' ? 'text-blue-400' :
                        'text-purple-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">{insight.timeframe}</span>
                          <span className="text-sm px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                            {insight.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">{insight.description}</p>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-white">Recommendations:</p>
                        {insight.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                            <ChevronRight className="w-3 h-3" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Robotics View */}
      {activeView === 'robotics' && (
        <div className="space-y-6">
          {/* Level 5 Automation Status */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Bot className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Level 5 Automation Infrastructure</h3>
                  <p className="text-sm text-gray-400">Robotic integration ready for hardware deployment</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">3.8/5</div>
                <p className="text-sm text-gray-400">Automation Level</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-white">AI Coordination</span>
                </div>
                <p className="text-sm text-gray-400">Multi-robot task optimization and path planning ready</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400">Ready</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium text-white">Control Interface</span>
                </div>
                <p className="text-sm text-gray-400">ROS2, MQTT, and fleet management APIs integrated</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs text-yellow-400">Development</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-white">Hardware Fleet</span>
                </div>
                <p className="text-sm text-gray-400">Physical robots pending deployment</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-xs text-red-400">Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Robotic Capabilities Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                Autonomous Operations
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Automated Harvesting</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Precision Planting</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Quality Inspection</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Material Transport</span>
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Partial</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                AI Integration
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Predictive Maintenance</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Task Optimization</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Fleet Coordination</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Continuous Learning</span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Roadmap */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              Level 5 Automation Roadmap
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-white">AI Coordination Engine</h5>
                  <p className="text-sm text-gray-400">Multi-robot task optimization and fleet management</p>
                </div>
                <span className="text-xs text-green-400">Complete</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-white">Control Interfaces</h5>
                  <p className="text-sm text-gray-400">ROS2, MQTT, and hardware communication protocols</p>
                </div>
                <span className="text-xs text-green-400">Complete</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-white">Hardware Integration</h5>
                  <p className="text-sm text-gray-400">Physical robot deployment and commissioning</p>
                </div>
                <span className="text-xs text-yellow-400">Pending</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-white">Full Autonomy</h5>
                  <p className="text-sm text-gray-400">Complete hands-off operation with minimal human oversight</p>
                </div>
                <span className="text-xs text-gray-400">Future</span>
              </div>
            </div>
          </div>

          {/* Level 5 Features */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h4 className="font-semibold text-white mb-4">Level 5 Automation Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Autonomous Environmental Control</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">AI-Powered Decision Making</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Predictive Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Real-time Optimization</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Automated Harvesting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Robotic Planting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Autonomous Logistics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Self-Maintenance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings View */}
      {activeView === 'settings' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Auto Pilot Settings</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-white mb-3">Automation Boundaries</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Allow temperature adjustments</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Allow nutrient concentration changes</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Allow light intensity modifications</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Enable predictive adjustments</span>
                  <input type="checkbox" defaultChecked className="rounded border-gray-600 bg-gray-800 text-purple-600" />
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-3">Alert Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Critical alerts only</span>
                  <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option>All alerts</option>
                    <option>Critical only</option>
                    <option>Critical & warnings</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Alert frequency</span>
                  <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                    <option>Real-time</option>
                    <option>Hourly summary</option>
                    <option>Daily digest</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-3">Machine Learning</h4>
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300">Training Data Points</span>
                  <span className="text-white font-medium">1.2M</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300">Model Accuracy</span>
                  <span className="text-white font-medium">94.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Last Training</span>
                  <span className="text-white font-medium">2 days ago</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-white mb-1">About Auto Pilot</h4>
                  <p className="text-sm text-gray-300">
                    The Auto Pilot system uses machine learning to optimize growing conditions in real-time. 
                    It learns from your specific facility and continuously improves its performance. 
                    All adjustments are logged and can be reviewed or rolled back if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}