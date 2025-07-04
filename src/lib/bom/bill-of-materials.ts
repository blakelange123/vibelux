import { RoomObject, Fixture } from '@/components/designer/context/types';

export interface BOMItem {
  id: string;
  category: 'fixture' | 'mounting' | 'electrical' | 'control' | 'accessory';
  type: string;
  manufacturer?: string;
  model?: string;
  description: string;
  quantity: number;
  unit: 'ea' | 'ft' | 'box' | 'roll' | 'set';
  unitPrice?: number;
  totalPrice?: number;
  partNumber?: string;
  supplier?: string;
  leadTime?: string;
  notes?: string;
  location?: string[]; // Grid references where item is used
  installationTime?: number; // Hours per unit
}

export interface ElectricalRequirements {
  totalConnectedLoad: number; // Watts
  voltage: string;
  phase: '1-Phase' | '3-Phase';
  estimatedDailyUsage: number; // kWh
  recommendedCircuits: {
    circuitNumber: string;
    breaker: string; // e.g., "20A"
    voltage: string;
    fixtures: string[]; // Fixture IDs
    load: number; // Watts
  }[];
  panelSchedule: {
    panel: string;
    location: string;
    totalSlots: number;
    usedSlots: number;
    availableCapacity: number; // Amps
  }[];
}

export interface InstallationRequirements {
  laborHours: {
    electrical: number;
    mounting: number;
    controls: number;
    commissioning: number;
    total: number;
  };
  crewSize: {
    electricians: number;
    helpers: number;
    controls: number;
  };
  equipment: string[];
  safetyRequirements: string[];
  sequencing: {
    phase: number;
    description: string;
    duration: string;
    dependencies?: string[];
  }[];
}

export interface ProfessionalBOM {
  project: {
    name: string;
    number: string;
    client: string;
    location: string;
    date: Date;
    preparedBy: string;
    checkedBy?: string;
  };
  summary: {
    totalFixtures: number;
    totalWattage: number;
    totalCost: number;
    squareFootage: number;
    wattsPerSqFt: number;
    fixturesPerSqFt: number;
  };
  items: BOMItem[];
  electrical: ElectricalRequirements;
  installation: InstallationRequirements;
  alternates?: {
    description: string;
    items: BOMItem[];
    costDifference: number;
  }[];
  notes: string[];
}

