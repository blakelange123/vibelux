/**
 * Installation Documentation Generator
 * Generates contractor-specific documentation packages
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface InstallationProject {
  projectName: string;
  projectNumber: string;
  clientName: string;
  contractorName: string;
  engineerName: string;
  siteAddress: string;
  designDate: Date;
  installationDate?: Date;
  projectManager: string;
  electrician: string;
  fixtures: FixtureInstallation[];
  circuits: CircuitInstallation[];
  room: {
    width: number;
    length: number;
    height: number;
    type: string;
  };
}

export interface FixtureInstallation {
  id: string;
  tag: string; // e.g., "F-1", "F-2"
  manufacturer: string;
  model: string;
  wattage: number;
  voltage: number;
  position: { x: number; y: number; z: number };
  circuitId: string;
  mountingType: 'ceiling' | 'wall' | 'pendant' | 'track';
  dimming: boolean;
  emergencyKit: boolean;
  notes?: string;
}

export interface CircuitInstallation {
  id: string;
  panel: string;
  breaker: string;
  wireSize: string;
  conduitSize: string;
  voltage: number;
  amperage: number;
  length: number;
  fixtures: string[]; // fixture IDs
  routing: Array<{ x: number; y: number }>;
}

/**
 * Generate field installation drawings (11x17 format)
 */
export function generateFieldInstallationDrawings(project: InstallationProject): jsPDF {
  const pdf = new jsPDF('l', 'mm', [432, 279]); // 11x17 landscape
  const pageWidth = 432;
  const pageHeight = 279;
  const margin = 20;

  // Title block
  drawTitleBlock(pdf, pageWidth, pageHeight, {
    title: 'FIELD INSTALLATION DRAWINGS',
    project: project.projectName,
    number: project.projectNumber,
    contractor: project.contractorName,
    date: project.designDate.toLocaleDateString(),
    sheet: '1 of 1'
  });

  // Room layout
  const scale = Math.min(
    (pageWidth - 2 * margin - 100) / project.room.width,
    (pageHeight - 2 * margin - 60) / project.room.length
  ) * 0.8;

  const roomWidth = project.room.width * scale;
  const roomHeight = project.room.length * scale;
  const offsetX = margin;
  const offsetY = 60;

  // Draw room outline
  pdf.setLineWidth(2);
  pdf.setDrawColor(0, 0, 0);
  pdf.rect(offsetX, offsetY, roomWidth, roomHeight);

  // Draw grid (1-foot increments)
  pdf.setLineWidth(0.3);
  pdf.setDrawColor(200, 200, 200);
  for (let i = 1; i < project.room.width; i++) {
    const x = offsetX + i * scale;
    pdf.line(x, offsetY, x, offsetY + roomHeight);
  }
  for (let i = 1; i < project.room.length; i++) {
    const y = offsetY + i * scale;
    pdf.line(offsetX, y, offsetX + roomWidth, y);
  }

  // Draw fixtures with tags
  pdf.setFontSize(8);
  project.fixtures.forEach(fixture => {
    const x = offsetX + fixture.position.x * scale;
    const y = offsetY + fixture.position.y * scale;

    // Fixture symbol
    pdf.setFillColor(255, 255, 0);
    pdf.circle(x, y, 8, 'F');
    
    // Fixture tag
    pdf.setTextColor(0, 0, 0);
    pdf.text(fixture.tag, x + 10, y + 3);
    
    // Wattage
    pdf.setFontSize(6);
    pdf.text(`${fixture.wattage}W`, x + 10, y + 8);
    pdf.setFontSize(8);
  });

  // Draw circuit routing
  const circuitColors = ['#FF0000', '#0000FF', '#00FF00', '#FF8000', '#800080', '#00FFFF'];
  project.circuits.forEach((circuit, index) => {
    const color = circuitColors[index % circuitColors.length];
    const [r, g, b] = [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16)
    ];
    
    pdf.setDrawColor(r, g, b);
    pdf.setLineWidth(2);
    
    // Draw circuit path
    for (let i = 1; i < circuit.routing.length; i++) {
      const startX = offsetX + circuit.routing[i-1].x * scale;
      const startY = offsetY + circuit.routing[i-1].y * scale;
      const endX = offsetX + circuit.routing[i].x * scale;
      const endY = offsetY + circuit.routing[i].y * scale;
      pdf.line(startX, startY, endX, endY);
    }
  });

  // Circuit legend
  const legendX = offsetX + roomWidth + 20;
  let legendY = offsetY;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text('CIRCUIT LEGEND', legendX, legendY);
  legendY += 15;
  
  project.circuits.forEach((circuit, index) => {
    const color = circuitColors[index % circuitColors.length];
    const [r, g, b] = [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16)
    ];
    
    // Color line
    pdf.setDrawColor(r, g, b);
    pdf.setLineWidth(3);
    pdf.line(legendX, legendY, legendX + 15, legendY);
    
    // Circuit info
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${circuit.id}: ${circuit.breaker} - ${circuit.wireSize}`, legendX + 20, legendY + 2);
    legendY += 10;
  });

  // Installation notes
  const notesY = offsetY + roomHeight + 20;
  pdf.setFontSize(10);
  pdf.text('INSTALLATION NOTES:', offsetX, notesY);
  
  const notes = [
    '1. Verify all dimensions and locations before installation',
    '2. All fixtures shall be installed per manufacturer specifications',
    '3. Provide proper support for all fixtures over 50 lbs',
    '4. Test all circuits before final connection',
    '5. Coordinate with other trades for ceiling access',
    '6. Install emergency battery packs as indicated'
  ];
  
  pdf.setFontSize(8);
  notes.forEach((note, index) => {
    pdf.text(note, offsetX, notesY + 10 + (index * 8));
  });

  return pdf;
}

/**
 * Generate mounting details and hardware specifications
 */
export function generateMountingDetails(project: InstallationProject): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  drawTitleBlock(pdf, 210, 297, {
    title: 'MOUNTING DETAILS & HARDWARE',
    project: project.projectName,
    number: project.projectNumber,
    contractor: project.contractorName,
    date: project.designDate.toLocaleDateString(),
    sheet: '1 of 1'
  });

  let currentY = 60;
  
  // Group fixtures by mounting type
  const mountingGroups = project.fixtures.reduce((groups, fixture) => {
    if (!groups[fixture.mountingType]) {
      groups[fixture.mountingType] = [];
    }
    groups[fixture.mountingType].push(fixture);
    return groups;
  }, {} as Record<string, FixtureInstallation[]>);

  Object.entries(mountingGroups).forEach(([mountingType, fixtures]) => {
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${mountingType.toUpperCase()} MOUNTED FIXTURES`, 20, currentY);
    currentY += 10;

    // Create table data
    const tableData = fixtures.map(fixture => [
      fixture.tag,
      `${fixture.manufacturer} ${fixture.model}`,
      `${fixture.wattage}W`,
      getMountingHardware(fixture),
      getSupportRequirements(fixture)
    ]);

    (pdf as any).autoTable({
      head: [['Tag', 'Fixture', 'Wattage', 'Mounting Hardware', 'Support Requirements']],
      body: tableData,
      startY: currentY,
      theme: 'grid',
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { cellWidth: 20 },
        3: { cellWidth: 60 },
        4: { cellWidth: 50 }
      }
    });

    currentY = (pdf as any).lastAutoTable.finalY + 15;
  });

  return pdf;
}

