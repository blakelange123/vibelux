export interface NutrientProfile {
  nitrogen: number // ppm
  phosphorus: number // ppm
  potassium: number // ppm
  calcium: number // ppm
  magnesium: number // ppm
  sulfur: number // ppm
  iron: number // ppm
  manganese: number // ppm
  zinc: number // ppm
  copper: number // ppm
  boron: number // ppm
  molybdenum: number // ppm
  ph: number
  ec: number // mS/cm
}

export interface WaterSchedule {
  frequency: 'continuous' | 'daily' | 'twice-daily' | 'three-times-daily' | 'custom'
  duration: number // minutes per irrigation
  flowRate: number // liters per hour
  startTimes: string[] // HH:MM format
  nutrientConcentration: number // EC target
  phTarget: number
  runoffTarget: number // percentage
}

export interface CropWaterNutrientRequirements {
  cropType: string
  growthStage: string
  waterRequirement: {
    min: number // liters per m² per day
    max: number
    optimal: number
  }
  nutrientProfile: {
    vegetative: NutrientProfile
    flowering?: NutrientProfile
    fruiting?: NutrientProfile
  }
  vpdRange: {
    min: number // kPa
    max: number
  }
  runoffPercentage: {
    min: number
    max: number
  }
}

export interface IrrigationSystem {
  type: 'drip' | 'ebb-flow' | 'nft' | 'dwc' | 'aeroponics' | 'hand-water'
  emittersPerM2: number
  emitterFlowRate: number // liters per hour
  uniformity: number // 0-1
  pressure: number // psi
  filtration: boolean
  automation: 'manual' | 'timer' | 'sensor-based' | 'ai-controlled'
}

export interface WaterQuality {
  source: 'municipal' | 'well' | 'ro' | 'rainwater'
  startingEC: number
  startingPH: number
  alkalinity: number // ppm CaCO3
  hardness: number // ppm CaCO3
  chlorine: number // ppm
  chloramine: number // ppm
  sodium: number // ppm
  bicarbonate: number // ppm
}