export class BillOfMaterialsGenerator {
  static generate(
    room: any,
    objects: RoomObject[],
    projectInfo: Partial<ProfessionalBOM['project']>
  ): ProfessionalBOM {
    const fixtures = objects.filter(obj => obj.type === 'fixture') as Fixture[];
    const bomItems: BOMItem[] = [];
    
    // Group fixtures by model
    const fixtureGroups = new Map<string, { fixture: Fixture; locations: string[]; count: number }>();
    
    fixtures.forEach((fixture, index) => {
      const key = `${fixture.model?.manufacturer || 'Unknown'}-${fixture.model?.name || 'Unknown'}`;
      const gridRef = this.getGridReference(fixture.x, fixture.y, room.width, room.length);
      
      if (fixtureGroups.has(key)) {
        const group = fixtureGroups.get(key)!;
        group.count++;
        group.locations.push(gridRef);
      } else {
        fixtureGroups.set(key, {
          fixture,
          locations: [gridRef],
          count: 1
        });
      }
    });
    
    // Create BOM items for fixtures
    fixtureGroups.forEach((group, key) => {
      bomItems.push({
        id: `F-${bomItems.length + 1}`,
        category: 'fixture',
        type: 'LED Fixture',
        manufacturer: group.fixture.model?.manufacturer,
        model: group.fixture.model?.name,
        description: `${group.fixture.model?.manufacturer || 'Generic'} ${group.fixture.model?.name || 'LED Fixture'} - ${group.fixture.model?.wattage || 0}W`,
        quantity: group.count,
        unit: 'ea',
        unitPrice: group.fixture.model?.price || 0,
        totalPrice: (group.fixture.model?.price || 0) * group.count,
        partNumber: group.fixture.model?.partNumber,
        location: group.locations,
        installationTime: 0.5 // 30 minutes per fixture
      });
    });
    
    // Add mounting hardware
    const mountingKits = Math.ceil(fixtures.length * 1.1); // 10% extra
    bomItems.push({
      id: `M-1`,
      category: 'mounting',
      type: 'Mounting Kit',
      description: 'Universal fixture mounting kit with chains and hooks',
      quantity: mountingKits,
      unit: 'ea',
      unitPrice: 25,
      totalPrice: mountingKits * 25,
      installationTime: 0.25
    });
    
    // Add electrical components
    const totalWattage = fixtures.reduce((sum, f) => sum + (f.model?.wattage || 0), 0);
    const circuits = Math.ceil(totalWattage / (20 * 120 * 0.8)); // 20A circuits at 80% capacity
    
    // Wire calculation (rough estimate)
    const avgWireRun = Math.sqrt(room.width * room.length) * 2; // Average run length
    const totalWireFeet = fixtures.length * avgWireRun * 1.2; // 20% extra
    
    bomItems.push({
      id: `E-1`,
      category: 'electrical',
      type: 'Wire',
      description: '12 AWG THHN Stranded Wire (Black)',
      quantity: Math.ceil(totalWireFeet / 500),
      unit: 'roll',
      unitPrice: 150,
      totalPrice: Math.ceil(totalWireFeet / 500) * 150,
      notes: '500ft rolls'
    });
    
    bomItems.push({
      id: `E-2`,
      category: 'electrical',
      type: 'Wire',
      description: '12 AWG THHN Stranded Wire (White)',
      quantity: Math.ceil(totalWireFeet / 500),
      unit: 'roll',
      unitPrice: 150,
      totalPrice: Math.ceil(totalWireFeet / 500) * 150,
      notes: '500ft rolls'
    });
    
    bomItems.push({
      id: `E-3`,
      category: 'electrical',
      type: 'Wire',
      description: '12 AWG THHN Ground Wire (Green)',
      quantity: Math.ceil(totalWireFeet / 500),
      unit: 'roll',
      unitPrice: 140,
      totalPrice: Math.ceil(totalWireFeet / 500) * 140,
      notes: '500ft rolls'
    });
    
    // Circuit breakers
    bomItems.push({
      id: `E-4`,
      category: 'electrical',
      type: 'Circuit Breaker',
      description: '20A Single Pole Circuit Breaker',
      quantity: circuits,
      unit: 'ea',
      unitPrice: 45,
      totalPrice: circuits * 45
    });
    
    // Junction boxes
    const junctionBoxes = Math.ceil(fixtures.length / 4);
    bomItems.push({
      id: `E-5`,
      category: 'electrical',
      type: 'Junction Box',
      description: '4" Square Junction Box with Cover',
      quantity: junctionBoxes,
      unit: 'ea',
      unitPrice: 8,
      totalPrice: junctionBoxes * 8
    });
    
    // Conduit (if required)
    const conduitFeet = totalWireFeet * 0.3; // Assume 30% requires conduit
    bomItems.push({
      id: `E-6`,
      category: 'electrical',
      type: 'Conduit',
      description: '3/4" EMT Conduit',
      quantity: Math.ceil(conduitFeet / 10),
      unit: 'ea',
      unitPrice: 12,
      totalPrice: Math.ceil(conduitFeet / 10) * 12,
      notes: '10ft lengths'
    });
    
    // Wire nuts and connectors
    bomItems.push({
      id: `E-7`,
      category: 'electrical',
      type: 'Wire Connectors',
      description: 'Wire Nut Assortment (Red, Yellow, Orange)',
      quantity: 2,
      unit: 'box',
      unitPrice: 25,
      totalPrice: 50,
      notes: '500 piece assortment'
    });
    
    // Control system components
    if (fixtures.some(f => f.dimmingLevel !== undefined)) {
      bomItems.push({
        id: `C-1`,
        category: 'control',
        type: 'Dimming Control',
        description: '0-10V Dimming Control Panel',
        quantity: 1,
        unit: 'ea',
        unitPrice: 850,
        totalPrice: 850
      });
      
      bomItems.push({
        id: `C-2`,
        category: 'control',
        type: 'Control Wire',
        description: '18/2 Control Cable (Purple/Gray)',
        quantity: Math.ceil(totalWireFeet * 0.8 / 1000),
        unit: 'roll',
        unitPrice: 180,
        totalPrice: Math.ceil(totalWireFeet * 0.8 / 1000) * 180,
        notes: '1000ft rolls'
      });
    }
    
    // Calculate electrical requirements
    const electrical: ElectricalRequirements = {
      totalConnectedLoad: totalWattage,
      voltage: '120/277V',
      phase: totalWattage > 50000 ? '3-Phase' : '1-Phase',
      estimatedDailyUsage: (totalWattage / 1000) * 12, // 12 hours/day
      recommendedCircuits: this.calculateCircuits(fixtures, circuits),
      panelSchedule: [{
        panel: 'LP-1',
        location: 'Electrical Room',
        totalSlots: 42,
        usedSlots: circuits * 2, // Double for future expansion
        availableCapacity: 225 - (totalWattage / 277 * 1.25) // 25% safety factor
      }]
    };
    
    // Calculate installation requirements
    const installation: InstallationRequirements = {
      laborHours: {
        electrical: fixtures.length * 0.5 + circuits * 2, // Wiring and connections
        mounting: fixtures.length * 0.5, // Physical mounting
        controls: fixtures.some(f => f.dimmingLevel) ? 8 : 0, // Control setup
        commissioning: Math.ceil(fixtures.length / 10), // Testing and adjustment
        total: 0 // Calculated below
      },
      crewSize: {
        electricians: Math.min(4, Math.ceil(fixtures.length / 50)),
        helpers: Math.min(2, Math.ceil(fixtures.length / 100)),
        controls: fixtures.some(f => f.dimmingLevel) ? 1 : 0
      },
      equipment: [
        'Scissor lift or ladder (12-16ft working height)',
        'Wire pulling equipment',
        'Digital multimeter',
        'Circuit tracer',
        'Hand tools',
        'Safety equipment (hard hats, safety glasses, gloves)'
      ],
      safetyRequirements: [
        'Lock out/tag out procedures required',
        'Fall protection for work above 6ft',
        'Hot work permit if welding required',
        'Electrical safety training required',
        'Daily safety briefings'
      ],
      sequencing: [
        {
          phase: 1,
          description: 'Rough-in electrical infrastructure',
          duration: '2-3 days',
          dependencies: ['Building power available', 'Ceiling grid complete']
        },
        {
          phase: 2,
          description: 'Install mounting hardware and fixtures',
          duration: '3-4 days',
          dependencies: ['Electrical rough-in complete']
        },
        {
          phase: 3,
          description: 'Wire fixtures and make connections',
          duration: '2-3 days',
          dependencies: ['Fixtures mounted']
        },
        {
          phase: 4,
          description: 'Install and program controls',
          duration: '1 day',
          dependencies: ['Fixtures wired']
        },
        {
          phase: 5,
          description: 'Testing and commissioning',
          duration: '1 day',
          dependencies: ['All installation complete']
        }
      ]
    };
    
    installation.laborHours.total = 
      installation.laborHours.electrical +
      installation.laborHours.mounting +
      installation.laborHours.controls +
      installation.laborHours.commissioning;
    
    const totalCost = bomItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    
    return {
      project: {
        name: projectInfo.name || 'Untitled Project',
        number: projectInfo.number || `PRJ-${Date.now()}`,
        client: projectInfo.client || '',
        location: projectInfo.location || '',
        date: new Date(),
        preparedBy: projectInfo.preparedBy || 'VibeLux Designer',
        checkedBy: projectInfo.checkedBy
      },
      summary: {
        totalFixtures: fixtures.length,
        totalWattage,
        totalCost,
        squareFootage: room.width * room.length,
        wattsPerSqFt: totalWattage / (room.width * room.length),
        fixturesPerSqFt: fixtures.length / (room.width * room.length)
      },
      items: bomItems,
      electrical,
      installation,
      notes: [
        'All materials to meet local electrical codes',
        'Contractor to verify all quantities before ordering',
        'Pricing is estimated and subject to change',
        'Installation labor rates not included in material costs',
        'Permit fees and inspections by others'
      ]
    };
  }
  
