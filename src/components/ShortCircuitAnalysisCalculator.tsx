'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  AlertTriangle, 
  Shield,
  Activity,
  FileText,
  Download,
  Info,
  Calculator
} from 'lucide-react';

interface TransformerData {
  kva: number;
  primaryVoltage: number;
  secondaryVoltage: number;
  impedancePercent: number;
  xrRatio: number;
}

interface CableData {
  size: string;
  length: number; // feet
  conduitType: 'steel' | 'pvc' | 'aluminum';
  conductorMaterial: 'copper' | 'aluminum';
  numberOfConductors: number;
  parallelRuns: number;
}

interface MotorContribution {
  hp: number;
  voltage: number;
  quantity: number;
  powerFactor: number;
  subtransient: number; // X"d in per unit
}

interface ShortCircuitInputs {
  sourceType: 'utility' | 'transformer' | 'generator';
  systemVoltage: number;
  phases: '1' | '3';
  
  // Utility source
  utilityFaultCurrent: number; // kA
  utilityXR: number;
  
  // Transformer source
  transformer?: TransformerData;
  
  // Cable impedance
  cable: CableData;
  
  // Motor contributions
  includeMotorContribution: boolean;
  motors: MotorContribution[];
  
  // System grounding
  groundingType: 'solidly' | 'resistance' | 'ungrounded';
  groundingResistance?: number; // ohms
  
  // Calculation parameters
  cFactor: number; // Multiplying factor from NEC
  calculationType: 'maximum' | 'minimum';
}

interface FaultResults {
  symmetricalFault: {
    threePhaseFault: number; // kA
    lineToLineFault: number; // kA
    lineToGroundFault: number; // kA
  };
  asymmetricalFault: {
    threePhasePeak: number; // kA
    xrRatio: number;
    powerFactor: number;
  };
  motorContribution: {
    initial: number; // kA
    interrupting: number; // kA
  };
  totalFaultCurrent: {
    symmetrical: number; // kA RMS
    asymmetrical: number; // kA peak
    interrupting: number; // kA RMS
  };
  arcFlashBoundary: number; // inches
  incidentEnergy: number; // cal/cm²
  ppe: number; // PPE category
  recommendations: string[];
}

// Cable impedance data (ohms per 1000 ft)
const cableImpedanceData: Record<string, { r: number; x: { steel: number; pvc: number; aluminum: number } }> = {
  '12': { r: 1.98, x: { steel: 0.068, pvc: 0.054, aluminum: 0.054 } },
  '10': { r: 1.24, x: { steel: 0.063, pvc: 0.050, aluminum: 0.050 } },
  '8': { r: 0.778, x: { steel: 0.065, pvc: 0.052, aluminum: 0.052 } },
  '6': { r: 0.491, x: { steel: 0.064, pvc: 0.051, aluminum: 0.051 } },
  '4': { r: 0.308, x: { steel: 0.060, pvc: 0.048, aluminum: 0.048 } },
  '3': { r: 0.245, x: { steel: 0.059, pvc: 0.047, aluminum: 0.047 } },
  '2': { r: 0.194, x: { steel: 0.057, pvc: 0.045, aluminum: 0.045 } },
  '1': { r: 0.154, x: { steel: 0.057, pvc: 0.046, aluminum: 0.046 } },
  '1/0': { r: 0.122, x: { steel: 0.055, pvc: 0.044, aluminum: 0.044 } },
  '2/0': { r: 0.0967, x: { steel: 0.054, pvc: 0.043, aluminum: 0.043 } },
  '3/0': { r: 0.0766, x: { steel: 0.052, pvc: 0.042, aluminum: 0.042 } },
  '4/0': { r: 0.0608, x: { steel: 0.051, pvc: 0.041, aluminum: 0.041 } },
  '250': { r: 0.0515, x: { steel: 0.052, pvc: 0.041, aluminum: 0.041 } },
  '300': { r: 0.0429, x: { steel: 0.051, pvc: 0.041, aluminum: 0.041 } },
  '350': { r: 0.0367, x: { steel: 0.050, pvc: 0.040, aluminum: 0.040 } },
  '400': { r: 0.0321, x: { steel: 0.049, pvc: 0.040, aluminum: 0.040 } },
  '500': { r: 0.0258, x: { steel: 0.048, pvc: 0.039, aluminum: 0.039 } },
  '600': { r: 0.0214, x: { steel: 0.048, pvc: 0.039, aluminum: 0.039 } },
  '750': { r: 0.0171, x: { steel: 0.047, pvc: 0.038, aluminum: 0.038 } },
  '1000': { r: 0.0129, x: { steel: 0.046, pvc: 0.037, aluminum: 0.037 } }
};

