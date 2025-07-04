/**
 * Stripe Connect Integration for Affiliate Payouts
 * Handles affiliate account creation, verification, and automated payouts
 */

import Stripe from 'stripe';
import { AffiliateUser, AffiliateCommission } from '@/lib/affiliates/affiliate-system';

// Initialize Stripe lazily to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
    });
  }
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  return stripe;
}

export interface StripeAffiliateAccount {
  id: string;
  affiliateId: string;
  stripeAccountId: string;
  accountType: 'express' | 'standard' | 'custom';
  onboardingComplete: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
  };
  metadata: {
    country: string;
    defaultCurrency: string;
    email: string;
    businessType?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutSchedule {
  affiliateId: string;
  frequency: 'monthly' | 'weekly' | 'manual';
  minimumAmount: number; // Minimum payout amount in cents
  nextPayoutDate?: Date;
  lastPayoutDate?: Date;
}

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  stripeTransferId: string;
  amount: number; // in cents
  currency: string;
  commissionIds: string[]; // Commission IDs included in this payout
  status: 'pending' | 'paid' | 'failed' | 'canceled';
  failureReason?: string;
  metadata: {
    period: string; // e.g., "2024-12"
    totalCommissions: number;
    processingFee: number;
  };
  paidAt?: Date;
  createdAt: Date;
}

export class StripeAffiliatePayouts {
  
  /**
   * Create Stripe Express account for affiliate
   */
  static async createAffiliateAccount(
    affiliate: AffiliateUser,
    accountInfo: {
      email: string;
      country: string;
      businessType?: 'individual' | 'company';
      firstName?: string;
      lastName?: string;
      companyName?: string;
    }
  ): Promise<StripeAffiliateAccount> {
    try {
      // Create Stripe Express account
      const account = await getStripe().accounts.create({
        type: 'express',
        country: accountInfo.country,
        email: accountInfo.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: accountInfo.businessType || 'individual',
        individual: accountInfo.businessType === 'individual' ? {
          first_name: accountInfo.firstName,
          last_name: accountInfo.lastName,
          email: accountInfo.email,
        } : undefined,
        company: accountInfo.businessType === 'company' ? {
          name: accountInfo.companyName,
        } : undefined,
        metadata: {
          vibelux_affiliate_id: affiliate.id,
          vibelux_user_id: affiliate.userId,
        },
      });

      // Store in database
      const stripeAccount: Omit<StripeAffiliateAccount, 'id' | 'createdAt' | 'updatedAt'> = {
        affiliateId: affiliate.id,
        stripeAccountId: account.id,
        accountType: 'express',
        onboardingComplete: false,
        payoutsEnabled: false,
        detailsSubmitted: account.details_submitted || false,
        chargesEnabled: account.charges_enabled || false,
        requirements: {
          currentlyDue: account.requirements?.currently_due || [],
          eventuallyDue: account.requirements?.eventually_due || [],
          pastDue: account.requirements?.past_due || [],
          pendingVerification: account.requirements?.pending_verification || [],
        },
        metadata: {
          country: accountInfo.country,
          defaultCurrency: account.default_currency || 'usd',
          email: accountInfo.email,
          businessType: accountInfo.businessType,
        },
      };

      // This would be saved to database
      const savedAccount = await this.saveAccountToDatabase(stripeAccount);
      
      return savedAccount;
    } catch (error) {
      console.error('Failed to create Stripe affiliate account:', error);
      throw new Error('Failed to create affiliate payout account');
    }
  }

