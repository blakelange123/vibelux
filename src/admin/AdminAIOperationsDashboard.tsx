'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Cpu,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  LineChart,
  PieChart,
  Layers,
  GitBranch,
  Database,
  Cloud,
  Server,
  Monitor,
  Gauge,
  Timer,
  Target,
  Crosshair,
  FlaskConical,
  Microscope,
  Lightbulb,
  Bot,
  Network,
  GitMerge,
  Package,
  Code,
  Terminal,
  AlertCircle,
  Info,
  Play,
  Pause,
  Square,
  Settings,
  Filter,
  Search,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Workflow,
  Boxes,
  Binary,
  FileJson,
  ArrowUpRight,
  ArrowDownRight,
  Infinity,
  Hash,
  Variable,
  Function
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

interface ModelMetrics {
  modelId: string
  name: string
  version: string
  type: 'energy_optimization' | 'demand_prediction' | 'anomaly_detection' | 'spectral_analysis' | 'crop_yield'
  status: 'active' | 'training' | 'evaluating' | 'failed' | 'deprecated'
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  lastTrained: Date
  dataPoints: number
  predictions24h: number
  avgInferenceTime: number
  errorRate: number
  driftScore: number
  retrainRequired: boolean
}

interface TrainingJob {
  id: string
  modelName: string
  startTime: Date
  endTime?: Date
  status: 'queued' | 'preprocessing' | 'training' | 'evaluating' | 'completed' | 'failed'
  progress: number
  epoch: number
  totalEpochs: number
  loss: number
  valLoss: number
  learningRate: number
  batchSize: number
  datasetSize: number
  gpuUtilization: number
  estimatedTimeRemaining?: number
}

interface PredictionAnalytics {
  timestamp: Date
  modelId: string
  predictionType: string
  actualValue?: number
  predictedValue: number
  confidence: number
  error?: number
  metadata: {
    facilityId?: string
    userId?: string
    feature?: string
  }
}

interface DataPipeline {
  name: string
  status: 'healthy' | 'degraded' | 'failed'
  throughput: number
  latency: number
  errorRate: number
  lastRun: Date
  dataProcessed: number
  stages: {
    name: string
    status: 'success' | 'warning' | 'error'
    duration: number
  }[]
}

