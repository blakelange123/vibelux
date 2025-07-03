import { prisma } from '@/lib/prisma';
import { addDays, differenceInDays, format } from 'date-fns';
import { sendCollectionNotification } from '../email/collection-notifications';
import { AutomatedPaymentProcessor } from './payment-processor';
import twilio from 'twilio';

interface CollectionStrategy {
  daysPastDue: number;
  action: 'email' | 'sms' | 'call' | 'legal';
  template: string;
  escalation: boolean;
}

export class AutomatedCollectionManager {
  private twilioClient: twilio.Twilio;
  private paymentProcessor: AutomatedPaymentProcessor;
  
  private collectionStrategies: CollectionStrategy[] = [
    { daysPastDue: 1, action: 'email', template: 'friendly_reminder', escalation: false },
    { daysPastDue: 7, action: 'email', template: 'first_notice', escalation: false },
    { daysPastDue: 14, action: 'sms', template: 'urgent_notice', escalation: true },
    { daysPastDue: 21, action: 'email', template: 'final_notice', escalation: true },
    { daysPastDue: 30, action: 'call', template: 'collections_call', escalation: true },
    { daysPastDue: 45, action: 'legal', template: 'legal_notice', escalation: true },
  ];
  
  constructor() {
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
    this.paymentProcessor = new AutomatedPaymentProcessor();
  }

  /**
   * Process all outstanding collections
   * Runs daily at 10 AM EST
   */
  async processCollections(): Promise<void> {
    
    // Get all unpaid invoices
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
        dueDate: { lt: new Date() },
      },
      include: {
        customer: {
          include: {
            contactPreferences: true,
            paymentHistory: {
              take: 10,
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        collectionActivities: {
          orderBy: { createdAt: 'desc' }
        },
        agreement: true,
      }
    });


    for (const invoice of unpaidInvoices) {
      await this.processInvoiceCollection(invoice);
    }

    // Process collection cases
    await this.processCollectionCases();
    
  }

