'use client';

import { redirect } from 'next/navigation';

// Redirect to the advanced designer with climate features enabled
export default function ClimateIntegratedDesignPage() {
  // For now, redirect to the advanced designer
  // In the future, we can add a query parameter to enable climate features
  redirect('/design/advanced?climate=true');
}