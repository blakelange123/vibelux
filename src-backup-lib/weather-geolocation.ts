/**
 * Weather and Geolocation Service
 * Provides automatic weather data integration for environmental calculations
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  elevation?: number; // meters above sea level
  timezone?: string;
}

export interface WeatherData {
  temperature: number; // °C
  humidity: number; // %
  pressure: number; // kPa
  windSpeed: number; // m/s
  windDirection: number; // degrees
  cloudCover: number; // %
  visibility: number; // km
  uvIndex: number;
  dewPoint: number; // °C
  solarRadiation?: number; // W/m²
  precipitationRate?: number; // mm/hr
  timestamp: Date;
}

export interface EnvironmentalConditions {
  outdoor: WeatherData;
  indoor?: Partial<WeatherData>;
  ventilationRate?: number; // air changes per hour
  infiltrationRate?: number; // air changes per hour
  location: LocationData;
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'API_ERROR' | 'NETWORK_ERROR';
  message: string;
}

class WeatherGeolocationService {
  private weatherApiKey: string | null = null;
  private lastWeatherUpdate: Date | null = null;
  private weatherCache: WeatherData | null = null;
  private locationCache: LocationData | null = null;
  
  constructor() {
    // In production, this would come from environment variables
    // For demo purposes, we'll simulate weather data
    this.weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || null;
  }

  /**
   * Get current user location using browser geolocation API
   */
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 'POSITION_UNAVAILABLE',
          message: 'Geolocation is not supported by this browser'
        } as GeolocationError);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, altitude } = position.coords;
          
          try {
            // Get additional location information
            const locationData = await this.getLocationDetails(latitude, longitude);
            const fullLocation: LocationData = {
              latitude,
              longitude,
              elevation: altitude || undefined,
              ...locationData
            };
            
            this.locationCache = fullLocation;
            resolve(fullLocation);
          } catch (error) {
            // Even if we can't get details, return basic location
            const basicLocation: LocationData = {
              latitude,
              longitude,
              elevation: altitude || undefined
            };
            this.locationCache = basicLocation;
            resolve(basicLocation);
          }
        },
        (error) => {
          let errorCode: GeolocationError['code'];
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorCode = 'PERMISSION_DENIED';
              break;
            case error.POSITION_UNAVAILABLE:
              errorCode = 'POSITION_UNAVAILABLE';
              break;
            case error.TIMEOUT:
              errorCode = 'TIMEOUT';
              break;
            default:
              errorCode = 'POSITION_UNAVAILABLE';
          }
          
          reject({
            code: errorCode,
            message: error.message
          } as GeolocationError);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Get location details from coordinates (reverse geocoding)
   */
  private async getLocationDetails(lat: number, lon: number): Promise<Partial<LocationData>> {
    try {
      // Using a free geocoding service (replace with your preferred service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      
      return {
        city: data.city || data.locality,
        region: data.principalSubdivision,
        country: data.countryName,
        elevation: data.elevation || undefined
      };
    } catch (error) {
      console.warn('Could not get location details:', error);
      return {};
    }
  }

  /**
   * Get current weather data for location
   */
  async getCurrentWeather(location?: LocationData): Promise<WeatherData> {
    const targetLocation = location || this.locationCache;
    
    if (!targetLocation) {
      throw {
        code: 'POSITION_UNAVAILABLE',
        message: 'No location data available. Please enable location services.'
      } as GeolocationError;
    }

    // Check cache (update every 10 minutes)
    if (this.weatherCache && this.lastWeatherUpdate) {
      const timeSinceUpdate = Date.now() - this.lastWeatherUpdate.getTime();
      if (timeSinceUpdate < 10 * 60 * 1000) { // 10 minutes
        return this.weatherCache;
      }
    }

    try {
      // Try to fetch real weather data if API key is available
      if (this.weatherApiKey) {
        return await this.fetchRealWeatherData(targetLocation);
      } else {
        // Generate realistic simulated weather data
        return this.generateSimulatedWeather(targetLocation);
      }
    } catch (error) {
      console.warn('Weather API failed, using simulated data:', error);
      return this.generateSimulatedWeather(targetLocation);
    }
  }

  /**
   * Fetch real weather data from API
   */
  private async fetchRealWeatherData(location: LocationData): Promise<WeatherData> {
    // Example using OpenWeatherMap API (replace with your preferred service)
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${this.weatherApiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    const weatherData: WeatherData = {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure / 10, // Convert hPa to kPa
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      cloudCover: data.clouds?.all || 0,
      visibility: (data.visibility || 10000) / 1000, // Convert m to km
      uvIndex: 0, // Would need separate UV API call
      dewPoint: this.calculateDewPoint(data.main.temp, data.main.humidity),
      timestamp: new Date()
    };

    this.weatherCache = weatherData;
    this.lastWeatherUpdate = new Date();
    
    return weatherData;
  }

  /**
   * Generate realistic simulated weather data based on location and season
   */
  private generateSimulatedWeather(location: LocationData): WeatherData {
    const now = new Date();
    const dayOfYear = this.getDayOfYear(now);
    const hour = now.getHours();
    
    // Base temperature varies by latitude and season
    const latitudeFactor = Math.cos(location.latitude * Math.PI / 180);
    const seasonalFactor = Math.cos((dayOfYear - 172) * 2 * Math.PI / 365.25); // Peak summer = day 172
    const dailyFactor = Math.cos((hour - 14) * Math.PI / 12); // Peak at 2 PM
    
    const baseTemp = 20 + latitudeFactor * 15 + seasonalFactor * 10 + dailyFactor * 5;
    const temperature = baseTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 4;
    
    // Humidity tends to be higher at night and in coastal areas
    const nightHumidityBonus = Math.cos(hour * Math.PI / 12) * 15;
    const baseHumidity = 50 + nightHumidityBonus + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 20;
    const humidity = Math.max(20, Math.min(95, baseHumidity));
    
    // Pressure varies with elevation and weather patterns
    const elevationPressure = 101.325 * Math.pow(1 - 0.0065 * (location.elevation || 0) / 288.15, 5.255);
    const pressure = elevationPressure + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2;
    
    // Wind and cloud cover
    const windSpeed = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8; // 0-8 m/s
    const windDirection = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 360;
    const cloudCover = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100;
    
    const dewPoint = this.calculateDewPoint(temperature, humidity);
    
    const weatherData: WeatherData = {
      temperature,
      humidity,
      pressure,
      windSpeed,
      windDirection,
      cloudCover,
      visibility: 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20, // 10-30 km
      uvIndex: Math.max(0, Math.min(11, (1 - cloudCover / 100) * (8 - Math.abs(hour - 12) / 2))),
      dewPoint,
      solarRadiation: this.calculateSolarRadiation(location, now, cloudCover),
      precipitationRate: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.1 ? crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 : 0, // 10% chance of rain
      timestamp: now
    };

    this.weatherCache = weatherData;
    this.lastWeatherUpdate = new Date();
    
    return weatherData;
  }

  /**
   * Calculate dew point from temperature and humidity
   */
  private calculateDewPoint(temp: number, humidity: number): number {
    const a = 17.27;
    const b = 237.3;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  }

  /**
   * Calculate approximate solar radiation
   */
  private calculateSolarRadiation(location: LocationData, date: Date, cloudCover: number): number {
    const hour = date.getHours() + date.getMinutes() / 60;
    const dayOfYear = this.getDayOfYear(date);
    
    // Solar declination angle
    const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
    
    // Hour angle
    const hourAngle = 15 * (hour - 12);
    
    // Solar elevation angle
    const elevation = Math.asin(
      Math.sin(declination * Math.PI / 180) * Math.sin(location.latitude * Math.PI / 180) +
      Math.cos(declination * Math.PI / 180) * Math.cos(location.latitude * Math.PI / 180) * Math.cos(hourAngle * Math.PI / 180)
    );
    
    // Clear sky radiation (simplified model)
    const clearSkyRadiation = Math.max(0, 1000 * Math.sin(elevation));
    
    // Adjust for cloud cover
    const cloudFactor = 1 - (cloudCover / 100) * 0.8;
    
    return clearSkyRadiation * cloudFactor;
  }

  /**
   * Get day of year (1-365/366)
   */
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate heating/cooling loads based on indoor vs outdoor conditions
   */
  calculateEnergyLoads(indoor: Partial<WeatherData>, outdoor: WeatherData, spaceVolume: number): {
    heatingLoad: number; // watts
    coolingLoad: number; // watts
    dehumidificationLoad: number; // kg/hr
    humidificationLoad: number; // kg/hr
    ventilationLoad: number; // watts
  } {
    const indoorTemp = indoor.temperature || 22;
    const indoorHumidity = indoor.humidity || 60;
    const outdoorTemp = outdoor.temperature;
    const outdoorHumidity = outdoor.humidity;
    
    // Simplified energy calculations (actual calculations would be much more complex)
    const tempDiff = indoorTemp - outdoorTemp;
    const airChangesPerHour = 2; // Typical for controlled environment
    const airVolume = spaceVolume * airChangesPerHour; // m³/hr
    const airDensity = 1.2; // kg/m³
    const airMass = airVolume * airDensity; // kg/hr
    const specificHeat = 1005; // J/kg·K for air
    
    // Heating/cooling loads
    const ventilationLoad = Math.abs(tempDiff) * airMass * specificHeat / 3600; // Convert to watts
    const heatingLoad = tempDiff < 0 ? ventilationLoad : 0;
    const coolingLoad = tempDiff > 0 ? ventilationLoad : 0;
    
    // Humidity loads (simplified)
    const humidityDiff = indoorHumidity - outdoorHumidity;
    const moistureLoad = Math.abs(humidityDiff / 100) * airMass * 0.01; // Approximate kg/hr
    const dehumidificationLoad = humidityDiff > 10 ? moistureLoad : 0;
    const humidificationLoad = humidityDiff < -10 ? moistureLoad : 0;
    
    return {
      heatingLoad,
      coolingLoad,
      dehumidificationLoad,
      humidificationLoad,
      ventilationLoad
    };
  }

  /**
   * Get cached location data
   */
  getCachedLocation(): LocationData | null {
    return this.locationCache;
  }

  /**
   * Get cached weather data
   */
  getCachedWeather(): WeatherData | null {
    return this.weatherCache;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.weatherCache = null;
    this.lastWeatherUpdate = null;
    this.locationCache = null;
  }
}

// Export singleton instance
export const weatherGeoService = new WeatherGeolocationService();

// Utility functions for pressure calculations
export const calculatePressureFromElevation = (elevation: number): number => {
  return 101.325 * Math.pow(1 - 0.0065 * elevation / 288.15, 5.255);
};

export const calculateElevationFromPressure = (pressure: number): number => {
  return (288.15 / 0.0065) * (1 - Math.pow(pressure / 101.325, 1 / 5.255));
};

// Utility function to check if geolocation is available
export const isGeolocationAvailable = (): boolean => {
  return 'geolocation' in navigator;
};