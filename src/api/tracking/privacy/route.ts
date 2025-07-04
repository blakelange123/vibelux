import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { PrivacyControlsService } from '@/lib/privacy-controls';
import { validateInput, sanitizeMessageContent } from '@/middleware/security';

// Get user privacy settings
export async function GET(request: NextRequest) {
  try {
    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    const settings = await PrivacyControlsService.getUserPrivacySettings(userId, facilityId);

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Privacy settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    );
  }
}

// Update user privacy settings
export async function PUT(request: NextRequest) {
  try {
    // Validate input
    const validationError = validateInput(request);
    if (validationError) return validationError;

    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { facilityId, ...updates } = body;

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    // Validate boolean fields
    const booleanFields = [
      'locationSharingEnabled',
      'allowRealTimeTracking', 
      'allowHistoricalAccess',
      'shareWithSupervisors',
      'shareWithPeers',
      'anonymizeInReports'
    ];

    for (const field of booleanFields) {
      if (updates[field] !== undefined && typeof updates[field] !== 'boolean') {
        return NextResponse.json(
          { error: `${field} must be a boolean` },
          { status: 400 }
        );
      }
    }

    // Validate retention days
    if (updates.locationRetentionDays !== undefined) {
      const days = parseInt(updates.locationRetentionDays);
      if (isNaN(days) || days < 1 || days > 3650) { // Max 10 years
        return NextResponse.json(
          { error: 'locationRetentionDays must be between 1 and 3650' },
          { status: 400 }
        );
      }
      updates.locationRetentionDays = days;
    }

    const settings = await PrivacyControlsService.updatePrivacySettings(
      userId, 
      facilityId, 
      updates
    );

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Privacy settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}

// Request data deletion (GDPR right to be forgotten)
export async function DELETE(request: NextRequest) {
  try {
    const { isAuthenticated, userId } = await authenticateRequest(request);
    if (!isAuthenticated || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const action = searchParams.get('action'); // 'request' or 'cancel'

    if (!facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
        { status: 400 }
      );
    }

    if (action === 'cancel') {
      await PrivacyControlsService.cancelDataDeletion(userId, facilityId);
      return NextResponse.json({
        success: true,
        message: 'Data deletion request cancelled'
      });
    } else {
      await PrivacyControlsService.requestDataDeletion(userId, facilityId);
      return NextResponse.json({
        success: true,
        message: 'Data deletion requested. Your data will be deleted in 30 days unless you cancel the request.'
      });
    }
  } catch (error) {
    console.error('Data deletion request error:', error);
    return NextResponse.json(
      { error: 'Failed to process deletion request' },
      { status: 500 }
    );
  }
}