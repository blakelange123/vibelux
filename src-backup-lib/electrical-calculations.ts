/**
 * Comprehensive electrical calculations library
 * NEC-compliant calculations for lighting installations
 */

export interface ElectricalFixture {
  id: string;
  wattage: number;
  voltage: number;
  powerFactor: number;
  quantity: number;
  location: { x: number; y: number };
  continuous: boolean;
}

export interface CircuitDesign {
  id: string;
  voltage: number;
  phases: number;
  breakerSize: number;
  wireGauge: string;
  conduitSize: string;
  maxLength: number;
  fixtures: string[];
  loadWatts: number;
  loadAmps: number;
  utilizationPercent: number;
  voltageDrop: number;
}

export interface PanelDesign {
  id: string;
  name: string;
  voltage: number;
  phases: number;
  mainBreaker: number;
  busRating: number;
  spaces: number;
  circuits: CircuitDesign[];
  totalLoad: number;
  demandLoad: number;
  phaseBalance: {
    phaseA: number;
    phaseB: number;
    phaseC: number;
  };
}

export interface WireSpecification {
  gauge: string;
  ampacity: number;
  resistance: number; // ohms per 1000 ft
  diameterInches: number;
  weightPerFoot: number;
  costPerFoot: number;
}

export interface ConduitSpecification {
  size: string;
  diameter: number;
  fillArea: number; // 40% fill
  maxWires: Record<string, number>;
  costPerFoot: number;
}

// NEC Wire Ampacity Table (75°C column, copper)
export const WIRE_SPECIFICATIONS: Record<string, WireSpecification> = {
  '14': { gauge: '14', ampacity: 20, resistance: 3.14, diameterInches: 0.064, weightPerFoot: 0.014, costPerFoot: 1.85 },
  '12': { gauge: '12', ampacity: 25, resistance: 1.98, diameterInches: 0.081, weightPerFoot: 0.022, costPerFoot: 2.45 },
  '10': { gauge: '10', ampacity: 35, resistance: 1.24, diameterInches: 0.102, weightPerFoot: 0.035, costPerFoot: 2.95 },
  '8': { gauge: '8', ampacity: 50, resistance: 0.778, diameterInches: 0.128, weightPerFoot: 0.056, costPerFoot: 4.75 },
  '6': { gauge: '6', ampacity: 65, resistance: 0.491, diameterInches: 0.162, weightPerFoot: 0.089, costPerFoot: 7.25 },
  '4': { gauge: '4', ampacity: 85, resistance: 0.308, diameterInches: 0.204, weightPerFoot: 0.141, costPerFoot: 11.50 },
  '3': { gauge: '3', ampacity: 100, resistance: 0.245, diameterInches: 0.229, weightPerFoot: 0.178, costPerFoot: 14.25 },
  '2': { gauge: '2', ampacity: 115, resistance: 0.194, diameterInches: 0.258, weightPerFoot: 0.224, costPerFoot: 18.25 },
  '1': { gauge: '1', ampacity: 130, resistance: 0.154, diameterInches: 0.289, weightPerFoot: 0.283, costPerFoot: 23.50 },
  '1/0': { gauge: '1/0', ampacity: 150, resistance: 0.122, diameterInches: 0.325, weightPerFoot: 0.356, costPerFoot: 29.75 },
  '2/0': { gauge: '2/0', ampacity: 175, resistance: 0.0967, diameterInches: 0.365, weightPerFoot: 0.449, costPerFoot: 37.50 },
  '3/0': { gauge: '3/0', ampacity: 200, resistance: 0.0766, diameterInches: 0.410, weightPerFoot: 0.566, costPerFoot: 47.25 },
  '4/0': { gauge: '4/0', ampacity: 230, resistance: 0.0608, diameterInches: 0.460, weightPerFoot: 0.713, costPerFoot: 59.50 }
};

// Standard breaker sizes
export const STANDARD_BREAKER_SIZES = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400];

