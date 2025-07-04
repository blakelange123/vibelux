import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { BackupManager } from '@/lib/backup/backup-manager'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    // In production, implement proper admin check
    
    const backupId = params.id

    // Get backup configuration
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

    // Delete the backup
    await backupManager.deleteBackup(backupId)

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully',
      backupId,
      deletedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Backup deletion error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete backup', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const backupId = params.id

    // In production, get backup details from database
    const mockBackup = {
      id: backupId,
      filename: `vibelux_backup_${backupId}.sql.gz.enc`,
      size: 157286400,
      compressed: true,
      encrypted: true,
      checksum: 'sha256:abc123...',
      tables: ['users', 'designs', 'fixtures', 'calculations'],
      rowCounts: { users: 12847, designs: 5634, fixtures: 892, calculations: 23456 },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      location: 's3',
      s3Key: `backups/2025/06/vibelux_backup_${backupId}.sql.gz.enc`,
      status: 'completed',
      duration: 340,
      metadata: {
        postgresVersion: '14.5',
        databaseSize: '256MB',
        createdBy: userId,
        applicationVersion: '1.0.0'
      }
    }

    return NextResponse.json({ backup: mockBackup })

  } catch (error) {
    console.error('Backup details error:', error)
    return NextResponse.json(
      { error: 'Failed to get backup details' },
      { status: 500 }
    )
  }
}