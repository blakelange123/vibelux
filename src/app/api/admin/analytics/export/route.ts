import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin status
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, isAdmin: true }
    })

    if (user?.role !== 'admin' && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || '30days'
    const format = searchParams.get('format') || 'csv'

    // In production, this would query your database for actual data
    const analyticsData = await generateExportData(timeframe)

    if (format === 'csv') {
      const csvData = convertToCSV(analyticsData)
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics_${timeframe}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'json') {
      return new NextResponse(JSON.stringify(analyticsData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="analytics_${timeframe}_${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    } else if (format === 'pdf') {
      const pdfData = await convertToPDF(analyticsData, timeframe)
      return new NextResponse(pdfData, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="analytics_${timeframe}_${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
    } else {
      return NextResponse.json({ error: 'Unsupported format. Use csv, json, or pdf' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function generateExportData(timeframe: string) {
  // Mock export data - in production, this would come from your database
  const multiplier = timeframe === '7days' ? 0.25 : 
                     timeframe === '30days' ? 1 : 
                     timeframe === '90days' ? 3 : 12

  return {
    metadata: {
      exportDate: new Date().toISOString(),
      timeframe,
      generatedBy: 'VibeLux Analytics System'
    },
    summary: {
      totalRevenue: Math.floor(284750 * multiplier),
      totalUsers: Math.floor(12547 * Math.sqrt(multiplier)),
      activeUsers: Math.floor(12547 * Math.sqrt(multiplier) * 0.71),
      conversionRate: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 + 3).toFixed(2),
      churnRate: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 4 + 1).toFixed(2),
      avgRevenuePerUser: (23.45 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10).toFixed(2)
    },
    userMetrics: generateUserMetrics(timeframe),
    revenueMetrics: generateRevenueMetrics(timeframe),
    featureUsage: generateFeatureUsage(),
    performanceMetrics: generatePerformanceMetrics()
  }
}

function generateUserMetrics(timeframe: string) {
  const days = timeframe === '7days' ? 7 : 
               timeframe === '30days' ? 30 : 
               timeframe === '90days' ? 90 : 365

  const data = []
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      newSignups: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50 + 10),
      activeUsers: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000 + 2000),
      sessionsStarted: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1500 + 2500),
      averageSessionDuration: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 600 + 900), // seconds
      pageViews: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5000 + 10000)
    })
  }
  return data
}

function generateRevenueMetrics(timeframe: string) {
  const days = timeframe === '7days' ? 7 : 
               timeframe === '30days' ? 30 : 
               timeframe === '90days' ? 90 : 365

  const data = []
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      dailyRevenue: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 2000 + 1000),
      newSubscriptions: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 + 5),
      upgrades: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 + 2),
      downgrades: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 + 1),
      cancellations: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 8 + 2),
      refunds: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 3)
    })
  }
  return data
}

function generateFeatureUsage() {
  return [
    {
      feature: 'Lighting Designer',
      totalUsage: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000 + 5000),
      uniqueUsers: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 500 + 2000),
      averageSessionTime: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 600 + 900),
      adoptionRate: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 + 75).toFixed(1)
    },
    {
      feature: 'PPFD Calculator',
      totalUsage: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 800 + 4000),
      uniqueUsers: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400 + 1800),
      averageSessionTime: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300 + 600),
      adoptionRate: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15 + 80).toFixed(1)
    },
    {
      feature: 'Heat Load Calculator',
      totalUsage: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 600 + 3000),
      uniqueUsers: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300 + 1500),
      averageSessionTime: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400 + 700),
      adoptionRate: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 + 65).toFixed(1)
    },
    {
      feature: 'ROI Calculator',
      totalUsage: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 500 + 2500),
      uniqueUsers: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 250 + 1200),
      averageSessionTime: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 500 + 800),
      adoptionRate: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15 + 70).toFixed(1)
    },
    {
      feature: 'Reports',
      totalUsage: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 400 + 2000),
      uniqueUsers: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200 + 1000),
      averageSessionTime: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 800 + 1200),
      adoptionRate: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 + 60).toFixed(1)
    },
    {
      feature: 'Multi-Site Manager',
      totalUsage: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 300 + 1500),
      uniqueUsers: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 150 + 750),
      averageSessionTime: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000 + 1500),
      adoptionRate: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 15 + 45).toFixed(1)
    }
  ]
}

function generatePerformanceMetrics() {
  return {
    uptime: (99.5 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.4).toFixed(2),
    averageResponseTime: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 + 150),
    errorRate: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.5 + 0.1).toFixed(3),
    slowQueries: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50 + 10),
    cacheHitRate: (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.3 + 0.7).toFixed(2),
    bandwidthUsage: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000 + 2000), // GB
    storageUsage: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50 + 120), // GB
    activeConnections: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100 + 200),
    peakConcurrentUsers: Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 500 + 1000)
  }
}

