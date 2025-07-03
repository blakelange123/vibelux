import sgMail from '@sendgrid/mail';
import { format } from 'date-fns';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface InvoiceEmailData {
  customer: {
    name: string;
    email: string;
  };
  invoice: {
    invoiceNumber: string;
    periodStart: Date;
    periodEnd: Date;
    totalSavings: number;
    amountDue: number;
    dueDate: Date;
    pdfUrl?: string;
  };
  pdfBuffer?: Buffer;
}

export async function sendInvoiceEmail(data: InvoiceEmailData): Promise<void> {
  const { customer, invoice, pdfBuffer } = data;
  
  const msg = {
    to: customer.email,
    from: process.env.EMAIL_FROM!,
    subject: `VibeLux Invoice ${invoice.invoiceNumber} - ${format(invoice.periodStart, 'MMMM yyyy')}`,
    html: generateInvoiceEmailHTML(data),
    attachments: pdfBuffer ? [{
      content: pdfBuffer.toString('base64'),
      filename: `invoice-${invoice.invoiceNumber}.pdf`,
      type: 'application/pdf',
      disposition: 'attachment',
    }] : undefined,
  };
  
  await sgMail.send(msg);
}

function generateInvoiceEmailHTML(data: InvoiceEmailData): string {
  const { customer, invoice } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VibeLux Invoice</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0f0f23; color: white; padding: 30px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 30px; }
        .invoice-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .amount-due { font-size: 28px; font-weight: bold; color: #2563eb; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>VibeLux Energy</h1>
          <p>Revenue Sharing Invoice</p>
        </div>
        
        <div class="content">
          <p>Dear ${customer.name},</p>
          
          <p>Thank you for being a valued VibeLux partner. Your revenue sharing invoice for ${format(invoice.periodStart, 'MMMM yyyy')} is now available.</p>
          
          <div class="invoice-details">
            <h2>Invoice Details</h2>
            <table style="width: 100%;">
              <tr>
                <td><strong>Invoice Number:</strong></td>
                <td>${invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td><strong>Service Period:</strong></td>
                <td>${format(invoice.periodStart, 'MMM d')} - ${format(invoice.periodEnd, 'MMM d, yyyy')}</td>
              </tr>
              <tr>
                <td><strong>Total Verified Savings:</strong></td>
                <td>$${invoice.totalSavings.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Due Date:</strong></td>
                <td>${format(invoice.dueDate, 'MMMM d, yyyy')}</td>
              </tr>
            </table>
            
            <hr style="margin: 20px 0;">
            
            <div style="text-align: center;">
              <p style="margin: 0;">Amount Due:</p>
              <p class="amount-due">$${invoice.amountDue.toFixed(2)}</p>
            </div>
          </div>
          
          <p><strong>Payment will be automatically collected on the due date using your payment method on file.</strong></p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" class="button">View Invoice Details</a>
          </div>
          
          <p>If you have any questions about this invoice or need to update your payment method, please visit your customer portal or contact our billing team.</p>
          
          <p>Best regards,<br>The VibeLux Team</p>
        </div>
        
        <div class="footer">
          <p>VibeLux Energy | 123 Innovation Drive, San Diego, CA 92101</p>
          <p>Questions? Email billing@vibelux.com or call 1-800-VIBELUX</p>
        </div>
      </div>
    </body>
    </html>
  `;
}