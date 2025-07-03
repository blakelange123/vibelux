// Mobile Alerts API
// Manages alerts and notifications for mobile app

import { NextRequest, NextResponse } from 'next/server';
import { verifyMobileToken } from '@/lib/mobile-auth';

// Get alerts
export async function GET(request: NextRequest) {
  try {
    const user = await verifyMobileToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'active';
    const roomId = searchParams.get('roomId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Mock alerts data
    const alerts = [
      {
        id: 'alert_1',
        type: 'critical',
        severity: 'high',
        title: 'High Temperature Alert',
        message: 'Temperature in Flower Room A exceeded 85°F',
        roomId: 'room_1',
        roomName: 'Flower Room A',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        status: 'active',
        acknowledged: false,
        data: {
          parameter: 'temperature',
          value: 87.5,
          threshold: 85,
          unit: '°F'
        }
      },
      {
        id: 'alert_2',
        type: 'warning',
        severity: 'medium',
        title: 'Low Humidity Warning',
        message: 'Humidity in Veg Room dropped below 40%',
        roomId: 'room_3',
        roomName: 'Veg Room',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'active',
        acknowledged: false,
        data: {
          parameter: 'humidity',
          value: 38,
          threshold: 40,
          unit: '%'
        }
      },
      {
        id: 'alert_3',
        type: 'info',
        severity: 'low',
        title: 'CO₂ Levels Optimized',
        message: 'CO₂ supplementation maintaining target levels',
        roomId: 'room_1',
        roomName: 'Flower Room A',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        status: 'resolved',
        acknowledged: true,
        data: {
          parameter: 'co2',
          value: 1200,
          target: 1200,
          unit: 'ppm'
        }
      }
    ];

    // Apply filters
    let filteredAlerts = alerts;
    
    if (filter === 'active') {
      filteredAlerts = alerts.filter(a => a.status === 'active');
    } else if (filter === 'unacknowledged') {
      filteredAlerts = alerts.filter(a => !a.acknowledged);
    }
    
    if (roomId) {
      filteredAlerts = filteredAlerts.filter(a => a.roomId === roomId);
    }

    // Apply pagination
    const paginatedAlerts = filteredAlerts.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        alerts: paginatedAlerts,
        total: filteredAlerts.length,
        limit,
        offset,
        hasMore: offset + limit < filteredAlerts.length
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load alerts' },
      { status: 500 }
    );
  }
}

// Acknowledge alert
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyMobileToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { alertId, action, notes } = body;

    if (!alertId || !action) {
      return NextResponse.json(
        { success: false, error: 'Alert ID and action required' },
        { status: 400 }
      );
    }

    // Process action
    const result = {
      alertId,
      action,
      timestamp: new Date(),
      userId: user.userId,
      notes
    };

    if (action === 'acknowledge') {
      return NextResponse.json({
        success: true,
        data: {
          ...result,
          message: 'Alert acknowledged successfully'
        }
      });
    } else if (action === 'resolve') {
      return NextResponse.json({
        success: true,
        data: {
          ...result,
          message: 'Alert resolved successfully'
        }
      });
    } else if (action === 'snooze') {
      return NextResponse.json({
        success: true,
        data: {
          ...result,
          snoozedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          message: 'Alert snoozed for 30 minutes'
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update alert error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

// Delete/dismiss alert
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyMobileToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'Alert ID required' },
        { status: 400 }
      );
    }

    // Log dismissal

    return NextResponse.json({
      success: true,
      message: 'Alert dismissed successfully'
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to dismiss alert' },
      { status: 500 }
    );
  }
}