'use client';

import React, { useState, useEffect } from 'react';
import { 
  Droplets, Activity, TreePine, Zap, AlertTriangle, 
  TrendingUp, TrendingDown, Info, Settings, WifiOff,
  Wifi, BarChart3, Clock, Target, Gauge, Brain,
  Heart, Waves, Eye, Shield, ThermometerSun
} from 'lucide-react';

// Sensor Types and Interfaces
export interface SapFlowSensor {
  id: string;
  plantId: string;
  location: string;
  type: 'sap-flow';
  status: 'online' | 'offline' | 'calibrating';
  currentFlow: number; // g/h (grams per hour)
  dailyTotal: number; // liters
  stemDiameter: number; // mm
  flowVelocity: number; // cm/h
  waterPotential: number; // MPa
  lastCalibration: Date;
  alerts: {
    waterStress: boolean;
    abnormalFlow: boolean;
    sensorDrift: boolean;
  };
}

export interface StomatalConductanceSensor {
  id: string;
  plantId: string;
  leafPosition: 'upper' | 'middle' | 'lower';
  type: 'stomatal';
  status: 'online' | 'offline' | 'measuring';
  conductance: number; // mmol/m²/s
  resistance: number; // s/m
  transpirationRate: number; // mmol/m²/s
  leafTemperature: number; // °C
  vpdLeaf: number; // kPa
  photosynthesisRate: number; // μmol/m²/s
  ci: number; // internal CO2 concentration (ppm)
  alerts: {
    stomataClosed: boolean;
    heatStress: boolean;
    waterStress: boolean;
  };
}

export interface Dendrometer {
  id: string;
  plantId: string;
  position: 'stem' | 'trunk' | 'branch';
  type: 'dendrometer';
  status: 'online' | 'offline' | 'recording';
  currentDiameter: number; // mm
  dailyChange: number; // mm
  growthRate: number; // mm/day
  contractionPhase: boolean;
  expansionPhase: boolean;
  maxDailyDiameter: number; // mm
  minDailyDiameter: number; // mm
  waterDeficit: number; // percentage
  alerts: {
    excessiveContraction: boolean;
    growthAnomaly: boolean;
    waterStress: boolean;
  };
}

export interface LeafWetnessSensor {
  id: string;
  zoneId: string;
  type: 'leaf-wetness';
  status: 'online' | 'offline' | 'drying';
  wetness: number; // 0-100%
  surfaceResistance: number; // kΩ
  leafTemperature: number; // °C
  dewPoint: number; // °C
  wetnessHours: number; // hours in last 24h
  diseaseRisk: {
    powderyMildew: number; // 0-100%
    botrytis: number; // 0-100%
    downyMildew: number; // 0-100%
  };
  alerts: {
    prolongedWetness: boolean;
    highDiseaseRisk: boolean;
    condensation: boolean;
  };
}

export interface PlantElectricalSensor {
  id: string;
  plantId: string;
  electrodePosition: 'leaf' | 'stem' | 'root';
  type: 'electrical';
  status: 'online' | 'offline' | 'recording';
  voltage: number; // mV
  currentFlow: number; // μA
  resistance: number; // Ω
  frequency: number; // Hz
  signalPattern: 'normal' | 'stress' | 'damage' | 'communication';
  actionPotentials: number; // count per minute
  variationPotentials: number; // count per hour
  alerts: {
    stressSignal: boolean;
    damageDetected: boolean;
    abnormalActivity: boolean;
  };
}