// Crop-specific water and nutrient requirements
export const cropWaterNutrientProfiles: Record<string, CropWaterNutrientRequirements> = {
  'lettuce': {
    cropType: 'Lettuce',
    growthStage: 'vegetative',
    waterRequirement: {
      min: 2.5,
      max: 4.5,
      optimal: 3.5
    },
    nutrientProfile: {
      vegetative: {
        nitrogen: 150,
        phosphorus: 50,
        potassium: 210,
        calcium: 180,
        magnesium: 45,
        sulfur: 65,
        iron: 2.5,
        manganese: 0.55,
        zinc: 0.33,
        copper: 0.05,
        boron: 0.33,
        molybdenum: 0.05,
        ph: 5.8,
        ec: 1.4
      }
    },
    vpdRange: { min: 0.8, max: 1.2 },
    runoffPercentage: { min: 10, max: 20 }
  },
  'tomato': {
    cropType: 'Tomato',
    growthStage: 'variable',
    waterRequirement: {
      min: 4.0,
      max: 8.0,
      optimal: 6.0
    },
    nutrientProfile: {
      vegetative: {
        nitrogen: 200,
        phosphorus: 50,
        potassium: 300,
        calcium: 200,
        magnesium: 50,
        sulfur: 150,
        iron: 3.0,
        manganese: 0.8,
        zinc: 0.25,
        copper: 0.07,
        boron: 0.7,
        molybdenum: 0.05,
        ph: 6.0,
        ec: 2.0
      },
      flowering: {
        nitrogen: 180,
        phosphorus: 80,
        potassium: 350,
        calcium: 200,
        magnesium: 50,
        sulfur: 150,
        iron: 3.0,
        manganese: 0.8,
        zinc: 0.25,
        copper: 0.07,
        boron: 0.7,
        molybdenum: 0.05,
        ph: 6.2,
        ec: 2.5
      },
      fruiting: {
        nitrogen: 150,
        phosphorus: 60,
        potassium: 400,
        calcium: 200,
        magnesium: 60,
        sulfur: 150,
        iron: 3.0,
        manganese: 0.8,
        zinc: 0.25,
        copper: 0.07,
        boron: 0.7,
        molybdenum: 0.05,
        ph: 6.2,
        ec: 3.0
      }
    },
    vpdRange: { min: 0.8, max: 1.3 },
    runoffPercentage: { min: 20, max: 30 }
  },
  'cannabis': {
    cropType: 'Cannabis',
    growthStage: 'variable',
    waterRequirement: {
      min: 3.0,
      max: 6.0,
      optimal: 4.5
    },
    nutrientProfile: {
      vegetative: {
        nitrogen: 200,
        phosphorus: 60,
        potassium: 200,
        calcium: 150,
        magnesium: 75,
        sulfur: 80,
        iron: 4.0,
        manganese: 2.0,
        zinc: 0.5,
        copper: 0.1,
        boron: 0.5,
        molybdenum: 0.1,
        ph: 5.8,
        ec: 1.6
      },
      flowering: {
        nitrogen: 120,
        phosphorus: 100,
        potassium: 300,
        calcium: 150,
        magnesium: 75,
        sulfur: 80,
        iron: 4.0,
        manganese: 2.0,
        zinc: 0.5,
        copper: 0.1,
        boron: 0.5,
        molybdenum: 0.1,
        ph: 6.0,
        ec: 2.0
      }
    },
    vpdRange: { min: 0.8, max: 1.5 },
    runoffPercentage: { min: 15, max: 25 }
  },
  'basil': {
    cropType: 'Basil',
    growthStage: 'vegetative',
    waterRequirement: {
      min: 2.0,
      max: 3.5,
      optimal: 2.8
    },
    nutrientProfile: {
      vegetative: {
        nitrogen: 165,
        phosphorus: 60,
        potassium: 215,
        calcium: 160,
        magnesium: 50,
        sulfur: 70,
        iron: 2.8,
        manganese: 0.6,
        zinc: 0.35,
        copper: 0.06,
        boron: 0.35,
        molybdenum: 0.06,
        ph: 5.8,
        ec: 1.6
      }
    },
    vpdRange: { min: 0.7, max: 1.1 },
    runoffPercentage: { min: 10, max: 20 }
  },
  'strawberry': {
    cropType: 'Strawberry',
    growthStage: 'variable',
    waterRequirement: {
      min: 2.5,
      max: 5.0,
      optimal: 3.5
    },
    nutrientProfile: {
      vegetative: {
        nitrogen: 100,
        phosphorus: 30,
        potassium: 150,
        calcium: 150,
        magnesium: 40,
        sulfur: 50,
        iron: 2.0,
        manganese: 0.5,
        zinc: 0.2,
        copper: 0.05,
        boron: 0.3,
        molybdenum: 0.05,
        ph: 5.8,
        ec: 1.2
      },
      flowering: {
        nitrogen: 80,
        phosphorus: 40,
        potassium: 180,
        calcium: 150,
        magnesium: 40,
        sulfur: 50,
        iron: 2.0,
        manganese: 0.5,
        zinc: 0.2,
        copper: 0.05,
        boron: 0.3,
        molybdenum: 0.05,
        ph: 6.0,
        ec: 1.4
      },
      fruiting: {
        nitrogen: 60,
        phosphorus: 35,
        potassium: 200,
        calcium: 150,
        magnesium: 40,
        sulfur: 50,
        iron: 2.0,
        manganese: 0.5,
        zinc: 0.2,
        copper: 0.05,
        boron: 0.3,
        molybdenum: 0.05,
        ph: 6.0,
        ec: 1.5
      }
    },
    vpdRange: { min: 0.6, max: 1.0 },
    runoffPercentage: { min: 15, max: 25 }
  }
}

