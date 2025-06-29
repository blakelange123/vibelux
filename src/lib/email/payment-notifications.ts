/**
 * Payment Notification Service
 * Sends email notifications for payment events
 */

import nodemailer from 'nodemailer';
import { render } from '@react-email/render';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface PaymentNotificationData {
  customerEmail: string;
  customerName: string;
  amount: number;
  invoiceNumber: string;
  dueDate: Date;
  paymentMethod?: string;
  transactionId?: string;
}

interface PaymentFailedDetails {
  amount: string;
  currency: string;
  attemptCount: number;
  nextRetryDate: string | null;
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentNotification(
  type: 'confirmation' | 'failed' | 'reminder' | 'overdue',
  data: PaymentNotificationData
): Promise<boolean> {
  try {
    const emailContent = generateEmailContent(type, data);
    
    // Send actual email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"VibeLux" <noreply@vibelux.com>',
      to: data.customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    // Email send debug info would be logged here

    return true;
  } catch (error) {
    console.error('Failed to send payment notification:', error);
    // In production, log to error tracking service
    return false;
  }
}

/**
 * Generate email content based on notification type
 */
function generateEmailContent(
  type: string,
  data: PaymentNotificationData
): { subject: string; html: string; text: string } {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  switch (type) {
    case 'confirmation':
      return {
        subject: `Payment Confirmed - Invoice ${data.invoiceNumber}`,
        html: `
          <h2>Payment Confirmation</h2>
          <p>Dear ${data.customerName},</p>
          <p>We've successfully received your payment of <strong>${formatCurrency(data.amount)}</strong> for invoice ${data.invoiceNumber}.</p>
          <p><strong>Transaction Details:</strong></p>
          <ul>
            <li>Amount: ${formatCurrency(data.amount)}</li>
            <li>Invoice: ${data.invoiceNumber}</li>
            <li>Payment Method: ${data.paymentMethod || 'N/A'}</li>
            <li>Transaction ID: ${data.transactionId || 'N/A'}</li>
          </ul>
          <p>Thank you for your business!</p>
          <p>Best regards,<br>The Vibelux Team</p>
        `,
        text: `Payment Confirmation - We've received your payment of ${formatCurrency(data.amount)} for invoice ${data.invoiceNumber}. Transaction ID: ${data.transactionId || 'N/A'}`
      };

    case 'failed':
      return {
        subject: `Payment Failed - Invoice ${data.invoiceNumber}`,
        html: `
          <h2>Payment Failed</h2>
          <p>Dear ${data.customerName},</p>
          <p>We were unable to process your payment of <strong>${formatCurrency(data.amount)}</strong> for invoice ${data.invoiceNumber}.</p>
          <p>Please update your payment method or contact us for assistance.</p>
          <p><a href="/billing/payment-methods">Update Payment Method</a></p>
          <p>Best regards,<br>The Vibelux Team</p>
        `,
        text: `Payment Failed - Unable to process payment of ${formatCurrency(data.amount)} for invoice ${data.invoiceNumber}. Please update your payment method.`
      };

    case 'reminder':
      return {
        subject: `Payment Reminder - Invoice ${data.invoiceNumber}`,
        html: `
          <h2>Payment Reminder</h2>
          <p>Dear ${data.customerName},</p>
          <p>This is a friendly reminder that payment of <strong>${formatCurrency(data.amount)}</strong> for invoice ${data.invoiceNumber} is due on ${data.dueDate.toLocaleDateString()}.</p>
          <p><a href="/billing/pay-invoice/${data.invoiceNumber}">Pay Now</a></p>
          <p>Best regards,<br>The Vibelux Team</p>
        `,
        text: `Payment Reminder - Payment of ${formatCurrency(data.amount)} for invoice ${data.invoiceNumber} is due on ${data.dueDate.toLocaleDateString()}.`
      };

    case 'overdue':
      return {
        subject: `Overdue Payment - Invoice ${data.invoiceNumber}`,
        html: `
          <h2>Overdue Payment Notice</h2>
          <p>Dear ${data.customerName},</p>
          <p>Payment of <strong>${formatCurrency(data.amount)}</strong> for invoice ${data.invoiceNumber} is now overdue.</p>
          <p>Please make payment immediately to avoid service interruption.</p>
          <p><a href="/billing/pay-invoice/${data.invoiceNumber}">Pay Now</a></p>
          <p>If you have questions, please contact our billing department.</p>
          <p>Best regards,<br>The Vibelux Team</p>
        `,
        text: `Overdue Payment - Payment of ${formatCurrency(data.amount)} for invoice ${data.invoiceNumber} is overdue. Please pay immediately.`
      };

    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

/**
 * Send subscription cancellation email
 */
export async function sendSubscriptionCancellationEmail(
  email: string,
  customerName: string
): Promise<void> {
  const subject = 'Your VibeLux Subscription Has Been Canceled';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Canceled</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            
            <p>We're sorry to see you go. Your VibeLux subscription has been successfully canceled.</p>
            
            <h3>What this means:</h3>
            <ul>
              <li>Your account has been downgraded to the Free plan</li>
              <li>You'll retain access to basic features</li>
              <li>Your data will be preserved for 90 days</li>
              <li>You can reactivate your subscription anytime</li>
            </ul>
            
            <p>If you canceled by mistake or would like to reactivate your subscription:</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/billing" class="button">
                Manage Subscription
              </a>
            </center>
            
            <p>We'd love to hear your feedback on how we can improve VibeLux.</p>
            
            <p>Thank you for being part of our community!</p>
            
            <p>Best regards,<br>The VibeLux Team</p>
          </div>
          <div class="footer">
            <p>VibeLux • Optimizing Controlled Environment Agriculture</p>
            <p>© ${new Date().getFullYear()} VibeLux. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"VibeLux" <noreply@vibelux.com>',
      to: email,
      subject,
      html,
    });
    
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    // In production, log to error tracking service
  }
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(
  email: string,
  customerName: string,
  details: PaymentFailedDetails
): Promise<void> {
  const subject = 'Payment Failed - Action Required';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .alert { background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Failed</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            
            <div class="alert">
              <strong>⚠️ Your payment of ${details.currency} ${details.amount} could not be processed.</strong>
            </div>
            
            <p>We were unable to process your subscription payment. This was attempt #${details.attemptCount}.</p>
            
            ${details.nextRetryDate ? `
              <p><strong>Next retry:</strong> We'll automatically retry the payment on ${details.nextRetryDate}.</p>
            ` : `
              <p><strong>Important:</strong> After 3 failed attempts, your subscription may be suspended.</p>
            `}
            
            <h3>What you can do:</h3>
            <ul>
              <li>Update your payment method</li>
              <li>Ensure your card hasn't expired</li>
              <li>Check that you have sufficient funds</li>
              <li>Contact your bank if the issue persists</li>
            </ul>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/billing" class="button">
                Update Payment Method
              </a>
            </center>
            
            <p>If you need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Thank you,<br>The VibeLux Team</p>
          </div>
          <div class="footer">
            <p>VibeLux • Optimizing Controlled Environment Agriculture</p>
            <p>© ${new Date().getFullYear()} VibeLux. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"VibeLux" <noreply@vibelux.com>',
      to: email,
      subject,
      html,
    });
    
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    // In production, log to error tracking service
  }
}