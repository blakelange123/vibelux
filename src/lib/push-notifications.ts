// Push notification service for web and mobile
// This is a simplified implementation - in production, use a service like OneSignal, Firebase Cloud Messaging, or AWS SNS

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    // In production, you would:
    // 1. Look up user's push notification subscriptions from database
    // 2. Send to their registered devices via FCM/APNS/Web Push
    
    // For now, we'll use a webhook or queue
    const notificationData = {
      userId,
      ...payload,
      timestamp: new Date().toISOString()
    };

    // Option 1: Send to a notification queue (Redis, RabbitMQ, etc.)
    // await redis.lpush('notification_queue', JSON.stringify(notificationData));

    // Option 2: Send to a webhook service
    // await fetch(process.env.NOTIFICATION_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(notificationData)
    // });

    // Option 3: Use a third-party service
    if (process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_API_KEY) {
      return await sendViaOneSignal(userId, payload);
    }

    return true;
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
}

// Example OneSignal integration
async function sendViaOneSignal(
  userId: string,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_external_user_ids: [userId],
        headings: { en: payload.title },
        contents: { en: payload.body },
        data: payload.data,
        ios_badgeType: 'Increase',
        ios_badgeCount: 1,
        android_accent_color: '#6366f1',
        buttons: payload.actions,
        priority: payload.requireInteraction ? 10 : 5
      })
    });

    const result = await response.json();
    return response.ok;
  } catch (error) {
    console.error('OneSignal error:', error);
    return false;
  }
}

// Service worker registration helper
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

// Web Push subscription helper
export async function subscribeToPushNotifications(
  userId: string
): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });
    }

    // Save subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscription
      })
    });

    return subscription;
  } catch (error) {
    console.error('Push subscription error:', error);
    return null;
  }
}

// Helper function
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}