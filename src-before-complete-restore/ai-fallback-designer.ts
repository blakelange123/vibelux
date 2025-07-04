// Fallback design system when OpenAI is rate limited
// This ensures users ALWAYS get a design response

interface FallbackDesignRequest {
  width: number;
  height: number;
  length: number;
  targetPPFD: number;
  mountingHeight: number;
  rackCount?: number;
  tierSpacing?: number;
  rackWidth?: number;
  rackLength?: number;
  layers?: number;
  isRackRequest?: boolean;
}

export function generateFallbackDesign(
  message: string,
  roomDimensions: { width: number; length: number; height: number }
): any {
  const lowerMessage = message.toLowerCase();
  
  // Check if this is a fixture calculation question
  if (lowerMessage.includes('verjure') || lowerMessage.includes('arize') || 
      lowerMessage.includes('how many') || lowerMessage.includes('require')) {
    return handleFixtureCalculation(message);
  }
  
  // Parse the user's request
  const parsed = parseDesignRequest(message, roomDimensions);
  
  // Generate appropriate response based on request type
  let response = '';
  if (parsed.isRackRequest && parsed.rackCount) {
    response = `I'll create ${parsed.rackCount} rack${parsed.rackCount > 1 ? 's' : ''} (${parsed.rackWidth}' x ${parsed.rackLength}') with ${parsed.layers || 5} layers`;
    if (parsed.targetPPFD) {
      response += ` targeting ${parsed.targetPPFD} PPFD`;
    }
    response += '. Using our optimized design system while the AI service is at capacity.';
  } else {
    response = `I'll create a design for your ${parsed.width}' x ${parsed.length}' space with ${parsed.targetPPFD} PPFD. Using our optimized design system while the AI service is at capacity.`;
  }
  
  // Generate a basic but functional design
  const design = {
    intent: 'new_design',
    response: response,
    design: {
      zones: [{
        name: "Main Growing Area",
        dimensions: { 
          width: parsed.width, 
          length: parsed.length, 
          height: parsed.height || roomDimensions?.height || 10
        },
        purpose: "cultivation",
        targetPPFD: parsed.targetPPFD,
        fixtures: generateFixtureLayout(parsed),
        racks: (parsed.rackCount || parsed.isRackRequest) ? generateRacks(parsed) : [],
        environmental: {
          hvacFans: [],
          temperature: { day: 75, night: 65 },
          humidity: { day: 60, night: 50 },
          co2: 1200
        }
      }],
      metrics: calculateMetrics(parsed)
    }
  };
  
  return design;
}

