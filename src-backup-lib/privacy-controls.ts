// Privacy controls and data retention for tracking system
import { prisma } from './prisma';

export interface PrivacySettings {
  userId: string;
  facilityId: string;
  locationSharingEnabled: boolean;
  locationRetentionDays: number; // How long to keep location data
  allowRealTimeTracking: boolean;
  allowHistoricalAccess: boolean;
  shareWithSupervisors: boolean;
  shareWithPeers: boolean;
  anonymizeInReports: boolean;
  dataDeletionRequested: boolean;
  deletionScheduledDate?: Date;
  consentVersion: string;
  consentDate: Date;
  lastUpdated: Date;
}

export interface DataRetentionPolicy {
  facilityId: string;
  locationDataRetentionDays: number;
  messageRetentionDays: number;
  alertRetentionDays: number;
  inactiveUserDataRetentionDays: number;
  automaticDeletionEnabled: boolean;
  complianceRequirements: string[];
  lastReviewDate: Date;
}

export class PrivacyControlsService {
  /**
   * Get user privacy settings
   */
  static async getUserPrivacySettings(userId: string, facilityId: string): Promise<PrivacySettings | null> {
    const settings = await prisma.userPrivacySettings.findFirst({
      where: {
        userId,
        facilityId
      }
    });

    if (!settings) {
      // Create default privacy settings
      return await this.createDefaultPrivacySettings(userId, facilityId);
    }

    return {
      userId: settings.userId,
      facilityId: settings.facilityId,
      locationSharingEnabled: settings.locationSharingEnabled,
      locationRetentionDays: settings.locationRetentionDays,
      allowRealTimeTracking: settings.allowRealTimeTracking,
      allowHistoricalAccess: settings.allowHistoricalAccess,
      shareWithSupervisors: settings.shareWithSupervisors,
      shareWithPeers: settings.shareWithPeers,
      anonymizeInReports: settings.anonymizeInReports,
      dataDeletionRequested: settings.dataDeletionRequested,
      deletionScheduledDate: settings.deletionScheduledDate,
      consentVersion: settings.consentVersion,
      consentDate: settings.consentDate,
      lastUpdated: settings.lastUpdated
    };
  }

  /**
   * Update user privacy settings
   */
  static async updatePrivacySettings(
    userId: string, 
    facilityId: string, 
    updates: Partial<PrivacySettings>
  ): Promise<PrivacySettings> {
    const updated = await prisma.userPrivacySettings.upsert({
      where: {
        userId_facilityId: {
          userId,
          facilityId
        }
      },
      update: {
        ...updates,
        lastUpdated: new Date()
      },
      create: {
        userId,
        facilityId,
        locationSharingEnabled: updates.locationSharingEnabled ?? true,
        locationRetentionDays: updates.locationRetentionDays ?? 90,
        allowRealTimeTracking: updates.allowRealTimeTracking ?? true,
        allowHistoricalAccess: updates.allowHistoricalAccess ?? true,
        shareWithSupervisors: updates.shareWithSupervisors ?? true,
        shareWithPeers: updates.shareWithPeers ?? false,
        anonymizeInReports: updates.anonymizeInReports ?? false,
        dataDeletionRequested: updates.dataDeletionRequested ?? false,
        deletionScheduledDate: updates.deletionScheduledDate,
        consentVersion: updates.consentVersion ?? '1.0',
        consentDate: updates.consentDate ?? new Date(),
        lastUpdated: new Date()
      }
    });

    return {
      userId: updated.userId,
      facilityId: updated.facilityId,
      locationSharingEnabled: updated.locationSharingEnabled,
      locationRetentionDays: updated.locationRetentionDays,
      allowRealTimeTracking: updated.allowRealTimeTracking,
      allowHistoricalAccess: updated.allowHistoricalAccess,
      shareWithSupervisors: updated.shareWithSupervisors,
      shareWithPeers: updated.shareWithPeers,
      anonymizeInReports: updated.anonymizeInReports,
      dataDeletionRequested: updated.dataDeletionRequested,
      deletionScheduledDate: updated.deletionScheduledDate,
      consentVersion: updated.consentVersion,
      consentDate: updated.consentDate,
      lastUpdated: updated.lastUpdated
    };
  }

  /**
   * Check if user has given required consent
   */
  static async hasValidConsent(userId: string, facilityId: string): Promise<boolean> {
    const settings = await this.getUserPrivacySettings(userId, facilityId);
    if (!settings) return false;

    // Check if consent is recent (within last year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return settings.consentDate > oneYearAgo && !settings.dataDeletionRequested;
  }

