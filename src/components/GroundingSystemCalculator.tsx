'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Shield,
  AlertTriangle, 
  CheckCircle, 
  Info,
  Activity
} from 'lucide-react';

interface GroundingInputs {
  serviceSize: number; // Amperes
  voltage: number;
  phase: '1' | '3';
  conductorMaterial: 'copper' | 'aluminum';
  largestUngroundedConductor: string; // AWG/MCM size
  electrodeType: 'rod' | 'plate' | 'ring' | 'ufer' | 'water' | 'multiple';
  soilResistivity: number; // ohm-cm
  numberOfRods: number;
  rodLength: number; // feet
  rodDiameter: number; // inches
  plateArea: number; // square feet
  ringLength: number; // feet
  buildingType: 'residential' | 'commercial' | 'industrial';
  separatelyDerivedSystem: boolean;
  equipmentGroundingRequired: boolean;
}

interface GroundingResults {
  groundingElectrodeConductor: {
    size: string;
    nec250_66: boolean;
  };
  equipmentGroundingConductor: {
    size: string;
    nec250_122: boolean;
  };
  mainBondingJumper: {
    size: string;
    nec250_102C: boolean;
  };
  groundingElectrodeResistance: number;
  meetsResistanceRequirement: boolean;
  supplementalElectrodeRequired: boolean;
  systemBondingJumper: string | null;
  recommendations: string[];
  necReferences: string[];
}

// NEC Table 250.66 - Grounding Electrode Conductor Sizing
const groundingElectrodeSizeTable: Record<string, string> = {
  '12': '8', '10': '8', '8': '8', '6': '8', '4': '8', '3': '8', '2': '8',
  '1': '6', '1/0': '6', '2/0': '6', '3/0': '6', '4/0': '4',
  '250': '4', '300': '4', '350': '2', '400': '2', '500': '2',
  '600': '1/0', '700': '1/0', '750': '1/0', '800': '1/0',
  '900': '2/0', '1000': '2/0', '1100': '2/0', '1200': '2/0',
  '1250': '3/0', '1400': '3/0', '1500': '3/0', '1750': '3/0',
  '2000': '4/0'
};

// NEC Table 250.122 - Equipment Grounding Conductor Sizing
const equipmentGroundingSizeTable: Record<number, string> = {
  15: '14', 20: '12', 30: '10', 40: '10', 60: '10',
  100: '8', 200: '6', 300: '4', 400: '3',
  500: '2', 600: '1', 800: '1/0', 1000: '2/0',
  1200: '3/0', 1600: '4/0', 2000: '250', 2500: '350',
  3000: '400', 4000: '500', 5000: '700', 6000: '800'
};

// Soil resistivity categories
const soilTypes = {
  'wet-organic': { name: 'Wet Organic Soil', resistivity: 1000 },
  'moist-soil': { name: 'Moist Soil', resistivity: 3000 },
  'dry-soil': { name: 'Dry Soil', resistivity: 10000 },
  'bedrock': { name: 'Bedrock', resistivity: 100000 },
  'concrete': { name: 'Concrete Encased', resistivity: 3000 }
};

