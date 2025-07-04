// Client-side disaster recovery utilities
// This file contains only client-safe code for the backups page

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
  destinations: string[];
  databases: string[];
  filesystems: string[];
  notificationEmail?: string;
}

export interface BackupJob {
  id: string;
  type: 'MANUAL' | 'SCHEDULED' | 'AUTOMATED';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt: Date;
  completedAt?: Date;
  size?: number;
  location?: string;
  error?: string;
  description?: string;
}

export interface RecoveryPoint {
  id: string;
  timestamp: Date;
  type: string;
  size: number;
  location: string;
  verified: boolean;
  retention: string;
}

// Client-side API wrapper
export const disasterRecoveryClient = {
  async getBackupJobs(): Promise<BackupJob[]> {
    const response = await fetch('/api/admin/backups');
    if (!response.ok) throw new Error('Failed to fetch backup jobs');
    const data = await response.json();
    return data.backupJobs;
  },

  async createBackup(config: { type: string; description?: string }): Promise<BackupJob> {
    const response = await fetch('/api/admin/backups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to create backup');
    const data = await response.json();
    return data.backupJob;
  },

  async getRecoveryPoints(): Promise<RecoveryPoint[]> {
    const response = await fetch('/api/admin/recovery-points');
    if (!response.ok) throw new Error('Failed to fetch recovery points');
    const data = await response.json();
    return data.recoveryPoints;
  },

  async testRecovery(recoveryPointId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/api/admin/test-recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recoveryPointId })
    });
    if (!response.ok) throw new Error('Failed to test recovery');
    return response.json();
  }
};