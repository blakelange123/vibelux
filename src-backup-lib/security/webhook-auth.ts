/**
 * Webhook Authentication & Security
 * Verifies webhook signatures to ensure requests are authentic
 */

import crypto from 'crypto';

/**
 * Verify webhook signature using HMAC-SHA256
 */
export function verifyWebhookSignature(
  payload: string, 
  signature: string | null, 
  secret?: string
): boolean {
  if (!signature || !secret) {
    console.warn('Missing webhook signature or secret');
    return false;
  }

  // Remove 'sha256=' prefix if present
  const cleanSignature = signature.replace('sha256=', '');
  
  // Compute expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cleanSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Generate webhook signature for outgoing webhooks
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    const signatures = signature.split(',');
    
    for (const sig of signatures) {
      const [key, value] = sig.split('=');
      if (key === 'v1' && crypto.timingSafeEqual(
        Buffer.from(value, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Stripe webhook verification failed:', error);
    return false;
  }
}

/**
 * Rate limiting for webhook endpoints
 */
const webhookAttempts = new Map<string, { count: number; resetTime: number }>();

export function checkWebhookRateLimit(ip: string, maxAttempts = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const key = `webhook:${ip}`;
  const attempts = webhookAttempts.get(key) || { count: 0, resetTime: now + windowMs };
  
  if (now > attempts.resetTime) {
    // Reset window
    attempts.count = 1;
    attempts.resetTime = now + windowMs;
  } else {
    attempts.count++;
  }
  
  webhookAttempts.set(key, attempts);
  
  return attempts.count <= maxAttempts;
}