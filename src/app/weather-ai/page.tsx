'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Eye,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Brain,
  Calendar,
  Clock,
  MapPin,
  BarChart3,
  LineChart,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Target,
  Gauge,
  Download,
  RefreshCw,
  History,
  Play,
  Pause,
  SkipForward,
  Bot,
  Cpu,
  Database
} from 'lucide-react'

interface WeatherData {
  timestamp: string
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: number
  cloudCover: number
  precipitation: number
  uvIndex: number
  visibility: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy'
}

interface WeatherForecast extends WeatherData {
  confidence: number
  alerts: string[]
}

interface EnvironmentalAdjustment {
  id: string
  parameter: 'temperature' | 'humidity' | 'lighting' | 'co2' | 'irrigation' | 'ventilation'
  currentValue: number
  targetValue: number
  adjustmentValue: number
  reason: string
  confidence: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedSavings: number
  timeframe: string
  automated: boolean
  status: 'pending' | 'applied' | 'rejected' | 'monitoring'
}

interface AIModel {
  id: string
  name: string
  description: string
  accuracy: number
  lastTrained: string
  features: string[]
  active: boolean
}

interface ForecastSettings {
  location: string
  latitude: number
  longitude: number
  timezone: string
  forecastDays: number
  updateInterval: number // minutes
  enableAutomation: boolean
  confidenceThreshold: number
  weatherProvider: 'openweather' | 'weatherapi' | 'noaa'
}