  /**
   * Request data deletion (GDPR right to be forgotten)
   */
  static async requestDataDeletion(userId: string, facilityId: string): Promise<void> {
    // Schedule deletion for 30 days from now (grace period)
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    await this.updatePrivacySettings(userId, facilityId, {
      dataDeletionRequested: true,
      deletionScheduledDate: deletionDate,
      locationSharingEnabled: false,
      allowRealTimeTracking: false,
      allowHistoricalAccess: false
    });

    // Log the deletion request
    await prisma.dataRetentionLog.create({
      data: {
        userId,
        facilityId,
        action: 'DELETION_REQUESTED',
        scheduledDate: deletionDate,
        reason: 'User requested data deletion',
        status: 'PENDING'
      }
    });
  }

  /**
   * Cancel data deletion request
   */
  static async cancelDataDeletion(userId: string, facilityId: string): Promise<void> {
    await this.updatePrivacySettings(userId, facilityId, {
      dataDeletionRequested: false,
      deletionScheduledDate: null
    });

    // Update the log
    await prisma.dataRetentionLog.updateMany({
      where: {
        userId,
        facilityId,
        action: 'DELETION_REQUESTED',
        status: 'PENDING'
      },
      data: {
        status: 'CANCELLED',
        completedDate: new Date()
      }
    });
  }

  /**
   * Check if user's data can be accessed for tracking
   */
  static async canAccessTrackingData(
    targetUserId: string,
    requestingUserId: string,
    facilityId: string,
    dataType: 'real-time' | 'historical'
  ): Promise<boolean> {
    // Users can always access their own data
    if (targetUserId === requestingUserId) return true;

    const targetSettings = await this.getUserPrivacySettings(targetUserId, facilityId);
    if (!targetSettings) return false;

    // Check if tracking is enabled
    if (dataType === 'real-time' && !targetSettings.allowRealTimeTracking) return false;
    if (dataType === 'historical' && !targetSettings.allowHistoricalAccess) return false;

    // Check if data deletion was requested
    if (targetSettings.dataDeletionRequested) return false;

    // Check facility access level
    const requestingUser = await prisma.facilityUser.findFirst({
      where: {
        userId: requestingUserId,
        facilityId
      }
    });

    if (!requestingUser) return false;

    // Supervisors can access data if user allows
    if (requestingUser.role === 'SUPERVISOR' || requestingUser.role === 'ADMIN') {
      return targetSettings.shareWithSupervisors;
    }

    // Peers can access data if user allows
    return targetSettings.shareWithPeers;
  }

  /**
   * Create default privacy settings for new user
   */
  private static async createDefaultPrivacySettings(userId: string, facilityId: string): Promise<PrivacySettings> {
    return await this.updatePrivacySettings(userId, facilityId, {
      locationSharingEnabled: true,
      locationRetentionDays: 90,
      allowRealTimeTracking: true,
      allowHistoricalAccess: true,
      shareWithSupervisors: true,
      shareWithPeers: false,
      anonymizeInReports: false,
      dataDeletionRequested: false,
      consentVersion: '1.0',
      consentDate: new Date()
    });
  }
}

export class DataRetentionService {
  /**
   * Get facility data retention policy
   */
  static async getFacilityPolicy(facilityId: string): Promise<DataRetentionPolicy | null> {
    const policy = await prisma.dataRetentionPolicy.findFirst({
      where: { facilityId }
    });

    if (!policy) {
      // Create default policy
      return await this.createDefaultPolicy(facilityId);
    }

    return {
      facilityId: policy.facilityId,
      locationDataRetentionDays: policy.locationDataRetentionDays,
      messageRetentionDays: policy.messageRetentionDays,
      alertRetentionDays: policy.alertRetentionDays,
      inactiveUserDataRetentionDays: policy.inactiveUserDataRetentionDays,
      automaticDeletionEnabled: policy.automaticDeletionEnabled,
      complianceRequirements: policy.complianceRequirements || [],
      lastReviewDate: policy.lastReviewDate
    };
  }

  /**
   * Execute automated data retention cleanup
   */
  static async executeRetentionCleanup(): Promise<{
    locationsDeleted: number;
    messagesDeleted: number;
    alertsDeleted: number;
  }> {
    const results = {
      locationsDeleted: 0,
      messagesDeleted: 0,
      alertsDeleted: 0
    };

    // Get all facilities with retention policies
    const policies = await prisma.dataRetentionPolicy.findMany({
      where: { automaticDeletionEnabled: true }
    });

    for (const policy of policies) {
      // Delete old location data
      const locationCutoff = new Date();
      locationCutoff.setDate(locationCutoff.getDate() - policy.locationDataRetentionDays);
      
      const deletedLocations = await prisma.locationUpdate.deleteMany({
        where: {
          facilityId: policy.facilityId,
          timestamp: { lt: locationCutoff }
        }
      });
      results.locationsDeleted += deletedLocations.count;

      // Delete old messages
      const messageCutoff = new Date();
      messageCutoff.setDate(messageCutoff.getDate() - policy.messageRetentionDays);
      
      const deletedMessages = await prisma.trackingMessage.deleteMany({
        where: {
          facilityId: policy.facilityId,
          timestamp: { lt: messageCutoff }
        }
      });
      results.messagesDeleted += deletedMessages.count;

      // Delete old alerts
      const alertCutoff = new Date();
      alertCutoff.setDate(alertCutoff.getDate() - policy.alertRetentionDays);
      
      const deletedAlerts = await prisma.trackingAlert.deleteMany({
        where: {
          facilityId: policy.facilityId,
          timestamp: { lt: alertCutoff }
        }
      });
      results.alertsDeleted += deletedAlerts.count;

      // Log the cleanup
      await prisma.dataRetentionLog.create({
        data: {
          facilityId: policy.facilityId,
          action: 'AUTOMATED_CLEANUP',
          completedDate: new Date(),
          reason: 'Scheduled data retention cleanup',
          status: 'COMPLETED',
          metadata: {
            locationsDeleted: deletedLocations.count,
            messagesDeleted: deletedMessages.count,
            alertsDeleted: deletedAlerts.count
          }
        }
      });
    }

    return results;
  }

