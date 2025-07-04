import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs'
import { spawn } from 'child_process'
import { promisify } from 'util'
import { pipeline } from 'stream'
import path from 'path'
import crypto from 'crypto'
import { prisma, Prisma } from '@/lib/prisma'

const streamPipeline = promisify(pipeline)

export interface BackupConfig {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  retentionDays: number
  destination: 's3' | 'local'
  encryption: boolean
  notifications: boolean
  s3Config?: {
    bucket: string
    region: string
    accessKeyId: string
    secretAccessKey: string
    endpoint?: string
  }
  localPath?: string
}

export interface BackupMetadata {
  id: string
  filename: string
  size: number
  compressed: boolean
  encrypted: boolean
  checksum: string
  tables: string[]
  rowCounts: Record<string, number>
  createdAt: Date
  location: 's3' | 'local'
  s3Key?: string
  localPath?: string
  status: 'creating' | 'completed' | 'failed' | 'deleted'
  restoredAt?: Date
}

export class BackupManager {
  private s3Client?: S3Client
  private config: BackupConfig

  constructor(config: BackupConfig) {
    this.config = config
    
    if (config.destination === 's3' && config.s3Config) {
      this.s3Client = new S3Client({
        region: config.s3Config.region,
        credentials: {
          accessKeyId: config.s3Config.accessKeyId,
          secretAccessKey: config.s3Config.secretAccessKey
        },
        ...(config.s3Config.endpoint && {
          endpoint: config.s3Config.endpoint,
          forcePathStyle: true
        })
      })
    }
  }

