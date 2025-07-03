"use client"
import { useState, useEffect } from 'react'
import {
  Beaker,
  Calculator,
  Droplets,
  AlertCircle,
  Info,
  Plus,
  Minus,
  Save,
  Download,
  TrendingUp,
  Leaf,
  Activity,
  Calendar,
  Clock,
  Target,
  FlaskRound,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface NutrientElement {
  symbol: string
  name: string
  atomicWeight: number
  valence: number
}

interface Fertilizer {
  id: string
  name: string
  formula: string
  analysis: {
    N: number
    P: number // as P2O5
    K: number // as K2O
    Ca?: number
    Mg?: number
    S?: number
    Fe?: number
    Mn?: number
    B?: number
    Zn?: number
    Cu?: number
    Mo?: number
  }
  solubility: number // g/L at 20°C
  cost: number // $/kg
}

interface NutrientRecipe {
  id: string
  name: string
  cropType: string
  growthStage: string
  targetEC: number
  targetPH: number
  elements: {
    N: number
    P: number
    K: number
    Ca: number
    Mg: number
    S: number
    Fe: number
    Mn: number
    B: number
    Zn: number
    Cu: number
    Mo: number
  }
}

interface DosingSchedule {
  id: string
  recipeName: string
  startDate: Date
  endDate: Date
  frequency: 'daily' | 'weekly' | 'custom'
  customDays?: number[]
  volumePerApplication: number
  notes: string
}

export function NutrientDosingCalculator() {
  const [tankVolume, setTankVolume] = useState(1000) // liters
  const [concentrationFactor, setConcentrationFactor] = useState(100) // 1:100
  const [waterAnalysis, setWaterAnalysis] = useState({
    Ca: 0,
    Mg: 0,
    S: 0,
    HCO3: 0,
    Na: 0,
    Cl: 0,
    EC: 0,
    pH: 7
  })
  
  const [selectedRecipe, setSelectedRecipe] = useState<NutrientRecipe | null>(null)
  const [selectedFertilizers, setSelectedFertilizers] = useState<string[]>([])
  const [calculationResults, setCalculationResults] = useState<any>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [schedules, setSchedules] = useState<DosingSchedule[]>([])

  // Common fertilizer database
  const fertilizers: Fertilizer[] = [
    {
      id: 'can',
      name: 'Calcium Nitrate',
      formula: 'Ca(NO3)2·4H2O',
      analysis: { N: 15.5, P: 0, K: 0, Ca: 19 },
      solubility: 1212,
      cost: 0.45
    },
    {
      id: 'mkp',
      name: 'Monopotassium Phosphate',
      formula: 'KH2PO4',
      analysis: { N: 0, P: 52, K: 34 },
      solubility: 230,
      cost: 1.20
    },
    {
      id: 'map',
      name: 'Monoammonium Phosphate',
      formula: 'NH4H2PO4',
      analysis: { N: 12, P: 61, K: 0 },
      solubility: 400,
      cost: 0.85
    },
    {
      id: 'ksul',
      name: 'Potassium Sulfate',
      formula: 'K2SO4',
      analysis: { N: 0, P: 0, K: 50, S: 18 },
      solubility: 120,
      cost: 0.65
    },
    {
      id: 'mgso4',
      name: 'Magnesium Sulfate (Epsom)',
      formula: 'MgSO4·7H2O',
      analysis: { N: 0, P: 0, K: 0, Mg: 10, S: 13 },
      solubility: 710,
      cost: 0.35
    },
    {
      id: 'kno3',
      name: 'Potassium Nitrate',
      formula: 'KNO3',
      analysis: { N: 13, P: 0, K: 44 },
      solubility: 316,
      cost: 0.95
    },
    {
      id: 'feso4',
      name: 'Iron Sulfate',
      formula: 'FeSO4·7H2O',
      analysis: { N: 0, P: 0, K: 0, Fe: 20, S: 12 },
      solubility: 256,
      cost: 0.55
    },
    {
      id: 'mnso4',
      name: 'Manganese Sulfate',
      formula: 'MnSO4·H2O',
      analysis: { N: 0, P: 0, K: 0, Mn: 32.5 },
      solubility: 762,
      cost: 1.85
    },
    {
      id: 'boric',
      name: 'Boric Acid',
      formula: 'H3BO3',
      analysis: { N: 0, P: 0, K: 0, B: 17.5 },
      solubility: 47,
      cost: 2.50
    },
    {
      id: 'znso4',
      name: 'Zinc Sulfate',
      formula: 'ZnSO4·7H2O',
      analysis: { N: 0, P: 0, K: 0, Zn: 22.7, S: 11 },
      solubility: 965,
      cost: 1.65
    },
    {
      id: 'cuso4',
      name: 'Copper Sulfate',
      formula: 'CuSO4·5H2O',
      analysis: { N: 0, P: 0, K: 0, Cu: 25.5, S: 12.8 },
      solubility: 317,
      cost: 3.20
    },
    {
      id: 'namoly',
      name: 'Sodium Molybdate',
      formula: 'Na2MoO4·2H2O',
      analysis: { N: 0, P: 0, K: 0, Mo: 39.7 },
      solubility: 840,
      cost: 45.00
    }
  ]

  // Pre-made recipes for different crops
  const recipes: NutrientRecipe[] = [
    {
      id: 'lettuce-veg',
      name: 'Lettuce - Vegetative',
      cropType: 'Lettuce',
      growthStage: 'Vegetative',
      targetEC: 1.8,
      targetPH: 5.8,
      elements: {
        N: 150, P: 50, K: 210, Ca: 190, Mg: 48, S: 64,
        Fe: 3, Mn: 0.5, B: 0.3, Zn: 0.05, Cu: 0.05, Mo: 0.05
      }
    },
    {
      id: 'tomato-flower',
      name: 'Tomato - Flowering',
      cropType: 'Tomato',
      growthStage: 'Flowering',
      targetEC: 2.5,
      targetPH: 6.0,
      elements: {
        N: 190, P: 70, K: 310, Ca: 200, Mg: 60, S: 80,
        Fe: 3.5, Mn: 0.8, B: 0.5, Zn: 0.25, Cu: 0.07, Mo: 0.05
      }
    },
    {
      id: 'cucumber-fruit',
      name: 'Cucumber - Fruiting',
      cropType: 'Cucumber',
      growthStage: 'Fruiting',
      targetEC: 2.2,
      targetPH: 5.8,
      elements: {
        N: 200, P: 60, K: 280, Ca: 180, Mg: 50, S: 70,
        Fe: 3, Mn: 0.6, B: 0.4, Zn: 0.15, Cu: 0.06, Mo: 0.04
      }
    },
    {
      id: 'strawberry-veg',
      name: 'Strawberry - Vegetative',
      cropType: 'Strawberry',
      growthStage: 'Vegetative',
      targetEC: 1.5,
      targetPH: 6.0,
      elements: {
        N: 120, P: 40, K: 180, Ca: 150, Mg: 40, S: 50,
        Fe: 2.5, Mn: 0.4, B: 0.25, Zn: 0.08, Cu: 0.04, Mo: 0.03
      }
    },
    {
      id: 'herb-general',
      name: 'Herbs - General',
      cropType: 'Herbs',
      growthStage: 'All stages',
      targetEC: 1.6,
      targetPH: 5.8,
      elements: {
        N: 140, P: 45, K: 200, Ca: 160, Mg: 45, S: 60,
        Fe: 2.8, Mn: 0.5, B: 0.3, Zn: 0.1, Cu: 0.05, Mo: 0.04
      }
    }
  ]

  const calculateFertilizerAmounts = () => {
    if (!selectedRecipe || selectedFertilizers.length === 0) return

    // Simple linear programming solver for fertilizer optimization
    // This is a simplified version - in production, use a proper LP solver
    const stockVolume = tankVolume / concentrationFactor
    const targetPPM = selectedRecipe.elements
    
    // Adjust for water content
    const adjustedTargets = {
      N: targetPPM.N,
      P: targetPPM.P,
      K: targetPPM.K,
      Ca: Math.max(0, targetPPM.Ca - waterAnalysis.Ca),
      Mg: Math.max(0, targetPPM.Mg - waterAnalysis.Mg),
      S: Math.max(0, targetPPM.S - waterAnalysis.S),
      Fe: targetPPM.Fe,
      Mn: targetPPM.Mn,
      B: targetPPM.B,
      Zn: targetPPM.Zn,
      Cu: targetPPM.Cu,
      Mo: targetPPM.Mo
    }

    // Calculate required amounts for each fertilizer
    const results: any = {
      fertilizers: [],
      totalCost: 0,
      finalPPM: { ...adjustedTargets },
      warnings: []
    }

    // This is a simplified calculation - real implementation would use matrix solving
    selectedFertilizers.forEach(fertId => {
      const fert = fertilizers.find(f => f.id === fertId)
      if (!fert) return

      // Calculate amount needed based on primary nutrient
      let amount = 0
      if (fert.analysis.N > 0 && adjustedTargets.N > 0) {
        amount = (adjustedTargets.N * stockVolume) / (fert.analysis.N * 10)
      } else if (fert.analysis.P > 0 && adjustedTargets.P > 0) {
        amount = (adjustedTargets.P * stockVolume) / (fert.analysis.P * 10)
      } else if (fert.analysis.K > 0 && adjustedTargets.K > 0) {
        amount = (adjustedTargets.K * stockVolume) / (fert.analysis.K * 10)
      }

      // Check solubility
      const concentration = (amount * 1000) / stockVolume
      if (concentration > fert.solubility) {
        results.warnings.push(`${fert.name} exceeds solubility limit`)
        amount = (fert.solubility * stockVolume) / 1000
      }

      results.fertilizers.push({
        ...fert,
        amount: amount,
        cost: amount * fert.cost
      })

      results.totalCost += amount * fert.cost
    })

    // Calculate final EC
    const totalSalts = results.fertilizers.reduce((sum: number, f: any) => sum + f.amount, 0)
    results.estimatedEC = (totalSalts * 0.7) / stockVolume // Simplified EC calculation

    setCalculationResults(results)
  }

  useEffect(() => {
    if (selectedRecipe && selectedFertilizers.length > 0) {
      calculateFertilizerAmounts()
    }
  }, [selectedRecipe, selectedFertilizers, tankVolume, concentrationFactor, waterAnalysis])

  const exportCalculations = () => {
    if (!calculationResults || !selectedRecipe) return

    const data = {
      recipe: selectedRecipe,
      tankVolume,
      concentrationFactor,
      waterAnalysis,
      fertilizers: calculationResults.fertilizers,
      totalCost: calculationResults.totalCost,
      estimatedEC: calculationResults.estimatedEC,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nutrient-recipe-${selectedRecipe.id}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const addSchedule = () => {
    if (!selectedRecipe) return

    const newSchedule: DosingSchedule = {
      id: Date.now().toString(),
      recipeName: selectedRecipe.name,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      frequency: 'daily',
      volumePerApplication: tankVolume,
      notes: ''
    }

    setSchedules([...schedules, newSchedule])
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Nutrient Dosing Calculator</h1>
          <p className="text-gray-400">Calculate precise fertilizer amounts for hydroponic solutions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCalculations}
            disabled={!calculationResults}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Recipe
          </button>
          <button
            onClick={addSchedule}
            disabled={!selectedRecipe}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe Selection & Parameters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipe Selection */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-400" />
              Select Recipe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedRecipe?.id === recipe.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <h3 className="font-medium text-gray-100">{recipe.name}</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-400">EC: {recipe.targetEC} mS/cm</p>
                    <p className="text-gray-400">pH: {recipe.targetPH}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tank Parameters */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Beaker className="w-5 h-5 text-blue-400" />
              Tank Parameters
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Tank Volume (L)
                </label>
                <input
                  type="number"
                  value={tankVolume}
                  onChange={(e) => setTankVolume(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Concentration Factor (1:X)
                </label>
                <input
                  type="number"
                  value={concentrationFactor}
                  onChange={(e) => setConcentrationFactor(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Stock solution volume: {(tankVolume / concentrationFactor).toFixed(1)} L
            </p>
          </div>

          {/* Water Analysis */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-400" />
                Water Analysis
              </h2>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Ca (ppm)</label>
                <input
                  type="number"
                  value={waterAnalysis.Ca}
                  onChange={(e) => setWaterAnalysis({ ...waterAnalysis, Ca: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Mg (ppm)</label>
                <input
                  type="number"
                  value={waterAnalysis.Mg}
                  onChange={(e) => setWaterAnalysis({ ...waterAnalysis, Mg: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">S (ppm)</label>
                <input
                  type="number"
                  value={waterAnalysis.S}
                  onChange={(e) => setWaterAnalysis({ ...waterAnalysis, S: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={waterAnalysis.pH}
                  onChange={(e) => setWaterAnalysis({ ...waterAnalysis, pH: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
              {showAdvanced && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">HCO₃ (ppm)</label>
                    <input
                      type="number"
                      value={waterAnalysis.HCO3}
                      onChange={(e) => setWaterAnalysis({ ...waterAnalysis, HCO3: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Na (ppm)</label>
                    <input
                      type="number"
                      value={waterAnalysis.Na}
                      onChange={(e) => setWaterAnalysis({ ...waterAnalysis, Na: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Cl (ppm)</label>
                    <input
                      type="number"
                      value={waterAnalysis.Cl}
                      onChange={(e) => setWaterAnalysis({ ...waterAnalysis, Cl: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">EC (mS/cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={waterAnalysis.EC}
                      onChange={(e) => setWaterAnalysis({ ...waterAnalysis, EC: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Fertilizer Selection */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <FlaskRound className="w-5 h-5 text-purple-400" />
              Select Fertilizers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {fertilizers.map(fert => (
                <button
                  key={fert.id}
                  onClick={() => {
                    if (selectedFertilizers.includes(fert.id)) {
                      setSelectedFertilizers(selectedFertilizers.filter(id => id !== fert.id))
                    } else {
                      setSelectedFertilizers([...selectedFertilizers, fert.id])
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedFertilizers.includes(fert.id)
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-100 text-sm">{fert.name}</h4>
                      <p className="text-xs text-gray-400">{fert.formula}</p>
                    </div>
                    <span className="text-xs text-gray-400">${fert.cost}/kg</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(fert.analysis).map(([element, value]) => 
                      value > 0 && (
                        <span key={element} className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                          {element}: {value}%
                        </span>
                      )
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Target Nutrient Profile */}
          {selectedRecipe && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Target Profile
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">EC Target:</span>
                  <span className="text-gray-100">{selectedRecipe.targetEC} mS/cm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">pH Target:</span>
                  <span className="text-gray-100">{selectedRecipe.targetPH}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <p className="text-xs font-medium text-gray-400 mb-2">Elements (ppm)</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(selectedRecipe.elements).map(([element, ppm]) => (
                      <div key={element} className="flex justify-between">
                        <span className="text-gray-400">{element}:</span>
                        <span className="text-gray-100">{ppm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calculation Results */}
          {calculationResults && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-400" />
                Fertilizer Amounts
              </h3>
              <div className="space-y-3">
                {calculationResults.fertilizers.map((fert: any) => (
                  <div key={fert.id} className="bg-gray-700 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-100 text-sm">{fert.name}</p>
                        <p className="text-xs text-gray-400">{fert.formula}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-100">{fert.amount.toFixed(2)} g</p>
                        <p className="text-xs text-gray-400">${fert.cost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-700 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Cost:</span>
                    <span className="text-green-400 font-medium">
                      ${calculationResults.totalCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Est. EC:</span>
                    <span className="text-gray-100">
                      {calculationResults.estimatedEC.toFixed(2)} mS/cm
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cost per L:</span>
                    <span className="text-gray-100">
                      ${(calculationResults.totalCost / tankVolume).toFixed(4)}
                    </span>
                  </div>
                </div>

                {calculationResults.warnings.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-yellow-200">
                        {calculationResults.warnings.map((warning: string, idx: number) => (
                          <p key={idx}>{warning}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mixing Instructions */}
          {calculationResults && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                Mixing Instructions
              </h3>
              <ol className="space-y-2 text-sm text-gray-300">
                <li>1. Fill tank with {(tankVolume / concentrationFactor * 0.8).toFixed(0)}L water</li>
                <li>2. Add calcium-containing fertilizers first</li>
                <li>3. Mix thoroughly between each addition</li>
                <li>4. Add sulfate-containing fertilizers</li>
                <li>5. Add remaining fertilizers</li>
                <li>6. Top up to {(tankVolume / concentrationFactor).toFixed(1)}L</li>
                <li>7. Adjust pH to {selectedRecipe?.targetPH || '5.8-6.2'}</li>
                <li>8. Verify EC matches target</li>
              </ol>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <p className="text-xs text-blue-200">
                  <strong>Pro tip:</strong> Never mix calcium and sulfate fertilizers in concentrated form
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dosing Schedules */}
      {schedules.length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Dosing Schedules
          </h2>
          <div className="space-y-3">
            {schedules.map(schedule => (
              <div key={schedule.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-100">{schedule.recipeName}</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-400">
                      <p>Frequency: {schedule.frequency}</p>
                      <p>Volume: {schedule.volumePerApplication}L per application</p>
                      <p>Period: {schedule.startDate.toLocaleDateString()} - {schedule.endDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-600 rounded transition-colors">
                    <Minus className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}