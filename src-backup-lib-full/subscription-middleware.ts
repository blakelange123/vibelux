import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { hasFeatureAccess } from './stripe';

// Define protected routes and their required features
const PROTECTED_ROUTES: Record<string, string> = {
  '/api/ai-design-chat': 'aiAssistant',
  '/api/export': 'advancedExport',
  '/api/v1/controls': 'advancedControls',
  '/cultivation': 'advancedCultivation',
  '/analytics': 'advancedAnalytics',
  '/multi-site': 'multiSite',
  '/api/collaboration': 'collaboration'
};

// Routes that require specific plan levels
const PLAN_ROUTES: Record<string, string[]> = {
  '/enterprise': ['enterprise'],
  '/business': ['business', 'enterprise'],
  '/professional': ['professional', 'business', 'enterprise']
};

export async function checkSubscriptionAccess(
  request: NextRequest,
  userPlan: string = 'free'
): Promise<{ allowed: boolean; reason?: string }> {
  const pathname = request.nextUrl.pathname;
  
  // Check feature-based access
  const requiredFeature = PROTECTED_ROUTES[pathname];
  if (requiredFeature) {
    const hasAccess = hasFeatureAccess(userPlan, requiredFeature);
    if (!hasAccess) {
      return {
        allowed: false,
        reason: `This feature requires a higher subscription plan`
      };
    }
  }
  
  // Check plan-level access
  for (const [route, allowedPlans] of Object.entries(PLAN_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!allowedPlans.includes(userPlan)) {
        return {
          allowed: false,
          reason: `This area requires ${allowedPlans[0]} plan or higher`
        };
      }
    }
  }
  
  return { allowed: true };
}

// Helper to create subscription error response
export function subscriptionErrorResponse(reason: string) {
  return NextResponse.json(
    {
      error: 'Subscription Required',
      message: reason,
      upgradeUrl: '/pricing'
    },
    { status: 403 }
  );
}