// Enhanced nutrient recipe models for custom recipe creation

export interface NutrientElement {
  symbol: string
  name: string
  atomicWeight: number
  valence: number
}

export interface CustomNutrientRecipe {
  id: string
  name: string
  description?: string
  cropType: string
  growthStage: string
  targetEC: number
  targetPH: number
  elements: {
    N: number   // Nitrogen (ppm)
    P: number   // Phosphorus (ppm) as P
    K: number   // Potassium (ppm)
    Ca: number  // Calcium (ppm)
    Mg: number  // Magnesium (ppm)
    S: number   // Sulfur (ppm)
    Fe: number  // Iron (ppm)
    Mn: number  // Manganese (ppm)
    B: number   // Boron (ppm)
    Zn: number  // Zinc (ppm)
    Cu: number  // Copper (ppm)
    Mo: number  // Molybdenum (ppm)
    Cl?: number // Chlorine (ppm)
    Si?: number // Silicon (ppm)
    Na?: number // Sodium (ppm)
    Co?: number // Cobalt (ppm)
    Ni?: number // Nickel (ppm)
  }
  ratios?: {
    'N:K'?: number
    'K:Ca'?: number
    'Ca:Mg'?: number
    'Fe:Mn'?: number
  }
  createdAt: Date
  updatedAt: Date
  author?: string
  tags?: string[]
  isPublic?: boolean
  version?: number
}

