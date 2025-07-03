'use client';

import { redirect } from 'next/navigation';

export default function VirtualSensorsPage() {
  // Redirect to main sensors page for now
  redirect('/sensors');
}