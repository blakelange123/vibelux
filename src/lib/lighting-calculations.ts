// Horticultural lighting calculations

export interface PPFDCalculation {
  ppfd: number
  dli: number
  energyCost: number
}

export interface HeatLoadCalculation {
  totalHeat: number
  cooling: number
  ventilation: number
}

// PPFD (Photosynthetic Photon Flux Density) calculations
export function calculatePPFD(
  fixtureWattage: number,
  efficacy: number,
  mountingHeight: number,
  roomArea: number,
  numberOfFixtures: number = 1
): PPFDCalculation {
  // Basic PPFD calculation
  const totalWatts = fixtureWattage * numberOfFixtures
  const totalPPF = totalWatts * efficacy // µmol/s
  const ppfd = totalPPF / roomArea // µmol/m²/s
  
  // DLI calculation (Daily Light Integral)
  const hoursPerDay = 18 // typical for controlled environment
  const dli = (ppfd * hoursPerDay * 3600) / 1000000 // mol/m²/day
  
  // Energy cost calculation (example rate)
  const kWhPerDay = (totalWatts * hoursPerDay) / 1000
  const costPerKWh = 0.12 // $0.12 per kWh
  const energyCost = kWhPerDay * costPerKWh * 30 // monthly cost
  
  return { ppfd, dli, energyCost }
}

// Heat load calculations
export function calculateHeatLoad(
  fixtureWattage: number,
  numberOfFixtures: number,
  roomArea: number,
  ambientTemp: number = 25
): HeatLoadCalculation {
  const totalWatts = fixtureWattage * numberOfFixtures
  
  // Heat generation (LED efficiency ~50%, rest becomes heat)
  const heatGeneration = totalWatts * 0.5 // watts of heat
  
  // Convert to BTU/hr
  const totalHeat = heatGeneration * 3.412 // BTU/hr
  
  // Cooling requirements
  const cooling = totalHeat * 1.2 // 20% safety factor
  
  // Ventilation requirements (CFM)
  const ventilation = roomArea * 2 // 2 CFM per sq ft baseline
  
  return { totalHeat, cooling, ventilation }
}

// VPD (Vapor Pressure Deficit) calculations
export function calculateVPD(temperature: number, humidity: number): number {
  // Saturation vapor pressure calculation
  const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3))
  
  // Actual vapor pressure
  const avp = svp * (humidity / 100)
  
  // VPD calculation
  const vpd = svp - avp
  
  return Math.round(vpd * 100) / 100 // Round to 2 decimal places
}

// ROI calculations
export function calculateROI(
  initialInvestment: number,
  monthlyEnergySavings: number,
  monthlyProductionIncrease: number,
  cropsPerYear: number = 6
): {
  annualSavings: number
  paybackPeriod: number
  fiveYearROI: number
} {
  const annualEnergySavings = monthlyEnergySavings * 12
  const annualProductionValue = monthlyProductionIncrease * cropsPerYear
  const annualSavings = annualEnergySavings + annualProductionValue
  
  const paybackPeriod = initialInvestment / annualSavings
  const fiveYearROI = ((annualSavings * 5 - initialInvestment) / initialInvestment) * 100
  
  return {
    annualSavings,
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    fiveYearROI: Math.round(fiveYearROI * 10) / 10
  }
}