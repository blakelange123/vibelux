"use client"

import { useState, useEffect } from 'react'
import { 
  Lightbulb,
  Activity,
  Sliders,
  Target,
  TrendingUp,
  Zap,
  Leaf,
  Eye,
  BarChart3,
  Settings,
  Download,
  Upload,
  Info,
  AlertCircle,
  Check,
  ChevronRight,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

interface SpectrumChannel {
  id: string
  name: string
  wavelength: number
  peakWavelength: number
  fwhm: number // Full Width Half Maximum
  intensity: number // 0-100%
  watts: number
  photonFlux: number // μmol/s
  color: string
}

interface SpectrumRecipe {
  id: string
  name: string
  description: string
  category: 'vegetative' | 'flowering' | 'propagation' | 'supplemental' | 'custom'
  channels: SpectrumChannel[]
  metrics: {
    totalPPFD: number
    totalWatts: number
    efficacy: number // μmol/J
    rToFr: number
    bluePercent: number
    greenPercent: number
    redPercent: number
    farRedPercent: number
    uvPercent: number
    cri: number
    cct: number
  }
}

interface OptimizationTarget {
  id: string
  name: string
  icon: any
  parameters: {
    targetPPFD: number
    targetEfficacy: number
    targetRToFr: number
    blueRange: [number, number]
    redRange: [number, number]
    maxWatts: number
  }
}

const defaultChannels: SpectrumChannel[] = [
  { id: 'uv', name: 'UV-A', wavelength: 395, peakWavelength: 395, fwhm: 20, intensity: 0, watts: 0, photonFlux: 0, color: '#7F00FF' },
  { id: 'royal-blue', name: 'Royal Blue', wavelength: 450, peakWavelength: 450, fwhm: 25, intensity: 20, watts: 40, photonFlux: 85, color: '#0000FF' },
  { id: 'blue', name: 'Blue', wavelength: 470, peakWavelength: 470, fwhm: 25, intensity: 15, watts: 30, photonFlux: 68, color: '#0080FF' },
  { id: 'cyan', name: 'Cyan', wavelength: 505, peakWavelength: 505, fwhm: 30, intensity: 5, watts: 10, photonFlux: 24, color: '#00FFFF' },
  { id: 'green', name: 'Green', wavelength: 530, peakWavelength: 530, fwhm: 35, intensity: 10, watts: 20, photonFlux: 50, color: '#00FF00' },
  { id: 'lime', name: 'Lime', wavelength: 560, peakWavelength: 560, fwhm: 35, intensity: 5, watts: 10, photonFlux: 26, color: '#80FF00' },
  { id: 'red', name: 'Red', wavelength: 660, peakWavelength: 660, fwhm: 25, intensity: 35, watts: 70, photonFlux: 200, color: '#FF0000' },
  { id: 'deep-red', name: 'Deep Red', wavelength: 680, peakWavelength: 680, fwhm: 25, intensity: 5, watts: 10, photonFlux: 30, color: '#8B0000' },
  { id: 'far-red', name: 'Far Red', wavelength: 730, peakWavelength: 730, fwhm: 30, intensity: 5, watts: 10, photonFlux: 32, color: '#4B0000' }
]

const optimizationTargets: OptimizationTarget[] = [
  {
    id: 'max-efficiency',
    name: 'Maximum Efficacy',
    icon: Zap,
    parameters: {
      targetPPFD: 600,
      targetEfficacy: 3.0,
      targetRToFr: 5.0,
      blueRange: [10, 20],
      redRange: [60, 80],
      maxWatts: 300
    }
  },
  {
    id: 'veg-growth',
    name: 'Vegetative Growth',
    icon: Leaf,
    parameters: {
      targetPPFD: 400,
      targetEfficacy: 2.5,
      targetRToFr: 8.0,
      blueRange: [20, 30],
      redRange: [50, 60],
      maxWatts: 250
    }
  },
  {
    id: 'flowering',
    name: 'Flowering/Fruiting',
    icon: Sun,
    parameters: {
      targetPPFD: 800,
      targetEfficacy: 2.7,
      targetRToFr: 3.5,
      blueRange: [5, 15],
      redRange: [65, 75],
      maxWatts: 400
    }
  },
  {
    id: 'balanced',
    name: 'Balanced Spectrum',
    icon: Activity,
    parameters: {
      targetPPFD: 600,
      targetEfficacy: 2.6,
      targetRToFr: 5.5,
      blueRange: [15, 25],
      redRange: [55, 65],
      maxWatts: 350
    }
  }
]

export function AdvancedSpectralOptimization() {
  const [channels, setChannels] = useState<SpectrumChannel[]>(defaultChannels)
  const [selectedTarget, setSelectedTarget] = useState<OptimizationTarget>(optimizationTargets[0])
  const [optimizing, setOptimizing] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<SpectrumRecipe | null>(null)

  // Calculate spectrum metrics
  const calculateMetrics = () => {
    const totalWatts = channels.reduce((sum, ch) => sum + ch.watts, 0)
    const totalPhotonFlux = channels.reduce((sum, ch) => sum + ch.photonFlux, 0)
    
    // Calculate color percentages
    const blueFlux = channels.filter(ch => ch.wavelength >= 400 && ch.wavelength <= 500)
      .reduce((sum, ch) => sum + ch.photonFlux, 0)
    const greenFlux = channels.filter(ch => ch.wavelength > 500 && ch.wavelength <= 600)
      .reduce((sum, ch) => sum + ch.photonFlux, 0)
    const redFlux = channels.filter(ch => ch.wavelength > 600 && ch.wavelength <= 700)
      .reduce((sum, ch) => sum + ch.photonFlux, 0)
    const farRedFlux = channels.filter(ch => ch.wavelength > 700 && ch.wavelength <= 800)
      .reduce((sum, ch) => sum + ch.photonFlux, 0)
    const uvFlux = channels.filter(ch => ch.wavelength < 400)
      .reduce((sum, ch) => sum + ch.photonFlux, 0)
    
    // R:FR ratio
    const red660 = channels.find(ch => ch.wavelength === 660)?.photonFlux || 0
    const farRed730 = channels.find(ch => ch.wavelength === 730)?.photonFlux || 0
    const rToFr = farRed730 > 0 ? red660 / farRed730 : 0
    
    return {
      totalPPFD: totalPhotonFlux,
      totalWatts,
      efficacy: totalWatts > 0 ? totalPhotonFlux / totalWatts : 0,
      rToFr,
      bluePercent: totalPhotonFlux > 0 ? (blueFlux / totalPhotonFlux) * 100 : 0,
      greenPercent: totalPhotonFlux > 0 ? (greenFlux / totalPhotonFlux) * 100 : 0,
      redPercent: totalPhotonFlux > 0 ? (redFlux / totalPhotonFlux) * 100 : 0,
      farRedPercent: totalPhotonFlux > 0 ? (farRedFlux / totalPhotonFlux) * 100 : 0,
      uvPercent: totalPhotonFlux > 0 ? (uvFlux / totalPhotonFlux) * 100 : 0,
      cri: 85, // Simplified CRI calculation
      cct: 4000 // Simplified CCT calculation
    }
  }

  const metrics = calculateMetrics()

  // Update channel values
  const updateChannel = (channelId: string, field: keyof SpectrumChannel, value: number) => {
    setChannels(channels.map(ch => {
      if (ch.id === channelId) {
        const updated = { ...ch, [field]: value }
        
        // Recalculate watts and photon flux based on intensity
        if (field === 'intensity') {
          const maxWattsPerChannel = 100 // Example max
          updated.watts = (value / 100) * maxWattsPerChannel
          // Simplified photon flux calculation
          updated.photonFlux = updated.watts * 2.5 * (1 + (updated.wavelength - 450) / 1000)
        }
        
        return updated
      }
      return ch
    }))
  }

  // Optimize spectrum
  const optimizeSpectrum = () => {
    setOptimizing(true)
    
    // Simulated optimization algorithm
    setTimeout(() => {
      const optimized = [...channels]
      const target = selectedTarget.parameters
      
      // Adjust blue channels
      const blueChannels = optimized.filter(ch => ch.wavelength >= 400 && ch.wavelength <= 500)
      const targetBlueIntensity = (target.blueRange[0] + target.blueRange[1]) / 2
      blueChannels.forEach(ch => {
        ch.intensity = targetBlueIntensity / blueChannels.length
        ch.watts = (ch.intensity / 100) * 100
        ch.photonFlux = ch.watts * 2.5
      })
      
      // Adjust red channels
      const redChannels = optimized.filter(ch => ch.wavelength >= 600 && ch.wavelength <= 700)
      const targetRedIntensity = (target.redRange[0] + target.redRange[1]) / 2
      redChannels.forEach(ch => {
        ch.intensity = targetRedIntensity / redChannels.length
        ch.watts = (ch.intensity / 100) * 100
        ch.photonFlux = ch.watts * 2.8
      })
      
      // Adjust far-red for R:FR ratio
      const farRedChannel = optimized.find(ch => ch.id === 'far-red')
      if (farRedChannel) {
        const redChannel = optimized.find(ch => ch.id === 'red')
        if (redChannel) {
          farRedChannel.photonFlux = redChannel.photonFlux / target.targetRToFr
          farRedChannel.watts = farRedChannel.photonFlux / 3.2
          farRedChannel.intensity = (farRedChannel.watts / 100) * 100
        }
      }
      
      setChannels(optimized)
      setOptimizing(false)
    }, 1500)
  }

  // Generate spectrum curve data
  const generateSpectrumData = () => {
    const data = []
    for (let wavelength = 380; wavelength <= 780; wavelength += 5) {
      let intensity = 0
      
      channels.forEach(channel => {
        // Gaussian distribution for each channel
        const sigma = channel.fwhm / 2.355
        const gaussian = Math.exp(-Math.pow(wavelength - channel.peakWavelength, 2) / (2 * Math.pow(sigma, 2)))
        intensity += channel.intensity * gaussian
      })
      
      data.push({ wavelength, intensity })
    }
    return data
  }

  const spectrumData = generateSpectrumData()

  // Generate comparison radar data
  const radarData = [
    { metric: 'Efficacy', value: metrics.efficacy / 3.5 * 100, fullMark: 100 },
    { metric: 'Blue %', value: metrics.bluePercent, fullMark: 100 },
    { metric: 'Red %', value: metrics.redPercent, fullMark: 100 },
    { metric: 'R:FR Ratio', value: Math.min(metrics.rToFr * 10, 100), fullMark: 100 },
    { metric: 'Coverage', value: 85, fullMark: 100 },
    { metric: 'Efficiency', value: (metrics.efficacy / 3.0) * 100, fullMark: 100 }
  ]

  const exportSpectrum = () => {
    const recipe: SpectrumRecipe = {
      id: `spectrum-${Date.now()}`,
      name: 'Custom Optimized Spectrum',
      description: `Optimized for ${selectedTarget.name}`,
      category: 'custom',
      channels,
      metrics
    }
    
    const json = JSON.stringify(recipe, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spectrum-recipe-${recipe.id}.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Advanced Spectral Optimization</h2>
            </div>
            <p className="text-sm text-gray-400">
              Multi-channel LED spectrum tuning for optimal plant growth and energy efficiency
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportSpectrum}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Recipe
            </button>
            <button
              onClick={optimizeSpectrum}
              disabled={optimizing}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {optimizing ? 'Optimizing...' : 'Auto-Optimize'}
            </button>
          </div>
        </div>

        {/* Optimization Targets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {optimizationTargets.map(target => {
            const Icon = target.icon
            return (
              <button
                key={target.id}
                onClick={() => setSelectedTarget(target)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedTarget.id === target.id
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 mb-2" />
                <p className="text-sm font-medium">{target.name}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Spectrum Visualization */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Spectrum Curve</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spectrumData}>
              <defs>
                <linearGradient id="spectrumGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7F00FF" />
                  <stop offset="15%" stopColor="#0000FF" />
                  <stop offset="30%" stopColor="#00FFFF" />
                  <stop offset="45%" stopColor="#00FF00" />
                  <stop offset="60%" stopColor="#FFFF00" />
                  <stop offset="75%" stopColor="#FF8C00" />
                  <stop offset="90%" stopColor="#FF0000" />
                  <stop offset="100%" stopColor="#8B0000" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="wavelength" 
                stroke="#9CA3AF"
                label={{ value: 'Wavelength (nm)', position: 'insideBottom', offset: -5, style: { fill: '#9CA3AF' } }}
              />
              <YAxis 
                stroke="#9CA3AF"
                label={{ value: 'Relative Intensity', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Area 
                type="monotone" 
                dataKey="intensity" 
                stroke="url(#spectrumGradient)" 
                fill="url(#spectrumGradient)" 
                fillOpacity={0.8}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Controls */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Channel Control</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
            <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
          </button>
        </div>
        
        <div className="space-y-4">
          {channels.map(channel => (
            <div key={channel.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: channel.color }}
                  />
                  <span className="text-sm font-medium text-white">
                    {channel.name} ({channel.wavelength}nm)
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{channel.watts}W</span>
                  <span>{channel.photonFlux.toFixed(1)} μmol/s</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={channel.intensity}
                  onChange={(e) => updateChannel(channel.id, 'intensity', Number(e.target.value))}
                  className="flex-1 accent-purple-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={channel.intensity}
                  onChange={(e) => updateChannel(channel.id, 'intensity', Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
                <span className="text-sm text-gray-400">%</span>
              </div>
              
              {showAdvanced && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-xs text-gray-400">Peak λ (nm)</label>
                    <input
                      type="number"
                      value={channel.peakWavelength}
                      onChange={(e) => updateChannel(channel.id, 'peakWavelength', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">FWHM (nm)</label>
                    <input
                      type="number"
                      value={channel.fwhm}
                      onChange={(e) => updateChannel(channel.id, 'fwhm', Number(e.target.value))}
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Flux (μmol/s)</label>
                    <input
                      type="number"
                      value={channel.photonFlux.toFixed(1)}
                      readOnly
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-300 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Metrics */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Total PPFD</span>
              <span className="text-xl font-semibold text-white">{metrics.totalPPFD.toFixed(0)} μmol/s</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Total Power</span>
              <span className="text-xl font-semibold text-white">{metrics.totalWatts.toFixed(0)} W</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Efficacy</span>
              <span className={`text-xl font-semibold ${
                metrics.efficacy >= 2.5 ? 'text-green-400' : 
                metrics.efficacy >= 2.0 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {metrics.efficacy.toFixed(2)} μmol/J
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">R:FR Ratio</span>
              <span className="text-xl font-semibold text-white">{metrics.rToFr.toFixed(1)}:1</span>
            </div>
            
            {/* Color Distribution */}
            <div className="pt-2">
              <p className="text-sm text-gray-400 mb-3">Spectral Distribution</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-16">UV</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${metrics.uvPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{metrics.uvPercent.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-16">Blue</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${metrics.bluePercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{metrics.bluePercent.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-16">Green</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${metrics.greenPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{metrics.greenPercent.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-16">Red</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${metrics.redPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{metrics.redPercent.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-16">Far Red</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-900 h-2 rounded-full"
                      style={{ width: `${metrics.farRedPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{metrics.farRedPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Radar */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Optimization Analysis</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                <PolarRadiusAxis stroke="#374151" />
                <Radar
                  name="Current"
                  dataKey="value"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5" />
              <p className="text-xs text-gray-300">
                The radar chart shows how well your spectrum performs across key metrics. 
                Aim for balanced coverage or optimize for specific parameters based on your growth objectives.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Recipes */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Load Recipes</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Lettuce Pro', ppfd: 200, efficacy: 2.8, blue: 20, red: 65 },
            { name: 'Cannabis Veg', ppfd: 400, efficacy: 2.7, blue: 25, red: 60 },
            { name: 'Cannabis Flower', ppfd: 800, efficacy: 2.6, blue: 10, red: 70 },
            { name: 'Tomato Fruit', ppfd: 600, efficacy: 2.5, blue: 15, red: 68 },
            { name: 'Herb Garden', ppfd: 250, efficacy: 2.9, blue: 22, red: 63 },
            { name: 'Strawberry', ppfd: 350, efficacy: 2.6, blue: 18, red: 67 },
            { name: 'Research', ppfd: 500, efficacy: 2.4, blue: 30, red: 55 },
            { name: 'Propagation', ppfd: 150, efficacy: 2.7, blue: 35, red: 50 }
          ].map((recipe, idx) => (
            <button
              key={idx}
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
            >
              <h4 className="font-medium text-white text-sm">{recipe.name}</h4>
              <div className="mt-1 space-y-1">
                <p className="text-xs text-gray-400">{recipe.ppfd} μmol/m²/s</p>
                <p className="text-xs text-gray-400">{recipe.efficacy} μmol/J</p>
                <div className="flex gap-2 text-xs">
                  <span className="text-blue-400">B:{recipe.blue}%</span>
                  <span className="text-red-400">R:{recipe.red}%</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}