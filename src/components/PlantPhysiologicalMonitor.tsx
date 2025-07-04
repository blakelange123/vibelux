'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Target, 
  Leaf, 
  Apple,
  Thermometer,
  Droplets,
  Calendar,
  Info,
  AlertTriangle,
  Download,
  FileText
} from 'lucide-react';
import { 
  PlantPhysiologicalMonitor,
  PlantPhysiologyData,
  VeGeBalanceResult,
  ExhaustionAnalysis,
  FruitSetData
} from '@/lib/plant-physiological-monitor';

export default function PlantPhysiologicalMonitorComponent() {
  const [plantData, setPlantData] = useState<PlantPhysiologyData>({
    headWidth: 7.5,
    stemDiameter: 22,
    leafAngle: 20,
    leafColor: 'dark-green',
    internodeLength: 25,
    trussAngle: 60,
    fruitSet: [
      { trussNumber: 1, flowersPerTruss: 8, fruitsSet: 7, setPercentage: 87.5, fruitQuality: 'excellent', pollinationSuccess: true },
      { trussNumber: 2, flowersPerTruss: 9, fruitsSet: 8, setPercentage: 88.9, fruitQuality: 'good', pollinationSuccess: true },
      { trussNumber: 3, flowersPerTruss: 8, fruitsSet: 6, setPercentage: 75.0, fruitQuality: 'fair', pollinationSuccess: false },
      { trussNumber: 4, flowersPerTruss: 9, fruitsSet: 8, setPercentage: 88.9, fruitQuality: 'good', pollinationSuccess: true },
      { trussNumber: 5, flowersPerTruss: 8, fruitsSet: 5, setPercentage: 62.5, fruitQuality: 'poor', pollinationSuccess: false }
    ],
    transpirationRate: 2.8
  });

  const [season, setSeason] = useState<'winter' | 'summer'>('summer');
  const [results, setResults] = useState<{
    vegeBalance: VeGeBalanceResult;
    exhaustionAnalysis: ExhaustionAnalysis;
    pollinationAssessment: any;
    healthReport: any;
  } | null>(null);

  useEffect(() => {
    // Calculate VeGe balance
    const vegeBalance = PlantPhysiologicalMonitor.calculateVeGeBalance(plantData);
    
    // Analyze exhaustion
    const exhaustionAnalysis = PlantPhysiologicalMonitor.analyzeExhaustion(plantData.fruitSet);
    
    // Assess pollination
    const pollinationAssessment = PlantPhysiologicalMonitor.assessPollinationSuccess(plantData.fruitSet);
    
    // Generate comprehensive health report
    const healthReport = PlantPhysiologicalMonitor.generatePlantHealthReport(plantData, plantData.fruitSet);

    setResults({
      vegeBalance,
      exhaustionAnalysis,
      pollinationAssessment,
      healthReport
    });
  }, [plantData]);

  const handleInputChange = (field: keyof PlantPhysiologyData, value: string | number) => {
    setPlantData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value : Number(value)
    }));
  };

  const addTrussData = () => {
    const newTrussNumber = plantData.fruitSet.length + 1;
    setPlantData(prev => ({
      ...prev,
      fruitSet: [...prev.fruitSet, {
        trussNumber: newTrussNumber,
        flowersPerTruss: 8,
        fruitsSet: 7,
        setPercentage: 87.5,
        fruitQuality: 'good',
        pollinationSuccess: true
      }]
    }));
  };

  const updateTrussData = (index: number, field: keyof FruitSetData, value: any) => {
    setPlantData(prev => ({
      ...prev,
      fruitSet: prev.fruitSet.map((truss, i) => 
        i === index 
          ? { 
              ...truss, 
              [field]: value,
              setPercentage: field === 'fruitsSet' || field === 'flowersPerTruss' 
                ? (field === 'fruitsSet' ? value / truss.flowersPerTruss : truss.fruitsSet / value) * 100
                : truss.setPercentage
            }
          : truss
      )
    }));
  };

  const getBalanceColor = (balance: string) => {
    switch (balance) {
      case 'balanced': return 'text-green-400';
      case 'vegetative': return 'text-blue-400';
      case 'generative': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getExhaustionColor = (level: string) => {
    switch (level) {
      case 'none': return 'text-green-400';
      case 'mild': return 'text-yellow-400';
      case 'moderate': return 'text-orange-400';
      case 'severe': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const fruitSizeTarget = season === 'winter' 
    ? PlantPhysiologicalMonitor.FRUIT_SIZE_TARGETS.winter 
    : PlantPhysiologicalMonitor.FRUIT_SIZE_TARGETS.summer;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 rounded-xl p-6 border border-green-600/30">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-green-400">🍅 Tomato Plant Physiological Monitor</h1>
            <p className="text-green-300">Advanced VeGe balance analysis and exhaustion detection based on Advanced Dutch Research</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-green-300">Head Width Target: 6-9.5mm</span>
          </div>
          <div className="flex items-center gap-2">
            <Apple className="w-4 h-4 text-green-400" />
            <span className="text-green-300">Fruit Size Target: &gt;{fruitSizeTarget.min}g ({season})</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value as 'winter' | 'summer')}
              className="bg-green-900/50 border border-green-600 rounded px-2 py-1 text-green-300 text-sm"
            >
              <option value="winter">Winter</option>
              <option value="summer">Summer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="xl:col-span-1 space-y-6">
          {/* Plant Measurements */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                Plant Measurements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-gray-300">Head Width (mm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={plantData.headWidth}
                    onChange={(e) => handleInputChange('headWidth', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <span className="text-xs text-gray-400">Target: 6-9.5mm</span>
                </div>
                
                <div>
                  <Label className="text-gray-300">Stem Diameter (mm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={plantData.stemDiameter}
                    onChange={(e) => handleInputChange('stemDiameter', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">Leaf Angle (°)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={plantData.leafAngle}
                    onChange={(e) => handleInputChange('leafAngle', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">Internode Length (cm)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={plantData.internodeLength}
                    onChange={(e) => handleInputChange('internodeLength', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <span className="text-xs text-gray-400">Optimal: 25cm</span>
                </div>
                
                <div>
                  <Label className="text-gray-300">Truss Angle (°)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={plantData.trussAngle}
                    onChange={(e) => handleInputChange('trussAngle', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <span className="text-xs text-gray-400">Healthy: 45-75°</span>
                </div>
                
                <div>
                  <Label className="text-gray-300">Transpiration (g/m²/h)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={plantData.transpirationRate}
                    onChange={(e) => handleInputChange('transpirationRate', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-gray-300">Leaf Color</Label>
                <select
                  value={plantData.leafColor}
                  onChange={(e) => handleInputChange('leafColor', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="dark-green">Dark Green</option>
                  <option value="light-green">Light Green</option>
                  <option value="yellow-green">Yellow Green</option>
                  <option value="purple-tinge">Purple Tinge</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Fruit Set Data */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5" />
                  Fruit Set Data
                </div>
                <Button
                  onClick={addTrussData}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Add Truss
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {plantData.fruitSet.map((truss, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Truss {truss.trussNumber}</span>
                      <span className={`text-sm font-medium ${
                        truss.setPercentage >= 85 ? 'text-green-400' : 
                        truss.setPercentage >= 70 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {truss.setPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-gray-400">Flowers</label>
                        <input
                          type="number"
                          value={truss.flowersPerTruss}
                          onChange={(e) => updateTrussData(index, 'flowersPerTruss', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400">Fruits Set</label>
                        <input
                          type="number"
                          value={truss.fruitsSet}
                          onChange={(e) => updateTrussData(index, 'fruitsSet', Number(e.target.value))}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400">Quality</label>
                        <select
                          value={truss.fruitQuality}
                          onChange={(e) => updateTrussData(index, 'fruitQuality', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                        >
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                          <option value="deformed">Deformed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-2 space-y-6">
          {results && (
            <>
              {/* VeGe Balance Results */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    VeGe Balance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className={`text-3xl font-bold ${getBalanceColor(results.vegeBalance.balance)}`}>
                        {results.vegeBalance.balance.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">Plant Balance</div>
                      <div className="text-lg text-white mt-2">Score: {results.vegeBalance.score}</div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-white">Climate Adjustments</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Temperature</span>
                          <span className="text-white">
                            {results.vegeBalance.climateAdjustments.temperatureAdjustment > 0 ? '+' : ''}
                            {results.vegeBalance.climateAdjustments.temperatureAdjustment}°C
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Humidity</span>
                          <span className="text-white">
                            {results.vegeBalance.climateAdjustments.humidityAdjustment > 0 ? '+' : ''}
                            {results.vegeBalance.climateAdjustments.humidityAdjustment}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Light</span>
                          <span className="text-white">
                            {results.vegeBalance.climateAdjustments.lightAdjustment > 0 ? '+' : ''}
                            {results.vegeBalance.climateAdjustments.lightAdjustment}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Irrigation</span>
                          <span className="text-white">
                            {results.vegeBalance.climateAdjustments.irrigationAdjustment > 0 ? '+' : ''}
                            {results.vegeBalance.climateAdjustments.irrigationAdjustment}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-white">Risk Factors</h4>
                      <div className="space-y-1">
                        {results.vegeBalance.riskFactors.slice(0, 4).map((factor, idx) => (
                          <div key={idx} className="text-sm text-yellow-300 flex items-start gap-1">
                            <span className="text-yellow-400 mt-0.5">•</span>
                            {factor}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {results.vegeBalance.recommendations.length > 0 && (
                    <Alert className="border-blue-600/30 bg-blue-900/30">
                      <Info className="h-4 w-4 text-blue-400" />
                      <AlertDescription>
                        <div className="font-medium text-blue-400 mb-2">Recommendations:</div>
                        <ul className="space-y-1">
                          {results.vegeBalance.recommendations.slice(0, 3).map((rec, idx) => (
                            <li key={idx} className="text-blue-300 text-sm flex items-start gap-1">
                              <span className="text-blue-400 mt-0.5">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Exhaustion Analysis */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Exhaustion Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                        <span className="text-gray-300">Exhaustion Level</span>
                        <span className={`font-bold text-lg ${getExhaustionColor(results.exhaustionAnalysis.exhaustionLevel)}`}>
                          {results.exhaustionAnalysis.exhaustionLevel.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                        <span className="text-gray-300">Recovery Time</span>
                        <span className="text-white font-medium">
                          {results.exhaustionAnalysis.recoveryTimeEstimate} days
                        </span>
                      </div>
                      
                      {results.exhaustionAnalysis.affectedTrusses.length > 0 && (
                        <div className="p-4 bg-gray-700 rounded-lg">
                          <span className="text-gray-300 block mb-2">Affected Trusses</span>
                          <div className="flex flex-wrap gap-2">
                            {results.exhaustionAnalysis.affectedTrusses.map(truss => (
                              <span key={truss} className="px-2 py-1 bg-red-600 text-white text-sm rounded">
                                Truss {truss}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-white">Recovery Actions</h4>
                      {results.exhaustionAnalysis.recommendations.map((rec, idx) => (
                        <div key={idx} className={`p-3 rounded-lg text-sm ${
                          rec.includes('URGENT') ? 'bg-red-900/30 border border-red-600/30 text-red-300' :
                          'bg-yellow-900/30 border border-yellow-600/30 text-yellow-300'
                        }`}>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fruit Set Chart */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Apple className="w-5 h-5" />
                    Fruit Set Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={plantData.fruitSet}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="trussNumber" 
                          stroke="#9CA3AF"
                          tick={{ fill: '#9CA3AF' }}
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          tick={{ fill: '#9CA3AF' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar 
                          dataKey="setPercentage" 
                          fill="#10B981"
                          name="Set Percentage (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className="text-lg font-bold text-green-400">
                        {results.pollinationAssessment.avgSetPercentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">Average Set</div>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className={`text-lg font-bold ${
                        results.pollinationAssessment.pollinationSuccess ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {results.pollinationAssessment.pollinationSuccess ? 'SUCCESS' : 'ISSUES'}
                      </div>
                      <div className="text-sm text-gray-400">Pollination</div>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <div className="text-lg font-bold text-white">
                        {plantData.fruitSet.length}
                      </div>
                      <div className="text-sm text-gray-400">Total Trusses</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Health Score */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Overall Plant Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${
                          results.healthReport.overallHealth.score >= 90 ? 'text-green-400' :
                          results.healthReport.overallHealth.score >= 75 ? 'text-yellow-400' :
                          results.healthReport.overallHealth.score >= 60 ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          {results.healthReport.overallHealth.score}
                        </div>
                        <div className="text-gray-400 text-sm">Health Score</div>
                        <div className={`text-lg font-medium ${
                          results.healthReport.overallHealth.status === 'Excellent' ? 'text-green-400' :
                          results.healthReport.overallHealth.status === 'Good' ? 'text-yellow-400' :
                          results.healthReport.overallHealth.status === 'Fair' ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          {results.healthReport.overallHealth.status}
                        </div>
                      </div>
                      
                      <Progress 
                        value={results.healthReport.overallHealth.score} 
                        className="w-full h-3"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-white">Priority Actions</h4>
                      {results.healthReport.priorityActions.map((action, idx) => (
                        <div key={idx} className={`p-3 rounded-lg text-sm ${
                          action.includes('URGENT') ? 'bg-red-900/30 border border-red-600/30 text-red-300' :
                          action.includes('HIGH') ? 'bg-orange-900/30 border border-orange-600/30 text-orange-300' :
                          action.includes('MEDIUM') ? 'bg-yellow-900/30 border border-yellow-600/30 text-yellow-300' :
                          'bg-green-900/30 border border-green-600/30 text-green-300'
                        }`}>
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {results.healthReport.overallHealth.concerns.length > 0 && (
                    <Alert className="mt-4 border-orange-600/30 bg-orange-900/30">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      <AlertDescription>
                        <div className="font-medium text-orange-400 mb-2">Health Concerns:</div>
                        <ul className="space-y-1">
                          {results.healthReport.overallHealth.concerns.map((concern, idx) => (
                            <li key={idx} className="text-orange-300 text-sm flex items-start gap-1">
                              <span className="text-orange-400 mt-0.5">•</span>
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}