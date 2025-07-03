"use client"

import { AccessibilityFeatures } from '@/components/AccessibilityFeatures'

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Accessibility Settings</h1>
      <AccessibilityFeatures />
    </div>
  )
}