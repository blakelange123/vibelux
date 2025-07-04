import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { energySystemStartup } from '@/services/energy-system-startup';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you'd implement this check)
    // const isAdmin = await checkUserIsAdmin(userId);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    // }

    // Check if system is already running
    const status = energySystemStartup.getStatus();
    if (status.initialized) {
      return NextResponse.json({ 
        message: 'Energy system already running',
        status 
      });
    }

    // Initialize the energy system
    await energySystemStartup.initialize();

    // Log the startup
    await prisma.energy_system_alerts.create({
      data: {
        facility_id: 'system',
        alert_time: new Date(),
        alert_type: 'system',
        severity: 'info',
        title: 'Energy System Started',
        message: `Energy optimization system started by user ${userId}`
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Energy optimization system started successfully',
      status: energySystemStartup.getStatus()
    });

  } catch (error: any) {
    console.error('Failed to start energy system:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start energy system' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const status = energySystemStartup.getStatus();
    
    // Get additional system stats
    const stats = await prisma.energy_system_alerts.aggregate({
      where: {
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      _count: {
        _all: true
      }
    });

    const activeConfigs = await prisma.energy_optimization_config.count({
      where: { optimization_active: true }
    });

    const recentOptimizations = await prisma.optimization_events.count({
      where: {
        event_time: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    });

    return NextResponse.json({
      ...status,
      stats: {
        alertsLast24h: stats._count._all,
        activeConfigs,
        optimizationsLastHour: recentOptimizations
      }
    });

  } catch (error) {
    console.error('Failed to get energy system status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}