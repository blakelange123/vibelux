'use client';

import { ModuleFeatureGate } from '@/components/ModuleFeatureGate';
import { ModuleType } from '@/lib/subscription-modules';

// Add a bypass flag for development
const BYPASS_INVESTMENT_PAYWALL = process.env.NEXT_PUBLIC_BYPASS_PAYWALLS === 'true' || process.env.NODE_ENV === 'development';

export default function InvestmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In development or with bypass flag, skip the paywall
  if (BYPASS_INVESTMENT_PAYWALL) {
    return <>{children}</>;
  }

  // In production, use the normal gate
  return (
    <ModuleFeatureGate
      module={ModuleType.INVESTMENT_PLATFORM}
      soft={true}
      customMessage="The VibeLux Capital investment platform requires a subscription to our Investment Module ($2,000/month) and Business tier or higher."
    >
      {children}
    </ModuleFeatureGate>
  );
}