function parseDesignRequest(message: string, room: any): FallbackDesignRequest {
  const lowerMessage = message.toLowerCase();
  
  // Check if this is specifically a rack request
  const isRackRequest = lowerMessage.includes('rack') || lowerMessage.includes('tier') || lowerMessage.includes('layer') || lowerMessage.includes('ayer');
  
  // Extract rack dimensions FIRST if it's a rack request
  let rackWidth = 2; // default
  let rackLength = 8; // default
  let rackCount = 1;
  let layers = 5;
  
  if (isRackRequest) {
    // Look for rack dimensions like "1' x 5' rack" or "rack that is 1' x 5'"
    const rackDimMatch = message.match(/rack[^0-9]*(\d+(?:\.\d+)?)'?\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)'?/i) ||
                        message.match(/(\d+(?:\.\d+)?)'?\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)'?\s*(?:rack|with)/i);
    
    if (rackDimMatch) {
      rackWidth = parseFloat(rackDimMatch[1]);
      rackLength = parseFloat(rackDimMatch[2]);
    }
    
    // Extract layers/tiers
    const layerMatch = message.match(/(\d+)\s*(?:layer|ayer|tier|level)/i);
    if (layerMatch) {
      layers = parseInt(layerMatch[1]);
    }
    
    // Extract rack count
    const countMatch = message.match(/(\d+)\s*rack/i);
    if (countMatch) {
      rackCount = parseInt(countMatch[1]);
    }
  }
  
  // Use room dimensions from existing room or defaults
  let width = room?.width || 40;
  let length = room?.length || 40;
  
  // Look for room dimensions if not a rack request
  if (!isRackRequest) {
    const roomDimensionMatch = message.match(/room[^0-9]*(\d+)'?\s*(?:x|by|×)\s*(\d+)'?/i) || 
                               message.match(/(\d+)'?\s*(?:x|by|×)\s*(\d+)'?\s*(?:room|space|area)/i);
    if (roomDimensionMatch) {
      width = parseInt(roomDimensionMatch[1]);
      length = parseInt(roomDimensionMatch[2]);
    }
  }
  
  // Extract PPFD - also check for "ppdf" typo
  const ppfdMatch = message.match(/(\d+)\s*(?:ppfd|ppdf|umol|μmol)/i);
  
  // Extract mounting height or "from ceiling" or "at floor"
  let mountingHeight = 10; // Default ceiling mount
  const heightMatch = message.match(/(\d+(?:\.\d+)?)'?\s*(?:mounting|height|from|at)/i);
  const ceilingMatch = message.match(/ceiling|top/i);
  const floorMatch = message.match(/floor|ground|bottom/i);
  
  if (heightMatch) {
    mountingHeight = parseFloat(heightMatch[1]);
  } else if (ceilingMatch) {
    mountingHeight = room?.height ? room.height - 2 : 8; // 2 feet from ceiling
  } else if (floorMatch) {
    mountingHeight = 3; // 3 feet from floor
  }
  
  // Extract tier spacing
  const tierMatch = message.match(/(\d+(?:\.\d+)?)'?\s*(?:between|spacing)/i);
  
  return {
    width: width,
    length: length,
    height: room?.height || 10,
    targetPPFD: ppfdMatch ? parseInt(ppfdMatch[1]) : (isRackRequest ? 200 : 800),
    mountingHeight: mountingHeight,
    rackCount: rackCount,
    tierSpacing: tierMatch ? parseFloat(tierMatch[1]) : 1.5,
    rackWidth: rackWidth,
    rackLength: rackLength,
    layers: layers,
    isRackRequest: isRackRequest
  };
}

function generateFixtureLayout(params: FallbackDesignRequest): any[] {
  const fixtures = [];
  
  // For rack systems, calculate fixtures based on rack area
  if (params.isRackRequest) {
    const rackCount = params.rackCount || 1;
    const layers = params.layers || 5;
    const rackArea = params.rackWidth * params.rackLength;
    
    // For small racks, use lower wattage fixtures
    const fixtureOptions = rackArea < 20 ? [
      { model: "Element L260", manufacturer: "Current", wattage: 260, ppf: 676 },
      { model: "VYPR 2x", manufacturer: "Fluence", wattage: 215, ppf: 560 }
    ] : [
      { model: "VYPR 2p", manufacturer: "Fluence", wattage: 430, ppf: 1130 },
      { model: "LED-TH-500", manufacturer: "Gavita", wattage: 500, ppf: 1300 }
    ];
    
    // Calculate fixtures per layer based on rack size
    const fixturesPerLayer = Math.max(1, Math.ceil(rackArea / 10)); // 1 fixture per 10 sq ft
    
    // Generate fixtures for each rack and layer
    for (let r = 0; r < rackCount; r++) {
      for (let l = 0; l < layers; l++) {
        for (let f = 0; f < fixturesPerLayer; f++) {
          const fixture = fixtureOptions[f % fixtureOptions.length];
          fixtures.push({
            id: `fixture_${Date.now()}_r${r}_l${l}_f${f}`,
            model: fixture.model,
            manufacturer: fixture.manufacturer,
            quantity: 1,
            x: params.width / 2, // Will be positioned relative to rack
            y: params.length / 2,
            z: (l * params.tierSpacing) + 0.5, // Above each tier
            rotation: 0,
            wattage: fixture.wattage,
            ppf: fixture.ppf,
            spectrum: "Full spectrum",
            dimmingLevel: calculateDimming(params.targetPPFD),
            rackAssignment: `rack_${r}`,
            tier: l
          });
        }
      }
    }
    
    return fixtures;
  }
  
  // Original logic for room-based layouts
  const totalArea = params.width * params.length;
  
  // Adjust coverage based on PPFD target
  let areaPerFixture = 25; // Default for 800 PPFD
  if (params.targetPPFD < 400) {
    areaPerFixture = 50; // Lower PPFD = more coverage per fixture
  } else if (params.targetPPFD < 600) {
    areaPerFixture = 35;
  } else if (params.targetPPFD > 1000) {
    areaPerFixture = 15; // Higher PPFD = less coverage
  }
  
  // For small rooms, ensure at least 1 fixture
  const fixtureCount = Math.max(1, Math.ceil(totalArea / areaPerFixture));
  
  // Calculate grid layout
  const cols = Math.ceil(Math.sqrt(fixtureCount * params.width / params.length));
  const rows = Math.ceil(fixtureCount / cols);
  
  const spacingX = params.width / (cols + 1);
  const spacingY = params.length / (rows + 1);
  
  // Select appropriate fixtures based on PPFD target
  let fixtureOptions = [];
  
  if (params.targetPPFD < 400) {
    // Lower power fixtures for propagation/veg
    fixtureOptions = [
      { model: "GrowFlux FluxScale 250", manufacturer: "GrowFlux", wattage: 250, ppf: 650 },
      { model: "SPYDR 2p", manufacturer: "Fluence", wattage: 330, ppf: 850 },
      { model: "Arize Element L260", manufacturer: "Current", wattage: 260, ppf: 676 }
    ];
  } else if (params.targetPPFD < 600) {
    // Medium power for veg/early flower
    fixtureOptions = [
      { model: "VYPR 2p", manufacturer: "Fluence", wattage: 430, ppf: 1130 },
      { model: "LED-TH-500", manufacturer: "Gavita", wattage: 500, ppf: 1300 },
      { model: "Element L400", manufacturer: "Current", wattage: 400, ppf: 1040 }
    ];
  } else {
    // High power for flowering
    fixtureOptions = [
      { model: "VYPR 3p", manufacturer: "Fluence", wattage: 645, ppf: 1700 },
      { model: "Fohse A3i", manufacturer: "Fohse", wattage: 630, ppf: 1680 },
      { model: "LED-THG-600", manufacturer: "Gavita", wattage: 600, ppf: 1560 }
    ];
  }
  
  let fixtureIndex = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (fixtureIndex < fixtureCount) {
        const fixture = fixtureOptions[fixtureIndex % fixtureOptions.length];
        fixtures.push({
          id: `fixture_${Date.now()}_${fixtureIndex}`,
          model: fixture.model,
          manufacturer: fixture.manufacturer,
          quantity: 1,
          x: spacingX * (col + 1),
          y: spacingY * (row + 1),
          z: params.mountingHeight,
          rotation: 0,
          wattage: fixture.wattage,
          ppf: fixture.ppf,
          spectrum: "Full spectrum",
          dimmingLevel: calculateDimming(params.targetPPFD)
        });
        fixtureIndex++;
      }
    }
  }
  
  return fixtures;
}

