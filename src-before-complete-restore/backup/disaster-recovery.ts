// Disaster Recovery and Backup Management System
// Handles automated backups, recovery procedures, and system restoration

import { prisma } from '@/lib/db';
import { createHash } from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auditLogger } from '../audit-logger';

const execAsync = promisify(exec);

export interface BackupConfig {
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retention: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
  encryption: boolean;
  compression: boolean;
  destinations: BackupDestination[];
  databases: string[];
  filesystems: string[];
  notificationEmail?: string;
}

export interface BackupDestination {
  type: 'local' | 's3' | 'azure' | 'gcs' | 'ftp';
  config: Record<string, any>;
  enabled: boolean;
}

export interface BackupJob {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  size?: number;
  files?: number;
  error?: string;
  destination: string;
  checksum?: string;
}

export interface RecoveryPoint {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental' | 'differential';
  size: number;
  location: string;
  checksum: string;
  verified: boolean;
  expiresAt?: Date;
}

export class DisasterRecoveryManager {
  private s3Client: S3Client;
  private backupPath = '/var/backups/vibelux';
  
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });
  }
  
  // Create a full system backup
  async createBackup(config: BackupConfig): Promise<BackupJob> {
    const job: BackupJob = {
      id: `backup_${Date.now()}`,
      type: 'full',
      status: 'pending',
      startTime: new Date(),
      destination: config.destinations[0]?.type || 'local'
    };
    
    try {
      job.status = 'running';
      
      // Create backup directory
      const backupDir = join(this.backupPath, job.id);
      await mkdir(backupDir, { recursive: true });
      
      // Backup databases
      const dbBackups = await this.backupDatabases(config.databases, backupDir);
      
      // Backup filesystems
      const fsBackups = await this.backupFilesystems(config.filesystems, backupDir);
      
      // Create manifest
      const manifest = {
        id: job.id,
        timestamp: job.startTime,
        databases: dbBackups,
        filesystems: fsBackups,
        config: config
      };
      
      await writeFile(
        join(backupDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );
      
      // Compress if requested
      let finalPath = backupDir;
      if (config.compression) {
        finalPath = await this.compressBackup(backupDir);
      }
      
      // Encrypt if requested
      if (config.encryption) {
        finalPath = await this.encryptBackup(finalPath);
      }
      
      // Calculate checksum
      job.checksum = await this.calculateChecksum(finalPath);
      
      // Upload to destinations
      for (const destination of config.destinations) {
        if (destination.enabled) {
          await this.uploadBackup(finalPath, destination, job);
        }
      }
      
      // Update job status
      job.status = 'completed';
      job.endTime = new Date();
      job.size = await this.getBackupSize(finalPath);
      
      // Log successful backup
      await auditLogger.log({
        action: 'backup.created',
        resourceType: 'system',
        resourceId: job.id,
        userId: 'system',
        details: {
          type: job.type,
          size: job.size,
          duration: job.endTime.getTime() - job.startTime.getTime()
        }
      });
      
      // Schedule retention cleanup
      this.scheduleRetentionCleanup(config);
      
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.endTime = new Date();
      
      await auditLogger.log({
        action: 'backup.failed',
        resourceType: 'system',
        resourceId: job.id,
        userId: 'system',
        details: { error: job.error }
      });
    }
    
    return job;
  }
  
  // Backup all databases
  private async backupDatabases(databases: string[], backupDir: string): Promise<any[]> {
    const backups = [];
    
    for (const db of databases) {
      const backupFile = join(backupDir, `${db}_backup.sql`);
      
      // PostgreSQL backup
      if (db === 'postgres') {
        const pgDumpCmd = `pg_dump ${process.env.DATABASE_URL} > ${backupFile}`;
        await execAsync(pgDumpCmd);
        
        backups.push({
          database: db,
          file: backupFile,
          size: await this.getFileSize(backupFile)
        });
      }
      
      // Add support for other databases as needed
    }
    
    return backups;
  }
  
  // Backup filesystems
  private async backupFilesystems(paths: string[], backupDir: string): Promise<any[]> {
    const backups = [];
    
    for (const path of paths) {
      const backupFile = join(backupDir, `filesystem_${path.replace(/\//g, '_')}.tar`);
      
      // Create tar archive
      const tarCmd = `tar -cf ${backupFile} ${path}`;
      await execAsync(tarCmd);
      
      backups.push({
        path: path,
        file: backupFile,
        size: await this.getFileSize(backupFile)
      });
    }
    
    return backups;
  }
  
  // Compress backup
  private async compressBackup(backupPath: string): Promise<string> {
    const compressedPath = `${backupPath}.tar.gz`;
    const compressCmd = `tar -czf ${compressedPath} -C ${this.backupPath} ${backupPath.split('/').pop()}`;
    await execAsync(compressCmd);
    
    // Remove uncompressed directory
    await execAsync(`rm -rf ${backupPath}`);
    
    return compressedPath;
  }
  
  // Encrypt backup
  private async encryptBackup(backupPath: string): Promise<string> {
    const encryptedPath = `${backupPath}.enc`;
    const password = process.env.BACKUP_ENCRYPTION_KEY || 'default-key';
    
    const encryptCmd = `openssl enc -aes-256-cbc -salt -in ${backupPath} -out ${encryptedPath} -k ${password}`;
    await execAsync(encryptCmd);
    
    // Remove unencrypted file
    await execAsync(`rm -f ${backupPath}`);
    
    return encryptedPath;
  }
  
  // Upload backup to destination
  private async uploadBackup(
    backupPath: string,
    destination: BackupDestination,
    job: BackupJob
  ): Promise<void> {
    switch (destination.type) {
      case 's3':
        await this.uploadToS3(backupPath, destination.config, job);
        break;
      case 'azure':
        await this.uploadToAzure(backupPath, destination.config, job);
        break;
      case 'gcs':
        await this.uploadToGCS(backupPath, destination.config, job);
        break;
      case 'ftp':
        await this.uploadToFTP(backupPath, destination.config, job);
        break;
      case 'local':
        // Already saved locally
        break;
    }
  }
  
  // Upload to S3
  private async uploadToS3(
    backupPath: string,
    config: Record<string, any>,
    job: BackupJob
  ): Promise<void> {
    const fileContent = await readFile(backupPath);
    const key = `backups/${job.id}/${backupPath.split('/').pop()}`;
    
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: fileContent,
      ServerSideEncryption: 'AES256',
      Metadata: {
        backupId: job.id,
        timestamp: job.startTime.toISOString(),
        checksum: job.checksum || ''
      }
    });
    
    await this.s3Client.send(command);
  }
  
  // Upload to Azure Blob Storage
  private async uploadToAzure(
    backupPath: string,
    config: Record<string, any>,
    job: BackupJob
  ): Promise<void> {
    // Azure Blob Storage implementation
  }
  
  // Upload to Google Cloud Storage
  private async uploadToGCS(
    backupPath: string,
    config: Record<string, any>,
    job: BackupJob
  ): Promise<void> {
    // Google Cloud Storage implementation
  }
  
  // Upload to FTP
  private async uploadToFTP(
    backupPath: string,
    config: Record<string, any>,
    job: BackupJob
  ): Promise<void> {
    // FTP implementation
  }
  
  // Restore from backup
  async restoreFromBackup(recoveryPointId: string): Promise<void> {
    try {
      // Find recovery point
      const recoveryPoint = await this.getRecoveryPoint(recoveryPointId);
      if (!recoveryPoint) {
        throw new Error('Recovery point not found');
      }
      
      // Verify backup integrity
      const isValid = await this.verifyBackupIntegrity(recoveryPoint);
      if (!isValid) {
        throw new Error('Backup integrity check failed');
      }
      
      // Create restore directory
      const restoreDir = join(this.backupPath, 'restore', recoveryPointId);
      await mkdir(restoreDir, { recursive: true });
      
      // Download backup if remote
      const localPath = await this.downloadBackup(recoveryPoint, restoreDir);
      
      // Decrypt if needed
      let workingPath = localPath;
      if (localPath.endsWith('.enc')) {
        workingPath = await this.decryptBackup(localPath);
      }
      
      // Decompress if needed
      if (workingPath.endsWith('.tar.gz')) {
        workingPath = await this.decompressBackup(workingPath, restoreDir);
      }
      
      // Read manifest
      const manifestPath = join(workingPath, 'manifest.json');
      const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
      
      // Restore databases
      await this.restoreDatabases(manifest.databases, workingPath);
      
      // Restore filesystems
      await this.restoreFilesystems(manifest.filesystems, workingPath);
      
      // Log successful restore
      await auditLogger.log({
        action: 'backup.restored',
        resourceType: 'system',
        resourceId: recoveryPointId,
        userId: 'system',
        details: {
          timestamp: recoveryPoint.timestamp,
          type: recoveryPoint.type
        }
      });
      
    } catch (error) {
      await auditLogger.log({
        action: 'backup.restore_failed',
        resourceType: 'system',
        resourceId: recoveryPointId,
        userId: 'system',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      throw error;
    }
  }
  
  // Get recovery points
  async getRecoveryPoints(): Promise<RecoveryPoint[]> {
    const points: RecoveryPoint[] = [];
    
    // Check local backups
    const localBackups = await this.getLocalBackups();
    points.push(...localBackups);
    
    // Check remote backups
    const remoteBackups = await this.getRemoteBackups();
    points.push(...remoteBackups);
    
    // Sort by timestamp
    return points.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // Get specific recovery point
  private async getRecoveryPoint(id: string): Promise<RecoveryPoint | null> {
    const points = await this.getRecoveryPoints();
    return points.find(p => p.id === id) || null;
  }
  
  // Verify backup integrity
  private async verifyBackupIntegrity(recoveryPoint: RecoveryPoint): Promise<boolean> {
    try {
      // Download if remote
      const localPath = await this.downloadBackup(recoveryPoint, '/tmp');
      
      // Calculate checksum
      const calculatedChecksum = await this.calculateChecksum(localPath);
      
      // Verify checksum matches
      return calculatedChecksum === recoveryPoint.checksum;
    } catch (error) {
      console.error('Backup integrity check failed:', error);
      return false;
    }
  }
  
  // Download backup from remote location
  private async downloadBackup(
    recoveryPoint: RecoveryPoint,
    targetDir: string
  ): Promise<string> {
    if (recoveryPoint.location.startsWith('s3://')) {
      return this.downloadFromS3(recoveryPoint, targetDir);
    }
    
    // For local backups, return the path
    return recoveryPoint.location;
  }
  
  // Download from S3
  private async downloadFromS3(
    recoveryPoint: RecoveryPoint,
    targetDir: string
  ): Promise<string> {
    const s3Path = recoveryPoint.location.replace('s3://', '');
    const [bucket, ...keyParts] = s3Path.split('/');
    const key = keyParts.join('/');
    
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    const response = await this.s3Client.send(command);
    const localPath = join(targetDir, key.split('/').pop() || 'backup');
    
    if (response.Body) {
      const bodyContents = await response.Body.transformToByteArray();
      await writeFile(localPath, bodyContents);
    }
    
    return localPath;
  }
  
  // Decrypt backup
  private async decryptBackup(encryptedPath: string): Promise<string> {
    const decryptedPath = encryptedPath.replace('.enc', '');
    const password = process.env.BACKUP_ENCRYPTION_KEY || 'default-key';
    
    const decryptCmd = `openssl enc -d -aes-256-cbc -in ${encryptedPath} -out ${decryptedPath} -k ${password}`;
    await execAsync(decryptCmd);
    
    return decryptedPath;
  }
  
  // Decompress backup
  private async decompressBackup(compressedPath: string, targetDir: string): Promise<string> {
    const decompressCmd = `tar -xzf ${compressedPath} -C ${targetDir}`;
    await execAsync(decompressCmd);
    
    // Find the extracted directory
    const extractedDir = join(targetDir, compressedPath.split('/').pop()?.replace('.tar.gz', '') || 'backup');
    return extractedDir;
  }
  
  // Restore databases
  private async restoreDatabases(databases: any[], backupDir: string): Promise<void> {
    for (const db of databases) {
      if (db.database === 'postgres') {
        const restoreCmd = `psql ${process.env.DATABASE_URL} < ${join(backupDir, db.file.split('/').pop())}`;
        await execAsync(restoreCmd);
      }
      // Add support for other databases
    }
  }
  
  // Restore filesystems
  private async restoreFilesystems(filesystems: any[], backupDir: string): Promise<void> {
    for (const fs of filesystems) {
      const tarFile = join(backupDir, fs.file.split('/').pop());
      const restoreCmd = `tar -xf ${tarFile} -C /`;
      await execAsync(restoreCmd);
    }
  }
  
  // Calculate checksum
  private async calculateChecksum(filePath: string): Promise<string> {
    const fileContent = await readFile(filePath);
    return createHash('sha256').update(fileContent).digest('hex');
  }
  
  // Get file size
  private async getFileSize(filePath: string): Promise<number> {
    const { stdout } = await execAsync(`stat -c%s "${filePath}"`);
    return parseInt(stdout.trim());
  }
  
  // Get backup size
  private async getBackupSize(path: string): Promise<number> {
    if (path.endsWith('.tar.gz') || path.endsWith('.enc')) {
      return this.getFileSize(path);
    }
    
    const { stdout } = await execAsync(`du -sb ${path} | cut -f1`);
    return parseInt(stdout.trim());
  }
  
  // Get local backups
  private async getLocalBackups(): Promise<RecoveryPoint[]> {
    const points: RecoveryPoint[] = [];
    
    try {
      const { stdout } = await execAsync(`find ${this.backupPath} -name "backup_*" -type d -o -name "*.tar.gz" -o -name "*.enc"`);
      const files = stdout.trim().split('\n').filter(Boolean);
      
      for (const file of files) {
        const stats = await execAsync(`stat -c '%Y %s' "${file}"`);
        const [timestamp, size] = stats.stdout.trim().split(' ');
        
        const id = file.split('/').pop()?.split('.')[0] || '';
        
        points.push({
          id,
          timestamp: new Date(parseInt(timestamp) * 1000),
          type: 'full',
          size: parseInt(size),
          location: file,
          checksum: await this.calculateChecksum(file),
          verified: true
        });
      }
    } catch (error) {
      console.error('Error getting local backups:', error);
    }
    
    return points;
  }
  
  // Get remote backups
  private async getRemoteBackups(): Promise<RecoveryPoint[]> {
    const points: RecoveryPoint[] = [];
    
    // Check S3 backups
    try {
      const command = new ListObjectsV2Command({
        Bucket: process.env.BACKUP_S3_BUCKET || '',
        Prefix: 'backups/'
      });
      
      const response = await this.s3Client.send(command);
      
      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key && object.LastModified && object.Size) {
            const id = object.Key.split('/')[1] || '';
            
            points.push({
              id,
              timestamp: object.LastModified,
              type: 'full',
              size: object.Size,
              location: `s3://${process.env.BACKUP_S3_BUCKET}/${object.Key}`,
              checksum: object.ETag?.replace(/"/g, '') || '',
              verified: false
            });
          }
        }
      }
    } catch (error) {
      console.error('Error getting S3 backups:', error);
    }
    
    return points;
  }
  
  // Schedule retention cleanup
  private scheduleRetentionCleanup(config: BackupConfig): void {
    setTimeout(async () => {
      await this.cleanupOldBackups(config.retention);
    }, 60 * 60 * 1000); // Run after 1 hour
  }
  
  // Cleanup old backups based on retention policy
  private async cleanupOldBackups(retention: BackupConfig['retention']): Promise<void> {
    const points = await this.getRecoveryPoints();
    const now = new Date();
    
    for (const point of points) {
      const age = now.getTime() - point.timestamp.getTime();
      const days = age / (1000 * 60 * 60 * 24);
      
      let shouldDelete = false;
      
      // Determine if backup should be deleted based on retention policy
      if (days <= 1 && points.filter(p => {
        const pAge = (now.getTime() - p.timestamp.getTime()) / (1000 * 60 * 60);
        return pAge <= 24;
      }).length > retention.hourly) {
        shouldDelete = true;
      } else if (days <= 7 && points.filter(p => {
        const pAge = (now.getTime() - p.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return pAge <= 7;
      }).length > retention.daily) {
        shouldDelete = true;
      } else if (days <= 30 && points.filter(p => {
        const pAge = (now.getTime() - p.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return pAge <= 30;
      }).length > retention.weekly) {
        shouldDelete = true;
      } else if (days > 30 && points.filter(p => {
        const pAge = (now.getTime() - p.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return pAge > 30;
      }).length > retention.monthly) {
        shouldDelete = true;
      }
      
      if (shouldDelete) {
        await this.deleteBackup(point);
      }
    }
  }
  
  // Delete a backup
  private async deleteBackup(point: RecoveryPoint): Promise<void> {
    try {
      if (point.location.startsWith('s3://')) {
        const s3Path = point.location.replace('s3://', '');
        const [bucket, ...keyParts] = s3Path.split('/');
        const key = keyParts.join('/');
        
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: bucket,
          Key: key
        }));
      } else {
        // Delete local backup
        await execAsync(`rm -rf ${point.location}`);
      }
      
      await auditLogger.log({
        action: 'backup.deleted',
        resourceType: 'system',
        resourceId: point.id,
        userId: 'system',
        details: {
          timestamp: point.timestamp,
          size: point.size,
          reason: 'retention_policy'
        }
      });
    } catch (error) {
      console.error('Error deleting backup:', error);
    }
  }
  
  // Test disaster recovery procedure
  async testDisasterRecovery(): Promise<{
    success: boolean;
    results: Array<{
      test: string;
      passed: boolean;
      duration: number;
      error?: string;
    }>;
  }> {
    const results = [];
    const startTime = Date.now();
    
    // Test 1: Create test backup
    const backupTest = await this.runTest('Create Test Backup', async () => {
      const config: BackupConfig = {
        schedule: 'daily',
        retention: { hourly: 24, daily: 7, weekly: 4, monthly: 12 },
        encryption: true,
        compression: true,
        destinations: [{ type: 'local', config: {}, enabled: true }],
        databases: ['postgres'],
        filesystems: ['/tmp/vibelux-test']
      };
      
      const job = await this.createBackup(config);
      return job.status === 'completed';
    });
    results.push(backupTest);
    
    // Test 2: List recovery points
    const listTest = await this.runTest('List Recovery Points', async () => {
      const points = await this.getRecoveryPoints();
      return points.length > 0;
    });
    results.push(listTest);
    
    // Test 3: Verify backup integrity
    const integrityTest = await this.runTest('Verify Backup Integrity', async () => {
      const points = await this.getRecoveryPoints();
      if (points.length === 0) return false;
      
      return await this.verifyBackupIntegrity(points[0]);
    });
    results.push(integrityTest);
    
    // Test 4: Test S3 connectivity (if configured)
    if (process.env.BACKUP_S3_BUCKET) {
      const s3Test = await this.runTest('S3 Connectivity', async () => {
        const command = new ListObjectsV2Command({
          Bucket: process.env.BACKUP_S3_BUCKET,
          MaxKeys: 1
        });
        
        await this.s3Client.send(command);
        return true;
      });
      results.push(s3Test);
    }
    
    const success = results.every(r => r.passed);
    
    return { success, results };
  }
  
  // Run individual test
  private async runTest(
    testName: string,
    testFn: () => Promise<boolean>
  ): Promise<{
    test: string;
    passed: boolean;
    duration: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const passed = await testFn();
      return {
        test: testName,
        passed,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        test: testName,
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const disasterRecovery = new DisasterRecoveryManager();

// Export DeleteObjectCommand for the delete operation
import { DeleteObjectCommand } from '@aws-sdk/client-s3';