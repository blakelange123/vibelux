/**
 * PFAL (Plant Factory with Artificial Lighting) Optimization
 * Based on Dr. Toyoki Kozai's research and management principles
 * 
 * Key concepts from Dr. Kozai's work:
 * - Resource use efficiency (RUE) optimization
 * - Environmental uniformity
 * - Energy cost minimization
 * - Productivity per unit area/volume
 * - Integrated environmental control
 */

export interface PFALMetrics {
  // Light use efficiency
  lue: {
    ppfdTarget: number // Target PPFD for crop
    ppfdActual: number // Actual average PPFD
    dli: number // Daily Light Integral
    photoperiod: number // Hours of light
    efficiency: number // Percentage of light reaching canopy
  }
  
  // Space use efficiency  
  sue: {
    layersCount: number // Number of cultivation layers
    layerSpacing: number // Distance between layers (m)
    cultivationArea: number // Total cultivation area (m²)
    floorArea: number // Floor footprint (m²)
    volumeUtilization: number // Percentage of volume used
  }
  
  // Energy use efficiency
  eue: {
    lightingPower: number // W
    hvacPower: number // W
    otherPower: number // W
    totalPower: number // W
    powerPerArea: number // W/m²
    powerPerPPFD: number // W per μmol/m²/s
  }
  
  // Water use efficiency
  wue: {
    waterUsage: number // L/day
    transpirationRate: number // L/m²/day
    recyclingRate: number // Percentage
  }
  
  // CO2 use efficiency
  cue: {
    co2Concentration: number // ppm
    co2Consumption: number // kg/day
    co2PerArea: number // g/m²/day
  }
  
  // Economic metrics
  economics: {
    yieldPerArea: number // kg/m²
    yieldPerVolume: number // kg/m³
    energyCostPerKg: number // $/kg
    laborHoursPerKg: number // hours/kg
    profitMargin: number // percentage
  }
}

/**
 * Calculate PFAL optimization metrics based on Dr. Kozai's principles
 */
export function calculatePFALMetrics(
  roomDimensions: { width: number; length: number; height: number },
  layers: number,
  fixtures: any[],
  cropType: string,
  environmentalData?: {
    temperature: number
    humidity: number
    co2: number
    airflow: number
  }
): PFALMetrics {
  const floorArea = roomDimensions.width * roomDimensions.length
  const cultivationArea = floorArea * layers
  const totalVolume = floorArea * roomDimensions.height
  const layerSpacing = roomDimensions.height / (layers + 1)
  
  // Calculate lighting metrics
  const totalPPF = fixtures.reduce((sum, f) => sum + (f.enabled ? f.ppf : 0), 0)
  const avgPPFD = totalPPF / cultivationArea
  const photoperiod = getCropPhotoperiod(cropType)
  const dli = (avgPPFD * photoperiod * 3600) / 1000000
  
  // Calculate power metrics
  const lightingPower = fixtures.reduce((sum, f) => sum + (f.enabled ? f.wattage : 0), 0)
  const hvacPower = estimateHVACPower(totalVolume, lightingPower)
  const otherPower = lightingPower * 0.1 // 10% for controls, pumps, etc.
  const totalPower = lightingPower + hvacPower + otherPower
  
  // Calculate efficiency metrics
  const lightingEfficiency = calculateLightingEfficiency(fixtures, layers)
  const volumeUtilization = (cultivationArea * 0.3) / totalVolume // Assume 30cm plant height
  
  // Calculate resource consumption
  const waterUsage = estimateWaterUsage(cultivationArea, cropType)
  const co2Consumption = estimateCO2Usage(cultivationArea, cropType, photoperiod)
  
  // Calculate yields and economics
  const yieldData = estimateYield(cultivationArea, cropType, avgPPFD)
  const energyCost = calculateEnergyCost(totalPower, photoperiod)
  
  return {
    lue: {
      ppfdTarget: getCropTargetPPFD(cropType),
      ppfdActual: Math.round(avgPPFD),
      dli: Number(dli.toFixed(1)),
      photoperiod,
      efficiency: lightingEfficiency
    },
    sue: {
      layersCount: layers,
      layerSpacing: Number(layerSpacing.toFixed(2)),
      cultivationArea: Number(cultivationArea.toFixed(1)),
      floorArea: Number(floorArea.toFixed(1)),
      volumeUtilization: Number((volumeUtilization * 100).toFixed(1))
    },
    eue: {
      lightingPower,
      hvacPower,
      otherPower,
      totalPower,
      powerPerArea: Number((totalPower / cultivationArea).toFixed(1)),
      powerPerPPFD: Number((lightingPower / avgPPFD).toFixed(2))
    },
    wue: {
      waterUsage: waterUsage.daily,
      transpirationRate: waterUsage.perArea,
      recyclingRate: 95 // Assume 95% water recycling in PFAL
    },
    cue: {
      co2Concentration: environmentalData?.co2 || 1000,
      co2Consumption: co2Consumption.daily,
      co2PerArea: co2Consumption.perArea
    },
    economics: {
      yieldPerArea: yieldData.perArea,
      yieldPerVolume: yieldData.perVolume,
      energyCostPerKg: Number((energyCost / yieldData.total).toFixed(2)),
      laborHoursPerKg: estimateLaborHours(yieldData.total),
      profitMargin: estimateProfitMargin(yieldData.total, energyCost)
    }
  }
}

