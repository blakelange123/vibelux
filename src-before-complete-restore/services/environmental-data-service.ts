import axios, { AxiosInstance } from 'axios';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import NodeCache from 'node-cache';

// Types for EPA AirNow API
interface AirQualityData {
  dateObserved: string;
  hourObserved: number;
  localTimeZone: string;
  reportingArea: string;
  stateCode: string;
  latitude: number;
  longitude: number;
  parameterName: string;
  aqi: number;
  category: {
    number: number;
    name: string;
  };
}

// Types for NASA POWER API
interface SolarRadiationData {
  parameters: {
    ALLSKY_SFC_SW_DWN: {
      [date: string]: number; // Daily solar radiation (kW-hr/m^2/day)
    };
    ALLSKY_SFC_PAR_TOT: {
      [date: string]: number; // Photosynthetically Active Radiation (W/m^2)
    };
    CLRSKY_SFC_SW_DWN: {
      [date: string]: number; // Clear sky solar radiation
    };
  };
}

// Types for NOAA Weather API
interface WeatherForecast {
  properties: {
    periods: Array<{
      number: number;
      name: string;
      startTime: string;
      endTime: string;
      temperature: number;
      temperatureUnit: string;
      windSpeed: string;
      windDirection: string;
      shortForecast: string;
      detailedForecast: string;
    }>;
  };
}

interface WeatherObservation {
  properties: {
    timestamp: string;
    temperature: {
      value: number;
      unitCode: string;
    };
    dewpoint: {
      value: number;
      unitCode: string;
    };
    relativeHumidity: {
      value: number;
      unitCode: string;
    };
    windSpeed: {
      value: number;
      unitCode: string;
    };
    barometricPressure: {
      value: number;
      unitCode: string;
    };
  };
}

// Environmental adjustment calculation types
interface EnvironmentalConditions {
  airQuality: AirQualityData[];
  solarRadiation: SolarRadiationData;
  weather: WeatherObservation;
  forecast: WeatherForecast;
}

interface EnvironmentalAdjustment {
  ventilationAdjustment: number; // Percentage adjustment for ventilation
  lightingCompensation: number; // Percentage of supplemental lighting needed
  temperatureOffset: number; // Temperature adjustment in Celsius
  humidityTarget: number; // Target humidity percentage
  co2Supplementation: number; // CO2 supplementation rate adjustment
}

// Configuration interface
interface ServiceConfig {
  epaApiKey: string;
  nasaPowerApiKey?: string; // NASA POWER is typically open access
  noaaApiKey?: string; // NOAA is typically open access
  influxDbUrl: string;
  influxDbToken: string;
  influxDbOrg: string;
  influxDbBucket: string;
  cacheEnabled?: boolean;
  cacheTTL?: number; // Cache time-to-live in seconds
}

export class EnvironmentalDataService {
  private axiosInstance: AxiosInstance;
  private influxDB: InfluxDB;
  private writeApi: WriteApi;
  private cache: NodeCache;
  private config: ServiceConfig;

  constructor(config: ServiceConfig) {
    this.config = config;
    
    // Initialize axios instance
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Initialize InfluxDB
    this.influxDB = new InfluxDB({
      url: config.influxDbUrl,
      token: config.influxDbToken
    });
    
    this.writeApi = this.influxDB.getWriteApi(
      config.influxDbOrg,
      config.influxDbBucket,
      'ms'
    );

    // Initialize cache with default TTL of 15 minutes
    this.cache = new NodeCache({ 
      stdTTL: config.cacheTTL || 900,
      checkperiod: 120 
    });
  }

