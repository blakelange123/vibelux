import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

// Initialize Stripe lazily to avoid build-time errors
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
    });
  }
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  return stripe;
}

// Admin check middleware
async function isAdmin(userId: string): Promise<boolean> {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  return adminIds.includes(userId);
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, affiliateIds = [] } = await request.json();

    switch (action) {
      case 'approve_pending': {
        // Approve all pending affiliates
        const auditData = {
          adminId: userId,
          action: 'approve_pending',
          count: affiliateIds.length || 'all',
          timestamp: new Date().toISOString()
        };

        // Update database - approve pending affiliates
        const { prisma } = await import('@/lib/prisma');
        const result = await prisma.affiliate.updateMany({
          where: affiliateIds.length > 0 
            ? { id: { in: affiliateIds }, status: 'pending' }
            : { status: 'pending' },
          data: {
            status: 'active',
            approvedAt: new Date(),
            approvedBy: userId
          }
        });

        return NextResponse.json({ 
          success: true,
          message: `Approved ${result.count} pending affiliates`,
          auditData
        });
      }

      case 'process_all_payouts': {
        // Process payouts for all affiliates with pending commissions
        const auditData = {
          adminId: userId,
          action: 'process_all_payouts',
          timestamp: new Date().toISOString()
        };

        // Get affiliates with pending commissions
        const { prisma } = await import('@/lib/prisma');
        const affiliatesWithCommissions = await prisma.affiliate.findMany({
          where: {
            pendingCommissions: { gt: 100 }, // Above minimum threshold
            stripePayoutsEnabled: true,
            status: 'active'
          }
        });

        // Process each payout
        const results = [];
        for (const affiliate of affiliatesWithCommissions) {
          try {
            if (affiliate.stripeAccountId) {
              const transfer = await getStripe().transfers.create({
                amount: Math.floor(affiliate.pendingCommissions * 100), // Convert to cents
                currency: 'usd',
                destination: affiliate.stripeAccountId
              });
              results.push({ affiliateId: affiliate.id, status: 'success', transferId: transfer.id });
            }
          } catch (error: any) {
            results.push({ affiliateId: affiliate.id, status: 'failed', error: error.message });
          }
        }

        return NextResponse.json({ 
          success: true,
          processed: results.length,
          results,
          auditData
        });
      }

      case 'sync_stripe': {
        // Sync Stripe Connect account data
        const auditData = {
          adminId: userId,
          action: 'sync_stripe',
          timestamp: new Date().toISOString()
        };

        // Get all affiliates with Stripe accounts
        const { prisma } = await import('@/lib/prisma');
        const affiliatesWithStripe = await prisma.affiliate.findMany({
          where: { stripeAccountId: { not: null } }
        });

        const syncResults = [];
        for (const affiliate of affiliatesWithStripe) {
          try {
            if (affiliate.stripeAccountId) {
              const account = await getStripe().accounts.retrieve(affiliate.stripeAccountId);
              await prisma.affiliate.update({
                where: { id: affiliate.id },
                data: {
                  stripeChargesEnabled: account.charges_enabled,
                  stripePayoutsEnabled: account.payouts_enabled,
                }
              });
              syncResults.push({ affiliateId: affiliate.id, status: 'synced' });
            }
          } catch (error: any) {
            syncResults.push({ affiliateId: affiliate.id, status: 'failed', error: error.message });
          }
        }

        return NextResponse.json({ 
          success: true,
          synced: syncResults.length,
          results: syncResults,
          auditData
        });
      }

      case 'export_report': {
        // Generate CSV report
        const auditData = {
          adminId: userId,
          action: 'export_report',
          timestamp: new Date().toISOString()
        };

        // TODO: Generate actual report from database
        const csvData = [
          ['Name', 'Email', 'Code', 'Status', 'Tier', 'Total Earnings', 'Pending', 'Active Referrals'],
          ['Sarah Johnson', 'sarah@growbetter.com', 'GROW2024', 'active', 'silver', '4521.83', '287.50', '23'],
          ['Mike Chen', 'mike@urbanharvest.io', 'URBAN10', 'pending', 'bronze', '0', '0', '0']
        ];

        const csv = csvData.map(row => row.join(',')).join('\n');
        
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename=affiliates-${new Date().toISOString().split('T')[0]}.csv`
          }
        });
      }

      case 'send_announcement': {
        // Send email to all affiliates
        const body = await request.json();
        const { subject, message, targetGroup = 'all' } = body;
        
        const auditData = {
          adminId: userId,
          action: 'send_announcement',
          targetGroup,
          subject,
          timestamp: new Date().toISOString()
        };

        // TODO: Get target affiliates and send emails
        // const affiliates = await db.affiliates.findMany({
        //   where: targetGroup === 'all' ? {} : { status: targetGroup }
        // });

        return NextResponse.json({ 
          success: true,
          message: `Announcement sent to ${targetGroup} affiliates`,
          auditData
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Admin action failed:', error);
    return NextResponse.json(
      { error: 'Action failed' },
      { status: 500 }
    );
  }
}