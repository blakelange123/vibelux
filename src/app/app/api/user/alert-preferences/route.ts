import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences
    const preferences = await prisma.userAlertPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return default preferences
      return NextResponse.json({
        preferences: {},
        globalMethods: ['email', 'inapp'],
        phoneNumber: '',
        email: '',
        timeRule: 'always',
        quietHours: { start: '22:00', end: '06:00' },
      });
    }

    return NextResponse.json(preferences.data);
  } catch (error) {
    console.error('Failed to get alert preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate phone number if SMS is enabled
    if (data.globalMethods?.includes('sms') || data.globalMethods?.includes('call')) {
      if (!data.phoneNumber || !data.phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
        return NextResponse.json({ 
          error: 'Valid phone number required for SMS/call alerts' 
        }, { status: 400 });
      }
    }

    // Validate email if email is enabled
    if (data.globalMethods?.includes('email')) {
      if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return NextResponse.json({ 
          error: 'Valid email required for email alerts' 
        }, { status: 400 });
      }
    }

    // Upsert preferences
    const preferences = await prisma.userAlertPreferences.upsert({
      where: { userId },
      update: { 
        data,
        updatedAt: new Date(),
      },
      create: {
        userId,
        data,
      },
    });

    // Update environment variables for the alert system
    if (data.phoneNumber) {
      await updateUserContactInfo(userId, {
        phone: data.phoneNumber,
        email: data.email,
      });
    }

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error('Failed to save alert preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to update user contact info in the system
async function updateUserContactInfo(userId: string, contact: { phone?: string; email?: string }) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: contact.phone,
        email: contact.email,
      },
    });
  } catch (error) {
    console.error('Failed to update user contact info:', error);
  }
}