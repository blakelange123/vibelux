// Update Management System for Visual Operations Intelligence
// Handles feature rollouts, subscription changes, and user notifications

import { prisma } from '@/lib/db';
import { emailService } from '@/lib/email/email-service';

export interface Update {
  id: string;
  version: string;
  title: string;
  description: string;
  type: 'feature' | 'improvement' | 'bugfix' | 'security' | 'breaking';
  severity: 'minor' | 'major' | 'critical';
  affectedPlans: string[];
  rolloutPercentage: number;
  scheduledFor: Date;
  releasedAt?: Date;
  features: {
    added: string[];
    changed: string[];
    deprecated: string[];
    removed: string[];
  };
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  allowedPlans: string[];
  targetUsers?: string[];
  expiresAt?: Date;
}

export class UpdateManager {
  // Check if user has access to a feature flag
  static async hasFeatureAccess(userId: string, featureFlag: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { 
          subscription: true,
          featureOverrides: {
            where: { 
              feature: featureFlag,
              enabled: true,
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ]
            }
          }
        }
      });

      if (!user) return false;

      // Check for grandfathered/override access
      if (user.featureOverrides.length > 0) {
        return true;
      }

      // Get feature flag configuration
      const flag = await prisma.featureFlag.findUnique({
        where: { name: featureFlag }
      });

      if (!flag || !flag.enabled) return false;

      // Check plan access
      if (!flag.allowedPlans.includes(user.subscriptionTier || 'free')) {
        return false;
      }

      // Check rollout percentage
      if (flag.rolloutPercentage < 100) {
        const userHash = this.hashUserId(userId);
        const userPercentile = userHash % 100;
        if (userPercentile >= flag.rolloutPercentage) {
          return false;
        }
      }

      // Check target users (if specified)
      if (flag.targetUsers && flag.targetUsers.length > 0) {
        return flag.targetUsers.includes(userId);
      }

      return true;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  // Handle subscription plan changes during updates
  static async handlePlanUpdate(
    userId: string,
    oldPlan: string,
    newPlan: string,
    isUpgrade: boolean
  ): Promise<void> {
    try {
      // Log the plan change
      await prisma.auditLog.create({
        data: {
          userId,
          action: isUpgrade ? 'PLAN_UPGRADED' : 'PLAN_DOWNGRADED',
          resourceType: 'subscription',
          resourceId: userId,
          metadata: {
            oldPlan,
            newPlan,
            timestamp: new Date().toISOString()
          },
          createdAt: new Date()
        }
      });

      // Handle feature access changes
      if (!isUpgrade) {
        // Downgrade - check for features to remove
        await this.handleFeatureDowngrade(userId, oldPlan, newPlan);
      } else {
        // Upgrade - grant new features
        await this.handleFeatureUpgrade(userId, oldPlan, newPlan);
      }

      // Send notification
      await this.notifyPlanChange(userId, oldPlan, newPlan, isUpgrade);

    } catch (error) {
      console.error('Error handling plan update:', error);
      throw error;
    }
  }

  // Grandfather features when downgrading
  static async handleFeatureDowngrade(
    userId: string,
    oldPlan: string,
    newPlan: string
  ): Promise<void> {
    const removedFeatures = this.getRemovedFeatures(oldPlan, newPlan);
    
    for (const feature of removedFeatures) {
      // Check if user has been using this feature
      const usage = await this.getFeatureUsage(userId, feature);
      
      if (usage.hasUsed && usage.lastUsed > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        // Grandfather for 90 days if actively used in last 30 days
        await prisma.userFeatureOverride.create({
          data: {
            userId,
            feature,
            enabled: true,
            reason: 'downgrade_protection',
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            createdAt: new Date()
          }
        });

        // Notify user about temporary access
        await this.notifyFeatureGrandfathering(userId, feature, 90);
      }
    }
  }

  // Grant new features on upgrade
  static async handleFeatureUpgrade(
    userId: string,
    oldPlan: string,
    newPlan: string
  ): Promise<void> {
    const newFeatures = this.getNewFeatures(oldPlan, newPlan);
    
    // Create notification for new features
    if (newFeatures.length > 0) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'feature_unlock',
          title: 'New Features Unlocked!',
          message: `Your upgrade to ${newPlan} includes: ${newFeatures.join(', ')}`,
          ctaText: 'Explore Features',
          ctaUrl: '/features',
          createdAt: new Date()
        }
      });
    }
  }

  // Deploy a new update with gradual rollout
  static async deployUpdate(update: Update): Promise<void> {
    try {
      // Create update record
      await prisma.systemUpdate.create({
        data: {
          version: update.version,
          title: update.title,
          description: update.description,
          type: update.type,
          severity: update.severity,
          affectedPlans: update.affectedPlans,
          rolloutPercentage: update.rolloutPercentage,
          scheduledFor: update.scheduledFor,
          releasedAt: new Date(),
          features: update.features
        }
      });

      // Update feature flags for gradual rollout
      for (const feature of update.features.added) {
        await this.createOrUpdateFeatureFlag({
          name: feature,
          description: `New feature from ${update.version}`,
          enabled: true,
          rolloutPercentage: update.rolloutPercentage,
          allowedPlans: update.affectedPlans
        });
      }

      // Notify affected users
      await this.notifyUsersOfUpdate(update);

      console.log(`Update ${update.version} deployed with ${update.rolloutPercentage}% rollout`);
    } catch (error) {
      console.error('Error deploying update:', error);
      throw error;
    }
  }

  // Notify users about updates
  static async notifyUsersOfUpdate(update: Update): Promise<void> {
    const affectedUsers = await this.getAffectedUsers(update.affectedPlans);
    
    for (const user of affectedUsers) {
      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'system_update',
          title: update.title,
          message: update.description,
          ctaText: 'View Changelog',
          ctaUrl: `/changelog#${update.version}`,
          createdAt: new Date()
        }
      });

      // Send email for major updates
      if (update.severity === 'major' || update.severity === 'critical') {
        await emailService.sendEmail({
          to: user.email,
          subject: `Important Update: ${update.title}`,
          template: 'system-update',
          data: {
            name: user.name || 'User',
            update,
            changelogUrl: `${process.env.NEXTAUTH_URL}/changelog#${update.version}`
          }
        });
      }
    }
  }

  // Create or update a feature flag
  static async createOrUpdateFeatureFlag(flag: Partial<FeatureFlag>): Promise<void> {
    await prisma.featureFlag.upsert({
      where: { name: flag.name! },
      update: {
        description: flag.description,
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage,
        allowedPlans: flag.allowedPlans,
        targetUsers: flag.targetUsers,
        expiresAt: flag.expiresAt,
        updatedAt: new Date()
      },
      create: {
        name: flag.name!,
        description: flag.description!,
        enabled: flag.enabled ?? true,
        rolloutPercentage: flag.rolloutPercentage ?? 100,
        allowedPlans: flag.allowedPlans ?? ['free'],
        targetUsers: flag.targetUsers,
        expiresAt: flag.expiresAt,
        createdAt: new Date()
      }
    });
  }

  // Increase rollout percentage for a feature
  static async increaseRollout(featureName: string, newPercentage: number): Promise<void> {
    await prisma.featureFlag.update({
      where: { name: featureName },
      data: { 
        rolloutPercentage: newPercentage,
        updatedAt: new Date()
      }
    });

    console.log(`Increased rollout for ${featureName} to ${newPercentage}%`);
  }

  // Emergency disable a feature
  static async emergencyDisable(featureName: string, reason: string): Promise<void> {
    await prisma.featureFlag.update({
      where: { name: featureName },
      data: { 
        enabled: false,
        updatedAt: new Date()
      }
    });

    // Log the emergency disable
    await prisma.auditLog.create({
      data: {
        action: 'FEATURE_EMERGENCY_DISABLED',
        resourceType: 'feature_flag',
        resourceId: featureName,
        metadata: { reason },
        createdAt: new Date()
      }
    });

    console.log(`Emergency disabled feature: ${featureName} - ${reason}`);
  }

  // Helper methods
  private static hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private static getRemovedFeatures(oldPlan: string, newPlan: string): string[] {
    // Implementation depends on your feature matrix
    const featureMatrix = {
      free: ['basic_features'],
      starter: ['basic_features', 'advanced_analytics'],
      professional: ['basic_features', 'advanced_analytics', 'api_access', 'multi_user'],
      business: ['basic_features', 'advanced_analytics', 'api_access', 'multi_user', 'white_label'],
      enterprise: ['all_features']
    };

    const oldFeatures = featureMatrix[oldPlan] || [];
    const newFeatures = featureMatrix[newPlan] || [];
    
    return oldFeatures.filter(feature => !newFeatures.includes(feature));
  }

  private static getNewFeatures(oldPlan: string, newPlan: string): string[] {
    const featureMatrix = {
      free: ['basic_features'],
      starter: ['basic_features', 'advanced_analytics'],
      professional: ['basic_features', 'advanced_analytics', 'api_access', 'multi_user'],
      business: ['basic_features', 'advanced_analytics', 'api_access', 'multi_user', 'white_label'],
      enterprise: ['all_features']
    };

    const oldFeatures = featureMatrix[oldPlan] || [];
    const newFeatures = featureMatrix[newPlan] || [];
    
    return newFeatures.filter(feature => !oldFeatures.includes(feature));
  }

  private static async getFeatureUsage(userId: string, feature: string) {
    // Check usage logs
    const usage = await prisma.usageRecord.findFirst({
      where: {
        userId,
        feature
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      hasUsed: !!usage,
      lastUsed: usage?.createdAt || null
    };
  }

  private static async getAffectedUsers(affectedPlans: string[]) {
    return await prisma.user.findMany({
      where: {
        subscriptionTier: {
          in: affectedPlans
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true
      }
    });
  }

  private static async notifyPlanChange(
    userId: string,
    oldPlan: string,
    newPlan: string,
    isUpgrade: boolean
  ): Promise<void> {
    await prisma.notification.create({
      data: {
        userId,
        type: 'plan_change',
        title: isUpgrade ? 'Plan Upgraded!' : 'Plan Changed',
        message: `Your plan has been ${isUpgrade ? 'upgraded' : 'changed'} from ${oldPlan} to ${newPlan}`,
        ctaText: 'View Features',
        ctaUrl: '/dashboard/subscription',
        createdAt: new Date()
      }
    });
  }

  private static async notifyFeatureGrandfathering(
    userId: string,
    feature: string,
    days: number
  ): Promise<void> {
    await prisma.notification.create({
      data: {
        userId,
        type: 'feature_temporary',
        title: 'Temporary Feature Access',
        message: `You have ${days} days of continued access to ${feature} after your plan change`,
        ctaText: 'Upgrade Plan',
        ctaUrl: '/pricing',
        createdAt: new Date()
      }
    });
  }
}