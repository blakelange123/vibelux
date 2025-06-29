"use client"

import { useState } from 'react'
import { 
  Lightbulb, 
  Zap, 
  Target, 
  Clock, 
  TrendingUp,
  Settings,
  Activity,
  BarChart3,
  Battery,
  DollarSign,
  Gauge,
  Sun,
  Moon,
  Thermometer,
  Droplets,
  Leaf,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Sliders
} from 'lucide-react'

interface ColorChannel {
  name: string
  wavelength: string
  currentIntensity: number
  maxIntensity: number
  energyDraw: number // watts per unit intensity
  biologicalResponse: string
}

interface TunableFixture {
  id: string
  name: string
  room: string
  channels: ColorChannel[]
  currentDLI: number
  targetDLI: number
  energyEfficiency: number
  status: 'optimal' | 'modulating' | 'offline' | 'error'
  location: { x: number; y: number }
  lastCalibration: string
}

interface EnergyProfile {
  timeSlot: string
  rate: number // $/kWh
  demand: 'low' | 'medium' | 'high' | 'peak'
  suggestedStrategy: string
}

interface SpectrumStrategy {
  id: string
  name: string
  description: string
  timeRange: string
  channelAdjustments: {
    channelName: string
    intensityPercent: number
    priority: number
  }[]
  energySavings: number
  dliImpact: number
  active: boolean
}

interface UtilityData {
  currentRate: number
  peakHours: string[]
  offPeakHours: string[]
  realTimeUsage: number
  projectedCost: number
  connectionStatus: 'connected' | 'disconnected' | 'error'
  lastUpdate: string
}

type ViewType = 'overview' | 'fixtures' | 'strategies' | 'energy' | 'utility' | 'settings'

const mockFixtures: TunableFixture[] = [
  {
    id: '1',
    name: 'Flower Room A - Zone 1',
    room: 'Flower Room A',
    channels: [
      { name: 'Deep Red', wavelength: '660nm', currentIntensity: 45, maxIntensity: 100, energyDraw: 0.8, biologicalResponse: 'Flowering, stretch' },
      { name: 'Red', wavelength: '630nm', currentIntensity: 85, maxIntensity: 100, energyDraw: 1.2, biologicalResponse: 'Photosynthesis' },
      { name: 'Blue', wavelength: '450nm', currentIntensity: 60, maxIntensity: 100, energyDraw: 1.8, biologicalResponse: 'Compact growth' },
      { name: 'White', wavelength: '5000K', currentIntensity: 70, maxIntensity: 100, energyDraw: 1.5, biologicalResponse: 'General growth' },
      { name: 'Far Red', wavelength: '730nm', currentIntensity: 20, maxIntensity: 100, energyDraw: 0.6, biologicalResponse: 'Shade avoidance' },
      { name: 'UV-A', wavelength: '365nm', currentIntensity: 10, maxIntensity: 100, energyDraw: 0.9, biologicalResponse: 'Trichome production' }
    ],
    currentDLI: 42,
    targetDLI: 45,
    energyEfficiency: 87,
    status: 'modulating',
    location: { x: 10, y: 15 },
    lastCalibration: '2024-11-15'
  },
  {
    id: '2',
    name: 'Flower Room A - Zone 2',
    room: 'Flower Room A',
    channels: [
      { name: 'Deep Red', wavelength: '660nm', currentIntensity: 55, maxIntensity: 100, energyDraw: 0.8, biologicalResponse: 'Flowering, stretch' },
      { name: 'Red', wavelength: '630nm', currentIntensity: 90, maxIntensity: 100, energyDraw: 1.2, biologicalResponse: 'Photosynthesis' },
      { name: 'Blue', wavelength: '450nm', currentIntensity: 65, maxIntensity: 100, energyDraw: 1.8, biologicalResponse: 'Compact growth' },
      { name: 'White', wavelength: '5000K', currentIntensity: 75, maxIntensity: 100, energyDraw: 1.5, biologicalResponse: 'General growth' },
      { name: 'Far Red', wavelength: '730nm', currentIntensity: 25, maxIntensity: 100, energyDraw: 0.6, biologicalResponse: 'Shade avoidance' },
      { name: 'UV-A', wavelength: '365nm', currentIntensity: 15, maxIntensity: 100, energyDraw: 0.9, biologicalResponse: 'Trichome production' }
    ],
    currentDLI: 47,
    targetDLI: 45,
    energyEfficiency: 91,
    status: 'optimal',
    location: { x: 20, y: 15 },
    lastCalibration: '2024-11-12'
  }
]

