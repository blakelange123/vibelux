'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Thermometer, AlertTriangle, Info, TrendingUp, 
  Zap, Wind, Droplets, BarChart3, Download,
  Settings, Activity, AlertCircle, CheckCircle
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

interface ThermalData {
  fixtureId: string;
  junctionTemp: number; // °C
  ambientTemp: number; // °C
  heatsinkTemp: number; // °C
  thermalResistance: number; // °C/W
  powerDissipation: number; // W
  efficiency: number; // %
  lifetimeReduction: number; // %
  thermalDrift: number; // % light output change
}

interface HVACRequirements {
  sensibleHeatLoad: number; // BTU/hr
  latentHeatLoad: number; // BTU/hr
  totalHeatLoad: number; // BTU/hr
  requiredCFM: number; // Cubic feet per minute
  recommendedACTons: number; // Tons of cooling
  dehumidificationNeeded: boolean;
  estimatedEnergyUse: number; // kWh/month
}

interface ThermalManagementSystemProps {
  onClose?: () => void;
}

export function ThermalManagementSystem({ onClose }: ThermalManagementSystemProps) {
  const { state } = useDesigner();
  const [ambientTemp, setAmbientTemp] = useState(25); // °C
  const [humidity, setHumidity] = useState(60); // %
  const [airflowCFM, setAirflowCFM] = useState(1000);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [thermalData, setThermalData] = useState<ThermalData[]>([]);
  const [hvacRequirements, setHVACRequirements] = useState<HVACRequirements | null>(null);

  // Constants for thermal calculations
  const THERMAL_CONSTANTS = {
    LED_EFFICIENCY: 0.35, // 35% electrical to light conversion
    JUNCTION_TO_CASE: 1.5, // °C/W typical
    CASE_TO_HEATSINK: 0.5, // °C/W with thermal paste
    HEATSINK_TO_AMBIENT: 0.8, // °C/W typical heatsink
    MAX_JUNCTION_TEMP: 85, // °C max recommended
    WATTS_TO_BTU_HR: 3.412,
    DERATING_FACTOR: 0.003, // 0.3% output loss per °C
    L70_BASE_HOURS: 50000, // hours at 25°C junction temp
    ARRHENIUS_FACTOR: 0.88 // lifetime factor per 10°C increase
  };

  // Calculate thermal data for all fixtures
  const calculateThermalData = (): ThermalData[] => {
    const fixtures = state.objects.filter(obj => obj.type === 'fixture');
    
    return fixtures.map(fixture => {
      const power = (fixture as any).power || (fixture as any).model?.wattage || 600; // W
      const efficiency = THERMAL_CONSTANTS.LED_EFFICIENCY;
      const heatGenerated = power * (1 - efficiency); // W
      
      // Calculate temperature rise through thermal resistances
      const totalThermalResistance = 
        THERMAL_CONSTANTS.JUNCTION_TO_CASE +
        THERMAL_CONSTANTS.CASE_TO_HEATSINK +
        THERMAL_CONSTANTS.HEATSINK_TO_AMBIENT;
      
      // Account for airflow improvement
      const airflowFactor = Math.max(0.3, 1 - (airflowCFM / 5000));
      const effectiveThermalResistance = totalThermalResistance * airflowFactor;
      
      // Calculate temperatures
      const tempRise = heatGenerated * effectiveThermalResistance;
      const junctionTemp = ambientTemp + tempRise;
      const heatsinkTemp = ambientTemp + (heatGenerated * THERMAL_CONSTANTS.HEATSINK_TO_AMBIENT * airflowFactor);
      
      // Calculate efficiency impact
      const thermalDrift = (junctionTemp - 25) * THERMAL_CONSTANTS.DERATING_FACTOR * 100;
      
      // Calculate lifetime impact (Arrhenius equation)
      const tempDifference = junctionTemp - 25;
      const lifetimeMultiplier = Math.pow(THERMAL_CONSTANTS.ARRHENIUS_FACTOR, tempDifference / 10);
      const estimatedLifetime = THERMAL_CONSTANTS.L70_BASE_HOURS * lifetimeMultiplier;
      const lifetimeReduction = ((THERMAL_CONSTANTS.L70_BASE_HOURS - estimatedLifetime) / THERMAL_CONSTANTS.L70_BASE_HOURS) * 100;
      
      return {
        fixtureId: fixture.id,
        junctionTemp,
        ambientTemp,
        heatsinkTemp,
        thermalResistance: effectiveThermalResistance,
        powerDissipation: heatGenerated,
        efficiency: efficiency * 100,
        lifetimeReduction: Math.max(0, lifetimeReduction),
        thermalDrift
      };
    });
  };

  // Calculate HVAC requirements
  const calculateHVACRequirements = (): HVACRequirements => {
    const fixtures = state.objects.filter(obj => obj.type === 'fixture');
    const totalPower = fixtures.reduce((sum, f) => sum + ((f as any).power || (f as any).model?.wattage || 600), 0);
    const heatGenerated = totalPower * (1 - THERMAL_CONSTANTS.LED_EFFICIENCY);
    
    // Sensible heat load (from fixtures)
    const sensibleHeatBTU = heatGenerated * THERMAL_CONSTANTS.WATTS_TO_BTU_HR;
    
    // Latent heat load (from transpiration if growing plants)
    const roomArea = state.room.width * state.room.length;
    const plantTranspiration = roomArea * 0.5; // kg/m²/day
    const latentHeatBTU = plantTranspiration * 1000; // Simplified calculation
    
    // Total heat load
    const totalHeatLoad = sensibleHeatBTU + latentHeatBTU;
    
    // Required airflow (CFM)
    const deltaT = 10; // °F temperature difference
    const requiredCFM = sensibleHeatBTU / (1.08 * deltaT);
    
    // AC sizing (tons)
    const recommendedACTons = totalHeatLoad / 12000; // 12000 BTU/hr per ton
    
    // Dehumidification needs
    const dehumidificationNeeded = humidity > 50;
    
    // Energy usage estimate
    const coolingHours = 12; // hours per day
    const daysPerMonth = 30;
    const copEfficiency = 3.5; // Coefficient of Performance
    const estimatedEnergyUse = (totalHeatLoad / 1000) * coolingHours * daysPerMonth / copEfficiency;
    
    return {
      sensibleHeatLoad: sensibleHeatBTU,
      latentHeatLoad: latentHeatBTU,
      totalHeatLoad,
      requiredCFM,
      recommendedACTons,
      dehumidificationNeeded,
      estimatedEnergyUse
    };
  };

  // Update calculations when inputs change
  useEffect(() => {
    const data = calculateThermalData();
    setThermalData(data);
    setHVACRequirements(calculateHVACRequirements());
  }, [state.objects, ambientTemp, humidity, airflowCFM]);

  // Get thermal status
  const getThermalStatus = (junctionTemp: number) => {
    if (junctionTemp < 60) return { status: 'optimal', color: 'text-green-500', icon: CheckCircle };
    if (junctionTemp < 75) return { status: 'good', color: 'text-yellow-500', icon: Info };
    if (junctionTemp < 85) return { status: 'warning', color: 'text-orange-500', icon: AlertTriangle };
    return { status: 'critical', color: 'text-red-500', icon: AlertCircle };
  };

  // Calculate average metrics
  const averageMetrics = useMemo(() => {
    if (thermalData.length === 0) return null;
    
    const avgJunctionTemp = thermalData.reduce((sum, d) => sum + d.junctionTemp, 0) / thermalData.length;
    const avgLifetimeReduction = thermalData.reduce((sum, d) => sum + d.lifetimeReduction, 0) / thermalData.length;
    const totalHeatDissipation = thermalData.reduce((sum, d) => sum + d.powerDissipation, 0);
    
    return {
      avgJunctionTemp,
      avgLifetimeReduction,
      totalHeatDissipation
    };
  }, [thermalData]);

  // Export thermal report
  const exportThermalReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      roomDimensions: state.room,
      environmentalConditions: { ambientTemp, humidity, airflowCFM },
      fixtureAnalysis: thermalData,
      hvacRequirements,
      recommendations: generateRecommendations()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thermal-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate recommendations
  const generateRecommendations = (): string[] => {
    const recommendations: string[] = [];
    
    if (averageMetrics) {
      if (averageMetrics.avgJunctionTemp > 75) {
        recommendations.push('Consider increasing airflow or reducing ambient temperature');
      }
      if (averageMetrics.avgLifetimeReduction > 20) {
        recommendations.push('High temperature is significantly reducing LED lifetime');
      }
    }
    
    if (hvacRequirements) {
      if (hvacRequirements.requiredCFM > airflowCFM) {
        recommendations.push(`Increase airflow to at least ${Math.ceil(hvacRequirements.requiredCFM)} CFM`);
      }
      if (hvacRequirements.dehumidificationNeeded) {
        recommendations.push('Install dehumidification system to maintain optimal humidity');
      }
    }
    
    const hotFixtures = thermalData.filter(d => d.junctionTemp > 80).length;
    if (hotFixtures > 0) {
      recommendations.push(`${hotFixtures} fixtures are running too hot - improve cooling`);
    }
    
    return recommendations;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600/20 rounded-lg">
            <Thermometer className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Thermal Management System</h2>
            <p className="text-sm text-gray-400">Advanced thermal analysis and HVAC calculations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportThermalReport}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Environmental Controls */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Ambient Temperature (°C)
          </label>
          <input
            type="number"
            value={ambientTemp}
            onChange={(e) => setAmbientTemp(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            min="10"
            max="40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Humidity (%)
          </label>
          <input
            type="number"
            value={humidity}
            onChange={(e) => setHumidity(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            min="20"
            max="80"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Airflow (CFM)
          </label>
          <input
            type="number"
            value={airflowCFM}
            onChange={(e) => setAirflowCFM(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            min="0"
            max="10000"
            step="100"
          />
        </div>
      </div>

      {/* Summary Metrics */}
      {averageMetrics && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Thermometer className="w-4 h-4" />
              <span className="text-xs">Avg Junction Temp</span>
            </div>
            <div className={`text-2xl font-bold ${
              averageMetrics.avgJunctionTemp < 75 ? 'text-green-500' : 'text-orange-500'
            }`}>
              {averageMetrics.avgJunctionTemp.toFixed(1)}°C
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Total Heat Load</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {averageMetrics.totalHeatDissipation.toFixed(0)}W
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Lifetime Impact</span>
            </div>
            <div className={`text-2xl font-bold ${
              averageMetrics.avgLifetimeReduction < 10 ? 'text-green-500' : 'text-red-500'
            }`}>
              -{averageMetrics.avgLifetimeReduction.toFixed(0)}%
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Thermal Status</span>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const status = getThermalStatus(averageMetrics.avgJunctionTemp);
                const StatusIcon = status.icon;
                return (
                  <>
                    <StatusIcon className={`w-5 h-5 ${status.color}`} />
                    <span className={`text-lg font-bold ${status.color} capitalize`}>
                      {status.status}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* HVAC Requirements */}
      {hvacRequirements && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-blue-400" />
            HVAC Requirements
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Total Heat Load</p>
              <p className="text-xl font-bold text-white">
                {(hvacRequirements.totalHeatLoad / 1000).toFixed(1)}k BTU/hr
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Required Cooling</p>
              <p className="text-xl font-bold text-blue-400">
                {hvacRequirements.recommendedACTons.toFixed(1)} Tons
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Required Airflow</p>
              <p className="text-xl font-bold text-white">
                {Math.ceil(hvacRequirements.requiredCFM)} CFM
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Est. Energy Use</p>
              <p className="text-xl font-bold text-yellow-400">
                {hvacRequirements.estimatedEnergyUse.toFixed(0)} kWh/mo
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Dehumidification</p>
              <p className="text-xl font-bold">
                <span className={hvacRequirements.dehumidificationNeeded ? 'text-orange-400' : 'text-green-400'}>
                  {hvacRequirements.dehumidificationNeeded ? 'Required' : 'Not Required'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fixture Thermal Analysis */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-white font-medium mb-4 hover:text-purple-400 transition-colors"
        >
          <Settings className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Fixture Analysis
        </button>
        
        {showAdvanced && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {thermalData.map((data, index) => {
              const status = getThermalStatus(data.junctionTemp);
              const StatusIcon = status.icon;
              
              return (
                <div key={data.fixtureId} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Fixture {index + 1}</h4>
                      <p className="text-sm text-gray-400">ID: {data.fixtureId}</p>
                    </div>
                    <StatusIcon className={`w-5 h-5 ${status.color}`} />
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-400">Junction</p>
                      <p className={`font-medium ${status.color}`}>
                        {data.junctionTemp.toFixed(1)}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Heat Sink</p>
                      <p className="font-medium text-white">
                        {data.heatsinkTemp.toFixed(1)}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Dissipation</p>
                      <p className="font-medium text-orange-400">
                        {data.powerDissipation.toFixed(0)}W
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Light Loss</p>
                      <p className="font-medium text-yellow-400">
                        {data.thermalDrift.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {generateRecommendations().length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <h3 className="text-yellow-400 font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Recommendations
          </h3>
          <ul className="space-y-1 text-sm text-yellow-300">
            {generateRecommendations().map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}