  /**
   * Execute user data deletion requests
   */
  static async executeUserDataDeletions(): Promise<number> {
    const now = new Date();
    let deletionsExecuted = 0;

    // Find users with scheduled deletions that are due
    const pendingDeletions = await prisma.userPrivacySettings.findMany({
      where: {
        dataDeletionRequested: true,
        deletionScheduledDate: { lte: now }
      }
    });

    for (const userSettings of pendingDeletions) {
      try {
        // Delete all user tracking data
        await prisma.$transaction([
          // Delete location updates
          prisma.locationUpdate.deleteMany({
            where: {
              userId: userSettings.userId,
              facilityId: userSettings.facilityId
            }
          }),
          // Delete messages
          prisma.trackingMessage.deleteMany({
            where: {
              OR: [
                { fromUser: userSettings.userId, facilityId: userSettings.facilityId },
                { toUser: userSettings.userId, facilityId: userSettings.facilityId }
              ]
            }
          }),
          // Delete alerts
          prisma.trackingAlert.deleteMany({
            where: {
              userId: userSettings.userId,
              facilityId: userSettings.facilityId
            }
          }),
          // Delete location sharing records
          prisma.locationSharing.deleteMany({
            where: {
              OR: [
                { fromUserId: userSettings.userId, facilityId: userSettings.facilityId },
                { toUserId: userSettings.userId, facilityId: userSettings.facilityId }
              ]
            }
          }),
          // Delete privacy settings
          prisma.userPrivacySettings.delete({
            where: {
              userId_facilityId: {
                userId: userSettings.userId,
                facilityId: userSettings.facilityId
              }
            }
          })
        ]);

        // Log the deletion
        await prisma.dataRetentionLog.create({
          data: {
            userId: userSettings.userId,
            facilityId: userSettings.facilityId,
            action: 'USER_DATA_DELETED',
            completedDate: now,
            reason: 'User requested data deletion',
            status: 'COMPLETED'
          }
        });

        deletionsExecuted++;
      } catch (error) {
        console.error(`Failed to delete data for user ${userSettings.userId}:`, error);
        
        // Log the failure
        await prisma.dataRetentionLog.create({
          data: {
            userId: userSettings.userId,
            facilityId: userSettings.facilityId,
            action: 'USER_DATA_DELETION_FAILED',
            completedDate: now,
            reason: 'User requested data deletion',
            status: 'FAILED',
            metadata: { error: error.message }
          }
        });
      }
    }

    return deletionsExecuted;
  }

  /**
   * Create default retention policy
   */
  private static async createDefaultPolicy(facilityId: string): Promise<DataRetentionPolicy> {
    const policy = await prisma.dataRetentionPolicy.create({
      data: {
        facilityId,
        locationDataRetentionDays: 90,
        messageRetentionDays: 365,
        alertRetentionDays: 180,
        inactiveUserDataRetentionDays: 1095, // 3 years
        automaticDeletionEnabled: true,
        complianceRequirements: ['GDPR'],
        lastReviewDate: new Date()
      }
    });

    return {
      facilityId: policy.facilityId,
      locationDataRetentionDays: policy.locationDataRetentionDays,
      messageRetentionDays: policy.messageRetentionDays,
      alertRetentionDays: policy.alertRetentionDays,
      inactiveUserDataRetentionDays: policy.inactiveUserDataRetentionDays,
      automaticDeletionEnabled: policy.automaticDeletionEnabled,
      complianceRequirements: policy.complianceRequirements || [],
      lastReviewDate: policy.lastReviewDate
    };
  }
}

// Scheduled job functions (to be called by cron or similar)
export async function runScheduledDataRetention() {
  
  try {
    // Execute retention cleanup
    const cleanupResults = await DataRetentionService.executeRetentionCleanup();
    
    // Execute user deletion requests
    const deletionsExecuted = await DataRetentionService.executeUserDataDeletions();
    
    return {
      success: true,
      cleanupResults,
      deletionsExecuted
    };
  } catch (error) {
    console.error('Scheduled data retention failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}