/**
 * Faux data generator for GaaS/YEP investment platform
 * Generates realistic test data for investors, facilities, and investment deals
 */
import { 
  Investor, 
  Facility, 
  Investment, 
  PerformanceRecord, 
  YieldBaseline,
  Payment,
  PortfolioMetrics,
  InvestmentProposal,
  InvestmentType,
  DealStatus,
  PaymentFrequency,
  InvestorType,
  RiskTolerance
} from '@/types/investment';

export class InvestmentDataGenerator {
  // Realistic facility names
  private static FACILITY_NAMES = [
    "Green Valley Farms", "SunGrow Operations", "Urban Leaf Co",
    "Mountain Peak Greenhouses", "Coastal Cannabis Collective",
    "Desert Bloom Gardens", "Northern Lights Cultivation",
    "Pacific Grove Industries", "Harvest Moon Farms",
    "Golden State Growers", "Blue Sky Botanicals", "Emerald City Gardens"
  ];
  
  // Realistic investor names/companies
  private static INVESTOR_COMPANIES = [
    "AgTech Ventures", "Green Capital Partners", "Harvest Investment Group",
    "Sustainable Growth Fund", "Cannabis Infrastructure Partners",
    "Indoor Ag Capital", "Future Farms Investment", "Crop Yield Partners",
    "Agricultural Innovation Fund", "Green Energy Growers Fund"
  ];
  
  // Crop types
  private static CROP_TYPES = ["cannabis", "leafy_greens", "tomatoes", "herbs", "strawberries", "cucumbers"];
  
  // Lighting types
  private static LIGHTING_TYPES: Array<'HPS' | 'LED' | 'CMH' | 'Hybrid'> = ["HPS", "LED", "CMH", "Hybrid"];
  
  // Location data
  private static CITIES = ["Los Angeles", "Denver", "Portland", "Phoenix", "Seattle", "San Francisco", "Las Vegas", "Boston", "Detroit", "Chicago"];
  private static STATES = ["CA", "CO", "OR", "AZ", "WA", "NV", "MA", "MI", "IL"];
  
  public static generateInvestor(): Investor {
    const investorType = this.randomChoice([InvestorType.INDIVIDUAL, InvestorType.INSTITUTIONAL, InvestorType.FAMILY_OFFICE]);
    
    let name: string;
    let capitalAvailable: number;
    let minInvestment: number;
    let riskTolerance: RiskTolerance;
    
    if (investorType === InvestorType.INSTITUTIONAL) {
      name = this.randomChoice(this.INVESTOR_COMPANIES);
      capitalAvailable = this.randomInt(5000000, 50000000); // $5M - $50M
      minInvestment = this.randomInt(100000, 500000);
      riskTolerance = this.randomChoice([RiskTolerance.MODERATE, RiskTolerance.AGGRESSIVE]);
    } else if (investorType === InvestorType.FAMILY_OFFICE) {
      name = `${this.generateLastName()} Family Office`;
      capitalAvailable = this.randomInt(2000000, 20000000); // $2M - $20M
      minInvestment = this.randomInt(50000, 250000);
      riskTolerance = this.randomChoice([RiskTolerance.CONSERVATIVE, RiskTolerance.MODERATE]);
    } else { // individual
      name = this.generateFullName();
      capitalAvailable = this.randomInt(500000, 5000000); // $500K - $5M
      minInvestment = this.randomInt(25000, 100000);
      riskTolerance = this.randomChoice([RiskTolerance.CONSERVATIVE, RiskTolerance.MODERATE, RiskTolerance.AGGRESSIVE]);
    }
    
    return {
      id: this.generateId(),
      name,
      company: investorType !== InvestorType.INDIVIDUAL ? name : undefined,
      email: this.generateEmail(name),
      phone: this.generatePhone(),
      investorType,
      totalCapitalAvailable: capitalAvailable,
      totalCapitalDeployed: capitalAvailable * this.randomFloat(0.3, 0.7),
      preferredInvestmentSizeMin: minInvestment,
      preferredInvestmentSizeMax: minInvestment * this.randomInt(5, 20),
      targetIRR: this.randomFloat(0.15, 0.35), // 15-35% IRR
      riskTolerance,
      preferredFacilityTypes: this.randomSample(['greenhouse', 'indoor', 'vertical'], this.randomInt(1, 3)),
      preferredCropTypes: this.randomSample(this.CROP_TYPES, this.randomInt(1, 3)),
      active: true,
      verified: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.33, // 66% verified
      createdAt: this.generatePastDate(730), // Within last 2 years
      updatedAt: new Date()
    };
  }
  
