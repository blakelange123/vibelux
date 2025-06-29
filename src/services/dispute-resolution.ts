import { PrismaClient } from '@prisma/client';
import { verifySavings } from './savings-verification';

const prisma = new PrismaClient();

interface DisputeResolutionResult {
  success: boolean;
  resolution?: string;
  adjustedAmount?: number;
  error?: string;
}

export async function resolveDispute(disputeId: string): Promise<DisputeResolutionResult> {
  try {
    // Get dispute details
    const dispute = await prisma.vibeLuxDispute.findUnique({
      where: { id: disputeId },
      include: {
        invoice: {
          include: {
            client: true
          }
        }
      }
    });

    if (!dispute) {
      return {
        success: false,
        error: 'Dispute not found'
      };
    }

    if (dispute.status !== 'open' && dispute.status !== 'under-review') {
      return {
        success: false,
        error: 'Dispute is already resolved'
      };
    }

    // Update status to under review
    await prisma.vibeLuxDispute.update({
      where: { id: disputeId },
      data: { status: 'under-review' }
    });

    // Re-verify the savings with latest data
    const billingPeriod = parseBillingPeriod(dispute.invoice.billingPeriod);
    const reverification = await verifySavings(
      dispute.invoice.clientId,
      billingPeriod.start,
      billingPeriod.end
    );

    if (!reverification) {
      return {
        success: false,
        error: 'Unable to re-verify savings'
      };
    }

    // Analyze the dispute
    const analysis = await analyzeDispute(dispute, reverification);

    // Determine resolution
    let resolution: string;
    let adjustedAmount: number | undefined;
    let status: string;

    if (analysis.isValid) {
      // Dispute is valid - adjust the invoice
      adjustedAmount = analysis.recommendedAdjustment;
      resolution = analysis.resolution;
      status = 'resolved';

      // Update the invoice with adjusted amount
      await prisma.vibeLuxInvoice.update({
        where: { id: dispute.invoice.id },
        data: {
          invoiceAmount: adjustedAmount,
          verificationData: {
            ...(dispute.invoice.verificationData as any),
            disputeAdjustment: {
              originalAmount: dispute.invoice.invoiceAmount,
              adjustedAmount,
              reason: resolution,
              adjustedAt: new Date()
            }
          }
        }
      });
    } else {
      // Dispute is not valid
      resolution = analysis.resolution;
      status = 'rejected';
    }

    // Update dispute with resolution
    await prisma.vibeLuxDispute.update({
      where: { id: disputeId },
      data: {
        status,
        resolution,
        utilityDataProof: {
          reverificationResult: reverification,
          analysis
        },
        resolvedAt: new Date()
      }
    });

    // Notify the client
    await notifyDisputeResolution(dispute, resolution, adjustedAmount);

    return {
      success: true,
      resolution,
      adjustedAmount
    };

  } catch (error) {
    console.error('Error resolving dispute:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

interface DisputeAnalysis {
  isValid: boolean;
  resolution: string;
  recommendedAdjustment?: number;
  factors: {
    dataVariance: number;
    baselineAccuracy: number;
    utilityDataMatch: boolean;
    iotDataAvailable: boolean;
  };
}

async function analyzeDispute(dispute: any, reverification: any): Promise<DisputeAnalysis> {
  const originalSavings = dispute.invoice.savingsKwh;
  const reverifiedSavings = reverification.savingsKwh;
  const variance = Math.abs((originalSavings - reverifiedSavings) / originalSavings);

  // Check if utility data has been updated or corrected
  const utilityDataUpdated = await checkForUpdatedUtilityData(
    dispute.invoice.clientId,
    parseBillingPeriod(dispute.invoice.billingPeriod)
  );

  const analysis: DisputeAnalysis = {
    isValid: false,
    resolution: '',
    factors: {
      dataVariance: variance,
      baselineAccuracy: reverification.confidence,
      utilityDataMatch: variance < 0.05,
      iotDataAvailable: !!reverification.details.iotKwh
    }
  };

  // Determine if dispute is valid based on various factors
  if (variance > 0.1) {
    // Significant variance found
    analysis.isValid = true;
    
    if (reverifiedSavings < originalSavings) {
      // Savings were overestimated
      const adjustmentRatio = reverifiedSavings / originalSavings;
      analysis.recommendedAdjustment = dispute.invoice.invoiceAmount * adjustmentRatio;
      analysis.resolution = `Invoice adjusted based on updated verification. Original savings: ${originalSavings.toFixed(0)} kWh, Verified savings: ${reverifiedSavings.toFixed(0)} kWh`;
    } else {
      // Savings were underestimated (rare, but possible)
      analysis.resolution = 'Verification shows higher savings than originally calculated. No adjustment made to maintain original invoice amount.';
    }
  } else if (utilityDataUpdated) {
    // Utility data was corrected
    analysis.isValid = true;
    analysis.recommendedAdjustment = reverification.savingsAmount * (dispute.invoice.sharePercentage / 100);
    analysis.resolution = 'Invoice adjusted based on corrected utility data.';
  } else if (reverification.confidence < 70) {
    // Low confidence in verification
    analysis.isValid = true;
    analysis.recommendedAdjustment = dispute.invoice.invoiceAmount * 0.8; // 20% reduction for uncertainty
    analysis.resolution = 'Invoice adjusted due to low confidence in savings verification.';
  } else {
    // Dispute not valid
    analysis.resolution = `Verification confirms original savings calculation. Confidence: ${reverification.confidence}%, Variance: ${(variance * 100).toFixed(1)}%`;
  }

  return analysis;
}

async function checkForUpdatedUtilityData(
  clientId: string,
  billingPeriod: { start: Date; end: Date }
): Promise<boolean> {
  // Check if utility data has been updated since invoice was created
  const latestBill = await prisma.utilityBillData.findFirst({
    where: {
      clientId,
      billingPeriodStart: {
        gte: billingPeriod.start
      },
      billingPeriodEnd: {
        lte: billingPeriod.end
      },
      status: 'processed'
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  if (!latestBill) return false;

  // Check if bill was updated after invoice creation
  const invoice = await prisma.vibeLuxInvoice.findFirst({
    where: {
      clientId,
      billingPeriod: formatBillingPeriod(billingPeriod.start, billingPeriod.end)
    }
  });

  return invoice ? latestBill.updatedAt > invoice.createdAt : false;
}

function parseBillingPeriod(periodString: string): { start: Date; end: Date } {
  // Parse "Jan 1, 2024 - Jan 31, 2024" format
  const parts = periodString.split(' - ');
  return {
    start: new Date(parts[0]),
    end: new Date(parts[1])
  };
}

function formatBillingPeriod(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

async function notifyDisputeResolution(dispute: any, resolution: string, adjustedAmount?: number): Promise<void> {
  // This would send notification to the client
  if (adjustedAmount) {
  }
  
  // In production, this would:
  // 1. Send email notification
  // 2. Create in-app notification
  // 3. Update any connected systems
}

export async function processDisputesAutomatically(): Promise<void> {
  try {
    // Get all open disputes
    const openDisputes = await prisma.vibeLuxDispute.findMany({
      where: {
        status: 'open'
      }
    });


    for (const dispute of openDisputes) {
      const result = await resolveDispute(dispute.id);
      
      if (result.success) {
      } else {
        console.error(`Failed to resolve dispute ${dispute.id}: ${result.error}`);
      }
    }

  } catch (error) {
    console.error('Error processing disputes automatically:', error);
  }
}