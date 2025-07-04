"use client"

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DeveloperTools } from '@/components/DeveloperTools'

export default function DeveloperToolsPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-white">Developer Tools</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <DeveloperTools />
      </main>
    </div>
  )
}