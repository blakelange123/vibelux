"use client"

import { ImportExportSettings } from '@/components/ImportExportSettings'

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <ImportExportSettings />
    </div>
  )
}