  private static getGridReference(x: number, y: number, roomWidth: number, roomLength: number): string {
    const col = Math.floor(x / 10); // 10ft grid
    const row = Math.floor(y / 10);
    const letter = String.fromCharCode(65 + col); // A, B, C...
    return `${letter}${row + 1}`;
  }
  
  private static calculateCircuits(fixtures: Fixture[], numCircuits: number) {
    const circuits: ElectricalRequirements['recommendedCircuits'] = [];
    const fixturesPerCircuit = Math.ceil(fixtures.length / numCircuits);
    
    for (let i = 0; i < numCircuits; i++) {
      const circuitFixtures = fixtures.slice(
        i * fixturesPerCircuit,
        (i + 1) * fixturesPerCircuit
      );
      
      circuits.push({
        circuitNumber: `L${i + 1}`,
        breaker: '20A',
        voltage: '277V',
        fixtures: circuitFixtures.map(f => f.id),
        load: circuitFixtures.reduce((sum, f) => sum + (f.model?.wattage || 0), 0)
      });
    }
    
    return circuits;
  }
  
  static exportToExcel(bom: ProfessionalBOM): Blob {
    // This would use a library like xlsx to generate Excel file
    // For now, return CSV
    const csv = this.exportToCSV(bom);
    return new Blob([csv], { type: 'text/csv' });
  }
  
  static exportToCSV(bom: ProfessionalBOM): string {
    const headers = [
      'Item ID',
      'Category',
      'Type',
      'Manufacturer',
      'Model',
      'Description',
      'Quantity',
      'Unit',
      'Unit Price',
      'Total Price',
      'Location',
      'Notes'
    ];
    
    const rows = bom.items.map(item => [
      item.id,
      item.category,
      item.type,
      item.manufacturer || '',
      item.model || '',
      item.description,
      item.quantity,
      item.unit,
      item.unitPrice || '',
      item.totalPrice || '',
      item.location?.join('; ') || '',
      item.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }
}