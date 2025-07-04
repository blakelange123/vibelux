import { z } from 'zod';
import Stripe from 'stripe';

// Configuration schemas
const StripeConnectConfigSchema = z.object({
  secretKey: z.string().optional(),
  region: z.string(),
  multiRegion: z.object({
    primary: z.string(),
    fallback: z.array(z.string()),
    loadBalancing: z.enum(['round-robin', 'geographic', 'latency-based']),
  }),
  webhook: z.object({
    endpoint: z.string().optional(),
    secret: z.string().optional(),
  }).optional(),
  platformFee: z.object({
    percentage: z.number().min(0).max(100).default(2.5),
    fixedAmount: z.number().min(0).default(30), // in cents
  }),
});

type StripeConnectConfig = z.infer<typeof StripeConnectConfigSchema>;

// Escrow schemas
const EscrowSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  parties: z.object({
    payer: z.string(),
    payee: z.string(),
    platform: z.string().optional(),
  }),
  releaseConditions: z.array(z.object({
    type: z.enum(['time', 'approval', 'milestone', 'signature']),
    value: z.any(),
    completed: z.boolean().default(false),
  })),
  status: z.enum(['pending', 'funded', 'released', 'disputed', 'cancelled']),
  fees: z.object({
    platform: z.number(),
    processing: z.number(),
    total: z.number(),
  }),
  createdAt: z.date(),
  expiresAt: z.date().optional(),
});

type EscrowPayment = z.infer<typeof EscrowSchema>;

// Multi-party transaction schemas
const MultiPartyTransactionSchema = z.object({
  id: z.string(),
  totalAmount: z.number(),
  currency: z.string(),
  splits: z.array(z.object({
    accountId: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })),
  metadata: z.record(z.string()),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']),
});

type MultiPartyTransaction = z.infer<typeof MultiPartyTransactionSchema>;

export class StripeConnectService {
  private stripe: Stripe;
  private config: StripeConnectConfig;
  private regionalStripeClients: Map<string, Stripe> = new Map();
  private escrowPayments: Map<string, EscrowPayment> = new Map();
  private connectedAccounts: Map<string, any> = new Map();

  constructor(config: StripeConnectConfig) {
    this.config = StripeConnectConfigSchema.parse(config);
    this.initializeStripeClients();
  }

  private initializeStripeClients(): void {
    const secretKey = this.config.secretKey || process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('Stripe secret key not configured');
    }

    // Initialize primary Stripe client
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    // Initialize regional clients for global support
    const allRegions = [this.config.multiRegion.primary, ...this.config.multiRegion.fallback];
    
