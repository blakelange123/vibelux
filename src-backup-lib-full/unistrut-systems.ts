// Unistrut hanging systems for grow lights
// Common configurations used in commercial grow operations

export interface UnistrustRun {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  height: number; // Height above floor (typically 8-12 feet)
  size: 'P1000' | 'P1001' | 'P2000' | 'P3000'; // Standard unistrut sizes
  maxLoad: number; // lbs
  fixtures: string[]; // IDs of fixtures hanging from this run
}

export interface UnistrustHanger {
  id: string;
  fixtureId: string;
  runId: string;
  position: number; // Position along the run (0-1)
  dropHeight: number; // Drop height in feet
  hangerType: 'rigid' | 'chain' | 'cable' | 'adjustable';
  weight: number; // Weight of fixture in lbs
}

export const unistrustSizes = {
  P1000: {
    name: 'P1000 - 1-5/8" x 1-5/8"',
    width: 1.625,
    height: 1.625,
    thickness: 0.125,
    maxLoad: 1000, // lbs per 10 ft span
    weight: 2.5 // lbs per foot
  },
  P1001: {
    name: 'P1001 - 1-5/8" x 1-5/8" x 12 GA',
    width: 1.625,
    height: 1.625,
    thickness: 0.105,
    maxLoad: 850,
    weight: 2.1
  },
  P2000: {
    name: 'P2000 - 1-5/8" x 3-1/4"',
    width: 1.625,
    height: 3.25,
    thickness: 0.125,
    maxLoad: 2000,
    weight: 4.3
  },
  P3000: {
    name: 'P3000 - 1-5/8" x 4-7/8"',
    width: 1.625,
    height: 4.875,
    thickness: 0.125,
    maxLoad: 3000,
    weight: 6.1
  }
};

export const hangerTypes = {
  rigid: {
    name: 'Rigid Rod Hanger',
    description: 'Fixed height mounting',
    adjustment: false,
    maxLoad: 150,
    cost: 12
  },
  chain: {
    name: 'Chain Hanger',
    description: 'Manual height adjustment',
    adjustment: true,
    maxLoad: 100,
    cost: 15
  },
  cable: {
    name: 'Aircraft Cable',
    description: 'Clean look, fixed height',
    adjustment: false,
    maxLoad: 200,
    cost: 8
  },
  adjustable: {
    name: 'Ratchet Hanger',
    description: 'Easy height adjustment',
    adjustment: true,
    maxLoad: 125,
    cost: 25
  }
};

// Calculate unistrut requirements for a given fixture layout
export function calculateUnistrut(
  fixtures: Array<{ x: number; y: number; weight?: number; id: string }>,
  roomWidth: number,
  roomLength: number,
  targetHeight: number = 10
): {
  runs: UnistrustRun[];
  hangers: UnistrustHanger[];
  totalLength: number;
  estimatedCost: number;
} {
  const runs: UnistrustRun[] = [];
  const hangers: UnistrustHanger[] = [];
  let runId = 0;

  // Group fixtures by rows (within 2 feet of each other in Y direction)
  const rows: Array<typeof fixtures> = [];
  const sortedFixtures = [...fixtures].sort((a, b) => a.y - b.y);
  
  let currentRow: typeof fixtures = [];
  let lastY = -999;
  
  for (const fixture of sortedFixtures) {
    if (Math.abs(fixture.y - lastY) > 2) {
      if (currentRow.length > 0) {
        rows.push([...currentRow]);
      }
      currentRow = [fixture];
    } else {
      currentRow.push(fixture);
    }
    lastY = fixture.y;
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  // Create unistrut runs for each row
  for (const row of rows) {
    if (row.length === 0) continue;
    
    const minX = Math.min(...row.map(f => f.x));
    const maxX = Math.max(...row.map(f => f.x));
    const avgY = row.reduce((sum, f) => sum + f.y, 0) / row.length;
    const totalWeight = row.reduce((sum, f) => sum + (f.weight || 50), 0);
    
    // Extend run 2 feet beyond fixtures on each side
    const startX = Math.max(0, minX - 2);
    const endX = Math.min(roomWidth, maxX + 2);
    const runLength = endX - startX;
    
    // Select appropriate unistrut size based on load
    let size: keyof typeof unistrustSizes = 'P1000';
    if (totalWeight > 800) size = 'P2000';
    if (totalWeight > 1500) size = 'P3000';
    
    const run: UnistrustRun = {
      id: `run-${runId++}`,
      startX,
      startY: avgY,
      endX,
      endY: avgY,
      height: targetHeight,
      size,
      maxLoad: unistrustSizes[size].maxLoad,
      fixtures: row.map(f => f.id)
    };
    runs.push(run);
    
    // Create hangers for each fixture
    for (const fixture of row) {
      const position = (fixture.x - startX) / runLength;
      const hanger: UnistrustHanger = {
        id: `hanger-${fixture.id}`,
        fixtureId: fixture.id,
        runId: run.id,
        position,
        dropHeight: 2, // Default 2 foot drop
        hangerType: 'adjustable',
        weight: fixture.weight || 50
      };
      hangers.push(hanger);
    }
  }

  // Calculate totals
  const totalLength = runs.reduce((sum, run) => 
    sum + Math.sqrt((run.endX - run.startX) ** 2 + (run.endY - run.startY) ** 2), 0);
  
  const materialCost = totalLength * 8; // $8/foot for unistrut
  const hangerCost = hangers.reduce((sum, hanger) => 
    sum + hangerTypes[hanger.hangerType].cost, 0);
  const estimatedCost = materialCost + hangerCost;

  return { runs, hangers, totalLength, estimatedCost };
}

// Generate installation notes for unistrut system
export function generateInstallationNotes(
  runs: UnistrustRun[],
  hangers: UnistrustHanger[]
): string[] {
  const notes: string[] = [];
  
  notes.push('UNISTRUT INSTALLATION NOTES:');
  notes.push('');
  
  // Structural requirements
  notes.push('STRUCTURAL REQUIREMENTS:');
  notes.push('- Verify ceiling structure can support total load');
  notes.push('- Use appropriate ceiling attachments (concrete anchors, beam clamps, etc.)');
  notes.push('- Support points every 4-6 feet maximum');
  notes.push('- Consider seismic requirements for your region');
  notes.push('');
  
  // Installation sequence
  notes.push('INSTALLATION SEQUENCE:');
  notes.push('1. Mark ceiling attachment points');
  notes.push('2. Install structural supports');
  notes.push('3. Mount unistrut runs level and parallel');
  notes.push('4. Install fixture hangers');
  notes.push('5. Mount and level fixtures');
  notes.push('6. Complete electrical connections');
  notes.push('');
  
  // Per-run details
  for (const run of runs) {
    const runLength = Math.sqrt((run.endX - run.startX) ** 2 + (run.endY - run.startY) ** 2);
    notes.push(`RUN ${run.id.toUpperCase()}:`);
    notes.push(`- Size: ${unistrustSizes[run.size].name}`);
    notes.push(`- Length: ${runLength.toFixed(1)} ft`);
    notes.push(`- Height: ${run.height} ft AFF`);
    notes.push(`- Max Load: ${run.maxLoad} lbs`);
    notes.push(`- Fixtures: ${run.fixtures.length}`);
    notes.push('');
  }
  
  return notes;
}