  public static generateFacility(): Facility {
    const facilityType = this.randomChoice<'greenhouse' | 'indoor' | 'vertical'>(['greenhouse', 'indoor', 'vertical']);
    
    // Size based on facility type
    let totalSqft: number;
    if (facilityType === 'greenhouse') {
      totalSqft = this.randomInt(10000, 100000);
    } else if (facilityType === 'indoor') {
      totalSqft = this.randomInt(5000, 50000);
    } else { // vertical
      totalSqft = this.randomInt(2000, 20000);
    }
    
    const activeSqft = totalSqft * this.randomFloat(0.7, 0.95);
    
    // Yield varies by crop type
    const primaryCrop = this.randomChoice(this.CROP_TYPES);
    let baseYield: number;
    let pricePerUnit: number;
    let cyclesPerYear: number;
    
    if (primaryCrop === 'cannabis') {
      baseYield = this.randomFloat(40, 60); // g/sqft
      pricePerUnit = this.randomFloat(1.5, 3.5); // $/g
      cyclesPerYear = this.randomFloat(4, 6);
    } else if (primaryCrop === 'leafy_greens') {
      baseYield = this.randomFloat(3, 8); // lbs/sqft/year
      pricePerUnit = this.randomFloat(2, 4); // $/lb
      cyclesPerYear = this.randomFloat(12, 20);
    } else {
      baseYield = this.randomFloat(10, 30); // lbs/sqft/year
      pricePerUnit = this.randomFloat(1, 3); // $/lb
      cyclesPerYear = this.randomFloat(2, 4);
    }
    
    const city = this.randomChoice(this.CITIES);
    const state = this.randomChoice(this.STATES);
    
    return {
      id: this.generateId(),
      name: `${this.randomChoice(this.FACILITY_NAMES)} - ${city}`,
      ownerName: this.generateFullName(),
      ownerEmail: this.generateEmail(),
      location: `${city}, ${state}`,
      facilityType,
      totalCanopySqft: totalSqft,
      activeGrowSqft: activeSqft,
      numberOfRooms: facilityType !== 'greenhouse' ? this.randomInt(1, 12) : 1,
      climateZones: this.randomInt(1, 4),
      currentYieldPerSqft: baseYield,
      currentCyclesPerYear: cyclesPerYear,
      currentEnergyUsageKwh: activeSqft * this.randomFloat(40, 80), // kWh/sqft/year
      currentWaterUsageGal: activeSqft * this.randomFloat(200, 400), // gal/sqft/year
      currentLightingType: this.randomChoice(this.LIGHTING_TYPES),
      currentPpfdAverage: facilityType !== 'greenhouse' ? this.randomFloat(400, 800) : this.randomFloat(200, 600),
      currentDliAverage: this.randomFloat(25, 45),
      yearsInOperation: this.randomFloat(0.5, 10),
      annualRevenue: activeSqft * baseYield * cyclesPerYear * pricePerUnit,
      operatingMargin: this.randomFloat(0.15, 0.35),
      pricePerGram: pricePerUnit,
      complianceScore: this.randomFloat(75, 100),
      facilityConditionScore: this.randomFloat(60, 95),
      managementExperienceYears: this.randomFloat(2, 20),
      createdAt: this.generatePastDate(365),
      updatedAt: new Date()
    };
  }
  
