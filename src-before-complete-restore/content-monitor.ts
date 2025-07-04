import { prisma } from '@/lib/db';

interface MonitoringResult {
  flagged: boolean;
  flagReason: string | null;
  confidence: number;
  sanitizedContent?: string;
}

export class ContentMonitor {
  private static readonly PHONE_PATTERNS = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // US phone numbers
    /\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g, // (555) 123-4567
    /\b\d{3}\s\d{3}\s\d{4}\b/g, // 555 123 4567
    /\+\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g // International
  ];

  private static readonly EMAIL_PATTERNS = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  ];

  private static readonly PLATFORM_BYPASS_KEYWORDS = [
    'whatsapp', 'telegram', 'signal', 'discord', 'slack', 'skype',
    'zoom', 'google meet', 'teams', 'facetime', 'call me',
    'text me', 'my number', 'reach me at', 'contact me at',
    'email me', 'dm me', 'direct message', 'off platform',
    'outside the platform', 'bypass', 'direct contact',
    'personal phone', 'cell phone', 'mobile number'
  ];

  private static readonly SOCIAL_MEDIA_PATTERNS = [
    /@[a-zA-Z0-9_]+/, // Generic @handle
    /linkedin\.com\/in\/[a-zA-Z0-9-]+/,
    /instagram\.com\/[a-zA-Z0-9_.]+/,
    /twitter\.com\/[a-zA-Z0-9_]+/,
    /facebook\.com\/[a-zA-Z0-9.]+/
  ];

  /**
   * Monitor message content for anti-disintermediation violations
   */
  static async monitorMessage(
    content: string,
    senderId: string,
    consultationId: string
  ): Promise<MonitoringResult> {
    const result: MonitoringResult = {
      flagged: false,
      flagReason: null,
      confidence: 0
    };

    // Check for phone numbers
    const phoneMatches = this.extractPhoneNumbers(content);
    if (phoneMatches.length > 0) {
      result.flagged = true;
      result.flagReason = 'phone_number';
      result.confidence = 0.9;
      
      await this.logViolation(senderId, consultationId, 'phone_number', {
        content: content.substring(0, 200),
        extractedPhones: phoneMatches
      });
    }

    // Check for email addresses
    const emailMatches = this.extractEmails(content);
    if (emailMatches.length > 0) {
      result.flagged = true;
      result.flagReason = 'email_address';
      result.confidence = 0.9;
      
      await this.logViolation(senderId, consultationId, 'email_address', {
        content: content.substring(0, 200),
        extractedEmails: emailMatches
      });
    }

    // Check for platform bypass keywords
    const bypassKeywords = this.checkPlatformBypassKeywords(content);
    if (bypassKeywords.length > 0) {
      result.flagged = true;
      result.flagReason = 'platform_bypass';
      result.confidence = 0.7;
      
      await this.logViolation(senderId, consultationId, 'platform_bypass', {
        content: content.substring(0, 200),
        keywords: bypassKeywords
      });
    }

    // Check for social media links
    const socialMatches = this.extractSocialMediaLinks(content);
    if (socialMatches.length > 0) {
      result.flagged = true;
      result.flagReason = 'external_link';
      result.confidence = 0.6;
      
      await this.logViolation(senderId, consultationId, 'external_link', {
        content: content.substring(0, 200),
        links: socialMatches
      });
    }

    // Generate sanitized content if flagged
    if (result.flagged) {
      result.sanitizedContent = this.sanitizeContent(content);
    }

    return result;
  }

  /**
   * Extract phone numbers from content
   */
  private static extractPhoneNumbers(content: string): string[] {
    const matches: string[] = [];
    
    this.PHONE_PATTERNS.forEach(pattern => {
      const found = content.match(pattern);
      if (found) {
        matches.push(...found);
      }
    });

    return matches;
  }

  /**
   * Extract email addresses from content
   */
  private static extractEmails(content: string): string[] {
    const matches: string[] = [];
    
    this.EMAIL_PATTERNS.forEach(pattern => {
      const found = content.match(pattern);
      if (found) {
        matches.push(...found);
      }
    });

    return matches;
  }

  /**
   * Check for platform bypass keywords
   */
  private static checkPlatformBypassKeywords(content: string): string[] {
    const lowerContent = content.toLowerCase();
    return this.PLATFORM_BYPASS_KEYWORDS.filter(keyword => 
      lowerContent.includes(keyword)
    );
  }

  /**
   * Extract social media links
   */
  private static extractSocialMediaLinks(content: string): string[] {
    const matches: string[] = [];
    
    this.SOCIAL_MEDIA_PATTERNS.forEach(pattern => {
      const found = content.match(pattern);
      if (found) {
        matches.push(...found);
      }
    });

    return matches;
  }

  /**
   * Sanitize content by removing/masking violations
   */
  private static sanitizeContent(content: string): string {
    let sanitized = content;

    // Replace phone numbers
    this.PHONE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[PHONE REMOVED]');
    });

    // Replace emails
    this.EMAIL_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[EMAIL REMOVED]');
    });

    // Replace social media links
    this.SOCIAL_MEDIA_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[LINK REMOVED]');
    });

    return sanitized;
  }

  /**
   * Log terms violation
   */
  private static async logViolation(
    userId: string,
    consultationId: string,
    type: string,
    metadata: any
  ): Promise<void> {
    try {
      await prisma.termsViolation.create({
        data: {
          userId,
          type,
          description: `Content monitoring detected ${type} in consultation ${consultationId}`,
          severity: this.getSeverityForViolationType(type),
          actionTaken: 'content_flagged',
          createdAt: new Date()
        }
      });

      // Update consultation with violation flag
      await prisma.consultation.update({
        where: { id: consultationId },
        data: {
          externalContact: true,
          warningsSent: {
            increment: 1
          }
        }
      });

    } catch (error) {
      console.error('Error logging terms violation:', error);
    }
  }

  /**
   * Get severity level for violation type
   */
  private static getSeverityForViolationType(type: string): string {
    switch (type) {
      case 'phone_number':
      case 'email_address':
        return 'warning';
      case 'platform_bypass':
        return 'suspension';
      case 'external_link':
        return 'warning';
      default:
        return 'warning';
    }
  }

  /**
   * Check if user should be warned or suspended based on violation history
   */
  static async checkUserViolationLevel(userId: string): Promise<{
    shouldWarn: boolean;
    shouldSuspend: boolean;
    violationCount: number;
  }> {
    try {
      const recentViolations = await prisma.termsViolation.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      });

      return {
        shouldWarn: recentViolations >= 1,
        shouldSuspend: recentViolations >= 3,
        violationCount: recentViolations
      };

    } catch (error) {
      console.error('Error checking user violation level:', error);
      return {
        shouldWarn: false,
        shouldSuspend: false,
        violationCount: 0
      };
    }
  }

  /**
   * Get platform-approved alternatives for flagged content
   */
  static getPlatformAlternatives(): string[] {
    return [
      "Let's continue our discussion through the VibeLux platform video call",
      "I'll share additional resources through the platform's file sharing",
      "We can schedule a follow-up session through the platform",
      "All our communication should remain on the VibeLux platform for your protection",
      "The platform provides secure video calls and file sharing for our consultation"
    ];
  }
}

/**
 * Message interceptor for real-time monitoring
 */
export async function interceptMessage(
  content: string,
  senderId: string,
  consultationId: string
): Promise<{
  allowed: boolean;
  processedContent: string;
  flagged: boolean;
  warning?: string;
}> {
  const monitoringResult = await ContentMonitor.monitorMessage(
    content,
    senderId,
    consultationId
  );

  if (monitoringResult.flagged) {
    // Check user's violation history
    const violationCheck = await ContentMonitor.checkUserViolationLevel(senderId);
    
    if (violationCheck.shouldSuspend) {
      // Block message and suspend user
      return {
        allowed: false,
        processedContent: '',
        flagged: true,
        warning: 'Your account has been temporarily suspended due to repeated policy violations. Please contact support.'
      };
    }

    if (violationCheck.shouldWarn || monitoringResult.confidence > 0.8) {
      // Allow but sanitize and warn
      return {
        allowed: true,
        processedContent: monitoringResult.sanitizedContent || content,
        flagged: true,
        warning: 'Your message contained prohibited content and has been modified. All consultations must remain on the VibeLux platform.'
      };
    }
  }

  return {
    allowed: true,
    processedContent: content,
    flagged: false
  };
}