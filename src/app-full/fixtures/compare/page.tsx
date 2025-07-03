"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, X, Download, Lightbulb, Zap, DollarSign, Shield, Ruler, Check, AlertCircle } from "lucide-react"

// Mock comparison data
const mockFixtures = [
  {
    id: 1,
    manufacturer: "Fluence",
    model: "SPYDR 2p",
    image: "/api/placeholder/200/150",
    ppf: 1700,
    efficacy: 2.7,
    wattage: 630,
    price: 1299,
    spectrum: "Full",
    dimensions: "44 x 44 x 3",
    warranty: 5,
    pros: ["High efficacy", "IP66 rated", "5-year warranty"],
    cons: ["Higher price point", "Limited spectrum options"]
  },
  {
    id: 2,
    manufacturer: "Gavita",
    model: "1700e LED",
    image: "/api/placeholder/200/150",
    ppf: 1700,
    efficacy: 2.6,
    wattage: 645,
    price: 1199,
    spectrum: "Full + FR",
    dimensions: "46 x 44 x 5",
    warranty: 5,
    pros: ["Far-red included", "Good price", "Trusted brand"],
    cons: ["Slightly lower efficacy", "Heavier unit"]
  },
  {
    id: 3,
    manufacturer: "California Lightworks",
    model: "MegaDrive 1000",
    image: "/api/placeholder/200/150",
    ppf: 2100,
    efficacy: 2.8,
    wattage: 750,
    price: 1599,
    spectrum: "Variable",
    dimensions: "48 x 48 x 4",
    warranty: 3,
    pros: ["Highest PPF", "Variable spectrum", "Best efficacy"],
    cons: ["3-year warranty", "Highest power draw", "Most expensive"]
  }
]

