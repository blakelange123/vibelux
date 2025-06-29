"use client"

import { useState } from 'react'
import { Cannabis, Plus, Copy, Edit2, Trash2, Save, X, Download, Upload, Star, Clock } from 'lucide-react'

interface Recipe {
  id: string
  name: string
  strainType: 'indica' | 'sativa' | 'hybrid'
  totalDays: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  expectedYield: string
  thc: string
  cbd: string
  terpenes: string[]
  rating: number
  usageCount: number
  phases: {
    name: string
    days: number
    light: { hours: number; ppfd: number; spectrum: string }
    temp: { day: number; night: number }
    humidity: { day: number; night: number }
    vpd: { day: number; night: number }
    ec: { min: number; max: number }
    ph: { min: number; max: number }
    co2: number
    notes: string
  }[]
}

export function StrainRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: 'recipe-1',
      name: 'Blue Dream - High Yield',
      strainType: 'hybrid',
      totalDays: 84,
      difficulty: 'intermediate',
      expectedYield: '500-600 g/m²',
      thc: '17-24%',
      cbd: '0.1-0.2%',
      terpenes: ['Myrcene', 'Pinene', 'Caryophyllene'],
      rating: 4.8,
      usageCount: 342,
      phases: [
        {
          name: 'Clone/Seedling',
          days: 14,
          light: { hours: 18, ppfd: 200, spectrum: 'Veg Spectrum' },
          temp: { day: 75, night: 70 },
          humidity: { day: 70, night: 75 },
          vpd: { day: 0.6, night: 0.5 },
          ec: { min: 0.8, max: 1.2 },
          ph: { min: 5.8, max: 6.2 },
          co2: 600,
          notes: 'Gentle conditions for root establishment'
        },
        {
          name: 'Vegetative',
          days: 28,
          light: { hours: 18, ppfd: 600, spectrum: 'Veg Spectrum' },
          temp: { day: 78, night: 72 },
          humidity: { day: 60, night: 65 },
          vpd: { day: 1.0, night: 0.8 },
          ec: { min: 1.5, max: 2.0 },
          ph: { min: 5.8, max: 6.2 },
          co2: 800,
          notes: 'Push vegetative growth with higher PPFD'
        },
        {
          name: 'Transition',
          days: 7,
          light: { hours: 12, ppfd: 700, spectrum: 'Transition' },
          temp: { day: 77, night: 70 },
          humidity: { day: 55, night: 60 },
          vpd: { day: 1.1, night: 0.9 },
          ec: { min: 1.8, max: 2.2 },
          ph: { min: 5.8, max: 6.2 },
          co2: 900,
          notes: 'Smooth transition to flowering'
        },
        {
          name: 'Flower',
          days: 56,
          light: { hours: 12, ppfd: 900, spectrum: 'Flower Spectrum' },
          temp: { day: 74, night: 66 },
          humidity: { day: 45, night: 50 },
          vpd: { day: 1.3, night: 1.1 },
          ec: { min: 2.2, max: 2.8 },
          ph: { min: 5.8, max: 6.2 },
          co2: 1200,
          notes: 'Maximize resin production'
        },
        {
          name: 'Flush',
          days: 7,
          light: { hours: 12, ppfd: 600, spectrum: 'Flower Spectrum' },
          temp: { day: 70, night: 62 },
          humidity: { day: 40, night: 45 },
          vpd: { day: 1.4, night: 1.2 },
          ec: { min: 0.0, max: 0.5 },
          ph: { min: 6.0, max: 6.5 },
          co2: 800,
          notes: 'Plain water only, enhance flavor'
        }
      ]
    },
    {
      id: 'recipe-2',
      name: 'OG Kush - Premium Quality',
      strainType: 'indica',
      totalDays: 77,
      difficulty: 'advanced',
      expectedYield: '400-500 g/m²',
      thc: '19-26%',
      cbd: '0.0-0.3%',
      terpenes: ['Limonene', 'Myrcene', 'Linalool'],
      rating: 4.9,
      usageCount: 218,
      phases: [
        {
          name: 'Clone/Seedling',
          days: 10,
          light: { hours: 18, ppfd: 150, spectrum: 'Veg Spectrum' },
          temp: { day: 74, night: 70 },
          humidity: { day: 65, night: 70 },
          vpd: { day: 0.7, night: 0.6 },
          ec: { min: 0.6, max: 1.0 },
          ph: { min: 5.8, max: 6.0 },
          co2: 500,
          notes: 'Lower light for compact growth'
        },
        {
          name: 'Vegetative',
          days: 21,
          light: { hours: 18, ppfd: 500, spectrum: 'Veg Spectrum' },
          temp: { day: 76, night: 70 },
          humidity: { day: 55, night: 60 },
          vpd: { day: 1.1, night: 0.9 },
          ec: { min: 1.4, max: 1.8 },
          ph: { min: 5.8, max: 6.0 },
          co2: 700,
          notes: 'Shorter veg for indica dominant'
        },
        {
          name: 'Flower',
          days: 56,
          light: { hours: 12, ppfd: 850, spectrum: 'Flower Spectrum' },
          temp: { day: 72, night: 64 },
          humidity: { day: 40, night: 45 },
          vpd: { day: 1.4, night: 1.2 },
          ec: { min: 2.0, max: 2.5 },
          ph: { min: 5.8, max: 6.0 },
          co2: 1100,
          notes: 'Stress for terpene production'
        },
        {
          name: 'Ripening',
          days: 10,
          light: { hours: 11, ppfd: 700, spectrum: 'UV Enhanced' },
          temp: { day: 68, night: 60 },
          humidity: { day: 35, night: 40 },
          vpd: { day: 1.5, night: 1.3 },
          ec: { min: 0.5, max: 1.0 },
          ph: { min: 6.0, max: 6.3 },
          co2: 600,
          notes: 'UV stress for potency boost'
        }
      ]
    }
  ])

  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<string | null>(null)
  const [showNewRecipe, setShowNewRecipe] = useState(false)

  const handleExportRecipe = (recipe: Recipe) => {
    const dataStr = JSON.stringify(recipe, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${recipe.name.replace(/\s+/g, '-').toLowerCase()}-recipe.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImportRecipe = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const recipe = JSON.parse(e.target?.result as string) as Recipe
        recipe.id = `recipe-${Date.now()}`
        setRecipes([...recipes, recipe])
      } catch (error) {
        console.error('Failed to import recipe:', error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cannabis className="w-5 h-5 text-green-400" />
            Strain Recipe Library
          </h3>
          <div className="flex items-center gap-2">
            <label className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImportRecipe}
                className="hidden"
              />
              <Upload className="w-4 h-4 inline mr-2" />
              Import
            </label>
            <button
              onClick={() => setShowNewRecipe(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Recipe
            </button>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid gap-4">
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-semibold text-white mb-1">{recipe.name}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full ${
                      recipe.strainType === 'indica' ? 'bg-purple-900/20 text-purple-400' :
                      recipe.strainType === 'sativa' ? 'bg-green-900/20 text-green-400' :
                      'bg-blue-900/20 text-blue-400'
                    }`}>
                      {recipe.strainType}
                    </span>
                    <span className="text-gray-400">
                      {recipe.totalDays} days
                    </span>
                    <span className={`text-${
                      recipe.difficulty === 'beginner' ? 'green' :
                      recipe.difficulty === 'intermediate' ? 'yellow' : 'red'
                    }-400`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(recipe.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-400 ml-1">
                      ({recipe.usageCount})
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Expected Yield</p>
                  <p className="font-medium text-white">{recipe.expectedYield}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">THC</p>
                  <p className="font-medium text-white">{recipe.thc}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">CBD</p>
                  <p className="font-medium text-white">{recipe.cbd}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Terpenes</p>
                  <p className="font-medium text-white text-sm">
                    {recipe.terpenes.join(', ')}
                  </p>
                </div>
              </div>

              {/* Phase Timeline */}
              <div className="mb-4">
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {recipe.phases.map((phase, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 px-3 py-1 bg-gray-700 rounded text-xs text-gray-300"
                      style={{ minWidth: `${(phase.days / recipe.totalDays) * 100}%` }}
                    >
                      {phase.name} ({phase.days}d)
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRecipe(recipe.id)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleExportRecipe(recipe)}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingRecipe(recipe.id)}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {recipes.find(r => r.id === selectedRecipe)?.name}
                </h3>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recipes.find(r => r.id === selectedRecipe)?.phases.map((phase, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {phase.name} ({phase.days} days)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Light</p>
                        <p className="text-white">
                          {phase.light.hours}h @ {phase.light.ppfd} PPFD
                        </p>
                        <p className="text-xs text-gray-500">{phase.light.spectrum}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Temperature</p>
                        <p className="text-white">
                          Day: {phase.temp.day}°F / Night: {phase.temp.night}°F
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Humidity</p>
                        <p className="text-white">
                          Day: {phase.humidity.day}% / Night: {phase.humidity.night}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">VPD</p>
                        <p className="text-white">
                          Day: {phase.vpd.day} / Night: {phase.vpd.night} kPa
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">EC/pH</p>
                        <p className="text-white">
                          {phase.ec.min}-{phase.ec.max} / {phase.ph.min}-{phase.ph.max}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">CO2</p>
                        <p className="text-white">{phase.co2} ppm</p>
                      </div>
                    </div>
                    {phase.notes && (
                      <div className="mt-3 p-3 bg-gray-900 rounded">
                        <p className="text-sm text-gray-300">{phase.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Recipes */}
      <div className="bg-gradient-to-r from-purple-900/20 to-green-900/20 rounded-xl p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">
          Community Favorites
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Gorilla Glue #4</h4>
            <p className="text-sm text-gray-400 mb-2">
              High THC sativa-dominant hybrid
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-300">4.9 (524)</span>
              </div>
              <button className="text-sm text-purple-400 hover:text-purple-300">
                View Recipe →
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Girl Scout Cookies</h4>
            <p className="text-sm text-gray-400 mb-2">
              Balanced hybrid with complex terpenes
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-300">4.8 (412)</span>
              </div>
              <button className="text-sm text-purple-400 hover:text-purple-300">
                View Recipe →
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Northern Lights</h4>
            <p className="text-sm text-gray-400 mb-2">
              Classic indica for beginners
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-300">4.7 (389)</span>
              </div>
              <button className="text-sm text-purple-400 hover:text-purple-300">
                View Recipe →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}