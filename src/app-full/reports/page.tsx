"use client"

import { EnhancedCustomReportingBuilder } from '@/components/EnhancedCustomReportingBuilder'

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <EnhancedCustomReportingBuilder />
      </div>
    </div>
  )
}