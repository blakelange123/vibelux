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
  Pause,
  Save,
  Edit2,
  Sliders,
  FileDown
} from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

interface ModelSettings {
  learningRate: number
  epochs: number
  batchSize: number
  validationSplit: number
  earlyStoppingPatience: number
  optimizerType: 'adam' | 'sgd' | 'rmsprop'
  regularization: number
  dropoutRate: number
}

interface PredictionSettings {
  confidenceThreshold: number
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
  alertThreshold: number
  includeHistoricalData: boolean
  predictionHorizon: number
  anomalyDetectionSensitivity: 'low' | 'medium' | 'high'
  autoApplyRecommendations: boolean
}

export function EnhancedMachineLearningPredictions() {
  const [activeModel, setActiveModel] = useState<string>('yield-optimizer')
  const [isTraining, setIsTraining] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [autoPredict, setAutoPredict] = useState(true)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [editingModel, setEditingModel] = useState<string | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    learningRate: 0.001,
    epochs: 100,
    batchSize: 32,
    validationSplit: 0.2,
    earlyStoppingPatience: 10,
    optimizerType: 'adam',
    regularization: 0.01,
    dropoutRate: 0.2
  })

  const [predictionSettings, setPredictionSettings] = useState<PredictionSettings>({
    confidenceThreshold: 75,
    updateFrequency: 'hourly',
    alertThreshold: 80,
    includeHistoricalData: true,
    predictionHorizon: 30,
    anomalyDetectionSensitivity: 'medium',
    autoApplyRecommendations: false
  })

  const [models, setModels] = useState<Model[]>([
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
  ])

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
    console.log('Starting training for model:', modelId, 'with settings:', modelSettings)
  }

  const saveModelSettings = () => {
    console.log('Saving model settings:', modelSettings)
    setShowSettings(false)
    // In a real app, this would save to backend
  }

  const updateModel = (modelId: string, updates: Partial<Model>) => {
    setModels(models.map(m => 
      m.id === modelId ? { ...m, ...updates } : m
    ))
  }

  const generatePDFReport = async () => {
    setGeneratingPDF(true)
    try {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20

      // Title
      pdf.setFontSize(24)
      pdf.setTextColor(103, 58, 183) // Purple color
      pdf.text('Machine Learning Predictions Report', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 15

      // Date
      pdf.setFontSize(12)
      pdf.setTextColor(100)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20

      // Active Model Info
      const selectedModel = models.find(m => m.id === activeModel)
      if (selectedModel) {
        pdf.setFontSize(16)
        pdf.setTextColor(0)
        pdf.text('Active Model', 20, yPosition)
        yPosition += 10

        pdf.setFontSize(11)
        pdf.setTextColor(60)
        pdf.text(`Model: ${selectedModel.name}`, 20, yPosition)
        yPosition += 7
        pdf.text(`Type: ${selectedModel.type}`, 20, yPosition)
        yPosition += 7
        pdf.text(`Accuracy: ${selectedModel.accuracy}%`, 20, yPosition)
        yPosition += 7
        pdf.text(`Data Points: ${selectedModel.dataPoints.toLocaleString()}`, 20, yPosition)
        yPosition += 15
      }

      // Model Settings
      pdf.setFontSize(16)
      pdf.setTextColor(0)
      pdf.text('Model Configuration', 20, yPosition)
      yPosition += 10

      pdf.setFontSize(11)
      pdf.setTextColor(60)
      pdf.text(`Learning Rate: ${modelSettings.learningRate}`, 20, yPosition)
      yPosition += 7
      pdf.text(`Epochs: ${modelSettings.epochs}`, 20, yPosition)
      yPosition += 7
      pdf.text(`Batch Size: ${modelSettings.batchSize}`, 20, yPosition)
      yPosition += 7
      pdf.text(`Optimizer: ${modelSettings.optimizerType.toUpperCase()}`, 20, yPosition)
      yPosition += 15

      // Predictions
      pdf.setFontSize(16)
      pdf.setTextColor(0)
      pdf.text('Active Predictions', 20, yPosition)
      yPosition += 10

      predictions.forEach(prediction => {
        if (yPosition > pageHeight - 50) {
          pdf.addPage()
          yPosition = 20
        }

        // Prediction box
        pdf.setDrawColor(200)
        pdf.setFillColor(250, 250, 250)
        pdf.rect(20, yPosition, pageWidth - 40, 45, 'FD')

        pdf.setFontSize(12)
        pdf.setTextColor(0)
        pdf.text(prediction.title, 25, yPosition + 8)

        pdf.setFontSize(10)
        pdf.setTextColor(100)
        pdf.text(`Confidence: ${prediction.confidence}%`, pageWidth - 50, yPosition + 8)
        
        pdf.setFontSize(14)
        pdf.setTextColor(103, 58, 183)
        pdf.text(String(prediction.value), 25, yPosition + 20)

        pdf.setFontSize(9)
        pdf.setTextColor(60)
        pdf.text(`Timeframe: ${prediction.timeframe}`, 25, yPosition + 28)
        
        pdf.setTextColor(0, 100, 0)
        pdf.text(`Impact: ${prediction.impact.toUpperCase()}`, 25, yPosition + 36)

        yPosition += 55
      })

      // Recommendations Summary
      pdf.addPage()
      yPosition = 20
      pdf.setFontSize(16)
      pdf.setTextColor(0)
      pdf.text('Recommendations Summary', 20, yPosition)
      yPosition += 10

      predictions.forEach(prediction => {
        if (yPosition > pageHeight - 50) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.setFontSize(12)
        pdf.setTextColor(103, 58, 183)
        pdf.text(prediction.title, 20, yPosition)
        yPosition += 8

        prediction.recommendations.forEach(rec => {
          pdf.setFontSize(10)
          pdf.setTextColor(60)
          const lines = pdf.splitTextToSize(`• ${rec}`, pageWidth - 40)
          lines.forEach(line => {
            pdf.text(line, 25, yPosition)
            yPosition += 6
          })
        })
        yPosition += 5
      })

      // Save the PDF
      pdf.save(`ml-predictions-report-${Date.now()}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const selectedModel = models.find(m => m.id === activeModel)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ML Predictions (Enhanced)</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Auto-predict</label>
            <input
              type="checkbox"
              checked={autoPredict}
              onChange={(e) => setAutoPredict(e.target.checked)}
              className="toggle"
            />
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Sliders className="w-5 h-5" />
          </button>
          <button 
            onClick={generatePDFReport}
            disabled={generatingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            {generatingPDF ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Model & Prediction Settings</h3>
            <button 
              onClick={saveModelSettings}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model Settings */}
            <div>
              <h4 className="font-medium mb-3">Model Configuration</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Learning Rate</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={modelSettings.learningRate}
                    onChange={(e) => setModelSettings({...modelSettings, learningRate: Number(e.target.value)})}
                    className="w-full px-3 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Epochs</label>
                  <input
                    type="number"
                    value={modelSettings.epochs}
                    onChange={(e) => setModelSettings({...modelSettings, epochs: Number(e.target.value)})}
                    className="w-full px-3 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Batch Size</label>
                  <input
                    type="number"
                    value={modelSettings.batchSize}
                    onChange={(e) => setModelSettings({...modelSettings, batchSize: Number(e.target.value)})}
                    className="w-full px-3 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Optimizer</label>
                  <select
                    value={modelSettings.optimizerType}
                    onChange={(e) => setModelSettings({...modelSettings, optimizerType: e.target.value as any})}
                    className="w-full px-3 py-1 border rounded"
                  >
                    <option value="adam">Adam</option>
                    <option value="sgd">SGD</option>
                    <option value="rmsprop">RMSprop</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Prediction Settings */}
            <div>
              <h4 className="font-medium mb-3">Prediction Configuration</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Confidence Threshold (%)</label>
                  <input
                    type="number"
                    value={predictionSettings.confidenceThreshold}
                    onChange={(e) => setPredictionSettings({...predictionSettings, confidenceThreshold: Number(e.target.value)})}
                    className="w-full px-3 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Update Frequency</label>
                  <select
                    value={predictionSettings.updateFrequency}
                    onChange={(e) => setPredictionSettings({...predictionSettings, updateFrequency: e.target.value as any})}
                    className="w-full px-3 py-1 border rounded"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Prediction Horizon (days)</label>
                  <input
                    type="number"
                    value={predictionSettings.predictionHorizon}
                    onChange={(e) => setPredictionSettings({...predictionSettings, predictionHorizon: Number(e.target.value)})}
                    className="w-full px-3 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Anomaly Detection Sensitivity</label>
                  <select
                    value={predictionSettings.anomalyDetectionSensitivity}
                    onChange={(e) => setPredictionSettings({...predictionSettings, anomalyDetectionSensitivity: e.target.value as any})}
                    className="w-full px-3 py-1 border rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Selector with Edit Capability */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {models.map(model => (
          <div
            key={model.id}
            onClick={() => setActiveModel(model.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all relative ${
              activeModel === model.id
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'hover:border-gray-400'
            }`}
          >
            {editingModel === model.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={model.name}
                  onChange={(e) => updateModel(model.id, { name: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  onClick={(e) => e.stopPropagation()}
                />
                <select
                  value={model.type}
                  onChange={(e) => updateModel(model.id, { type: e.target.value })}
                  className="w-full px-2 py-1 text-sm border rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="Random Forest">Random Forest</option>
                  <option value="LSTM Neural Network">LSTM Neural Network</option>
                  <option value="CNN">CNN</option>
                  <option value="Gradient Boosting">Gradient Boosting</option>
                </select>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingModel(null)
                  }}
                  className="w-full px-2 py-1 bg-purple-600 text-white rounded text-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingModel(model.id)
                  }}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <div className="flex items-center justify-between mb-2">
                  <Cpu className="w-5 h-5 text-purple-600" />
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    model.status === 'active' ? 'bg-green-100 text-green-700' :
                    model.status === 'training' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {model.status}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1">{model.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{model.type}</p>
                <div className="flex items-center justify-between text-xs">
                  <span>Accuracy</span>
                  <span className="font-semibold">{model.accuracy}%</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Training Progress */}
      {isTraining && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600 animate-spin" />
              <span className="font-semibold">Training in Progress</span>
            </div>
            <span className="text-sm">{trainingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Active Predictions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Active Predictions</h3>
          <div className="flex gap-2">
            {(['24h', '7d', '30d', '90d'] as const).map(timeframe => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedTimeframe === timeframe
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.map(prediction => (
            <div key={prediction.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{prediction.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {prediction.timeframe}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getImpactColor(prediction.impact)}`}>
                  {prediction.impact} impact
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold text-purple-600">
                    {prediction.value}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Confidence</span>
                    <div className="flex items-center gap-1">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${prediction.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{prediction.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Recommendations:</p>
                {prediction.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                  Apply Recommendations
                </button>
                <button className="px-3 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Model Performance</h3>
          {selectedModel && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Accuracy</span>
                <span className="font-semibold">{selectedModel.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data Points</span>
                <span className="font-semibold">{selectedModel.dataPoints.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Trained</span>
                <span className="font-semibold">
                  {Math.floor((Date.now() - selectedModel.lastTrained.getTime()) / (1000 * 60 * 60))}h ago
                </span>
              </div>
              <button
                onClick={() => startTraining(selectedModel.id)}
                disabled={isTraining}
                className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {isTraining ? 'Training...' : 'Retrain Model'}
              </button>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Prediction History</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Predictions</span>
              <span className="font-semibold">1,847</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Accuracy Rate</span>
              <span className="font-semibold text-green-600">92.3%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Value Generated</span>
              <span className="font-semibold text-purple-600">$124,500</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Issues Prevented</span>
              <span className="font-semibold">47</span>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
            View Full History
          </button>
        </div>
      </div>
    </div>
  )
}