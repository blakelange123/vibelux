"use client"

import { PWAFeatures } from '@/components/PWAFeatures'

export default function PWAPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Progressive Web App</h1>
      <PWAFeatures />
    </div>
  )
}