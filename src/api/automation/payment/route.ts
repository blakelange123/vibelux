import { NextRequest, NextResponse } from 'next/server';
import { AutomatedPaymentProcessor } from '@/lib/financial-automation/payment-processor';
import { verifyWebhookSignature } from '@/lib/security/webhook-auth';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-signature');
    const body = await request.text();
    
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const data = JSON.parse(body);
    
    const processor = new AutomatedPaymentProcessor();
    
    switch (data.type) {
      case 'DAILY_PAYMENT_PROCESSING':
        await processor.processScheduledPayments();
        break;
        
      case 'WIRE_MONITORING':
        await processor.monitorWireTransfers();
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unknown webhook type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `${data.type} completed successfully`,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}