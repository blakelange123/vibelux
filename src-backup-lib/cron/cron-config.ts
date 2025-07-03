/**
 * Cron Job Configuration for Financial Automation
 * 
 * This file defines all scheduled tasks for the automated financial system.
 * Times are in UTC - adjust for your timezone as needed.
 */

export const cronJobs = [
  {
    name: 'monthly-invoice-generation',
    schedule: '0 7 1 * *', // 1st of month at 2AM EST (7AM UTC)
    endpoint: '/api/automation/invoice',
    method: 'POST',
    body: { type: 'MONTHLY_INVOICE_GENERATION' },
    description: 'Generate and send monthly invoices for all active revenue sharing agreements',
    retries: 3,
    timeout: 300000, // 5 minutes
  },
  {
    name: 'daily-payment-processing',
    schedule: '0 19 * * *', // Daily at 2PM EST (7PM UTC)
    endpoint: '/api/automation/payment',
    method: 'POST',
    body: { type: 'DAILY_PAYMENT_PROCESSING' },
    description: 'Process all scheduled payments via ACH/Card',
    retries: 3,
    timeout: 600000, // 10 minutes
  },
  {
    name: 'daily-collection-processing',
    schedule: '0 15 * * *', // Daily at 10AM EST (3PM UTC)
    endpoint: '/api/automation/collection',
    method: 'POST',
    body: { type: 'DAILY_COLLECTION_PROCESSING' },
    description: 'Process overdue invoices and send collection notices',
    retries: 2,
    timeout: 300000, // 5 minutes
  },
  {
    name: 'daily-utility-sync',
    schedule: '0 8 * * *', // Daily at 3AM EST (8AM UTC)
    endpoint: '/api/automation/utility-sync',
    method: 'POST',
    body: { type: 'DAILY_UTILITY_SYNC' },
    description: 'Sync latest utility bills from all connected accounts',
    retries: 3,
    timeout: 900000, // 15 minutes
  },
  {
    name: 'weekly-validation',
    schedule: '0 12 * * 1', // Mondays at 7AM EST (12PM UTC)
    endpoint: '/api/automation/validation',
    method: 'POST',
    body: { type: 'WEEKLY_VALIDATION_RUN' },
    description: 'Run third-party validation on high-value claims',
    retries: 2,
    timeout: 600000, // 10 minutes
  },
  {
    name: 'hourly-wire-monitoring',
    schedule: '0 * * * *', // Every hour
    endpoint: '/api/automation/payment',
    method: 'POST',
    body: { type: 'WIRE_MONITORING' },
    description: 'Check for incoming wire transfers',
    retries: 1,
    timeout: 60000, // 1 minute
  },
  {
    name: 'daily-weather-normalization',
    schedule: '0 10 * * *', // Daily at 5AM EST (10AM UTC)
    endpoint: '/api/automation/weather',
    method: 'POST',
    body: { type: 'DAILY_WEATHER_UPDATE' },
    description: 'Update weather data and recalculate normalizations',
    retries: 3,
    timeout: 300000, // 5 minutes
  },
  {
    name: 'monthly-affiliate-payout',
    schedule: '0 17 15 * *', // 15th of month at 12PM EST (5PM UTC)
    endpoint: '/api/automation/affiliate',
    method: 'POST',
    body: { type: 'MONTHLY_AFFILIATE_PAYOUT' },
    description: 'Process monthly affiliate commission payouts',
    retries: 3,
    timeout: 600000, // 10 minutes
  },
  {
    name: 'daily-trust-score-update',
    schedule: '0 6 * * *', // Daily at 1AM EST (6AM UTC)
    endpoint: '/api/automation/trust-score',
    method: 'POST',
    body: { type: 'DAILY_TRUST_UPDATE' },
    description: 'Update customer trust scores based on payment behavior',
    retries: 2,
    timeout: 300000, // 5 minutes
  },
  {
    name: 'weekly-baseline-update',
    schedule: '0 14 * * 0', // Sundays at 9AM EST (2PM UTC)
    endpoint: '/api/automation/baseline',
    method: 'POST',
    body: { type: 'WEEKLY_BASELINE_UPDATE' },
    description: 'Update facility baselines with latest data',
    retries: 2,
    timeout: 600000, // 10 minutes
  },
];

/**
 * Cron job monitoring configuration
 */
export const cronMonitoring = {
  slackWebhook: process.env.SLACK_CRON_WEBHOOK,
  emailAlerts: process.env.CRON_ALERT_EMAIL,
  healthcheckUrl: process.env.HEALTHCHECK_URL,
  
  // Alert if job fails more than this many times in a row
  failureThreshold: 3,
  
  // Alert if job takes longer than expected
  performanceThresholds: {
    'monthly-invoice-generation': 300000, // 5 minutes
    'daily-payment-processing': 600000, // 10 minutes
    'daily-utility-sync': 900000, // 15 minutes
  },
};

/**
 * Helper to get next run time for a cron expression
 */
export function getNextRunTime(cronExpression: string): Date {
  // This would use a cron parser library
  // For now, returning a placeholder
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

/**
 * Helper to validate cron expression
 */
export function isValidCronExpression(expression: string): boolean {
  // Basic validation
  const parts = expression.split(' ');
  return parts.length === 5;
}