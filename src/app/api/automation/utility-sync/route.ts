import { NextRequest, NextResponse } from 'next/server';
import { UtilityIntegrationClient } from '@/lib/utility-integration/utility-api-client';
import { verifyWebhookSignature } from '@/lib/security/webhook-auth';
import { prisma } from '@/lib/prisma';

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
    
    if (data.type === 'DAILY_UTILITY_SYNC') {
      const client = new UtilityIntegrationClient();
      
      // Get all active utility connections
      const connections = await prisma.utilityConnection.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { lastSyncAt: null },
            { lastSyncAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
          ]
        }
      });
      
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const connection of connections) {
        try {
          await client.pullHistoricalData(connection.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync connection ${connection.id}:`, error);
          errorCount++;
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Daily utility sync completed',
        results: {
          total: connections.length,
          successful: successCount,
          failed: errorCount,
        },
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(
      { error: 'Unknown webhook type' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Utility sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}