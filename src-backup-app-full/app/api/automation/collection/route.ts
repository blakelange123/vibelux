import { NextRequest, NextResponse } from 'next/server';
import { AutomatedCollectionManager } from '@/lib/financial-automation/collection-manager';
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
    
    if (data.type === 'DAILY_COLLECTION_PROCESSING') {
      const manager = new AutomatedCollectionManager();
      await manager.processCollections();
      
      return NextResponse.json({
        success: true,
        message: 'Daily collections processed successfully',
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(
      { error: 'Unknown webhook type' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Collection processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Settlement negotiation endpoint
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { invoiceId, offerAmount } = data;
    
    if (!invoiceId || !offerAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const manager = new AutomatedCollectionManager();
    const result = await manager.negotiateSettlement(invoiceId, offerAmount);
    
    return NextResponse.json({
      success: true,
      settlement: result,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Settlement negotiation error:', error);
    return NextResponse.json(
      { error: 'Settlement negotiation failed' },
      { status: 500 }
    );
  }
}