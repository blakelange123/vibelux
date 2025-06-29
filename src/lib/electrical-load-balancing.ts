export interface Circuit {
  id: string;
  name: string;
  capacity: number; // Amperes
  voltage: number; // Volts
  phase: 'A' | 'B' | 'C';
  currentLoad: number; // Watts
  connectedFixtures: string[];
}

export interface ElectricalPanel {
  id: string;
  name: string;
  totalCapacity: number; // Amperes
  voltage: number; // Volts (208V for 3-phase, 240V for single phase)
  phases: number; // 1 or 3
  circuits: Circuit[];
}

export interface LoadBalancingResult {
  panels: ElectricalPanel[];
  totalLoad: number;
  loadDistribution: {
    phaseA: number;
    phaseB: number;
    phaseC: number;
  };
  efficiency: number;
  recommendations: string[];
  warnings: string[];
}

export interface FixtureElectrical {
  id: string;
  wattage: number;
  voltage: number;
  current: number;
  powerFactor: number;
  inrushCurrent?: number;
}

export class ElectricalLoadBalancer {
  private readonly SAFETY_FACTOR = 0.8; // 80% max load per NEC
  private readonly PHASE_IMBALANCE_THRESHOLD = 0.1; // 10% max imbalance
  
  /**
   * Automatically balance fixtures across circuits and phases
   */
  balanceLoad(
    fixtures: FixtureElectrical[],
    panels: ElectricalPanel[]
  ): LoadBalancingResult {
    // Reset current loads
    panels.forEach(panel => {
      panel.circuits.forEach(circuit => {
        circuit.currentLoad = 0;
        circuit.connectedFixtures = [];
      });
    });

    // Sort fixtures by wattage (largest first) for better distribution
    const sortedFixtures = [...fixtures].sort((a, b) => b.wattage - a.wattage);

    // Assign fixtures to circuits
    for (const fixture of sortedFixtures) {
      const bestCircuit = this.findBestCircuit(fixture, panels);
      if (bestCircuit) {
        bestCircuit.currentLoad += fixture.wattage;
        bestCircuit.connectedFixtures.push(fixture.id);
      }
    }

    // Calculate results
    const loadDistribution = this.calculatePhaseLoads(panels);
    const totalLoad = this.calculateTotalLoad(panels);
    const efficiency = this.calculateEfficiency(panels);
    const recommendations = this.generateRecommendations(panels, fixtures);
    const warnings = this.checkForWarnings(panels, loadDistribution);

    return {
      panels,
      totalLoad,
      loadDistribution,
      efficiency,
      recommendations,
      warnings
    };
  }

  /**
   * Find the best circuit for a fixture considering load balancing
   */
  private findBestCircuit(
    fixture: FixtureElectrical,
    panels: ElectricalPanel[]
  ): Circuit | null {
    let bestCircuit: Circuit | null = null;
    let bestScore = -Infinity;

    for (const panel of panels) {
      for (const circuit of panel.circuits) {
        // Check if circuit can handle the load
        const circuitCapacityWatts = circuit.capacity * circuit.voltage * this.SAFETY_FACTOR;
        const availableCapacity = circuitCapacityWatts - circuit.currentLoad;
        
        if (availableCapacity < fixture.wattage) {
          continue; // Circuit can't handle this fixture
        }

        // Calculate score based on:
        // 1. How well it balances phases
        // 2. How much capacity remains
        // 3. Prefer circuits with similar loads
        const score = this.calculateCircuitScore(circuit, fixture, panel, panels);
        
        if (score > bestScore) {
          bestScore = score;
          bestCircuit = circuit;
        }
      }
    }

    return bestCircuit;
  }

