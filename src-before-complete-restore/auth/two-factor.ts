// Two-Factor Authentication (2FA) / Multi-Factor Authentication (MFA) System
// Supports TOTP, SMS, Email, and Backup Codes

import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import { emailService } from '../email/email-service';
import { auditLogger } from '../audit-logger';

export type TwoFactorMethod = 'totp' | 'sms' | 'email' | 'backup';

export interface TwoFactorSetup {
  userId: string;
  method: TwoFactorMethod;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  phoneNumber?: string;
  email?: string;
}

export interface TwoFactorVerification {
  userId: string;
  method: TwoFactorMethod;
  code: string;
  rememberDevice?: boolean;
}

export interface TwoFactorStatus {
  enabled: boolean;
  methods: Array<{
    type: TwoFactorMethod;
    enabled: boolean;
    configured: boolean;
    primary: boolean;
    lastUsed?: Date;
  }>;
  backupCodesRemaining: number;
  trustedDevices: Array<{
    id: string;
    name: string;
    lastUsed: Date;
    fingerprint: string;
  }>;
}

export class TwoFactorAuth {
  private readonly APP_NAME = 'Vibelux';
  private readonly TOTP_WINDOW = 1; // Accept codes from 1 window before/after
  private readonly BACKUP_CODE_COUNT = 10;
  private readonly CODE_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 30;
  
  // Generate TOTP secret and QR code
  async setupTOTP(userId: string): Promise<TwoFactorSetup> {
    try {
      // Generate secret
      const secret = authenticator.generateSecret();
      
      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate QR code
      const otpauth = authenticator.keyuri(
        user.email,
        this.APP_NAME,
        secret
      );
      
      const qrCode = await QRCode.toDataURL(otpauth);
      
      // Store setup temporarily (user must verify before enabling)
      await this.storePendingSetup(userId, 'totp', { secret });
      
      return {
        userId,
        method: 'totp',
        secret,
        qrCode
      };
    } catch (error) {
      throw new Error('Failed to setup TOTP authentication');
    }
  }
  
  // Setup SMS-based 2FA
  async setupSMS(userId: string, phoneNumber: string): Promise<TwoFactorSetup> {
    try {
      // Validate phone number format
      const cleanedNumber = this.cleanPhoneNumber(phoneNumber);
      if (!this.isValidPhoneNumber(cleanedNumber)) {
        throw new Error('Invalid phone number format');
      }
      
      // Store setup temporarily
      await this.storePendingSetup(userId, 'sms', { phoneNumber: cleanedNumber });
      
      // Send verification code
      const code = this.generateNumericCode();
      await this.sendSMSCode(cleanedNumber, code);
      await this.storeVerificationCode(userId, 'sms', code);
      
      return {
        userId,
        method: 'sms',
        phoneNumber: this.maskPhoneNumber(cleanedNumber)
      };
    } catch (error) {
      throw new Error('Failed to setup SMS authentication');
    }
  }
  
