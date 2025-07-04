/**
 * Security Service
 * Handles enterprise-grade security for control system access
 */

import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

interface SecurityConfig {
  facilityId: string;
  encryptionKey: string;
  vpnConfig?: {
    endpoint: string;
    certificate: string;
    privateKey: string;
  };
  accessTokens: {
    readOnly: string;
    control: string;
    emergency: string;
  };
}

interface AuditEvent {
  facilityId: string;
  userId?: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: any;
}

export class SecurityService {
  private static instance: SecurityService;
  private encryptionAlgorithm = 'aes-256-gcm';
  private securityConfigs: Map<string, SecurityConfig> = new Map();

  private constructor() {}

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Initialize security for a facility
   */
  async initializeFacilitySecurity(facilityId: string): Promise<SecurityConfig> {
    try {
      // Generate facility-specific encryption key
      const encryptionKey = crypto.randomBytes(32).toString('hex');
      
      // Generate access tokens with different permission levels
      const accessTokens = {
        readOnly: this.generateSecureToken('read', facilityId),
        control: this.generateSecureToken('control', facilityId),
        emergency: this.generateSecureToken('emergency', facilityId)
      };

      // Create security configuration
      const securityConfig: SecurityConfig = {
        facilityId,
        encryptionKey,
        accessTokens
      };

      // Store encrypted configuration in database (with error handling)
      try {
        await prisma.facility_security?.upsert({
        where: { facility_id: facilityId },
        update: {
          encryption_key: this.encryptSensitiveData(encryptionKey, process.env.MASTER_KEY!),
          access_tokens: this.encryptSensitiveData(JSON.stringify(accessTokens), process.env.MASTER_KEY!),
          updated_at: new Date()
        },
        create: {
          facility_id: facilityId,
          encryption_key: this.encryptSensitiveData(encryptionKey, process.env.MASTER_KEY!),
          access_tokens: this.encryptSensitiveData(JSON.stringify(accessTokens), process.env.MASTER_KEY!),
          security_level: 'enterprise',
          vpn_enabled: false
        }
      });
      } catch (dbError) {
        console.warn('Database table facility_security not found, security config stored in memory only');
      }

      // Cache configuration
      this.securityConfigs.set(facilityId, securityConfig);

      return securityConfig;

    } catch (error) {
      console.error('Failed to initialize facility security:', error);
      throw error;
    }
  }

  /**
   * Encrypt control system credentials
   */
  encryptCredentials(facilityId: string, credentials: any): string {
    try {
      const config = this.getSecurityConfig(facilityId);
      return this.encryptSensitiveData(JSON.stringify(credentials), config.encryptionKey);
    } catch (error) {
      console.error('Failed to encrypt credentials:', error);
      throw error;
    }
  }

  /**
   * Decrypt control system credentials
   */
  decryptCredentials(facilityId: string, encryptedCredentials: string): any {
    try {
      const config = this.getSecurityConfig(facilityId);
      const decrypted = this.decryptSensitiveData(encryptedCredentials, config.encryptionKey);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt credentials:', error);
      throw error;
    }
  }

  /**
   * Validate access token and permissions
   */
  async validateAccess(
    facilityId: string,
    token: string,
    requiredPermission: 'read' | 'control' | 'emergency',
    ipAddress: string,
    userAgent: string
  ): Promise<boolean> {
    try {
      const config = this.getSecurityConfig(facilityId);
      
      // Validate token format and signature
      if (!this.isValidToken(token, facilityId)) {
        await this.logSecurityEvent({
          facilityId,
          action: 'access_denied',
          resource: 'control_system',
          ipAddress,
          userAgent,
          success: false,
          details: { reason: 'invalid_token', permission: requiredPermission }
        });
        return false;
      }

      // Check permission level
      const hasPermission = this.checkPermission(token, requiredPermission, config);
      
      if (!hasPermission) {
        await this.logSecurityEvent({
          facilityId,
          action: 'access_denied',
          resource: 'control_system',
          ipAddress,
          userAgent,
          success: false,
          details: { reason: 'insufficient_permissions', permission: requiredPermission }
        });
        return false;
      }

      // Log successful access
      await this.logSecurityEvent({
        facilityId,
        action: 'access_granted',
        resource: 'control_system',
        ipAddress,
        userAgent,
        success: true,
        details: { permission: requiredPermission }
      });

      return true;

    } catch (error) {
      console.error('Access validation failed:', error);
      return false;
    }
  }

