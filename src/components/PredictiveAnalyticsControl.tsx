"use client"

import { useState, useEffect } from 'react'
import { 
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  Zap,
  Droplets,
  Calendar,
  Info,
  Settings,
  Download,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  Clock,
  Gauge
} from 'lucide-react'

interface Prediction {
  id: string
  type: 'yield' | 'energy' | 'climate' | 'maintenance' | 'pest'
  title: string
  confidence: number
  timeframe: string
  impact: 'high' | 'medium' | 'low'
  recommendation: string
  value?: number
  unit?: string
}

interface MLModel {
  id: string
  name: string
  type: string
  accuracy: number
  lastTrained: string
  dataPoints: number
  status: 'active' | 'training' | 'idle'
}

interface Anomaly {
  id: string
  system: string
  severity: 'critical' | 'warning' | 'info'
  detected: string
  description: string
  affectedZones: string[]
  autoResolved: boolean
}

interface OptimizationSuggestion {
  id: string
  category: string
  title: string
  description: string
  potentialSavings: number
  implementation: 'easy' | 'moderate' | 'complex'
  priority: number
}

export function PredictiveAnalyticsControl() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d')
  const [autoOptimize, setAutoOptimize] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Active predictions - filtered by timeframe
  const getAllPredictions = (): Prediction[] => [
    {
      id: 'pred-1',
      type: 'yield',
      title: 'Yield Forecast - Blue Dream',
      confidence: 92,
      timeframe: 'Next 14 days',
      impact: 'high',
      recommendation: 'Maintain current environmental parameters',
      value: 24.8,
      unit: 'kg'
    },
    {
      id: 'pred-2',
      type: 'energy',
      title: 'Energy Spike Alert',
      confidence: 87,
      timeframe: 'Tomorrow 14:00-18:00',
      impact: 'medium',
      recommendation: 'Pre-cool facility before peak hours',
      value: 15,
      unit: '% increase'
    },
    {
      id: 'pred-3',
      type: 'climate',
      title: 'VPD Optimization Opportunity',
      confidence: 95,
      timeframe: 'Current',
      impact: 'medium',
      recommendation: 'Reduce humidity by 5% in Zone 2',
      value: 0.2,
      unit: 'kPa improvement'
    },
    {
      id: 'pred-4',
      type: 'maintenance',
      title: 'HVAC Filter Replacement',
      confidence: 78,
      timeframe: 'Within 7 days',
      impact: 'low',
      recommendation: 'Schedule maintenance window',
      value: 89,
      unit: '% filter life'
    },
    // Additional predictions for different timeframes
    {
      id: 'pred-5',
      type: 'pest',
      title: 'Pest Risk Analysis',
      confidence: 72,
      timeframe: 'Next 30 days',
      impact: 'medium',
      recommendation: 'Increase monitoring frequency in Zone 3',
      value: 12,
      unit: '% risk increase'
    },
    {
      id: 'pred-6',
      type: 'energy',
      title: 'Solar Panel Efficiency',
      confidence: 89,
      timeframe: 'Next 6 hours',
      impact: 'low',
      recommendation: 'Clean panels before peak sun hours',
      value: 8,
      unit: '% efficiency gain'
    }
  ]

  const predictions = getAllPredictions().filter(pred => {
    if (selectedTimeframe === '24h') {
      return pred.timeframe.includes('hour') || pred.timeframe.includes('Current') || pred.timeframe.includes('Tomorrow')
    } else if (selectedTimeframe === '7d') {
      return pred.timeframe.includes('days') || pred.timeframe.includes('Current') || pred.timeframe.includes('Tomorrow')
    } else {
      return true // Show all for 30d
    }
  })

  // ML Models
  const models: MLModel[] = [
    {
      id: 'model-1',
      name: 'Yield Prediction Model',
      type: 'Random Forest',
      accuracy: 94.2,
      lastTrained: '2 days ago',
      dataPoints: 1.2e6,
      status: 'active'
    },
    {
      id: 'model-2',
      name: 'Energy Optimization',
      type: 'LSTM Neural Network',
      accuracy: 89.7,
      lastTrained: '12 hours ago',
      dataPoints: 2.4e6,
      status: 'active'
    },
    {
      id: 'model-3',
      name: 'Pest & Disease Detection',
      type: 'CNN + Vision',
      accuracy: 96.1,
      lastTrained: '1 week ago',
      dataPoints: 50000,
      status: 'idle'
    },
    {
      id: 'model-4',
      name: 'Climate Control AI',
      type: 'Reinforcement Learning',
      accuracy: 91.5,
      lastTrained: 'Real-time',
      dataPoints: 5.2e6,
      status: 'training'
    }
  ]

  // Detected anomalies - filtered by timeframe
  const getAllAnomalies = (): Anomaly[] => [
    {
      id: 'anom-1',
      system: 'Climate Control',
      severity: 'warning',
      detected: '2 hours ago',
      description: 'Unusual humidity pattern in Flowering Zone B',
      affectedZones: ['flower-b'],
      autoResolved: false
    },
    {
      id: 'anom-2',
      system: 'Irrigation',
      severity: 'info',
      detected: '1 day ago',
      description: 'Water consumption 12% below average',
      affectedZones: ['veg-1', 'veg-2'],
      autoResolved: true
    },
    {
      id: 'anom-3',
      system: 'Lighting',
      severity: 'critical',
      detected: '18 hours ago',
      description: 'LED panel efficiency degradation detected',
      affectedZones: ['clone-room'],
      autoResolved: false
    },
    {
      id: 'anom-4',
      system: 'Ventilation',
      severity: 'info',
      detected: '3 weeks ago',
      description: 'Fan speed optimization opportunity identified',
      affectedZones: ['dry-room'],
      autoResolved: true
    },
    {
      id: 'anom-5',
      system: 'Security',
      severity: 'warning',
      detected: '5 days ago',
      description: 'Unusual access pattern detected',
      affectedZones: ['all'],
      autoResolved: false
    }
  ]

  const anomalies = getAllAnomalies().filter(anomaly => {
    if (selectedTimeframe === '24h') {
      return anomaly.detected.includes('hour') || anomaly.detected.includes('minute')
    } else if (selectedTimeframe === '7d') {
      return anomaly.detected.includes('hour') || anomaly.detected.includes('day') || anomaly.detected.includes('minute')
    } else {
      return true // Show all for 30d
    }
  })

  // Optimization suggestions
  const suggestions: OptimizationSuggestion[] = [
    {
      id: 'opt-1',
      category: 'Energy',
      title: 'Implement Demand Response',
      description: 'Shift 30% of lighting load to off-peak hours',
      potentialSavings: 18500,
      implementation: 'moderate',
      priority: 1
    },
    {
      id: 'opt-2',
      category: 'Climate',
      title: 'Zone Temperature Optimization',
      description: 'Adjust night temperatures based on strain-specific data',
      potentialSavings: 8200,
      implementation: 'easy',
      priority: 2
    },
    {
      id: 'opt-3',
      category: 'Workflow',
      title: 'Batch Consolidation',
      description: 'Combine small batches to reduce movement overhead',
      potentialSavings: 12000,
      implementation: 'complex',
      priority: 3
    }
  ]

  // Auto-refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">AI-Powered Predictive Analytics</h2>
            <p className="text-sm text-gray-400 mt-1">
              Machine learning insights and automated optimization
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              Updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={() => setLastUpdate(new Date())}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['24h', '7d', '30d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {tf === '24h' ? 'Last 24 Hours' : tf === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Auto-Optimize</span>
            <button
              onClick={() => setAutoOptimize(!autoOptimize)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoOptimize ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoOptimize ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Predictions */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active Predictions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white">{prediction.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{prediction.timeframe}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  prediction.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                  prediction.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {prediction.impact} impact
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Confidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        prediction.confidence > 90 ? 'bg-green-500' :
                        prediction.confidence > 75 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white">{prediction.confidence}%</span>
                </div>
              </div>

              {prediction.value && (
                <div className="mb-3 p-3 bg-gray-700/50 rounded">
                  <p className="text-2xl font-bold text-white">
                    {prediction.value} {prediction.unit}
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">{prediction.recommendation}</p>
              </div>

              <button className="mt-3 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                Apply Recommendation
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ML Models Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Models */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">ML Models</h3>
          <div className="space-y-3">
            {models.map((model) => (
              <div
                key={model.id}
                className="p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{model.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    model.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    model.status === 'training' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {model.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Type</span>
                    <p className="text-white">{model.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Accuracy</span>
                    <p className="text-white">{model.accuracy}%</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Trained</span>
                    <p className="text-white">{model.lastTrained}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Data Points</span>
                    <p className="text-white">{model.dataPoints.toLocaleString()}</p>
                  </div>
                </div>
                {model.status === 'training' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Training Progress</span>
                      <span className="text-white">67%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{ width: '67%' }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly Detection */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Anomaly Detection</h3>
          <div className="space-y-3">
            {anomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className={`p-4 rounded-lg border ${
                  anomaly.severity === 'critical' ? 'bg-red-900/20 border-red-800' :
                  anomaly.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-800' :
                  'bg-blue-900/20 border-blue-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                      anomaly.severity === 'critical' ? 'text-red-400' :
                      anomaly.severity === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                    <div>
                      <h4 className="font-medium text-white">{anomaly.system}</h4>
                      <p className="text-sm text-gray-300 mt-1">{anomaly.description}</p>
                    </div>
                  </div>
                  {anomaly.autoResolved && (
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                      Auto-resolved
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Zones: {anomaly.affectedZones.join(', ')}
                  </span>
                  <span className="text-gray-400">{anomaly.detected}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optimization Opportunities */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Optimization Opportunities</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-400">
              Potential Annual Savings: ${suggestions.reduce((sum, s) => sum + s.potentialSavings, 0).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-4 bg-gray-800 rounded-lg border border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  suggestion.category === 'Energy' ? 'bg-yellow-500/20 text-yellow-400' :
                  suggestion.category === 'Climate' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {suggestion.category}
                </span>
                <span className={`text-xs ${
                  suggestion.implementation === 'easy' ? 'text-green-400' :
                  suggestion.implementation === 'moderate' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {suggestion.implementation} implementation
                </span>
              </div>
              <h4 className="font-medium text-white mb-2">{suggestion.title}</h4>
              <p className="text-sm text-gray-400 mb-3">{suggestion.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-green-400">
                  ${suggestion.potentialSavings.toLocaleString()}/yr
                </span>
                <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm">
                  Implement
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h4 className="font-medium text-white">AI Decisions</h4>
          </div>
          <p className="text-2xl font-bold text-white">
            {selectedTimeframe === '24h' ? '52' : selectedTimeframe === '7d' ? '341' : '1,247'}
          </p>
          <p className="text-sm text-gray-400">
            {selectedTimeframe === '24h' ? 'Last 24 hours' : selectedTimeframe === '7d' ? 'Last 7 days' : 'Last 30 days'}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h4 className="font-medium text-white">Accuracy Rate</h4>
          </div>
          <p className="text-2xl font-bold text-white">
            {selectedTimeframe === '24h' ? '96.1%' : selectedTimeframe === '7d' ? '94.8%' : '94.3%'}
          </p>
          <p className="text-sm text-green-400">
            {selectedTimeframe === '24h' ? '+3.8% vs avg' : selectedTimeframe === '7d' ? '+2.5% improvement' : '+2.1% improvement'}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h4 className="font-medium text-white">Energy Saved</h4>
          </div>
          <p className="text-2xl font-bold text-white">
            {selectedTimeframe === '24h' ? '22.1%' : selectedTimeframe === '7d' ? '19.3%' : '18.7%'}
          </p>
          <p className="text-sm text-gray-400">vs baseline</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <h4 className="font-medium text-white">Yield Increase</h4>
          </div>
          <p className="text-2xl font-bold text-white">
            {selectedTimeframe === '24h' ? '+14.2%' : selectedTimeframe === '7d' ? '+13.1%' : '+12.4%'}
          </p>
          <p className="text-sm text-gray-400">AI optimized</p>
        </div>
      </div>
    </div>
  )
}