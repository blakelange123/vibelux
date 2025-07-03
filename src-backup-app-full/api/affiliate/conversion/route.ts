import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required for conversion tracking' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Get tracking cookies
    const cookieStore = cookies();
    const affiliateCode = cookieStore.get('vl_aff')?.value;
    const clickId = cookieStore.get('vl_click')?.value;
    
    if (!affiliateCode) {
      return NextResponse.json({
        tracked: false,
        message: 'No affiliate tracking found'
      });
    }
    
    // Find affiliate
    const affiliate = await db.affiliates.findByCode(affiliateCode);
    
    if (!affiliate || affiliate.status !== 'ACTIVE') {
      return NextResponse.json({
        tracked: false,
        message: 'Invalid or inactive affiliate'
      });
    }
    
    // Check if this user has already been tracked as a referral
    const existingReferral = await db.prisma.affiliateReferral.findFirst({
      where: {
        affiliateId: affiliate.id,
        referredEmail: data.email || ''
      }
    });
    
    let referral;
    
    if (existingReferral) {
      // Update existing referral
      referral = await db.affiliates.updateReferralStatus(existingReferral.id, {
        status: 'CONVERTED',
        firstPurchaseAt: new Date(),
        totalPurchases: data.purchaseAmount || 0
      });
    } else {
      // Create new referral
      referral = await db.affiliates.createReferral({
        affiliateId: affiliate.id,
        referredEmail: data.email || userId
      });
      
      // Immediately mark as converted
      referral = await db.affiliates.updateReferralStatus(referral.id, {
        status: 'CONVERTED',
        signedUpAt: new Date(),
        firstPurchaseAt: new Date(),
        totalPurchases: data.purchaseAmount || 0
      });
    }
    
    // Update click record if we have a click ID
    if (clickId) {
      await db.prisma.affiliateClick.updateMany({
        where: { clickId },
        data: {
          converted: true,
          conversionId: referral.id,
          conversionValue: data.purchaseAmount || 0
        }
      });
    }
    
    // Calculate commission
    const commissionRate = affiliate.baseCommission + affiliate.bonusCommission;
    const commissionAmount = (data.purchaseAmount || 0) * (commissionRate / 100);
    
    // Update affiliate metrics
    await db.prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalReferrals: { increment: existingReferral ? 0 : 1 },
        activeReferrals: { increment: 1 },
        totalRevenue: { increment: data.purchaseAmount || 0 },
        totalCommission: { increment: commissionAmount }
      }
    });
    
    // Update referral commission
    await db.prisma.affiliateReferral.update({
      where: { id: referral.id },
      data: {
        totalPurchases: { increment: data.purchaseAmount || 0 },
        totalCommission: { increment: commissionAmount }
      }
    });
    
    // Clear tracking cookies after successful conversion
    cookieStore.delete('vl_aff');
    cookieStore.delete('vl_click');
    
    return NextResponse.json({
      success: true,
      tracked: true,
      referralId: referral.id,
      commissionAmount,
      message: 'Conversion tracked successfully'
    });
    
  } catch (error) {
    console.error('Failed to track conversion:', error);
    return NextResponse.json(
      { error: 'Failed to track conversion' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user can be tracked for conversion
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        canTrack: false,
        reason: 'Not authenticated'
      });
    }
    
    const cookieStore = cookies();
    const affiliateCode = cookieStore.get('vl_aff')?.value;
    
    if (!affiliateCode) {
      return NextResponse.json({
        canTrack: false,
        reason: 'No affiliate tracking'
      });
    }
    
    const affiliate = await db.affiliates.findByCode(affiliateCode);
    
    if (!affiliate || affiliate.status !== 'ACTIVE') {
      return NextResponse.json({
        canTrack: false,
        reason: 'Invalid affiliate'
      });
    }
    
    // Check if user is already tracked
    const user = await db.users.findByClerkId(userId);
    if (user && user.email) {
      const existingReferral = await db.prisma.affiliateReferral.findFirst({
        where: {
          affiliateId: affiliate.id,
          referredEmail: user.email,
          status: 'CONVERTED'
        }
      });
      
      if (existingReferral) {
        return NextResponse.json({
          canTrack: false,
          reason: 'Already tracked',
          existingReferral: true
        });
      }
    }
    
    return NextResponse.json({
      canTrack: true,
      affiliateCode: affiliate.code,
      affiliateName: affiliate.user.name,
      commissionRate: affiliate.baseCommission + affiliate.bonusCommission
    });
    
  } catch (error) {
    console.error('Failed to check conversion tracking:', error);
    return NextResponse.json(
      { error: 'Failed to check tracking' },
      { status: 500 }
    );
  }
}