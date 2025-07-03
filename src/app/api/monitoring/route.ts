// Production monitoring API endpoints
import { NextRequest } from 'next/server'
import { productionMonitor } from '@/lib/production-monitoring'
import { auth } from '@clerk/nextjs/server'

// GET /api/monitoring - Dashboard data
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    // Only allow authenticated admin users
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // In production, add admin role check here
    // const user = await clerkClient.users.getUser(userId)
    // if (!user.privateMetadata?.role === 'admin') { ... }
    
    const searchParams = request.nextUrl.searchParams
    const endpoint = searchParams.get('endpoint')
    
    switch (endpoint) {
      case 'dashboard':
        const dashboardData = await productionMonitor.getDashboardData()
        return Response.json(dashboardData)
      
      case 'health':
        const healthCheck = await productionMonitor.healthCheck()
        return Response.json(healthCheck, { 
          status: healthCheck.status === 'healthy' ? 200 : 503 
        })
      
      case 'metrics':
        // Prometheus metrics format
        const metrics = await productionMonitor.collectMetrics()
        const prometheusMetrics = formatPrometheusMetrics(metrics)
        
        return new Response(prometheusMetrics, {
          headers: { 'Content-Type': 'text/plain' }
        })
      
      default:
        return Response.json({ error: 'Invalid endpoint' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Monitoring API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/monitoring - Acknowledge/resolve alerts
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { action, alertId } = await request.json()
    
    switch (action) {
      case 'acknowledge':
        await productionMonitor.acknowledgeAlert(alertId)
        return Response.json({ success: true })
      
      case 'resolve':
        await productionMonitor.resolveAlert(alertId)
        return Response.json({ success: true })
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Monitoring action error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatPrometheusMetrics(metrics: any): string {
  const timestamp = Date.now()
  
  return `
# HELP vibelux_cpu_usage_percent CPU usage percentage
# TYPE vibelux_cpu_usage_percent gauge
vibelux_cpu_usage_percent{instance="production"} ${metrics.cpu_usage} ${timestamp}

# HELP vibelux_memory_usage_percent Memory usage percentage
# TYPE vibelux_memory_usage_percent gauge
vibelux_memory_usage_percent{instance="production"} ${metrics.memory_usage} ${timestamp}

# HELP vibelux_response_time_ms Average response time in milliseconds
# TYPE vibelux_response_time_ms gauge
vibelux_response_time_ms{instance="production"} ${metrics.response_time} ${timestamp}

# HELP vibelux_error_rate_percent Error rate percentage
# TYPE vibelux_error_rate_percent gauge
vibelux_error_rate_percent{instance="production"} ${metrics.error_rate} ${timestamp}

# HELP vibelux_active_users_total Number of active users
# TYPE vibelux_active_users_total gauge
vibelux_active_users_total{instance="production"} ${metrics.active_users} ${timestamp}

# HELP vibelux_ai_requests_per_minute AI requests per minute
# TYPE vibelux_ai_requests_per_minute gauge
vibelux_ai_requests_per_minute{instance="production"} ${metrics.ai_requests_per_minute} ${timestamp}

# HELP vibelux_cache_hit_rate_percent Cache hit rate percentage
# TYPE vibelux_cache_hit_rate_percent gauge
vibelux_cache_hit_rate_percent{instance="production"} ${metrics.cache_hit_rate} ${timestamp}

# HELP vibelux_database_connections_total Number of active database connections
# TYPE vibelux_database_connections_total gauge
vibelux_database_connections_total{instance="production"} ${metrics.database_connections} ${timestamp}
  `.trim()
}