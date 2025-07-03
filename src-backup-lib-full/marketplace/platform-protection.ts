import { EventEmitter } from 'events';

export interface SuspiciousActivity {
  id: string;
  type: 'contact-info-shared' | 'external-link' | 'payment-request' | 'repeated-view-no-purchase' | 'price-discussion';
  vendorId: string;
  buyerId: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  evidence: string[];
  actionTaken?: string;
}

export interface MessageFilter {
  id: string;
  pattern: RegExp;
  type: 'email' | 'phone' | 'website' | 'payment' | 'social-media';
  action: 'block' | 'flag' | 'warn';
  message: string;
}

export class PlatformProtection extends EventEmitter {
  private messageFilters: MessageFilter[] = [];
  private suspiciousActivities: Map<string, SuspiciousActivity[]> = new Map();
  private userViolations: Map<string, number> = new Map();

  constructor() {
    super();
    this.initializeFilters();
  }

  private initializeFilters(): void {
    // Email patterns
    this.messageFilters.push({
      id: 'email-filter',
      pattern: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
      type: 'email',
      action: 'block',
      message: 'Email addresses cannot be shared. Please use Vibelux messaging.'
    });

    // Phone number patterns
    this.messageFilters.push({
      id: 'phone-filter',
      pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      type: 'phone',
      action: 'block',
      message: 'Phone numbers cannot be shared. Please use Vibelux messaging.'
    });

    // Website patterns
    this.messageFilters.push({
      id: 'website-filter',
      pattern: /(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?/gi,
      type: 'website',
      action: 'flag',
      message: 'External websites detected. Transactions must be completed on Vibelux.'
    });

    // Payment app patterns
    this.messageFilters.push({
      id: 'payment-filter',
      pattern: /\b(venmo|paypal|cashapp|zelle|wire transfer|bank transfer|check|cash)\b/gi,
      type: 'payment',
      action: 'block',
      message: 'External payment methods are not allowed. Use Vibelux secure payments.'
    });

    // Social media patterns
    this.messageFilters.push({
      id: 'social-filter',
      pattern: /\b(whatsapp|telegram|signal|instagram|facebook|twitter|linkedin|wechat)\b/gi,
      type: 'social-media',
      action: 'warn',
      message: 'Communication should remain on Vibelux platform.'
    });

    // Circumvention attempts
    this.messageFilters.push({
      id: 'circumvention-filter',
      pattern: /\b(call me|text me|email me|contact me at|reach me at|find me on|direct deal|off platform|avoid fees|save money)\b/gi,
      type: 'payment',
      action: 'block',
      message: 'Attempting to circumvent platform policies is prohibited.'
    });
  }

  // Message Filtering
  public filterMessage(message: string, senderId: string, recipientId: string): {
    allowed: boolean;
    filteredMessage: string;
    violations: MessageFilter[];
    warning?: string;
  } {
    let filteredMessage = message;
    const violations: MessageFilter[] = [];
    let blocked = false;

    for (const filter of this.messageFilters) {
      if (filter.pattern.test(message)) {
        violations.push(filter);
        
        switch (filter.action) {
          case 'block':
            filteredMessage = filteredMessage.replace(filter.pattern, '[BLOCKED]');
            blocked = true;
            break;
          case 'flag':
            this.flagSuspiciousActivity(senderId, recipientId, 'contact-info-shared', 
              `Attempted to share ${filter.type}`, [message]);
            break;
          case 'warn':
            // Just track but allow
            break;
        }
      }
    }

    if (blocked) {
      this.incrementViolation(senderId);
    }

    return {
      allowed: !blocked,
      filteredMessage,
      violations,
      warning: violations.length > 0 ? this.getWarningMessage(violations) : undefined
    };
  }

  // Transaction Monitoring
  public validateTransaction(transaction: {
    vendorId: string;
    buyerId: string;
    amount: number;
    productIds: string[];
  }): {
    valid: boolean;
    platformFee: number;
    netAmount: number;
  } {
    const platformFeeRate = 0.15; // 15% commission
    const platformFee = transaction.amount * platformFeeRate;
    const netAmount = transaction.amount - platformFee;

    // Check for suspicious patterns
    this.checkTransactionPatterns(transaction);

    return {
      valid: true,
      platformFee,
      netAmount
    };
  }

  // Pattern Detection
  private checkTransactionPatterns(transaction: any): void {
    // Check for suspiciously round numbers that might indicate off-platform negotiation
    if (transaction.amount % 100 === 0 && transaction.amount > 1000) {
      this.flagSuspiciousActivity(
        transaction.vendorId,
        transaction.buyerId,
        'price-discussion',
        'Suspiciously round transaction amount',
        [`Amount: $${transaction.amount}`]
      );
    }
  }

  // Activity Monitoring
  public trackUserActivity(userId: string, action: string, metadata: any): void {
    // Track repeated product views without purchase
    if (action === 'product-view') {
      const userViews = this.getUserActivityCount(userId, 'product-view', metadata.productId);
      if (userViews > 5) {
        this.flagSuspiciousActivity(
          metadata.vendorId,
          userId,
          'repeated-view-no-purchase',
          'User viewing product repeatedly without purchase',
          [`Product: ${metadata.productId}`, `Views: ${userViews}`]
        );
      }
    }
  }

  // Vendor Onboarding Protection
  public validateVendorListing(listing: {
    title: string;
    description: string;
    images: string[];
  }): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check title and description for contact info
    const contentToCheck = `${listing.title} ${listing.description}`;
    const messageCheck = this.filterMessage(contentToCheck, 'vendor', 'platform');
    
    if (messageCheck.violations.length > 0) {
      issues.push('Listing contains prohibited contact information');
    }

    // Check for common circumvention phrases
    const circumventionPhrases = [
      'contact directly',
      'better price off platform',
      'avoid fees',
      'deal direct',
      'cash only'
    ];

    for (const phrase of circumventionPhrases) {
      if (contentToCheck.toLowerCase().includes(phrase)) {
        issues.push(`Prohibited phrase detected: "${phrase}"`);
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Digital Watermarking for Images
  public watermarkProductImage(imageUrl: string, productId: string): string {
    // In production, this would add a subtle watermark with product/vendor info
    // This helps track if images are being used outside the platform
    return `${imageUrl}?watermark=${productId}`;
  }

  // Contract Generation
  public generatePlatformAgreement(transaction: any): {
    contractId: string;
    terms: string[];
    penalties: string[];
  } {
    return {
      contractId: `CONTRACT-${Date.now()}`,
      terms: [
        'All transactions must be completed through Vibelux platform',
        '15% platform fee applies to all sales',
        'Direct contact outside platform is prohibited',
        'Vendor agrees to exclusive listing for these products',
        'Violations may result in account suspension'
      ],
      penalties: [
        'First violation: Warning and 30-day probation',
        'Second violation: 30-day suspension',
        'Third violation: Permanent ban and forfeiture of pending payments'
      ]
    };
  }

  // Exclusive Deals & Incentives
  public calculateLoyaltyDiscount(vendorId: string, totalPlatformSales: number): number {
    // Reward vendors who do more business on platform
    if (totalPlatformSales > 100000) return 0.02; // 2% discount on fees
    if (totalPlatformSales > 50000) return 0.01;  // 1% discount on fees
    return 0;
  }

  // Enforcement
  private flagSuspiciousActivity(
    vendorId: string, 
    buyerId: string, 
    type: SuspiciousActivity['type'],
    description: string,
    evidence: string[]
  ): void {
    const activity: SuspiciousActivity = {
      id: `SA-${Date.now()}`,
      type,
      vendorId,
      buyerId,
      description,
      severity: this.calculateSeverity(type),
      timestamp: new Date(),
      evidence
    };

    const key = `${vendorId}-${buyerId}`;
    if (!this.suspiciousActivities.has(key)) {
      this.suspiciousActivities.set(key, []);
    }
    this.suspiciousActivities.get(key)!.push(activity);

    this.emit('suspiciousActivity', activity);

    // Auto-enforcement for severe violations
    if (activity.severity === 'high') {
      this.enforceViolation(vendorId, buyerId, activity);
    }
  }

  private calculateSeverity(type: SuspiciousActivity['type']): SuspiciousActivity['severity'] {
    switch (type) {
      case 'payment-request':
      case 'contact-info-shared':
        return 'high';
      case 'external-link':
      case 'price-discussion':
        return 'medium';
      default:
        return 'low';
    }
  }

  private enforceViolation(vendorId: string, buyerId: string, activity: SuspiciousActivity): void {
    // Immediate actions for severe violations
    activity.actionTaken = 'Account restricted pending review';
    
    this.emit('enforcementAction', {
      vendorId,
      buyerId,
      action: 'restrict',
      reason: activity.description,
      duration: '24 hours'
    });
  }

  private incrementViolation(userId: string): void {
    const current = this.userViolations.get(userId) || 0;
    this.userViolations.set(userId, current + 1);

    // Progressive enforcement
    if (current + 1 >= 3) {
      this.emit('accountSuspension', {
        userId,
        violations: current + 1,
        duration: '30 days'
      });
    }
  }

  private getUserActivityCount(userId: string, action: string, targetId: string): number {
    // In production, this would query a database
    return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10);
  }

  private getWarningMessage(violations: MessageFilter[]): string {
    const messages = violations.map(v => v.message);
    return `Warning: ${messages.join(' ')}`;
  }

  // Reporting
  public generateComplianceReport(period: { start: Date; end: Date }): {
    totalViolations: number;
    violationsByType: Record<string, number>;
    repeatOffenders: string[];
    enforcementActions: number;
    estimatedRevenueSaved: number;
  } {
    let totalViolations = 0;
    const violationsByType: Record<string, number> = {};
    const userViolationCounts = new Map<string, number>();

    for (const activities of this.suspiciousActivities.values()) {
      for (const activity of activities) {
        if (activity.timestamp >= period.start && activity.timestamp <= period.end) {
          totalViolations++;
          violationsByType[activity.type] = (violationsByType[activity.type] || 0) + 1;
          
          const count = userViolationCounts.get(activity.vendorId) || 0;
          userViolationCounts.set(activity.vendorId, count + 1);
        }
      }
    }

    const repeatOffenders = Array.from(userViolationCounts.entries())
      .filter(([_, count]) => count > 2)
      .map(([userId, _]) => userId);

    // Estimate revenue saved by preventing off-platform transactions
    const estimatedRevenueSaved = totalViolations * 500 * 0.15; // Assume $500 avg transaction

    return {
      totalViolations,
      violationsByType,
      repeatOffenders,
      enforcementActions: Math.floor(totalViolations * 0.3),
      estimatedRevenueSaved
    };
  }
}