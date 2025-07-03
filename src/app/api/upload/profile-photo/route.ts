import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('photo') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const extension = file.name.split('.').pop();
    const filename = `${hash}.${extension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profile-photos');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    // Save file
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Update user's expert profile photo URL
    const photoUrl = `/uploads/profile-photos/${filename}`;
    
    await prisma.expert.update({
      where: { userId: session.user.id },
      data: { photoUrl }
    });

    return NextResponse.json({
      success: true,
      photoUrl
    });

  } catch (error) {
    console.error('Error uploading profile photo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Remove photo URL from expert profile
    await prisma.expert.update({
      where: { userId: session.user.id },
      data: { photoUrl: null }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile photo removed'
    });

  } catch (error) {
    console.error('Error removing profile photo:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove photo' },
      { status: 500 }
    );
  }
}