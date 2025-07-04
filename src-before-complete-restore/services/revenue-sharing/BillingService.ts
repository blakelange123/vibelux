// Billing Service for Revenue Sharing
// Handles invoice generation, payment processing, and billing automation

export interface Invoice {
  id: string;
  invoiceNumber: string;
  facilityId: string;
  customerId: string;
  billingPeriod: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'disputed';
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  paidDate?: Date;
  metadata?: Record<string, any>;
}

export interface InvoiceLineItem {
  description: string;
  metricType: string;
  baseline: number;
  actual: number;
  savings: number;
  revenueSharePercentage: number;
  amount: number;
}

export interface PaymentMethod {
  id: string;
  customerId: string;
  type: 'ach' | 'wire' | 'credit_card' | 'check';
  isDefault: boolean;
  details: {
    last4?: string;
    bankName?: string;
    accountType?: string;
  };
  stripePaymentMethodId?: string;
}

export interface BillingSettings {
  customerId: string;
  autoCharge: boolean;
  paymentTerms: number; // days
  minimumBillingAmount: number;
  taxRate: number;
  reminderSchedule: number[]; // days before due date
  ccEmails: string[];
}

export class BillingService {
  // Generate invoice from revenue share calculation
  static generateInvoice(
    calculation: any, // RevenueShareCalculation from RevenueShareService
    customer: any,
    settings: BillingSettings
  ): Invoice {
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + settings.paymentTerms);

    const lineItems: InvoiceLineItem[] = calculation.metrics.map((metric: any) => ({
      description: `${this.formatMetricType(metric.type)} Revenue Share`,
      metricType: metric.type,
      baseline: metric.baseline,
      actual: metric.actual,
      savings: metric.savings,
      revenueSharePercentage: metric.sharePercentage,
      amount: metric.shareAmount
    }));

    const subtotal = calculation.totalRevenueShare;
    const tax = subtotal * settings.taxRate;
    const total = subtotal + tax;

    return {
      id: this.generateId(),
      invoiceNumber: this.generateInvoiceNumber(issueDate),
      facilityId: calculation.facilityId,
      customerId: customer.id,
      billingPeriod: calculation.billingPeriod,
      issueDate,
      dueDate,
      status: 'draft',
      lineItems,
      subtotal,
      tax,
      total,
      metadata: {
        calculationId: calculation.id,
        generatedAt: new Date()
      }
    };
  }

  // Format metric type for display
  private static formatMetricType(type: string): string {
    const formats: Record<string, string> = {
      energy: 'Energy Savings',
      yield: 'Yield Improvement',
      cost: 'Cost Reduction',
      quality: 'Quality Enhancement'
    };
    return formats[type] || type;
  }

  // Generate unique invoice number
  private static generateInvoiceNumber(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 1000).toString().padStart(4, '0');
    return `INV-${year}-${month}${random}`;
  }

  // Generate unique ID
  private static generateId(): string {
    return `inv_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;
  }

  // Process payment for invoice
  static async processPayment(
    invoice: Invoice,
    paymentMethod: PaymentMethod,
    amount?: number // Allow partial payments
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      const paymentAmount = amount || invoice.total;

      // Validate payment amount
      if (paymentAmount <= 0 || paymentAmount > invoice.total) {
        return {
          success: false,
          error: 'Invalid payment amount'
        };
      }

      // In production, this would integrate with Stripe or another payment processor
      // For now, simulate payment processing
      const transactionId = `txn_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Random failure for demo (5% chance)
      if (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.05) {
        return {
          success: false,
          error: 'Payment declined by bank'
        };
      }

      return {
        success: true,
        transactionId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  // Send invoice to customer
  static async sendInvoice(
    invoice: Invoice,
    recipients: string[]
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // In production, this would use an email service like SendGrid
      const messageId = `msg_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`;

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        messageId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send invoice'
      };
    }
  }

  // Check for overdue invoices
  static checkOverdueInvoices(invoices: Invoice[]): Invoice[] {
    const now = new Date();
    return invoices.filter(invoice => 
      invoice.status === 'sent' && 
      invoice.dueDate < now
    );
  }

  // Calculate late fees
  static calculateLateFee(
    invoice: Invoice,
    lateFeePercentage: number = 0.015, // 1.5% per month
    gracePeriodDays: number = 5
  ): number {
    if (invoice.status === 'paid' || !invoice.dueDate) return 0;

    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    dueDate.setDate(dueDate.getDate() + gracePeriodDays);

    if (now <= dueDate) return 0;

    const daysLate = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsLate = Math.ceil(daysLate / 30);

    return invoice.total * lateFeePercentage * monthsLate;
  }

  // Generate billing summary
  static generateBillingSummary(invoices: Invoice[]): {
    totalBilled: number;
    totalPaid: number;
    totalOutstanding: number;
    totalOverdue: number;
    averagePaymentTime: number;
    paymentSuccessRate: number;
  } {
    const paid = invoices.filter(i => i.status === 'paid');
    const outstanding = invoices.filter(i => ['sent', 'viewed'].includes(i.status));
    const overdue = this.checkOverdueInvoices(invoices);

    const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);
    const totalPaid = paid.reduce((sum, i) => sum + i.total, 0);
    const totalOutstanding = outstanding.reduce((sum, i) => sum + i.total, 0);
    const totalOverdue = overdue.reduce((sum, i) => sum + i.total, 0);

    // Calculate average payment time
    const paymentTimes = paid
      .filter(i => i.paidDate && i.issueDate)
      .map(i => (i.paidDate!.getTime() - i.issueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const averagePaymentTime = paymentTimes.length > 0
      ? paymentTimes.reduce((sum, time) => sum + time, 0) / paymentTimes.length
      : 0;

    const paymentSuccessRate = invoices.length > 0
      ? paid.length / invoices.length
      : 0;

    return {
      totalBilled,
      totalPaid,
      totalOutstanding,
      totalOverdue,
      averagePaymentTime,
      paymentSuccessRate
    };
  }

  // Schedule automatic billing
  static scheduleAutoBilling(
    customerId: string,
    dayOfMonth: number = 1
  ): {
    nextBillingDate: Date;
    schedule: string;
  } {
    const now = new Date();
    const nextBilling = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
    
    if (nextBilling <= now) {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    }

    return {
      nextBillingDate: nextBilling,
      schedule: `Monthly on day ${dayOfMonth}`
    };
  }

  // Validate ACH routing number
  static validateACHRouting(routingNumber: string): boolean {
    if (!/^\d{9}$/.test(routingNumber)) return false;

    // ABA routing number checksum validation
    const digits = routingNumber.split('').map(Number);
    const checksum = (3 * (digits[0] + digits[3] + digits[6]) +
                     7 * (digits[1] + digits[4] + digits[7]) +
                     1 * (digits[2] + digits[5] + digits[8])) % 10;
    
    return checksum === 0;
  }
}