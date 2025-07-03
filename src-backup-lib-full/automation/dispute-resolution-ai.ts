import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { calculateVerifiedSavings } from '../energy/savings-calculator';
import { sendDisputeNotification } from '../email/dispute-notifications';

interface DisputeCase {
  id: string;
  customerId: string;
  invoiceId: string;
  type: 'BILLING_DISPUTE' | 'SAVINGS_CHALLENGE' | 'PAYMENT_DISPUTE' | 'DATA_ACCURACY';
  description: string;
  evidence: any[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  amount: number;
}

interface ResolutionDecision {
  action: 'ACCEPT_CUSTOMER' | 'REJECT_DISPUTE' | 'PARTIAL_CREDIT' | 'ESCALATE_HUMAN';
  reasoning: string;
  creditAmount?: number;
  nextSteps: string[];
  confidence: number;
}

export class AutomatedDisputeResolver {
  private anthropic: Anthropic;
  
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  /**
   * Process all pending disputes automatically
   */
  async processAllDisputes(): Promise<void> {
    const pendingDisputes = await prisma.dispute.findMany({
      where: {
        status: 'PENDING',
        autoResolutionAttempts: { lt: 3 },
      },
      include: {
        customer: true,
        invoice: {
          include: {
            agreement: true,
          }
        },
        evidence: true,
      }
    });


    for (const dispute of pendingDisputes) {
      try {
        await this.processDispute(dispute);
      } catch (error) {
        console.error(`Failed to process dispute ${dispute.id}:`, error);
        await this.escalateToHuman(dispute.id, 'AUTO_PROCESSING_FAILED');
      }
    }
  }

  /**
   * Process individual dispute using AI decision making
   */
  async processDispute(dispute: any): Promise<void> {

    // Gather all relevant data
    const disputeContext = await this.gatherDisputeContext(dispute);
    
    // Analyze using AI
    const decision = await this.analyzeDispute(disputeContext);
    
    // Execute decision if confidence is high enough
    if (decision.confidence >= 0.85) {
      await this.executeDecision(dispute, decision);
    } else {
      await this.escalateToHuman(dispute.id, 'LOW_CONFIDENCE');
    }

    // Update attempt counter
    await prisma.dispute.update({
      where: { id: dispute.id },
      data: { autoResolutionAttempts: { increment: 1 } }
    });
  }

  /**
   * Gather comprehensive context for dispute analysis
   */
  private async gatherDisputeContext(dispute: any): Promise<any> {
    const context = {
      dispute: {
        id: dispute.id,
        type: dispute.type,
        description: dispute.description,
        amount: dispute.amount,
        createdAt: dispute.createdAt,
      },
      customer: {
        id: dispute.customer.id,
        name: dispute.customer.name,
        trustScore: await this.getCustomerTrustScore(dispute.customer.id),
        paymentHistory: await this.getPaymentHistory(dispute.customer.id),
        disputeHistory: await this.getDisputeHistory(dispute.customer.id),
      },
      invoice: {
        number: dispute.invoice.invoiceNumber,
        amount: dispute.invoice.amountDue,
        period: {
          start: dispute.invoice.periodStart,
          end: dispute.invoice.periodEnd,
        },
        verificationData: dispute.invoice.verificationData,
        thirdPartyVerified: dispute.invoice.thirdPartyVerified,
      },
      evidence: dispute.evidence.map((e: any) => ({
        type: e.type,
        description: e.description,
        url: e.fileUrl,
        credibility: this.assessEvidenceCredibility(e),
      })),
      facility: await this.getFacilityData(dispute.invoice.agreement.facilityId),
      industryBenchmarks: await this.getIndustryBenchmarks(dispute.type),
    };

    return context;
  }

