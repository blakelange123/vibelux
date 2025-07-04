"use client"
import { useState, useEffect } from 'react'
import {
  Calculator,
  FlaskRound,
  AlertCircle,
  Check,
  X,
  Plus,
  Minus,
  Save,
  AlertTriangle,
  Info,
  Beaker,
  DollarSign,
  Zap,
  Droplets,
  Target,
  TrendingUp,
  Package,
  ChevronDown,
  ChevronUp,
  Copy,
  FileJson
} from 'lucide-react'
import {
  CustomNutrientRecipe,
  CustomFormulation,
  ExtendedFertilizer
} from '@/lib/nutrient-recipe-models'
import {
  extendedFertilizerDatabase,
  getFertilizerById,
  checkCompatibility,
  calculateECContribution,
  separateFertilizersIntoTanks,
  getFertilizersWithElement
} from '@/lib/fertilizer-database'

interface FormulationCalculatorProps {
  recipe: CustomNutrientRecipe
  waterVolume: number
  concentrationFactor: number
  waterAnalysis: {
    Ca: number
    Mg: number
    S: number
    Na: number
    Cl: number
    EC: number
    pH: number
    alkalinity: number
  }
  onSave?: (formulation: CustomFormulation) => void
}

interface CalculationResult {
  fertilizers: Array<{
    id: string
    name: string
    amount: number // grams for stock solution
    stockTank: 'A' | 'B' | 'C'
    provides: Partial<CustomNutrientRecipe['elements']>
    cost: number
    concentration: number // g/L in stock
  }>
  achieved: CustomNutrientRecipe['elements']
  deficits: Partial<CustomNutrientRecipe['elements']>
  excess: Partial<CustomNutrientRecipe['elements']>
  totalCost: number
  costPerLiter: number
  estimatedEC: number
  compatibility: ReturnType<typeof checkCompatibility>
  tanks: {
    A: { volume: number; fertilizers: string[]; ec: number }
    B: { volume: number; fertilizers: string[]; ec: number }
    C?: { volume: number; fertilizers: string[]; ec: number }
  }
  warnings: string[]
  suggestions: string[]
}

