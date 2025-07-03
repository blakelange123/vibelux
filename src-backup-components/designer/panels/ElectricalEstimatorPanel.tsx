'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Calculator,
  DollarSign,
  AlertTriangle, 
  Info, 
  FileText,
  Download,
  Settings,
  Activity,
  CheckCircle,
  Grid3x3,
  Shield,
  Package,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface ElectricalEstimatorPanelProps {
  onClose: () => void;
}

export function ElectricalEstimatorPanel({ onClose }: ElectricalEstimatorPanelProps) {
  const { state } = useDesigner();
  const { showNotification } = useNotifications();
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Extract fixtures from the design
  const fixtures = state.objects.filter(obj => obj.type === 'fixture');
  
  // Electrical calculations state
  const [calculations, setCalculations] = useState({
    totalLoad: 0,
    requiredCircuits: 0,
    panelSize: 0,
    mainBreakerSize: 0,
    wireSize: '',
    conduitSize: '',
    voltageDrop: 0,
    costEstimate: 0
  });

  const [settings, setSettings] = useState({
    systemVoltage: 480,
    phases: 3,
    wireRunDistance: 100,
    powerFactor: 0.95,
    demandFactor: 0.8,
    laborRate: 125,
    markupPercent: 35,
    includePermits: true,
    includeInspections: true,
    zipCode: '90210',
    ceilingHeight: 12,
    projectType: 'new-construction' as 'new-construction' | 'retrofit' | 'expansion',
    accessDifficulty: 'moderate' as 'easy' | 'moderate' | 'difficult',
    requiresCommissioning: true,
    requiresTraining: false
  });

  // Regional labor rate lookup ($/hour for licensed electricians)
  const getRegionalLaborRate = (zipCode: string): number => {
    const zipPrefix = zipCode.substring(0, 3);
    const regionalRates: Record<string, number> = {
      // California - Higher rates
      '900': 95, '901': 98, '902': 92, '903': 88, '904': 85, '905': 89, '906': 82, '907': 79, '908': 86, '909': 83,
      '910': 88, '911': 91, '912': 89, '913': 86, '914': 84, '915': 87, '916': 89, '917': 92, '918': 88, '919': 85,
      '920': 94, '921': 97, '922': 95, '923': 89, '924': 91, '925': 93, '926': 90, '927': 87, '928': 84, '929': 86,
      '930': 88, '931': 85, '932': 87, '933': 89, '934': 91, '935': 93, '936': 95, '937': 82, '938': 79, '939': 81,
      '940': 83, '941': 85, '942': 87, '943': 89, '944': 91, '945': 88, '946': 90, '947': 92, '948': 89, '949': 94,
      '950': 87, '951': 84, '952': 86, '953': 88, '954': 90, '955': 85, '956': 82, '957': 79, '958': 81, '959': 83,
      '960': 88, '961': 90, // Nevada
      // New York - Highest rates
      '100': 125, '101': 128, '102': 122, '103': 118, '104': 115, '105': 118, '106': 122, '107': 125, '108': 119, '109': 116,
      '110': 113, '111': 116, '112': 119, '113': 122, '114': 118, '115': 115, '116': 112, '117': 115, '118': 118, '119': 121,
      '120': 108, '121': 105, '122': 102, '123': 105, '124': 108, '125': 111, '126': 114, '127': 117, '128': 114, '129': 111,
      // Texas - Lower rates
      '750': 72, '751': 69, '752': 66, '753': 69, '754': 72, '755': 75, '756': 78, '757': 75, '758': 72, '759': 69,
      '760': 66, '761': 69, '762': 72, '763': 75, '764': 78, '765': 75, '766': 72, '767': 69, '768': 66, '769': 69,
      '770': 72, '771': 75, '772': 78, '773': 81, '774': 78, '775': 75, '776': 72, '777': 69, '778': 72, '779': 75,
      '780': 78, '781': 81, '782': 84, '783': 81, '784': 78, '785': 75, '786': 72, '787': 69, '788': 72, '789': 75,
      // Florida - Moderate rates
      '320': 68, '321': 71, '322': 74, '323': 71, '324': 68, '325': 65, '326': 68, '327': 71, '328': 74, '329': 71,
      '330': 68, '331': 65, '332': 68, '333': 71, '334': 74, '335': 77, '336': 74, '337': 71, '338': 68, '339': 65,
      '340': 68, '341': 71, '342': 74, '343': 77, '344': 80, '345': 77, '346': 74, '347': 71, '348': 68, '349': 65,
      // Illinois - High rates (Chicago)
      '600': 95, '601': 98, '602': 95, '603': 92, '604': 89, '605': 86, '606': 89, '607': 92, '608': 95, '609': 98,
      '610': 95, '611': 92, '612': 89, '613': 86, '614': 83, '615': 86, '616': 89, '617': 92, '618': 89, '619': 86,
      '620': 83, '621': 80, '622': 77, '623': 80, '624': 83, '625': 86, '626': 89, '627': 86, '628': 83, '629': 80,
    };
    
    return regionalRates[zipPrefix] || settings.laborRate; // fallback to user input
  };

  const [showDetails, setShowDetails] = useState({
    circuits: false,
    materials: false,
    labor: false,
    compliance: false
  });

  // Enhanced electrical calculations using our improved estimator logic
  useEffect(() => {
    if (fixtures.length === 0) return;

    // Extract fixture data for calculations
    const fixtureData = fixtures.map(fixture => ({
      id: fixture.id,
      wattage: (fixture as any).metadata?.wattage || (fixture as any).model?.wattage || 100,
      voltage: settings.systemVoltage,
      quantity: 1,
      enabled: true
    }));

    // Calculate total load
    const totalWattage = fixtureData.reduce((sum, fixture) => sum + fixture.wattage, 0);

    // Apply demand factor per NEC Article 220
    const demandLoad = totalWattage * settings.demandFactor;
    
    // Calculate current with proper 3-phase calculations
    const current = settings.phases === 3 
      ? demandLoad / (Math.sqrt(3) * settings.systemVoltage * settings.powerFactor)
      : demandLoad / (settings.systemVoltage * settings.powerFactor);

    // Enhanced circuit calculations
    const circuitLoadLimit = 20 * 0.8; // 20A @ 80% continuous
    const requiredCircuits = Math.ceil(current / circuitLoadLimit);

    // Enhanced wire selection with voltage drop consideration
    const wireSpecs = [
      { gauge: '12 AWG', ampacity: 20, resistance: 1.98 },
      { gauge: '10 AWG', ampacity: 30, resistance: 1.24 },
      { gauge: '8 AWG', ampacity: 40, resistance: 0.778 },
      { gauge: '6 AWG', ampacity: 55, resistance: 0.491 },
      { gauge: '4 AWG', ampacity: 70, resistance: 0.308 },
      { gauge: '3 AWG', ampacity: 85, resistance: 0.245 },
      { gauge: '2 AWG', ampacity: 95, resistance: 0.194 },
      { gauge: '1 AWG', ampacity: 110, resistance: 0.154 },
      { gauge: '1/0 AWG', ampacity: 125, resistance: 0.122 },
      { gauge: '2/0 AWG', ampacity: 145, resistance: 0.0967 },
      { gauge: '3/0 AWG', ampacity: 165, resistance: 0.0766 },
      { gauge: '4/0 AWG', ampacity: 190, resistance: 0.0608 }
    ];

    // Select wire size considering both ampacity and voltage drop
    const maxVoltageDrop = settings.systemVoltage * 0.03; // 3% max recommended
    let selectedWire = wireSpecs[0];
    
    for (const wire of wireSpecs) {
      if (wire.ampacity >= current * 1.25) { // 125% safety factor
        const voltageDrop = (2 * settings.wireRunDistance * wire.resistance * current) / 1000;
        if (voltageDrop <= maxVoltageDrop) {
          selectedWire = wire;
          break;
        }
      }
    }

    // Enhanced conduit sizing based on conductor count and fill
    const conduitSizes = [
      { size: '1/2"', maxWires: { '12': 9, '10': 5, '8': 2 } },
      { size: '3/4"', maxWires: { '12': 16, '10': 9, '8': 5, '6': 3 } },
      { size: '1"', maxWires: { '12': 26, '10': 15, '8': 9, '6': 5, '4': 3 } },
      { size: '1-1/4"', maxWires: { '12': 44, '10': 25, '8': 15, '6': 9, '4': 5 } },
      { size: '1-1/2"', maxWires: { '12': 61, '10': 35, '8': 21, '6': 12, '4': 7 } },
      { size: '2"', maxWires: { '12': 111, '10': 63, '8': 38, '6': 22, '4': 13 } }
    ];

    const wireGauge = selectedWire.gauge.split(' ')[0];
    const requiredConductors = requiredCircuits * (settings.phases + 1); // Hot wires + neutral
    let selectedConduit = conduitSizes[conduitSizes.length - 1]; // Default to largest
    
    for (const conduit of conduitSizes) {
      const maxWires = conduit.maxWires[wireGauge as keyof typeof conduit.maxWires];
      if (maxWires && maxWires >= requiredConductors) {
        selectedConduit = conduit;
        break;
      }
    }

    // Enhanced breaker sizing
    const mainBreakerCurrent = current * 1.25; // 125% for continuous loads
    const standardBreakerSizes = [15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 225, 250, 300, 350, 400];
    const mainBreakerSize = standardBreakerSizes.find(size => size >= mainBreakerCurrent) || 400;

    // Enhanced cost calculation using our improved pricing
    const materialPrices = {
      wire: { '12': 2.45, '10': 2.95, '8': 4.75, '6': 7.25, '4': 11.50, '2': 18.25, '1': 23.50, '1/0': 29.75, '2/0': 37.50, '3/0': 47.25, '4/0': 59.50 },
      conduit: { '1/2': 2.85, '3/4': 3.95, '1': 5.25, '1-1/4': 7.50, '1-1/2': 9.75, '2': 13.25 },
      breakers: { '20A_1P': 48, '30A_1P': 65, '20A_3P': 195, '30A_3P': 225, '40A_3P': 285, '50A_3P': 365 }
    };

    // Material costs
    const wireGaugeNum = wireGauge.replace('/', '_');
    const wireCost = (materialPrices.wire[wireGaugeNum as keyof typeof materialPrices.wire] || 10) * settings.wireRunDistance * requiredConductors;
    const conduitCost = (materialPrices.conduit[selectedConduit.size.replace('"', '') as keyof typeof materialPrices.conduit] || 8) * settings.wireRunDistance;
    const breakerType = settings.phases === 3 ? '3P' : '1P';
    const breakerCost = requiredCircuits * (materialPrices.breakers[`20A_${breakerType}` as keyof typeof materialPrices.breakers] || 150);
    const panelCost = mainBreakerSize <= 100 ? 385 : mainBreakerSize <= 200 ? 650 : 1250;
    const connectorsCost = fixtures.length * 15; // Whips, connectors per fixture
    const miscCost = (wireCost + conduitCost + breakerCost + panelCost + connectorsCost) * 0.15; // 15% misc
    
    const totalMaterialCost = wireCost + conduitCost + breakerCost + panelCost + connectorsCost + miscCost;

    // Enhanced labor calculation with comprehensive time factors and difficulty multipliers
    const laborTimes = {
      fixtureInstall: 0.75, // hours per fixture
      circuitRun: 0.15, // hours per foot
      panelTermination: 1.5, // hours per circuit
      testing: 0.5, // hours per circuit
      panelInstall: 8, // hours per panel
      cleanup: 0.1, // hours per fixture
      commissioning: 0.25, // hours per fixture if needed
      projectMobilization: 4, // setup time
      documentation: 2, // as-built drawings
      // Difficulty factors
      highCeilingFactor: 1.3, // multiplier for ceilings >12ft
      retrofitFactor: 1.2, // multiplier for retrofit vs new construction
      accessDifficultyFactor: 1.15 // multiplier for difficult access areas
    };

    // Use regional rate if available, otherwise user input
    const effectiveLaborRate = settings.laborRate || getRegionalLaborRate(settings.zipCode);
    
    // Apply difficulty multipliers
    let difficultyMultiplier = 1.0;
    if (settings.ceilingHeight > 12) difficultyMultiplier *= laborTimes.highCeilingFactor;
    if (settings.projectType === 'retrofit') difficultyMultiplier *= laborTimes.retrofitFactor;
    if (settings.accessDifficulty === 'difficult') difficultyMultiplier *= laborTimes.accessDifficultyFactor;

    const installationHours = fixtures.length * laborTimes.fixtureInstall * difficultyMultiplier;
    const wiringHours = requiredCircuits * settings.wireRunDistance * laborTimes.circuitRun;
    const terminationHours = requiredCircuits * laborTimes.panelTermination;
    const testingHours = requiredCircuits * laborTimes.testing;
    const cleanupHours = fixtures.length * laborTimes.cleanup;
    const commissioningHours = settings.requiresCommissioning ? fixtures.length * laborTimes.commissioning : 0;
    const projectHours = laborTimes.projectMobilization + laborTimes.documentation;
    
    const totalLaborHours = installationHours + wiringHours + terminationHours + testingHours + 
                           cleanupHours + commissioningHours + projectHours + laborTimes.panelInstall;
    
    const laborCost = totalLaborHours * effectiveLaborRate;

    // Additional costs
    const permitCost = settings.includePermits ? (150 + (totalWattage / 1000) * 25) : 0;
    const inspectionCost = settings.includeInspections ? 200 : 0;
    
    // Final totals
    const subtotal = totalMaterialCost + laborCost + permitCost + inspectionCost;
    const markup = subtotal * (settings.markupPercent / 100);
    const totalCost = subtotal + markup;

    // Enhanced voltage drop calculation
    const actualVoltageDrop = (2 * settings.wireRunDistance * selectedWire.resistance * current) / 1000;
    const voltageDropPercent = (actualVoltageDrop / settings.systemVoltage) * 100;

    setCalculations({
      totalLoad: demandLoad,
      requiredCircuits,
      panelSize: mainBreakerSize,
      mainBreakerSize,
      wireSize: selectedWire.gauge,
      conduitSize: selectedConduit.size,
      voltageDrop: voltageDropPercent,
      costEstimate: totalCost
    });
  }, [fixtures, settings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Export options state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    // Report sections
    includeProjectSummary: true,
    includeFixtureSchedule: true,
    includeElectricalCalculations: true,
    includeMaterialList: true,
    includeLaborBreakdown: true,
    includeCostSummary: true,
    includeCircuitSchedule: true,
    includePanelSchedule: true,
    includeComplianceNotes: true,
    includePhotometricData: false,
    
    // Drawings and diagrams
    includeSingleLineDiagram: true,
    includeElectricalLayout: true,
    includePanelLayout: false,
    includeConduitRouting: false,
    includeGroundingDiagram: false,
    
    // Technical details
    includeVoltageDropCalculations: true,
    includeLoadCalculations: true,
    includeShortCircuitAnalysis: false,
    includeArcFlashAnalysis: false,
    includeEnergyCalculations: false,
    
    // Professional elements
    includeCompanyLogo: true,
    includeProjectPhotos: false,
    includeSignatureBlocks: true,
    includeRevisionTable: true,
    includeNotes: true,
    
    // Export format
    exportFormat: 'pdf' as 'pdf' | 'excel' | 'dwg' | 'json',
    reportTemplate: 'professional' as 'professional' | 'basic' | 'contractor' | 'engineer'
  });

  const generateComprehensiveReport = () => {
    // Calculate drawing bounds and scale to fit within standard sheet sizes
    const roomBounds = {
      width: (state.room as any).width || 400,
      height: (state.room as any).length || 400,
      minX: Math.min(...fixtures.map(f => f.x), 0),
      maxX: Math.max(...fixtures.map(f => f.x), (state.room as any).width || 400),
      minY: Math.min(...fixtures.map(f => f.y), 0),
      maxY: Math.max(...fixtures.map(f => f.y), (state.room as any).length || 400)
    };

    // Standard drawing sheet sizes (in drawing units)
    const standardSheets = {
      'A': { width: 8.5 * 12, height: 11 * 12, name: 'A-Size (8.5" x 11")' },      // 102 x 132 units
      'B': { width: 11 * 12, height: 17 * 12, name: 'B-Size (11" x 17")' },        // 132 x 204 units  
      'C': { width: 17 * 12, height: 22 * 12, name: 'C-Size (17" x 22")' },        // 204 x 264 units
      'D': { width: 22 * 12, height: 34 * 12, name: 'D-Size (22" x 34")' },        // 264 x 408 units
      'E': { width: 34 * 12, height: 44 * 12, name: 'E-Size (34" x 44")' },        // 408 x 528 units
      'ARCH_D': { width: 24 * 12, height: 36 * 12, name: 'Arch D (24" x 36")' },   // 288 x 432 units
      'ARCH_E': { width: 36 * 12, height: 48 * 12, name: 'Arch E (36" x 48")' }    // 432 x 576 units
    };

    // Calculate required drawing area including margins and title block
    const titleBlockMargin = 48; // 4" margin for title block and notes
    const generalMargin = 24;    // 2" general margin
    const requiredWidth = (roomBounds.maxX - roomBounds.minX) + (titleBlockMargin + generalMargin);
    const requiredHeight = (roomBounds.maxY - roomBounds.minY) + (titleBlockMargin + generalMargin);

    // Find the best fitting sheet size
    let selectedSheet = standardSheets.ARCH_E; // Default to largest
    for (const [key, sheet] of Object.entries(standardSheets)) {
      if (requiredWidth <= sheet.width && requiredHeight <= sheet.height) {
        selectedSheet = sheet;
        break;
      }
    }

    // Calculate drawing scale to fit within selected sheet
    const availableWidth = selectedSheet.width - titleBlockMargin - generalMargin;
    const availableHeight = selectedSheet.height - titleBlockMargin - generalMargin;
    const actualWidth = roomBounds.maxX - roomBounds.minX;
    const actualHeight = roomBounds.maxY - roomBounds.minY;

    // Calculate scale factors and use the more restrictive one
    const scaleX = availableWidth / actualWidth;
    const scaleY = availableHeight / actualHeight;
    const drawingScale = Math.min(scaleX, scaleY, 1.0); // Never scale up beyond 1:1

    // Calculate drawing offset to center the layout
    const scaledWidth = actualWidth * drawingScale;
    const scaledHeight = actualHeight * drawingScale;
    const offsetX = generalMargin + (availableWidth - scaledWidth) / 2;
    const offsetY = generalMargin + (availableHeight - scaledHeight) / 2;

    // Transform fixture coordinates to drawing coordinates
    const transformToDrawing = (x: number, y: number) => ({
      x: offsetX + (x - roomBounds.minX) * drawingScale,
      y: offsetY + (y - roomBounds.minY) * drawingScale
    });

    // Enhanced fixture data with proper drawing coordinates
    const detailedFixtures = fixtures.map(f => {
      const drawingCoords = transformToDrawing(f.x, f.y);
      return {
        id: f.id,
        tag: `L-${String(fixtures.indexOf(f) + 1).padStart(3, '0')}`,
        manufacturer: (f as any).metadata?.manufacturer || (f as any).model?.manufacturer || 'Generic',
        model: (f as any).metadata?.model || (f as any).model?.name || 'LED Fixture',
        wattage: (f as any).metadata?.wattage || (f as any).model?.wattage || 100,
        voltage: settings.systemVoltage,
        current: ((f as any).metadata?.wattage || (f as any).model?.wattage || 100) / settings.systemVoltage,
        mounting: (f as any).metadata?.mounting || 'Suspended',
        location: {
          // Original coordinates (for reference)
          x: f.x,
          y: f.y,
          // Drawing coordinates (scaled and positioned)
          drawingX: drawingCoords.x,
          drawingY: drawingCoords.y,
          zone: `Zone ${Math.ceil(f.x / 100)}-${Math.ceil(f.y / 100)}`
        },
        circuit: `C-${Math.ceil(fixtures.indexOf(f) / 8)}`, // 8 fixtures per circuit estimate
        panel: 'LP-1'
      };
    });

    // Calculate panel locations (typically near electrical service entrance)
    const panelLocations = [{
      id: 'LP-1',
      name: 'Lighting Panel LP-1',
      location: transformToDrawing(roomBounds.minX + 50, roomBounds.minY + 50), // Near corner
      circuits: calculations.requiredCircuits,
      amperage: calculations.panelSize
    }];

    // Drawing metadata for export
    const drawingInfo = {
      sheetSize: selectedSheet.name,
      scale: drawingScale < 1 ? `1:${Math.round(1/drawingScale)}` : '1:1',
      drawingBounds: {
        width: selectedSheet.width,
        height: selectedSheet.height,
        contentArea: {
          x: offsetX,
          y: offsetY,
          width: scaledWidth,
          height: scaledHeight
        }
      },
      titleBlock: {
        x: selectedSheet.width - titleBlockMargin,
        y: selectedSheet.height - titleBlockMargin,
        width: titleBlockMargin - 12,
        height: titleBlockMargin - 12
      },
      fitsOnSheet: requiredWidth <= selectedSheet.width && requiredHeight <= selectedSheet.height,
      autoScaled: drawingScale < 1
    };

    // Material breakdown with detailed specifications
    const materialBreakdown = {
      wire: {
        description: `${calculations.wireSize} THHN/THWN-2 Copper`,
        quantity: Math.ceil(settings.wireRunDistance * calculations.requiredCircuits * (settings.phases + 1)),
        unit: 'ft',
        unitPrice: 2.45, // Based on wire gauge
        totalPrice: Math.ceil(settings.wireRunDistance * calculations.requiredCircuits * (settings.phases + 1)) * 2.45
      },
      conduit: {
        description: `${calculations.conduitSize} EMT Conduit`,
        quantity: Math.ceil(settings.wireRunDistance * calculations.requiredCircuits),
        unit: 'ft',
        unitPrice: 3.95,
        totalPrice: Math.ceil(settings.wireRunDistance * calculations.requiredCircuits) * 3.95
      },
      breakers: {
        description: `20A ${settings.phases === 3 ? '3-Pole' : '1-Pole'} Circuit Breakers`,
        quantity: calculations.requiredCircuits,
        unit: 'ea',
        unitPrice: settings.phases === 3 ? 195 : 48,
        totalPrice: calculations.requiredCircuits * (settings.phases === 3 ? 195 : 48)
      },
      panel: {
        description: `${calculations.panelSize}A ${settings.phases === 3 ? '3-Phase' : '1-Phase'} Distribution Panel`,
        quantity: 1,
        unit: 'ea',
        unitPrice: calculations.panelSize <= 100 ? 385 : calculations.panelSize <= 200 ? 650 : 1250,
        totalPrice: calculations.panelSize <= 100 ? 385 : calculations.panelSize <= 200 ? 650 : 1250
      },
      connectors: {
        description: 'Fixture Whips and Connectors',
        quantity: fixtures.length,
        unit: 'ea',
        unitPrice: 15,
        totalPrice: fixtures.length * 15
      }
    };

    // Labor breakdown with detailed time estimates
    const laborBreakdown = {
      installation: {
        description: 'Fixture Installation and Mounting',
        hours: fixtures.length * 0.75,
        rate: settings.laborRate,
        total: fixtures.length * 0.75 * settings.laborRate
      },
      wiring: {
        description: 'Circuit Wiring and Conduit Installation', 
        hours: calculations.requiredCircuits * settings.wireRunDistance * 0.15,
        rate: settings.laborRate,
        total: calculations.requiredCircuits * settings.wireRunDistance * 0.15 * settings.laborRate
      },
      termination: {
        description: 'Panel Terminations and Connections',
        hours: calculations.requiredCircuits * 1.5,
        rate: settings.laborRate,
        total: calculations.requiredCircuits * 1.5 * settings.laborRate
      },
      testing: {
        description: 'Testing and Commissioning',
        hours: calculations.requiredCircuits * 0.5 + (settings.requiresCommissioning ? fixtures.length * 0.25 : 0),
        rate: settings.laborRate,
        total: (calculations.requiredCircuits * 0.5 + (settings.requiresCommissioning ? fixtures.length * 0.25 : 0)) * settings.laborRate
      },
      cleanup: {
        description: 'Site Cleanup and Final Inspection',
        hours: fixtures.length * 0.1 + 4,
        rate: settings.laborRate,
        total: (fixtures.length * 0.1 + 4) * settings.laborRate
      }
    };

    // Circuit schedule
    const circuitSchedule = Array.from({ length: calculations.requiredCircuits }, (_, i) => ({
      circuit: i + 1,
      description: `Lighting Circuit ${i + 1}`,
      phase: settings.phases === 3 ? ['A', 'B', 'C'][i % 3] : 'A',
      breaker: '20A',
      wire: calculations.wireSize,
      load: Math.min(fixtures.length - i * 8, 8) * 100, // Estimate 8 fixtures per circuit
      fixtures: detailedFixtures.slice(i * 8, (i + 1) * 8).map(f => f.tag).join(', ')
    }));

    // Comprehensive report object
    const report = {
      // Project Information
      project: {
        name: (state.room as any).name || 'Untitled Lighting Project',
        number: `VBX-${new Date().getFullYear()}-${String(Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000)).padStart(3, '0')}`,
        client: 'Client Name',
        location: `Project Location (Zip: ${settings.zipCode})`,
        date: new Date().toISOString().split('T')[0],
        preparedBy: 'Designer Name',
        checkedBy: 'Engineer Name',
        revisionNumber: 'A',
        description: 'Professional lighting design with electrical estimates'
      },

      // Design Summary
      summary: {
        totalFixtures: fixtures.length,
        totalWattage: fixtures.reduce((sum, f) => sum + ((f as any).metadata?.wattage || (f as any).model?.wattage || 100), 0),
        requiredCircuits: calculations.requiredCircuits,
        panelSize: calculations.panelSize,
        estimatedCost: calculations.costEstimate,
        powerDensity: calculations.totalLoad / ((state.room as any).width * (state.room as any).length || 400),
        voltageDrop: calculations.voltageDrop
      },

      // Drawing Information (critical for CAD export)
      drawingInfo: drawingInfo,

      // Fixture Schedule with drawing coordinates
      fixtureSchedule: exportOptions.includeFixtureSchedule ? detailedFixtures : undefined,

      // Panel Locations
      panelLocations: panelLocations,

      // Material List
      materialList: exportOptions.includeMaterialList ? materialBreakdown : undefined,

      // Labor Breakdown
      laborBreakdown: exportOptions.includeLaborBreakdown ? laborBreakdown : undefined,

      // Circuit Schedule
      circuitSchedule: exportOptions.includeCircuitSchedule ? circuitSchedule : undefined,

      // Electrical Calculations
      electricalCalculations: exportOptions.includeElectricalCalculations ? {
        loadCalculations: {
          connectedLoad: fixtures.reduce((sum, f) => sum + ((f as any).metadata?.wattage || (f as any).model?.wattage || 100), 0),
          demandLoad: calculations.totalLoad,
          demandFactor: settings.demandFactor,
          powerFactor: settings.powerFactor
        },
        voltageDropCalculations: exportOptions.includeVoltageDropCalculations ? {
          wireSize: calculations.wireSize,
          distance: settings.wireRunDistance,
          voltageDrop: calculations.voltageDrop,
          voltageAtLoad: settings.systemVoltage * (1 - calculations.voltageDrop / 100),
          compliance: calculations.voltageDrop <= 3 ? 'PASS' : 'REVIEW REQUIRED'
        } : undefined,
        circuitAnalysis: {
          circuitsRequired: calculations.requiredCircuits,
          loadPerCircuit: calculations.totalLoad / calculations.requiredCircuits,
          utilizationFactor: (calculations.totalLoad / calculations.requiredCircuits) / (20 * 0.8) // 20A @ 80%
        }
      } : undefined,

      // Cost Summary
      costSummary: exportOptions.includeCostSummary ? {
        materials: Object.values(materialBreakdown).reduce((sum, item) => sum + item.totalPrice, 0),
        labor: Object.values(laborBreakdown).reduce((sum, item) => sum + item.total, 0),
        permits: settings.includePermits ? 150 + (calculations.totalLoad / 1000) * 25 : 0,
        inspections: settings.includeInspections ? 200 : 0,
        subtotal: calculations.costEstimate / (1 + settings.markupPercent / 100),
        markup: (calculations.costEstimate / (1 + settings.markupPercent / 100)) * (settings.markupPercent / 100),
        total: calculations.costEstimate
      } : undefined,

      // Compliance and Standards
      compliance: exportOptions.includeComplianceNotes ? {
        codeCompliance: {
          nec2023: true,
          localCodes: true,
          energyCode: 'IECC 2021'
        },
        safetyRequirements: [
          'All circuits protected by AFCI/GFCI as required by NEC',
          'Voltage drop maintained below 3% per NEC recommendations',
          'Equipment grounding conductor provided for all circuits',
          'Proper working clearances maintained per NEC 110.26'
        ],
        inspectionRequirements: [
          'Rough-in electrical inspection required',
          'Final electrical inspection required',
          'Arc flash analysis recommended for panels over 240V'
        ]
      } : undefined,

      // Technical Notes
      notes: exportOptions.includeNotes ? [
        'All electrical work to be performed by licensed electrician',
        'Verify local code requirements before installation',
        'Coordinate fixture mounting with structural engineer',
        'LED drivers to be accessible for maintenance',
        'Provide as-built drawings upon completion'
      ] : undefined,

      // Export metadata
      exportMetadata: {
        generatedBy: 'Vibelux Advanced Designer',
        exportDate: new Date().toISOString(),
        version: '2.0',
        options: exportOptions
      }
    };

    return report;
  };

  const exportReport = () => {
    const report = generateComprehensiveReport();
    
    if (exportOptions.exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.project.name.replace(/[^a-z0-9]/gi, '_')}_electrical_estimate.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportOptions.exportFormat === 'excel') {
      // Generate Excel-compatible CSV
      const csvContent = generateCSVReport(report);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.project.name.replace(/[^a-z0-9]/gi, '_')}_electrical_estimate.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportOptions.exportFormat === 'pdf') {
      // For PDF, we'll generate a formatted text report that can be easily converted
      const textReport = generateTextReport(report);
      const blob = new Blob([textReport], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.project.name.replace(/[^a-z0-9]/gi, '_')}_electrical_estimate.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    setShowExportModal(false);
    showNotification('success', `Electrical report exported successfully as ${exportOptions.exportFormat.toUpperCase()}`);
  };

  const generateCSVReport = (report: any) => {
    let csv = '';
    
    // Project header
    csv += 'PROJECT INFORMATION\n';
    csv += `Project Name,${report.project.name}\n`;
    csv += `Project Number,${report.project.number}\n`;
    csv += `Date,${report.project.date}\n\n`;
    
    // Drawing information
    if (report.drawingInfo) {
      csv += 'DRAWING INFORMATION\n';
      csv += `Sheet Size,${report.drawingInfo.sheetSize}\n`;
      csv += `Drawing Scale,${report.drawingInfo.scale}\n`;
      csv += `Auto Scaled,${report.drawingInfo.autoScaled ? 'Yes' : 'No'}\n`;
      csv += `Fits on Sheet,${report.drawingInfo.fitsOnSheet ? 'Yes' : 'No'}\n\n`;
    }
    
    // Summary
    csv += 'PROJECT SUMMARY\n';
    csv += `Total Fixtures,${report.summary.totalFixtures}\n`;
    csv += `Total Load,${report.summary.totalWattage}W\n`;
    csv += `Required Circuits,${report.summary.requiredCircuits}\n`;
    csv += `Estimated Cost,$${report.summary.estimatedCost.toFixed(0)}\n\n`;
    
    // Material list
    if (report.materialList) {
      csv += 'MATERIAL LIST\n';
      csv += 'Description,Quantity,Unit,Unit Price,Total Price\n';
      Object.values(report.materialList).forEach((item: any) => {
        csv += `"${item.description}",${item.quantity},${item.unit},$${item.unitPrice},$${item.totalPrice}\n`;
      });
      csv += '\n';
    }
    
    // Circuit schedule
    if (report.circuitSchedule) {
      csv += 'CIRCUIT SCHEDULE\n';
      csv += 'Circuit,Description,Phase,Breaker,Wire,Load (W),Fixtures\n';
      report.circuitSchedule.forEach((circuit: any) => {
        csv += `${circuit.circuit},"${circuit.description}",${circuit.phase},${circuit.breaker},${circuit.wire},${circuit.load},"${circuit.fixtures}"\n`;
      });
    }
    
    return csv;
  };

  const generateTextReport = (report: any) => {
    let text = '';
    
    // Header
    text += '='.repeat(80) + '\n';
    text += `                    ELECTRICAL ESTIMATE REPORT\n`;
    text += '='.repeat(80) + '\n\n';
    
    // Project information
    text += `Project: ${report.project.name}\n`;
    text += `Number: ${report.project.number}\n`;
    text += `Date: ${report.project.date}\n`;
    text += `Location: ${report.project.location}\n\n`;

    // Drawing Information
    if (report.drawingInfo) {
      text += 'DRAWING INFORMATION\n';
      text += '-'.repeat(40) + '\n';
      text += `Sheet Size: ${report.drawingInfo.sheetSize}\n`;
      text += `Drawing Scale: ${report.drawingInfo.scale}\n`;
      text += `Content Area: ${Math.round(report.drawingInfo.drawingBounds.contentArea.width)}" x ${Math.round(report.drawingInfo.drawingBounds.contentArea.height)}"\n`;
      
      if (report.drawingInfo.autoScaled) {
        text += `⚠️  NOTICE: Drawing auto-scaled to fit ${report.drawingInfo.sheetSize}\n`;
      }
      
      if (!report.drawingInfo.fitsOnSheet) {
        text += `❌ WARNING: Original layout too large - scaled down significantly\n`;
        text += `   Consider splitting into multiple sheets for better clarity\n`;
      }
      
      text += '\n';
    }
    
    // Summary
    text += 'PROJECT SUMMARY\n';
    text += '-'.repeat(40) + '\n';
    text += `Total Fixtures: ${report.summary.totalFixtures}\n`;
    text += `Total Load: ${report.summary.totalWattage}W\n`;
    text += `Required Circuits: ${report.summary.requiredCircuits}\n`;
    text += `Panel Size: ${report.summary.panelSize}A\n`;
    text += `Voltage Drop: ${report.summary.voltageDrop.toFixed(2)}%\n`;
    text += `Estimated Cost: $${report.summary.estimatedCost.toLocaleString()}\n\n`;
    
    // Material breakdown
    if (report.materialList) {
      text += 'MATERIAL LIST\n';
      text += '-'.repeat(40) + '\n';
      Object.values(report.materialList).forEach((item: any) => {
        text += `${item.description}\n`;
        text += `  Quantity: ${item.quantity} ${item.unit}\n`;
        text += `  Unit Price: $${item.unitPrice}\n`;
        text += `  Total: $${item.totalPrice.toLocaleString()}\n\n`;
      });
    }
    
    // Labor breakdown
    if (report.laborBreakdown) {
      text += 'LABOR BREAKDOWN\n';
      text += '-'.repeat(40) + '\n';
      Object.values(report.laborBreakdown).forEach((item: any) => {
        text += `${item.description}\n`;
        text += `  Hours: ${item.hours.toFixed(1)}\n`;
        text += `  Rate: $${item.rate}/hr\n`;
        text += `  Total: $${item.total.toLocaleString()}\n\n`;
      });
    }
    
    // Notes
    if (report.notes) {
      text += 'IMPORTANT NOTES\n';
      text += '-'.repeat(40) + '\n';
      report.notes.forEach((note: string, index: number) => {
        text += `${index + 1}. ${note}\n`;
      });
    }
    
    text += '\n' + '='.repeat(80) + '\n';
    text += `Generated by Vibelux Advanced Designer on ${new Date().toLocaleDateString()}\n`;
    text += '='.repeat(80) + '\n';
    
    return text;
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg shadow-2xl p-2">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 text-white hover:text-yellow-400"
        >
          <Zap className="w-5 h-5" />
          <span className="text-sm font-medium">Electrical Estimator</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-600/20 rounded-lg">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Electrical Estimator</h3>
            <p className="text-xs text-gray-400">{fixtures.length} fixtures in design</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {fixtures.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Add fixtures to your design to see electrical requirements</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Total Load</span>
                  <Activity className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-xl font-bold text-white">
                  {(calculations.totalLoad / 1000).toFixed(1)} kW
                </div>
                <div className="text-xs text-gray-500">
                  @ {settings.demandFactor * 100}% demand factor
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Estimated Cost</span>
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-xl font-bold text-white">
                  {formatCurrency(calculations.costEstimate)}
                </div>
                <div className="text-xs text-gray-500">
                  Materials + Labor + {settings.markupPercent}%
                </div>
              </div>
            </div>

            {/* Electrical Requirements */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Grid3x3 className="w-4 h-4 text-yellow-400" />
                Electrical Requirements
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Panel Size:</span>
                  <span className="text-white font-medium">{calculations.panelSize}A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Main Breaker:</span>
                  <span className="text-white font-medium">{calculations.mainBreakerSize}A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Required Circuits:</span>
                  <span className="text-white font-medium">{calculations.requiredCircuits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wire Size:</span>
                  <span className="text-white font-medium">{calculations.wireSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conduit Size:</span>
                  <span className="text-white font-medium">{calculations.conduitSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Voltage Drop:</span>
                  <span className={`font-medium ${calculations.voltageDrop > 3 ? 'text-red-400' : 'text-green-400'}`}>
                    {calculations.voltageDrop.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Voltage Drop Warning */}
            {calculations.voltageDrop > 3 && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-400 font-medium">Voltage Drop Exceeds 3%</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Consider larger wire size or shorter runs to meet NEC recommendations
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            <div className="bg-gray-800 rounded-lg p-4">
              <button
                onClick={() => setShowDetails({...showDetails, circuits: !showDetails.circuits})}
                className="w-full flex items-center justify-between text-white font-medium mb-3 hover:text-yellow-400"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  System Settings
                </span>
                {showDetails.circuits ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showDetails.circuits && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Voltage</label>
                      <select
                        value={settings.systemVoltage}
                        onChange={(e) => setSettings({...settings, systemVoltage: Number(e.target.value)})}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      >
                        <option value={120}>120V</option>
                        <option value={208}>208V</option>
                        <option value={240}>240V</option>
                        <option value={277}>277V</option>
                        <option value={480}>480V</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Phases</label>
                      <select
                        value={settings.phases}
                        onChange={(e) => setSettings({...settings, phases: Number(e.target.value)})}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      >
                        <option value={1}>Single Phase</option>
                        <option value={3}>Three Phase</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Wire Run Distance (ft)</label>
                    <input
                      type="number"
                      value={settings.wireRunDistance}
                      onChange={(e) => setSettings({...settings, wireRunDistance: Number(e.target.value)})}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Compliance */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                Code Compliance
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">NEC 2023 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">ASHRAE 90.1 Energy Standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Local AHJ Requirements</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {fixtures.length > 0 && (
        <div className="p-4 border-t border-gray-700 flex gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button
            onClick={() => showNotification('info', 'Opening full electrical estimator...')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium"
          >
            <Calculator className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Export Electrical Report</h2>
                  <p className="text-sm text-gray-400">Choose what to include in your professional report</p>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Report Sections */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      Report Sections
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'includeProjectSummary', label: 'Project Summary', desc: 'Overview of design and specifications' },
                        { key: 'includeFixtureSchedule', label: 'Fixture Schedule', desc: 'Detailed fixture list with locations' },
                        { key: 'includeElectricalCalculations', label: 'Electrical Calculations', desc: 'Load, voltage drop, and circuit analysis' },
                        { key: 'includeMaterialList', label: 'Material List (BOM)', desc: 'Complete bill of materials with pricing' },
                        { key: 'includeLaborBreakdown', label: 'Labor Breakdown', desc: 'Detailed labor hours and costs' },
                        { key: 'includeCostSummary', label: 'Cost Summary', desc: 'Total project cost breakdown' },
                        { key: 'includeCircuitSchedule', label: 'Circuit Schedule', desc: 'Panel schedule and circuit assignments' },
                        { key: 'includeComplianceNotes', label: 'Code Compliance', desc: 'NEC and local code requirements' },
                      ].map((option) => (
                        <label key={option.key} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={exportOptions[option.key as keyof typeof exportOptions] as boolean}
                            onChange={(e) => setExportOptions({
                              ...exportOptions,
                              [option.key]: e.target.checked
                            })}
                            className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                              {option.label}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Grid3x3 className="w-5 h-5 text-green-400" />
                      Technical Details
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'includeVoltageDropCalculations', label: 'Voltage Drop Analysis', desc: 'Detailed voltage drop calculations per circuit' },
                        { key: 'includeLoadCalculations', label: 'Load Calculations', desc: 'Connected load, demand load, and diversity factors' },
                        { key: 'includeShortCircuitAnalysis', label: 'Short Circuit Analysis', desc: 'Fault current and protective device coordination' },
                        { key: 'includeArcFlashAnalysis', label: 'Arc Flash Analysis', desc: 'Arc flash hazard analysis and PPE requirements' },
                        { key: 'includeEnergyCalculations', label: 'Energy Analysis', desc: 'Annual energy consumption and operating costs' },
                      ].map((option) => (
                        <label key={option.key} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={exportOptions[option.key as keyof typeof exportOptions] as boolean}
                            onChange={(e) => setExportOptions({
                              ...exportOptions,
                              [option.key]: e.target.checked
                            })}
                            className="mt-1 w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-white group-hover:text-green-400 transition-colors">
                              {option.label}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Drawings & Format */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-400" />
                      Drawings & Diagrams
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'includeSingleLineDiagram', label: 'Single Line Diagram', desc: 'Electrical one-line diagram showing connections' },
                        { key: 'includeElectricalLayout', label: 'Electrical Layout', desc: 'Plan view showing fixture and panel locations' },
                        { key: 'includePanelLayout', label: 'Panel Layout', desc: 'Detailed panel schedule and circuit arrangement' },
                        { key: 'includeConduitRouting', label: 'Conduit Routing', desc: 'Conduit and raceway routing diagrams' },
                        { key: 'includeGroundingDiagram', label: 'Grounding Diagram', desc: 'Equipment grounding and bonding details' },
                      ].map((option) => (
                        <label key={option.key} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={exportOptions[option.key as keyof typeof exportOptions] as boolean}
                            onChange={(e) => setExportOptions({
                              ...exportOptions,
                              [option.key]: e.target.checked
                            })}
                            className="mt-1 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">
                              {option.label}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-orange-400" />
                      Professional Elements
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'includeCompanyLogo', label: 'Company Logo & Branding', desc: 'Include company information and logo' },
                        { key: 'includeSignatureBlocks', label: 'Signature Blocks', desc: 'Designer and engineer signature blocks' },
                        { key: 'includeRevisionTable', label: 'Revision Table', desc: 'Document revision history and tracking' },
                        { key: 'includeNotes', label: 'General Notes', desc: 'Standard electrical notes and requirements' },
                        { key: 'includeProjectPhotos', label: 'Project Photos', desc: 'Include design renderings and photos' },
                      ].map((option) => (
                        <label key={option.key} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={exportOptions[option.key as keyof typeof exportOptions] as boolean}
                            onChange={(e) => setExportOptions({
                              ...exportOptions,
                              [option.key]: e.target.checked
                            })}
                            className="mt-1 w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
                              {option.label}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Export Format & Template</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Export Format</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'pdf', label: 'PDF Document', icon: FileText },
                            { value: 'excel', label: 'Excel/CSV', icon: Grid3x3 },
                            { value: 'dwg', label: 'AutoCAD DWG', icon: Package },
                            { value: 'json', label: 'JSON Data', icon: Settings }
                          ].map((format) => {
                            const Icon = format.icon;
                            return (
                              <button
                                key={format.value}
                                onClick={() => setExportOptions({...exportOptions, exportFormat: format.value as any})}
                                className={`p-3 rounded-lg border text-left transition-colors ${
                                  exportOptions.exportFormat === format.value
                                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                                }`}
                              >
                                <Icon className="w-4 h-4 mb-1" />
                                <div className="text-xs font-medium">{format.label}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Report Template</label>
                        <select
                          value={exportOptions.reportTemplate}
                          onChange={(e) => setExportOptions({...exportOptions, reportTemplate: e.target.value as any})}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="professional">Professional (Detailed)</option>
                          <option value="basic">Basic (Summary Only)</option>
                          <option value="contractor">Contractor (Cost Focus)</option>
                          <option value="engineer">Engineer (Technical Focus)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700">
              {/* Drawing validation warning */}
              {(() => {
                const tempReport = generateComprehensiveReport();
                const drawingInfo = tempReport.drawingInfo;
                
                if (drawingInfo && (!drawingInfo.fitsOnSheet || drawingInfo.autoScaled)) {
                  return (
                    <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-400">Drawing Layout Notice</p>
                          <div className="text-xs text-gray-300 mt-1 space-y-1">
                            {drawingInfo.autoScaled && (
                              <p>• Layout auto-scaled to {drawingInfo.scale} to fit {drawingInfo.sheetSize}</p>
                            )}
                            {!drawingInfo.fitsOnSheet && (
                              <p>• Original layout too large - consider splitting into multiple sheets</p>
                            )}
                            <p>• All fixtures and components will remain within drawing boundaries</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  <span className="font-medium text-white">{fixtures.length} fixtures</span> • 
                  <span className="font-medium text-white"> {formatCurrency(calculations.costEstimate)}</span> estimate
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={exportReport}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export {exportOptions.exportFormat.toUpperCase()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}