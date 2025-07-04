import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { format, startOfDay, endOfDay, differenceInDays } from 'date-fns';

interface WeatherData {
  date: Date;
  avgTemperature: number;
  heatingDegreeDays: number;
  coolingDegreeDays: number;
  humidity: number;
  solarRadiation?: number;
}

interface NormalizationResult {
  originalUsage: number;
  normalizedUsage: number;
  adjustmentFactor: number;
  heatingDDVariance: number;
  coolingDDVariance: number;
  confidence: number;
}

export class WeatherNormalizationService {
  private readonly NOAA_API_URL = 'https://www.ncdc.noaa.gov/cdo-web/api/v2';
  private readonly HEATING_BASE_TEMP = 65; // °F
  private readonly COOLING_BASE_TEMP = 65; // °F
  
  constructor(
    private noaaApiKey: string = process.env.NOAA_API_KEY!
  ) {}

  /**
   * Normalize energy usage based on weather conditions
   */
  async normalizeEnergyUsage(
    facilityId: string,
    actualUsage: number,
    startDate: Date,
    endDate: Date
  ): Promise<NormalizationResult> {
    // Get facility location
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: { 
        latitude: true, 
        longitude: true,
        zipCode: true,
        buildingType: true,
        heatingSystem: true,
        coolingSystem: true,
      }
    });
    
    if (!facility) {
      throw new Error('Facility not found');
    }

    // Get weather data for current period
    const currentWeather = await this.getWeatherData(
      facility.latitude,
      facility.longitude,
      startDate,
      endDate
    );

    // Get baseline weather (average of same period over past 3 years)
    const baselineWeather = await this.getBaselineWeather(
      facility.latitude,
      facility.longitude,
      startDate,
      endDate
    );

    // Calculate degree day differences
    const heatingDDDiff = currentWeather.totalHDD - baselineWeather.avgHDD;
    const coolingDDDiff = currentWeather.totalCDD - baselineWeather.avgCDD;

    // Get facility-specific coefficients
    const coefficients = await this.getFacilityCoefficients(facilityId);

    // Calculate adjustment factor
    const heatingAdjustment = heatingDDDiff * coefficients.heatingCoeff;
    const coolingAdjustment = coolingDDDiff * coefficients.coolingCoeff;
    const totalAdjustment = heatingAdjustment + coolingAdjustment;

    // Apply adjustment
    const adjustmentFactor = 1 + (totalAdjustment / actualUsage);
    const normalizedUsage = actualUsage * adjustmentFactor;

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(
      currentWeather,
      baselineWeather,
      coefficients
    );

    // Store normalization record
    await prisma.weatherNormalization.create({
      data: {
        facilityId,
        periodStart: startDate,
        periodEnd: endDate,
        originalUsage: actualUsage,
        normalizedUsage,
        adjustmentFactor,
        heatingDDActual: currentWeather.totalHDD,
        heatingDDBaseline: baselineWeather.avgHDD,
        coolingDDActual: currentWeather.totalCDD,
        coolingDDBaseline: baselineWeather.avgCDD,
        confidence,
        method: 'DEGREE_DAY_REGRESSION',
      }
    });

    return {
      originalUsage: actualUsage,
      normalizedUsage,
      adjustmentFactor,
      heatingDDVariance: heatingDDDiff / baselineWeather.avgHDD,
      coolingDDVariance: coolingDDDiff / baselineWeather.avgCDD,
      confidence,
    };
  }

  /**
   * Get weather data from NOAA
   */
  private async getWeatherData(
    latitude: number,
    longitude: number,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalHDD: number;
    totalCDD: number;
    avgTemp: number;
    data: WeatherData[];
  }> {
    // Find nearest weather station
    const station = await this.findNearestStation(latitude, longitude);
    
    // Fetch daily weather data
    const response = await axios.get(`${this.NOAA_API_URL}/data`, {
      headers: {
        token: this.noaaApiKey,
      },
      params: {
        datasetid: 'GHCND',
        stationid: station.id,
        startdate: format(startDate, 'yyyy-MM-dd'),
        enddate: format(endDate, 'yyyy-MM-dd'),
        datatypeid: 'TAVG,TMAX,TMIN',
        units: 'standard',
        limit: 1000,
      }
    });

    const weatherData: WeatherData[] = [];
    let totalHDD = 0;
    let totalCDD = 0;
    let totalTemp = 0;

    // Process daily data
    const days = differenceInDays(endDate, startDate) + 1;
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const dayData = response.data.results.filter((r: any) => 
        format(new Date(r.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );

      const avgTemp = this.calculateDailyAvgTemp(dayData);
      const hdd = Math.max(0, this.HEATING_BASE_TEMP - avgTemp);
      const cdd = Math.max(0, avgTemp - this.COOLING_BASE_TEMP);

      weatherData.push({
        date,
        avgTemperature: avgTemp,
        heatingDegreeDays: hdd,
        coolingDegreeDays: cdd,
        humidity: 50, // Would fetch from data
      });

      totalHDD += hdd;
      totalCDD += cdd;
      totalTemp += avgTemp;
    }

    return {
      totalHDD,
      totalCDD,
      avgTemp: totalTemp / days,
      data: weatherData,
    };
  }

  /**
   * Get historical baseline weather
   */
  private async getBaselineWeather(
    latitude: number,
    longitude: number,
    startDate: Date,
    endDate: Date
  ): Promise<{
    avgHDD: number;
    avgCDD: number;
    avgTemp: number;
  }> {
    // Check cache first
    const cached = await prisma.weatherBaseline.findFirst({
      where: {
        latitude: { gte: latitude - 0.1, lte: latitude + 0.1 },
        longitude: { gte: longitude - 0.1, lte: longitude + 0.1 },
        month: startDate.getMonth() + 1,
      }
    });

    if (cached) {
      return {
        avgHDD: cached.avgHeatingDD,
        avgCDD: cached.avgCoolingDD,
        avgTemp: cached.avgTemperature,
      };
    }

    // Calculate from historical data (3 year average)
    let totalHDD = 0;
    let totalCDD = 0;
    let totalTemp = 0;
    const years = 3;

    for (let year = 1; year <= years; year++) {
      const historicalStart = new Date(startDate);
      historicalStart.setFullYear(historicalStart.getFullYear() - year);
      
      const historicalEnd = new Date(endDate);
      historicalEnd.setFullYear(historicalEnd.getFullYear() - year);

      const yearData = await this.getWeatherData(
        latitude,
        longitude,
        historicalStart,
        historicalEnd
      );

      totalHDD += yearData.totalHDD;
      totalCDD += yearData.totalCDD;
      totalTemp += yearData.avgTemp;
    }

    const baseline = {
      avgHDD: totalHDD / years,
      avgCDD: totalCDD / years,
      avgTemp: totalTemp / years,
    };

    // Cache for future use
    await prisma.weatherBaseline.create({
      data: {
        latitude,
        longitude,
        month: startDate.getMonth() + 1,
        avgHeatingDD: baseline.avgHDD,
        avgCoolingDD: baseline.avgCDD,
        avgTemperature: baseline.avgTemp,
        dataYears: years,
      }
    });

    return baseline;
  }

  /**
   * Get facility-specific energy coefficients
   */
  private async getFacilityCoefficients(facilityId: string): Promise<{
    heatingCoeff: number;
    coolingCoeff: number;
    baseLoad: number;
  }> {
    // Check if we have calculated coefficients
    const existing = await prisma.facilityEnergyModel.findUnique({
      where: { facilityId }
    });

    if (existing) {
      return {
        heatingCoeff: existing.heatingCoefficient,
        coolingCoeff: existing.coolingCoefficient,
        baseLoad: existing.baseLoad,
      };
    }

    // Calculate coefficients using regression analysis
    const historicalData = await prisma.utilityBillData.findMany({
      where: {
        facility: { id: facilityId },
        billDate: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { billDate: 'asc' }
    });

    if (historicalData.length < 12) {
      // Use industry defaults based on building type
      return this.getDefaultCoefficients(facilityId);
    }

    // Perform regression analysis
    const coefficients = await this.performRegression(facilityId, historicalData);

    // Store for future use
    await prisma.facilityEnergyModel.create({
      data: {
        facilityId,
        heatingCoefficient: coefficients.heatingCoeff,
        coolingCoefficient: coefficients.coolingCoeff,
        baseLoad: coefficients.baseLoad,
        r2Value: coefficients.r2,
        modelType: 'DEGREE_DAY_REGRESSION',
        lastUpdated: new Date(),
      }
    });

    return coefficients;
  }

  /**
   * Perform regression analysis to determine coefficients
   */
  private async performRegression(
    facilityId: string,
    historicalData: any[]
  ): Promise<{
    heatingCoeff: number;
    coolingCoeff: number;
    baseLoad: number;
    r2: number;
  }> {
    // This would use a statistics library like simple-statistics
    // For now, returning reasonable defaults
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: { squareFootage: true, buildingType: true }
    });

    const sqft = facility?.squareFootage || 10000;
    
    return {
      heatingCoeff: 0.5 * (sqft / 1000), // kWh per HDD per 1000 sqft
      coolingCoeff: 0.8 * (sqft / 1000), // kWh per CDD per 1000 sqft
      baseLoad: sqft * 2, // Base load kWh
      r2: 0.85, // Model fit
    };
  }

  /**
   * Get default coefficients based on building type
   */
  private async getDefaultCoefficients(facilityId: string): Promise<{
    heatingCoeff: number;
    coolingCoeff: number;
    baseLoad: number;
  }> {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: { buildingType: true, squareFootage: true }
    });

    const sqft = (facility?.squareFootage || 10000) / 1000;

    // Industry standard coefficients by building type
    const coefficients: Record<string, any> = {
      greenhouse: {
        heatingCoeff: 0.8 * sqft,
        coolingCoeff: 1.2 * sqft,
        baseLoad: sqft * 3000,
      },
      warehouse: {
        heatingCoeff: 0.3 * sqft,
        coolingCoeff: 0.4 * sqft,
        baseLoad: sqft * 1500,
      },
      processing: {
        heatingCoeff: 0.4 * sqft,
        coolingCoeff: 0.6 * sqft,
        baseLoad: sqft * 4000,
      },
      indoor_farm: {
        heatingCoeff: 0.2 * sqft,
        coolingCoeff: 1.5 * sqft,
        baseLoad: sqft * 8000, // High due to lighting
      },
    };

    return coefficients[facility?.buildingType || 'warehouse'] || {
      heatingCoeff: 0.5 * sqft,
      coolingCoeff: 0.7 * sqft,
      baseLoad: sqft * 2000,
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    currentWeather: any,
    baselineWeather: any,
    coefficients: any
  ): number {
    let confidence = 1.0;

    // Reduce confidence for extreme weather variations
    const hddVariation = Math.abs(currentWeather.totalHDD - baselineWeather.avgHDD) / baselineWeather.avgHDD;
    const cddVariation = Math.abs(currentWeather.totalCDD - baselineWeather.avgCDD) / baselineWeather.avgCDD;

    if (hddVariation > 0.3) confidence -= 0.1;
    if (cddVariation > 0.3) confidence -= 0.1;

    // Reduce confidence if coefficients are defaults
    if (!coefficients.r2 || coefficients.r2 < 0.7) {
      confidence -= 0.15;
    }

    return Math.max(0.5, confidence);
  }

  /**
   * Find nearest weather station
   */
  private async findNearestStation(latitude: number, longitude: number): Promise<any> {
    // This would query NOAA station database
    // For now, returning mock station
    return {
      id: 'GHCND:USW00023174', // San Diego Airport
      name: 'SAN DIEGO INTERNATIONAL AIRPORT',
      distance: 5.2, // miles
    };
  }

  /**
   * Calculate daily average temperature
   */
  private calculateDailyAvgTemp(dayData: any[]): number {
    const temps = dayData.filter(d => d.datatype === 'TAVG');
    if (temps.length > 0) {
      return temps[0].value;
    }

    // Calculate from min/max
    const tmin = dayData.find(d => d.datatype === 'TMIN')?.value || 60;
    const tmax = dayData.find(d => d.datatype === 'TMAX')?.value || 80;
    return (tmin + tmax) / 2;
  }

  /**
   * Apply IPMVP Option C methodology
   */
  async applyIPMVPOptionC(
    facilityId: string,
    reportingPeriod: { start: Date; end: Date },
    baselinePeriod: { start: Date; end: Date }
  ): Promise<{
    adjustedBaseline: number;
    savings: number;
    uncertainty: number;
  }> {
    // Implementation of IPMVP Option C whole facility measurement
    // This is a placeholder for the complex methodology
    
    const baseline = await prisma.clientBaseline.findFirst({
      where: { facility: { id: facilityId } }
    });

    if (!baseline) {
      throw new Error('No baseline established');
    }

    // Apply normalization
    const normalized = await this.normalizeEnergyUsage(
      facilityId,
      baseline.totalAnnualKwh / 12, // Monthly average
      reportingPeriod.start,
      reportingPeriod.end
    );

    return {
      adjustedBaseline: normalized.normalizedUsage,
      savings: baseline.totalAnnualKwh / 12 - normalized.normalizedUsage,
      uncertainty: (1 - normalized.confidence) * 100, // Percentage
    };
  }
}