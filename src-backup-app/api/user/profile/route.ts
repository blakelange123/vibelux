import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        company: true,
        phone: true,
        bio: true,
        website: true,
        timezone: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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

    const data = await request.json();
    const {
      name,
      firstName,
      lastName,
      company,
      phone,
      bio,
      website,
      timezone,
      profileImage
    } = data;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        firstName,
        lastName,
        company,
        phone,
        bio,
        website,
        timezone,
        profileImage,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        company: true,
        phone: true,
        bio: true,
        website: true,
        timezone: true,
        profileImage: true,
        updatedAt: true
      }
    });

    // Log profile update for audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'profile_updated',
        entityType: 'user',
        entityId: userId,
        changes: {
          name,
          firstName,
          lastName,
          company,
          phone,
          bio,
          website,
          timezone
        }
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}