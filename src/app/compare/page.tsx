/**
 * Fixture Comparison Page
 * Main page for comparing LED grow lights
 */

import { FixtureComparison } from '@/components/fixtures/FixtureComparison'

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FixtureComparison />
    </div>
  )
}

export const metadata = {
  title: 'Compare LED Grow Lights | VibeLux',
  description: 'Compare LED grow lights side-by-side with detailed analysis of performance, efficiency, and value to find the perfect fixture for your growing needs.',
}