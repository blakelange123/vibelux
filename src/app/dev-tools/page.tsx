"use client"

import { DeveloperTools } from '@/components/DeveloperTools'

export default function DevToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Developer Tools</h1>
      <DeveloperTools />
    </div>
  )
}