/**
 * Get optimal environmental parameters based on Dr. Kozai's research
 */
export function getOptimalEnvironment(cropType: string, growthStage: string) {
  const cropParams: Record<string, Record<string, {
    temperature: { day: number; night: number };
    humidity: { min: number; max: number };
    co2: number;
    ppfd: number;
    photoperiod: number;
  }>> = {
    'leafy_greens': {
      'seedling': {
        temperature: { day: 22, night: 18 },
        humidity: { min: 70, max: 80 },
        co2: 800,
        ppfd: 150,
        photoperiod: 16
      },
      'vegetative': {
        temperature: { day: 24, night: 20 },
        humidity: { min: 65, max: 75 },
        co2: 1000,
        ppfd: 250,
        photoperiod: 18
      },
      'harvest': {
        temperature: { day: 20, night: 16 },
        humidity: { min: 60, max: 70 },
        co2: 1000,
        ppfd: 300,
        photoperiod: 16
      }
    },
    'herbs': {
      'seedling': {
        temperature: { day: 24, night: 20 },
        humidity: { min: 65, max: 75 },
        co2: 800,
        ppfd: 200,
        photoperiod: 16
      },
      'vegetative': {
        temperature: { day: 26, night: 22 },
        humidity: { min: 60, max: 70 },
        co2: 1200,
        ppfd: 400,
        photoperiod: 18
      },
      'flowering': {
        temperature: { day: 24, night: 20 },
        humidity: { min: 50, max: 60 },
        co2: 1000,
        ppfd: 500,
        photoperiod: 12
      }
    },
    'tomatoes': {
      'seedling': {
        temperature: { day: 25, night: 20 },
        humidity: { min: 70, max: 80 },
        co2: 800,
        ppfd: 200,
        photoperiod: 16
      },
      'vegetative': {
        temperature: { day: 26, night: 20 },
        humidity: { min: 65, max: 75 },
        co2: 1000,
        ppfd: 400,
        photoperiod: 18
      },
      'flowering': {
        temperature: { day: 24, night: 18 },
        humidity: { min: 60, max: 70 },
        co2: 1200,
        ppfd: 600,
        photoperiod: 12
      },
      'fruiting': {
        temperature: { day: 26, night: 20 },
        humidity: { min: 55, max: 65 },
        co2: 1500,
        ppfd: 800,
        photoperiod: 14
      }
    }
  }
  
  const defaultParams = {
    temperature: { day: 24, night: 20 },
    humidity: { min: 60, max: 75 },
    co2: 1000,
    ppfd: 400,
    photoperiod: 16
  }
  
  return cropParams[cropType]?.[growthStage] || defaultParams
}

/**
 * Calculate Vapor Pressure Deficit (VPD) - critical for Dr. Kozai's approach
 */
export function calculateVPD(temperature: number, humidity: number): number {
  // Tetens equation for saturation vapor pressure
  const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3))
  const avp = svp * (humidity / 100)
  const vpd = svp - avp
  return Number(vpd.toFixed(2))
}

/**
 * Generate PFAL optimization recommendations
 */
