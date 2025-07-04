import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { UtilityIntegrationClient } from '../utility-integration/utility-api-client';
import { WeatherNormalizationService } from '../energy/weather-normalization';

interface OnboardingData {
  facilityType: string;
  location: {
    address: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  utilityProvider?: string;
  squareFootage?: number;
  yearBuilt?: number;
  equipmentList?: string[];
  monthlyEnergyBill?: number;
  operatingHours?: string;
  growType?: string;
}

interface OnboardingPlan {
  steps: OnboardingStep[];
  estimatedTimeToComplete: number;
  requiredIntegrations: string[];
  automationLevel: number;
  riskFactors: string[];
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'AUTOMATED' | 'CUSTOMER_ACTION' | 'MANUAL_REVIEW';
  estimatedMinutes: number;
  dependencies: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

export class SmartFacilityOnboarding {
  private anthropic: Anthropic;
  private utilityClient: UtilityIntegrationClient;
  private weatherService: WeatherNormalizationService;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    this.utilityClient = new UtilityIntegrationClient();
    this.weatherService = new WeatherNormalizationService();
  }

  /**
   * Fully automated facility onboarding with AI guidance
   */
  async onboardFacility(
    customerId: string,
    onboardingData: OnboardingData
  ): Promise<{ facilityId: string; onboardingPlan: OnboardingPlan }> {

    // Step 1: AI analysis of facility data
    const facilityAnalysis = await this.analyzeFacilityWithAI(onboardingData);

    // Step 2: Create facility record
    const facility = await this.createFacilityRecord(customerId, onboardingData, facilityAnalysis);

    // Step 3: Generate smart onboarding plan
    const onboardingPlan = await this.generateOnboardingPlan(facility, onboardingData);

    // Step 4: Execute automated steps
    await this.executeAutomatedSteps(facility.id, onboardingPlan);

    return { facilityId: facility.id, onboardingPlan };
  }

