/**
 * Payment Retry Service
 * Handles failed payment retries with exponential backoff and recovery strategies
 */

import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { ACHPaymentService } from './ach-payment-service';
import { sendPaymentNotification } from '@/lib/email/payment-notifications';
import { updateTrustScore } from '@/lib/trust/trust-score-calculator';

interface RetryConfig {
  maxAttempts: number;
  initialDelayHours: number;
  backoffMultiplier: number;
  maxDelayDays: number;
}

interface PaymentRetryResult {
  success: boolean;
  transactionId?: string;
  nextRetryDate?: Date;
  error?: string;
  shouldEscalate: boolean;
}

export class PaymentRetryService {
  private achService: ACHPaymentService;
  
  private readonly defaultConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelayHours: 24,
    backoffMultiplier: 2,
    maxDelayDays: 7
  };

  constructor() {
    this.achService = new ACHPaymentService();
  }

  /**
   * Process a failed payment with retry logic
   */
  async retryFailedPayment(
    paymentId: string,
    config: Partial<RetryConfig> = {}
  ): Promise<PaymentRetryResult> {
    const retryConfig = { ...this.defaultConfig, ...config };
    
    try {
      // Get payment details
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          invoice: true,
          customer: true
        }
      });

      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }

      // Get payment schedule if exists
      const schedule = await prisma.paymentSchedule.findFirst({
        where: {
          invoiceId: payment.invoiceId,
          transactionId: payment.transactionId
        }
      });

      const retryCount = schedule?.retryCount || 0;

      // Check if max retries exceeded
      if (retryCount >= retryConfig.maxAttempts) {
        return await this.handleMaxRetriesExceeded(payment);
      }

      // Calculate next retry delay
      const delayHours = this.calculateRetryDelay(retryCount, retryConfig);
      const nextRetryDate = new Date(Date.now() + delayHours * 60 * 60 * 1000);


      // Update or create payment schedule
      if (schedule) {
        await prisma.paymentSchedule.update({
          where: { id: schedule.id },
          data: {
            retryCount: retryCount + 1,
            scheduledDate: nextRetryDate,
            status: 'RETRY',
            lastError: payment.status === 'FAILED' ? 'Previous attempt failed' : undefined
          }
        });
      } else {
        await prisma.paymentSchedule.create({
          data: {
            invoiceId: payment.invoiceId,
            scheduledDate: nextRetryDate,
            status: 'RETRY',
            paymentMethod: payment.paymentMethod,
            amount: payment.amount,
            retryCount: 1,
            maxRetries: retryConfig.maxAttempts,
            transactionId: payment.transactionId
          }
        });
      }

      // Send retry notification
      await this.sendRetryNotification(payment, nextRetryDate, retryCount + 1);

      return {
        success: false, // Payment hasn't succeeded yet
        nextRetryDate,
        shouldEscalate: false
      };

    } catch (error) {
      console.error('Payment retry error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Retry failed',
        shouldEscalate: true
      };
    }
  }

  /**
   * Execute a scheduled payment retry
   */
  async executeScheduledRetry(scheduleId: string): Promise<PaymentRetryResult> {
    try {
      const schedule = await prisma.paymentSchedule.findUnique({
        where: { id: scheduleId },
        include: {
          invoice: {
            include: {
              customer: true,
              agreement: true
            }
          }
        }
      });

      if (!schedule) {
        throw new Error(`Payment schedule not found: ${scheduleId}`);
      }


      // Get active payment method
      const paymentMethod = await this.getActivePaymentMethod(
        schedule.invoice.customerId,
        schedule.paymentMethod as 'ACH' | 'CARD' | 'WIRE'
      );

      if (!paymentMethod) {
        return await this.handleNoPaymentMethod(schedule);
      }

      // Attempt payment based on method
      let result: PaymentRetryResult;
      
      switch (schedule.paymentMethod) {
        case 'ACH':
          result = await this.retryACHPayment(schedule, paymentMethod);
          break;
        case 'CARD':
          result = await this.retryCardPayment(schedule, paymentMethod);
          break;
        default:
          throw new Error(`Unsupported payment method: ${schedule.paymentMethod}`);
      }

      // Update schedule based on result
      if (result.success) {
        await this.handleSuccessfulRetry(schedule, result.transactionId!);
      } else {
        await this.handleFailedRetry(schedule, result.error);
      }

      return result;

    } catch (error) {
      console.error('Scheduled retry execution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
        shouldEscalate: true
      };
    }
  }

  /**
   * Retry ACH payment
   */
  private async retryACHPayment(
    schedule: any,
    paymentMethod: any
  ): Promise<PaymentRetryResult> {
    try {
      const result = await this.achService.processACHPayment(
        schedule.invoice.customerId,
        paymentMethod.stripePaymentMethodId,
        schedule.amount,
        `Retry payment for invoice ${schedule.invoice.invoiceNumber}`,
        schedule.invoiceId
      );

      if (result.success) {
        return {
          success: true,
          transactionId: result.transactionId,
          shouldEscalate: false
        };
      } else {
        // Check if error is recoverable
        const isRecoverable = this.isRecoverableError(result.error);
        
        return {
          success: false,
          error: result.error,
          shouldEscalate: !isRecoverable,
          nextRetryDate: isRecoverable ? 
            new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
        };
      }
    } catch (error) {
      console.error('ACH retry error:', error);
      return {
        success: false,
        error: 'ACH payment failed',
        shouldEscalate: true
      };
    }
  }

  /**
   * Retry card payment
   */
  private async retryCardPayment(
    schedule: any,
    paymentMethod: any
  ): Promise<PaymentRetryResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(schedule.amount * 100), // Convert to cents
        currency: 'usd',
        customer: paymentMethod.stripeCustomerId,
        payment_method: paymentMethod.stripePaymentMethodId,
        off_session: true,
        confirm: true,
        metadata: {
          invoiceId: schedule.invoiceId,
          retryAttempt: schedule.retryCount.toString()
        }
      });

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          transactionId: paymentIntent.id,
          shouldEscalate: false
        };
      } else {
        return {
          success: false,
          error: `Payment status: ${paymentIntent.status}`,
          shouldEscalate: paymentIntent.status === 'canceled',
          nextRetryDate: paymentIntent.status === 'processing' ? 
            new Date(Date.now() + 4 * 60 * 60 * 1000) : undefined // Retry in 4 hours if processing
        };
      }
    } catch (error) {
      console.error('Card retry error:', error);
      
      // Parse Stripe error
      const stripeError = error as any;
      const isRecoverable = this.isRecoverableStripeError(stripeError);
      
      return {
        success: false,
        error: stripeError.message || 'Card payment failed',
        shouldEscalate: !isRecoverable,
        nextRetryDate: isRecoverable ? 
          new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
      };
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(
    retryCount: number,
    config: RetryConfig
  ): number {
    const baseDelay = config.initialDelayHours;
    const multiplier = Math.pow(config.backoffMultiplier, retryCount);
    const delayHours = baseDelay * multiplier;
    
    // Cap at max delay
    const maxDelayHours = config.maxDelayDays * 24;
    return Math.min(delayHours, maxDelayHours);
  }

  /**
   * Get active payment method for customer
   */
  private async getActivePaymentMethod(
    customerId: string,
    type: 'ACH' | 'CARD' | 'WIRE'
  ): Promise<any> {
    return await prisma.paymentMethod.findFirst({
      where: {
        customerId,
        type,
        status: 'ACTIVE',
        isDefault: true
      }
    });
  }

  /**
   * Handle successful retry
   */
  private async handleSuccessfulRetry(
    schedule: any,
    transactionId: string
  ): Promise<void> {

    // Update payment schedule
    await prisma.paymentSchedule.update({
      where: { id: schedule.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        transactionId
      }
    });

    // Update invoice status
    await prisma.invoice.update({
      where: { id: schedule.invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentTransactionId: transactionId
      }
    });

    // Update trust score positively
    await updateTrustScore(schedule.invoice.customerId);

    // Send success notification
    await sendPaymentNotification('confirmation', {
      customerEmail: schedule.invoice.customer.email,
      customerName: schedule.invoice.customer.name || 'Customer',
      amount: schedule.amount,
      invoiceNumber: schedule.invoice.invoiceNumber,
      dueDate: schedule.invoice.dueDate,
      transactionId
    });
  }

  /**
   * Handle failed retry
   */
  private async handleFailedRetry(
    schedule: any,
    error?: string
  ): Promise<void> {

    // Update payment schedule
    await prisma.paymentSchedule.update({
      where: { id: schedule.id },
      data: {
        status: 'FAILED',
        lastError: error || 'Payment failed'
      }
    });

    // Check if should retry again
    if (schedule.retryCount < schedule.maxRetries) {
      // Schedule next retry
      await this.retryFailedPayment(schedule.id);
    } else {
      // Max retries reached, escalate
      await this.escalateFailedPayment(schedule);
    }
  }

  /**
   * Handle max retries exceeded
   */
  private async handleMaxRetriesExceeded(payment: any): Promise<PaymentRetryResult> {
    // Update invoice to overdue
    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'OVERDUE' }
    });

    // Create collection case
    await prisma.collectionCase.create({
      data: {
        invoiceId: payment.invoiceId,
        customerId: payment.customerId,
        amount: payment.amount,
        status: 'OPEN',
        priority: payment.amount > 1000 ? 'HIGH' : 'MEDIUM',
        assignedTo: 'system' // Would be assigned to collection agent
      }
    });

    // Update trust score negatively
    await updateTrustScore(payment.customerId);

    // Send final notice
    await sendPaymentNotification('overdue', {
      customerEmail: payment.customer.email,
      customerName: payment.customer.name || 'Customer',
      amount: payment.amount,
      invoiceNumber: payment.invoice.invoiceNumber,
      dueDate: payment.invoice.dueDate
    });

    return {
      success: false,
      error: 'Max retries exceeded',
      shouldEscalate: true
    };
  }

  /**
   * Handle no payment method available
   */
  private async handleNoPaymentMethod(schedule: any): Promise<PaymentRetryResult> {
    // Send notification to update payment method
    await sendPaymentNotification('failed', {
      customerEmail: schedule.invoice.customer.email,
      customerName: schedule.invoice.customer.name || 'Customer',
      amount: schedule.amount,
      invoiceNumber: schedule.invoice.invoiceNumber,
      dueDate: schedule.invoice.dueDate
    });

    return {
      success: false,
      error: 'No active payment method',
      shouldEscalate: true
    };
  }

  /**
   * Escalate failed payment to collections
   */
  private async escalateFailedPayment(schedule: any): Promise<void> {

    // Create collection activity
    await prisma.collectionActivity.create({
      data: {
        invoiceId: schedule.invoiceId,
        customerId: schedule.invoice.customerId,
        actionType: 'EMAIL',
        actionTemplate: 'final_notice',
        daysPastDue: Math.floor(
          (Date.now() - new Date(schedule.invoice.dueDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        ),
        success: true,
        responseDetails: {
          escalatedAt: new Date().toISOString(),
          reason: 'Max payment retries exceeded'
        }
      }
    });
  }

  /**
   * Send retry notification
   */
  private async sendRetryNotification(
    payment: any,
    nextRetryDate: Date,
    attemptNumber: number
  ): Promise<void> {
    // Custom notification for retry scheduled
    const emailContent = {
      customerEmail: payment.customer.email,
      customerName: payment.customer.name || 'Customer',
      amount: payment.amount,
      invoiceNumber: payment.invoice.invoiceNumber,
      dueDate: payment.invoice.dueDate,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId
    };

    await sendPaymentNotification('reminder', {
      ...emailContent,
      dueDate: nextRetryDate // Use retry date as due date
    });
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverableError(error?: string): boolean {
    if (!error) return false;
    
    const recoverableErrors = [
      'insufficient funds',
      'temporary failure',
      'processing error',
      'network error',
      'timeout'
    ];
    
    return recoverableErrors.some(e => 
      error.toLowerCase().includes(e)
    );
  }

  /**
   * Check if Stripe error is recoverable
   */
  private isRecoverableStripeError(error: any): boolean {
    if (!error.code) return false;
    
    const recoverableErrorCodes = [
      'card_declined',
      'insufficient_funds',
      'processing_error',
      'rate_limit'
    ];
    
    return recoverableErrorCodes.includes(error.code);
  }
}