const mockEnergyProfile: EnergyProfile[] = [
  { timeSlot: '12:00 AM', rate: 0.08, demand: 'low', suggestedStrategy: 'Maximize deep red for DLI maintenance' },
  { timeSlot: '6:00 AM', rate: 0.12, demand: 'medium', suggestedStrategy: 'Begin transition to balanced spectrum' },
  { timeSlot: '12:00 PM', rate: 0.18, demand: 'high', suggestedStrategy: 'Deep red priority, reduce blue channels' },
  { timeSlot: '6:00 PM', rate: 0.24, demand: 'peak', suggestedStrategy: 'Maximum deep red modulation' }
]

const mockStrategies: SpectrumStrategy[] = [
  {
    id: '1',
    name: 'Peak Energy Deep Red',
    description: 'Maximize deep red channels during peak energy hours while maintaining target DLI',
    timeRange: '4:00 PM - 8:00 PM',
    channelAdjustments: [
      { channelName: 'Deep Red', intensityPercent: 85, priority: 1 },
      { channelName: 'Red', intensityPercent: 90, priority: 2 },
      { channelName: 'Blue', intensityPercent: 35, priority: 4 },
      { channelName: 'White', intensityPercent: 40, priority: 5 },
      { channelName: 'Far Red', intensityPercent: 60, priority: 3 },
      { channelName: 'UV-A', intensityPercent: 5, priority: 6 }
    ],
    energySavings: 28,
    dliImpact: -2,
    active: true
  },
  {
    id: '2',
    name: 'Off-Peak Full Spectrum',
    description: 'Balanced full spectrum during low-cost energy periods',
    timeRange: '10:00 PM - 6:00 AM',
    channelAdjustments: [
      { channelName: 'Deep Red', intensityPercent: 50, priority: 3 },
      { channelName: 'Red', intensityPercent: 85, priority: 1 },
      { channelName: 'Blue', intensityPercent: 70, priority: 2 },
      { channelName: 'White', intensityPercent: 80, priority: 1 },
      { channelName: 'Far Red', intensityPercent: 25, priority: 4 },
      { channelName: 'UV-A', intensityPercent: 15, priority: 5 }
    ],
    energySavings: 8,
    dliImpact: 3,
    active: true
  }
]

const mockUtilityData: UtilityData = {
  currentRate: 0.16,
  peakHours: ['4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'],
  offPeakHours: ['10:00 PM', '11:00 PM', '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM'],
  realTimeUsage: 12.4,
  projectedCost: 156.80,
  connectionStatus: 'connected',
  lastUpdate: '2024-12-11 3:45 PM'
}

