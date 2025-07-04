import { NextRequest, NextResponse } from 'next/server';
import { AutomatedInvoiceGenerator } from '@/lib/financial-automation/invoice-generator';
import { verifyWebhookSignature } from '@/lib/security/webhook-auth';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature for security
    const signature = request.headers.get('x-webhook-signature');
    const body = await request.text();
    
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const data = JSON.parse(body);
    
    // Check if this is the monthly cron job
    if (data.type === 'MONTHLY_INVOICE_GENERATION') {
      const generator = new AutomatedInvoiceGenerator();
      await generator.generateMonthlyInvoices();
      
      return NextResponse.json({
        success: true,
        message: 'Monthly invoices generated successfully',
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(
      { error: 'Unknown webhook type' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Endpoint to manually trigger invoice generation (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const generator = new AutomatedInvoiceGenerator();
    await generator.generateMonthlyInvoices();
    
    return NextResponse.json({
      success: true,
      message: 'Manual invoice generation completed',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Manual invoice generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}