  public static generateInvestmentDeal(investor: Investor, facility: Facility): Investment {
    const investmentType = this.randomChoice([InvestmentType.GAAS, InvestmentType.YEP, InvestmentType.HYBRID]);
    
    let totalInvestment: number;
    let monthlyServiceFee: number;
    let yieldShare: number;
    let baselineYield: number;
    
    // Calculate investment based on facility size and type
    if (investmentType === InvestmentType.GAAS) {
      // Equipment upgrade cost
      const equipmentCostPerSqft = this.randomFloat(5, 15); // LED upgrade cost
      totalInvestment = facility.activeGrowSqft * equipmentCostPerSqft;
      monthlyServiceFee = totalInvestment * this.randomFloat(0.02, 0.04); // 2-4% of equipment value
      yieldShare = 0;
      baselineYield = 0;
    } else if (investmentType === InvestmentType.YEP) {
      // No upfront cost, revenue sharing
      totalInvestment = 0;
      monthlyServiceFee = 0;
      yieldShare = this.randomFloat(0.6, 0.8); // 60-80% to investor
      baselineYield = facility.currentYieldPerSqft;
    } else { // hybrid
      const equipmentCostPerSqft = this.randomFloat(3, 8);
      totalInvestment = facility.activeGrowSqft * equipmentCostPerSqft;
      monthlyServiceFee = totalInvestment * this.randomFloat(0.01, 0.02);
      yieldShare = this.randomFloat(0.3, 0.5); // 30-50% to investor
      baselineYield = facility.currentYieldPerSqft;
    }
    
    // Calculate expected improvements
    let yieldImprovement: number;
    let energyReduction: number;
    
    if (facility.currentLightingType === 'HPS') {
      yieldImprovement = this.randomFloat(0.15, 0.35); // 15-35% improvement
      energyReduction = this.randomFloat(0.3, 0.5); // 30-50% reduction
    } else {
      yieldImprovement = this.randomFloat(0.05, 0.20); // 5-20% improvement
      energyReduction = this.randomFloat(0.1, 0.3); // 10-30% reduction
    }
    
    const startDate = this.generatePastDate(365);
    const contractMonths = this.randomChoice([36, 48, 60]); // 3-5 year contracts
    
    return {
      id: this.generateId(),
      investorId: investor.id,
      facilityId: facility.id,
      investmentType,
      status: this.randomChoice([DealStatus.ACTIVE, DealStatus.ACTIVE, DealStatus.ACTIVE, DealStatus.PENDING, DealStatus.UNDER_REVIEW]),
      totalInvestmentAmount: totalInvestment,
      equipmentValue: [InvestmentType.GAAS, InvestmentType.HYBRID].includes(investmentType) ? totalInvestment : 0,
      monthlyServiceFee,
      yieldSharePercentage: [InvestmentType.YEP, InvestmentType.HYBRID].includes(investmentType) ? yieldShare * 100 : 0,
      baselineYield,
      contractStartDate: startDate,
      contractEndDate: new Date(startDate.getTime() + contractMonths * 30 * 24 * 60 * 60 * 1000),
      contractTermMonths: contractMonths,
      paymentFrequency: PaymentFrequency.MONTHLY,
      targetYieldImprovement: yieldImprovement * 100,
      targetEnergyReduction: energyReduction * 100,
      minimumPerformanceThreshold: yieldImprovement * 0.5 * 100,
      riskScore: this.randomFloat(20, 80),
      projectedIRR: this.randomFloat(0.15, 0.40),
      projectedPaybackMonths: this.randomInt(18, 48),
      createdAt: new Date(startDate.getTime() - this.randomInt(7, 30) * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };
  }
  
  public static generatePerformanceRecords(investment: Investment, facility: Facility, months: number = 12): PerformanceRecord[] {
    const records: PerformanceRecord[] = [];
    const startDate = investment.contractStartDate;
    const baselineYield = facility.currentYieldPerSqft;
    
    for (let month = 0; month < months; month++) {
      const recordDate = new Date(startDate.getTime() + month * 30 * 24 * 60 * 60 * 1000);
      
      // Simulate gradual improvement over time
      const improvementFactor = Math.min(month / 12, 1.0); // Ramp up over first year
      const targetImprovement = investment.targetYieldImprovement / 100;
      
      // Add some randomness
      const actualImprovement = targetImprovement * improvementFactor * this.randomFloat(0.8, 1.2);
      const actualYield = baselineYield * (1 + actualImprovement);
      
      // Energy improvements
      const energyTarget = investment.targetEnergyReduction / 100;
      const actualEnergyReduction = energyTarget * improvementFactor * this.randomFloat(0.7, 1.1);
      
      // Calculate YEP payment if applicable
      let yepPayment = 0;
      if (investment.yieldSharePercentage > 0) {
        const yieldIncrease = actualYield - baselineYield;
        // Assuming cycles and price from facility
        const cyclesPerMonth = facility.currentCyclesPerYear / 12;
        const revenueIncrease = yieldIncrease * facility.activeGrowSqft * cyclesPerMonth * facility.pricePerGram;
        yepPayment = revenueIncrease * (investment.yieldSharePercentage / 100);
      }
      
      const record: PerformanceRecord = {
        id: this.generateId(),
        investmentId: investment.id,
        facilityId: facility.id,
        recordDate,
        cycleNumber: month + 1,
        actualYieldPerSqft: actualYield,
        baselineYieldPerSqft: baselineYield,
        yieldImprovementPercentage: actualImprovement * 100,
        thcPercentage: facility.facilityType === 'indoor' || facility.facilityType === 'greenhouse' ? this.randomFloat(18, 25) : undefined,
        qualityScore: this.randomFloat(80, 95),
        avgTemperature: this.randomFloat(72, 78),
        avgHumidity: this.randomFloat(45, 60),
        avgCo2Ppm: this.randomFloat(800, 1200),
        avgPpfd: this.randomFloat(600, 900),
        avgDli: this.randomFloat(35, 45),
        kwhConsumed: facility.currentEnergyUsageKwh * (1 - actualEnergyReduction) / 12,
        kwhPerGram: this.randomFloat(1.5, 3.5) * (1 - actualEnergyReduction),
        waterGalConsumed: facility.currentWaterUsageGal / 12 * this.randomFloat(0.9, 1.1),
        revenueGenerated: actualYield * facility.activeGrowSqft * facility.pricePerGram * (facility.currentCyclesPerYear / 12),
        yepPaymentDue: yepPayment,
        energyCostSavings: facility.currentEnergyUsageKwh * actualEnergyReduction * 0.12 / 12, // $0.12/kWh
        createdAt: new Date(recordDate.getTime() + 5 * 24 * 60 * 60 * 1000)
      };
      
      records.push(record);
    }
    
    return records;
  }
  
  public static generatePortfolioMetrics(investorId: string, investments: Investment[]): PortfolioMetrics {
    const investorInvestments = investments.filter(inv => inv.investorId === investorId);
    
    if (investorInvestments.length === 0) {
      throw new Error('No investments found for investor');
    }
    
    const totalCapital = investorInvestments.reduce((sum, inv) => sum + inv.totalInvestmentAmount, 0);
    const monthlyRevenue = investorInvestments.reduce((sum, inv) => sum + inv.monthlyServiceFee, 0);
    
    const gaasInvestments = investorInvestments.filter(inv => inv.investmentType === InvestmentType.GAAS);
    const yepInvestments = investorInvestments.filter(inv => inv.investmentType === InvestmentType.YEP);
    
    return {
      id: this.generateId(),
      investorId,
      totalInvestments: investorInvestments.length,
      totalCapitalDeployed: totalCapital,
      totalMonthlyRevenue: monthlyRevenue,
      portfolioIRR: investorInvestments.reduce((sum, inv) => sum + inv.projectedIRR, 0) / investorInvestments.length,
      avgYieldImprovement: investorInvestments.reduce((sum, inv) => sum + inv.targetYieldImprovement, 0) / investorInvestments.length,
      avgEnergyReduction: investorInvestments.reduce((sum, inv) => sum + inv.targetEnergyReduction, 0) / investorInvestments.length,
      portfolioRiskScore: investorInvestments.reduce((sum, inv) => sum + inv.riskScore, 0) / investorInvestments.length,
      concentrationRisk: 1 / new Set(investorInvestments.map(inv => inv.facilityId)).size, // Simple Herfindahl
      gaasInvestments: gaasInvestments.length,
      yepInvestments: yepInvestments.length,
      gaasRevenue: gaasInvestments.reduce((sum, inv) => sum + inv.monthlyServiceFee, 0),
      yepRevenue: 0, // Would be calculated from performance records
      totalRevenueToDate: monthlyRevenue * this.randomInt(6, 24), // Simulated historical
      bestPerformingFacility: this.randomChoice(investorInvestments).facilityId,
      worstPerformingFacility: this.randomChoice(investorInvestments).facilityId,
      lastUpdated: new Date()
    };
  }
  
  public static generateFullDataset(numInvestors: number = 10, numFacilities: number = 20, numDeals: number = 30) {
    // Generate investors
    const investors: Investor[] = [];
    for (let i = 0; i < numInvestors; i++) {
      investors.push(this.generateInvestor());
    }
    
    // Generate facilities
    const facilities: Facility[] = [];
    for (let i = 0; i < numFacilities; i++) {
      facilities.push(this.generateFacility());
    }
    
    // Generate investment deals
    const investments: Investment[] = [];
    const performanceRecords: PerformanceRecord[] = [];
    const usedPairs = new Set<string>();
    
    for (let i = 0; i < numDeals && investments.length < numDeals; i++) {
      const investor = this.randomChoice(investors);
      const facility = this.randomChoice(facilities);
      const pairKey = `${investor.id}-${facility.id}`;
      
      // Avoid duplicate pairings
      if (!usedPairs.has(pairKey)) {
        usedPairs.add(pairKey);
        const investment = this.generateInvestmentDeal(investor, facility);
        investments.push(investment);
        
        // Generate performance records for active investments
        if (investment.status === DealStatus.ACTIVE) {
          const monthsActive = Math.min(
            12,
            Math.floor((new Date().getTime() - investment.contractStartDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
          );
          if (monthsActive > 0) {
            const records = this.generatePerformanceRecords(investment, facility, monthsActive);
            performanceRecords.push(...records);
          }
        }
      }
    }
    
    // Generate portfolio metrics for each investor
    const portfolioMetrics: PortfolioMetrics[] = [];
    for (const investor of investors) {
      const investorInvestments = investments.filter(inv => inv.investorId === investor.id);
      if (investorInvestments.length > 0) {
        portfolioMetrics.push(this.generatePortfolioMetrics(investor.id, investments));
      }
    }
    
    return {
      investors,
      facilities,
      investments,
      performanceRecords,
      portfolioMetrics
    };
  }
  
  // Utility functions
  private static generateId(): string {
    return `${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }
  
  private static randomChoice<T>(array: T[]): T {
    return array[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * array.length)];
  }
  
  private static randomInt(min: number, max: number): number {
    return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (max - min + 1)) + min;
  }
  
  private static randomFloat(min: number, max: number): number {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * (max - min) + min;
  }
  
  private static randomSample<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF);
    return shuffled.slice(0, count);
  }
  
  private static generatePastDate(daysAgo: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - this.randomInt(0, daysAgo));
    return date;
  }
  
  private static generateFullName(): string {
    const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", "James", "Mary"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
    return `${this.randomChoice(firstNames)} ${this.randomChoice(lastNames)}`;
  }
  
  private static generateLastName(): string {
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
    return this.randomChoice(lastNames);
  }
  
  private static generateEmail(name?: string): string {
    const domains = ["gmail.com", "yahoo.com", "outlook.com", "company.com", "business.net"];
    const username = name ? name.toLowerCase().replace(/\s+/g, '.') : `user${this.randomInt(1000, 9999)}`;
    return `${username}@${this.randomChoice(domains)}`;
  }
  
  private static generatePhone(): string {
    return `+1 (${this.randomInt(200, 999)}) ${this.randomInt(100, 999)}-${this.randomInt(1000, 9999)}`;
  }
}