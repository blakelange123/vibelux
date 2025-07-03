import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BackupManager } from '@/lib/backup/backup-manager'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    // In production, implement proper admin check
    
    const body = await request.json()
    const { includeUserData, includeLogs, customTables, description } = body

    // Get backup configuration from environment or database
    const backupConfig = {
      enabled: true,
      frequency: 'daily' as const,
      retentionDays: 30,
      destination: (process.env.BACKUP_DESTINATION || 's3') as 's3' | 'local',
      encryption: process.env.BACKUP_ENCRYPTION === 'true',
      notifications: process.env.BACKUP_NOTIFICATIONS === 'true',
      s3Config: process.env.BACKUP_DESTINATION === 's3' ? {
        bucket: process.env.BACKUP_S3_BUCKET!,
        region: process.env.BACKUP_S3_REGION!,
        accessKeyId: process.env.BACKUP_S3_ACCESS_KEY!,
        secretAccessKey: process.env.BACKUP_S3_SECRET_KEY!,
        endpoint: process.env.BACKUP_S3_ENDPOINT
      } : undefined,
      localPath: process.env.BACKUP_LOCAL_PATH
    }

    const backupManager = new BackupManager(backupConfig)

    // Create the backup
    const backup = await backupManager.createBackup({
      includeUserData,
      includeLogs,
      customTables
    })

    return NextResponse.json({
      success: true,
      backup: {
        id: backup.id,
        filename: backup.filename,
        size: backup.size,
        status: backup.status,
        createdAt: backup.createdAt
      }
    })

  } catch (error) {
    console.error('Backup creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create backup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}