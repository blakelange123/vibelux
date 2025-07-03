import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const expert = await prisma.expert.findUnique({
      where: { userId: session.user.id }
    });

    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert profile not found' },
        { status: 404 }
      );
    }

    // Mock settings structure - in production, store in database
    const settings = {
      // Profile settings
      displayName: expert.displayName,
      title: expert.title,
      bio: expert.bio,
      hourlyRate: expert.hourlyRate,
      timezone: expert.timezone,
      linkedinUrl: expert.linkedinUrl || '',
      websiteUrl: expert.websiteUrl || '',
      
      // Availability settings
      availableDays: expert.availableDays,
      availableHours: expert.availableHours,
      bufferTime: expert.bufferTime,
      autoApprove: expert.autoApprove,
      cancellationHours: expert.cancellationHours,
      
      // Notification settings (mock data - store these in database)
      emailNotifications: {
        newBookings: true,
        cancellations: true,
        reviews: true,
        payouts: true,
        marketing: false
      },
      
      // Privacy settings
      profileVisible: expert.status === 'ACTIVE',
      showLastSeen: false,
      allowDirectContact: false,
      
      // Payment settings
      stripeConnected: expert.status === 'ACTIVE',
      payoutSchedule: 'weekly' as const
    };

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Error fetching expert settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      displayName,
      title,
      bio,
      hourlyRate,
      timezone,
      linkedinUrl,
      websiteUrl,
      availableDays,
      availableHours,
      bufferTime,
      autoApprove,
      cancellationHours,
      emailNotifications,
      profileVisible,
      showLastSeen,
      payoutSchedule
    } = body;

    const expert = await prisma.expert.findUnique({
      where: { userId: session.user.id }
    });

    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert profile not found' },
        { status: 404 }
      );
    }

    // Update expert profile
    const updatedExpert = await prisma.expert.update({
      where: { userId: session.user.id },
      data: {
        displayName: displayName || expert.displayName,
        title: title || expert.title,
        bio: bio || expert.bio,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : expert.hourlyRate,
        timezone: timezone || expert.timezone,
        linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : expert.linkedinUrl,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : expert.websiteUrl,
        availableDays: Array.isArray(availableDays) ? availableDays : expert.availableDays,
        availableHours: availableHours || expert.availableHours,
        bufferTime: bufferTime !== undefined ? bufferTime : expert.bufferTime,
        autoApprove: autoApprove !== undefined ? autoApprove : expert.autoApprove,
        cancellationHours: cancellationHours !== undefined ? cancellationHours : expert.cancellationHours,
        // Update status based on profile visibility
        status: profileVisible === false ? 'INACTIVE' : expert.status,
        updatedAt: new Date()
      }
    });

    // In production, also update notification preferences in separate table
    if (emailNotifications) {
      // TODO: Store email preferences in database
      console.log('Email notification preferences updated:', emailNotifications);
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating expert settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}