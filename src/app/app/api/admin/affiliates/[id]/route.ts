import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// Admin check middleware
async function isAdmin(userId: string): Promise<boolean> {
  // Check admin status from database
  const user = await db.users.findByClerkId(userId);
  if (!user) return false;
  
  // Check if user has admin role
  return user.role === 'ADMIN';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch affiliate details from database
    const affiliate = await db.prisma.affiliate.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        referrals: {
          include: {
            _count: true
          }
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Format response with full details
    const affiliateDetails = {
      id: affiliate.id,
      name: affiliate.user.name,
      email: affiliate.user.email,
      code: affiliate.code,
      status: affiliate.status,
      tier: affiliate.tier,
      // Performance metrics
      totalReferrals: affiliate.totalReferrals,
      activeReferrals: affiliate.activeReferrals,
      totalRevenue: affiliate.totalRevenue,
      totalCommission: affiliate.totalCommission,
      // Payment info
      baseCommission: affiliate.baseCommission,
      bonusCommission: affiliate.bonusCommission,
      paymentMethod: affiliate.paymentMethod,
      paymentDetails: affiliate.paymentDetails,
      lastPayout: affiliate.lastPayout,
      // Referral details
      referralDetails: affiliate.referrals.map(ref => ({
        id: ref.id,
        customerEmail: ref.referredEmail,
        signupDate: ref.signedUpAt,
        status: ref.status,
        totalPurchases: ref.totalPurchases,
        commissionEarned: ref.totalCommission
      })),
      // Payout history
      payoutHistory: affiliate.payouts.map(payout => ({
        id: payout.id,
        amount: payout.amount,
        date: payout.createdAt,
        status: payout.status,
        period: payout.period,
        transactionId: payout.transactionId
      })),
      // Metadata
      joinedAt: affiliate.joinedAt,
      updatedAt: affiliate.updatedAt
    };

    return NextResponse.json({ affiliate: affiliateDetails });
    
  } catch (error) {
    console.error('Failed to fetch affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    
    // Validate updates
    const allowedFields = [
      'code', 'status', 'tier',
      'baseCommission', 'bonusCommission', 
      'paymentMethod', 'paymentDetails'
    ];
    
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    // Validate commission rates
    if (filteredUpdates.baseCommission !== undefined) {
      if (filteredUpdates.baseCommission < 0 || filteredUpdates.baseCommission > 100) {
        return NextResponse.json(
          { error: 'Base commission must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    if (filteredUpdates.bonusCommission !== undefined) {
      if (filteredUpdates.bonusCommission < 0 || filteredUpdates.bonusCommission > 100) {
        return NextResponse.json(
          { error: 'Bonus commission must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Check if code is unique
    if (filteredUpdates.code) {
      const existingAffiliate = await db.affiliates.findByCode(filteredUpdates.code);
      if (existingAffiliate && existingAffiliate.id !== params.id) {
        return NextResponse.json(
          { error: 'Affiliate code already exists' },
          { status: 400 }
        );
      }
    }

    // Update affiliate in database
    const updatedAffiliate = await db.affiliates.update(params.id, filteredUpdates);

    // Log admin action
    await db.prisma.adminLog.create({
      data: {
        adminId: userId,
        action: 'UPDATE_AFFILIATE',
        targetType: 'AFFILIATE',
        targetId: params.id,
        details: {
          updates: filteredUpdates
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      affiliate: updatedAffiliate
    });
    
  } catch (error) {
    console.error('Failed to update affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to update affiliate' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reason } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { error: 'Termination reason is required' },
        { status: 400 }
      );
    }

    // Soft delete - just update status
    await db.affiliates.update(params.id, { 
      status: 'TERMINATED'
    });

    // Log admin action
    await db.prisma.adminLog.create({
      data: {
        adminId: userId,
        action: 'TERMINATE_AFFILIATE',
        targetType: 'AFFILIATE',
        targetId: params.id,
        details: {
          reason,
          terminatedAt: new Date()
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Affiliate terminated'
    });
    
  } catch (error) {
    console.error('Failed to terminate affiliate:', error);
    return NextResponse.json(
      { error: 'Failed to terminate affiliate' },
      { status: 500 }
    );
  }
}