// C factors from IEEE 1584
const cFactors = {
  '0.5-1 cycle': 1.65,
  '2-4 cycles': 1.5,
  '5-8 cycles': 1.25,
  '0.5 seconds': 1.0
};

export function ShortCircuitAnalysisCalculator() {
  const [inputs, setInputs] = useState<ShortCircuitInputs>({
    sourceType: 'utility',
    systemVoltage: 480,
    phases: '3',
    utilityFaultCurrent: 40,
    utilityXR: 15,
    transformer: {
      kva: 1000,
      primaryVoltage: 12470,
      secondaryVoltage: 480,
      impedancePercent: 5.75,
      xrRatio: 8
    },
    cable: {
      size: '4/0',
      length: 100,
      conduitType: 'steel',
      conductorMaterial: 'copper',
      numberOfConductors: 3,
      parallelRuns: 1
    },
    includeMotorContribution: true,
    motors: [
      { hp: 100, voltage: 480, quantity: 2, powerFactor: 0.85, subtransient: 0.17 },
      { hp: 50, voltage: 480, quantity: 4, powerFactor: 0.85, subtransient: 0.20 }
    ],
    groundingType: 'solidly',
    groundingResistance: 0,
    cFactor: 1.0,
    calculationType: 'maximum'
  });

  const [results, setResults] = useState<FaultResults | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    calculateShortCircuit();
  }, [inputs]);

  const calculateShortCircuit = () => {
    // Convert to per-unit system
    const baseMVA = 100; // 100 MVA base
    const baseKV = inputs.systemVoltage / 1000;
    const baseZ = (baseKV * baseKV) / baseMVA;
    const baseI = baseMVA * 1000 / (Math.sqrt(3) * baseKV); // kA

    // Source impedance
    const sourceZ = { r: 0, x: 0 };
    
    if (inputs.sourceType === 'utility') {
      // Utility source impedance
      const zPU = baseMVA * 1000 / (Math.sqrt(3) * inputs.systemVoltage * inputs.utilityFaultCurrent);
      const theta = Math.atan(inputs.utilityXR);
      sourceZ.r = zPU * Math.cos(theta);
      sourceZ.x = zPU * Math.sin(theta);
    } else if (inputs.sourceType === 'transformer' && inputs.transformer) {
      // Transformer impedance
      const zPU = inputs.transformer.impedancePercent / 100 * (baseMVA * 1000 / inputs.transformer.kva);
      const theta = Math.atan(inputs.transformer.xrRatio);
      sourceZ.r = zPU * Math.cos(theta);
      sourceZ.x = zPU * Math.sin(theta);
    }

    // Cable impedance
    const cableData = cableImpedanceData[inputs.cable.size];
    if (!cableData) return;

    const cableR = cableData.r * inputs.cable.length / (1000 * inputs.cable.parallelRuns);
    const cableX = cableData.x[inputs.cable.conduitType] * inputs.cable.length / (1000 * inputs.cable.parallelRuns);
    
    // Convert cable impedance to per-unit
    const cableRpu = cableR / baseZ;
    const cableXpu = cableX / baseZ;

    // Total impedance to fault point
    const totalR = sourceZ.r + cableRpu;
    const totalX = sourceZ.x + cableXpu;
    const totalZ = Math.sqrt(totalR * totalR + totalX * totalX);
    const totalXR = totalX / totalR;

    // Three-phase fault current
    const i3phasePU = 1 / totalZ;
    const i3phaseKA = i3phasePU * baseI;

    // Line-to-line fault (87% of three-phase)
    const iLLKA = 0.87 * i3phaseKA;

    // Line-to-ground fault
    let iLGKA = i3phaseKA; // For solidly grounded
    if (inputs.groundingType === 'resistance' && inputs.groundingResistance) {
      // Reduced ground fault for resistance grounded
      const rg = inputs.groundingResistance / baseZ;
      const z0 = Math.sqrt((totalR + 3 * rg) ** 2 + totalX ** 2);
      iLGKA = baseI / z0;
    } else if (inputs.groundingType === 'ungrounded') {
      iLGKA = 0; // No ground fault current
    }

    // Motor contribution
    let motorContribInitial = 0;
    let motorContribInterrupting = 0;
    
    if (inputs.includeMotorContribution) {
      inputs.motors.forEach(motor => {
        const motorMVA = motor.hp * 0.746 * motor.quantity / (1000 * motor.powerFactor);
        const motorIPU = motorMVA / (motor.subtransient * baseMVA);
        const motorIKA = motorIPU * baseI;
        
        motorContribInitial += motorIKA;
        motorContribInterrupting += motorIKA * 0.5; // 50% for interrupting duty
      });
    }

    // Asymmetrical calculations
    const xrRatio = totalXR;
    const powerFactor = Math.cos(Math.atan(xrRatio));
    const asymFactor = Math.sqrt(1 + 2 * Math.exp(-4.0 * Math.PI / xrRatio));
    const peakCurrent = i3phaseKA * Math.sqrt(2) * asymFactor;

    // Arc flash calculations (IEEE 1584)
    const arcFlashCalc = calculateArcFlash(i3phaseKA, inputs.systemVoltage, 18, 0.5); // 18" working distance, 0.5s clearing time

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (i3phaseKA > 65) {
      recommendations.push('Fault current exceeds 65kA - consider current limiting devices');
    }
    
    if (xrRatio > 20) {
      recommendations.push('High X/R ratio detected - ensure breaker ratings account for DC component');
    }
    
    if (motorContribInitial / i3phaseKA > 0.25) {
      recommendations.push('Significant motor contribution - verify protective device ratings');
    }
    
    if (arcFlashCalc.incidentEnergy > 8) {
      recommendations.push('High incident energy - implement arc flash reduction measures');
    }
    
    if (inputs.groundingType === 'ungrounded') {
      recommendations.push('Ungrounded system - install ground fault detection');
    }

    setResults({
      symmetricalFault: {
        threePhaseFault: i3phaseKA,
        lineToLineFault: iLLKA,
        lineToGroundFault: iLGKA
      },
      asymmetricalFault: {
        threePhasePeak: peakCurrent,
        xrRatio: xrRatio,
        powerFactor: powerFactor
      },
      motorContribution: {
        initial: motorContribInitial,
        interrupting: motorContribInterrupting
      },
      totalFaultCurrent: {
        symmetrical: i3phaseKA + motorContribInitial,
        asymmetrical: peakCurrent + motorContribInitial * Math.sqrt(2) * 1.6,
        interrupting: i3phaseKA + motorContribInterrupting
      },
      arcFlashBoundary: arcFlashCalc.boundary,
      incidentEnergy: arcFlashCalc.incidentEnergy,
      ppe: arcFlashCalc.ppeCategory,
      recommendations
    });
  };

  const calculateArcFlash = (faultCurrent: number, voltage: number, distance: number, time: number) => {
    // IEEE 1584 simplified equations
    const k = voltage <= 1000 ? -0.153 : -0.097;
    const arcCurrent = faultCurrent * 0.85; // Typical arc current
    const En = Math.pow(10, k + 0.662 * Math.log10(arcCurrent) + 0.966 * Math.log10(voltage) + 0.000526 * 100 + 0.5588 * Math.log10(voltage) * Math.log10(arcCurrent) - 0.00304 * 100 * Math.log10(arcCurrent));
    const E = 4.184 * inputs.cFactor * En * (time / 0.2) * Math.pow(610 / distance, 2);
    
    // Arc flash boundary
    const Eb = 1.2; // 1.2 cal/cm² at boundary
    const Db = Math.sqrt(4.184 * inputs.cFactor * En * (time / 0.2) * 610 * 610 / Eb);
    
    // PPE category
    let ppeCategory = 0;
    if (E <= 1.2) ppeCategory = 0;
    else if (E <= 4) ppeCategory = 1;
    else if (E <= 8) ppeCategory = 2;
    else if (E <= 25) ppeCategory = 3;
    else if (E <= 40) ppeCategory = 4;
    else ppeCategory = 5; // Exceeds PPE
    
    return {
      incidentEnergy: E,
      boundary: Db,
      ppeCategory
    };
  };

  const updateInput = (field: keyof ShortCircuitInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const updateTransformer = (field: keyof TransformerData, value: any) => {
    setInputs(prev => ({
      ...prev,
      transformer: { ...prev.transformer!, [field]: value }
    }));
  };

  const updateCable = (field: keyof CableData, value: any) => {
    setInputs(prev => ({
      ...prev,
      cable: { ...prev.cable, [field]: value }
    }));
  };

  const addMotor = () => {
    setInputs(prev => ({
      ...prev,
      motors: [...prev.motors, { hp: 50, voltage: 480, quantity: 1, powerFactor: 0.85, subtransient: 0.20 }]
    }));
  };

  const updateMotor = (index: number, field: keyof MotorContribution, value: any) => {
    const updatedMotors = [...inputs.motors];
    updatedMotors[index] = { ...updatedMotors[index], [field]: value };
    setInputs(prev => ({ ...prev, motors: updatedMotors }));
  };

  const removeMotor = (index: number) => {
    setInputs(prev => ({
      ...prev,
      motors: prev.motors.filter((_, i) => i !== index)
    }));
  };

  const exportReport = () => {
    if (!results) return;

    const report = `
SHORT CIRCUIT ANALYSIS REPORT
=============================
Date: ${new Date().toLocaleDateString()}
System Voltage: ${inputs.systemVoltage}V ${inputs.phases}Ø

SOURCE INFORMATION
------------------
Type: ${inputs.sourceType.toUpperCase()}
${inputs.sourceType === 'utility' ? `Utility Fault Current: ${inputs.utilityFaultCurrent} kA
Utility X/R Ratio: ${inputs.utilityXR}` : ''}
${inputs.sourceType === 'transformer' && inputs.transformer ? `Transformer: ${inputs.transformer.kva} kVA
Impedance: ${inputs.transformer.impedancePercent}%
X/R Ratio: ${inputs.transformer.xrRatio}` : ''}

CABLE IMPEDANCE
---------------
Size: ${inputs.cable.size} ${inputs.cable.conductorMaterial}
Length: ${inputs.cable.length} ft
Conduit: ${inputs.cable.conduitType}
Parallel Runs: ${inputs.cable.parallelRuns}

FAULT CURRENT RESULTS
--------------------
Three-Phase Fault: ${results.symmetricalFault.threePhaseFault.toFixed(2)} kA
Line-to-Line Fault: ${results.symmetricalFault.lineToLineFault.toFixed(2)} kA
Line-to-Ground Fault: ${results.symmetricalFault.lineToGroundFault.toFixed(2)} kA

Asymmetrical Peak: ${results.asymmetricalFault.threePhasePeak.toFixed(2)} kA
X/R Ratio: ${results.asymmetricalFault.xrRatio.toFixed(1)}
Power Factor: ${results.asymmetricalFault.powerFactor.toFixed(3)}

MOTOR CONTRIBUTION
------------------
Initial Contribution: ${results.motorContribution.initial.toFixed(2)} kA
Interrupting Contribution: ${results.motorContribution.interrupting.toFixed(2)} kA

TOTAL FAULT CURRENTS
--------------------
Symmetrical RMS: ${results.totalFaultCurrent.symmetrical.toFixed(2)} kA
Asymmetrical Peak: ${results.totalFaultCurrent.asymmetrical.toFixed(2)} kA
Interrupting Duty: ${results.totalFaultCurrent.interrupting.toFixed(2)} kA

ARC FLASH HAZARD
----------------
Incident Energy: ${results.incidentEnergy.toFixed(2)} cal/cm² @ 18"
Arc Flash Boundary: ${results.arcFlashBoundary.toFixed(0)} inches
PPE Category: ${results.ppe}

RECOMMENDATIONS
----------------
${results.recommendations.map(r => `• ${r}`).join('\n')}

Generated by Vibelux Electrical Tools
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `short_circuit_analysis_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-red-400" />
            Short Circuit Analysis Calculator
          </CardTitle>
          <CardDescription className="text-gray-400">
            IEEE/ANSI compliant fault current and arc flash calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300">Source Configuration</h4>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400">Source Type</label>
                <select
                  value={inputs.sourceType}
                  onChange={(e) => updateInput('sourceType', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="utility">Utility</option>
                  <option value="transformer">Transformer</option>
                  <option value="generator">Generator</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">System Voltage (V)</label>
                <select
                  value={inputs.systemVoltage}
                  onChange={(e) => updateInput('systemVoltage', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value={208}>208V</option>
                  <option value={240}>240V</option>
                  <option value={480}>480V</option>
                  <option value={600}>600V</option>
                  <option value={2400}>2400V</option>
                  <option value={4160}>4160V</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Phases</label>
                <select
                  value={inputs.phases}
                  onChange={(e) => updateInput('phases', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="1">Single Phase</option>
                  <option value="3">Three Phase</option>
                </select>
              </div>
            </div>

            {/* Utility Source Parameters */}
            {inputs.sourceType === 'utility' && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400">Available Fault Current (kA)</label>
                  <input
                    type="number"
                    value={inputs.utilityFaultCurrent}
                    onChange={(e) => updateInput('utilityFaultCurrent', Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    min="1"
                    max="200"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">X/R Ratio</label>
                  <input
                    type="number"
                    value={inputs.utilityXR}
                    onChange={(e) => updateInput('utilityXR', Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    min="1"
                    max="50"
                    step="0.1"
                  />
                </div>
              </div>
            )}

            {/* Transformer Source Parameters */}
            {inputs.sourceType === 'transformer' && inputs.transformer && (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400">kVA Rating</label>
                  <input
                    type="number"
                    value={inputs.transformer.kva}
                    onChange={(e) => updateTransformer('kva', Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    min="15"
                    max="10000"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Impedance (%)</label>
                  <input
                    type="number"
                    value={inputs.transformer.impedancePercent}
                    onChange={(e) => updateTransformer('impedancePercent', Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    min="1"
                    max="15"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">X/R Ratio</label>
                  <input
                    type="number"
                    value={inputs.transformer.xrRatio}
                    onChange={(e) => updateTransformer('xrRatio', Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    min="1"
                    max="20"
                    step="0.1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cable Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300">Cable Configuration</h4>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400">Cable Size</label>
                <select
                  value={inputs.cable.size}
                  onChange={(e) => updateCable('size', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  {Object.keys(cableImpedanceData).map(size => (
                    <option key={size} value={size}>
                      {size.includes('/') ? size + ' AWG' : '#' + size + ' AWG'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Length (ft)</label>
                <input
                  type="number"
                  value={inputs.cable.length}
                  onChange={(e) => updateCable('length', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Conduit Type</label>
                <select
                  value={inputs.cable.conduitType}
                  onChange={(e) => updateCable('conduitType', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="steel">Steel (EMT/IMC/RGS)</option>
                  <option value="pvc">PVC</option>
                  <option value="aluminum">Aluminum</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Conductor Material</label>
                <select
                  value={inputs.cable.conductorMaterial}
                  onChange={(e) => updateCable('conductorMaterial', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="copper">Copper</option>
                  <option value="aluminum">Aluminum</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Parallel Runs</label>
                <input
                  type="number"
                  value={inputs.cable.parallelRuns}
                  onChange={(e) => updateCable('parallelRuns', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>

          {/* System Grounding */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300">System Grounding</h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400">Grounding Type</label>
                <select
                  value={inputs.groundingType}
                  onChange={(e) => updateInput('groundingType', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="solidly">Solidly Grounded</option>
                  <option value="resistance">Resistance Grounded</option>
                  <option value="ungrounded">Ungrounded</option>
                </select>
              </div>

              {inputs.groundingType === 'resistance' && (
                <div>
                  <label className="text-xs text-gray-400">Grounding Resistance (Ω)</label>
                  <input
                    type="number"
                    value={inputs.groundingResistance}
                    onChange={(e) => updateInput('groundingResistance', Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    min="0"
                    max="1000"
                    step="0.1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Motor Contribution */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-300">Motor Contribution</h4>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={inputs.includeMotorContribution}
                  onChange={(e) => updateInput('includeMotorContribution', e.target.checked)}
                  className="w-4 h-4"
                />
                Include Motors
              </label>
            </div>

            {inputs.includeMotorContribution && (
              <div className="space-y-2">
                {inputs.motors.map((motor, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 p-2 bg-gray-800/50 rounded">
                    <input
                      type="number"
                      value={motor.hp}
                      onChange={(e) => updateMotor(index, 'hp', Number(e.target.value))}
                      placeholder="HP"
                      className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                    />
                    <input
                      type="number"
                      value={motor.voltage}
                      onChange={(e) => updateMotor(index, 'voltage', Number(e.target.value))}
                      placeholder="Voltage"
                      className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                    />
                    <input
                      type="number"
                      value={motor.quantity}
                      onChange={(e) => updateMotor(index, 'quantity', Number(e.target.value))}
                      placeholder="Qty"
                      className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                    />
                    <input
                      type="number"
                      value={motor.powerFactor}
                      onChange={(e) => updateMotor(index, 'powerFactor', Number(e.target.value))}
                      placeholder="PF"
                      className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <button
                      onClick={() => removeMotor(index)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addMotor}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
                >
                  Add Motor
                </button>
              </div>
            )}
          </div>

          {/* Arc Flash Parameters */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-300">Arc Flash Parameters</h4>
            
            <div>
              <label className="text-xs text-gray-400">Equipment Type / C Factor</label>
              <select
                value={inputs.cFactor}
                onChange={(e) => updateInput('cFactor', Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              >
                <option value={1.0}>Switchgear / Open Air (1.0)</option>
                <option value={1.5}>MCC / Panel (1.5)</option>
                <option value={0.89}>Cable (0.89)</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="mt-6 space-y-6">
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-medium text-white mb-4">Analysis Results</h4>
                
                {/* Fault Current Results */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">3-Phase Fault</p>
                        <Badge variant="destructive" className="text-xs">L-L-L</Badge>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {results.symmetricalFault.threePhaseFault.toFixed(2)} kA
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Symmetrical RMS
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">L-L Fault</p>
                        <Badge variant="outline" className="text-xs">L-L</Badge>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {results.symmetricalFault.lineToLineFault.toFixed(2)} kA
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        87% of 3-phase
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">L-G Fault</p>
                        <Badge variant="outline" className="text-xs">L-G</Badge>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {results.symmetricalFault.lineToGroundFault.toFixed(2)} kA
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {inputs.groundingType === 'solidly' ? 'Solidly grounded' : inputs.groundingType}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Asymmetrical and Total */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-white">Asymmetrical Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Peak Current:</span>
                        <span className="text-white font-medium">{results.asymmetricalFault.threePhasePeak.toFixed(2)} kA</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">X/R Ratio:</span>
                        <span className="text-white font-medium">{results.asymmetricalFault.xrRatio.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Power Factor:</span>
                        <span className="text-white font-medium">{results.asymmetricalFault.powerFactor.toFixed(3)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-white">Total Fault Currents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Symmetrical:</span>
                        <span className="text-white font-medium">{results.totalFaultCurrent.symmetrical.toFixed(2)} kA RMS</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Asymmetrical:</span>
                        <span className="text-white font-medium">{results.totalFaultCurrent.asymmetrical.toFixed(2)} kA peak</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Interrupting:</span>
                        <span className="text-white font-medium">{results.totalFaultCurrent.interrupting.toFixed(2)} kA RMS</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Arc Flash Results */}
                <Card className={`bg-gray-800/50 mb-6 border ${
                  results.ppe <= 2 ? 'border-green-600' : 
                  results.ppe <= 4 ? 'border-orange-600' : 
                  'border-red-600'
                }`}>
                  <CardHeader>
                    <CardTitle className="text-sm text-white flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Arc Flash Hazard Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Incident Energy @ 18"</p>
                        <p className="text-xl font-bold text-white">{results.incidentEnergy.toFixed(2)} cal/cm²</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Arc Flash Boundary</p>
                        <p className="text-xl font-bold text-white">{results.arcFlashBoundary.toFixed(0)} inches</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">PPE Category</p>
                        <p className="text-xl font-bold text-white">
                          {results.ppe === 5 ? 'DANGER' : `CAT ${results.ppe}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Motor Contribution */}
                {inputs.includeMotorContribution && (
                  <Alert className="mb-4 border-blue-600">
                    <Activity className="h-4 w-4" />
                    <AlertTitle>Motor Contribution</AlertTitle>
                    <AlertDescription>
                      Initial: {results.motorContribution.initial.toFixed(2)} kA | 
                      Interrupting: {results.motorContribution.interrupting.toFixed(2)} kA
                    </AlertDescription>
                  </Alert>
                )}

                {/* Recommendations */}
                {results.recommendations.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-sm text-white">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {results.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Export Button */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={exportReport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                </div>

                {/* Detailed Calculations */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {showDetails ? 'Hide' : 'Show'} Calculation Details
                  </button>
                  
                  {showDetails && (
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg space-y-4 text-sm">
                      <div>
                        <h5 className="font-medium text-white mb-2">Per-Unit Calculations:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-gray-400">Base MVA:</span>
                          <span className="text-white">100 MVA</span>
                          
                          <span className="text-gray-400">Base kV:</span>
                          <span className="text-white">{(inputs.systemVoltage / 1000).toFixed(3)}</span>
                          
                          <span className="text-gray-400">Base Impedance:</span>
                          <span className="text-white">{((inputs.systemVoltage / 1000) ** 2 / 100).toFixed(3)} Ω</span>
                          
                          <span className="text-gray-400">Base Current:</span>
                          <span className="text-white">{(100000 / (Math.sqrt(3) * inputs.systemVoltage)).toFixed(0)} A</span>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-white mb-2">IEEE 1584 Arc Flash:</h5>
                        <p className="text-xs text-gray-300 font-mono">
                          E = 4.184 × Cf × En × (t/0.2) × (610/D)²<br/>
                          Working Distance: 18 inches<br/>
                          Clearing Time: 0.5 seconds<br/>
                          Equipment Type Factor: {inputs.cFactor}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Standards & Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <p>• <strong>IEEE C37.010:</strong> AC high-voltage circuit breaker ratings</p>
            <p>• <strong>IEEE 1584:</strong> Arc flash hazard calculations</p>
            <p>• <strong>ANSI/IEEE 141:</strong> Industrial power system analysis</p>
            <p>• <strong>IEC 60909:</strong> Short-circuit currents in AC systems</p>
            <p>• <strong>NFPA 70E:</strong> Electrical safety requirements</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-400" />
              Key Considerations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <p>• Verify equipment interrupting ratings exceed calculated values</p>
            <p>• Consider DC offset for equipment close to transformers</p>
            <p>• Account for future system expansion in calculations</p>
            <p>• Coordinate with utility for accurate source impedance</p>
            <p>• Update calculations when system changes occur</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}