// Public API for viewing system changelog
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/changelog - Get public changelog
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const version = searchParams.get('version');
    const type = searchParams.get('type');

    const whereClause: any = {
      // Only show released updates
      releasedAt: { not: null }
    };

    if (version) whereClause.version = version;
    if (type) whereClause.type = type;

    const updates = await prisma.systemUpdate.findMany({
      where: whereClause,
      orderBy: { releasedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        version: true,
        title: true,
        description: true,
        type: true,
        severity: true,
        releasedAt: true,
        features: true,
        // Don't expose internal data like rollout percentage
      }
    });

    const total = await prisma.systemUpdate.count({ where: whereClause });

    // Format the response for public consumption
    const formattedUpdates = updates.map(update => ({
      id: update.id,
      version: update.version,
      title: update.title,
      description: update.description,
      type: update.type,
      severity: update.severity,
      releasedAt: update.releasedAt,
      features: {
        added: update.features?.added || [],
        changed: update.features?.changed || [],
        deprecated: update.features?.deprecated || [],
        removed: update.features?.removed || []
      }
    }));

    return NextResponse.json({
      updates: formattedUpdates,
      total,
      hasMore: offset + limit < total,
      pagination: {
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Changelog fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelog' },
      { status: 500 }
    );
  }
}