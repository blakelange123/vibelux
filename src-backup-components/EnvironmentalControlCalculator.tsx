'use client';

import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Gauge,
  Calculator,
  Info,
  AlertCircle,
  TrendingUp,
  Activity,
  Target,
  Settings,
  Lightbulb,
  Fan,
  Snowflake,
  Zap,
  Download,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PBandClimateControl, PBandConfiguration } from '@/lib/p-band-climate-control';

interface EnvironmentalInputs {
  // Room dimensions
  width: number; // meters or feet
  length: number; // meters or feet
  height: number; // meters or feet
  
  // Lighting system
  totalLightingPower: number; // watts
  lightingEfficiency: number; // μmol/J
  operatingHours: number; // hours per day
  
  // Environmental targets
  targetTemperature: number; // °C or °F
  targetHumidity: number; // %
  targetVPD: number; // kPa
  targetCO2: number; // ppm
  
  // Crop parameters
  cropType: 'leafy' | 'fruiting' | 'herbs' | 'ornamental' | 'tomato';
  plantDensity: number; // plants/m² or plants/ft²
  leafAreaIndex: number;
  transpirationRate: number; // L/m²/day or gal/ft²/day
  
  // P-Band Climate Control (tomato-specific)
  pBandSize: 'small' | 'medium' | 'large';
  windSpeed: number; // m/s
  radiationLevel: number; // W/m²
  timeOfDay: 'night' | 'morning' | 'day' | 'evening';
  seasonalMode: 'winter' | 'spring' | 'summer' | 'fall';
  
  // External conditions
  outsideTemperature: number; // °C or °F
  outsideHumidity: number; // %
  ambientCO2: number; // ppm
  
  // System preferences
  safetyFactor: number; // multiplier for equipment sizing
  energyEfficiencyTarget: 'standard' | 'high' | 'premium';
  unitSystem: 'metric' | 'us'; // Unit system preference
}

interface HVACResults {
  // Heat loads
  sensibleHeatLoad: number; // watts
  latentHeatLoad: number; // watts
  totalHeatLoad: number; // watts
  
  // Equipment sizing
  coolingCapacity: number; // watts (cooling)
  heatingCapacity: number; // watts (heating)
  dehumidificationCapacity: number; // L/day
  humidificationCapacity: number; // L/day
  ventilationRate: number; // m³/h
  airChangesPerHour: number; // ACH
  
  // Energy calculations
  coolingEnergyDaily: number; // kWh/day
  heatingEnergyDaily: number; // kWh/day
  fanEnergyDaily: number; // kWh/day
  totalEnergyDaily: number; // kWh/day
  annualEnergyCost: number; // $/year
  
  // System specifications
  recommendedCOP: number; // Coefficient of Performance
  recommendedEER: number; // Energy Efficiency Ratio
  ductSizing: {
    supplyDuct: number; // cm diameter
    returnDuct: number; // cm diameter
    velocity: number; // m/s
  };
  
  // Enhanced VPD calculations
  vpdAnalysis: {
    currentVPD: number; // kPa calculated from inputs
    optimalVPD: number; // kPa optimal for crop type
    vpdDeviation: number; // percentage from optimal
    humidityAdjustment: number; // RH% adjustment needed
    temperatureAdjustment: number; // °C adjustment needed
  };
  
  // P-Band Climate Control Analysis (tomato-specific)
  pBandAnalysis?: {
    ventilationPercentage: number; // 0-100%
    fanSpeed: number; // 0-100%
    heatingRequired: boolean;
    coolingMode: 'recirculation' | 'ventilation' | 'pad-cooling';
    guillotineDoorPosition: number; // 0-100%
    expectedTemperature: number; // °C
    controlStrategy: string;
    warnings: string[];
    momentumRisk: 'none' | 'low' | 'medium' | 'high';
    optimalLightTemp: number; // °C based on light level
  };
  
  // Equipment recommendations
  equipmentRecommendations: {
    hvacType: string;
    manufacturer: string;
    model: string;
    efficiency: number;
    estimatedCost: number;
    paybackPeriod: number; // years
  }[];
  
  // Sustainability metrics
  sustainability: {
    carbonFootprint: number; // kg CO2/year
    waterUsage: number; // L/year
    renewableEnergyPotential: number; // % of energy from renewables
    efficiencyScore: number; // 0-100
  };
  
  // Peak load analysis
  peakLoads: {
    summerPeak: number; // kW
    winterPeak: number; // kW
    demandCharges: number; // $/month
    loadFactor: number; // average/peak
  };
  
  // Alerts and recommendations
  alerts: string[];
  recommendations: string[];
  energyEfficiencyRating: 'poor' | 'fair' | 'good' | 'excellent';
}

