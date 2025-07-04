/**
 * Automation Status API
 * 
 * Get status for all facilities or system-wide automation metrics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import MasterAutomationOrchestrator from '@/services/master-automation-orchestrator';

// Global orchestrator instance
let orchestrator: MasterAutomationOrchestrator | null = null;

function getOrchestrator(): MasterAutomationOrchestrator {
  if (!orchestrator) {
    orchestrator = new MasterAutomationOrchestrator();
  }
  return orchestrator;
}

// GET /api/automation/status - Get all facility statuses
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orchestrator = getOrchestrator();
    const allStatuses = await orchestrator.getAllFacilityStatuses();

    // Calculate system-wide metrics
    const systemMetrics = calculateSystemWideMetrics(allStatuses);

    return NextResponse.json({
      success: true,
      totalFacilities: allStatuses.length,
      systemMetrics,
      facilities: allStatuses
    });

  } catch (error) {
    console.error('Error getting automation status:', error);
    return NextResponse.json(
      { error: 'Failed to get automation status' },
      { status: 500 }
    );
  }
}

function calculateSystemWideMetrics(statuses: any[]) {
  if (statuses.length === 0) {
    return {
      averageHealth: 'unknown',
      totalAlerts: 0,
      criticalAlerts: 0,
      averageEfficiency: 0,
      totalEnergySavings: 0,
      averageROI: 0,
      automationCoverage: 0
    };
  }

  const healthScores = statuses.map(s => {
    switch (s.overallHealth) {
      case 'excellent': return 100;
      case 'good': return 80;
      case 'fair': return 60;
      case 'poor': return 40;
      case 'critical': return 20;
      default: return 0;
    }
  });

  const averageHealthScore = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
  
  let averageHealth = 'unknown';
  if (averageHealthScore >= 90) averageHealth = 'excellent';
  else if (averageHealthScore >= 70) averageHealth = 'good';
  else if (averageHealthScore >= 50) averageHealth = 'fair';
  else if (averageHealthScore >= 30) averageHealth = 'poor';
  else averageHealth = 'critical';

  const totalAlerts = statuses.reduce((sum, s) => sum + s.alerts.length, 0);
  const criticalAlerts = statuses.reduce((sum, s) => 
    sum + s.alerts.filter((a: any) => a.severity === 'critical').length, 0
  );

  const averageEfficiency = statuses.reduce((sum, s) => 
    sum + s.performance.energyEfficiency, 0
  ) / statuses.length;

  const totalEnergySavings = statuses.reduce((sum, s) => 
    sum + s.subsystems.energyTracking.todaysSavings, 0
  );

  const averageROI = statuses.reduce((sum, s) => 
    sum + s.performance.roi, 0
  ) / statuses.length;

  const fullyAutomated = statuses.filter(s => s.automation.level === 'full').length;
  const automationCoverage = (fullyAutomated / statuses.length) * 100;

  return {
    averageHealth,
    totalAlerts,
    criticalAlerts,
    averageEfficiency: Math.round(averageEfficiency * 10) / 10,
    totalEnergySavings: Math.round(totalEnergySavings * 10) / 10,
    averageROI: Math.round(averageROI * 10) / 10,
    automationCoverage: Math.round(automationCoverage * 10) / 10
  };
}