import { NextRequest, NextResponse } from 'next/server';
import { TwilioService } from '@/lib/communications/twilio-service';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json({ 
        error: 'Phone number and message are required' 
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

    // Format phone number (add +1 if needed)
    const formattedPhone = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

    // Send SMS
    const result = await twilioService.sendSMS({
      to: formattedPhone,
      message,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      status: result.status,
      details: `SMS sent successfully to ${formattedPhone}`,
    });
  } catch (error: any) {
    console.error('Twilio SMS test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send SMS',
      details: error.toString(),
    }, { status: 500 });
  }
}