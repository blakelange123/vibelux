'use client';

import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge,
  Calculator,
  Info,
  AlertCircle,
  TrendingUp,
  Activity,
  Target,
  Settings,
  Eye,
  Download,
  MapPin,
  Cloud,
  RefreshCw,
  Navigation,
  Zap
} from 'lucide-react';
import { InteractivePsychrometricChart } from './InteractivePsychrometricChart';
import { weatherGeoService, isGeolocationAvailable, type LocationData, type WeatherData } from '@/lib/weather-geolocation';

interface PsychrometricProperties {
  // Input properties (any two can be specified)
  dryBulbTemp?: number; // °C
  wetBulbTemp?: number; // °C
  dewPoint?: number; // °C
  relativeHumidity?: number; // %
  absoluteHumidity?: number; // kg/kg dry air
  specificVolume?: number; // m³/kg dry air
  enthalpy?: number; // kJ/kg dry air
  
  // Calculated properties
  vaporPressure?: number; // kPa
  saturationPressure?: number; // kPa
  vaporPressureDeficit?: number; // kPa
  density?: number; // kg/m³
  
  // Comfort and plant health indicators
  comfortZone?: boolean;
  condensationRisk?: boolean;
  plantStressLevel?: 'optimal' | 'mild' | 'moderate' | 'severe';
  recommendations?: string[];
}

interface PsychrometricInputs {
  // Primary inputs
  dryBulbTemp: number; // °C
  inputType: 'relativeHumidity' | 'wetBulbTemp' | 'dewPoint' | 'absoluteHumidity';
  secondaryValue: number;
  
  // Environmental context
  barometricPressure: number; // kPa
  elevation: number; // meters above sea level
  cropType: 'leafy' | 'fruiting' | 'herbs' | 'ornamental';
  
  // Calculation settings
  units: 'metric' | 'imperial';
  precision: number;
}

