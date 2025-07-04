"use client"
import { useState, useEffect } from 'react'
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Clock,
  Zap,
  Leaf,
  BarChart3,
  Settings,
  Save,
  Play,
  Pause,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  Copy,
  Trash2,
  Edit,
  Info
} from 'lucide-react'

interface LightRecipe {
  id: string
  name: string
  description: string
  cropType: string
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting'
  photoperiod: {
    dayLength: number // hours
    nightLength: number // hours
    dawnDuration: number // minutes
    duskDuration: number // minutes
  }
  spectrum: {
    blue: number // 400-500nm percentage
    green: number // 500-600nm percentage
    red: number // 600-700nm percentage
    farRed: number // 700-800nm percentage
    uv: number // 280-400nm percentage
  }
  intensity: {
    ppfd: number // μmol/m²/s
    dli: number // mol/m²/day
    rampUp: number // minutes to reach target
    rampDown: number // minutes to dim down
  }
  specialTreatments: {
    eodFarRed: boolean // End-of-day far-red
    eodDuration: number // minutes
    eodIntensity: number // μmol/m²/s
    nightInterruption: boolean
    nightInterruptionTime: string // HH:MM
    nightInterruptionDuration: number // minutes
  }
  schedule: {
    startTime: string // HH:MM
    enabled: boolean
    repeatDays: string[] // ['Mon', 'Tue', etc.]
  }
}

interface CropPreset {
  id: string
  name: string
  icon: string
  stages: {
    [key: string]: Partial<LightRecipe>
  }
}