// Conduit specifications
export const CONDUIT_SPECIFICATIONS: Record<string, ConduitSpecification> = {
  '1/2': { 
    size: '1/2"', 
    diameter: 0.622, 
    fillArea: 0.122, 
    maxWires: { '14': 9, '12': 7, '10': 5, '8': 2 },
    costPerFoot: 2.85 
  },
  '3/4': { 
    size: '3/4"', 
    diameter: 0.824, 
    fillArea: 0.213, 
    maxWires: { '14': 16, '12': 13, '10': 9, '8': 5, '6': 3 },
    costPerFoot: 3.95 
  },
  '1': { 
    size: '1"', 
    diameter: 1.049, 
    fillArea: 0.346, 
    maxWires: { '14': 26, '12': 22, '10': 16, '8': 8, '6': 6, '4': 4 },
    costPerFoot: 5.25 
  },
  '1-1/4': { 
    size: '1-1/4"', 
    diameter: 1.380, 
    fillArea: 0.598, 
    maxWires: { '14': 44, '12': 35, '10': 26, '8': 14, '6': 10, '4': 7, '2': 4 },
    costPerFoot: 7.50 
  },
  '1-1/2': { 
    size: '1-1/2"', 
    diameter: 1.610, 
    fillArea: 0.814, 
    maxWires: { '12': 49, '10': 35, '8': 19, '6': 14, '4': 10, '2': 6, '1': 4 },
    costPerFoot: 9.75 
  },
  '2': { 
    size: '2"', 
    diameter: 2.067, 
    fillArea: 1.342, 
    maxWires: { '10': 58, '8': 32, '6': 23, '4': 16, '2': 10, '1': 7, '1/0': 6 },
    costPerFoot: 13.25 
  }
};

/**
 * Calculate electrical load per NEC Article 220
 */
export class ElectricalLoadCalculator {
  static calculateConnectedLoad(fixtures: ElectricalFixture[]): number {
    return fixtures.reduce((total, fixture) => {
      return total + (fixture.wattage * fixture.quantity);
    }, 0);
  }

  static calculateDemandLoad(connectedLoad: number, loadType: 'general' | 'lighting' | 'motor' = 'lighting'): number {
    switch (loadType) {
      case 'lighting':
        // NEC 220.12 - General lighting demand factors
        if (connectedLoad <= 3000) {
          return connectedLoad;
        } else if (connectedLoad <= 120000) {
          return 3000 + (connectedLoad - 3000) * 0.35;
        } else {
          return 3000 + 117000 * 0.35 + (connectedLoad - 120000) * 0.25;
        }
      case 'motor':
        // Motors typically 100% demand
        return connectedLoad;
      default:
        return connectedLoad;
    }
  }

  static calculateContinuousLoad(fixtures: ElectricalFixture[]): number {
    return fixtures.reduce((total, fixture) => {
      if (fixture.continuous) {
        return total + (fixture.wattage * fixture.quantity * 1.25); // 125% for continuous
      }
      return total + (fixture.wattage * fixture.quantity);
    }, 0);
  }
}

/**
 * Circuit design and optimization
 */
export class CircuitDesigner {
  static designCircuit(
    fixtures: ElectricalFixture[],
    voltage: number,
    maxDistance: number,
    allowableVoltageDrop: number = 0.03
  ): CircuitDesign {
    const totalLoad = fixtures.reduce((sum, f) => sum + (f.wattage * f.quantity), 0);
    const current = totalLoad / voltage;
    const continuousCurrent = current * 1.25; // Assume continuous load

    // Select breaker size
    const breakerSize = this.selectBreaker(continuousCurrent);
    
    // Select wire size considering both ampacity and voltage drop
    const wireGauge = this.selectWire(continuousCurrent, voltage, maxDistance, allowableVoltageDrop);
    
    // Select conduit size
    const conduitSize = this.selectConduit(wireGauge, 3); // Assume 3 conductors
    
    // Calculate actual voltage drop
    const voltageDrop = this.calculateVoltageDrop(current, maxDistance, wireGauge, voltage);

    return {
      id: `circuit-${Date.now()}`,
      voltage,
      phases: voltage > 200 ? 3 : 1,
      breakerSize,
      wireGauge,
      conduitSize,
      maxLength: maxDistance,
      fixtures: fixtures.map(f => f.id),
      loadWatts: totalLoad,
      loadAmps: current,
      utilizationPercent: (current / breakerSize) * 100,
      voltageDrop
    };
  }

