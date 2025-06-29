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
  Upload,
  TrendingUp,
  Leaf,
  Activity,
  Calendar,
  Clock,
  Target,
  FlaskRound,
  Zap,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Copy,
  Check,
  X,
  Settings,
  Database,
  FileJson,
  FileSpreadsheet,
  Share2,
  Lock,
  Unlock,
  AlertTriangle,
  HelpCircle
} from 'lucide-react'
import {
  CustomNutrientRecipe,
  CustomFormulation,
  ExtendedFertilizer,
  StageProfile,
  GrowthPlan,
  extendedCropTypes,
  growthStages,
  elementRelationships,
  validateRecipe,
  exportRecipe,
  RecipeValidation
} from '@/lib/nutrient-recipe-models'

interface RecipeBuilderProps {
  onSave: (recipe: CustomNutrientRecipe) => void
  initialRecipe?: CustomNutrientRecipe
  onCancel: () => void
}

function RecipeBuilder({ onSave, initialRecipe, onCancel }: RecipeBuilderProps) {
  const [recipe, setRecipe] = useState<CustomNutrientRecipe>(
    initialRecipe || {
      id: Date.now().toString(),
      name: '',
      cropType: '',
      growthStage: '',
      targetEC: 1.5,
      targetPH: 5.8,
      elements: {
        N: 150, P: 50, K: 200, Ca: 150, Mg: 50, S: 60,
        Fe: 3, Mn: 0.5, B: 0.3, Zn: 0.05, Cu: 0.05, Mo: 0.05
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  )

  const [validation, setValidation] = useState<RecipeValidation | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const result = validateRecipe(recipe)
    setValidation(result)
  }, [recipe])

  const updateElement = (element: string, value: number) => {
    setRecipe({
      ...recipe,
      elements: { ...recipe.elements, [element]: value }
    })
  }

  const categories = ['all', ...new Set(extendedCropTypes.map(c => c.category))]
  const filteredCrops = selectedCategory === 'all' 
    ? extendedCropTypes 
    : extendedCropTypes.filter(c => c.category === selectedCategory)

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-100">
          {initialRecipe ? 'Edit Recipe' : 'Create Custom Recipe'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Basic Information */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Recipe Name
          </label>
          <input
            type="text"
            value={recipe.name}
            onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
            placeholder="e.g., High-Yield Tomato Formula"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Crop Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Crop Type
            </label>
            <select
              value={recipe.cropType}
              onChange={(e) => setRecipe({ ...recipe, cropType: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            >
              <option value="">Select crop type</option>
              {filteredCrops.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Growth Stage
            </label>
            <select
              value={recipe.growthStage}
              onChange={(e) => setRecipe({ ...recipe, growthStage: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            >
              <option value="">Select stage</option>
              {Object.entries(growthStages).map(([category, stages]) => (
                <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                  {stages.map(stage => (
                    <option key={stage} value={stage.toLowerCase().replace(' ', '-')}>
                      {stage}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={recipe.description || ''}
              onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
              placeholder="Brief description"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Target EC (mS/cm)
            </label>
            <input
              type="number"
              step="0.1"
              value={recipe.targetEC}
              onChange={(e) => setRecipe({ ...recipe, targetEC: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Target pH
            </label>
            <input
              type="number"
              step="0.1"
              value={recipe.targetPH}
              onChange={(e) => setRecipe({ ...recipe, targetPH: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Nutrient Elements */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-100">Nutrient Elements (PPM)</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Elements
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Macronutrients */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Primary Macronutrients</p>
          <div className="grid grid-cols-3 gap-3">
            {['N', 'P', 'K'].map(element => (
              <div key={element}>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  {element} (ppm)
                </label>
                <input
                  type="number"
                  value={recipe.elements[element as keyof typeof recipe.elements]}
                  onChange={(e) => updateElement(element, Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Macronutrients */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Secondary Macronutrients</p>
          <div className="grid grid-cols-3 gap-3">
            {['Ca', 'Mg', 'S'].map(element => (
              <div key={element}>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  {element} (ppm)
                </label>
                <input
                  type="number"
                  value={recipe.elements[element as keyof typeof recipe.elements]}
                  onChange={(e) => updateElement(element, Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Micronutrients */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Micronutrients</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {['Fe', 'Mn', 'B', 'Zn', 'Cu', 'Mo'].map(element => (
              <div key={element}>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  {element} (ppm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={recipe.elements[element as keyof typeof recipe.elements]}
                  onChange={(e) => updateElement(element, Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Elements */}
        {showAdvanced && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Additional Elements</p>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {['Cl', 'Si', 'Na', 'Co', 'Ni'].map(element => (
                <div key={element}>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    {element} (ppm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={recipe.elements[element as keyof typeof recipe.elements] || 0}
                    onChange={(e) => updateElement(element, Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Element Ratios */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-100 mb-3">Element Ratios</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-gray-400">N:K:</span>
            <span className="ml-2 text-gray-100">
              {(recipe.elements.N / recipe.elements.K).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">K:Ca:</span>
            <span className="ml-2 text-gray-100">
              {(recipe.elements.K / recipe.elements.Ca).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Ca:Mg:</span>
            <span className="ml-2 text-gray-100">
              {(recipe.elements.Ca / recipe.elements.Mg).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Fe:Mn:</span>
            <span className="ml-2 text-gray-100">
              {(recipe.elements.Fe / recipe.elements.Mn).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {validation && (
        <div className="mb-6 space-y-2">
          {validation.errors.length > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-200">
                  {validation.errors.map((error, idx) => (
                    <p key={idx}>{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {validation.warnings.length > 0 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-200">
                  {validation.warnings.map((warning, idx) => (
                    <p key={idx}>{warning}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {validation.suggestions.length > 0 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-200">
                  {validation.suggestions.map((suggestion, idx) => (
                    <p key={idx}>{suggestion}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(recipe)}
          disabled={!validation?.isValid || !recipe.name || !recipe.cropType}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Recipe
        </button>
      </div>
    </div>
  )
}

// Main Enhanced Nutrient Calculator Component
export function EnhancedNutrientCalculator() {
  const [tankVolume, setTankVolume] = useState(1000)
  const [concentrationFactor, setConcentrationFactor] = useState(100)
  const [waterAnalysis, setWaterAnalysis] = useState({
    Ca: 0, Mg: 0, S: 0, HCO3: 0, Na: 0, Cl: 0, EC: 0, pH: 7
  })
  
  const [selectedRecipe, setSelectedRecipe] = useState<CustomNutrientRecipe | null>(null)
  const [customRecipes, setCustomRecipes] = useState<CustomNutrientRecipe[]>([])
  const [showRecipeBuilder, setShowRecipeBuilder] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<CustomNutrientRecipe | null>(null)
  const [activeTab, setActiveTab] = useState<'calculator' | 'recipes' | 'stages' | 'formulations'>('calculator')
  const [showImportExport, setShowImportExport] = useState(false)

  // Load custom recipes from localStorage
  useEffect(() => {
    const savedRecipes = localStorage.getItem('vibelux-custom-recipes')
    if (savedRecipes) {
      setCustomRecipes(JSON.parse(savedRecipes))
    }
  }, [])

  // Save custom recipes to localStorage
  const saveCustomRecipes = (recipes: CustomNutrientRecipe[]) => {
    setCustomRecipes(recipes)
    localStorage.setItem('vibelux-custom-recipes', JSON.stringify(recipes))
  }

  const handleSaveRecipe = (recipe: CustomNutrientRecipe) => {
    if (editingRecipe) {
      // Update existing recipe
      const updated = customRecipes.map(r => 
        r.id === recipe.id ? { ...recipe, updatedAt: new Date() } : r
      )
      saveCustomRecipes(updated)
    } else {
      // Add new recipe
      saveCustomRecipes([...customRecipes, recipe])
    }
    setShowRecipeBuilder(false)
    setEditingRecipe(null)
  }

  const handleDeleteRecipe = (id: string) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      saveCustomRecipes(customRecipes.filter(r => r.id !== id))
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(null)
      }
    }
  }

  const handleExportRecipe = (recipe: CustomNutrientRecipe, format: 'json' | 'csv' = 'json') => {
    const data = exportRecipe(recipe, format)
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${recipe.name.replace(/\s+/g, '-')}-recipe.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportRecipe = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        
        // Validate imported data
        if (data.recipe && data.format === 'vibelux') {
          const imported = data.recipe as CustomNutrientRecipe
          imported.id = Date.now().toString() // Generate new ID
          imported.createdAt = new Date()
          imported.updatedAt = new Date()
          
          saveCustomRecipes([...customRecipes, imported])
          alert('Recipe imported successfully!')
        } else {
          alert('Invalid recipe format')
        }
      } catch (error) {
        alert('Error importing recipe: ' + error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Enhanced Nutrient Dosing Calculator
          </h1>
          <p className="text-gray-400">
            Create custom recipes, manage formulations, and optimize nutrient solutions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportExport(!showImportExport)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Database className="w-4 h-4" />
            Import/Export
          </button>
          <button
            onClick={() => {
              setEditingRecipe(null)
              setShowRecipeBuilder(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Recipe
          </button>
        </div>
      </div>

      {/* Import/Export Panel */}
      {showImportExport && (
        <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-100">Import/Export Recipes</h3>
            <button
              onClick={() => setShowImportExport(false)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Import Recipe</h4>
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportRecipe}
                  className="hidden"
                  id="recipe-import"
                />
                <label
                  htmlFor="recipe-import"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </label>
                <p className="text-xs text-gray-400">
                  Supports Vibelux JSON format
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Export All Recipes</h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const data = JSON.stringify({
                      version: '1.0',
                      format: 'vibelux-collection',
                      recipes: customRecipes,
                      exportDate: new Date()
                    }, null, 2)
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `vibelux-recipes-${Date.now()}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export Collection
                </button>
                <p className="text-xs text-gray-400">
                  Export all {customRecipes.length} custom recipes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'calculator'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Calculator
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'recipes'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Custom Recipes ({customRecipes.length})
        </button>
        <button
          onClick={() => setActiveTab('stages')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'stages'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Growth Stages
        </button>
        <button
          onClick={() => setActiveTab('formulations')}
          className={`flex-1 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'formulations'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Formulations
        </button>
      </div>

      {/* Recipe Builder Modal */}
      {showRecipeBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <RecipeBuilder
              onSave={handleSaveRecipe}
              initialRecipe={editingRecipe || undefined}
              onCancel={() => {
                setShowRecipeBuilder(false)
                setEditingRecipe(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator content would go here - similar to original component */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">
                Select or Create Recipe
              </h2>
              <p className="text-gray-400">
                Calculator functionality will be implemented here...
              </p>
            </div>
          </div>
          <div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                Results
              </h3>
              <p className="text-gray-400">
                Calculation results will appear here...
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customRecipes.map(recipe => (
            <div key={recipe.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-100">{recipe.name}</h3>
                  <p className="text-sm text-gray-400">
                    {extendedCropTypes.find(c => c.id === recipe.cropType)?.name} - {recipe.growthStage}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                    title="Use Recipe"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingRecipe(recipe)
                      setShowRecipeBuilder(true)
                    }}
                    className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                    title="Edit Recipe"
                  >
                    <Edit className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleExportRecipe(recipe)}
                    className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                    title="Export Recipe"
                  >
                    <Download className="w-4 h-4 text-purple-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                    title="Delete Recipe"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">EC:</span>
                  <span className="text-gray-100">{recipe.targetEC} mS/cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">pH:</span>
                  <span className="text-gray-100">{recipe.targetPH}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">NPK:</span>
                  <span className="text-gray-100">
                    {recipe.elements.N}-{recipe.elements.P}-{recipe.elements.K}
                  </span>
                </div>
              </div>
              
              {recipe.description && (
                <p className="mt-3 text-xs text-gray-400 italic">
                  {recipe.description}
                </p>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                Updated: {new Date(recipe.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          
          {customRecipes.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 mb-4">No custom recipes yet</p>
              <button
                onClick={() => setShowRecipeBuilder(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Recipe
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stages' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Stage-Specific Nutrient Management
          </h2>
          <p className="text-gray-400">
            Create growth plans with stage-specific nutrient adjustments...
          </p>
        </div>
      )}

      {activeTab === 'formulations' && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">
            Custom Formulations
          </h2>
          <p className="text-gray-400">
            Build and save custom fertilizer formulations...
          </p>
        </div>
      )}
    </div>
  )
}