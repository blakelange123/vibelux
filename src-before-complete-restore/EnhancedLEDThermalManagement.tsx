'use client';

import React, { useState, useEffect } from 'react';
import { 
  Thermometer,
  Zap,
  Wind,
  AlertTriangle,
  TrendingDown,
  Activity,
  Settings,
  Target,
  Fan,
  Droplets,
  BarChart3,
  Download,
  Info,
  Calculator,
  Shield,
  Clock,
  DollarSign,
  Gauge,
  Flame
} from 'lucide-react';

interface LEDModelPreset {
  id: string;
  name: string;
  manufacturer: string;
  wattage: number;
  chipCount: number;
  efficiency: number; // lumens/watt or μmol/J
  maxJunctionTemp: number;
  thermalResistance: number;
  typicalLifespan: number;
}

const LED_PRESETS: LEDModelPreset[] = [
  {
    id: 'samsung-lm301h',
    name: 'Samsung LM301H',
    manufacturer: 'Samsung',
    wattage: 0.2,
    chipCount: 3024,
    efficiency: 2.92,
    maxJunctionTemp: 105,
    thermalResistance: 8.1,
    typicalLifespan: 50000
  },
  {
    id: 'osram-oslon-ssl',
    name: 'Osram Oslon SSL 150',
    manufacturer: 'Osram',
    wattage: 3,
    chipCount: 200,
    efficiency: 2.7,
    maxJunctionTemp: 135,
    thermalResistance: 3.5,
    typicalLifespan: 60000
  },
  {
    id: 'cree-xp-g3',
    name: 'Cree XP-G3',
    manufacturer: 'Cree',
    wattage: 5,
    chipCount: 120,
    efficiency: 2.8,
    maxJunctionTemp: 150,
    thermalResistance: 2.5,
    typicalLifespan: 50000
  },
  {
    id: 'bridgelux-vesta',
    name: 'Bridgelux Vesta',
    manufacturer: 'Bridgelux',
    wattage: 1.5,
    chipCount: 400,
    efficiency: 2.75,
    maxJunctionTemp: 125,
    thermalResistance: 4.2,
    typicalLifespan: 55000
  }
];

interface CoolingSystemPreset {
  id: string;
  name: string;
  type: 'passive' | 'active' | 'liquid';
  thermalResistance: number;
  powerConsumption: number;
  cost: number;
  noiseLevel: number;
}

const COOLING_PRESETS: CoolingSystemPreset[] = [
  {
    id: 'passive-aluminum',
    name: 'Passive Aluminum Heat Sink',
    type: 'passive',
    thermalResistance: 1.2,
    powerConsumption: 0,
    cost: 50,
    noiseLevel: 0
  },
  {
    id: 'active-fan',
    name: 'Active Fan Cooling',
    type: 'active',
    thermalResistance: 0.5,
    powerConsumption: 20,
    cost: 150,
    noiseLevel: 35
  },
  {
    id: 'pin-fin',
    name: 'Pin Fin Heat Sink + Fan',
    type: 'active',
    thermalResistance: 0.3,
    powerConsumption: 30,
    cost: 250,
    noiseLevel: 40
  },
  {
    id: 'liquid-cooled',
    name: 'Liquid Cooling System',
    type: 'liquid',
    thermalResistance: 0.1,
    powerConsumption: 50,
    cost: 500,
    noiseLevel: 25
  }
];

interface ThermalAnalysisResult {
  junctionTemp: number;
  caseTemp: number;
  heatSinkTemp: number;
  powerDissipated: number;
  thermalEfficiency: number;
  estimatedLifespan: number;
  degradationRate: number;
  thermalRisk: 'low' | 'medium' | 'high' | 'critical';
  coolingAdequacy: 'oversized' | 'adequate' | 'marginal' | 'insufficient';
}

