"use client"

import { useState } from 'react'
import {
  Leaf,
  Clock,
  Sun,
  Droplets,
  Thermometer,
  Zap,
  Calendar,
  TrendingUp,
  Save,
  Copy,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  Info
} from 'lucide-react'

interface GrowthPhase {
  name: string
  duration: number // days
  temperature: { day: number; night: number }
  humidity: { day: number; night: number }
  ppfd: number
  photoperiod: number
  co2: number
  ec: number
  ph: number
  irrigation: {
    frequency: number // times per day
    duration: number // minutes
    runoff: number // percentage
  }
}

interface CropRecipe {
  id: string
  name: string
  crop: string
  totalDays: number
  yield: { expected: number; unit: string }
  difficulty: 'easy' | 'medium' | 'hard'
  phases: GrowthPhase[]
  nutrients: {
    vegetative: { n: number; p: number; k: number }
    flowering: { n: number; p: number; k: number }
  }
  notes: string
}

const defaultRecipes: CropRecipe[] = [
  {
    id: 'lettuce-buttercrunch',
    name: 'Buttercrunch Lettuce - High Yield',
    crop: 'Lettuce',
    totalDays: 35,
    yield: { expected: 150, unit: 'g/plant' },
    difficulty: 'easy',
    phases: [
      {
        name: 'Germination',
        duration: 7,
        temperature: { day: 68, night: 65 },
        humidity: { day: 70, night: 75 },
        ppfd: 100,
        photoperiod: 16,
        co2: 800,
        ec: 0.8,
        ph: 5.8,
        irrigation: { frequency: 2, duration: 2, runoff: 10 }
      },
      {
        name: 'Seedling',
        duration: 7,
        temperature: { day: 70, night: 65 },
        humidity: { day: 65, night: 70 },
        ppfd: 150,
        photoperiod: 16,
        co2: 1000,
        ec: 1.2,
        ph: 5.8,
        irrigation: { frequency: 3, duration: 3, runoff: 15 }
      },
      {
        name: 'Vegetative',
        duration: 14,
        temperature: { day: 72, night: 68 },
        humidity: { day: 60, night: 65 },
        ppfd: 200,
        photoperiod: 18,
        co2: 1200,
        ec: 1.5,
        ph: 6.0,
        irrigation: { frequency: 4, duration: 4, runoff: 20 }
      },
      {
        name: 'Maturation',
        duration: 7,
        temperature: { day: 70, night: 65 },
        humidity: { day: 55, night: 60 },
        ppfd: 250,
        photoperiod: 16,
        co2: 1000,
        ec: 1.8,
        ph: 6.0,
        irrigation: { frequency: 4, duration: 5, runoff: 20 }
      }
    ],
    nutrients: {
      vegetative: { n: 150, p: 50, k: 200 },
      flowering: { n: 100, p: 50, k: 250 }
    },
    notes: 'Reduce nitrogen in final week for better leaf texture. Maintain consistent temperatures for uniform growth.'
  },
  {
    id: 'basil-genovese',
    name: 'Genovese Basil - Aromatic',
    crop: 'Basil',
    totalDays: 42,
    yield: { expected: 200, unit: 'g/plant' },
    difficulty: 'medium',
    phases: [
      {
        name: 'Germination',
        duration: 7,
        temperature: { day: 75, night: 70 },
        humidity: { day: 65, night: 70 },
        ppfd: 120,
        photoperiod: 16,
        co2: 800,
        ec: 0.8,
        ph: 6.0,
        irrigation: { frequency: 2, duration: 2, runoff: 10 }
      },
      {
        name: 'Seedling',
        duration: 10,
        temperature: { day: 75, night: 70 },
        humidity: { day: 60, night: 65 },
        ppfd: 180,
        photoperiod: 18,
        co2: 1000,
        ec: 1.4,
        ph: 6.2,
        irrigation: { frequency: 3, duration: 3, runoff: 15 }
      },
      {
        name: 'Vegetative',
        duration: 18,
        temperature: { day: 78, night: 72 },
        humidity: { day: 55, night: 60 },
        ppfd: 300,
        photoperiod: 18,
        co2: 1200,
        ec: 1.8,
        ph: 6.2,
        irrigation: { frequency: 4, duration: 4, runoff: 20 }
      },
      {
        name: 'Production',
        duration: 7,
        temperature: { day: 78, night: 72 },
        humidity: { day: 50, night: 55 },
        ppfd: 350,
        photoperiod: 16,
        co2: 1000,
        ec: 2.0,
        ph: 6.2,
        irrigation: { frequency: 5, duration: 4, runoff: 25 }
      }
    ],
    nutrients: {
      vegetative: { n: 200, p: 60, k: 250 },
      flowering: { n: 150, p: 80, k: 300 }
    },
    notes: 'Higher temperatures enhance essential oil production. Pinch tips regularly to promote bushier growth.'
  },
  {
    id: 'strawberry-albion',
    name: 'Albion Strawberry - Ever-bearing',
    crop: 'Strawberry',
    totalDays: 90,
    yield: { expected: 500, unit: 'g/plant' },
    difficulty: 'hard',
    phases: [
      {
        name: 'Establishment',
        duration: 21,
        temperature: { day: 68, night: 60 },
        humidity: { day: 70, night: 75 },
        ppfd: 200,
        photoperiod: 12,
        co2: 900,
        ec: 1.0,
        ph: 6.0,
        irrigation: { frequency: 3, duration: 5, runoff: 20 }
      },
      {
        name: 'Vegetative',
        duration: 28,
        temperature: { day: 72, night: 62 },
        humidity: { day: 65, night: 70 },
        ppfd: 300,
        photoperiod: 14,
        co2: 1200,
        ec: 1.4,
        ph: 6.0,
        irrigation: { frequency: 4, duration: 6, runoff: 25 }
      },
      {
        name: 'Flowering',
        duration: 21,
        temperature: { day: 75, night: 65 },
        humidity: { day: 60, night: 65 },
        ppfd: 400,
        photoperiod: 16,
        co2: 1200,
        ec: 1.6,
        ph: 6.0,
        irrigation: { frequency: 5, duration: 5, runoff: 30 }
      },
      {
        name: 'Fruiting',
        duration: 20,
        temperature: { day: 75, night: 65 },
        humidity: { day: 55, night: 60 },
        ppfd: 450,
        photoperiod: 16,
        co2: 1000,
        ec: 1.8,
        ph: 6.0,
        irrigation: { frequency: 6, duration: 4, runoff: 30 }
      }
    ],
    nutrients: {
      vegetative: { n: 150, p: 50, k: 200 },
      flowering: { n: 100, p: 80, k: 300 }
    },
    notes: 'Requires chill hours simulation. Maintain lower night temps during flowering for better fruit set.'
  }
]

