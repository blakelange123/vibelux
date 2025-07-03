import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/error-handler';
import { requireAuth } from '@/middleware/auth';
import { 
  getUserNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  getUnreadCount 
} from '@/lib/notifications';

/**
 * GET /api/notifications - Get user notifications
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  
  const result = await getUserNotifications({
    userId: user.id,
    page,
    limit,
    unreadOnly,
  });
  
  return NextResponse.json({
    success: true,
    data: result.notifications,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
    meta: {
      unreadCount: result.unreadCount,
    },
  });
});

/**
 * PUT /api/notifications - Mark notifications as read
 */
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  const body = await request.json();
  
  if (body.action === 'markAllRead') {
    await markAllNotificationsRead(user.id);
    
    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
    });
  }
  
  if (body.notificationId) {
    await markNotificationRead(body.notificationId, user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  }
  
  return NextResponse.json(
    { error: 'Invalid request' },
    { status: 400 }
  );
});

/**
 * GET /api/notifications/count - Get unread notification count
 */
export async function getUnreadCountEndpoint(request: NextRequest) {
  return withErrorHandler(async () => {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    const { user } = authResult;
    const count = await getUnreadCount(user.id);
    
    return NextResponse.json({
      success: true,
      data: { unreadCount: count },
    });
  })();
}