// Calculate daily water requirement based on environmental conditions
export function calculateWaterRequirement(
  cropType: string,
  growthStage: string,
  environmentalConditions: {
    temperature: number
    humidity: number
    vpd: number
    lightIntensity: number // PPFD
    co2: number
  },
  growArea: number // m²
): {
  dailyWaterRequirement: number // liters
  hourlyRate: number // liters/hour
  adjustmentFactors: {
    temperature: number
    humidity: number
    vpd: number
    light: number
    co2: number
  }
} {
  const profile = cropWaterNutrientProfiles[cropType.toLowerCase()]
  if (!profile) {
    throw new Error(`Crop profile not found for ${cropType}`)
  }

  const baseRequirement = profile.waterRequirement.optimal

  // Adjustment factors
  const tempFactor = environmentalConditions.temperature > 25 
    ? 1 + (environmentalConditions.temperature - 25) * 0.05 
    : 1 - (25 - environmentalConditions.temperature) * 0.03

  const humidityFactor = environmentalConditions.humidity < 50 
    ? 1.1 
    : environmentalConditions.humidity > 70 
    ? 0.9 
    : 1.0

  const vpdFactor = environmentalConditions.vpd > profile.vpdRange.max 
    ? 1.2 
    : environmentalConditions.vpd < profile.vpdRange.min 
    ? 0.8 
    : 1.0

  const lightFactor = 1 + (environmentalConditions.lightIntensity / 1000) * 0.1

  const co2Factor = environmentalConditions.co2 > 800 ? 1.1 : 1.0

  // Apply all factors
  const adjustedRequirement = baseRequirement * tempFactor * humidityFactor * vpdFactor * lightFactor * co2Factor

  // Calculate total daily requirement
  const dailyWaterRequirement = adjustedRequirement * growArea

  return {
    dailyWaterRequirement,
    hourlyRate: dailyWaterRequirement / 24,
    adjustmentFactors: {
      temperature: tempFactor,
      humidity: humidityFactor,
      vpd: vpdFactor,
      light: lightFactor,
      co2: co2Factor
    }
  }
}

// Fertilizer composition data (from NS Calculator)
const fertilizerComposition = {
  'Ca(NO3)2·4H2O': { // Calcium nitrate tetrahydrate
    nitrogen: 11.86, // % N
    calcium: 16.97, // % Ca
    molecularWeight: 236.15
  },
  'KNO3': { // Potassium nitrate
    nitrogen: 13.85, // % N
    potassium: 38.67, // % K
    molecularWeight: 101.10
  },
  'NH4NO3': { // Ammonium nitrate
    nitrogen: 35.00, // % N (50% NH4, 50% NO3)
    molecularWeight: 80.04
  },
  'KH2PO4': { // Monopotassium phosphate
    phosphorus: 22.76, // % P
    potassium: 28.73, // % K
    molecularWeight: 136.09
  },
  'MgSO4·7H2O': { // Magnesium sulfate heptahydrate (Epsom salt)
    magnesium: 9.86, // % Mg
    sulfur: 13.01, // % S
    molecularWeight: 246.48
  },
  'K2SO4': { // Potassium sulfate
    potassium: 44.87, // % K
    sulfur: 18.40, // % S
    molecularWeight: 174.26
  },
  'Mg(NO3)2·6H2O': { // Magnesium nitrate hexahydrate
    nitrogen: 10.93, // % N
    magnesium: 9.48, // % Mg
    molecularWeight: 256.41
  },
  'CaCl2·2H2O': { // Calcium chloride dihydrate
    calcium: 27.26, // % Ca
    chloride: 48.23, // % Cl
    molecularWeight: 147.01
  }
}