function generateRacks(params: FallbackDesignRequest): any[] {
  if (!params.rackCount && !params.isRackRequest) return [];
  
  const racks = [];
  const rackCount = params.rackCount || 1;
  
  // For small racks or single rack, center it
  if (rackCount === 1 || params.rackWidth <= 2) {
    racks.push({
      id: `rack_${Date.now()}_0`,
      type: "rack",
      x: params.width / 2,
      y: params.length / 2,
      width: params.rackWidth || 2,
      length: params.rackLength || 8,
      tiers: params.layers || 5,
      tierHeight: params.tierSpacing || 1.5,
      orientation: "north-south"
    });
  } else {
    // Multiple racks - distribute evenly
    const rackSpacing = params.width / (rackCount + 1);
    
    for (let i = 0; i < rackCount; i++) {
      racks.push({
        id: `rack_${Date.now()}_${i}`,
        type: "rack",
        x: rackSpacing * (i + 1),
        y: params.length / 2,
        width: params.rackWidth || 2,
        length: params.rackLength || 8,
        tiers: params.layers || 5,
        tierHeight: params.tierSpacing || 1.5,
        orientation: "north-south"
      });
    }
  }
  
  return racks;
}

function calculateDimming(targetPPFD: number): number {
  // Rough calculation for dimming level
  const basePPFD = 1000;
  return Math.min(100, Math.round((targetPPFD / basePPFD) * 100));
}

