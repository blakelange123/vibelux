import { prisma } from '@/lib/prisma';

export interface EscrowConditions {
  equipmentDelivered: boolean;
  equipmentVerified: boolean;
  installationComplete: boolean;
  performanceVerified: boolean;
}

export interface EscrowRelease {
  toInvestor: number;  // Equipment value minus platform fee
  toPlatform: number;  // Platform fee (15%)
  total: number;       // Total amount in escrow
}

export class EquipmentEscrowManager {
  private static readonly PLATFORM_FEE_RATE = 0.15;

  /**
   * Create escrow for an equipment match
   */
  static async createEscrow(matchId: string, equipmentValue: number) {
    const platformFee = equipmentValue * this.PLATFORM_FEE_RATE;
    const totalAmount = equipmentValue + platformFee;

    // Generate escrow address (in production, this would be a real blockchain address)
    const escrowAddress = `0x${Buffer.from(`escrow-${matchId}`).toString('hex').padEnd(40, '0')}`;

    return await prisma.equipmentEscrow.create({
      data: {
        matchId,
        escrowAddress,
        totalAmount,
        platformFeeAmount: platformFee,
        releaseConditions: {
          equipmentDelivered: false,
          equipmentVerified: false,
          installationComplete: false,
          performanceVerified: false
        },
        status: 'PENDING'
      }
    });
  }

  /**
   * Check if all release conditions are met
   */
  static async checkReleaseConditions(escrowId: string): Promise<boolean> {
    const escrow = await prisma.equipmentEscrow.findUnique({
      where: { id: escrowId }
    });

    if (!escrow) return false;

    const conditions = escrow.releaseConditions as EscrowConditions;
    return (
      conditions.equipmentDelivered &&
      conditions.equipmentVerified &&
      conditions.installationComplete &&
      conditions.performanceVerified
    );
  }

  /**
   * Update escrow conditions based on verification steps
   */
  static async updateConditions(
    escrowId: string, 
    updates: Partial<EscrowConditions>
  ) {
    const escrow = await prisma.equipmentEscrow.findUnique({
      where: { id: escrowId }
    });

    if (!escrow) throw new Error('Escrow not found');

    const currentConditions = escrow.releaseConditions as EscrowConditions;
    const updatedConditions = { ...currentConditions, ...updates };

    const allConditionsMet = Object.values(updatedConditions).every(v => v === true);

    return await prisma.equipmentEscrow.update({
      where: { id: escrowId },
      data: {
        releaseConditions: updatedConditions,
        conditionsMet: allConditionsMet
      }
    });
  }

  /**
   * Calculate escrow release amounts
   */
  static calculateRelease(equipmentValue: number): EscrowRelease {
    const platformFee = equipmentValue * this.PLATFORM_FEE_RATE;
    return {
      toInvestor: equipmentValue,
      toPlatform: platformFee,
      total: equipmentValue + platformFee
    };
  }

  /**
   * Release escrow funds (simulate for now)
   */
  static async releaseEscrow(escrowId: string) {
    const escrow = await prisma.equipmentEscrow.findUnique({
      where: { id: escrowId },
      include: {
        match: {
          include: {
            offer: {
              include: {
                investor: true
              }
            }
          }
        }
      }
    });

    if (!escrow) throw new Error('Escrow not found');
    if (!escrow.conditionsMet) throw new Error('Release conditions not met');
    if (escrow.status === 'RELEASED') throw new Error('Escrow already released');

    // Calculate release amounts
    const release = this.calculateRelease(escrow.match.finalValue);

    // Create release transactions
    const result = await prisma.$transaction(async (tx) => {
      // Release to investor
      await tx.escrowTransaction.create({
        data: {
          escrowId,
          transactionHash: `0x${Buffer.from(`release-investor-${Date.now()}`).toString('hex')}`,
          type: 'RELEASE',
          amount: release.toInvestor,
          fromAddress: escrow.escrowAddress,
          toAddress: escrow.match.offer.investor.email // In production, use wallet address
        }
      });

      // Release platform fee
      await tx.escrowTransaction.create({
        data: {
          escrowId,
          transactionHash: `0x${Buffer.from(`release-platform-${Date.now()}`).toString('hex')}`,
          type: 'FEE_PAYMENT',
          amount: release.toPlatform,
          fromAddress: escrow.escrowAddress,
          toAddress: 'platform@vibelux.com' // Platform treasury address
        }
      });

      // Update escrow status
      const updatedEscrow = await tx.equipmentEscrow.update({
        where: { id: escrowId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date()
        }
      });

      // Mark platform fee as paid
      await tx.equipmentMatch.update({
        where: { id: escrow.matchId },
        data: {
          platformFeePaid: true
        }
      });

      return updatedEscrow;
    });

    return {
      escrow: result,
      release
    };
  }