export function GroundingSystemCalculator() {
  const [inputs, setInputs] = useState<GroundingInputs>({
    serviceSize: 200,
    voltage: 480,
    phase: '3',
    conductorMaterial: 'copper',
    largestUngroundedConductor: '3/0',
    electrodeType: 'rod',
    soilResistivity: 3000,
    numberOfRods: 2,
    rodLength: 8,
    rodDiameter: 0.625,
    plateArea: 2,
    ringLength: 20,
    buildingType: 'commercial',
    separatelyDerivedSystem: false,
    equipmentGroundingRequired: true
  });

  const [results, setResults] = useState<GroundingResults | null>(null);

  useEffect(() => {
    calculateGroundingSystem();
  }, [inputs]);

  const calculateGroundingSystem = () => {
    // Get grounding electrode conductor size (NEC Table 250.66)
    let gecSize = groundingElectrodeSizeTable[inputs.largestUngroundedConductor] || '4/0';
    
    // Special cases for specific electrode types
    if (inputs.electrodeType === 'rod' && ['8', '6'].includes(gecSize)) {
      gecSize = '6'; // NEC 250.66(A) - Rod electrodes max #6
    } else if (inputs.electrodeType === 'plate' && ['8', '6', '4'].includes(gecSize)) {
      gecSize = '4'; // NEC 250.66(B) - Plate electrodes max #4
    }

    // Get equipment grounding conductor size (NEC Table 250.122)
    let egcSize = '6';
    for (const [amps, size] of Object.entries(equipmentGroundingSizeTable)) {
      if (inputs.serviceSize <= Number(amps)) {
        egcSize = size;
        break;
      }
    }

    // Calculate main bonding jumper size (NEC 250.102(C))
    const mbjSize = gecSize; // Generally same as GEC

    // Calculate system bonding jumper for separately derived systems
    let sbjSize = null;
    if (inputs.separatelyDerivedSystem) {
      sbjSize = gecSize; // NEC 250.30(A)
    }

    // Calculate grounding electrode resistance
    let resistance = 0;
    switch (inputs.electrodeType) {
      case 'rod':
        // Dwight's formula for ground rod resistance
        const rodLengthCm = inputs.rodLength * 30.48;
        const rodRadiusCm = (inputs.rodDiameter / 2) * 2.54;
        const singleRodResistance = (inputs.soilResistivity / (2 * Math.PI * rodLengthCm)) * 
          (Math.log(4 * rodLengthCm / rodRadiusCm) - 1);
        
        // Multiple rod correction (approximate)
        if (inputs.numberOfRods > 1) {
          const spacing = inputs.rodLength * 2; // Assume 2x rod length spacing
          const alpha = 1.0 - 0.9 * Math.exp(-0.03 * spacing / inputs.rodLength);
          resistance = singleRodResistance / (inputs.numberOfRods * alpha);
        } else {
          resistance = singleRodResistance;
        }
        break;
        
      case 'plate':
        // Plate electrode resistance
        const plateSideCm = Math.sqrt(inputs.plateArea) * 30.48;
        resistance = inputs.soilResistivity / (4 * plateSideCm);
        break;
        
      case 'ring':
        // Ring electrode resistance (approximate)
        const ringRadiusCm = (inputs.ringLength / (2 * Math.PI)) * 30.48;
        resistance = inputs.soilResistivity / (4 * Math.PI * ringRadiusCm);
        break;
        
      case 'ufer':
        // Concrete encased electrode (very low resistance)
        resistance = 1 + (inputs.soilResistivity / 3000) * 2;
        break;
        
      case 'water':
        // Metal water pipe (excellent ground)
        resistance = 0.5 + (inputs.soilResistivity / 10000) * 0.5;
        break;
        
      case 'multiple':
        // Multiple electrode types (best case)
        resistance = 2; // Assume excellent combined system
        break;
    }

    // Check if resistance meets NEC requirements
    const meetsResistanceRequirement = resistance <= 25; // NEC 250.53(A)(2)
    const supplementalElectrodeRequired = !meetsResistanceRequirement && 
      ['rod', 'plate'].includes(inputs.electrodeType);

    // Generate recommendations
    const recommendations: string[] = [];
    const necReferences: string[] = [];

    if (!meetsResistanceRequirement) {
      recommendations.push('Install supplemental grounding electrode to reduce resistance below 25 ohms');
      necReferences.push('NEC 250.53(A)(2) - Supplemental Electrode Required');
    }

    if (inputs.electrodeType === 'rod' && inputs.numberOfRods < 2) {
      recommendations.push('Install minimum 2 ground rods spaced at least 6 feet apart');
      necReferences.push('NEC 250.53(A)(3) - Rod Electrode Installation');
    }

    if (inputs.buildingType === 'commercial' && inputs.electrodeType !== 'multiple') {
      recommendations.push('Consider multiple grounding electrode types for commercial buildings');
      necReferences.push('NEC 250.50 - Grounding Electrode System');
    }

    if (inputs.soilResistivity > 10000) {
      recommendations.push('High soil resistivity detected - consider chemical ground rods or ground enhancement material');
      recommendations.push('Perform soil resistivity testing per IEEE Std 81');
    }

    if (inputs.conductorMaterial === 'aluminum') {
      recommendations.push('Ensure aluminum grounding conductors are listed for the purpose');
      necReferences.push('NEC 250.64(A) - Aluminum Grounding Conductors');
    }

    // Additional NEC references
    necReferences.push('NEC 250.66 - Grounding Electrode Conductor Sizing');
    necReferences.push('NEC 250.122 - Equipment Grounding Conductor Sizing');
    necReferences.push('NEC 250.24(C) - Grounded Conductor to Grounding Electrode');
    necReferences.push('NEC 250.102(C) - Main Bonding Jumper');

    setResults({
      groundingElectrodeConductor: {
        size: gecSize,
        nec250_66: true
      },
      equipmentGroundingConductor: {
        size: egcSize,
        nec250_122: true
      },
      mainBondingJumper: {
        size: mbjSize,
        nec250_102C: true
      },
      groundingElectrodeResistance: resistance,
      meetsResistanceRequirement,
      supplementalElectrodeRequired,
      systemBondingJumper: sbjSize,
      recommendations,
      necReferences
    });
  };

  const updateInput = (field: keyof GroundingInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Get equipment grounding conductor size for aluminum
  const getAluminumEGCSize = (copperSize: string): string => {
    const sizeMap: Record<string, string> = {
      '14': '12', '12': '10', '10': '8', '8': '6',
      '6': '4', '4': '2', '3': '1', '2': '1/0',
      '1': '2/0', '1/0': '3/0', '2/0': '4/0',
      '3/0': '250', '4/0': '350', '250': '400',
      '350': '600', '400': '600', '500': '750',
      '600': '1000', '700': '1200', '800': '1250'
    };
    return sizeMap[copperSize] || copperSize;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-green-400" />
            Grounding System Calculator
          </CardTitle>
          <CardDescription className="text-gray-400">
            NEC compliant grounding and bonding system design per Article 250
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Sections */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Service Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Service Information</h4>
              
              <div>
                <label className="text-xs text-gray-400">Service Size (A)</label>
                <input
                  type="number"
                  value={inputs.serviceSize}
                  onChange={(e) => updateInput('serviceSize', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  min="15"
                  max="6000"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">System Voltage (V)</label>
                <select
                  value={inputs.voltage}
                  onChange={(e) => updateInput('voltage', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value={120}>120/240V</option>
                  <option value={208}>208V</option>
                  <option value={240}>240V</option>
                  <option value={480}>480V</option>
                  <option value={600}>600V</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Phase Configuration</label>
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
                <label className="text-xs text-gray-400">Conductor Material</label>
                <select
                  value={inputs.conductorMaterial}
                  onChange={(e) => updateInput('conductorMaterial', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="copper">Copper</option>
                  <option value="aluminum">Aluminum</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Largest Ungrounded Conductor</label>
                <select
                  value={inputs.largestUngroundedConductor}
                  onChange={(e) => updateInput('largestUngroundedConductor', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="12">12 AWG</option>
                  <option value="10">10 AWG</option>
                  <option value="8">8 AWG</option>
                  <option value="6">6 AWG</option>
                  <option value="4">4 AWG</option>
                  <option value="3">3 AWG</option>
                  <option value="2">2 AWG</option>
                  <option value="1">1 AWG</option>
                  <option value="1/0">1/0 AWG</option>
                  <option value="2/0">2/0 AWG</option>
                  <option value="3/0">3/0 AWG</option>
                  <option value="4/0">4/0 AWG</option>
                  <option value="250">250 MCM</option>
                  <option value="300">300 MCM</option>
                  <option value="350">350 MCM</option>
                  <option value="400">400 MCM</option>
                  <option value="500">500 MCM</option>
                  <option value="600">600 MCM</option>
                  <option value="750">750 MCM</option>
                  <option value="1000">1000 MCM</option>
                  <option value="1250">1250 MCM</option>
                  <option value="1500">1500 MCM</option>
                  <option value="1750">1750 MCM</option>
                  <option value="2000">2000 MCM</option>
                </select>
              </div>
            </div>

            {/* Grounding Electrode Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Grounding Electrode</h4>
              
              <div>
                <label className="text-xs text-gray-400">Electrode Type</label>
                <select
                  value={inputs.electrodeType}
                  onChange={(e) => updateInput('electrodeType', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="rod">Ground Rod</option>
                  <option value="plate">Ground Plate</option>
                  <option value="ring">Ground Ring</option>
                  <option value="ufer">Concrete Encased (Ufer)</option>
                  <option value="water">Metal Water Pipe</option>
                  <option value="multiple">Multiple Types</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400">Soil Resistivity (Ω-cm)</label>
                <select
                  value={inputs.soilResistivity}
                  onChange={(e) => updateInput('soilResistivity', Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value={1000}>Wet Organic Soil (1,000)</option>
                  <option value={3000}>Moist Soil (3,000)</option>
                  <option value={10000}>Dry Soil (10,000)</option>
                  <option value={100000}>Bedrock (100,000)</option>
                  <option value={3000}>Concrete Encased (3,000)</option>
                </select>
              </div>

              {inputs.electrodeType === 'rod' && (
                <>
                  <div>
                    <label className="text-xs text-gray-400">Number of Rods</label>
                    <input
                      type="number"
                      value={inputs.numberOfRods}
                      onChange={(e) => updateInput('numberOfRods', Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400">Rod Length (ft)</label>
                    <select
                      value={inputs.rodLength}
                      onChange={(e) => updateInput('rodLength', Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value={8}>8 ft</option>
                      <option value={10}>10 ft</option>
                      <option value={12}>12 ft</option>
                      <option value={20}>20 ft</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400">Rod Diameter (in)</label>
                    <select
                      value={inputs.rodDiameter}
                      onChange={(e) => updateInput('rodDiameter', Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    >
                      <option value={0.5}>1/2"</option>
                      <option value={0.625}>5/8"</option>
                      <option value={0.75}>3/4"</option>
                      <option value={1.0}>1"</option>
                    </select>
                  </div>
                </>
              )}

              {inputs.electrodeType === 'plate' && (
                <div>
                  <label className="text-xs text-gray-400">Plate Area (sq ft)</label>
                  <input
                    type="number"
                    value={inputs.plateArea}
                    onChange={(e) => updateInput('plateArea', Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    min="2"
                    step="0.5"
                  />
                </div>
              )}

              {inputs.electrodeType === 'ring' && (
                <div>
                  <label className="text-xs text-gray-400">Ring Length (ft)</label>
                  <input
                    type="number"
                    value={inputs.ringLength}
                    onChange={(e) => updateInput('ringLength', Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    min="20"
                  />
                </div>
              )}
            </div>

            {/* Building and System Type */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Building & System</h4>
              
              <div>
                <label className="text-xs text-gray-400">Building Type</label>
                <select
                  value={inputs.buildingType}
                  onChange={(e) => updateInput('buildingType', e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={inputs.separatelyDerivedSystem}
                    onChange={(e) => updateInput('separatelyDerivedSystem', e.target.checked)}
                    className="w-4 h-4"
                  />
                  Separately Derived System
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={inputs.equipmentGroundingRequired}
                    onChange={(e) => updateInput('equipmentGroundingRequired', e.target.checked)}
                    className="w-4 h-4"
                  />
                  Equipment Grounding Required
                </label>
              </div>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="mt-6 space-y-6">
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-medium text-white mb-4">Grounding System Requirements</h4>
                
                {/* Conductor Sizing Results */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">Grounding Electrode Conductor</p>
                        <Badge variant="outline" className="text-xs">NEC 250.66</Badge>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {results.groundingElectrodeConductor.size} {inputs.conductorMaterial === 'copper' ? 'Cu' : 'Al'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Based on {inputs.largestUngroundedConductor} service conductor
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">Equipment Grounding Conductor</p>
                        <Badge variant="outline" className="text-xs">NEC 250.122</Badge>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {inputs.conductorMaterial === 'copper' 
                          ? results.equipmentGroundingConductor.size 
                          : getAluminumEGCSize(results.equipmentGroundingConductor.size)
                        } {inputs.conductorMaterial === 'copper' ? 'Cu' : 'Al'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        For {inputs.serviceSize}A overcurrent device
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">Main Bonding Jumper</p>
                        <Badge variant="outline" className="text-xs">NEC 250.102(C)</Badge>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {results.mainBondingJumper.size} {inputs.conductorMaterial === 'copper' ? 'Cu' : 'Al'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Service equipment bonding
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Grounding Resistance Analysis */}
                <Card className={`bg-gray-800/50 mb-6 border ${results.meetsResistanceRequirement ? 'border-green-600' : 'border-orange-600'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-white mb-2">Grounding Electrode Resistance</h5>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-3xl font-bold text-white">{results.groundingElectrodeResistance.toFixed(1)}Ω</p>
                            <p className="text-xs text-gray-400">Calculated resistance</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-300">NEC Maximum: 25Ω</p>
                            <p className="text-gray-300">IEEE Recommended: ≤5Ω</p>
                          </div>
                        </div>
                      </div>
                      {results.meetsResistanceRequirement ? (
                        <CheckCircle className="w-12 h-12 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-12 h-12 text-orange-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Alerts */}
                {results.supplementalElectrodeRequired && (
                  <Alert className="mb-4 border-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Supplemental Electrode Required</AlertTitle>
                    <AlertDescription>
                      NEC 250.53(A)(2) - Single rod or plate electrode exceeds 25 ohms. 
                      Install additional electrode(s) to meet resistance requirement.
                    </AlertDescription>
                  </Alert>
                )}

                {inputs.separatelyDerivedSystem && results.systemBondingJumper && (
                  <Alert className="mb-4 border-blue-600">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Separately Derived System</AlertTitle>
                    <AlertDescription>
                      System Bonding Jumper Required: {results.systemBondingJumper} {inputs.conductorMaterial === 'copper' ? 'Cu' : 'Al'} per NEC 250.30(A)
                    </AlertDescription>
                  </Alert>
                )}

                {/* Recommendations */}
                {results.recommendations.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700 mb-4">
                    <CardHeader>
                      <CardTitle className="text-sm text-white">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {results.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* NEC References */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">NEC Code References</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-300">
                      {results.necReferences.map((ref, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">NEC</Badge>
                          <span>{ref}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              Grounding Electrode Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <p><strong>Rod Electrodes:</strong> Min 8 ft long, 5/8" diameter (NEC 250.52(A)(5))</p>
            <p><strong>Plate Electrodes:</strong> Min 2 sq ft surface area (NEC 250.52(A)(7))</p>
            <p><strong>Ring Electrodes:</strong> Min #2 AWG, 20 ft long (NEC 250.52(A)(4))</p>
            <p><strong>Concrete Encased:</strong> Min 20 ft of #4 rebar (NEC 250.52(A)(3))</p>
            <p><strong>Water Pipe:</strong> Min 10 ft in contact with earth (NEC 250.52(A)(1))</p>
            <p><strong>Building Steel:</strong> Effectively grounded structure (NEC 250.52(A)(2))</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-300">
            <p>• Test soil resistivity before design (IEEE Std 81)</p>
            <p>• Use exothermic welding for below-grade connections</p>
            <p>• Install test wells for maintenance access</p>
            <p>• Consider chemical ground rods for high resistance soils</p>
            <p>• Maintain 6 ft minimum spacing between rods</p>
            <p>• Document all grounding connections and test results</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}