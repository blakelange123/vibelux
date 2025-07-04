"use client"

import { OfflineMode } from '@/components/OfflineMode'

export default function OfflinePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Offline Mode</h1>
      <OfflineMode />
    </div>
  )
}