  /**
   * Fetch air quality data from EPA AirNow API
   */
  async fetchAirQuality(latitude: number, longitude: number, distance: number = 25): Promise<AirQualityData[]> {
    const cacheKey = `airquality_${latitude}_${longitude}_${distance}`;
    
    if (this.config.cacheEnabled) {
      const cached = this.cache.get<AirQualityData[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.axiosInstance.get(
        'https://www.airnowapi.org/aq/observation/latLong/current/',
        {
          params: {
            format: 'application/json',
            latitude,
            longitude,
            distance,
            API_KEY: this.config.epaApiKey
          }
        }
      );

      const data = response.data as AirQualityData[];
      
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, data);
      }

      // Store in InfluxDB
      await this.storeAirQualityData(data);

      return data;
    } catch (error) {
      console.error('Error fetching air quality data:', error);
      throw new Error(`Failed to fetch air quality data: ${error.message}`);
    }
  }

  /**
   * Fetch solar radiation data from NASA POWER API
   */
  async fetchSolarRadiation(
    latitude: number, 
    longitude: number, 
    startDate: string, 
    endDate: string
  ): Promise<SolarRadiationData> {
    const cacheKey = `solar_${latitude}_${longitude}_${startDate}_${endDate}`;
    
    if (this.config.cacheEnabled) {
      const cached = this.cache.get<SolarRadiationData>(cacheKey);
      if (cached) return cached;
    }

    try {
      const parameters = [
        'ALLSKY_SFC_SW_DWN',
        'ALLSKY_SFC_PAR_TOT',
        'CLRSKY_SFC_SW_DWN'
      ].join(',');

      const response = await this.axiosInstance.get(
        'https://power.larc.nasa.gov/api/temporal/daily/point',
        {
          params: {
            parameters,
            community: 'AG',
            longitude,
            latitude,
            start: startDate.replace(/-/g, ''),
            end: endDate.replace(/-/g, ''),
            format: 'JSON'
          }
        }
      );

      const data = response.data as SolarRadiationData;
      
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, data);
      }

      // Store in InfluxDB
      await this.storeSolarRadiationData(data, latitude, longitude);

      return data;
    } catch (error) {
      console.error('Error fetching solar radiation data:', error);
      throw new Error(`Failed to fetch solar radiation data: ${error.message}`);
    }
  }

  /**
   * Fetch weather forecast from NOAA API
   */
  async fetchWeatherForecast(latitude: number, longitude: number): Promise<WeatherForecast> {
    const cacheKey = `forecast_${latitude}_${longitude}`;
    
    if (this.config.cacheEnabled) {
      const cached = this.cache.get<WeatherForecast>(cacheKey);
      if (cached) return cached;
    }

    try {
      // First, get the grid point for the coordinates
      const pointResponse = await this.axiosInstance.get(
        `https://api.weather.gov/points/${latitude},${longitude}`
      );
      
      const forecastUrl = pointResponse.data.properties.forecast;
      
      // Fetch the forecast
      const forecastResponse = await this.axiosInstance.get(forecastUrl);
      const data = forecastResponse.data as WeatherForecast;
      
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, data, 3600); // Cache for 1 hour
      }

      // Store in InfluxDB
      await this.storeWeatherForecastData(data, latitude, longitude);

      return data;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error(`Failed to fetch weather forecast: ${error.message}`);
    }
  }

  /**
   * Fetch current weather observations from NOAA API
   */
  async fetchCurrentWeather(stationId: string): Promise<WeatherObservation> {
    const cacheKey = `weather_${stationId}`;
    
    if (this.config.cacheEnabled) {
      const cached = this.cache.get<WeatherObservation>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.axiosInstance.get(
        `https://api.weather.gov/stations/${stationId}/observations/latest`
      );

      const data = response.data as WeatherObservation;
      
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, data, 600); // Cache for 10 minutes
      }

      // Store in InfluxDB
      await this.storeWeatherObservationData(data, stationId);

      return data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error(`Failed to fetch current weather: ${error.message}`);
    }
  }

  /**
   * Calculate environmental adjustments based on external conditions
   */
  calculateEnvironmentalAdjustments(conditions: EnvironmentalConditions): EnvironmentalAdjustment {
    const adjustment: EnvironmentalAdjustment = {
      ventilationAdjustment: 0,
      lightingCompensation: 0,
      temperatureOffset: 0,
      humidityTarget: 65, // Default target
      co2Supplementation: 0
    };

    // Air quality adjustments
    const aqiData = conditions.airQuality.find(aq => aq.parameterName === 'PM2.5');
    if (aqiData) {
      // Reduce ventilation if AQI is poor
      if (aqiData.aqi > 100) {
        adjustment.ventilationAdjustment = -30; // Reduce by 30%
      } else if (aqiData.aqi > 50) {
        adjustment.ventilationAdjustment = -15; // Reduce by 15%
      } else {
        adjustment.ventilationAdjustment = 10; // Increase by 10% for good air
      }
    }

    // Solar radiation adjustments
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const todayRadiation = conditions.solarRadiation.parameters.ALLSKY_SFC_PAR_TOT[today];
    const clearSkyRadiation = conditions.solarRadiation.parameters.CLRSKY_SFC_SW_DWN[today];
    
    if (todayRadiation && clearSkyRadiation) {
      const cloudCover = 1 - (todayRadiation / clearSkyRadiation);
      // Calculate supplemental lighting needs based on cloud cover
      adjustment.lightingCompensation = Math.min(cloudCover * 100, 80); // Max 80% supplementation
    }

    // Weather-based adjustments
    const currentTemp = conditions.weather.properties.temperature.value;
    const currentHumidity = conditions.weather.properties.relativeHumidity.value;
    
    // Temperature adjustments
    if (currentTemp < 10) {
      adjustment.temperatureOffset = 2; // Warm up by 2°C
    } else if (currentTemp > 30) {
      adjustment.temperatureOffset = -2; // Cool down by 2°C
    }

    // Humidity adjustments
    if (currentHumidity < 40) {
      adjustment.humidityTarget = 70; // Increase target humidity
    } else if (currentHumidity > 80) {
      adjustment.humidityTarget = 60; // Decrease target humidity
    }

    // CO2 supplementation based on ventilation reduction
    if (adjustment.ventilationAdjustment < 0) {
      adjustment.co2Supplementation = Math.abs(adjustment.ventilationAdjustment) * 0.5;
    }

    return adjustment;
  }

  /**
   * Store air quality data in InfluxDB
   */
  private async storeAirQualityData(data: AirQualityData[]): Promise<void> {
    try {
      const points = data.map(aq => {
        return new Point('air_quality')
          .tag('location', aq.reportingArea)
          .tag('state', aq.stateCode)
          .tag('parameter', aq.parameterName)
          .tag('category', aq.category.name)
          .floatField('aqi', aq.aqi)
          .floatField('latitude', aq.latitude)
          .floatField('longitude', aq.longitude)
          .timestamp(new Date(`${aq.dateObserved}T${aq.hourObserved}:00:00`));
      });

      await this.writeApi.writePoints(points);
      await this.writeApi.flush();
    } catch (error) {
      console.error('Error storing air quality data:', error);
    }
  }

  /**
   * Store solar radiation data in InfluxDB
   */
  private async storeSolarRadiationData(
    data: SolarRadiationData, 
    latitude: number, 
    longitude: number
  ): Promise<void> {
    try {
      const points: Point[] = [];
      
      Object.entries(data.parameters.ALLSKY_SFC_SW_DWN).forEach(([date, value]) => {
        const point = new Point('solar_radiation')
          .tag('type', 'all_sky_surface_shortwave_downward')
          .floatField('value', value)
          .floatField('latitude', latitude)
          .floatField('longitude', longitude)
          .timestamp(new Date(date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')));
        points.push(point);
      });

      Object.entries(data.parameters.ALLSKY_SFC_PAR_TOT).forEach(([date, value]) => {
        const point = new Point('solar_radiation')
          .tag('type', 'photosynthetically_active_radiation')
          .floatField('value', value)
          .floatField('latitude', latitude)
          .floatField('longitude', longitude)
          .timestamp(new Date(date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')));
        points.push(point);
      });

      await this.writeApi.writePoints(points);
      await this.writeApi.flush();
    } catch (error) {
      console.error('Error storing solar radiation data:', error);
    }
  }

  /**
   * Store weather forecast data in InfluxDB
   */
  private async storeWeatherForecastData(
    data: WeatherForecast, 
    latitude: number, 
    longitude: number
  ): Promise<void> {
    try {
      const points = data.properties.periods.map(period => {
        return new Point('weather_forecast')
          .tag('period_name', period.name)
          .floatField('temperature', period.temperature)
          .stringField('temperature_unit', period.temperatureUnit)
          .stringField('wind_speed', period.windSpeed)
          .stringField('wind_direction', period.windDirection)
          .stringField('short_forecast', period.shortForecast)
          .floatField('latitude', latitude)
          .floatField('longitude', longitude)
          .timestamp(new Date(period.startTime));
      });

      await this.writeApi.writePoints(points);
      await this.writeApi.flush();
    } catch (error) {
      console.error('Error storing weather forecast data:', error);
    }
  }

  /**
   * Store weather observation data in InfluxDB
   */
  private async storeWeatherObservationData(
    data: WeatherObservation, 
    stationId: string
  ): Promise<void> {
    try {
      const point = new Point('weather_observation')
        .tag('station_id', stationId)
        .floatField('temperature', data.properties.temperature.value)
        .floatField('dewpoint', data.properties.dewpoint.value)
        .floatField('relative_humidity', data.properties.relativeHumidity.value)
        .floatField('wind_speed', data.properties.windSpeed.value)
        .floatField('barometric_pressure', data.properties.barometricPressure.value)
        .timestamp(new Date(data.properties.timestamp));

      await this.writeApi.writePoint(point);
      await this.writeApi.flush();
    } catch (error) {
      console.error('Error storing weather observation data:', error);
    }
  }

  /**
   * Get historical environmental data from InfluxDB
   */
  async getHistoricalData(
    measurement: string,
    startTime: string,
    endTime: string,
    filters?: Record<string, string>
  ): Promise<any[]> {
    const queryApi = this.influxDB.getQueryApi(this.config.influxDbOrg);
    
    let query = `
      from(bucket: "${this.config.influxDbBucket}")
        |> range(start: ${startTime}, stop: ${endTime})
        |> filter(fn: (r) => r["_measurement"] == "${measurement}")
    `;

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query += `\n        |> filter(fn: (r) => r["${key}"] == "${value}")`;
      });
    }

    const results: any[] = [];
    
    return new Promise((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          results.push(o);
        },
        error(error) {
          console.error('Query error:', error);
          reject(error);
        },
        complete() {
          resolve(results);
        }
      });
    });
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    try {
      await this.writeApi.close();
      this.cache.close();
    } catch (error) {
      console.error('Error closing service:', error);
    }
  }
}

// Export types for external use
export type {
  AirQualityData,
  SolarRadiationData,
  WeatherForecast,
  WeatherObservation,
  EnvironmentalConditions,
  EnvironmentalAdjustment,
  ServiceConfig
};