export function PsychrometricCalculator() {
  const [inputs, setInputs] = useState<PsychrometricInputs>({
    dryBulbTemp: 25,
    inputType: 'relativeHumidity',
    secondaryValue: 60,
    barometricPressure: 101.325,
    elevation: 0,
    cropType: 'leafy',
    units: 'metric',
    precision: 2
  });
  
  const [results, setResults] = useState<PsychrometricProperties | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Psychrometric calculation functions
  const calculateSaturationPressure = (temp: number): number => {
    // Magnus formula for saturation vapor pressure (kPa)
    return 0.6108 * Math.exp(17.27 * temp / (temp + 237.3));
  };

  const calculateVaporPressure = (temp: number, rh: number): number => {
    // Actual vapor pressure from temperature and relative humidity
    const satPress = calculateSaturationPressure(temp);
    return satPress * (rh / 100);
  };

  const calculateDewPoint = (temp: number, rh: number): number => {
    // Dew point temperature calculation
    const vp = calculateVaporPressure(temp, rh);
    const a = 17.27;
    const b = 237.3;
    const alpha = Math.log(vp / 0.6108);
    return (b * alpha) / (a - alpha);
  };

  const calculateWetBulbTemp = (dryBulb: number, rh: number, pressure: number): number => {
    // Wet bulb temperature using iterative method
    const vp = calculateVaporPressure(dryBulb, rh);
    let wetBulb = dryBulb;
    let iteration = 0;
    const maxIterations = 50;
    const tolerance = 0.001;

    while (iteration < maxIterations) {
      const satPressWet = calculateSaturationPressure(wetBulb);
      const calculated_vp = satPressWet - (pressure * 0.00066 * (dryBulb - wetBulb));
      
      if (Math.abs(calculated_vp - vp) < tolerance) break;
      
      // Newton-Raphson iteration
      const derivative = (17.27 * 237.3 * satPressWet) / Math.pow(wetBulb + 237.3, 2);
      wetBulb = wetBulb - (calculated_vp - vp) / derivative;
      iteration++;
    }
    
    return wetBulb;
  };

  const calculateAbsoluteHumidity = (temp: number, rh: number, pressure: number): number => {
    // Humidity ratio (kg water/kg dry air)
    const vp = calculateVaporPressure(temp, rh);
    return 0.622 * vp / (pressure - vp);
  };

  const calculateSpecificVolume = (temp: number, humidityRatio: number, pressure: number): number => {
    // Specific volume of moist air (m³/kg dry air)
    const Ra = 0.287; // Specific gas constant for dry air (kJ/kg·K)
    const tempK = temp + 273.15;
    return (Ra * tempK * (1 + 1.608 * humidityRatio)) / pressure;
  };

  const calculateEnthalpy = (temp: number, humidityRatio: number): number => {
    // Specific enthalpy of moist air (kJ/kg dry air)
    const cpAir = 1.006; // Specific heat of dry air (kJ/kg·K)
    const hfg = 2501; // Latent heat of vaporization at 0°C (kJ/kg)
    const cpVapor = 1.86; // Specific heat of water vapor (kJ/kg·K)
    
    return cpAir * temp + humidityRatio * (hfg + cpVapor * temp);
  };

  const calculateDensity = (temp: number, humidityRatio: number, pressure: number): number => {
    // Density of moist air (kg/m³)
    const specificVolume = calculateSpecificVolume(temp, humidityRatio, pressure);
    return (1 + humidityRatio) / specificVolume;
  };

  const calculatePressureFromElevation = (elevation: number): number => {
    // Barometric pressure at elevation (kPa)
    return 101.325 * Math.pow(1 - 0.0065 * elevation / 288.15, 5.255);
  };

  const assessPlantConditions = (temp: number, rh: number, vpd: number): {
    stressLevel: 'optimal' | 'mild' | 'moderate' | 'severe';
    recommendations: string[];
    comfortZone: boolean;
    condensationRisk: boolean;
  } => {
    const recommendations: string[] = [];
    let stressLevel: 'optimal' | 'mild' | 'moderate' | 'severe' = 'optimal';
    let comfortZone = true;
    let condensationRisk = false;

    // Temperature assessment
    if (temp < 16) {
      stressLevel = 'severe';
      comfortZone = false;
      recommendations.push('Temperature too low - increase heating');
    } else if (temp < 18) {
      stressLevel = stressLevel === 'optimal' ? 'mild' : 'moderate';
      recommendations.push('Temperature slightly low for optimal growth');
    } else if (temp > 32) {
      stressLevel = 'severe';
      comfortZone = false;
      recommendations.push('Temperature too high - increase cooling');
    } else if (temp > 28) {
      stressLevel = stressLevel === 'optimal' ? 'mild' : 'moderate';
      recommendations.push('Temperature elevated - monitor for heat stress');
    }

    // Humidity and VPD assessment
    if (rh > 85) {
      condensationRisk = true;
      comfortZone = false;
      if (stressLevel === 'optimal') stressLevel = 'moderate';
      recommendations.push('Humidity too high - increase dehumidification');
      recommendations.push('High condensation risk - improve air circulation');
    } else if (rh > 75) {
      if (stressLevel === 'optimal') stressLevel = 'mild';
      recommendations.push('Humidity elevated - monitor for fungal issues');
    } else if (rh < 40) {
      comfortZone = false;
      if (stressLevel === 'optimal') stressLevel = 'moderate';
      recommendations.push('Humidity too low - increase humidification');
    } else if (rh < 50) {
      if (stressLevel === 'optimal') stressLevel = 'mild';
      recommendations.push('Humidity slightly low - consider increasing');
    }

    // VPD assessment (optimal range: 0.8-1.2 kPa for most crops)
    if (vpd < 0.4) {
      if (stressLevel === 'optimal') stressLevel = 'mild';
      recommendations.push('VPD too low - may reduce transpiration');
    } else if (vpd > 1.6) {
      if (stressLevel === 'optimal') stressLevel = 'moderate';
      recommendations.push('VPD too high - plants may experience water stress');
    } else if (vpd > 1.3) {
      if (stressLevel === 'optimal') stressLevel = 'mild';
      recommendations.push('VPD slightly elevated - monitor water uptake');
    }

    // Crop-specific recommendations
    const cropOptimalRanges = {
      leafy: { tempMin: 18, tempMax: 24, rhMin: 50, rhMax: 70, vpdMax: 1.0 },
      fruiting: { tempMin: 20, tempMax: 28, rhMin: 60, rhMax: 75, vpdMax: 1.2 },
      herbs: { tempMin: 19, tempMax: 26, rhMin: 55, rhMax: 70, vpdMax: 1.1 },
      ornamental: { tempMin: 18, tempMax: 25, rhMin: 50, rhMax: 65, vpdMax: 0.9 }
    };

    const cropRange = cropOptimalRanges[inputs.cropType];
    if (temp < cropRange.tempMin || temp > cropRange.tempMax) {
      recommendations.push(`${inputs.cropType} crops prefer ${cropRange.tempMin}-${cropRange.tempMax}°C`);
    }
    if (rh < cropRange.rhMin || rh > cropRange.rhMax) {
      recommendations.push(`${inputs.cropType} crops prefer ${cropRange.rhMin}-${cropRange.rhMax}% RH`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Environmental conditions are optimal');
    }

    return { stressLevel, recommendations, comfortZone, condensationRisk };
  };

  const calculatePsychrometrics = (): PsychrometricProperties => {
    const { dryBulbTemp, inputType, secondaryValue, barometricPressure } = inputs;
    
    let rh: number = 0;
    let wetBulb: number = 0;
    let dewPoint: number = 0;
    let absoluteHumidity: number = 0;
    
    // Calculate missing properties based on input type
    switch (inputType) {
      case 'relativeHumidity':
        rh = secondaryValue;
        dewPoint = calculateDewPoint(dryBulbTemp, rh);
        wetBulb = calculateWetBulbTemp(dryBulbTemp, rh, barometricPressure);
        absoluteHumidity = calculateAbsoluteHumidity(dryBulbTemp, rh, barometricPressure);
        break;
        
      case 'wetBulbTemp':
        wetBulb = secondaryValue;
        // Iteratively solve for RH from wet bulb temperature
        let testRH = 50;
        let iteration = 0;
        while (iteration < 100) {
          const calculatedWetBulb = calculateWetBulbTemp(dryBulbTemp, testRH, barometricPressure);
          if (Math.abs(calculatedWetBulb - wetBulb) < 0.01) break;
          testRH += (wetBulb - calculatedWetBulb) * 2;
          testRH = Math.max(0, Math.min(100, testRH));
          iteration++;
        }
        rh = testRH;
        dewPoint = calculateDewPoint(dryBulbTemp, rh);
        absoluteHumidity = calculateAbsoluteHumidity(dryBulbTemp, rh, barometricPressure);
        break;
        
      case 'dewPoint':
        dewPoint = secondaryValue;
        const vp = calculateSaturationPressure(dewPoint);
        const satPress = calculateSaturationPressure(dryBulbTemp);
        rh = (vp / satPress) * 100;
        wetBulb = calculateWetBulbTemp(dryBulbTemp, rh, barometricPressure);
        absoluteHumidity = calculateAbsoluteHumidity(dryBulbTemp, rh, barometricPressure);
        break;
        
      case 'absoluteHumidity':
        absoluteHumidity = secondaryValue / 1000; // Convert g/kg to kg/kg
        const vp_abs = (absoluteHumidity * barometricPressure) / (0.622 + absoluteHumidity);
        const satPress_abs = calculateSaturationPressure(dryBulbTemp);
        rh = (vp_abs / satPress_abs) * 100;
        dewPoint = calculateDewPoint(dryBulbTemp, rh);
        wetBulb = calculateWetBulbTemp(dryBulbTemp, rh, barometricPressure);
        break;
    }
    
    // Calculate derived properties
    const vaporPressure = calculateVaporPressure(dryBulbTemp, rh);
    const saturationPressure = calculateSaturationPressure(dryBulbTemp);
    const vpd = saturationPressure - vaporPressure;
    const specificVolume = calculateSpecificVolume(dryBulbTemp, absoluteHumidity, barometricPressure);
    const enthalpy = calculateEnthalpy(dryBulbTemp, absoluteHumidity);
    const density = calculateDensity(dryBulbTemp, absoluteHumidity, barometricPressure);
    
    // Assess plant conditions
    const assessment = assessPlantConditions(dryBulbTemp, rh, vpd);
    
    return {
      dryBulbTemp,
      wetBulbTemp: wetBulb,
      dewPoint,
      relativeHumidity: rh,
      absoluteHumidity: absoluteHumidity * 1000, // Convert back to g/kg for display
      specificVolume,
      enthalpy,
      vaporPressure,
      saturationPressure,
      vaporPressureDeficit: vpd,
      density,
      ...assessment
    };
  };

  useEffect(() => {
    // Update barometric pressure based on elevation
    if (inputs.elevation !== 0) {
      const calculatedPressure = calculatePressureFromElevation(inputs.elevation);
      setInputs(prev => ({ ...prev, barometricPressure: calculatedPressure }));
    }
  }, [inputs.elevation]);

  useEffect(() => {
    setResults(calculatePsychrometrics());
  }, [inputs]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Geolocation and weather functions
  const getLocationAndWeather = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      // Get location
      const location = await weatherGeoService.getCurrentLocation();
      setLocationData(location);

      // Update barometric pressure based on elevation
      if (location.elevation) {
        const pressureAtElevation = calculatePressureFromElevation(location.elevation);
        setInputs(prev => ({ ...prev, barometricPressure: pressureAtElevation }));
      }

      setIsLoadingWeather(true);
      
      // Get weather data
      const weather = await weatherGeoService.getCurrentWeather(location);
      setWeatherData(weather);

      // Auto-populate environmental data
      setInputs(prev => ({
        ...prev,
        dryBulbTemp: weather.temperature,
        secondaryValue: prev.inputType === 'relativeHumidity' ? weather.humidity : prev.secondaryValue,
        barometricPressure: weather.pressure
      }));

    } catch (error: any) {
      setLocationError(error.message || 'Failed to get location or weather data');
      console.error('Geolocation/Weather error:', error);
    } finally {
      setIsLoadingLocation(false);
      setIsLoadingWeather(false);
    }
  };

  const useOutdoorConditions = () => {
    if (weatherData) {
      setInputs(prev => ({
        ...prev,
        dryBulbTemp: weatherData.temperature,
        secondaryValue: prev.inputType === 'relativeHumidity' ? weatherData.humidity : prev.secondaryValue,
        barometricPressure: weatherData.pressure
      }));
    }
  };

  const formatValue = (value: number | undefined, unit: string): string => {
    if (value === undefined) return 'N/A';
    return `${value.toFixed(inputs.precision)} ${unit}`;
  };

  const exportReport = () => {
    if (!results) return;

    const reportData = {
      timestamp: new Date().toISOString(),
      inputs: inputs,
      location: locationData,
      weather: weatherData,
      results: results
    };

    // Create comprehensive text report
    const reportText = `
PSYCHROMETRIC ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

INPUTS:
- Dry Bulb Temperature: ${formatValue(inputs.dryBulbTemp, '°C')}
- ${inputs.inputType === 'relativeHumidity' ? 'Relative Humidity' : 
      inputs.inputType === 'wetBulbTemp' ? 'Wet Bulb Temperature' :
      inputs.inputType === 'dewPoint' ? 'Dew Point' : 'Absolute Humidity'}: ${inputs.secondaryValue}
- Barometric Pressure: ${formatValue(inputs.barometricPressure, 'kPa')}
- Elevation: ${inputs.elevation} m
- Crop Type: ${inputs.cropType}

CALCULATED PROPERTIES:
- Dry Bulb Temperature: ${formatValue(results.dryBulbTemp, '°C')}
- Wet Bulb Temperature: ${formatValue(results.wetBulbTemp, '°C')}
- Dew Point: ${formatValue(results.dewPoint, '°C')}
- Relative Humidity: ${formatValue(results.relativeHumidity, '%')}
- Absolute Humidity: ${formatValue(results.absoluteHumidity, 'g/kg')}
- Specific Volume: ${formatValue(results.specificVolume, 'm³/kg')}
- Enthalpy: ${formatValue(results.enthalpy, 'kJ/kg')}
- Density: ${formatValue(results.density, 'kg/m³')}
- Vapor Pressure: ${formatValue(results.vaporPressure, 'kPa')}
- Saturation Pressure: ${formatValue(results.saturationPressure, 'kPa')}
- Vapor Pressure Deficit (VPD): ${formatValue(results.vaporPressureDeficit, 'kPa')}

PLANT HEALTH ASSESSMENT:
- Stress Level: ${results.plantStressLevel}
- Comfort Zone: ${results.comfortZone ? 'Yes' : 'No'}
- Condensation Risk: ${results.condensationRisk ? 'High' : 'Low'}

RECOMMENDATIONS:
${results.recommendations?.map(rec => `- ${rec}`).join('\n') || 'No specific recommendations'}

${locationData ? `
LOCATION DATA:
- City: ${locationData.city || 'Unknown'}, ${locationData.region || 'Unknown'}
- Coordinates: ${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}
- Elevation: ${locationData.elevation?.toFixed(0) || 'Unknown'} m
` : ''}

${weatherData ? `
OUTDOOR CONDITIONS:
- Temperature: ${weatherData.temperature.toFixed(1)}°C
- Humidity: ${weatherData.humidity.toFixed(0)}%
- Pressure: ${weatherData.pressure.toFixed(1)} kPa
- Wind Speed: ${weatherData.windSpeed.toFixed(1)} m/s
${weatherData.solarRadiation ? `- Solar Radiation: ${weatherData.solarRadiation.toFixed(0)} W/m²` : ''}
` : ''}

Report generated by Vibelux Psychrometric Calculator
`;

    // Create and download the file
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `psychrometric-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also create JSON export
    const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `psychrometric-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
    URL.revokeObjectURL(jsonUrl);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg shadow-blue-500/20 mb-4">
          <Gauge className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Psychrometric Calculator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Calculate air properties and assess environmental conditions for optimal plant growth
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Primary Inputs */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-400" />
            Primary Inputs
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Dry Bulb Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.dryBulbTemp}
                onChange={(e) => setInputs({...inputs, dryBulbTemp: Number(e.target.value)})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400">Secondary Input Type</label>
              <select
                value={inputs.inputType}
                onChange={(e) => setInputs({...inputs, inputType: e.target.value as any})}
                className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="relativeHumidity">Relative Humidity (%)</option>
                <option value="wetBulbTemp">Wet Bulb Temperature (°C)</option>
                <option value="dewPoint">Dew Point (°C)</option>
                <option value="absoluteHumidity">Absolute Humidity (g/kg)</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400">
                {inputs.inputType === 'relativeHumidity' && 'Relative Humidity (%)'}
                {inputs.inputType === 'wetBulbTemp' && 'Wet Bulb Temperature (°C)'}
                {inputs.inputType === 'dewPoint' && 'Dew Point (°C)'}
                {inputs.inputType === 'absoluteHumidity' && 'Absolute Humidity (g/kg)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.secondaryValue}
                onChange={(e) => setInputs({...inputs, secondaryValue: Number(e.target.value)})}
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
              </select>
            </div>
          </div>
        </div>

        {/* Environmental Settings */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-4 flex items-center justify-between text-white hover:bg-gray-800/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Environmental Settings
            </span>
            <span className="text-gray-400">{showAdvanced ? '−' : '+'}</span>
          </button>
          
          {showAdvanced && (
            <div className="p-6 pt-0 space-y-4">
              <div>
                <label className="text-sm text-gray-400">Elevation (m)</label>
                <input
                  type="number"
                  value={inputs.elevation}
                  onChange={(e) => setInputs({...inputs, elevation: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Barometric Pressure (kPa)</label>
                <input
                  type="number"
                  step="0.001"
                  value={inputs.barometricPressure}
                  onChange={(e) => setInputs({...inputs, barometricPressure: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Precision (decimal places)</label>
                <select
                  value={inputs.precision}
                  onChange={(e) => setInputs({...inputs, precision: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Geolocation & Weather */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-green-400" />
            Location & Weather
          </h3>
          
          <div className="space-y-3">
            {isMounted && isGeolocationAvailable() ? (
              <button
                onClick={getLocationAndWeather}
                disabled={isLoadingLocation || isLoadingWeather}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {isLoadingLocation || isLoadingWeather ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {isLoadingLocation ? 'Getting Location...' : 
                 isLoadingWeather ? 'Getting Weather...' : 
                 'Get Local Weather'}
              </button>
            ) : isMounted ? (
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <p className="text-xs text-yellow-400">
                  Geolocation not available in this browser
                </p>
              </div>
            ) : (
              <div className="p-2 bg-gray-500/10 rounded-lg border border-gray-500/30">
                <p className="text-xs text-gray-400">
                  Loading...
                </p>
              </div>
            )}

            {locationError && (
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-xs text-red-400">{locationError}</p>
              </div>
            )}

            {weatherData && (
              <button
                onClick={useOutdoorConditions}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Cloud className="w-4 h-4" />
                Use Outdoor Conditions
              </button>
            )}

            <button
              onClick={() => setShowChart(!showChart)}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                showChart 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {showChart ? 'Hide' : 'Show'} Psychrometric Chart
            </button>
            
            <button 
              onClick={exportReport}
              disabled={!results}
              className="w-full py-2 px-4 bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Location Info */}
          {locationData && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Location</h4>
              <div className="text-xs text-gray-400 space-y-1">
                {locationData.city && <div>{locationData.city}, {locationData.region}</div>}
                <div>Lat: {locationData.latitude.toFixed(4)}, Lon: {locationData.longitude.toFixed(4)}</div>
                {locationData.elevation && <div>Elevation: {locationData.elevation.toFixed(0)}m</div>}
              </div>
            </div>
          )}

          {/* Weather Info */}
          {weatherData && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Outdoor Weather</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Temperature: {weatherData.temperature.toFixed(1)}°C</div>
                <div>Humidity: {weatherData.humidity.toFixed(0)}%</div>
                <div>Pressure: {weatherData.pressure.toFixed(1)} kPa</div>
                <div>Wind: {weatherData.windSpeed.toFixed(1)} m/s</div>
                {weatherData.solarRadiation && (
                  <div>Solar: {weatherData.solarRadiation.toFixed(0)} W/m²</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      {results && (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calculated Properties */}
          <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-400" />
              Calculated Properties
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Dry Bulb Temp</p>
                <p className="text-white font-semibold">{formatValue(results.dryBulbTemp, '°C')}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Wet Bulb Temp</p>
                <p className="text-white font-semibold">{formatValue(results.wetBulbTemp, '°C')}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Dew Point</p>
                <p className="text-white font-semibold">{formatValue(results.dewPoint, '°C')}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Relative Humidity</p>
                <p className="text-white font-semibold">{formatValue(results.relativeHumidity, '%')}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Absolute Humidity</p>
                <p className="text-white font-semibold">{formatValue(results.absoluteHumidity, 'g/kg')}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Specific Volume</p>
                <p className="text-white font-semibold">{formatValue(results.specificVolume, 'm³/kg')}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Enthalpy</p>
                <p className="text-white font-semibold">{formatValue(results.enthalpy, 'kJ/kg')}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Density</p>
                <p className="text-white font-semibold">{formatValue(results.density, 'kg/m³')}</p>
              </div>
            </div>
          </div>

          {/* Plant Health Indicators */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Plant Health
            </h3>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                results.plantStressLevel === 'optimal' 
                  ? 'bg-green-500/10 border-green-500/30'
                  : results.plantStressLevel === 'mild'
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : results.plantStressLevel === 'moderate'
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    results.plantStressLevel === 'optimal' ? 'bg-green-400' :
                    results.plantStressLevel === 'mild' ? 'bg-yellow-400' :
                    results.plantStressLevel === 'moderate' ? 'bg-orange-400' : 'bg-red-400'
                  }`} />
                  <span className={`font-medium ${
                    results.plantStressLevel === 'optimal' ? 'text-green-400' :
                    results.plantStressLevel === 'mild' ? 'text-yellow-400' :
                    results.plantStressLevel === 'moderate' ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {(results.plantStressLevel || 'unknown').charAt(0).toUpperCase() + (results.plantStressLevel || 'unknown').slice(1)} Conditions
                  </span>
                </div>
                
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">VPD:</span>
                    <span className="text-white font-medium">{formatValue(results.vaporPressureDeficit, 'kPa')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Comfort Zone:</span>
                    <span className={results.comfortZone ? 'text-green-400' : 'text-red-400'}>
                      {results.comfortZone ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Condensation Risk:</span>
                    <span className={results.condensationRisk ? 'text-red-400' : 'text-green-400'}>
                      {results.condensationRisk ? 'High' : 'Low'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Vapor Pressure</p>
                <p className="text-white font-semibold">{formatValue(results.vaporPressure, 'kPa')}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm">Saturation Pressure</p>
                <p className="text-white font-semibold">{formatValue(results.saturationPressure, 'kPa')}</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Recommendations
            </h3>
            
            <div className="space-y-2">
              {results.recommendations?.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{rec}</span>
                </div>
              ))}
            </div>
            
            {results.condensationRisk && (
              <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Condensation Warning</span>
                </div>
                <p className="text-red-300 text-xs mt-1">
                  High humidity may cause condensation on plant surfaces
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Psychrometric Chart */}
      {showChart && results && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Interactive Psychrometric Chart
          </h3>
          
          <InteractivePsychrometricChart
            currentPoint={{
              dryBulbTemp: results.dryBulbTemp || 0,
              relativeHumidity: results.relativeHumidity || 0,
              absoluteHumidity: results.absoluteHumidity || 0,
              wetBulbTemp: results.wetBulbTemp || 0,
              dewPoint: results.dewPoint || 0,
              vaporPressureDeficit: results.vaporPressureDeficit || 0,
              enthalpy: results.enthalpy || 0
            }}
            cropType={inputs.cropType}
            width={800}
            height={600}
            showComfortZones={true}
            showGridLines={true}
          />
        </div>
      )}
    </div>
  );
}