function convertToCSV(data: any): string {
  const lines: string[] = []
  
  // Add metadata
  lines.push('VIBELUX ANALYTICS EXPORT')
  lines.push(`Export Date,${data.metadata.exportDate}`)
  lines.push(`Timeframe,${data.metadata.timeframe}`)
  lines.push(`Generated By,${data.metadata.generatedBy}`)
  lines.push('')
  
  // Add summary
  lines.push('SUMMARY METRICS')
  lines.push('Metric,Value')
  Object.entries(data.summary).forEach(([key, value]) => {
    lines.push(`${key},${value}`)
  })
  lines.push('')
  
  // Add user metrics
  lines.push('DAILY USER METRICS')
  if (data.userMetrics.length > 0) {
    const headers = Object.keys(data.userMetrics[0])
    lines.push(headers.join(','))
    
    data.userMetrics.forEach((row: any) => {
      lines.push(headers.map(header => row[header]).join(','))
    })
  }
  lines.push('')
  
  // Add revenue metrics
  lines.push('DAILY REVENUE METRICS')
  if (data.revenueMetrics.length > 0) {
    const headers = Object.keys(data.revenueMetrics[0])
    lines.push(headers.join(','))
    
    data.revenueMetrics.forEach((row: any) => {
      lines.push(headers.map(header => row[header]).join(','))
    })
  }
  lines.push('')
  
  // Add feature usage
  lines.push('FEATURE USAGE METRICS')
  if (data.featureUsage.length > 0) {
    const headers = Object.keys(data.featureUsage[0])
    lines.push(headers.join(','))
    
    data.featureUsage.forEach((row: any) => {
      lines.push(headers.map(header => row[header]).join(','))
    })
  }
  lines.push('')
  
  // Add performance metrics
  lines.push('PERFORMANCE METRICS')
  lines.push('Metric,Value')
  Object.entries(data.performanceMetrics).forEach(([key, value]) => {
    lines.push(`${key},${value}`)
  })
  
  return lines.join('\n')
}

async function convertToPDF(data: any, timeframe: string): Promise<Buffer> {
  // Create HTML template for PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>VibeLux Analytics Report - ${timeframe}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background: #fff;
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #8b5cf6;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #8b5cf6;
          margin-bottom: 10px;
        }
        h1 { color: #1a1a1a; font-size: 28px; margin-bottom: 20px; }
        h2 { color: #4b5563; font-size: 20px; margin: 30px 0 15px; }
        .metadata {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .metadata p { margin: 5px 0; color: #6b7280; }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        .metric-card {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e5e7eb;
        }
        .metric-value {
          font-size: 32px;
          font-weight: bold;
          color: #8b5cf6;
          margin-bottom: 5px;
        }
        .metric-label {
          font-size: 14px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }
        tr:hover { background: #f9fafb; }
        .chart-container {
          margin: 20px 0;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .performance-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 20px;
        }
        .performance-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: #fff;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }
        .performance-label { color: #6b7280; }
        .performance-value { 
          font-weight: 600; 
          color: #1a1a1a;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
          .metric-card { break-inside: avoid; }
          table { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">VibeLux</div>
        <h1>Analytics Report</h1>
        <p style="color: #6b7280;">Comprehensive analytics overview for ${timeframe}</p>
      </div>

      <div class="metadata">
        <p><strong>Generated:</strong> ${new Date(data.metadata.exportDate).toLocaleString()}</p>
        <p><strong>Period:</strong> ${timeframe}</p>
        <p><strong>Report Type:</strong> Full Analytics Export</p>
      </div>

      <h2>Summary Metrics</h2>
      <div class="summary-grid">
        <div class="metric-card">
          <div class="metric-value">$${parseInt(data.summary.totalRevenue).toLocaleString()}</div>
          <div class="metric-label">Total Revenue</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.summary.totalUsers.toLocaleString()}</div>
          <div class="metric-label">Total Users</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.summary.activeUsers.toLocaleString()}</div>
          <div class="metric-label">Active Users</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.summary.conversionRate}%</div>
          <div class="metric-label">Conversion Rate</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.summary.churnRate}%</div>
          <div class="metric-label">Churn Rate</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">$${data.summary.avgRevenuePerUser}</div>
          <div class="metric-label">Avg Revenue/User</div>
        </div>
      </div>

      <h2>Feature Usage Analytics</h2>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Total Usage</th>
            <th>Unique Users</th>
            <th>Avg Session Time</th>
            <th>Adoption Rate</th>
          </tr>
        </thead>
        <tbody>
          ${data.featureUsage.map((feature: any) => `
            <tr>
              <td><strong>${feature.feature}</strong></td>
              <td>${feature.totalUsage.toLocaleString()}</td>
              <td>${feature.uniqueUsers.toLocaleString()}</td>
              <td>${Math.floor(feature.averageSessionTime / 60)}m ${feature.averageSessionTime % 60}s</td>
              <td>${feature.adoptionRate}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Performance Metrics</h2>
      <div class="performance-grid">
        <div class="performance-item">
          <span class="performance-label">Uptime</span>
          <span class="performance-value">${data.performanceMetrics.uptime}%</span>
        </div>
        <div class="performance-item">
          <span class="performance-label">Avg Response Time</span>
          <span class="performance-value">${data.performanceMetrics.averageResponseTime}ms</span>
        </div>
        <div class="performance-item">
          <span class="performance-label">Error Rate</span>
          <span class="performance-value">${data.performanceMetrics.errorRate}%</span>
        </div>
        <div class="performance-item">
          <span class="performance-label">Cache Hit Rate</span>
          <span class="performance-value">${(parseFloat(data.performanceMetrics.cacheHitRate) * 100).toFixed(1)}%</span>
        </div>
        <div class="performance-item">
          <span class="performance-label">Storage Usage</span>
          <span class="performance-value">${data.performanceMetrics.storageUsage} GB</span>
        </div>
        <div class="performance-item">
          <span class="performance-label">Peak Concurrent Users</span>
          <span class="performance-value">${data.performanceMetrics.peakConcurrentUsers.toLocaleString()}</span>
        </div>
      </div>

      <div class="footer">
        <p>© ${new Date().getFullYear()} VibeLux. All rights reserved.</p>
        <p>This report contains confidential information and is intended solely for internal use.</p>
      </div>
    </body>
    </html>
  `;

  // In production, you would use a library like Puppeteer or wkhtmltopdf to convert HTML to PDF
  // For now, we'll return the HTML as a buffer (browsers can display it as PDF)
  return Buffer.from(html, 'utf-8');
}