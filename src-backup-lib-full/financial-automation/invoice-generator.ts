import { prisma } from '@/lib/prisma';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { calculateVerifiedSavings } from '../energy/savings-calculator';
import { sendInvoiceEmail } from '../email/invoice-mailer';

interface InvoiceData {
  customerId: string;
  period: Date;
  energySavings: number;
  yieldImprovements: number;
  costReductions: number;
  totalSavings: number;
  revenueShareRate: number;
  amountDue: number;
  dueDate: Date;
}

export class AutomatedInvoiceGenerator {
  private s3Client: S3Client;
  
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Generate invoices for all active revenue sharing customers
   * Runs automatically on the 1st of each month via cron job
   */
  async generateMonthlyInvoices(): Promise<void> {
    
    // Get all active revenue sharing agreements
    const activeAgreements = await prisma.revenueSharingAgreement.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
      include: {
        customer: true,
        facility: true,
      }
    });


    // Process each agreement
    const invoicePromises = activeAgreements.map(async (agreement) => {
      try {
        await this.generateInvoiceForCustomer(agreement);
      } catch (error) {
        console.error(`Failed to generate invoice for customer ${agreement.customerId}:`, error);
        // Log to error tracking system
        await this.logInvoiceError(agreement.customerId, error);
      }
    });

    await Promise.all(invoicePromises);
  }

  /**
   * Generate invoice for a specific customer
   */
  private async generateInvoiceForCustomer(agreement: any): Promise<void> {
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
    
    // Calculate verified savings from multiple sources
    const savings = await calculateVerifiedSavings({
      facilityId: agreement.facilityId,
      startDate,
      endDate,
      includeWeatherNormalization: true,
      includeThirdPartyVerification: true,
    });

    // Check if savings meet minimum threshold
    if (savings.totalSavings < agreement.minimumThreshold) {
      return;
    }

    // Calculate revenue share amount
    const revenueShareAmount = savings.totalSavings * (agreement.revenueShareRate / 100);
    
    // Create invoice data
    const invoiceData: InvoiceData = {
      customerId: agreement.customerId,
      period: startDate,
      energySavings: savings.energySavings,
      yieldImprovements: savings.yieldImprovements,
      costReductions: savings.operationalSavings,
      totalSavings: savings.totalSavings,
      revenueShareRate: agreement.revenueShareRate,
      amountDue: revenueShareAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30
    };

    // Generate PDF invoice
    const pdfBuffer = await this.generatePDF(invoiceData, agreement);
    
    // Store invoice in database
    const invoice = await prisma.invoice.create({
      data: {
        customerId: agreement.customerId,
        agreementId: agreement.id,
        invoiceNumber: await this.generateInvoiceNumber(),
        periodStart: startDate,
        periodEnd: endDate,
        totalSavings: savings.totalSavings,
        revenueShareRate: agreement.revenueShareRate,
        amountDue: revenueShareAmount,
        dueDate: invoiceData.dueDate,
        status: 'PENDING',
        pdfUrl: await this.uploadToS3(pdfBuffer, agreement.customerId),
        verificationData: savings.verificationData,
        weatherNormalizationApplied: true,
        thirdPartyVerified: savings.thirdPartyVerified,
      }
    });

    // Send invoice email
    await sendInvoiceEmail({
      customer: agreement.customer,
      invoice,
      pdfBuffer,
    });

    // Schedule payment collection
    await this.schedulePaymentCollection(invoice);
  }

  /**
   * Generate PDF invoice with professional formatting
   */
  private async generatePDF(data: InvoiceData, agreement: any): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    let y = height - 50;

    // Header
    page.drawText('VibeLux Energy', {
      x: 50,
      y,
      size: 24,
      font: boldFont,
      color: rgb(0.145, 0.388, 0.922), // VibeLux blue
    });

    y -= 40;
    page.drawText('Revenue Sharing Invoice', {
      x: 50,
      y,
      size: 18,
      font: boldFont,
    });

    // Invoice details
    y -= 60;
    page.drawText(`Invoice Number: ${await this.generateInvoiceNumber()}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 20;
    page.drawText(`Date: ${format(new Date(), 'MMMM d, yyyy')}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 20;
    page.drawText(`Period: ${format(data.period, 'MMMM yyyy')}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    // Customer info
    y -= 40;
    page.drawText('Bill To:', {
      x: 50,
      y,
      size: 14,
      font: boldFont,
    });

    y -= 20;
    page.drawText(agreement.customer.name, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 20;
    page.drawText(agreement.facility.address, {
      x: 50,
      y,
      size: 12,
      font,
    });

    // Savings breakdown
    y -= 60;
    page.drawText('Performance Summary', {
      x: 50,
      y,
      size: 16,
      font: boldFont,
    });

    y -= 30;
    const drawLine = (label: string, value: string, yPos: number) => {
      page.drawText(label, { x: 50, y: yPos, size: 12, font });
      page.drawText(value, { x: 400, y: yPos, size: 12, font });
    };

    drawLine('Energy Savings:', `$${data.energySavings.toFixed(2)}`, y);
    y -= 20;
    drawLine('Yield Improvements:', `$${data.yieldImprovements.toFixed(2)}`, y);
    y -= 20;
    drawLine('Operational Cost Reductions:', `$${data.costReductions.toFixed(2)}`, y);
    y -= 25;
    page.drawLine({
      start: { x: 50, y: y + 5 },
      end: { x: 500, y: y + 5 },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= 5;
    drawLine('Total Verified Savings:', `$${data.totalSavings.toFixed(2)}`, y);

    // Revenue share calculation
    y -= 50;
    page.drawText('Revenue Share Calculation', {
      x: 50,
      y,
      size: 16,
      font: boldFont,
    });

    y -= 30;
    drawLine('Total Savings:', `$${data.totalSavings.toFixed(2)}`, y);
    y -= 20;
    drawLine('Revenue Share Rate:', `${data.revenueShareRate}%`, y);
    y -= 25;
    page.drawLine({
      start: { x: 50, y: y + 5 },
      end: { x: 500, y: y + 5 },
      thickness: 2,
      color: rgb(0.145, 0.388, 0.922),
    });
    y -= 10;
    page.drawText('Amount Due:', {
      x: 50,
      y,
      size: 14,
      font: boldFont,
    });
    page.drawText(`$${data.amountDue.toFixed(2)}`, {
      x: 400,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0.145, 0.388, 0.922),
    });

    // Payment terms
    y -= 50;
    page.drawText('Payment Terms', {
      x: 50,
      y,
      size: 14,
      font: boldFont,
    });

    y -= 20;
    page.drawText(`Due Date: ${format(data.dueDate, 'MMMM d, yyyy')}`, {
      x: 50,
      y,
      size: 12,
      font,
    });

    y -= 20;
    page.drawText('Payment will be automatically collected via ACH on the due date.', {
      x: 50,
      y,
      size: 11,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Verification footer
    y = 100;
    page.drawText('This invoice has been verified by:', {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    y -= 15;
    page.drawText('✓ Automated utility bill analysis', {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    y -= 15;
    page.drawText('✓ Weather normalization algorithms', {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    y -= 15;
    page.drawText('✓ Third-party verification system', {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  /**
   * Upload invoice PDF to S3
   */
  private async uploadToS3(pdfBuffer: Buffer, customerId: string): Promise<string> {
    const key = `invoices/${customerId}/${format(new Date(), 'yyyy-MM')}/invoice-${Date.now()}.pdf`;
    
    await this.s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    }));

    return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        }
      }
    });
    
    return `VL-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  /**
   * Schedule automatic payment collection
   */
  private async schedulePaymentCollection(invoice: any): Promise<void> {
    await prisma.paymentSchedule.create({
      data: {
        invoiceId: invoice.id,
        scheduledDate: invoice.dueDate,
        status: 'SCHEDULED',
        paymentMethod: 'ACH',
        amount: invoice.amountDue,
        retryCount: 0,
        maxRetries: 3,
      }
    });
  }

  /**
   * Log invoice generation errors
   */
  private async logInvoiceError(customerId: string, error: any): Promise<void> {
    await prisma.invoiceError.create({
      data: {
        customerId,
        errorType: 'GENERATION_FAILED',
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date(),
      }
    });
  }
}