/**
 * Generate commissioning plan and procedures
 */
export function generateCommissioningPlan(project: InstallationProject): jsPDF {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  drawTitleBlock(pdf, 210, 297, {
    title: 'COMMISSIONING PLAN & PROCEDURES',
    project: project.projectName,
    number: project.projectNumber,
    contractor: project.contractorName,
    date: project.designDate.toLocaleDateString(),
    sheet: '1 of 1'
  });

  let currentY = 60;

  // Commissioning phases
  const phases = [
    {
      phase: 'PRE-INSTALLATION',
      tasks: [
        'Verify all materials received and undamaged',
        'Review installation drawings with crew',
        'Confirm ceiling grid/structure ready',
        'Test all circuits at panel',
        'Coordinate with other trades'
      ]
    },
    {
      phase: 'INSTALLATION',
      tasks: [
        'Install fixtures per approved drawings',
        'Verify proper mounting and support',
        'Connect circuits per schedule',
        'Install emergency battery packs',
        'Label all circuits and fixtures'
      ]
    },
    {
      phase: 'TESTING & VERIFICATION',
      tasks: [
        'Test all circuits and fixtures',
        'Verify dimming functionality',
        'Test emergency systems',
        'Perform photometric verification',
        'Document any deviations'
      ]
    },
    {
      phase: 'FINAL ACCEPTANCE',
      tasks: [
        'Client walkthrough and training',
        'Deliver warranty documentation',
        'Provide maintenance schedule',
        'Submit as-built drawings',
        'Obtain final acceptance'
      ]
    }
  ];

  phases.forEach(phase => {
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(phase.phase, 20, currentY);
    currentY += 8;

    pdf.setFontSize(9);
    phase.tasks.forEach(task => {
      pdf.text(`• ${task}`, 25, currentY);
      currentY += 6;
    });
    currentY += 5;
  });

  return pdf;
}

/**
 * Generate complete contractor package
 */
