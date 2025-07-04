import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { TwilioService } from '@/lib/communications/twilio-service';
import { getNotificationService, AlertBuilder } from '@/lib/notifications/notification-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { alertId } = await request.json();
    
    // Get user preferences
    const preferences = await prisma.userAlertPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      return NextResponse.json({ error: 'No alert preferences configured' }, { status: 400 });
    }

    const prefs = preferences.data as any;
    const alertPref = prefs.preferences[alertId];
    
    if (!alertPref || !alertPref.enabled) {
      return NextResponse.json({ error: 'Alert not enabled' }, { status: 400 });
    }

    // Create test alert
    const testAlert = new AlertBuilder()
      .type('info')
      .severity('medium')
      .title('Test Alert')
      .message(`This is a test of the ${alertId} alert. If you receive this, your alerts are working correctly.`)
      .source('alert-test')
      .project('test')
      .metadata({ alertId, test: true })
      .build();

    // Send via configured methods
    const promises = [];

    if (alertPref.methods.includes('sms') && prefs.phoneNumber) {
      const twilioService = new TwilioService({
        region: 'us-east',
        multiRegion: {
          primary: 'us-east',
          fallback: ['us-west'],
          loadBalancing: 'geographic',
        },
      });

      promises.push(
        twilioService.sendSMS({
          to: prefs.phoneNumber,
          message: `VibeLux Test Alert: ${alertId}\nYour alerts are configured correctly. Reply STOP to unsubscribe.`,
        })
      );
    }

    if (alertPref.methods.includes('email') && prefs.email) {
      // Send email notification
      const notificationService = getNotificationService({
        channels: ['email'],
        email: {
          provider: 'sendgrid',
          from: 'alerts@vibelux.com',
          config: {
            apiKey: process.env.SENDGRID_API_KEY,
          },
        },
      });

      promises.push(
        notificationService.sendAlert(testAlert, [userId])
      );
    }

    if (alertPref.methods.includes('call') && prefs.phoneNumber) {
      const twilioService = new TwilioService({
        region: 'us-east',
        multiRegion: {
          primary: 'us-east',
          fallback: ['us-west'],
          loadBalancing: 'geographic',
        },
      });

      promises.push(
        twilioService.makeVoiceCall({
          to: prefs.phoneNumber,
          message: 'This is a test alert from VibeLux. Your voice alerts are configured correctly. Thank you.',
          voiceType: 'female',
        })
      );
    }

    await Promise.allSettled(promises);

    return NextResponse.json({ success: true, message: 'Test alert sent' });
  } catch (error) {
    console.error('Failed to send test alert:', error);
    return NextResponse.json({ error: 'Failed to send test alert' }, { status: 500 });
  }
}