export function EnhancedLEDThermalManagement() {
  // Input parameters
  const [fixtureWattage, setFixtureWattage] = useState(600);
  const [ledModel, setLedModel] = useState<LEDModelPreset>(LED_PRESETS[0]);
  const [coolingSystem, setCoolingSystem] = useState<CoolingSystemPreset>(COOLING_PRESETS[1]);
  const [ambientTemp, setAmbientTemp] = useState(25);
  const [operatingHours, setOperatingHours] = useState(12);
  const [dimLevel, setDimLevel] = useState(100);
  const [electricityCost, setElectricityCost] = useState(0.12);
  
  // Environmental factors
  const [humidity, setHumidity] = useState(60);
  const [altitude, setAltitude] = useState(0);
  const [enclosureType, setEnclosureType] = useState<'open' | 'vented' | 'sealed'>('vented');
  
  // Analysis results
  const [analysis, setAnalysis] = useState<ThermalAnalysisResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Perform thermal analysis
  useEffect(() => {
    calculateThermalPerformance();
  }, [fixtureWattage, ledModel, coolingSystem, ambientTemp, dimLevel, humidity, altitude, enclosureType]);

  const calculateThermalPerformance = () => {
    // Actual power based on dimming
    const actualPower = fixtureWattage * (dimLevel / 100);
    
    // Power dissipated as heat (inverse of efficiency)
    const heatGenerated = actualPower * (1 - ledModel.efficiency / 100);
    
    // Altitude derating factor (reduced cooling at altitude)
    const altitudeFactor = 1 + (altitude / 1000) * 0.01;
    
    // Enclosure factor
    const enclosureFactor = enclosureType === 'sealed' ? 1.3 : enclosureType === 'vented' ? 1.1 : 1.0;
    
    // Total thermal resistance
    const junctionToCase = ledModel.thermalResistance / ledModel.chipCount;
    const caseToHeatSink = 0.15; // Thermal interface material
    const heatSinkToAmbient = coolingSystem.thermalResistance * altitudeFactor * enclosureFactor;
    const totalResistance = junctionToCase + caseToHeatSink + heatSinkToAmbient;
    
    // Temperature calculations
    const junctionTemp = ambientTemp + (heatGenerated * totalResistance);
    const heatSinkTemp = ambientTemp + (heatGenerated * heatSinkToAmbient);
    const caseTemp = heatSinkTemp + (heatGenerated * caseToHeatSink);
    
    // Thermal efficiency
    const thermalEfficiency = ((actualPower - heatGenerated) / actualPower) * 100;
    
    // Lifespan calculation using Arrhenius equation
    const activationEnergy = 0.7; // eV
    const k = 8.617e-5; // Boltzmann constant in eV/K
    const referenceTemp = 25 + 273.15; // K
    const junctionTempK = junctionTemp + 273.15; // K
    
    const accelerationFactor = Math.exp(
      (activationEnergy / k) * ((1 / referenceTemp) - (1 / junctionTempK))
    );
    
    const estimatedLifespan = ledModel.typicalLifespan / accelerationFactor;
    
    // Degradation rate (%/1000 hours)
    const baseDepreciation = 0.2; // %/1000hrs at 25°C
    const degradationRate = baseDepreciation * accelerationFactor;
    
    // Risk assessment
    let thermalRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const tempRatio = junctionTemp / ledModel.maxJunctionTemp;
    if (tempRatio > 0.95) thermalRisk = 'critical';
    else if (tempRatio > 0.85) thermalRisk = 'high';
    else if (tempRatio > 0.75) thermalRisk = 'medium';
    
    // Cooling adequacy
    let coolingAdequacy: 'oversized' | 'adequate' | 'marginal' | 'insufficient' = 'adequate';
    if (tempRatio < 0.6) coolingAdequacy = 'oversized';
    else if (tempRatio > 0.85) coolingAdequacy = 'insufficient';
    else if (tempRatio > 0.75) coolingAdequacy = 'marginal';
    
    setAnalysis({
      junctionTemp,
      caseTemp,
      heatSinkTemp,
      powerDissipated: heatGenerated,
      thermalEfficiency,
      estimatedLifespan,
      degradationRate,
      thermalRisk,
      coolingAdequacy
    });
  };

  const calculateROI = () => {
    if (!analysis) return null;
    
    // Energy savings from thermal efficiency
    const yearlyEnergyUse = fixtureWattage * operatingHours * 365 / 1000; // kWh
    const yearlyEnergyCost = yearlyEnergyUse * electricityCost;
    
    // Cooling energy
    const coolingEnergy = coolingSystem.powerConsumption * operatingHours * 365 / 1000;
    const coolingCost = coolingEnergy * electricityCost;
    
    // Replacement costs based on lifespan
    const replacementsPerYear = (operatingHours * 365) / analysis.estimatedLifespan;
    const fixtureReplacementCost = fixtureWattage * 0.5; // $0.50/watt estimate
    const yearlyReplacementCost = replacementsPerYear * fixtureReplacementCost;
    
    // Total cost of ownership
    const yearlyTotalCost = yearlyEnergyCost + coolingCost + yearlyReplacementCost;
    
    return {
      yearlyEnergyUse,
      yearlyEnergyCost,
      coolingCost,
      yearlyReplacementCost,
      yearlyTotalCost,
      fiveYearTCO: yearlyTotalCost * 5
    };
  };

  const generateRecommendations = () => {
    if (!analysis) return [];
    
    const recommendations = [];
    
    if (analysis.thermalRisk === 'critical' || analysis.thermalRisk === 'high') {
      recommendations.push({
        priority: 'high',
        title: 'Reduce Junction Temperature',
        description: `Current temperature (${analysis.junctionTemp.toFixed(1)}°C) is too high. Consider upgrading cooling or reducing power.`,
        savings: `Extend lifespan by ${((ledModel.typicalLifespan / analysis.estimatedLifespan) - 1).toFixed(1)}x`
      });
    }
    
    if (analysis.coolingAdequacy === 'insufficient' || analysis.coolingAdequacy === 'marginal') {
      const betterCooling = COOLING_PRESETS.find(c => c.thermalResistance < coolingSystem.thermalResistance);
      if (betterCooling) {
        recommendations.push({
          priority: 'medium',
          title: `Upgrade to ${betterCooling.name}`,
          description: 'Better cooling will reduce junction temperature and extend LED life.',
          savings: `Reduce replacement costs by $${(calculateROI()?.yearlyReplacementCost || 0 * 0.3).toFixed(0)}/year`
        });
      }
    }
    
    if (analysis.coolingAdequacy === 'oversized' && coolingSystem.type !== 'passive') {
      recommendations.push({
        priority: 'low',
        title: 'Consider Passive Cooling',
        description: 'Current cooling is more than adequate. Passive cooling could save energy.',
        savings: `Save $${(calculateROI()?.coolingCost || 0).toFixed(0)}/year in cooling energy`
      });
    }
    
    if (dimLevel < 80 && analysis.junctionTemp < ledModel.maxJunctionTemp * 0.7) {
      recommendations.push({
        priority: 'low',
        title: 'Increase Light Output',
        description: 'Thermal headroom available to increase light intensity if needed.',
        savings: 'Improve $/PPF efficiency'
      });
    }
    
    return recommendations;
  };

  const exportReport = () => {
    const report = {
      configuration: {
        fixture: { wattage: fixtureWattage, dimLevel },
        led: ledModel,
        cooling: coolingSystem,
        environment: { ambientTemp, humidity, altitude, enclosureType }
      },
      analysis,
      roi: calculateROI(),
      recommendations: generateRecommendations(),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `led-thermal-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const roi = calculateROI();
  const recommendations = generateRecommendations();

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Thermometer className="w-6 h-6 text-red-600" />
          LED Thermal Management Calculator
        </h3>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Analysis
        </button>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Fixture Configuration */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Fixture Configuration
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Fixture Wattage
              </label>
              <input
                type="number"
                value={fixtureWattage}
                onChange={(e) => setFixtureWattage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                min="50"
                max="2000"
                step="50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                LED Model
              </label>
              <select
                value={ledModel.id}
                onChange={(e) => setLedModel(LED_PRESETS.find(m => m.id === e.target.value) || LED_PRESETS[0])}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {LED_PRESETS.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.efficiency} μmol/J
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Dimming Level (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  value={dimLevel}
                  onChange={(e) => setDimLevel(Number(e.target.value))}
                  className="flex-1"
                  min="20"
                  max="100"
                  step="5"
                />
                <span className="w-12 text-right font-medium text-gray-200">{dimLevel}%</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Daily Operating Hours
              </label>
              <input
                type="number"
                value={operatingHours}
                onChange={(e) => setOperatingHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                min="1"
                max="24"
              />
            </div>
          </div>
        </div>

        {/* Cooling & Environment */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-blue-600" />
            Cooling & Environment
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Cooling System
              </label>
              <select
                value={coolingSystem.id}
                onChange={(e) => setCoolingSystem(COOLING_PRESETS.find(c => c.id === e.target.value) || COOLING_PRESETS[0])}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {COOLING_PRESETS.map(cooling => (
                  <option key={cooling.id} value={cooling.id}>
                    {cooling.name} - {cooling.thermalResistance}°C/W
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ambient Temperature (°C)
              </label>
              <input
                type="number"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                min="10"
                max="40"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Enclosure Type
              </label>
              <select
                value={enclosureType}
                onChange={(e) => setEnclosureType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="open">Open (Best Airflow)</option>
                <option value="vented">Vented Enclosure</option>
                <option value="sealed">Sealed (IP65+)</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </button>
            
            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Humidity (%)
                  </label>
                  <input
                    type="number"
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min="20"
                    max="90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Altitude (m)
                  </label>
                  <input
                    type="number"
                    value={altitude}
                    onChange={(e) => setAltitude(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max="3000"
                    step="100"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Temperature Analysis */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Thermal Analysis Results
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Junction Temp</span>
                  <Thermometer className={`w-4 h-4 ${
                    analysis.thermalRisk === 'critical' ? 'text-red-600' :
                    analysis.thermalRisk === 'high' ? 'text-orange-600' :
                    analysis.thermalRisk === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                </div>
                <p className="text-2xl font-bold text-gray-100">{analysis.junctionTemp.toFixed(1)}°C</p>
                <p className="text-xs text-gray-400 mt-1">Max: {ledModel.maxJunctionTemp}°C</p>
                <div className="mt-2 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      analysis.thermalRisk === 'critical' ? 'bg-red-500' :
                      analysis.thermalRisk === 'high' ? 'bg-orange-500' :
                      analysis.thermalRisk === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (analysis.junctionTemp / ledModel.maxJunctionTemp) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Heat Dissipated</span>
                  <Flame className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-100">{analysis.powerDissipated.toFixed(0)}W</p>
                <p className="text-xs text-gray-400 mt-1">{((analysis.powerDissipated / (fixtureWattage * dimLevel / 100)) * 100).toFixed(0)}% of input</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">LED Lifespan</span>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-100">{(analysis.estimatedLifespan / 1000).toFixed(0)}k</p>
                <p className="text-xs text-gray-400 mt-1">hours @ {operatingHours}h/day</p>
                <p className="text-xs text-gray-400">{(analysis.estimatedLifespan / (operatingHours * 365)).toFixed(1)} years</p>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Cooling Status</span>
                  <Shield className={`w-4 h-4 ${
                    analysis.coolingAdequacy === 'insufficient' ? 'text-red-600' :
                    analysis.coolingAdequacy === 'marginal' ? 'text-yellow-600' :
                    analysis.coolingAdequacy === 'oversized' ? 'text-blue-600' :
                    'text-green-600'
                  }`} />
                </div>
                <p className="text-lg font-bold text-gray-100 capitalize">{analysis.coolingAdequacy}</p>
                <p className="text-xs text-gray-400 mt-1">R-total: {(ledModel.thermalResistance / ledModel.chipCount + 0.15 + coolingSystem.thermalResistance).toFixed(2)}°C/W</p>
              </div>
            </div>

            {/* Temperature Cascade */}
            <div className="mt-4 bg-white rounded-lg p-4">
              <p className="text-sm font-medium text-gray-200 mb-2">Temperature Cascade</p>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <p className="text-gray-400">Ambient</p>
                  <p className="font-semibold text-gray-200">{ambientTemp}°C</p>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-gray-600 mx-2" />
                <div className="text-center">
                  <p className="text-gray-400">Heat Sink</p>
                  <p className="font-semibold text-gray-200">{analysis.heatSinkTemp.toFixed(1)}°C</p>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-gray-600 mx-2" />
                <div className="text-center">
                  <p className="text-gray-400">Case</p>
                  <p className="font-semibold text-gray-200">{analysis.caseTemp.toFixed(1)}°C</p>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-gray-600 mx-2" />
                <div className="text-center">
                  <p className="text-gray-400">Junction</p>
                  <p className="font-semibold text-red-600">{analysis.junctionTemp.toFixed(1)}°C</p>
                </div>
              </div>
            </div>
          </div>

          {/* ROI Analysis */}
          {roi && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-blue-300 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Cost Analysis
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-blue-400">Energy Cost</p>
                  <p className="text-xl font-semibold text-blue-200">${roi.yearlyEnergyCost.toFixed(0)}/yr</p>
                </div>
                <div>
                  <p className="text-blue-400">Cooling Cost</p>
                  <p className="text-xl font-semibold text-blue-200">${roi.coolingCost.toFixed(0)}/yr</p>
                </div>
                <div>
                  <p className="text-blue-400">Replacement Cost</p>
                  <p className="text-xl font-semibold text-blue-200">${roi.yearlyReplacementCost.toFixed(0)}/yr</p>
                </div>
                <div>
                  <p className="text-blue-400">Total Annual</p>
                  <p className="text-xl font-semibold text-blue-200">${roi.yearlyTotalCost.toFixed(0)}/yr</p>
                </div>
                <div>
                  <p className="text-blue-400">5-Year TCO</p>
                  <p className="text-xl font-semibold text-blue-200">${roi.fiveYearTCO.toFixed(0)}</p>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-blue-300">
                <Info className="w-4 h-4 inline mr-1" />
                Thermal efficiency: {analysis.thermalEfficiency.toFixed(1)}% • 
                Degradation rate: {analysis.degradationRate.toFixed(2)}%/1000hrs
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-6">
              <h4 className="font-semibold text-green-300 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Optimization Recommendations
              </h4>
              
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    rec.priority === 'high' ? 'bg-red-900/20 border-red-800' :
                    rec.priority === 'medium' ? 'bg-yellow-900/20 border-yellow-800' :
                    'bg-blue-900/20 border-blue-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-gray-100">{rec.title}</h5>
                        <p className="text-sm text-gray-300 mt-1">{rec.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${
                          rec.priority === 'high' ? 'bg-red-800 text-red-200' :
                          rec.priority === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                          'bg-blue-800 text-blue-200'
                        }`}>
                          {rec.priority}
                        </span>
                        {rec.savings && (
                          <p className="text-sm font-medium text-green-400 mt-1">{rec.savings}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}