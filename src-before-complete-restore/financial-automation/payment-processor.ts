import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { PlaidApi, Configuration, PlaidEnvironments } from 'plaid';
import { addDays, isWeekend, nextMonday } from 'date-fns';
import { sendPaymentNotification } from '../email/payment-notifications';
import { updateTrustScore } from '../trust/trust-score-calculator';

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  nextRetryDate?: Date;
}

export class AutomatedPaymentProcessor {
  private stripe: Stripe;
  private plaidClient: PlaidApi;
  
  constructor() {
    // Initialize Stripe
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
    
    // Initialize Plaid for ACH
    const configuration = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });
    
    this.plaidClient = new PlaidApi(configuration);
  }

  /**
   * Process all scheduled payments
   * Runs every day at 2 PM EST via cron job
   */
  async processScheduledPayments(): Promise<void> {
    
    // Get all payments scheduled for today or overdue
    const scheduledPayments = await prisma.paymentSchedule.findMany({
      where: {
        scheduledDate: { lte: new Date() },
        status: { in: ['SCHEDULED', 'RETRY'] },
        retryCount: { lt: 3 },
      },
      include: {
        invoice: {
          include: {
            customer: {
              include: {
                paymentMethods: true,
              }
            },
            agreement: true,
          }
        }
      }
    });


    // Process payments in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < scheduledPayments.length; i += batchSize) {
      const batch = scheduledPayments.slice(i, i + batchSize);
      await Promise.all(batch.map(payment => this.processPayment(payment)));
      
      // Small delay between batches
      if (i + batchSize < scheduledPayments.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

  }

  /**
   * Process individual payment
   */
  private async processPayment(schedule: any): Promise<void> {
    const { invoice, customer } = schedule.invoice;
    
    try {
      // Get primary payment method
      const paymentMethod = customer.paymentMethods.find((pm: any) => pm.isDefault) || 
                          customer.paymentMethods[0];
      
      if (!paymentMethod) {
        throw new Error('No payment method on file');
      }

      let result: PaymentResult;
      
      // Process based on payment method type
      switch (paymentMethod.type) {
        case 'ACH':
          result = await this.processACHPayment(schedule, paymentMethod);
          break;
        case 'CARD':
          result = await this.processCardPayment(schedule, paymentMethod);
          break;
        case 'WIRE':
          result = await this.processWireTransfer(schedule, paymentMethod);
          break;
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod.type}`);
      }

      if (result.success) {
        await this.handleSuccessfulPayment(schedule, result);
      } else {
        await this.handleFailedPayment(schedule, result);
      }
      
    } catch (error: any) {
      await this.handlePaymentError(schedule, error);
    }
  }

  /**
   * Process ACH payment via Plaid
   */
  private async processACHPayment(schedule: any, paymentMethod: any): Promise<PaymentResult> {
    try {
      // Create ACH transfer
      const transferResponse = await this.plaidClient.transferCreate({
        access_token: paymentMethod.plaidAccessToken,
        account_id: paymentMethod.plaidAccountId,
        type: 'debit',
        network: 'ach',
        amount: String(schedule.amount),
        currency: 'USD',
        description: `VibeLux Invoice ${schedule.invoice.invoiceNumber}`,
        ach_class: 'ppd',
        user: {
          legal_name: schedule.invoice.customer.name,
        },
        metadata: {
          invoiceId: schedule.invoice.id,
          customerId: schedule.invoice.customerId,
        }
      });

      return {
        success: true,
        transactionId: transferResponse.data.transfer.id,
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        nextRetryDate: this.calculateRetryDate(schedule.retryCount),
      };
    }
  }

  /**
   * Process card payment via Stripe
   */
  private async processCardPayment(schedule: any, paymentMethod: any): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(schedule.amount * 100), // Convert to cents
        currency: 'usd',
        customer: paymentMethod.stripeCustomerId,
        payment_method: paymentMethod.stripePaymentMethodId,
        off_session: true,
        confirm: true,
        description: `VibeLux Invoice ${schedule.invoice.invoiceNumber}`,
        metadata: {
          invoiceId: schedule.invoice.id,
          customerId: schedule.invoice.customerId,
        },
      });

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          transactionId: paymentIntent.id,
        };
      } else {
        return {
          success: false,
          error: `Payment status: ${paymentIntent.status}`,
          nextRetryDate: this.calculateRetryDate(schedule.retryCount),
        };
      }
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        nextRetryDate: this.calculateRetryDate(schedule.retryCount),
      };
    }
  }

  /**
   * Process wire transfer (manual process with automation)
   */
  private async processWireTransfer(schedule: any, paymentMethod: any): Promise<PaymentResult> {
    // For wire transfers, we create instructions and monitor for receipt
    await prisma.wireTransferInstruction.create({
      data: {
        paymentScheduleId: schedule.id,
        bankName: 'Wells Fargo Bank',
        accountNumber: process.env.VIBELUX_WIRE_ACCOUNT!,
        routingNumber: process.env.VIBELUX_ROUTING_NUMBER!,
        swiftCode: 'WFBIUS6S',
        reference: `VL-${schedule.invoice.invoiceNumber}`,
        amount: schedule.amount,
        expiresAt: addDays(new Date(), 5),
      }
    });

    // Send wire instructions email
    await sendPaymentNotification({
      type: 'WIRE_INSTRUCTIONS',
      customer: schedule.invoice.customer,
      invoice: schedule.invoice,
      amount: schedule.amount,
    });

    return {
      success: false, // Will be marked successful when wire is received
      error: 'Wire transfer pending',
      nextRetryDate: addDays(new Date(), 5),
    };
  }

  /**
   * Handle successful payment
   */
  private async handleSuccessfulPayment(schedule: any, result: PaymentResult): Promise<void> {
    // Update payment schedule
    await prisma.paymentSchedule.update({
      where: { id: schedule.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        transactionId: result.transactionId,
      }
    });

    // Update invoice status
    await prisma.invoice.update({
      where: { id: schedule.invoice.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentTransactionId: result.transactionId,
      }
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        invoiceId: schedule.invoice.id,
        customerId: schedule.invoice.customerId,
        amount: schedule.amount,
        paymentMethod: schedule.paymentMethod,
        transactionId: result.transactionId,
        status: 'COMPLETED',
        processedAt: new Date(),
      }
    });

    // Update customer trust score (positive impact)
    await updateTrustScore(schedule.invoice.customerId, {
      paymentOnTime: true,
      paymentAmount: schedule.amount,
    });

    // Process affiliate commissions if applicable
    await this.processAffiliateCommission(schedule.invoice);

    // Send payment confirmation
    await sendPaymentNotification({
      type: 'PAYMENT_SUCCESS',
      customer: schedule.invoice.customer,
      invoice: schedule.invoice,
      amount: schedule.amount,
      transactionId: result.transactionId,
    });
  }

  /**
   * Handle failed payment
   */
  private async handleFailedPayment(schedule: any, result: PaymentResult): Promise<void> {
    const isLastRetry = schedule.retryCount >= 2;
    
    // Update payment schedule
    await prisma.paymentSchedule.update({
      where: { id: schedule.id },
      data: {
        status: isLastRetry ? 'FAILED' : 'RETRY',
        retryCount: schedule.retryCount + 1,
        lastError: result.error,
        scheduledDate: result.nextRetryDate,
      }
    });

    // Update trust score (negative impact)
    await updateTrustScore(schedule.invoice.customerId, {
      paymentFailed: true,
      failureCount: schedule.retryCount + 1,
    });

    // Send appropriate notification
    if (isLastRetry) {
      // Final failure - escalate
      await prisma.collectionCase.create({
        data: {
          invoiceId: schedule.invoice.id,
          customerId: schedule.invoice.customerId,
          amount: schedule.amount,
          status: 'OPEN',
          priority: schedule.amount > 5000 ? 'HIGH' : 'MEDIUM',
          assignedTo: 'collections@vibelux.com',
        }
      });

      await sendPaymentNotification({
        type: 'PAYMENT_FINAL_FAILURE',
        customer: schedule.invoice.customer,
        invoice: schedule.invoice,
        amount: schedule.amount,
        error: result.error,
      });
    } else {
      // Retry notification
      await sendPaymentNotification({
        type: 'PAYMENT_RETRY',
        customer: schedule.invoice.customer,
        invoice: schedule.invoice,
        amount: schedule.amount,
        retryDate: result.nextRetryDate!,
        error: result.error,
      });
    }
  }

  /**
   * Handle payment processing errors
   */
  private async handlePaymentError(schedule: any, error: Error): Promise<void> {
    console.error(`Payment processing error for schedule ${schedule.id}:`, error);
    
    await prisma.paymentError.create({
      data: {
        paymentScheduleId: schedule.id,
        errorType: 'PROCESSING_ERROR',
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date(),
      }
    });

    // Treat as failed payment
    await this.handleFailedPayment(schedule, {
      success: false,
      error: error.message,
      nextRetryDate: this.calculateRetryDate(schedule.retryCount),
    });
  }

  /**
   * Calculate next retry date based on retry count
   */
  private calculateRetryDate(retryCount: number): Date {
    const daysToAdd = [3, 5, 7][retryCount] || 7;
    let retryDate = addDays(new Date(), daysToAdd);
    
    // Skip weekends
    if (isWeekend(retryDate)) {
      retryDate = nextMonday(retryDate);
    }
    
    return retryDate;
  }

  /**
   * Process affiliate commission for paid invoice
   */
  private async processAffiliateCommission(invoice: any): Promise<void> {
    if (!invoice.agreement.affiliateId) return;
    
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: invoice.agreement.affiliateId },
      include: { commissionTiers: true }
    });
    
    if (!affiliate) return;
    
    // Calculate commission based on customer lifetime
    const customerLifetime = await this.calculateCustomerLifetime(invoice.customerId);
    const tier = this.getCommissionTier(affiliate.commissionTiers, customerLifetime);
    
    if (!tier) return;
    
    const commissionAmount = (invoice.amountDue * tier.rate) / 100;
    
    // Create commission record
    await prisma.affiliateCommission.create({
      data: {
        affiliateId: affiliate.id,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        amount: commissionAmount,
        rate: tier.rate,
        tier: tier.name,
        status: 'PENDING',
        payoutDate: this.getNextPayoutDate(),
      }
    });
  }

  /**
   * Calculate customer lifetime in months
   */
  private async calculateCustomerLifetime(customerId: string): Promise<number> {
    const firstInvoice = await prisma.invoice.findFirst({
      where: { customerId },
      orderBy: { createdAt: 'asc' },
    });
    
    if (!firstInvoice) return 0;
    
    const months = Math.floor(
      (Date.now() - firstInvoice.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000)
    );
    
    return months;
  }

  /**
   * Get commission tier based on customer lifetime
   */
  private getCommissionTier(tiers: any[], lifetime: number): any {
    return tiers
      .sort((a, b) => b.minMonths - a.minMonths)
      .find(tier => lifetime >= tier.minMonths);
  }

  /**
   * Get next affiliate payout date (15th of next month)
   */
  private getNextPayoutDate(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    return nextMonth;
  }

  /**
   * Monitor wire transfers and mark as complete when received
   */
  async monitorWireTransfers(): Promise<void> {
    // This would integrate with bank APIs to check for incoming wires
    // For now, simulating with webhook endpoint
  }
}