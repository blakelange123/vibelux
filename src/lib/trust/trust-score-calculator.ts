import { prisma } from '@/lib/prisma';
import { differenceInDays } from 'date-fns';

interface TrustScoreFactors {
  paymentOnTime?: boolean;
  paymentAmount?: number;
  paymentFailed?: boolean;
  failureCount?: number;
  dataQuality?: number;
  verificationPassed?: boolean;
  disputeRaised?: boolean;
  fraudDetected?: boolean;
}

export async function updateTrustScore(
  customerId: string,
  factors: TrustScoreFactors
): Promise<number> {
  // Get current trust score
  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    include: {
      trustScore: true,
      paymentHistory: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      disputes: {
        where: { status: { not: 'RESOLVED' } }
      }
    }
  });

  if (!customer) throw new Error('Customer not found');

  const currentScore = customer.trustScore?.score || 0.7; // Default starting score
  let scoreAdjustment = 0;

  // Payment behavior impacts
  if (factors.paymentOnTime === true) {
    scoreAdjustment += 0.02; // Reward on-time payments
    
    // Bonus for large payments
    if (factors.paymentAmount && factors.paymentAmount > 5000) {
      scoreAdjustment += 0.01;
    }
  }

  if (factors.paymentFailed === true) {
    scoreAdjustment -= 0.05; // Penalize failed payments
    
    // Additional penalty for repeated failures
    if (factors.failureCount && factors.failureCount > 2) {
      scoreAdjustment -= 0.05 * (factors.failureCount - 2);
    }
  }

  // Data quality impacts
  if (factors.dataQuality !== undefined) {
    if (factors.dataQuality > 0.9) {
      scoreAdjustment += 0.01; // Reward high-quality data
    } else if (factors.dataQuality < 0.7) {
      scoreAdjustment -= 0.02; // Penalize poor data quality
    }
  }

  // Verification impacts
  if (factors.verificationPassed === true) {
    scoreAdjustment += 0.03; // Reward passing verification
  } else if (factors.verificationPassed === false) {
    scoreAdjustment -= 0.04; // Penalize failing verification
  }

  // Dispute impacts
  if (factors.disputeRaised === true) {
    scoreAdjustment -= 0.03; // Small penalty for raising disputes
    
    // Check dispute history
    if (customer.disputes.length > 3) {
      scoreAdjustment -= 0.02; // Additional penalty for frequent disputes
    }
  }

  // Fraud detection - severe penalty
  if (factors.fraudDetected === true) {
    scoreAdjustment = -0.5; // Massive penalty
  }

  // Calculate payment history factor
  const paymentHistoryScore = calculatePaymentHistoryScore(customer.paymentHistory);
  
  // Weighted calculation
  const newScore = (currentScore * 0.7) + (paymentHistoryScore * 0.3) + scoreAdjustment;
  
  // Ensure score stays within bounds
  const finalScore = Math.max(0, Math.min(1, newScore));

  // Update or create trust score
  await prisma.trustScore.upsert({
    where: { customerId },
    create: {
      customerId,
      score: finalScore,
      lastUpdated: new Date(),
      factors: {
        paymentHistory: paymentHistoryScore,
        dataQuality: factors.dataQuality || null,
        verificationRate: customer.trustScore?.factors?.verificationRate || null,
        disputeRate: customer.disputes.length / Math.max(customer.paymentHistory.length, 1),
      }
    },
    update: {
      score: finalScore,
      lastUpdated: new Date(),
      factors: {
        paymentHistory: paymentHistoryScore,
        dataQuality: factors.dataQuality || customer.trustScore?.factors?.dataQuality,
        verificationRate: customer.trustScore?.factors?.verificationRate || null,
        disputeRate: customer.disputes.length / Math.max(customer.paymentHistory.length, 1),
      }
    }
  });

  // Check if score dropped significantly
  if (currentScore - finalScore > 0.2) {
    await createTrustAlert(customerId, currentScore, finalScore, 'SIGNIFICANT_DROP');
  }

  // Check if customer should be flagged
  if (finalScore < 0.3) {
    await flagHighRiskCustomer(customerId, finalScore);
  }

  return finalScore;
}

