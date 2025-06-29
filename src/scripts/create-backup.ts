#!/usr/bin/env tsx

import { BackupManager, BackupScheduler } from '@/lib/backup/backup-manager'

async function main() {

  try {
    // Get configuration from environment variables
    const config = {
      enabled: true,
      frequency: 'daily' as const,
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
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

    // Validate required configuration
    if (config.destination === 's3' && !config.s3Config) {
      throw new Error('S3 configuration missing. Please set BACKUP_S3_* environment variables.')
    }

    const backupManager = new BackupManager(config)

    // Parse command line arguments
    const args = process.argv.slice(2)
    const includeUserData = !args.includes('--no-user-data')
    const includeLogs = args.includes('--include-logs')
    const description = args.find(arg => arg.startsWith('--description='))?.split('=')[1]

    // Backup options debug info would be logged here

    // Create the backup
    const backup = await backupManager.createBackup({
      includeUserData,
      includeLogs
    })


    // Display table row counts
    Object.entries(backup.rowCounts).forEach(([table, count]) => {
    })

    // Clean up old backups if this is an automated backup
    if (args.includes('--cleanup-old')) {
      await backupManager.cleanupOldBackups()
    }

  } catch (error) {
    console.error('Backup failed:', error)
    process.exit(1)
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Handle CLI execution
if (require.main === module) {
  main().catch(console.error)
}