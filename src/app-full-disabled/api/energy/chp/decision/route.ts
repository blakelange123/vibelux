import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface CHPMarketConditions {
  gridPrice: number;
  gasPrice: number;
  co2Price: number;
  timestamp: string;
}

interface CHPDecision {
  decision: 'RUN_CHP' | 'PURCHASE_CO2' | 'MARGINAL';
  netBenefitPerHour: number;
  gridRevenuePerHour: number;
  co2OffsetPerHour: number;
  fuelCostPerHour: number;
  heatRecoveryPerHour: number;
  breakevenGridPrice: number;
  safetyMarginPercent: number;
  nextDecisionPoint: string;
  confidence: number;
}

interface CHPOperations {
  isRunning: boolean;
  powerOutput: number;
  co2Production: number;
  heatOutput: number;
  efficiency: number;
  hoursToday: number;
  dailyRevenue: number;
}

function calculateCHPDecision(marketConditions: CHPMarketConditions): CHPDecision {
  const { gridPrice, gasPrice, co2Price } = marketConditions;
  
  // CHP Constants (500kW unit)
  const CHP_POWER_OUTPUT = 500; // kW
  const CHP_CO2_PRODUCTION = 2500; // CFH
  const CHP_HEAT_OUTPUT = 1200; // kW thermal
  const CHP_EFFICIENCY = 0.85;
  const GAS_CONSUMPTION = 58; // therms/hour
  const HEAT_VALUE = 15; // $/hour when recovered
  
  // Revenue calculations
  const gridRevenuePerHour = (CHP_POWER_OUTPUT * gridPrice);
  const fuelCostPerHour = -(GAS_CONSUMPTION * gasPrice);
  const co2OffsetPerHour = (CHP_CO2_PRODUCTION * co2Price / 1000); // Convert CFH to lbs
  const heatRecoveryPerHour = HEAT_VALUE;
  
  // Net benefit
  const netBenefitPerHour = gridRevenuePerHour + co2OffsetPerHour + heatRecoveryPerHour + fuelCostPerHour;
  
  // Breakeven analysis
  const breakevenGridPrice = (Math.abs(fuelCostPerHour) - co2OffsetPerHour - heatRecoveryPerHour) / CHP_POWER_OUTPUT;
  const safetyMarginPercent = ((gridPrice - breakevenGridPrice) / breakevenGridPrice) * 100;
  
  // Decision logic
  let decision: 'RUN_CHP' | 'PURCHASE_CO2' | 'MARGINAL';
  let confidence: number;
  
  if (safetyMarginPercent > 50) {
    decision = 'RUN_CHP';
    confidence = Math.min(95, 75 + safetyMarginPercent / 5);
  } else if (safetyMarginPercent > 15) {
    decision = 'MARGINAL';
    confidence = 60 + safetyMarginPercent;
  } else {
    decision = 'PURCHASE_CO2';
    confidence = Math.min(90, 70 + Math.abs(safetyMarginPercent) / 2);
  }
  
  return {
    decision,
    netBenefitPerHour,
    gridRevenuePerHour,
    co2OffsetPerHour,
    fuelCostPerHour,
    heatRecoveryPerHour,
    breakevenGridPrice,
    safetyMarginPercent,
    nextDecisionPoint: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    confidence
  };
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current market conditions (in production, this would come from real APIs)
    const currentHour = new Date().getHours();
    const baseGridPrice = 0.08;
    const peakMultiplier = currentHour >= 14 && currentHour <= 19 ? 2.5 : 1.0;
    
    const marketConditions: CHPMarketConditions = {
      gridPrice: baseGridPrice * peakMultiplier,
      gasPrice: 6.50, // $/therm
      co2Price: 1.20, // $/lb
      timestamp: new Date().toISOString()
    };

    const chpDecision = calculateCHPDecision(marketConditions);
    
    const chpOperations: CHPOperations = {
      isRunning: chpDecision.decision === 'RUN_CHP',
      powerOutput: chpDecision.decision === 'RUN_CHP' ? 485 : 0,
      co2Production: chpDecision.decision === 'RUN_CHP' ? 2380 : 0,
      heatOutput: chpDecision.decision === 'RUN_CHP' ? 1150 : 0,
      efficiency: 84.2,
      hoursToday: chpDecision.decision === 'RUN_CHP' ? currentHour * 0.8 : 0,
      dailyRevenue: chpDecision.decision === 'RUN_CHP' ? 
        chpDecision.netBenefitPerHour * currentHour * 0.8 : 0
    };

    return NextResponse.json({
      decision: chpDecision,
      marketConditions,
      operations: chpOperations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculating CHP decision:', error);
    return NextResponse.json(
      { error: 'Failed to calculate CHP decision' },
      { status: 500 }
    );
  }
}