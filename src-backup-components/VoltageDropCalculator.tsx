'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Calculator,
  Info,
  TrendingDown
} from 'lucide-react';

interface ConductorData {
  size: string;
  area: number; // circular mils
  resistance: {
    copper: {
      pvc: number;  // ohms per 1000 ft at 75°C
      aluminum: number;
    };
    aluminum: {
      pvc: number;
      aluminum: number;
    };
  };
  ampacity: {
    copper: {
      '60C': number;
      '75C': number;
      '90C': number;
    };
    aluminum: {
      '60C': number;
      '75C': number;
      '90C': number;
    };
  };
}

interface VoltageDropInputs {
  voltage: number;
  phase: '1' | '3';
  load: number; // amps
  powerFactor: number;
  distance: number; // feet
  conductorType: 'copper' | 'aluminum';
  conductorSize: string;
  conduitType: 'pvc' | 'aluminum';
  temperature: number; // ambient temp in Celsius
  numberOfConductors: number; // for derating
  parallelRuns: number;
}

interface VoltageDropResults {
  voltageDrop: number;
  voltageDropPercent: number;
  voltageAtLoad: number;
  powerLoss: number; // watts
  annualEnergyLoss: number; // kWh
  annualCostLoss: number; // $
  nec3Percent: boolean;
  nec5Percent: boolean;
  recommendedSize: string;
  effectiveZ: number;
  resistance: number;
  reactance: number;
}