// Enhanced nutrient solution calculation using NS Calculator methodology
export function calculateNutrientSolution(
  targetProfile: NutrientProfile,
  waterQuality: WaterQuality,
  waterVolume: number, // liters
  stockConcentration: number = 100 // dilution ratio (default 1:100)
): {
  adjustedProfile: NutrientProfile
  fertilizers: {
    name: string
    amount: number // grams
    provides: Partial<NutrientProfile>
    stockTank: 'A' | 'B' // Separation to prevent precipitation
  }[]
  stockSolutions: {
    tankA: { volume: number; fertilizers: string[] }
    tankB: { volume: number; fertilizers: string[] }
  }
  warnings: string[]
  phAdjustment: {
    direction: 'up' | 'down' | 'none'
    amount: number // ml
    product: string
  }
  ionicBalance: {
    cations: number // meq/L
    anions: number // meq/L
    difference: number // meq/L
    balanced: boolean
  }
} {
  const adjustedProfile = { ...targetProfile }
  const warnings: string[] = []

  // Adjust for water quality
  if (waterQuality.startingEC > 0.5) {
    warnings.push(`High starting EC (${waterQuality.startingEC} mS/cm). Consider using RO water.`)
  }

  if (waterQuality.alkalinity > 100) {
    warnings.push(`High alkalinity (${waterQuality.alkalinity} ppm CaCO₃). Will require ${Math.round(waterQuality.alkalinity * 0.6)} ml/L acid.`)
  }

  if (waterQuality.sodium > 50) {
    warnings.push(`High sodium (${waterQuality.sodium} ppm). May affect K:Na balance.`)
  }

  // Adjust target based on water content
  adjustedProfile.calcium -= waterQuality.hardness * 0.4 // Approximate Ca from hardness
  adjustedProfile.magnesium -= waterQuality.hardness * 0.1 // Approximate Mg from hardness

  // Calculate precise fertilizer requirements using actual composition
  const fertilizers = []

  // Tank A - Calcium sources (keep separate from sulfates/phosphates)
  const caNeed = Math.max(0, adjustedProfile.calcium)
  const nFromCa = caNeed * (fertilizerComposition['Ca(NO3)2·4H2O'].nitrogen / fertilizerComposition['Ca(NO3)2·4H2O'].calcium)
  const caNitrateAmount = (caNeed / fertilizerComposition['Ca(NO3)2·4H2O'].calcium) * 100 * waterVolume / 1000

  fertilizers.push({
    name: 'Calcium Nitrate (Ca(NO₃)₂·4H₂O)',
    amount: caNitrateAmount,
    provides: { 
      nitrogen: nFromCa,
      calcium: caNeed 
    },
    stockTank: 'A' as const
  })

  // Tank B - Other nutrients
  const nRemaining = Math.max(0, adjustedProfile.nitrogen - nFromCa)
  const kNitrateAmount = (nRemaining / fertilizerComposition['KNO3'].nitrogen) * 100 * waterVolume / 1000
  const kFromNitrate = kNitrateAmount * fertilizerComposition['KNO3'].potassium / 100

  fertilizers.push({
    name: 'Potassium Nitrate (KNO₃)',
    amount: kNitrateAmount,
    provides: { 
      nitrogen: nRemaining,
      potassium: kFromNitrate * 1000 / waterVolume
    },
    stockTank: 'B' as const
  })

  // Phosphorus and remaining potassium
  const pNeed = adjustedProfile.phosphorus
  const mkpAmount = (pNeed / fertilizerComposition['KH2PO4'].phosphorus) * 100 * waterVolume / 1000
  const kFromMKP = mkpAmount * fertilizerComposition['KH2PO4'].potassium / 100

  fertilizers.push({
    name: 'Monopotassium Phosphate (KH₂PO₄)',
    amount: mkpAmount,
    provides: { 
      phosphorus: pNeed,
      potassium: kFromMKP * 1000 / waterVolume
    },
    stockTank: 'B' as const
  })

  // Magnesium and sulfur
  const mgNeed = Math.max(0, adjustedProfile.magnesium)
  const mgSulfateAmount = (mgNeed / fertilizerComposition['MgSO4·7H2O'].magnesium) * 100 * waterVolume / 1000
  const sFromMgSulfate = mgSulfateAmount * fertilizerComposition['MgSO4·7H2O'].sulfur / 100

  fertilizers.push({
    name: 'Magnesium Sulfate (MgSO₄·7H₂O)',
    amount: mgSulfateAmount,
    provides: { 
      magnesium: mgNeed,
      sulfur: sFromMgSulfate * 1000 / waterVolume
    },
    stockTank: 'B' as const
  })

  // Remaining potassium if needed
  const kTotal = kFromNitrate + kFromMKP
  const kRemaining = Math.max(0, (adjustedProfile.potassium * waterVolume / 1000) - kTotal)
  if (kRemaining > 0) {
    const k2so4Amount = (kRemaining / (fertilizerComposition['K2SO4'].potassium / 100))
    fertilizers.push({
      name: 'Potassium Sulfate (K₂SO₄)',
      amount: k2so4Amount,
      provides: { 
        potassium: kRemaining * 1000 / waterVolume,
        sulfur: k2so4Amount * fertilizerComposition['K2SO4'].sulfur / 100 * 1000 / waterVolume
      },
      stockTank: 'B' as const
    })
  }

  // Micronutrients
  fertilizers.push({
    name: 'Micronutrient Mix (Fe-DTPA + trace)',
    amount: 0.1 * waterVolume, // 100g/1000L
    provides: {
      iron: targetProfile.iron,
      manganese: targetProfile.manganese,
      zinc: targetProfile.zinc,
      copper: targetProfile.copper,
      boron: targetProfile.boron,
      molybdenum: targetProfile.molybdenum
    },
    stockTank: 'B' as const
  })

  // pH adjustment calculation (enhanced with alkalinity consideration)
  const phDifference = waterQuality.startingPH - targetProfile.ph
  const alkalinityFactor = waterQuality.alkalinity / 50 // Alkalinity resistance factor
  
  let phAdjustment = {
    direction: 'none' as 'up' | 'down' | 'none',
    amount: 0,
    product: ''
  }

  if (Math.abs(phDifference) > 0.2 || waterQuality.alkalinity > 80) {
    if (phDifference > 0 || waterQuality.alkalinity > 80) {
      // Need to lower pH - account for alkalinity buffering
      const baseAmount = Math.abs(phDifference) * waterVolume * 0.5
      const alkalinityAmount = waterQuality.alkalinity * waterVolume * 0.006 // 0.6 ml/L per 100 ppm alkalinity
      phAdjustment = {
        direction: 'down',
        amount: baseAmount + alkalinityAmount,
        product: waterQuality.alkalinity > 150 ? 'Sulfuric Acid 35%' : 'Phosphoric Acid 85%'
      }
    } else {
      phAdjustment = {
        direction: 'up',
        amount: Math.abs(phDifference) * waterVolume * 0.3,
        product: 'Potassium Hydroxide (KOH) 5%'
      }
    }
  }

  // Calculate stock solution volumes
  const stockVolume = waterVolume / stockConcentration
  const tankAFertilizers = fertilizers.filter(f => f.stockTank === 'A').map(f => f.name)
  const tankBFertilizers = fertilizers.filter(f => f.stockTank === 'B').map(f => f.name)

  // Calculate ionic balance (simplified)
  const cationCharge = {
    K: 1, Ca: 2, Mg: 2, Na: 1, NH4: 1
  }
  const anionCharge = {
    NO3: 1, H2PO4: 1, SO4: 2, Cl: 1, HCO3: 1
  }

  // Calculate milliequivalents
  let cations = 0
  let anions = 0

  // Cations
  cations += (adjustedProfile.potassium / 39.1) * 1  // K+
  cations += (adjustedProfile.calcium / 40.1) * 2    // Ca2+
  cations += (adjustedProfile.magnesium / 24.3) * 2  // Mg2+
  
  // Anions
  anions += (adjustedProfile.nitrogen * 0.9 / 14) * 1  // NO3- (assuming 90% as nitrate)
  anions += (adjustedProfile.phosphorus / 31) * 1      // H2PO4-
  anions += (adjustedProfile.sulfur / 32.1) * 2        // SO42-

  const difference = Math.abs(cations - anions)
  const balanced = difference < 1.0 // Within 1 meq/L is acceptable

  if (!balanced) {
    warnings.push(`Ionic imbalance: ${difference.toFixed(1)} meq/L difference. Consider adjusting K or Ca.`)
  }

  // Check dilution ratio
  if (stockConcentration > 250) {
    warnings.push('Dilution ratio >250 may cause precipitation. Consider using 1:100 or 1:200.')
  }

  return {
    adjustedProfile,
    fertilizers: fertilizers.map(f => ({
      ...f,
      amount: Math.round(f.amount * 100) / 100
    })),
    stockSolutions: {
      tankA: {
        volume: stockVolume,
        fertilizers: tankAFertilizers
      },
      tankB: {
        volume: stockVolume,
        fertilizers: tankBFertilizers
      }
    },
    warnings,
    phAdjustment: {
      ...phAdjustment,
      amount: Math.round(phAdjustment.amount * 10) / 10
    },
    ionicBalance: {
      cations: Math.round(cations * 10) / 10,
      anions: Math.round(anions * 10) / 10,
      difference: Math.round(difference * 10) / 10,
      balanced
    }
  }
}

