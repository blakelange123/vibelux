import { NextRequest, NextResponse } from 'next/server';
import { TwilioService } from '@/lib/communications/twilio-service';

export async function POST(request: NextRequest) {
  try {
    const { to, temperature, humidity, zone } = await request.json();

    if (!to) {
      return NextResponse.json({ 
        error: 'Phone number is required' 
      }, { status: 400 });
    }

    // Initialize Twilio
    const twilioService = new TwilioService({
      region: 'us-east',
      multiRegion: {
        primary: 'us-east',
        fallback: ['us-west'],
        loadBalancing: 'geographic',
      },
      phoneNumbers: {
        sms: [process.env.TWILIO_PHONE_NUMBER!],
      },
    });

    // Format phone number
    const formattedPhone = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

    // Create environmental alert message
    const message = `🌡️ Environmental Alert
Zone: ${zone}
Temp: ${temperature}°F (HIGH)
Humidity: ${humidity}% (LOW)
Action: Adjust HVAC immediately
View: vibelux.com/environment`;

    // Send SMS
    const result = await twilioService.sendSMS({
      to: formattedPhone,
      message,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      details: `Environmental alert sent to ${formattedPhone}`,
    });
  } catch (error: any) {
    console.error('Environmental alert test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send environmental alert',
      details: error.toString(),
    }, { status: 500 });
  }
}