export function EnvironmentalControlCalculator() {
  const [inputs, setInputs] = useState<EnvironmentalInputs>({
    width: 10,
    length: 20,
    height: 3,
    totalLightingPower: 50000,
    lightingEfficiency: 2.8,
    operatingHours: 16,
    targetTemperature: 24,
    targetHumidity: 65,
    targetVPD: 1.0,
    targetCO2: 800,
    cropType: 'leafy',
    plantDensity: 30,
    leafAreaIndex: 3.0,
    transpirationRate: 3.5,
    pBandSize: 'medium',
    windSpeed: 3.0,
    radiationLevel: 400,
    timeOfDay: 'day',
    seasonalMode: 'summer',
    outsideTemperature: 25,
    outsideHumidity: 60,
    ambientCO2: 400,
    safetyFactor: 1.2,
    energyEfficiencyTarget: 'high',
    unitSystem: 'metric'
  });

  const [results, setResults] = useState<HVACResults | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Unit conversion helpers
  const convertTemp = (temp: number, toMetric: boolean): number => {
    return toMetric ? (temp - 32) * 5/9 : temp * 9/5 + 32;
  };

  const convertLength = (length: number, toMetric: boolean): number => {
    return toMetric ? length * 0.3048 : length / 0.3048;
  };

  const convertArea = (area: number, toMetric: boolean): number => {
    return toMetric ? area * 0.092903 : area / 0.092903;
  };

  const convertVolume = (volume: number, toMetric: boolean): number => {
    return toMetric ? volume * 3.78541 : volume / 3.78541;
  };

  const convertFlow = (flow: number, toMetric: boolean): number => {
    return toMetric ? flow * 0.471947 : flow / 0.471947; // CFM to m³/h
  };

  // Enhanced VPD calculations using accurate psychrometric formulas
  const calculateVPDAnalysis = (temp: number, humidity: number, cropType: string) => {
    // Saturation vapor pressure (kPa) using Antoine equation
    const satVaporPressure = 0.611 * Math.exp((17.27 * temp) / (temp + 237.3));
    
    // Actual vapor pressure
    const actualVaporPressure = satVaporPressure * (humidity / 100);
    
    // Current VPD
    const currentVPD = satVaporPressure - actualVaporPressure;
    
    // Optimal VPD ranges by crop type
    const optimalVPD = {
      'leafy': 0.9, // 0.8-1.0 kPa
      'fruiting': 1.1, // 1.0-1.2 kPa  
      'herbs': 1.0, // 0.9-1.1 kPa
      'ornamental': 0.8 // 0.7-0.9 kPa
    }[cropType] || 1.0;
    
    // Calculate deviation
    const vpdDeviation = ((currentVPD - optimalVPD) / optimalVPD) * 100;
    
    // Calculate adjustments needed
    const targetActualVP = satVaporPressure - optimalVPD;
    const targetHumidity = (targetActualVP / satVaporPressure) * 100;
    const humidityAdjustment = targetHumidity - humidity;
    
    // Temperature adjustment (assuming 1°C change affects VPD by ~0.1 kPa)
    const temperatureAdjustment = Math.abs(vpdDeviation) > 10 ? 
      (currentVPD > optimalVPD ? -1 : 1) : 0;
    
    return {
      currentVPD,
      optimalVPD,
      vpdDeviation,
      humidityAdjustment,
      temperatureAdjustment
    };
  };

  // Equipment recommendations based on facility size and requirements
  const generateEquipmentRecommendations = (totalHeatLoad: number, floorArea: number, efficiencyTarget: string) => {
    const recommendations = [];
    
    if (totalHeatLoad < 50000) { // Small facility
      recommendations.push({
        hvacType: 'Packaged DX with Hot Gas Reheat',
        manufacturer: 'Quest',
        model: 'Quest Dual Dry 125',
        efficiency: 3.8,
        estimatedCost: 35000,
        paybackPeriod: 4.2
      });
    } else if (totalHeatLoad < 150000) { // Medium facility
      recommendations.push({
        hvacType: 'Chilled Water System',
        manufacturer: 'Trane',
        model: 'CenTraVac CVHE Chiller',
        efficiency: 4.5,
        estimatedCost: 85000,
        paybackPeriod: 3.8
      });
    } else { // Large facility
      recommendations.push({
        hvacType: 'Central Plant with VRF',
        manufacturer: 'Carrier',
        model: '30XA VRF System',
        efficiency: 4.2,
        estimatedCost: 150000,
        paybackPeriod: 4.5
      });
    }
    
    if (efficiencyTarget === 'premium') {
      recommendations.push({
        hvacType: 'High-Efficiency Heat Pump',
        manufacturer: 'Daikin',
        model: 'VRV IV-S Series',
        efficiency: 5.1,
        estimatedCost: 95000,
        paybackPeriod: 3.2
      });
    }
    
    return recommendations;
  };

  // Sustainability calculations
  const calculateSustainability = (totalEnergyDaily: number, floorArea: number, waterUsage: number) => {
    // Carbon footprint (assuming 0.45 kg CO2/kWh grid average)
    const carbonFootprint = totalEnergyDaily * 365 * 0.45;
    
    // Annual water usage (transpiration + cooling tower makeup)
    const annualWaterUsage = waterUsage * 365;
    
    // Renewable energy potential (based on floor area for solar)
    const solarPotential = floorArea * 0.15; // 15% of floor area for solar panels
    const renewableEnergyPotential = Math.min((solarPotential * 1.5 * 5 * 365) / (totalEnergyDaily * 365) * 100, 100);
    
    // Efficiency score (0-100) based on energy intensity
    const energyIntensity = totalEnergyDaily / floorArea;
    const efficiencyScore = Math.max(0, 100 - (energyIntensity - 5) * 10);
    
    return {
      carbonFootprint,
      waterUsage: annualWaterUsage,
      renewableEnergyPotential,
      efficiencyScore
    };
  };

  // Peak load analysis
  const calculatePeakLoads = (totalHeatLoad: number, totalEnergyDaily: number) => {
    // Summer peak (cooling + lighting)
    const summerPeak = totalHeatLoad / 1000 * 1.3; // 30% safety factor
    
    // Winter peak (heating + lighting)  
    const winterPeak = totalHeatLoad / 1000 * 0.8; // Reduced load in winter
    
    // Demand charges (typical $15/kW/month)
    const demandCharges = Math.max(summerPeak, winterPeak) * 15;
    
    // Load factor (average/peak)
    const averageLoad = totalEnergyDaily / 24;
    const loadFactor = averageLoad / Math.max(summerPeak, winterPeak);
    
    return {
      summerPeak,
      winterPeak,
      demandCharges,
      loadFactor
    };
  };

  // Input validation
  const validateInputs = (): string[] => {
    const errors: string[] = [];
    
    if (inputs.width <= 0 || inputs.length <= 0 || inputs.height <= 0) {
      errors.push('Room dimensions must be positive values');
    }
    if (inputs.totalLightingPower <= 0) {
      errors.push('Lighting power must be positive');
    }
    if (inputs.lightingEfficiency <= 0 || inputs.lightingEfficiency > 5) {
      errors.push('LED efficiency should be between 0.1-5.0 μmol/J');
    }
    if (inputs.operatingHours < 0 || inputs.operatingHours > 24) {
      errors.push('Operating hours must be between 0-24');
    }
    if (inputs.targetTemperature < 5 || inputs.targetTemperature > 40) {
      errors.push('Target temperature should be between 5-40°C');
    }
    if (inputs.targetHumidity < 20 || inputs.targetHumidity > 95) {
      errors.push('Target humidity should be between 20-95%');
    }
    if (inputs.transpirationRate < 0 || inputs.transpirationRate > 10) {
      errors.push('Transpiration rate should be between 0-10 L/m²/day');
    }
    
    return errors;
  };

  // Calculate environmental control requirements
  const calculateHVACRequirements = (): HVACResults => {
    // Convert inputs to metric for calculations if needed
    const width = inputs.unitSystem === 'us' ? convertLength(inputs.width, true) : inputs.width;
    const length = inputs.unitSystem === 'us' ? convertLength(inputs.length, true) : inputs.length;
    const height = inputs.unitSystem === 'us' ? convertLength(inputs.height, true) : inputs.height;
    const targetTemp = inputs.unitSystem === 'us' ? convertTemp(inputs.targetTemperature, true) : inputs.targetTemperature;
    const outsideTemp = inputs.unitSystem === 'us' ? convertTemp(inputs.outsideTemperature, true) : inputs.outsideTemperature;
    const plantDensity = inputs.unitSystem === 'us' ? inputs.plantDensity / 0.092903 : inputs.plantDensity; // plants/ft² to plants/m²
    const transpirationRate = inputs.unitSystem === 'us' ? inputs.transpirationRate * 3.78541 / 0.092903 : inputs.transpirationRate; // gal/ft²/day to L/m²/day

    const floorArea = width * length; // m²
    const roomVolume = floorArea * height; // m³
    
    // Validate inputs first
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      return {
        sensibleHeatLoad: 0,
        latentHeatLoad: 0,
        totalHeatLoad: 0,
        coolingCapacity: 0,
        heatingCapacity: 0,
        dehumidificationCapacity: 0,
        humidificationCapacity: 0,
        ventilationRate: 0,
        airChangesPerHour: 0,
        coolingEnergyDaily: 0,
        heatingEnergyDaily: 0,
        fanEnergyDaily: 0,
        totalEnergyDaily: 0,
        annualEnergyCost: 0,
        recommendedCOP: 3.5,
        recommendedEER: 12,
        ductSizing: { supplyDuct: 0, returnDuct: 0, velocity: 0 },
        vpdAnalysis: {
          currentVPD: 0,
          optimalVPD: 0,
          vpdDeviation: 0,
          humidityAdjustment: 0,
          temperatureAdjustment: 0
        },
        equipmentRecommendations: [],
        sustainability: {
          carbonFootprint: 0,
          waterUsage: 0,
          renewableEnergyPotential: 0,
          efficiencyScore: 0
        },
        peakLoads: {
          summerPeak: 0,
          winterPeak: 0,
          demandCharges: 0,
          loadFactor: 0
        },
        alerts: validationErrors,
        recommendations: ['Please correct input errors above'],
        energyEfficiencyRating: 'poor'
      };
    }
    
    // Heat load calculations
    
    // Sensible heat from lighting (watts)
    // LED efficiency: Convert μmol/J to heat fraction
    // Theoretical max is ~4.6 μmol/J, so efficiency % = (actual/4.6)
    const photonEfficiency = Math.min(inputs.lightingEfficiency / 4.6, 1.0); // Cap at 100%
    const lightingHeatConversion = 1 - photonEfficiency;
    const sensibleHeatFromLighting = inputs.totalLightingPower * lightingHeatConversion;
    
    // Additional sensible heat sources (ballasts, fans, people)
    const additionalSensibleHeat = inputs.totalLightingPower * 0.1; // 10% additional
    
    // External heat gain (temperature differential based)
    const tempDifferential = Math.max(0, outsideTemp - targetTemp);
    const externalHeatGain = floorArea * tempDifferential * 5; // 5 W/m²/°C U-value approximation
    
    const totalSensibleHeat = sensibleHeatFromLighting + additionalSensibleHeat + externalHeatGain;
    
    // Latent heat from transpiration
    const latentHeatOfVaporization = 2260; // kJ/kg
    const transpirationKgPerDay = (transpirationRate * floorArea) / 1000; // kg/day
    const transpirationKgPerHour = transpirationKgPerDay / 24; // kg/hour
    const latentHeatFromTranspiration = transpirationKgPerHour * latentHeatOfVaporization * 1000 / 3600; // watts
    
    const totalLatentHeat = latentHeatFromTranspiration;
    const totalHeatLoad = totalSensibleHeat + totalLatentHeat;
    
    // Equipment sizing with safety factors
    const coolingCapacity = totalHeatLoad * inputs.safetyFactor;
    const heatingCapacity = coolingCapacity * 0.7; // Typically smaller than cooling
    
    // Dehumidification requirement (L/day)
    // Based on transpiration rate and target humidity differential
    const humidityDifferential = Math.max(0, inputs.outsideHumidity - inputs.targetHumidity);
    const dehumidificationFromTranspiration = transpirationRate * floorArea;
    const dehumidificationFromOutside = (humidityDifferential / 100) * roomVolume * 0.012 * 24; // kg/m³ to L/day (24h conversion)
    const totalDehumidification = (dehumidificationFromTranspiration + dehumidificationFromOutside) * inputs.safetyFactor;
    
    // Humidification capacity (typically 50% of dehumidification)
    const humidificationCapacity = totalDehumidification * 0.5;
    
    // Ventilation requirements
    // Based on CO2 requirements and air quality
    const co2Generation = plantDensity * floorArea * 0.0001; // kg CO2/day from respiration
    const co2Differential = Math.max(inputs.targetCO2 - inputs.ambientCO2, 100); // Minimum 100ppm differential
    
    // CO2 ventilation calculation (simplified)
    const ventilationForCO2 = inputs.targetCO2 > inputs.ambientCO2 ? 
      roomVolume * 2 : // Minimal ventilation when enriching CO2
      roomVolume * 8;  // Higher ventilation when not enriching
    
    const ventilationForAirQuality = roomVolume * 6; // 6 ACH minimum for air quality
    const ventilationRate = Math.max(ventilationForCO2, ventilationForAirQuality); // m³/h (already hourly)
    const airChangesPerHour = ventilationRate / roomVolume;
    
    // Energy calculations
    const operatingHoursPerDay = inputs.operatingHours;
    
    // Cooling energy (assuming COP based on efficiency target)
    const targetCOP = inputs.energyEfficiencyTarget === 'premium' ? 4.5 : 
                     inputs.energyEfficiencyTarget === 'high' ? 3.8 : 3.2;
    const coolingEnergyDaily = (coolingCapacity / 1000) * operatingHoursPerDay / targetCOP; // kWh/day
    
    // Heating energy (assuming efficient heat pump)
    const heatingCOP = 3.5;
    const heatingHoursPerDay = 24 - operatingHoursPerDay; // When lights are off
    const heatingEnergyDaily = (heatingCapacity / 1000) * heatingHoursPerDay / heatingCOP; // kWh/day
    
    // Fan energy (more realistic power consumption)
    const fanPower = ventilationRate * 0.3; // watts per m³/h (efficient EC fans - updated)
    const fanEnergyDaily = (fanPower / 1000) * 24; // kWh/day
    
    const totalEnergyDaily = coolingEnergyDaily + heatingEnergyDaily + fanEnergyDaily;
    const electricityRate = 0.12; // $/kWh average
    const annualEnergyCost = totalEnergyDaily * 365 * electricityRate;
    
    // Duct sizing
    const ductVelocity = 8; // m/s recommended for grow rooms
    const supplyAirflow = ventilationRate / 3600; // m³/s
    const ductArea = supplyAirflow / ductVelocity; // m²
    const ductDiameter = Math.sqrt(ductArea * 4 / Math.PI) * 100; // cm
    
    // System recommendations
    const recommendedEER = targetCOP * 3.412; // Convert COP to EER
    
    // Alerts and recommendations
    const alerts: string[] = [];
    const recommendations: string[] = [];
    
    if (totalHeatLoad > 400 * floorArea) {
      alerts.push('Very high heat load detected - consider more efficient lighting');
    } else if (totalHeatLoad > 250 * floorArea) {
      alerts.push('High heat load - monitor cooling requirements');
    }
    
    if (airChangesPerHour < 4) {
      alerts.push('Very low ventilation rate - inadequate for plant health');
    } else if (airChangesPerHour < 6) {
      alerts.push('Low ventilation rate - may affect air quality');
    } else if (airChangesPerHour > 15) {
      alerts.push('High ventilation rate - may increase energy costs');
    }
    
    if (inputs.transpirationRate > 6) {
      recommendations.push('Very high transpiration rate - ensure adequate dehumidification');
    } else if (inputs.transpirationRate > 4) {
      recommendations.push('High transpiration rate - monitor humidity levels');
    }
    
    if (inputs.targetVPD < 0.8 || inputs.targetVPD > 1.4) {
      recommendations.push('VPD target outside optimal range (0.8-1.4 kPa)');
    }
    
    // Energy efficiency rating
    const energyIntensity = totalEnergyDaily / floorArea; // kWh/m²/day
    const energyEfficiencyRating: 'poor' | 'fair' | 'good' | 'excellent' = 
      energyIntensity > 15 ? 'poor' :
      energyIntensity > 12 ? 'fair' :
      energyIntensity > 8 ? 'good' : 'excellent';
    
    if (energyEfficiencyRating === 'poor') {
      recommendations.push('Consider high-efficiency equipment to reduce energy consumption');
    }
    
    recommendations.push(`Recommended cooling system: ${targetCOP.toFixed(1)} COP or higher`);
    recommendations.push('Install variable speed drives for energy savings');
    
    if (coolingCapacity > 50000) {
      recommendations.push('Consider multiple smaller units for redundancy');
    }
    
    if (totalEnergyDaily > 100) {
      recommendations.push('High energy consumption - review lighting efficiency and schedule');
    }
    
    // Calculate enhanced analysis
    const vpdAnalysis = calculateVPDAnalysis(targetTemp, inputs.targetHumidity, inputs.cropType);
    
    // Calculate P-Band analysis for tomato crops
    let pBandAnalysis = undefined;
    if (inputs.cropType === 'tomato') {
      const pBandConfig: PBandConfiguration = {
        pBandSize: inputs.pBandSize,
        temperatureTarget: targetTemp,
        outsideTemperature: outsideTemp,
        windSpeed: inputs.windSpeed,
        radiationLevel: inputs.radiationLevel,
        timeOfDay: inputs.timeOfDay,
        seasonalMode: inputs.seasonalMode
      };
      
      const pBandResult = PBandClimateControl.calculatePBandControl(pBandConfig);
      const optimalLightTemp = PBandClimateControl.calculateOptimalTemperatureForLight(inputs.radiationLevel);
      
      // Analyze momentum risk
      const tempDiff = targetTemp - outsideTemp;
      let momentumRisk: 'none' | 'low' | 'medium' | 'high' = 'none';
      if (tempDiff > 6) momentumRisk = 'high';
      else if (tempDiff > 4) momentumRisk = 'medium';
      else if (tempDiff > 3) momentumRisk = 'low';
      
      pBandAnalysis = {
        ventilationPercentage: pBandResult.ventilationPercentage,
        fanSpeed: pBandResult.fanSpeed,
        heatingRequired: pBandResult.heatingRequired,
        coolingMode: pBandResult.coolingMode,
        guillotineDoorPosition: pBandResult.guillotineDoorPosition,
        expectedTemperature: pBandResult.expectedTemperature,
        controlStrategy: pBandResult.controlStrategy,
        warnings: pBandResult.warnings,
        momentumRisk,
        optimalLightTemp
      };
    }
    
    const equipmentRecommendations = generateEquipmentRecommendations(totalHeatLoad, floorArea, inputs.energyEfficiencyTarget);
    const sustainability = calculateSustainability(totalEnergyDaily, floorArea, transpirationRate * floorArea);
    const peakLoads = calculatePeakLoads(totalHeatLoad, totalEnergyDaily);

    // Enhanced recommendations based on new analysis
    if (Math.abs(vpdAnalysis.vpdDeviation) > 15) {
      recommendations.push(`VPD is ${vpdAnalysis.vpdDeviation > 0 ? 'too high' : 'too low'} - adjust humidity by ${vpdAnalysis.humidityAdjustment.toFixed(1)}%`);
    }
    
    if (sustainability.efficiencyScore < 60) {
      recommendations.push('Consider energy efficiency upgrades to improve sustainability score');
    }
    
    if (peakLoads.loadFactor < 0.6) {
      recommendations.push('Low load factor detected - consider demand management strategies');
    }
    
    if (sustainability.renewableEnergyPotential > 30) {
      recommendations.push(`Solar potential: ${sustainability.renewableEnergyPotential.toFixed(0)}% of energy needs could be met with rooftop solar`);
    }

    return {
      sensibleHeatLoad: totalSensibleHeat,
      latentHeatLoad: totalLatentHeat,
      totalHeatLoad: totalHeatLoad,
      coolingCapacity: coolingCapacity,
      heatingCapacity: heatingCapacity,
      dehumidificationCapacity: totalDehumidification,
      humidificationCapacity: humidificationCapacity,
      ventilationRate: ventilationRate,
      airChangesPerHour: airChangesPerHour,
      coolingEnergyDaily: coolingEnergyDaily,
      heatingEnergyDaily: heatingEnergyDaily,
      fanEnergyDaily: fanEnergyDaily,
      totalEnergyDaily: totalEnergyDaily,
      annualEnergyCost: annualEnergyCost,
      recommendedCOP: targetCOP,
      recommendedEER: recommendedEER,
      ductSizing: {
        supplyDuct: ductDiameter,
        returnDuct: ductDiameter * 1.1,
        velocity: ductVelocity
      },
      vpdAnalysis: vpdAnalysis,
      pBandAnalysis: pBandAnalysis,
      equipmentRecommendations: equipmentRecommendations,
      sustainability: sustainability,
      peakLoads: peakLoads,
      alerts: alerts,
      recommendations: recommendations,
      energyEfficiencyRating: energyEfficiencyRating
    };
  };

  useEffect(() => {
    setResults(calculateHVACRequirements());
  }, [inputs]);

  const formatNumber = (value: number, decimals: number = 1): string => {
    return value.toFixed(decimals);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // PDF Export functionality
  const exportToPDF = () => {
    if (!results) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(40, 44, 52);
    doc.text('Environmental Control System Design Report', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;

    // Project Information
    doc.setFontSize(16);
    doc.setTextColor(40, 44, 52);
    doc.text('Project Information', 20, yPosition);
    yPosition += 10;

    const projectData = [
      ['Facility Dimensions', `${inputs.width} × ${inputs.length} × ${inputs.height} ${inputs.unitSystem === 'metric' ? 'm' : 'ft'}`],
      ['Floor Area', `${formatNumber(inputs.width * inputs.length)} ${inputs.unitSystem === 'metric' ? 'm²' : 'ft²'}`],
      ['Crop Type', inputs.cropType.charAt(0).toUpperCase() + inputs.cropType.slice(1)],
      ['Lighting Power', `${inputs.totalLightingPower.toLocaleString()} W`],
      ['LED Efficiency', `${inputs.lightingEfficiency} μmol/J`],
      ['Operating Hours', `${inputs.operatingHours} hours/day`]
    ];

    (doc as any).autoTable({
      head: [['Parameter', 'Value']],
      body: projectData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Environmental Targets
    doc.setFontSize(16);
    doc.setTextColor(40, 44, 52);
    doc.text('Environmental Targets', 20, yPosition);
    yPosition += 10;

    const environmentalData = [
      ['Temperature', `${inputs.targetTemperature}°${inputs.unitSystem === 'metric' ? 'C' : 'F'}`],
      ['Humidity', `${inputs.targetHumidity}%`],
      ['Target VPD', `${inputs.targetVPD} kPa`],
      ['CO₂ Level', `${inputs.targetCO2} ppm`],
      ['Current VPD', `${formatNumber(results.vpdAnalysis.currentVPD, 2)} kPa`],
      ['VPD Deviation', `${formatNumber(results.vpdAnalysis.vpdDeviation, 1)}%`]
    ];

    (doc as any).autoTable({
      head: [['Parameter', 'Value']],
      body: environmentalData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Heat Load Analysis
    doc.setFontSize(16);
    doc.setTextColor(40, 44, 52);
    doc.text('Heat Load Analysis', 20, yPosition);
    yPosition += 10;

    const heatLoadData = [
      ['Total Heat Load', `${formatNumber(results.totalHeatLoad / 1000)} kW`],
      ['Sensible Heat Load', `${formatNumber(results.sensibleHeatLoad / 1000)} kW`],
      ['Latent Heat Load', `${formatNumber(results.latentHeatLoad / 1000)} kW`],
      ['Heat Density', `${formatNumber(results.totalHeatLoad / (inputs.width * inputs.length))} W/m²`]
    ];

    (doc as any).autoTable({
      head: [['Component', 'Value']],
      body: heatLoadData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [245, 101, 101] },
      styles: { fontSize: 10 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Equipment Sizing
    doc.setFontSize(16);
    doc.setTextColor(40, 44, 52);
    doc.text('Equipment Sizing Requirements', 20, yPosition);
    yPosition += 10;

    const equipmentData = [
      ['Cooling Capacity', `${formatNumber(results.coolingCapacity / 1000)} kW`],
      ['Heating Capacity', `${formatNumber(results.heatingCapacity / 1000)} kW`],
      ['Dehumidification', `${formatNumber(results.dehumidificationCapacity)} L/day`],
      ['Humidification', `${formatNumber(results.humidificationCapacity)} L/day`],
      ['Ventilation Rate', `${formatNumber(results.ventilationRate)} m³/h`],
      ['Air Changes per Hour', `${formatNumber(results.airChangesPerHour)} ACH`],
      ['Recommended COP', `${formatNumber(results.recommendedCOP, 1)}`],
      ['Supply Duct Diameter', `${formatNumber(results.ductSizing.supplyDuct)} cm`]
    ];

    (doc as any).autoTable({
      head: [['Equipment', 'Specification']],
      body: equipmentData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // New page for energy analysis
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 20;
    }

    // Energy Analysis
    doc.setFontSize(16);
    doc.setTextColor(40, 44, 52);
    doc.text('Energy Analysis', 20, yPosition);
    yPosition += 10;

    const energyData = [
      ['Daily Cooling Energy', `${formatNumber(results.coolingEnergyDaily)} kWh`],
      ['Daily Heating Energy', `${formatNumber(results.heatingEnergyDaily)} kWh`],
      ['Daily Fan Energy', `${formatNumber(results.fanEnergyDaily)} kWh`],
      ['Total Daily Energy', `${formatNumber(results.totalEnergyDaily)} kWh`],
      ['Annual Energy Cost', formatCurrency(results.annualEnergyCost)],
      ['Energy Efficiency Rating', results.energyEfficiencyRating.charAt(0).toUpperCase() + results.energyEfficiencyRating.slice(1)]
    ];

    (doc as any).autoTable({
      head: [['Energy Component', 'Value']],
      body: energyData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 10 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Sustainability Metrics
    doc.setFontSize(16);
    doc.setTextColor(40, 44, 52);
    doc.text('Sustainability Analysis', 20, yPosition);
    yPosition += 10;

    const sustainabilityData = [
      ['Efficiency Score', `${formatNumber(results.sustainability.efficiencyScore)}/100`],
      ['Carbon Footprint', `${formatNumber(results.sustainability.carbonFootprint / 1000, 1)} tons CO₂/year`],
      ['Water Usage', `${formatNumber(results.sustainability.waterUsage / 1000, 1)} m³/year`],
      ['Solar Energy Potential', `${formatNumber(results.sustainability.renewableEnergyPotential)}%`]
    ];

    (doc as any).autoTable({
      head: [['Sustainability Metric', 'Value']],
      body: sustainabilityData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Peak Load Analysis
    doc.setFontSize(16);
    doc.setTextColor(40, 44, 52);
    doc.text('Peak Load Analysis', 20, yPosition);
    yPosition += 10;

    const peakLoadData = [
      ['Summer Peak Load', `${formatNumber(results.peakLoads.summerPeak)} kW`],
      ['Winter Peak Load', `${formatNumber(results.peakLoads.winterPeak)} kW`],
      ['Monthly Demand Charges', formatCurrency(results.peakLoads.demandCharges)],
      ['Load Factor', `${formatNumber(results.peakLoads.loadFactor * 100)}%`]
    ];

    (doc as any).autoTable({
      head: [['Load Component', 'Value']],
      body: peakLoadData,
      startY: yPosition,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 10 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Equipment Recommendations
    if (results.equipmentRecommendations.length > 0) {
      // New page if needed
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(40, 44, 52);
      doc.text('Equipment Recommendations', 20, yPosition);
      yPosition += 10;

      const equipmentRecommendations = results.equipmentRecommendations.map(eq => [
        eq.hvacType,
        `${eq.manufacturer} ${eq.model}`,
        `${formatNumber(eq.efficiency, 1)} COP`,
        formatCurrency(eq.estimatedCost),
        `${formatNumber(eq.paybackPeriod, 1)} years`
      ]);

      (doc as any).autoTable({
        head: [['HVAC Type', 'Model', 'Efficiency', 'Cost', 'Payback']],
        body: equipmentRecommendations,
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Recommendations
    if (results.recommendations.length > 0) {
      // New page if needed
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(40, 44, 52);
      doc.text('System Recommendations', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      results.recommendations.forEach((rec, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 3;
        
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`VibeLux Environmental Control System Design Report - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // Save the PDF
    const fileName = `VibeLux_HVAC_Design_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/20 mb-4">
          <Wind className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Environmental Control Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Design and size HVAC systems for optimal growing conditions and energy efficiency
        </p>
      </div>

      {/* Unit System Toggle & Export Controls */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-1 border border-gray-800">
          <div className="flex gap-1">
            <button
              onClick={() => setInputs({...inputs, unitSystem: 'metric'})}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                inputs.unitSystem === 'metric' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
            >
              Metric (SI)
            </button>
            <button
              onClick={() => setInputs({...inputs, unitSystem: 'us'})}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                inputs.unitSystem === 'us' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
            >
              US Imperial
            </button>
          </div>
        </div>

        {/* PDF Export Button */}
        {results && (
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/25"
          >
            <Download className="w-4 h-4" />
            Export PDF Report
          </button>
        )}
      </div>

      {/* Input Sections */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Facility & Lighting */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Facility & Lighting
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-sm text-gray-400">Width ({inputs.unitSystem === 'metric' ? 'm' : 'ft'})</label>
                <input
                  type="number"
                  value={inputs.width}
                  onChange={(e) => setInputs({...inputs, width: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Length ({inputs.unitSystem === 'metric' ? 'm' : 'ft'})</label>
                <input
                  type="number"
                  value={inputs.length}
                  onChange={(e) => setInputs({...inputs, length: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Height ({inputs.unitSystem === 'metric' ? 'm' : 'ft'})</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.height}
                  onChange={(e) => setInputs({...inputs, height: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Total Lighting Power (W)</label>
              <input
                type="number"
                value={inputs.totalLightingPower}
                onChange={(e) => setInputs({...inputs, totalLightingPower: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">LED Efficiency (μmol/J)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.lightingEfficiency}
                onChange={(e) => setInputs({...inputs, lightingEfficiency: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Operating Hours/Day</label>
              <input
                type="number"
                value={inputs.operatingHours}
                onChange={(e) => setInputs({...inputs, operatingHours: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Environmental Targets */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Environmental Targets
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Temperature ({inputs.unitSystem === 'metric' ? '°C' : '°F'})</label>
              <input
                type="number"
                step="0.1"
                value={inputs.targetTemperature}
                onChange={(e) => setInputs({...inputs, targetTemperature: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Humidity (%)</label>
              <input
                type="number"
                value={inputs.targetHumidity}
                onChange={(e) => setInputs({...inputs, targetHumidity: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">VPD (kPa)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.targetVPD}
                onChange={(e) => setInputs({...inputs, targetVPD: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">CO₂ (ppm)</label>
              <input
                type="number"
                value={inputs.targetCO2}
                onChange={(e) => setInputs({...inputs, targetCO2: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Crop Type</label>
              <select
                value={inputs.cropType}
                onChange={(e) => setInputs({...inputs, cropType: e.target.value as any})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="leafy">Leafy Greens</option>
                <option value="fruiting">Fruiting Crops</option>
                <option value="herbs">Herbs</option>
                <option value="ornamental">Ornamental</option>
                <option value="tomato">🍅 Tomato (P-Band Control)</option>
              </select>
            </div>
          </div>
        </div>

        {/* P-Band Climate Control Settings (Tomato-Specific) */}
        {inputs.cropType === 'tomato' && (
          <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 backdrop-blur-xl rounded-xl border border-green-700 p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              🍅 P-Band Climate Control (Advanced Dutch Research)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-green-300">P-Band Size</label>
                <select
                  value={inputs.pBandSize}
                  onChange={(e) => setInputs({...inputs, pBandSize: e.target.value as any})}
                  className="w-full mt-1 px-3 py-2 bg-green-900/50 border border-green-600 rounded-lg text-white"
                >
                  <option value="small">Small (Quick Response)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="large">Large (Patient Strategy)</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-green-300">Wind Speed (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={inputs.windSpeed}
                  onChange={(e) => setInputs({...inputs, windSpeed: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-green-900/50 border border-green-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-green-300">Radiation Level (W/m²)</label>
                <input
                  type="number"
                  step="50"
                  min="0"
                  max="1200"
                  value={inputs.radiationLevel}
                  onChange={(e) => setInputs({...inputs, radiationLevel: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-green-900/50 border border-green-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-green-300">Time of Day</label>
                <select
                  value={inputs.timeOfDay}
                  onChange={(e) => setInputs({...inputs, timeOfDay: e.target.value as any})}
                  className="w-full mt-1 px-3 py-2 bg-green-900/50 border border-green-600 rounded-lg text-white"
                >
                  <option value="night">Night</option>
                  <option value="morning">Morning</option>
                  <option value="day">Day</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-green-300">Seasonal Mode</label>
                <select
                  value={inputs.seasonalMode}
                  onChange={(e) => setInputs({...inputs, seasonalMode: e.target.value as any})}
                  className="w-full mt-1 px-3 py-2 bg-green-900/50 border border-green-600 rounded-lg text-white"
                >
                  <option value="winter">Winter</option>
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="fall">Fall</option>
                </select>
              </div>
            </div>
            
            <p className="text-sm text-green-300 mt-4 opacity-80">
              P-Band control provides precise tomato-specific climate management with momentum prevention and light-based temperature optimization.
            </p>
          </div>
        )}

        {/* Advanced Settings */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-4 flex items-center justify-between text-white hover:bg-gray-800/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Advanced Settings
            </span>
            <span className="text-gray-400">{showAdvanced ? '−' : '+'}</span>
          </button>
          
          {showAdvanced && (
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="text-sm text-gray-400">Plant Density ({inputs.unitSystem === 'metric' ? 'plants/m²' : 'plants/ft²'})</label>
                <input
                  type="number"
                  value={inputs.plantDensity}
                  onChange={(e) => setInputs({...inputs, plantDensity: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Transpiration Rate ({inputs.unitSystem === 'metric' ? 'L/m²/day' : 'gal/ft²/day'})</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.transpirationRate}
                  onChange={(e) => setInputs({...inputs, transpirationRate: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Outside Temperature ({inputs.unitSystem === 'metric' ? '°C' : '°F'})</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.outsideTemperature}
                  onChange={(e) => setInputs({...inputs, outsideTemperature: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Outside Humidity (%)</label>
                <input
                  type="number"
                  value={inputs.outsideHumidity}
                  onChange={(e) => setInputs({...inputs, outsideHumidity: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Safety Factor</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.safetyFactor}
                  onChange={(e) => setInputs({...inputs, safetyFactor: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Efficiency Target</label>
                <select
                  value={inputs.energyEfficiencyTarget}
                  onChange={(e) => setInputs({...inputs, energyEfficiencyTarget: e.target.value as any})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="standard">Standard</option>
                  <option value="high">High Efficiency</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <>
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Heat Load Analysis */}
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-xl rounded-xl p-6 border border-orange-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-400" />
                Heat Load Analysis
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-orange-400 text-sm mb-1">Total Heat Load</p>
                  <p className="text-3xl font-bold text-white">{formatNumber(results.totalHeatLoad / 1000)} kW</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sensible Heat</span>
                    <span className="text-white">{formatNumber(results.sensibleHeatLoad / 1000)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Latent Heat</span>
                    <span className="text-white">{formatNumber(results.latentHeatLoad / 1000)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Heat Density</span>
                    <span className="text-white">{formatNumber(results.totalHeatLoad / (inputs.width * inputs.length))} W/m²</span>
                  </div>
                </div>
              </div>
            </div>

          {/* Equipment Sizing */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Fan className="w-5 h-5 text-blue-400" />
              Equipment Sizing
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Cooling Capacity</span>
                <span className="text-white">{formatNumber(results.coolingCapacity / 1000)} kW</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Heating Capacity</span>
                <span className="text-white">{formatNumber(results.heatingCapacity / 1000)} kW</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Dehumidification</span>
                <span className="text-white">{formatNumber(results.dehumidificationCapacity)} L/day</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Ventilation</span>
                <span className="text-white">{formatNumber(results.ventilationRate)} m³/h</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Air Changes</span>
                <span className="text-white">{formatNumber(results.airChangesPerHour)} ACH</span>
              </div>
            </div>
          </div>

          {/* Energy Analysis */}
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-xl p-6 border border-green-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              Energy Analysis
            </h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-green-400 text-sm mb-1">Daily Energy Use</p>
                <p className="text-3xl font-bold text-white">{formatNumber(results.totalEnergyDaily)} kWh</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cooling Energy</span>
                  <span className="text-white">{formatNumber(results.coolingEnergyDaily)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Heating Energy</span>
                  <span className="text-white">{formatNumber(results.heatingEnergyDaily)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fan Energy</span>
                  <span className="text-white">{formatNumber(results.fanEnergyDaily)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual Cost</span>
                  <span className="text-white">{formatCurrency(results.annualEnergyCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Performance */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-purple-400" />
              Performance Metrics
            </h3>
            
            <div className="space-y-4">
              <div className={`p-3 rounded-lg border ${
                results.energyEfficiencyRating === 'excellent' ? 'bg-green-500/10 border-green-500/30' :
                results.energyEfficiencyRating === 'good' ? 'bg-blue-500/10 border-blue-500/30' :
                results.energyEfficiencyRating === 'fair' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${
                    results.energyEfficiencyRating === 'excellent' ? 'bg-green-400' :
                    results.energyEfficiencyRating === 'good' ? 'bg-blue-400' :
                    results.energyEfficiencyRating === 'fair' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    results.energyEfficiencyRating === 'excellent' ? 'text-green-400' :
                    results.energyEfficiencyRating === 'good' ? 'text-blue-400' :
                    results.energyEfficiencyRating === 'fair' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {results.energyEfficiencyRating.charAt(0).toUpperCase() + results.energyEfficiencyRating.slice(1)} Efficiency
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recommended COP</span>
                  <span className="text-white">{formatNumber(results.recommendedCOP, 1)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Energy Intensity</span>
                  <span className="text-white">{formatNumber(results.totalEnergyDaily / (inputs.width * inputs.length), 1)} kWh/m²/day</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Supply Duct</span>
                  <span className="text-white">{formatNumber(results.ductSizing.supplyDuct, 0)} cm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced VPD Analysis */}
        <div className="bg-gradient-to-br from-teal-900/30 to-cyan-900/30 backdrop-blur-xl rounded-xl p-6 border border-teal-500/30">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-teal-400" />
            Enhanced VPD Analysis
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-teal-400 text-sm mb-1">Current VPD</p>
                <p className="text-3xl font-bold text-white">{formatNumber(results.vpdAnalysis.currentVPD, 2)} kPa</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Optimal VPD</span>
                  <span className="text-white">{formatNumber(results.vpdAnalysis.optimalVPD, 2)} kPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deviation</span>
                  <span className={`${Math.abs(results.vpdAnalysis.vpdDeviation) > 15 ? 'text-red-400' : 'text-green-400'}`}>
                    {formatNumber(results.vpdAnalysis.vpdDeviation, 1)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-white font-medium">Recommended Adjustments</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Humidity Adjustment</span>
                  <span className="text-white">{results.vpdAnalysis.humidityAdjustment > 0 ? '+' : ''}{formatNumber(results.vpdAnalysis.humidityAdjustment, 1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Temperature Adjustment</span>
                  <span className="text-white">{results.vpdAnalysis.temperatureAdjustment > 0 ? '+' : ''}{formatNumber(results.vpdAnalysis.temperatureAdjustment, 1)}°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* P-Band Climate Control Results (Tomato-Specific) */}
        {results.pBandAnalysis && (
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-xl rounded-xl p-6 border border-green-500/30">
            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              🍅 P-Band Climate Control Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-600/30">
                <p className="text-green-300 text-sm mb-1">Ventilation</p>
                <p className="text-2xl font-bold text-white">{results.pBandAnalysis.ventilationPercentage}%</p>
              </div>
              
              <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-600/30">
                <p className="text-green-300 text-sm mb-1">Fan Speed</p>
                <p className="text-2xl font-bold text-white">{results.pBandAnalysis.fanSpeed}%</p>
              </div>
              
              <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-600/30">
                <p className="text-green-300 text-sm mb-1">Expected Temp</p>
                <p className="text-2xl font-bold text-white">{formatNumber(results.pBandAnalysis.expectedTemperature, 1)}°C</p>
              </div>
              
              <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-600/30">
                <p className="text-green-300 text-sm mb-1">Optimal Light Temp</p>
                <p className="text-2xl font-bold text-white">{formatNumber(results.pBandAnalysis.optimalLightTemp, 1)}°C</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-green-300">Control Settings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cooling Mode</span>
                    <span className="text-white capitalize">{results.pBandAnalysis.coolingMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Door Position</span>
                    <span className="text-white">{results.pBandAnalysis.guillotineDoorPosition}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Heating Required</span>
                    <span className="text-white">{results.pBandAnalysis.heatingRequired ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Momentum Risk</span>
                    <span className={`font-medium ${
                      results.pBandAnalysis.momentumRisk === 'high' ? 'text-red-400' :
                      results.pBandAnalysis.momentumRisk === 'medium' ? 'text-yellow-400' :
                      results.pBandAnalysis.momentumRisk === 'low' ? 'text-orange-400' :
                      'text-green-400'
                    }`}>
                      {results.pBandAnalysis.momentumRisk.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-green-300">Strategy & Alerts</h4>
                <p className="text-sm text-gray-300">{results.pBandAnalysis.controlStrategy}</p>
                
                {results.pBandAnalysis.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-yellow-400">⚠️ Warnings</h5>
                    <ul className="space-y-1">
                      {results.pBandAnalysis.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-yellow-300 flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Equipment Recommendations */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Equipment Recommendations
          </h3>
          
          <div className="grid gap-4">
            {results.equipmentRecommendations.map((equipment, idx) => (
              <div key={idx} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{equipment.hvacType}</h4>
                    <p className="text-gray-400">{equipment.manufacturer} {equipment.model}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded">
                    {formatNumber(equipment.efficiency, 1)} COP
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Estimated Cost</span>
                    <p className="text-white font-medium">{formatCurrency(equipment.estimatedCost)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Payback Period</span>
                    <p className="text-white font-medium">{formatNumber(equipment.paybackPeriod, 1)} years</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability & Peak Load Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sustainability Metrics */}
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-xl p-6 border border-green-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-400" />
              Sustainability Metrics
            </h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-green-400 text-sm mb-1">Efficiency Score</p>
                <p className="text-3xl font-bold text-white">{formatNumber(results.sustainability.efficiencyScore, 0)}/100</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Carbon Footprint</span>
                  <span className="text-white">{formatNumber(results.sustainability.carbonFootprint / 1000, 1)} tons CO₂/year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Water Usage</span>
                  <span className="text-white">{formatNumber(results.sustainability.waterUsage / 1000, 1)} m³/year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Solar Potential</span>
                  <span className="text-white">{formatNumber(results.sustainability.renewableEnergyPotential, 0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Peak Load Analysis */}
          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-xl rounded-xl p-6 border border-yellow-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              Peak Load Analysis
            </h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-yellow-400 text-sm mb-1">Load Factor</p>
                <p className="text-3xl font-bold text-white">{formatNumber(results.peakLoads.loadFactor * 100, 0)}%</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Summer Peak</span>
                  <span className="text-white">{formatNumber(results.peakLoads.summerPeak, 1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Winter Peak</span>
                  <span className="text-white">{formatNumber(results.peakLoads.winterPeak, 1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Demand Charges</span>
                  <span className="text-white">{formatCurrency(results.peakLoads.demandCharges)}/month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Alerts and Recommendations */}
      {results && (results.alerts.length > 0 || results.recommendations.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Alerts */}
          {results.alerts.length > 0 && (
            <div className="bg-red-900/20 backdrop-blur-xl rounded-xl p-6 border border-red-500/30">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Alerts
              </h3>
              
              <div className="space-y-2">
                {results.alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-red-300">{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-900/20 backdrop-blur-xl rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Recommendations
            </h3>
            
            <div className="space-y-2">
              {results.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-300">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Technical Information */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-400" />
          Calculation Method
        </h3>
        
        <div className="text-sm text-gray-300 space-y-2">
          <p>
            <Info className="w-4 h-4 inline mr-2 text-purple-400" />
            Heat load calculations based on ASHRAE standards and LED efficiency factors
          </p>
          <p>
            <Info className="w-4 h-4 inline mr-2 text-purple-400" />
            Transpiration latent heat using 2260 kJ/kg latent heat of vaporization
          </p>
          <p>
            <Info className="w-4 h-4 inline mr-2 text-purple-400" />
            Equipment sizing includes safety factors and peak load conditions
          </p>
          <p>
            <Info className="w-4 h-4 inline mr-2 text-purple-400" />
            Energy calculations assume high-efficiency equipment with appropriate COP values
          </p>
        </div>
      </div>
    </div>
  );
}