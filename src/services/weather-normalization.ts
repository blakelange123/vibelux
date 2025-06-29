import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface WeatherData {
  date: Date;
  avgTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  humidity: number;
  solarRadiation?: number;
  hdd: number; // Heating Degree Days
  cdd: number; // Cooling Degree Days
}

interface EnergyData {
  date: Date;
  consumption: number; // kWh
  peakDemand: number; // kW
  productionOutput?: number; // lbs or units produced
}

interface RegressionModel {
  intercept: number;
  hddCoefficient: number;
  cddCoefficient: number;
  humidityCoefficient: number;
  productionCoefficient: number;
  rSquared: number;
  standardError: number;
  // Enhanced spectral lighting coefficients
  spectralCoefficients?: {
    dli_total: number;
    uv_a_percent: number;
    uv_a_percent_squared: number;
    blue_percent: number;
    blue_percent_squared: number;
    red_percent: number;
    red_percent_squared: number;
    far_red_percent: number;
    blue_red_interaction: number;
    red_far_red_ratio: number;
    ppfd_average: number;
    photoperiod_hours: number;
    co2_ppm: number;
    vpd_kpa: number;
    light_uniformity: number;
    canopy_penetration: number;
    lai: number;
    nutrient_ec: number;
    growth_stage_factor: number;
  };
}

interface NormalizedResult {
  actualConsumption: number;
  normalizedConsumption: number;
  weatherImpact: number;
  savings: number;
  savingsPercent: number;
  confidence: number;
  details: {
    hddAdjustment: number;
    cddAdjustment: number;
    humidityAdjustment: number;
    baselineWeather: WeatherData;
    currentWeather: WeatherData;
  };
}

// Calculate Heating Degree Days
export function calculateHDD(avgTemp: number, baseTemp: number = 65): number {
  return Math.max(0, baseTemp - avgTemp);
}

// Calculate Cooling Degree Days
export function calculateCDD(avgTemp: number, baseTemp: number = 65): number {
  return Math.max(0, avgTemp - baseTemp);
}

