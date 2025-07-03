'use client'

import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Bug, 
  Leaf, 
  TrendingUp, 
  Shield, 
  Clock, 
  DollarSign,
  Activity,
  BarChart3,
  Eye,
  Thermometer,
  Droplets,
  Wind,
  Target,
  CheckCircle,
  AlertCircle,
  Microscope,
  Calendar,
  RefreshCw,
  Settings,
  Download
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface DiseasePrediction {
  diseaseType: string
  probability: number
  risk: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  timeframe: number
  preventiveMeasures: string[]
  monitoringPoints: string[]
  economicImpact: {
    yieldLoss: number
    treatmentCost: number
    economicImpact: number
  }
}

interface EnvironmentalConditions {
  temperature: number
  humidity: number
  leafWetness: number
  co2: number
  airflow: number
  timestamp: Date
}

interface CropInfo {
  cropType: string
  variety: string
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting'
  plantAge: number
  density: number
}

export default function DiseasePredictionDashboard() {
  const [predictions, setPredictions] = useState<DiseasePrediction[]>([])
  const [currentConditions, setCurrentConditions] = useState<EnvironmentalConditions>({
    temperature: 24,
    humidity: 65,
    leafWetness: 2,
    co2: 650,
    airflow: 0.4,
    timestamp: new Date()
  })
  const [cropInfo, setCropInfo] = useState<CropInfo>({
    cropType: 'cannabis',
    variety: 'purple_haze',
    growthStage: 'flowering',
    plantAge: 60,
    density: 25
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')

  // Mock data for demonstration
  useEffect(() => {
    const mockPredictions: DiseasePrediction[] = [
      {
        diseaseType: 'Powdery Mildew',
        probability: 78,
        risk: 'high',
        confidence: 87,
        timeframe: 5,
        preventiveMeasures: [
          'Increase air circulation and reduce humidity below 60%',
          'Apply preventive sulfur or potassium bicarbonate spray',
          'Remove affected plant material immediately',
          'Ensure proper plant spacing for airflow'
        ],
        monitoringPoints: [
          'Check leaf surfaces for white powdery spots',
          'Monitor humidity levels hourly',
          'Inspect new growth areas regularly',
          'Check air circulation patterns'
        ],
        economicImpact: {
          yieldLoss: 30,
          treatmentCost: 300,
          economicImpact: 6675
        }
      },
      {
        diseaseType: 'Botrytis (Gray Mold)',
        probability: 45,
        risk: 'medium',
        confidence: 82,
        timeframe: 8,
        preventiveMeasures: [
          'Reduce humidity below 85% and improve ventilation',
          'Remove dead or dying plant material promptly',
          'Apply preventive biologicals (Bacillus subtilis)',
          'Avoid overhead watering and leaf wetness'
        ],
        monitoringPoints: [
          'Look for brown/gray fuzzy growth on flowers/stems',
          'Monitor humidity and air movement',
          'Check for water droplets on leaves',
          'Inspect pruning sites and wounds'
        ],
        economicImpact: {
          yieldLoss: 15,
          treatmentCost: 150,
          economicImpact: 3337
        }
      },
      {
        diseaseType: 'Spider Mites',
        probability: 32,
        risk: 'medium',
        confidence: 79,
        timeframe: 12,
        preventiveMeasures: [
          'Increase humidity above 60%',
          'Apply predatory mites (Phytoseiulus persimilis)',
          'Use miticide rotation to prevent resistance',
          'Ensure adequate plant hydration'
        ],
        monitoringPoints: [
          'Look for fine webbing on leaves',
          'Check for stippled/bronzed leaf appearance',
          'Monitor leaf undersides with magnification',
          'Track humidity and temperature levels'
        ],
        economicImpact: {
          yieldLoss: 18,
          treatmentCost: 100,
          economicImpact: 4000
        }
      }
    ]
    setPredictions(mockPredictions)
  }, [])

  const runPrediction = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/disease-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentConditions,
          cropInfo,
          includeWeatherForecast: true,
          useHistoricalData: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPredictions(data.predictions)
      }
    } catch (error) {
      console.error('Failed to run disease prediction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <Shield className="w-4 h-4" />
      case 'medium': return <AlertCircle className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getDiseaseIcon = (diseaseType: string) => {
    if (diseaseType.toLowerCase().includes('mildew')) return <Leaf className="w-5 h-5" />
    if (diseaseType.toLowerCase().includes('mite') || diseaseType.toLowerCase().includes('aphid')) return <Bug className="w-5 h-5" />
    return <Microscope className="w-5 h-5" />
  }

  const getTotalEconomicImpact = () => {
    return predictions.reduce((sum, pred) => {
      const riskMultiplier = {
        low: 0.2,
        medium: 0.5,
        high: 0.8,
        critical: 1.0
      }[pred.risk] || 0.5
      
      return sum + (pred.economicImpact.economicImpact * (pred.probability / 100) * riskMultiplier)
    }, 0)
  }

  const getHighestRiskPrediction = () => {
    return predictions.reduce((highest, current) => {
      const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 }
      const currentRiskLevel = riskOrder[current.risk] || 0
      const highestRiskLevel = riskOrder[highest?.risk] || 0
      
      return currentRiskLevel > highestRiskLevel ? current : highest
    }, null as DiseasePrediction | null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Disease Prediction Center</h1>
            <p className="text-gray-600 mt-1">AI-powered disease risk assessment and prevention</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={runPrediction} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Microscope className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Analyzing...' : 'Run Analysis'}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* High Priority Alert */}
      {getHighestRiskPrediction()?.risk === 'critical' && (
        <div className="mb-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">CRITICAL DISEASE RISK DETECTED</h3>
                  <p className="text-red-800">
                    {getHighestRiskPrediction()?.diseaseType} shows {getHighestRiskPrediction()?.probability}% probability. 
                    Immediate action required within {getHighestRiskPrediction()?.timeframe} days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="prevention">Prevention</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Highest Risk</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getHighestRiskPrediction()?.probability || 0}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {getHighestRiskPrediction()?.diseaseType || 'None detected'}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Diseases Tracked</p>
                    <p className="text-2xl font-bold text-gray-900">{predictions.length}</p>
                    <p className="text-xs text-gray-500">
                      {predictions.filter(p => p.risk === 'high' || p.risk === 'critical').length} high risk
                    </p>
                  </div>
                  <Microscope className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Economic Risk</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${Math.round(getTotalEconomicImpact()).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Potential impact</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {predictions.length > 0 ? 
                        Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length) : 0
                      }%
                    </p>
                    <p className="text-xs text-gray-500">Model accuracy</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Current Environmental Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Thermometer className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <p className="text-2xl font-bold">{currentConditions.temperature}°C</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Droplets className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">Humidity</span>
                  </div>
                  <p className="text-2xl font-bold">{currentConditions.humidity}%</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Wind className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">Airflow</span>
                  </div>
                  <p className="text-2xl font-bold">{currentConditions.airflow} m/s</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium">CO₂</span>
                  </div>
                  <p className="text-2xl font-bold">{currentConditions.co2} ppm</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Droplets className="w-5 h-5 text-cyan-500 mr-2" />
                    <span className="text-sm font-medium">Leaf Wetness</span>
                  </div>
                  <p className="text-2xl font-bold">{currentConditions.leafWetness}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['critical', 'high', 'medium', 'low'].map(riskLevel => {
                    const count = predictions.filter(p => p.risk === riskLevel).length
                    const percentage = predictions.length > 0 ? (count / predictions.length) * 100 : 0
                    
                    return (
                      <div key={riskLevel} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskColor(riskLevel)}>
                            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                          </Badge>
                          <span className="text-sm text-gray-600">{count} diseases</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <Progress value={percentage} className="h-2" />
                          </div>
                          <span className="text-sm font-medium w-10">{percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crop Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Crop Type:</span>
                    <span className="text-sm font-medium capitalize">{cropInfo.cropType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Variety:</span>
                    <span className="text-sm font-medium capitalize">{cropInfo.variety.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Growth Stage:</span>
                    <span className="text-sm font-medium capitalize">{cropInfo.growthStage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Plant Age:</span>
                    <span className="text-sm font-medium">{cropInfo.plantAge} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Density:</span>
                    <span className="text-sm font-medium">{cropInfo.density} plants/m²</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <Card key={index} className={`${
                prediction.risk === 'critical' ? 'border-red-200 bg-red-50' :
                prediction.risk === 'high' ? 'border-orange-200 bg-orange-50' :
                prediction.risk === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                'border-green-200 bg-green-50'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDiseaseIcon(prediction.diseaseType)}
                      <div>
                        <CardTitle className="text-lg">{prediction.diseaseType}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRiskColor(prediction.risk)}>
                            {getRiskIcon(prediction.risk)}
                            {prediction.risk.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {prediction.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{prediction.probability}%</p>
                      <p className="text-sm text-gray-600">Risk Probability</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Timeline & Impact</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Onset: {prediction.timeframe} days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Yield Loss: {prediction.economicImpact.yieldLoss}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Treatment: ${prediction.economicImpact.treatmentCost}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">Total Impact: ${prediction.economicImpact.economicImpact.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Preventive Measures</h4>
                      <ul className="space-y-1">
                        {prediction.preventiveMeasures.slice(0, 3).map((measure, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                            {measure}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Monitoring Points</h4>
                      <ul className="space-y-1">
                        {prediction.monitoringPoints.slice(0, 3).map((point, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <Eye className="w-3 h-3 text-blue-600 mt-1 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Conditions Tab */}
        <TabsContent value="conditions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Parameter Adjustment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Temperature (°C)</label>
                  <Input 
                    type="number" 
                    value={currentConditions.temperature}
                    onChange={(e) => setCurrentConditions(prev => ({ 
                      ...prev, 
                      temperature: parseFloat(e.target.value) || 0 
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Humidity (%)</label>
                  <Input 
                    type="number" 
                    value={currentConditions.humidity}
                    onChange={(e) => setCurrentConditions(prev => ({ 
                      ...prev, 
                      humidity: parseFloat(e.target.value) || 0 
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Airflow (m/s)</label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={currentConditions.airflow}
                    onChange={(e) => setCurrentConditions(prev => ({ 
                      ...prev, 
                      airflow: parseFloat(e.target.value) || 0 
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">CO₂ (ppm)</label>
                  <Input 
                    type="number" 
                    value={currentConditions.co2}
                    onChange={(e) => setCurrentConditions(prev => ({ 
                      ...prev, 
                      co2: parseFloat(e.target.value) || 0 
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Leaf Wetness (hours)</label>
                  <Input 
                    type="number" 
                    value={currentConditions.leafWetness}
                    onChange={(e) => setCurrentConditions(prev => ({ 
                      ...prev, 
                      leafWetness: parseFloat(e.target.value) || 0 
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Crop Type</label>
                  <Select 
                    value={cropInfo.cropType} 
                    onValueChange={(value) => setCropInfo(prev => ({ ...prev, cropType: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cannabis">Cannabis</SelectItem>
                      <SelectItem value="lettuce">Lettuce</SelectItem>
                      <SelectItem value="tomato">Tomato</SelectItem>
                      <SelectItem value="basil">Basil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Growth Stage</label>
                  <Select 
                    value={cropInfo.growthStage} 
                    onValueChange={(value) => setCropInfo(prev => ({ ...prev, growthStage: value as any }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seedling">Seedling</SelectItem>
                      <SelectItem value="vegetative">Vegetative</SelectItem>
                      <SelectItem value="flowering">Flowering</SelectItem>
                      <SelectItem value="fruiting">Fruiting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Plant Age (days)</label>
                  <Input 
                    type="number" 
                    value={cropInfo.plantAge}
                    onChange={(e) => setCropInfo(prev => ({ 
                      ...prev, 
                      plantAge: parseInt(e.target.value) || 0 
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prevention Tab */}
        <TabsContent value="prevention" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Immediate Actions Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions
                    .filter(p => p.risk === 'critical' || p.risk === 'high')
                    .map((prediction, index) => (
                      <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                        <div className="flex items-center gap-2 mb-2">
                          {getDiseaseIcon(prediction.diseaseType)}
                          <h4 className="font-medium">{prediction.diseaseType}</h4>
                          <Badge className={getRiskColor(prediction.risk)}>
                            {prediction.risk}
                          </Badge>
                        </div>
                        <ul className="space-y-1">
                          {prediction.preventiveMeasures.map((measure, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                              {measure}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium">{prediction.diseaseType}</h4>
                        <span className="text-sm text-gray-600">Every {prediction.timeframe <= 3 ? 'day' : '2-3 days'}</span>
                      </div>
                      <ul className="space-y-1">
                        {prediction.monitoringPoints.map((point, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <Calendar className="w-3 h-3 text-blue-600 mt-1 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}