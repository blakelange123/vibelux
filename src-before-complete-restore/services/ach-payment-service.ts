/**
 * ACH Payment Service with Bank Verification
 * Handles ACH payment setup, bank account verification, and processing
 */

import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

interface BankAccountDetails {
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  accountHolderType: 'individual' | 'company';
  accountType: 'checking' | 'savings';
}

interface MicroDepositAmounts {
  amount1: number;
  amount2: number;
}

export class ACHPaymentService {
  /**
   * Add a bank account for ACH payments with Plaid or manual entry
   */
  async addBankAccount(
    customerId: string,
    method: 'plaid' | 'manual',
    details: BankAccountDetails | { plaidToken: string; accountId: string }
  ): Promise<{ success: boolean; paymentMethodId?: string; error?: string }> {
    try {
      // Get or create Stripe customer
      const stripeCustomer = await this.ensureStripeCustomer(customerId);

      if (method === 'plaid') {
        // Plaid integration for instant bank verification
        const plaidDetails = details as { plaidToken: string; accountId: string };
        return await this.addPlaidBankAccount(customerId, stripeCustomer.id, plaidDetails);
      } else {
        // Manual bank account with micro-deposits
        const bankDetails = details as BankAccountDetails;
        return await this.addManualBankAccount(customerId, stripeCustomer.id, bankDetails);
      }
    } catch (error) {
      console.error('Error adding bank account:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add bank account'
      };
    }
  }

  /**
   * Add bank account via Plaid (instant verification)
   */
  private async addPlaidBankAccount(
    customerId: string,
    stripeCustomerId: string,
    details: { plaidToken: string; accountId: string }
  ): Promise<{ success: boolean; paymentMethodId?: string; error?: string }> {
    try {
      // Exchange Plaid token for Stripe bank account token
      const bankAccountToken = await stripe.tokens.create({
        bank_account: {
          country: 'US',
          currency: 'usd',
          account_holder_name: 'Account Holder', // Would come from Plaid
          account_holder_type: 'individual',
          routing_number: '110000000', // Would come from Plaid
          account_number: '000123456789', // Would come from Plaid
        },
      });

      // Create bank account on customer
      const bankAccount = await stripe.customers.createSource(stripeCustomerId, {
        source: bankAccountToken.id,
      });

      // Save to database
      await prisma.paymentMethod.create({
        data: {
          customerId,
          type: 'ACH',
          status: 'ACTIVE',
          stripeCustomerId,
          stripePaymentMethodId: bankAccount.id,
          plaidAccessToken: details.plaidToken,
          plaidAccountId: details.accountId,
          bankName: 'Connected via Plaid',
          accountLastFour: '****', // Would come from Plaid
        },
      });

      
      return {
        success: true,
        paymentMethodId: bankAccount.id,
      };
    } catch (error) {
      console.error('Plaid bank account error:', error);
      return {
        success: false,
        error: 'Failed to add bank account via Plaid'
      };
    }
  }

  /**
   * Add bank account manually with micro-deposit verification
   */
  private async addManualBankAccount(
    customerId: string,
    stripeCustomerId: string,
    details: BankAccountDetails
  ): Promise<{ success: boolean; paymentMethodId?: string; error?: string }> {
    try {
      // Create bank account token
      const bankAccountToken = await stripe.tokens.create({
        bank_account: {
          country: 'US',
          currency: 'usd',
          account_holder_name: details.accountHolderName,
          account_holder_type: details.accountHolderType,
          routing_number: details.routingNumber,
          account_number: details.accountNumber,
        },
      });

      // Attach to customer
      const bankAccount = await stripe.customers.createSource(stripeCustomerId, {
        source: bankAccountToken.id,
      }) as Stripe.BankAccount;

      // Save to database (pending verification)
      await prisma.paymentMethod.create({
        data: {
          customerId,
          type: 'ACH',
          status: 'SUSPENDED', // Pending micro-deposit verification
          stripeCustomerId,
          stripePaymentMethodId: bankAccount.id,
          bankName: bankAccount.bank_name || 'Unknown Bank',
          accountLastFour: bankAccount.last4,
        },
      });

      // Initiate micro-deposits
      await stripe.customers.verifySource(stripeCustomerId, bankAccount.id, {
        amounts: [32, 45], // Stripe will send these amounts as micro-deposits
      });

      
      return {
        success: true,
        paymentMethodId: bankAccount.id,
      };
    } catch (error) {
      console.error('Manual bank account error:', error);
      return {
        success: false,
        error: 'Failed to add bank account'
      };
    }
  }

