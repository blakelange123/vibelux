import { NextRequest, NextResponse } from 'next/server';
import { TwilioService } from '@/lib/communications/twilio-service';

export async function POST(request: NextRequest) {
  try {
    const { to, alertType, zone, co2Level } = await request.json();

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

    // Create critical alert message
    const message = `🚨 CRITICAL ALERT
CO2: ${co2Level}ppm in ${zone}
EVACUATE IMMEDIATELY!
Ventilation activated.
View: vibelux.com/alerts`;

    // Send SMS
    const smsResult = await twilioService.sendSMS({
      to: formattedPhone,
      message,
      from: process.env.TWILIO_PHONE_NUMBER,
      priority: 'high',
    });

    // For critical alerts, also make a voice call
    const voiceMessage = `
      This is a critical alert from VibeLux.
      Dangerous CO2 levels detected at ${co2Level} parts per million in ${zone}.
      Please evacuate the area immediately.
      I repeat, evacuate ${zone} immediately.
    `;

    const voiceResult = await twilioService.makeVoiceCall({
      to: formattedPhone,
      message: voiceMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      voiceType: 'female',
    });

    return NextResponse.json({
      success: true,
      smsId: smsResult.messageId,
      callId: voiceResult.callId,
      details: `Critical alert sent via SMS and voice call to ${formattedPhone}`,
    });
  } catch (error: any) {
    console.error('Critical alert test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send critical alert',
      details: error.toString(),
    }, { status: 500 });
  }
}