    for (const region of allRegions) {
      const regionalClient = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
        typescript: true,
        // Note: Stripe doesn't have regional endpoints like some other services
        // but we maintain separate clients for potential future use
      });
      this.regionalStripeClients.set(region, regionalClient);
    }
  }

  // Account Creation and Management
  public async createAccount(params: {
    accountType: 'express' | 'standard' | 'custom';
    businessInfo: {
      name: string;
      email: string;
      country: string;
      capabilities: string[];
      businessType?: 'individual' | 'company';
    };
    metadata?: Record<string, string>;
  }): Promise<{ accountId: string; onboardingUrl?: string }> {
    try {
      const accountData: Stripe.AccountCreateParams = {
        type: params.accountType,
        country: params.businessInfo.country,
        email: params.businessInfo.email,
        capabilities: Object.fromEntries(
          params.businessInfo.capabilities.map(cap => [cap, { requested: true }])
        ) as any,
        metadata: params.metadata,
      };

      if (params.businessInfo.businessType) {
        accountData.business_type = params.businessInfo.businessType;
      }

      const account = await this.stripe.accounts.create(accountData);
      
      // Store account info
      this.connectedAccounts.set(account.id, {
        ...account,
        createdAt: new Date(),
      });

      let onboardingUrl: string | undefined;

      // Create onboarding link for Express accounts
      if (params.accountType === 'express') {
        const accountLink = await this.stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.BASE_URL}/connect/refresh`,
          return_url: `${process.env.BASE_URL}/connect/return`,
          type: 'account_onboarding',
        });
        onboardingUrl = accountLink.url;
      }

      return {
        accountId: account.id,
        onboardingUrl,
      };
    } catch (error) {
      throw new Error(`Failed to create Stripe account: ${error.message}`);
    }
  }

  public async getAccount(accountId: string): Promise<any> {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      return account;
    } catch (error) {
      throw new Error(`Failed to retrieve account: ${error.message}`);
    }
  }

  public async updateAccount(accountId: string, updates: Partial<Stripe.AccountUpdateParams>): Promise<any> {
    try {
      const account = await this.stripe.accounts.update(accountId, updates);
      this.connectedAccounts.set(accountId, {
        ...account,
        updatedAt: new Date(),
      });
      return account;
    } catch (error) {
      throw new Error(`Failed to update account: ${error.message}`);
    }
  }

  // Escrow Payment System
  public async createEscrow(params: {
    amount: number;
    currency: string;
    parties: {
      payer: string;
      payee: string;
      platform?: string;
    };
    releaseConditions: Array<{
      type: 'time' | 'approval' | 'milestone' | 'signature';
      value: any;
    }>;
    expirationHours?: number;
    metadata?: Record<string, string>;
  }): Promise<{ escrowId: string; paymentIntentId: string; status: string }> {
    const escrowId = `escrow_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
    
    // Calculate fees
    const platformFeeAmount = Math.round(
      (params.amount * this.config.platformFee.percentage / 100) + this.config.platformFee.fixedAmount
    );
    
    // Create payment intent with on_behalf_of for escrow
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: params.amount + platformFeeAmount,
      currency: params.currency,
      application_fee_amount: platformFeeAmount,
      on_behalf_of: params.parties.payee,
      transfer_data: {
        destination: params.parties.payee,
      },
      capture_method: 'manual', // Hold funds until release conditions are met
      metadata: {
        escrow_id: escrowId,
        payer: params.parties.payer,
        payee: params.parties.payee,
        ...params.metadata,
      },
    });

    // Create escrow record
    const escrow: EscrowPayment = {
      id: escrowId,
      amount: params.amount,
      currency: params.currency,
      parties: params.parties,
      releaseConditions: params.releaseConditions.map(condition => ({
        ...condition,
        completed: false,
      })),
      status: 'pending',
      fees: {
        platform: platformFeeAmount,
        processing: 0, // Will be calculated when payment is processed
        total: platformFeeAmount,
      },
      createdAt: new Date(),
      expiresAt: params.expirationHours 
        ? new Date(Date.now() + params.expirationHours * 60 * 60 * 1000)
        : undefined,
    };

    this.escrowPayments.set(escrowId, escrow);

    return {
      escrowId,
      paymentIntentId: paymentIntent.id,
      status: escrow.status,
    };
  }

  public async fundEscrow(escrowId: string, paymentMethodId: string): Promise<{ status: string; transactionId: string }> {
    const escrow = this.escrowPayments.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    try {
      // Confirm payment intent to fund escrow
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        `pi_${escrowId.split('_')[1]}`, // This is simplified - in real implementation, store PI ID
        {
          payment_method: paymentMethodId,
        }
      );

      // Update escrow status
      escrow.status = 'funded';
      this.escrowPayments.set(escrowId, escrow);

      return {
        status: 'funded',
        transactionId: paymentIntent.id,
      };
    } catch (error) {
      escrow.status = 'cancelled';
      this.escrowPayments.set(escrowId, escrow);
      throw new Error(`Failed to fund escrow: ${error.message}`);
    }
  }

  public async releaseEscrow(escrowId: string, releaseType: 'full' | 'partial', amount?: number): Promise<{ status: string; transferId: string }> {
    const escrow = this.escrowPayments.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    if (escrow.status !== 'funded') {
      throw new Error('Escrow must be funded before release');
    }

    // Check if release conditions are met
    const unmetConditions = escrow.releaseConditions.filter(condition => !condition.completed);
    if (unmetConditions.length > 0) {
      throw new Error(`Release conditions not met: ${unmetConditions.map(c => c.type).join(', ')}`);
    }

    try {
      const releaseAmount = releaseType === 'partial' && amount ? amount : escrow.amount;
      
      // Create transfer to payee
      const transfer = await this.stripe.transfers.create({
        amount: releaseAmount,
        currency: escrow.currency,
        destination: escrow.parties.payee,
        metadata: {
          escrow_id: escrowId,
          release_type: releaseType,
        },
      });

      // Update escrow status
      escrow.status = 'released';
      this.escrowPayments.set(escrowId, escrow);

      return {
        status: 'released',
        transferId: transfer.id,
      };
    } catch (error) {
      throw new Error(`Failed to release escrow: ${error.message}`);
    }
  }

  public async completeEscrowCondition(escrowId: string, conditionType: string, verificationData?: any): Promise<{ conditionsRemaining: number }> {
    const escrow = this.escrowPayments.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    // Find and complete the condition
    const condition = escrow.releaseConditions.find(c => c.type === conditionType && !c.completed);
    if (!condition) {
      throw new Error(`Condition ${conditionType} not found or already completed`);
    }

    // Verify condition based on type
    const isVerified = await this.verifyCondition(condition, verificationData);
    if (!isVerified) {
      throw new Error(`Condition ${conditionType} verification failed`);
    }

    condition.completed = true;
    this.escrowPayments.set(escrowId, escrow);

    const remainingConditions = escrow.releaseConditions.filter(c => !c.completed).length;

    // Auto-release if all conditions are met
    if (remainingConditions === 0) {
      await this.releaseEscrow(escrowId, 'full');
    }

    return { conditionsRemaining: remainingConditions };
  }

  private async verifyCondition(condition: any, verificationData?: any): Promise<boolean> {
    switch (condition.type) {
      case 'time':
        return new Date() >= new Date(condition.value);
      case 'approval':
        return verificationData?.approved === true;
      case 'milestone':
        return verificationData?.milestoneId === condition.value;
      case 'signature':
        return verificationData?.signature && this.verifyDigitalSignature(verificationData.signature, condition.value);
      default:
        return false;
    }
  }

  private verifyDigitalSignature(signature: string, expectedData: any): boolean {
    // Implement digital signature verification
    // This is a simplified placeholder
    return signature.length > 0;
  }

  // Multi-party Payment Splitting
  public async createMultiPartyPayment(params: {
    totalAmount: number;
    currency: string;
    splits: Array<{
      accountId: string;
      amount: number;
      description?: string;
    }>;
    paymentMethodId: string;
    metadata?: Record<string, string>;
  }): Promise<{ transactionId: string; transferIds: string[] }> {
    // Validate split amounts
    const totalSplitAmount = params.splits.reduce((sum, split) => sum + split.amount, 0);
    if (totalSplitAmount > params.totalAmount) {
      throw new Error('Split amounts exceed total amount');
    }

    const transactionId = `mpt_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;

    try {
      // Create payment intent for total amount
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: params.totalAmount,
        currency: params.currency,
        payment_method: params.paymentMethodId,
        confirm: true,
        metadata: {
          transaction_id: transactionId,
          type: 'multi_party',
          ...params.metadata,
        },
      });

      // Create transfers to each party
      const transferIds: string[] = [];
      
      for (const split of params.splits) {
        const transfer = await this.stripe.transfers.create({
          amount: split.amount,
          currency: params.currency,
          destination: split.accountId,
          source_transaction: paymentIntent.charges.data[0].id,
          metadata: {
            transaction_id: transactionId,
            description: split.description || '',
          },
        });
        transferIds.push(transfer.id);
      }

      // Store transaction record
      const transaction: MultiPartyTransaction = {
        id: transactionId,
        totalAmount: params.totalAmount,
        currency: params.currency,
        splits: params.splits,
        metadata: params.metadata || {},
        status: 'completed',
      };

      return {
        transactionId,
        transferIds,
      };
    } catch (error) {
      throw new Error(`Multi-party payment failed: ${error.message}`);
    }
  }

  // Marketplace Features
  public async createMarketplaceTransaction(params: {
    buyerId: string;
    sellerId: string;
    amount: number;
    currency: string;
    platformFeePercentage?: number;
    paymentMethodId: string;
    holdFunds?: boolean;
    metadata?: Record<string, string>;
  }): Promise<{ paymentIntentId: string; applicationFee: number }> {
    const platformFeePercentage = params.platformFeePercentage || this.config.platformFee.percentage;
    const applicationFee = Math.round(params.amount * platformFeePercentage / 100);

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: params.amount,
      currency: params.currency,
      application_fee_amount: applicationFee,
      on_behalf_of: params.sellerId,
      payment_method: params.paymentMethodId,
      confirm: !params.holdFunds,
      capture_method: params.holdFunds ? 'manual' : 'automatic',
      metadata: {
        buyer_id: params.buyerId,
        seller_id: params.sellerId,
        type: 'marketplace',
        ...params.metadata,
      },
    };

    if (!params.holdFunds) {
      paymentIntentParams.transfer_data = {
        destination: params.sellerId,
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);

    return {
      paymentIntentId: paymentIntent.id,
      applicationFee,
    };
  }

  // Subscription Management for Connected Accounts
  public async createConnectedSubscription(params: {
    customerId: string;
    priceId: string;
    connectedAccountId: string;
    applicationFeePercentage: number;
    trialPeriodDays?: number;
  }): Promise<{ subscriptionId: string }> {
    const subscription = await this.stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      application_fee_percent: params.applicationFeePercentage,
      trial_period_days: params.trialPeriodDays,
      metadata: {
        connected_account: params.connectedAccountId,
      },
    }, {
      stripeAccount: params.connectedAccountId,
    });

    return {
      subscriptionId: subscription.id,
    };
  }

  // Dispute Management
  public async handleDispute(params: {
    paymentIntentId: string;
    disputeReason: string;
    evidence?: Record<string, any>;
  }): Promise<{ disputeId: string; status: string }> {
    try {
      // In a real implementation, this would interact with Stripe's dispute system
      const disputeId = `dispute_${Date.now()}`;
      
      // Handle dispute logic here
      
      return {
        disputeId,
        status: 'under_review',
      };
    } catch (error) {
      throw new Error(`Failed to handle dispute: ${error.message}`);
    }
  }

  // Webhook Management
  public async verifyWebhook(payload: string, signature: string): Promise<Stripe.Event> {
    const endpointSecret = this.config.webhook?.secret || process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
      throw new Error('Webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (error) {
      throw new Error(`Webhook verification failed: ${error.message}`);
    }
  }

  public async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      case 'account.updated':
        await this.handleAccountUpdate(event.data.object as Stripe.Account);
        break;
      case 'transfer.created':
        await this.handleTransferCreated(event.data.object as Stripe.Transfer);
        break;
      default:
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const escrowId = paymentIntent.metadata?.escrow_id;
    if (escrowId) {
      const escrow = this.escrowPayments.get(escrowId);
      if (escrow) {
        escrow.status = 'funded';
        this.escrowPayments.set(escrowId, escrow);
      }
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const escrowId = paymentIntent.metadata?.escrow_id;
    if (escrowId) {
      const escrow = this.escrowPayments.get(escrowId);
      if (escrow) {
        escrow.status = 'cancelled';
        this.escrowPayments.set(escrowId, escrow);
      }
    }
  }

  private async handleAccountUpdate(account: Stripe.Account): Promise<void> {
    this.connectedAccounts.set(account.id, {
      ...account,
      updatedAt: new Date(),
    });
  }

  private async handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
  }

  // Analytics and Reporting
  public async getMetrics(): Promise<{
    connectedAccounts: number;
    totalVolume: number;
    platformFees: number;
    escrowPayments: {
      active: number;
      completed: number;
      total: number;
    };
    disputes: number;
  }> {
    const escrowArray = Array.from(this.escrowPayments.values());
    
    return {
      connectedAccounts: this.connectedAccounts.size,
      totalVolume: 0, // Would calculate from actual transactions
      platformFees: 0, // Would calculate from actual fees collected
      escrowPayments: {
        active: escrowArray.filter(e => e.status === 'funded').length,
        completed: escrowArray.filter(e => e.status === 'released').length,
        total: escrowArray.length,
      },
      disputes: 0, // Would track actual disputes
    };
  }

  public async healthCheck(): Promise<boolean> {
    try {
      // Test Stripe API access
      await this.stripe.balance.retrieve();
      return true;
    } catch {
      return false;
    }
  }

  // Utility methods
  public getEscrow(escrowId: string): EscrowPayment | undefined {
    return this.escrowPayments.get(escrowId);
  }

  public listEscrows(status?: string): EscrowPayment[] {
    const escrows = Array.from(this.escrowPayments.values());
    return status ? escrows.filter(e => e.status === status) : escrows;
  }

  public async getConnectedAccountBalance(accountId: string): Promise<{
    available: number;
    pending: number;
    currency: string;
  }> {
    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: accountId,
      });

      const availableBalance = balance.available[0] || { amount: 0, currency: 'usd' };
      const pendingBalance = balance.pending[0] || { amount: 0, currency: 'usd' };

      return {
        available: availableBalance.amount,
        pending: pendingBalance.amount,
        currency: availableBalance.currency,
      };
    } catch (error) {
      throw new Error(`Failed to get account balance: ${error.message}`);
    }
  }
}

// Export types
export type {
  StripeConnectConfig,
  EscrowPayment,
  MultiPartyTransaction,
};