"use client"

import { APIDocumentation } from '@/components/APIDocumentation'

export default function APIDocsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">API Documentation</h1>
      <APIDocumentation />
    </div>
  )
}