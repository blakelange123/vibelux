export interface Circuit {
  id: string;
  name: string;
  voltage: number; // 120, 208, 240, 277, 480
  phase: 'single' | 'three';
  amperage: number; // Circuit breaker size
  poles: number; // 1, 2, or 3
  fixtures: string[]; // Fixture IDs
  currentLoad: number; // Watts
  maxLoad: number; // Watts (80% of breaker rating)
}

export interface Panel {
  id: string;
  name: string;
  voltage: number;
  phase: 'single' | 'three';
  mainBreaker: number; // Amps
  spaces: number; // Total spaces available
  circuits: Circuit[];
}

export interface WireSpec {
  gauge: string; // AWG
  type: 'THHN' | 'THWN' | 'XHHW' | 'MC';
  ampacity: number;
  voltage: number;
  temperature: number; // Rating in Celsius
}

export interface ElectricalLoad {
  connected: number; // Total connected watts
  demand: number; // After demand factors
  continuous: number; // Continuous loads (125%)
  largest: number; // Largest motor load
  total: number; // Total calculated load
}

export class CircuitPlanner {
  // NEC wire ampacity table (simplified)
  private static WIRE_AMPACITY: Record<string, number> = {
    '14': 15,
    '12': 20,
    '10': 30,
    '8': 40,
    '6': 55,
    '4': 70,
    '3': 85,
    '2': 95,
    '1': 110,
    '1/0': 125,
    '2/0': 145,
    '3/0': 165,
    '4/0': 195,
    '250': 215,
    '300': 240,
    '350': 260,
    '400': 280,
    '500': 320,
    '600': 350,
    '750': 400
  };

