import { NextRequest, NextResponse } from 'next/server';
import { TwilioService } from '@/lib/communications/twilio-service';

export async function POST(request: NextRequest) {
  try {
    const { to, ph, ec, zone } = await request.json();

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

    // Create hydroponic alert message
    const message = `💧 Hydroponic Alert
System: ${zone}
pH: ${ph} (HIGH - Target: 5.8-6.2)
EC: ${ec} mS/cm (HIGH)
Action: Adjust nutrient solution
View: vibelux.com/hydro`;

    // Send SMS
    const result = await twilioService.sendSMS({
      to: formattedPhone,
      message,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      details: `Hydroponic alert sent to ${formattedPhone}`,
    });
  } catch (error: any) {
    console.error('Hydroponic alert test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send hydroponic alert',
      details: error.toString(),
    }, { status: 500 });
  }
}