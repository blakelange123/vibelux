import { prisma } from '@/lib/prisma';
import { 
  InvestmentType, 
  InvestmentStatus,
  FacilityType,
  Prisma
} from '@prisma/client';

export class InvestmentService {
  // Get or create investor profile for a user
  static async getOrCreateInvestor(userId: string, data?: Partial<Prisma.InvestorCreateInput>) {
    return await prisma.investor.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        investorType: data?.investorType || 'individual',
        riskTolerance: data?.riskTolerance || 'moderate',
        investmentFocus: data?.investmentFocus || ['cannabis', 'leafy_greens'],
        ...data
      },
      include: {
        user: true,
        investments: {
          include: {
            facility: true
          }
        },
        portfolioMetrics: true
      }
    });
  }

  // Get investor dashboard data
  static async getInvestorDashboard(userId: string) {
    const investor = await this.getOrCreateInvestor(userId);
    
    if (!investor) {
      throw new Error('Investor not found');
    }

    // Get active investments with recent performance
    const activeInvestments = await prisma.investment.findMany({
      where: {
        investorId: investor.id,
        status: InvestmentStatus.ACTIVE
      },
      include: {
        facility: true,
        performanceRecords: {
          orderBy: { recordDate: 'desc' },
          take: 10
        },
        payments: {
          where: {
            dueDate: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
          },
          orderBy: { dueDate: 'desc' }
        },
        alerts: {
          where: { resolved: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Get or calculate portfolio metrics
    let portfolioMetrics = await prisma.portfolioMetrics.findUnique({
      where: { investorId: investor.id }
    });

    if (!portfolioMetrics || 
        new Date().getTime() - portfolioMetrics.lastCalculated.getTime() > 24 * 60 * 60 * 1000) {
      portfolioMetrics = await this.calculatePortfolioMetrics(investor.id);
    }

    // Get recent performance across all investments
    const recentPerformance = await prisma.performanceRecord.findMany({
      where: {
        investment: {
          investorId: investor.id
        }
      },
      orderBy: { recordDate: 'desc' },
      take: 20,
      include: {
        investment: {
          include: {
            facility: true
          }
        }
      }
    });

    // Get upcoming payments
    const upcomingPayments = await prisma.payment.findMany({
      where: {
        investment: {
          investorId: investor.id
        },
        status: 'pending',
        dueDate: {
          gte: new Date(),
          lte: new Date(new Date().setMonth(new Date().getMonth() + 1))
        }
      },
      orderBy: { dueDate: 'asc' },
      include: {
        investment: {
          include: {
            facility: true
          }
        }
      }
    });

    return {
      investor,
      portfolio: portfolioMetrics,
      activeInvestments,
      recentPerformance,
      upcomingPayments,
      alerts: activeInvestments.flatMap(inv => inv.alerts)
    };
  }

  // Calculate portfolio metrics
  static async calculatePortfolioMetrics(investorId: string) {
    const investments = await prisma.investment.findMany({
      where: { investorId },
      include: {
        performanceRecords: true,
        payments: {
          where: { status: 'completed' }
        }
      }
    });

    const metrics = {
      totalInvestments: investments.length,
      totalCapitalDeployed: investments.reduce((sum, inv) => sum + inv.totalInvestmentAmount, 0),
      gaasInvestments: investments.filter(inv => inv.investmentType === InvestmentType.GAAS).length,
      yepInvestments: investments.filter(inv => inv.investmentType === InvestmentType.YEP).length,
      activeInvestments: investments.filter(inv => inv.status === InvestmentStatus.ACTIVE).length,
      
      // Calculate returns
      totalRevenue: 0,
      gaasRevenue: 0,
      yepRevenue: 0,
      realizedGains: 0,
      
      // Performance metrics
      avgYieldImprovement: 0,
      avgEnergyReduction: 0,
      
      // Risk metrics
      portfolioRiskScore: 0,
      diversificationScore: 0,
      
      // ROI calculations
      portfolioROI: 0,
      portfolioIRR: 0.15, // Placeholder - would need complex calculation
      
      currentValuation: 0,
      unrealizedGains: 0
    };

    // Calculate revenue from payments
    investments.forEach(inv => {
      const revenue = inv.payments.reduce((sum, payment) => sum + payment.amount, 0);
      metrics.totalRevenue += revenue;
      
      if (inv.investmentType === InvestmentType.GAAS) {
        metrics.gaasRevenue += revenue;
      } else if (inv.investmentType === InvestmentType.YEP) {
        metrics.yepRevenue += revenue;
      }
      
      // Calculate average performance
      if (inv.performanceRecords.length > 0) {
        const avgYield = inv.performanceRecords.reduce((sum, rec) => 
          sum + rec.yieldImprovementPercentage, 0) / inv.performanceRecords.length;
        const avgEnergy = inv.performanceRecords.reduce((sum, rec) => 
          sum + ((rec.energyCostSavings / inv.totalInvestmentAmount) * 100), 0) / inv.performanceRecords.length;
        
        metrics.avgYieldImprovement += avgYield;
        metrics.avgEnergyReduction += avgEnergy;
      }
      
      // Risk score average
      metrics.portfolioRiskScore += inv.riskScore;
    });

    // Average out the metrics
    if (investments.length > 0) {
      metrics.avgYieldImprovement /= investments.length;
      metrics.avgEnergyReduction /= investments.length;
      metrics.portfolioRiskScore /= investments.length;
      
      // Calculate ROI
      metrics.portfolioROI = (metrics.totalRevenue - metrics.totalCapitalDeployed) / metrics.totalCapitalDeployed;
      
      // Calculate diversification score (0-100)
      const facilityTypes = new Set(investments.map(inv => inv.facility?.facilityType)).size;
      const investmentTypes = new Set(investments.map(inv => inv.investmentType)).size;
      metrics.diversificationScore = Math.min(100, (facilityTypes * 20) + (investmentTypes * 30) + (investments.length * 5));
    }

    // Current valuation (simplified - would need NPV calculation)
    metrics.currentValuation = metrics.totalCapitalDeployed * (1 + metrics.portfolioROI);
    metrics.unrealizedGains = metrics.currentValuation - metrics.totalCapitalDeployed;
    metrics.realizedGains = metrics.totalRevenue;

    // Save metrics
    return await prisma.portfolioMetrics.upsert({
      where: { investorId },
      update: {
        ...metrics,
        lastCalculated: new Date()
      },
      create: {
        investorId,
        ...metrics
      }
    });
  }

  // Get performance data for a specific investment
  static async getInvestmentPerformance(investmentId: string, investorId: string) {
    const investment = await prisma.investment.findFirst({
      where: {
        id: investmentId,
        investorId
      },
      include: {
        facility: true,
        performanceRecords: {
          orderBy: { recordDate: 'desc' }
        },
        payments: {
          orderBy: { dueDate: 'desc' }
        },
        alerts: {
          where: { resolved: false }
        }
      }
    });

    if (!investment) {
      throw new Error('Investment not found');
    }

    return investment;
  }

  // Create a new investment opportunity
  static async createInvestment(data: {
    investorId: string;
    facilityId: string;
    investmentType: InvestmentType;
    totalInvestmentAmount: number;
    contractTermMonths: number;
    monthlyServiceFee?: number;
    yieldSharePercentage?: number;
    minimumPerformanceThreshold: number;
    targetYieldImprovement: number;
    targetEnergyReduction: number;
    baselineYield: number;
    riskScore: number;
    riskFactors: any;
  }) {
    const contractStartDate = new Date();
    const contractEndDate = new Date();
    contractEndDate.setMonth(contractEndDate.getMonth() + data.contractTermMonths);

    return await prisma.investment.create({
      data: {
        ...data,
        contractStartDate,
        contractEndDate,
        status: InvestmentStatus.PENDING
      },
      include: {
        facility: true,
        investor: true
      }
    });
  }

  // Record performance data (would be called by IoT integration)
  static async recordPerformance(data: {
    investmentId: string;
    facilityId: string;
    cycleNumber: number;
    actualYieldPerSqft: number;
    qualityScore: number;
    energyUsageKwh: number;
    avgTemperature: number;
    avgHumidity: number;
    avgCo2: number;
    avgPpfd: number;
    avgDli: number;
  }) {
    // Get the investment to calculate improvements
    const investment = await prisma.investment.findUnique({
      where: { id: data.investmentId },
      include: { facility: true }
    });

    if (!investment) {
      throw new Error('Investment not found');
    }

    // Calculate metrics
    const yieldImprovementPercentage = 
      ((data.actualYieldPerSqft - investment.baselineYield) / investment.baselineYield) * 100;
    
    const kwhPerGram = data.energyUsageKwh / 
      (data.actualYieldPerSqft * investment.facility.activeGrowSqft);
    
    const baselineKwhPerGram = investment.facility.currentEnergyUsageKwh / 
      (investment.facility.currentYieldPerSqft * investment.facility.activeGrowSqft * investment.facility.currentCyclesPerYear);
    
    const energyCostSavings = (baselineKwhPerGram - kwhPerGram) * 
      data.actualYieldPerSqft * investment.facility.activeGrowSqft * 0.12; // $0.12/kWh average

    // Calculate revenue and YEP payment
    const revenueGenerated = data.actualYieldPerSqft * investment.facility.activeGrowSqft * 3.50; // $3.50/gram average
    const operatingCostSavings = energyCostSavings * 0.7; // 70% of energy savings
    
    let yepPaymentDue = 0;
    if (investment.investmentType === InvestmentType.YEP || investment.investmentType === InvestmentType.HYBRID) {
      if (yieldImprovementPercentage > investment.minimumPerformanceThreshold) {
        yepPaymentDue = (revenueGenerated - (investment.baselineYield * investment.facility.activeGrowSqft * 3.50)) * 
          (investment.yieldSharePercentage / 100);
      }
    }

    // Create performance record
    const performanceRecord = await prisma.performanceRecord.create({
      data: {
        ...data,
        recordDate: new Date(),
        yieldImprovementPercentage,
        kwhPerGram,
        energyCostSavings,
        revenueGenerated,
        operatingCostSavings,
        yepPaymentDue
      }
    });

    // Create payment record if due
    if (yepPaymentDue > 0 || investment.monthlyServiceFee > 0) {
      await prisma.payment.create({
        data: {
          investmentId: investment.id,
          paymentType: yepPaymentDue > 0 ? 'yield_share' : 'service_fee',
          amount: yepPaymentDue > 0 ? yepPaymentDue : investment.monthlyServiceFee,
          dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          status: 'pending',
          performancePeriod: {
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            endDate: new Date()
          }
        }
      });
    }

    // Check for alerts
    if (yieldImprovementPercentage < investment.targetYieldImprovement * 0.8) {
      await prisma.investmentAlert.create({
        data: {
          investmentId: investment.id,
          alertType: 'performance_below_target',
          severity: 'medium',
          title: 'Yield Performance Below Target',
          message: `Current yield improvement (${yieldImprovementPercentage.toFixed(1)}%) is below 80% of target (${investment.targetYieldImprovement}%)`,
          triggerValue: yieldImprovementPercentage,
          threshold: investment.targetYieldImprovement * 0.8
        }
      });
    }

    return performanceRecord;
  }
}