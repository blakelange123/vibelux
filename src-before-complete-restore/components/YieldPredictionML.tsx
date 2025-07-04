"use client"
import { useState, useEffect } from 'react'
import {
  Brain,
  TrendingUp,
  BarChart3,
  Activity,
  Leaf,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  Download,
  Upload,
  RefreshCw,
  Target,
  Beaker,
  Lightbulb,
  Droplets,
  Thermometer,
  Wind,
  Settings,
  Play,
  History
} from 'lucide-react'

interface PredictionModel {
  id: string
  name: string
  accuracy: number
  lastTrained: Date
  features: string[]
  cropType: string
  status: 'ready' | 'training' | 'error'
}

interface YieldPrediction {
  cropType: string
  predictedYield: number
  confidence: number
  unit: string
  harvestDate: Date
  factors: {
    name: string
    impact: number // -100 to +100
    current: number
    optimal: number
    unit: string
  }[]
}

interface HistoricalData {
  date: Date
  actualYield: number
  predictedYield: number
  accuracy: number
}

interface EnvironmentalData {
  temperature: { min: number; max: number; avg: number }
  humidity: { min: number; max: number; avg: number }
  ppfd: { daily: number; accumulated: number }
  co2: { avg: number }
  vpd: { avg: number }
  waterUsage: number
  nutrientEC: number
  nutrientPH: number
}

