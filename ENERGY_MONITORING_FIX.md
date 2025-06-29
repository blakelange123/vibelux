# Energy Monitoring Page Fix

## Issue
The energy monitoring page at `/energy-monitoring` was showing 500 Internal Server Error for static resources.

## Root Cause
The EnergyVerificationDashboard component was being imported directly with SSR enabled, which can cause issues with client-side dependencies like recharts.

## Solution
1. Updated `/src/app/energy-monitoring/page.tsx` to use dynamic import with SSR disabled:
   ```typescript
   const EnergyVerificationDashboard = dynamic(
     () => import('@/components/EnergyVerificationDashboard').then(mod => ({ default: mod.EnergyVerificationDashboard })),
     { 
       ssr: false,
       loading: () => <LoadingComponent />
     }
   );
   ```

2. All required files are in place:
   - `/src/lib/energy-monitoring-client.ts` - Client-side API wrapper
   - `/src/components/EnergyVerificationDashboard.tsx` - Main dashboard component
   - `/src/app/api/energy-monitoring/verification/route.ts` - Verification API
   - `/src/app/api/energy-monitoring/trends/route.ts` - Trends API
   - `/src/app/api/energy-monitoring/alerts/route.ts` - Alerts API
   - `/src/app/api/energy-monitoring/report/route.ts` - Report generation API

## Testing
1. Clear Next.js cache: `rm -rf .next`
2. Restart development server: `npm run dev`
3. Navigate to: `http://localhost:3001/energy-monitoring`

## Features
- Real-time energy savings tracking
- IPMVP-certified verification metrics
- Energy trends visualization
- Cost savings calculations
- CO2 reduction tracking
- Peak demand analysis
- Weather-normalized adjustments
- Report generation (PDF, JSON, CSV)
- Alert monitoring

The page should now load correctly without any 500 errors.