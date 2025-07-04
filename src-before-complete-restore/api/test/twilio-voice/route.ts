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
        voice: [process.env.TWILIO_PHONE_NUMBER!],
      },
    });

    // Format phone number
    const formattedPhone = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

    // Make voice call
    const result = await twilioService.makeVoiceCall({
      to: formattedPhone,
      message,
      from: process.env.TWILIO_PHONE_NUMBER,
      voiceType: 'female',
      language: 'en-US',
    });

    return NextResponse.json({
      success: true,
      callId: result.callId,
      status: result.status,
      details: `Voice call initiated to ${formattedPhone}`,
    });
  } catch (error: any) {
    console.error('Twilio voice test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to make voice call',
      details: error.toString(),
    }, { status: 500 });
  }
}