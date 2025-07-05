import { db } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export type NotificationType = 
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'investment_update'
  | 'facility_alert'
  | 'system_update'
  | 'payment_received'
  | 'new_referral'
  | 'experiment_complete'
  | 'threshold_alert';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  expiresAt?: Date;
}): Promise<Notification> {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data,
      expiresAt: params.expiresAt,
      read: false,
    },
  });
  
  // Send real-time notification if user is online
  await sendRealtimeNotification(params.userId, notification);
  
  // Send email notification if enabled
  await sendEmailNotificationIfEnabled(params.userId, notification);
  
  return notification;
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(params: {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}): Promise<void> {
  const notifications = params.userIds.map(userId => ({
    userId,
    type: params.type,
    title: params.title,
    message: params.message,
    data: params.data,
    read: false,
  }));
  
  await prisma.notification.createMany({
    data: notifications,
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await prisma.notification.update({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: {
      userId,
      read: false,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });
}

/**
 * Get user notifications with pagination
 */
export async function getUserNotifications(params: {
  userId: string;
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<{
  notifications: Notification[];
  total: number;
  unreadCount: number;
}> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;
  
  const where: any = {
    userId: params.userId,
    OR: [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ],
  };
  
  if (params.unreadOnly) {
    where.read = false;
  }
  
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    getUnreadCount(params.userId),
  ]);
  
  return {
    notifications,
    total,
    unreadCount,
  };
}

/**
 * Delete old notifications
 */
export async function cleanupOldNotifications(): Promise<void> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await prisma.notification.deleteMany({
    where: {
      OR: [
        { createdAt: { lt: thirtyDaysAgo } },
        { expiresAt: { lt: new Date() } },
      ],
    },
  });
}

/**
 * Notification templates
 */
export const NotificationTemplates = {
  investmentUpdate: (opportunityTitle: string, update: string) => ({
    type: 'investment_update' as NotificationType,
    title: 'Investment Update',
    message: `${opportunityTitle}: ${update}`,
  }),
  
  newInvestment: (investorName: string, amount: number) => ({
    type: 'investment_update' as NotificationType,
    title: 'New Investment Received',
    message: `${investorName} invested $${amount.toLocaleString()}`,
  }),
  
  facilityAlert: (alertType: string, message: string) => ({
    type: 'facility_alert' as NotificationType,
    title: `Facility Alert: ${alertType}`,
    message,
  }),
  
  thresholdAlert: (metric: string, value: number, threshold: number) => ({
    type: 'threshold_alert' as NotificationType,
    title: 'Threshold Alert',
    message: `${metric} (${value}) exceeded threshold (${threshold})`,
  }),
  
  paymentReceived: (amount: number, source: string) => ({
    type: 'payment_received' as NotificationType,
    title: 'Payment Received',
    message: `$${amount.toLocaleString()} received from ${source}`,
  }),
  
  newReferral: (referralEmail: string) => ({
    type: 'new_referral' as NotificationType,
    title: 'New Referral',
    message: `${referralEmail} signed up using your referral link`,
  }),
  
  experimentComplete: (experimentName: string) => ({
    type: 'experiment_complete' as NotificationType,
    title: 'Experiment Complete',
    message: `${experimentName} has completed. View results now.`,
  }),
};

/**
 * Send real-time notification (WebSocket/SSE)
 */
async function sendRealtimeNotification(
  userId: string,
  notification: Notification
): Promise<void> {
  // Send WebSocket notification to connected clients
  try {
    const { emitRealtimeEvent, getUserChannel } = await import('@/lib/realtime-service');
    await emitRealtimeEvent(getUserChannel(userId), 'notification_new', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // WebSocket service may not be available
  }
}

/**
 * Send email notification if user has enabled them
 */
async function sendEmailNotificationIfEnabled(
  userId: string,
  notification: Notification
): Promise<void> {
  const user = await db.users.findUnique(userId);
  if (!user || !user.email) return;
  
  // Check user preferences
  const preferences = user.settings?.notifications || {};
  
  // Map notification types to email preferences
  const shouldSendEmail = {
    investment_update: preferences.investmentUpdates !== false,
    facility_alert: preferences.facilityAlerts !== false,
    threshold_alert: preferences.thresholdAlerts !== false,
    payment_received: preferences.payments !== false,
    new_referral: preferences.referrals !== false,
    experiment_complete: preferences.experiments !== false,
    system_update: preferences.systemUpdates !== false,
    success: false,
    error: false,
    warning: false,
    info: false,
  }[notification.type];
  
  if (shouldSendEmail) {
    // TODO: Queue email notification
  }
}

/**
 * Send notification - alias for createNotification for backward compatibility
 */
export async function sendNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  expiresAt?: Date;
}): Promise<Notification> {
  return createNotification(params);
}