import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    // Get user's default facility if none specified
    const facility = facilityId 
      ? await prisma.facility.findFirst({
          where: { id: facilityId, userId }
        })
      : await prisma.facility.findFirst({
          where: { userId }
        });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Return facility settings
    return NextResponse.json({
      success: true,
      settings: {
        // General Settings
        facilityName: facility.name,
        facilityType: facility.type,
        location: `${facility.address}, ${facility.city}, ${facility.state}`,
        timezone: facility.timezone || 'America/Denver',
        currency: facility.currency || 'USD',
        operatingHours: facility.operatingHours || {
          start: '06:00',
          end: '22:00'
        },
        
        // Operations Settings
        defaultLightCycle: facility.settings?.defaultLightCycle || '18/6',
        temperatureUnit: facility.settings?.temperatureUnit || 'fahrenheit',
        autoHarvest: facility.settings?.autoHarvest || true,
        autoIrrigation: facility.settings?.autoIrrigation || true,
        yieldTracking: facility.settings?.yieldTracking || true,
        qualityControl: facility.settings?.qualityControl || true,
        
        // Notifications
        emailAlerts: facility.settings?.notifications?.emailAlerts !== false,
        smsAlerts: facility.settings?.notifications?.smsAlerts || false,
        systemMaintenance: facility.settings?.notifications?.systemMaintenance !== false,
        harvestReminders: facility.settings?.notifications?.harvestReminders !== false,
        environmentalAlerts: facility.settings?.notifications?.environmentalAlerts !== false,
        equipmentFailure: facility.settings?.notifications?.equipmentFailure !== false,
        
        // Security
        twoFactor: facility.settings?.security?.twoFactor !== false,
        sessionTimeout: facility.settings?.security?.sessionTimeout || 30,
        ipWhitelist: facility.settings?.security?.ipWhitelist || '',
        auditLogging: facility.settings?.security?.auditLogging !== false,
        
        // Integration
        scadaEnabled: facility.settings?.integration?.scadaEnabled || false,
        apiAccess: facility.settings?.integration?.apiAccess !== false,
        webhookURL: facility.settings?.integration?.webhookURL || '',
        apiKey: facility.apiKey
      }
    });
  } catch (error) {
    console.error('Error fetching facility settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await request.json();
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    // Get user's default facility if none specified
    const facility = facilityId 
      ? await prisma.facility.findFirst({
          where: { id: facilityId, userId }
        })
      : await prisma.facility.findFirst({
          where: { userId }
        });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Extract location components
    const locationParts = settings.location?.split(', ') || [];
    const [address = '', city = '', state = ''] = locationParts;

    // Update facility settings
    const updatedFacility = await prisma.facility.update({
      where: { id: facility.id },
      data: {
        name: settings.facilityName,
        type: settings.facilityType,
        address,
        city,
        state,
        timezone: settings.timezone,
        currency: settings.currency,
        operatingHours: settings.operatingHours,
        settings: {
          // Operations
          defaultLightCycle: settings.defaultLightCycle,
          temperatureUnit: settings.temperatureUnit,
          autoHarvest: settings.autoHarvest,
          autoIrrigation: settings.autoIrrigation,
          yieldTracking: settings.yieldTracking,
          qualityControl: settings.qualityControl,
          
          // Notifications
          notifications: {
            emailAlerts: settings.emailAlerts,
            smsAlerts: settings.smsAlerts,
            systemMaintenance: settings.systemMaintenance,
            harvestReminders: settings.harvestReminders,
            environmentalAlerts: settings.environmentalAlerts,
            equipmentFailure: settings.equipmentFailure
          },
          
          // Security
          security: {
            twoFactor: settings.twoFactor,
            sessionTimeout: settings.sessionTimeout,
            ipWhitelist: settings.ipWhitelist,
            auditLogging: settings.auditLogging
          },
          
          // Integration
          integration: {
            scadaEnabled: settings.scadaEnabled,
            apiAccess: settings.apiAccess,
            webhookURL: settings.webhookURL
          }
        },
        updatedAt: new Date()
      }
    });

    // Log settings change for audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'facility_settings_updated',
        entityType: 'facility',
        entityId: facility.id,
        changes: {
          before: facility.settings,
          after: updatedFacility.settings
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating facility settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}