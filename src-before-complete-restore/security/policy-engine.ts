import axios from 'axios';

export interface PolicyDecision {
  allow: boolean;
  reason?: string;
  obligations?: string[];
  advice?: string[];
}

export interface PolicyQuery {
  subject: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export interface RBACRole {
  id: string;
  name: string;
  permissions: Permission[];
  tenantId?: string;
  hierarchyLevel: number;
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: PolicyCondition[];
}

export interface PolicyCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'time_range';
  value: any;
}

export interface TenantPolicy {
  tenantId: string;
  isolation: 'strict' | 'soft';
  dataResidency: string;
  allowedRegions: string[];
  maxUsers: number;
  retentionPeriod: number;
  customRules: PolicyRule[];
}

export interface PolicyRule {
  id: string;
  name: string;
  condition: string;
  effect: 'allow' | 'deny';
  priority: number;
}

export interface SecurityPolicy {
  passwordPolicy: PasswordPolicy;
  sessionPolicy: SessionPolicy;
  accessPolicy: AccessPolicy;
  dataPolicy: DataPolicy;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number;
  historyCount: number;
}

export interface SessionPolicy {
  maxDuration: number;
  idleTimeout: number;
  concurrentSessions: number;
  requireMFA: boolean;
}

export interface AccessPolicy {
  maxFailedAttempts: number;
  lockoutDuration: number;
  ipWhitelist: string[];
  ipBlacklist: string[];
  timeRestrictions: TimeRestriction[];
}

export interface TimeRestriction {
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  timezone: string;
}

export interface DataPolicy {
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  retention: number;
  encryption: boolean;
  anonymization: boolean;
  geolocation: string[];
}

export class PolicyEngine {
  private opaEndpoint: string;
  private roles: Map<string, RBACRole> = new Map();
  private tenantPolicies: Map<string, TenantPolicy> = new Map();
  private securityPolicies: SecurityPolicy;

