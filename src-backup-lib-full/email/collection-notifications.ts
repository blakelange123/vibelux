import sgMail from '@sendgrid/mail';
import { format } from 'date-fns';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface CollectionNotificationData {
  type: 'email' | 'payment_method_expired';
  customer: any;
  invoice?: any;
  template?: string;
  data?: any;
}

export async function sendCollectionNotification(data: CollectionNotificationData): Promise<void> {
  const { type, customer, template } = data;
  
  if (type === 'payment_method_expired') {
    await sendPaymentMethodExpiredEmail(customer);
    return;
  }
  
  let subject: string;
  let html: string;
  
  switch (template) {
    case 'friendly_reminder':
      subject = 'Friendly Payment Reminder - VibeLux Energy';
      html = generateFriendlyReminderEmail(data);
      break;
      
    case 'first_notice':
      subject = 'Payment Due - VibeLux Energy Invoice';
      html = generateFirstNoticeEmail(data);
      break;
      
    case 'urgent_notice':
      subject = 'Urgent: Payment Required - VibeLux Energy';
      html = generateUrgentNoticeEmail(data);
      break;
      
    case 'final_notice':
      subject = 'Final Notice: Immediate Payment Required';
      html = generateFinalNoticeEmail(data);
      break;
      
    default:
      throw new Error(`Unknown collection template: ${template}`);
  }
  
  const msg = {
    to: customer.email,
    from: process.env.EMAIL_FROM!,
    subject,
    html,
  };
  
  await sgMail.send(msg);
}

