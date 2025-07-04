import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ModuleType } from '@/lib/subscription-modules';

// Define which routes require which modules
const ROUTE_MODULE_MAP: Record<string, ModuleType> = {
  // AI Features
  '/autopilot': ModuleType.AI_AUTOPILOT,
  '/predictions': ModuleType.ADVANCED_ML,
  '/yield-prediction': ModuleType.ADVANCED_ML,
  
  // Investment Platform
  '/investment': ModuleType.INVESTMENT_PLATFORM,
  '/investment/operations': ModuleType.INVESTMENT_PLATFORM,
  '/investment/cost-analysis': ModuleType.INVESTMENT_PLATFORM,
  '/investment/deal-flow': ModuleType.INVESTMENT_PLATFORM,
  
  // Digital Twin
  '/digital-twin': ModuleType.DIGITAL_TWIN,
  
  // Energy Suite
  '/battery-optimization': ModuleType.ENERGY_SUITE,
  '/demand-response': ModuleType.ENERGY_SUITE,
  '/weather-adaptive': ModuleType.ENERGY_SUITE,
  
  // Consultant Tools
  '/white-label': ModuleType.CONSULTANT_TOOLS,
  '/client-portal': ModuleType.CONSULTANT_TOOLS,
  
  // Multi-site
  '/multi-site': ModuleType.MULTI_SITE,
  
  // Research
  '/research-tools': ModuleType.RESEARCH_TOOLS,
  '/data-export': ModuleType.RESEARCH_TOOLS,
  
  // Advanced Design (Professional+)
  '/design/advanced': ModuleType.ADVANCED_DESIGN,
  '/design/climate-integrated': ModuleType.ADVANCED_DESIGN,
  
  // Operations (Professional+)
  '/operations': ModuleType.OPERATIONS,
  '/cultivation': ModuleType.OPERATIONS,
  '/maintenance-tracker': ModuleType.OPERATIONS,
  
  // Analytics (Business+)
  '/analytics': ModuleType.ANALYTICS,
  '/reports': ModuleType.ANALYTICS,
  '/intelligence': ModuleType.ANALYTICS,
  
  // Compliance (Professional+)
  '/dlc-compliance': ModuleType.COMPLIANCE,
  '/thd-compliance': ModuleType.COMPLIANCE,
};

// Tier hierarchy for checking minimum requirements
const TIER_HIERARCHY = ['free', 'starter', 'professional', 'business', 'enterprise'];

export async function checkModuleAccess(
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;
  const requiredModule = ROUTE_MODULE_MAP[pathname];
  
  if (!requiredModule) {
    // No module requirement for this route
    return null;
  }
  
  // Check if user has the required module
  if (userModules.includes(requiredModule)) {
    return null; // Access granted
  }
  
  // Check if module is included in user's tier
  const moduleIncludedInTiers = getModuleTiers(requiredModule);
  const userTierIndex = TIER_HIERARCHY.indexOf(userTier);
  
  for (const tier of moduleIncludedInTiers) {
    const tierIndex = TIER_HIERARCHY.indexOf(tier);
    if (userTierIndex >= tierIndex) {
      return null; // Access granted through tier
    }
  }
  
  // Access denied - redirect to upgrade page
  const upgradeUrl = new URL('/subscription/upgrade', request.url);
  upgradeUrl.searchParams.set('required', requiredModule);
  upgradeUrl.searchParams.set('from', pathname);
  
  return NextResponse.redirect(upgradeUrl);
}

// Helper to determine which tiers include a module
function getModuleTiers(module: ModuleType): string[] {
  const tiers: string[] = [];
  
  switch (module) {
    case ModuleType.BASIC_CALCULATORS:
    case ModuleType.BASIC_DESIGN:
      tiers.push('starter', 'professional', 'business', 'enterprise');
      break;
      
    case ModuleType.ADVANCED_DESIGN:
    case ModuleType.OPERATIONS:
    case ModuleType.COMPLIANCE:
    case ModuleType.API_ACCESS:
      tiers.push('professional', 'business', 'enterprise');
      break;
      
    case ModuleType.ANALYTICS:
    case ModuleType.DIGITAL_TWIN:
      tiers.push('business', 'enterprise');
      break;
      
    case ModuleType.MULTI_SITE:
    case ModuleType.ADVANCED_ML:
      tiers.push('enterprise');
      break;
      
    // Add-on modules not included in any base tier
    case ModuleType.AI_AUTOPILOT:
    case ModuleType.INVESTMENT_PLATFORM:
    case ModuleType.RESEARCH_TOOLS:
    case ModuleType.ENERGY_SUITE:
    case ModuleType.CONSULTANT_TOOLS:
      // These are never included in base tiers
      break;
  }
  
  return tiers;
}

// Middleware configuration helper
export function createModuleMiddleware(
  getContext: (request: NextRequest) => Promise<{
    userId: string;
    subscriptionTier: string;
  } | null>
) {
  return async function middleware(request: NextRequest) {
    // Skip for public routes
    const publicPaths = ['/', '/sign-in', '/sign-up', '/pricing', '/features', '/about'];
    if (publicPaths.includes(request.nextUrl.pathname)) {
      return NextResponse.next();
    }
    
    // Get user data
    const userData = await getUserData(request);
    if (!userData) {
      // Not logged in - redirect to sign in
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    // Check module access
    const accessResponse = await checkModuleAccess(
      request,
      userData.tier,
      userData.modules
    );
    
    if (accessResponse) {
      return accessResponse;
    }
    
    // Add user data to headers for use in pages
    const response = NextResponse.next();
    response.headers.set('x-user-tier', userData.tier);
    response.headers.set('x-user-modules', userData.modules.join(','));
    
    return response;
  };
}