  constructor(opaEndpoint?: string) {
    this.opaEndpoint = opaEndpoint || process.env.OPA_ENDPOINT || 'http://localhost:8181';
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    this.securityPolicies = {
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        historyCount: 5
      },
      sessionPolicy: {
        maxDuration: 8 * 60 * 60 * 1000, // 8 hours
        idleTimeout: 30 * 60 * 1000, // 30 minutes
        concurrentSessions: 3,
        requireMFA: true
      },
      accessPolicy: {
        maxFailedAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        ipWhitelist: [],
        ipBlacklist: [],
        timeRestrictions: []
      },
      dataPolicy: {
        classification: 'internal',
        retention: 365,
        encryption: true,
        anonymization: false,
        geolocation: ['US', 'EU']
      }
    };
  }

  // Core Policy Evaluation
  async evaluate(query: PolicyQuery): Promise<PolicyDecision> {
    try {
      // Check tenant isolation first
      const tenantIsolationResult = await this.checkTenantIsolation(query);
      if (!tenantIsolationResult.allow) {
        return tenantIsolationResult;
      }

      // Check RBAC permissions
      const rbacResult = await this.checkRBACPermissions(query);
      if (!rbacResult.allow) {
        return rbacResult;
      }

      // Check custom policies via OPA
      const opaResult = await this.evaluateWithOPA(query);
      if (!opaResult.allow) {
        return opaResult;
      }

      // Check security policies
      const securityResult = await this.checkSecurityPolicies(query);
      if (!securityResult.allow) {
        return securityResult;
      }

      return { allow: true };
    } catch (error) {
      return {
        allow: false,
        reason: `Policy evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async checkTenantIsolation(query: PolicyQuery): Promise<PolicyDecision> {
    const subjectTenantId = this.extractTenantId(query.subject);
    const resourceTenantId = query.context?.resourceTenant;

    if (subjectTenantId && resourceTenantId && subjectTenantId !== resourceTenantId) {
      const tenantPolicy = this.tenantPolicies.get(subjectTenantId);
      if (tenantPolicy?.isolation === 'strict') {
        return {
          allow: false,
          reason: 'Tenant isolation violation: strict isolation policy prevents cross-tenant access'
        };
      }
    }

    return { allow: true };
  }

  private async checkRBACPermissions(query: PolicyQuery): Promise<PolicyDecision> {
    const userRoles = await this.getUserRoles(query.subject);
    
    for (const role of userRoles) {
      for (const permission of role.permissions) {
        if (this.matchesResource(permission.resource, query.resource) &&
            permission.actions.includes(query.action)) {
          
          // Check conditions if any
          if (permission.conditions) {
            const conditionResult = this.evaluateConditions(permission.conditions, query.context || {});
            if (!conditionResult) {
              continue;
            }
          }
          
          return { allow: true };
        }
      }
    }

    return {
      allow: false,
      reason: 'Insufficient permissions: no matching RBAC role grants access to this resource'
    };
  }

  private async evaluateWithOPA(query: PolicyQuery): Promise<PolicyDecision> {
    try {
      const response = await axios.post(`${this.opaEndpoint}/v1/data/authz/allow`, {
        input: {
          subject: query.subject,
          resource: query.resource,
          action: query.action,
          context: query.context || {}
        }
      });

      const result = response.data.result;
      return {
        allow: result === true,
        reason: result === false ? 'OPA policy denied access' : undefined
      };
    } catch (error) {
      // If OPA is unavailable, default to deny
      return {
        allow: false,
        reason: `OPA evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async checkSecurityPolicies(query: PolicyQuery): Promise<PolicyDecision> {
    const context = query.context || {};

    // Check IP restrictions
    if (context.ipAddress) {
      const accessPolicy = this.securityPolicies.accessPolicy;
      
      if (accessPolicy.ipBlacklist.includes(context.ipAddress)) {
        return { allow: false, reason: 'IP address is blacklisted' };
      }
      
      if (accessPolicy.ipWhitelist.length > 0 && !accessPolicy.ipWhitelist.includes(context.ipAddress)) {
        return { allow: false, reason: 'IP address not in whitelist' };
      }
    }

    // Check time restrictions
    if (context.timestamp) {
      const accessPolicy = this.securityPolicies.accessPolicy;
      const currentTime = new Date(context.timestamp);
      
      for (const restriction of accessPolicy.timeRestrictions) {
        if (!this.isWithinTimeRestriction(currentTime, restriction)) {
          return { allow: false, reason: 'Access denied: outside allowed time window' };
        }
      }
    }

    return { allow: true };
  }

  // RBAC Management
  async createRole(role: RBACRole): Promise<void> {
    this.roles.set(role.id, role);
  }

  async updateRole(roleId: string, updates: Partial<RBACRole>): Promise<void> {
    const existingRole = this.roles.get(roleId);
    if (!existingRole) {
      throw new Error(`Role ${roleId} not found`);
    }

    this.roles.set(roleId, { ...existingRole, ...updates });
  }

  async deleteRole(roleId: string): Promise<void> {
    this.roles.delete(roleId);
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    // Implementation would store user-role mapping in database
    // This is a placeholder for the actual implementation
  }

  async revokeRoleFromUser(userId: string, roleId: string): Promise<void> {
    // Implementation would remove user-role mapping from database
    // This is a placeholder for the actual implementation
  }

  private async getUserRoles(userId: string): Promise<RBACRole[]> {
    // Implementation would query database for user roles
    // This is a placeholder returning default roles
    return Array.from(this.roles.values()).filter(role => role.name === 'user');
  }

  // Tenant Policy Management
  async createTenantPolicy(policy: TenantPolicy): Promise<void> {
    this.tenantPolicies.set(policy.tenantId, policy);
  }

  async updateTenantPolicy(tenantId: string, updates: Partial<TenantPolicy>): Promise<void> {
    const existingPolicy = this.tenantPolicies.get(tenantId);
    if (!existingPolicy) {
      throw new Error(`Tenant policy for ${tenantId} not found`);
    }

    this.tenantPolicies.set(tenantId, { ...existingPolicy, ...updates });
  }

  async getTenantPolicy(tenantId: string): Promise<TenantPolicy | undefined> {
    return this.tenantPolicies.get(tenantId);
  }

  // Security Policy Management
  async updateSecurityPolicy(updates: Partial<SecurityPolicy>): Promise<void> {
    this.securityPolicies = { ...this.securityPolicies, ...updates };
  }

  async getSecurityPolicies(): Promise<SecurityPolicy> {
    return this.securityPolicies;
  }

  // Policy Validation
  async validatePassword(password: string): Promise<{ valid: boolean; errors: string[] }> {
    const policy = this.securityPolicies.passwordPolicy;
    const errors: string[] = [];

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  async validateSessionPolicy(sessionData: any): Promise<{ valid: boolean; errors: string[] }> {
    const policy = this.securityPolicies.sessionPolicy;
    const errors: string[] = [];

    if (sessionData.duration > policy.maxDuration) {
      errors.push(`Session duration exceeds maximum of ${policy.maxDuration}ms`);
    }

    if (sessionData.idleTime > policy.idleTimeout) {
      errors.push(`Session idle time exceeds maximum of ${policy.idleTimeout}ms`);
    }

    if (policy.requireMFA && !sessionData.mfaVerified) {
      errors.push('Multi-factor authentication is required');
    }

    return { valid: errors.length === 0, errors };
  }

  // Utility Methods
  private extractTenantId(subject: string): string | null {
    // Extract tenant ID from subject (e.g., "tenant-123:user-456" -> "tenant-123")
    const parts = subject.split(':');
    return parts.length > 1 ? parts[0] : null;
  }

  private matchesResource(pattern: string, resource: string): boolean {
    // Simple wildcard matching
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(resource);
  }

  private evaluateConditions(conditions: PolicyCondition[], context: Record<string, any>): boolean {
    return conditions.every(condition => {
      const contextValue = context[condition.field];
      
      switch (condition.operator) {
        case 'eq':
          return contextValue === condition.value;
        case 'ne':
          return contextValue !== condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(contextValue);
        case 'nin':
          return Array.isArray(condition.value) && !condition.value.includes(contextValue);
        case 'gt':
          return contextValue > condition.value;
        case 'lt':
          return contextValue < condition.value;
        case 'gte':
          return contextValue >= condition.value;
        case 'lte':
          return contextValue <= condition.value;
        case 'contains':
          return typeof contextValue === 'string' && contextValue.includes(condition.value);
        case 'time_range':
          return this.isWithinTimeRange(contextValue, condition.value);
        default:
          return false;
      }
    });
  }

  private isWithinTimeRange(timestamp: any, range: any): boolean {
    const time = new Date(timestamp);
    const start = new Date(range.start);
    const end = new Date(range.end);
    return time >= start && time <= end;
  }

  private isWithinTimeRestriction(time: Date, restriction: TimeRestriction): boolean {
    const currentHour = time.getHours();
    const currentMinute = time.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = restriction.startTime.split(':').map(Number);
    const [endHour, endMinute] = restriction.endTime.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    const dayOfWeek = time.getDay();
    
    return restriction.daysOfWeek.includes(dayOfWeek) &&
           currentTime >= startTime && currentTime <= endTime;
  }

  // OPA Policy Management
  async deployOPAPolicy(policyName: string, policy: string): Promise<void> {
    try {
      await axios.put(`${this.opaEndpoint}/v1/policies/${policyName}`, policy, {
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (error) {
      throw new Error(`Failed to deploy OPA policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteOPAPolicy(policyName: string): Promise<void> {
    try {
      await axios.delete(`${this.opaEndpoint}/v1/policies/${policyName}`);
    } catch (error) {
      throw new Error(`Failed to delete OPA policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Compliance Helpers
  async hasValidAccessControls(): Promise<boolean> {
    return this.roles.size > 0 && this.tenantPolicies.size > 0;
  }

  async enforceInputValidation(endpoint: string): Promise<void> {
    // Implementation would add input validation rules for the endpoint
    // This is a placeholder for the actual implementation
  }

  async enforceOutputEncoding(endpoint: string): Promise<void> {
    // Implementation would add output encoding rules for the endpoint
    // This is a placeholder for the actual implementation
  }

  // Health Check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; opa: boolean; error?: string }> {
    try {
      const response = await axios.get(`${this.opaEndpoint}/health`);
      return {
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        opa: response.status === 200
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        opa: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}