  /**
   * Generate onboarding link for affiliate
   */
  static async createOnboardingLink(
    stripeAccountId: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<string> {
    try {
      const accountLink = await getStripe().accountLinks.create({
        account: stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink.url;
    } catch (error) {
      console.error('Failed to create onboarding link:', error);
      throw new Error('Failed to create onboarding link');
    }
  }

  /**
   * Check account status and update requirements
   */
  static async updateAccountStatus(stripeAccountId: string): Promise<Partial<StripeAffiliateAccount>> {
    try {
      const account = await getStripe().accounts.retrieve(stripeAccountId);
      
      return {
        onboardingComplete: account.details_submitted && account.charges_enabled,
        payoutsEnabled: account.payouts_enabled || false,
        detailsSubmitted: account.details_submitted || false,
        chargesEnabled: account.charges_enabled || false,
        requirements: {
          currentlyDue: account.requirements?.currently_due || [],
          eventuallyDue: account.requirements?.eventually_due || [],
          pastDue: account.requirements?.past_due || [],
          pendingVerification: account.requirements?.pending_verification || [],
        },
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to update account status:', error);
      throw new Error('Failed to update account status');
    }
  }

  /**
   * Process affiliate payout
   */
  static async processAffiliatePayout(
    affiliate: StripeAffiliateAccount,
    commissions: AffiliateCommission[],
    options: {
      currency?: string;
      description?: string;
    } = {}
  ): Promise<AffiliatePayout> {
    try {
      // Calculate total payout amount
      const totalAmount = commissions.reduce((sum, commission) => sum + commission.amount, 0);
      const amountInCents = Math.round(totalAmount * 100);
      
      // Check minimum payout amount
      const minimumPayout = 1000; // $10 minimum
      if (amountInCents < minimumPayout) {
        throw new Error(`Payout amount $${totalAmount} is below minimum $${minimumPayout / 100}`);
      }

      // Verify account can receive payouts
      if (!affiliate.payoutsEnabled) {
        throw new Error('Affiliate account is not enabled for payouts');
      }

      // Create transfer to affiliate account
      const transfer = await getStripe().transfers.create({
        amount: amountInCents,
        currency: options.currency || 'usd',
        destination: affiliate.stripeAccountId,
        description: options.description || `Vibelux affiliate commission payout`,
        metadata: {
          affiliate_id: affiliate.affiliateId,
          commission_count: commissions.length.toString(),
          period: new Date().toISOString().slice(0, 7), // YYYY-MM
        },
      });

      // Calculate processing fee (Stripe Connect fee)
      const processingFee = Math.round(amountInCents * 0.0025 + 25); // 0.25% + $0.25

      // Create payout record
      const payout: Omit<AffiliatePayout, 'id' | 'createdAt'> = {
        affiliateId: affiliate.affiliateId,
        stripeTransferId: transfer.id,
        amount: amountInCents,
        currency: transfer.currency,
        commissionIds: commissions.map(c => c.id),
        status: 'pending',
        metadata: {
          period: new Date().toISOString().slice(0, 7),
          totalCommissions: commissions.length,
          processingFee,
        },
        paidAt: transfer.created ? new Date(transfer.created * 1000) : undefined,
      };

      // Save to database
      const savedPayout = await this.savePayoutToDatabase(payout);

      // Mark commissions as paid
      await this.markCommissionsAsPaid(commissions.map(c => c.id), savedPayout.id);

      return savedPayout;
    } catch (error) {
      console.error('Failed to process affiliate payout:', error);
      throw new Error(`Failed to process payout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Schedule automatic payouts for affiliate
   */
  static async scheduleAutomaticPayouts(
    affiliateId: string,
    schedule: {
      frequency: 'monthly' | 'weekly';
      minimumAmount: number;
      dayOfMonth?: number; // For monthly (1-28)
      dayOfWeek?: number; // For weekly (0=Sunday, 6=Saturday)
    }
  ): Promise<PayoutSchedule> {
    const payoutSchedule: PayoutSchedule = {
      affiliateId,
      frequency: schedule.frequency,
      minimumAmount: Math.round(schedule.minimumAmount * 100), // Convert to cents
      nextPayoutDate: this.calculateNextPayoutDate(schedule),
    };

    // Save to database
    return await this.savePayoutScheduleToDatabase(payoutSchedule);
  }

  /**
   * Process scheduled payouts
   */
  static async processScheduledPayouts(): Promise<{
    processed: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      // Get all due payouts
      const duePayouts = await this.getDuePayouts();
      
      for (const schedule of duePayouts) {
        try {
          // Get pending commissions for affiliate
          const pendingCommissions = await this.getPendingCommissions(schedule.affiliateId);
          
          if (pendingCommissions.length === 0) {
            continue;
          }

          // Calculate total amount
          const totalAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
          
          if (totalAmount * 100 < schedule.minimumAmount) {
            continue; // Below minimum payout threshold
          }

          // Get affiliate Stripe account
          const affiliateAccount = await this.getAffiliateAccount(schedule.affiliateId);
          if (!affiliateAccount || !affiliateAccount.payoutsEnabled) {
            continue;
          }

          // Process payout
          await this.processAffiliatePayout(affiliateAccount, pendingCommissions, {
            description: `Scheduled ${schedule.frequency} payout`,
          });

          // Update next payout date
          await this.updateNextPayoutDate(schedule.affiliateId, schedule);
          
          results.processed++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to process payout for affiliate ${schedule.affiliateId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      results.errors.push(`Failed to process scheduled payouts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  /**
   * Get payout history for affiliate
   */
  static async getPayoutHistory(
    affiliateId: string,
    options: {
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<AffiliatePayout[]> {
    // This would query the database for payout history
    return [];
  }

  // Private helper methods

  private static calculateNextPayoutDate(schedule: {
    frequency: 'monthly' | 'weekly';
    dayOfMonth?: number;
    dayOfWeek?: number;
  }): Date {
    const now = new Date();
    const nextPayout = new Date();

    if (schedule.frequency === 'monthly') {
      const dayOfMonth = schedule.dayOfMonth || 1;
      nextPayout.setDate(dayOfMonth);
      nextPayout.setHours(0, 0, 0, 0);
      
      // If the date has passed this month, move to next month
      if (nextPayout <= now) {
        nextPayout.setMonth(nextPayout.getMonth() + 1);
      }
    } else if (schedule.frequency === 'weekly') {
      const dayOfWeek = schedule.dayOfWeek || 1; // Default to Monday
      const daysUntilNext = (7 + dayOfWeek - now.getDay()) % 7;
      nextPayout.setDate(now.getDate() + (daysUntilNext || 7));
      nextPayout.setHours(0, 0, 0, 0);
    }

    return nextPayout;
  }

  // Database operations (these would be implemented with actual database calls)
  
  private static async saveAccountToDatabase(account: Omit<StripeAffiliateAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<StripeAffiliateAccount> {
    // Implementation would save to database
    return {
      ...account,
      id: 'generated-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private static async savePayoutToDatabase(payout: Omit<AffiliatePayout, 'id' | 'createdAt'>): Promise<AffiliatePayout> {
    // Implementation would save to database
    return {
      ...payout,
      id: 'generated-id',
      createdAt: new Date(),
    };
  }

  private static async savePayoutScheduleToDatabase(schedule: PayoutSchedule): Promise<PayoutSchedule> {
    // Implementation would save to database
    return schedule;
  }

  private static async markCommissionsAsPaid(commissionIds: string[], payoutId: string): Promise<void> {
    // Implementation would update commission status in database
  }

  private static async getDuePayouts(): Promise<PayoutSchedule[]> {
    // Implementation would query database for due payouts
    return [];
  }

  private static async getPendingCommissions(affiliateId: string): Promise<AffiliateCommission[]> {
    // Implementation would query database for pending commissions
    return [];
  }

  private static async getAffiliateAccount(affiliateId: string): Promise<StripeAffiliateAccount | null> {
    // Implementation would query database for affiliate Stripe account
    return null;
  }

  private static async updateNextPayoutDate(affiliateId: string, schedule: PayoutSchedule): Promise<void> {
    // Implementation would update next payout date in database
  }
}

/**
 * Webhook handler for Stripe Connect events
 */
export class StripeAffiliateWebhooks {
  
  static async handleAccountUpdated(event: Stripe.Event): Promise<void> {
    const account = event.data.object as Stripe.Account;
    
    // Update account status in database
    const updates = await StripeAffiliatePayouts.updateAccountStatus(account.id);
    // Save updates to database
  }

  static async handleTransferPaid(event: Stripe.Event): Promise<void> {
    const transfer = event.data.object as Stripe.Transfer;
    
    // Update payout status to 'paid'
    // This would update the database record
  }

  static async handleTransferFailed(event: Stripe.Event): Promise<void> {
    const transfer = event.data.object as Stripe.Transfer;
    
    // Update payout status to 'failed'
    // Mark commissions as pending again
    // Send notification to affiliate and admin
  }
}

export default StripeAffiliatePayouts;