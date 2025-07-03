"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Heart, Share2, BarChart3, Calculator, FileText, Lightbulb, Zap, DollarSign, Shield, Ruler, Globe, Phone, Mail, ExternalLink, Check, AlertCircle, Award } from "lucide-react"

// Mock detailed fixture data
const fixtureData = {
  id: 1,
  manufacturerName: "Fluence",
  model: "SPYDR 2p",
  dlcNumber: "PFL2U3D4NB1GXW",
  category: "Greenhouse",
  ppf: 1700,
  efficacy: 2.7,
  wattage: 630,
  price: 1299,
  spectrumType: "Full Spectrum",
  dimensions: "44 x 44 x 3",
  weight: "22 lbs",
  mounting: ["Suspended", "Surface Mount"],
  warranty: 5,
  inStock: true,
  image: "/api/placeholder/600/400",
  dlcStatus: "Qualified",
  dlcDate: "2023-06-15",
  description: "The SPYDR 2p is designed for single or multi-tier cultivation. This LED grow light provides a broad, uniform light distribution to ensure consistent results.",
  features: [
    "High-efficiency PhysioSpec™ spectrum",
    "Passive thermal management",
    "IP66 rated for wet environments",
    "Dimming compatible (0-10V)",
    "Daisy chain capable"
  ],
  electricalSpecs: {
    inputVoltage: "120-277V",
    currentDraw: "5.3A @ 120V",
    powerFactor: ">0.95",
    thd: "<20%",
    frequency: "50/60 Hz",
    inrushCurrent: "60A"
  },
  photometricData: {
    ppf: 1700,
    ppfd: {
      "4x4": 1060,
      "5x5": 680,
      "6x6": 472
    },
    efficacy: 2.7,
    par: "400-700nm",
    distribution: "120°",
    lifespan: "L90 >36,000 hours"
  },
  spectrum: {
    blue: 15,
    green: 25,
    red: 55,
    farRed: 5
  },
  certifications: [
    "DLC Qualified",
    "UL Listed",
    "IP66 Rated",
    "RoHS Compliant"
  ],
  manufacturerInfo: {
    name: "Fluence",
    website: "https://fluence.science",
    phone: "1-512-212-4544",
    email: "info@fluence.science",
    support: "support@fluence.science"
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FixtureDetailPage({ params }: PageProps) {
  const { id } = await params
  const [activeTab, setActiveTab] = useState("overview")
  const [saved, setSaved] = useState(false)
  const [showPPFDCalculator, setShowPPFDCalculator] = useState(false)

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "photometric", label: "Photometric Data", icon: Lightbulb },
    { id: "electrical", label: "Electrical", icon: Zap },
    { id: "spectrum", label: "Spectrum", icon: BarChart3 },
    { id: "calculator", label: "PPFD Calculator", icon: Calculator }
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/fixtures">
                  <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </Link>
                <div>
                  <p className="text-sm text-gray-400">{fixtureData.manufacturerInfo.name}</p>
                  <h1 className="text-2xl font-bold text-white">{fixtureData.model}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`p-2 rounded-lg transition-colors ${saved ? 'bg-red-500 text-white' : 'border border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'}`}
                >
                  <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2 border border-gray-700 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 border border-gray-700 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <Link href={`/fixtures/compare?ids=${fixtureData.id}`}>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                    Compare
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30">
          <div className="container mx-auto px-4">
            <div className="flex gap-8 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Product Image */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-8 flex items-center justify-center">
                      <Lightbulb className="w-32 h-32 text-purple-300/50" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-white">Description</h2>
                    <p className="text-gray-300 mb-4">{fixtureData.description}</p>
                    <h3 className="font-semibold mb-2 text-white">Key Features</h3>
                    <ul className="space-y-2">
                      {fixtureData.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-400 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Certifications */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-white">Certifications</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {fixtureData.certifications.map((cert, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                          <Award className="w-5 h-5 text-purple-400" />
                          <span className="text-sm font-medium text-gray-300">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "photometric" && (
                <div className="space-y-6">
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-6 text-white">Photometric Performance</h2>
                    
                    {/* Key Metrics */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-lg border border-purple-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-5 h-5 text-purple-400" />
                          <span className="text-sm text-gray-400">PPF Output</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{fixtureData.photometricData.ppf} μmol/s</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-lg border border-green-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-5 h-5 text-green-400" />
                          <span className="text-sm text-gray-400">Efficacy</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{fixtureData.photometricData.efficacy} μmol/J</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-lg border border-blue-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-blue-400" />
                          <span className="text-sm text-gray-400">Lifespan</span>
                        </div>
                        <p className="text-lg font-bold text-white">{fixtureData.photometricData.lifespan}</p>
                      </div>
                    </div>

                    {/* PPFD at Different Heights */}
                    <div>
                      <h3 className="font-semibold mb-3 text-white">PPFD at 24" Height</h3>
                      <div className="space-y-3">
                        {Object.entries(fixtureData.photometricData.ppfd).map(([area, value]) => (
                          <div key={area} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                            <span className="font-medium text-gray-300">{area} Coverage</span>
                            <span className="text-lg font-bold text-purple-400">{value} μmol/m²/s</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-900/30 rounded-lg flex items-start gap-3 border border-blue-700/50">
                      <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div className="text-sm text-blue-200">
                        <p className="font-semibold mb-1">Pro Tip</p>
                        <p>PPFD values are measured at 24" mounting height. Adjust height to achieve desired light intensity for your specific crop requirements.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "electrical" && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold mb-6 text-white">Electrical Specifications</h2>
                  <div className="space-y-4">
                    {Object.entries(fixtureData.electricalSpecs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-700/50">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div className="text-sm text-yellow-200">
                        <p className="font-semibold mb-1">Electrical Safety</p>
                        <p>Always consult with a qualified electrician for installation. Ensure circuit capacity matches fixture requirements.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "spectrum" && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold mb-6 text-white">Spectral Distribution</h2>
                  
                  {/* Spectrum Bar Chart */}
                  <div className="mb-6">
                    <div className="space-y-3">
                      {Object.entries(fixtureData.spectrum).map(([color, percentage]) => (
                        <div key={color}>
                          <div className="flex justify-between mb-1">
                            <span className="capitalize font-medium text-gray-300">{color === 'farRed' ? 'Far Red' : color}</span>
                            <span className="text-sm text-gray-400">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-8">
                            <div
                              className={`h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                color === 'blue' ? 'bg-blue-500' :
                                color === 'green' ? 'bg-green-500' :
                                color === 'red' ? 'bg-red-500' :
                                'bg-red-800'
                              }`}
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-700/50">
                    <h3 className="font-semibold mb-2 text-white">Spectrum Type</h3>
                    <p className="text-purple-300">{fixtureData.spectrumType}</p>
                    <p className="text-sm text-purple-200 mt-2">
                      Optimized for full-cycle cultivation with enhanced red spectrum for flowering
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "calculator" && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold mb-6 text-white">PPFD Calculator</h2>
                  <p className="text-gray-300 mb-6">
                    Calculate the Photosynthetic Photon Flux Density (PPFD) for your grow area
                  </p>
                  
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Number of Fixtures</label>
                      <input
                        type="number"
                        min="1"
                        defaultValue="1"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Mounting Height (inches)</label>
                      <input
                        type="number"
                        min="12"
                        defaultValue="24"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Coverage Area</label>
                      <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white">
                        <option>4x4 ft</option>
                        <option>5x5 ft</option>
                        <option>6x6 ft</option>
                        <option>Custom</option>
                      </select>
                    </div>
                    
                    <button
                      type="button"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                      Calculate PPFD
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                <h3 className="font-semibold mb-4 text-white">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">DLC Number</span>
                    <span className="font-medium text-sm text-gray-300">{fixtureData.dlcNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category</span>
                    <span className="font-medium text-gray-300">{fixtureData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Power</span>
                    <span className="font-medium text-gray-300">{fixtureData.wattage}W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Dimensions</span>
                    <span className="font-medium text-gray-300">{fixtureData.dimensions}"</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Weight</span>
                    <span className="font-medium text-gray-300">{fixtureData.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Warranty</span>
                    <span className="font-medium text-gray-300">{fixtureData.warranty} years</span>
                  </div>
                </div>
              </div>

              {/* DLC Status */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                <h3 className="font-semibold mb-4 text-white">DLC Status</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center border border-green-700/50">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-400">{fixtureData.dlcStatus}</p>
                    <p className="text-sm text-gray-400">As of {fixtureData.dlcDate}</p>
                  </div>
                </div>
                <a
                  href={`https://www.designlights.org/search/?search=${fixtureData.dlcNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:underline flex items-center gap-1"
                >
                  Verify on DLC website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-700/50">
                <h3 className="font-semibold mb-4 text-white">Pricing</h3>
                <div className="text-3xl font-bold text-purple-300 mb-2">
                  ${fixtureData.price}
                </div>
                <p className="text-sm text-gray-400 mb-4">MSRP (contact for volume pricing)</p>
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium mb-3 hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                  Request Quote
                </button>
                <button className="w-full border border-purple-500 text-purple-400 py-3 rounded-lg font-medium hover:bg-purple-500/10 transition-colors">
                  Find Distributor
                </button>
              </div>

              {/* Manufacturer Contact */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                <h3 className="font-semibold mb-4 text-white">Manufacturer</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-300">{fixtureData.manufacturerInfo.name}</p>
                  </div>
                  <a
                    href={fixtureData.manufacturerInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-400 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    Visit website
                  </a>
                  <a
                    href={`tel:${fixtureData.manufacturerInfo.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300"
                  >
                    <Phone className="w-4 h-4" />
                    {fixtureData.manufacturerInfo.phone}
                  </a>
                  <a
                    href={`mailto:${fixtureData.manufacturerInfo.support}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300"
                  >
                    <Mail className="w-4 h-4" />
                    Technical Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}