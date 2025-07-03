import type { RoomObject } from '../context/types';
import type { RackConfiguration, RackTier } from '../panels/RackConfigurator';

export interface PlacedRackSystem {
  rack: RoomObject;
  fixtures: RoomObject[];
  plants: RoomObject[];
}

export function placeRackSystem(
  config: RackConfiguration,
  x: number,
  y: number,
  rotation: number = 0
): PlacedRackSystem {
  const objects: RoomObject[] = [];
  
  // Create the main rack object
  const rack: RoomObject = {
    id: `rack-${Date.now()}`,
    type: 'rack',
    x,
    y,
    z: 0,
    rotation,
    width: config.width,
    length: config.length,
    height: config.height,
    enabled: true,
    customName: config.name,
    group: config.id
  };

  const fixtures: RoomObject[] = [];
  const plants: RoomObject[] = [];

  // Process each tier
  config.tiers.forEach((tier, tierIndex) => {
    // Place fixtures for this tier
    if (tier.hasLighting) {
      const fixturesOnTier = placeFixturesOnTier(
        tier,
        config,
        x,
        y,
        rotation,
        tierIndex
      );
      fixtures.push(...fixturesOnTier);
    }

    // Place plants for this tier
    if (tier.hasPlants) {
      const plantsOnTier = placePlantsOnTier(
        tier,
        config,
        x,
        y,
        rotation,
        tierIndex
      );
      plants.push(...plantsOnTier);
    }
  });

  return { rack, fixtures, plants };
}

function placeFixturesOnTier(
  tier: RackTier,
  config: RackConfiguration,
  rackX: number,
  rackY: number,
  rotation: number,
  tierIndex: number
): RoomObject[] {
  const fixtures: RoomObject[] = [];
  
  // Calculate fixture positions based on lighting type
  let fixtureZ = tier.height;
  
  if (tier.lightingType === 'under-canopy') {
    // Under-canopy lights are placed below the canopy
    fixtureZ = tier.height + 0.5; // Just above the growing surface
  } else if (tier.lightingType === 'inter-canopy') {
    // Inter-canopy lights are placed within the canopy
    fixtureZ = tier.height + tier.canopyHeight / 2;
  } else {
    // Top lighting is placed above the canopy
    fixtureZ = tier.height + tier.canopyHeight + 1;
  }

  // Calculate fixture spacing
  const fixtureSpacing = config.length / tier.fixtureCount;
  const startOffset = fixtureSpacing / 2;

  for (let i = 0; i < tier.fixtureCount; i++) {
    // Calculate local position relative to rack
    const localX = 0; // Centered on rack width
    const localY = startOffset + i * fixtureSpacing - config.length / 2;

    // Apply rotation to get world position
    const worldPos = rotatePoint(localX, localY, rotation);

    const fixture: RoomObject = {
      id: `fixture-tier${tierIndex}-${i}-${Date.now()}`,
      type: tier.lightingType === 'under-canopy' ? 'underCanopy' : 'fixture',
      x: rackX + worldPos.x,
      y: rackY + worldPos.y,
      z: fixtureZ,
      rotation: rotation,
      width: config.width * 0.8, // Slightly smaller than rack width
      length: 2, // Standard 2ft fixture length
      height: 0.3,
      enabled: true,
      group: config.id,
      customName: `Tier ${tierIndex + 1} - ${tier.lightingType}`
    };

    // Add fixture-specific properties
    if (fixture.type === 'fixture') {
      (fixture as any).model = {
        name: 'Rack LED Bar',
        wattage: 150,
        ppf: 400,
        beamAngle: tier.lightingType === 'inter-canopy' ? 180 : 120,
        efficacy: 2.67,
        spectrum: 'Full Spectrum'
      };
    }

    fixtures.push(fixture);
  }

  return fixtures;
}

function placePlantsOnTier(
  tier: RackTier,
  config: RackConfiguration,
  rackX: number,
  rackY: number,
  rotation: number,
  tierIndex: number
): RoomObject[] {
  const plants: RoomObject[] = [];
  
  // Calculate plant grid spacing
  const rowSpacing = (config.width - 0.5) / tier.plantRows; // Leave margin
  const colSpacing = (config.length - 0.5) / tier.plantColumns;
  
  const startX = -(config.width / 2) + rowSpacing / 2;
  const startY = -(config.length / 2) + colSpacing / 2;

  for (let row = 0; row < tier.plantRows; row++) {
    for (let col = 0; col < tier.plantColumns; col++) {
      // Calculate local position
      const localX = startX + row * rowSpacing;
      const localY = startY + col * colSpacing;

      // Apply rotation
      const worldPos = rotatePoint(localX, localY, rotation);

      // Create rectangular plant/growing area
      const plant: RoomObject = {
        id: `plant-tier${tierIndex}-${row}-${col}-${Date.now()}`,
        type: 'plant',
        x: rackX + worldPos.x,
        y: rackY + worldPos.y,
        z: tier.height,
        rotation: rotation,
        width: rowSpacing * 0.8, // 80% of spacing for gaps
        length: colSpacing * 0.8,
        height: tier.canopyHeight,
        enabled: true,
        group: config.id,
        customName: `${tier.growthStage} - Row ${row + 1} Col ${col + 1}`
      };

      // Add plant-specific properties
      (plant as any).variety = tier.growthStage;
      (plant as any).growthStage = tier.growthStage;
      (plant as any).targetDLI = tier.growthStage === 'flowering' ? 35 : 20;

      plants.push(plant);
    }
  }

  return plants;
}

function rotatePoint(x: number, y: number, angle: number): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos
  };
}

// Calculate PPFD specifically for under-canopy lighting
export function calculateUnderCanopyPPFD(
  fixture: RoomObject,
  measurementHeight: number,
  plantCanopyBottom: number
): number {
  if (fixture.type !== 'underCanopy') return 0;

  // Under-canopy lights shine upward
  const distance = Math.abs(plantCanopyBottom - fixture.z);
  
  // Assume wider beam angle for under-canopy (almost 180°)
  const beamAngle = 170;
  
  // Simple inverse square law with reduced intensity (since it's supplemental)
  const ppf = 200; // Lower PPF for under-canopy
  const distanceInMeters = distance * 0.3048;
  
  // Under-canopy has more uniform distribution
  const ppfd = ppf / (4 * Math.PI * Math.pow(distanceInMeters, 2));
  
  return ppfd;
}

// Enhanced calculation surface for plants
export interface PlantCalculationSurface {
  topSurface: { z: number; area: number };
  bottomSurface: { z: number; area: number };
  sideSurfaces: Array<{ normal: { x: number; y: number; z: number }; area: number }>;
}

export function getPlantCalculationSurfaces(plant: RoomObject): PlantCalculationSurface {
  const topZ = plant.z + plant.height;
  const bottomZ = plant.z + 0.2; // Slightly above base for under-canopy
  
  return {
    topSurface: {
      z: topZ,
      area: plant.width * plant.length
    },
    bottomSurface: {
      z: bottomZ,
      area: plant.width * plant.length
    },
    sideSurfaces: [
      { normal: { x: 1, y: 0, z: 0 }, area: plant.length * plant.height },
      { normal: { x: -1, y: 0, z: 0 }, area: plant.length * plant.height },
      { normal: { x: 0, y: 1, z: 0 }, area: plant.width * plant.height },
      { normal: { x: 0, y: -1, z: 0 }, area: plant.width * plant.height }
    ]
  };
}