"use client"
import { useState, useEffect } from 'react'
import {
  Calendar,
  ChevronRight,
  Plus,
  Minus,
  Save,
  Edit,
  Trash2,
  Copy,
  TrendingUp,
  Leaf,
  Flower,
  Apple,
  ArrowRight,
  Clock,
  Activity,
  AlertCircle,
  Download,
  Upload,
  Settings,
  Target,
  Zap,
  Droplets
} from 'lucide-react'
import {
  CustomNutrientRecipe,
  StageProfile,
  GrowthPlan,
  extendedCropTypes,
  growthStages
} from '@/lib/nutrient-recipe-models'

interface StageSpecificNutrientsProps {
  customRecipes: CustomNutrientRecipe[]
  onSavePlan?: (plan: GrowthPlan) => void
}

interface StageEditor {
  stageIndex: number
  weekIndex?: number
}

export function StageSpecificNutrients({ customRecipes, onSavePlan }: StageSpecificNutrientsProps) {
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan>({
    id: Date.now().toString(),
    name: '',
    cropType: '',
    totalDuration: 0,
    stages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const [selectedCrop, setSelectedCrop] = useState('')
  const [editingStage, setEditingStage] = useState<StageEditor | null>(null)
  const [showEnvironmentalSettings, setShowEnvironmentalSettings] = useState(false)
  const [savedPlans, setSavedPlans] = useState<GrowthPlan[]>([])

  // Load saved plans
  useEffect(() => {
    const saved = localStorage.getItem('vibelux-growth-plans')
    if (saved) {
      setSavedPlans(JSON.parse(saved))
    }
  }, [])

  // Calculate total duration
  useEffect(() => {
    const total = growthPlan.stages.reduce((sum, stage) => sum + stage.duration, 0)
    setGrowthPlan(prev => ({ ...prev, totalDuration: total }))
  }, [growthPlan.stages])

  const addStage = () => {
    const newStage: StageProfile = {
      stageName: '',
      duration: 14, // Default 2 weeks
      recipe: customRecipes[0] || {
        id: 'default',
        name: 'Default Recipe',
        cropType: selectedCrop,
        growthStage: 'vegetative',
        targetEC: 1.5,
        targetPH: 5.8,
        elements: {
          N: 150, P: 50, K: 200, Ca: 150, Mg: 50, S: 60,
          Fe: 3, Mn: 0.5, B: 0.3, Zn: 0.05, Cu: 0.05, Mo: 0.05
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      adjustments: []
    }

    setGrowthPlan(prev => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }))
  }

  const updateStage = (index: number, updates: Partial<StageProfile>) => {
    setGrowthPlan(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === index ? { ...stage, ...updates } : stage
      )
    }))
  }

  const removeStage = (index: number) => {
    setGrowthPlan(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }))
  }

  const duplicateStage = (index: number) => {
    const stageToDuplicate = growthPlan.stages[index]
    const duplicated = { ...stageToDuplicate, stageName: `${stageToDuplicate.stageName} (Copy)` }
    
    setGrowthPlan(prev => ({
      ...prev,
      stages: [...prev.stages.slice(0, index + 1), duplicated, ...prev.stages.slice(index + 1)]
    }))
  }

  const addWeeklyAdjustment = (stageIndex: number, week: number) => {
    const stage = growthPlan.stages[stageIndex]
    const newAdjustment = {
      week,
      modifications: {},
      ecAdjustment: 0,
      phAdjustment: 0
    }

    updateStage(stageIndex, {
      adjustments: [...(stage.adjustments || []), newAdjustment]
    })
  }

  const savePlan = () => {
    const planToSave = { ...growthPlan, updatedAt: new Date() }
    const updated = savedPlans.filter(p => p.id !== planToSave.id)
    const newPlans = [...updated, planToSave]
    
    setSavedPlans(newPlans)
    localStorage.setItem('vibelux-growth-plans', JSON.stringify(newPlans))
    
    if (onSavePlan) {
      onSavePlan(planToSave)
    }
  }

  const loadPlan = (plan: GrowthPlan) => {
    setGrowthPlan(plan)
    setSelectedCrop(plan.cropType)
  }

  const exportPlan = () => {
    const data = JSON.stringify(growthPlan, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${growthPlan.name.replace(/\s+/g, '-')}-growth-plan.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStageIcon = (stageName: string) => {
    const name = stageName.toLowerCase()
    if (name.includes('seedling') || name.includes('veg')) return <Leaf className="w-4 h-4 text-green-400" />
    if (name.includes('flower')) return <Flower className="w-4 h-4 text-pink-400" />
    if (name.includes('fruit') || name.includes('harvest')) return <Apple className="w-4 h-4 text-orange-400" />
    return <Activity className="w-4 h-4 text-blue-400" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Stage-Specific Nutrient Management</h2>
          <div className="flex gap-2">
            <button
              onClick={exportPlan}
              disabled={!growthPlan.name || growthPlan.stages.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={savePlan}
              disabled={!growthPlan.name || growthPlan.stages.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-500 rounded text-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Plan
            </button>
          </div>
        </div>

        {/* Plan Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Plan Name
            </label>
            <input
              type="text"
              value={growthPlan.name}
              onChange={(e) => setGrowthPlan({ ...growthPlan, name: e.target.value })}
              placeholder="e.g., Tomato Production Cycle"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Crop Type
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value)
                setGrowthPlan({ ...growthPlan, cropType: e.target.value })
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            >
              <option value="">Select crop</option>
              {extendedCropTypes.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Total Duration
            </label>
            <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100">
              {growthPlan.totalDuration} days ({(growthPlan.totalDuration / 7).toFixed(1)} weeks)
            </div>
          </div>
        </div>

        {/* Environmental Settings */}
        <div className="mt-4">
          <button
            onClick={() => setShowEnvironmentalSettings(!showEnvironmentalSettings)}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
            Environmental Settings
          </button>
          
          {showEnvironmentalSettings && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-700 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Temperature (°C)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={growthPlan.environmentalConditions?.temperature.min || ''}
                    onChange={(e) => setGrowthPlan({
                      ...growthPlan,
                      environmentalConditions: {
                        ...growthPlan.environmentalConditions,
                        temperature: {
                          ...growthPlan.environmentalConditions?.temperature || { min: 0, max: 0 },
                          min: Number(e.target.value)
                        }
                      } as any
                    })}
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={growthPlan.environmentalConditions?.temperature.max || ''}
                    onChange={(e) => setGrowthPlan({
                      ...growthPlan,
                      environmentalConditions: {
                        ...growthPlan.environmentalConditions,
                        temperature: {
                          ...growthPlan.environmentalConditions?.temperature || { min: 0, max: 0 },
                          max: Number(e.target.value)
                        }
                      } as any
                    })}
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Humidity (%)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={growthPlan.environmentalConditions?.humidity.min || ''}
                    onChange={(e) => setGrowthPlan({
                      ...growthPlan,
                      environmentalConditions: {
                        ...growthPlan.environmentalConditions,
                        humidity: {
                          ...growthPlan.environmentalConditions?.humidity || { min: 0, max: 0 },
                          min: Number(e.target.value)
                        }
                      } as any
                    })}
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={growthPlan.environmentalConditions?.humidity.max || ''}
                    onChange={(e) => setGrowthPlan({
                      ...growthPlan,
                      environmentalConditions: {
                        ...growthPlan.environmentalConditions,
                        humidity: {
                          ...growthPlan.environmentalConditions?.humidity || { min: 0, max: 0 },
                          max: Number(e.target.value)
                        }
                      } as any
                    })}
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  CO₂ (ppm)
                </label>
                <input
                  type="number"
                  value={growthPlan.environmentalConditions?.co2 || ''}
                  onChange={(e) => setGrowthPlan({
                    ...growthPlan,
                    environmentalConditions: {
                      ...growthPlan.environmentalConditions,
                      co2: Number(e.target.value)
                    } as any
                  })}
                  className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Photoperiod (hrs)
                </label>
                <input
                  type="number"
                  value={growthPlan.environmentalConditions?.photoperiod || ''}
                  onChange={(e) => setGrowthPlan({
                    ...growthPlan,
                    environmentalConditions: {
                      ...growthPlan.environmentalConditions,
                      photoperiod: Number(e.target.value)
                    } as any
                  })}
                  className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Growth Stages Timeline */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-100">Growth Stages</h3>
          <button
            onClick={addStage}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Stage
          </button>
        </div>

        {growthPlan.stages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No stages defined yet</p>
            <button
              onClick={addStage}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Stage
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline Visualization */}
            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-700"></div>
              <div className="relative flex justify-between">
                {growthPlan.stages.map((stage, index) => {
                  const startDay = growthPlan.stages.slice(0, index).reduce((sum, s) => sum + s.duration, 0)
                  const percentage = (startDay / growthPlan.totalDuration) * 100
                  const width = (stage.duration / growthPlan.totalDuration) * 100
                  
                  return (
                    <div
                      key={index}
                      className="absolute"
                      style={{ left: `${percentage}%`, width: `${width}%` }}
                    >
                      <div className="relative">
                        <div className="absolute top-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center -translate-x-1/2">
                          {getStageIcon(stage.stageName)}
                        </div>
                        <div className="pt-10 text-center">
                          <p className="text-xs font-medium text-gray-100">{stage.stageName}</p>
                          <p className="text-xs text-gray-400">{stage.duration} days</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="h-20"></div>
            </div>

            {/* Stage Cards */}
            <div className="space-y-3 mt-8">
              {growthPlan.stages.map((stage, stageIndex) => (
                <div key={stageIndex} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStageIcon(stage.stageName)}
                      <div>
                        <input
                          type="text"
                          value={stage.stageName}
                          onChange={(e) => updateStage(stageIndex, { stageName: e.target.value })}
                          placeholder="Stage name"
                          className="bg-transparent text-gray-100 font-medium focus:outline-none focus:border-b border-gray-500"
                        />
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span>Duration:</span>
                          <input
                            type="number"
                            value={stage.duration}
                            onChange={(e) => updateStage(stageIndex, { duration: Number(e.target.value) })}
                            className="w-16 px-2 py-0.5 bg-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <span>days</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => duplicateStage(stageIndex)}
                        className="p-1.5 hover:bg-gray-600 rounded transition-colors"
                        title="Duplicate Stage"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => removeStage(stageIndex)}
                        className="p-1.5 hover:bg-gray-600 rounded transition-colors"
                        title="Remove Stage"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Base Recipe Selection */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Base Recipe
                    </label>
                    <select
                      value={stage.recipe.id}
                      onChange={(e) => {
                        const recipe = customRecipes.find(r => r.id === e.target.value)
                        if (recipe) {
                          updateStage(stageIndex, { recipe })
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                    >
                      {customRecipes.map(recipe => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Recipe Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
                    <div className="bg-gray-600 rounded p-2">
                      <span className="text-gray-400">EC:</span>
                      <span className="ml-2 text-gray-100">{stage.recipe.targetEC} mS/cm</span>
                    </div>
                    <div className="bg-gray-600 rounded p-2">
                      <span className="text-gray-400">pH:</span>
                      <span className="ml-2 text-gray-100">{stage.recipe.targetPH}</span>
                    </div>
                    <div className="bg-gray-600 rounded p-2">
                      <span className="text-gray-400">NPK:</span>
                      <span className="ml-2 text-gray-100">
                        {stage.recipe.elements.N}-{stage.recipe.elements.P}-{stage.recipe.elements.K}
                      </span>
                    </div>
                    <div className="bg-gray-600 rounded p-2">
                      <span className="text-gray-400">Ca:Mg:</span>
                      <span className="ml-2 text-gray-100">
                        {stage.recipe.elements.Ca}:{stage.recipe.elements.Mg}
                      </span>
                    </div>
                  </div>

                  {/* Weekly Adjustments */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-300">Weekly Adjustments</h4>
                      <button
                        onClick={() => {
                          const weeks = Math.ceil(stage.duration / 7)
                          for (let w = 1; w <= weeks; w++) {
                            if (!stage.adjustments?.find(a => a.week === w)) {
                              addWeeklyAdjustment(stageIndex, w)
                            }
                          }
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        Add All Weeks
                      </button>
                    </div>

                    {stage.adjustments && stage.adjustments.length > 0 ? (
                      <div className="space-y-2">
                        {stage.adjustments.sort((a, b) => a.week - b.week).map((adj, adjIndex) => (
                          <div key={adjIndex} className="bg-gray-600 rounded p-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-100">
                                Week {adj.week}
                              </span>
                              <button
                                onClick={() => setEditingStage({ stageIndex, weekIndex: adjIndex })}
                                className="text-xs text-purple-400 hover:text-purple-300"
                              >
                                Edit Adjustments
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400">EC Adjust:</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={adj.ecAdjustment || 0}
                                  onChange={(e) => {
                                    const newAdjustments = [...stage.adjustments!]
                                    newAdjustments[adjIndex] = {
                                      ...newAdjustments[adjIndex],
                                      ecAdjustment: Number(e.target.value)
                                    }
                                    updateStage(stageIndex, { adjustments: newAdjustments })
                                  }}
                                  className="ml-2 w-16 px-1 py-0.5 bg-gray-700 rounded focus:outline-none"
                                />
                              </div>
                              <div>
                                <span className="text-gray-400">pH Adjust:</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={adj.phAdjustment || 0}
                                  onChange={(e) => {
                                    const newAdjustments = [...stage.adjustments!]
                                    newAdjustments[adjIndex] = {
                                      ...newAdjustments[adjIndex],
                                      phAdjustment: Number(e.target.value)
                                    }
                                    updateStage(stageIndex, { adjustments: newAdjustments })
                                  }}
                                  className="ml-2 w-16 px-1 py-0.5 bg-gray-700 rounded focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-2">
                        No weekly adjustments defined
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Saved Plans */}
      {savedPlans.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-100 mb-4">Saved Growth Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPlans.map(plan => (
              <div key={plan.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-100">{plan.name}</h4>
                    <p className="text-sm text-gray-400">
                      {extendedCropTypes.find(c => c.id === plan.cropType)?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => loadPlan(plan)}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Load
                  </button>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>{plan.stages.length} stages</p>
                  <p>{plan.totalDuration} days total</p>
                  <p>Updated: {new Date(plan.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}