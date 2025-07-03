import { NextRequest, NextResponse } from 'next/server';
import { TwilioService } from '@/lib/communications/twilio-service';

export async function POST(request: NextRequest) {
  try {
    const { to, stressLevel, zone, nutrients } = await request.json();

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

    // Create plant stress alert message
    const deficientNutrients = Object.entries(nutrients || {})
      .filter(([_, level]) => level > 10)
      .map(([nutrient, level]) => `${nutrient}(${level}%)`)
      .join(', ');

    const message = `🌱 Plant Stress Alert
Zone: ${zone}
Stress Level: ${stressLevel}%
Deficiencies: ${deficientNutrients || 'None'}
Action: Check nutrients & environment
View: vibelux.com/plants`;

    // Send SMS
    const result = await twilioService.sendSMS({
      to: formattedPhone,
      message,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      details: `Plant stress alert sent to ${formattedPhone}`,
    });
  } catch (error: any) {
    console.error('Plant stress alert test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send plant stress alert',
      details: error.toString(),
    }, { status: 500 });
  }
}