export async function generateContractorPackage(project: InstallationProject): Promise<void> {
  const zip = new JSZip();
  
  // Installation drawings
  const installationPdf = generateFieldInstallationDrawings(project);
  zip.file('01_Installation_Drawings.pdf', installationPdf.output('blob'));
  
  // Mounting details
  const mountingPdf = generateMountingDetails(project);
  zip.file('02_Mounting_Details.pdf', mountingPdf.output('blob'));
  
  // Commissioning plan
  const commissioningPdf = generateCommissioningPlan(project);
  zip.file('03_Commissioning_Plan.pdf', commissioningPdf.output('blob'));
  
  // Fixture schedule CSV
  const fixtureScheduleCsv = generateFixtureScheduleCSV(project);
  zip.file('04_Fixture_Schedule.csv', fixtureScheduleCsv);
  
  // Circuit schedule CSV
  const circuitScheduleCsv = generateCircuitScheduleCSV(project);
  zip.file('05_Circuit_Schedule.csv', circuitScheduleCsv);
  
  // Material list Excel (simplified as CSV)
  const materialListCsv = generateMaterialListCSV(project);
  zip.file('06_Material_List.csv', materialListCsv);
  
  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${project.projectName.replace(/\s+/g, '_')}_Contractor_Package.zip`);
}

// Helper functions
function drawTitleBlock(pdf: jsPDF, pageWidth: number, pageHeight: number, info: any) {
  const titleBlockWidth = 120;
  const titleBlockHeight = 40;
  const x = pageWidth - titleBlockWidth - 10;
  const y = pageHeight - titleBlockHeight - 10;
  
  // Border
  pdf.setLineWidth(1);
  pdf.setDrawColor(0, 0, 0);
  pdf.rect(x, y, titleBlockWidth, titleBlockHeight);
  
  // Title
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(info.title, x + 5, y + 8);
  
  // Project info
  pdf.setFontSize(8);
  pdf.text(`Project: ${info.project}`, x + 5, y + 15);
  pdf.text(`Project #: ${info.number}`, x + 5, y + 20);
  pdf.text(`Contractor: ${info.contractor}`, x + 5, y + 25);
  pdf.text(`Date: ${info.date}`, x + 5, y + 30);
  pdf.text(`Sheet: ${info.sheet}`, x + 5, y + 35);
}

function getMountingHardware(fixture: FixtureInstallation): string {
  switch (fixture.mountingType) {
    case 'ceiling':
      return fixture.wattage > 50 ? 'Aircraft cable, ceiling box' : 'Standard ceiling box';
    case 'pendant':
      return 'Aircraft cable, strain relief, ceiling box';
    case 'wall':
      return 'Wall box, mounting screws';
    case 'track':
      return 'Track adapter, mounting screws';
    default:
      return 'See manufacturer specifications';
  }
}

function getSupportRequirements(fixture: FixtureInstallation): string {
  if (fixture.wattage > 100) {
    return 'Independent support required';
  } else if (fixture.wattage > 50) {
    return 'Verify ceiling grid capacity';
  } else {
    return 'Standard grid support OK';
  }
}

function generateFixtureScheduleCSV(project: InstallationProject): string {
  const headers = ['Tag', 'Manufacturer', 'Model', 'Wattage', 'Voltage', 'Circuit', 'X', 'Y', 'Z', 'Mounting', 'Dimming', 'Emergency', 'Notes'];
  const rows = project.fixtures.map(fixture => [
    fixture.tag,
    fixture.manufacturer,
    fixture.model,
    fixture.wattage.toString(),
    fixture.voltage.toString(),
    fixture.circuitId,
    fixture.position.x.toString(),
    fixture.position.y.toString(),
    fixture.position.z.toString(),
    fixture.mountingType,
    fixture.dimming ? 'Yes' : 'No',
    fixture.emergencyKit ? 'Yes' : 'No',
    fixture.notes || ''
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function generateCircuitScheduleCSV(project: InstallationProject): string {
  const headers = ['Circuit', 'Panel', 'Breaker', 'Wire Size', 'Conduit', 'Voltage', 'Amperage', 'Length', 'Fixtures'];
  const rows = project.circuits.map(circuit => [
    circuit.id,
    circuit.panel,
    circuit.breaker,
    circuit.wireSize,
    circuit.conduitSize,
    circuit.voltage.toString(),
    circuit.amperage.toString(),
    circuit.length.toString(),
    circuit.fixtures.join(';')
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function generateMaterialListCSV(project: InstallationProject): string {
  const materials = new Map<string, { quantity: number; unit: string; description: string; }>();
  
  // Count fixtures
  project.fixtures.forEach(fixture => {
    const key = `${fixture.manufacturer}_${fixture.model}`;
    if (materials.has(key)) {
      materials.get(key)!.quantity++;
    } else {
      materials.set(key, {
        quantity: 1,
        unit: 'EA',
        description: `${fixture.manufacturer} ${fixture.model} - ${fixture.wattage}W`
      });
    }
  });
  
  // Add wire and conduit estimates
  const totalWireLength = project.circuits.reduce((sum, circuit) => sum + circuit.length, 0);
  materials.set('THHN_WIRE', {
    quantity: Math.ceil(totalWireLength * 1.1), // 10% waste factor
    unit: 'FT',
    description: 'THHN Wire (various sizes)'
  });
  
  materials.set('EMT_CONDUIT', {
    quantity: Math.ceil(totalWireLength * 0.8), // Assuming some surface wiring
    unit: 'FT',
    description: 'EMT Conduit (various sizes)'
  });
  
  const headers = ['Item', 'Quantity', 'Unit', 'Description'];
  const rows = Array.from(materials.entries()).map(([key, material]) => [
    key,
    material.quantity.toString(),
    material.unit,
    material.description
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}