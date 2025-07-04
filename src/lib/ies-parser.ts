// IES file parser for user-uploaded photometric data
// Parses standard IESNA LM-63 format files

import type { IESPhotometry } from './ies-generator'

export interface ParsedIESFile {
  header: {
    filename: string
    testLab?: string
    issueDate?: string
    manufacturer?: string
    luminaire?: string
    lamp?: string
    ballast?: string
  }
  photometry: IESPhotometry
  metadata: {
    tiltType: string
    numberOfLamps: number
    lumensPerLamp: number
    candelaMultiplier: number
    numberOfVerticalAngles: number
    numberOfHorizontalAngles: number
    photometricType: number
    unitsType: number
    luminousWidth: number
    luminousLength: number
    luminousHeight: number
  }
}

/**
 * Parse an IES file from text content
 */
export function parseIESFile(content: string): ParsedIESFile {
  console.log('Parsing IES file, content length:', content.length)
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  console.log('Total lines:', lines.length)
  console.log('First 5 lines:', lines.slice(0, 5))
  
  let currentIndex = 0
  const header: ParsedIESFile['header'] = { filename: '' }
  
  // Parse header section
  while (currentIndex < lines.length && !lines[currentIndex].toUpperCase().includes('TILT')) {
    const line = lines[currentIndex]
    
    // Parse header fields
    if (line.startsWith('[TEST]')) {
      header.testLab = line.substring(6).trim()
    } else if (line.startsWith('[ISSUEDATE]')) {
      header.issueDate = line.substring(11).trim()
    } else if (line.startsWith('[MANUFAC]')) {
      header.manufacturer = line.substring(9).trim()
    } else if (line.startsWith('[LUMCAT]') || line.startsWith('[LUMINAIRE]')) {
      header.luminaire = line.substring(line.indexOf(']') + 1).trim()
    } else if (line.startsWith('[LAMP]')) {
      header.lamp = line.substring(6).trim()
    } else if (line.startsWith('[BALLAST]')) {
      header.ballast = line.substring(9).trim()
    }
    
    currentIndex++
  }
  
  // Skip TILT line
  if (currentIndex < lines.length && lines[currentIndex].toUpperCase().includes('TILT')) {
    currentIndex++
  }
  
  // Parse photometric data
  if (currentIndex >= lines.length) {
    throw new Error('Invalid IES file: Missing photometric data section')
  }
  
  // Parse the main photometric line - handle multiple lines if needed
  let photometricData: number[] = []
  
  // Keep reading lines until we have at least 10 numbers
  while (currentIndex < lines.length && photometricData.length < 10) {
    const numbers = lines[currentIndex++].split(/\s+/)
      .filter(n => n.length > 0)
      .map(Number)
      .filter(n => !isNaN(n))
    photometricData.push(...numbers)
  }
  
  console.log('Photometric data:', photometricData.length, 'numbers found')
  
  if (photometricData.length < 10) {
    throw new Error(`Invalid IES file: Incomplete photometric data (found ${photometricData.length} values, need at least 10)`)
  }
  
  const photometricLine = photometricData
  
  const [
    numberOfLamps,
    lumensPerLamp,
    candelaMultiplier,
    numberOfVerticalAngles,
    numberOfHorizontalAngles,
    photometricType,
    unitsType,
    luminousWidth,
    luminousLength,
    luminousHeight
  ] = photometricLine
  
  // Parse ballast factor and future use lines (these are sometimes combined or missing)
  let ballastFactor = 1.0
  let futureUse = 1.0
  
  if (currentIndex < lines.length) {
    const ballastLine = lines[currentIndex++].split(/\s+/).map(Number).filter(n => !isNaN(n))
    if (ballastLine.length > 0) ballastFactor = ballastLine[0]
    if (ballastLine.length > 1) futureUse = ballastLine[1]
  }
  
  if (currentIndex < lines.length && futureUse === 1.0) {
    const futureLine = lines[currentIndex++].split(/\s+/).map(Number).filter(n => !isNaN(n))
    if (futureLine.length > 0) futureUse = futureLine[0]
  }
  
  // Parse horizontal angles
  const horizontalAngles: number[] = []
  while (horizontalAngles.length < numberOfHorizontalAngles && currentIndex < lines.length) {
    const line = lines[currentIndex++]
    const angles = line.split(/\s+/)
      .filter(a => a.length > 0)
      .map(Number)
      .filter(n => !isNaN(n))
    horizontalAngles.push(...angles)
  }
  
  // Fill missing angles with defaults if needed
  if (horizontalAngles.length === 0) {
    horizontalAngles.push(0) // Default single horizontal angle
  }
  
  // Parse vertical angles
  const verticalAngles: number[] = []
  while (verticalAngles.length < numberOfVerticalAngles && currentIndex < lines.length) {
    const line = lines[currentIndex++]
    const angles = line.split(/\s+/)
      .filter(a => a.length > 0)
      .map(Number)
      .filter(n => !isNaN(n))
    verticalAngles.push(...angles)
  }
  
  // Fill missing angles with defaults if needed
  while (verticalAngles.length < numberOfVerticalAngles) {
    const lastAngle = verticalAngles[verticalAngles.length - 1] || 0
    verticalAngles.push(lastAngle + 5) // Add 5 degree increments
  }
  
  // Parse candela values
  const candela: number[][] = []
  const totalCandelaValues = numberOfVerticalAngles * numberOfHorizontalAngles
  let allCandelaValues: number[] = []
  
  console.log(`Expecting ${totalCandelaValues} candela values (${numberOfVerticalAngles} vertical x ${numberOfHorizontalAngles} horizontal)`)
  
  // Read all remaining lines for candela data
  while (currentIndex < lines.length && allCandelaValues.length < totalCandelaValues) {
    const line = lines[currentIndex++]
    const values = line.split(/\s+/)
      .filter(v => v.length > 0)
      .map(val => {
        const num = Number(val)
        return isNaN(num) ? 0 : num * candelaMultiplier
      })
    allCandelaValues.push(...values)
  }
  
  console.log(`Found ${allCandelaValues.length} candela values`)
  
  // Fill in missing values with zeros if needed
  while (allCandelaValues.length < totalCandelaValues) {
    allCandelaValues.push(0)
  }
  
  // Organize candela values into 2D array
  let valueIndex = 0
  for (let h = 0; h < numberOfHorizontalAngles; h++) {
    const column: number[] = []
    for (let v = 0; v < numberOfVerticalAngles; v++) {
      column.push(allCandelaValues[valueIndex++] || 0)
    }
    candela.push(column)
  }
  
  // Calculate total lumens and max candela
  const maxCandela = Math.max(...candela.flat())
  const totalLumens = numberOfLamps * lumensPerLamp
  
  // Calculate beam and field angles
  const centerHorizontalIndex = horizontalAngles.length > 1 ? Math.floor(horizontalAngles.length / 2) : 0
  const centerColumn = candela[centerHorizontalIndex] || candela[0] || []
  const maxVerticalCandela = Math.max(...centerColumn, 0)
  
  // Find beam angle (50% of peak intensity)
  const halfMaxCandela = maxVerticalCandela * 0.5
  let beamAngle = 180
  
  for (let v = 0; v < verticalAngles.length && v < centerColumn.length; v++) {
    if (centerColumn[v] <= halfMaxCandela) {
      beamAngle = verticalAngles[v] * 2 // Double because we're measuring from center
      break
    }
  }
  
  const fieldAngle = beamAngle * 1.5 // Approximate field angle
  
  return {
    header,
    photometry: {
      verticalAngles,
      horizontalAngles,
      candela,
      totalLumens,
      maxCandela,
      beamAngle,
      fieldAngle
    },
    metadata: {
      tiltType: 'NONE',
      numberOfLamps,
      lumensPerLamp,
      candelaMultiplier,
      numberOfVerticalAngles,
      numberOfHorizontalAngles,
      photometricType,
      unitsType,
      luminousWidth,
      luminousLength,
      luminousHeight
    }
  }
}

