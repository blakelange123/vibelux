// IES file generator for DLC fixtures
// Creates synthetic IES files based on fixture dimensions and total PPF output

import type { DLCFixture } from './fixtures-data'

export interface IESPhotometry {
  verticalAngles: number[]
  horizontalAngles: number[]
  candela: number[][] // [vertical][horizontal]
  totalLumens: number
  maxCandela: number
  beamAngle: number
  fieldAngle: number
}

/**
 * Generate synthetic IES photometric data for a DLC fixture
 * @param fixture DLC fixture data
 * @returns IES photometry object
 */
export function generateIESPhotometry(fixture: DLCFixture): IESPhotometry {
  // Convert PPF (μmol/s) to lumens (rough approximation)
  // 1 μmol/s ≈ 0.22 lumens for horticulture spectrum
  const totalLumens = fixture.reportedPPF * 0.22

  // Determine beam characteristics based on fixture dimensions
  const aspectRatio = fixture.length / fixture.width
  const fixtureArea = fixture.length * fixture.width // in square meters
  
  // Calculate beam angles based on fixture size and mounting height
  // Larger fixtures tend to have wider, more distributed light patterns
  const baseBeamAngle = calculateBeamAngle(fixture)
  const fieldAngle = baseBeamAngle * 1.5 // Field angle is typically 1.5x beam angle
  
  // Generate angular grid
  const verticalAngles = generateAngularGrid(0, 90, 19) // 0-90° in 5° increments
  const horizontalAngles = generateAngularGrid(0, 360, 73) // 0-360° in 5° increments
  
  // Generate candela distribution
  const candela = generateCandelaDistribution(
    verticalAngles,
    horizontalAngles,
    totalLumens,
    baseBeamAngle,
    fieldAngle,
    aspectRatio,
    getFixtureType(fixture)
  )
  
  // Find maximum candela value
  const maxCandela = Math.max(...candela.flat())
  
  return {
    verticalAngles,
    horizontalAngles,
    candela,
    totalLumens,
    maxCandela,
    beamAngle: baseBeamAngle,
    fieldAngle
  }
}

/**
 * Calculate beam angle based on fixture physical characteristics and manufacturer-specific patterns
 */
function calculateBeamAngle(fixture: DLCFixture): number {
  const fixtureArea = fixture.length * fixture.width
  const aspectRatio = fixture.length / fixture.width
  
  // Check for manufacturer-specific beam angle patterns
  const manufacturer = fixture.manufacturer.toLowerCase()
  const modelNumber = fixture.modelNumber.toLowerCase()
  
  // Philips/Signify specific beam angles
  if (manufacturer.includes('philips') || manufacturer.includes('signify')) {
    if (modelNumber.includes('production module')) {
      return 140 // Philips production module has 140° beam angle
    }
    if (modelNumber.includes('wb') || modelNumber.includes('wide beam')) {
      return 135 // Wide beam fixtures
    }
    if (modelNumber.includes('sb') || modelNumber.includes('standard beam')) {
      return 90 // Standard beam fixtures
    }
  }
  
  // Base beam angle calculation
  let beamAngle = 60 // Default starting point
  
  // Fixture type adjustments
  if (fixture.reportedWattage > 800) {
    // High-power fixtures tend to be more focused
    beamAngle = 45
  } else if (fixture.reportedWattage < 200) {
    // Low-power fixtures tend to be more spread out
    beamAngle = 90
  }
  
  // Size adjustments
  if (fixtureArea > 0.5) { // Large fixtures (>0.5 m²)
    beamAngle += 20 // Wider distribution
  } else if (fixtureArea < 0.1) { // Small fixtures (<0.1 m²)
    beamAngle -= 15 // More focused
  }
  
  // Aspect ratio adjustments for linear fixtures
  if (aspectRatio > 3) {
    // Linear/bar fixtures have asymmetric distribution
    beamAngle += 10 // Wider perpendicular to length
  }
  
  return Math.max(30, Math.min(150, beamAngle))
}

