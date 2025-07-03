// DLI (Daily Light Integral) calculation utilities

/**
 * Convert PPFD to DLI
 * DLI = PPFD × photoperiod × 3600 / 1,000,000
 * @param ppfd - Photosynthetic Photon Flux Density (μmol/m²/s)
 * @param photoperiod - Hours of light per day
 * @returns DLI in mol/m²/day
 */
export function ppfdToDLI(ppfd: number, photoperiod: number): number {
  return (ppfd * photoperiod * 3.6) / 1000
}

/**
 * Convert DLI to PPFD
 * PPFD = DLI × 1,000,000 / (photoperiod × 3600)
 * @param dli - Daily Light Integral (mol/m²/day)
 * @param photoperiod - Hours of light per day
 * @returns PPFD in μmol/m²/s
 */
export function dliToPPFD(dli: number, photoperiod: number): number {
  return (dli * 1000) / (photoperiod * 3.6)
}

/**
 * Calculate DLI efficiency (current vs target)
 * @param currentDLI - Current DLI being delivered
 * @param targetDLI - Target DLI for the crop/stage
 * @returns Efficiency percentage (0-100+)
 */
export function calculateDLIEfficiency(currentDLI: number, targetDLI: number): number {
  return (currentDLI / targetDLI) * 100
}

/**
 * Calculate optimal photoperiod for target DLI with given PPFD
 * @param targetDLI - Desired DLI (mol/m²/day)
 * @param maxPPFD - Maximum available PPFD (μmol/m²/s)
 * @returns Optimal photoperiod in hours
 */
export function calculateOptimalPhotoperiod(targetDLI: number, maxPPFD: number): number {
  const requiredHours = (targetDLI * 1000) / (maxPPFD * 3.6)
  return Math.min(24, Math.max(8, requiredHours)) // Clamp between 8-24 hours
}

/**
 * Calculate energy savings from DLI optimization
 * @param currentDLI - Current DLI being delivered
 * @param optimizedDLI - Optimized DLI target
 * @param wattage - Total fixture wattage
 * @param costPerKWh - Electricity cost per kWh
 * @returns Daily energy savings in dollars
 */
export function calculateEnergySavings(
  currentDLI: number, 
  optimizedDLI: number, 
  wattage: number, 
  costPerKWh: number = 0.12
): {
  dliReduction: number
  energySavingsKWh: number
  costSavingsDaily: number
  costSavingsMonthly: number
  costSavingsYearly: number
} {
  const dliReduction = Math.max(0, currentDLI - optimizedDLI)
  const reductionPercentage = dliReduction / currentDLI
  
  const energySavingsKWh = (wattage / 1000) * 24 * reductionPercentage
  const costSavingsDaily = energySavingsKWh * costPerKWh
  const costSavingsMonthly = costSavingsDaily * 30.44 // Average days per month
  const costSavingsYearly = costSavingsDaily * 365
  
  return {
    dliReduction,
    energySavingsKWh,
    costSavingsDaily,
    costSavingsMonthly,
    costSavingsYearly
  }
}

/**
 * Calculate seasonal DLI adjustments based on natural light availability
 * @param targetDLI - Target DLI for the crop
 * @param naturalDLI - Available natural DLI for the season
 * @returns Required supplemental DLI
 */
export function calculateSupplementalDLI(targetDLI: number, naturalDLI: number): number {
  return Math.max(0, targetDLI - naturalDLI)
}

/**
 * Growth stage DLI progression calculator
 * @param cropType - Type of crop
 * @param daysFromPlanting - Days since planting
 * @returns Current recommended DLI based on growth progression
 */
export function calculateProgressiveDLI(cropType: string, daysFromPlanting: number): {
  currentStage: string
  currentDLI: number
  nextStage: string
  daysToNextStage: number
} {
  // Example progression for lettuce
  const stages = {
    lettuce: [
      { stage: 'seedling', days: 14, dli: 10 },
      { stage: 'vegetative', days: 21, dli: 15 },
      { stage: 'maturity', days: 35, dli: 17 }
    ],
    tomato: [
      { stage: 'seedling', days: 21, dli: 12 },
      { stage: 'vegetative', days: 35, dli: 20 },
      { stage: 'flowering', days: 70, dli: 25 },
      { stage: 'fruiting', days: 120, dli: 30 }
    ]
  }
  
  const cropStages = stages[cropType as keyof typeof stages] || stages.lettuce
  
  let currentStage = cropStages[0]
  let nextStage = cropStages[1]
  
  for (let i = 0; i < cropStages.length; i++) {
    if (daysFromPlanting <= cropStages[i].days) {
      currentStage = cropStages[i]
      nextStage = cropStages[i + 1] || cropStages[i]
      break
    }
  }
  
  return {
    currentStage: currentStage.stage,
    currentDLI: currentStage.dli,
    nextStage: nextStage.stage,
    daysToNextStage: Math.max(0, nextStage.days - daysFromPlanting)
  }
}

/**
 * Multi-crop DLI balancing
 * @param crops - Array of crops with their requirements
 * @returns Balanced DLI recommendation
 */
export function calculateMultiCropDLI(crops: Array<{
  crop: string
  stage: string
  area: number // percentage of total area
  priority: number // 1-10, higher = more important
}>): {
  recommendedDLI: number
  compromises: Array<{ crop: string; impact: string }>
} {
  // Weighted average based on area and priority
  let totalWeight = 0
  let weightedDLI = 0
  
  crops.forEach(crop => {
    const weight = crop.area * crop.priority
    totalWeight += weight
    // This would lookup actual DLI requirements
    const cropDLI = 15 // Placeholder
    weightedDLI += cropDLI * weight
  })
  
  const recommendedDLI = weightedDLI / totalWeight
  
  // Calculate compromises
  const compromises = crops.map(crop => ({
    crop: crop.crop,
    impact: 'Optimal' // Would calculate actual impact
  }))
  
  return {
    recommendedDLI,
    compromises
  }
}