/**
 * Calculate score based on payment history
 */
function calculatePaymentHistoryScore(paymentHistory: any[]): number {
  if (paymentHistory.length === 0) return 0.7; // Neutral for new customers

  let score = 1.0;
  let latePayments = 0;
  let failedPayments = 0;
  let totalAmount = 0;
  let paidAmount = 0;

  for (const payment of paymentHistory) {
    totalAmount += payment.amount;
    
    if (payment.status === 'COMPLETED') {
      paidAmount += payment.amount;
      
      // Check if payment was late
      if (payment.daysLate > 0) {
        latePayments++;
        score -= 0.02 * Math.min(payment.daysLate / 30, 1); // Max 0.02 penalty per payment
      }
    } else if (payment.status === 'FAILED') {
      failedPayments++;
      score -= 0.05;
    }
  }

  // Calculate payment success rate
  const successRate = paidAmount / totalAmount;
  score *= successRate;

  // Apply penalties for patterns
  const lateRate = latePayments / paymentHistory.length;
  if (lateRate > 0.3) score *= 0.9; // 10% penalty for frequent late payments

  const failureRate = failedPayments / paymentHistory.length;
  if (failureRate > 0.1) score *= 0.8; // 20% penalty for high failure rate

  return Math.max(0, Math.min(1, score));
}

/**
 * Create alert for significant trust score changes
 */
async function createTrustAlert(
  customerId: string,
  oldScore: number,
  newScore: number,
  type: string
): Promise<void> {
  await prisma.trustAlert.create({
    data: {
      customerId,
      type,
      oldScore,
      newScore,
      change: oldScore - newScore,
      createdAt: new Date(),
      status: 'PENDING',
    }
  });

  // Send notification to risk team
}

/**
 * Flag high-risk customer
 */
async function flagHighRiskCustomer(customerId: string, score: number): Promise<void> {
  await prisma.user.update({
    where: { id: customerId },
    data: {
      riskStatus: 'HIGH_RISK',
      riskScore: score,
      riskFlaggedAt: new Date(),
    }
  });

  // Create risk case for review
  await prisma.riskCase.create({
    data: {
      customerId,
      type: 'LOW_TRUST_SCORE',
      severity: score < 0.2 ? 'CRITICAL' : 'HIGH',
      trustScore: score,
      status: 'OPEN',
      assignedTo: 'risk-team@vibelux.com',
      createdAt: new Date(),
    }
  });
}

/**
 * Calculate aggregate trust metrics for reporting
 */
export async function calculateTrustMetrics(): Promise<{
  averageScore: number;
  distribution: Record<string, number>;
  trends: Record<string, number>;
}> {
  const allScores = await prisma.trustScore.findMany({
    select: { score: true, lastUpdated: true }
  });

  // Calculate average
  const averageScore = allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length;

  // Calculate distribution
  const distribution = {
    excellent: allScores.filter(s => s.score >= 0.9).length,
    good: allScores.filter(s => s.score >= 0.7 && s.score < 0.9).length,
    fair: allScores.filter(s => s.score >= 0.5 && s.score < 0.7).length,
    poor: allScores.filter(s => s.score >= 0.3 && s.score < 0.5).length,
    critical: allScores.filter(s => s.score < 0.3).length,
  };

  // Calculate 30-day trend
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentScores = allScores.filter(s => s.lastUpdated > thirtyDaysAgo);
  const recentAverage = recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length;

  const trends = {
    current: averageScore,
    thirtyDayAvg: recentAverage,
    change: averageScore - recentAverage,
  };

  return { averageScore, distribution, trends };
}