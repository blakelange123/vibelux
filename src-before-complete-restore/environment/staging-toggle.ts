// Staging Environment Toggle System
// Allows testing new features in production without affecting all users

import { prisma } from '@/lib/db';
import { auditLogger } from '../audit-logger';

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  key: string;
  enabled: boolean;
  enabledInStaging: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  targetGroups?: string[];
  conditions?: FeatureCondition[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface FeatureCondition {
  type: 'user' | 'group' | 'date' | 'custom';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface Environment {
  name: 'production' | 'staging' | 'development';
  apiUrl: string;
  features: Record<string, boolean>;
  config: Record<string, any>;
}

export class StagingToggle {
  private userEnvironments: Map<string, Environment['name']> = new Map();
  private featureCache: Map<string, FeatureFlag> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate = 0;

  // Get current environment for user
  async getUserEnvironment(userId: string): Promise<Environment> {
    // Check if user is in staging
    const userEnv = await prisma.userEnvironment.findUnique({
      where: { userId }
    });

    const envName = userEnv?.environment || 'production';
    
    // Get features for environment
    const features = await this.getFeaturesForEnvironment(envName, userId);
    
    return {
      name: envName,
      apiUrl: this.getApiUrl(envName),
      features,
      config: this.getEnvironmentConfig(envName)
    };
  }

  // Toggle user between environments
  async toggleUserEnvironment(
    userId: string,
    targetEnv: Environment['name'],
    toggledBy: string
  ): Promise<void> {
    const currentEnv = await this.getUserEnvironment(userId);
    
    if (currentEnv.name === targetEnv) {
      return; // Already in target environment
    }

    // Update user environment
    await prisma.userEnvironment.upsert({
      where: { userId },
      update: { 
        environment: targetEnv,
        updatedAt: new Date(),
        updatedBy: toggledBy
      },
      create: {
        userId,
        environment: targetEnv,
        updatedBy: toggledBy
      }
    });

    // Clear cache
    this.userEnvironments.delete(userId);

    // Log the change
    await auditLogger.log({
      action: 'environment.toggled',
      resourceType: 'user',
      resourceId: userId,
      userId: toggledBy,
      details: {
        from: currentEnv.name,
        to: targetEnv
      }
    });
  }

  // Check if feature is enabled for user
  async isFeatureEnabled(
    featureKey: string,
    userId: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    const feature = await this.getFeature(featureKey);
    
    if (!feature) {
      return false; // Feature doesn't exist
    }

    // Get user environment
    const userEnv = await this.getUserEnvironment(userId);

    // Check environment-specific enable status
    if (userEnv.name === 'staging') {
      if (!feature.enabledInStaging) {
        return false;
      }
    } else if (!feature.enabled) {
      return false;
    }

    // Check targeted users
    if (feature.targetUsers && feature.targetUsers.length > 0) {
      return feature.targetUsers.includes(userId);
    }

    // Check user groups
    if (feature.targetGroups && feature.targetGroups.length > 0) {
      const userGroups = await this.getUserGroups(userId);
      const hasTargetGroup = feature.targetGroups.some(group => 
        userGroups.includes(group)
      );
      if (!hasTargetGroup) {
        return false;
      }
    }

    // Check conditions
    if (feature.conditions && feature.conditions.length > 0) {
      const conditionsMet = await this.evaluateConditions(
        feature.conditions,
        userId,
        context
      );
      if (!conditionsMet) {
        return false;
      }
    }

    // Check rollout percentage
    if (feature.rolloutPercentage < 100) {
      const userHash = this.hashUserId(userId, feature.key);
      const threshold = feature.rolloutPercentage / 100;
      return userHash < threshold;
    }

    return true;
  }

  // Create or update feature flag
  async upsertFeatureFlag(
    flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FeatureFlag> {
    const existing = await prisma.featureFlag.findUnique({
      where: { key: flag.key }
    });

    let result: FeatureFlag;

    if (existing) {
      result = await prisma.featureFlag.update({
        where: { key: flag.key },
        data: {
          ...flag,
          updatedAt: new Date()
        }
      });
    } else {
      result = await prisma.featureFlag.create({
        data: {
          ...flag,
          id: `flag_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    // Clear cache
    this.featureCache.delete(flag.key);

    await auditLogger.log({
      action: existing ? 'feature_flag.updated' : 'feature_flag.created',
      resourceType: 'feature_flag',
      resourceId: result.id,
      userId: flag.createdBy,
      details: { key: flag.key, enabled: flag.enabled }
    });

    return result;
  }

  // Get all feature flags
  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return prisma.featureFlag.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  // Delete feature flag
  async deleteFeatureFlag(key: string, deletedBy: string): Promise<void> {
    const flag = await prisma.featureFlag.findUnique({
      where: { key }
    });

    if (!flag) {
      throw new Error('Feature flag not found');
    }

    await prisma.featureFlag.delete({
      where: { key }
    });

    // Clear cache
    this.featureCache.delete(key);

    await auditLogger.log({
      action: 'feature_flag.deleted',
      resourceType: 'feature_flag',
      resourceId: flag.id,
      userId: deletedBy,
      details: { key }
    });
  }

  // Get users in staging
  async getStagingUsers(): Promise<Array<{
    userId: string;
    email: string;
    name: string;
    addedAt: Date;
    addedBy: string;
  }>> {
    const stagingUsers = await prisma.userEnvironment.findMany({
      where: { environment: 'staging' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    return stagingUsers.map(su => ({
      userId: su.user.id,
      email: su.user.email,
      name: su.user.name || '',
      addedAt: su.createdAt,
      addedBy: su.updatedBy
    }));
  }

  // Batch add users to staging
  async addUsersToStaging(
    userIds: string[],
    addedBy: string
  ): Promise<void> {
    await Promise.all(
      userIds.map(userId => 
        this.toggleUserEnvironment(userId, 'staging', addedBy)
      )
    );
  }

  // Remove all users from staging
  async clearStagingUsers(clearedBy: string): Promise<void> {
    const stagingUsers = await prisma.userEnvironment.findMany({
      where: { environment: 'staging' }
    });

    await Promise.all(
      stagingUsers.map(su => 
        this.toggleUserEnvironment(su.userId, 'production', clearedBy)
      )
    );
  }

  // Get environment metrics
  async getEnvironmentMetrics(): Promise<{
    production: number;
    staging: number;
    development: number;
    featureFlags: {
      total: number;
      enabled: number;
      staged: number;
    };
  }> {
    const [prodCount, stagingCount, devCount, flags] = await Promise.all([
      prisma.userEnvironment.count({ where: { environment: 'production' } }),
      prisma.userEnvironment.count({ where: { environment: 'staging' } }),
      prisma.userEnvironment.count({ where: { environment: 'development' } }),
      prisma.featureFlag.findMany()
    ]);

    const totalUsers = await prisma.user.count();
    
    return {
      production: totalUsers - stagingCount - devCount,
      staging: stagingCount,
      development: devCount,
      featureFlags: {
        total: flags.length,
        enabled: flags.filter(f => f.enabled).length,
        staged: flags.filter(f => f.enabledInStaging && !f.enabled).length
      }
    };
  }

  // Private helper methods

  private async getFeature(key: string): Promise<FeatureFlag | null> {
    // Check cache
    if (this.featureCache.has(key)) {
      const cached = this.featureCache.get(key)!;
      if (Date.now() - this.lastCacheUpdate < this.CACHE_TTL) {
        return cached;
      }
    }

    // Fetch from database
    const feature = await prisma.featureFlag.findUnique({
      where: { key }
    });

    if (feature) {
      this.featureCache.set(key, feature);
      this.lastCacheUpdate = Date.now();
    }

    return feature;
  }

  private async getFeaturesForEnvironment(
    environment: Environment['name'],
    userId: string
  ): Promise<Record<string, boolean>> {
    const flags = await prisma.featureFlag.findMany();
    const features: Record<string, boolean> = {};

    for (const flag of flags) {
      features[flag.key] = await this.isFeatureEnabled(flag.key, userId);
    }

    return features;
  }

  private getApiUrl(environment: Environment['name']): string {
    switch (environment) {
      case 'production':
        return process.env.NEXT_PUBLIC_API_URL || 'https://api.vibelux.com';
      case 'staging':
        return process.env.NEXT_PUBLIC_STAGING_API_URL || 'https://staging-api.vibelux.com';
      case 'development':
        return process.env.NEXT_PUBLIC_DEV_API_URL || 'http://localhost:3001';
    }
  }

  private getEnvironmentConfig(environment: Environment['name']): Record<string, any> {
    const baseConfig = {
      analyticsEnabled: true,
      debugMode: false,
      performanceMonitoring: true
    };

    switch (environment) {
      case 'production':
        return baseConfig;
      case 'staging':
        return {
          ...baseConfig,
          debugMode: true,
          testPaymentsEnabled: true
        };
      case 'development':
        return {
          ...baseConfig,
          debugMode: true,
          analyticsEnabled: false,
          testPaymentsEnabled: true
        };
    }
  }

  private async getUserGroups(userId: string): Promise<string[]> {
    // In production, fetch from database
    // This is a placeholder
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true }
    });

    return user?.roles.map(r => r.name) || [];
  }

  private async evaluateConditions(
    conditions: FeatureCondition[],
    userId: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    for (const condition of conditions) {
      const met = await this.evaluateCondition(condition, userId, context);
      if (!met) {
        return false;
      }
    }
    return true;
  }

  private async evaluateCondition(
    condition: FeatureCondition,
    userId: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    switch (condition.type) {
      case 'user':
        return this.evaluateUserCondition(condition, userId);
      case 'date':
        return this.evaluateDateCondition(condition);
      case 'custom':
        return this.evaluateCustomCondition(condition, context);
      default:
        return false;
    }
  }

  private evaluateUserCondition(
    condition: FeatureCondition,
    userId: string
  ): boolean {
    switch (condition.operator) {
      case 'equals':
        return userId === condition.value;
      case 'contains':
        return userId.includes(condition.value);
      default:
        return false;
    }
  }

  private evaluateDateCondition(condition: FeatureCondition): boolean {
    const now = new Date();
    const compareDate = new Date(condition.value);

    switch (condition.operator) {
      case 'greater_than':
        return now > compareDate;
      case 'less_than':
        return now < compareDate;
      default:
        return false;
    }
  }

  private evaluateCustomCondition(
    condition: FeatureCondition,
    context?: Record<string, any>
  ): boolean {
    if (!context) return false;

    const value = context[condition.type];
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      default:
        return false;
    }
  }

  private hashUserId(userId: string, featureKey: string): number {
    // Simple hash function for consistent rollout
    const str = `${userId}-${featureKey}`;
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }
}

// Export singleton instance
export const stagingToggle = new StagingToggle();

// React hook for feature flags
export function useFeatureFlag(featureKey: string, userId?: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!userId) return;

    stagingToggle.isFeatureEnabled(featureKey, userId)
      .then(setEnabled)
      .catch(() => setEnabled(false));
  }, [featureKey, userId]);

  return enabled;
}