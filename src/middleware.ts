import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import affiliateTrackingMiddleware from './middleware/affiliate-tracking';
import { enforceSessionLimits } from './middleware/session-enforcement';

const isPublicRoute = createRouteMatcher([
  "/",
  "/manifest.json",
  // Only specific webhook endpoints - not all webhooks
  "/api/webhooks/stripe",
  "/api/webhooks/clerk", 
  "/api/webhooks/affiliate",
  // No blanket API access - only specific public endpoints
  "/api/health",
  "/api/health/status",
  // Authentication routes
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Marketing pages only
  "/pricing",
  "/features", 
  "/about",
  "/privacy",
  "/terms",
  "/support",
  "/affiliate",
  // Public calculators only (not all fixtures/reports)
  "/calculators/photosynthetic",
  "/calculators/tco",
  "/calculators/rebate",
  "/calculators/environmental",
  // Public design tools
  "/design",
  "/design/advanced",
  // Public marketing pages only - no sensitive operations
  "/services",
  "/pilot-program",
  // Remove all test routes from production
  // Remove access to reports, operations, dev-tools
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Check for affiliate tracking first
  const url = req.nextUrl;
  const hasAffiliateParams = url.searchParams.has('ref') || url.searchParams.has('aff');
  
  if (hasAffiliateParams) {
    // Handle affiliate tracking
    return await affiliateTrackingMiddleware(req);
  }
  
  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  // For protected routes, redirect to sign-in if not authenticated
  if (!isPublicRoute(req)) {
    const { userId } = await auth();
    
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Session enforcement is handled separately in the session manager
    // due to Clerk middleware limitations
  }
  
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};