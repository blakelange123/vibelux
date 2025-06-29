import { PrismaClient, FacilityType, InvestmentType, InvestmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInvestmentData() {

  try {
    // Create demo facilities
    const facilities = await Promise.all([
      prisma.facility.create({
        data: {
          name: 'Green Valley Cannabis - Denver',
          location: 'Denver, CO',
          facilityType: FacilityType.GREENHOUSE,
          totalSqft: 50000,
          activeGrowSqft: 40000,
          currentYieldPerSqft: 45,
          currentCyclesPerYear: 5.5,
          currentEnergyUsageKwh: 2500000,
          currentLaborCostPerGram: 0.85,
          operatorName: 'John Smith',
          operatorExperience: 12,
          certifications: ['GAP Certified', 'Organic'],
          lightingSystem: 'HPS + LED Hybrid',
          hvacSystem: 'Chilled Water',
          automationLevel: 'intermediate'
        }
      }),
      prisma.facility.create({
        data: {
          name: 'Vertical Greens Co - Chicago',
          location: 'Chicago, IL',
          facilityType: FacilityType.VERTICAL,
          totalSqft: 25000,
          activeGrowSqft: 20000,
          currentYieldPerSqft: 120,
          currentCyclesPerYear: 18,
          currentEnergyUsageKwh: 1800000,
          currentLaborCostPerGram: 0.45,
          operatorName: 'Sarah Johnson',
          operatorExperience: 8,
          certifications: ['USDA Organic', 'SQF'],
          lightingSystem: 'Full LED Spectrum',
          hvacSystem: 'VRF System',
          automationLevel: 'advanced'
        }
      }),
      prisma.facility.create({
        data: {
          name: 'Premium Herbs Indoor - Portland',
          location: 'Portland, OR',
          facilityType: FacilityType.INDOOR,
          totalSqft: 35000,
          activeGrowSqft: 28000,
          currentYieldPerSqft: 55,
          currentCyclesPerYear: 6,
          currentEnergyUsageKwh: 2100000,
          currentLaborCostPerGram: 0.75,
          operatorName: 'Mike Chen',
          operatorExperience: 15,
          certifications: ['Clean Green Certified'],
          lightingSystem: 'LED with UV Supplementation',
          hvacSystem: 'Advanced HVACD',
          automationLevel: 'advanced'
        }
      })
    ]);


    // Get the first user or create a demo user
    let demoUser = await prisma.user.findFirst();
    
    if (!demoUser) {
      // Create a demo user if none exists
      demoUser = await prisma.user.create({
        data: {
          clerkId: 'demo_user_' + Date.now(),
          email: 'demo@vibelux.com',
          name: 'Demo User',
          role: 'USER',
          subscriptionTier: 'ENTERPRISE'
        }
      });
    }

    if (demoUser) {
      const investor = await prisma.investor.upsert({
        where: { userId: demoUser.id },
        update: {},
        create: {
          userId: demoUser.id,
          companyName: 'Demo Capital Partners',
          investorType: 'fund',
          accreditedStatus: true,
          kycCompleted: true,
          kycCompletedAt: new Date(),
          targetIRR: 0.25,
          riskTolerance: 'moderate',
          investmentFocus: ['cannabis', 'leafy_greens', 'herbs']
        }
      });


      // Create investments
      const investments = await Promise.all([
        // GaaS investment
        prisma.investment.create({
          data: {
            investorId: investor.id,
            facilityId: facilities[0].id,
            investmentType: InvestmentType.GAAS,
            status: InvestmentStatus.ACTIVE,
            totalInvestmentAmount: 500000,
            monthlyServiceFee: 15000,
            yieldSharePercentage: 0,
            minimumPerformanceThreshold: 10,
            contractStartDate: new Date('2024-01-01'),
            contractEndDate: new Date('2027-01-01'),
            contractTermMonths: 36,
            targetYieldImprovement: 20,
            targetEnergyReduction: 25,
            baselineYield: 45,
            riskScore: 35,
            riskFactors: {
              facility: 15,
              operator: 10,
              market: 10
            }
          }
        }),
        // YEP investment
        prisma.investment.create({
          data: {
            investorId: investor.id,
            facilityId: facilities[1].id,
            investmentType: InvestmentType.YEP,
            status: InvestmentStatus.ACTIVE,
            totalInvestmentAmount: 300000,
            monthlyServiceFee: 0,
            yieldSharePercentage: 30,
            minimumPerformanceThreshold: 15,
            contractStartDate: new Date('2024-02-01'),
            contractEndDate: new Date('2026-02-01'),
            contractTermMonths: 24,
            targetYieldImprovement: 25,
            targetEnergyReduction: 30,
            baselineYield: 120,
            riskScore: 45,
            riskFactors: {
              facility: 20,
              operator: 15,
              market: 10
            }
          }
        }),
        // Hybrid investment
        prisma.investment.create({
          data: {
            investorId: investor.id,
            facilityId: facilities[2].id,
            investmentType: InvestmentType.HYBRID,
            status: InvestmentStatus.ACTIVE,
            totalInvestmentAmount: 400000,
            monthlyServiceFee: 8000,
            yieldSharePercentage: 20,
            minimumPerformanceThreshold: 12,
            contractStartDate: new Date('2024-03-01'),
            contractEndDate: new Date('2026-03-01'),
            contractTermMonths: 24,
            targetYieldImprovement: 18,
            targetEnergyReduction: 22,
            baselineYield: 55,
            riskScore: 40,
            riskFactors: {
              facility: 18,
              operator: 12,
              market: 10
            }
          }
        })
      ]);


      // Create performance records
      for (const investment of investments) {
        const cycleCount = 3;
        for (let cycle = 1; cycle <= cycleCount; cycle++) {
          const improvement = 15 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10; // 15-25% improvement
          const actualYield = investment.baselineYield * (1 + improvement / 100);
          
          await prisma.performanceRecord.create({
            data: {
              investmentId: investment.id,
              facilityId: investment.facilityId,
              recordDate: new Date(new Date().setMonth(new Date().getMonth() - (cycleCount - cycle))),
              cycleNumber: cycle,
              actualYieldPerSqft: actualYield,
              yieldImprovementPercentage: improvement,
              qualityScore: 85 + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10),
              energyUsageKwh: 180000 - (cycle * 5000),
              kwhPerGram: 2.2 - (cycle * 0.1),
              energyCostSavings: 2500 + (cycle * 500),
              avgTemperature: 72 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4,
              avgHumidity: 55 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
              avgCo2: 1000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200,
              avgPpfd: 800 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
              avgDli: 35 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5,
              revenueGenerated: actualYield * 2000 * 3.5, // sqft * $/gram
              operatingCostSavings: 1500 + (cycle * 300),
              yepPaymentDue: investment.yieldSharePercentage > 0 ? 
                (actualYield - investment.baselineYield) * 2000 * 3.5 * (investment.yieldSharePercentage / 100) : 0,
              verified: true,
              verifiedBy: 'System',
              verifiedAt: new Date()
            }
          });
        }
      }


      // Create payments
      for (const investment of investments) {
        if (investment.monthlyServiceFee > 0) {
          // Create GaaS monthly payments
          for (let month = 0; month < 3; month++) {
            await prisma.payment.create({
              data: {
                investmentId: investment.id,
                paymentType: 'service_fee',
                amount: investment.monthlyServiceFee,
                dueDate: new Date(new Date().setMonth(new Date().getMonth() - month)),
                paidDate: month > 0 ? new Date(new Date().setMonth(new Date().getMonth() - month + 1)) : null,
                status: month > 0 ? 'completed' : 'pending',
                performancePeriod: {
                  startDate: new Date(new Date().setMonth(new Date().getMonth() - month - 1)),
                  endDate: new Date(new Date().setMonth(new Date().getMonth() - month))
                }
              }
            });
          }
        }
      }


      // Calculate portfolio metrics
      await prisma.portfolioMetrics.upsert({
        where: { investorId: investor.id },
        update: {},
        create: {
          investorId: investor.id,
          totalInvestments: investments.length,
          totalCapitalDeployed: 1200000,
          currentValuation: 1380000,
          realizedGains: 85000,
          unrealizedGains: 180000,
          portfolioIRR: 0.22,
          portfolioROI: 0.15,
          avgYieldImprovement: 20,
          avgEnergyReduction: 25,
          portfolioRiskScore: 40,
          diversificationScore: 85,
          gaasRevenue: 45000,
          yepRevenue: 25000,
          totalRevenue: 78000,
          gaasInvestments: 1,
          yepInvestments: 1,
          activeInvestments: 3
        }
      });

    }

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedInvestmentData().catch((error) => {
  console.error(error);
  process.exit(1);
});