  /**
   * Use AI to analyze dispute and make resolution decision
   */
  private async analyzeDispute(context: any): Promise<ResolutionDecision> {
    const prompt = this.buildAnalysisPrompt(context);
    
    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are an expert financial dispute resolution AI for VibeLux Energy. 
          You analyze customer disputes about energy savings calculations and billing accuracy.
          You must make fair, data-driven decisions based on evidence and industry standards.
          Always prioritize customer satisfaction while protecting company interests.

          ${prompt}

          Please respond with a JSON object containing:
          {
            "action": "ACCEPT_CUSTOMER" | "REJECT_DISPUTE" | "PARTIAL_CREDIT" | "ESCALATE_HUMAN",
            "reasoning": "detailed explanation of your decision",
            "creditAmount": number (if applicable),
            "nextSteps": ["array", "of", "next", "steps"],
            "confidence": number between 0 and 1
          }

          Respond ONLY with the JSON object, no other text.`
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    try {
      const result = JSON.parse(responseText);
      return result as ResolutionDecision;
    } catch (error) {
      console.error('Failed to parse Claude response:', responseText);
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(context: any): string {
    return `
    DISPUTE ANALYSIS REQUEST
    
    DISPUTE DETAILS:
    - Type: ${context.dispute.type}
    - Amount: $${context.dispute.amount}
    - Description: ${context.dispute.description}
    
    CUSTOMER PROFILE:
    - Trust Score: ${context.customer.trustScore}/1.0
    - Payment History: ${context.customer.paymentHistory.successRate}% success rate
    - Previous Disputes: ${context.customer.disputeHistory.length} disputes
    - Customer Tier: ${context.customer.trustScore > 0.8 ? 'HIGH_VALUE' : 'STANDARD'}
    
    INVOICE VERIFICATION:
    - Third-Party Verified: ${context.invoice.thirdPartyVerified}
    - Weather Normalized: ${context.invoice.verificationData?.weatherNormalized || false}
    - Utility Verified: ${context.invoice.verificationData?.utilityVerified || false}
    - Data Confidence: ${context.invoice.verificationData?.confidence || 'Unknown'}
    
    EVIDENCE SUBMITTED:
    ${context.evidence.map((e: any) => `- ${e.type}: ${e.description} (Credibility: ${e.credibility})`).join('\n')}
    
    FACILITY DATA:
    - Type: ${context.facility.type}
    - Size: ${context.facility.squareFootage} sq ft
    - Baseline Established: ${context.facility.baselineDate}
    - Historical Performance: ${context.facility.historicalAccuracy}% accuracy
    
    INDUSTRY BENCHMARKS:
    - Similar Disputes Resolution Rate: ${context.industryBenchmarks.resolutionRate}%
    - Average Credit Given: ${context.industryBenchmarks.avgCreditPercent}%
    - Typical Resolution Time: ${context.industryBenchmarks.avgResolutionDays} days
    
    Please analyze this dispute and provide:
    1. Your recommended action
    2. Clear reasoning based on evidence
    3. Any credit amount if applicable
    4. Next steps for implementation
    5. Confidence level (0-1) in your decision
    
    Consider:
    - Customer relationship value
    - Strength of evidence
    - Industry standards
    - Legal/regulatory compliance
    - Precedent setting implications
    `;
  }

  /**
   * Execute the AI's decision
   */
  private async executeDecision(dispute: any, decision: ResolutionDecision): Promise<void> {
    const { action, reasoning, creditAmount, nextSteps, confidence } = decision;

    // Update dispute record
    await prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: action === 'ESCALATE_HUMAN' ? 'ESCALATED' : 'AUTO_RESOLVED',
        resolution: action,
        resolutionReasoning: reasoning,
        creditAmount: creditAmount || 0,
        resolvedAt: new Date(),
        aiConfidence: confidence,
        autoResolved: action !== 'ESCALATE_HUMAN',
      }
    });

    // Execute the specific action
    switch (action) {
      case 'ACCEPT_CUSTOMER':
        await this.acceptCustomerDispute(dispute, creditAmount || dispute.amount);
        break;
        
      case 'PARTIAL_CREDIT':
        await this.issuePartialCredit(dispute, creditAmount!);
        break;
        
      case 'REJECT_DISPUTE':
        await this.rejectDispute(dispute, reasoning);
        break;
        
      case 'ESCALATE_HUMAN':
        await this.escalateToHuman(dispute.id, 'AI_ESCALATION');
        break;
    }

    // Send notification to customer
    await sendDisputeNotification({
      customer: dispute.customer,
      dispute,
      decision,
      nextSteps,
    });

    // Log decision for audit trail
    await prisma.disputeDecisionLog.create({
      data: {
        disputeId: dispute.id,
        decision: action,
        reasoning,
        creditAmount: creditAmount || 0,
        confidence,
        decisionMaker: 'AI_SYSTEM',
        createdAt: new Date(),
      }
    });
  }

  /**
   * Accept customer dispute and issue full refund
   */
  private async acceptCustomerDispute(dispute: any, creditAmount: number): Promise<void> {
    // Create credit memo
    await prisma.creditMemo.create({
      data: {
        customerId: dispute.customerId,
        invoiceId: dispute.invoiceId,
        disputeId: dispute.id,
        amount: creditAmount,
        reason: 'DISPUTE_RESOLUTION',
        status: 'APPROVED',
        approvedBy: 'AI_SYSTEM',
        createdAt: new Date(),
      }
    });

    // Process refund if payment was already made
    if (dispute.invoice.status === 'PAID') {
      await this.processRefund(dispute.invoice.paymentTransactionId, creditAmount);
    } else {
      // Adjust invoice amount
      await prisma.invoice.update({
        where: { id: dispute.invoiceId },
        data: {
          amountDue: { decrement: creditAmount },
          adjustmentReason: 'DISPUTE_CREDIT',
        }
      });
    }
  }

  /**
   * Issue partial credit
   */
  private async issuePartialCredit(dispute: any, creditAmount: number): Promise<void> {
    await this.acceptCustomerDispute(dispute, creditAmount);
  }

  /**
   * Reject dispute with detailed reasoning
   */
  private async rejectDispute(dispute: any, reasoning: string): Promise<void> {
    await prisma.disputeRejection.create({
      data: {
        disputeId: dispute.id,
        reasoning,
        rejectedBy: 'AI_SYSTEM',
        appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date(),
      }
    });
  }

  /**
   * Escalate to human review
   */
  private async escalateToHuman(disputeId: string, reason: string): Promise<void> {
    await prisma.disputeEscalation.create({
      data: {
        disputeId,
        reason,
        escalatedTo: 'dispute-team@vibelux.com',
        priority: 'MEDIUM',
        escalatedAt: new Date(),
      }
    });

    // Send notification to dispute team
  }

  /**
   * Process refund through payment processor
   */
  private async processRefund(transactionId: string, amount: number): Promise<void> {
    // Implementation would depend on payment processor
    // For Stripe:
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    try {
      await stripe.refunds.create({
        payment_intent: transactionId,
        amount: Math.round(amount * 100), // Convert to cents
        reason: 'requested_by_customer',
      });
    } catch (error) {
      console.error('Refund processing failed:', error);
      throw error;
    }
  }

  /**
   * Get customer trust score
   */
  private async getCustomerTrustScore(customerId: string): Promise<number> {
    const trustScore = await prisma.trustScore.findUnique({
      where: { customerId }
    });
    return trustScore?.score || 0.7;
  }

  /**
   * Get payment history summary
   */
  private async getPaymentHistory(customerId: string): Promise<any> {
    const payments = await prisma.payment.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const total = payments.length;
    const successful = payments.filter(p => p.status === 'COMPLETED').length;
    
    return {
      total,
      successful,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageAmount: payments.reduce((sum, p) => sum + p.amount, 0) / total,
    };
  }

  /**
   * Get dispute history
   */
  private async getDisputeHistory(customerId: string): Promise<any[]> {
    return await prisma.dispute.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  /**
   * Get facility performance data
   */
  private async getFacilityData(facilityId: string): Promise<any> {
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: { baseline: true }
    });

    return {
      type: facility?.type,
      squareFootage: facility?.squareFootage,
      baselineDate: facility?.baseline?.establishedAt,
      historicalAccuracy: 92, // Would calculate from historical validation data
    };
  }

  /**
   * Get industry benchmarks for dispute type
   */
  private async getIndustryBenchmarks(disputeType: string): Promise<any> {
    // In production, this would query industry database
    const benchmarks: Record<string, any> = {
      BILLING_DISPUTE: {
        resolutionRate: 85,
        avgCreditPercent: 15,
        avgResolutionDays: 5,
      },
      SAVINGS_CHALLENGE: {
        resolutionRate: 78,
        avgCreditPercent: 22,
        avgResolutionDays: 7,
      },
      PAYMENT_DISPUTE: {
        resolutionRate: 92,
        avgCreditPercent: 8,
        avgResolutionDays: 3,
      },
      DATA_ACCURACY: {
        resolutionRate: 88,
        avgCreditPercent: 12,
        avgResolutionDays: 4,
      },
    };

    return benchmarks[disputeType] || benchmarks.BILLING_DISPUTE;
  }

  /**
   * Assess credibility of submitted evidence
   */
  private assessEvidenceCredibility(evidence: any): string {
    // Simple credibility assessment
    const factors = [];
    
    if (evidence.type === 'UTILITY_BILL') factors.push('HIGH');
    if (evidence.type === 'PHOTO') factors.push('MEDIUM');
    if (evidence.type === 'CUSTOMER_STATEMENT') factors.push('LOW');
    if (evidence.metadata?.timestamp) factors.push('VERIFIED');
    
    return factors.includes('HIGH') ? 'HIGH' : 
           factors.includes('MEDIUM') ? 'MEDIUM' : 'LOW';
  }

  /**
   * Generate dispute resolution analytics
   */
  async generateResolutionAnalytics(): Promise<any> {
    const disputes = await prisma.dispute.findMany({
      where: {
        resolvedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        }
      }
    });

    const autoResolved = disputes.filter(d => d.autoResolved).length;
    const totalResolved = disputes.length;
    const avgResolutionTime = disputes.reduce((sum, d) => {
      const hours = (d.resolvedAt!.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0) / totalResolved;

    return {
      automationRate: (autoResolved / totalResolved) * 100,
      avgResolutionTime: `${avgResolutionTime.toFixed(1)} hours`,
      totalDisputes: totalResolved,
      customerSatisfaction: 87, // Would survey customers
    };
  }
}