  // Setup Email-based 2FA
  async setupEmail(userId: string, email?: string): Promise<TwoFactorSetup> {
    try {
      // Get user email if not provided
      if (!email) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
        });
        email = user?.email;
      }
      
      if (!email) {
        throw new Error('Email address not found');
      }
      
      // Store setup
      await this.storePendingSetup(userId, 'email', { email });
      
      // Send verification code
      const code = this.generateNumericCode();
      await this.sendEmailCode(email, code);
      await this.storeVerificationCode(userId, 'email', code);
      
      return {
        userId,
        method: 'email',
        email: this.maskEmail(email)
      };
    } catch (error) {
      throw new Error('Failed to setup email authentication');
    }
  }
  
  // Generate backup codes
  async generateBackupCodes(userId: string): Promise<string[]> {
    const codes: string[] = [];
    
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      // Generate 8-character alphanumeric code
      const code = randomBytes(6).toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 8)
        .toUpperCase();
      codes.push(code);
    }
    
    // Hash and store codes
    const hashedCodes = codes.map(code => this.hashCode(code));
    await prisma.userBackupCodes.createMany({
      data: hashedCodes.map(hash => ({
        userId,
        code: hash,
        used: false
      }))
    });
    
    await auditLogger.log({
      action: 'auth.backup_codes_generated',
      resourceType: 'user',
      resourceId: userId,
      userId,
      details: { count: codes.length }
    });
    
    return codes;
  }
  
  // Verify 2FA code
  async verifyCode(verification: TwoFactorVerification): Promise<{
    success: boolean;
    error?: string;
    requiresBackup?: boolean;
  }> {
    try {
      // Check for lockout
      if (await this.isLockedOut(verification.userId)) {
        return {
          success: false,
          error: 'Too many failed attempts. Please try again later.'
        };
      }
      
      let verified = false;
      
      switch (verification.method) {
        case 'totp':
          verified = await this.verifyTOTP(verification.userId, verification.code);
          break;
          
        case 'sms':
        case 'email':
          verified = await this.verifyStoredCode(verification.userId, verification.method, verification.code);
          break;
          
        case 'backup':
          verified = await this.verifyBackupCode(verification.userId, verification.code);
          break;
          
        default:
          throw new Error('Invalid verification method');
      }
      
      if (verified) {
        // Clear failed attempts
        await this.clearFailedAttempts(verification.userId);
        
        // Trust device if requested
        if (verification.rememberDevice) {
          await this.trustDevice(verification.userId);
        }
        
        // Log successful verification
        await auditLogger.log({
          action: 'auth.2fa_verified',
          resourceType: 'user',
          resourceId: verification.userId,
          userId: verification.userId,
          details: { method: verification.method }
        });
        
        return { success: true };
      } else {
        // Record failed attempt
        await this.recordFailedAttempt(verification.userId);
        
        return {
          success: false,
          error: 'Invalid verification code'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }
  
  // Verify TOTP code
  private async verifyTOTP(userId: string, code: string): Promise<boolean> {
    const setup = await prisma.userTwoFactor.findFirst({
      where: {
        userId,
        method: 'totp',
        enabled: true
      }
    });
    
    if (!setup?.secret) {
      return false;
    }
    
    return authenticator.verify({
      token: code,
      secret: setup.secret,
      window: this.TOTP_WINDOW
    });
  }
  
  // Verify stored code (SMS/Email)
  private async verifyStoredCode(
    userId: string,
    method: 'sms' | 'email',
    code: string
  ): Promise<boolean> {
    const storedCode = await prisma.verificationCode.findFirst({
      where: {
        userId,
        type: method,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!storedCode || storedCode.code !== code) {
      return false;
    }
    
    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: storedCode.id },
      data: { used: true }
    });
    
    return true;
  }
  
  // Verify backup code
  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const hashedCode = this.hashCode(code);
    
    const backupCode = await prisma.userBackupCodes.findFirst({
      where: {
        userId,
        code: hashedCode,
        used: false
      }
    });
    
    if (!backupCode) {
      return false;
    }
    
    // Mark as used
    await prisma.userBackupCodes.update({
      where: { id: backupCode.id },
      data: { used: true, usedAt: new Date() }
    });
    
    return true;
  }
  
  // Enable 2FA method
  async enableMethod(
    userId: string,
    method: TwoFactorMethod,
    verificationCode: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify the setup code first
      const verified = await this.verifyCode({
        userId,
        method,
        code: verificationCode
      });
      
      if (!verified.success) {
        return verified;
      }
      
      // Get pending setup
      const pendingSetup = await this.getPendingSetup(userId, method);
      if (!pendingSetup) {
        return {
          success: false,
          error: 'No pending setup found'
        };
      }
      
      // Enable the method
      await prisma.userTwoFactor.create({
        data: {
          userId,
          method,
          enabled: true,
          ...pendingSetup,
          configuredAt: new Date()
        }
      });
      
      // Clear pending setup
      await this.clearPendingSetup(userId, method);
      
      // Generate backup codes if this is the first 2FA method
      const existingMethods = await prisma.userTwoFactor.count({
        where: { userId, enabled: true }
      });
      
      if (existingMethods === 1) {
        await this.generateBackupCodes(userId);
      }
      
      await auditLogger.log({
        action: 'auth.2fa_enabled',
        resourceType: 'user',
        resourceId: userId,
        userId,
        details: { method }
      });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable 2FA'
      };
    }
  }
  
  // Disable 2FA method
  async disableMethod(
    userId: string,
    method: TwoFactorMethod,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify password first
      const passwordValid = await this.verifyPassword(userId, password);
      if (!passwordValid) {
        return {
          success: false,
          error: 'Invalid password'
        };
      }
      
      // Check if this is the last method
      const methodCount = await prisma.userTwoFactor.count({
        where: { userId, enabled: true }
      });
      
      if (methodCount === 1) {
        // Disable all 2FA
        await prisma.userTwoFactor.deleteMany({
          where: { userId }
        });
        
        // Delete backup codes
        await prisma.userBackupCodes.deleteMany({
          where: { userId }
        });
        
        // Delete trusted devices
        await prisma.trustedDevice.deleteMany({
          where: { userId }
        });
      } else {
        // Just disable this method
        await prisma.userTwoFactor.delete({
          where: {
            userId_method: {
              userId,
              method
            }
          }
        });
      }
      
      await auditLogger.log({
        action: 'auth.2fa_disabled',
        resourceType: 'user',
        resourceId: userId,
        userId,
        details: { method }
      });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disable 2FA'
      };
    }
  }
  
  // Get 2FA status for user
  async getStatus(userId: string): Promise<TwoFactorStatus> {
    const methods = await prisma.userTwoFactor.findMany({
      where: { userId }
    });
    
    const backupCodesRemaining = await prisma.userBackupCodes.count({
      where: { userId, used: false }
    });
    
    const trustedDevices = await prisma.trustedDevice.findMany({
      where: { userId },
      orderBy: { lastUsed: 'desc' }
    });
    
    return {
      enabled: methods.some(m => m.enabled),
      methods: [
        {
          type: 'totp',
          enabled: methods.some(m => m.method === 'totp' && m.enabled),
          configured: methods.some(m => m.method === 'totp'),
          primary: methods.find(m => m.primary)?.method === 'totp',
          lastUsed: methods.find(m => m.method === 'totp')?.lastUsed
        },
        {
          type: 'sms',
          enabled: methods.some(m => m.method === 'sms' && m.enabled),
          configured: methods.some(m => m.method === 'sms'),
          primary: methods.find(m => m.primary)?.method === 'sms',
          lastUsed: methods.find(m => m.method === 'sms')?.lastUsed
        },
        {
          type: 'email',
          enabled: methods.some(m => m.method === 'email' && m.enabled),
          configured: methods.some(m => m.method === 'email'),
          primary: methods.find(m => m.primary)?.method === 'email',
          lastUsed: methods.find(m => m.method === 'email')?.lastUsed
        }
      ],
      backupCodesRemaining,
      trustedDevices: trustedDevices.map(device => ({
        id: device.id,
        name: device.name,
        lastUsed: device.lastUsed,
        fingerprint: device.fingerprint
      }))
    };
  }
  
  // Helper methods
  
  private generateNumericCode(): string {
    return Math.floor(100000 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 900000).toString();
  }
  
  private hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }
  
  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }
  
  private isValidPhoneNumber(phone: string): boolean {
    return /^\d{10,15}$/.test(phone);
  }
  
  private maskPhoneNumber(phone: string): string {
    return phone.slice(0, 3) + '***' + phone.slice(-4);
  }
  
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal = local.slice(0, 2) + '***' + local.slice(-1);
    return `${maskedLocal}@${domain}`;
  }
  
  private async sendSMSCode(phoneNumber: string, code: string): Promise<void> {
    // Integrate with SMS provider (Twilio, etc.)
  }
  
  private async sendEmailCode(email: string, code: string): Promise<void> {
    await emailService.sendEmail({
      to: email,
      subject: 'Your Vibelux Verification Code',
      html: `
        <h2>Verification Code</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in ${this.CODE_EXPIRY_MINUTES} minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `
    });
  }
  
  private async storeVerificationCode(
    userId: string,
    type: string,
    code: string
  ): Promise<void> {
    await prisma.verificationCode.create({
      data: {
        userId,
        type,
        code,
        expiresAt: new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000)
      }
    });
  }
  
  private async storePendingSetup(
    userId: string,
    method: TwoFactorMethod,
    data: any
  ): Promise<void> {
    await prisma.pendingTwoFactorSetup.upsert({
      where: { userId_method: { userId, method } },
      update: { data, expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
      create: {
        userId,
        method,
        data,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }
    });
  }
  
  private async getPendingSetup(
    userId: string,
    method: TwoFactorMethod
  ): Promise<any> {
    const setup = await prisma.pendingTwoFactorSetup.findUnique({
      where: {
        userId_method: { userId, method },
        expiresAt: { gt: new Date() }
      }
    });
    
    return setup?.data;
  }
  
  private async clearPendingSetup(
    userId: string,
    method: TwoFactorMethod
  ): Promise<void> {
    await prisma.pendingTwoFactorSetup.delete({
      where: { userId_method: { userId, method } }
    });
  }
  
  private async recordFailedAttempt(userId: string): Promise<void> {
    await prisma.failedLoginAttempt.create({
      data: { userId, attemptedAt: new Date() }
    });
  }
  
  private async clearFailedAttempts(userId: string): Promise<void> {
    await prisma.failedLoginAttempt.deleteMany({
      where: { userId }
    });
  }
  
  private async isLockedOut(userId: string): Promise<boolean> {
    const recentAttempts = await prisma.failedLoginAttempt.count({
      where: {
        userId,
        attemptedAt: {
          gt: new Date(Date.now() - this.LOCKOUT_DURATION_MINUTES * 60 * 1000)
        }
      }
    });
    
    return recentAttempts >= this.MAX_ATTEMPTS;
  }
  
  private async trustDevice(userId: string): Promise<void> {
    const fingerprint = this.generateDeviceFingerprint();
    
    await prisma.trustedDevice.create({
      data: {
        userId,
        fingerprint,
        name: 'Web Browser', // In production, detect device name
        lastUsed: new Date()
      }
    });
  }
  
  private generateDeviceFingerprint(): string {
    // In production, use more sophisticated fingerprinting
    return randomBytes(32).toString('hex');
  }
  
  private async verifyPassword(userId: string, password: string): Promise<boolean> {
    // In production, integrate with your auth system
    // This is a placeholder
    return true;
  }
}

// Export singleton instance
export const twoFactorAuth = new TwoFactorAuth();