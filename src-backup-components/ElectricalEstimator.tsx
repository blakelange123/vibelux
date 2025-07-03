'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator,
  Zap, 
  DollarSign,
  AlertTriangle, 
  Info, 
  FileText,
  Download,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Map,
  Grid3x3,
  Shield,
  Package
} from 'lucide-react';
import { ElectricalDiagramGenerator } from './ElectricalDiagramGenerator';
import { PanelScheduleGenerator, createSamplePanel } from './PanelScheduleGenerator';
import { ProfessionalSingleLineGenerator, createSingleLineData } from './ProfessionalSingleLineGenerator';
import { VoltageDropCalculator } from './VoltageDropCalculator';
import { GroundingSystemCalculator } from './GroundingSystemCalculator';
import { BillOfMaterialsGenerator } from './BillOfMaterialsGenerator';
import { ShortCircuitAnalysisCalculator } from './ShortCircuitAnalysisCalculator';

interface EstimatorInputs {
  projectName: string;
  fixtures: Array<{
    id: string;
    model: string;
    wattage: number;
    quantity: number;
    voltage: number;
    enabled: boolean;
  }>;
  systemVoltage: number;
  phases: number;
  wireRunDistance: number;
  laborRate: number;
  markupPercent: number;
  permitRequired: boolean;
  inspectionRequired: boolean;
  location: string; // for local code requirements
  
  // Enhanced project parameters
  zipCode: string; // for local labor rate lookup
  ceilingHeight: number; // affects installation difficulty
  projectType: 'new-construction' | 'retrofit' | 'expansion';
  accessDifficulty: 'easy' | 'moderate' | 'difficult';
  projectDuration: number; // estimated days
  crewSize: number; // number of electricians
  requiresCommissioning: boolean;
  requiresTraining: boolean;
}

interface MaterialCosts {
  wire: number;
  conduit: number;
  breakers: number;
  panel: number;
  connectors: number;
  misc: number;
  total: number;
}

interface LaborCosts {
  installation: number;
  wiring: number;
  termination: number;
  testing: number;
  cleanup: number;
  commissioning: number;
  projectManagement: number;
  safetyAndDocumentation: number;
  total: number;
}

interface EstimateResults {
  materials: MaterialCosts;
  labor: LaborCosts;
  permits: number;
  subtotal: number;
  markup: number;
  tax: number;
  total: number;
  circuits: Array<{
    id: string;
    breaker: string;
    wire: string;
    conduit: string;
    cost: number;
  }>;
  compliance: {
    necCompliant: boolean;
    issues: string[];
    recommendations: string[];
  };
}