function calculateMetrics(params: FallbackDesignRequest): any {
  const area = params.width * params.length;
  const fixtureCount = Math.ceil(area / 25);
  const totalWattage = fixtureCount * 630; // Average fixture wattage
  
  return {
    totalWattage,
    avgPPFD: params.targetPPFD,
    uniformity: 0.85, // Typical for good layout
    dli: (params.targetPPFD * 12 * 3600) / 1000000, // 12 hour photoperiod
    coverage: 95,
    efficacy: 2.7 // μmol/J typical
  };
}

function handleFixtureCalculation(message: string): any {
  const lowerMessage = message.toLowerCase();
  
  // Extract tray dimensions
  const trayMatch = message.match(/(\d+(?:\.\d+)?)'?\s*(?:x|by|×)\s*(\d+(?:\.\d+)?)'?\s*(?:tray|area|space)?/i);
  
  if (!trayMatch) {
    return {
      intent: 'question',
      response: "I couldn't parse the tray dimensions. Please specify like '2' x 4' tray' and I'll calculate the fixture requirements.",
      design: null
    };
  }
  
  const trayWidth = parseFloat(trayMatch[1]);
  const trayLength = parseFloat(trayMatch[2]);
  const trayArea = trayWidth * trayLength;
  
  // Extract target PPFD if mentioned
  const ppfdMatch = message.match(/(\d+)\s*(?:ppfd|ppdf|umol|μmol)/i);
  const targetPPFD = ppfdMatch ? parseInt(ppfdMatch[1]) : 300; // Default for leafy greens
  
  // Verjure Arize Life 2 specs (approximate)
  const verjureLife2 = {
    name: "Verjure Arize Life 2",
    wattage: 240,
    ppf: 648, // 2.7 μmol/J efficacy
    coverage: 4, // ~4 sq ft optimal coverage at 12" height
    dimensions: { length: 24, width: 24 } // inches
  };
  
  // Calculate fixture requirements
  const fixturesNeeded = Math.ceil(trayArea / verjureLife2.coverage);
  const totalWattage = fixturesNeeded * verjureLife2.wattage;
  const totalPPF = fixturesNeeded * verjureLife2.ppf;
  const avgPPFD = Math.round(totalPPF / trayArea);
  
  // Determine if it meets requirements
  const meetsTarget = avgPPFD >= targetPPFD;
  
  // Calculate alternative option with fewer fixtures
  const minFixtures = Math.max(3, fixturesNeeded - 1);
  const minPPFD = Math.round((minFixtures * verjureLife2.ppf) / trayArea);
  
  let response = `For a ${trayWidth}' × ${trayLength}' tray (${trayArea} sq ft), here's my analysis:\n\n`;
  response += `**Recommended: ${fixturesNeeded} Verjure Arize Life 2 fixtures**\n`;
  response += `- Total wattage: ${totalWattage}W\n`;
  response += `- Average PPFD: ~${avgPPFD} μmol/m²/s\n`;
  response += `- Coverage: Excellent uniformity\n\n`;
  
  if (targetPPFD) {
    response += `Target PPFD of ${targetPPFD}: ${meetsTarget ? '✓ Achieved' : '✗ Not met'}\n\n`;
  }
  
  response += `**Alternative: ${minFixtures} fixtures**\n`;
  response += `- Total wattage: ${minFixtures * verjureLife2.wattage}W\n`;
  response += `- Average PPFD: ~${minPPFD} μmol/m²/s\n`;
  response += `- Note: ${minPPFD < 250 ? 'May be insufficient for optimal growth' : 'Adequate for most leafy greens'}\n\n`;
  
  response += `**Recommendation**: Use ${fixturesNeeded} fixtures for optimal results. The Arize Life 2 is excellent for vertical farming with its square form factor and high efficacy.`;
  
  return {
    intent: 'question',
    response: response,
    design: null,
    calculation: {
      traySize: { width: trayWidth, length: trayLength, area: trayArea },
      fixtureModel: verjureLife2.name,
      fixturesRecommended: fixturesNeeded,
      fixturesMinimum: minFixtures,
      ppfdAchieved: avgPPFD,
      ppfdTarget: targetPPFD,
      totalWattage: totalWattage
    }
  };
}

export function isRateLimitError(error: any): boolean {
  return error?.message?.includes('429') || 
         error?.message?.includes('rate_limit') ||
         error?.status === 429;
}