  static selectBreaker(current: number): number {
    for (const size of STANDARD_BREAKER_SIZES) {
      if (size >= current) {
        return size;
      }
    }
    return STANDARD_BREAKER_SIZES[STANDARD_BREAKER_SIZES.length - 1];
  }

  static selectWire(
    current: number, 
    voltage: number, 
    distance: number, 
    allowableVoltageDrop: number
  ): string {
    for (const [gauge, spec] of Object.entries(WIRE_SPECIFICATIONS)) {
      // Check ampacity
      if (spec.ampacity >= current) {
        // Check voltage drop
        const vd = this.calculateVoltageDrop(current, distance, gauge, voltage);
        if (vd <= voltage * allowableVoltageDrop) {
          return gauge;
        }
      }
    }
    return '4/0'; // Largest available
  }

  static selectConduit(wireGauge: string, conductorCount: number): string {
    for (const [size, spec] of Object.entries(CONDUIT_SPECIFICATIONS)) {
      if (spec.maxWires[wireGauge] && spec.maxWires[wireGauge] >= conductorCount) {
        return size;
      }
    }
    return '2'; // Largest common size
  }

  static calculateVoltageDrop(
    current: number, 
    distance: number, 
    wireGauge: string, 
    voltage: number
  ): number {
    const wireSpec = WIRE_SPECIFICATIONS[wireGauge];
    if (!wireSpec) return 999; // Invalid wire size

    // Voltage drop formula: VD = 2 × L × R × I / 1000
    const voltageDrop = (2 * distance * wireSpec.resistance * current) / 1000;
    return voltageDrop;
  }

  static optimizeCircuitGrouping(
    fixtures: ElectricalFixture[],
    voltage: number,
    maxCircuitLoad: number = 0.8 // 80% loading factor
  ): CircuitDesign[] {
    const circuits: CircuitDesign[] = [];
    const sortedFixtures = [...fixtures].sort((a, b) => {
      // Sort by location for efficient wire runs
      const distA = Math.sqrt(a.location.x ** 2 + a.location.y ** 2);
      const distB = Math.sqrt(b.location.x ** 2 + b.location.y ** 2);
      return distA - distB;
    });

    let currentCircuitFixtures: ElectricalFixture[] = [];
    let currentLoad = 0;

    for (const fixture of sortedFixtures) {
      const fixtureLoad = fixture.wattage * fixture.quantity;
      const maxLoadPerCircuit = voltage * 20 * maxCircuitLoad; // Assume 20A circuits

      if (currentLoad + fixtureLoad > maxLoadPerCircuit && currentCircuitFixtures.length > 0) {
        // Create circuit with current fixtures
        const maxDistance = this.calculateMaxDistance(currentCircuitFixtures);
        circuits.push(this.designCircuit(currentCircuitFixtures, voltage, maxDistance));
        
        // Start new circuit
        currentCircuitFixtures = [fixture];
        currentLoad = fixtureLoad;
      } else {
        currentCircuitFixtures.push(fixture);
        currentLoad += fixtureLoad;
      }
    }

    // Add final circuit
    if (currentCircuitFixtures.length > 0) {
      const maxDistance = this.calculateMaxDistance(currentCircuitFixtures);
      circuits.push(this.designCircuit(currentCircuitFixtures, voltage, maxDistance));
    }

    return circuits;
  }

  private static calculateMaxDistance(fixtures: ElectricalFixture[]): number {
    if (fixtures.length === 0) return 100; // Default

    const maxX = Math.max(...fixtures.map(f => f.location.x));
    const maxY = Math.max(...fixtures.map(f => f.location.y));
    return Math.sqrt(maxX ** 2 + maxY ** 2) + 50; // Add 50ft for panel distance
  }
}

/**
 * Panel design and load balancing
 */
