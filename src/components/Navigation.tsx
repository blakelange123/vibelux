'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-800">
              VibeLux
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/designer" className="text-gray-600 hover:text-gray-900">
              Designer
            </Link>
            <Link href="/calculators" className="text-gray-600 hover:text-gray-900">
              Calculators
            </Link>
            <Link href="/energy" className="text-gray-600 hover:text-gray-900">
              Energy
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/analytics" className="text-gray-600 hover:text-gray-900">
              Analytics
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              Admin
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/designer" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Designer
              </Link>
              <Link href="/calculators" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Calculators
              </Link>
              <Link href="/energy" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Energy
              </Link>
              <Link href="/dashboard" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/analytics" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Analytics
              </Link>
              <Link href="/admin" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Admin
              </Link>
              <Link href="/pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}