  /**
   * Setup VPN tunnel for secure control system access
   */
  async setupVPNTunnel(facilityId: string, vpnConfig: {
    endpoint: string;
    certificate: string;
    privateKey: string;
  }): Promise<boolean> {
    try {
      // Store VPN configuration securely
      const encryptedConfig = this.encryptSensitiveData(
        JSON.stringify(vpnConfig),
        this.getSecurityConfig(facilityId).encryptionKey
      );

      await prisma.facility_security?.update({
        where: { facility_id: facilityId },
        data: {
          vpn_config: encryptedConfig,
          vpn_enabled: true,
          updated_at: new Date()
        }
      });

      // Update cached config
      const config = this.securityConfigs.get(facilityId);
      if (config) {
        config.vpnConfig = vpnConfig;
      }

      return true;

    } catch (error) {
      console.error('Failed to setup VPN tunnel:', error);
      return false;
    }
  }

  /**
   * Create secure communication channel
   */
  async createSecureChannel(facilityId: string, endpoint: string): Promise<{
    encryptedEndpoint: string;
    authHeaders: Record<string, string>;
  }> {
    try {
      const config = this.getSecurityConfig(facilityId);
      
      // Encrypt endpoint URL
      const encryptedEndpoint = this.encryptSensitiveData(endpoint, config.encryptionKey);
      
      // Create authentication headers
      const timestamp = Date.now().toString();
      const signature = this.createSignature(endpoint + timestamp, config.encryptionKey);
      
      const authHeaders = {
        'X-VibeLux-Facility': facilityId,
        'X-VibeLux-Timestamp': timestamp,
        'X-VibeLux-Signature': signature,
        'X-VibeLux-Token': config.accessTokens.control,
        'Content-Type': 'application/json'
      };

      return { encryptedEndpoint, authHeaders };

    } catch (error) {
      console.error('Failed to create secure channel:', error);
      throw error;
    }
  }

  /**
   * Rotate security credentials
   */
  async rotateCredentials(facilityId: string): Promise<void> {
    try {
      
      // Generate new access tokens
      const newAccessTokens = {
        readOnly: this.generateSecureToken('read', facilityId),
        control: this.generateSecureToken('control', facilityId),
        emergency: this.generateSecureToken('emergency', facilityId)
      };

      // Update database
      await prisma.facility_security?.update({
        where: { facility_id: facilityId },
        data: {
          access_tokens: this.encryptSensitiveData(JSON.stringify(newAccessTokens), process.env.MASTER_KEY!),
          credential_rotation_at: new Date(),
          updated_at: new Date()
        }
      });

      // Update cached config
      const config = this.securityConfigs.get(facilityId);
      if (config) {
        config.accessTokens = newAccessTokens;
      }

      await this.logSecurityEvent({
        facilityId,
        action: 'credentials_rotated',
        resource: 'security_config',
        ipAddress: '127.0.0.1',
        userAgent: 'VibeLux Security Service',
        success: true
      });


    } catch (error) {
      console.error('Failed to rotate credentials:', error);
      throw error;
    }
  }