export function generatePFALRecommendations(metrics: PFALMetrics): string[] {
  const recommendations: string[] = []
  
  // Light use efficiency recommendations
  if (metrics.lue.efficiency < 80) {
    recommendations.push('Improve light distribution uniformity to increase canopy light interception')
  }
  if (metrics.lue.ppfdActual < metrics.lue.ppfdTarget * 0.9) {
    recommendations.push(`Increase light intensity by ${Math.round((metrics.lue.ppfdTarget - metrics.lue.ppfdActual) / metrics.lue.ppfdTarget * 100)}% to reach optimal PPFD`)
  }
  
  // Space use efficiency recommendations
  if (metrics.sue.volumeUtilization < 30) {
    recommendations.push('Consider adding more cultivation layers to improve space utilization')
  }
  if (metrics.sue.layerSpacing > 1.0) {
    recommendations.push('Reduce vertical spacing between layers to maximize cultivation volume')
  }
  
  // Energy use efficiency recommendations
  if (metrics.eue.powerPerPPFD > 2.0) {
    recommendations.push('Upgrade to more efficient LED fixtures (target < 2.0 W per μmol/m²/s)')
  }
  if (metrics.eue.hvacPower > metrics.eue.lightingPower * 0.5) {
    recommendations.push('Optimize HVAC system - cooling load exceeds 50% of lighting power')
  }
  
  // Economic recommendations
  if (metrics.economics.energyCostPerKg > 2.0) {
    recommendations.push('Energy cost per kg is high - consider time-of-use electricity rates or renewable energy')
  }
  if (metrics.economics.profitMargin < 30) {
    recommendations.push('Improve profitability through yield optimization and cost reduction strategies')
  }
  
  return recommendations
}

// Helper functions
function getCropPhotoperiod(cropType: string): number {
  const photoperiods: Record<string, number> = {
    'leafy_greens': 18,
    'herbs': 16,
    'tomatoes': 14,
    'strawberries': 16,
    'cannabis': 12
  }
  return photoperiods[cropType] || 16
}

function getCropTargetPPFD(cropType: string): number {
  const targets: Record<string, number> = {
    'leafy_greens': 250,
    'herbs': 400,
    'tomatoes': 600,
    'strawberries': 350,
    'cannabis': 800
  }
  return targets[cropType] || 400
}

function calculateLightingEfficiency(fixtures: any[], layers: number): number {
  // Estimate based on fixture placement and beam angles
  // Dr. Kozai recommends >85% lighting efficiency
  const baseEfficiency = 75
  const placementBonus = fixtures.length > 10 ? 5 : 0
  const layerPenalty = layers > 3 ? (layers - 3) * 2 : 0
  return Math.min(95, baseEfficiency + placementBonus - layerPenalty)
}

function estimateHVACPower(volume: number, lightingPower: number): number {
  // HVAC typically 30-50% of lighting power in PFAL
  // Lower ratio with efficient LEDs
  return lightingPower * 0.35
}

function estimateWaterUsage(area: number, cropType: string) {
  const baseUsage: Record<string, number> = {
    'leafy_greens': 2.5, // L/m²/day
    'herbs': 3.0,
    'tomatoes': 4.5,
    'strawberries': 3.5,
    'cannabis': 5.0
  }
  const perArea = baseUsage[cropType] || 3.0
  return {
    daily: area * perArea,
    perArea
  }
}

function estimateCO2Usage(area: number, cropType: string, photoperiod: number) {
  const baseRate: Record<string, number> = {
    'leafy_greens': 20, // g/m²/day
    'herbs': 25,
    'tomatoes': 40,
    'strawberries': 30,
    'cannabis': 45
  }
  const perArea = (baseRate[cropType] || 30) * (photoperiod / 24)
  return {
    daily: area * perArea / 1000, // kg/day
    perArea
  }
}

function estimateYield(area: number, cropType: string, ppfd: number) {
  const baseYield: Record<string, number> = {
    'leafy_greens': 0.15, // kg/m²/day
    'herbs': 0.10,
    'tomatoes': 0.20,
    'strawberries': 0.08,
    'cannabis': 0.05
  }
  const yieldPerArea = (baseYield[cropType] || 0.1) * Math.min(1, ppfd / getCropTargetPPFD(cropType))
  return {
    perArea: Number(yieldPerArea.toFixed(3)),
    perVolume: Number((yieldPerArea * 3.3).toFixed(3)), // Assume 30cm height
    total: area * yieldPerArea * 30 // 30 day cycle
  }
}

function calculateEnergyCost(power: number, photoperiod: number): number {
  const kwhPerDay = power * photoperiod / 1000
  const costPerKwh = 0.12 // $/kWh
  return kwhPerDay * costPerKwh * 30 // Monthly cost
}

function estimateLaborHours(yieldAmount: number): number {
  // Based on Dr. Kozai's data: 0.1-0.3 hours per kg in automated PFAL
  return 0.2
}

function estimateProfitMargin(yieldAmount: number, energyCost: number): number {
  const revenuePerKg = 8.0 // $/kg average for leafy greens
  const totalRevenue = yieldAmount * revenuePerKg
  const totalCosts = energyCost * 2.5 // Energy is ~40% of total costs
  return Number(((totalRevenue - totalCosts) / totalRevenue * 100).toFixed(1))
}