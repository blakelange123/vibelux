import { PrismaClient } from '@prisma/client';
import { verifySavings } from './savings-verification';

const prisma = new PrismaClient();

interface InvoiceGenerationResult {
  success: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  error?: string;
}

export async function generateInvoice(
  clientId: string,
  billingPeriodStart: Date,
  billingPeriodEnd: Date
): Promise<InvoiceGenerationResult> {
  try {
    // First verify the savings
    const verification = await verifySavings(clientId, billingPeriodStart, billingPeriodEnd);
    
    if (!verification) {
      return {
        success: false,
        error: 'Unable to verify savings for this period'
      };
    }

    if (!verification.verified) {
      return {
        success: false,
        error: `Savings verification failed. Confidence: ${verification.confidence}%`
      };
    }

    // Check if invoice already exists for this period
    const existingInvoice = await prisma.vibeLuxInvoice.findFirst({
      where: {
        clientId,
        billingPeriod: formatBillingPeriod(billingPeriodStart, billingPeriodEnd)
      }
    });

    if (existingInvoice) {
      return {
        success: false,
        error: 'Invoice already exists for this billing period'
      };
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate invoice amount (50% revenue share by default)
    const sharePercentage = 50;
    const invoiceAmount = verification.savingsAmount * (sharePercentage / 100);

    // Create the invoice
    const invoice = await prisma.vibeLuxInvoice.create({
      data: {
        clientId,
        invoiceNumber,
        billingPeriod: formatBillingPeriod(billingPeriodStart, billingPeriodEnd),
        baselineKwh: verification.details.baselineKwh,
        actualKwh: verification.details.actualKwh,
        savingsKwh: verification.savingsKwh,
        savingsAmount: verification.savingsAmount,
        sharePercentage,
        invoiceAmount,
        verificationData: {
          methodology: verification.methodology,
          confidence: verification.confidence,
          iotKwh: verification.details.iotKwh,
          utilityKwh: verification.details.utilityKwh,
          variance: verification.details.variance,
          verifiedAt: new Date()
        },
        status: 'draft',
        dueDate: calculateDueDate()
      }
    });

    // Generate PDF invoice
    await generateInvoicePDF(invoice);

    // Update invoice status to pending
    await prisma.vibeLuxInvoice.update({
      where: { id: invoice.id },
      data: { status: 'pending' }
    });

    return {
      success: true,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber
    };

  } catch (error) {
    console.error('Error generating invoice:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function generateInvoiceNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Get the last invoice number for this month
  const lastInvoice = await prisma.vibeLuxInvoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `INV-${year}${month}`
      }
    },
    orderBy: {
      invoiceNumber: 'desc'
    }
  });

  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
}

function formatBillingPeriod(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

function calculateDueDate(): Date {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // Net 30
  return dueDate;
}

async function generateInvoicePDF(invoice: any): Promise<void> {
  // This would generate a PDF invoice
  // For now, we'll just log that it would be generated
  
  // In production, this would:
  // 1. Use a PDF generation library (like jsPDF or puppeteer)
  // 2. Include all invoice details
  // 3. Attach verification data
  // 4. Upload to cloud storage
  // 5. Update invoice record with PDF URL
}

export async function sendInvoice(invoiceId: string): Promise<boolean> {
  try {
    const invoice = await prisma.vibeLuxInvoice.findUnique({
      where: { id: invoiceId },
      include: { client: true }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'sent' || invoice.status === 'paid') {
      throw new Error('Invoice has already been sent');
    }

    // Send invoice email
    await sendInvoiceEmail(invoice);

    // Update invoice status
    await prisma.vibeLuxInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    });

    return true;

  } catch (error) {
    console.error('Error sending invoice:', error);
    return false;
  }
}

async function sendInvoiceEmail(invoice: any): Promise<void> {
  // This would send an email with the invoice
  
  // In production, this would:
  // 1. Use an email service (SendGrid, SES, etc.)
  // 2. Include invoice PDF as attachment
  // 3. Include payment instructions
  // 4. Include verification summary
}

export async function processAutomatedBilling(): Promise<void> {
  try {
    // Get all clients with verified baselines
    const clientsWithBaselines = await prisma.clientBaseline.findMany({
      where: {
        status: 'verified'
      }
    });

    const now = new Date();
    const billingPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
    const billingPeriodStart = new Date(billingPeriodEnd.getFullYear(), billingPeriodEnd.getMonth(), 1); // First day of previous month

    for (const baseline of clientsWithBaselines) {
      // Check if utility bill data is available for the period
      const utilityBill = await prisma.utilityBillData.findFirst({
        where: {
          clientId: baseline.clientId,
          billingPeriodEnd: {
            gte: billingPeriodStart,
            lte: billingPeriodEnd
          },
          status: 'processed'
        }
      });

      if (utilityBill) {
        // Generate invoice
        const result = await generateInvoice(
          baseline.clientId,
          billingPeriodStart,
          billingPeriodEnd
        );

        if (result.success && result.invoiceId) {
          // Auto-send invoice
          await sendInvoice(result.invoiceId);
        } else {
          console.error(`Failed to generate invoice for client ${baseline.clientId}: ${result.error}`);
        }
      }
    }

  } catch (error) {
    console.error('Error in automated billing process:', error);
  }
}