  /**
   * Calculate a score for placing a fixture on a specific circuit
   */
  private calculateCircuitScore(
    circuit: Circuit,
    fixture: FixtureElectrical,
    panel: ElectricalPanel,
    allPanels: ElectricalPanel[]
  ): number {
    // Get current phase loads
    const phaseLoads = this.calculatePhaseLoads(allPanels);
    
    // Simulate adding this fixture
    const simulatedLoad = { ...phaseLoads };
    if (circuit.phase === 'A') simulatedLoad.phaseA += fixture.wattage;
    else if (circuit.phase === 'B') simulatedLoad.phaseB += fixture.wattage;
    else if (circuit.phase === 'C') simulatedLoad.phaseC += fixture.wattage;
    
    // Calculate imbalance score (lower is better)
    const avgLoad = (simulatedLoad.phaseA + simulatedLoad.phaseB + simulatedLoad.phaseC) / 3;
    const imbalance = Math.max(
      Math.abs(simulatedLoad.phaseA - avgLoad),
      Math.abs(simulatedLoad.phaseB - avgLoad),
      Math.abs(simulatedLoad.phaseC - avgLoad)
    ) / avgLoad;
    
    // Calculate capacity utilization (prefer ~60-70% utilization)
    const circuitCapacityWatts = circuit.capacity * circuit.voltage;
    const utilization = (circuit.currentLoad + fixture.wattage) / circuitCapacityWatts;
    const utilizationScore = 1 - Math.abs(utilization - 0.65);
    
    // Combine scores
    return utilizationScore * 100 - imbalance * 50;
  }

  /**
   * Calculate load on each phase
   */
  private calculatePhaseLoads(panels: ElectricalPanel[]): {
    phaseA: number;
    phaseB: number;
    phaseC: number;
  } {
    const loads = { phaseA: 0, phaseB: 0, phaseC: 0 };
    
    for (const panel of panels) {
      for (const circuit of panel.circuits) {
        if (circuit.phase === 'A') loads.phaseA += circuit.currentLoad;
        else if (circuit.phase === 'B') loads.phaseB += circuit.currentLoad;
        else if (circuit.phase === 'C') loads.phaseC += circuit.currentLoad;
      }
    }
    
    return loads;
  }

  /**
   * Calculate total load across all panels
   */
  private calculateTotalLoad(panels: ElectricalPanel[]): number {
    return panels.reduce((total, panel) => 
      total + panel.circuits.reduce((sum, circuit) => sum + circuit.currentLoad, 0), 0
    );
  }

  /**
   * Calculate overall system efficiency
   */
  private calculateEfficiency(panels: ElectricalPanel[]): number {
    let totalCapacity = 0;
    let totalLoad = 0;
    
    for (const panel of panels) {
      for (const circuit of panel.circuits) {
        totalCapacity += circuit.capacity * circuit.voltage;
        totalLoad += circuit.currentLoad;
      }
    }
    
    return totalCapacity > 0 ? (totalLoad / (totalCapacity * this.SAFETY_FACTOR)) * 100 : 0;
  }

