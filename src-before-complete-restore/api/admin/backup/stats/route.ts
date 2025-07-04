import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    // In production, implement proper admin check

    // In production, calculate from database
    // For now, return mock stats
    const stats = {
      totalBackups: 28,
      totalSize: 4294967296, // 4GB
      successRate: 96.4,
      lastBackupTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      nextScheduledBackup: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      oldestBackup: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      avgBackupSize: 153391689, // ~146MB
      avgBackupDuration: 325, // seconds
      backupsThisMonth: 12,
      failedBackupsThisMonth: 1,
      storageBreakdown: {
        s3: 3221225472, // 3GB
        local: 1073741824  // 1GB
      },
      retentionStatus: {
        withinRetention: 25,
        expiredNotCleaned: 3
      }
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Backup stats error:', error)
    return NextResponse.json(
      { error: 'Failed to load backup statistics' },
      { status: 500 }
    )
  }
}