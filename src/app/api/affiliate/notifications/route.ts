import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { affiliateEmailNotifications } from '@/lib/affiliates/email-notifications';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { type, data } = await request.json();
    
    switch (type) {
      case 'welcome':
        await affiliateEmailNotifications.sendWelcomeEmail({
          ...data,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/affiliate/dashboard`
        });
        break;
        
      case 'new_referral':
        await affiliateEmailNotifications.sendNewReferralEmail(data);
        break;
        
      case 'payout_processed':
        await affiliateEmailNotifications.sendPayoutEmail(data);
        break;
        
      case 'tier_upgrade':
        await affiliateEmailNotifications.sendTierUpgradeEmail(data);
        break;
        
      case 'monthly_report':
        await affiliateEmailNotifications.sendMonthlyReportEmail(data);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }
    
    // TODO: Log notification in database
    // await db.affiliateNotifications.create({
    //   data: {
    //     affiliate_id: data.affiliateId,
    //     type,
    //     subject: getSubjectForType(type, data),
    //     message: getMessageForType(type, data),
    //     is_email_sent: true,
    //     email_sent_at: new Date(),
    //   }
    // });
    
    return NextResponse.json({ 
      success: true,
      type,
      sentAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Failed to send notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // TODO: Fetch notifications from database
    // const notifications = await db.affiliateNotifications.findMany({
    //   where: {
    //     affiliate: {
    //       user_id: userId
    //     }
    //   },
    //   orderBy: {
    //     created_at: 'desc'
    //   },
    //   limit: 50
    // });
    
    // Mock data for now
    const notifications = [
      {
        id: '1',
        type: 'new_referral',
        subject: 'New Customer Referral!',
        message: 'You earned $10.50 commission',
        is_read: false,
        created_at: new Date().toISOString()
      }
    ];
    
    return NextResponse.json({ notifications });
    
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}