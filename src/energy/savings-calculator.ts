import { prisma } from '@/lib/prisma';
import { WeatherNormalizationService } from './weather-normalization';
import { ThirdPartyValidationService } from '../verification/third-party-validator';
import { UtilityIntegrationClient } from '../utility-integration/utility-api-client';

interface SavingsCalculationOptions {
  facilityId: string;
  startDate: Date;
  endDate: Date;
  includeWeatherNormalization?: boolean;
  includeThirdPartyVerification?: boolean;
}

interface VerifiedSavings {
  energySavings: number;
  yieldImprovements: number;
  operationalSavings: number;
  totalSavings: number;
  confidence: number;
  verificationData: any;
  thirdPartyVerified: boolean;
}

export async function calculateVerifiedSavings(
  options: SavingsCalculationOptions
): Promise<VerifiedSavings> {
  const {
    facilityId,
    startDate,
    endDate,
    includeWeatherNormalization = true,
    includeThirdPartyVerification = false,
  } = options;

  // Get facility and baseline data
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: {
      baseline: true,
      iotReadings: {
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          }
        },
        orderBy: { timestamp: 'asc' }
      }
    }
  });

  if (!facility || !facility.baseline) {
    throw new Error('Facility or baseline not found');
  }

  // Initialize services
  const weatherService = new WeatherNormalizationService();
  const utilityClient = new UtilityIntegrationClient();
  const validationService = new ThirdPartyValidationService();

  // 1. Calculate Energy Savings
  let energySavings = 0;
  const verificationData: any = {};

  try {
    // Get utility-verified usage
    const utilityVerification = await utilityClient.verifySavingsWithUtilityBills(
      facility.ownerId,
      startDate,
      endDate
    );

    energySavings = utilityVerification.actualSavings;
    verificationData.utilityVerified = true;
    verificationData.utilityData = utilityVerification;

    // Apply weather normalization if requested
    if (includeWeatherNormalization) {
      const normalization = await weatherService.normalizeEnergyUsage(
        facilityId,
        utilityVerification.actualUsage,
        startDate,
        endDate
      );

      // Adjust savings based on weather
      const weatherAdjustment = normalization.adjustmentFactor - 1;
      energySavings = energySavings * (1 + weatherAdjustment);
      
      verificationData.weatherNormalized = true;
      verificationData.weatherData = {
        adjustmentFactor: normalization.adjustmentFactor,
        confidence: normalization.confidence,
      };
    }
  } catch (error) {
    console.error('Utility verification failed, using IoT data:', error);
    
    // Fallback to IoT-based calculation
    energySavings = await calculateIoTBasedEnergySavings(
      facility,
      startDate,
      endDate
    );
    
    verificationData.utilityVerified = false;
    verificationData.dataSource = 'iot_sensors';
  }

  // 2. Calculate Yield Improvements
  const yieldImprovements = await calculateYieldImprovements(
    facility,
    startDate,
    endDate
  );

  // 3. Calculate Operational Savings
  const operationalSavings = await calculateOperationalSavings(
    facility,
    startDate,
    endDate
  );

  // 4. Calculate Total Savings
  const totalSavings = energySavings + yieldImprovements + operationalSavings;

  // 5. Apply Third-Party Verification if requested
  let confidence = 0.85; // Base confidence
  let thirdPartyVerified = false;

  if (includeThirdPartyVerification && totalSavings > 1000) {
    try {
      const validation = await validationService.validateSavingsClaims(
        facilityId,
        totalSavings,
        startDate,
        endDate,
        'automated'
      );

      thirdPartyVerified = validation.verified;
      confidence = validation.confidence;
      
      verificationData.thirdPartyValidation = {
        verified: validation.verified,
        confidence: validation.confidence,
        discrepancies: validation.discrepancies,
      };
    } catch (error) {
      console.error('Third-party validation failed:', error);
    }
  }

  // Adjust confidence based on data sources
  if (!verificationData.utilityVerified) confidence *= 0.9;
  if (!verificationData.weatherNormalized) confidence *= 0.95;

  return {
    energySavings: Math.round(energySavings * 100) / 100,
    yieldImprovements: Math.round(yieldImprovements * 100) / 100,
    operationalSavings: Math.round(operationalSavings * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    confidence,
    verificationData,
    thirdPartyVerified,
  };
}

/**
 * Calculate energy savings from IoT sensor data
 */
async function calculateIoTBasedEnergySavings(
  facility: any,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const iotReadings = facility.iotReadings;
  
  if (iotReadings.length === 0) {
    throw new Error('No IoT data available for calculation');
  }

  // Calculate actual usage from IoT data
  const totalUsageKwh = iotReadings.reduce((sum: number, reading: any) => {
    return sum + (reading.energyUsage || 0);
  }, 0);

  // Calculate expected baseline usage for the period
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const expectedUsageKwh = (facility.baseline.averageMonthlyKwh / 30) * days;

  // Calculate savings
  const savingsKwh = expectedUsageKwh - totalUsageKwh;
  
  // Convert to dollars (using average rate)
  const avgRatePerKwh = 0.12; // Would get from utility data in production
  return savingsKwh * avgRatePerKwh;
}

/**
 * Calculate yield improvements from production data
 */
async function calculateYieldImprovements(
  facility: any,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Get production data
  const productionData = await prisma.productionRecord.findMany({
    where: {
      facilityId: facility.id,
      date: {
        gte: startDate,
        lte: endDate,
      }
    }
  });

  if (productionData.length === 0) return 0;

  // Calculate yield improvement
  const currentYield = productionData.reduce((sum, record) => sum + record.yield, 0);
  const baselineYield = productionData.reduce((sum, record) => sum + record.baselineYield, 0);
  
  const yieldIncrease = currentYield - baselineYield;
  
  // Get average market price
  const avgPrice = await getAverageMarketPrice(facility.cropType, startDate, endDate);
  
  return yieldIncrease * avgPrice;
}

/**
 * Calculate operational savings
 */
async function calculateOperationalSavings(
  facility: any,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // Get operational metrics
  const metrics = await prisma.operationalMetric.findMany({
    where: {
      facilityId: facility.id,
      date: {
        gte: startDate,
        lte: endDate,
      }
    }
  });

  let savings = 0;

  // Labor savings
  const laborSavings = metrics.reduce((sum, m) => sum + (m.laborSavings || 0), 0);
  savings += laborSavings;

  // Water savings
  const waterSavings = metrics.reduce((sum, m) => sum + (m.waterSavings || 0), 0);
  savings += waterSavings;

  // Nutrient savings
  const nutrientSavings = metrics.reduce((sum, m) => sum + (m.nutrientSavings || 0), 0);
  savings += nutrientSavings;

  // Pest/disease reduction savings
  const pestSavings = metrics.reduce((sum, m) => sum + (m.pestControlSavings || 0), 0);
  savings += pestSavings;

  return savings;
}

/**
 * Get average market price for crop
 */
async function getAverageMarketPrice(
  cropType: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // This would integrate with market data APIs
  // For now, returning typical prices
  const prices: Record<string, number> = {
    cannabis: 2500, // per pound
    lettuce: 2.50, // per pound
    tomatoes: 3.00, // per pound
    strawberries: 4.50, // per pound
    herbs: 15.00, // per pound
  };
  
  return prices[cropType] || 2.00;
}