export interface CustomFormulation {
  id: string
  name: string
  recipeId: string
  fertilizers: {
    fertId: string
    name: string
    amount: number // g/L of stock solution
    stockTank: 'A' | 'B' | 'C'
    order: number // mixing order
  }[]
  stockConcentration: number // dilution ratio (e.g., 100 for 1:100)
  totalCost: number
  costPerLiter: number
  warnings?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface StageProfile {
  stageName: string
  duration: number // days
  recipe: CustomNutrientRecipe
  adjustments?: {
    week: number
    modifications: Partial<CustomNutrientRecipe['elements']>
    ecAdjustment?: number
    phAdjustment?: number
  }[]
}

export interface GrowthPlan {
  id: string
  name: string
  cropType: string
  totalDuration: number // days
  stages: StageProfile[]
  environmentalConditions?: {
    temperature: { min: number; max: number }
    humidity: { min: number; max: number }
    vpd: { min: number; max: number }
    co2: number
    lightIntensity: number // PPFD
    photoperiod: number // hours
  }
  irrigationSettings?: {
    systemType: string
    frequency: string
    runoffTarget: number
  }
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Extended fertilizer database with more options
export interface ExtendedFertilizer {
  id: string
  name: string
  formula: string
  type: 'salt' | 'chelate' | 'organic' | 'acid' | 'base'
  analysis: {
    // Macronutrients
    N?: number      // Total nitrogen
    NH4?: number    // Ammoniacal nitrogen
    NO3?: number    // Nitrate nitrogen
    P?: number      // Phosphorus (as P2O5)
    K?: number      // Potassium (as K2O)
    Ca?: number     // Calcium
    Mg?: number     // Magnesium
    S?: number      // Sulfur
    // Micronutrients
    Fe?: number     // Iron
    Mn?: number     // Manganese
    B?: number      // Boron
    Zn?: number     // Zinc
    Cu?: number     // Copper
    Mo?: number     // Molybdenum
    Cl?: number     // Chlorine
    Si?: number     // Silicon
    Na?: number     // Sodium
    Co?: number     // Cobalt
    Ni?: number     // Nickel
  }
  chelateForm?: string // e.g., 'DTPA', 'EDTA', 'EDDHA'
  solubility: number // g/L at 20°C
  maxConcentration?: number // g/L in stock solution
  cost: number // $/kg
  density?: number // g/cm³
  pH?: number // pH of 1% solution
  ec?: number // EC of 1g/L solution (mS/cm)
  compatibility: {
    incompatibleWith?: string[] // fertilizer IDs
    warnings?: string[]
  }
  supplier?: string
  grade?: 'technical' | 'agricultural' | 'food' | 'pharmaceutical'
  notes?: string
}

// Recipe import/export formats
export interface RecipeExportFormat {
  version: string
  format: 'vibelux' | 'hoagland' | 'steiner' | 'generic'
  recipe: CustomNutrientRecipe
  formulation?: CustomFormulation
  metadata: {
    exportDate: Date
    exportedBy?: string
    application: string
    notes?: string
  }
}

export interface RecipeImportOptions {
  format: 'json' | 'csv' | 'xlsx'
  mappings?: {
    [key: string]: string // field mapping for CSV/Excel
  }
  unitConversion?: {
    from: 'ppm' | 'mmol/L' | 'meq/L' | 'mg/L'
    to: 'ppm'
  }
  validateRatios?: boolean
  autoBalance?: boolean
}

// Crop types extended database
export const extendedCropTypes = [
  // Leafy Greens
  { id: 'lettuce', name: 'Lettuce', category: 'Leafy Greens' },
  { id: 'spinach', name: 'Spinach', category: 'Leafy Greens' },
  { id: 'kale', name: 'Kale', category: 'Leafy Greens' },
  { id: 'arugula', name: 'Arugula', category: 'Leafy Greens' },
  { id: 'chard', name: 'Swiss Chard', category: 'Leafy Greens' },
  { id: 'bok-choy', name: 'Bok Choy', category: 'Leafy Greens' },
  { id: 'collards', name: 'Collard Greens', category: 'Leafy Greens' },
  
  // Herbs
  { id: 'basil', name: 'Basil', category: 'Herbs' },
  { id: 'cilantro', name: 'Cilantro', category: 'Herbs' },
  { id: 'parsley', name: 'Parsley', category: 'Herbs' },
  { id: 'mint', name: 'Mint', category: 'Herbs' },
  { id: 'oregano', name: 'Oregano', category: 'Herbs' },
  { id: 'thyme', name: 'Thyme', category: 'Herbs' },
  { id: 'sage', name: 'Sage', category: 'Herbs' },
  { id: 'rosemary', name: 'Rosemary', category: 'Herbs' },
  { id: 'dill', name: 'Dill', category: 'Herbs' },
  { id: 'chives', name: 'Chives', category: 'Herbs' },
  
  // Fruiting Vegetables
  { id: 'tomato', name: 'Tomato', category: 'Fruiting' },
  { id: 'pepper', name: 'Pepper', category: 'Fruiting' },
  { id: 'cucumber', name: 'Cucumber', category: 'Fruiting' },
  { id: 'eggplant', name: 'Eggplant', category: 'Fruiting' },
  { id: 'zucchini', name: 'Zucchini', category: 'Fruiting' },
  { id: 'squash', name: 'Squash', category: 'Fruiting' },
  { id: 'melon', name: 'Melon', category: 'Fruiting' },
  { id: 'watermelon', name: 'Watermelon', category: 'Fruiting' },
  
  // Berries
  { id: 'strawberry', name: 'Strawberry', category: 'Berries' },
  { id: 'blueberry', name: 'Blueberry', category: 'Berries' },
  { id: 'raspberry', name: 'Raspberry', category: 'Berries' },
  { id: 'blackberry', name: 'Blackberry', category: 'Berries' },
  
  // Specialty Crops
  { id: 'cannabis', name: 'Cannabis', category: 'Specialty' },
  { id: 'hemp', name: 'Hemp', category: 'Specialty' },
  { id: 'hops', name: 'Hops', category: 'Specialty' },
  { id: 'microgreens', name: 'Microgreens', category: 'Specialty' },
  { id: 'wheatgrass', name: 'Wheatgrass', category: 'Specialty' },
  { id: 'mushroom', name: 'Mushrooms', category: 'Specialty' },
  
  // Root Vegetables
  { id: 'carrot', name: 'Carrot', category: 'Root' },
  { id: 'radish', name: 'Radish', category: 'Root' },
  { id: 'beet', name: 'Beet', category: 'Root' },
  { id: 'turnip', name: 'Turnip', category: 'Root' },
  
  // Brassicas
  { id: 'broccoli', name: 'Broccoli', category: 'Brassicas' },
  { id: 'cauliflower', name: 'Cauliflower', category: 'Brassicas' },
  { id: 'cabbage', name: 'Cabbage', category: 'Brassicas' },
  { id: 'brussels-sprouts', name: 'Brussels Sprouts', category: 'Brassicas' },
  
  // Flowers
  { id: 'rose', name: 'Rose', category: 'Flowers' },
  { id: 'orchid', name: 'Orchid', category: 'Flowers' },
  { id: 'chrysanthemum', name: 'Chrysanthemum', category: 'Flowers' },
  { id: 'gerbera', name: 'Gerbera', category: 'Flowers' },
  { id: 'petunia', name: 'Petunia', category: 'Flowers' },
  { id: 'marigold', name: 'Marigold', category: 'Flowers' }
]

// Growth stages database
export const growthStages = {
  vegetative: ['Seedling', 'Early Vegetative', 'Mid Vegetative', 'Late Vegetative'],
  flowering: ['Pre-Flower', 'Early Flower', 'Mid Flower', 'Late Flower'],
  fruiting: ['Fruit Set', 'Fruit Development', 'Fruit Ripening', 'Harvest'],
  continuous: ['Vegetative', 'Production', 'Maintenance']
}

// Element ratios and relationships
export const elementRelationships = {
  antagonistic: [
    { elements: ['K', 'Ca', 'Mg'], description: 'Cation competition' },
    { elements: ['Ca', 'P'], description: 'Calcium phosphate precipitation' },
    { elements: ['Fe', 'P'], description: 'Iron phosphate precipitation' },
    { elements: ['K', 'Mg'], description: 'Potassium inhibits magnesium uptake' },
    { elements: ['Ca', 'B'], description: 'Excess calcium reduces boron availability' },
    { elements: ['Zn', 'P'], description: 'High P reduces zinc uptake' }
  ],
  synergistic: [
    { elements: ['N', 'S'], description: 'Protein synthesis' },
    { elements: ['P', 'Zn'], description: 'Root development' },
    { elements: ['K', 'N'], description: 'Enhanced nitrogen utilization' },
    { elements: ['Ca', 'B'], description: 'Cell wall formation' },
    { elements: ['Fe', 'Mn'], description: 'Chlorophyll production' }
  ],
  optimalRatios: {
    'N:K': { min: 0.5, max: 1.0, optimal: 0.7 },
    'K:Ca': { min: 0.8, max: 1.5, optimal: 1.2 },
    'Ca:Mg': { min: 3.0, max: 5.0, optimal: 4.0 },
    'K:Mg': { min: 3.0, max: 6.0, optimal: 4.5 },
    'Fe:Mn': { min: 2.0, max: 4.0, optimal: 3.0 },
    'P:Zn': { min: 50, max: 150, optimal: 100 },
    'Ca:B': { min: 500, max: 1500, optimal: 1000 }
  }
}

// Validation rules for recipes
export interface RecipeValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export function validateRecipe(recipe: CustomNutrientRecipe): RecipeValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []
  