  async createBackup(options: {
    includeUserData?: boolean
    includeLogs?: boolean
    customTables?: string[]
  } = {}): Promise<BackupMetadata> {
    const backupId = `backup_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `vibelux_backup_${timestamp}.sql`


    try {
      // Create backup metadata record
      const metadata: BackupMetadata = {
        id: backupId,
        filename,
        size: 0,
        compressed: true,
        encrypted: this.config.encryption,
        checksum: '',
        tables: [],
        rowCounts: {},
        createdAt: new Date(),
        location: this.config.destination,
        status: 'creating'
      }

      // Get database URL from environment
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not found in environment')
      }

      // Parse database URL to get connection details
      const dbConfig = this.parseDatabaseUrl(databaseUrl)
      
      // Create temporary directory for backup files
      const tempDir = path.join(process.cwd(), 'temp', 'backups')
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true })
      }

      const tempFile = path.join(tempDir, filename)
      const compressedFile = `${tempFile}.gz`

      // Determine which tables to backup
      const tablesToBackup = options.customTables || await this.getTableList(options)
      metadata.tables = tablesToBackup

      // Get row counts for each table using safe queries
      for (const table of tablesToBackup) {
        try {
          // Validate table name against allowed tables to prevent injection
          const allowedTables = ['User', 'Project', 'Fixture', 'ProjectFixture', 'LightRecipe', 'Report', 'Subscription']
          if (!allowedTables.includes(table)) {
            throw new Error(`Table ${table} is not allowed for backup`)
          }
          
          // Use Prisma's type-safe raw query with template literals
          const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM ${Prisma.raw(`"${table}"`)}`
          metadata.rowCounts[table] = parseInt((result as any)[0].count)
        } catch (error) {
          console.warn(`Could not get row count for table ${table}:`, error)
          metadata.rowCounts[table] = 0
        }
      }

      // Create database dump
      await this.createDatabaseDump(dbConfig, tempFile, tablesToBackup)

      // Compress the backup
      await this.compressFile(tempFile, compressedFile)

      // Encrypt if required
      let finalFile = compressedFile
      if (this.config.encryption) {
        const encryptedFile = `${compressedFile}.enc`
        await this.encryptFile(compressedFile, encryptedFile)
        finalFile = encryptedFile
      }

      // Calculate file size and checksum
      const stats = await import('fs').then(fs => fs.promises.stat(finalFile))
      metadata.size = stats.size
      metadata.checksum = await this.calculateChecksum(finalFile)

      // Upload to destination
      if (this.config.destination === 's3') {
        const s3Key = `backups/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${filename}`
        await this.uploadToS3(finalFile, s3Key)
        metadata.s3Key = s3Key
      } else {
        const localBackupDir = this.config.localPath || path.join(process.cwd(), 'backups')
        if (!existsSync(localBackupDir)) {
          mkdirSync(localBackupDir, { recursive: true })
        }
        const localFile = path.join(localBackupDir, path.basename(finalFile))
        await import('fs').then(fs => fs.promises.copyFile(finalFile, localFile))
        metadata.localPath = localFile
      }

      // Clean up temporary files
      await this.cleanupTempFiles([tempFile, compressedFile, finalFile])

      metadata.status = 'completed'

      // Save metadata to database
      await this.saveBackupMetadata(metadata)


      // Send notification if enabled
      if (this.config.notifications) {
        await this.sendBackupNotification(metadata, 'success')
      }

      return metadata

    } catch (error) {
      console.error(`Backup failed: ${backupId}`, error)

      // Send failure notification
      if (this.config.notifications) {
        await this.sendBackupNotification({ 
          id: backupId, 
          filename, 
          status: 'failed',
          createdAt: new Date()
        } as BackupMetadata, 'failure', error as Error)
      }

      throw error
    }
  }

  async restoreBackup(backupId: string, options: {
    targetDatabase?: string
    overwriteExisting?: boolean
    restoreUserData?: boolean
    customTables?: string[]
  } = {}): Promise<void> {

    try {
      // Get backup metadata
      const metadata = await this.getBackupMetadata(backupId)
      if (!metadata) {
        throw new Error(`Backup not found: ${backupId}`)
      }

      if (metadata.status !== 'completed') {
        throw new Error(`Backup is not in completed state: ${metadata.status}`)
      }

      // Download backup file
      const tempDir = path.join(process.cwd(), 'temp', 'restores')
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true })
      }

      let backupFile: string
      if (metadata.location === 's3' && metadata.s3Key) {
        backupFile = path.join(tempDir, metadata.filename)
        await this.downloadFromS3(metadata.s3Key, backupFile)
      } else if (metadata.localPath) {
        backupFile = metadata.localPath
      } else {
        throw new Error('Backup file location not found')
      }

      // Decrypt if encrypted
      if (metadata.encrypted) {
        const decryptedFile = backupFile.replace('.enc', '')
        await this.decryptFile(backupFile, decryptedFile)
        backupFile = decryptedFile
      }

      // Decompress if compressed
      if (metadata.compressed) {
        const decompressedFile = backupFile.replace('.gz', '')
        await this.decompressFile(backupFile, decompressedFile)
        backupFile = decompressedFile
      }

      // Verify checksum
      const actualChecksum = await this.calculateChecksum(backupFile)
      if (actualChecksum !== metadata.checksum) {
        throw new Error('Backup file checksum verification failed')
      }

      // Get database configuration
      const databaseUrl = options.targetDatabase || process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error('Target database URL not specified')
      }

      const dbConfig = this.parseDatabaseUrl(databaseUrl)

      // Create database restore
      await this.restoreDatabase(dbConfig, backupFile, {
        overwriteExisting: options.overwriteExisting,
        customTables: options.customTables
      })

      // Update metadata
      await this.updateBackupMetadata(backupId, { restoredAt: new Date() })

      // Clean up temporary files
      await this.cleanupTempFiles([backupFile])


      // Send notification
      if (this.config.notifications) {
        await this.sendRestoreNotification(metadata, 'success')
      }

    } catch (error) {
      console.error(`Restore failed: ${backupId}`, error)

      if (this.config.notifications) {
        await this.sendRestoreNotification({ 
          id: backupId 
        } as BackupMetadata, 'failure', error as Error)
      }

      throw error
    }
  }

  async listBackups(options: {
    limit?: number
    offset?: number
    status?: string
  } = {}): Promise<{ backups: BackupMetadata[], total: number }> {
    // In production, this would query the database
    // For now, return mock data structure
    return {
      backups: [],
      total: 0
    }
  }

  async deleteBackup(backupId: string): Promise<void> {
    const metadata = await this.getBackupMetadata(backupId)
    if (!metadata) {
      throw new Error(`Backup not found: ${backupId}`)
    }

    try {
      // Delete from storage
      if (metadata.location === 's3' && metadata.s3Key) {
        await this.deleteFromS3(metadata.s3Key)
      } else if (metadata.localPath) {
        await import('fs').then(fs => fs.promises.unlink(metadata.localPath!))
      }

      // Update metadata
      await this.updateBackupMetadata(backupId, { status: 'deleted' })

    } catch (error) {
      console.error(`Failed to delete backup: ${backupId}`, error)
      throw error
    }
  }

  async cleanupOldBackups(): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays)

    // Get old backups
    const oldBackups = await this.getBackupsOlderThan(cutoffDate)

    for (const backup of oldBackups) {
      try {
        await this.deleteBackup(backup.id)
      } catch (error) {
        console.error(`Failed to cleanup backup ${backup.id}:`, error)
      }
    }

  }

  // Private helper methods

  private parseDatabaseUrl(url: string) {
    const parsed = new URL(url)
    return {
      host: parsed.hostname,
      port: parsed.port || '5432',
      database: parsed.pathname.slice(1),
      username: parsed.username,
      password: parsed.password
    }
  }

  private async getTableList(options: {
    includeUserData?: boolean
    includeLogs?: boolean
  }): Promise<string[]> {
    const allTables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `

    let tables = allTables.map(t => t.tablename)

    // Filter out sensitive tables based on options
    if (!options.includeUserData) {
      tables = tables.filter(table => 
        !table.includes('session') && 
        !table.includes('user_private')
      )
    }

    if (!options.includeLogs) {
      tables = tables.filter(table => 
        !table.includes('log') && 
        !table.includes('audit')
      )
    }

    return tables
  }

  private async createDatabaseDump(
    dbConfig: any, 
    outputFile: string, 
    tables: string[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-h', dbConfig.host,
        '-p', dbConfig.port,
        '-U', dbConfig.username,
        '-d', dbConfig.database,
        '--no-password',
        '--verbose',
        '--clean',
        '--no-acl',
        '--no-owner',
        '-f', outputFile
      ]

      // Add specific tables if provided
      tables.forEach(table => {
        args.push('-t', table)
      })

      const pgDump = spawn('pg_dump', args, {
        env: {
          ...process.env,
          PGPASSWORD: dbConfig.password
        }
      })

      pgDump.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`pg_dump exited with code ${code}`))
        }
      })

      pgDump.on('error', reject)
    })
  }

  private async restoreDatabase(
    dbConfig: any,
    backupFile: string,
    options: {
      overwriteExisting?: boolean
      customTables?: string[]
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = [
        '-h', dbConfig.host,
        '-p', dbConfig.port,
        '-U', dbConfig.username,
        '-d', dbConfig.database,
        '--no-password',
        '--verbose'
      ]

      if (options.overwriteExisting) {
        args.push('--clean')
      }

      args.push(backupFile)

      const psql = spawn('psql', args, {
        env: {
          ...process.env,
          PGPASSWORD: dbConfig.password
        }
      })

      psql.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`psql exited with code ${code}`))
        }
      })

      psql.on('error', reject)
    })
  }

  private async compressFile(inputFile: string, outputFile: string): Promise<void> {
    const { createGzip } = await import('zlib')
    const { createReadStream, createWriteStream } = await import('fs')
    
    const gzip = createGzip({ level: 9 })
    const source = createReadStream(inputFile)
    const destination = createWriteStream(outputFile)

    await streamPipeline(source, gzip, destination)
  }

  private async decompressFile(inputFile: string, outputFile: string): Promise<void> {
    const { createGunzip } = await import('zlib')
    const { createReadStream, createWriteStream } = await import('fs')
    
    const gunzip = createGunzip()
    const source = createReadStream(inputFile)
    const destination = createWriteStream(outputFile)

    await streamPipeline(source, gunzip, destination)
  }

  private async encryptFile(inputFile: string, outputFile: string): Promise<void> {
    const algorithm = 'aes-256-gcm'
    const key = crypto.scryptSync(process.env.BACKUP_ENCRYPTION_KEY || 'default-key', 'salt', 32)
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipher(algorithm, key)
    const source = createReadStream(inputFile)
    const destination = createWriteStream(outputFile)

    // Write IV to the beginning of the file
    destination.write(iv)

    await streamPipeline(source, cipher, destination)
  }

  private async decryptFile(inputFile: string, outputFile: string): Promise<void> {
    const algorithm = 'aes-256-gcm'
    const key = crypto.scryptSync(process.env.BACKUP_ENCRYPTION_KEY || 'default-key', 'salt', 32)
    
    const { createReadStream, createWriteStream } = await import('fs')
    const source = createReadStream(inputFile)
    const destination = createWriteStream(outputFile)

    // Read IV from the beginning of the file
    const iv = Buffer.alloc(16)
    await new Promise((resolve, reject) => {
      source.once('readable', () => {
        source.read(16) // Skip IV
        resolve(void 0)
      })
      source.once('error', reject)
    })

    const decipher = crypto.createDecipher(algorithm, key)
    await streamPipeline(source, decipher, destination)
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const hash = crypto.createHash('sha256')
    const stream = createReadStream(filePath)

    for await (const chunk of stream) {
      hash.update(chunk)
    }

    return hash.digest('hex')
  }

  private async uploadToS3(filePath: string, key: string): Promise<void> {
    if (!this.s3Client || !this.config.s3Config) {
      throw new Error('S3 client not configured')
    }

    const fileStream = createReadStream(filePath)
    const command = new PutObjectCommand({
      Bucket: this.config.s3Config.bucket,
      Key: key,
      Body: fileStream
    })

    await this.s3Client.send(command)
  }

  private async downloadFromS3(key: string, filePath: string): Promise<void> {
    if (!this.s3Client || !this.config.s3Config) {
      throw new Error('S3 client not configured')
    }

    const command = new GetObjectCommand({
      Bucket: this.config.s3Config.bucket,
      Key: key
    })

    const response = await this.s3Client.send(command)
    const writeStream = createWriteStream(filePath)

    if (response.Body) {
      await streamPipeline(response.Body as any, writeStream)
    }
  }

  private async deleteFromS3(key: string): Promise<void> {
    if (!this.s3Client || !this.config.s3Config) {
      throw new Error('S3 client not configured')
    }

    const command = new DeleteObjectCommand({
      Bucket: this.config.s3Config.bucket,
      Key: key
    })

    await this.s3Client.send(command)
  }

  private async cleanupTempFiles(files: string[]): Promise<void> {
    for (const file of files) {
      try {
        if (existsSync(file)) {
          await import('fs').then(fs => fs.promises.unlink(file))
        }
      } catch (error) {
        console.warn(`Failed to cleanup temp file ${file}:`, error)
      }
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Database operations (would use Prisma in production)
  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    // In production, save to database
  }

  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    // In production, query from database
    return null
  }

  private async updateBackupMetadata(backupId: string, updates: Partial<BackupMetadata>): Promise<void> {
    // In production, update database
  }

  private async getBackupsOlderThan(date: Date): Promise<BackupMetadata[]> {
    // In production, query from database
    return []
  }

  private async sendBackupNotification(metadata: BackupMetadata, status: 'success' | 'failure', error?: Error): Promise<void> {
    // In production, send email notification
  }

  private async sendRestoreNotification(metadata: BackupMetadata, status: 'success' | 'failure', error?: Error): Promise<void> {
    // In production, send email notification
  }
}

// Backup scheduler
export class BackupScheduler {
  private manager: BackupManager
  private intervalId?: NodeJS.Timeout

  constructor(manager: BackupManager) {
    this.manager = manager
  }

  start(): void {
    if (this.intervalId) {
      this.stop()
    }

    // Check every hour for scheduled backups
    this.intervalId = setInterval(() => {
      this.checkAndRunScheduledBackups()
    }, 60 * 60 * 1000)

  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  private async checkAndRunScheduledBackups(): Promise<void> {
    try {
      const now = new Date()
      const shouldBackup = await this.shouldCreateBackup(now)

      if (shouldBackup) {
        await this.manager.createBackup({
          includeUserData: true,
          includeLogs: false
        })

        // Cleanup old backups
        await this.manager.cleanupOldBackups()
      }
    } catch (error) {
      console.error('Scheduled backup failed:', error)
    }
  }

  private async shouldCreateBackup(now: Date): Promise<boolean> {
    // Get last backup time from database
    // For now, use simple time-based logic
    const lastBackupTime = await this.getLastBackupTime()
    if (!lastBackupTime) return true

    const timeDiff = now.getTime() - lastBackupTime.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    // Check based on frequency
    switch (this.manager['config'].frequency) {
      case 'daily':
        return hoursDiff >= 24
      case 'weekly':
        return hoursDiff >= 24 * 7
      case 'monthly':
        return hoursDiff >= 24 * 7 * 30
      default:
        return false
    }
  }

  private async getLastBackupTime(): Promise<Date | null> {
    // In production, query from database
    return null
  }
}