export default function AdvancedSpectrumControl() {
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const [fixtures] = useState<TunableFixture[]>(mockFixtures)
  const [energyProfile] = useState<EnergyProfile[]>(mockEnergyProfile)
  const [strategies] = useState<SpectrumStrategy[]>(mockStrategies)
  const [utilityData] = useState<UtilityData>(mockUtilityData)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'fixtures', label: 'Fixtures', icon: Lightbulb },
    { id: 'strategies', label: 'Strategies', icon: Target },
    { id: 'energy', label: 'Energy Profile', icon: Zap },
    { id: 'utility', label: 'Utility API', icon: Battery },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Lightbulb className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Fixtures</p>
              <p className="text-xl font-bold text-white">{fixtures.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg DLI Achievement</p>
              <p className="text-xl font-bold text-white">96%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Energy Savings</p>
              <p className="text-xl font-bold text-white">23%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Rate</p>
              <p className="text-xl font-bold text-white">${utilityData.currentRate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Status */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Real-Time Spectrum Control
        </h3>
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Current Strategy</h4>
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-sm font-medium text-purple-400">Peak Energy Deep Red</p>
              <p className="text-xs text-gray-400 mt-1">
                Reducing blue channels by 65%, maximizing deep red efficiency
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">Active across 2 fixtures</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Energy Impact</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Power Consumption</span>
                <span className="text-sm text-white">{utilityData.realTimeUsage} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Hourly Cost</span>
                <span className="text-sm text-white">${(utilityData.realTimeUsage * utilityData.currentRate).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Projected Savings</span>
                <span className="text-sm text-green-400">$43.20/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Overview */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Spectrum Channel Status</h3>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {fixtures[0]?.channels.map((channel) => (
            <div key={channel.name} className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-full mb-2 flex items-center justify-center ${
                channel.name === 'Deep Red' ? 'bg-red-600/20 text-red-400' :
                channel.name === 'Red' ? 'bg-red-500/20 text-red-400' :
                channel.name === 'Blue' ? 'bg-blue-500/20 text-blue-400' :
                channel.name === 'White' ? 'bg-gray-500/20 text-gray-400' :
                channel.name === 'Far Red' ? 'bg-pink-500/20 text-pink-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                <span className="text-xs font-bold">{channel.currentIntensity}%</span>
              </div>
              <p className="text-xs text-gray-400">{channel.name}</p>
              <p className="text-xs text-gray-500">{channel.wavelength}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Energy Timeline */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Energy Rate Timeline</h3>
        <div className="space-y-3">
          {energyProfile.map((slot, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded ${
                  slot.demand === 'peak' ? 'bg-red-500/20 text-red-400' :
                  slot.demand === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  slot.demand === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {slot.demand === 'peak' ? <AlertTriangle className="w-4 h-4" /> :
                   slot.demand === 'low' ? <CheckCircle className="w-4 h-4" /> :
                   <Clock className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm text-white">{slot.timeSlot}</p>
                  <p className="text-xs text-gray-400">${slot.rate}/kWh</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{slot.suggestedStrategy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderFixtures = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Color-Tunable Fixtures</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
          Add Fixture
        </button>
      </div>

      {fixtures.map((fixture) => (
        <div key={fixture.id} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-white">{fixture.name}</h4>
              <p className="text-sm text-gray-400">{fixture.room}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">DLI Achievement</p>
                <p className="text-lg font-bold text-white">
                  {fixture.currentDLI}/{fixture.targetDLI}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                fixture.status === 'optimal' ? 'bg-green-500/20 text-green-400' :
                fixture.status === 'modulating' ? 'bg-blue-500/20 text-blue-400' :
                fixture.status === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {fixture.status}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-400 mb-3">Channel Controls</h5>
              <div className="space-y-3">
                {fixture.channels.map((channel) => (
                  <div key={channel.name} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-gray-400">{channel.name}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">{channel.wavelength}</span>
                        <span className="text-xs text-white ml-auto">{channel.currentIntensity}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            channel.name === 'Deep Red' ? 'bg-red-600' :
                            channel.name === 'Red' ? 'bg-red-500' :
                            channel.name === 'Blue' ? 'bg-blue-500' :
                            channel.name === 'White' ? 'bg-gray-300' :
                            channel.name === 'Far Red' ? 'bg-pink-500' :
                            'bg-purple-500'
                          }`}
                          style={{ width: `${channel.currentIntensity}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 w-12 text-right">
                      {(channel.currentIntensity * channel.energyDraw / 100).toFixed(1)}W
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-400 mb-3">Biological Response</h5>
              <div className="space-y-2">
                {fixture.channels.map((channel) => (
                  <div key={channel.name} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      channel.name === 'Deep Red' ? 'bg-red-600' :
                      channel.name === 'Red' ? 'bg-red-500' :
                      channel.name === 'Blue' ? 'bg-blue-500' :
                      channel.name === 'White' ? 'bg-gray-300' :
                      channel.name === 'Far Red' ? 'bg-pink-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-gray-400">{channel.name}:</span>
                    <span className="text-gray-300">{channel.biologicalResponse}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Energy Efficiency</span>
                  <span className="text-white">{fixture.energyEfficiency}%</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Last Calibration</span>
                  <span className="text-white">{fixture.lastCalibration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderStrategies = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Spectrum Strategies</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
          Create Strategy
        </button>
      </div>

      {strategies.map((strategy) => (
        <div key={strategy.id} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-semibold text-white">{strategy.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  strategy.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {strategy.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-400">{strategy.description}</p>
              <p className="text-xs text-gray-500 mt-1">Active during: {strategy.timeRange}</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h5 className="text-sm font-medium text-gray-400 mb-3">Channel Adjustments</h5>
              <div className="space-y-2">
                {strategy.channelAdjustments.map((adjustment) => (
                  <div key={adjustment.channelName} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-gray-400">{adjustment.channelName}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-white ml-auto">{adjustment.intensityPercent}%</span>
                        <span className="text-xs text-gray-500">P{adjustment.priority}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            adjustment.channelName === 'Deep Red' ? 'bg-red-600' :
                            adjustment.channelName === 'Red' ? 'bg-red-500' :
                            adjustment.channelName === 'Blue' ? 'bg-blue-500' :
                            adjustment.channelName === 'White' ? 'bg-gray-300' :
                            adjustment.channelName === 'Far Red' ? 'bg-pink-500' :
                            'bg-purple-500'
                          }`}
                          style={{ width: `${adjustment.intensityPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-400 mb-3">Impact Analysis</h5>
              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Energy Savings</span>
                  </div>
                  <p className="text-lg font-bold text-white mt-1">{strategy.energySavings}%</p>
                </div>
                
                <div className={`p-3 border rounded-lg ${
                  strategy.dliImpact >= 0 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-yellow-500/10 border-yellow-500/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">DLI Impact</span>
                  </div>
                  <p className={`text-lg font-bold mt-1 ${
                    strategy.dliImpact >= 0 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {strategy.dliImpact > 0 ? '+' : ''}{strategy.dliImpact}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderEnergy = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Deep Red Modulation Strategy</h3>
        <p className="text-gray-400 mb-6">
          During peak energy periods, deep red channels (660nm) are prioritized due to their lower radiant power requirements 
          while maintaining photosynthetic efficiency and target DLI delivery.
        </p>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Channel Energy Efficiency</h4>
            <div className="space-y-3">
              {fixtures[0]?.channels.map((channel) => (
                <div key={channel.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      channel.name === 'Deep Red' ? 'bg-red-600' :
                      channel.name === 'Red' ? 'bg-red-500' :
                      channel.name === 'Blue' ? 'bg-blue-500' :
                      channel.name === 'White' ? 'bg-gray-300' :
                      channel.name === 'Far Red' ? 'bg-pink-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-sm text-white">{channel.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{channel.energyDraw}W/unit</p>
                    <p className="text-xs text-gray-400">
                      {channel.name === 'Deep Red' ? 'Most efficient' :
                       channel.name === 'Blue' ? 'Least efficient' :
                       'Moderate efficiency'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Peak Hour Optimization</h4>
            <div className="space-y-3">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm font-medium text-red-400">Peak Energy Hours (4-8 PM)</p>
                <p className="text-xs text-gray-400 mt-1">
                  Deep red intensity increased to 85%, blue reduced to 35%
                </p>
                <div className="mt-2 flex justify-between">
                  <span className="text-xs text-gray-400">Energy Savings:</span>
                  <span className="text-xs text-red-400">28%</span>
                </div>
              </div>
              
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm font-medium text-green-400">Off-Peak Hours (10 PM - 6 AM)</p>
                <p className="text-xs text-gray-400 mt-1">
                  Full spectrum balanced for optimal plant response
                </p>
                <div className="mt-2 flex justify-between">
                  <span className="text-xs text-gray-400">DLI Boost:</span>
                  <span className="text-xs text-green-400">+3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Energy Cost Timeline</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {energyProfile.map((slot, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              slot.demand === 'peak' ? 'bg-red-500/10 border-red-500/20' :
              slot.demand === 'high' ? 'bg-orange-500/10 border-orange-500/20' :
              slot.demand === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
              'bg-green-500/10 border-green-500/20'
            }`}>
              <div className="text-center">
                <p className="text-sm font-medium text-white">{slot.timeSlot}</p>
                <p className="text-lg font-bold text-white mt-1">${slot.rate}</p>
                <p className="text-xs text-gray-400">per kWh</p>
                <div className={`mt-2 px-2 py-1 rounded text-xs ${
                  slot.demand === 'peak' ? 'bg-red-500/20 text-red-400' :
                  slot.demand === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  slot.demand === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {slot.demand} demand
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderUtility = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Battery className="w-5 h-5" />
          Utility API Integration
        </h3>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Connection Status</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-white">API Connected</p>
                  <p className="text-xs text-gray-400">Last update: {utilityData.lastUpdate}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-white">Real-time Pricing</p>
                  <p className="text-xs text-gray-400">Updates every 15 minutes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <Gauge className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-white">Usage Monitoring</p>
                  <p className="text-xs text-gray-400">Current: {utilityData.realTimeUsage} kW</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Rate Information</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Current Rate</span>
                  <span className="text-lg font-bold text-white">${utilityData.currentRate}/kWh</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Peak Hours</span>
                  <span className="text-sm text-white">4:00 PM - 8:00 PM</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Off-Peak Hours</span>
                  <span className="text-sm text-white">10:00 PM - 6:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cost Projections</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">Today</p>
            <p className="text-xl font-bold text-white">$43.20</p>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">This Week</p>
            <p className="text-xl font-bold text-white">$302.40</p>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">This Month</p>
            <p className="text-xl font-bold text-white">${utilityData.projectedCost}</p>
          </div>
          <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">Savings</p>
            <p className="text-xl font-bold text-green-400">$156.80</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Utility Provider</label>
            <select className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
              <option>PG&E (Pacific Gas & Electric)</option>
              <option>ConEd (Consolidated Edison)</option>
              <option>ComEd (Commonwealth Edison)</option>
              <option>Custom API</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">API Endpoint</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="https://api.utility.com/v1/rates"
              defaultValue="https://api.pge.com/v1/rates"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
            <input 
              type="password" 
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Enter API key"
            />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="auto-optimization" className="rounded" defaultChecked />
            <label htmlFor="auto-optimization" className="text-sm text-gray-400">
              Enable automatic spectrum optimization based on real-time rates
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Control Parameters</h3>
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">DLI Targets</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Vegetative DLI</label>
                <input 
                  type="number" 
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  defaultValue="35"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Flowering DLI</label>
                <input 
                  type="number" 
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  defaultValue="45"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">DLI Tolerance</label>
                <input 
                  type="number" 
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  defaultValue="5"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Energy Thresholds</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Peak Rate Threshold ($/kWh)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  defaultValue="0.20"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Max Energy Savings (%)</label>
                <input 
                  type="number" 
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  defaultValue="30"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Update Frequency (minutes)</label>
                <input 
                  type="number" 
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                  defaultValue="15"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Advanced Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Automatic Deep Red Modulation</p>
              <p className="text-xs text-gray-400">Prioritize deep red channels during peak energy</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">DLI Protection Mode</p>
              <p className="text-xs text-gray-400">Prevent DLI from falling below minimum threshold</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Gradual Transitions</p>
              <p className="text-xs text-gray-400">Smooth spectrum changes over 30 minutes</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Emergency Override</p>
              <p className="text-xs text-gray-400">Revert to full spectrum if plants show stress</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeView) {
      case 'overview': return renderOverview()
      case 'fixtures': return renderFixtures()
      case 'strategies': return renderStrategies()
      case 'energy': return renderEnergy()
      case 'utility': return renderUtility()
      case 'settings': return renderSettings()
      default: return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Advanced Spectrum Control</h1>
          <p className="text-gray-400">Color-tunable fixtures with energy-optimized deep red modulation</p>
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