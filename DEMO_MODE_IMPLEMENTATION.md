# Demo Mode Implementation Guide

## Overview
This guide explains how to implement demo mode disclaimers throughout the VibeLux application to clearly indicate when simulated data is being displayed.

## Components Created

### 1. Demo Disclaimer Component
**Location**: `/src/components/ui/demo-disclaimer.tsx`

```typescript
import { DemoDisclaimer, FinancialDemoDisclaimer, HardwareDemoDisclaimer } from '@/components/ui/demo-disclaimer';

// Basic usage
<DemoDisclaimer feature="energy monitoring" />

// Banner variant (full width)
<DemoDisclaimer feature="sensor data" variant="banner" />

// Dialog variant (click to view details)
<DemoDisclaimer feature="equipment control" variant="dialog" />

// Specialized disclaimers
<FinancialDemoDisclaimer />  // For financial features
<HardwareDemoDisclaimer />   // For IoT/hardware features
```

### 2. Demo Mode Configuration
**Location**: `/src/lib/demo-mode-config.ts`

Defines all features that can be in demo mode:
- Feature categories: iot, financial, analytics, integration, marketplace
- Production requirements for each feature
- Demo data sources

### 3. Demo Mode Context
**Location**: `/src/contexts/demo-mode-context.tsx`

Provides global demo mode state management:
```typescript
import { useDemoMode } from '@/contexts/demo-mode-context';

const { isDemoMode, isFeatureDemo } = useDemoMode();
```

## Implementation Steps

### Step 1: Wrap Your App
In your `_app.tsx` or root layout:

```typescript
import { DemoModeProvider } from '@/contexts/demo-mode-context';

function MyApp({ Component, pageProps }) {
  return (
    <DemoModeProvider>
      {/* Your other providers */}
      <Component {...pageProps} />
    </DemoModeProvider>
  );
}
```

### Step 2: Add Disclaimers to Pages

#### For IoT/Sensor Pages:
```typescript
import { HardwareDemoDisclaimer } from '@/components/ui/demo-disclaimer';
import { useDemoMode } from '@/contexts/demo-mode-context';

export default function EnergyDashboard() {
  const { isFeatureDemo } = useDemoMode();
  
  return (
    <Layout>
      {isFeatureDemo('energy-monitoring') && (
        <HardwareDemoDisclaimer />
      )}
      {/* Your page content */}
    </Layout>
  );
}
```

#### For Financial Pages:
```typescript
import { FinancialDemoDisclaimer } from '@/components/ui/demo-disclaimer';

export default function InvoicePage() {
  return (
    <Layout>
      <FinancialDemoDisclaimer />
      {/* Your page content */}
    </Layout>
  );
}
```

#### Using HOC for Entire Pages:
```typescript
import { withDemoDisclaimer } from '@/contexts/demo-mode-context';

function MarketplacePage() {
  // Your component code
}

export default withDemoDisclaimer(MarketplacePage, 'marketplace-listings');
```

### Step 3: Add to Data Visualizations

#### Charts:
```typescript
import { addDemoWatermark } from '@/lib/demo-mode-config';

const chartOptions = addDemoWatermark({
  title: { text: 'Energy Usage' },
  // ... other options
});
```

#### Data Tables:
```typescript
import { getDemoTableHeader } from '@/lib/demo-mode-config';

return (
  <div>
    {getDemoTableHeader()}
    <Table>
      {/* Your table content */}
    </Table>
  </div>
);
```

## Environment Configuration

Add to your `.env` file:
```bash
# Enable demo mode globally
NEXT_PUBLIC_DEMO_MODE=true

# Or use URL parameter: ?demo=true
```

## Feature-Specific Implementations

### 1. Energy Monitoring Pages
- Add `<HardwareDemoDisclaimer />` at the top
- Use simulated sensor data when in demo mode
- Show "Install Hardware" CTA button

### 2. Financial/Invoice Pages
- Add `<FinancialDemoDisclaimer />` prominently
- Use Stripe test mode for payments
- Clearly mark invoices as "SAMPLE"

### 3. Marketplace
- Add banner indicating sample listings
- Disable actual checkout in demo mode
- Show "Create Seller Account" CTA

### 4. Equipment Provisioning
- Simulate device connections
- Show sample QR codes
- Indicate "No Hardware Connected"

### 5. Compliance Tracking
- Use sample compliance records
- Watermark PDF exports
- Show "Upload Real Documents" CTA

## Best Practices

1. **Consistency**: Use the same disclaimer style across similar features
2. **Visibility**: Make demo notices prominent but not obtrusive
3. **Dismissible**: Allow users to dismiss notices per session
4. **Informative**: Explain what would be different in production
5. **CTA**: Always provide path to activate real features

## Testing Demo Mode

1. Set `NEXT_PUBLIC_DEMO_MODE=true` in environment
2. Navigate through all major features
3. Verify disclaimers appear appropriately
4. Test dismiss functionality
5. Ensure no real data operations occur

## Production Deployment

Before deploying to production:
1. Set `NEXT_PUBLIC_DEMO_MODE=false` for production environment
2. Ensure all API endpoints check demo mode flag
3. Verify payment processing uses correct Stripe keys
4. Test that demo disclaimers don't appear in production

## Support

For questions about demo mode implementation:
- Check component documentation in source files
- Review example implementations in existing pages
- Contact development team for assistance