export class PanelDesigner {
  static designPanel(
    circuits: CircuitDesign[],
    panelName: string = 'LP-1',
    phases: number = 3
  ): PanelDesign {
    const totalLoad = circuits.reduce((sum, c) => sum + c.loadWatts, 0);
    const demandLoad = ElectricalLoadCalculator.calculateDemandLoad(totalLoad);
    
    // Size main breaker
    const mainBreaker = this.selectMainBreaker(demandLoad, phases === 3 ? 208 : 240);
    
    // Calculate spaces needed
    const spacesNeeded = circuits.reduce((sum, c) => sum + c.phases, 0);
    const totalSpaces = Math.max(42, Math.ceil(spacesNeeded * 1.2)); // 20% spare capacity

    // Balance phases for 3-phase panels
    const phaseBalance = phases === 3 ? this.balancePhaseLoads(circuits) : {
      phaseA: totalLoad,
      phaseB: 0,
      phaseC: 0
    };

    return {
      id: `panel-${Date.now()}`,
      name: panelName,
      voltage: phases === 3 ? 208 : 240,
      phases,
      mainBreaker,
      busRating: mainBreaker,
      spaces: totalSpaces,
      circuits,
      totalLoad,
      demandLoad,
      phaseBalance
    };
  }

  static selectMainBreaker(demandLoad: number, voltage: number): number {
    const current = (demandLoad / voltage) * 1.25; // 125% safety factor
    
    const mainBreakerSizes = [100, 125, 150, 200, 225, 300, 400, 600, 800, 1000, 1200];
    for (const size of mainBreakerSizes) {
      if (size >= current) {
        return size;
      }
    }
    return 1200; // Maximum
  }

  static balancePhaseLoads(circuits: CircuitDesign[]): { phaseA: number; phaseB: number; phaseC: number } {
    const phaseLoads = { phaseA: 0, phaseB: 0, phaseC: 0 };
    const phases: (keyof typeof phaseLoads)[] = ['phaseA', 'phaseB', 'phaseC'];
    
    // Sort circuits by load (largest first) for better balancing
    const sortedCircuits = [...circuits].sort((a, b) => b.loadWatts - a.loadWatts);
    
    sortedCircuits.forEach(circuit => {
      // Find phase with lowest current load
      const minPhase = phases.reduce((min, phase) => 
        phaseLoads[phase] < phaseLoads[min] ? phase : min
      );
      
      phaseLoads[minPhase] += circuit.loadWatts;
    });

    return phaseLoads;
  }

  static validatePhaseBalance(phaseLoads: { phaseA: number; phaseB: number; phaseC: number }): {
    balanced: boolean;
    imbalance: number;
    warnings: string[];
  } {
    const loads = [phaseLoads.phaseA, phaseLoads.phaseB, phaseLoads.phaseC];
    const maxLoad = Math.max(...loads);
    const minLoad = Math.min(...loads);
    const imbalance = maxLoad > 0 ? ((maxLoad - minLoad) / maxLoad) * 100 : 0;
    
    const warnings: string[] = [];
    
    if (imbalance > 20) {
      warnings.push(`Phase imbalance of ${imbalance.toFixed(1)}% exceeds recommended 20% maximum`);
    }
    
    if (imbalance > 10) {
      warnings.push('Consider redistributing circuits for better phase balance');
    }

    return {
      balanced: imbalance <= 10,
      imbalance,
      warnings
    };
  }
}

/**
 * Cost estimation utilities
 */
export class CostEstimator {
  static estimateWireCost(circuits: CircuitDesign[]): number {
    return circuits.reduce((total, circuit) => {
      const wireSpec = WIRE_SPECIFICATIONS[circuit.wireGauge];
      if (!wireSpec) return total;
      
      // Assume 3 conductors + ground + neutral for each circuit
      const conductorsPerCircuit = circuit.phases === 3 ? 4 : 3;
      const wireCost = wireSpec.costPerFoot * circuit.maxLength * conductorsPerCircuit;
      
      return total + wireCost;
    }, 0);
  }

  static estimateConduitCost(circuits: CircuitDesign[]): number {
    return circuits.reduce((total, circuit) => {
      const conduitSpec = CONDUIT_SPECIFICATIONS[circuit.conduitSize];
      if (!conduitSpec) return total;
      
      return total + (conduitSpec.costPerFoot * circuit.maxLength);
    }, 0);
  }

