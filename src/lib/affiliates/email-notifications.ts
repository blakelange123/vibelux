/**
 * Affiliate Email Notification System
 * Handles all email communications for the affiliate program
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface AffiliateEmailData {
  affiliateName: string;
  affiliateEmail: string;
  affiliateCode: string;
  companyName?: string;
}

/**
 * Email Templates
 */
export const emailTemplates = {
  welcome: (data: AffiliateEmailData & { dashboardUrl: string }): EmailTemplate => ({
    subject: 'Welcome to Vibelux Affiliate Program! 🌱',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Vibelux Affiliates</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Vibelux Affiliates!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.affiliateName},</p>
      
      <p>Congratulations! You're now part of the Vibelux Affiliate Program. We're excited to have you join our mission to revolutionize agricultural lighting.</p>
      
      <div class="stats">
        <h3>Your Affiliate Details:</h3>
        <p><strong>Affiliate Code:</strong> ${data.affiliateCode}</p>
        <p><strong>Commission Structure:</strong> 35% → 8% (Smart Declining)</p>
        <p><strong>Cookie Duration:</strong> 30 days</p>
        <p><strong>Starting Tier:</strong> Bronze</p>
      </div>
      
      <p><strong>What's Next?</strong></p>
      <ul>
        <li>Complete your Stripe Connect onboarding for payments</li>
        <li>Get your unique affiliate links from the dashboard</li>
        <li>Start promoting Vibelux to earn commissions</li>
        <li>Track your performance in real-time</li>
      </ul>
      
      <center>
        <a href="${data.dashboardUrl}" class="button">Go to Your Dashboard</a>
      </center>
      
      <p>Need help getting started? Check out our affiliate resources or reply to this email.</p>
      
      <p>Here's to growing together! 🌿</p>
      
      <p>Best regards,<br>The Vibelux Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Vibelux. All rights reserved.</p>
      <p>Questions? Email us at affiliates@vibelux.com</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Welcome to Vibelux Affiliates!

Hi ${data.affiliateName},

Congratulations! You're now part of the Vibelux Affiliate Program. We're excited to have you join our mission to revolutionize agricultural lighting.

Your Affiliate Details:
- Affiliate Code: ${data.affiliateCode}
- Commission Structure: 35% → 8% (Smart Declining)
- Cookie Duration: 30 days
- Starting Tier: Bronze

What's Next?
1. Complete your Stripe Connect onboarding for payments
2. Get your unique affiliate links from the dashboard
3. Start promoting Vibelux to earn commissions
4. Track your performance in real-time

Access your dashboard: ${data.dashboardUrl}

Need help getting started? Reply to this email.

Here's to growing together! 🌿

Best regards,
The Vibelux Team
    `
  }),

  newReferral: (data: AffiliateEmailData & { 
    customerName: string;
    subscriptionTier: string;
    commissionAmount: number;
    commissionRate: number;
  }): EmailTemplate => ({
    subject: '🎉 New Customer Referral - You Earned a Commission!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .success-box { background: #10B981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .commission-box { background: #F3F4F6; padding: 25px; border-radius: 8px; margin: 20px 0; }
    .amount { font-size: 36px; font-weight: bold; color: #8B5CF6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-box">
      <h2>Great News, ${data.affiliateName}! 🎊</h2>
      <p>A customer you referred just signed up!</p>
    </div>
    
    <div class="commission-box">
      <center>
        <p>You earned:</p>
        <div class="amount">$${data.commissionAmount.toFixed(2)}</div>
        <p>${data.commissionRate}% commission</p>
      </center>
    </div>
    
    <h3>Referral Details:</h3>
    <ul>
      <li><strong>Customer:</strong> ${data.customerName}</li>
      <li><strong>Plan:</strong> ${data.subscriptionTier}</li>
      <li><strong>Your Code:</strong> ${data.affiliateCode}</li>
    </ul>
    
    <p>This commission will be included in your next payout. As this customer continues their subscription, you'll earn recurring commissions based on our smart declining structure.</p>
    
    <p>Keep up the amazing work! 🚀</p>
    
    <p>Best regards,<br>The Vibelux Team</p>
  </div>
</body>
</html>
    `,
    text: `
Great News, ${data.affiliateName}! 🎊

A customer you referred just signed up!

You earned: $${data.commissionAmount.toFixed(2)}
Commission rate: ${data.commissionRate}%

Referral Details:
- Customer: ${data.customerName}
- Plan: ${data.subscriptionTier}
- Your Code: ${data.affiliateCode}

This commission will be included in your next payout. As this customer continues their subscription, you'll earn recurring commissions based on our smart declining structure.

Keep up the amazing work! 🚀

Best regards,
The Vibelux Team
    `
  }),

  payoutProcessed: (data: AffiliateEmailData & {
    payoutAmount: number;
    payoutPeriod: string;
    commissionsCount: number;
    nextPayoutDate: string;
  }): EmailTemplate => ({
    subject: '💰 Your Affiliate Payout Has Been Sent!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .payout-box { background: #8B5CF6; color: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .amount { font-size: 48px; font-weight: bold; }
    .details-box { background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="payout-box">
      <p>Payout Sent!</p>
      <div class="amount">$${data.payoutAmount.toFixed(2)}</div>
      <p>For ${data.payoutPeriod}</p>
    </div>
    
    <div class="details-box">
      <h3>Payout Details:</h3>
      <ul>
        <li><strong>Commissions Included:</strong> ${data.commissionsCount}</li>
        <li><strong>Payment Method:</strong> Stripe Direct Deposit</li>
        <li><strong>Processing Time:</strong> 2-5 business days</li>
        <li><strong>Next Payout:</strong> ${data.nextPayoutDate}</li>
      </ul>
    </div>
    
    <p>Thank you for being a valuable partner! Your efforts in promoting Vibelux are making a real difference in sustainable agriculture.</p>
    
    <p>You can view detailed payout information in your affiliate dashboard.</p>
    
    <p>Best regards,<br>The Vibelux Team</p>
  </div>
</body>
</html>
    `,
    text: `
Payout Sent!

$${data.payoutAmount.toFixed(2)}
For ${data.payoutPeriod}

Payout Details:
- Commissions Included: ${data.commissionsCount}
- Payment Method: Stripe Direct Deposit
- Processing Time: 2-5 business days
- Next Payout: ${data.nextPayoutDate}

Thank you for being a valuable partner! Your efforts in promoting Vibelux are making a real difference in sustainable agriculture.

You can view detailed payout information in your affiliate dashboard.

Best regards,
The Vibelux Team
    `
  }),

  tierUpgrade: (data: AffiliateEmailData & {
    oldTier: string;
    newTier: string;
    newBenefits: string[];
  }): EmailTemplate => ({
    subject: '🎖️ Congratulations! You\'ve Been Upgraded to ${data.newTier} Tier!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .celebration { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .tier-badge { font-size: 72px; margin: 20px 0; }
    .benefits { background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="celebration">
      <div class="tier-badge">
        ${data.newTier === 'Silver' ? '🥈' : '🥇'}
      </div>
      <h1>You're Now ${data.newTier} Tier!</h1>
      <p>Your dedication has paid off!</p>
    </div>
    
    <p>Hi ${data.affiliateName},</p>
    
    <p>Amazing news! Based on your outstanding performance, you've been upgraded from ${data.oldTier} to ${data.newTier} tier!</p>
    
    <div class="benefits">
      <h3>Your New Benefits:</h3>
      <ul>
        ${data.newBenefits.map(benefit => `<li>${benefit}</li>`).join('')}
      </ul>
    </div>
    
    <p>Keep up the exceptional work! The next tier is within reach.</p>
    
    <p>Best regards,<br>The Vibelux Team</p>
  </div>
</body>
</html>
    `,
    text: `
Congratulations! You're Now ${data.newTier} Tier!

Hi ${data.affiliateName},

Amazing news! Based on your outstanding performance, you've been upgraded from ${data.oldTier} to ${data.newTier} tier!

Your New Benefits:
${data.newBenefits.map(benefit => `- ${benefit}`).join('\n')}

Keep up the exceptional work! The next tier is within reach.

Best regards,
The Vibelux Team
    `
  }),

  monthlyReport: (data: AffiliateEmailData & {
    month: string;
    totalEarnings: number;
    newReferrals: number;
    activeCustomers: number;
    conversionRate: number;
    topPerformingLink: string;
  }): EmailTemplate => ({
    subject: `📊 Your ${data.month} Affiliate Performance Report`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8B5CF6; color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .stat-box { background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; color: #8B5CF6; }
    .stat-label { color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Your ${data.month} Performance</h2>
    </div>
    
    <p>Hi ${data.affiliateName},</p>
    
    <p>Here's your monthly affiliate performance summary:</p>
    
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-number">$${data.totalEarnings.toFixed(2)}</div>
        <div class="stat-label">Total Earnings</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${data.newReferrals}</div>
        <div class="stat-label">New Referrals</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${data.activeCustomers}</div>
        <div class="stat-label">Active Customers</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${data.conversionRate}%</div>
        <div class="stat-label">Conversion Rate</div>
      </div>
    </div>
    
    <p><strong>Top Performing Link:</strong> ${data.topPerformingLink}</p>
    
    <p>Great work this month! View your detailed analytics in the affiliate dashboard for more insights.</p>
    
    <p>Best regards,<br>The Vibelux Team</p>
  </div>
</body>
</html>
    `,
    text: `
Your ${data.month} Performance Report

Hi ${data.affiliateName},

Here's your monthly affiliate performance summary:

Total Earnings: $${data.totalEarnings.toFixed(2)}
New Referrals: ${data.newReferrals}
Active Customers: ${data.activeCustomers}
Conversion Rate: ${data.conversionRate}%

Top Performing Link: ${data.topPerformingLink}

Great work this month! View your detailed analytics in the affiliate dashboard for more insights.

Best regards,
The Vibelux Team
    `
  })
};

/**
 * Email sending service interface
 * This would integrate with your preferred email provider (SendGrid, Postmark, etc.)
 */
export interface EmailService {
  send(to: string, template: EmailTemplate): Promise<void>;
}

/**
 * Mock email service for development
 */
export class MockEmailService implements EmailService {
  async send(to: string, template: EmailTemplate): Promise<void> {
    // Mock email send would be logged here
  }
}

/**
 * SendGrid email service implementation
 */
export class SendGridEmailService implements EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor(apiKey: string, fromEmail: string = 'affiliates@vibelux.com', fromName: string = 'Vibelux Affiliates') {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  async send(to: string, template: EmailTemplate): Promise<void> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: this.fromEmail, name: this.fromName },
        subject: template.subject,
        content: [
          { type: 'text/html', value: template.html },
          ...(template.text ? [{ type: 'text/plain', value: template.text }] : [])
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
  }
}

/**
 * Email notification manager
 */
export class AffiliateEmailNotifications {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  async sendWelcomeEmail(affiliate: AffiliateEmailData & { dashboardUrl: string }): Promise<void> {
    const template = emailTemplates.welcome(affiliate);
    await this.emailService.send(affiliate.affiliateEmail, template);
  }

  async sendNewReferralEmail(data: Parameters<typeof emailTemplates.newReferral>[0]): Promise<void> {
    const template = emailTemplates.newReferral(data);
    await this.emailService.send(data.affiliateEmail, template);
  }

  async sendPayoutEmail(data: Parameters<typeof emailTemplates.payoutProcessed>[0]): Promise<void> {
    const template = emailTemplates.payoutProcessed(data);
    await this.emailService.send(data.affiliateEmail, template);
  }

  async sendTierUpgradeEmail(data: Parameters<typeof emailTemplates.tierUpgrade>[0]): Promise<void> {
    const template = emailTemplates.tierUpgrade(data);
    await this.emailService.send(data.affiliateEmail, template);
  }

  async sendMonthlyReportEmail(data: Parameters<typeof emailTemplates.monthlyReport>[0]): Promise<void> {
    const template = emailTemplates.monthlyReport(data);
    await this.emailService.send(data.affiliateEmail, template);
  }
}

// Factory function to create email service based on environment
export function createEmailService(): EmailService {
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    return new SendGridEmailService(process.env.SENDGRID_API_KEY);
  }
  
  // Use mock service in development or when SendGrid is not configured
  return new MockEmailService();
}

// Export singleton instance
export const affiliateEmailNotifications = new AffiliateEmailNotifications(createEmailService());