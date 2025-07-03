/**
 * Automation API Endpoints
 * 
 * REST API for managing facility automation and retrieving system status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import MasterAutomationOrchestrator, { 
  AutomationConfig, 
  SystemStatus 
} from '@/services/master-automation-orchestrator';

// Global orchestrator instance
let orchestrator: MasterAutomationOrchestrator | null = null;

function getOrchestrator(): MasterAutomationOrchestrator {
  if (!orchestrator) {
    orchestrator = new MasterAutomationOrchestrator();
  }
  return orchestrator;
}

// GET /api/automation/[facilityId] - Get facility automation status
export async function GET(
  req: NextRequest,
  { params }: { params: { facilityId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const facilityId = params.facilityId;
    const orchestrator = getOrchestrator();

    // Get system status
    const status = await orchestrator.getFacilityStatus(facilityId);
    
    if (!status) {
      return NextResponse.json(
        { error: 'Facility not found or automation not initialized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      facilityId,
      status
    });

  } catch (error) {
    console.error('Error getting automation status:', error);
    return NextResponse.json(
      { error: 'Failed to get automation status' },
      { status: 500 }
    );
  }
}

// POST /api/automation/[facilityId] - Initialize or update automation
export async function POST(
  req: NextRequest,
  { params }: { params: { facilityId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const facilityId = params.facilityId;
    const body = await req.json();
    const { action, config } = body;

    const orchestrator = getOrchestrator();

    switch (action) {
      case 'initialize':
        const automationConfig: AutomationConfig = {
          facilityId,
          cultivarId: config.cultivarId,
          automationLevel: config.automationLevel || 'full',
          constraints: {
            maxPowerConsumption: config.constraints?.maxPowerConsumption || 1000,
            maxDailyInterventions: config.constraints?.maxDailyInterventions || 50,
            environmentalLimits: {
              tempMin: config.constraints?.environmentalLimits?.tempMin || 18,
              tempMax: config.constraints?.environmentalLimits?.tempMax || 30,
              humidityMin: config.constraints?.environmentalLimits?.humidityMin || 40,
              humidityMax: config.constraints?.environmentalLimits?.humidityMax || 80,
              co2Max: config.constraints?.environmentalLimits?.co2Max || 1500,
              vpdMin: config.constraints?.environmentalLimits?.vpdMin || 0.8,
              vpdMax: config.constraints?.environmentalLimits?.vpdMax || 1.4
            },
            spectralLimits: {
              maxDLI: config.constraints?.spectralLimits?.maxDLI || 50,
              maxUVPercent: config.constraints?.spectralLimits?.maxUVPercent || 8,
              minEfficiency: config.constraints?.spectralLimits?.minEfficiency || 2.0
            }
          },
          targets: {
            primary: config.targets?.primary || 'yield',
            yieldTarget: config.targets?.yieldTarget || 15,
            qualityTarget: config.targets?.qualityTarget || 10,
            efficiencyTarget: config.targets?.efficiencyTarget || 2.8,
            costTarget: config.targets?.costTarget || 500
          },
          safety: {
            emergencyShutdownEnabled: config.safety?.emergencyShutdownEnabled ?? true,
            maxConsecutiveFailures: config.safety?.maxConsecutiveFailures || 3,
            userApprovalRequired: config.safety?.userApprovalRequired ?? false,
            criticalParameterLimits: config.safety?.criticalParameterLimits || {}
          }
        };

        await orchestrator.initializeFacilityAutomation(automationConfig);

        return NextResponse.json({
          success: true,
          message: `Automation initialized for facility ${facilityId}`,
          config: automationConfig
        });

      case 'update':
        await orchestrator.updateAutomationConfig(facilityId, config);
        
        return NextResponse.json({
          success: true,
          message: `Automation config updated for facility ${facilityId}`
        });

      case 'pause':
        await orchestrator.pauseAutomation(facilityId);
        
        return NextResponse.json({
          success: true,
          message: `Automation paused for facility ${facilityId}`
        });

      case 'resume':
        await orchestrator.resumeAutomation(facilityId);
        
        return NextResponse.json({
          success: true,
          message: `Automation resumed for facility ${facilityId}`
        });

      case 'emergency_shutdown':
        const reason = config.reason || 'Manual emergency shutdown';
        await orchestrator.emergencyShutdown(facilityId, reason);
        
        return NextResponse.json({
          success: true,
          message: `Emergency shutdown executed for facility ${facilityId}`,
          reason
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in automation API:', error);
    return NextResponse.json(
      { error: 'Automation operation failed', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/automation/[facilityId] - Update automation configuration
export async function PUT(
  req: NextRequest,
  { params }: { params: { facilityId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const facilityId = params.facilityId;
    const config = await req.json();

    const orchestrator = getOrchestrator();
    await orchestrator.updateAutomationConfig(facilityId, config);

    return NextResponse.json({
      success: true,
      message: `Automation configuration updated for facility ${facilityId}`
    });

  } catch (error) {
    console.error('Error updating automation config:', error);
    return NextResponse.json(
      { error: 'Failed to update automation configuration' },
      { status: 500 }
    );
  }
}

// DELETE /api/automation/[facilityId] - Stop and remove automation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { facilityId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const facilityId = params.facilityId;
    const orchestrator = getOrchestrator();

    // Emergency shutdown (which removes automation)
    await orchestrator.emergencyShutdown(facilityId, 'Automation terminated by user');

    return NextResponse.json({
      success: true,
      message: `Automation terminated for facility ${facilityId}`
    });

  } catch (error) {
    console.error('Error terminating automation:', error);
    return NextResponse.json(
      { error: 'Failed to terminate automation' },
      { status: 500 }
    );
  }
}