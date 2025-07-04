// AI Command Parser - Handles various types of requests beyond standard designs

export type CommandType = 
  | 'design_room'
  | 'design_rack'
  | 'add_fixture'
  | 'remove_fixture'
  | 'add_fan'
  | 'add_dehumidifier'
  | 'add_hvac'
  | 'adjust_ppfd'
  | 'change_spectrum'
  | 'calculate'
  | 'optimize'
  | 'compare'
  | 'question'
  | 'unknown'

export interface ParsedCommand {
  type: CommandType
  parameters: Record<string, any>
  confidence: number
  originalText: string
}

export function parseAICommand(text: string): ParsedCommand {
  const lowerText = text.toLowerCase()
  
  // Check for "add" commands
  if (lowerText.includes('add')) {
    if (lowerText.match(/add\s+(?:a\s+)?(?:another\s+)?fixture/)) {
      return {
        type: 'add_fixture',
        parameters: extractAddFixtureParams(text),
        confidence: 0.9,
        originalText: text
      }
    }
    if (lowerText.match(/add\s+(?:a\s+)?(?:another\s+)?fan/)) {
      return {
        type: 'add_fan',
        parameters: extractFanParams(text),
        confidence: 0.9,
        originalText: text
      }
    }
    if (lowerText.match(/add\s+(?:a\s+)?dehumidifier/)) {
      return {
        type: 'add_dehumidifier',
        parameters: extractDehumidifierParams(text),
        confidence: 0.9,
        originalText: text
      }
    }
    if (lowerText.match(/add\s+(?:a\s+)?(?:hvac|ac|air\s+condition)/)) {
      return {
        type: 'add_hvac',
        parameters: extractHVACParams(text),
        confidence: 0.9,
        originalText: text
      }
    }
  }
  
  // Check for "remove" commands
  if (lowerText.includes('remove') || lowerText.includes('delete')) {
    if (lowerText.match(/(?:remove|delete)\s+(?:a\s+)?fixture/)) {
      return {
        type: 'remove_fixture',
        parameters: { count: extractNumber(text) || 1 },
        confidence: 0.9,
        originalText: text
      }
    }
  }
  
  // Check for adjustment commands
  if (lowerText.match(/(?:adjust|change|increase|decrease|set)\s+(?:the\s+)?ppfd/)) {
    return {
      type: 'adjust_ppfd',
      parameters: {
        targetPPFD: extractNumber(text),
        action: lowerText.includes('increase') ? 'increase' : 
                lowerText.includes('decrease') ? 'decrease' : 'set'
      },
      confidence: 0.85,
      originalText: text
    }
  }
  
  // Check for spectrum changes
  if (lowerText.match(/(?:change|adjust|set)\s+(?:the\s+)?spectrum/)) {
    return {
      type: 'change_spectrum',
      parameters: extractSpectrumParams(text),
      confidence: 0.8,
      originalText: text
    }
  }
  
  // Check for optimization requests
  if (lowerText.includes('optimize')) {
    return {
      type: 'optimize',
      parameters: {
        target: lowerText.includes('energy') ? 'energy' :
                lowerText.includes('uniform') ? 'uniformity' :
                lowerText.includes('coverage') ? 'coverage' : 'general'
      },
      confidence: 0.8,
      originalText: text
    }
  }
  
  // Check for calculation requests
  if (lowerText.match(/(?:calculate|what is|what's|how much)/)) {
    return {
      type: 'calculate',
      parameters: extractCalculationParams(text),
      confidence: 0.75,
      originalText: text
    }
  }
  
  // Check for comparison requests
  if (lowerText.includes('compare') || lowerText.includes('vs') || lowerText.includes('versus')) {
    return {
      type: 'compare',
      parameters: extractComparisonParams(text),
      confidence: 0.7,
      originalText: text
    }
  }
  
  // Check for standard design requests
  if (hasRoomDimensions(text)) {
    const isRack = lowerText.includes('rack') || lowerText.includes('shelf') || 
                   lowerText.includes('tier') || lowerText.includes('vertical')
    return {
      type: isRack ? 'design_rack' : 'design_room',
      parameters: extractDesignParams(text),
      confidence: 0.9,
      originalText: text
    }
  }
  
  // Check if it's a question
  if (lowerText.match(/^(what|how|why|when|where|can|do|does|is|are)/)) {
    return {
      type: 'question',
      parameters: { question: text },
      confidence: 0.8,
      originalText: text
    }
  }
  
  // Default to unknown
  return {
    type: 'unknown',
    parameters: {},
    confidence: 0.3,
    originalText: text
  }
}

function extractAddFixtureParams(text: string): Record<string, any> {
  const params: Record<string, any> = {}
  const lowerText = text.toLowerCase()
  
  // Extract count
  const countMatch = text.match(/(\d+)\s+(?:more\s+)?fixtures?/)
  params.count = countMatch ? parseInt(countMatch[1]) : 1
  
  // Extract wattage
  const wattageMatch = text.match(/(\d+)\s*w(?:att)?/)
  if (wattageMatch) params.wattage = parseInt(wattageMatch[1])
  
  // Extract position hints
  if (lowerText.includes('corner')) params.position = 'corner'
  if (lowerText.includes('center')) params.position = 'center'
  if (lowerText.includes('between')) params.position = 'between'
  
  // Extract fixture type
  if (lowerText.includes('bar')) params.fixtureType = 'bar'
  if (lowerText.includes('panel')) params.fixtureType = 'panel'
  
  return params
}

function extractFanParams(text: string): Record<string, any> {
  const params: Record<string, any> = {}
  const lowerText = text.toLowerCase()
  
  // Extract size
  const sizeMatch = text.match(/(\d+)\s*(?:inch|")\s*fan/)
  if (sizeMatch) params.size = parseInt(sizeMatch[1])
  
  // Extract CFM
  const cfmMatch = text.match(/(\d+)\s*cfm/)
  if (cfmMatch) params.cfm = parseInt(cfmMatch[1])
  
  // Extract type
  if (lowerText.includes('oscillat')) params.type = 'oscillating'
  if (lowerText.includes('exhaust')) params.type = 'exhaust'
  if (lowerText.includes('intake')) params.type = 'intake'
  if (lowerText.includes('circulation')) params.type = 'circulation'
  
  // Extract position
  if (lowerText.includes('wall')) params.mounting = 'wall'
  if (lowerText.includes('ceiling')) params.mounting = 'ceiling'
  if (lowerText.includes('floor')) params.mounting = 'floor'
  
  return params
}

function extractDehumidifierParams(text: string): Record<string, any> {
  const params: Record<string, any> = {}
  
  // Extract capacity (pints per day)
  const capacityMatch = text.match(/(\d+)\s*(?:pint|ppd)/)
  if (capacityMatch) params.capacity = parseInt(capacityMatch[1])
  
  // Extract size hints
  if (text.toLowerCase().includes('small')) params.size = 'small'
  if (text.toLowerCase().includes('large')) params.size = 'large'
  if (text.toLowerCase().includes('commercial')) params.size = 'commercial'
  
  return params
}

function extractHVACParams(text: string): Record<string, any> {
  const params: Record<string, any> = {}
  
  // Extract BTU or tonnage
  const btuMatch = text.match(/(\d+)\s*btu/)
  const tonMatch = text.match(/(\d+\.?\d*)\s*ton/)
  
  if (btuMatch) params.btu = parseInt(btuMatch[1])
  if (tonMatch) params.tons = parseFloat(tonMatch[1])
  
  // Extract type
  const lowerText = text.toLowerCase()
  if (lowerText.includes('mini split')) params.type = 'mini-split'
  if (lowerText.includes('window')) params.type = 'window'
  if (lowerText.includes('portable')) params.type = 'portable'
  
  return params
}

function extractSpectrumParams(text: string): Record<string, any> {
  const params: Record<string, any> = {}
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('flower')) params.spectrum = 'flowering'
  if (lowerText.includes('veg')) params.spectrum = 'vegetative'
  if (lowerText.includes('full')) params.spectrum = 'full'
  if (lowerText.includes('enhanced red')) params.spectrum = 'enhanced-red'
  
  // Extract color ratios
  const blueMatch = text.match(/(\d+)%?\s*blue/)
  const redMatch = text.match(/(\d+)%?\s*red/)
  
  if (blueMatch) params.blueRatio = parseInt(blueMatch[1])
  if (redMatch) params.redRatio = parseInt(redMatch[1])
  
  return params
}

function extractCalculationParams(text: string): Record<string, any> {
  const params: Record<string, any> = {}
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('dli')) params.calculate = 'dli'
  if (lowerText.includes('ppfd')) params.calculate = 'ppfd'
  if (lowerText.includes('power') || lowerText.includes('watt')) params.calculate = 'power'
  if (lowerText.includes('cost')) params.calculate = 'cost'
  if (lowerText.includes('heat')) params.calculate = 'heat'
  
  return params
}

function extractComparisonParams(text: string): Record<string, any> {
  const params: Record<string, any> = {}
  
  // Try to extract fixture models or types being compared
  const vsMatch = text.match(/(.+?)\s+(?:vs|versus|compare|against)\s+(.+)/i)
  if (vsMatch) {
    params.item1 = vsMatch[1].trim()
    params.item2 = vsMatch[2].trim()
  }
  
  return params
}

function extractDesignParams(text: string): Record<string, any> {
  // This is the existing design parameter extraction logic
  // from the AI Assistant component
  const params: Record<string, any> = {}
  
  // Extract dimensions
  const dimensionMatch = text.match(/(\d+\.?\d*)\s*[x×by]\s*(\d+\.?\d*)/)
  if (dimensionMatch) {
    params.width = parseFloat(dimensionMatch[1])
    params.length = parseFloat(dimensionMatch[2])
  }
  
  // Extract PPFD
  const ppfdMatch = text.match(/(\d+)\s*(?:ppfd|μmol|umol)/)
  if (ppfdMatch) params.targetPPFD = parseInt(ppfdMatch[1])
  
  // Extract other parameters...
  
  return params
}

function hasRoomDimensions(text: string): boolean {
  return /\d+\.?\d*\s*[x×by]\s*\d+\.?\d*/.test(text)
}

function extractNumber(text: string): number | null {
  const match = text.match(/\d+\.?\d*/)
  return match ? parseFloat(match[0]) : null
}