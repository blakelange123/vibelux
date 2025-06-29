"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Zap,
  Fuel,
  ThermometerSun,
  BarChart3,
  Settings
} from 'lucide-react'

interface CHPMarketConditions {
  gridPrice: number
  gasPrice: number
  co2Price: number
  timestamp: string
}

interface CHPDecision {
  decision: 'RUN_CHP' | 'PURCHASE_CO2' | 'MARGINAL'
  netBenefitPerHour: number
  gridRevenuePerHour: number
  co2OffsetPerHour: number
  fuelCostPerHour: number
  heatRecoveryPerHour: number
  breakevenGridPrice: number
  safetyMarginPercent: number
  nextDecisionPoint: string
  confidence: number
}

interface CHPOperations {
  isRunning: boolean
  powerOutput: number
  co2Production: number
  heatOutput: number
  efficiency: number
  hoursToday: number
  dailyRevenue: number
}

export default function CHPDecisionEngine() {
  const [marketConditions, setMarketConditions] = useState<CHPMarketConditions>({
    gridPrice: 0.42,
    gasPrice: 6.50,
    co2Price: 1.20,
    timestamp: new Date().toISOString()
  })

  const [chpDecision, setChpDecision] = useState<CHPDecision>({
    decision: 'RUN_CHP',
    netBenefitPerHour: 268.30,
    gridRevenuePerHour: 210.00,
    co2OffsetPerHour: 88.60,
    fuelCostPerHour: -48.30,
    heatRecoveryPerHour: 18.00,
    breakevenGridPrice: 0.24,
    safetyMarginPercent: 75,
    nextDecisionPoint: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    confidence: 94
  })

  const [chpOperations, setChpOperations] = useState<CHPOperations>({
    isRunning: true,
    powerOutput: 1485,
    co2Production: 850,
    heatOutput: 1200,
    efficiency: 92.3,
    hoursToday: 14.5,
    dailyRevenue: 3890
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch real-time data
    const interval = setInterval(fetchCHPData, 15000) // Every 15 seconds
    fetchCHPData()
    
    return () => clearInterval(interval)
  }, [])

  const fetchCHPData = async () => {
    try {
      setLoading(true)
      // In real implementation, these would be API calls
      const response = await fetch('/api/energy/chp/decision')
      const data = await response.json()
      setChpDecision(data.decision)
      setMarketConditions(data.marketConditions)
      setChpOperations(data.operations)
    } catch (error) {
      console.error('Failed to fetch CHP data:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeDecision = async (action: string) => {
    try {
      setLoading(true)
      await fetch('/api/energy/chp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, timestamp: new Date().toISOString() })
      })
      await fetchCHPData()
    } catch (error) {
      console.error('Failed to execute CHP decision:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDecisionBadge = () => {
    switch (chpDecision.decision) {
      case 'RUN_CHP':
        return <Badge className="bg-green-600 hover:bg-green-700">✅ Run CHP</Badge>
      case 'PURCHASE_CO2':
        return <Badge className="bg-red-600 hover:bg-red-700">❌ Purchase CO₂</Badge>
      case 'MARGINAL':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">⚠️ Marginal</Badge>
    }
  }

  const getAlertType = () => {
    if (chpDecision.safetyMarginPercent > 50) return 'success'
    if (chpDecision.safetyMarginPercent > 15) return 'warning'
    return 'danger'
  }

  return (
    <div className="space-y-6">
      {/* Header with Current Decision */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            CHP Economic Optimizer
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time CHP vs CO₂ purchase decision engine
          </p>
        </div>
        <div className="flex items-center gap-4">
          {getDecisionBadge()}
          <Badge variant="outline">
            Confidence: {chpDecision.confidence}%
          </Badge>
        </div>
      </div>

      {/* Main Decision Alert */}
      <Alert className={`border-l-4 ${
        chpDecision.decision === 'RUN_CHP' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
        chpDecision.decision === 'PURCHASE_CO2' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
        'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      }`}>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle className="text-lg font-semibold">
          Current Recommendation: {chpDecision.decision.replace('_', ' ')}
        </AlertTitle>
        <AlertDescription className="text-base">
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <span className="font-medium">Net Benefit:</span> 
              <span className={`ml-2 font-bold ${
                chpDecision.netBenefitPerHour > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${chpDecision.netBenefitPerHour.toFixed(0)}/hr
              </span>
            </div>
            <div>
              <span className="font-medium">Safety Margin:</span>
              <span className={`ml-2 font-bold ${
                chpDecision.safetyMarginPercent > 50 ? 'text-green-600' : 
                chpDecision.safetyMarginPercent > 15 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {chpDecision.safetyMarginPercent}% above breakeven
              </span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="economics">Economics</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grid Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +${chpDecision.gridRevenuePerHour}/hr
                </div>
                <p className="text-xs text-muted-foreground">
                  ${marketConditions.gridPrice}/kWh
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CO₂ Offset</CardTitle>
                <ThermometerSun className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +${chpDecision.co2OffsetPerHour}/hr
                </div>
                <p className="text-xs text-muted-foreground">
                  vs ${marketConditions.co2Price}/lb purchased
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fuel Cost</CardTitle>
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ${Math.abs(chpDecision.fuelCostPerHour)}/hr
                </div>
                <p className="text-xs text-muted-foreground">
                  ${marketConditions.gasPrice}/therm
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${chpOperations.dailyRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Running {chpOperations.hoursToday}hrs today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Market Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Market Conditions</CardTitle>
              <CardDescription>
                Current pricing and breakeven analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Grid Price:</span>
                    <span className="font-bold text-green-600">
                      ${marketConditions.gridPrice}/kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Breakeven Price:</span>
                    <span className="font-bold text-yellow-600">
                      ${chpDecision.breakevenGridPrice}/kWh
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (marketConditions.gridPrice / (chpDecision.breakevenGridPrice * 2)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Natural Gas:</span>
                    <span className="font-bold">${marketConditions.gasPrice}/therm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CO₂ Purchase:</span>
                    <span className="font-bold">${marketConditions.co2Price}/lb</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CHP CO₂ Cost:</span>
                    <span className="font-bold text-green-600">$0.30/lb</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Next Decision:</span>
                    <span className="font-bold">
                      {new Date(chpDecision.nextDecisionPoint).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence Level:</span>
                    <span className="font-bold text-blue-600">
                      {chpDecision.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Economic Breakdown</CardTitle>
              <CardDescription>
                Detailed cost-benefit analysis for current conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Grid Revenue', value: chpDecision.gridRevenuePerHour, color: 'text-green-600' },
                  { label: 'CO₂ Offset Value', value: chpDecision.co2OffsetPerHour, color: 'text-green-600' },
                  { label: 'Heat Recovery', value: chpDecision.heatRecoveryPerHour, color: 'text-green-600' },
                  { label: 'Fuel Cost', value: chpDecision.fuelCostPerHour, color: 'text-red-600' },
                  { label: 'O&M + Depreciation', value: -30, color: 'text-red-600' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <span>{item.label}</span>
                    <span className={`font-bold ${item.color}`}>
                      {item.value > 0 ? '+' : ''}${item.value}/hr
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 border-t-2 text-lg font-bold">
                  <span>Net Benefit</span>
                  <span className="text-green-600">
                    +${chpDecision.netBenefitPerHour}/hr
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Operations</CardTitle>
                <CardDescription>Real-time CHP performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className={chpOperations.isRunning ? 'bg-green-600' : 'bg-red-600'}>
                    {chpOperations.isRunning ? 'Running' : 'Stopped'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Power Output:</span>
                  <span className="font-bold">{chpOperations.powerOutput}kW</span>
                </div>
                <div className="flex justify-between">
                  <span>CO₂ Production:</span>
                  <span className="font-bold">{chpOperations.co2Production} CFH</span>
                </div>
                <div className="flex justify-between">
                  <span>Heat Output:</span>
                  <span className="font-bold">{chpOperations.heatOutput}kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span className="font-bold">{chpOperations.efficiency}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Control Actions</CardTitle>
                <CardDescription>Execute operational decisions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => executeDecision('START_CHP')}
                  disabled={loading || chpOperations.isRunning}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Start CHP
                </Button>
                <Button 
                  onClick={() => executeDecision('STOP_CHP')}
                  disabled={loading || !chpOperations.isRunning}
                  variant="destructive"
                  className="w-full"
                >
                  Stop CHP
                </Button>
                <Button 
                  onClick={() => executeDecision('OPTIMIZE_SCHEDULE')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Optimize Schedule
                </Button>
                <Button 
                  onClick={fetchCHPData}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Forecast</CardTitle>
              <CardDescription>
                Predicted optimal CHP operation schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Forecasting module coming soon</p>
                <p className="text-sm">Will show optimal start/stop times based on price forecasts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Action Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Last updated: {new Date(marketConditions.timestamp).toLocaleTimeString()}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure Thresholds
          </Button>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>
    </div>
  )
}