export default function CompareFixturesPage() {
  const [fixtures, setFixtures] = useState(mockFixtures.slice(0, 3))
  const [highlightDifferences, setHighlightDifferences] = useState(true)

  const removeFixture = (id: number) => {
    setFixtures(fixtures.filter(f => f.id !== id))
  }

  const getHighlightClass = (value: any, allValues: any[]) => {
    if (!highlightDifferences) return ""
    
    const numericValue = typeof value === 'number' ? value : parseFloat(value)
    if (isNaN(numericValue)) return ""
    
    const numericValues = allValues.map(v => typeof v === 'number' ? v : parseFloat(v)).filter(v => !isNaN(v))
    const max = Math.max(...numericValues)
    const min = Math.min(...numericValues)
    
    if (numericValue === max && max !== min) return "bg-green-50 text-green-700 font-semibold"
    if (numericValue === min && max !== min) return "bg-red-50 text-red-700"
    return ""
  }

  const metrics = [
    { key: 'ppf', label: 'PPF (μmol/s)', format: (v: number) => v },
    { key: 'efficacy', label: 'Efficacy (μmol/J)', format: (v: number) => v },
    { key: 'wattage', label: 'Power (W)', format: (v: number) => v, inverse: true },
    { key: 'price', label: 'Price', format: (v: number) => `$${v}`, inverse: true },
    { key: 'warranty', label: 'Warranty', format: (v: number) => `${v} years` },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/fixtures">
                <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <h1 className="text-2xl font-bold text-white">Compare Fixtures</h1>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highlightDifferences}
                  onChange={(e) => setHighlightDifferences(e.target.checked)}
                  className="w-4 h-4 text-purple-500 rounded"
                />
                <span className="text-sm text-gray-300">Highlight differences</span>
              </label>
              <button className="px-4 py-2 border border-gray-700 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 font-medium text-gray-400 w-48">Specification</th>
                  {fixtures.map(fixture => (
                    <th key={fixture.id} className="p-4 min-w-[250px]">
                      <div className="relative">
                        <button
                          onClick={() => removeFixture(fixture.id)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <img
                          src={fixture.image}
                          alt={fixture.model}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold text-white">{fixture.manufacturer}</h3>
                        <p className="text-lg font-bold text-purple-400">{fixture.model}</p>
                      </div>
                    </th>
                  ))}
                  {fixtures.length < 4 && (
                    <th className="p-4 min-w-[250px]">
                      <Link href="/fixtures">
                        <button className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 hover:bg-gray-800/50 flex flex-col items-center justify-center gap-2 transition-colors">
                          <Plus className="w-8 h-8 text-gray-500" />
                          <span className="text-gray-400">Add Fixture</span>
                        </button>
                      </Link>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {metrics.map(metric => (
                  <tr key={metric.key} className="border-b">
                    <td className="p-4 font-medium text-gray-400">{metric.label}</td>
                    {fixtures.map(fixture => {
                      const value = fixture[metric.key as keyof typeof fixture]
                      const allValues = fixtures.map(f => f[metric.key as keyof typeof f])
                      return (
                        <td 
                          key={fixture.id} 
                          className={`p-4 text-center text-white ${getHighlightClass(
                            metric.inverse ? -value : value, 
                            metric.inverse ? allValues.map(v => -v) : allValues
                          )}`}
                        >
                          {metric.format(value as number)}
                        </td>
                      )
                    })}
                    {fixtures.length < 4 && <td className="p-4"></td>}
                  </tr>
                ))}
                
                {/* Spectrum */}
                <tr className="border-b border-gray-700">
                  <td className="p-4 font-medium text-gray-400">Spectrum</td>
                  {fixtures.map(fixture => (
                    <td key={fixture.id} className="p-4 text-center">
                      <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 text-white">
                        {fixture.spectrum}
                      </div>
                    </td>
                  ))}
                  {fixtures.length < 4 && <td className="p-4"></td>}
                </tr>

                {/* Dimensions */}
                <tr className="border-b border-gray-700">
                  <td className="p-4 font-medium text-gray-400">Dimensions</td>
                  {fixtures.map(fixture => (
                    <td key={fixture.id} className="p-4 text-center">
                      <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 text-white">
                        {fixture.dimensions}"
                      </div>
                    </td>
                  ))}
                  {fixtures.length < 4 && <td className="p-4"></td>}
                </tr>

                {/* Pros */}
                <tr className="border-b border-gray-700">
                  <td className="p-4 font-medium text-gray-400 align-top">Pros</td>
                  {fixtures.map(fixture => (
                    <td key={fixture.id} className="p-4 max-w-0">
                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <ul className="space-y-1">
                          {fixture.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="break-words text-gray-300">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  ))}
                  {fixtures.length < 4 && <td className="p-4"></td>}
                </tr>

                {/* Cons */}
                <tr>
                  <td className="p-4 font-medium text-gray-400 align-top">Cons</td>
                  {fixtures.map(fixture => (
                    <td key={fixture.id} className="p-4 max-w-0">
                      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                        <ul className="space-y-1">
                          {fixture.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <span className="break-words text-gray-300">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  ))}
                  {fixtures.length < 4 && <td className="p-4"></td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Comparison Summary</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-2">Best Overall Value</h3>
              <p className="text-gray-300">
                The <strong className="text-blue-300">Gavita 1700e LED</strong> offers the best balance of performance and price, 
                with far-red spectrum included and a competitive price point.
              </p>
            </div>
            <div className="p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-2">Highest Efficiency</h3>
              <p className="text-gray-300">
                The <strong className="text-green-300">California Lightworks MegaDrive 1000</strong> leads in efficacy at 2.8 μmol/J 
                and offers the highest PPF output, ideal for maximum yields.
              </p>
            </div>
            <div className="p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg">
              <h3 className="font-semibold text-purple-400 mb-2">Best for Wet Environments</h3>
              <p className="text-gray-300">
                The <strong className="text-purple-300">Fluence SPYDR 2p</strong> with its IP66 rating is the best choice for 
                high-humidity environments and greenhouse applications.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/fixtures">
            <button className="px-6 py-3 border border-gray-700 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
              Add More Fixtures
            </button>
          </Link>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all">
            Save Comparison
          </button>
        </div>
      </div>
    </div>
  )
}