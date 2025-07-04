import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import pdf from 'pdf-parse';

const prisma = new PrismaClient();

// Initialize Claude API
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

// PDF processing prompt template
const PDF_ANALYSIS_PROMPT = `You are an expert at analyzing utility bills. Extract the following information from this utility bill text:

1. Account Information:
   - Account number
   - Service address
   - Customer name
   - Billing period (start and end dates)

2. Usage Data:
   - Total kWh used
   - Peak demand (kW)
   - Time-of-use breakdown if available
   - Previous period usage for comparison

3. Charges:
   - Energy charges
   - Demand charges
   - Rate schedule/tariff
   - Total amount due

4. Rate Information:
   - Current rate per kWh
   - TOU rates if applicable
   - Demand charge rate

Please provide the extracted data in JSON format. If any field is not found, use null.

Utility Bill Text:
{billText}`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for Claude API key
    if (!process.env.CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API not configured. Please set CLAUDE_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;

    if (!file || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields: file and clientId' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    let extractedText = '';
    try {
      const pdfData = await pdf(buffer);
      extractedText = pdfData.text;
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json(
        { error: 'Failed to parse PDF. Please ensure the file is a valid PDF.' },
        { status: 400 }
      );
    }

    // Send to Claude for analysis
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      temperature: 0,
      system: "You are a utility bill analysis expert. Extract data accurately and return valid JSON.",
      messages: [
        {
          role: 'user',
          content: PDF_ANALYSIS_PROMPT.replace('{billText}', extractedText)
        }
      ]
    });

    // Parse Claude's response
    const responseText = claudeResponse.content[0].type === 'text' 
      ? claudeResponse.content[0].text 
      : '';
    
    let extractedData;
    try {
      // Find JSON in the response (Claude might include explanation text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Store the extracted data in database
    const result = await prisma.utilityBillData.create({
      data: {
        clientId,
        fileName: file.name,
        extractedData,
        accountNumber: extractedData.accountNumber,
        billingPeriodStart: extractedData.billingPeriodStart ? new Date(extractedData.billingPeriodStart) : null,
        billingPeriodEnd: extractedData.billingPeriodEnd ? new Date(extractedData.billingPeriodEnd) : null,
        totalKwh: extractedData.totalKwh,
        peakDemand: extractedData.peakDemand,
        totalCharges: extractedData.totalCharges,
        status: 'processed',
        processedAt: new Date(),
        processedBy: 'claude-api'
      }
    });

    // Calculate baseline if this is historical data
    if (extractedData.billingPeriodEnd && new Date(extractedData.billingPeriodEnd) < new Date()) {
      await updateClientBaseline(clientId, extractedData);
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      billId: result.id,
      message: 'PDF processed successfully'
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to update client baseline
async function updateClientBaseline(clientId: string, billData: any) {
  try {
    // Get all historical bills for this client
    const historicalBills = await prisma.utilityBillData.findMany({
      where: {
        clientId,
        billingPeriodEnd: {
          lt: new Date()
        }
      },
      orderBy: {
        billingPeriodEnd: 'desc'
      },
      take: 12 // Last 12 months
    });

    if (historicalBills.length >= 3) {
      // Calculate average baseline
      const avgKwh = historicalBills.reduce((sum, bill) => sum + (bill.totalKwh || 0), 0) / historicalBills.length;
      const avgDemand = historicalBills.reduce((sum, bill) => sum + (bill.peakDemand || 0), 0) / historicalBills.length;

      // Update client baseline
      await prisma.clientBaseline.upsert({
        where: { clientId },
        update: {
          averageMonthlyKwh: avgKwh,
          averagePeakDemand: avgDemand,
          dataPoints: historicalBills.length,
          lastUpdated: new Date(),
          status: 'verified'
        },
        create: {
          clientId,
          averageMonthlyKwh: avgKwh,
          averagePeakDemand: avgDemand,
          dataPoints: historicalBills.length,
          status: 'verified'
        }
      });
    }
  } catch (error) {
    console.error('Failed to update baseline:', error);
  }
}