export function VerticalFarmCropRecipes() {
  const [recipes, setRecipes] = useState<CropRecipe[]>(defaultRecipes)
  const [selectedRecipe, setSelectedRecipe] = useState<CropRecipe | null>(recipes[0])
  const [editingRecipe, setEditingRecipe] = useState<string | null>(null)
  const [showNewRecipe, setShowNewRecipe] = useState(false)
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    crop: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    expectedYield: 0,
    yieldUnit: 'g/plant',
    notes: '',
    stages: [] as GrowthPhase[]
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const calculateTotalDays = (phases: GrowthPhase[]) => {
    return phases.reduce((sum, phase) => sum + phase.duration, 0)
  }

  const exportRecipe = (recipe: CropRecipe) => {
    const json = JSON.stringify(recipe, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crop-recipe-${recipe.id}.json`
    a.click()
  }

  const handleCreateRecipe = () => {
    if (!newRecipe.name || !newRecipe.crop || newRecipe.stages.length === 0) {
      alert('Please fill in all required fields and add at least one growth stage.')
      return
    }

    const recipe: CropRecipe = {
      id: `recipe-${Date.now()}`,
      name: newRecipe.name,
      crop: newRecipe.crop,
      totalDays: calculateTotalDays(newRecipe.stages),
      yield: { expected: newRecipe.expectedYield, unit: newRecipe.yieldUnit },
      difficulty: newRecipe.difficulty,
      phases: newRecipe.stages,
      nutrients: {
        vegetative: { n: 120, p: 40, k: 180 }, // Default values
        flowering: { n: 80, p: 60, k: 240 }
      },
      notes: newRecipe.notes
    }

    setRecipes(prev => [...prev, recipe])
    setSelectedRecipe(recipe)
    setShowNewRecipe(false)
    
    // Reset form
    setNewRecipe({
      name: '',
      crop: '',
      difficulty: 'medium',
      expectedYield: 0,
      yieldUnit: 'g/plant',
      notes: '',
      stages: []
    })

    alert(`Recipe "${recipe.name}" created successfully!`)
  }

  const addGrowthStage = () => {
    const newStage: GrowthPhase = {
      name: `Stage ${newRecipe.stages.length + 1}`,
      duration: 7,
      temperature: { day: 72, night: 65 },
      humidity: { day: 65, night: 70 },
      ppfd: 200,
      photoperiod: 16,
      co2: 800,
      ec: 1.2,
      ph: 5.8,
      irrigation: { frequency: 3, duration: 5, runoff: 20 }
    }
    
    setNewRecipe(prev => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }))
  }

  const updateGrowthStage = (index: number, field: string, value: any) => {
    setNewRecipe(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === index ? { ...stage, [field]: value } : stage
      )
    }))
  }

  const removeGrowthStage = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Crop Recipe Management</h2>
            <p className="text-sm text-gray-400">
              Proven growth recipes with phase-specific environmental controls
            </p>
          </div>
          <button
            onClick={() => setShowNewRecipe(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Recipe
          </button>
        </div>

        {/* Recipe List */}
        <div className="grid md:grid-cols-3 gap-4">
          {recipes.map(recipe => (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className={`p-4 rounded-lg border transition-all text-left ${
                selectedRecipe?.id === recipe.id
                  ? 'bg-purple-600/20 border-purple-500'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <Leaf className="w-5 h-5 text-green-400" />
                <span className={`text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty.toUpperCase()}
                </span>
              </div>
              <h3 className="font-medium text-white mb-1">{recipe.name}</h3>
              <p className="text-sm text-gray-400 mb-2">{recipe.crop}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="text-gray-300 ml-1">{recipe.totalDays} days</span>
                </div>
                <div>
                  <span className="text-gray-500">Yield:</span>
                  <span className="text-gray-300 ml-1">{recipe.yield.expected}{recipe.yield.unit}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Recipe Details */}
      {selectedRecipe && (
        <>
          {/* Recipe Overview */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedRecipe.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportRecipe(selectedRecipe)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    const newRecipe = { ...selectedRecipe, id: `${selectedRecipe.id}-copy`, name: `${selectedRecipe.name} (Copy)` }
                    setRecipes([...recipes, newRecipe])
                  }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setEditingRecipe(selectedRecipe.id)}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    setRecipes(recipes.filter(r => r.id !== selectedRecipe.id))
                    setSelectedRecipe(recipes[0])
                  }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Total Duration</span>
                </div>
                <p className="text-xl font-semibold text-white">{selectedRecipe.totalDays} days</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Expected Yield</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {selectedRecipe.yield.expected} {selectedRecipe.yield.unit}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-400">Energy Use</span>
                </div>
                <p className="text-xl font-semibold text-white">
                  {selectedRecipe.phases.reduce((sum, phase) => sum + phase.ppfd * phase.photoperiod * phase.duration / 1000, 0).toFixed(1)} kWh
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Growth Phases</span>
                </div>
                <p className="text-xl font-semibold text-white">{selectedRecipe.phases.length}</p>
              </div>
            </div>
          </div>

          {/* Growth Phases Timeline */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Growth Phase Timeline</h3>
            
            {/* Timeline Bar */}
            <div className="relative mb-8">
              <div className="flex h-12 rounded-lg overflow-hidden">
                {selectedRecipe.phases.map((phase, index) => {
                  const width = (phase.duration / selectedRecipe.totalDays) * 100
                  const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600']
                  return (
                    <div
                      key={index}
                      className={`${colors[index % colors.length]} flex items-center justify-center text-white text-xs font-medium`}
                      style={{ width: `${width}%` }}
                    >
                      {phase.name} ({phase.duration}d)
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Phase Details */}
            <div className="space-y-4">
              {selectedRecipe.phases.map((phase, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{phase.name}</h4>
                    <span className="text-sm text-gray-400">{phase.duration} days</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-gray-400 mb-1">
                        <Thermometer className="w-3 h-3" />
                        <span>Temperature</span>
                      </div>
                      <p className="text-white">{phase.temperature.day}°F / {phase.temperature.night}°F</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-gray-400 mb-1">
                        <Droplets className="w-3 h-3" />
                        <span>Humidity</span>
                      </div>
                      <p className="text-white">{phase.humidity.day}% / {phase.humidity.night}%</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-gray-400 mb-1">
                        <Sun className="w-3 h-3" />
                        <span>Light</span>
                      </div>
                      <p className="text-white">{phase.ppfd} PPFD × {phase.photoperiod}h</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-gray-400 mb-1">
                        <Droplets className="w-3 h-3" />
                        <span>Irrigation</span>
                      </div>
                      <p className="text-white">{phase.irrigation.frequency}× {phase.irrigation.duration}min</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-700 text-sm">
                    <div>
                      <span className="text-gray-400">CO₂:</span>
                      <span className="text-white ml-1">{phase.co2} ppm</span>
                    </div>
                    <div>
                      <span className="text-gray-400">EC:</span>
                      <span className="text-white ml-1">{phase.ec} mS/cm</span>
                    </div>
                    <div>
                      <span className="text-gray-400">pH:</span>
                      <span className="text-white ml-1">{phase.ph}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrient Profile */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Nutrient Profile</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-3">Vegetative Stage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nitrogen (N)</span>
                    <span className="text-white">{selectedRecipe.nutrients.vegetative.n} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phosphorus (P)</span>
                    <span className="text-white">{selectedRecipe.nutrients.vegetative.p} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potassium (K)</span>
                    <span className="text-white">{selectedRecipe.nutrients.vegetative.k} ppm</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-white mb-3">Flowering/Fruiting Stage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nitrogen (N)</span>
                    <span className="text-white">{selectedRecipe.nutrients.flowering.n} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phosphorus (P)</span>
                    <span className="text-white">{selectedRecipe.nutrients.flowering.p} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potassium (K)</span>
                    <span className="text-white">{selectedRecipe.nutrients.flowering.k} ppm</span>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedRecipe.notes && (
              <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                  <p className="text-sm text-gray-300">{selectedRecipe.notes}</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Create Recipe Modal */}
      {showNewRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Recipe</h2>
              <button 
                onClick={() => setShowNewRecipe(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Recipe Name</label>
                <input
                  type="text"
                  value={newRecipe.name}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., High Yield Lettuce"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Crop Type</label>
                <select 
                  value={newRecipe.crop}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, crop: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select crop type</option>
                  <option value="Leafy Greens">Leafy Greens</option>
                  <option value="Herbs">Herbs</option>
                  <option value="Fruiting Crops">Fruiting Crops</option>
                  <option value="Root Vegetables">Root Vegetables</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Expected Yield</label>
                  <input
                    type="number"
                    value={newRecipe.expectedYield}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, expectedYield: parseFloat(e.target.value) || 0 }))}
                    placeholder="150"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                  <select 
                    value={newRecipe.difficulty}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={newRecipe.notes}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes about this recipe..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Growth Stages */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">Growth Stages</label>
                  <button
                    onClick={addGrowthStage}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Stage
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {newRecipe.stages.map((stage, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => updateGrowthStage(index, 'name', e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm flex-1 mr-2"
                        />
                        <button
                          onClick={() => removeGrowthStage(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="text-gray-400">Duration (days)</label>
                          <input
                            type="number"
                            value={stage.duration}
                            onChange={(e) => updateGrowthStage(index, 'duration', parseInt(e.target.value) || 0)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-1 py-1 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400">PPFD</label>
                          <input
                            type="number"
                            value={stage.ppfd}
                            onChange={(e) => updateGrowthStage(index, 'ppfd', parseInt(e.target.value) || 0)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-1 py-1 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400">Photoperiod (h)</label>
                          <input
                            type="number"
                            value={stage.photoperiod}
                            onChange={(e) => updateGrowthStage(index, 'photoperiod', parseInt(e.target.value) || 0)}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-1 py-1 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {newRecipe.stages.length === 0 && (
                    <div className="text-center text-gray-500 py-4 border-2 border-dashed border-gray-700 rounded-lg">
                      <p className="text-sm">No growth stages added yet</p>
                      <p className="text-xs text-gray-600">Click "Add Stage" to get started</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <p className="text-sm text-gray-400">
                  Total cycle: <span className="text-white font-medium">{calculateTotalDays(newRecipe.stages)} days</span>
                </p>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={handleCreateRecipe}
                  disabled={!newRecipe.name || !newRecipe.crop || newRecipe.stages.length === 0}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Create Recipe
                </button>
                <button 
                  onClick={() => setShowNewRecipe(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}