  static estimateBreakerCost(circuits: CircuitDesign[]): number {
    const breakerPrices: Record<string, number> = {
      '15A_1P': 45, '20A_1P': 48, '30A_1P': 65, '40A_1P': 85, '50A_1P': 125,
      '15A_3P': 165, '20A_3P': 185, '30A_3P': 225, '40A_3P': 285, '50A_3P': 365
    };

    return circuits.reduce((total, circuit) => {
      const phaseType = circuit.phases === 3 ? '3P' : '1P';
      const breakerKey = `${circuit.breakerSize}A_${phaseType}`;
      const price = breakerPrices[breakerKey] || 200; // Default price
      
      return total + price;
    }, 0);
  }

  static estimateLaborHours(circuits: CircuitDesign[], totalFixtures: number): {
    installation: number;
    wiring: number;
    termination: number;
    testing: number;
    total: number;
  } {
    const installation = totalFixtures * 0.75; // 45 minutes per fixture
    const wiring = circuits.reduce((sum, c) => sum + (c.maxLength * 0.1), 0); // 6 minutes per foot
    const termination = circuits.length * 1.5; // 1.5 hours per circuit
    const testing = circuits.length * 0.5; // 30 minutes per circuit
    
    return {
      installation,
      wiring,
      termination,
      testing,
      total: installation + wiring + termination + testing
    };
  }
}

/**
 * Code compliance checking
 */
export class ComplianceChecker {
  static checkNECCompliance(panel: PanelDesign): {
    compliant: boolean;
    violations: string[];
    warnings: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check circuit loading (NEC 210.19(A))
    panel.circuits.forEach(circuit => {
      if (circuit.utilizationPercent > 80) {
        violations.push(`Circuit ${circuit.id}: Loaded to ${circuit.utilizationPercent.toFixed(1)}% (max 80%)`);
      }
      if (circuit.utilizationPercent > 70) {
        warnings.push(`Circuit ${circuit.id}: Consider larger breaker for ${circuit.utilizationPercent.toFixed(1)}% loading`);
      }
    });

    // Check voltage drop (NEC 210.19(A)(1))
    panel.circuits.forEach(circuit => {
      const voltageDropPercent = (circuit.voltageDrop / circuit.voltage) * 100;
      if (voltageDropPercent > 5) {
        violations.push(`Circuit ${circuit.id}: Voltage drop ${voltageDropPercent.toFixed(1)}% exceeds 5% maximum`);
      }
      if (voltageDropPercent > 3) {
        warnings.push(`Circuit ${circuit.id}: Voltage drop ${voltageDropPercent.toFixed(1)}% exceeds recommended 3%`);
      }
    });

    // Check panel loading
    const panelUtilization = (panel.demandLoad / (panel.mainBreaker * panel.voltage)) * 100;
    if (panelUtilization > 80) {
      violations.push(`Panel loading ${panelUtilization.toFixed(1)}% exceeds 80% maximum`);
    }

    // Check phase balance for 3-phase systems
    if (panel.phases === 3) {
      const balanceCheck = PanelDesigner.validatePhaseBalance(panel.phaseBalance);
      if (!balanceCheck.balanced) {
        warnings.push(...balanceCheck.warnings);
      }
    }

    // Check spare capacity (NEC 210.11(C))
    const usedSpaces = panel.circuits.reduce((sum, c) => sum + c.phases, 0);
    const sparePercent = ((panel.spaces - usedSpaces) / panel.spaces) * 100;
    if (sparePercent < 20) {
      warnings.push(`Panel has only ${sparePercent.toFixed(1)}% spare capacity (recommend 20% minimum)`);
    }

    // General recommendations
    if (panel.totalLoad > 50000) {
      recommendations.push('Consider load management system for high-wattage installations');
    }
    
    if (panel.circuits.length > 30) {
      recommendations.push('Consider multiple panels to reduce circuit count per panel');
    }

    return {
      compliant: violations.length === 0,
      violations,
      warnings,
      recommendations
    };
  }
}