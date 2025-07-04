"use client"

import { ThirdPartyIntegrations } from '@/components/ThirdPartyIntegrations'

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Integrations</h1>
      <ThirdPartyIntegrations />
    </div>
  )
}