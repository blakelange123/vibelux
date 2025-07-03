import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { FacilityType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as FacilityType | null;
    const available = searchParams.get('available') === 'true';

    // Build where clause
    const where: any = {};
    
    if (type) {
      where.facilityType = type;
    }

    if (available) {
      // Only show facilities with available investment capacity
      where.investments = {
        none: {
          status: 'ACTIVE'
        }
      };
    }

    // Get facilities
    const facilities = await prisma.facility.findMany({
      where,
      include: {
        investments: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            investmentType: true,
            totalInvestmentAmount: true
          }
        },
        performanceRecords: {
          orderBy: { recordDate: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate investment opportunities for each facility
    const facilitiesWithOpportunities = facilities.map(facility => {
      const totalInvested = facility.investments.reduce(
        (sum, inv) => sum + inv.totalInvestmentAmount, 
        0
      );
      
      // Assume max investment capacity based on facility size
      const maxCapacity = facility.totalSqft * 50; // $50/sqft
      const availableCapacity = maxCapacity - totalInvested;
      
      // Calculate potential returns based on recent performance
      const latestPerformance = facility.performanceRecords[0];
      const estimatedYieldImprovement = latestPerformance?.yieldImprovementPercentage || 15;
      const estimatedEnergyReduction = latestPerformance ? 
        ((latestPerformance.energyCostSavings / (facility.currentEnergyUsageKwh * 0.12)) * 100) : 20;

      return {
        ...facility,
        investmentMetrics: {
          totalInvested,
          maxCapacity,
          availableCapacity,
          percentageInvested: (totalInvested / maxCapacity) * 100,
          estimatedYieldImprovement,
          estimatedEnergyReduction,
          activeInvestors: facility.investments.length
        }
      };
    });

    return NextResponse.json(facilitiesWithOpportunities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facilities' },
      { status: 500 }
    );
  }
}

// Create a new facility (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Create facility
    const facility = await prisma.facility.create({
      data: {
        name: data.name,
        location: data.location,
        facilityType: data.facilityType,
        totalSqft: data.totalSqft,
        activeGrowSqft: data.activeGrowSqft,
        currentYieldPerSqft: data.currentYieldPerSqft,
        currentCyclesPerYear: data.currentCyclesPerYear,
        currentEnergyUsageKwh: data.currentEnergyUsageKwh,
        currentLaborCostPerGram: data.currentLaborCostPerGram,
        operatorName: data.operatorName,
        operatorExperience: data.operatorExperience,
        certifications: data.certifications || [],
        lightingSystem: data.lightingSystem,
        hvacSystem: data.hvacSystem,
        automationLevel: data.automationLevel
      }
    });

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error creating facility:', error);
    return NextResponse.json(
      { error: 'Failed to create facility' },
      { status: 500 }
    );
  }
}