  /**
   * Generate recommendations for improving the electrical system
   */
  private generateRecommendations(
    panels: ElectricalPanel[],
    fixtures: FixtureElectrical[]
  ): string[] {
    const recommendations: string[] = [];
    const phaseLoads = this.calculatePhaseLoads(panels);
    
    // Check phase imbalance
    const avgLoad = (phaseLoads.phaseA + phaseLoads.phaseB + phaseLoads.phaseC) / 3;
    const maxImbalance = Math.max(
      Math.abs(phaseLoads.phaseA - avgLoad),
      Math.abs(phaseLoads.phaseB - avgLoad),
      Math.abs(phaseLoads.phaseC - avgLoad)
    ) / avgLoad;
    
    if (maxImbalance > this.PHASE_IMBALANCE_THRESHOLD) {
      recommendations.push(
        `Phase imbalance detected (${(maxImbalance * 100).toFixed(1)}%). Consider redistributing loads.`
      );
    }
    
    // Check for overutilized circuits
    for (const panel of panels) {
      for (const circuit of panel.circuits) {
        const utilization = circuit.currentLoad / (circuit.capacity * circuit.voltage);
        if (utilization > 0.9) {
          recommendations.push(
            `Circuit ${circuit.name} is over 90% utilized. Consider adding circuits or redistributing loads.`
          );
        }
      }
    }
    
    // Check if fixtures couldn't be assigned
    const assignedFixtureIds = new Set(
      panels.flatMap(p => p.circuits.flatMap(c => c.connectedFixtures))
    );
    const unassignedFixtures = fixtures.filter(f => !assignedFixtureIds.has(f.id));
    
    if (unassignedFixtures.length > 0) {
      const additionalCapacityNeeded = unassignedFixtures.reduce((sum, f) => sum + f.wattage, 0);
      recommendations.push(
        `${unassignedFixtures.length} fixtures couldn't be assigned. Need ${(additionalCapacityNeeded / 1000).toFixed(1)}kW additional capacity.`
      );
    }
    
    // Suggest optimal panel configuration
    const totalFixtureLoad = fixtures.reduce((sum, f) => sum + f.wattage, 0);
    const requiredCapacity = totalFixtureLoad / this.SAFETY_FACTOR;
    const currentCapacity = panels.reduce((sum, p) => 
      sum + p.circuits.reduce((s, c) => s + c.capacity * c.voltage, 0), 0
    );
    
    if (requiredCapacity > currentCapacity) {
      const additionalCapacity = requiredCapacity - currentCapacity;
      const suggestedCircuits = Math.ceil(additionalCapacity / (30 * 208)); // 30A @ 208V circuits
      recommendations.push(
        `Add ${suggestedCircuits} more 30A circuits to handle all fixtures safely.`
      );
    }
    
    return recommendations;
  }

  /**
   * Check for warnings in the current configuration
   */
  private checkForWarnings(
    panels: ElectricalPanel[],
    loadDistribution: { phaseA: number; phaseB: number; phaseC: number }
  ): string[] {
    const warnings: string[] = [];
    
    // Check for overloaded circuits
    for (const panel of panels) {
      for (const circuit of panel.circuits) {
        const maxLoad = circuit.capacity * circuit.voltage * this.SAFETY_FACTOR;
        if (circuit.currentLoad > maxLoad) {
          warnings.push(
            `⚠️ Circuit ${circuit.name} is overloaded! ${circuit.currentLoad}W > ${maxLoad}W max`
          );
        }
      }
    }
    
    // Check phase imbalance
    const avgLoad = (loadDistribution.phaseA + loadDistribution.phaseB + loadDistribution.phaseC) / 3;
    if (avgLoad > 0) {
      const imbalanceA = Math.abs(loadDistribution.phaseA - avgLoad) / avgLoad;
      const imbalanceB = Math.abs(loadDistribution.phaseB - avgLoad) / avgLoad;
      const imbalanceC = Math.abs(loadDistribution.phaseC - avgLoad) / avgLoad;
      
      if (imbalanceA > 0.15 || imbalanceB > 0.15 || imbalanceC > 0.15) {
        warnings.push(
          `⚠️ Severe phase imbalance detected. This can cause voltage irregularities and equipment damage.`
        );
      }
    }
    
    // Check for circuits near capacity
    for (const panel of panels) {
      for (const circuit of panel.circuits) {
        const utilization = circuit.currentLoad / (circuit.capacity * circuit.voltage);
        if (utilization > 0.95 && utilization <= 1.0) {
          warnings.push(
            `⚠️ Circuit ${circuit.name} is at ${(utilization * 100).toFixed(0)}% capacity. No safety margin!`
          );
        }
      }
    }
    
    return warnings;
  }

