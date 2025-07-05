import { Resend } from 'resend';
import { prisma } from '@/lib/db';

// Initialize Resend lazily to avoid build-time errors
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  if (!resend) {
    // Return a mock instance for build time
    return {
      emails: {
        send: async () => ({ data: null, error: 'Resend API key not configured' })
      }
    } as any;
  }
  return resend;
}

interface ConsultationData {
  id: string;
  scheduledStart: Date;
  duration: number;
  objectives: string[];
  totalAmount: number;
  expert: {
    displayName: string;
    email: string;
  };
  client: {
    name: string;
    email: string;
  };
}

export class ConsultationEmailService {
  /**
   * Send email to expert when new consultation is requested
   */
  static async sendNewConsultationRequest(consultation: ConsultationData): Promise<void> {
    try {
      const { expert, client } = consultation;
      
      const formattedDate = consultation.scheduledStart.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const formattedTime = consultation.scheduledStart.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const dashboardUrl = `${process.env.NEXTAUTH_URL}/expert-dashboard`;
      const consultationUrl = `${process.env.NEXTAUTH_URL}/consultations/${consultation.id}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Consultation Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .consultation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5; }
            .objectives { background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .objectives ul { margin: 0; padding-left: 20px; }
            .cta-button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .cta-button:hover { background: #4338ca; }
            .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
            .urgent { background: #fef3c7; border-left-color: #f59e0b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔔 New Consultation Request</h1>
            <p>You have a new consultation booking from ${client.name}</p>
          </div>
          
          <div class="content">
            <p>Hello ${expert.displayName},</p>
            
            <p>Great news! You have received a new consultation request. Here are the details:</p>
            
            <div class="consultation-details">
              <h3>📅 Consultation Details</h3>
              <p><strong>Client:</strong> ${client.name}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              <p><strong>Duration:</strong> ${consultation.duration / 60} hour${consultation.duration > 60 ? 's' : ''}</p>
              <p><strong>Total Value:</strong> $${consultation.totalAmount.toFixed(2)} (You earn: $${(consultation.totalAmount * 0.9).toFixed(2)})</p>
            </div>
            
            ${consultation.objectives.length > 0 ? `
            <div class="objectives">
              <h4>🎯 Client Objectives:</h4>
              <ul>
                ${consultation.objectives.map(obj => `<li>${obj}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${consultationUrl}" class="cta-button">Review & Approve Request</a>
              <a href="${dashboardUrl}" class="cta-button" style="background: #059669;">Go to Dashboard</a>
            </div>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #0369a1;">⏰ Action Required</h4>
              <p style="margin: 0; font-size: 14px;">Please review and respond to this consultation request within 24 hours. Auto-approval is ${expert.autoApprove ? 'enabled' : 'disabled'} for your account.</p>
            </div>
            
            <p>Questions about this consultation? Reply to this email or contact our support team.</p>
            
            <p>Best regards,<br>The VibeLux Team</p>
          </div>
          
          <div class="footer">
            <p>VibeLux Expert Platform | <a href="${process.env.NEXTAUTH_URL}/expert-dashboard/settings">Manage Email Preferences</a></p>
            <p>This email was sent because you have email notifications enabled for new bookings.</p>
          </div>
        </body>
        </html>
      `;

      await getResend().emails.send({
        from: 'VibeLux Platform <noreply@vibelux.com>',
        to: expert.email,
        subject: `🔔 New Consultation Request from ${client.name} - $${consultation.totalAmount.toFixed(2)}`,
        html: emailHtml,
        headers: {
          'X-Priority': '2',
          'X-MSMail-Priority': 'High'
        }
      });

      // Log email sent
      await this.logEmailSent(expert.email, 'consultation_request', consultation.id);

    } catch (error) {
      console.error('Error sending consultation request email:', error);
      // Don't throw - email failure shouldn't break the booking process
    }
  }

  /**
   * Send confirmation email to client when consultation is booked
   */
  static async sendConsultationConfirmation(consultation: ConsultationData): Promise<void> {
    try {
      const { expert, client } = consultation;
      
      const formattedDate = consultation.scheduledStart.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const formattedTime = consultation.scheduledStart.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const consultationUrl = `${process.env.NEXTAUTH_URL}/consultations/${consultation.id}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Consultation Booking Confirmed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .consultation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
            .expert-info { background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .cta-button:hover { background: #047857; }
            .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Consultation Confirmed!</h1>
            <p>Your consultation with ${expert.displayName} is confirmed</p>
          </div>
          
          <div class="content">
            <p>Hello ${client.name},</p>
            
            <p>Great news! Your consultation has been successfully booked and confirmed. Here are your consultation details:</p>
            
            <div class="consultation-details">
              <h3>📅 Your Consultation</h3>
              <p><strong>Expert:</strong> ${expert.displayName}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              <p><strong>Duration:</strong> ${consultation.duration / 60} hour${consultation.duration > 60 ? 's' : ''}</p>
              <p><strong>Total Paid:</strong> $${consultation.totalAmount.toFixed(2)}</p>
            </div>
            
            <div class="expert-info">
              <h4>👨‍🌾 About Your Expert</h4>
              <p>${expert.displayName} will be conducting your consultation. They are a verified expert on our platform with extensive experience in their field.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${consultationUrl}" class="cta-button">Join Consultation Room</a>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #92400e;">📋 Before Your Consultation</h4>
              <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                <li>Test your camera and microphone</li>
                <li>Prepare any questions or materials you want to discuss</li>
                <li>Join the consultation room 5 minutes early</li>
                <li>Ensure you have a stable internet connection</li>
              </ul>
            </div>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #0369a1;">💡 Important Notes</h4>
              <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                <li>You'll only be charged for the actual time spent in consultation</li>
                <li>Unused time will be automatically refunded</li>
                <li>All consultations are conducted through our secure platform</li>
                <li>Sessions may be recorded for quality and dispute resolution</li>
              </ul>
            </div>
            
            <p>Need to reschedule or have questions? Contact us at support@vibelux.com or visit your consultation page.</p>
            
            <p>We're excited to help you succeed!</p>
            
            <p>Best regards,<br>The VibeLux Team</p>
          </div>
          
          <div class="footer">
            <p>VibeLux | <a href="${consultationUrl}">View Consultation Details</a></p>
            <p>Consultation ID: ${consultation.id}</p>
          </div>
        </body>
        </html>
      `;

      await getResend().emails.send({
        from: 'VibeLux Platform <noreply@vibelux.com>',
        to: client.email,
        subject: `✅ Consultation Confirmed with ${expert.displayName} - ${formattedDate}`,
        html: emailHtml
      });

      // Log email sent
      await this.logEmailSent(client.email, 'consultation_confirmation', consultation.id);

    } catch (error) {
      console.error('Error sending consultation confirmation email:', error);
    }
  }

  /**
   * Send reminder email 24 hours before consultation
   */
  static async sendConsultationReminder(consultation: ConsultationData): Promise<void> {
    try {
      const { expert, client } = consultation;
      
      const formattedDate = consultation.scheduledStart.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const formattedTime = consultation.scheduledStart.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const consultationUrl = `${process.env.NEXTAUTH_URL}/consultations/${consultation.id}/room`;

      // Send to both expert and client
      const recipients = [
        { email: expert.email, name: expert.displayName, role: 'expert' },
        { email: client.email, name: client.name, role: 'client' }
      ];

      for (const recipient of recipients) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Consultation Reminder - Tomorrow</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .consultation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
              .cta-button:hover { background: #d97706; }
              .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>⏰ Consultation Tomorrow</h1>
              <p>Your consultation is scheduled for tomorrow</p>
            </div>
            
            <div class="content">
              <p>Hello ${recipient.name},</p>
              
              <p>This is a friendly reminder that you have a consultation scheduled for tomorrow:</p>
              
              <div class="consultation-details">
                <h3>📅 Consultation Details</h3>
                <p><strong>${recipient.role === 'expert' ? 'Client' : 'Expert'}:</strong> ${recipient.role === 'expert' ? client.name : expert.displayName}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Duration:</strong> ${consultation.duration / 60} hour${consultation.duration > 60 ? 's' : ''}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${consultationUrl}" class="cta-button">${recipient.role === 'expert' ? 'Prepare for Session' : 'Join Consultation Room'}</a>
              </div>
              
              <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">📋 Preparation Checklist</h4>
                <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                  <li>Test your camera and microphone</li>
                  <li>Ensure stable internet connection</li>
                  <li>Prepare any materials or questions</li>
                  <li>Join 5 minutes early</li>
                </ul>
              </div>
              
              <p>Need to reschedule? Please contact us at least 24 hours in advance.</p>
              
              <p>Best regards,<br>The VibeLux Team</p>
            </div>
            
            <div class="footer">
              <p>VibeLux | <a href="${consultationUrl}">Join Consultation</a></p>
            </div>
          </body>
          </html>
        `;

        await getResend().emails.send({
          from: 'VibeLux Platform <noreply@vibelux.com>',
          to: recipient.email,
          subject: `⏰ Consultation Reminder - Tomorrow at ${formattedTime}`,
          html: emailHtml
        });

        await this.logEmailSent(recipient.email, 'consultation_reminder', consultation.id);
      }

    } catch (error) {
      console.error('Error sending consultation reminder emails:', error);
    }
  }

  /**
   * Send email when consultation is approved by expert
   */
  static async sendConsultationApproved(consultation: ConsultationData): Promise<void> {
    try {
      const { expert, client } = consultation;
      const consultationUrl = `${process.env.NEXTAUTH_URL}/consultations/${consultation.id}/room`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Consultation Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .cta-button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Consultation Approved!</h1>
            <p>${expert.displayName} has approved your consultation request</p>
          </div>
          
          <div class="content">
            <p>Hello ${client.name},</p>
            
            <p>Great news! ${expert.displayName} has approved your consultation request. Your session is now confirmed and ready to go.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${consultationUrl}" class="cta-button">View Consultation Details</a>
            </div>
            
            <p>You'll receive a reminder email 24 hours before your scheduled consultation.</p>
            
            <p>Best regards,<br>The VibeLux Team</p>
          </div>
        </body>
        </html>
      `;

      await getResend().emails.send({
        from: 'VibeLux Platform <noreply@vibelux.com>',
        to: client.email,
        subject: `🎉 Your consultation with ${expert.displayName} has been approved!`,
        html: emailHtml
      });

      await this.logEmailSent(client.email, 'consultation_approved', consultation.id);

    } catch (error) {
      console.error('Error sending consultation approved email:', error);
    }
  }

  /**
   * Log email sent for tracking and compliance
   */
  private static async logEmailSent(
    recipient: string,
    type: string,
    consultationId: string
  ): Promise<void> {
    try {
      await prisma.emailLog.create({
        data: {
          recipient,
          type,
          consultationId,
          sentAt: new Date(),
          status: 'sent'
        }
      });
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }

  /**
   * Schedule consultation reminder emails
   */
  static async scheduleReminders(consultation: ConsultationData): Promise<void> {
    // In production, use a job queue like Bull/BullMQ or AWS SQS
    // For now, we'll use a simple setTimeout (not recommended for production)
    
    const reminderTime = new Date(consultation.scheduledStart);
    reminderTime.setDate(reminderTime.getDate() - 1); // 24 hours before
    
    const timeUntilReminder = reminderTime.getTime() - Date.now();
    
    if (timeUntilReminder > 0 && timeUntilReminder < 7 * 24 * 60 * 60 * 1000) { // Within 7 days
      setTimeout(() => {
        this.sendConsultationReminder(consultation);
      }, timeUntilReminder);
    }
  }
}