export function FormulationCalculator({
  recipe,
  waterVolume,
  concentrationFactor,
  waterAnalysis,
  onSave
}: FormulationCalculatorProps) {
  const [selectedFertilizers, setSelectedFertilizers] = useState<string[]>([])
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({})
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [optimizationMode, setOptimizationMode] = useState<'cost' | 'accuracy' | 'balanced'>('balanced')
  const [maxIterations, setMaxIterations] = useState(100)
  const [showFertilizerDetails, setShowFertilizerDetails] = useState(false)

  // Stock solution volume
  const stockVolume = waterVolume / concentrationFactor

  // Auto-select fertilizers based on recipe
  useEffect(() => {
    autoSelectFertilizers()
  }, [recipe])

  const autoSelectFertilizers = () => {
    const selected: string[] = []
    
    // Primary nitrogen source
    if (recipe.elements.N > 0) {
      if (recipe.elements.Ca > 100) {
        selected.push('can-4h2o') // Calcium nitrate for Ca + N
      } else {
        selected.push('kno3') // Potassium nitrate for K + N
      }
    }

    // Phosphorus source
    if (recipe.elements.P > 0) {
      selected.push('mkp') // MKP for P + K
    }

    // Additional potassium if needed
    if (recipe.elements.K > 200) {
      selected.push('ksul') // Potassium sulfate for K + S
    }

    // Magnesium source
    if (recipe.elements.Mg > 0) {
      selected.push('mgso4-7h2o') // Epsom salt for Mg + S
    }

    // Micronutrients
    if (recipe.elements.Fe > 0) {
      selected.push('fe-dtpa') // Chelated iron
    }

    // Micronutrient mix for others
    selected.push('micro-edta-mix')

    setSelectedFertilizers(selected)
  }

  const calculateFormulation = () => {
    if (selectedFertilizers.length === 0) return

    const result: CalculationResult = {
      fertilizers: [],
      achieved: { ...recipe.elements },
      deficits: {},
      excess: {},
      totalCost: 0,
      costPerLiter: 0,
      estimatedEC: waterAnalysis.EC,
      compatibility: { compatible: true, warnings: [], incompatiblePairs: [] },
      tanks: {
        A: { volume: stockVolume / 2, fertilizers: [], ec: 0 },
        B: { volume: stockVolume / 2, fertilizers: [], ec: 0 }
      },
      warnings: [],
      suggestions: []
    }

    // Adjust targets for water content
    const adjustedTargets = { ...recipe.elements }
    adjustedTargets.Ca = Math.max(0, adjustedTargets.Ca - waterAnalysis.Ca)
    adjustedTargets.Mg = Math.max(0, adjustedTargets.Mg - waterAnalysis.Mg)
    adjustedTargets.S = Math.max(0, adjustedTargets.S - waterAnalysis.S)
    
    if (waterAnalysis.Na > 50) {
      result.warnings.push(`High sodium in water (${waterAnalysis.Na} ppm)`)
    }
    if (waterAnalysis.Cl > 100) {
      result.warnings.push(`High chloride in water (${waterAnalysis.Cl} ppm)`)
    }

    // Simple linear calculation for each fertilizer
    // In a real implementation, this would use linear programming
    const elementSupply: Partial<CustomNutrientRecipe['elements']> = {}
    const fertilizerAmounts: Array<{ id: string; amount: number }> = []

    selectedFertilizers.forEach(fertId => {
      const fert = getFertilizerById(fertId)
      if (!fert) return

      let amount = 0

      // Calculate based on primary element
      if (customAmounts[fertId]) {
        amount = customAmounts[fertId]
      } else {
        // Auto-calculate based on most significant element
        const elements = Object.entries(fert.analysis)
          .filter(([_, value]) => value && value > 0)
          .sort(([_, a], [__, b]) => (b || 0) - (a || 0))

        if (elements.length > 0) {
          const [primaryElement, percentage] = elements[0]
          const elementKey = primaryElement as keyof CustomNutrientRecipe['elements']
          
          if (adjustedTargets[elementKey] && adjustedTargets[elementKey] > 0) {
            const needed = adjustedTargets[elementKey] - (elementSupply[elementKey] || 0)
            if (needed > 0) {
              // Convert from ppm to g/L for stock solution
              amount = (needed * stockVolume) / (percentage * 10 * concentrationFactor)
            }
          }
        }
      }

      if (amount > 0) {
        // Check solubility
        const concentration = amount / stockVolume * 1000 // g/L
        if (concentration > fert.solubility) {
          result.warnings.push(`${fert.name} exceeds solubility (${concentration.toFixed(0)} > ${fert.solubility} g/L)`)
          amount = (fert.solubility * stockVolume) / 1000
        }

        // Add to results
        fertilizerAmounts.push({ id: fertId, amount })

        // Calculate what this provides
        const provides: Partial<CustomNutrientRecipe['elements']> = {}
        Object.entries(fert.analysis).forEach(([element, percentage]) => {
          if (percentage && percentage > 0) {
            const elementKey = element as keyof CustomNutrientRecipe['elements']
            const ppm = (amount * percentage * 10 * concentrationFactor) / waterVolume
            provides[elementKey] = ppm
            elementSupply[elementKey] = (elementSupply[elementKey] || 0) + ppm
          }
        })

        result.fertilizers.push({
          id: fertId,
          name: fert.name,
          amount: Math.round(amount * 100) / 100,
          stockTank: 'A', // Will be updated by tank separation
          provides,
          cost: amount * fert.cost / 1000,
          concentration: amount / stockVolume * 1000
        })

        result.totalCost += amount * fert.cost / 1000
      }
    })

    // Calculate achieved levels
    Object.keys(recipe.elements).forEach(element => {
      const key = element as keyof CustomNutrientRecipe['elements']
      result.achieved[key] = (elementSupply[key] || 0) + 
        (key === 'Ca' ? waterAnalysis.Ca : 
         key === 'Mg' ? waterAnalysis.Mg : 
         key === 'S' ? waterAnalysis.S : 0)
    })

    // Calculate deficits and excess
    Object.entries(recipe.elements).forEach(([element, target]) => {
      const key = element as keyof CustomNutrientRecipe['elements']
      const achieved = result.achieved[key] || 0
      const diff = achieved - target
      
      if (diff < -1) {
        result.deficits[key] = Math.abs(diff)
      } else if (diff > target * 0.1) { // More than 10% over
        result.excess[key] = diff
      }
    })

    // Check compatibility
    result.compatibility = checkCompatibility(selectedFertilizers)

    // Separate into tanks
    const tankSeparation = separateFertilizersIntoTanks(fertilizerAmounts)
    
    // Update tank assignments
    result.fertilizers.forEach(fert => {
      if (tankSeparation.tankA.find(f => f.id === fert.id)) {
        fert.stockTank = 'A'
        result.tanks.A.fertilizers.push(fert.name)
      } else if (tankSeparation.tankB.find(f => f.id === fert.id)) {
        fert.stockTank = 'B'
        result.tanks.B.fertilizers.push(fert.name)
      } else if (tankSeparation.tankC?.find(f => f.id === fert.id)) {
        fert.stockTank = 'C'
        if (!result.tanks.C) {
          result.tanks.C = { volume: stockVolume / 3, fertilizers: [], ec: 0 }
        }
        result.tanks.C.fertilizers.push(fert.name)
      }
    })

    // Calculate EC contribution
    result.estimatedEC = waterAnalysis.EC + calculateECContribution(fertilizerAmounts) / concentrationFactor

    // Cost per liter of final solution
    result.costPerLiter = result.totalCost / waterVolume

    // Generate suggestions
    if (Object.keys(result.deficits).length > 0) {
      Object.entries(result.deficits).forEach(([element, deficit]) => {
        const fertilizersWithElement = getFertilizersWithElement(element as keyof ExtendedFertilizer['analysis'])
        if (fertilizersWithElement.length > 0) {
          result.suggestions.push(
            `Add ${fertilizersWithElement[0].name} to supply ${deficit.toFixed(1)} ppm more ${element}`
          )
        }
      })
    }

    if (result.estimatedEC > recipe.targetEC + 0.3) {
      result.warnings.push(`Estimated EC (${result.estimatedEC.toFixed(2)}) exceeds target by >0.3 mS/cm`)
    }

    setCalculationResult(result)
  }

  useEffect(() => {
    if (selectedFertilizers.length > 0) {
      calculateFormulation()
    }
  }, [selectedFertilizers, customAmounts, recipe, waterVolume, concentrationFactor])

  const saveFormulation = () => {
    if (!calculationResult || !onSave) return

    const formulation: CustomFormulation = {
      id: Date.now().toString(),
      name: `${recipe.name} - Formulation`,
      recipeId: recipe.id,
      fertilizers: calculationResult.fertilizers.map((f, index) => ({
        fertId: f.id,
        name: f.name,
        amount: f.amount,
        stockTank: f.stockTank,
        order: index + 1
      })),
      stockConcentration: concentrationFactor,
      totalCost: calculationResult.totalCost,
      costPerLiter: calculationResult.costPerLiter,
      warnings: calculationResult.warnings,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    onSave(formulation)
  }

  const exportFormulation = () => {
    if (!calculationResult) return

    const exportData = {
      recipe: {
        name: recipe.name,
        targetEC: recipe.targetEC,
        targetPH: recipe.targetPH,
        elements: recipe.elements
      },
      formulation: {
        stockVolume,
        concentrationFactor,
        fertilizers: calculationResult.fertilizers,
        tanks: calculationResult.tanks,
        achieved: calculationResult.achieved,
        totalCost: calculationResult.totalCost,
        estimatedEC: calculationResult.estimatedEC
      },
      waterAnalysis,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${recipe.name.replace(/\s+/g, '-')}-formulation-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            <FlaskRound className="w-6 h-6 text-purple-400" />
            Formulation Calculator
          </h2>
          <div className="flex gap-2">
            {calculationResult && (
              <>
                <button
                  onClick={exportFormulation}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  <FileJson className="w-4 h-4" />
                  Export
                </button>
                {onSave && (
                  <button
                    onClick={saveFormulation}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Recipe:</p>
            <p className="text-gray-100 font-medium">{recipe.name}</p>
          </div>
          <div>
            <p className="text-gray-400">Stock Volume:</p>
            <p className="text-gray-100 font-medium">{stockVolume.toFixed(1)} L</p>
          </div>
          <div>
            <p className="text-gray-400">Dilution:</p>
            <p className="text-gray-100 font-medium">1:{concentrationFactor}</p>
          </div>
        </div>
      </div>

      {/* Fertilizer Selection */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-100">Select Fertilizers</h3>
          <button
            onClick={() => setShowFertilizerDetails(!showFertilizerDetails)}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            {showFertilizerDetails ? 'Hide' : 'Show'} Details
            {showFertilizerDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {extendedFertilizerDatabase.map(fert => {
            const isSelected = selectedFertilizers.includes(fert.id)
            const mainElements = Object.entries(fert.analysis)
              .filter(([_, value]) => value && value > 5)
              .map(([element, value]) => `${element}: ${value}%`)
              .join(', ')

            return (
              <button
                key={fert.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedFertilizers(selectedFertilizers.filter(id => id !== fert.id))
                    setCustomAmounts(prev => {
                      const updated = { ...prev }
                      delete updated[fert.id]
                      return updated
                    })
                  } else {
                    setSelectedFertilizers([...selectedFertilizers, fert.id])
                  }
                }}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-100 text-sm">{fert.name}</h4>
                    <p className="text-xs text-gray-400">{fert.formula}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    fert.type === 'chelate' ? 'bg-green-500/20 text-green-300' :
                    fert.type === 'salt' ? 'bg-blue-500/20 text-blue-300' :
                    fert.type === 'acid' ? 'bg-red-500/20 text-red-300' :
                    fert.type === 'base' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {fert.type}
                  </span>
                </div>
                
                {showFertilizerDetails && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-300">{mainElements}</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Solubility:</span>
                      <span className="text-gray-300">{fert.solubility} g/L</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-gray-300">${fert.cost}/kg</span>
                    </div>
                  </div>
                )}

                {isSelected && (
                  <div className="mt-2">
                    <label className="text-xs text-gray-400">Custom amount (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Auto"
                      value={customAmounts[fert.id] || ''}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : undefined
                        setCustomAmounts(prev => 
                          value ? { ...prev, [fert.id]: value } : 
                          (() => { const updated = { ...prev }; delete updated[fert.id]; return updated })()
                        )
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full mt-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Advanced Options */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Advanced Options
            {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showAdvancedOptions && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Optimization Mode
                </label>
                <div className="flex gap-2">
                  {(['cost', 'accuracy', 'balanced'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setOptimizationMode(mode)}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        optimizationMode === mode
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calculation Results */}
      {calculationResult && (
        <>
          {/* Compatibility Check */}
          {!calculationResult.compatibility.compatible && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-200 mb-2">Compatibility Issues</h4>
                  {calculationResult.compatibility.incompatiblePairs.map((pair, idx) => (
                    <p key={idx} className="text-sm text-red-200 mb-1">
                      {pair.fert1} × {pair.fert2}: {pair.reason}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Formulation Results */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              Formulation Results
            </h3>

            {/* Tank Assignments */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(calculationResult.tanks).map(([tank, data]) => (
                <div key={tank} className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-100 mb-2 flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-purple-400" />
                    Stock Tank {tank}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Volume:</span>
                      <span className="text-gray-100">{data.volume.toFixed(1)} L</span>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Fertilizers:</p>
                      {data.fertilizers.map((fert, idx) => (
                        <p key={idx} className="text-xs text-gray-300 ml-2">• {fert}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fertilizer Amounts */}
            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-gray-300">Fertilizer Amounts</h4>
              {calculationResult.fertilizers.map(fert => (
                <div key={fert.id} className="bg-gray-700 rounded p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-100 text-sm">{fert.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        <span className="text-gray-400">
                          Tank {fert.stockTank}
                        </span>
                        <span className="text-gray-400">
                          {fert.concentration.toFixed(1)} g/L stock
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-100">{fert.amount.toFixed(2)} g</p>
                      <p className="text-xs text-gray-400">${fert.cost.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(fert.provides).map(([element, ppm]) => 
                      ppm && ppm > 0.01 && (
                        <span key={element} className="text-xs bg-gray-600 px-2 py-0.5 rounded">
                          {element}: {ppm.toFixed(1)} ppm
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Element Achievement */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-100 mb-3">Element Achievement</h4>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                {Object.entries(recipe.elements).map(([element, target]) => {
                  const achieved = calculationResult.achieved[element as keyof typeof calculationResult.achieved] || 0
                  const percentage = (achieved / target) * 100
                  const isGood = percentage >= 90 && percentage <= 110
                  const isWarning = percentage >= 80 && percentage < 90 || percentage > 110 && percentage <= 120
                  
                  return (
                    <div key={element} className="text-center">
                      <p className="text-gray-400 mb-1">{element}</p>
                      <p className={`font-medium ${
                        isGood ? 'text-green-400' :
                        isWarning ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {achieved.toFixed(1)}
                      </p>
                      <p className="text-gray-500">/ {target}</p>
                      <p className={`text-xs ${
                        isGood ? 'text-green-400' :
                        isWarning ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {percentage.toFixed(0)}%
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Total Cost</span>
                </div>
                <p className="text-lg font-medium text-gray-100">
                  ${calculationResult.totalCost.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs">Cost/L</span>
                </div>
                <p className="text-lg font-medium text-gray-100">
                  ${calculationResult.costPerLiter.toFixed(4)}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs">Est. EC</span>
                </div>
                <p className="text-lg font-medium text-gray-100">
                  {calculationResult.estimatedEC.toFixed(2)} mS/cm
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs">Target EC</span>
                </div>
                <p className="text-lg font-medium text-gray-100">
                  {recipe.targetEC} mS/cm
                </p>
              </div>
            </div>

            {/* Warnings and Suggestions */}
            {(calculationResult.warnings.length > 0 || calculationResult.suggestions.length > 0) && (
              <div className="space-y-3">
                {calculationResult.warnings.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-200">
                        {calculationResult.warnings.map((warning, idx) => (
                          <p key={idx} className="mb-1">{warning}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {calculationResult.suggestions.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-200">
                        {calculationResult.suggestions.map((suggestion, idx) => (
                          <p key={idx} className="mb-1">{suggestion}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}