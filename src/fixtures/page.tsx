"use client"

import React, { useState, useEffect } from "react"
import { Search, Filter, Download, Heart, BarChart3, Eye, X, ChevronDown, Zap, Lightbulb, Ruler, Shield, Award, Loader2, ChevronLeft, ChevronRight, Calculator, Menu, Home } from "lucide-react"
import Link from "next/link"
import type { DLCFixture } from "@/lib/fixtures-data"
import { getFixtureCategory } from "@/lib/fixtures-data"
import { AdvancedFixtureFilters } from "@/components/AdvancedFixtureFilters"

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<DLCFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedManufacturer, setSelectedManufacturer] = useState("All")
  const [showFilters, setShowFilters] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [compareList, setCompareList] = useState<number[]>([])
  const [savedFixtures, setSavedFixtures] = useState<number[]>([])
  const [sortBy, setSortBy] = useState("relevance")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [manufacturers, setManufacturers] = useState<string[]>([])
  
  // PPE, Wattage and THD range filters
  const [ppeRange, setPpeRange] = useState({ min: 0, max: 10 })
  const [wattageRange, setWattageRange] = useState({ min: 0, max: 2000 })
  const [thdRange, setThdRange] = useState({ min: 0, max: 20 })
  const [powerFactorMin, setPowerFactorMin] = useState(0.9)
  const [voltageRange, setVoltageRange] = useState("All") // All, 120V, 208V, 240V, 277V, 480V
  const [dimming, setDimming] = useState<string[]>([]) // 0-10V, DALI, PWM, Wireless
  const [spectrallyTunable, setSpectrallyTunable] = useState<boolean | null>(null)

  const categories = ["All", "Indoor", "Greenhouse", "Vertical Farm", "Supplemental", "Industrial", "Research"]

  // Fetch fixtures from API
  useEffect(() => {
    const fetchFixtures = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          search: searchTerm,
          category: selectedCategory,
          manufacturer: selectedManufacturer,
          minPPE: ppeRange.min.toString(),
          maxPPE: ppeRange.max.toString(),
          minWattage: wattageRange.min.toString(),
          maxWattage: wattageRange.max.toString(),
          minTHD: thdRange.min.toString(),
          maxTHD: thdRange.max.toString(),
          page: page.toString(),
          limit: "20"
        })
        
        const response = await fetch(`/api/fixtures?${params}`)
        const data = await response.json()
        
        if (data.fixtures) {
          // Sort fixtures
          const sorted = [...data.fixtures]
          switch (sortBy) {
            case "ppe-high":
              sorted.sort((a, b) => b.reportedPPE - a.reportedPPE)
              break
            case "ppf-high":
              sorted.sort((a, b) => b.reportedPPF - a.reportedPPF)
              break
            case "wattage-low":
              sorted.sort((a, b) => a.reportedWattage - b.reportedWattage)
              break
            case "newest":
              sorted.sort((a, b) => new Date(b.dateQualified).getTime() - new Date(a.dateQualified).getTime())
              break
          }
          
          setFixtures(sorted)
          setTotal(data.total)
          setTotalPages(data.totalPages)
          setManufacturers(data.manufacturers || [])
        }
      } catch (error) {
        console.error('Failed to fetch fixtures:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFixtures()
  }, [searchTerm, selectedCategory, selectedManufacturer, ppeRange, wattageRange, thdRange, sortBy, page])

  const toggleCompare = (id: number) => {
    setCompareList(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const toggleSaved = (id: number) => {
    setSavedFixtures(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  function handleAdvancedFiltersChange(advancedFilters: any) {
    // Handle advanced filter changes
    // You can update the API call with these filters
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20 pointer-events-none" />
      
      {/* Advanced Filters Sidebar */}
      {showAdvancedFilters && (
        <AdvancedFixtureFilters
          onFiltersChange={handleAdvancedFiltersChange}
          onClose={() => setShowAdvancedFilters(false)}
        />
      )}
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">DLC Certified Fixtures</h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Browse {total.toLocaleString()} qualified horticultural lighting fixtures
                  </p>
                </div>
                {/* Quick Navigation Links */}
                <div className="hidden lg:flex items-center gap-4 ml-8">
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
                    <Home className="w-4 h-4" />
                    Home
                  </Link>
                  <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
                    Features
                  </Link>
                  <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                    Pricing
                  </Link>
                  <Link href="/marketplace" className="text-gray-300 hover:text-white transition-colors">
                    Marketplace
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {compareList.length > 0 && (
                  <Link href={`/fixtures/compare?ids=${compareList.join(',')}`}>
                    <button className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg text-white text-sm font-medium">
                      Compare ({compareList.length})
                    </button>
                  </Link>
                )}
                <Link href="/fixtures/tm21">
                  <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    TM-21
                  </button>
                </Link>
                <button className="px-3 py-1.5 border border-gray-700 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
              </div>
            </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search fixtures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1.5 text-sm border border-gray-700 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {(selectedCategory !== "All" || selectedManufacturer !== "All") && (
                <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {((selectedCategory !== "All" ? 1 : 0) + (selectedManufacturer !== "All" ? 1 : 0))}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setShowAdvancedFilters(!showAdvancedFilters);
              }}
              className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <Filter className="w-3.5 h-3.5" />
              Advanced
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="ppe-high">PPE: High to Low</option>
              <option value="ppf-high">PPF: High to Low</option>
              <option value="wattage-low">Wattage: Low to High</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-300">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-300">Manufacturer</label>
                  <select
                    value={selectedManufacturer}
                    onChange={(e) => setSelectedManufacturer(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="All">All Manufacturers</option>
                    {manufacturers.map(man => (
                      <option key={man} value={man}>{man}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-300">
                    PPE Range: {ppeRange.min} - {ppeRange.max} μmol/J
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={ppeRange.min}
                      onChange={(e) => setPpeRange({...ppeRange, min: parseFloat(e.target.value)})}
                      className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                    />
                    <span className="py-1 text-gray-400">to</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={ppeRange.max}
                      onChange={(e) => setPpeRange({...ppeRange, max: parseFloat(e.target.value)})}
                      className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-300">
                    Wattage: {wattageRange.min}W - {wattageRange.max}W
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      max="2000"
                      step="50"
                      value={wattageRange.min}
                      onChange={(e) => setWattageRange({...wattageRange, min: parseInt(e.target.value)})}
                      className="w-24 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                    />
                    <span className="py-1 text-gray-400">to</span>
                    <input
                      type="number"
                      min="0"
                      max="2000"
                      step="50"
                      value={wattageRange.max}
                      onChange={(e) => setWattageRange({...wattageRange, max: parseInt(e.target.value)})}
                      className="w-24 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-300">
                    THD: {thdRange.min}% - {thdRange.max}%
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="1"
                      value={thdRange.min}
                      onChange={(e) => setThdRange({...thdRange, min: parseInt(e.target.value)})}
                      className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                    />
                    <span className="py-1 text-gray-400">to</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="1"
                      value={thdRange.max}
                      onChange={(e) => setThdRange({...thdRange, max: parseInt(e.target.value)})}
                      className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => {
                    setSelectedCategory("All")
                    setSelectedManufacturer("All")
                    setPpeRange({ min: 0, max: 10 })
                    setWattageRange({ min: 0, max: 2000 })
                    setThdRange({ min: 0, max: 20 })
                  }}
                  className="text-sm text-purple-400 hover:underline"
                >
                  Clear all filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Hide filters
                </button>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Fixtures Grid */}
        <div className="container mx-auto px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {fixtures.map(fixture => (
                  <div key={fixture.id} className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 hover:border-gray-600 transition-all group">
                    {/* Gradient Placeholder Image */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-blue-900/50 rounded-t-xl overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lightbulb className="w-20 h-20 text-purple-300/70" />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => toggleSaved(fixture.id)}
                          className={`p-2 rounded-full backdrop-blur transition-all ${
                            savedFixtures.includes(fixture.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-800/80 hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${savedFixtures.includes(fixture.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      {/* Category Badge */}
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-gray-800/90 backdrop-blur text-xs font-medium px-3 py-1 rounded-full text-gray-300 border border-gray-600">
                          {getFixtureCategory(fixture)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="mb-3">
                        <p className="text-sm text-gray-400 font-medium">{fixture.manufacturer}</p>
                        <h3 className="font-semibold text-lg text-white line-clamp-1" title={fixture.modelNumber}>
                          {fixture.modelNumber}
                        </h3>
                        {fixture.productName && (
                          <p className="text-sm text-gray-500 line-clamp-1" title={fixture.productName}>
                            {fixture.productName}
                          </p>
                        )}
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Lightbulb className="w-4 h-4 text-purple-400" />
                            <p className="text-xs text-purple-400 font-medium">PPF</p>
                          </div>
                          <p className="text-lg font-bold text-white">{fixture.reportedPPF.toFixed(0)}</p>
                          <p className="text-xs text-purple-300">μmol/s</p>
                        </div>
                        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-green-400" />
                            <p className="text-xs text-green-400 font-medium">PPE</p>
                          </div>
                          <p className="text-lg font-bold text-white">{fixture.reportedPPE.toFixed(2)}</p>
                          <p className="text-xs text-green-300">μmol/J</p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Power</span>
                          <span className="font-medium text-white">{fixture.reportedWattage}W</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Voltage</span>
                          <span className="font-medium text-white">
                            {fixture.minVoltage}-{fixture.maxVoltage}V {fixture.powerType}
                          </span>
                        </div>
                        {fixture.powerFactor > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Power Factor</span>
                            <span className="font-medium text-white">{fixture.powerFactor.toFixed(2)}</span>
                          </div>
                        )}
                        {fixture.thd > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">THD</span>
                            <span className="font-medium text-white">{fixture.thd.toFixed(1)}%</span>
                          </div>
                        )}
                        {fixture.warranty > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Warranty</span>
                            <span className="font-medium text-white">{fixture.warranty} years</span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="flex gap-2 mb-4">
                        {fixture.dimmable && (
                          <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded border border-blue-700/50">
                            Dimmable
                          </span>
                        )}
                        {fixture.spectrallyTunable && (
                          <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded border border-purple-700/50">
                            Tunable
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/fixtures/${fixture.id}`} className="flex-1">
                          <button className="w-full px-3 py-2 border border-gray-600 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm text-gray-300 hover:text-white">
                            <Eye className="w-4 h-4" />
                            Details
                          </button>
                        </Link>
                        <button
                          onClick={() => toggleCompare(fixture.id)}
                          className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                            compareList.includes(fixture.id)
                              ? 'bg-purple-600 text-white'
                              : 'border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                          {compareList.includes(fixture.id) ? 'Added' : 'Compare'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {fixtures.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No fixtures found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("All")
                      setSelectedManufacturer("All")
                      setPpeRange({ min: 0, max: 10 })
                      setWattageRange({ min: 0, max: 2000 })
                    }}
                    className="mt-4 text-purple-400 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 py-2 text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}