import { DesignIntent } from '@/types/design';

interface ParsedRoom {
  zones: Array<{
    name: string;
    area?: { width: number; length: number };
    purpose?: string;
    requirements?: {
      ppfd?: number;
      photoperiod?: number;
      spectrum?: string;
    };
  }>;
  phases?: Array<{
    phase: number;
    description: string;
    timeline?: string;
  }>;
  constraints?: {
    budget?: { min?: number; max?: number; currency?: string };
    electrical?: { maxAmps?: number; voltage?: number };
    height?: number;
    existingEquipment?: string[];
  };
}

interface ComplexDesignIntent extends DesignIntent {
  rooms?: ParsedRoom;
  priorities?: string[];
  specialRequirements?: string[];
}

export function parseComplexRequest(input: string): ComplexDesignIntent {
  const lowerInput = input.toLowerCase();
  const intent: ComplexDesignIntent = {
    targetPPFD: 0,
    priorities: [],
    specialRequirements: []
  };

  // Extract room zones (e.g., "flower room", "veg room", "mother plant area")
  const zones: ParsedRoom['zones'] = [];
  
  // Flower/Bloom room detection
  const flowerMatch = lowerInput.match(/(?:flower|bloom)\s*(?:room|area|zone).*?(\d+)['"\s]*x\s*(\d+)/);
  if (flowerMatch) {
    zones.push({
      name: 'Flower Room',
      area: { width: parseInt(flowerMatch[1]), length: parseInt(flowerMatch[2]) },
      purpose: 'flowering',
      requirements: {
        ppfd: extractPPFD(input, 'flower') || 800,
        photoperiod: 12
      }
    });
  }

  // Veg room detection
  const vegMatch = lowerInput.match(/(?:veg|vegetative|mother)\s*(?:room|area|zone).*?(\d+)['"\s]*x\s*(\d+)/);
  if (vegMatch) {
    zones.push({
      name: 'Vegetative Room',
      area: { width: parseInt(vegMatch[1]), length: parseInt(vegMatch[2]) },
      purpose: 'vegetative',
      requirements: {
        ppfd: extractPPFD(input, 'veg') || 400,
        photoperiod: 18
      }
    });
  }

  // Clone/Propagation area
  const cloneMatch = lowerInput.match(/(?:clone|propagation|nursery)\s*(?:room|area|zone)/);
  if (cloneMatch) {
    zones.push({
      name: 'Propagation Area',
      purpose: 'propagation',
      requirements: {
        ppfd: 150,
        photoperiod: 18,
        spectrum: 'blue-enhanced'
      }
    });
  }

  // Multi-tier/vertical farming detection
  const tierPatterns = [
    /(\d+)\s*tier.*?(\d+)['"\s]*x\s*(\d+)/,
    /(\d+)\s*level.*?vertical.*?(\d+)['"\s]*x\s*(\d+)/,
    /vertical\s*farm.*?(\d+)\s*layers/
  ];

  // Extract phased installation
  const phases: ParsedRoom['phases'] = [];
  const phaseMatch = lowerInput.match(/phase\s*(\d+)|first\s*phase|second\s*phase/g);
  if (phaseMatch) {
    phaseMatch.forEach((match, index) => {
      phases.push({
        phase: index + 1,
        description: extractPhaseDescription(input, match)
      });
    });
  }

  // Extract budget constraints
  const budgetMatch = lowerInput.match(/budget.*?\$?([\d,]+)(?:k|thousand)?/);
  const maxBudget = budgetMatch ? 
    parseInt(budgetMatch[1].replace(/,/g, '')) * (budgetMatch[0].includes('k') ? 1000 : 1) : 
    null;

  // Extract electrical constraints
  const electricalMatch = lowerInput.match(/(\d+)\s*amp|(\d+)a\s|(\d+)\s*circuit/);
  const maxAmps = electricalMatch ? 
    parseInt(electricalMatch[1] || electricalMatch[2] || electricalMatch[3]) : 
    null;

  // Extract priorities
  if (lowerInput.includes('efficien')) intent.priorities?.push('efficiency');
  if (lowerInput.includes('uniform')) intent.priorities?.push('uniformity');
  if (lowerInput.includes('budget') || lowerInput.includes('cheap')) intent.priorities?.push('cost');
  if (lowerInput.includes('yield') || lowerInput.includes('production')) intent.priorities?.push('yield');
  if (lowerInput.includes('quality')) intent.priorities?.push('quality');

  // Extract special requirements
  if (lowerInput.includes('organic')) intent.specialRequirements?.push('organic-certified');
  if (lowerInput.includes('gmp') || lowerInput.includes('pharmaceutical')) intent.specialRequirements?.push('GMP-compliant');
  if (lowerInput.includes('research')) intent.specialRequirements?.push('research-grade');
  if (lowerInput.includes('dimm')) intent.specialRequirements?.push('dimmable');
  if (lowerInput.includes('wireless') || lowerInput.includes('smart')) intent.specialRequirements?.push('wireless-control');

  // Extract crop-specific requirements
  const cropTypes = {
    cannabis: { flower: 800, veg: 400, clone: 150 },
    lettuce: { mature: 250, seedling: 150 },
    tomatoes: { fruit: 600, veg: 400 },
    strawberries: { fruit: 400, veg: 300 },
    herbs: { mature: 300, seedling: 200 },
    microgreens: { production: 200 }
  };

  // Build complex intent
  intent.rooms = {
    zones,
    phases: phases.length > 0 ? phases : undefined,
    constraints: {
      budget: maxBudget ? { max: maxBudget } : undefined,
      electrical: maxAmps ? { maxAmps } : undefined
    }
  };

  return intent;
}

function extractPPFD(input: string, zoneType: string): number | null {
  const patterns = [
    new RegExp(`${zoneType}.*?(\\d+)\\s*(?:ppfd|μmol|umol|micromol)`),
    new RegExp(`(\\d+)\\s*(?:ppfd|μmol|umol|micromol).*?${zoneType}`)
  ];
  
  for (const pattern of patterns) {
    const match = input.toLowerCase().match(pattern);
    if (match) return parseInt(match[1]);
  }
  
  return null;
}

function extractPhaseDescription(input: string, phaseMatch: string): string {
  const sentences = input.split(/[.!?]/);
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(phaseMatch)) {
      return sentence.trim();
    }
  }
  return phaseMatch;
}

// Advanced pattern matching for complex scenarios
export function parseMultiZoneRequest(input: string): ComplexDesignIntent {
  const intent = parseComplexRequest(input);
  
  // Handle combined requests like "I need a 20x40 flower room at 800 PPFD and a 10x20 veg room at 400 PPFD"
  const multiRoomPattern = /(\d+)['"\s]*x\s*(\d+).*?(flower|veg|bloom|mother|clone).*?(\d+)\s*ppfd/gi;
  let match;
  
  while ((match = multiRoomPattern.exec(input)) !== null) {
    const [_, width, length, roomType, ppfd] = match;
    const zone = {
      name: `${roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room`,
      area: { width: parseInt(width), length: parseInt(length) },
      purpose: roomType.toLowerCase(),
      requirements: {
        ppfd: parseInt(ppfd),
        photoperiod: roomType.includes('flower') || roomType.includes('bloom') ? 12 : 18
      }
    };
    
    if (!intent.rooms) intent.rooms = { zones: [] };
    intent.rooms.zones.push(zone);
  }
  
  return intent;
}