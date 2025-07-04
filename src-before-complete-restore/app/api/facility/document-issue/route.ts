import { NextRequest, NextResponse } from 'next/server';
import { agriculturalReferenceService, compliancePhotoService } from '@/lib/vision/agricultural-reference-service';

// Document Issue - For compliance documentation only
// NOT automated monitoring or plant tracking
export async function POST(request: NextRequest) {
  try {
    const {
      photoUrl,
      facilityId,
      roomZone,
      location,
      reportedBy,
      issueDescription,
      category // 'pest-sighting', 'maintenance', 'safety', 'other'
    } = await request.json();

    if (!photoUrl || !issueDescription) {
      return NextResponse.json(
        { error: 'Photo URL and issue description are required' },
        { status: 400 }
      );
    }

    // Document the issue for compliance records
    const documentationResult = await compliancePhotoService.documentForCompliance(
      photoUrl,
      {
        location: `${roomZone} - ${location.latitude}, ${location.longitude}`,
        purpose: category === 'pest-sighting' ? 'incident' : 
                 category === 'maintenance' ? 'maintenance' : 'inspection',
        description: issueDescription,
        takenBy: reportedBy
      }
    );

    // If it's a pest sighting, provide educational resources
    let educationalInfo = null;
    if (category === 'pest-sighting') {
      educationalInfo = await agriculturalReferenceService.lookupSymptoms(
        photoUrl,
        issueDescription
      );
    }

    // Generate compliance-focused response
    const response = {
      success: true,
      documentation: {
        recordId: documentationResult.recordId,
        timestamp: documentationResult.timestamp,
        category,
        location: roomZone,
        reportedBy,
        description: issueDescription
      },
      
      // Required actions for compliance
      requiredActions: generateComplianceActions(category),
      
      // Educational resources if applicable
      educationalResources: educationalInfo,
      
      // Compliance reminders
      complianceNotes: [
        'This issue has been documented for compliance records',
        'Ensure follow-up actions are completed within regulatory timeframes',
        category === 'pest-sighting' ? 
          'Contact licensed pest control operator if treatment is needed' : 
          'Schedule maintenance or corrective action as appropriate'
      ],
      
      // NO automated analysis or plant tracking
      disclaimer: 'This documentation is for compliance purposes only. It does not constitute automated monitoring or plant tracking.'
    };

    // Log for compliance
    console.log(`Issue documented:`, {
      facilityId,
      category,
      recordId: documentationResult.recordId,
      timestamp: new Date()
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Documentation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to document issue', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function generateComplianceActions(category: string): string[] {
  const actions: string[] = [];
  
  switch (category) {
    case 'pest-sighting':
      actions.push('Document in pest sighting log');
      actions.push('Notify facility manager');
      actions.push('Consider scheduling professional inspection');
      actions.push('Review IPM protocols');
      break;
      
    case 'maintenance':
      actions.push('Create maintenance work order');
      actions.push('Document in maintenance log');
      actions.push('Schedule repair if needed');
      break;
      
    case 'safety':
      actions.push('Address immediately if critical');
      actions.push('Document in safety log');
      actions.push('Notify safety officer');
      break;
      
    default:
      actions.push('Document in facility log');
      actions.push('Review with management');
  }
  
  return actions;
}