export function YieldPredictionML() {
  const [models, setModels] = useState<PredictionModel[]>([
    {
      id: '1',
      name: 'Lettuce Yield Predictor v2.1',
      accuracy: 94.2,
      lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      features: ['DLI', 'Temperature', 'Humidity', 'CO2', 'Nutrients', 'Variety'],
      cropType: 'Lettuce',
      status: 'ready'
    },
    {
      id: '2',
      name: 'Tomato Production Model',
      accuracy: 91.8,
      lastTrained: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      features: ['Light Spectrum', 'Temperature', 'Water', 'Pruning', 'Variety'],
      cropType: 'Tomato',
      status: 'ready'
    },
    {
      id: '3',
      name: 'Cannabis Yield Optimizer',
      accuracy: 89.5,
      lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      features: ['PPFD', 'Spectrum', 'VPD', 'CO2', 'Nutrients', 'Training'],
      cropType: 'Cannabis',
      status: 'ready'
    }
  ])

  const [selectedModel, setSelectedModel] = useState<PredictionModel>(models[0])
  const [currentPrediction, setCurrentPrediction] = useState<YieldPrediction>({
    cropType: 'Lettuce',
    predictedYield: 2.8,
    confidence: 92,
    unit: 'kg/m²',
    harvestDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    factors: [
      { name: 'Light (DLI)', impact: 85, current: 16.2, optimal: 17, unit: 'mol/m²/day' },
      { name: 'Temperature', impact: -15, current: 26, optimal: 22, unit: '°C' },
      { name: 'CO2', impact: 45, current: 900, optimal: 1000, unit: 'ppm' },
      { name: 'Humidity', impact: 5, current: 65, optimal: 70, unit: '%' },
      { name: 'Nutrients', impact: 25, current: 1.8, optimal: 2.0, unit: 'EC' }
    ]
  })

  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData>({
    temperature: { min: 18, max: 26, avg: 22 },
    humidity: { min: 55, max: 75, avg: 65 },
    ppfd: { daily: 250, accumulated: 5250 },
    co2: { avg: 900 },
    vpd: { avg: 1.2 },
    waterUsage: 3.5,
    nutrientEC: 1.8,
    nutrientPH: 6.2
  })

  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([
    { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), actualYield: 2.5, predictedYield: 2.4, accuracy: 96 },
    { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), actualYield: 2.7, predictedYield: 2.6, accuracy: 96.3 },
    { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), actualYield: 2.6, predictedYield: 2.7, accuracy: 96.2 }
  ])

  const [isTraining, setIsTraining] = useState(false)
  const [showABTest, setShowABTest] = useState(false)

  const runPrediction = async () => {
    // Simulate ML prediction
    const baseYield = selectedModel.cropType === 'Lettuce' ? 2.5 : 
                     selectedModel.cropType === 'Tomato' ? 45 : 
                     1.5

    const yieldMultiplier = currentPrediction.factors.reduce((acc, factor) => {
      return acc + (factor.impact / 100) * 0.1
    }, 1)

    setCurrentPrediction({
      ...currentPrediction,
      predictedYield: Number((baseYield * yieldMultiplier).toFixed(2)),
      confidence: Math.round(selectedModel.accuracy - Math.random() * 5)
    })
  }

  const trainModel = async () => {
    setIsTraining(true)
    
    // Simulate model training
    setTimeout(() => {
      setModels(models.map(model =>
        model.id === selectedModel.id
          ? { ...model, accuracy: model.accuracy + Math.random() * 2, lastTrained: new Date() }
          : model
      ))
      setIsTraining(false)
    }, 3000)
  }

  const getImpactColor = (impact: number): string => {
    if (impact > 50) return 'text-green-400'
    if (impact > 0) return 'text-green-300'
    if (impact > -20) return 'text-yellow-400'
    return 'text-red-400'
  }

  const calculateOptimizationPotential = (): number => {
    const totalPotentialGain = currentPrediction.factors.reduce((acc, factor) => {
      if (factor.impact < 0) return acc + Math.abs(factor.impact)
      if (factor.current < factor.optimal) return acc + (factor.optimal - factor.current) / factor.optimal * 50
      return acc
    }, 0)
    
    return Math.min(totalPotentialGain, 100)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">ML Yield Prediction</h1>
          <p className="text-gray-400">Machine learning models for accurate harvest forecasting</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runPrediction}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            Run Prediction
          </button>
          <button
            onClick={() => setShowABTest(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Beaker className="w-4 h-4" />
            A/B Test
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Predicted Yield</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {currentPrediction.predictedYield} {currentPrediction.unit}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {currentPrediction.confidence}% confidence
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Days to Harvest</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {Math.round((currentPrediction.harvestDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {currentPrediction.harvestDate.toLocaleDateString()}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Model Accuracy</span>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            {selectedModel.accuracy.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Optimization</span>
            <Target className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-100">
            +{calculateOptimizationPotential().toFixed(0)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Potential gain</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Selection & Prediction */}
        <div className="lg:col-span-2 space-y-6">
          {/* Model Selection */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Prediction Models</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {models.map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedModel.id === model.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <Leaf className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <h3 className="font-medium text-gray-100">{model.cropType}</h3>
                  <p className="text-sm text-gray-400 mt-1">{model.accuracy.toFixed(1)}% accurate</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {model.status === 'ready' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="text-xs text-gray-400">{model.status}</span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Last trained: {selectedModel.lastTrained.toLocaleDateString()}
              </p>
              <button
                onClick={trainModel}
                disabled={isTraining}
                className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
              >
                {isTraining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                    Training...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Retrain
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Yield Factors Analysis */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Yield Impact Factors</h2>
            <div className="space-y-4">
              {currentPrediction.factors.map((factor, index) => (
                <div key={index} className="border-b border-gray-700 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-100">{factor.name}</h4>
                    <span className={`text-lg font-semibold ${getImpactColor(factor.impact)}`}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Current</p>
                      <p className="text-gray-100">{factor.current} {factor.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Optimal</p>
                      <p className="text-gray-100">{factor.optimal} {factor.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Action</p>
                      <p className={`${
                        Math.abs(factor.current - factor.optimal) < factor.optimal * 0.05
                          ? 'text-green-400'
                          : 'text-yellow-400'
                      }`}>
                        {Math.abs(factor.current - factor.optimal) < factor.optimal * 0.05
                          ? 'Maintain'
                          : factor.current < factor.optimal ? 'Increase' : 'Decrease'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Visual indicator */}
                  <div className="mt-2 relative h-2 bg-gray-700 rounded-full">
                    <div
                      className="absolute top-0 left-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                      style={{ width: '100%' }}
                    />
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-800"
                      style={{ left: `${(factor.current / factor.optimal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="mt-6 bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-100 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                AI Recommendations
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">•</span>
                  <span>Reduce temperature by 3-4°C during light hours to optimize growth rate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Increase CO2 supplementation to 1000-1200 ppm for 15% yield boost</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Current light levels are near optimal - maintain DLI at 16-17 mol/m²/day</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Environmental Monitoring */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Environmental Conditions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-400">Temperature</span>
                </div>
                <p className="text-lg font-medium text-gray-100">{environmentalData.temperature.avg}°C</p>
                <p className="text-xs text-gray-400">
                  {environmentalData.temperature.min}-{environmentalData.temperature.max}°C
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Humidity</span>
                </div>
                <p className="text-lg font-medium text-gray-100">{environmentalData.humidity.avg}%</p>
                <p className="text-xs text-gray-400">
                  {environmentalData.humidity.min}-{environmentalData.humidity.max}%
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-400">Daily Light</span>
                </div>
                <p className="text-lg font-medium text-gray-100">{environmentalData.ppfd.daily} PPFD</p>
                <p className="text-xs text-gray-400">
                  {(environmentalData.ppfd.daily * 12 * 3600 / 1000000).toFixed(1)} DLI
                </p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">CO2</span>
                </div>
                <p className="text-lg font-medium text-gray-100">{environmentalData.co2.avg} ppm</p>
                <p className="text-xs text-gray-400">
                  VPD: {environmentalData.vpd.avg} kPa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Performance & Stats */}
        <div className="space-y-6">
          {/* Model Performance */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Model Performance</h3>
            
            <div className="space-y-4">
              {/* Accuracy Trend */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Accuracy Trend</p>
                <div className="h-32 relative">
                  {/* Simple line chart visualization */}
                  <div className="absolute inset-0 flex items-end justify-between">
                    {[92, 93, 94, 93, 94.2].map((value, index) => (
                      <div
                        key={index}
                        className="w-8 bg-purple-600 rounded-t"
                        style={{ height: `${(value - 90) * 20}%` }}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-xs text-gray-400 flex justify-between">
                    <span>-4w</span>
                    <span>-3w</span>
                    <span>-2w</span>
                    <span>-1w</span>
                    <span>Now</span>
                  </div>
                </div>
              </div>
              
              {/* Key Features */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Model Features</p>
                <div className="flex flex-wrap gap-2">
                  {selectedModel.features.map(feature => (
                    <span key={feature} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Training Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Training Samples</span>
                  <span className="text-gray-100">12,450</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Validation R²</span>
                  <span className="text-gray-100">0.942</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">RMSE</span>
                  <span className="text-gray-100">0.18 kg/m²</span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Predictions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              Past Predictions
            </h3>
            
            <div className="space-y-3">
              {historicalData.map((data, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      {data.date.toLocaleDateString()}
                    </span>
                    <span className={`text-sm ${
                      data.accuracy > 95 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {data.accuracy}% accurate
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Predicted</p>
                      <p className="text-gray-100">{data.predictedYield} kg/m²</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Actual</p>
                      <p className="text-gray-100">{data.actualYield} kg/m²</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Export & Reports</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Export Prediction Report
              </button>
              <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Training Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}