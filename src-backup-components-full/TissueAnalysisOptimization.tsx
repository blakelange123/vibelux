"use client"

import { useState } from 'react'
import { 
  Leaf,
  Beaker,
  Target,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  Upload,
  BarChart3,
  Droplets,
  Zap,
  Info,
  Settings,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  ChevronRight,
  Clock,
  Package
} from 'lucide-react'

interface NutrientLevel {
  element: string
  symbol: string
  actual: number
  optimal: { min: number; max: number }
  unit: string
  status: 'deficient' | 'low' | 'optimal' | 'high' | 'toxic'
  mobility: 'mobile' | 'immobile'
  trend: 'increasing' | 'stable' | 'decreasing'
}

interface TissueAnalysis {
  id: string
  sampleDate: string
  zone: string
  stage: string
  overallScore: number
  nutrients: NutrientLevel[]
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    action: string
    impact: string
    timeline: string
  }[]
}

interface NutrientRatio {
  name: string
  ratio: string
  actual: number
  optimal: number
  status: 'balanced' | 'imbalanced'
}

interface DeficiencySymptom {
  nutrient: string
  symptoms: string[]
  affectedArea: 'new growth' | 'old growth' | 'all leaves' | 'stems' | 'roots'
  severity: 'mild' | 'moderate' | 'severe'
  image?: string
}

