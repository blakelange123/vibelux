/**
 * Solar DLI Calculator for Professional Horticultural Design
 * Calculates natural light availability for supplemental lighting design
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  elevation: number; // meters above sea level
  timezone: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
}

export interface SolarData {
  date: Date;
  sunrise: Date;
  sunset: Date;
  dayLength: number; // hours
  solarNoon: Date;
  solarElevationAngle: number; // degrees at solar noon
  solarAzimuthAngle: number; // degrees at solar noon
  extraterrestrialRadiation: number; // MJ/m²/day
  clearSkyGlobalRadiation: number; // MJ/m²/day
  actualGlobalRadiation: number; // MJ/m²/day (with cloud cover)
  parFraction: number; // fraction of global radiation that is PAR
  dailyPAR: number; // mol/m²/day of PAR
  hourlyPAR: number[]; // Array of 24 hourly PAR values (µmol/m²/s)
}

export interface ClimateData {
  averageCloudCover: number; // 0-1 (0 = clear, 1 = overcast)
  averageTemperature: number; // °C
  averageHumidity: number; // %
  precipitationDays: number; // days with precipitation per month
  atmosphericTransmittance: number; // 0-1 typical 0.7-0.8
}

export interface SeasonalDLIData {
  month: number;
  averageDLI: number; // mol/m²/day
  minDLI: number; // mol/m²/day (cloudy conditions)
  maxDLI: number; // mol/m²/day (clear conditions)
  dayLength: number; // hours
  reliability: number; // 0-1 (probability of achieving average DLI)
}

// Comprehensive location database with solar data
export const SOLAR_LOCATION_DATABASE: Record<string, LocationData & { climate: ClimateData[] }> = {
  // Major growing regions in the USA
  '90210': { // Los Angeles, CA
    latitude: 34.0522,
    longitude: -118.2437,
    elevation: 71,
    timezone: 'America/Los_Angeles',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    zipCode: '90210',
    climate: [
      { averageCloudCover: 0.35, averageTemperature: 14, averageHumidity: 70, precipitationDays: 6, atmosphericTransmittance: 0.75 }, // Jan
      { averageCloudCover: 0.32, averageTemperature: 15, averageHumidity: 72, precipitationDays: 6, atmosphericTransmittance: 0.76 }, // Feb
      { averageCloudCover: 0.38, averageTemperature: 16, averageHumidity: 74, precipitationDays: 6, atmosphericTransmittance: 0.74 }, // Mar
      { averageCloudCover: 0.28, averageTemperature: 18, averageHumidity: 72, precipitationDays: 3, atmosphericTransmittance: 0.78 }, // Apr
      { averageCloudCover: 0.25, averageTemperature: 20, averageHumidity: 75, precipitationDays: 1, atmosphericTransmittance: 0.79 }, // May
      { averageCloudCover: 0.22, averageTemperature: 23, averageHumidity: 77, precipitationDays: 0, atmosphericTransmittance: 0.80 }, // Jun
      { averageCloudCover: 0.18, averageTemperature: 25, averageHumidity: 78, precipitationDays: 0, atmosphericTransmittance: 0.82 }, // Jul
      { averageCloudCover: 0.20, averageTemperature: 26, averageHumidity: 79, precipitationDays: 0, atmosphericTransmittance: 0.81 }, // Aug
      { averageCloudCover: 0.25, averageTemperature: 24, averageHumidity: 77, precipitationDays: 1, atmosphericTransmittance: 0.79 }, // Sep
      { averageCloudCover: 0.28, averageTemperature: 21, averageHumidity: 72, precipitationDays: 2, atmosphericTransmittance: 0.78 }, // Oct
      { averageCloudCover: 0.30, averageTemperature: 17, averageHumidity: 68, precipitationDays: 3, atmosphericTransmittance: 0.77 }, // Nov
      { averageCloudCover: 0.38, averageTemperature: 14, averageHumidity: 68, precipitationDays: 5, atmosphericTransmittance: 0.74 }  // Dec
    ]
  },
  
  '85001': { // Phoenix, AZ
    latitude: 33.4484,
    longitude: -112.0740,
    elevation: 331,
    timezone: 'America/Phoenix',
    city: 'Phoenix',
    state: 'AZ',
    country: 'USA',
    zipCode: '85001',
    climate: [
      { averageCloudCover: 0.25, averageTemperature: 12, averageHumidity: 45, precipitationDays: 4, atmosphericTransmittance: 0.82 }, // Jan
      { averageCloudCover: 0.22, averageTemperature: 15, averageHumidity: 40, precipitationDays: 4, atmosphericTransmittance: 0.83 }, // Feb
      { averageCloudCover: 0.20, averageTemperature: 19, averageHumidity: 35, precipitationDays: 4, atmosphericTransmittance: 0.84 }, // Mar
      { averageCloudCover: 0.15, averageTemperature: 24, averageHumidity: 30, precipitationDays: 2, atmosphericTransmittance: 0.86 }, // Apr
      { averageCloudCover: 0.12, averageTemperature: 29, averageHumidity: 25, precipitationDays: 1, atmosphericTransmittance: 0.87 }, // May
      { averageCloudCover: 0.10, averageTemperature: 35, averageHumidity: 20, precipitationDays: 0, atmosphericTransmittance: 0.88 }, // Jun
      { averageCloudCover: 0.35, averageTemperature: 40, averageHumidity: 30, precipitationDays: 4, atmosphericTransmittance: 0.75 }, // Jul (monsoon)
      { averageCloudCover: 0.38, averageTemperature: 39, averageHumidity: 35, precipitationDays: 4, atmosphericTransmittance: 0.74 }, // Aug (monsoon)
      { averageCloudCover: 0.20, averageTemperature: 35, averageHumidity: 30, precipitationDays: 2, atmosphericTransmittance: 0.84 }, // Sep
      { averageCloudCover: 0.15, averageTemperature: 28, averageHumidity: 35, precipitationDays: 2, atmosphericTransmittance: 0.86 }, // Oct
      { averageCloudCover: 0.18, averageTemperature: 19, averageHumidity: 40, precipitationDays: 2, atmosphericTransmittance: 0.85 }, // Nov
      { averageCloudCover: 0.28, averageTemperature: 13, averageHumidity: 45, precipitationDays: 3, atmosphericTransmittance: 0.80 }  // Dec
    ]
  },

  '80202': { // Denver, CO
    latitude: 39.7392,
    longitude: -104.9903,
    elevation: 1609,
    timezone: 'America/Denver',
    city: 'Denver',
    state: 'CO',
    country: 'USA',
    zipCode: '80202',
    climate: [
      { averageCloudCover: 0.40, averageTemperature: -2, averageHumidity: 55, precipitationDays: 6, atmosphericTransmittance: 0.78 }, // Jan
      { averageCloudCover: 0.42, averageTemperature: 1, averageHumidity: 52, precipitationDays: 6, atmosphericTransmittance: 0.77 }, // Feb
      { averageCloudCover: 0.45, averageTemperature: 6, averageHumidity: 48, precipitationDays: 8, atmosphericTransmittance: 0.76 }, // Mar
      { averageCloudCover: 0.48, averageTemperature: 11, averageHumidity: 45, precipitationDays: 9, atmosphericTransmittance: 0.75 }, // Apr
      { averageCloudCover: 0.55, averageTemperature: 16, averageHumidity: 50, precipitationDays: 11, atmosphericTransmittance: 0.72 }, // May
      { averageCloudCover: 0.45, averageTemperature: 22, averageHumidity: 45, precipitationDays: 8, atmosphericTransmittance: 0.76 }, // Jun
      { averageCloudCover: 0.42, averageTemperature: 26, averageHumidity: 42, precipitationDays: 8, atmosphericTransmittance: 0.78 }, // Jul
      { averageCloudCover: 0.40, averageTemperature: 25, averageHumidity: 45, precipitationDays: 8, atmosphericTransmittance: 0.79 }, // Aug
      { averageCloudCover: 0.35, averageTemperature: 20, averageHumidity: 45, precipitationDays: 6, atmosphericTransmittance: 0.81 }, // Sep
      { averageCloudCover: 0.35, averageTemperature: 13, averageHumidity: 45, precipitationDays: 6, atmosphericTransmittance: 0.81 }, // Oct
      { averageCloudCover: 0.38, averageTemperature: 5, averageHumidity: 50, precipitationDays: 5, atmosphericTransmittance: 0.80 }, // Nov
      { averageCloudCover: 0.42, averageTemperature: -1, averageHumidity: 55, precipitationDays: 5, atmosphericTransmittance: 0.78 }  // Dec
    ]
  },

  // Add more locations as needed...
};

export class SolarDLICalculator {
  
  /**
   * Calculate solar position and radiation for a given location and date
   */
  static calculateSolarData(location: LocationData, date: Date, climate: ClimateData): SolarData {
    const dayOfYear = this.getDayOfYear(date);
    const latitude = location.latitude * Math.PI / 180; // Convert to radians
    
    // Solar declination angle
    const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180) * Math.PI / 180;
    
    // Hour angle for sunrise/sunset
    const hourAngle = Math.acos(-Math.tan(latitude) * Math.tan(declination));
    
    // Day length in hours
    const dayLength = 2 * hourAngle * 12 / Math.PI;
    
    // Solar times
    const solarNoon = new Date(date);
    solarNoon.setHours(12, 0, 0, 0);
    
    const sunrise = new Date(solarNoon.getTime() - (dayLength / 2) * 60 * 60 * 1000);
    const sunset = new Date(solarNoon.getTime() + (dayLength / 2) * 60 * 60 * 1000);
    
    // Solar elevation angle at solar noon
    const solarElevationAngle = (90 - Math.abs(location.latitude - declination * 180 / Math.PI));
    
    // Extraterrestrial radiation (MJ/m²/day)
    const solarConstant = 1367; // W/m²
    const eccentricityCorrection = 1 + 0.033 * Math.cos(2 * Math.PI * dayOfYear / 365);
    const extraterrestrialRadiation = (solarConstant * eccentricityCorrection * dayLength * 3600 * 
      (Math.sin(latitude) * Math.sin(declination) + Math.cos(latitude) * Math.cos(declination) * Math.sin(hourAngle)) / hourAngle) / 1000000;
    
    // Clear sky global radiation
    const clearSkyGlobalRadiation = extraterrestrialRadiation * climate.atmosphericTransmittance;
    
    // Actual global radiation (accounting for cloud cover)
    const cloudCoverReduction = 1 - (0.75 * Math.pow(climate.averageCloudCover, 3.4));
    const actualGlobalRadiation = clearSkyGlobalRadiation * cloudCoverReduction;
    
    // PAR fraction (typically 45-50% of global solar radiation)
    const parFraction = 0.47;
    
    // Daily PAR in mol/m²/day (1 MJ/m² ≈ 4.57 mol photons/m²)
    const dailyPAR = actualGlobalRadiation * parFraction * 4.57;
    
    // Generate hourly PAR distribution
    const hourlyPAR = this.generateHourlyPAR(dailyPAR, dayLength, sunrise, sunset);
    
    return {
      date,
      sunrise,
      sunset,
      dayLength,
      solarNoon,
      solarElevationAngle,
      solarAzimuthAngle: 180, // South at solar noon
      extraterrestrialRadiation,
      clearSkyGlobalRadiation,
      actualGlobalRadiation,
      parFraction,
      dailyPAR,
      hourlyPAR
    };
  }
  
  /**
   * Generate hourly PAR values throughout the day
   */
  private static generateHourlyPAR(dailyPAR: number, dayLength: number, sunrise: Date, sunset: Date): number[] {
    const hourlyValues = new Array(24).fill(0);
    
    if (dayLength === 0) return hourlyValues;
    
    const sunriseHour = sunrise.getHours() + sunrise.getMinutes() / 60;
    const sunsetHour = sunset.getHours() + sunset.getMinutes() / 60;
    
    // Convert daily PAR to peak hourly PAR (assuming sinusoidal distribution)
    const peakPAR = (dailyPAR * 1000000) / (dayLength * 3600 * Math.PI / 4); // Convert to µmol/m²/s
    
    for (let hour = 0; hour < 24; hour++) {
      if (hour >= sunriseHour && hour <= sunsetHour) {
        // Sinusoidal distribution of light throughout the day
        const relativePosition = (hour - sunriseHour) / (sunsetHour - sunriseHour);
        const sineValue = Math.sin(relativePosition * Math.PI);
        hourlyValues[hour] = peakPAR * sineValue;
      }
    }
    
    return hourlyValues;
  }
  
  /**
   * Calculate seasonal DLI data for a location
   */
  static calculateSeasonalDLI(location: LocationData): SeasonalDLIData[] {
    const seasonalData: SeasonalDLIData[] = [];
    const locationData = SOLAR_LOCATION_DATABASE[location.zipCode || ''];
    
    if (!locationData) {
      throw new Error(`Location data not found for ${location.zipCode || location.city}`);
    }
    
    for (let month = 0; month < 12; month++) {
      const climate = locationData.climate[month];
      
      // Calculate for middle of month
      const date = new Date(2024, month, 15);
      const solarData = this.calculateSolarData(location, date, climate);
      
      // Calculate min/max DLI based on cloud variability
      const cloudVariability = 0.3; // ±30% variation in cloud cover
      const minCloudCover = Math.max(0, climate.averageCloudCover - cloudVariability);
      const maxCloudCover = Math.min(1, climate.averageCloudCover + cloudVariability);
      
      const minClimate = { ...climate, averageCloudCover: minCloudCover };
      const maxClimate = { ...climate, averageCloudCover: maxCloudCover };
      
      const minSolarData = this.calculateSolarData(location, date, maxClimate); // Less clouds = more light
      const maxSolarData = this.calculateSolarData(location, date, minClimate); // More clouds = less light
      
      // Reliability based on cloud cover consistency
      const reliability = 1 - (climate.averageCloudCover * 0.5 + climate.precipitationDays / 31 * 0.3);
      
      seasonalData.push({
        month: month + 1,
        averageDLI: solarData.dailyPAR,
        minDLI: minSolarData.dailyPAR,
        maxDLI: maxSolarData.dailyPAR,
        dayLength: solarData.dayLength,
        reliability: Math.max(0.3, Math.min(1.0, reliability))
      });
    }
    
    return seasonalData;
  }
  
  /**
   * Calculate supplemental lighting requirements
   */
  static calculateSupplementalLighting(
    location: LocationData,
    targetDLI: number,
    month: number,
    facilityType: 'greenhouse' | 'indoor' | 'shade-house' = 'greenhouse'
  ): {
    naturalDLI: number;
    supplementalDLI: number;
    supplementalPPFD: number;
    supplementalHours: number;
    energyRequirement: number; // kWh/m²/day
    costEstimate: number; // $/m²/month
  } {
    const seasonalData = this.calculateSeasonalDLI(location);
    const monthData = seasonalData[month - 1];
    
    if (!monthData) {
      throw new Error(`Invalid month: ${month}`);
    }
    
    // Facility transmission factors
    const transmissionFactors = {
      'greenhouse': 0.70, // 70% light transmission through glass/poly
      'shade-house': 0.85, // 85% transmission through shade cloth
      'indoor': 0.0 // No natural light
    };
    
    const naturalDLI = monthData.averageDLI * transmissionFactors[facilityType];
    const supplementalDLI = Math.max(0, targetDLI - naturalDLI);
    
    // Calculate supplemental lighting parameters
    const supplementalHours = 16; // Typical supplemental lighting period
    const supplementalPPFD = supplementalDLI > 0 ? (supplementalDLI * 1000000) / (supplementalHours * 3600) : 0;
    
    // Energy calculation (assuming LED efficiency of 2.5 µmol/J)
    const ledEfficiency = 2.5; // µmol/J
    const wattage = supplementalPPFD / ledEfficiency; // W/m²
    const energyRequirement = (wattage * supplementalHours) / 1000; // kWh/m²/day
    
    // Cost estimate (assuming $0.12/kWh average commercial rate)
    const electricityRate = 0.12; // $/kWh
    const costEstimate = energyRequirement * electricityRate * 30; // $/m²/month
    
    return {
      naturalDLI,
      supplementalDLI,
      supplementalPPFD,
      supplementalHours,
      energyRequirement,
      costEstimate
    };
  }
  
  /**
   * Get location data by zip code
   */
  static getLocationByZipCode(zipCode: string): LocationData | null {
    const locationData = SOLAR_LOCATION_DATABASE[zipCode];
    return locationData ? {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      elevation: locationData.elevation,
      timezone: locationData.timezone,
      city: locationData.city,
      state: locationData.state,
      country: locationData.country,
      zipCode: locationData.zipCode
    } : null;
  }
  
  /**
   * Helper function to get day of year
   */
  private static getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Calculate optimal facility orientation
   */
  static calculateOptimalOrientation(location: LocationData): {
    optimalAzimuth: number; // degrees from north
    seasonalVariation: number; // degrees of variation through year
    annualDLIGain: number; // % increase in annual DLI
    recommendations: string[];
  } {
    const latitude = location.latitude;
    
    // For greenhouses in northern hemisphere, south-facing is typically optimal
    let optimalAzimuth = 180; // Due south
    
    // Adjust for latitude - higher latitudes benefit from southeast orientation
    if (latitude > 45) {
      optimalAzimuth = 165; // Southeast
    } else if (latitude > 35) {
      optimalAzimuth = 175; // Slightly southeast
    }
    
    const seasonalVariation = Math.abs(latitude - 35) * 0.3; // More variation at extreme latitudes
    const annualDLIGain = Math.min(15, Math.abs(latitude - 23.5) * 0.8); // Up to 15% gain
    
    const recommendations = [
      `Orient greenhouse ${optimalAzimuth}° from north (${optimalAzimuth < 180 ? 'southeast' : 'southwest'})`,
      `Consider seasonal shading for summer months`,
      latitude > 40 ? 'Steep roof angle (35-45°) for winter light capture' : 'Moderate roof angle (25-35°)',
      'Install north-south oriented benches for uniform plant exposure'
    ];
    
    return {
      optimalAzimuth,
      seasonalVariation,
      annualDLIGain,
      recommendations
    };
  }
}

// Export additional utility functions
export function getAvailableLocations(): string[] {
  return Object.keys(SOLAR_LOCATION_DATABASE);
}

export function searchLocationsByState(state: string): LocationData[] {
  return Object.values(SOLAR_LOCATION_DATABASE)
    .filter(loc => loc.state.toLowerCase() === state.toLowerCase())
    .map(loc => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
      elevation: loc.elevation,
      timezone: loc.timezone,
      city: loc.city,
      state: loc.state,
      country: loc.country,
      zipCode: loc.zipCode
    }));
}