/**
 * Determine fixture type for photometric modeling
 */
function getFixtureType(fixture: DLCFixture): 'panel' | 'bar' | 'spot' | 'linear' {
  const aspectRatio = fixture.length / fixture.width
  
  if (aspectRatio > 4) return 'linear'
  if (aspectRatio > 2) return 'bar'
  if (fixture.reportedWattage > 600 && aspectRatio < 1.5) return 'panel'
  return 'spot'
}

/**
 * Generate angular grid for photometric measurements
 */
function generateAngularGrid(start: number, end: number, points: number): number[] {
  const step = (end - start) / (points - 1)
  return Array.from({ length: points }, (_, i) => start + i * step)
}

/**
 * Generate candela distribution based on fixture characteristics
 */
function generateCandelaDistribution(
  verticalAngles: number[],
  horizontalAngles: number[],
  totalLumens: number,
  beamAngle: number,
  fieldAngle: number,
  aspectRatio: number,
  fixtureType: 'panel' | 'bar' | 'spot' | 'linear'
): number[][] {
  const candela: number[][] = []
  
  // Calculate center candela intensity
  const centerCandela = totalLumens / (Math.PI * Math.pow(Math.sin(beamAngle * Math.PI / 360), 2))
  
  for (let v = 0; v < verticalAngles.length; v++) {
    candela[v] = []
    const vertAngle = verticalAngles[v]
    
    for (let h = 0; h < horizontalAngles.length; h++) {
      const horizAngle = horizontalAngles[h]
      
      // Calculate intensity based on angle and fixture type
      const intensity = calculateIntensity(
        vertAngle,
        horizAngle,
        beamAngle,
        fieldAngle,
        aspectRatio,
        fixtureType,
        centerCandela
      )
      
      candela[v][h] = Math.max(0, intensity)
    }
  }
  
  return candela
}

/**
 * Calculate candela intensity at specific angles
 */
function calculateIntensity(
  vertAngle: number,
  horizAngle: number,
  beamAngle: number,
  fieldAngle: number,
  aspectRatio: number,
  fixtureType: string,
  centerCandela: number
): number {
  // Vertical distribution (Lambertian-like with beam angle cutoff)
  let verticalFactor = Math.cos(vertAngle * Math.PI / 180)
  
  // Apply beam angle cutoff
  if (vertAngle > fieldAngle) {
    verticalFactor *= Math.exp(-Math.pow((vertAngle - fieldAngle) / 20, 2))
  }
  
  // Horizontal distribution based on fixture type
  let horizontalFactor = 1
  
  switch (fixtureType) {
    case 'linear':
      // Linear fixtures have wide distribution perpendicular to length
      const perpAngle = Math.min(horizAngle, 360 - horizAngle)
      const parallelAngle = Math.min(Math.abs(horizAngle - 90), Math.abs(horizAngle - 270))
      
      if (perpAngle < 90) {
        horizontalFactor = Math.cos(perpAngle * Math.PI / 180) * 0.8 + 0.2
      } else {
        horizontalFactor = Math.cos(parallelAngle * Math.PI / 180) * 0.4 + 0.1
      }
      break
      
    case 'bar':
      // Bar fixtures have moderate asymmetry
      const crossAngle = Math.min(horizAngle, 360 - horizAngle)
      horizontalFactor = Math.cos(crossAngle * Math.PI / 180) * 0.6 + 0.4
      break
      
    case 'panel':
      // Panel fixtures have relatively uniform horizontal distribution
      horizontalFactor = 0.8 + 0.2 * Math.cos(horizAngle * Math.PI / 180)
      break
      
    case 'spot':
    default:
      // Spot fixtures have circular distribution
      horizontalFactor = 1
      break
  }
  
  return centerCandela * verticalFactor * horizontalFactor
}

/**
 * Generate complete IES file content
 */