function generateFriendlyReminderEmail(data: CollectionNotificationData): string {
  const { customerName, invoiceNumber, amountDue, dueDate, paymentUrl } = data.data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 30px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 30px; }
        .reminder-box { background-color: #dbeafe; border: 1px solid #2563eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Reminder</h1>
        </div>
        
        <div class="content">
          <p>Hi ${customerName},</p>
          
          <p>This is a friendly reminder that your VibeLux Energy invoice is now available for payment.</p>
          
          <div class="reminder-box">
            <p style="margin: 0;"><strong>Invoice ${invoiceNumber}</strong></p>
            <p style="margin: 10px 0;">Amount Due: <strong>$${amountDue}</strong></p>
            <p style="margin: 10px 0 0 0;">Due Date: ${dueDate}</p>
          </div>
          
          <p>Your payment is scheduled to be automatically processed. If you'd like to pay now or update your payment method, you can do so online:</p>
          
          <div style="text-align: center;">
            <a href="${paymentUrl}" class="button">View Invoice</a>
          </div>
          
          <p>Thank you for your continued partnership!</p>
          
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

function generateFirstNoticeEmail(data: CollectionNotificationData): string {
  const { customerName, invoiceNumber, amountDue, daysPastDue, paymentUrl } = data.data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 30px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 30px; }
        .notice-box { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Past Due</h1>
        </div>
        
        <div class="content">
          <p>Dear ${customerName},</p>
          
          <p>We haven't received payment for your VibeLux Energy invoice. This is now ${daysPastDue} days past due.</p>
          
          <div class="notice-box">
            <p style="margin: 0;"><strong>Invoice ${invoiceNumber}</strong></p>
            <p style="margin: 10px 0;">Amount Due: <strong>$${amountDue}</strong></p>
            <p style="margin: 10px 0 0 0;">Days Past Due: <strong>${daysPastDue} days</strong></p>
          </div>
          
          <p>To avoid any interruption to your service or late fees, please make payment as soon as possible.</p>
          
          <div style="text-align: center;">
            <a href="${paymentUrl}" class="button">Pay Now</a>
          </div>
          
          <p>If you've already made payment, please disregard this notice. If you're experiencing difficulties, please contact us to discuss payment arrangements.</p>
          
          <p>Thank you for your prompt attention to this matter.</p>
          
          <p>Sincerely,<br>VibeLux Billing Department</p>
        </div>
        
        <div class="footer">
          <p>VibeLux Energy | Billing Department</p>
          <p>Need help? Call 1-800-VIBELUX or email billing@vibelux.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateUrgentNoticeEmail(data: CollectionNotificationData): string {
  const { customerName, invoiceNumber, amountDue, daysPastDue, paymentUrl } = data.data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 30px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 30px; }
        .urgent-box { background-color: #fee2e2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .consequences { background-color: white; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ URGENT PAYMENT REQUIRED</h1>
        </div>
        
        <div class="content">
          <p>Dear ${customerName},</p>
          
          <div class="urgent-box">
            <p style="margin: 0; font-size: 18px;"><strong>Your account is seriously past due!</strong></p>
            <p style="margin: 10px 0;">Invoice ${invoiceNumber}: <strong>$${amountDue}</strong></p>
            <p style="margin: 10px 0 0 0;">Now <strong>${daysPastDue} days</strong> overdue</p>
          </div>
          
          <div class="consequences">
            <p style="margin: 0;"><strong>Immediate consequences if not paid:</strong></p>
            <ul style="margin: 10px 0 0 0;">
              <li>Service interruption within 48 hours</li>
              <li>Late fees and penalties applied</li>
              <li>Account sent to collections</li>
              <li>Negative impact on business credit</li>
            </ul>
          </div>
          
          <p><strong>This is your second to last notice before we take further action.</strong></p>
          
          <div style="text-align: center;">
            <a href="${paymentUrl}" class="button">PAY NOW TO AVOID SERVICE INTERRUPTION</a>
          </div>
          
          <p>If you cannot pay the full amount, please call us immediately at 1-800-VIBELUX to make payment arrangements.</p>
          
          <p>Time is of the essence.</p>
          
          <p>VibeLux Collections Department</p>
        </div>
        
        <div class="footer">
          <p>VibeLux Energy | Collections Department</p>
          <p>URGENT: Call 1-800-VIBELUX ext. 2 | collections@vibelux.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateFinalNoticeEmail(data: CollectionNotificationData): string {
  const { customerName, invoiceNumber, amountDue, daysPastDue, paymentUrl, customerPortalUrl } = data.data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fee2e2; }
        .header { background-color: #991b1b; color: white; padding: 30px; text-align: center; }
        .content { background-color: white; padding: 30px; border: 3px solid #dc2626; }
        .final-notice { background-color: #991b1b; color: white; padding: 20px; text-align: center; margin: 20px -30px; }
        .button { display: inline-block; padding: 16px 32px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-size: 18px; font-weight: bold; }
        .deadline { background-color: #fef2f2; border: 2px dashed #dc2626; padding: 20px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; color: #374151; font-size: 14px; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">FINAL NOTICE</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">BEFORE LEGAL ACTION</p>
        </div>
        
        <div class="content">
          <p>Dear ${customerName},</p>
          
          <div class="final-notice">
            <p style="margin: 0; font-size: 24px; font-weight: bold;">THIS IS YOUR FINAL NOTICE</p>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Legal proceedings will begin if payment is not received</p>
          </div>
          
          <p style="font-size: 18px;"><strong>Despite multiple attempts to contact you, we have not received payment for:</strong></p>
          
          <div style="background-color: #fef2f2; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;">Invoice Number: <strong>${invoiceNumber}</strong></p>
            <p style="margin: 10px 0;">Amount Due: <strong style="font-size: 24px; color: #dc2626;">$${amountDue}</strong></p>
            <p style="margin: 10px 0 0 0;">Days Past Due: <strong style="color: #dc2626;">${daysPastDue} DAYS</strong></p>
          </div>
          
          <div class="deadline">
            <p style="margin: 0; font-size: 20px; font-weight: bold;">YOU HAVE 48 HOURS</p>
            <p style="margin: 10px 0 0 0;">to pay before your account is sent to our legal department</p>
          </div>
          
          <p><strong>FINAL OPPORTUNITY TO AVOID:</strong></p>
          <ul style="font-size: 16px;">
            <li>Legal action and court proceedings</li>
            <li>Additional legal fees and court costs</li>
            <li>Damage to your business credit rating</li>
            <li>Public record of legal judgment</li>
            <li>Asset liens and garnishments</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${paymentUrl}" class="button">PAY NOW - FINAL CHANCE</a>
          </div>
          
          <p style="background-color: #f3f4f6; padding: 15px; border-radius: 6px;">
            <strong>Payment Options:</strong><br>
            • Online: ${paymentUrl}<br>
            • Phone: 1-800-VIBELUX (24/7 automated system)<br>
            • Wire Transfer: Instructions at ${customerPortalUrl}
          </p>
          
          <p style="font-size: 14px; color: #6b7280;">
            If you believe this notice is in error or if you've already made payment, you must contact us immediately with proof of payment to prevent legal action.
          </p>
          
          <p><strong>This matter requires your immediate attention.</strong></p>
          
          <p>VibeLux Energy<br>
          Legal Collections Department</p>
        </div>
        
        <div class="footer">
          <p><strong>VibeLux Energy Legal Collections</strong></p>
          <p>1-800-VIBELUX ext. 9 | legal@vibelux.com</p>
          <p style="font-size: 12px;">This is an attempt to collect a debt. Any information obtained will be used for that purpose.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendPaymentMethodExpiredEmail(customer: any): Promise<void> {
  const msg = {
    to: customer.email,
    from: process.env.EMAIL_FROM!,
    subject: 'Action Required: Update Your Payment Method',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 30px; text-align: center; }
          .content { background-color: #f8f9fa; padding: 30px; }
          .alert-box { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Method Update Required</h1>
          </div>
          
          <div class="content">
            <p>Dear ${customer.name},</p>
            
            <div class="alert-box">
              <p style="margin: 0;"><strong>Your payment method on file has expired or is no longer valid.</strong></p>
            </div>
            
            <p>To ensure uninterrupted service and automatic payment processing, please update your payment information.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing/payment-methods" class="button">Update Payment Method</a>
            </div>
            
            <p>Thank you for your prompt attention to this matter.</p>
            
            <p>Best regards,<br>The VibeLux Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  
  await sgMail.send(msg);
}