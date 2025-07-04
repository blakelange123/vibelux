"use client"

import { useState, useEffect } from 'react'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Cpu,
  BarChart3,
  Activity,
  Target,
  Zap,
  Leaf,
  DollarSign,
  Clock,
  Info,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Settings,
  Play,
  Pause
} from 'lucide-react'

interface Prediction {
  id: string
  type: 'yield' | 'energy' | 'maintenance' | 'disease' | 'optimization'
  title: string
  confidence: number
  timeframe: string
  value: string | number
  impact: 'high' | 'medium' | 'low'
  recommendations: string[]
  status: 'active' | 'pending' | 'completed'
}

interface Model {
  id: string
  name: string
  type: string
  accuracy: number
  lastTrained: Date
  dataPoints: number
  status: 'active' | 'training' | 'idle'
}

interface Anomaly {
  id: string
  type: string
  severity: 'critical' | 'warning' | 'info'
  detected: Date
  location: string
  description: string
  confidence: number
}

export function MachineLearningPredictions() {
  const [activeModel, setActiveModel] = useState<string>('yield-optimizer')
  const [isTraining, setIsTraining] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [autoPredict, setAutoPredict] = useState(true)
  const [trainingProgress, setTrainingProgress] = useState(0)

  const models: Model[] = [
    {
      id: 'yield-optimizer',
      name: 'Yield Optimization Model',
      type: 'Random Forest',
      accuracy: 94.7,
      lastTrained: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      dataPoints: 125430,
      status: 'active'
    },
    {
      id: 'energy-predictor',
      name: 'Energy Consumption Predictor',
      type: 'LSTM Neural Network',
      accuracy: 91.2,
      lastTrained: new Date(Date.now() - 1000 * 60 * 60 * 24),
      dataPoints: 89320,
      status: 'active'
    },
    {
      id: 'disease-detector',
      name: 'Disease Detection Model',
      type: 'CNN',
      accuracy: 96.8,
      lastTrained: new Date(Date.now() - 1000 * 60 * 60 * 12),
      dataPoints: 45670,
      status: 'training'
    },
    {
      id: 'maintenance-predictor',
      name: 'Predictive Maintenance',
      type: 'Gradient Boosting',
      accuracy: 89.5,
      lastTrained: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      dataPoints: 67890,
      status: 'idle'
    }
  ]

  const predictions: Prediction[] = [
    {
      id: '1',
      type: 'yield',
      title: 'Yield Increase Opportunity',
      confidence: 92,
      timeframe: 'Next 14 days',
      value: '+12% yield',
      impact: 'high',
      recommendations: [
        'Increase PPFD to 450 µmol/m²/s in zones A3-A5',
        'Adjust photoperiod to 16/8 cycle',
        'Optimize spectrum with 15% more far-red'
      ],
      status: 'active'
    },
    {
      id: '2',
      type: 'energy',
      title: 'Energy Spike Predicted',
      confidence: 87,
      timeframe: 'Tomorrow 14:00-18:00',
      value: '+35% consumption',
      impact: 'medium',
      recommendations: [
        'Pre-cool facility before peak hours',
        'Reduce lighting intensity by 20% during peak',
        'Shift non-critical operations to off-peak'
      ],
      status: 'pending'
    },
    {
      id: '3',
      type: 'disease',
      title: 'Powdery Mildew Risk',
      confidence: 78,
      timeframe: 'Next 3-5 days',
      value: '32% probability',
      impact: 'high',
      recommendations: [
        'Reduce humidity to below 60%',
        'Increase air circulation in affected zones',
        'Prepare preventive treatment'
      ],
      status: 'active'
    },
    {
      id: '4',
      type: 'maintenance',
      title: 'LED Degradation Detected',
      confidence: 94,
      timeframe: 'Within 30 days',
      value: 'Fixture Group B-12',
      impact: 'medium',
      recommendations: [
        'Schedule replacement for fixtures B-12-01 to B-12-06',
        'Order replacement parts now to avoid downtime',
        'Consider upgrading to newer efficiency models'
      ],
      status: 'pending'
    }
  ]

  const anomalies: Anomaly[] = [
    {
      id: '1',
      type: 'Environmental',
      severity: 'warning',
      detected: new Date(Date.now() - 1000 * 60 * 30),
      location: 'Zone C3',
      description: 'Unusual temperature fluctuation pattern detected',
      confidence: 85
    },
    {
      id: '2',
      type: 'Growth Rate',
      severity: 'info',
      detected: new Date(Date.now() - 1000 * 60 * 60 * 2),
      location: 'Row 7-9',
      description: 'Growth rate 15% below model prediction',
      confidence: 72
    }
  ]

  // Simulate training progress
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            setIsTraining(false)
            return 0
          }
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isTraining])

  const startTraining = (modelId: string) => {
    setIsTraining(true)
    setTrainingProgress(0)
    if (process.env.NODE_ENV === 'development') {
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-300 bg-red-900/20 border border-red-800'
      case 'medium': return 'text-yellow-300 bg-yellow-900/20 border border-yellow-800'
      case 'low': return 'text-green-300 bg-green-900/20 border border-green-800'
      default: return 'text-gray-300 bg-gray-800 border border-gray-700'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5 text-red-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'info': return <Info className="w-5 h-5 text-blue-400" />
      default: return <Info className="w-5 h-5 text-gray-400" />
    }
  }

  const selectedModel = models.find(m => m.id === activeModel)

  return (
    <div className="space-y-6">

      {/* Main Container */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-gray-100">Machine Learning Control Center</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-xl border border-gray-700">
              <label className="text-sm font-medium text-gray-300">Auto-predict</label>
              <input
                type="checkbox"
                checked={autoPredict}
                onChange={(e) => setAutoPredict(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-400"
              />
            </div>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all">
              <Settings className="w-5 h-5 text-gray-400 hover:text-gray-200" />
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {models.map(model => (
            <div
              key={model.id}
              onClick={() => setActiveModel(model.id)}
              className={`cursor-pointer transition-all duration-200 ${
                activeModel === model.id ? 'transform scale-[1.02]' : ''
              }`}
            >
              <div className={`bg-gray-800 rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                activeModel === model.id
                  ? 'border-purple-500 shadow-purple-500/20'
                  : 'border-gray-700 hover:border-purple-400'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    activeModel === model.id ? 'bg-purple-900/30' : 'bg-gray-700'
                  }`}>
                    <Cpu className={`w-5 h-5 ${
                      activeModel === model.id ? 'text-purple-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    model.status === 'active' ? 'bg-green-900/20 text-green-300 border border-green-800' :
                    model.status === 'training' ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-800' :
                    'bg-gray-800 text-gray-300 border border-gray-700'
                  }`}>
                    {model.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-100 mb-2">{model.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{model.type}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Accuracy</span>
                  <span className={`font-semibold ${
                    activeModel === model.id ? 'text-purple-400' : 'text-gray-100'
                  }`}>{model.accuracy}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Training Progress */}
        {isTraining && (
          <div className="mb-8 p-6 bg-purple-900/20 rounded-xl border border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
                <span className="font-semibold text-gray-100">Training in Progress</span>
              </div>
              <span className="text-purple-400 font-medium text-lg">{trainingProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Active Predictions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-100">Active Predictions</h3>
            <div className="flex gap-2">
              {(['24h', '7d', '30d', '90d'] as const).map(timeframe => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTimeframe === timeframe
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map(prediction => (
              <div key={prediction.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-100 mb-2 text-lg">{prediction.title}</h4>
                    <p className="text-sm text-gray-400">
                      {prediction.timeframe}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getImpactColor(prediction.impact)}`}>
                    {prediction.impact} impact
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-purple-400">
                      {prediction.value}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${prediction.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-purple-400">{prediction.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-sm font-medium text-gray-100">Recommendations:</p>
                  {prediction.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all duration-200 font-medium">
                    Apply Recommendations
                  </button>
                  <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 border border-gray-600 transition-all duration-200">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
      </div>

        {/* Anomaly Detection */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-100 mb-6">Anomaly Detection</h3>
          <div className="space-y-4">
            {anomalies.map(anomaly => (
              <div key={anomaly.id} className="flex items-start gap-4 p-6 bg-gray-800 rounded-xl border border-gray-700 hover:shadow-md transition-all duration-200">
                {getSeverityIcon(anomaly.severity)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-100 text-lg">{anomaly.type} Anomaly</h4>
                      <p className="text-gray-300 mt-2">
                        {anomaly.description}
                      </p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {Math.floor((Date.now() - anomaly.detected.getTime()) / (1000 * 60))}m ago
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <span className="text-gray-400">Location: <span className="text-gray-100 font-medium">{anomaly.location}</span></span>
                    <span className="text-gray-400">Confidence: <span className={`font-medium ${
                      anomaly.severity === 'critical' ? 'text-red-400' :
                      anomaly.severity === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>{anomaly.confidence}%</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
            <h3 className="font-semibold text-gray-100 mb-6 text-xl">Model Performance</h3>
            {selectedModel && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Accuracy</span>
                  <span className="font-semibold text-gray-100">{selectedModel.accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Points</span>
                  <span className="font-semibold text-gray-100">{selectedModel.dataPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Trained</span>
                  <span className="font-semibold text-gray-100">
                    {Math.floor((Date.now() - selectedModel.lastTrained.getTime()) / (1000 * 60 * 60))}h ago
                  </span>
                </div>
                <button
                  onClick={() => startTraining(selectedModel.id)}
                  disabled={isTraining}
                  className="w-full mt-6 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all duration-200 disabled:opacity-50 font-medium"
                >
                  {isTraining ? 'Training...' : 'Retrain Model'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:shadow-lg transition-all duration-200">
            <h3 className="font-semibold text-gray-100 mb-6 text-xl">Prediction History</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Predictions</span>
                <span className="font-semibold text-gray-100">1,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accuracy Rate</span>
                <span className="font-semibold text-green-400">92.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Value Generated</span>
                <span className="font-semibold text-purple-400">$124,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Issues Prevented</span>
                <span className="font-semibold text-gray-100">47</span>
              </div>
            </div>
            <button className="w-full mt-6 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 border border-gray-600 transition-all duration-200">
              View Full History
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-100 text-lg">Export Predictions</h4>
              <p className="text-gray-400 mt-2">
                Download predictions and model insights for further analysis
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-all duration-200 font-medium">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}