export function LightRecipeManager() {
  const [recipes, setRecipes] = useState<LightRecipe[]>([
    {
      id: '1',
      name: 'Lettuce - High Quality',
      description: 'Optimized for crisp texture and nutrient density',
      cropType: 'Lettuce',
      growthStage: 'vegetative',
      photoperiod: {
        dayLength: 16,
        nightLength: 8,
        dawnDuration: 30,
        duskDuration: 30
      },
      spectrum: {
        blue: 20,
        green: 10,
        red: 65,
        farRed: 5,
        uv: 0
      },
      intensity: {
        ppfd: 250,
        dli: 14.4,
        rampUp: 15,
        rampDown: 15
      },
      specialTreatments: {
        eodFarRed: true,
        eodDuration: 15,
        eodIntensity: 50,
        nightInterruption: false,
        nightInterruptionTime: '',
        nightInterruptionDuration: 0
      },
      schedule: {
        startTime: '06:00',
        enabled: true,
        repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      }
    },
    {
      id: '2',
      name: 'Cannabis - Flowering Boost',
      description: 'Enhanced terpene and cannabinoid production',
      cropType: 'Cannabis',
      growthStage: 'flowering',
      photoperiod: {
        dayLength: 12,
        nightLength: 12,
        dawnDuration: 15,
        duskDuration: 15
      },
      spectrum: {
        blue: 10,
        green: 5,
        red: 70,
        farRed: 15,
        uv: 0
      },
      intensity: {
        ppfd: 800,
        dli: 34.6,
        rampUp: 30,
        rampDown: 30
      },
      specialTreatments: {
        eodFarRed: true,
        eodDuration: 20,
        eodIntensity: 100,
        nightInterruption: false,
        nightInterruptionTime: '',
        nightInterruptionDuration: 0
      },
      schedule: {
        startTime: '06:00',
        enabled: true,
        repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      }
    }
  ])

  const [selectedRecipe, setSelectedRecipe] = useState<LightRecipe | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeRecipes, setActiveRecipes] = useState<string[]>([])

  const cropPresets: CropPreset[] = [
    {
      id: 'lettuce',
      name: 'Lettuce',
      icon: '🥬',
      stages: {
        seedling: {
          photoperiod: { dayLength: 18, nightLength: 6, dawnDuration: 15, duskDuration: 15 },
          spectrum: { blue: 30, green: 10, red: 55, farRed: 5, uv: 0 },
          intensity: { ppfd: 150, dli: 9.7, rampUp: 10, rampDown: 10 }
        },
        vegetative: {
          photoperiod: { dayLength: 16, nightLength: 8, dawnDuration: 30, duskDuration: 30 },
          spectrum: { blue: 20, green: 10, red: 65, farRed: 5, uv: 0 },
          intensity: { ppfd: 250, dli: 14.4, rampUp: 15, rampDown: 15 }
        }
      }
    },
    {
      id: 'tomato',
      name: 'Tomato',
      icon: '🍅',
      stages: {
        seedling: {
          photoperiod: { dayLength: 16, nightLength: 8, dawnDuration: 20, duskDuration: 20 },
          spectrum: { blue: 25, green: 10, red: 60, farRed: 5, uv: 0 },
          intensity: { ppfd: 200, dli: 11.5, rampUp: 15, rampDown: 15 }
        },
        vegetative: {
          photoperiod: { dayLength: 18, nightLength: 6, dawnDuration: 30, duskDuration: 30 },
          spectrum: { blue: 20, green: 10, red: 65, farRed: 5, uv: 0 },
          intensity: { ppfd: 400, dli: 25.9, rampUp: 20, rampDown: 20 }
        },
        flowering: {
          photoperiod: { dayLength: 16, nightLength: 8, dawnDuration: 30, duskDuration: 30 },
          spectrum: { blue: 15, green: 10, red: 65, farRed: 10, uv: 0 },
          intensity: { ppfd: 500, dli: 28.8, rampUp: 20, rampDown: 20 }
        },
        fruiting: {
          photoperiod: { dayLength: 14, nightLength: 10, dawnDuration: 30, duskDuration: 30 },
          spectrum: { blue: 10, green: 10, red: 70, farRed: 10, uv: 0 },
          intensity: { ppfd: 600, dli: 30.2, rampUp: 20, rampDown: 20 }
        }
      }
    },
    {
      id: 'cannabis',
      name: 'Cannabis',
      icon: '🌿',
      stages: {
        seedling: {
          photoperiod: { dayLength: 18, nightLength: 6, dawnDuration: 15, duskDuration: 15 },
          spectrum: { blue: 30, green: 10, red: 55, farRed: 5, uv: 0 },
          intensity: { ppfd: 200, dli: 13.0, rampUp: 15, rampDown: 15 }
        },
        vegetative: {
          photoperiod: { dayLength: 18, nightLength: 6, dawnDuration: 20, duskDuration: 20 },
          spectrum: { blue: 25, green: 10, red: 60, farRed: 5, uv: 0 },
          intensity: { ppfd: 600, dli: 38.9, rampUp: 20, rampDown: 20 }
        },
        flowering: {
          photoperiod: { dayLength: 12, nightLength: 12, dawnDuration: 15, duskDuration: 15 },
          spectrum: { blue: 10, green: 5, red: 70, farRed: 15, uv: 0 },
          intensity: { ppfd: 800, dli: 34.6, rampUp: 30, rampDown: 30 }
        }
      }
    },
    {
      id: 'strawberry',
      name: 'Strawberry',
      icon: '🍓',
      stages: {
        vegetative: {
          photoperiod: { dayLength: 8, nightLength: 16, dawnDuration: 20, duskDuration: 20 },
          spectrum: { blue: 20, green: 10, red: 65, farRed: 5, uv: 0 },
          intensity: { ppfd: 200, dli: 5.8, rampUp: 15, rampDown: 15 }
        },
        flowering: {
          photoperiod: { dayLength: 16, nightLength: 8, dawnDuration: 30, duskDuration: 30 },
          spectrum: { blue: 15, green: 10, red: 65, farRed: 10, uv: 0 },
          intensity: { ppfd: 300, dli: 17.3, rampUp: 20, rampDown: 20 }
        }
      }
    }
  ]

  const calculateDLI = (ppfd: number, hours: number): number => {
    return (ppfd * hours * 3600) / 1000000
  }

  const getTimeUntilNext = (startTime: string): string => {
    const now = new Date()
    const [hours, minutes] = startTime.split(':').map(Number)
    const next = new Date()
    next.setHours(hours, minutes, 0, 0)
    
    if (next <= now) {
      next.setDate(next.getDate() + 1)
    }
    
    const diff = next.getTime() - now.getTime()
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60))
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hoursUntil}h ${minutesUntil}m`
  }

  const toggleRecipe = (recipeId: string) => {
    setActiveRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    )
  }

  const duplicateRecipe = (recipe: LightRecipe) => {
    const newRecipe: LightRecipe = {
      ...recipe,
      id: Date.now().toString(),
      name: `${recipe.name} (Copy)`,
      schedule: { ...recipe.schedule, enabled: false }
    }
    setRecipes([...recipes, newRecipe])
  }

  const deleteRecipe = (recipeId: string) => {
    setRecipes(recipes.filter(r => r.id !== recipeId))
    setActiveRecipes(activeRecipes.filter(id => id !== recipeId))
    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe(null)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Light Recipe Manager</h1>
          <p className="text-gray-400">Create and manage advanced lighting programs with photoperiod control</p>
        </div>
        <button
          onClick={() => {
            const newRecipe = {
              id: Date.now().toString(),
              name: 'New Recipe',
              description: '',
              cropType: 'Custom',
              growthStage: 'vegetative' as const,
              photoperiod: {
                dayLength: 16,
                nightLength: 8,
                dawnDuration: 30,
                duskDuration: 30
              },
              spectrum: {
                blue: 20,
                green: 10,
                red: 65,
                farRed: 5,
                uv: 0
              },
              intensity: {
                ppfd: 300,
                dli: 17.3,
                rampUp: 15,
                rampDown: 15
              },
              specialTreatments: {
                eodFarRed: false,
                eodDuration: 15,
                eodIntensity: 50,
                nightInterruption: false,
                nightInterruptionTime: '03:00',
                nightInterruptionDuration: 15
              },
              schedule: {
                startTime: '06:00',
                enabled: false,
                repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              }
            }
            setSelectedRecipe(newRecipe)
            setIsEditing(true)
            // Scroll to editor section
            setTimeout(() => {
              document.querySelector('.recipe-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          Create Recipe
        </button>
      </div>

      {/* Crop Presets */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Quick Start Presets</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cropPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => {
                // Create a new recipe from preset
                const firstStage = Object.keys(preset.stages)[0] as keyof typeof preset.stages
                const stageData = preset.stages[firstStage]
                const newRecipe: LightRecipe = {
                  id: Date.now().toString(),
                  name: `${preset.name} - ${firstStage}`,
                  description: `Auto-generated from ${preset.name} preset`,
                  cropType: preset.name,
                  growthStage: firstStage as 'vegetative' | 'flowering' | 'fruiting' | 'seedling',
                  photoperiod: stageData.photoperiod || { dayLength: 16, nightLength: 8, dawnDuration: 30, duskDuration: 30 },
                  spectrum: stageData.spectrum || { blue: 20, green: 10, red: 65, farRed: 5, uv: 0 },
                  intensity: stageData.intensity || { ppfd: 300, dli: 17.3, rampUp: 15, rampDown: 15 },
                  specialTreatments: {
                    eodFarRed: false,
                    eodDuration: 15,
                    eodIntensity: 50,
                    nightInterruption: false,
                    nightInterruptionTime: '03:00',
                    nightInterruptionDuration: 15
                  },
                  schedule: {
                    startTime: '06:00',
                    enabled: false,
                    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                  }
                }
                setSelectedRecipe(newRecipe)
                setIsEditing(true)
              }}
              className="bg-gray-700 rounded-lg p-4 text-center hover:bg-gray-600 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
            >
              <div className="text-4xl mb-2">{preset.icon}</div>
              <h3 className="font-medium text-gray-100">{preset.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{Object.keys(preset.stages).length} stages</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Saved Recipes</h2>
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all ${
                selectedRecipe?.id === recipe.id ? 'ring-2 ring-purple-500' : 'hover:bg-gray-700'
              }`}
              onClick={() => {
                setSelectedRecipe(recipe)
                setIsEditing(false)
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-100">{recipe.name}</h3>
                  <p className="text-sm text-gray-400">{recipe.cropType} - {recipe.growthStage}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleRecipe(recipe.id)
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    activeRecipes.includes(recipe.id)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {activeRecipes.includes(recipe.id) ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-gray-400">
                  <Sun className="w-3 h-3" />
                  <span>{recipe.photoperiod.dayLength}h day</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Zap className="w-3 h-3" />
                  <span>{recipe.intensity.ppfd} PPFD</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <BarChart3 className="w-3 h-3" />
                  <span>{recipe.intensity.dli} DLI</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{recipe.schedule.startTime}</span>
                </div>
              </div>

              {recipe.specialTreatments.eodFarRed && (
                <div className="mt-2 flex items-center gap-1 text-xs text-purple-400">
                  <Sunset className="w-3 h-3" />
                  <span>EOD Far-Red</span>
                </div>
              )}

              {activeRecipes.includes(recipe.id) && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-xs text-green-400">
                    Active • Next cycle in {getTimeUntilNext(recipe.schedule.startTime)}
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    duplicateRecipe(recipe)
                  }}
                  className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                >
                  <Copy className="w-3 h-3 mx-auto" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRecipe(recipe)
                    setIsEditing(true)
                  }}
                  className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                >
                  <Edit className="w-3 h-3 mx-auto" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteRecipe(recipe.id)
                  }}
                  className="flex-1 py-1 bg-gray-700 hover:bg-red-600 rounded text-xs transition-colors"
                >
                  <Trash2 className="w-3 h-3 mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recipe Detail/Editor */}
        {selectedRecipe && (
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 recipe-editor">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-100">
                {isEditing ? 'Edit Recipe' : 'Recipe Details'}
              </h2>
              <div className="flex gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={() => {
                        // Save logic here
                        setIsEditing(false)
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Recipe Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedRecipe.name}
                    onChange={(e) => setSelectedRecipe({ ...selectedRecipe, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                  />
                ) : (
                  <p className="text-gray-100">{selectedRecipe.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Crop Type</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={selectedRecipe.cropType}
                      onChange={(e) => setSelectedRecipe({ ...selectedRecipe, cropType: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                    />
                  ) : (
                    <p className="text-gray-100">{selectedRecipe.cropType}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Growth Stage</label>
                  {isEditing ? (
                    <select
                      value={selectedRecipe.growthStage}
                      onChange={(e) => setSelectedRecipe({ ...selectedRecipe, growthStage: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                    >
                      <option value="seedling">Seedling</option>
                      <option value="vegetative">Vegetative</option>
                      <option value="flowering">Flowering</option>
                      <option value="fruiting">Fruiting</option>
                    </select>
                  ) : (
                    <p className="text-gray-100 capitalize">{selectedRecipe.growthStage}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Photoperiod Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-400" />
                Photoperiod Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Day Length (hours)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={selectedRecipe.photoperiod.dayLength}
                      onChange={(e) => setSelectedRecipe({
                        ...selectedRecipe,
                        photoperiod: { ...selectedRecipe.photoperiod, dayLength: Number(e.target.value) }
                      })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                    />
                  ) : (
                    <p className="text-gray-100">{selectedRecipe.photoperiod.dayLength} hours</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Dawn/Dusk Duration (min)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={selectedRecipe.photoperiod.dawnDuration}
                      onChange={(e) => setSelectedRecipe({
                        ...selectedRecipe,
                        photoperiod: { 
                          ...selectedRecipe.photoperiod, 
                          dawnDuration: Number(e.target.value),
                          duskDuration: Number(e.target.value)
                        }
                      })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                    />
                  ) : (
                    <p className="text-gray-100">{selectedRecipe.photoperiod.dawnDuration} minutes</p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Treatments */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <Sunset className="w-5 h-5 text-purple-400" />
                Special Treatments
              </h3>
              
              {/* End-of-Day Far-Red */}
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sunset className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-gray-100">End-of-Day Far-Red Treatment</span>
                    <button className="p-1 hover:bg-gray-600 rounded">
                      <Info className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={selectedRecipe.specialTreatments.eodFarRed}
                      onChange={(e) => setSelectedRecipe({
                        ...selectedRecipe,
                        specialTreatments: { 
                          ...selectedRecipe.specialTreatments, 
                          eodFarRed: e.target.checked 
                        }
                      })}
                      className="w-4 h-4 text-purple-600"
                    />
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedRecipe.specialTreatments.eodFarRed
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      {selectedRecipe.specialTreatments.eodFarRed ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
                
                {selectedRecipe.specialTreatments.eodFarRed && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Duration (min)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={selectedRecipe.specialTreatments.eodDuration}
                          onChange={(e) => setSelectedRecipe({
                            ...selectedRecipe,
                            specialTreatments: { 
                              ...selectedRecipe.specialTreatments, 
                              eodDuration: Number(e.target.value) 
                            }
                          })}
                          className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:border-purple-500 text-gray-100"
                        />
                      ) : (
                        <p className="text-gray-100">{selectedRecipe.specialTreatments.eodDuration}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Intensity (μmol/m²/s)</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={selectedRecipe.specialTreatments.eodIntensity}
                          onChange={(e) => setSelectedRecipe({
                            ...selectedRecipe,
                            specialTreatments: { 
                              ...selectedRecipe.specialTreatments, 
                              eodIntensity: Number(e.target.value) 
                            }
                          })}
                          className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:border-purple-500 text-gray-100"
                        />
                      ) : (
                        <p className="text-gray-100">{selectedRecipe.specialTreatments.eodIntensity}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Night Interruption */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-gray-100">Night Interruption</span>
                    <button className="p-1 hover:bg-gray-600 rounded">
                      <Info className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={selectedRecipe.specialTreatments.nightInterruption}
                      onChange={(e) => setSelectedRecipe({
                        ...selectedRecipe,
                        specialTreatments: { 
                          ...selectedRecipe.specialTreatments, 
                          nightInterruption: e.target.checked 
                        }
                      })}
                      className="w-4 h-4 text-purple-600"
                    />
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedRecipe.specialTreatments.nightInterruption
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-gray-600 text-gray-400'
                    }`}>
                      {selectedRecipe.specialTreatments.nightInterruption ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Spectrum Visualization */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Spectrum Distribution</h3>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="space-y-3">
                  {Object.entries(selectedRecipe.spectrum).map(([color, value]) => (
                    <div key={color}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-gray-300">{color}</span>
                        <span className="text-gray-100">{value}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            color === 'blue' ? 'bg-blue-500' :
                            color === 'green' ? 'bg-green-500' :
                            color === 'red' ? 'bg-red-500' :
                            color === 'farRed' ? 'bg-red-700' :
                            'bg-purple-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}