  /**
   * Process collection for individual invoice
   */
  private async processInvoiceCollection(invoice: any): Promise<void> {
    const daysPastDue = differenceInDays(new Date(), invoice.dueDate);
    
    // Update invoice status if needed
    if (invoice.status === 'PENDING' && daysPastDue > 0) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' }
      });
    }

    // Determine collection strategy
    const strategy = this.getCollectionStrategy(daysPastDue, invoice);
    
    if (!strategy) return; // No action needed yet
    
    // Check if this action was already taken
    const recentActivity = invoice.collectionActivities.find((activity: any) => 
      activity.actionType === strategy.action && 
      differenceInDays(new Date(), activity.createdAt) < 3
    );
    
    if (recentActivity) return; // Already contacted recently
    
    // Execute collection action
    await this.executeCollectionAction(invoice, strategy);
  }

  /**
   * Get appropriate collection strategy
   */
  private getCollectionStrategy(daysPastDue: number, invoice: any): CollectionStrategy | null {
    // Check customer payment history for customized approach
    const customerRisk = this.assessCustomerRisk(invoice.customer);
    
    // Find appropriate strategy
    const strategies = this.collectionStrategies.filter(s => s.daysPastDue <= daysPastDue);
    if (strategies.length === 0) return null;
    
    // Get the most recent applicable strategy
    const strategy = strategies[strategies.length - 1];
    
    // Adjust strategy based on customer risk
    if (customerRisk === 'low' && strategy.escalation) {
      // Give good customers more time
      if (daysPastDue < strategy.daysPastDue + 7) return null;
    }
    
    return strategy;
  }

  /**
   * Execute collection action
   */
  private async executeCollectionAction(invoice: any, strategy: CollectionStrategy): Promise<void> {
    let success = false;
    let responseDetails = {};
    
    try {
      switch (strategy.action) {
        case 'email':
          responseDetails = await this.sendCollectionEmail(invoice, strategy.template);
          success = true;
          break;
          
        case 'sms':
          responseDetails = await this.sendCollectionSMS(invoice, strategy.template);
          success = true;
          break;
          
        case 'call':
          responseDetails = await this.initiateCollectionCall(invoice);
          success = true;
          break;
          
        case 'legal':
          responseDetails = await this.initiateLegalAction(invoice);
          success = true;
          break;
      }
      
      // Record collection activity
      await prisma.collectionActivity.create({
        data: {
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          actionType: strategy.action,
          actionTemplate: strategy.template,
          daysPastDue: differenceInDays(new Date(), invoice.dueDate),
          success,
          responseDetails,
          createdAt: new Date(),
        }
      });
      
      // Check if payment method needs updating
      if (strategy.escalation) {
        await this.checkPaymentMethodStatus(invoice.customer);
      }
      
    } catch (error) {
      console.error(`Collection action failed for invoice ${invoice.id}:`, error);
      
      // Record failed attempt
      await prisma.collectionActivity.create({
        data: {
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          actionType: strategy.action,
          actionTemplate: strategy.template,
          daysPastDue: differenceInDays(new Date(), invoice.dueDate),
          success: false,
          responseDetails: { error: (error as Error).message },
          createdAt: new Date(),
        }
      });
    }
  }

  /**
   * Send collection email
   */
  private async sendCollectionEmail(invoice: any, template: string): Promise<any> {
    const emailData = this.prepareEmailData(invoice, template);
    
    await sendCollectionNotification({
      type: 'email',
      customer: invoice.customer,
      invoice,
      template,
      data: emailData,
    });
    
    return { 
      emailSent: true, 
      template,
      timestamp: new Date().toISOString() 
    };
  }

  /**
   * Send collection SMS
   */
  private async sendCollectionSMS(invoice: any, template: string): Promise<any> {
    if (!invoice.customer.phone || !invoice.customer.contactPreferences?.allowSMS) {
      throw new Error('SMS not allowed or phone number missing');
    }
    
    const message = this.prepareSMSMessage(invoice, template);
    
    const result = await this.twilioClient.messages.create({
      body: message,
      to: invoice.customer.phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
    });
    
    return {
      smsSent: true,
      messageId: result.sid,
      template,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Initiate collection call
   */
  private async initiateCollectionCall(invoice: any): Promise<any> {
    // Create call task for human collector
    const task = await prisma.collectionTask.create({
      data: {
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        taskType: 'PHONE_CALL',
        priority: invoice.amountDue > 5000 ? 'HIGH' : 'MEDIUM',
        assignedTo: await this.getNextCollector(),
        dueBy: addDays(new Date(), 1),
        notes: this.prepareCollectionNotes(invoice),
        status: 'PENDING',
      }
    });
    
    // Send notification to collector
    await this.notifyCollector(task);
    
    return {
      taskCreated: true,
      taskId: task.id,
      assignedTo: task.assignedTo,
    };
  }

  /**
   * Initiate legal action
   */
  private async initiateLegalAction(invoice: any): Promise<any> {
    // Check if amount justifies legal action
    if (invoice.amountDue < 1000) {
      throw new Error('Amount too low for legal action');
    }
    
    // Create legal case
    const legalCase = await prisma.legalCase.create({
      data: {
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        amount: invoice.amountDue,
        status: 'PRE_LITIGATION',
        filedDate: new Date(),
        attorneyAssigned: process.env.DEFAULT_ATTORNEY_ID,
        documents: {
          create: {
            type: 'DEMAND_LETTER',
            generatedAt: new Date(),
            url: await this.generateDemandLetter(invoice),
          }
        }
      }
    });
    
    return {
      legalCaseCreated: true,
      caseId: legalCase.id,
      status: legalCase.status,
    };
  }

  /**
   * Process active collection cases
   */
  private async processCollectionCases(): Promise<void> {
    const activeCases = await prisma.collectionCase.findMany({
      where: {
        status: 'OPEN',
      },
      include: {
        invoice: {
          include: {
            customer: true,
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            }
          }
        }
      }
    });

    for (const case_ of activeCases) {
      // Check if payment was made
      if (case_.invoice.payments.length > 0) {
        await prisma.collectionCase.update({
          where: { id: case_.id },
          data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
            resolutionType: 'PAID',
          }
        });
        continue;
      }

      // Escalate if needed
      const daysSinceOpened = differenceInDays(new Date(), case_.createdAt);
      if (daysSinceOpened > 30 && case_.priority !== 'CRITICAL') {
        await prisma.collectionCase.update({
          where: { id: case_.id },
          data: { priority: 'CRITICAL' }
        });
      }
    }
  }

  /**
   * Assess customer risk level
   */
  private assessCustomerRisk(customer: any): 'low' | 'medium' | 'high' {
    const paymentHistory = customer.paymentHistory || [];
    
    // Calculate payment metrics
    const totalPayments = paymentHistory.length;
    const latePayments = paymentHistory.filter((p: any) => p.daysLate > 0).length;
    const avgDaysLate = paymentHistory.reduce((sum: number, p: any) => sum + (p.daysLate || 0), 0) / totalPayments;
    
    if (totalPayments === 0) return 'medium'; // New customer
    
    const latePaymentRate = latePayments / totalPayments;
    
    if (latePaymentRate < 0.1 && avgDaysLate < 5) return 'low';
    if (latePaymentRate > 0.3 || avgDaysLate > 15) return 'high';
    
    return 'medium';
  }

  /**
   * Check and update payment method status
   */
  private async checkPaymentMethodStatus(customer: any): Promise<void> {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { customerId: customer.id }
    });
    
    for (const method of paymentMethods) {
      if (method.type === 'CARD') {
        // Verify card is still valid
        try {
          const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
          const paymentMethod = await stripe.paymentMethods.retrieve(method.stripePaymentMethodId);
          
          if (paymentMethod.card.exp_month && paymentMethod.card.exp_year) {
            const expDate = new Date(paymentMethod.card.exp_year, paymentMethod.card.exp_month - 1);
            if (expDate < new Date()) {
              await prisma.paymentMethod.update({
                where: { id: method.id },
                data: { status: 'EXPIRED' }
              });
              
              // Notify customer
              await sendCollectionNotification({
                type: 'email',
                customer,
                template: 'payment_method_expired',
              });
            }
          }
        } catch (error) {
          console.error('Failed to check payment method:', error);
        }
      }
    }
  }

  /**
   * Prepare email data based on template
   */
  private prepareEmailData(invoice: any, template: string): any {
    const daysPastDue = differenceInDays(new Date(), invoice.dueDate);
    
    return {
      customerName: invoice.customer.name,
      invoiceNumber: invoice.invoiceNumber,
      amountDue: invoice.amountDue,
      dueDate: format(invoice.dueDate, 'MMMM d, yyyy'),
      daysPastDue,
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`,
      customerPortalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    };
  }

  /**
   * Prepare SMS message
   */
  private prepareSMSMessage(invoice: any, template: string): string {
    const templates: Record<string, string> = {
      urgent_notice: `VibeLux: Invoice ${invoice.invoiceNumber} ($${invoice.amountDue}) is past due. Pay now: ${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`,
      final_notice: `VibeLux: FINAL NOTICE - Invoice ${invoice.invoiceNumber} ($${invoice.amountDue}) requires immediate payment to avoid service interruption.`,
    };
    
    return templates[template] || templates.urgent_notice;
  }

  /**
   * Prepare collection notes for human collector
   */
  private prepareCollectionNotes(invoice: any): string {
    const notes = [
      `Invoice: ${invoice.invoiceNumber}`,
      `Amount Due: $${invoice.amountDue}`,
      `Days Past Due: ${differenceInDays(new Date(), invoice.dueDate)}`,
      `Customer: ${invoice.customer.name}`,
      `Previous Attempts: ${invoice.collectionActivities.length}`,
    ];
    
    if (invoice.customer.paymentHistory?.length > 0) {
      const avgDaysLate = invoice.customer.paymentHistory.reduce(
        (sum: number, p: any) => sum + (p.daysLate || 0), 0
      ) / invoice.customer.paymentHistory.length;
      
      notes.push(`Avg Days Late: ${avgDaysLate.toFixed(1)}`);
    }
    
    return notes.join('\n');
  }

  /**
   * Get next available collector
   */
  private async getNextCollector(): Promise<string> {
    // Round-robin assignment
    const collectors = await prisma.user.findMany({
      where: { role: 'COLLECTOR', status: 'ACTIVE' },
      orderBy: { lastAssignedAt: 'asc' },
      take: 1,
    });
    
    if (collectors.length === 0) {
      return process.env.DEFAULT_COLLECTOR_EMAIL!;
    }
    
    await prisma.user.update({
      where: { id: collectors[0].id },
      data: { lastAssignedAt: new Date() }
    });
    
    return collectors[0].email;
  }

  /**
   * Notify collector of new task
   */
  private async notifyCollector(task: any): Promise<void> {
    // Send email/SMS to collector
  }

  /**
   * Generate demand letter PDF
   */
  private async generateDemandLetter(invoice: any): Promise<string> {
    // This would generate a legal demand letter PDF
    // For now, returning a placeholder URL
    return `https://vibelux-legal.s3.amazonaws.com/demand-letters/${invoice.id}.pdf`;
  }

  /**
   * Automated settlement negotiation
   */
  async negotiateSettlement(invoiceId: string, offer: number): Promise<{
    accepted: boolean;
    counterOffer?: number;
    reason?: string;
  }> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { 
        customer: { 
          include: { 
            paymentHistory: true 
          } 
        } 
      }
    });
    
    if (!invoice) throw new Error('Invoice not found');
    
    const customerRisk = this.assessCustomerRisk(invoice.customer);
    const daysPastDue = differenceInDays(new Date(), invoice.dueDate);
    
    // Settlement rules based on risk and age
    let minAcceptable = invoice.amountDue;
    
    if (customerRisk === 'low') {
      minAcceptable *= 0.95; // 5% discount for good customers
    } else if (customerRisk === 'high') {
      if (daysPastDue > 90) minAcceptable *= 0.7; // 30% discount for old debt
      else if (daysPastDue > 60) minAcceptable *= 0.8; // 20% discount
      else minAcceptable *= 0.9; // 10% discount
    }
    
    if (offer >= minAcceptable) {
      // Accept settlement
      await prisma.settlement.create({
        data: {
          invoiceId,
          originalAmount: invoice.amountDue,
          settlementAmount: offer,
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        }
      });
      
      return { accepted: true };
    } else {
      // Counter offer
      const counterOffer = minAcceptable;
      
      return {
        accepted: false,
        counterOffer,
        reason: 'Offer below minimum acceptable amount',
      };
    }
  }
}