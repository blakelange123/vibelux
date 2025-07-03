"use client"

import { MultiLanguageSupport } from '@/components/MultiLanguageSupport'

export default function LanguagePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Language & Localization</h1>
      <MultiLanguageSupport />
    </div>
  )
}