  /**
   * Create a default electrical panel configuration
   */
  createDefaultPanel(
    name: string,
    capacity: number,
    voltage: number,
    phases: number
  ): ElectricalPanel {
    const circuits: Circuit[] = [];
    const circuitsPerPhase = 6; // Default 6 circuits per phase
    
    if (phases === 3) {
      ['A', 'B', 'C'].forEach((phase, phaseIndex) => {
        for (let i = 0; i < circuitsPerPhase; i++) {
          circuits.push({
            id: `circuit-${phaseIndex * circuitsPerPhase + i + 1}`,
            name: `Circuit ${phaseIndex * circuitsPerPhase + i + 1} (${phase})`,
            capacity: 30, // 30A default
            voltage: voltage,
            phase: phase as 'A' | 'B' | 'C',
            currentLoad: 0,
            connectedFixtures: []
          });
        }
      });
    } else {
      // Single phase
      for (let i = 0; i < 12; i++) {
        circuits.push({
          id: `circuit-${i + 1}`,
          name: `Circuit ${i + 1}`,
          capacity: 20, // 20A default for single phase
          voltage: voltage,
          phase: 'A',
          currentLoad: 0,
          connectedFixtures: []
        });
      }
    }
    
    return {
      id: `panel-${Date.now()}`,
      name,
      totalCapacity: capacity,
      voltage,
      phases,
      circuits
    };
  }

  /**
   * Calculate voltage drop for a circuit
   */
  calculateVoltageDrop(
    circuit: Circuit,
    wireLength: number,
    wireGauge: number
  ): number {
    // Copper wire resistance per 1000 feet at 75°C
    const resistanceTable: { [key: number]: number } = {
      14: 3.14,
      12: 1.98,
      10: 1.24,
      8: 0.786,
      6: 0.491,
      4: 0.308,
      2: 0.194,
      1: 0.154
    };
    
    const resistance = (resistanceTable[wireGauge] || 1.98) * (wireLength / 1000) * 2; // Round trip
    const current = circuit.currentLoad / circuit.voltage;
    const voltageDrop = current * resistance;
    const percentDrop = (voltageDrop / circuit.voltage) * 100;
    
    return percentDrop;
  }

  /**
   * Recommend wire gauge based on circuit load and distance
   */
  recommendWireGauge(
    circuit: Circuit,
    distance: number
  ): { gauge: number; reason: string } {
    const current = circuit.currentLoad / circuit.voltage;
    const maxVoltageDrop = 3; // 3% max voltage drop
    
    // Wire ampacity at 75°C
    const ampacityTable = [
      { gauge: 14, ampacity: 20 },
      { gauge: 12, ampacity: 25 },
      { gauge: 10, ampacity: 35 },
      { gauge: 8, ampacity: 50 },
      { gauge: 6, ampacity: 65 },
      { gauge: 4, ampacity: 85 },
      { gauge: 2, ampacity: 115 },
      { gauge: 1, ampacity: 130 }
    ];
    
    // Find minimum gauge for ampacity
    let selectedGauge = 14;
    for (const wire of ampacityTable) {
      if (wire.ampacity >= current * 1.25) { // 125% for continuous loads
        selectedGauge = wire.gauge;
        break;
      }
    }
    
    // Check voltage drop and upsize if needed
    let voltageDrop = this.calculateVoltageDrop(circuit, distance, selectedGauge);
    while (voltageDrop > maxVoltageDrop && selectedGauge > 1) {
      const currentIndex = ampacityTable.findIndex(w => w.gauge === selectedGauge);
      if (currentIndex < ampacityTable.length - 1) {
        selectedGauge = ampacityTable[currentIndex + 1].gauge;
        voltageDrop = this.calculateVoltageDrop(circuit, distance, selectedGauge);
      } else {
        break;
      }
    }
    
    const reason = voltageDrop > maxVoltageDrop 
      ? `Upsized for voltage drop (${voltageDrop.toFixed(1)}% at ${distance}ft)`
      : `Based on ${current.toFixed(1)}A continuous load`;
    
    return { gauge: selectedGauge, reason };
  }
}

export const electricalLoadBalancer = new ElectricalLoadBalancer();