/**
 * Validate IES file format
 */
export function validateIESFile(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    // Basic format checks - make more lenient
    if (!content.toUpperCase().includes('TILT')) {
      console.warn('IES file may be missing TILT directive, attempting to parse anyway')
    }
    
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    if (lines.length < 10) {
      errors.push('File too short to be a valid IES file')
    }
    
    // Try to parse and catch specific errors
    parseIESFile(content)
    
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown parsing error')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Convert uploaded IES file to our internal format
 */
export function convertUploadedIES(file: File): Promise<ParsedIESFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const validation = validateIESFile(content)
        
        if (!validation.valid) {
          reject(new Error(`Invalid IES file: ${validation.errors.join(', ')}`))
          return
        }
        
        const parsedIES = parseIESFile(content)
        parsedIES.header.filename = file.name
        
        resolve(parsedIES)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Extract key photometric characteristics from parsed IES data
 */
export function extractPhotometricSummary(parsedIES: ParsedIESFile) {
  const { photometry, metadata } = parsedIES
  
  const efficacy = photometry.totalLumens / (metadata.numberOfLamps * 100) // Assume 100W per lamp if not specified
  const centerBeamPPFD = photometry.maxCandela * 4.54 // Convert to PPFD approximation
  
  return {
    totalLumens: photometry.totalLumens,
    maxCandela: photometry.maxCandela,
    beamAngle: photometry.beamAngle,
    fieldAngle: photometry.fieldAngle,
    estimatedEfficacy: efficacy,
    centerBeamPPFD,
    fixtureSize: {
      width: metadata.luminousWidth,
      length: metadata.luminousLength,
      height: metadata.luminousHeight
    },
    numberOfLamps: metadata.numberOfLamps
  }
}