// NEC Table 8 Conductor Properties (Chapter 9)
const conductorTable: Record<string, ConductorData> = {
  '14': {
    size: '14 AWG',
    area: 4110,
    resistance: { 
      copper: { pvc: 3.14, aluminum: 3.19 },
      aluminum: { pvc: 5.17, aluminum: 5.24 }
    },
    ampacity: {
      copper: { '60C': 15, '75C': 20, '90C': 25 },
      aluminum: { '60C': 0, '75C': 0, '90C': 0 }
    }
  },
  '12': {
    size: '12 AWG',
    area: 6530,
    resistance: { 
      copper: { pvc: 1.98, aluminum: 2.01 },
      aluminum: { pvc: 3.25, aluminum: 3.29 }
    },
    ampacity: {
      copper: { '60C': 20, '75C': 25, '90C': 30 },
      aluminum: { '60C': 15, '75C': 20, '90C': 25 }
    }
  },
  '10': {
    size: '10 AWG',
    area: 10380,
    resistance: { 
      copper: { pvc: 1.24, aluminum: 1.26 },
      aluminum: { pvc: 2.04, aluminum: 2.07 }
    },
    ampacity: {
      copper: { '60C': 30, '75C': 35, '90C': 40 },
      aluminum: { '60C': 25, '75C': 30, '90C': 35 }
    }
  },
  '8': {
    size: '8 AWG',
    area: 16510,
    resistance: { 
      copper: { pvc: 0.778, aluminum: 0.792 },
      aluminum: { pvc: 1.28, aluminum: 1.30 }
    },
    ampacity: {
      copper: { '60C': 40, '75C': 50, '90C': 55 },
      aluminum: { '60C': 30, '75C': 40, '90C': 45 }
    }
  },
  '6': {
    size: '6 AWG',
    area: 26240,
    resistance: { 
      copper: { pvc: 0.491, aluminum: 0.499 },
      aluminum: { pvc: 0.808, aluminum: 0.819 }
    },
    ampacity: {
      copper: { '60C': 55, '75C': 65, '90C': 75 },
      aluminum: { '60C': 40, '75C': 50, '90C': 55 }
    }
  },
  '4': {
    size: '4 AWG',
    area: 41740,
    resistance: { 
      copper: { pvc: 0.308, aluminum: 0.313 },
      aluminum: { pvc: 0.508, aluminum: 0.515 }
    },
    ampacity: {
      copper: { '60C': 70, '75C': 85, '90C': 95 },
      aluminum: { '60C': 55, '75C': 65, '90C': 75 }
    }
  },
  '3': {
    size: '3 AWG',
    area: 52620,
    resistance: { 
      copper: { pvc: 0.245, aluminum: 0.249 },
      aluminum: { pvc: 0.403, aluminum: 0.408 }
    },
    ampacity: {
      copper: { '60C': 85, '75C': 100, '90C': 115 },
      aluminum: { '60C': 65, '75C': 75, '90C': 85 }
    }
  },
  '2': {
    size: '2 AWG',
    area: 66360,
    resistance: { 
      copper: { pvc: 0.194, aluminum: 0.197 },
      aluminum: { pvc: 0.319, aluminum: 0.324 }
    },
    ampacity: {
      copper: { '60C': 95, '75C': 115, '90C': 130 },
      aluminum: { '60C': 75, '75C': 90, '90C': 100 }
    }
  },
  '1': {
    size: '1 AWG',
    area: 83690,
    resistance: { 
      copper: { pvc: 0.154, aluminum: 0.156 },
      aluminum: { pvc: 0.253, aluminum: 0.257 }
    },
    ampacity: {
      copper: { '60C': 110, '75C': 130, '90C': 145 },
      aluminum: { '60C': 85, '75C': 100, '90C': 115 }
    }
  },
  '1/0': {
    size: '1/0 AWG',
    area: 105600,
    resistance: { 
      copper: { pvc: 0.122, aluminum: 0.124 },
      aluminum: { pvc: 0.201, aluminum: 0.204 }
    },
    ampacity: {
      copper: { '60C': 125, '75C': 150, '90C': 170 },
      aluminum: { '60C': 100, '75C': 120, '90C': 135 }
    }
  },
  '2/0': {
    size: '2/0 AWG',
    area: 133100,
    resistance: { 
      copper: { pvc: 0.0967, aluminum: 0.0982 },
      aluminum: { pvc: 0.159, aluminum: 0.162 }
    },
    ampacity: {
      copper: { '60C': 145, '75C': 175, '90C': 195 },
      aluminum: { '60C': 115, '75C': 135, '90C': 150 }
    }
  },
  '3/0': {
    size: '3/0 AWG',
    area: 167800,
    resistance: { 
      copper: { pvc: 0.0766, aluminum: 0.0778 },
      aluminum: { pvc: 0.126, aluminum: 0.128 }
    },
    ampacity: {
      copper: { '60C': 165, '75C': 200, '90C': 225 },
      aluminum: { '60C': 130, '75C': 155, '90C': 175 }
    }
  },
  '4/0': {
    size: '4/0 AWG',
    area: 211600,
    resistance: { 
      copper: { pvc: 0.0608, aluminum: 0.0617 },
      aluminum: { pvc: 0.100, aluminum: 0.101 }
    },
    ampacity: {
      copper: { '60C': 195, '75C': 230, '90C': 260 },
      aluminum: { '60C': 150, '75C': 180, '90C': 205 }
    }
  },
  '250': {
    size: '250 MCM',
    area: 250000,
    resistance: { 
      copper: { pvc: 0.0515, aluminum: 0.0523 },
      aluminum: { pvc: 0.0847, aluminum: 0.0858 }
    },
    ampacity: {
      copper: { '60C': 215, '75C': 255, '90C': 290 },
      aluminum: { '60C': 170, '75C': 205, '90C': 230 }
    }
  },
  '300': {
    size: '300 MCM',
    area: 300000,
    resistance: { 
      copper: { pvc: 0.0429, aluminum: 0.0436 },
      aluminum: { pvc: 0.0707, aluminum: 0.0716 }
    },
    ampacity: {
      copper: { '60C': 240, '75C': 285, '90C': 320 },
      aluminum: { '60C': 195, '75C': 230, '90C': 260 }
    }
  },
  '350': {
    size: '350 MCM',
    area: 350000,
    resistance: { 
      copper: { pvc: 0.0367, aluminum: 0.0373 },
      aluminum: { pvc: 0.0605, aluminum: 0.0613 }
    },
    ampacity: {
      copper: { '60C': 260, '75C': 310, '90C': 350 },
      aluminum: { '60C': 210, '75C': 250, '90C': 280 }
    }
  },
  '400': {
    size: '400 MCM',
    area: 400000,
    resistance: { 
      copper: { pvc: 0.0321, aluminum: 0.0326 },
      aluminum: { pvc: 0.0529, aluminum: 0.0536 }
    },
    ampacity: {
      copper: { '60C': 280, '75C': 335, '90C': 380 },
      aluminum: { '60C': 225, '75C': 270, '90C': 305 }
    }
  },
  '500': {
    size: '500 MCM',
    area: 500000,
    resistance: { 
      copper: { pvc: 0.0258, aluminum: 0.0262 },
      aluminum: { pvc: 0.0424, aluminum: 0.0430 }
    },
    ampacity: {
      copper: { '60C': 320, '75C': 380, '90C': 430 },
      aluminum: { '60C': 260, '75C': 310, '90C': 350 }
    }
  },
  '600': {
    size: '600 MCM',
    area: 600000,
    resistance: { 
      copper: { pvc: 0.0214, aluminum: 0.0218 },
      aluminum: { pvc: 0.0353, aluminum: 0.0358 }
    },
    ampacity: {
      copper: { '60C': 350, '75C': 420, '90C': 475 },
      aluminum: { '60C': 285, '75C': 340, '90C': 385 }
    }
  },
  '750': {
    size: '750 MCM',
    area: 750000,
    resistance: { 
      copper: { pvc: 0.0171, aluminum: 0.0174 },
      aluminum: { pvc: 0.0282, aluminum: 0.0286 }
    },
    ampacity: {
      copper: { '60C': 400, '75C': 475, '90C': 535 },
      aluminum: { '60C': 320, '75C': 385, '90C': 435 }
    }
  },
  '1000': {
    size: '1000 MCM',
    area: 1000000,
    resistance: { 
      copper: { pvc: 0.0129, aluminum: 0.0131 },
      aluminum: { pvc: 0.0212, aluminum: 0.0215 }
    },
    ampacity: {
      copper: { '60C': 455, '75C': 545, '90C': 615 },
      aluminum: { '60C': 375, '75C': 445, '90C': 500 }
    }
  }
};