export function ElectricalEstimator() {
  const [inputs, setInputs] = useState<EstimatorInputs>({
    projectName: 'Grow Room Lighting Project',
    fixtures: [
      { id: '1', model: 'LED-1000W', wattage: 1000, quantity: 10, voltage: 277, enabled: true },
      { id: '2', model: 'LED-650W', wattage: 650, quantity: 8, voltage: 277, enabled: true }
    ],
    systemVoltage: 277,
    phases: 3,
    wireRunDistance: 100,
    laborRate: 85,
    markupPercent: 20,
    permitRequired: true,
    inspectionRequired: true,
    location: 'California',
    
    // Enhanced parameters with defaults
    zipCode: '90210',
    ceilingHeight: 12,
    projectType: 'new-construction',
    accessDifficulty: 'moderate',
    projectDuration: 3,
    crewSize: 2,
    requiresCommissioning: true,
    requiresTraining: false
  });

  const [estimate, setEstimate] = useState<EstimateResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [showPanelSchedule, setShowPanelSchedule] = useState(false);
  const [showSingleLine, setShowSingleLine] = useState(false);
  const [showVoltageDrop, setShowVoltageDrop] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showBOM, setShowBOM] = useState(false);
  const [showShortCircuit, setShowShortCircuit] = useState(false);

  // Material pricing database
  const materialPrices = {
    wire: {
      '12_THHN': 1.85, // per foot
      '10_THHN': 2.95,
      '8_THHN': 4.75,
      '6_THHN': 7.25,
      '4_THHN': 11.50,
      '2_THHN': 18.25,
      '1_THHN': 23.50,
      '1/0_THHN': 29.75,
      '2/0_THHN': 37.50,
      '3/0_THHN': 47.25,
      '4/0_THHN': 59.50
    },
    conduit: {
      '1/2_EMT': 2.85, // per foot
      '3/4_EMT': 3.95,
      '1_EMT': 5.25,
      '1.25_EMT': 7.50,
      '1.5_EMT': 9.75,
      '2_EMT': 13.25,
      '2.5_EMT': 18.50,
      '3_EMT': 24.75,
      '4_EMT': 35.50
    },
    breakers: {
      '15A_1P': 45,
      '20A_1P': 48,
      '30A_1P': 65,
      '40A_1P': 85,
      '50A_1P': 125,
      '20A_3P': 195,
      '30A_3P': 225,
      '40A_3P': 285,
      '50A_3P': 365,
      '60A_3P': 425,
      '100A_3P': 675
    },
    panels: {
      '200A_42SP_3P': 850,
      '400A_42SP_3P': 1250,
      '200A_30SP_1P': 650,
      '100A_20SP_1P': 385
    }
  };

  // Labor time estimates (hours) - comprehensive breakdown
  const laborTimes = {
    // Installation activities
    fixtureInstall: 0.75, // per fixture (includes mounting, connection)
    circuitRun: 0.15, // per foot (includes pulling wire, conduit install)
    panelTermination: 1.5, // per circuit (includes labeling)
    testing: 0.5, // per circuit (includes voltage/continuity testing)
    panelInstall: 8, // per panel (includes mounting, main connections)
    
    // Project management & admin
    permitApplication: 2, // permit paperwork
    inspectionPrep: 4, // prep for inspection
    projectMobilization: 4, // initial site setup, tool staging
    finalCleanup: 0.1, // per fixture (cleanup materials, sweep area)
    commissioning: 0.25, // per fixture (final testing, documentation)
    
    // Additional factors
    highCeilingFactor: 1.3, // multiplier for ceilings >12ft
    retrofitFactor: 1.2, // multiplier for retrofit vs new construction
    accessDifficultyFactor: 1.15, // multiplier for difficult access areas
    
    // Safety & documentation
    safetyMeeting: 1, // daily safety meetings
    asBuiltDocumentation: 2, // creating as-built drawings
    customerTraining: 1, // basic system operation training
  };

  const calculateEstimate = (): EstimateResults => {
    const totalLoad = inputs.fixtures
      .filter(f => f.enabled)
      .reduce((sum, f) => sum + (f.wattage * f.quantity), 0);

    const totalFixtures = inputs.fixtures
      .filter(f => f.enabled)
      .reduce((sum, f) => sum + f.quantity, 0);

    // Circuit calculations
    const circuits = calculateCircuits();
    
    // Material costs
    const materials = calculateMaterialCosts(circuits, totalFixtures);
    
    // Labor costs
    const labor = calculateLaborCosts(circuits, totalFixtures);
    
    // Permits and fees
    const permits = inputs.permitRequired ? calculatePermitCosts(totalLoad) : 0;
    
    // Totals
    const subtotal = materials.total + labor.total + permits;
    const markup = subtotal * (inputs.markupPercent / 100);
    const tax = (subtotal + markup) * 0.0875; // Approximate sales tax
    const total = subtotal + markup + tax;

    // Compliance check
    const compliance = checkCompliance(circuits, totalLoad);

    return {
      materials,
      labor,
      permits,
      subtotal,
      markup,
      tax,
      total,
      circuits,
      compliance
    };
  };

  const calculateCircuits = () => {
    const circuits: Array<{
      id: string;
      breaker: string;
      wire: string;
      conduit: string;
      cost: number;
    }> = [];

    let circuitIndex = 1;
    const enabledFixtures = inputs.fixtures.filter(f => f.enabled);

    enabledFixtures.forEach(fixtureType => {
      const fixturesPerCircuit = Math.floor((inputs.systemVoltage * 20 * 0.8) / fixtureType.wattage);
      const circuitsNeeded = Math.ceil(fixtureType.quantity / fixturesPerCircuit);

      for (let i = 0; i < circuitsNeeded; i++) {
        const fixturesOnCircuit = Math.min(
          fixturesPerCircuit,
          fixtureType.quantity - (i * fixturesPerCircuit)
        );
        
        const circuitLoad = fixturesOnCircuit * fixtureType.wattage;
        const current = circuitLoad / inputs.systemVoltage;
        const breakerSize = selectBreakerSize(current);
        const wireSize = selectWireSize(current, inputs.wireRunDistance);
        const conduitSize = selectConduitSize(wireSize);

        circuits.push({
          id: `C${circuitIndex}`,
          breaker: `${breakerSize}A`,
          wire: wireSize,
          conduit: conduitSize,
          cost: 0 // Will be calculated in material costs
        });

        circuitIndex++;
      }
    });

    return circuits;
  };

  const selectBreakerSize = (current: number): number => {
    const sizes = [15, 20, 30, 40, 50, 60];
    const requiredSize = current * 1.25; // 125% for continuous loads
    return sizes.find(size => size >= requiredSize) || 60;
  };

  const selectWireSize = (current: number, distance: number): string => {
    // Include voltage drop calculation
    const maxVoltageDrop = inputs.systemVoltage * 0.03;
    const wireSpecs = [
      { gauge: '12', ampacity: 20, resistance: 1.98 },
      { gauge: '10', ampacity: 30, resistance: 1.24 },
      { gauge: '8', ampacity: 40, resistance: 0.778 },
      { gauge: '6', ampacity: 55, resistance: 0.491 },
      { gauge: '4', ampacity: 70, resistance: 0.308 },
      { gauge: '2', ampacity: 95, resistance: 0.194 },
      { gauge: '1', ampacity: 110, resistance: 0.154 }
    ];

    for (const wire of wireSpecs) {
      if (wire.ampacity >= current * 1.25) {
        const voltageDrop = (2 * distance * wire.resistance * current) / 1000;
        if (voltageDrop <= maxVoltageDrop) {
          return `#${wire.gauge} THHN`;
        }
      }
    }
    return '#2 THHN';
  };

  const selectConduitSize = (wireSize: string): string => {
    const conduitMap: Record<string, string> = {
      '#12 THHN': '1/2" EMT',
      '#10 THHN': '1/2" EMT',
      '#8 THHN': '3/4" EMT',
      '#6 THHN': '3/4" EMT',
      '#4 THHN': '1" EMT',
      '#2 THHN': '1.25" EMT',
      '#1 THHN': '1.5" EMT'
    };
    return conduitMap[wireSize] || '1" EMT';
  };

  const calculateMaterialCosts = (circuits: any[], totalFixtures: number): MaterialCosts => {
    let wire = 0;
    let conduit = 0;
    let breakers = 0;
    let connectors = 0;

    circuits.forEach(circuit => {
      // Wire cost
      const wireKey = circuit.wire.replace('#', '').replace(' THHN', '_THHN');
      wire += (materialPrices.wire[wireKey as keyof typeof materialPrices.wire] || 5) * inputs.wireRunDistance;

      // Conduit cost
      const conduitKey = circuit.conduit.replace('"', '').replace(' EMT', '_EMT');
      conduit += (materialPrices.conduit[conduitKey as keyof typeof materialPrices.conduit] || 8) * inputs.wireRunDistance;

      // Breaker cost
      const breakerType = inputs.phases === 3 ? '3P' : '1P';
      const breakerKey = `${circuit.breaker}_${breakerType}`;
      breakers += materialPrices.breakers[breakerKey as keyof typeof materialPrices.breakers] || 150;
    });

    // Panel cost
    const panelType = inputs.phases === 3 ? '200A_42SP_3P' : '200A_30SP_1P';
    const panel = materialPrices.panels[panelType as keyof typeof materialPrices.panels];

    // Connectors and misc
    connectors = totalFixtures * 15; // Whips, connectors, etc.
    const misc = (wire + conduit + breakers + panel + connectors) * 0.15; // 15% misc

    const total = wire + conduit + breakers + panel + connectors + misc;

    return { wire, conduit, breakers, panel, connectors, misc, total };
  };

  // Regional labor rate lookup ($/hour for licensed electricians)
  const getRegionalLaborRate = (zipCode: string): number => {
    const zipPrefix = zipCode.substring(0, 3);
    const regionalRates: Record<string, number> = {
      // California
      '900': 95, '901': 98, '902': 92, '903': 88, '904': 85, '905': 89, '906': 82, '907': 79, '908': 86, '909': 83,
      '910': 88, '911': 91, '912': 89, '913': 86, '914': 84, '915': 87, '916': 89, '917': 92, '918': 88, '919': 85,
      '920': 94, '921': 97, '922': 95, '923': 89, '924': 91, '925': 93, '926': 90, '927': 87, '928': 84, '929': 86,
      '930': 88, '931': 85, '932': 87, '933': 89, '934': 91, '935': 93, '936': 95, '937': 82, '938': 79, '939': 81,
      '940': 83, '941': 85, '942': 87, '943': 89, '944': 91, '945': 88, '946': 90, '947': 92, '948': 89, '949': 94,
      '950': 87, '951': 84, '952': 86, '953': 88, '954': 90, '955': 85, '956': 82, '957': 79, '958': 81, '959': 83,
      '960': 88, '961': 90, // Nevada
      // New York
      '100': 125, '101': 128, '102': 122, '103': 118, '104': 115, '105': 118, '106': 122, '107': 125, '108': 119, '109': 116,
      '110': 113, '111': 116, '112': 119, '113': 122, '114': 118, '115': 115, '116': 112, '117': 115, '118': 118, '119': 121,
      '120': 108, '121': 105, '122': 102, '123': 105, '124': 108, '125': 111, '126': 114, '127': 117, '128': 114, '129': 111,
      // Texas
      '750': 72, '751': 69, '752': 66, '753': 69, '754': 72, '755': 75, '756': 78, '757': 75, '758': 72, '759': 69,
      '760': 66, '761': 69, '762': 72, '763': 75, '764': 78, '765': 75, '766': 72, '767': 69, '768': 66, '769': 69,
      '770': 72, '771': 75, '772': 78, '773': 81, '774': 78, '775': 75, '776': 72, '777': 69, '778': 72, '779': 75,
      '780': 78, '781': 81, '782': 84, '783': 81, '784': 78, '785': 75, '786': 72, '787': 69, '788': 72, '789': 75,
      // Florida
      '320': 68, '321': 71, '322': 74, '323': 71, '324': 68, '325': 65, '326': 68, '327': 71, '328': 74, '329': 71,
      '330': 68, '331': 65, '332': 68, '333': 71, '334': 74, '335': 77, '336': 74, '337': 71, '338': 68, '339': 65,
      '340': 68, '341': 71, '342': 74, '343': 77, '344': 80, '345': 77, '346': 74, '347': 71, '348': 68, '349': 65,
      // Illinois
      '600': 95, '601': 98, '602': 95, '603': 92, '604': 89, '605': 86, '606': 89, '607': 92, '608': 95, '609': 98,
      '610': 95, '611': 92, '612': 89, '613': 86, '614': 83, '615': 86, '616': 89, '617': 92, '618': 89, '619': 86,
      '620': 83, '621': 80, '622': 77, '623': 80, '624': 83, '625': 86, '626': 89, '627': 86, '628': 83, '629': 80,
    };
    
    return regionalRates[zipPrefix] || inputs.laborRate; // fallback to user input
  };

  const calculateLaborCosts = (circuits: any[], totalFixtures: number): LaborCosts => {
    // Use regional rate if available, otherwise user input
    const effectiveLaborRate = inputs.laborRate || getRegionalLaborRate(inputs.zipCode);
    
    // Apply difficulty multipliers
    let difficultyMultiplier = 1.0;
    if (inputs.ceilingHeight > 12) difficultyMultiplier *= laborTimes.highCeilingFactor;
    if (inputs.projectType === 'retrofit') difficultyMultiplier *= laborTimes.retrofitFactor;
    if (inputs.accessDifficulty === 'difficult') difficultyMultiplier *= laborTimes.accessDifficultyFactor;
    
    // Base installation costs
    const installation = totalFixtures * laborTimes.fixtureInstall * effectiveLaborRate * difficultyMultiplier;
    const wiring = circuits.length * inputs.wireRunDistance * laborTimes.circuitRun * effectiveLaborRate;
    const termination = circuits.length * laborTimes.panelTermination * effectiveLaborRate;
    const testing = circuits.length * laborTimes.testing * effectiveLaborRate;
    
    // Additional labor costs
    const cleanup = totalFixtures * laborTimes.finalCleanup * effectiveLaborRate;
    const commissioning = inputs.requiresCommissioning ? 
      totalFixtures * laborTimes.commissioning * effectiveLaborRate : 0;
    
    // Project management (scales with project duration and crew size)
    const projectManagement = (
      laborTimes.projectMobilization + 
      (inputs.projectDuration * laborTimes.safetyMeeting) +
      laborTimes.asBuiltDocumentation +
      (inputs.requiresTraining ? laborTimes.customerTraining : 0)
    ) * effectiveLaborRate;
    
    // Safety and documentation
    const safetyAndDocumentation = (
      laborTimes.permitApplication + 
      laborTimes.inspectionPrep
    ) * effectiveLaborRate;
    
    const total = installation + wiring + termination + testing + cleanup + 
                 commissioning + projectManagement + safetyAndDocumentation;
    
    return { 
      installation, 
      wiring, 
      termination, 
      testing, 
      cleanup,
      commissioning,
      projectManagement,
      safetyAndDocumentation,
      total 
    };
  };

  const calculatePermitCosts = (totalLoad: number): number => {
    // Typical permit costs based on load
    const basePermit = 150;
    const perKwFee = (totalLoad / 1000) * 25;
    const inspectionFee = inputs.inspectionRequired ? 200 : 0;
    
    return basePermit + perKwFee + inspectionFee;
  };

  const checkCompliance = (circuits: any[], totalLoad: number) => {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check circuit loading
    circuits.forEach(circuit => {
      const breakerSize = parseInt(circuit.breaker);
      // This is a simplified check - in real implementation, would calculate actual load
      if (breakerSize < 20) {
        issues.push(`Circuit ${circuit.id}: Consider larger breaker size for better safety margin`);
      }
    });

    // Check total load vs service
    if (totalLoad > 100000) {
      recommendations.push('Consider 400A service for loads over 100kW');
    }

    // Check wire sizing
    if (inputs.wireRunDistance > 200) {
      recommendations.push('Long wire runs detected - verify voltage drop calculations');
    }

    return {
      necCompliant: issues.length === 0,
      issues,
      recommendations
    };
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setEstimate(calculateEstimate());
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputs]);

  const updateFixture = (index: number, field: string, value: any) => {
    const updatedFixtures = [...inputs.fixtures];
    updatedFixtures[index] = { ...updatedFixtures[index], [field]: value };
    setInputs({ ...inputs, fixtures: updatedFixtures });
  };

  const addFixture = () => {
    const newFixture = {
      id: Date.now().toString(),
      model: 'New Fixture',
      wattage: 600,
      quantity: 1,
      voltage: inputs.systemVoltage,
      enabled: true
    };
    setInputs({ ...inputs, fixtures: [...inputs.fixtures, newFixture] });
  };

  const removeFixture = (index: number) => {
    const updatedFixtures = inputs.fixtures.filter((_, i) => i !== index);
    setInputs({ ...inputs, fixtures: updatedFixtures });
  };

  const exportEstimate = () => {
    if (!estimate) return;

    const estimateData = {
      projectName: inputs.projectName,
      date: new Date().toLocaleDateString(),
      ...estimate
    };

    const blob = new Blob([JSON.stringify(estimateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `electrical_estimate_${inputs.projectName.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              Electrical Installation Estimator
            </CardTitle>
            <CardDescription className="text-gray-400">
              Complete electrical cost estimation with NEC compliance checking
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Info */}
            <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                    <input
                      type="text"
                      value={inputs.projectName}
                      onChange={(e) => setInputs({ ...inputs, projectName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <select
                      value={inputs.location}
                      onChange={(e) => setInputs({ ...inputs, location: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="California">California</option>
                      <option value="Colorado">Colorado</option>
                      <option value="Oregon">Oregon</option>
                      <option value="Washington">Washington</option>
                      <option value="Nevada">Nevada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">System Voltage</label>
                    <select
                      value={inputs.systemVoltage}
                      onChange={(e) => setInputs({ ...inputs, systemVoltage: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value={120}>120V</option>
                      <option value={208}>208V</option>
                      <option value={240}>240V</option>
                      <option value={277}>277V</option>
                      <option value={480}>480V</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phases</label>
                    <select
                      value={inputs.phases}
                      onChange={(e) => setInputs({ ...inputs, phases: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value={1}>Single Phase</option>
                      <option value={3}>Three Phase</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Wire Run Distance (ft)</label>
                    <input
                      type="number"
                      value={inputs.wireRunDistance}
                      onChange={(e) => setInputs({ ...inputs, wireRunDistance: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Labor Rate ($/hr)</label>
                    <input
                      type="number"
                      value={inputs.laborRate}
                      onChange={(e) => setInputs({ ...inputs, laborRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Markup %</label>
                    <input
                      type="number"
                      value={inputs.markupPercent}
                      onChange={(e) => setInputs({ ...inputs, markupPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-4 pt-6">
                    <label className="flex items-center text-gray-300">
                      <input
                        type="checkbox"
                        checked={inputs.permitRequired}
                        onChange={(e) => setInputs({ ...inputs, permitRequired: e.target.checked })}
                        className="mr-2"
                      />
                      Permit Required
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fixtures */}
            <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Fixture Schedule</CardTitle>
                  <button
                    onClick={addFixture}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Add Fixture
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inputs.fixtures.map((fixture, index) => (
                    <div key={fixture.id} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={fixture.enabled}
                        onChange={(e) => updateFixture(index, 'enabled', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        value={fixture.model}
                        onChange={(e) => updateFixture(index, 'model', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        placeholder="Fixture Model"
                      />
                      <input
                        type="number"
                        value={fixture.wattage}
                        onChange={(e) => updateFixture(index, 'wattage', Number(e.target.value))}
                        className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        placeholder="Watts"
                      />
                      <input
                        type="number"
                        value={fixture.quantity}
                        onChange={(e) => updateFixture(index, 'quantity', Number(e.target.value))}
                        className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        placeholder="Qty"
                      />
                      <button
                        onClick={() => removeFixture(index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {loading ? (
              <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
                <CardContent className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Calculating estimate...</p>
                </CardContent>
              </Card>
            ) : estimate && (
              <>
                {/* Cost Summary */}
                <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      Cost Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-300">
                        <span>Materials:</span>
                        <span>${estimate.materials.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Labor:</span>
                        <span>${estimate.labor.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Permits:</span>
                        <span>${estimate.permits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-300 border-t border-gray-700 pt-3">
                        <span>Subtotal:</span>
                        <span>${estimate.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Markup ({inputs.markupPercent}%):</span>
                        <span>${estimate.markup.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Tax:</span>
                        <span>${estimate.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-white font-bold text-lg border-t border-gray-700 pt-3">
                        <span>Total:</span>
                        <span>${estimate.total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={exportEstimate}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Export Estimate
                      </button>
                      
                      <button
                        onClick={() => setShowDiagrams(!showDiagrams)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                      >
                        <Map className="w-4 h-4" />
                        {showDiagrams ? 'Hide' : 'Show'} Diagrams
                      </button>
                      
                      <button
                        onClick={() => setShowPanelSchedule(!showPanelSchedule)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                      >
                        <Grid3x3 className="w-4 h-4" />
                        {showPanelSchedule ? 'Hide' : 'Show'} Panel Schedule
                      </button>
                      
                      <button
                        onClick={() => setShowSingleLine(!showSingleLine)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
                      >
                        <Activity className="w-4 h-4" />
                        {showSingleLine ? 'Hide' : 'Show'} Professional Single Line
                      </button>
                      
                      <button
                        onClick={() => setShowVoltageDrop(!showVoltageDrop)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-medium transition-colors"
                      >
                        <TrendingDown className="w-4 h-4" />
                        {showVoltageDrop ? 'Hide' : 'Show'} Voltage Drop Calculator
                      </button>
                      
                      <button
                        onClick={() => setShowGrounding(!showGrounding)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        {showGrounding ? 'Hide' : 'Show'} Grounding System
                      </button>
                      
                      <button
                        onClick={() => setShowBOM(!showBOM)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        {showBOM ? 'Hide' : 'Show'} Bill of Materials
                      </button>
                      
                      <button
                        onClick={() => setShowShortCircuit(!showShortCircuit)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                        {showShortCircuit ? 'Hide' : 'Show'} Short Circuit Analysis
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Circuit Summary */}
                <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Circuit Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {estimate.circuits.slice(0, 5).map(circuit => (
                        <div key={circuit.id} className="flex justify-between text-sm">
                          <span className="text-gray-300">{circuit.id}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{circuit.breaker}</Badge>
                            <Badge variant="outline" className="text-xs">{circuit.wire}</Badge>
                          </div>
                        </div>
                      ))}
                      {estimate.circuits.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{estimate.circuits.length - 5} more circuits
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance */}
                <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      {estimate.compliance.necCompliant ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      )}
                      NEC Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={estimate.compliance.necCompliant ? "default" : "destructive"}>
                          {estimate.compliance.necCompliant ? "Compliant" : "Issues Found"}
                        </Badge>
                      </div>
                      
                      {estimate.compliance.issues.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Issues</AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc list-inside text-xs space-y-1">
                              {estimate.compliance.issues.map((issue, i) => (
                                <li key={i}>{issue}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      {estimate.compliance.recommendations.length > 0 && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Recommendations</AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc list-inside text-xs space-y-1">
                              {estimate.compliance.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Electrical Diagrams */}
        {showDiagrams && estimate && (
          <div className="mt-8">
            <ElectricalDiagramGenerator
              roomWidth={40}
              roomLength={30}
              fixtures={inputs.fixtures.filter(f => f.enabled).flatMap((fixture, fixtureIndex) => 
                Array.from({ length: fixture.quantity }, (_, i) => ({
                  id: `${fixture.id}-${i + 1}`,
                  x: 5 + (fixtureIndex * 8) + (i * 2),
                  y: 5 + (Math.floor(i / 5) * 5),
                  wattage: fixture.wattage,
                  model: fixture.model,
                  circuitId: estimate.circuits[Math.floor((fixtureIndex * fixture.quantity + i) / 6)]?.id || 'C1'
                }))
              )}
              circuits={estimate.circuits.map((circuit, index) => ({
                id: circuit.id,
                voltage: inputs.systemVoltage,
                amperage: parseInt(circuit.breaker),
                wireGauge: circuit.wire.replace('#', '').replace(' THHN', ''),
                fixtures: [],
                color: `hsl(${index * 60}, 70%, 50%)`,
                panelConnection: { x: 2, y: 2 }
              }))}
              panelLocation={{ x: 2, y: 2 }}
              projectName={inputs.projectName}
            />
          </div>
        )}

        {/* Panel Schedule */}
        {showPanelSchedule && estimate && (
          <div className="mt-8">
            <PanelScheduleGenerator
              panels={[
                (() => {
                  // Create fixtures with equipment data
                  const fixturesWithEquipment = inputs.fixtures.filter(f => f.enabled).flatMap((fixture, fixtureIndex) => 
                    Array.from({ length: fixture.quantity }, (_, i) => ({
                      id: `${fixture.id}-${i + 1}`,
                      x: 5 + (fixtureIndex * 8) + (i * 2),
                      y: 5 + (Math.floor(i / 5) * 5),
                      wattage: fixture.wattage,
                      model: fixture.model,
                      area: 'General',
                      circuitId: estimate.circuits[Math.floor((fixtureIndex * fixture.quantity + i) / 6)]?.id || 'C1'
                    }))
                  );

                  // Create panel with circuits and equipment
                  const panel = createSamplePanel(
                    'LP-1',
                    'lighting',
                    parseInt(estimate.circuits[0]?.breaker || '225A'),
                    42, // Standard 42-space panel
                    fixturesWithEquipment
                  );

                  // Update panel circuits with actual estimate data
                  panel.circuits = estimate.circuits.map((circuit, index) => {
                    const circuitFixtures = fixturesWithEquipment.filter(f => f.circuitId === circuit.id);
                    return {
                      id: circuit.id,
                      position: index + 1,
                      phase: index % 3 === 0 ? 'A' : index % 3 === 1 ? 'B' : 'C',
                      amperage: parseInt(circuit.breaker),
                      voltage: inputs.systemVoltage,
                      description: `Lighting Circuit ${index + 1}`,
                      load: circuitFixtures.reduce((sum, f) => sum + f.wattage, 0),
                      wireSize: circuit.wire,
                      conduitSize: circuit.conduit,
                      length: inputs.wireRunDistance || 50,
                      equipment: circuitFixtures.map(f => ({
                        id: f.id,
                        name: f.model || 'LED Fixture',
                        type: 'fixture' as const,
                        wattage: f.wattage,
                        voltage: inputs.systemVoltage,
                        phase: 1,
                        powerFactor: 0.95,
                        x: f.x,
                        y: f.y
                      }))
                    };
                  });

                  return panel;
                })()
              ]}
              projectName={inputs.projectName}
              showEquipmentConnections={true}
              showLoadCalculations={true}
            />
          </div>
        )}

        {/* Professional Single Line Diagram */}
        {showSingleLine && estimate && (
          <div className="mt-8">
            <ProfessionalSingleLineGenerator
              data={(() => {
                // Create panels array
                const panels = [{
                  name: 'LP-1',
                  type: 'lighting',
                  voltage: inputs.systemVoltage,
                  phases: 3,
                  amperage: parseInt(estimate.circuits[0]?.breaker || '225'),
                  spaces: 42
                }];

                // Create loads array
                const loads = inputs.fixtures.filter(f => f.enabled).map(fixture => ({
                  panel: 'LP-1',
                  name: fixture.model,
                  type: 'lighting' as const,
                  wattage: fixture.wattage * fixture.quantity,
                  voltage: inputs.systemVoltage === 208 ? 120 : 277
                }));

                // Create single line data
                return createSingleLineData(inputs.projectName, panels, loads);
              })()}
              showCalculations={true}
              showFaultCurrents={true}
              showVoltageDrops={true}
            />
          </div>
        )}

        {/* Voltage Drop Calculator */}
        {showVoltageDrop && (
          <div className="mt-8">
            <VoltageDropCalculator />
          </div>
        )}

        {/* Grounding System Calculator */}
        {showGrounding && (
          <div className="mt-8">
            <GroundingSystemCalculator />
          </div>
        )}

        {/* Bill of Materials Generator */}
        {showBOM && (
          <div className="mt-8">
            <BillOfMaterialsGenerator />
          </div>
        )}

        {/* Short Circuit Analysis Calculator */}
        {showShortCircuit && (
          <div className="mt-8">
            <ShortCircuitAnalysisCalculator />
          </div>
        )}
      </div>
    </div>
  );
}