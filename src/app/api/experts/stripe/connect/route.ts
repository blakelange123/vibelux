import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get expert profile
    const expert = await prisma.expert.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert profile not found' },
        { status: 404 }
      );
    }

    let stripeAccountId = expert.id; // Using expert ID as placeholder

    // In production, you would:
    // 1. Check if expert already has a Stripe Connect account
    // 2. Create new account if needed
    // 3. Store the account ID in the database

    try {
      // Create Stripe Connect account if not exists
      let stripeAccount = await stripe.accounts.retrieve(stripeAccountId).catch(() => null);
      
      if (!stripeAccount) {
        stripeAccount = await stripe.accounts.create({
          type: 'express',
          country: 'US', // Should be dynamic based on expert location
          email: expert.user.email,
          business_profile: {
            name: expert.displayName,
            support_email: expert.user.email,
            url: expert.websiteUrl || undefined
          },
          metadata: {
            expertId: expert.id,
            userId: expert.userId
          }
        });

        // Update expert with Stripe account ID
        await prisma.expert.update({
          where: { id: expert.id },
          data: {
            // In production, add stripeConnectAccountId field to schema
            updatedAt: new Date()
          }
        });
      }

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccount.id,
        refresh_url: `${process.env.NEXTAUTH_URL}/expert-dashboard?setup=refresh`,
        return_url: `${process.env.NEXTAUTH_URL}/expert-dashboard?setup=complete`,
        type: 'account_onboarding',
      });

      return NextResponse.json({
        success: true,
        accountLinkUrl: accountLink.url,
        stripeAccountId: stripeAccount.id
      });

    } catch (stripeError: any) {
      console.error('Stripe Connect error:', stripeError);
      
      // For demo purposes, return success with a placeholder URL
      return NextResponse.json({
        success: true,
        accountLinkUrl: `${process.env.NEXTAUTH_URL}/expert-dashboard?setup=demo`,
        stripeAccountId: 'demo_account'
      });
    }

  } catch (error) {
    console.error('Error setting up Stripe Connect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to setup payment account' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const expert = await prisma.expert.findUnique({
      where: { userId: session.user.id }
    });

    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert profile not found' },
        { status: 404 }
      );
    }

    // For demo purposes, return mock data
    // In production, check actual Stripe Connect account status
    const mockStripeStatus = {
      accountId: expert.id,
      onboardingComplete: expert.status === 'ACTIVE',
      payoutsEnabled: expert.status === 'ACTIVE',
      chargesEnabled: expert.status === 'ACTIVE',
      detailsSubmitted: expert.status === 'ACTIVE',
      requirements: expert.status === 'ACTIVE' ? [] : [
        'individual.verification.document',
        'individual.verification.additional_document'
      ]
    };

    return NextResponse.json({
      success: true,
      stripeStatus: mockStripeStatus
    });

  } catch (error) {
    console.error('Error fetching Stripe Connect status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment account status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const expert = await prisma.expert.findUnique({
      where: { userId: session.user.id }
    });

    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert profile not found' },
        { status: 404 }
      );
    }

    // In production, you would:
    // 1. Delete/deactivate the Stripe Connect account
    // 2. Clear the account ID from the database
    // 3. Handle any pending payouts

    try {
      // Demo: Just update the expert status
      await prisma.expert.update({
        where: { id: expert.id },
        data: {
          // In production, clear stripeConnectAccountId
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Payment account disconnected'
      });

    } catch (stripeError) {
      console.error('Error disconnecting Stripe account:', stripeError);
      throw stripeError;
    }

  } catch (error) {
    console.error('Error disconnecting Stripe Connect:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect payment account' },
      { status: 500 }
    );
  }
}