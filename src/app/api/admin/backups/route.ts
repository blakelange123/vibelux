import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - List backups
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get backup jobs from database
    const backupJobs = await prisma.backupJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ backupJobs });

  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    );
  }
}

// POST - Create backup
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { type, description } = body;

    // Create backup job record
    const backupJob = await prisma.backupJob.create({
      data: {
        type: type || 'MANUAL',
        status: 'PENDING',
        description,
        startedAt: new Date(),
        userId
      }
    });

    // In production, this would trigger an actual backup process
    // For now, we'll simulate success
    setTimeout(async () => {
      await prisma.backupJob.update({
        where: { id: backupJob.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          size: Math.floor(Math.random() * 1000000000), // Random size for demo
          location: 's3://backups/vibelux/' + new Date().toISOString()
        }
      });
    }, 5000);

    return NextResponse.json({ backupJob });

  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}