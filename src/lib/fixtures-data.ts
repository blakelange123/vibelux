// DLC Fixture data structure based on CSV columns
export interface DLCFixture {
  id: number
  manufacturer: string
  brand: string
  productName: string
  modelNumber: string
  dateQualified: string
  
  // Performance metrics
  reportedPPE: number // Photosynthetic Photon Efficacy (µmol/J)
  reportedPPF: number // Photosynthetic Photon Flux (µmol/s)
  reportedWattage: number
  testedPPE: number
  testedPPF: number
  testedWattage: number
  
  // Electrical specs
  minVoltage: number
  maxVoltage: number
  powerType: string // AC or DC
  powerFactor: number
  thd: number // Total Harmonic Distortion (%)
  dimmable: boolean
  spectrallyTunable: boolean
  
  // Physical specs
  width: number
  height: number
  length: number
  warranty: number
  
  // Spectral distribution
  blueFlux: number // 400-500nm
  greenFlux: number // 500-600nm
  redFlux: number // 600-700nm
  farRedFlux: number // 700-800nm
  
  // Control
  dimming010V: boolean
  dimmingDALI: boolean
  dimmingPWM: boolean
  dimmingResistance: boolean
}

// Category classification based on wattage and features
export function getFixtureCategory(fixture: DLCFixture): string {
  if (fixture.reportedWattage < 200) return "Supplemental"
  if (fixture.reportedWattage < 400) return "Vertical Farm"
  if (fixture.spectrallyTunable) return "Research"
  if (fixture.reportedWattage > 800) return "Industrial"
  if (fixture.farRedFlux > 50) return "Greenhouse"
  return "Indoor"
}

// Mock data generator from CSV row
export function parseCSVRow(row: any, index: number): DLCFixture {
  // Parse numeric values
  const reportedPPF = parseFloat(row['Reported Photosynthetic Photon Flux (µmol/s)']) || parseFloat(row['Reported Photosynthetic Photon Flux (400-700nm)']) || 0;
  const reportedWattage = parseFloat(row['Reported Input Wattage (W)']) || parseFloat(row['Reported Input Wattage']) || 0;
  const testedPPF = parseFloat(row['Tested Photosynthetic Photon Flux (µmol/s)']) || parseFloat(row['Tested Photosynthetic Photon Flux (400-700nm)']) || 0;
  const testedWattage = parseFloat(row['Tested Input Wattage (W)']) || parseFloat(row['Tested Input Wattage']) || 0;
  
  // Parse PPE values, calculate if missing but PPF and wattage are available
  let reportedPPE = parseFloat(row['Reported Photosynthetic Photon Efficacy (µmol/J)']) || parseFloat(row['Reported Photosynthetic Photon Efficacy (400-700nm)']) || 0;
  if (reportedPPE === 0 && reportedPPF > 0 && reportedWattage > 0) {
    reportedPPE = reportedPPF / reportedWattage;
  }
  
  let testedPPE = parseFloat(row['Tested Photosynthetic Photon Efficacy (µmol/J)']) || parseFloat(row['Tested Photosynthetic Photon Efficacy (400-700nm)']) || 0;
  if (testedPPE === 0 && testedPPF > 0 && testedWattage > 0) {
    testedPPE = testedPPF / testedWattage;
  }
  
  return {
    id: index + 1,
    manufacturer: row['Manufacturer'] || '',
    brand: row['Brand'] || row['Manufacturer'] || '',
    productName: row['Product Name'] || '',
    modelNumber: row['Model Number'] || '',
    dateQualified: row['Date Qualified'] || new Date().toISOString(),
    
    reportedPPE,
    reportedPPF,
    reportedWattage,
    testedPPE,
    testedPPF,
    testedWattage,
    
    minVoltage: parseFloat(row['Reported Minimum Input Voltage (V)']) || parseFloat(row['Reported Minimum Input Voltage']) || 0,
    maxVoltage: parseFloat(row['Reported Maximum Input Voltage (V)']) || parseFloat(row['Reported Maximum Input Voltage']) || 0,
    powerType: row['Input Power Type'] || 'AC',
    powerFactor: parseFloat(row['Reported Power Factor']) || 0,
    thd: parseFloat(row['Reported Total Harmonic Distortion (%)']) || parseFloat(row['Total Harmonic Distortion']) || parseFloat(row['THD']) || 0,
    dimmable: row['Dimmable'] === 'true' || row['Dimmable'] === 'True' || row['Dimmable'] === 'Yes',
    spectrallyTunable: row['Spectrally Tunable'] === 'Yes' || row['Spectrally Tunable'] === 'true',
    
    width: parseFloat(row['Width']) || 0,
    height: parseFloat(row['Height']) || 0,
    length: parseFloat(row['Length']) || 0,
    warranty: parseInt(row['Warranty']) || 0,
    
    blueFlux: parseFloat(row['Reported Photon Flux Blue (400-500nm) (µmol/s)']) || parseFloat(row['Reported Photon Flux Blue (400-500nm)']) || 0,
    greenFlux: parseFloat(row['Reported Photon Flux Green (500-600nm) (µmol/s)']) || parseFloat(row['Reported Photon Flux Green (500-600nm)']) || 0,
    redFlux: parseFloat(row['Reported Photon Flux Red (600-700nm) (µmol/s)']) || parseFloat(row['Reported Photon Flux Red (600-700nm)']) || 0,
    farRedFlux: parseFloat(row['Reported Photon Flux Far Red (700-800nm) (µmol/s)']) || parseFloat(row['Reported Photon Flux Far Red (700-800nm)']) || 0,
    
    dimming010V: row['0-10V'] === 'true' || row['0-10V'] === 'True' || row['0-10V'] === 'Yes',
    dimmingDALI: row['DALI'] === 'true' || row['DALI'] === 'True' || row['DALI'] === 'Yes',
    dimmingPWM: row['PWM'] === 'true' || row['PWM'] === 'True' || row['PWM'] === 'Yes',
    dimmingResistance: row['Resistance'] === 'true' || row['Resistance'] === 'True' || row['Resistance'] === 'Yes',
  }
}

// Generate placeholder image based on fixture characteristics
export function getFixtureImage(fixture: DLCFixture): string {
  // In production, these would be actual product images
  // For now, we'll use a gradient placeholder
  return `/api/placeholder/400/300`
}