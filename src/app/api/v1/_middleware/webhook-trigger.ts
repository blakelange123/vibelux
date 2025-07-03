import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

interface WebhookEvent {
  event: string;
  data: any;
  userId: string;
}

export async function triggerWebhooks(event: WebhookEvent) {
  try {
    // Find all active webhook subscriptions for this event
    const subscriptions = await prisma.usageRecord.findMany({
      where: {
        userId: event.userId,
        feature: 'webhook',
        action: 'subscription',
        metadata: {
          path: ['enabled'],
          equals: true
        }
      }
    });

    // Filter subscriptions that include this event
    const relevantSubscriptions = subscriptions.filter(sub => {
      const metadata = sub.metadata as any;
      return metadata.events && metadata.events.includes(event.event);
    });

    // Send webhooks in parallel
    const results = await Promise.allSettled(
      relevantSubscriptions.map(async (subscription) => {
        const metadata = subscription.metadata as any;
        const payload = {
          id: crypto.randomUUID(),
          event: event.event,
          data: event.data,
          timestamp: new Date().toISOString()
        };

        const signature = generateWebhookSignature(payload, metadata.secret);

        try {
          const response = await fetch(metadata.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Event': event.event,
              'X-Webhook-Signature': signature,
              'X-Webhook-ID': payload.id
            },
            body: JSON.stringify(payload)
          });

          // Log webhook delivery
          await prisma.usageRecord.create({
            data: {
              userId: event.userId,
              feature: 'webhook',
              action: 'delivery',
              metadata: {
                webhookId: metadata.id,
                event: event.event,
                status: response.ok ? 'success' : 'failed',
                statusCode: response.status,
                timestamp: new Date().toISOString()
              }
            }
          });

          if (!response.ok) {
            console.error(`Webhook delivery failed: ${response.status} to ${metadata.url}`);
          }

          return { success: response.ok, url: metadata.url, status: response.status };
        } catch (error) {
          // Log delivery failure
          await prisma.usageRecord.create({
            data: {
              userId: event.userId,
              feature: 'webhook',
              action: 'delivery',
              metadata: {
                webhookId: metadata.id,
                event: event.event,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
              }
            }
          });

          console.error('Webhook delivery error:', error);
          return { success: false, url: metadata.url, error };
        }
      })
    );

    return {
      sent: results.length,
      successful: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
      failed: results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length
    };
  } catch (error) {
    console.error('Error triggering webhooks:', error);
    return { sent: 0, successful: 0, failed: 0 };
  }
}

function generateWebhookSignature(payload: any, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

// Event type definitions
export const WebhookEvents = {
  // Alert events
  STRESS_DETECTED: 'alert.stress_detected',
  HEALTH_ISSUE: 'alert.health_issue',
  THRESHOLD_VIOLATION: 'alert.threshold_violation',
  
  // Status events
  STAGE_TRANSITION: 'status.stage_transition',
  HARVEST_READY: 'status.harvest_ready',
  
  // System events
  MAINTENANCE_REQUIRED: 'system.maintenance_required',
  
  // Compliance events
  AUDIT_DUE: 'compliance.audit_due'
} as const;

// Helper function to trigger specific events
export async function triggerStressAlert(userId: string, data: {
  plantId: string;
  stressType: string;
  severity: string;
  recommendations: string[];
}) {
  return triggerWebhooks({
    event: WebhookEvents.STRESS_DETECTED,
    userId,
    data
  });
}

export async function triggerHealthIssue(userId: string, data: {
  plantId: string;
  issue: string;
  severity: string;
  diagnosis: any;
  treatments: any[];
}) {
  return triggerWebhooks({
    event: WebhookEvents.HEALTH_ISSUE,
    userId,
    data
  });
}

export async function triggerThresholdViolation(userId: string, data: {
  sensorId: string;
  type: string;
  value: number;
  threshold: { min?: number; max?: number };
  timestamp: string;
}) {
  return triggerWebhooks({
    event: WebhookEvents.THRESHOLD_VIOLATION,
    userId,
    data
  });
}

export async function triggerStageTransition(userId: string, data: {
  cropId: string;
  fromStage: string;
  toStage: string;
  daysInStage: number;
  nextStageDate: string;
}) {
  return triggerWebhooks({
    event: WebhookEvents.STAGE_TRANSITION,
    userId,
    data
  });
}

export async function triggerHarvestReady(userId: string, data: {
  cropId: string;
  cropType: string;
  plantingDate: string;
  expectedYield: number;
  recommendations: string[];
}) {
  return triggerWebhooks({
    event: WebhookEvents.HARVEST_READY,
    userId,
    data
  });
}