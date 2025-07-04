'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  CorrelationEngine,
  type CorrelationResult,
  type RegressionResult,
  type CultivationCorrelation,
  type DataPoint
} from '@/lib/statistics/correlation-engine'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Download,
  Filter,
  Info,
  AlertCircle,
  ChevronRight,
  DollarSign,
  Leaf,
  Zap,
  Target,
  Lightbulb,
  Droplets,
  Thermometer,
  Wind
} from 'lucide-react'
import { Line, Scatter as ScatterChart } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  data?: DataPoint[]
  onInsightGenerated?: (insight: string) => void
}

export function StatisticalAnalysisDashboard({ data, onInsightGenerated }: Props) {
  const [engine] = useState(() => new CorrelationEngine())
  const [selectedVariables, setSelectedVariables] = useState<string[]>(['dli', 'yield'])
  const [correlations, setCorrelations] = useState<CorrelationResult[]>([])
  const [cultivationAnalysis, setCultivationAnalysis] = useState<CultivationCorrelation[]>([])
  const [currentRegression, setCurrentRegression] = useState<RegressionResult | null>(null)
  const [minCorrelation, setMinCorrelation] = useState(0.3)
  const [showOnlySignificant, setShowOnlySignificant] = useState(true)
  
  // Generate sample data if none provided
  useEffect(() => {
    const sampleData = data || generateSampleData()
    engine.loadData(sampleData)
    
    // Find all correlations
    const allCorrelations = (engine as any).findAllCorrelations(minCorrelation, showOnlySignificant ? 0.05 : 1)
    setCorrelations(allCorrelations)
    
    // Analyze cultivation-specific relationships
    const cultAnalysis = (engine as any).analyzeCultivationCorrelations()
    setCultivationAnalysis(cultAnalysis)
    
    // Generate initial regression
    if (selectedVariables.length >= 2) {
      const regression = (engine as any).linearRegression(selectedVariables[0], selectedVariables[1])
      setCurrentRegression(regression)
    }
  }, [data, minCorrelation, showOnlySignificant])
  
  // Variable selection handler
  const handleVariableSelect = (varName: string, index: number) => {
    const newVars = [...selectedVariables]
    newVars[index] = varName
    setSelectedVariables(newVars)
    
    if (newVars.length >= 2) {
      const regression = (engine as any).linearRegression(newVars[0], newVars[1])
      setCurrentRegression(regression)
    }
  }
  
  // Get correlation strength color
  const getCorrelationColor = (coefficient: number) => {
    const abs = Math.abs(coefficient)
    if (abs > 0.7) return coefficient > 0 ? 'text-green-500' : 'text-red-500'
    if (abs > 0.5) return coefficient > 0 ? 'text-green-400' : 'text-red-400'
    if (abs > 0.3) return coefficient > 0 ? 'text-yellow-400' : 'text-orange-400'
    return 'text-gray-400'
  }
  
  // Get variable icon
  const getVariableIcon = (varName: string) => {
    const icons: Record<string, any> = {
      temperature: Thermometer,
      humidity: Droplets,
      vpd: Wind,
      dli: Lightbulb,
      ppfd: Zap,
      yield: Leaf,
      energy_usage: DollarSign
    }
    const Icon = icons[varName] || Activity
    return <Icon className="w-4 h-4" />
  }
  
  // Generate scatter plot data
  const scatterData = useMemo(() => {
    if (!currentRegression || !currentRegression.predictions) return null
    
    return {
      datasets: [
        {
          label: 'Actual Data',
          data: currentRegression.predictions.map(p => ({ x: p.x, y: p.y })),
          backgroundColor: 'rgba(139, 92, 246, 0.5)',
          pointRadius: 6
        },
        {
          label: 'Regression Line',
          data: currentRegression.predictions.map(p => ({ x: p.x, y: p.yPredicted })),
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgba(34, 197, 94, 1)',
          showLine: true,
          pointRadius: 0
        }
      ]
    }
  }, [currentRegression])
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Statistical Analysis & Correlations</h2>
              <p className="text-gray-400 mt-1">
                Discover hidden relationships in your cultivation data
              </p>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Analysis
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <label className="text-sm text-gray-300">Min Correlation:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={minCorrelation}
              onChange={(e) => setMinCorrelation(parseFloat(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-white">{minCorrelation.toFixed(1)}</span>
          </div>
          
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showOnlySignificant}
              onChange={(e) => setShowOnlySignificant(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-purple-600"
            />
            Only show significant (p &lt; 0.05)
          </label>
        </div>
      </div>
      
      {/* Key Insights */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Key Cultivation Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cultivationAnalysis.slice(0, 4).map((analysis, idx) => (
            <div key={idx} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getVariableIcon(analysis.primaryFactor)}
                  <span className="text-sm font-medium text-gray-300">
                    {analysis.primaryFactor} → {analysis.outcome}
                  </span>
                </div>
                <span className={`text-lg font-bold ${getCorrelationColor(analysis.correlation.coefficient)}`}>
                  r = {analysis.correlation.coefficient.toFixed(3)}
                </span>
              </div>
              
              {analysis.insights.map((insight, i) => (
                <p key={i} className="text-sm text-gray-400 mb-1">• {insight}</p>
              ))}
              
              {analysis.economicImpact && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-500">Potential Impact:</p>
                  <div className="flex items-center gap-4 mt-1">
                    {analysis.economicImpact.yieldIncrease > 0 && (
                      <span className="text-xs text-green-400">
                        +{analysis.economicImpact.yieldIncrease.toFixed(1)}% yield
                      </span>
                    )}
                    {analysis.economicImpact.potentialSavings > 0 && (
                      <span className="text-xs text-blue-400">
                        ${analysis.economicImpact.potentialSavings.toLocaleString()} savings
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regression Analysis */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Regression Analysis</h3>
          
          {/* Variable Selection */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Independent Variable (X)</label>
              <select
                value={selectedVariables[0]}
                onChange={(e) => handleVariableSelect(e.target.value, 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="dli">DLI</option>
                <option value="ppfd">PPFD</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="vpd">VPD</option>
                <option value="co2">CO2</option>
                <option value="photoperiod">Photoperiod</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Dependent Variable (Y)</label>
              <select
                value={selectedVariables[1]}
                onChange={(e) => handleVariableSelect(e.target.value, 1)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="yield">Yield</option>
                <option value="thc">THC %</option>
                <option value="terpenes">Terpenes %</option>
                <option value="energy_usage">Energy Usage</option>
              </select>
            </div>
          </div>
          
          {/* Regression Results */}
          {currentRegression && (
            <div className="space-y-3">
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Regression Equation</p>
                <p className="font-mono text-white">{currentRegression.equation}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">R² Value</p>
                  <p className="text-xl font-bold text-white">
                    {(currentRegression.rSquared * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">P-Value</p>
                  <p className="text-xl font-bold text-white">
                    {currentRegression.pValue.toFixed(4)}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Interpretation</p>
                <p className="text-sm text-gray-300">
                  {currentRegression.rSquared > 0.7 
                    ? 'Strong predictive relationship - highly reliable for forecasting'
                    : currentRegression.rSquared > 0.5
                    ? 'Moderate relationship - useful for general predictions'
                    : currentRegression.rSquared > 0.3
                    ? 'Weak relationship - limited predictive power'
                    : 'Very weak relationship - not recommended for predictions'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Scatter Plot */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Scatter Plot & Regression Line</h3>
          
          {scatterData ? (
            <div className="h-80">
              <ScatterChart
                data={scatterData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: { color: 'white' }
                    }
                  },
                  scales: {
                    x: {
                      grid: { color: 'rgba(255, 255, 255, 0.1)' },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    },
                    y: {
                      grid: { color: 'rgba(255, 255, 255, 0.1)' },
                      ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Select variables to view scatter plot
            </div>
          )}
        </div>
      </div>
      
      {/* Correlation Matrix */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">All Significant Correlations</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-sm font-medium text-gray-400">Variable 1</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Variable 2</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Correlation (r)</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Strength</th>
                <th className="pb-3 text-sm font-medium text-gray-400">P-Value</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Sample Size</th>
              </tr>
            </thead>
            <tbody>
              {correlations.map((corr, idx) => (
                <tr key={idx} className="border-b border-gray-700/50">
                  <td className="py-3 text-sm text-gray-300 flex items-center gap-2">
                    {getVariableIcon(corr.variable1)}
                    {corr.variable1}
                  </td>
                  <td className="py-3 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      {getVariableIcon(corr.variable2)}
                      {corr.variable2}
                    </div>
                  </td>
                  <td className={`py-3 text-sm font-mono font-bold ${getCorrelationColor(corr.coefficient)}`}>
                    {corr.coefficient.toFixed(3)}
                  </td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      corr.strength === 'very_strong' ? 'bg-green-600/20 text-green-400' :
                      corr.strength === 'strong' ? 'bg-blue-600/20 text-blue-400' :
                      corr.strength === 'moderate' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {corr.strength.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-300">
                    {corr.pValue < 0.001 ? '<0.001' : corr.pValue.toFixed(3)}
                  </td>
                  <td className="py-3 text-sm text-gray-300">{corr.sampleSize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {correlations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No significant correlations found with current filters
          </div>
        )}
      </div>
    </div>
  )
}

// Generate sample data for demonstration
function generateSampleData(): DataPoint[] {
  const data: DataPoint[] = []
  const days = 90
  
  for (let i = 0; i < days; i++) {
    const dli = 25 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 // 25-45 mol/m²/day
    const vpd = 0.8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.6 // 0.8-1.4 kPa
    const temperature = 22 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 6 // 22-28°C
    const humidity = 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 // 50-70%
    const co2 = 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400 // 800-1200 ppm
    
    // Yield correlates with DLI and VPD
    const yieldValue = 400 + (dli - 25) * 8 + (1.2 - Math.abs(vpd - 1.2)) * 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50
    
    // THC correlates with temperature and stress
    const thc = 18 + (temperature - 22) * 0.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4
    
    // Energy usage inversely correlates with efficiency
    const energy_usage = 5 - (dli / 45) * 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.5
    
    data.push({
      timestamp: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
      variables: {
        dli,
        ppfd: dli * 1000 / 16, // Approximate PPFD from DLI
        vpd,
        temperature,
        humidity,
        co2,
        photoperiod: 18, // Fixed for veg
        yield: yieldValue,
        thc,
        terpenes: 2 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1.5,
        energy_usage
      }
    })
  }
  
  return data
}