// Generate irrigation schedule
export function generateIrrigationSchedule(
  cropType: string,
  growthStage: string,
  irrigationSystem: IrrigationSystem,
  dailyWaterRequirement: number,
  photoperiod: number
): WaterSchedule {
  const profile = cropWaterNutrientProfiles[cropType.toLowerCase()]
  if (!profile) {
    throw new Error(`Crop profile not found for ${cropType}`)
  }

  // Calculate irrigation frequency based on system type
  let frequency: WaterSchedule['frequency'] = 'daily'
  let irrigationsPerDay = 1

  switch (irrigationSystem.type) {
    case 'drip':
      if (cropType === 'cannabis' || cropType === 'tomato') {
        frequency = 'three-times-daily'
        irrigationsPerDay = 3
      } else {
        frequency = 'twice-daily'
        irrigationsPerDay = 2
      }
      break
    case 'ebb-flow':
      frequency = 'three-times-daily'
      irrigationsPerDay = 3
      break
    case 'nft':
    case 'dwc':
    case 'aeroponics':
      frequency = 'continuous'
      irrigationsPerDay = 24
      break
    case 'hand-water':
      frequency = 'daily'
      irrigationsPerDay = 1
      break
  }

  // Calculate duration and flow rate
  const totalEmitters = irrigationSystem.emittersPerM2
  const systemFlowRate = totalEmitters * irrigationSystem.emitterFlowRate
  const waterPerIrrigation = dailyWaterRequirement / irrigationsPerDay
  const duration = (waterPerIrrigation / systemFlowRate) * 60 // minutes

  // Generate start times during light period
  const startTimes: string[] = []
  if (frequency !== 'continuous') {
    const lightStartHour = 6 // 6 AM
    const intervalHours = photoperiod / irrigationsPerDay
    
    for (let i = 0; i < irrigationsPerDay; i++) {
      const hour = Math.floor(lightStartHour + i * intervalHours)
      const minute = Math.floor((lightStartHour + i * intervalHours - hour) * 60)
      startTimes.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }
  }

  // Get nutrient requirements for current stage
  const stageProfile = profile.nutrientProfile[growthStage as keyof typeof profile.nutrientProfile] 
    || profile.nutrientProfile.vegetative

  return {
    frequency,
    duration: Math.round(duration),
    flowRate: systemFlowRate,
    startTimes,
    nutrientConcentration: stageProfile.ec,
    phTarget: stageProfile.ph,
    runoffTarget: (profile.runoffPercentage.min + profile.runoffPercentage.max) / 2
  }
}

// Calculate VPD from temperature and humidity
export function calculateVPD(temperature: number, humidity: number): number {
  // Saturation vapor pressure at temperature (kPa)
  const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3))
  
  // Actual vapor pressure
  const avp = svp * (humidity / 100)
  
  // Vapor pressure deficit
  return Math.round((svp - avp) * 100) / 100
}