  /**
   * Handle escrow disputes
   */
  static async disputeEscrow(escrowId: string, reason: string) {
    return await prisma.equipmentEscrow.update({
      where: { id: escrowId },
      data: {
        status: 'DISPUTED'
      }
    });
  }

  /**
   * Refund escrow (in case of cancellation)
   */
  static async refundEscrow(escrowId: string) {
    const escrow = await prisma.equipmentEscrow.findUnique({
      where: { id: escrowId },
      include: {
        match: {
          include: {
            offer: {
              include: {
                investor: true
              }
            }
          }
        }
      }
    });

    if (!escrow) throw new Error('Escrow not found');
    if (escrow.status === 'RELEASED') throw new Error('Cannot refund released escrow');

    // Get total funded amount
    const totalFunded = await prisma.escrowTransaction.aggregate({
      where: {
        escrowId,
        type: 'FUND'
      },
      _sum: {
        amount: true
      }
    });

    const refundAmount = totalFunded._sum.amount || 0;

    // Create refund transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create refund transaction
      await tx.escrowTransaction.create({
        data: {
          escrowId,
          transactionHash: `0x${Buffer.from(`refund-${Date.now()}`).toString('hex')}`,
          type: 'REFUND',
          amount: refundAmount,
          fromAddress: escrow.escrowAddress,
          toAddress: escrow.match.offer.investor.email // In production, use wallet address
        }
      });

      // Update escrow status
      const updatedEscrow = await tx.equipmentEscrow.update({
        where: { id: escrowId },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date()
        }
      });

      // Update match status
      await tx.equipmentMatch.update({
        where: { id: escrow.matchId },
        data: {
          status: 'CANCELLED'
        }
      });

      return updatedEscrow;
    });

    return result;
  }

  /**
   * Get escrow summary with all transactions
   */
  static async getEscrowSummary(escrowId: string) {
    const escrow = await prisma.equipmentEscrow.findUnique({
      where: { id: escrowId },
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        match: {
          include: {
            request: {
              include: {
                facility: true
              }
            },
            offer: {
              include: {
                investor: true
              }
            },
            verification: true
          }
        }
      }
    });

    if (!escrow) return null;

    // Calculate balances
    const funded = escrow.transactions
      .filter(t => t.type === 'FUND')
      .reduce((sum, t) => sum + t.amount, 0);

    const released = escrow.transactions
      .filter(t => t.type === 'RELEASE' || t.type === 'FEE_PAYMENT')
      .reduce((sum, t) => sum + t.amount, 0);

    const refunded = escrow.transactions
      .filter(t => t.type === 'REFUND')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = funded - released - refunded;

    return {
      ...escrow,
      summary: {
        funded,
        released,
        refunded,
        balance,
        percentFunded: (funded / escrow.totalAmount) * 100,
        isFullyFunded: funded >= escrow.totalAmount
      }
    };
  }

  /**
   * Anti-circumvention: Check for off-platform dealing attempts
   */
  static async checkForCircumvention(
    requestId: string, 
    investorId: string
  ): Promise<boolean> {
    // Check if investor has viewed the request
    const request = await prisma.equipmentRequest.findUnique({
      where: { id: requestId },
      include: {
        offers: {
          where: {
            investorId
          }
        }
      }
    });

    if (!request) return false;

    // Check for suspicious patterns:
    // 1. Investor viewed request but never made an offer
    // 2. Request suddenly cancelled after investor interest
    // 3. Similar equipment purchased outside platform within 30 days

    // For now, just check if they've interacted
    return request.offers.length > 0;
  }
}

export default EquipmentEscrowManager;