export default function WeatherAIPage() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<WeatherForecast[]>([])
  const [adjustments, setAdjustments] = useState<EnvironmentalAdjustment[]>([])
  const [aiModels, setAIModels] = useState<AIModel[]>([])
  const [settings, setSettings] = useState<ForecastSettings>({
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
    forecastDays: 7,
    updateInterval: 30,
    enableAutomation: true,
    confidenceThreshold: 85,
    weatherProvider: 'openweather'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [automationEnabled, setAutomationEnabled] = useState(true)
  const [selectedDay, setSelectedDay] = useState(0)

  useEffect(() => {
    loadSampleData()
    // In production, this would fetch real weather data
    const interval = setInterval(updateWeatherData, settings.updateInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadSampleData = () => {
    // Sample current weather
    const currentWeatherData: WeatherData = {
      timestamp: new Date().toISOString(),
      temperature: 22.5,
      humidity: 65,
      pressure: 1013.2,
      windSpeed: 12,
      windDirection: 270,
      cloudCover: 40,
      precipitation: 0,
      uvIndex: 6,
      visibility: 10,
      condition: 'cloudy'
    }
    setCurrentWeather(currentWeatherData)

    // Sample 7-day forecast
    const forecastData: WeatherForecast[] = Array.from({ length: 7 }, (_, i) => ({
      timestamp: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      temperature: 20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      humidity: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
      pressure: 1010 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      windSpeed: 5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15,
      windDirection: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 360,
      cloudCover: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
      precipitation: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
      uvIndex: Math.round(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 11),
      visibility: 8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2,
      condition: ['sunny', 'cloudy', 'rainy', 'sunny', 'cloudy', 'rainy', 'sunny'][i] as any,
      confidence: 85 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      alerts: i === 2 ? ['Heavy rain expected', 'High wind warning'] : []
    }))
    setForecast(forecastData)

    // Sample AI adjustments
    const adjustmentData: EnvironmentalAdjustment[] = [
      {
        id: 'adj_001',
        parameter: 'lighting',
        currentValue: 600,
        targetValue: 450,
        adjustmentValue: -150,
        reason: 'Cloudy conditions reducing natural light supplementation needs',
        confidence: 92,
        priority: 'medium',
        estimatedSavings: 35.50,
        timeframe: '12:00 PM - 4:00 PM',
        automated: true,
        status: 'applied'
      },
      {
        id: 'adj_002',
        parameter: 'humidity',
        currentValue: 55,
        targetValue: 60,
        adjustmentValue: 5,
        reason: 'Incoming storm system will increase ambient humidity',
        confidence: 88,
        priority: 'high',
        estimatedSavings: 12.25,
        timeframe: 'Tomorrow 6:00 AM - 2:00 PM',
        automated: false,
        status: 'pending'
      },
      {
        id: 'adj_003',
        parameter: 'ventilation',
        currentValue: 40,
        targetValue: 65,
        adjustmentValue: 25,
        reason: 'High pressure system bringing hot, dry conditions',
        confidence: 95,
        priority: 'critical',
        estimatedSavings: 45.75,
        timeframe: 'Day 3-4',
        automated: true,
        status: 'monitoring'
      },
      {
        id: 'adj_004',
        parameter: 'irrigation',
        currentValue: 3.2,
        targetValue: 2.8,
        adjustmentValue: -0.4,
        reason: 'Increased humidity reducing transpiration rates',
        confidence: 85,
        priority: 'medium',
        estimatedSavings: 8.90,
        timeframe: 'Next 48 hours',
        automated: true,
        status: 'applied'
      }
    ]
    setAdjustments(adjustmentData)

    // Sample AI models
    const modelData: AIModel[] = [
      {
        id: 'model_001',
        name: 'WeatherNet-Pro',
        description: 'Deep learning model for 7-day weather prediction with facility-specific adjustments',
        accuracy: 94.2,
        lastTrained: '2024-02-01',
        features: ['Temperature forecasting', 'Humidity prediction', 'Pressure analysis', 'Wind patterns'],
        active: true
      },
      {
        id: 'model_002',
        name: 'ClimateAdapt-AI',
        description: 'Specialized model for facility climate control optimization',
        accuracy: 91.8,
        lastTrained: '2024-01-28',
        features: ['HVAC optimization', 'Energy efficiency', 'Crop stress prediction'],
        active: true
      },
      {
        id: 'model_003',
        name: 'PrecipPredict-v2',
        description: 'Advanced precipitation and storm tracking model',
        accuracy: 89.5,
        lastTrained: '2024-01-25',
        features: ['Rainfall prediction', 'Storm tracking', 'Flood risk assessment'],
        active: false
      }
    ]
    setAIModels(modelData)
  }

  const updateWeatherData = async () => {
    setIsLoading(true)
    try {
      // In production, this would call actual weather APIs
      // const response = await fetch(`/api/weather?lat=${settings.latitude}&lon=${settings.longitude}`)
      // const data = await response.json()
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate new adjustments based on forecast changes
      generateAIAdjustments()
    } catch (error) {
      console.error('Failed to update weather data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIAdjustments = () => {
    // Simulate AI analysis generating new adjustment recommendations
    const newAdjustment: EnvironmentalAdjustment = {
      id: `adj_${Date.now()}`,
      parameter: 'temperature',
      currentValue: 23,
      targetValue: 25,
      adjustmentValue: 2,
      reason: 'Cold front approaching, pre-warming facility to maintain optimal conditions',
      confidence: 87,
      priority: 'medium',
      estimatedSavings: 15.20,
      timeframe: 'Next 6 hours',
      automated: false,
      status: 'pending'
    }
    
    setAdjustments(prev => [newAdjustment, ...prev.slice(0, 9)]) // Keep only 10 most recent
  }

  const applyAdjustment = (adjustmentId: string) => {
    setAdjustments(adjustments.map(adj => 
      adj.id === adjustmentId 
        ? { ...adj, status: 'applied' as const }
        : adj
    ))
  }

  const rejectAdjustment = (adjustmentId: string) => {
    setAdjustments(adjustments.map(adj => 
      adj.id === adjustmentId 
        ? { ...adj, status: 'rejected' as const }
        : adj
    ))
  }

  const getWeatherIcon = (condition: string) => {
    const icons = {
      sunny: Sun,
      cloudy: Cloud,
      rainy: CloudRain,
      snowy: CloudSnow,
      stormy: CloudRain
    }
    const Icon = icons[condition as keyof typeof icons] || Cloud
    return <Icon className="w-6 h-6" />
  }

  const getParameterIcon = (parameter: string) => {
    const icons = {
      temperature: Thermometer,
      humidity: Droplets,
      lighting: Lightbulb,
      co2: Wind,
      irrigation: Droplets,
      ventilation: Wind
    }
    const Icon = icons[parameter as keyof typeof icons] || Settings
    return <Icon className="w-4 h-4" />
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-500'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-blue-500',
      applied: 'bg-green-500',
      rejected: 'bg-red-500',
      monitoring: 'bg-purple-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-500'
  }

  const exportForecastData = () => {
    const exportData = {
      currentWeather,
      forecast,
      adjustments,
      settings,
      models: aiModels,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weather-ai-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              Weather Forecast AI Adjustments
            </h1>
            <p className="text-muted-foreground">
              Intelligent facility optimization based on 5-10 day weather forecasts
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Automation</span>
              <Switch
                checked={automationEnabled}
                onCheckedChange={setAutomationEnabled}
              />
            </div>
            <Button variant="outline" onClick={updateWeatherData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Update
            </Button>
            <Button variant="outline" onClick={exportForecastData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Current Weather & Quick Stats */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentWeather && getWeatherIcon(currentWeather.condition)}
                Current Conditions
              </CardTitle>
              <CardDescription>{settings.location}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentWeather && (
                <div className="space-y-3">
                  <div className="text-3xl font-bold">
                    {currentWeather.temperature.toFixed(1)}°C
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      {currentWeather.humidity}%
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="w-4 h-4 text-gray-600" />
                      {currentWeather.windSpeed} km/h
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-4 h-4 text-purple-600" />
                      {currentWeather.pressure} hPa
                    </div>
                    <div className="flex items-center gap-1">
                      <Sun className="w-4 h-4 text-yellow-600" />
                      UV {currentWeather.uvIndex}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Adjustments</p>
                  <p className="text-2xl font-bold">{adjustments.filter(a => a.status === 'applied').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Actions</p>
                  <p className="text-2xl font-bold">{adjustments.filter(a => a.status === 'pending').length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Est. Daily Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${adjustments.filter(a => a.status === 'applied').reduce((sum, a) => sum + a.estimatedSavings, 0).toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Forecast Accuracy</p>
                  <p className="text-2xl font-bold">
                    {aiModels.filter(m => m.active).reduce((sum, m) => sum + m.accuracy, 0) / aiModels.filter(m => m.active).length || 0}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* 7-Day Forecast */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="forecast" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
                <TabsTrigger value="adjustments">AI Adjustments</TabsTrigger>
                <TabsTrigger value="analysis">Trend Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="forecast" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Extended Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {forecast.map((day, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedDay === index ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedDay(index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getWeatherIcon(day.condition)}
                              <div>
                                <div className="font-medium">
                                  {index === 0 ? 'Today' : 
                                   index === 1 ? 'Tomorrow' : 
                                   new Date(day.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="text-sm text-muted-foreground capitalize">
                                  {day.condition}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-bold">{day.temperature.toFixed(1)}°C</div>
                                <div className="text-sm text-muted-foreground">{day.humidity}% RH</div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-sm">
                                  <Badge className={`${day.confidence >= 90 ? 'bg-green-500' : day.confidence >= 80 ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                                    {day.confidence.toFixed(0)}%
                                  </Badge>
                                </div>
                                {day.precipitation > 0 && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    {day.precipitation.toFixed(1)}mm rain
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {day.alerts.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {day.alerts.map((alert, alertIndex) => (
                                <div key={alertIndex} className="flex items-center gap-2 text-sm text-orange-600">
                                  <AlertTriangle className="w-4 h-4" />
                                  {alert}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="adjustments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      AI Recommendations
                    </CardTitle>
                    <CardDescription>
                      Intelligent adjustments based on weather forecast analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {adjustments.map((adjustment) => (
                        <div key={adjustment.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getParameterIcon(adjustment.parameter)}
                              <div>
                                <div className="font-medium capitalize">
                                  {adjustment.parameter} Adjustment
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {adjustment.currentValue} → {adjustment.targetValue}
                                  <span className={adjustment.adjustmentValue > 0 ? 'text-orange-600' : 'text-green-600'}>
                                    {adjustment.adjustmentValue > 0 ? ' (+' : ' ('}{adjustment.adjustmentValue})
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={`${getPriorityColor(adjustment.priority)} text-white`}>
                                {adjustment.priority}
                              </Badge>
                              <Badge className={`${getStatusColor(adjustment.status)} text-white`}>
                                {adjustment.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm">{adjustment.reason}</p>
                            
                            <div className="grid grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">Confidence:</span>
                                <div className="font-medium">{adjustment.confidence}%</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Savings:</span>
                                <div className="font-medium text-green-600">${adjustment.estimatedSavings}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Timeframe:</span>
                                <div className="font-medium">{adjustment.timeframe}</div>
                              </div>
                            </div>
                            
                            {adjustment.status === 'pending' && (
                              <div className="flex items-center gap-2 mt-3">
                                <Button
                                  size="sm"
                                  onClick={() => applyAdjustment(adjustment.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Play className="w-3 h-3" />
                                  Apply
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => rejectAdjustment(adjustment.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Pause className="w-3 h-3" />
                                  Reject
                                </Button>
                                {adjustment.automated && (
                                  <Badge variant="outline" className="text-xs">
                                    Auto in {Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30)} min
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Weather Trend Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Temperature Trend</h4>
                        <div className="space-y-2">
                          {forecast.slice(0, 5).map((day, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-16 text-sm">
                                Day {index + 1}
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-red-500 h-2 rounded-full"
                                  style={{ width: `${(day.temperature / 35) * 100}%` }}
                                />
                              </div>
                              <div className="w-16 text-sm font-medium">
                                {day.temperature.toFixed(1)}°C
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Humidity Trend</h4>
                        <div className="space-y-2">
                          {forecast.slice(0, 5).map((day, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-16 text-sm">
                                Day {index + 1}
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${day.humidity}%` }}
                                />
                              </div>
                              <div className="w-16 text-sm font-medium">
                                {day.humidity.toFixed(0)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Key Insights</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span>Temperature rising 2°C over next 3 days - reduce heating by 15%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-blue-600" />
                            <span>Humidity dropping significantly - increase misting frequency</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            <span>High pressure system day 4-5 - monitor for heat stress</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Models */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  AI Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiModels.map((model) => (
                    <div key={model.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{model.name}</div>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${model.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-xs">{model.active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {model.description}
                      </p>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-medium">{model.accuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last trained:</span>
                          <span>{new Date(model.lastTrained).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <Progress value={model.accuracy} className="mt-2 h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      value={settings.location}
                      onChange={(e) => setSettings({...settings, location: e.target.value})}
                      placeholder="City, State"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Forecast Days</label>
                    <Select
                      value={settings.forecastDays.toString()}
                      onValueChange={(value) => setSettings({...settings, forecastDays: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="10">10 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Update Interval</label>
                    <Select
                      value={settings.updateInterval.toString()}
                      onValueChange={(value) => setSettings({...settings, updateInterval: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Confidence Threshold</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="50"
                        max="100"
                        value={settings.confidenceThreshold}
                        onChange={(e) => setSettings({...settings, confidenceThreshold: parseInt(e.target.value)})}
                      />
                      <span className="text-sm">%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto-apply adjustments</span>
                    <Switch
                      checked={settings.enableAutomation}
                      onCheckedChange={(checked) => setSettings({...settings, enableAutomation: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historical Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>24h Forecast Accuracy:</span>
                    <span className="font-medium text-green-600">96.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energy Savings (Week):</span>
                    <span className="font-medium text-green-600">$234.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adjustments Applied:</span>
                    <span className="font-medium">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Model Updates:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alert Accuracy:</span>
                    <span className="font-medium text-green-600">91.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}