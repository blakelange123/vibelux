import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get investor
    const investor = await prisma.investor.findUnique({
      where: { userId }
    });

    if (!investor) {
      return NextResponse.json(
        { error: 'Investor profile not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const investmentId = searchParams.get('investmentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {
      investment: {
        investorId: investor.id
      }
    };

    if (status) {
      where.status = status;
    }

    if (investmentId) {
      where.investmentId = investmentId;
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) {
        where.dueDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.dueDate.lte = new Date(endDate);
      }
    }

    // Get payments
    const payments = await prisma.payment.findMany({
      where,
      include: {
        investment: {
          include: {
            facility: true
          }
        }
      },
      orderBy: { dueDate: 'desc' }
    });

    // Calculate summary statistics
    const summary = {
      totalPaid: payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
      totalPending: payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0),
      totalOverdue: payments
        .filter(p => p.status === 'pending' && p.dueDate < new Date())
        .reduce((sum, p) => sum + p.amount, 0),
      paymentsByType: {
        serviceFee: payments
          .filter(p => p.paymentType === 'service_fee')
          .reduce((sum, p) => sum + p.amount, 0),
        yieldShare: payments
          .filter(p => p.paymentType === 'yield_share')
          .reduce((sum, p) => sum + p.amount, 0),
        principalReturn: payments
          .filter(p => p.paymentType === 'principal_return')
          .reduce((sum, p) => sum + p.amount, 0)
      }
    };

    return NextResponse.json({
      payments,
      summary
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment data' },
      { status: 500 }
    );
  }
}

// Process payment (webhook from payment provider)
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature');
    const webhookSecret = process.env.INVESTMENT_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('Investment webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }
    
    const rawBody = await request.text();
    const data = JSON.parse(rawBody);
    
    // Verify signature using HMAC-SHA256 (common pattern)
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Update payment status
    const payment = await prisma.payment.update({
      where: { id: data.paymentId },
      data: {
        status: data.status,
        paidDate: data.status === 'completed' ? new Date() : null,
        transactionId: data.transactionId,
        paymentMethod: data.paymentMethod
      },
      include: {
        investment: {
          include: {
            investor: true
          }
        }
      }
    });

    // Update investor metrics if payment completed
    if (data.status === 'completed') {
      await prisma.investor.update({
        where: { id: payment.investment.investorId },
        data: {
          totalReturned: {
            increment: payment.amount
          }
        }
      });

      // Create notification/alert
      await prisma.investmentAlert.create({
        data: {
          investmentId: payment.investmentId,
          alertType: 'payment_received',
          severity: 'low',
          title: 'Payment Received',
          message: `Payment of $${payment.amount.toLocaleString()} has been received`,
          resolved: true,
          resolvedAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}