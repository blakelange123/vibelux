import { NextRequest, NextResponse } from 'next/server';
import { compliancePhotoService } from '@/lib/vision/agricultural-reference-service';

// Manual Count Assistant - Helps with human counting only
// NO automated counting or plant tracking
export async function POST(request: NextRequest) {
  try {
    const { 
      imageUrl,
      facilityId,
      roomId,
      countedBy
    } = await request.json();

    if (!imageUrl || !countedBy) {
      return NextResponse.json(
        { error: 'Image URL and counter name are required' },
        { status: 400 }
      );
    }

    // Get manual counting template
    const countingAssistance = await compliancePhotoService.assistManualCount(imageUrl);
    
    // Document the photo for compliance
    const documentation = await compliancePhotoService.documentForCompliance(
      imageUrl,
      {
        location: roomId,
        purpose: 'inspection',
        description: 'Manual plant count documentation',
        takenBy: countedBy
      }
    );

    // Generate response with counting worksheet
    const response = {
      success: true,
      
      // Documentation record
      documentation: {
        recordId: documentation.recordId,
        timestamp: documentation.timestamp,
        imageStored: true
      },
      
      // Manual counting worksheet
      countingWorksheet: {
        ...countingAssistance.template,
        facilityId,
        roomId,
        countedBy,
        imageRecordId: documentation.recordId
      },
      
      // Instructions for manual counting
      instructions: [
        ...countingAssistance.instructions,
        'Print or save this worksheet',
        'Count plants visible in the image',
        'Have a second person verify the count',
        'File completed worksheet with compliance records'
      ],
      
      // Compliance reminders
      complianceNotes: [
        'Manual count must be verified by a second person',
        'Keep completed worksheets for inspection',
        'Update inventory system with final counts',
        'This is NOT an automated counting system'
      ],
      
      // Legal disclaimer
      disclaimer: 'This tool provides a worksheet for manual counting only. All counts must be performed and verified by authorized personnel. This is not an automated plant tracking or counting system.'
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Manual count assist error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate counting worksheet', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}