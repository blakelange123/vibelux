"use client"

import { MobileAppSync } from '@/components/MobileAppSync'

export default function SyncPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mobile App Sync</h1>
      <MobileAppSync />
    </div>
  )
}