  // EC calculation from TDS
  const estimatedTDS = Object.values(recipe.elements).reduce((sum, val) => sum + (val || 0), 0)
  const estimatedEC = estimatedTDS * 0.64 / 1000 // rough approximation
  
  // Validate EC
  if (Math.abs(estimatedEC - recipe.targetEC) > 0.5) {
    warnings.push(`Calculated EC (${estimatedEC.toFixed(2)}) differs from target EC (${recipe.targetEC})`)
  }
  
  // Validate pH
  if (recipe.targetPH < 4.5 || recipe.targetPH > 7.5) {
    errors.push(`pH ${recipe.targetPH} is outside acceptable range (4.5-7.5)`)
  }
  
  // Validate element ranges
  if (recipe.elements.N < 50) warnings.push('Nitrogen below 50 ppm may limit growth')
  if (recipe.elements.N > 400) warnings.push('Nitrogen above 400 ppm may cause toxicity')
  if (recipe.elements.Ca < 50) errors.push('Calcium below 50 ppm will cause deficiency')
  if (recipe.elements.K < 50) errors.push('Potassium below 50 ppm will cause deficiency')
  
  // Validate ratios
  const ratios = {
    'N:K': recipe.elements.N / recipe.elements.K,
    'K:Ca': recipe.elements.K / recipe.elements.Ca,
    'Ca:Mg': recipe.elements.Ca / recipe.elements.Mg,
    'Fe:Mn': recipe.elements.Fe / recipe.elements.Mn
  }
  
  Object.entries(ratios).forEach(([ratio, value]) => {
    const optimal = elementRelationships.optimalRatios[ratio as keyof typeof elementRelationships.optimalRatios]
    if (optimal && (value < optimal.min || value > optimal.max)) {
      warnings.push(`${ratio} ratio (${value.toFixed(2)}) outside optimal range (${optimal.min}-${optimal.max})`)
    }
  })
  
  // Check for antagonistic relationships
  if (recipe.elements.P > 100 && recipe.elements.Zn < 0.5) {
    warnings.push('High P with low Zn may cause zinc deficiency')
  }
  
  if (recipe.elements.K > 300 && recipe.elements.Ca < 150) {
    warnings.push('High K:Ca ratio may inhibit calcium uptake')
  }
  
  // Suggestions
  if (recipe.elements.Si === undefined || recipe.elements.Si === 0) {
    suggestions.push('Consider adding silicon (20-50 ppm) for stronger cell walls')
  }
  
  if (recipe.cropType === 'cannabis' && recipe.elements.S < 60) {
    suggestions.push('Cannabis benefits from higher sulfur (60-100 ppm) for terpene production')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}

// Recipe optimization function
export function optimizeRecipe(
  recipe: CustomNutrientRecipe,
  constraints?: {
    maxEC?: number
    minEC?: number
    targetRatios?: Partial<CustomNutrientRecipe['ratios']>
    availableFertilizers?: string[]
  }
): CustomNutrientRecipe {
  const optimized = { ...recipe }
  
  // Implement optimization logic here
  // This would include linear programming to optimize element ratios
  // while maintaining EC constraints
  
  return optimized
}

// Export/Import utilities
export function exportRecipe(
  recipe: CustomNutrientRecipe,
  format: 'json' | 'csv' = 'json'
): string {
  if (format === 'json') {
    const exportData: RecipeExportFormat = {
      version: '1.0',
      format: 'vibelux',
      recipe,
      metadata: {
        exportDate: new Date(),
        application: 'Vibelux Nutrient Calculator'
      }
    }
    return JSON.stringify(exportData, null, 2)
  } else {
    // CSV format
    const headers = ['Element', 'PPM', 'Unit']
    const rows = Object.entries(recipe.elements).map(([element, ppm]) => 
      [element, ppm, 'ppm'].join(',')
    )
    return [headers.join(','), ...rows].join('\n')
  }
}

export function importRecipe(
  data: string,
  options: RecipeImportOptions
): CustomNutrientRecipe {
  // Implementation would parse various formats and convert to standard recipe
  throw new Error('Import functionality to be implemented')
}