// Main Component
export function AdvancedPlantSensors() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sap-flow' | 'stomatal' | 'dendrometer' | 'wetness' | 'electrical'>('overview');
  
  // Mock sensor data - in production, this would come from actual sensors
  const [sapFlowSensors, setSapFlowSensors] = useState<SapFlowSensor[]>([
    {
      id: 'sap-001',
      plantId: 'plant-001',
      location: 'Row 1, Position 5',
      type: 'sap-flow',
      status: 'online',
      currentFlow: 125.5,
      dailyTotal: 2.8,
      stemDiameter: 45,
      flowVelocity: 15.2,
      waterPotential: -0.5,
      lastCalibration: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      alerts: {
        waterStress: false,
        abnormalFlow: false,
        sensorDrift: false
      }
    }
  ]);

  const [stomatalSensors, setStomatalSensors] = useState<StomatalConductanceSensor[]>([
    {
      id: 'stom-001',
      plantId: 'plant-001',
      leafPosition: 'upper',
      type: 'stomatal',
      status: 'online',
      conductance: 280,
      resistance: 3.57,
      transpirationRate: 4.2,
      leafTemperature: 24.5,
      vpdLeaf: 1.2,
      photosynthesisRate: 18.5,
      ci: 245,
      alerts: {
        stomataClosed: false,
        heatStress: false,
        waterStress: false
      }
    }
  ]);

  const [dendrometers, setDendrometers] = useState<Dendrometer[]>([
    {
      id: 'dend-001',
      plantId: 'plant-001',
      position: 'stem',
      type: 'dendrometer',
      status: 'online',
      currentDiameter: 45.2,
      dailyChange: 0.3,
      growthRate: 0.3,
      contractionPhase: false,
      expansionPhase: true,
      maxDailyDiameter: 45.5,
      minDailyDiameter: 44.8,
      waterDeficit: 5,
      alerts: {
        excessiveContraction: false,
        growthAnomaly: false,
        waterStress: false
      }
    }
  ]);

  const [leafWetnessSensors, setLeafWetnessSensors] = useState<LeafWetnessSensor[]>([
    {
      id: 'wet-001',
      zoneId: 'zone-1',
      type: 'leaf-wetness',
      status: 'online',
      wetness: 15,
      surfaceResistance: 850,
      leafTemperature: 23.2,
      dewPoint: 18.5,
      wetnessHours: 2.5,
      diseaseRisk: {
        powderyMildew: 12,
        botrytis: 8,
        downyMildew: 5
      },
      alerts: {
        prolongedWetness: false,
        highDiseaseRisk: false,
        condensation: false
      }
    }
  ]);

  const [electricalSensors, setElectricalSensors] = useState<PlantElectricalSensor[]>([
    {
      id: 'elec-001',
      plantId: 'plant-001',
      electrodePosition: 'leaf',
      type: 'electrical',
      status: 'online',
      voltage: 75,
      currentFlow: 0.5,
      resistance: 150000,
      frequency: 0.1,
      signalPattern: 'normal',
      actionPotentials: 2,
      variationPotentials: 8,
      alerts: {
        stressSignal: false,
        damageDetected: false,
        abnormalActivity: false
      }
    }
  ]);

  // Update sensor data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Update sap flow
      setSapFlowSensors(prev => prev.map(sensor => ({
        ...sensor,
        currentFlow: sensor.currentFlow + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
        dailyTotal: sensor.dailyTotal + 0.001,
        flowVelocity: sensor.flowVelocity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2
      })));

      // Update stomatal conductance
      setStomatalSensors(prev => prev.map(sensor => ({
        ...sensor,
        conductance: Math.max(50, sensor.conductance + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20),
        transpirationRate: Math.max(0.5, sensor.transpirationRate + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.5),
        photosynthesisRate: Math.max(5, sensor.photosynthesisRate + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2)
      })));

      // Update dendrometer
      setDendrometers(prev => prev.map(sensor => ({
        ...sensor,
        currentDiameter: sensor.currentDiameter + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.3) * 0.01,
        waterDeficit: Math.max(0, Math.min(30, sensor.waterDeficit + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2))
      })));

      // Update leaf wetness
      setLeafWetnessSensors(prev => prev.map(sensor => ({
        ...sensor,
        wetness: Math.max(0, Math.min(100, sensor.wetness + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5)),
        diseaseRisk: {
          ...sensor.diseaseRisk,
          powderyMildew: Math.max(0, Math.min(100, sensor.diseaseRisk.powderyMildew + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2))
        }
      })));

      // Update electrical signals
      setElectricalSensors(prev => prev.map(sensor => ({
        ...sensor,
        voltage: sensor.voltage + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 5,
        actionPotentials: Math.max(0, sensor.actionPotentials + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3) - 1),
        variationPotentials: Math.max(0, sensor.variationPotentials + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2))
      })));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate overall plant stress
  const calculateOverallStress = () => {
    let stressScore = 0;
    let factors = 0;

    // Sap flow stress
    sapFlowSensors.forEach(sensor => {
      if (sensor.waterPotential < -1.0) stressScore += 20;
      factors++;
    });

    // Stomatal stress
    stomatalSensors.forEach(sensor => {
      if (sensor.conductance < 100) stressScore += 25;
      if (sensor.vpdLeaf > 2.0) stressScore += 15;
      factors++;
    });

    // Dendrometer stress
    dendrometers.forEach(sensor => {
      if (sensor.waterDeficit > 15) stressScore += 20;
      if (sensor.contractionPhase) stressScore += 10;
      factors++;
    });

    // Electrical stress
    electricalSensors.forEach(sensor => {
      if (sensor.signalPattern === 'stress') stressScore += 30;
      if (sensor.actionPotentials > 10) stressScore += 15;
      factors++;
    });

    return factors > 0 ? Math.min(100, stressScore / factors) : 0;
  };

  const overallStress = calculateOverallStress();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          Advanced Plant Communication System
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">
              Overall Plant Stress: {overallStress.toFixed(0)}%
            </span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            overallStress < 20 ? 'bg-green-900/50 text-green-400' :
            overallStress < 50 ? 'bg-yellow-900/50 text-yellow-400' :
            'bg-red-900/50 text-red-400'
          }`}>
            {overallStress < 20 ? 'Healthy' : overallStress < 50 ? 'Mild Stress' : 'High Stress'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {['overview', 'sap-flow', 'stomatal', 'dendrometer', 'wetness', 'electrical'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sap Flow Summary */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                Sap Flow
              </h4>
              <span className="text-xs text-green-400">Active</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400">Current Flow</p>
                <p className="text-lg font-semibold text-white">
                  {sapFlowSensors[0]?.currentFlow.toFixed(1)} g/h
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Daily Total</p>
                <p className="text-sm text-gray-300">
                  {sapFlowSensors[0]?.dailyTotal.toFixed(2)} L
                </p>
              </div>
              <div className="pt-2 border-t border-gray-600">
                <p className="text-xs text-gray-400">Water Status</p>
                <p className="text-sm text-green-400">Optimal Hydration</p>
              </div>
            </div>
          </div>

          {/* Stomatal Conductance Summary */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-400" />
                Stomatal Activity
              </h4>
              <span className="text-xs text-green-400">Normal</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400">Conductance</p>
                <p className="text-lg font-semibold text-white">
                  {stomatalSensors[0]?.conductance.toFixed(0)} mmol/m²/s
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Transpiration</p>
                <p className="text-sm text-gray-300">
                  {stomatalSensors[0]?.transpirationRate.toFixed(1)} mmol/m²/s
                </p>
              </div>
              <div className="pt-2 border-t border-gray-600">
                <p className="text-xs text-gray-400">Gas Exchange</p>
                <p className="text-sm text-green-400">Optimal</p>
              </div>
            </div>
          </div>

          {/* Dendrometer Summary */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <TreePine className="w-4 h-4 text-amber-400" />
                Growth Monitor
              </h4>
              <span className="text-xs text-green-400">Growing</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400">Stem Diameter</p>
                <p className="text-lg font-semibold text-white">
                  {dendrometers[0]?.currentDiameter.toFixed(1)} mm
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Daily Growth</p>
                <p className="text-sm text-gray-300">
                  +{dendrometers[0]?.dailyChange.toFixed(2)} mm
                </p>
              </div>
              <div className="pt-2 border-t border-gray-600">
                <p className="text-xs text-gray-400">Water Deficit</p>
                <p className="text-sm text-green-400">{dendrometers[0]?.waterDeficit}%</p>
              </div>
            </div>
          </div>

          {/* Leaf Wetness Summary */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Leaf Wetness
              </h4>
              <span className="text-xs text-green-400">Dry</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400">Current Wetness</p>
                <p className="text-lg font-semibold text-white">
                  {leafWetnessSensors[0]?.wetness.toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Wetness Hours (24h)</p>
                <p className="text-sm text-gray-300">
                  {leafWetnessSensors[0]?.wetnessHours.toFixed(1)} hrs
                </p>
              </div>
              <div className="pt-2 border-t border-gray-600">
                <p className="text-xs text-gray-400">Disease Risk</p>
                <p className="text-sm text-green-400">Low</p>
              </div>
            </div>
          </div>

          {/* Electrical Signals Summary */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Electrical Activity
              </h4>
              <span className="text-xs text-green-400">Normal</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400">Signal Pattern</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {electricalSensors[0]?.signalPattern}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Action Potentials</p>
                <p className="text-sm text-gray-300">
                  {electricalSensors[0]?.actionPotentials}/min
                </p>
              </div>
              <div className="pt-2 border-t border-gray-600">
                <p className="text-xs text-gray-400">Plant Status</p>
                <p className="text-sm text-green-400">No Stress Detected</p>
              </div>
            </div>
          </div>

          {/* Integrated Analysis */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                AI Analysis
              </h4>
              <span className="text-xs text-purple-400">Real-time</span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400">Plant Communication</p>
                <p className="text-sm text-gray-300">
                  Normal metabolic activity detected. Stomata responding well to light changes.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-600">
                <p className="text-xs text-gray-400 mb-1">Recommendations</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Maintain current VPD levels</li>
                  <li>• Next irrigation in 4 hours</li>
                  <li>• No intervention needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sap-flow' && (
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              Sap Flow Monitoring
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">How it works:</p>
                <p className="text-sm text-gray-300">
                  Heat pulse sensors measure the velocity of water movement through the plant's xylem. 
                  This provides real-time data on water uptake and transpiration rates.
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Key Benefits:</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Detect water stress 2-3 days before visual symptoms</li>
                  <li>• Optimize irrigation timing and volume</li>
                  <li>• Monitor plant water use efficiency</li>
                  <li>• Prevent over/under watering</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Flow Rate</p>
                  <p className="text-xl font-bold text-blue-400">
                    {sapFlowSensors[0]?.currentFlow.toFixed(1)} g/h
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Daily Total</p>
                  <p className="text-xl font-bold text-blue-400">
                    {sapFlowSensors[0]?.dailyTotal.toFixed(2)} L
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Water Potential</p>
                  <p className="text-xl font-bold text-blue-400">
                    {sapFlowSensors[0]?.waterPotential.toFixed(2)} MPa
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Flow Velocity</p>
                  <p className="text-xl font-bold text-blue-400">
                    {sapFlowSensors[0]?.flowVelocity.toFixed(1)} cm/h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stomatal' && (
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-400" />
              Stomatal Conductance Monitoring
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Technology:</p>
                <p className="text-sm text-gray-300">
                  Porometer sensors measure the rate of water vapor diffusion through stomata. 
                  This indicates how open or closed the stomata are in response to environmental conditions.
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Applications:</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Real-time stress detection</li>
                  <li>• Optimize light intensity and photoperiod</li>
                  <li>• Fine-tune VPD for maximum productivity</li>
                  <li>• Monitor photosynthesis efficiency</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Conductance</p>
                  <p className="text-xl font-bold text-green-400">
                    {stomatalSensors[0]?.conductance.toFixed(0)} mmol/m²/s
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Photosynthesis</p>
                  <p className="text-xl font-bold text-green-400">
                    {stomatalSensors[0]?.photosynthesisRate.toFixed(1)} μmol/m²/s
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Transpiration</p>
                  <p className="text-xl font-bold text-green-400">
                    {stomatalSensors[0]?.transpirationRate.toFixed(1)} mmol/m²/s
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Leaf VPD</p>
                  <p className="text-xl font-bold text-green-400">
                    {stomatalSensors[0]?.vpdLeaf.toFixed(2)} kPa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dendrometer' && (
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <TreePine className="w-5 h-5 text-amber-400" />
              Dendrometer Measurements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Measurement Principle:</p>
                <p className="text-sm text-gray-300">
                  High-precision sensors measure micro-changes in stem/trunk diameter. 
                  Plants shrink during the day (water loss) and expand at night (water uptake).
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Insights Provided:</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Real-time growth monitoring</li>
                  <li>• Water status assessment</li>
                  <li>• Stress detection before visible symptoms</li>
                  <li>• Optimal harvest timing</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Current Diameter</p>
                  <p className="text-xl font-bold text-amber-400">
                    {dendrometers[0]?.currentDiameter.toFixed(2)} mm
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Daily Growth</p>
                  <p className="text-xl font-bold text-amber-400">
                    +{dendrometers[0]?.dailyChange.toFixed(2)} mm
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Water Deficit</p>
                  <p className="text-xl font-bold text-amber-400">
                    {dendrometers[0]?.waterDeficit}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phase</p>
                  <p className="text-xl font-bold text-amber-400">
                    {dendrometers[0]?.expansionPhase ? 'Expansion' : 'Contraction'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wetness' && (
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Leaf Wetness Monitoring
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Sensor Technology:</p>
                <p className="text-sm text-gray-300">
                  Dielectric sensors measure surface moisture on artificial leaves that mimic plant leaves. 
                  Critical for disease prevention and optimal humidity management.
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Disease Prevention:</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Predict fungal infection windows</li>
                  <li>• Optimize dehumidification cycles</li>
                  <li>• Reduce pesticide use through timing</li>
                  <li>• Prevent condensation issues</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Wetness Level</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {leafWetnessSensors[0]?.wetness.toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Wetness Hours</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {leafWetnessSensors[0]?.wetnessHours.toFixed(1)} hrs
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">PM Risk</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {leafWetnessSensors[0]?.diseaseRisk.powderyMildew}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Dew Point</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {leafWetnessSensors[0]?.dewPoint.toFixed(1)}°C
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'electrical' && (
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Plant Electrical Signaling
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Detection Method:</p>
                <p className="text-sm text-gray-300">
                  Surface electrodes measure electrical signals in plant tissues. 
                  Plants use electrical signals for rapid communication between organs.
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Signal Types:</p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Action Potentials (AP) - rapid stress signals</li>
                  <li>• Variation Potentials (VP) - damage/wound signals</li>
                  <li>• System Potentials (SP) - slow stress signals</li>
                  <li>• Pattern recognition for early warning</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Voltage</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {electricalSensors[0]?.voltage.toFixed(0)} mV
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Signal Pattern</p>
                  <p className="text-xl font-bold text-yellow-400 capitalize">
                    {electricalSensors[0]?.signalPattern}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">AP Rate</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {electricalSensors[0]?.actionPotentials}/min
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">VP Count</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {electricalSensors[0]?.variationPotentials}/hr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}