interface FeatureImportance {
  feature: string
  importance: number
  category: string
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

export default function AdminAIOperationsDashboard() {
  const [models, setModels] = useState<ModelMetrics[]>([])
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([])
  const [predictions, setPredictions] = useState<PredictionAnalytics[]>([])
  const [pipelines, setPipelines] = useState<DataPipeline[]>([])
  const [features, setFeatures] = useState<FeatureImportance[]>([])
  const [activeTab, setActiveTab] = useState('models')
  const [timeRange, setTimeRange] = useState('24h')
  const [modelFilter, setModelFilter] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadModelMetrics()
    loadTrainingJobs()
    loadPredictions()
    loadDataPipelines()
    loadFeatureImportance()

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadModelMetrics()
        loadTrainingJobs()
        loadPredictions()
        loadDataPipelines()
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, timeRange, modelFilter])

  const loadModelMetrics = async () => {
    const mockModels: ModelMetrics[] = [
      {
        modelId: 'model_energy_v3',
        name: 'Energy Optimization Model',
        version: '3.2.1',
        type: 'energy_optimization',
        status: 'active',
        accuracy: 94.5,
        precision: 92.3,
        recall: 96.1,
        f1Score: 94.2,
        lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dataPoints: 2500000,
        predictions24h: 145678,
        avgInferenceTime: 23,
        errorRate: 0.8,
        driftScore: 0.12,
        retrainRequired: false
      },
      {
        modelId: 'model_demand_v2',
        name: 'Demand Prediction Model',
        version: '2.5.0',
        type: 'demand_prediction',
        status: 'training',
        accuracy: 91.2,
        precision: 89.7,
        recall: 92.8,
        f1Score: 91.2,
        lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dataPoints: 1800000,
        predictions24h: 98234,
        avgInferenceTime: 45,
        errorRate: 1.2,
        driftScore: 0.28,
        retrainRequired: true
      },
      {
        modelId: 'model_anomaly_v1',
        name: 'Anomaly Detection Model',
        version: '1.8.3',
        type: 'anomaly_detection',
        status: 'active',
        accuracy: 97.8,
        precision: 98.2,
        recall: 97.4,
        f1Score: 97.8,
        lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        dataPoints: 3200000,
        predictions24h: 234567,
        avgInferenceTime: 12,
        errorRate: 0.3,
        driftScore: 0.08,
        retrainRequired: false
      },
      {
        modelId: 'model_spectral_v4',
        name: 'Spectral Analysis Model',
        version: '4.0.2',
        type: 'spectral_analysis',
        status: 'active',
        accuracy: 96.3,
        precision: 95.8,
        recall: 96.7,
        f1Score: 96.2,
        lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        dataPoints: 890000,
        predictions24h: 45678,
        avgInferenceTime: 67,
        errorRate: 0.5,
        driftScore: 0.15,
        retrainRequired: false
      },
      {
        modelId: 'model_yield_v2',
        name: 'Crop Yield Prediction',
        version: '2.1.0',
        type: 'crop_yield',
        status: 'evaluating',
        accuracy: 88.9,
        precision: 87.3,
        recall: 90.2,
        f1Score: 88.7,
        lastTrained: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        dataPoints: 450000,
        predictions24h: 12345,
        avgInferenceTime: 89,
        errorRate: 2.1,
        driftScore: 0.45,
        retrainRequired: true
      }
    ]
    
    setModels(mockModels)
  }

  const loadTrainingJobs = async () => {
    const mockJobs: TrainingJob[] = [
      {
        id: 'job_001',
        modelName: 'Demand Prediction Model',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'training',
        progress: 67,
        epoch: 67,
        totalEpochs: 100,
        loss: 0.0234,
        valLoss: 0.0298,
        learningRate: 0.001,
        batchSize: 128,
        datasetSize: 1800000,
        gpuUtilization: 94,
        estimatedTimeRemaining: 45 * 60
      },
      {
        id: 'job_002',
        modelName: 'Crop Yield Prediction',
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        status: 'evaluating',
        progress: 95,
        epoch: 100,
        totalEpochs: 100,
        loss: 0.0456,
        valLoss: 0.0523,
        learningRate: 0.0005,
        batchSize: 64,
        datasetSize: 450000,
        gpuUtilization: 78,
        estimatedTimeRemaining: 5 * 60
      },
      {
        id: 'job_003',
        modelName: 'Energy Optimization Model',
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 46 * 60 * 60 * 1000),
        status: 'completed',
        progress: 100,
        epoch: 150,
        totalEpochs: 150,
        loss: 0.0123,
        valLoss: 0.0145,
        learningRate: 0.0001,
        batchSize: 256,
        datasetSize: 2500000,
        gpuUtilization: 0
      }
    ]

    setTrainingJobs(mockJobs)
  }

  const loadPredictions = async () => {
    const mockPredictions: PredictionAnalytics[] = [
      {
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        modelId: 'model_energy_v3',
        predictionType: 'Energy Consumption',
        actualValue: 125.4,
        predictedValue: 123.8,
        confidence: 0.94,
        error: 1.6,
        metadata: { facilityId: 'fac_001' }
      },
      {
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        modelId: 'model_demand_v2',
        predictionType: 'Peak Demand',
        actualValue: 450.2,
        predictedValue: 448.7,
        confidence: 0.91,
        error: 1.5,
        metadata: { facilityId: 'fac_002' }
      },
      {
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        modelId: 'model_anomaly_v1',
        predictionType: 'Anomaly Detection',
        predictedValue: 0.08,
        confidence: 0.98,
        metadata: { facilityId: 'fac_003', feature: 'power_factor' }
      }
    ]

    setPredictions(mockPredictions)
  }

  const loadDataPipelines = async () => {
    const mockPipelines: DataPipeline[] = [
      {
        name: 'Sensor Data Ingestion',
        status: 'healthy',
        throughput: 125000,
        latency: 23,
        errorRate: 0.02,
        lastRun: new Date(Date.now() - 30 * 1000),
        dataProcessed: 45000000,
        stages: [
          { name: 'Collection', status: 'success', duration: 5 },
          { name: 'Validation', status: 'success', duration: 8 },
          { name: 'Transformation', status: 'success', duration: 10 }
        ]
      },
      {
        name: 'Feature Engineering',
        status: 'healthy',
        throughput: 45000,
        latency: 145,
        errorRate: 0.1,
        lastRun: new Date(Date.now() - 2 * 60 * 1000),
        dataProcessed: 12000000,
        stages: [
          { name: 'Extraction', status: 'success', duration: 45 },
          { name: 'Aggregation', status: 'success', duration: 67 },
          { name: 'Normalization', status: 'warning', duration: 33 }
        ]
      },
      {
        name: 'Model Training Pipeline',
        status: 'degraded',
        throughput: 8000,
        latency: 2340,
        errorRate: 2.3,
        lastRun: new Date(Date.now() - 15 * 60 * 1000),
        dataProcessed: 1800000,
        stages: [
          { name: 'Data Loading', status: 'success', duration: 234 },
          { name: 'Preprocessing', status: 'warning', duration: 567 },
          { name: 'Training', status: 'error', duration: 1539 }
        ]
      }
    ]

    setPipelines(mockPipelines)
  }

  const loadFeatureImportance = async () => {
    const mockFeatures: FeatureImportance[] = [
      { feature: 'power_consumption_ma', importance: 0.245, category: 'Energy', trend: 'up', changePercent: 3.2 },
      { feature: 'ambient_temperature', importance: 0.198, category: 'Environmental', trend: 'stable', changePercent: 0.1 },
      { feature: 'time_of_day', importance: 0.176, category: 'Temporal', trend: 'down', changePercent: -1.5 },
      { feature: 'humidity_level', importance: 0.134, category: 'Environmental', trend: 'up', changePercent: 2.8 },
      { feature: 'co2_concentration', importance: 0.098, category: 'Environmental', trend: 'up', changePercent: 5.2 },
      { feature: 'light_spectrum_ratio', importance: 0.087, category: 'Spectral', trend: 'stable', changePercent: -0.3 },
      { feature: 'facility_occupancy', importance: 0.062, category: 'Operational', trend: 'down', changePercent: -4.1 }
    ]

    setFeatures(mockFeatures)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
      case 'completed':
      case 'success':
        return 'text-green-600'
      case 'training':
      case 'evaluating':
      case 'preprocessing':
      case 'warning':
        return 'text-yellow-600'
      case 'failed':
      case 'error':
      case 'deprecated':
        return 'text-red-600'
      case 'degraded':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
      case 'completed':
      case 'success':
        return <CheckCircle className="w-4 h-4" />
      case 'training':
      case 'evaluating':
      case 'preprocessing':
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'failed':
      case 'error':
      case 'deprecated':
        return <XCircle className="w-4 h-4" />
      case 'warning':
      case 'degraded':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getDriftStatus = (score: number) => {
    if (score < 0.2) return { text: 'Stable', color: 'text-green-600', icon: <CheckCircle className="w-4 h-4" /> }
    if (score < 0.4) return { text: 'Minor Drift', color: 'text-yellow-600', icon: <AlertCircle className="w-4 h-4" /> }
    return { text: 'Significant Drift', color: 'text-red-600', icon: <AlertTriangle className="w-4 h-4" /> }
  }

  const filteredModels = models.filter(model => {
    if (modelFilter !== 'all' && model.type !== modelFilter) return false
    if (searchQuery && !model.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI/ML Operations Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor model performance, training jobs, and predictions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="autorefresh"
              />
              <label htmlFor="autorefresh" className="text-sm font-medium">Auto-refresh</label>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold text-gray-900">
                  {models.filter(m => m.status === 'active').length}/{models.length}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3" />
                  All systems operational
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Predictions/24h</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(models.reduce((sum, m) => sum + m.predictions24h, 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% from yesterday
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length).toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <Target className="w-3 h-3" />
                  Above target
                </p>
              </div>
              <Crosshair className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Training Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {trainingJobs.filter(j => j.status === 'training').length}
                </p>
                <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                  <Cpu className="w-3 h-3" />
                  {trainingJobs.filter(j => j.status === 'queued').length} queued
                </p>
              </div>
              <GitBranch className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">GPU Utilization</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...trainingJobs.map(j => j.gpuUtilization))}%
                </p>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <Gauge className="w-3 h-3" />
                  High demand
                </p>
              </div>
              <Cpu className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Models
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="pipelines" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Data Pipelines
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-6">
          {/* Model Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All models</SelectItem>
                <SelectItem value="energy_optimization">Energy Optimization</SelectItem>
                <SelectItem value="demand_prediction">Demand Prediction</SelectItem>
                <SelectItem value="anomaly_detection">Anomaly Detection</SelectItem>
                <SelectItem value="spectral_analysis">Spectral Analysis</SelectItem>
                <SelectItem value="crop_yield">Crop Yield</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>

          {/* Model Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredModels.map((model) => {
              const drift = getDriftStatus(model.driftScore)
              
              return (
                <Card key={model.modelId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <p className="text-sm text-gray-600">v{model.version} • {model.modelId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(model.status)}
                        >
                          {getStatusIcon(model.status)}
                          {model.status.toUpperCase()}
                        </Badge>
                        {model.retrainRequired && (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Retrain Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Performance Metrics */}
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Accuracy</p>
                          <p className="text-lg font-semibold">{model.accuracy.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Precision</p>
                          <p className="text-lg font-semibold">{model.precision.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Recall</p>
                          <p className="text-lg font-semibold">{model.recall.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">F1 Score</p>
                          <p className="text-lg font-semibold">{model.f1Score.toFixed(1)}%</p>
                        </div>
                      </div>

                      {/* Additional Metrics */}
                      <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Model Drift</span>
                          <span className={`font-medium flex items-center gap-1 ${drift.color}`}>
                            {drift.icon}
                            {drift.text}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Error Rate</span>
                          <span className={`font-medium ${
                            model.errorRate > 1 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {model.errorRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Inference Time</span>
                          <span className="font-medium">{model.avgInferenceTime}ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Data Points</span>
                          <span className="font-medium">{(model.dataPoints / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-xs text-gray-500">
                          Last trained {Math.floor((Date.now() - model.lastTrained.getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3 mr-1" />
                            Retrain
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Training Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.modelName}</h4>
                        <p className="text-sm text-gray-600">
                          Job ID: {job.id} • Started {new Date(job.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(job.status)}
                      >
                        {getStatusIcon(job.status)}
                        {job.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          Epoch {job.epoch}/{job.totalEpochs}
                        </span>
                        <span className="font-medium">{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                      {job.estimatedTimeRemaining && (
                        <p className="text-xs text-gray-500 mt-1">
                          Est. {Math.floor(job.estimatedTimeRemaining / 60)} minutes remaining
                        </p>
                      )}
                    </div>

                    {/* Training Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Loss</p>
                        <p className="font-medium">{job.loss.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Val Loss</p>
                        <p className="font-medium">{job.valLoss.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Learning Rate</p>
                        <p className="font-medium">{job.learningRate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">GPU Usage</p>
                        <p className={`font-medium ${
                          job.gpuUtilization > 90 ? 'text-red-600' : 
                          job.gpuUtilization > 70 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {job.gpuUtilization}%
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {job.status === 'training' && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button size="sm" variant="outline">
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Square className="w-3 h-3 mr-1" />
                          Stop
                        </Button>
                        <Button size="sm" variant="outline">
                          <Monitor className="w-3 h-3 mr-1" />
                          Monitor
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Training Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Training Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No jobs in queue</p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Upload className="w-4 h-4 mr-2" />
                  Submit New Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Predictions</CardTitle>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((pred, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{pred.predictionType}</h4>
                          <Badge variant="outline" className="text-xs">
                            {pred.modelId}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={
                              pred.confidence > 0.95 ? 'text-green-600 border-green-200' :
                              pred.confidence > 0.9 ? 'text-blue-600 border-blue-200' :
                              'text-yellow-600 border-yellow-200'
                            }
                          >
                            {(pred.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Predicted</p>
                            <p className="font-medium">{pred.predictedValue.toFixed(2)}</p>
                          </div>
                          {pred.actualValue !== undefined && (
                            <>
                              <div>
                                <p className="text-gray-600">Actual</p>
                                <p className="font-medium">{pred.actualValue.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Error</p>
                                <p className={`font-medium ${
                                  Math.abs(pred.error!) > 5 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {pred.error?.toFixed(2)} ({((pred.error! / pred.actualValue) * 100).toFixed(1)}%)
                                </p>
                              </div>
                            </>
                          )}
                          <div>
                            <p className="text-gray-600">Time</p>
                            <p className="font-medium">
                              {new Date(pred.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        {pred.metadata && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            {pred.metadata.facilityId && (
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {pred.metadata.facilityId}
                              </span>
                            )}
                            {pred.metadata.feature && (
                              <span className="flex items-center gap-1">
                                <Variable className="w-3 h-3" />
                                {pred.metadata.feature}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prediction Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Prediction Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">1.2M</p>
                  <p className="text-sm text-gray-600">Last 24 hours</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">+8% from yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Average Error</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">1.2%</p>
                  <p className="text-sm text-gray-600">All models</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">-0.3% improvement</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">API Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">32ms</p>
                  <p className="text-sm text-gray-600">P95 response time</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Gauge className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-500">Within SLA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Pipelines Tab */}
        <TabsContent value="pipelines" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pipelines.map((pipeline) => (
              <Card key={pipeline.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{pipeline.name}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(pipeline.status)}
                    >
                      {getStatusIcon(pipeline.status)}
                      {pipeline.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Pipeline Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Throughput</p>
                        <p className="font-medium">{(pipeline.throughput / 1000).toFixed(0)}K/sec</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Latency</p>
                        <p className={`font-medium ${
                          pipeline.latency > 1000 ? 'text-red-600' :
                          pipeline.latency > 500 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {pipeline.latency}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Error Rate</p>
                        <p className={`font-medium ${
                          pipeline.errorRate > 1 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {pipeline.errorRate.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Data Processed</p>
                        <p className="font-medium">{(pipeline.dataProcessed / 1000000).toFixed(0)}M</p>
                      </div>
                    </div>

                    {/* Pipeline Stages */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Pipeline Stages</p>
                      <div className="space-y-2">
                        {pipeline.stages.map((stage, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                stage.status === 'success' ? 'bg-green-500' :
                                stage.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <span className="text-gray-700">{stage.name}</span>
                            </div>
                            <span className="text-gray-500">{stage.duration}ms</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t text-xs text-gray-500">
                      <span>Last run: {new Date(pipeline.lastRun).toLocaleTimeString()}</span>
                      <Button size="sm" variant="ghost">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Data Flow Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Data Flow Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Network className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Data pipeline flow visualization</p>
                  <p className="text-sm text-gray-400">Interactive DAG would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {/* Feature Importance */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Importance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature) => (
                  <div key={feature.feature} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{feature.feature}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {feature.category}
                          </Badge>
                          <span className={`text-sm font-medium flex items-center gap-1 ${
                            feature.trend === 'up' ? 'text-green-600' :
                            feature.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {feature.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> :
                             feature.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                            {Math.abs(feature.changePercent)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={feature.importance * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Model Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Retrain Demand Model</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Model drift detected (0.28). Schedule retraining to maintain accuracy.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">New Feature Opportunity</p>
                        <p className="text-xs text-blue-700 mt-1">
                          CO2 concentration shows increasing importance (+5.2%). Consider feature engineering.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Optimization Success</p>
                        <p className="text-xs text-green-700 mt-1">
                          Anomaly detection model performing exceptionally well (97.8% accuracy).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-blue-600" />
                  Experiment Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Hyperparameter Tuning</h4>
                    <p className="text-xs text-gray-600">
                      Energy model could benefit from learning rate adjustment based on recent performance.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Play className="w-3 h-3 mr-1" />
                      Start Experiment
                    </Button>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Ensemble Method</h4>
                    <p className="text-xs text-gray-600">
                      Combine spectral and energy models for improved crop yield predictions.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Play className="w-3 h-3 mr-1" />
                      Start Experiment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Model Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Model performance over time</p>
                  <p className="text-sm text-gray-400">Time series charts would display here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}