  /**
   * Monitor for security threats
   */
  async detectSecurityThreats(facilityId: string): Promise<{
    threats: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    try {
      const threats: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

      // Check for suspicious activity in last 24 hours
      const recentEvents = await prisma.security_audit_log?.findMany({
        where: {
          facility_id: facilityId,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { timestamp: 'desc' }
      });

      if (recentEvents) {
        // Check for repeated failed access attempts
        const failedAttempts = recentEvents.filter(e => !e.success && e.action === 'access_denied');
        if (failedAttempts.length > 10) {
          threats.push('Multiple failed access attempts detected');
          riskLevel = 'high';
        }

        // Check for access from unusual IPs
        const uniqueIPs = new Set(recentEvents.map(e => e.ip_address));
        if (uniqueIPs.size > 5) {
          threats.push('Access from multiple IP addresses');
          riskLevel = 'medium';
        }

        // Check for emergency access usage
        const emergencyAccess = recentEvents.filter(e => 
          e.details && JSON.parse(e.details).permission === 'emergency'
        );
        if (emergencyAccess.length > 0) {
          threats.push('Emergency access tokens have been used');
          riskLevel = 'medium';
        }
      }

      // Check credential age
      const facility = await prisma.facility_security?.findFirst({
        where: { facility_id: facilityId }
      });

      if (facility) {
        const daysSinceRotation = facility.credential_rotation_at
          ? (Date.now() - facility.credential_rotation_at.getTime()) / (1000 * 60 * 60 * 24)
          : 90; // Default to 90 days if never rotated

        if (daysSinceRotation > 30) {
          threats.push('Security credentials are overdue for rotation');
          if (riskLevel === 'low') riskLevel = 'medium';
        }
      }

      return { threats, riskLevel };

    } catch (error) {
      console.error('Failed to detect security threats:', error);
      return { threats: ['Security monitoring system error'], riskLevel: 'critical' };
    }
  }

  /**
   * Private helper methods
   */
  private getSecurityConfig(facilityId: string): SecurityConfig {
    const config = this.securityConfigs.get(facilityId);
    if (!config) {
      throw new Error(`Security not initialized for facility ${facilityId}`);
    }
    return config;
  }

  private generateSecureToken(permission: string, facilityId: string): string {
    const payload = {
      permission,
      facilityId,
      issued: Date.now(),
      expires: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
    };
    
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = this.createSignature(token, process.env.MASTER_KEY!);
    
    return `${token}.${signature}`;
  }

  private isValidToken(token: string, facilityId: string): boolean {
    try {
      const [tokenPart, signature] = token.split('.');
      
      // Verify signature
      const expectedSignature = this.createSignature(tokenPart, process.env.MASTER_KEY!);
      if (signature !== expectedSignature) {
        return false;
      }

      // Verify token content
      const payload = JSON.parse(Buffer.from(tokenPart, 'base64').toString());
      
      // Check expiration
      if (payload.expires < Date.now()) {
        return false;
      }

      // Check facility ID
      if (payload.facilityId !== facilityId) {
        return false;
      }

      return true;

    } catch (error) {
      return false;
    }
  }

  private checkPermission(token: string, requiredPermission: string, config: SecurityConfig): boolean {
    try {
      const [tokenPart] = token.split('.');
      const payload = JSON.parse(Buffer.from(tokenPart, 'base64').toString());
      
      // Emergency tokens have all permissions
      if (payload.permission === 'emergency') {
        return true;
      }
      
      // Control tokens have control and read permissions
      if (payload.permission === 'control' && ['control', 'read'].includes(requiredPermission)) {
        return true;
      }
      
      // Read tokens only have read permission
      if (payload.permission === 'read' && requiredPermission === 'read') {
        return true;
      }

      return false;

    } catch (error) {
      return false;
    }
  }

  private encryptSensitiveData(data: string, key: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipher(this.encryptionAlgorithm, key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = (cipher as any).getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  }

  private decryptSensitiveData(encryptedData: string, key: string): string {
    const [ivHex, encrypted, authTagHex] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.encryptionAlgorithm, key);
    (decipher as any).setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private createSignature(data: string, key: string): string {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  private async logSecurityEvent(event: AuditEvent): Promise<void> {
    try {
      await prisma.security_audit_log?.create({
        data: {
          facility_id: event.facilityId,
          user_id: event.userId,
          action: event.action,
          resource: event.resource,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          success: event.success,
          details: event.details ? JSON.stringify(event.details) : null,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

// Export singleton
export const securityService = SecurityService.getInstance();