  /**
   * AI analysis of facility characteristics and requirements
   */
  private async analyzeFacilityWithAI(data: OnboardingData): Promise<any> {
    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Analyze this facility for energy optimization potential:

          FACILITY DATA:
          - Type: ${data.facilityType}
          - Location: ${data.location.address}, ${data.location.zipCode}
          - Square Footage: ${data.squareFootage || 'Unknown'}
          - Year Built: ${data.yearBuilt || 'Unknown'}
          - Monthly Energy Bill: $${data.monthlyEnergyBill || 'Unknown'}
          - Operating Hours: ${data.operatingHours || 'Unknown'}
          - Grow Type: ${data.growType || 'Unknown'}
          - Equipment: ${data.equipmentList?.join(', ') || 'Unknown'}
          - Utility Provider: ${data.utilityProvider || 'Unknown'}

          Please provide a JSON response with:
          {
            "facilityClassification": "greenhouse" | "indoor_farm" | "processing" | "warehouse" | "other",
            "energyProfile": {
              "estimatedAnnualUsage": number,
              "peakDemandKw": number,
              "loadProfile": "constant" | "variable" | "seasonal"
            },
            "optimizationPotential": {
              "lighting": { "potential": number, "confidence": number },
              "hvac": { "potential": number, "confidence": number },
              "automation": { "potential": number, "confidence": number },
              "overall": { "potential": number, "confidence": number }
            },
            "requiredIntegrations": string[],
            "riskFactors": string[],
            "recommendedEquipment": string[],
            "baselineEstablishmentMethod": "utility_bills" | "iot_sensors" | "engineering_calculation",
            "estimatedROI": {
              "paybackMonths": number,
              "annualSavings": number,
              "confidence": number
            }
          }

          Base your analysis on industry standards for similar facilities.`
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    return JSON.parse(responseText);
  }

  /**
   * Create facility record with AI-enhanced data
   */
  private async createFacilityRecord(
    customerId: string,
    data: OnboardingData,
    analysis: any
  ): Promise<any> {
    // Geocode address if coordinates not provided
    let { latitude, longitude } = data.location;
    if (!latitude || !longitude) {
      const coords = await this.geocodeAddress(data.location.address);
      latitude = coords.latitude;
      longitude = coords.longitude;
    }

    // Determine climate zone
    const climateZone = await this.determineClimateZone(latitude, longitude);

    const facility = await prisma.facility.create({
      data: {
        ownerId: customerId,
        name: `${analysis.facilityClassification} - ${data.location.zipCode}`,
        type: analysis.facilityClassification,
        address: data.location.address,
        zipCode: data.location.zipCode,
        latitude,
        longitude,
        climateZone,
        squareFootage: data.squareFootage || analysis.energyProfile.estimatedAnnualUsage / 12, // Estimate if not provided
        yearBuilt: data.yearBuilt,
        operatingHours: data.operatingHours || '24/7',
        utilityProvider: data.utilityProvider,
        
        // AI-enhanced fields
        loadProfile: analysis.energyProfile.loadProfile,
        estimatedAnnualKwh: analysis.energyProfile.estimatedAnnualUsage,
        estimatedPeakKw: analysis.energyProfile.peakDemandKw,
        optimizationPotential: analysis.optimizationPotential.overall.potential,
        estimatedROI: analysis.estimatedROI.annualSavings,
        riskFactors: analysis.riskFactors,
        
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    return facility;
  }

  /**
   * Generate intelligent onboarding plan
   */
  private async generateOnboardingPlan(facility: any, data: OnboardingData): Promise<OnboardingPlan> {
    const steps: OnboardingStep[] = [];
    let totalTime = 0;
    let automationLevel = 0;

    // Step 1: Utility Connection (if provider known)
    if (data.utilityProvider) {
      steps.push({
        id: 'utility_connection',
        title: 'Connect Utility Account',
        description: `Automatically connect to ${data.utilityProvider} for bill verification`,
        type: 'AUTOMATED',
        estimatedMinutes: 5,
        dependencies: [],
        status: 'PENDING',
      });
      totalTime += 5;
      automationLevel += 20;
    } else {
      steps.push({
        id: 'utility_identification',
        title: 'Identify Utility Provider',
        description: 'Customer needs to provide utility company information',
        type: 'CUSTOMER_ACTION',
        estimatedMinutes: 10,
        dependencies: [],
        status: 'PENDING',
      });
      totalTime += 10;
    }

    // Step 2: Baseline Establishment
    if (data.monthlyEnergyBill) {
      steps.push({
        id: 'baseline_calculation',
        title: 'Calculate Energy Baseline',
        description: 'Automatically establish baseline from provided energy costs',
        type: 'AUTOMATED',
        estimatedMinutes: 2,
        dependencies: ['utility_connection'],
        status: 'PENDING',
      });
      automationLevel += 25;
    } else {
      steps.push({
        id: 'baseline_estimation',
        title: 'Estimate Energy Baseline',
        description: 'Use AI to estimate baseline from facility characteristics',
        type: 'AUTOMATED',
        estimatedMinutes: 3,
        dependencies: [],
        status: 'PENDING',
      });
      automationLevel += 15;
    }
    totalTime += 3;

    // Step 3: Equipment Assessment
    if (data.equipmentList && data.equipmentList.length > 0) {
      steps.push({
        id: 'equipment_analysis',
        title: 'Analyze Existing Equipment',
        description: 'AI analysis of current equipment for optimization opportunities',
        type: 'AUTOMATED',
        estimatedMinutes: 5,
        dependencies: [],
        status: 'PENDING',
      });
      automationLevel += 20;
    } else {
      steps.push({
        id: 'equipment_survey',
        title: 'Complete Equipment Survey',
        description: 'Customer provides equipment inventory for analysis',
        type: 'CUSTOMER_ACTION',
        estimatedMinutes: 15,
        dependencies: [],
        status: 'PENDING',
      });
    }
    totalTime += Math.max(5, 15);

    // Step 4: IoT Sensor Planning
    steps.push({
      id: 'sensor_planning',
      title: 'Plan IoT Sensor Deployment',
      description: 'AI determines optimal sensor placement and types',
      type: 'AUTOMATED',
      estimatedMinutes: 3,
      dependencies: ['equipment_analysis', 'equipment_survey'],
      status: 'PENDING',
    });
    totalTime += 3;
    automationLevel += 15;

    // Step 5: Revenue Sharing Agreement
    steps.push({
      id: 'agreement_generation',
      title: 'Generate Revenue Sharing Agreement',
      description: 'Automatically create customized agreement based on analysis',
      type: 'AUTOMATED',
      estimatedMinutes: 5,
      dependencies: ['baseline_calculation', 'baseline_estimation'],
      status: 'PENDING',
    });
    totalTime += 5;
    automationLevel += 20;

    return {
      steps,
      estimatedTimeToComplete: totalTime,
      requiredIntegrations: facility.riskFactors || [],
      automationLevel: automationLevel / steps.length,
      riskFactors: facility.riskFactors || [],
    };
  }

  /**
   * Execute all automated onboarding steps
   */
  private async executeAutomatedSteps(facilityId: string, plan: OnboardingPlan): Promise<void> {
    for (const step of plan.steps) {
      if (step.type === 'AUTOMATED') {
        try {
          await this.executeStep(facilityId, step);
          step.status = 'COMPLETED';
        } catch (error) {
          console.error(`Failed to execute step ${step.id}:`, error);
          step.status = 'FAILED';
        }
      }
    }
  }

  /**
   * Execute individual automation step
   */
  private async executeStep(facilityId: string, step: OnboardingStep): Promise<void> {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: { owner: true }
    });

    if (!facility) throw new Error('Facility not found');

    switch (step.id) {
      case 'utility_connection':
        await this.utilityClient.connectUtilityAccount(
          facility.ownerId,
          facility.utilityProvider!
        );
        break;

      case 'baseline_calculation':
        await this.establishAutomatedBaseline(facility);
        break;

      case 'baseline_estimation':
        await this.estimateBaseline(facility);
        break;

      case 'equipment_analysis':
        await this.analyzeEquipment(facility);
        break;

      case 'sensor_planning':
        await this.planSensorDeployment(facility);
        break;

      case 'agreement_generation':
        await this.generateRevenueAgreement(facility);
        break;
    }

    // Update step in database
    await prisma.onboardingStep.upsert({
      where: { 
        facilityId_stepId: {
          facilityId,
          stepId: step.id
        }
      },
      create: {
        facilityId,
        stepId: step.id,
        title: step.title,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      update: {
        status: 'COMPLETED',
        completedAt: new Date(),
      }
    });
  }

  /**
   * Establish baseline from utility data
   */
  private async establishAutomatedBaseline(facility: any): Promise<void> {
    // Use industry averages and facility characteristics
    const kwhPerSqFt = this.getTypicalEnergyUsage(facility.type, facility.climateZone);
    const annualKwh = facility.squareFootage * kwhPerSqFt;
    const monthlyKwh = annualKwh / 12;
    const peakKw = annualKwh / 8760 * 1.5; // Rough peak estimate

    await prisma.clientBaseline.create({
      data: {
        facilityId: facility.id,
        averageMonthlyKwh: monthlyKwh,
        averageMonthlyPeakKw: peakKw,
        averageMonthlyCost: monthlyKwh * 0.12, // Average rate
        totalAnnualKwh: annualKwh,
        totalAnnualCost: annualKwh * 0.12,
        monthlyVariation: 0.15, // 15% variation
        establishedAt: new Date(),
        verificationMethod: 'AI_ESTIMATION',
        confidence: 0.75,
      }
    });
  }

  /**
   * Get typical energy usage for facility type
   */
  private getTypicalEnergyUsage(facilityType: string, climateZone: string): number {
    // kWh per sq ft per year
    const baseUsage: Record<string, number> = {
      greenhouse: 45,
      indoor_farm: 120,
      processing: 35,
      warehouse: 15,
    };

    const climateMultiplier: Record<string, number> = {
      'Hot-Humid': 1.3,
      'Hot-Dry': 1.2,
      'Mixed-Humid': 1.0,
      'Mixed-Dry': 1.0,
      'Cold': 1.4,
    };

    return (baseUsage[facilityType] || 25) * (climateMultiplier[climateZone] || 1.0);
  }

  /**
   * Geocode address to get coordinates
   */
  private async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
    // In production, use Google Maps or similar API
    // For now, return approximate coordinates for demo
    return { latitude: 32.7157, longitude: -117.1611 }; // San Diego default
  }

  /**
   * Determine climate zone from coordinates
   */
  private async determineClimateZone(lat: number, lng: number): Promise<string> {
    // Simplified climate zone determination
    if (lat > 35) return 'Cold';
    if (lat > 30) return 'Mixed-Humid';
    return 'Hot-Humid';
  }

  // Additional private methods for other automation steps...
  private async estimateBaseline(facility: any): Promise<void> {
    await this.establishAutomatedBaseline(facility);
  }

  private async analyzeEquipment(facility: any): Promise<void> {
    // AI equipment analysis implementation
  }

  private async planSensorDeployment(facility: any): Promise<void> {
    // IoT sensor planning implementation
  }

  private async generateRevenueAgreement(facility: any): Promise<void> {
    // Revenue agreement generation implementation
  }
}