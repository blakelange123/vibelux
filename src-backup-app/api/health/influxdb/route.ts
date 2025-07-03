import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if InfluxDB is configured
    const influxUrl = process.env.INFLUXDB_URL;
    const influxToken = process.env.INFLUXDB_TOKEN;
    
    if (!influxUrl) {
      return NextResponse.json({
        status: 'unhealthy',
        error: 'INFLUXDB_URL not configured',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    // Basic health check - try to reach the health endpoint
    const healthUrl = `${influxUrl}/health`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: influxToken ? {
          'Authorization': `Token ${influxToken}`
        } : undefined
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          status: 'healthy',
          influxStatus: data,
          url: influxUrl,
          timestamp: new Date().toISOString()
        });
      } else {
        return NextResponse.json({
          status: 'unhealthy',
          error: `InfluxDB returned ${response.status}`,
          url: influxUrl,
          timestamp: new Date().toISOString()
        }, { status: 503 });
      }

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({
          status: 'unhealthy',
          error: 'InfluxDB health check timeout',
          url: influxUrl,
          timestamp: new Date().toISOString()
        }, { status: 503 });
      }

      // Check if it's a connection error
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      
      return NextResponse.json({
        status: 'unhealthy',
        error: `InfluxDB connection failed: ${errorMessage}`,
        url: influxUrl,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

  } catch (error) {
    console.error('InfluxDB health check error:', error);
    return NextResponse.json({
      status: 'unknown',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}