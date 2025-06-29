import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemoData() {

  try {
    // 1. Create demo users
    const demoUsers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'demo.facility@vibelux.com' },
        update: {},
        create: {
          clerkId: 'demo_facility_' + Date.now(),
          email: 'demo.facility@vibelux.com',
          name: 'Green Valley Operations',
          role: 'USER',
          settings: {
            notifications: {
              investmentUpdates: true,
              facilityAlerts: true,
              thresholdAlerts: true
            }
          }
        }
      }),
      prisma.user.upsert({
        where: { email: 'demo.investor@vibelux.com' },
        update: {},
        create: {
          clerkId: 'demo_investor_' + Date.now(),
          email: 'demo.investor@vibelux.com',
          name: 'Capital Growth Partners',
          role: 'USER',
          settings: {
            notifications: {
              investmentUpdates: true,
              payments: true
            }
          }
        }
      }),
      prisma.user.upsert({
        where: { email: 'admin@vibelux.com' },
        update: {},
        create: {
          clerkId: 'admin_user_' + Date.now(),
          email: 'admin@vibelux.com',
          name: 'VibeLux Admin',
          role: 'ADMIN',
          settings: {}
        }
      })
    ]);


    // 2. Create demo facilities
    const demoFacilities = await Promise.all([
      prisma.facility.create({
        data: {
          name: 'Green Valley Cannabis Co.',
          description: 'Premium cannabis cultivation facility in Colorado',
          type: 'GREENHOUSE',
          address: '1234 Agriculture Way',
          city: 'Denver',
          state: 'Colorado',
          country: 'USA',
          zipCode: '80202',
          size: 50000, // sq ft
          settings: {
            climateZone: '5B',
            certifications: ['GAP Certified', 'Organic'],
            automationLevel: 'intermediate'
          }
        }
      }),
      prisma.facility.create({
        data: {
          name: 'Vertical Greens Chicago',
          description: 'High-tech vertical farming operation for leafy greens',
          type: 'VERTICAL_FARM',
          address: '789 Innovation Drive',
          city: 'Chicago',
          state: 'Illinois', 
          country: 'USA',
          zipCode: '60601',
          size: 25000,
          settings: {
            climateZone: '6A',
            certifications: ['USDA Organic', 'SQF'],
            automationLevel: 'advanced'
          }
        }
      }),
      prisma.facility.create({
        data: {
          name: 'Premium Herbs Indoor',
          description: 'Indoor herb cultivation with LED technology',
          type: 'INDOOR',
          address: '456 Growing Street',
          city: 'Portland',
          state: 'Oregon',
          country: 'USA',
          zipCode: '97201',
          size: 35000,
          settings: {
            climateZone: '9B',
            certifications: ['Clean Green Certified'],
            automationLevel: 'advanced'
          }
        }
      })
    ]);


    // 3. Add users to facilities
    await Promise.all([
      prisma.facilityUser.create({
        data: {
          facilityId: demoFacilities[0].id,
          userId: demoUsers[0].id,
          role: 'OWNER'
        }
      }),
      prisma.facilityUser.create({
        data: {
          facilityId: demoFacilities[1].id,
          userId: demoUsers[0].id,
          role: 'MANAGER'
        }
      }),
      prisma.facilityUser.create({
        data: {
          facilityId: demoFacilities[2].id,
          userId: demoUsers[0].id,
          role: 'ADMIN'
        }
      })
    ]);


    // 4. Create investment opportunities
    const investmentOpportunities = await Promise.all([
      prisma.investmentOpportunity.create({
        data: {
          facilityId: demoFacilities[0].id,
          title: 'LED Lighting Upgrade - Phase 2',
          description: 'Complete retrofit of greenhouse lighting system to high-efficiency LED arrays with spectrum control',
          type: 'EQUIPMENT',
          status: 'ACTIVE',
          minInvestment: 50000,
          maxInvestment: 200000,
          targetAmount: 750000,
          currentAmount: 550000,
          expectedReturn: 25.5,
          duration: 36, // months
          paymentSchedule: 'MONTHLY',
          documents: {
            businessPlan: 'business-plan-led-upgrade.pdf',
            financials: 'financial-projections-q4-2024.pdf',
            compliance: 'compliance-certificates.pdf'
          },
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-30')
        }
      }),
      prisma.investmentOpportunity.create({
        data: {
          facilityId: demoFacilities[1].id,
          title: 'Vertical Farm Expansion',
          description: 'Doubling production capacity with advanced automation and climate control systems',
          type: 'EXPANSION',
          status: 'ACTIVE',
          minInvestment: 100000,
          maxInvestment: 500000,
          targetAmount: 1200000,
          currentAmount: 890000,
          expectedReturn: 32.0,
          duration: 24,
          paymentSchedule: 'QUARTERLY',
          documents: {
            businessPlan: 'vertical-expansion-plan.pdf',
            marketAnalysis: 'leafy-greens-market-analysis.pdf'
          },
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-08-15')
        }
      }),
      prisma.investmentOpportunity.create({
        data: {
          facilityId: demoFacilities[2].id,
          title: 'Cannabis Processing Technology',
          description: 'State-of-the-art extraction and processing equipment for premium concentrates',
          type: 'TECHNOLOGY',
          status: 'FUNDED',
          minInvestment: 25000,
          maxInvestment: 150000,
          targetAmount: 600000,
          currentAmount: 600000,
          expectedReturn: 28.5,
          duration: 30,
          paymentSchedule: 'MONTHLY',
          documents: {
            equipmentSpecs: 'extraction-equipment-specs.pdf',
            roiProjections: 'processing-roi-analysis.pdf'
          },
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      })
    ]);


    // 5. Create demo investments
    const investments = await Promise.all([
      prisma.investment.create({
        data: {
          opportunityId: investmentOpportunities[0].id,
          investorId: demoUsers[1].id,
          amount: 150000,
          status: 'COMPLETED',
          paymentMethod: 'wire_transfer',
          transactionId: 'TXN-LED-150K-001',
          totalReturns: 12500,
          notes: 'Initial investment in LED upgrade project'
        }
      }),
      prisma.investment.create({
        data: {
          opportunityId: investmentOpportunities[1].id,
          investorId: demoUsers[1].id,
          amount: 250000,
          status: 'COMPLETED',
          paymentMethod: 'wire_transfer',
          transactionId: 'TXN-VRT-250K-002',
          totalReturns: 18750,
          notes: 'Vertical farm expansion funding'
        }
      }),
      prisma.investment.create({
        data: {
          opportunityId: investmentOpportunities[2].id,
          investorId: demoUsers[1].id,
          amount: 100000,
          status: 'COMPLETED',
          paymentMethod: 'wire_transfer',
          transactionId: 'TXN-CNB-100K-003',
          totalReturns: 8500,
          notes: 'Processing technology investment'
        }
      })
    ]);


    // 6. Create investment payouts
    const now = new Date();
    const payouts = [];
    
    for (const investment of investments) {
      // Create 3 monthly payouts for each investment
      for (let i = 1; i <= 3; i++) {
        const payoutDate = new Date(now);
        payoutDate.setMonth(payoutDate.getMonth() - (4 - i));
        
        const payout = await prisma.investmentPayout.create({
          data: {
            investmentId: investment.id,
            amount: investment.totalReturns / 12, // Monthly payout
            type: 'INTEREST',
            status: i <= 2 ? 'COMPLETED' : 'PENDING',
            scheduledDate: payoutDate,
            paidDate: i <= 2 ? payoutDate : null,
            transactionId: i <= 2 ? `PAY-${investment.id}-${i}` : null
          }
        });
        payouts.push(payout);
      }
    }


    // 7. Create affiliate program
    const affiliate = await prisma.affiliate.create({
      data: {
        userId: demoUsers[0].id,
        code: 'GREENVALLEY2024',
        tier: 'SILVER',
        status: 'ACTIVE',
        baseCommission: 12.5,
        bonusCommission: 2.5,
        totalReferrals: 8,
        activeReferrals: 6,
        totalRevenue: 45750,
        totalCommission: 6862.50,
        totalClicks: 156,
        paymentMethod: 'bank_transfer',
        paymentDetails: {
          bankName: 'Chase Bank',
          accountType: 'business'
        }
      }
    });

    // Create affiliate referrals
    const referrals = await Promise.all([
      prisma.affiliateReferral.create({
        data: {
          affiliateId: affiliate.id,
          referredEmail: 'customer1@example.com',
          status: 'CONVERTED',
          signedUpAt: new Date('2024-01-15'),
          firstPurchaseAt: new Date('2024-01-20'),
          totalPurchases: 12500,
          totalCommission: 1562.50
        }
      }),
      prisma.affiliateReferral.create({
        data: {
          affiliateId: affiliate.id,
          referredEmail: 'customer2@example.com',
          status: 'CONVERTED',
          signedUpAt: new Date('2024-02-10'),
          firstPurchaseAt: new Date('2024-02-15'),
          totalPurchases: 8900,
          totalCommission: 1112.50
        }
      })
    ]);


    // 8. Create cost categories and expenses
    const costCategories = await Promise.all([
      prisma.costCategory.create({
        data: { name: 'Labor', description: 'Employee wages and benefits', type: 'labor' }
      }),
      prisma.costCategory.create({
        data: { name: 'Utilities', description: 'Electricity, water, gas', type: 'utilities' }
      }),
      prisma.costCategory.create({
        data: { name: 'Equipment', description: 'Lighting, HVAC, automation', type: 'equipment' }
      }),
      prisma.costCategory.create({
        data: { name: 'Nutrients', description: 'Fertilizers and growing medium', type: 'materials' }
      })
    ]);

    // Create production batch
    const productionBatch = await prisma.productionBatch.create({
      data: {
        facilityId: demoFacilities[0].id,
        batchCode: 'GV-2024-001',
        cropType: 'Cannabis',
        cultivar: 'Blue Dream',
        plantCount: 500,
        startDate: new Date('2024-01-01'),
        harvestDate: new Date('2024-04-15'),
        status: 'COMPLETED',
        wetWeight: 125000, // grams
        dryWeight: 25000,   // grams
        trimWeight: 22500,  // grams
        wasteWeight: 2500,  // grams
        thcContent: 22.5,
        cbdContent: 0.8,
        qualityGrade: 'Premium'
      }
    });

    // Create expenses for the batch
    const expenses = await Promise.all([
      prisma.expense.create({
        data: {
          facilityId: demoFacilities[0].id,
          categoryId: costCategories[0].id, // Labor
          amount: 15000,
          description: 'Cultivation team wages - Q1 2024',
          batchId: productionBatch.id,
          cropType: 'Cannabis',
          vendorName: 'Internal Payroll',
          expenseDate: new Date('2024-01-31'),
          recordedBy: demoUsers[0].id
        }
      }),
      prisma.expense.create({
        data: {
          facilityId: demoFacilities[0].id,
          categoryId: costCategories[1].id, // Utilities
          amount: 8500,
          description: 'Electricity - LED lighting systems',
          batchId: productionBatch.id,
          vendorName: 'Xcel Energy',
          invoiceNumber: 'XCL-2024-0156',
          expenseDate: new Date('2024-02-15'),
          recordedBy: demoUsers[0].id
        }
      }),
      prisma.expense.create({
        data: {
          facilityId: demoFacilities[0].id,
          categoryId: costCategories[3].id, // Nutrients
          amount: 3200,
          description: 'Organic nutrient blend - Flowering stage',
          batchId: productionBatch.id,
          vendorName: 'Advanced Nutrients',
          invoiceNumber: 'AN-789456',
          expenseDate: new Date('2024-03-01'),
          recordedBy: demoUsers[0].id
        }
      })
    ]);


    // 9. Create sensor readings for demo
    const sensorTypes = ['temperature', 'humidity', 'co2', 'ppfd', 'vpd'];
    const sensorReadings = [];
    
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      for (const sensorType of sensorTypes) {
        const baseValue = {
          temperature: 72,
          humidity: 60,
          co2: 1000,
          ppfd: 800,
          vpd: 1.0
        }[sensorType] || 0;
        
        const value = baseValue + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * baseValue * 0.1;
        
        sensorReadings.push({
          facilityId: demoFacilities[0].id,
          sensorId: `sensor_${sensorType}_001`,
          sensorType,
          value,
          unit: {
            temperature: '°F',
            humidity: '%',
            co2: 'ppm',
            ppfd: 'μmol/m²/s',
            vpd: 'kPa'
          }[sensorType] || '',
          timestamp: date
        });
      }
    }

    await prisma.sensorReading.createMany({
      data: sensorReadings.slice(0, 100) // Limit to 100 readings
    });


    // 10. Create notifications
    const notifications = await Promise.all([
      prisma.notification.create({
        data: {
          userId: demoUsers[1].id,
          type: 'investment_update',
          title: 'Investment Payout Processed',
          message: 'Your monthly return of $1,041.67 from Green Valley Cannabis has been processed',
          data: { investmentId: investments[0].id, amount: 1041.67 }
        }
      }),
      prisma.notification.create({
        data: {
          userId: demoUsers[0].id,
          type: 'facility_alert',
          title: 'Optimal Growing Conditions',
          message: 'Your facility is maintaining ideal VPD and temperature ranges',
          data: { facilityId: demoFacilities[0].id, vpd: 1.1, temperature: 73.2 }
        }
      }),
      prisma.notification.create({
        data: {
          userId: demoUsers[0].id,
          type: 'new_referral',
          title: 'New Referral Signup',
          message: 'customer3@example.com signed up using your referral code',
          data: { affiliateCode: affiliate.code, email: 'customer3@example.com' }
        }
      })
    ]);


    // Final summary
    const summary = {
      users: demoUsers.length,
      facilities: demoFacilities.length,
      investments: investments.length,
      opportunities: investmentOpportunities.length,
      payouts: payouts.length,
      expenses: expenses.length,
      notifications: notifications.length,
      sensorReadings: Math.min(sensorReadings.length, 100)
    };


    return summary;

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { seedDemoData };