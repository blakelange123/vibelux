import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/performance/performance-monitor'
import { MemoryOptimizer } from '@/lib/performance/optimization'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || 'all'
    const timeWindow = parseInt(searchParams.get('timeWindow') || '300000') // 5 minutes default

    let data: any = {}

    switch (category) {
      case 'api':
        data = await getAPIMetrics(timeWindow)
        break
      case 'database':
        data = await performanceMonitor.collectDatabaseMetrics()
        break
      case 'system':
        data = await performanceMonitor.collectSystemMetrics()
        break
      case 'cache':
        data = await performanceMonitor.collectCacheMetrics()
        break
      case 'memory':
        data = MemoryOptimizer.getMemoryUsage()
        break
      case 'all':
      default:
        data = {
          api: await getAPIMetrics(timeWindow),
          database: await performanceMonitor.collectDatabaseMetrics(),
          system: await performanceMonitor.collectSystemMetrics(),
          cache: await performanceMonitor.collectCacheMetrics(),
          memory: MemoryOptimizer.getMemoryUsage()
        }
        break
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'clear_cache':
        // Clear performance cache
        performanceMonitor.cleanup(0) // Clear all metrics
        return NextResponse.json({ success: true, message: 'Performance cache cleared' })

      case 'force_gc':
        // Force garbage collection if available
        if (global.gc) {
          global.gc()
          performanceMonitor.incrementCounter('gc.forced_manual')
          return NextResponse.json({ success: true, message: 'Garbage collection triggered' })
        } else {
          return NextResponse.json({ 
            success: false, 
            message: 'Garbage collection not available' 
          }, { status: 400 })
        }

      case 'export_metrics':
        const format = data?.format || 'json'
        const metrics = performanceMonitor.exportMetrics(format)
        
        return new NextResponse(metrics, {
          headers: {
            'Content-Type': format === 'json' ? 'application/json' : 'text/plain',
            'Content-Disposition': `attachment; filename="performance-metrics.${format === 'json' ? 'json' : 'txt'}"`
          }
        })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error handling performance action:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process performance action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function getAPIMetrics(timeWindow: number) {
  // Get API performance statistics
  const responseTimeStats = performanceMonitor.getStatistics('api_request', timeWindow)
  const errorStats = performanceMonitor.getStatistics('api.errors', timeWindow)
  const requestStats = performanceMonitor.getStatistics('api.requests', timeWindow)

  return {
    responseTime: responseTimeStats.avg || 0,
    requestCount: requestStats.count || 0,
    errorRate: errorStats.count > 0 ? (errorStats.count / requestStats.count) : 0,
    throughput: requestStats.count / (timeWindow / 1000), // requests per second
    p95ResponseTime: responseTimeStats.p95 || 0,
    p99ResponseTime: responseTimeStats.p99 || 0,
    minResponseTime: responseTimeStats.min || 0,
    maxResponseTime: responseTimeStats.max || 0
  }
}