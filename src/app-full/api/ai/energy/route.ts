import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { claudeAI } from '@/lib/ai/claude-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.currentUsage || !data.utilityRates) {
      return NextResponse.json(
        { error: 'Missing required energy data' },
        { status: 400 }
      );
    }

    // Get AI optimization analysis
    const analysis = await claudeAI.optimizeEnergyUsage({
      currentUsage: data.currentUsage,
      historicalData: data.historicalData || {},
      facilityLayout: data.facilityLayout || {},
      equipmentList: data.equipmentList || [],
      utilityRates: data.utilityRates
    });

    // Calculate potential savings
    const potentialSavings = calculatePotentialSavings(data.currentUsage, analysis.recommendations);

    return NextResponse.json({
      success: true,
      analysis: analysis.analysis,
      recommendations: analysis.recommendations,
      confidence: analysis.confidence,
      potentialSavings,
      insights: {
        ...analysis.insights,
        estimatedROI: potentialSavings.roi,
        paybackPeriod: potentialSavings.paybackMonths
      },
      nextSteps: analysis.nextSteps,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in AI energy optimization:', error);
    
    return NextResponse.json(
      { error: 'Failed to optimize energy usage' },
      { status: 500 }
    );
  }
}

function calculatePotentialSavings(currentUsage: any, recommendations: string[] = []): any {
  // Calculate actual savings based on equipment specifications and optimization strategies
  let totalMonthlySavings = 0;
  let totalImplementationCost = 0;
  
  // Parse recommendations to calculate specific savings
  const savingsBreakdown: Record<string, { savings: number; cost: number }> = {};
  
  recommendations.forEach(recommendation => {
    const lowerRec = recommendation.toLowerCase();
    
    if (lowerRec.includes('lighting') || lowerRec.includes('led')) {
      // LED retrofit savings: ~50-70% of lighting load
      const lightingLoad = currentUsage.equipmentBreakdown?.lighting || currentUsage.monthlyKwh * 0.3;
      const lightingSavings = lightingLoad * 0.6 * currentUsage.avgRate;
      const lightingCost = 150 * (currentUsage.squareFootage || 10000) / 1000; // $150 per 1000 sq ft
      
      savingsBreakdown['lighting'] = { savings: lightingSavings, cost: lightingCost };
      totalMonthlySavings += lightingSavings;
      totalImplementationCost += lightingCost;
    }
    
    if (lowerRec.includes('hvac') || lowerRec.includes('temperature') || lowerRec.includes('schedule')) {
      // HVAC optimization: ~15-25% of HVAC load
      const hvacLoad = currentUsage.equipmentBreakdown?.hvac || currentUsage.monthlyKwh * 0.4;
      const hvacSavings = hvacLoad * 0.2 * currentUsage.avgRate;
      const hvacCost = currentUsage.hvacTons ? currentUsage.hvacTons * 500 : 5000; // $500 per ton
      
      savingsBreakdown['hvac'] = { savings: hvacSavings, cost: hvacCost };
      totalMonthlySavings += hvacSavings;
      totalImplementationCost += hvacCost;
    }
    
    if (lowerRec.includes('vfd') || lowerRec.includes('variable') || lowerRec.includes('pump')) {
      // VFD installation: ~30-50% of motor load
      const motorLoad = currentUsage.equipmentBreakdown?.motors || currentUsage.monthlyKwh * 0.15;
      const vfdSavings = motorLoad * 0.4 * currentUsage.avgRate;
      const vfdCost = (currentUsage.motorHp || 50) * 200; // $200 per HP
      
      savingsBreakdown['vfd'] = { savings: vfdSavings, cost: vfdCost };
      totalMonthlySavings += vfdSavings;
      totalImplementationCost += vfdCost;
    }
    
    if (lowerRec.includes('solar') || lowerRec.includes('renewable')) {
      // Solar installation: offset 30-80% of load
      const solarGeneration = (currentUsage.roofArea || 5000) * 0.15 * 150; // 150W/m2, 15% efficiency
      const solarOffset = Math.min(solarGeneration, currentUsage.monthlyKwh * 0.5);
      const solarSavings = solarOffset * currentUsage.avgRate;
      const solarCost = solarGeneration * 3; // $3 per watt installed
      
      savingsBreakdown['solar'] = { savings: solarSavings, cost: solarCost };
      totalMonthlySavings += solarSavings;
      totalImplementationCost += solarCost;
    }
    
    if (lowerRec.includes('power factor') || lowerRec.includes('capacitor')) {
      // Power factor correction: reduce demand charges
      const demandChargeSavings = (currentUsage.peakDemand || 100) * (currentUsage.demandRate || 15) * 0.1;
      const pfCost = (currentUsage.peakDemand || 100) * 50; // $50 per kW
      
      savingsBreakdown['powerFactor'] = { savings: demandChargeSavings, cost: pfCost };
      totalMonthlySavings += demandChargeSavings;
      totalImplementationCost += pfCost;
    }
    
    if (lowerRec.includes('insulation') || lowerRec.includes('envelope')) {
      // Building envelope improvements: ~10-20% of HVAC load
      const envelopeImpact = (currentUsage.equipmentBreakdown?.hvac || currentUsage.monthlyKwh * 0.4) * 0.15;
      const envelopeSavings = envelopeImpact * currentUsage.avgRate;
      const envelopeCost = (currentUsage.squareFootage || 10000) * 2; // $2 per sq ft
      
      savingsBreakdown['envelope'] = { savings: envelopeSavings, cost: envelopeCost };
      totalMonthlySavings += envelopeSavings;
      totalImplementationCost += envelopeCost;
    }
  });
  
  // If no specific recommendations matched, use conservative estimates
  if (totalMonthlySavings === 0 && recommendations.length > 0) {
    const currentCost = currentUsage.monthlyKwh * currentUsage.avgRate;
    // Conservative 5-15% savings per recommendation type
    totalMonthlySavings = currentCost * Math.min(0.25, recommendations.length * 0.08);
    totalImplementationCost = currentUsage.monthlyKwh * 0.5 * recommendations.length; // $0.50 per kWh capacity
  }
  
  // Calculate financial metrics
  const annualSavings = totalMonthlySavings * 12;
  const roi = totalImplementationCost > 0 ? (annualSavings / totalImplementationCost) * 100 : 0;
  const paybackMonths = totalMonthlySavings > 0 ? Math.ceil(totalImplementationCost / totalMonthlySavings) : 999;
  
  // Apply utility incentives if available
  const incentiveRate = currentUsage.utilityIncentives || 0.3; // 30% typical rebate
  const netImplementationCost = totalImplementationCost * (1 - incentiveRate);
  const adjustedPayback = totalMonthlySavings > 0 ? Math.ceil(netImplementationCost / totalMonthlySavings) : 999;
  
  return {
    monthlySavings: Math.round(totalMonthlySavings * 100) / 100,
    annualSavings: Math.round(annualSavings * 100) / 100,
    implementationCost: Math.round(totalImplementationCost * 100) / 100,
    netImplementationCost: Math.round(netImplementationCost * 100) / 100,
    roi: Math.round(roi * 10) / 10,
    paybackMonths: paybackMonths,
    adjustedPaybackMonths: adjustedPayback,
    savingsBreakdown,
    savingsPercentage: currentUsage.monthlyKwh > 0 ? 
      Math.round((totalMonthlySavings / (currentUsage.monthlyKwh * currentUsage.avgRate)) * 1000) / 10 : 0
  };
}