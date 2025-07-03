'use client';

import { MultiSiteManager } from '@/components/enterprise/MultiSiteManager';

export default function EnterprisePage() {
  // In a real app, this would come from the user's session/organization
  const organizationId = 'org-1';
  
  return <MultiSiteManager organizationId={organizationId} />;
}