  // Standard circuit breaker sizes
  private static BREAKER_SIZES = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400];

  static calculateLoad(fixtures: any[]): ElectricalLoad {
    let connected = 0;
    let continuous = 0;
    let largest = 0;

    fixtures.forEach(fixture => {
      if (fixture.enabled) {
        const watts = fixture.model.wattage || 0;
        const dimmingFactor = (fixture.dimmingLevel || 100) / 100;
        const load = watts * dimmingFactor;
        
        connected += load;
        // Lighting is considered continuous load
        continuous += load;
        largest = Math.max(largest, load);
      }
    });

    // Apply NEC demand factors for lighting
    let demand = connected;
    if (connected > 3000) {
      // First 3000W at 100%
      demand = 3000;
      // Next 117,000W at 35%
      const next = Math.min(connected - 3000, 117000);
      demand += next * 0.35;
      // Remainder at 25%
      if (connected > 120000) {
        demand += (connected - 120000) * 0.25;
      }
    }

    // Continuous loads at 125%
    const continuousAdjusted = continuous * 1.25;

    return {
      connected,
      demand,
      continuous: continuousAdjusted,
      largest,
      total: Math.max(demand, continuousAdjusted)
    };
  }

  static autoAssignCircuits(
    fixtures: any[],
    voltage: number = 277,
    maxCircuits: number = 42
  ): Circuit[] {
    const circuits: Circuit[] = [];
    const sortedFixtures = [...fixtures]
      .filter(f => f.enabled)
      .sort((a, b) => {
        // Group by location
        const distA = Math.sqrt(a.x * a.x + a.y * a.y);
        const distB = Math.sqrt(b.x * b.x + b.y * b.y);
        return distA - distB;
      });

    let currentCircuit: Circuit | null = null;
    let circuitIndex = 1;

    sortedFixtures.forEach(fixture => {
      const fixtureLoad = fixture.model.wattage || 0;
      const breakerSize = this.selectBreakerSize(fixtureLoad, voltage);
      const maxLoad = breakerSize * voltage * 0.8; // 80% rule

      if (!currentCircuit || currentCircuit.currentLoad + fixtureLoad > maxLoad) {
        // Create new circuit
        currentCircuit = {
          id: `circuit-${circuitIndex}`,
          name: `Circuit ${circuitIndex}`,
          voltage,
          phase: voltage >= 208 ? 'three' : 'single',
          amperage: breakerSize,
          poles: voltage === 120 ? 1 : voltage === 240 ? 2 : 1,
          fixtures: [],
          currentLoad: 0,
          maxLoad
        };
        circuits.push(currentCircuit);
        circuitIndex++;
      }

      currentCircuit.fixtures.push(fixture.id);
      currentCircuit.currentLoad += fixtureLoad;
    });

    return circuits;
  }

  static selectBreakerSize(load: number, voltage: number): number {
    const requiredAmps = (load / voltage) * 1.25; // 125% for continuous loads
    
    for (const size of this.BREAKER_SIZES) {
      if (size >= requiredAmps) {
        return size;
      }
    }
    
    return this.BREAKER_SIZES[this.BREAKER_SIZES.length - 1];
  }

  static selectWireSize(amps: number, voltage: number, distance: number): string {
    // Include voltage drop calculation
    const maxVoltageDrop = voltage * 0.03; // 3% voltage drop
    
    for (const [gauge, ampacity] of Object.entries(this.WIRE_AMPACITY)) {
      if (ampacity >= amps) {
        // Check voltage drop
        const vd = this.calculateVoltageDrop(amps, distance, gauge, voltage);
        if (vd <= maxVoltageDrop) {
          return gauge;
        }
      }
    }
    
    return '750'; // Maximum size
  }

  static calculateVoltageDrop(
    amps: number,
    distance: number, // feet
    wireGauge: string,
    voltage: number
  ): number {
    // Simplified voltage drop calculation
    // VD = 2 × L × R × I / 1000
    const resistance = this.getWireResistance(wireGauge); // ohms per 1000 ft
    const vd = (2 * distance * resistance * amps) / 1000;
    return vd;
  }

  private static getWireResistance(gauge: string): number {
    // Copper wire resistance at 75°C (ohms per 1000 ft)
    const resistances: Record<string, number> = {
      '14': 3.14,
      '12': 1.98,
      '10': 1.24,
      '8': 0.778,
      '6': 0.491,
      '4': 0.308,
      '3': 0.245,
      '2': 0.194,
      '1': 0.154,
      '1/0': 0.122,
      '2/0': 0.0967,
      '3/0': 0.0766,
      '4/0': 0.0608
    };
    
    return resistances[gauge] || 0.05;
  }

  static generatePanel(
    circuits: Circuit[],
    panelName: string = 'LP-1'
  ): Panel {
    const totalLoad = circuits.reduce((sum, c) => sum + c.currentLoad, 0);
    const maxVoltage = Math.max(...circuits.map(c => c.voltage));
    const isThreePhase = circuits.some(c => c.phase === 'three');
    
    // Size main breaker
    const mainAmps = this.selectBreakerSize(totalLoad, maxVoltage);
    const spaces = Math.max(42, circuits.length * 1.5); // Allow for growth

    return {
      id: `panel-${Date.now()}`,
      name: panelName,
      voltage: maxVoltage,
      phase: isThreePhase ? 'three' : 'single',
      mainBreaker: mainAmps,
      spaces: Math.ceil(spaces / 6) * 6, // Round to nearest 6
      circuits
    };
  }

  static balancePhases(panel: Panel): void {
    if (panel.phase !== 'three') return;

    // Sort circuits by load (descending)
    const sortedCircuits = [...panel.circuits].sort((a, b) => b.currentLoad - a.currentLoad);
    
    const phaseLoads = { A: 0, B: 0, C: 0 };
    const phaseAssignments: Record<string, 'A' | 'B' | 'C'> = {};

    // Assign circuits to phases to balance load
    sortedCircuits.forEach(circuit => {
      // Find phase with lowest load
      const minPhase = Object.entries(phaseLoads)
        .sort(([, a], [, b]) => a - b)[0][0] as 'A' | 'B' | 'C';
      
      phaseAssignments[circuit.id] = minPhase;
      phaseLoads[minPhase] += circuit.currentLoad;
    });

    // Update circuit names with phase
    panel.circuits.forEach(circuit => {
      const phase = phaseAssignments[circuit.id];
      if (phase) {
        circuit.name = `${circuit.name} (${phase})`;
      }
    });
  }

  static generateSchedule(panel: Panel): string {
    let schedule = `PANEL SCHEDULE: ${panel.name}\n`;
    schedule += `Voltage: ${panel.voltage}V ${panel.phase === 'three' ? '3Ø' : '1Ø'}\n`;
    schedule += `Main Breaker: ${panel.mainBreaker}A\n`;
    schedule += `Total Spaces: ${panel.spaces}\n\n`;
    
    schedule += 'Circuit | Breaker | Load (W) | Wire Size | Description\n';
    schedule += '--------|---------|----------|-----------|-------------\n';
    
    panel.circuits.forEach(circuit => {
      const wireSize = this.selectWireSize(circuit.amperage, circuit.voltage, 100);
      const loadPercent = ((circuit.currentLoad / circuit.maxLoad) * 100).toFixed(0);
      
      schedule += `${circuit.name.padEnd(7)} | ${circuit.amperage}A`.padEnd(7) + ` | `;
      schedule += `${circuit.currentLoad}W`.padEnd(8) + ` | `;
      schedule += `#${wireSize}`.padEnd(9) + ` | `;
      schedule += `${circuit.fixtures.length} fixtures (${loadPercent}% loaded)\n`;
    });
    
    const totalConnected = panel.circuits.reduce((sum, c) => sum + c.currentLoad, 0);
    const totalBreakers = panel.circuits.reduce((sum, c) => sum + c.poles, 0);
    
    schedule += '\n';
    schedule += `Total Connected Load: ${totalConnected}W (${(totalConnected / 1000).toFixed(1)}kW)\n`;
    schedule += `Total Breaker Spaces Used: ${totalBreakers}\n`;
    schedule += `Spaces Remaining: ${panel.spaces - totalBreakers}\n`;
    
    return schedule;
  }
}