export function TissueAnalysisOptimization() {
  const [activeView, setActiveView] = useState<'latest' | 'history' | 'recommendations' | 'symptoms'>('latest')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [showDeficiencies, setShowDeficiencies] = useState(true)

  // Latest tissue analysis data
  const latestAnalysis: TissueAnalysis = {
    id: 'ta-001',
    sampleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    zone: 'Flowering A',
    stage: 'Week 5 Flower',
    overallScore: 87,
    nutrients: [
      {
        element: 'Nitrogen',
        symbol: 'N',
        actual: 3.2,
        optimal: { min: 3.5, max: 4.5 },
        unit: '%',
        status: 'low',
        mobility: 'mobile',
        trend: 'decreasing'
      },
      {
        element: 'Phosphorus',
        symbol: 'P',
        actual: 0.45,
        optimal: { min: 0.3, max: 0.5 },
        unit: '%',
        status: 'optimal',
        mobility: 'mobile',
        trend: 'stable'
      },
      {
        element: 'Potassium',
        symbol: 'K',
        actual: 2.8,
        optimal: { min: 2.5, max: 3.5 },
        unit: '%',
        status: 'optimal',
        mobility: 'mobile',
        trend: 'stable'
      },
      {
        element: 'Calcium',
        symbol: 'Ca',
        actual: 0.8,
        optimal: { min: 1.0, max: 2.0 },
        unit: '%',
        status: 'low',
        mobility: 'immobile',
        trend: 'decreasing'
      },
      {
        element: 'Magnesium',
        symbol: 'Mg',
        actual: 0.35,
        optimal: { min: 0.3, max: 0.5 },
        unit: '%',
        status: 'optimal',
        mobility: 'mobile',
        trend: 'stable'
      },
      {
        element: 'Sulfur',
        symbol: 'S',
        actual: 0.25,
        optimal: { min: 0.2, max: 0.3 },
        unit: '%',
        status: 'optimal',
        mobility: 'immobile',
        trend: 'stable'
      },
      {
        element: 'Iron',
        symbol: 'Fe',
        actual: 85,
        optimal: { min: 100, max: 200 },
        unit: 'ppm',
        status: 'low',
        mobility: 'immobile',
        trend: 'decreasing'
      },
      {
        element: 'Zinc',
        symbol: 'Zn',
        actual: 35,
        optimal: { min: 30, max: 50 },
        unit: 'ppm',
        status: 'optimal',
        mobility: 'immobile',
        trend: 'stable'
      },
      {
        element: 'Boron',
        symbol: 'B',
        actual: 45,
        optimal: { min: 30, max: 60 },
        unit: 'ppm',
        status: 'optimal',
        mobility: 'immobile',
        trend: 'increasing'
      },
      {
        element: 'Copper',
        symbol: 'Cu',
        actual: 12,
        optimal: { min: 10, max: 20 },
        unit: 'ppm',
        status: 'optimal',
        mobility: 'immobile',
        trend: 'stable'
      },
      {
        element: 'Manganese',
        symbol: 'Mn',
        actual: 180,
        optimal: { min: 50, max: 150 },
        unit: 'ppm',
        status: 'high',
        mobility: 'immobile',
        trend: 'increasing'
      },
      {
        element: 'Molybdenum',
        symbol: 'Mo',
        actual: 1.2,
        optimal: { min: 1, max: 2 },
        unit: 'ppm',
        status: 'optimal',
        mobility: 'mobile',
        trend: 'stable'
      }
    ],
    recommendations: [
      {
        priority: 'high',
        action: 'Increase calcium supplementation to 2.5 ml/L Cal-Mag',
        impact: 'Prevent bud rot and improve cell wall strength',
        timeline: 'Immediate - next 3 waterings'
      },
      {
        priority: 'high',
        action: 'Reduce nitrogen in base nutrients by 20%',
        impact: 'Promote better flower development and resin production',
        timeline: 'Starting next feeding'
      },
      {
        priority: 'medium',
        action: 'Add chelated iron at 0.5 ml/L',
        impact: 'Improve chlorophyll production and prevent yellowing',
        timeline: 'Next 2 weeks'
      },
      {
        priority: 'low',
        action: 'Monitor manganese levels - may need to flush if continues rising',
        impact: 'Prevent toxicity and nutrient lockout',
        timeline: 'Check in 1 week'
      }
    ]
  }

  // Nutrient ratios
  const nutrientRatios: NutrientRatio[] = [
    {
      name: 'Ca:Mg',
      ratio: '3:1',
      actual: 2.3,
      optimal: 3.0,
      status: 'imbalanced'
    },
    {
      name: 'K:Ca',
      ratio: '2:1',
      actual: 3.5,
      optimal: 2.0,
      status: 'imbalanced'
    },
    {
      name: 'N:K',
      ratio: '1.2:1',
      actual: 1.14,
      optimal: 1.2,
      status: 'balanced'
    },
    {
      name: 'Fe:Mn',
      ratio: '1.5:1',
      actual: 0.47,
      optimal: 1.5,
      status: 'imbalanced'
    }
  ]

  // Common deficiency symptoms
  const deficiencySymptoms: DeficiencySymptom[] = [
    {
      nutrient: 'Nitrogen',
      symptoms: ['Yellowing of lower leaves', 'Slow growth', 'Pale green color overall'],
      affectedArea: 'old growth',
      severity: 'mild'
    },
    {
      nutrient: 'Calcium',
      symptoms: ['Brown spots on leaves', 'Leaf tip burn', 'Weak stems'],
      affectedArea: 'new growth',
      severity: 'moderate'
    },
    {
      nutrient: 'Iron',
      symptoms: ['Interveinal chlorosis', 'Yellow new growth with green veins'],
      affectedArea: 'new growth',
      severity: 'mild'
    }
  ]

  // Historical data for trends
  const historicalData = [
    { week: 'Week 1', N: 4.5, P: 0.5, K: 3.2, Ca: 1.8, score: 92 },
    { week: 'Week 2', N: 4.2, P: 0.48, K: 3.0, Ca: 1.5, score: 90 },
    { week: 'Week 3', N: 3.8, P: 0.46, K: 2.9, Ca: 1.2, score: 88 },
    { week: 'Week 4', N: 3.5, P: 0.45, K: 2.8, Ca: 1.0, score: 87 },
    { week: 'Week 5', N: 3.2, P: 0.45, K: 2.8, Ca: 0.8, score: 87 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'balanced':
        return 'text-green-400'
      case 'low':
      case 'deficient':
        return 'text-yellow-400'
      case 'high':
        return 'text-orange-400'
      case 'toxic':
      case 'imbalanced':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'balanced':
        return 'bg-green-500/20'
      case 'low':
      case 'deficient':
        return 'bg-yellow-500/20'
      case 'high':
        return 'bg-orange-500/20'
      case 'toxic':
      case 'imbalanced':
        return 'bg-red-500/20'
      default:
        return 'bg-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Tissue Analysis & Nutrient Optimization</h2>
            <p className="text-sm text-gray-400 mt-1">
              Laboratory-grade nutrient analysis for precision feeding
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Lab Results
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Beaker className="w-4 h-4" />
              Schedule Analysis
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {(['latest', 'history', 'recommendations', 'symptoms'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeView === view
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {view} {view === 'latest' ? 'Analysis' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Latest Analysis View */}
      {activeView === 'latest' && (
        <>
          {/* Analysis Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-400" />
                <h4 className="font-medium text-white">Overall Score</h4>
              </div>
              <p className="text-3xl font-bold text-white">{latestAnalysis.overallScore}%</p>
              <p className="text-sm text-gray-400 mt-1">{latestAnalysis.stage}</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <h4 className="font-medium text-white">Optimal Nutrients</h4>
              </div>
              <p className="text-3xl font-bold text-white">
                {latestAnalysis.nutrients.filter(n => n.status === 'optimal').length}
              </p>
              <p className="text-sm text-gray-400 mt-1">of {latestAnalysis.nutrients.length} total</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h4 className="font-medium text-white">Issues Found</h4>
              </div>
              <p className="text-3xl font-bold text-white">
                {latestAnalysis.nutrients.filter(n => n.status !== 'optimal').length}
              </p>
              <p className="text-sm text-gray-400 mt-1">Require adjustment</p>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h4 className="font-medium text-white">Sample Age</h4>
              </div>
              <p className="text-3xl font-bold text-white">2</p>
              <p className="text-sm text-gray-400 mt-1">days ago</p>
            </div>
          </div>

          {/* Nutrient Levels */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Nutrient Levels</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={showDeficiencies}
                    onChange={(e) => setShowDeficiencies(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-800 text-purple-600"
                  />
                  Show only issues
                </label>
                <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestAnalysis.nutrients
                .filter(n => !showDeficiencies || n.status !== 'optimal')
                .map((nutrient) => (
                <div key={nutrient.element} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${getStatusBg(nutrient.status)} ${getStatusColor(nutrient.status)}`}>
                        {nutrient.symbol}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{nutrient.element}</h4>
                        <p className="text-xs text-gray-400">{nutrient.mobility}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {nutrient.actual} {nutrient.unit}
                      </p>
                      <p className="text-xs text-gray-400">
                        {nutrient.optimal.min}-{nutrient.optimal.max} {nutrient.unit}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Status bar */}
                    <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="absolute inset-0 flex">
                        <div className="bg-yellow-500/30" style={{ width: '20%' }} />
                        <div className="bg-green-500/30" style={{ width: '60%' }} />
                        <div className="bg-red-500/30" style={{ width: '20%' }} />
                      </div>
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-1 h-4 ${getStatusBg(nutrient.status)} rounded-full`}
                        style={{
                          left: `${Math.min(100, Math.max(0, (nutrient.actual / (nutrient.optimal.max * 1.5)) * 100))}%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBg(nutrient.status)} ${getStatusColor(nutrient.status)}`}>
                        {nutrient.status}
                      </span>
                      <div className="flex items-center gap-1">
                        {nutrient.trend === 'increasing' && <ArrowUp className="w-3 h-3 text-orange-400" />}
                        {nutrient.trend === 'decreasing' && <ArrowDown className="w-3 h-3 text-blue-400" />}
                        {nutrient.trend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
                        <span className="text-gray-400">{nutrient.trend}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrient Ratios */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Critical Nutrient Ratios</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {nutrientRatios.map((ratio) => (
                <div key={ratio.name} className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium text-white mb-2">{ratio.name}</h4>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-white">{ratio.actual.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">/ {ratio.optimal}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBg(ratio.status)} ${getStatusColor(ratio.status)}`}>
                    {ratio.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* History View */}
      {activeView === 'history' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Nutrient Trends</h3>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Stages</option>
              <option value="veg">Vegetative</option>
              <option value="flower">Flowering</option>
            </select>
          </div>

          <div className="space-y-6">
            {/* Trend Chart Placeholder */}
            <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">Nutrient trend chart would display here</p>
                <p className="text-sm text-gray-500 mt-2">Showing N, P, K, Ca levels over time</p>
              </div>
            </div>

            {/* Historical Samples */}
            <div className="space-y-3">
              <h4 className="font-medium text-white">Previous Analyses</h4>
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Beaker className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Week {6 - idx} Analysis</h4>
                      <p className="text-sm text-gray-400">
                        {new Date(Date.now() - idx * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{92 - idx}%</p>
                    <p className="text-sm text-gray-400">Overall Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations View */}
      {activeView === 'recommendations' && (
        <div className="space-y-6">
          {/* Active Recommendations */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Nutrient Optimization Plan</h3>
            <div className="space-y-4">
              {latestAnalysis.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    rec.priority === 'high' ? 'bg-red-900/20 border-red-800' :
                    rec.priority === 'medium' ? 'bg-yellow-900/20 border-yellow-800' :
                    'bg-blue-900/20 border-blue-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {rec.priority === 'high' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                      {rec.priority === 'medium' && <Info className="w-5 h-5 text-yellow-400" />}
                      {rec.priority === 'low' && <Info className="w-5 h-5 text-blue-400" />}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <button className="p-1 hover:bg-gray-800 rounded transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <h4 className="font-medium text-white mb-1">{rec.action}</h4>
                  <p className="text-sm text-gray-300 mb-2">{rec.impact}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{rec.timeline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feeding Schedule Adjustments */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Adjusted Feeding Schedule</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 text-sm text-gray-400 px-4">
                <span>Product</span>
                <span>Current</span>
                <span>Recommended</span>
                <span>Change</span>
              </div>
              {[
                { product: 'Base A', current: '4 ml/L', recommended: '3.2 ml/L', change: '-20%' },
                { product: 'Base B', current: '4 ml/L', recommended: '3.2 ml/L', change: '-20%' },
                { product: 'Cal-Mag', current: '1 ml/L', recommended: '2.5 ml/L', change: '+150%' },
                { product: 'Iron', current: '0 ml/L', recommended: '0.5 ml/L', change: 'NEW' },
                { product: 'PK Boost', current: '2 ml/L', recommended: '2 ml/L', change: 'No change' }
              ].map((item, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg text-sm">
                  <span className="text-white font-medium">{item.product}</span>
                  <span className="text-gray-400">{item.current}</span>
                  <span className="text-white">{item.recommended}</span>
                  <span className={
                    item.change.includes('+') ? 'text-green-400' :
                    item.change.includes('-') ? 'text-red-400' :
                    item.change === 'NEW' ? 'text-purple-400' :
                    'text-gray-400'
                  }>
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Symptoms View */}
      {activeView === 'symptoms' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Visual Deficiency Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deficiencySymptoms.map((deficiency) => (
              <div key={deficiency.nutrient} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{deficiency.nutrient} Deficiency</h4>
                    <p className="text-sm text-gray-400">Affects: {deficiency.affectedArea}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    deficiency.severity === 'severe' ? 'bg-red-500/20 text-red-400' :
                    deficiency.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {deficiency.severity}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-300">Symptoms:</p>
                  <ul className="space-y-1">
                    {deficiency.symptoms.map((symptom, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-3 h-3 text-gray-500" />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className="mt-4 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Leaf className="w-4 h-4" />
                  View Visual Guide
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white mb-1">Pro Tip</h4>
                <p className="text-sm text-gray-300">
                  Always verify deficiency symptoms with tissue analysis before making major adjustments. 
                  Visual symptoms can be misleading and multiple deficiencies can present similarly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}