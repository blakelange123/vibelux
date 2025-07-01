import { NextRequest, NextResponse } from 'next/server';
import { googleVisionService } from '@/lib/vision/google-vision-service';

export async function POST(request: NextRequest) {
  try {
    const { 
      imageUrl, 
      imageBase64, 
      facilityId, 
      roomId,
      complianceType = 'state', // state, metrc, etc.
      includeAnnotations = true 
    } = await request.json();

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Either imageUrl or imageBase64 is required' },
        { status: 400 }
      );
    }

    // Use Google Vision to count plants
    const countResult = await googleVisionService.countPlantsForCompliance(
      imageUrl || Buffer.from(imageBase64, 'base64')
    );

    // Generate compliance report
    const complianceReport = {
      ...countResult,
      facilityId,
      roomId,
      timestamp: new Date(),
      
      // Compliance-specific data
      compliance: {
        type: complianceType,
        plantLimit: getPlantLimitForRoom(roomId, complianceType),
        isCompliant: countResult.totalPlants <= getPlantLimitForRoom(roomId, complianceType),
        
        // Tag requirements
        tagsRequired: countResult.totalPlants,
        tagsByStage: {
          immature: countResult.plantsByStage.seedling + countResult.plantsByStage.vegetative,
          mature: countResult.plantsByStage.flowering
        },
        
        // Reporting requirements
        reportingCategory: determineReportingCategory(countResult.plantsByStage),
        
        // Canopy coverage for states that regulate by canopy
        estimatedCanopyArea: calculateCanopyArea(countResult.boundingBoxes)
      },
      
      // Verification data
      verification: {
        method: 'AI Vision Analysis',
        confidence: countResult.confidence,
        requiresManualVerification: countResult.confidence < 0.85,
        auditTrail: {
          analyzedBy: 'Google Vision API',
          timestamp: new Date(),
          imageHash: generateImageHash(imageUrl || imageBase64)
        }
      },
      
      // Annotated image data if requested
      annotations: includeAnnotations ? {
        boundingBoxes: countResult.boundingBoxes,
        overlayInstructions: generateOverlayInstructions(countResult.boundingBoxes)
      } : undefined,
      
      // Alerts and actions
      alerts: generateComplianceAlerts(countResult, roomId, complianceType),
      recommendedActions: generateComplianceActions(countResult, roomId, complianceType)
    };

    // Log for compliance tracking
    await logComplianceCount(complianceReport);

    return NextResponse.json(complianceReport);

  } catch (error: any) {
    console.error('Compliance counting error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to count plants for compliance', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function getPlantLimitForRoom(roomId: string, complianceType: string): number {
  // This would normally fetch from database based on license type and room designation
  const limits: Record<string, number> = {
    'state': 100,    // Example state limit
    'metrc': 100,    // METRC tracking limit
    'local': 50      // Local ordinance limit
  };
  
  return limits[complianceType] || 100;
}

function determineReportingCategory(plantsByStage: any): string {
  const immature = plantsByStage.seedling + plantsByStage.vegetative;
  const mature = plantsByStage.flowering;
  
  if (mature > immature) {
    return 'Flowering-Heavy Operation';
  } else if (immature > mature * 2) {
    return 'Propagation-Focused Operation';
  } else {
    return 'Balanced Cultivation Operation';
  }
}

function calculateCanopyArea(boundingBoxes: any[]): number {
  // Estimate total canopy area from bounding boxes
  // This is a simplified calculation - in practice would need calibration
  const totalArea = boundingBoxes.reduce((sum, box) => {
    return sum + (box.width * box.height);
  }, 0);
  
  // Convert to square feet (assuming calibrated camera height)
  return Math.round(totalArea * 100); // Placeholder conversion factor
}

function generateOverlayInstructions(boundingBoxes: any[]): any {
  return boundingBoxes.map((box, index) => ({
    id: `plant-${index + 1}`,
    type: 'rectangle',
    coordinates: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height
    },
    style: {
      color: box.stage === 'flowering' ? '#ff6b6b' : 
             box.stage === 'vegetative' ? '#51cf66' : '#ffd43b',
      strokeWidth: 2,
      label: `${box.stage.toUpperCase()} #${index + 1}`
    }
  }));
}

function generateComplianceAlerts(countResult: any, roomId: string, complianceType: string): string[] {
  const alerts: string[] = [];
  const limit = getPlantLimitForRoom(roomId, complianceType);
  
  if (countResult.totalPlants > limit) {
    alerts.push(`OVER LIMIT: ${countResult.totalPlants} plants exceed ${complianceType} limit of ${limit}`);
  }
  
  if (countResult.totalPlants > limit * 0.9) {
    alerts.push(`WARNING: At ${Math.round((countResult.totalPlants / limit) * 100)}% of plant limit`);
  }
  
  if (countResult.confidence < 0.8) {
    alerts.push('LOW CONFIDENCE: Manual verification required');
  }
  
  if (countResult.plantsByStage.flowering > limit * 0.5) {
    alerts.push('HIGH FLOWERING COUNT: May impact harvest scheduling compliance');
  }
  
  return alerts;
}

function generateComplianceActions(countResult: any, roomId: string, complianceType: string): string[] {
  const actions: string[] = [];
  const limit = getPlantLimitForRoom(roomId, complianceType);
  
  if (countResult.totalPlants > limit) {
    actions.push(`Remove ${countResult.totalPlants - limit} plants to achieve compliance`);
    actions.push('Document plant destruction per regulations');
  }
  
  if (countResult.confidence < 0.85) {
    actions.push('Perform manual count verification');
    actions.push('Improve lighting or camera angle for better accuracy');
  }
  
  // Tag-related actions
  actions.push(`Ensure ${countResult.totalPlants} RFID/barcode tags are applied`);
  
  if (countResult.plantsByStage.seedling > 0) {
    actions.push(`Apply ${countResult.plantsByStage.seedling} immature plant tags`);
  }
  
  if (countResult.plantsByStage.flowering > 0) {
    actions.push(`Verify ${countResult.plantsByStage.flowering} flowering plants have mature tags`);
  }
  
  // Reporting actions
  actions.push('Update inventory tracking system with current count');
  actions.push('Submit compliance report if required');
  
  return actions;
}

function generateImageHash(imageData: string): string {
  // Simple hash for audit trail - in production use crypto
  return Buffer.from(imageData.substring(0, 100)).toString('base64').substring(0, 16);
}

async function logComplianceCount(report: any): Promise<void> {
  // Log to database for compliance records
  try {
    await fetch('/api/compliance/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId: report.facilityId,
        roomId: report.roomId,
        count: report.totalPlants,
        breakdown: report.plantsByStage,
        confidence: report.confidence,
        timestamp: report.timestamp,
        complianceType: report.compliance.type,
        isCompliant: report.compliance.isCompliant
      })
    });
  } catch (error) {
    console.error('Failed to log compliance count:', error);
  }
}