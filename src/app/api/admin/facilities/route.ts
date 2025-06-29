// Admin API for viewing all customer facility data
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { timeseriesDB } from '@/lib/database/timeseries';
import { documentDB } from '@/lib/database/mongodb';

// GET /api/admin/facilities - Get all facilities for admin view
export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticateRequest(request);
    
    // Only admins can access this endpoint
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || 'all';
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // In production, query from PostgreSQL with Prisma
    const facilities = await getAllFacilities();

    // Apply filters
    let filteredFacilities = facilities.filter(facility => {
      const matchesSearch = search === '' || 
        facility.name.toLowerCase().includes(search.toLowerCase()) ||
        facility.address.toLowerCase().includes(search.toLowerCase());
      
      const matchesPlan = plan === 'all' || facility.subscription.plan === plan;
      
      const matchesStatus = status === 'all' || 
        (status === 'active' && facility.isActive) ||
        (status === 'inactive' && !facility.isActive);
      
      return matchesSearch && matchesPlan && matchesStatus;
    });

    // Get recent activity and metrics for each facility
    const facilitiesWithMetrics = await Promise.all(
      filteredFacilities.slice(offset, offset + limit).map(async (facility) => {
        const metrics = await getFacilityMetrics(facility.id);
        const recentActivity = await getRecentActivity(facility.id);
        const alerts = await getActiveAlerts(facility.id);
        
        return {
          ...facility,
          metrics,
          recentActivity,
          alerts
        };
      })
    );

    return NextResponse.json({
      facilities: facilitiesWithMetrics,
      total: filteredFacilities.length,
      hasMore: offset + limit < filteredFacilities.length,
      summary: {
        totalFacilities: facilities.length,
        activeFacilities: facilities.filter(f => f.isActive).length,
        planDistribution: getPlanDistribution(facilities),
        totalUsers: facilities.reduce((sum, f) => sum + f.metrics.activeUsers, 0),
        totalReports: facilities.reduce((sum, f) => sum + f.metrics.totalReports, 0)
      }
    });

  } catch (error) {
    console.error('Admin facilities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facilities data' },
      { status: 500 }
    );
  }
}

async function getAllFacilities() {
  // Mock data - in production, query from PostgreSQL
  return [
    {
      id: 'facility-1',
      name: 'Green Valley Greenhouse',
      type: 'greenhouse',
      address: '123 Farm Road, California, USA',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      isActive: true,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      createdAt: new Date('2023-06-15'),
      subscription: {
        plan: 'professional',
        features: ['visual_ops', 'ipm_scouting', 'harvest_tracking', 'analytics'],
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        monthlyRevenue: 69
      },
      contactInfo: {
        primaryContact: 'John Smith',
        email: 'john@greenvalley.com',
        phone: '+1-555-0123'
      },
      metrics: {
        totalReports: 342,
        activeUsers: 15,
        harvestBatches: 28,
        sprayApplications: 67,
        avgResponseTime: 2.4,
        qualityScore: 92,
        storageUsed: 2.3 // GB
      }
    },
    {
      id: 'facility-2',
      name: 'Urban Farms Inc',
      type: 'indoor_vertical',
      address: '456 City Center, New York, USA',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      isActive: true,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date('2023-08-22'),
      subscription: {
        plan: 'enterprise',
        features: ['visual_ops', 'ipm_scouting', 'harvest_tracking', 'spray_tracking', 'analytics', 'api_access'],
        expiresAt: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000),
        monthlyRevenue: 99
      },
      contactInfo: {
        primaryContact: 'Sarah Johnson',
        email: 'sarah@urbanfarms.com',
        phone: '+1-555-0456'
      },
      metrics: {
        totalReports: 189,
        activeUsers: 8,
        harvestBatches: 45,
        sprayApplications: 23,
        avgResponseTime: 1.8,
        qualityScore: 87,
        storageUsed: 4.1
      }
    },
    {
      id: 'facility-3',
      name: 'Sunny Fields Nursery',
      type: 'nursery',
      address: '789 Garden Way, Texas, USA',
      coordinates: { lat: 32.7767, lng: -96.7970 },
      isActive: false,
      lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date('2023-03-10'),
      subscription: {
        plan: 'essential',
        features: ['visual_ops', 'basic_analytics'],
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        monthlyRevenue: 39
      },
      contactInfo: {
        primaryContact: 'Mike Wilson',
        email: 'mike@sunnyfields.com',
        phone: '+1-555-0789'
      },
      metrics: {
        totalReports: 78,
        activeUsers: 3,
        harvestBatches: 12,
        sprayApplications: 34,
        avgResponseTime: 4.2,
        qualityScore: 78,
        storageUsed: 0.8
      }
    }
  ];
}

async function getFacilityMetrics(facilityId: string) {
  // In production, query from InfluxDB for real-time metrics
  try {
    const performanceData = await timeseriesDB.query(`
      from(bucket: "greenhouse_data")
        |> range(start: -7d)
        |> filter(fn: (r) => r._measurement == "worker_performance")
        |> filter(fn: (r) => r.facility_id == "${facilityId}")
        |> aggregateWindow(every: 1d, fn: mean, createEmpty: false)
        |> yield(name: "performance")
    `);

    const locationData = await timeseriesDB.query(`
      from(bucket: "greenhouse_data")
        |> range(start: -24h)
        |> filter(fn: (r) => r._measurement == "location_tracking")
        |> filter(fn: (r) => r.facility_id == "${facilityId}")
        |> group(columns: ["user_id"])
        |> last()
        |> count()
        |> yield(name: "active_users")
    `);

    return {
      weeklyPerformance: performanceData,
      currentActiveUsers: locationData.length,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error(`Error fetching metrics for facility ${facilityId}:`, error);
    return { error: 'Failed to fetch metrics' };
  }
}

async function getRecentActivity(facilityId: string) {
  // Mock data - in production, query from PostgreSQL
  return [
    {
      id: 'activity-1',
      type: 'photo_report',
      title: 'Spider mites detected in Veg Room 3',
      user: 'John Smith',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'pending_review'
    },
    {
      id: 'activity-2',
      type: 'harvest',
      title: 'Purple Punch batch completed',
      user: 'Maria Rodriguez',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed'
    },
    {
      id: 'activity-3',
      type: 'spray_application',
      title: 'Neem oil application in Flower Room 2',
      user: 'James Wilson',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'completed'
    }
  ];
}

async function getActiveAlerts(facilityId: string) {
  // Mock data - in production, query from database
  return [
    {
      id: 'alert-1',
      severity: 'medium',
      message: 'Environmental sensor offline in Zone 3',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: 'alert-2',
      severity: 'low',
      message: 'Subscription expires in 45 days',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];
}

function getPlanDistribution(facilities: any[]) {
  const distribution = { essential: 0, professional: 0, enterprise: 0 };
  
  facilities.forEach(facility => {
    distribution[facility.subscription.plan as keyof typeof distribution]++;
  });
  
  return distribution;
}