// Fetch weather data from NOAA
export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  date: Date
): Promise<WeatherData> {
  try {
    // In production, this would call NOAA API
    // For now, simulating with realistic data
    const month = date.getMonth();
    const isWinter = month >= 10 || month <= 2;
    const isSummer = month >= 5 && month <= 8;
    
    const avgTemp = isWinter ? 45 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15 : 
                    isSummer ? 75 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15 : 
                    60 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10;
    
    return {
      date,
      avgTemperature: avgTemp,
      minTemperature: avgTemp - 10,
      maxTemperature: avgTemp + 10,
      humidity: 50 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30,
      solarRadiation: isSummer ? 600 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 : 200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200,
      hdd: calculateHDD(avgTemp),
      cdd: calculateCDD(avgTemp)
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

// Build regression model from historical data
export async function buildRegressionModel(
  facilityId: string,
  startDate: Date,
  endDate: Date
): Promise<RegressionModel> {
  // Fetch historical energy and weather data
  const historicalData = await fetchHistoricalData(facilityId, startDate, endDate);
  
  if (historicalData.length < 12) {
    throw new Error('Insufficient data for regression model. Need at least 12 months.');
  }
  
  // Perform multiple linear regression
  const regression = performMultipleRegression(historicalData);
  
  // Validate model quality
  if (regression.rSquared < 0.75) {
    console.warn('Low R² value:', regression.rSquared, 'Model may not be reliable');
  }
  
  return regression;
}

// Perform multiple linear regression
function performMultipleRegression(data: any[]): RegressionModel {
  const n = data.length;
  
  // Prepare matrices for regression
  // Y = energy consumption
  // X = [1, HDD, CDD, Humidity, Production]
  
  const Y = data.map(d => d.energy.consumption);
  const X = data.map(d => [
    1, // intercept
    d.weather.hdd,
    d.weather.cdd,
    d.weather.humidity,
    d.energy.productionOutput || 0
  ]);
  
  // Calculate regression coefficients using normal equation
  // β = (X'X)^(-1)X'Y
  const coefficients = calculateRegressionCoefficients(X, Y);
  
  // Calculate R² and standard error
  const predictions = X.map(row => 
    row.reduce((sum, val, idx) => sum + val * coefficients[idx], 0)
  );
  
  const meanY = Y.reduce((sum, val) => sum + val, 0) / n;
  const totalSS = Y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
  const residualSS = Y.reduce((sum, val, idx) => 
    sum + Math.pow(val - predictions[idx], 2), 0
  );
  
  const rSquared = 1 - (residualSS / totalSS);
  const standardError = Math.sqrt(residualSS / (n - 5)); // n - p (parameters)
  
  return {
    intercept: coefficients[0],
    hddCoefficient: coefficients[1],
    cddCoefficient: coefficients[2],
    humidityCoefficient: coefficients[3],
    productionCoefficient: coefficients[4],
    rSquared,
    standardError
  };
}

// Calculate weather-normalized consumption
export async function calculateNormalizedConsumption(
  facilityId: string,
  actualConsumption: number,
  currentDate: Date,
  baselineModel: RegressionModel
): Promise<NormalizedResult> {
  // Get current weather data
  const facility = await getFacilityLocation(facilityId);
  const currentWeather = await fetchWeatherData(
    facility.latitude,
    facility.longitude,
    currentDate
  );
  
  // Get baseline period average weather
  const baselineWeather = await getBaselineWeatherAverage(facilityId);
  
  // Calculate weather adjustments
  const hddAdjustment = (baselineWeather.hdd - currentWeather.hdd) * baselineModel.hddCoefficient;
  const cddAdjustment = (baselineWeather.cdd - currentWeather.cdd) * baselineModel.cddCoefficient;
  const humidityAdjustment = (baselineWeather.humidity - currentWeather.humidity) * baselineModel.humidityCoefficient;
  
  // Total weather impact
  const weatherImpact = hddAdjustment + cddAdjustment + humidityAdjustment;
  
  // Normalized consumption (what consumption would have been under baseline weather)
  const normalizedConsumption = actualConsumption + weatherImpact;
  
  // Calculate expected baseline consumption
  const expectedBaseline = baselineModel.intercept +
    (baselineWeather.hdd * baselineModel.hddCoefficient) +
    (baselineWeather.cdd * baselineModel.cddCoefficient) +
    (baselineWeather.humidity * baselineModel.humidityCoefficient);
  
  // Calculate savings
  const savings = expectedBaseline - normalizedConsumption;
  const savingsPercent = (savings / expectedBaseline) * 100;
  
  // Calculate confidence interval
  const confidence = calculateConfidence(baselineModel.rSquared, baselineModel.standardError);
  
  return {
    actualConsumption,
    normalizedConsumption,
    weatherImpact,
    savings,
    savingsPercent,
    confidence,
    details: {
      hddAdjustment,
      cddAdjustment,
      humidityAdjustment,
      baselineWeather,
      currentWeather
    }
  };
}

// Enhanced spectral lighting data interface
interface SpectralLightingData {
  dli_total: number; // Daily Light Integral (mol/m²/day)
  ppfd_average: number; // Average photosynthetic photon flux density
  photoperiod_hours: number;
  spectral_composition: {
    uv_a_percent: number; // 380-400nm
    violet_percent: number; // 400-420nm
    blue_percent: number; // 420-490nm
    cyan_percent: number; // 490-520nm
    green_percent: number; // 520-565nm
    yellow_percent: number; // 565-590nm
    red_percent: number; // 590-700nm
    far_red_percent: number; // 700-780nm
  };
  light_quality_metrics: {
    red_far_red_ratio: number;
    blue_green_ratio: number;
    blue_red_ratio: number;
    uniformity_coefficient: number;
    canopy_penetration_index: number;
  };
  environmental_factors: {
    co2_ppm: number;
    vpd_kpa: number;
    air_flow_rate: number;
    nutrient_ec: number;
    ph: number;
    root_zone_temp: number;
  };
  plant_architecture: {
    lai: number; // Leaf Area Index
    canopy_height_cm: number;
    plant_density_per_m2: number;
    growth_stage: 'seedling' | 'vegetative' | 'flowering' | 'ripening';
    days_in_stage: number;
  };
}

// Enhanced regression function for spectral lighting
export function calculateSpectralLightingImpact(
  spectralData: SpectralLightingData,
  baselineSpectralData: SpectralLightingData,
  cropType: 'cannabis' | 'lettuce' | 'tomato' | 'leafy_greens' = 'cannabis'
): number {
  const spec = spectralData.spectral_composition;
  const baseline = baselineSpectralData.spectral_composition;
  const env = spectralData.environmental_factors;
  const plant = spectralData.plant_architecture;
  
  // Cannabis-specific THC production model
  if (cropType === 'cannabis') {
    const thc_impact = 
      (spec.uv_a_percent - baseline.uv_a_percent) * 2.31 +
      Math.pow(spec.uv_a_percent - baseline.uv_a_percent, 2) * -0.28 +
      (spec.blue_percent - baseline.blue_percent) * 0.82 +
      (spec.violet_percent - baseline.violet_percent) * 1.15 +
      (spectralData.environmental_factors.co2_ppm - baselineSpectralData.environmental_factors.co2_ppm) * 0.002 +
      (spectralData.environmental_factors.vpd_kpa - baselineSpectralData.environmental_factors.vpd_kpa) * -15 +
      (spectralData.dli_total - baselineSpectralData.dli_total) * 0.54;
    
    return thc_impact * 100; // Convert to energy impact (kWh)
  }
  
  // Lettuce quality model
  if (cropType === 'lettuce') {
    const quality_impact =
      (spec.blue_percent - baseline.blue_percent) * 1.43 +
      (spec.red_percent - baseline.red_percent) * 0.92 +
      (spec.far_red_percent - baseline.far_red_percent) * -0.67 +
      (spec.green_percent - baseline.green_percent) * 0.38 +
      Math.pow(Math.max(0, spec.blue_percent - 20), 2) * -0.15 +
      (spectralData.light_quality_metrics.red_far_red_ratio - baselineSpectralData.light_quality_metrics.red_far_red_ratio) * 0.84;
    
    return quality_impact * 75; // Convert to energy impact
  }
  
  // General yield model
  const yield_impact =
    (spectralData.dli_total - baselineSpectralData.dli_total) * 50 +
    (spec.uv_a_percent - baseline.uv_a_percent) * 1.5 +
    Math.pow(spec.uv_a_percent - baseline.uv_a_percent, 2) * -0.2 +
    (spec.blue_percent - baseline.blue_percent) * 1.2 +
    Math.pow(spec.blue_percent - baseline.blue_percent, 2) * -0.1 +
    (spec.red_percent - baseline.red_percent) * 1.0 +
    Math.pow(spec.red_percent - baseline.red_percent, 2) * -0.08 +
    (spec.far_red_percent - baseline.far_red_percent) * 0.8 +
    (spec.blue_percent * spec.red_percent / 100 - baseline.blue_percent * baseline.red_percent / 100) * 0.05 +
    (spectralData.light_quality_metrics.red_far_red_ratio - baselineSpectralData.light_quality_metrics.red_far_red_ratio) * 25 +
    (env.co2_ppm - baselineSpectralData.environmental_factors.co2_ppm) * 0.05 +
    (env.vpd_kpa - baselineSpectralData.environmental_factors.vpd_kpa) * -50 +
    (spectralData.ppfd_average - baselineSpectralData.ppfd_average) * 0.2 +
    (spectralData.photoperiod_hours - baselineSpectralData.photoperiod_hours) * 100 +
    (spectralData.light_quality_metrics.uniformity_coefficient - baselineSpectralData.light_quality_metrics.uniformity_coefficient) * 200 +
    (spectralData.light_quality_metrics.canopy_penetration_index - baselineSpectralData.light_quality_metrics.canopy_penetration_index) * 150 +
    (plant.lai - baselineSpectralData.plant_architecture.lai) * 80 +
    (env.nutrient_ec - baselineSpectralData.environmental_factors.nutrient_ec) * 30;
  
  return yield_impact;
}

// Advanced adjustments for CEA facilities
export function applyCEAAdjustments(
  normalizedResult: NormalizedResult,
  facilityType: 'greenhouse' | 'indoor' | 'vertical',
  additionalFactors: {
    cropType?: string;
    growthStage?: string;
    lightingSchedule?: { on: number; off: number };
    co2Enrichment?: boolean;
    spectralData?: SpectralLightingData;
    baselineSpectralData?: SpectralLightingData;
  }
): NormalizedResult {
  let adjustedResult = { ...normalizedResult };
  
  // Apply spectral lighting impact if data is available
  if (additionalFactors.spectralData && additionalFactors.baselineSpectralData) {
    const spectralImpact = calculateSpectralLightingImpact(
      additionalFactors.spectralData,
      additionalFactors.baselineSpectralData,
      additionalFactors.cropType as 'cannabis' | 'lettuce' | 'tomato' | 'leafy_greens'
    );
    adjustedResult.weatherImpact += spectralImpact;
    adjustedResult.normalizedConsumption += spectralImpact;
  }
  
  // Greenhouse-specific adjustments
  if (facilityType === 'greenhouse') {
    // Solar radiation impact on supplemental lighting
    const solarImpact = calculateSolarLightingAdjustment(
      normalizedResult.details.currentWeather.solarRadiation || 0,
      normalizedResult.details.baselineWeather.solarRadiation || 0
    );
    adjustedResult.weatherImpact += solarImpact;
    adjustedResult.normalizedConsumption += solarImpact;
  }
  
  // Indoor/Vertical farm adjustments
  if (facilityType === 'indoor' || facilityType === 'vertical') {
    // These facilities are less weather-sensitive but more sensitive to:
    // - Humidity control (dehumidification load)
    // - Heat removal from lights
    const dehumidificationAdjustment = calculateDehumidificationLoad(
      normalizedResult.details.currentWeather.humidity,
      normalizedResult.details.baselineWeather.humidity,
      facilityType === 'vertical' ? 3 : 1 // Vertical farms have higher density
    );
    adjustedResult.weatherImpact += dehumidificationAdjustment;
  }
  
  // Crop-specific adjustments
  if (additionalFactors.cropType === 'cannabis') {
    // Cannabis is particularly sensitive to VPD (Vapor Pressure Deficit)
    const vpdAdjustment = calculateVPDAdjustment(
      normalizedResult.details.currentWeather,
      normalizedResult.details.baselineWeather,
      additionalFactors.growthStage || 'vegetative'
    );
    adjustedResult.weatherImpact += vpdAdjustment;
  }
  
  return adjustedResult;
}

// Helper functions

function calculateRegressionCoefficients(X: number[][], Y: number[]): number[] {
  // Implementation of matrix operations for (X'X)^(-1)X'Y
  // In production, use a proper linear algebra library
  // This is a simplified implementation
  const numFeatures = X[0].length;
  const coefficients = new Array(numFeatures).fill(0);
  
  // Simplified calculation (in production, use proper matrix inversion)
  coefficients[0] = 80000; // Base load
  coefficients[1] = 150;   // HDD coefficient
  coefficients[2] = 200;   // CDD coefficient
  coefficients[3] = 50;    // Humidity coefficient
  coefficients[4] = 100;   // Production coefficient
  
  return coefficients;
}

function calculateConfidence(rSquared: number, standardError: number): number {
  // Convert R² and standard error to confidence percentage
  const rSquaredContribution = rSquared * 50; // Max 50 points from R²
  const errorContribution = Math.max(0, 50 - (standardError / 1000) * 10); // Max 50 points from low error
  return Math.min(100, rSquaredContribution + errorContribution);
}

function calculateSolarLightingAdjustment(
  currentSolar: number,
  baselineSolar: number
): number {
  const lightingNeed = 600; // Target W/m² for optimal growth
  const currentSupplemental = Math.max(0, lightingNeed - currentSolar);
  const baselineSupplemental = Math.max(0, lightingNeed - baselineSolar);
  const lightingEfficiency = 2.8; // μmol/J for LED
  const powerFactor = 0.5; // W per W/m² of supplemental light needed
  
  return (currentSupplemental - baselineSupplemental) * powerFactor;
}

function calculateDehumidificationLoad(
  currentHumidity: number,
  baselineHumidity: number,
  densityFactor: number = 1
): number {
  // Dehumidification energy increases exponentially with humidity
  const dehumidPower = (humidity: number) => Math.pow(humidity / 50, 2) * 10; // kW
  const currentLoad = dehumidPower(currentHumidity) * densityFactor;
  const baselineLoad = dehumidPower(baselineHumidity) * densityFactor;
  
  return (currentLoad - baselineLoad) * 24; // Convert to kWh/day
}

function calculateVPDAdjustment(
  currentWeather: WeatherData,
  baselineWeather: WeatherData,
  growthStage: string
): number {
  // Calculate VPD (Vapor Pressure Deficit)
  const calculateVPD = (temp: number, humidity: number) => {
    const svp = 610.7 * Math.exp((17.38 * temp) / (temp + 239)); // Saturation vapor pressure
    const avp = svp * (humidity / 100); // Actual vapor pressure
    return (svp - avp) / 1000; // kPa
  };
  
  const currentVPD = calculateVPD(currentWeather.avgTemperature, currentWeather.humidity);
  const baselineVPD = calculateVPD(baselineWeather.avgTemperature, baselineWeather.humidity);
  
  // Optimal VPD ranges by growth stage
  const optimalVPD = growthStage === 'flowering' ? 1.2 : 0.8;
  
  // Energy needed to maintain optimal VPD
  const currentAdjustment = Math.abs(currentVPD - optimalVPD) * 50; // kWh per kPa deviation
  const baselineAdjustment = Math.abs(baselineVPD - optimalVPD) * 50;
  
  return currentAdjustment - baselineAdjustment;
}

// Database helper functions
async function fetchHistoricalData(
  facilityId: string,
  startDate: Date,
  endDate: Date
): Promise<any[]> {
  // In production, this would query the database
  // Returning mock data for illustration
  const months = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const weather = await fetchWeatherData(40.0, -120.0, current);
    months.push({
      date: new Date(current),
      weather,
      energy: {
        consumption: 100000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50000,
        peakDemand: 200 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
        productionOutput: 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200
      }
    });
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

async function getFacilityLocation(facilityId: string): Promise<{ latitude: number; longitude: number }> {
  // In production, query database for facility location
  return { latitude: 40.0, longitude: -120.0 };
}

async function getBaselineWeatherAverage(facilityId: string): Promise<WeatherData> {
  // In production, calculate from historical baseline period
  return {
    date: new Date(),
    avgTemperature: 65,
    minTemperature: 55,
    maxTemperature: 75,
    humidity: 60,
    solarRadiation: 400,
    hdd: 150,
    cdd: 200
  };
}

// Export main normalization function for use in verification service
export async function normalizeEnergyConsumption(
  facilityId: string,
  billingPeriod: { start: Date; end: Date },
  actualConsumption: number,
  facilityType: 'greenhouse' | 'indoor' | 'vertical' = 'indoor'
): Promise<NormalizedResult> {
  // Get or build regression model
  const model = await buildRegressionModel(
    facilityId,
    new Date(billingPeriod.start.getFullYear() - 1, billingPeriod.start.getMonth()),
    billingPeriod.start
  );
  
  // Calculate base normalization
  const normalizedResult = await calculateNormalizedConsumption(
    facilityId,
    actualConsumption,
    billingPeriod.end,
    model
  );
  
  // Apply CEA-specific adjustments
  const adjustedResult = applyCEAAdjustments(
    normalizedResult,
    facilityType,
    { cropType: 'cannabis', growthStage: 'flowering' }
  );
  
  return adjustedResult;
}