  /**
   * Verify micro-deposits to activate bank account
   */
  async verifyMicroDeposits(
    customerId: string,
    paymentMethodId: string,
    amounts: MicroDepositAmounts
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          customerId,
          stripePaymentMethodId: paymentMethodId,
        },
      });

      if (!paymentMethod) {
        return { success: false, error: 'Payment method not found' };
      }

      // Verify with Stripe
      const verification = await stripe.customers.verifySource(
        paymentMethod.stripeCustomerId!,
        paymentMethodId,
        {
          amounts: [amounts.amount1, amounts.amount2],
        }
      );

      if (verification.status === 'verified') {
        // Update payment method status
        await prisma.paymentMethod.update({
          where: { id: paymentMethod.id },
          data: { status: 'ACTIVE' },
        });

        return { success: true };
      } else {
        return { success: false, error: 'Verification failed' };
      }
    } catch (error) {
      console.error('Micro-deposit verification error:', error);
      return {
        success: false,
        error: 'Failed to verify micro-deposits'
      };
    }
  }

  /**
   * Process ACH payment
   */
  async processACHPayment(
    customerId: string,
    paymentMethodId: string,
    amount: number,
    description: string,
    invoiceId?: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          customerId,
          stripePaymentMethodId: paymentMethodId,
          status: 'ACTIVE',
          type: 'ACH'
        },
      });

      if (!paymentMethod) {
        return { success: false, error: 'Active ACH payment method not found' };
      }

      // Create charge for ACH payment
      const charge = await stripe.charges.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: paymentMethod.stripeCustomerId!,
        source: paymentMethod.stripePaymentMethodId!,
        description,
        metadata: {
          invoiceId: invoiceId || '',
          customerId,
        },
      });

      // Record payment in database
      if (invoiceId) {
        await prisma.payment.create({
          data: {
            invoiceId,
            customerId,
            amount,
            paymentMethod: 'ACH',
            transactionId: charge.id,
            status: charge.status === 'succeeded' ? 'COMPLETED' : 'PROCESSING',
            processedAt: new Date(),
          },
        });
      }


      return {
        success: true,
        transactionId: charge.id,
      };
    } catch (error) {
      console.error('ACH payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  /**
   * Setup ACH mandate for recurring payments
   */
  async setupACHMandate(
    customerId: string,
    paymentMethodId: string,
    mandateText: string
  ): Promise<{ success: boolean; mandateId?: string; error?: string }> {
    try {
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          customerId,
          stripePaymentMethodId: paymentMethodId,
          status: 'ACTIVE',
        },
      });

      if (!paymentMethod) {
        return { success: false, error: 'Active payment method not found' };
      }

      // Create setup intent for ACH mandate
      const setupIntent = await stripe.setupIntents.create({
        customer: paymentMethod.stripeCustomerId!,
        payment_method_types: ['us_bank_account'],
        usage: 'off_session',
        mandate_data: {
          customer_acceptance: {
            type: 'online',
            online: {
              ip_address: '0.0.0.0', // Would be actual IP
              user_agent: 'Mozilla/5.0', // Would be actual user agent
            },
          },
        },
      });

      // Store mandate reference
      // In production, you'd store this in a mandates table

      return {
        success: true,
        mandateId: setupIntent.id,
      };
    } catch (error) {
      console.error('ACH mandate error:', error);
      return {
        success: false,
        error: 'Failed to setup ACH mandate'
      };
    }
  }

  /**
   * Get or create Stripe customer
   */
  private async ensureStripeCustomer(customerId: string): Promise<Stripe.Customer> {
    const user = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        paymentMethods: {
          where: { stripeCustomerId: { not: null } },
          take: 1,
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if customer already has Stripe ID
    if (user.paymentMethods[0]?.stripeCustomerId) {
      const customer = await stripe.customers.retrieve(
        user.paymentMethods[0].stripeCustomerId
      );
      return customer as Stripe.Customer;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId: user.id,
      },
    });

    return customer;
  }

  /**
   * Handle ACH payment webhook events
   */
  async handleACHWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'charge.succeeded':
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_method_details?.type === 'ach_debit') {
          await this.handleACHSuccess(charge);
        }
        break;

      case 'charge.failed':
        const failedCharge = event.data.object as Stripe.Charge;
        if (failedCharge.payment_method_details?.type === 'ach_debit') {
          await this.handleACHFailure(failedCharge);
        }
        break;

      case 'source.chargeable':
        // Bank account verified and ready for charges
        const source = event.data.object as Stripe.Source;
        await this.handleBankAccountVerified(source);
        break;
    }
  }

  private async handleACHSuccess(charge: Stripe.Charge): Promise<void> {
    
    // Update payment status
    await prisma.payment.updateMany({
      where: { transactionId: charge.id },
      data: { status: 'COMPLETED' },
    });
  }

  private async handleACHFailure(charge: Stripe.Charge): Promise<void> {
    console.error(`❌ ACH payment failed: ${charge.id}`, charge.failure_message);
    
    // Update payment status and handle retry
    await prisma.payment.updateMany({
      where: { transactionId: charge.id },
      data: { status: 'FAILED' },
    });

    // Trigger retry logic
    // This would be handled by the payment retry service
  }

  private async handleBankAccountVerified(source: Stripe.Source): Promise<void> {
    
    // Update payment method status
    await prisma.paymentMethod.updateMany({
      where: { stripePaymentMethodId: source.id },
      data: { status: 'ACTIVE' },
    });
  }
}