// Reactance values for different conductor sizes (ohms per 1000 ft)
const reactanceTable: Record<string, number> = {
  '14': 0.058, '12': 0.054, '10': 0.050, '8': 0.052,
  '6': 0.051, '4': 0.048, '3': 0.047, '2': 0.045,
  '1': 0.046, '1/0': 0.044, '2/0': 0.043, '3/0': 0.042,
  '4/0': 0.041, '250': 0.041, '300': 0.041, '350': 0.040,
  '400': 0.040, '500': 0.039, '600': 0.039, '750': 0.038,
  '1000': 0.037
};

export function VoltageDropCalculator() {
  const [inputs, setInputs] = useState<VoltageDropInputs>({
    voltage: 208,
    phase: '3',
    load: 100,
    powerFactor: 0.85,
    distance: 100,
    conductorType: 'copper',
    conductorSize: '2',
    conduitType: 'aluminum',
    temperature: 30,
    numberOfConductors: 3,
    parallelRuns: 1
  });

  const [results, setResults] = useState<VoltageDropResults | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    calculateVoltageDrop();
  }, [inputs]);

  const calculateVoltageDrop = () => {
    const conductor = conductorTable[inputs.conductorSize];
    if (!conductor) return;

    // Get base resistance from table
    const baseResistance = conductor.resistance[inputs.conductorType][inputs.conduitType];
    
    // Temperature correction factor (NEC Table 8, Note 2)
    const tempCorrection = 1 + 0.00323 * (inputs.temperature - 75);
    const correctedResistance = baseResistance * tempCorrection;
    
    // Get reactance
    const reactance = reactanceTable[inputs.conductorSize] || 0.040;
    
    // Effective impedance
    const effectiveZ = Math.sqrt(
      Math.pow(correctedResistance * inputs.powerFactor, 2) + 
      Math.pow(reactance * Math.sin(Math.acos(inputs.powerFactor)), 2)
    );
    
    // Calculate voltage drop based on phase
    let voltageDrop: number;
    if (inputs.phase === '1') {
      // Single phase: VD = 2 × I × L × Z / 1000
      voltageDrop = 2 * inputs.load * inputs.distance * effectiveZ / (1000 * inputs.parallelRuns);
    } else {
      // Three phase: VD = √3 × I × L × Z / 1000
      voltageDrop = Math.sqrt(3) * inputs.load * inputs.distance * effectiveZ / (1000 * inputs.parallelRuns);
    }
    
    const voltageDropPercent = (voltageDrop / inputs.voltage) * 100;
    const voltageAtLoad = inputs.voltage - voltageDrop;
    
    // Power loss calculation
    const powerLoss = inputs.phase === '1' 
      ? 2 * Math.pow(inputs.load, 2) * correctedResistance * inputs.distance / (1000 * inputs.parallelRuns)
      : 3 * Math.pow(inputs.load, 2) * correctedResistance * inputs.distance / (1000 * inputs.parallelRuns);
    
    // Annual energy loss (assuming 8760 hours/year operation)
    const annualEnergyLoss = powerLoss * 8760 / 1000; // kWh
    const annualCostLoss = annualEnergyLoss * 0.12; // Assuming $0.12/kWh
    
    // NEC compliance check
    const nec3Percent = voltageDropPercent <= 3.0; // Branch circuits
    const nec5Percent = voltageDropPercent <= 5.0; // Feeder + branch total
    
    // Find recommended conductor size
    let recommendedSize = inputs.conductorSize;
    if (voltageDropPercent > 3.0) {
      for (const [size, data] of Object.entries(conductorTable)) {
        const testResistance = data.resistance[inputs.conductorType][inputs.conduitType] * tempCorrection;
        const testReactance = reactanceTable[size] || 0.040;
        const testZ = Math.sqrt(
          Math.pow(testResistance * inputs.powerFactor, 2) + 
          Math.pow(testReactance * Math.sin(Math.acos(inputs.powerFactor)), 2)
        );
        
        const testDrop = inputs.phase === '1'
          ? 2 * inputs.load * inputs.distance * testZ / (1000 * inputs.parallelRuns)
          : Math.sqrt(3) * inputs.load * inputs.distance * testZ / (1000 * inputs.parallelRuns);
        
        const testPercent = (testDrop / inputs.voltage) * 100;
        
        // Check if this size meets ampacity requirements
        const requiredAmpacity = inputs.load / inputs.parallelRuns;
        const ampacity = data.ampacity[inputs.conductorType]['75C'];
        
        if (testPercent <= 3.0 && ampacity >= requiredAmpacity) {
          recommendedSize = size;
          break;
        }
      }
    }
    
    setResults({
      voltageDrop,
      voltageDropPercent,
      voltageAtLoad,
      powerLoss,
      annualEnergyLoss,
      annualCostLoss,
      nec3Percent,
      nec5Percent,
      recommendedSize,
      effectiveZ,
      resistance: correctedResistance,
      reactance
    });
  };

  const updateInput = (field: keyof VoltageDropInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingDown className="w-5 h-5 text-yellow-400" />
            Voltage Drop Calculator
          </CardTitle>
          <CardDescription className="text-gray-400">
            NEC compliant voltage drop calculations with temperature correction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* System Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">System Configuration</h4>
              
              <div>
                <label className="text-xs text-gray-400">System Voltage (V)</label>
                <select
                  value={inputs.voltage}
                  onChange={(e) => updateInput('voltage', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value={120}>120V</option>
                  <option value={208}>208V</option>
                  <option value={240}>240V</option>
                  <option value={277}>277V</option>
                  <option value={480}>480V</option>
                  <option value={600}>600V</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Phase</label>
                <select
                  value={inputs.phase}
                  onChange={(e) => updateInput('phase', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="1">Single Phase</option>
                  <option value="3">Three Phase</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Load Current (A)</label>
                <input
                  type="number"
                  value={inputs.load}
                  onChange={(e) => updateInput('load', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Power Factor</label>
                <input
                  type="number"
                  value={inputs.powerFactor}
                  onChange={(e) => updateInput('powerFactor', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  min="0.5"
                  max="1.0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Conductor Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Conductor Configuration</h4>
              
              <div>
                <label className="text-xs text-gray-400">One-Way Distance (ft)</label>
                <input
                  type="number"
                  value={inputs.distance}
                  onChange={(e) => updateInput('distance', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Conductor Type</label>
                <select
                  value={inputs.conductorType}
                  onChange={(e) => updateInput('conductorType', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="copper">Copper</option>
                  <option value="aluminum">Aluminum</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Conductor Size</label>
                <select
                  value={inputs.conductorSize}
                  onChange={(e) => updateInput('conductorSize', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  {Object.entries(conductorTable).map(([key, data]) => (
                    <option key={key} value={key}>{data.size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Conduit Type</label>
                <select
                  value={inputs.conduitType}
                  onChange={(e) => updateInput('conduitType', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="pvc">PVC</option>
                  <option value="aluminum">Steel (EMT/IMC/RGS)</option>
                </select>
              </div>
            </div>

            {/* Installation Conditions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Installation Conditions</h4>
              
              <div>
                <label className="text-xs text-gray-400">Ambient Temperature (°C)</label>
                <input
                  type="number"
                  value={inputs.temperature}
                  onChange={(e) => updateInput('temperature', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  min="-40"
                  max="80"
                  step="1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Number of Current-Carrying Conductors</label>
                <input
                  type="number"
                  value={inputs.numberOfConductors}
                  onChange={(e) => updateInput('numberOfConductors', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  min="1"
                  max="20"
                  step="1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">Parallel Runs</label>
                <input
                  type="number"
                  value={inputs.parallelRuns}
                  onChange={(e) => updateInput('parallelRuns', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  min="1"
                  max="10"
                  step="1"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="mt-6 space-y-4">
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-medium text-white mb-4">Calculation Results</h4>
                
                {/* Main Results */}
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <Card className={`bg-gray-800/50 border ${results.nec3Percent ? 'border-green-600' : 'border-red-600'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400">Voltage Drop</p>
                          <p className="text-2xl font-bold text-white">{results.voltageDrop.toFixed(2)}V</p>
                          <p className="text-lg font-semibold text-white">{results.voltageDropPercent.toFixed(2)}%</p>
                        </div>
                        {results.nec3Percent ? (
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-8 h-8 text-red-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-400">Voltage at Load</p>
                      <p className="text-2xl font-bold text-white">{results.voltageAtLoad.toFixed(1)}V</p>
                      <p className="text-sm text-gray-400">
                        {((results.voltageAtLoad / inputs.voltage) * 100).toFixed(1)}% of nominal
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-400">Power Loss</p>
                      <p className="text-2xl font-bold text-white">{results.powerLoss.toFixed(0)}W</p>
                      <p className="text-sm text-gray-400">
                        ${results.annualCostLoss.toFixed(0)}/year
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Compliance Status */}
                <div className="space-y-2 mb-4">
                  <Alert className={results.nec3Percent ? 'border-green-600' : 'border-orange-600'}>
                    <Info className="h-4 w-4" />
                    <AlertTitle>NEC 210.19(A) Compliance - Branch Circuits</AlertTitle>
                    <AlertDescription>
                      {results.nec3Percent 
                        ? `✓ Voltage drop is ${results.voltageDropPercent.toFixed(2)}% - COMPLIANT with 3% maximum for branch circuits`
                        : `⚠ Voltage drop is ${results.voltageDropPercent.toFixed(2)}% - EXCEEDS 3% maximum for branch circuits`
                      }
                    </AlertDescription>
                  </Alert>

                  <Alert className={results.nec5Percent ? 'border-green-600' : 'border-red-600'}>
                    <Info className="h-4 w-4" />
                    <AlertTitle>NEC 215.2(A) Compliance - Feeders</AlertTitle>
                    <AlertDescription>
                      {results.nec5Percent 
                        ? `✓ Voltage drop is ${results.voltageDropPercent.toFixed(2)}% - COMPLIANT with 5% combined maximum`
                        : `✗ Voltage drop is ${results.voltageDropPercent.toFixed(2)}% - EXCEEDS 5% combined maximum`
                      }
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Recommendation */}
                {!results.nec3Percent && results.recommendedSize !== inputs.conductorSize && (
                  <Alert className="border-blue-600">
                    <Calculator className="h-4 w-4" />
                    <AlertTitle>Recommendation</AlertTitle>
                    <AlertDescription>
                      To achieve 3% voltage drop, use {conductorTable[results.recommendedSize]?.size || 'larger conductor'}.
                      {inputs.parallelRuns === 1 && ' Consider using parallel runs to reduce conductor size.'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Detailed Calculations */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {showDetails ? 'Hide' : 'Show'} Detailed Calculations
                  </button>
                  
                  {showDetails && (
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg space-y-2 text-sm">
                      <h5 className="font-medium text-white mb-2">Calculation Details:</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <span className="text-gray-400">Base Resistance (75°C):</span>
                        <span className="text-white">{conductorTable[inputs.conductorSize].resistance[inputs.conductorType][inputs.conduitType].toFixed(4)} Ω/1000ft</span>
                        
                        <span className="text-gray-400">Temperature Correction:</span>
                        <span className="text-white">{((1 + 0.00323 * (inputs.temperature - 75)) * 100 - 100).toFixed(1)}%</span>
                        
                        <span className="text-gray-400">Corrected Resistance:</span>
                        <span className="text-white">{results.resistance.toFixed(4)} Ω/1000ft</span>
                        
                        <span className="text-gray-400">Reactance:</span>
                        <span className="text-white">{results.reactance.toFixed(4)} Ω/1000ft</span>
                        
                        <span className="text-gray-400">Effective Impedance:</span>
                        <span className="text-white">{results.effectiveZ.toFixed(4)} Ω/1000ft</span>
                        
                        <span className="text-gray-400">Annual Energy Loss:</span>
                        <span className="text-white">{results.annualEnergyLoss.toFixed(0)} kWh</span>
                      </div>
                      
                      <div className="mt-3 p-3 bg-gray-900/50 rounded font-mono text-xs">
                        {inputs.phase === '3' ? (
                          <>
                            VD = √3 × I × L × Z / (1000 × N)<br/>
                            VD = 1.732 × {inputs.load} × {inputs.distance} × {results.effectiveZ.toFixed(4)} / (1000 × {inputs.parallelRuns})<br/>
                            VD = {results.voltageDrop.toFixed(2)}V
                          </>
                        ) : (
                          <>
                            VD = 2 × I × L × Z / (1000 × N)<br/>
                            VD = 2 × {inputs.load} × {inputs.distance} × {results.effectiveZ.toFixed(4)} / (1000 × {inputs.parallelRuns})<br/>
                            VD = {results.voltageDrop.toFixed(2)}V
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">NEC Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <p>• <strong>Branch Circuits:</strong> 3% maximum voltage drop (NEC 210.19(A) FPN No. 4)</p>
            <p>• <strong>Feeders:</strong> 5% combined maximum with branch circuits (NEC 215.2(A) FPN No. 2)</p>
            <p>• <strong>Sensitive Equipment:</strong> Consider 2% maximum for electronic loads</p>
            <p>• <strong>Motor Starting:</strong> Additional calculations required for motor inrush</p>
            <p>• <strong>Emergency Systems:</strong> Must meet voltage requirements at full load</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <p>• Design for 2% drop on branch circuits when possible</p>
            <p>• Consider future load growth in calculations</p>
            <p>• Account for harmonics in electronic loads</p>
            <p>• Use larger conductors for critical loads</p>
            <p>• Document all assumptions and calculations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}