export function generateIESFile(fixture: DLCFixture, photometry: IESPhotometry): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString()
  const timeStr = now.toLocaleTimeString()
  
  // IES file header
  let iesContent = `IESNA:LM-63-2002
[TEST] Generated synthetic IES file for DLC fixture
[TESTLAB] Vibelux AI Generated
[ISSUEDATE] ${dateStr}
[MANUFAC] ${fixture.manufacturer}
[LUMCAT] ${fixture.modelNumber}
[LUMINAIRE] ${fixture.productName || fixture.modelNumber}
[BALLAST] LED Driver
[MAINTFAC] 0.95
[OTHER] DLC Qualified Fixture - PPF: ${fixture.reportedPPF} μmol/s
[SEARCH] ${fixture.manufacturer} ${fixture.modelNumber}
[MORE] Synthetic photometry based on DLC data
TILT=NONE
1 ${photometry.totalLumens.toFixed(0)} 1 ${photometry.verticalAngles.length} ${photometry.horizontalAngles.length} 1 1 1 0 0 0
1 1 0
${photometry.horizontalAngles.map(a => a.toFixed(1)).join(' ')}
${photometry.verticalAngles.map(a => a.toFixed(1)).join(' ')}
`

  // Add candela values
  for (let v = 0; v < photometry.verticalAngles.length; v++) {
    const row = photometry.candela[v].map(val => val.toFixed(1)).join(' ')
    iesContent += row + '\n'
  }
  
  return iesContent
}

/**
 * Calculate photometric characteristics for fixture selection
 */
export function calculatePhotometricCharacteristics(fixture: DLCFixture) {
  const photometry = generateIESPhotometry(fixture)
  
  // Calculate useful metrics
  const efficacy = fixture.reportedPPF / fixture.reportedWattage // μmol/J
  const powerDensity = fixture.reportedWattage / (fixture.length * fixture.width) // W/m²
  const ppfdAtDistance = calculatePPFDAtDistance(fixture, 0.6) // PPFD at 24" (0.6m)
  
  return {
    beamAngle: photometry.beamAngle,
    fieldAngle: photometry.fieldAngle,
    totalLumens: photometry.totalLumens,
    maxCandela: photometry.maxCandela,
    efficacy,
    powerDensity,
    ppfdAtDistance,
    coverageArea: calculateCoverageArea(fixture, 0.6, 400) // Area with >400 PPFD at 24"
  }
}

/**
 * Calculate PPFD at a specific distance
 */
function calculatePPFDAtDistance(fixture: DLCFixture, distance: number): number {
  // Simplified calculation - assumes uniform distribution over beam angle
  const photometry = generateIESPhotometry(fixture)
  const beamAngleRad = photometry.beamAngle * Math.PI / 180
  const coverageRadius = distance * Math.tan(beamAngleRad / 2)
  const coverageArea = Math.PI * Math.pow(coverageRadius, 2)
  
  return fixture.reportedPPF / coverageArea
}

/**
 * Calculate coverage area at minimum PPFD threshold
 */
function calculateCoverageArea(fixture: DLCFixture, distance: number, minPPFD: number): number {
  const centerPPFD = calculatePPFDAtDistance(fixture, distance)
  if (centerPPFD < minPPFD) return 0
  
  // Calculate radius where PPFD drops to threshold
  const photometry = generateIESPhotometry(fixture)
  const beamAngleRad = photometry.beamAngle * Math.PI / 180
  const maxRadius = distance * Math.tan(beamAngleRad / 2)
  const effectiveRadius = maxRadius * Math.sqrt(minPPFD / centerPPFD)
  
  return Math.PI * Math.pow(effectiveRadius, 2)
}

/**
 * Export IES file for download
 */
export function downloadIESFile(fixture: DLCFixture): void {
  const photometry = generateIESPhotometry(fixture)
  const iesContent = generateIESFile(fixture, photometry)
  
  const blob = new Blob([iesContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fixture.manufacturer}_${fixture.modelNumber}.ies`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}