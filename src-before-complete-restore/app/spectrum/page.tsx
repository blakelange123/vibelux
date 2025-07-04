"use client"

import { useState, useEffect } from 'react'
import { 
  Activity,
  BarChart3,
  Zap,
  Sun,
  Moon,
  Leaf,
  TrendingUp,
  Info,
  Search
} from 'lucide-react'
import { Line, Bar } from 'recharts'

// DLC Fixture interface
interface DLCFixture {
  id: number
  brand: string
  modelNumber: string
  manufacturer: string
  reportedPPF: number
  blueFlux: number    // 400-500nm
  greenFlux: number   // 500-600nm
  redFlux: number     // 600-700nm
  farRedFlux: number  // 700-800nm
}

// Spectrum data for different light sources
const spectrumData = {
  hps: [
    { wavelength: 380, intensity: 5 },
    { wavelength: 400, intensity: 8 },
    { wavelength: 450, intensity: 15 },
    { wavelength: 500, intensity: 25 },
    { wavelength: 550, intensity: 45 },
    { wavelength: 589, intensity: 100 }, // Sodium peak
    { wavelength: 600, intensity: 85 },
    { wavelength: 650, intensity: 60 },
    { wavelength: 700, intensity: 40 },
    { wavelength: 750, intensity: 20 },
    { wavelength: 800, intensity: 10 }
  ],
  led_full: [
    { wavelength: 380, intensity: 10 },
    { wavelength: 400, intensity: 25 },
    { wavelength: 450, intensity: 80 }, // Blue peak
    { wavelength: 500, intensity: 40 },
    { wavelength: 550, intensity: 50 },
    { wavelength: 600, intensity: 45 },
    { wavelength: 660, intensity: 90 }, // Red peak
    { wavelength: 700, intensity: 30 },
    { wavelength: 730, intensity: 25 }, // Far red
    { wavelength: 750, intensity: 15 },
    { wavelength: 800, intensity: 5 }
  ],
  cmh: [
    { wavelength: 380, intensity: 20 },
    { wavelength: 400, intensity: 35 },
    { wavelength: 450, intensity: 60 },
    { wavelength: 500, intensity: 70 },
    { wavelength: 550, intensity: 85 },
    { wavelength: 600, intensity: 75 },
    { wavelength: 650, intensity: 65 },
    { wavelength: 700, intensity: 45 },
    { wavelength: 750, intensity: 25 },
    { wavelength: 800, intensity: 10 }
  ],
  sunlight: [
    { wavelength: 380, intensity: 30 },
    { wavelength: 400, intensity: 45 },
    { wavelength: 450, intensity: 75 },
    { wavelength: 500, intensity: 85 },
    { wavelength: 550, intensity: 95 },
    { wavelength: 600, intensity: 90 },
    { wavelength: 650, intensity: 85 },
    { wavelength: 700, intensity: 75 },
    { wavelength: 750, intensity: 60 },
    { wavelength: 800, intensity: 40 }
  ]
}

// Photosynthetic response curves
const parData = [
  { wavelength: 380, absorption: 5 },
  { wavelength: 400, absorption: 15 },
  { wavelength: 425, absorption: 65 },
  { wavelength: 450, absorption: 85 }, // Chlorophyll A peak
  { wavelength: 475, absorption: 70 },
  { wavelength: 500, absorption: 35 },
  { wavelength: 525, absorption: 20 },
  { wavelength: 550, absorption: 10 },
  { wavelength: 575, absorption: 15 },
  { wavelength: 600, absorption: 25 },
  { wavelength: 625, absorption: 50 },
  { wavelength: 650, absorption: 75 },
  { wavelength: 675, absorption: 90 }, // Chlorophyll B peak
  { wavelength: 700, absorption: 30 },
  { wavelength: 725, absorption: 10 },
  { wavelength: 750, absorption: 5 }
]

export default function SpectrumAnalysisPage() {
  const [selectedSpectrum, setSelectedSpectrum] = useState<'hps' | 'led_full' | 'cmh' | 'sunlight' | 'dlc_fixture'>('led_full')
  const [showPAR, setShowPAR] = useState(true)
  const [compareMode, setCompareMode] = useState(false)
  const [compareSpectrum, setCompareSpectrum] = useState<string>('sunlight')
  const [compareDLCFixture, setCompareDLCFixture] = useState<DLCFixture | null>(null)
  
  // DLC Fixture states
  const [dlcFixtures, setDlcFixtures] = useState<DLCFixture[]>([])
  const [selectedDLCFixture, setSelectedDLCFixture] = useState<DLCFixture | null>(null)
  const [fixtureSearch, setFixtureSearch] = useState('')
  const [loadingFixtures, setLoadingFixtures] = useState(false)
  
  // Load DLC fixtures
  useEffect(() => {
    const loadFixtures = async () => {
      setLoadingFixtures(true)
      try {
        const response = await fetch('/api/fixtures?limit=100')
        const data = await response.json()
        setDlcFixtures(data.fixtures || [])
        if (data.fixtures?.length > 0) {
          setSelectedDLCFixture(data.fixtures[0])
        }
      } catch (error) {
        console.error('Failed to load DLC fixtures:', error)
      } finally {
        setLoadingFixtures(false)
      }
    }
    
    loadFixtures()
  }, [])

  // Generate spectrum data from DLC fixture
  const generateDLCSpectrum = (fixture: DLCFixture) => {
    // Normalize flux values to percentages
    const totalFlux = fixture.blueFlux + fixture.greenFlux + fixture.redFlux + fixture.farRedFlux
    
    if (totalFlux === 0) {
      // Fallback to typical LED spectrum if no flux data
      return [
        { wavelength: 380, intensity: 5 },
        { wavelength: 400, intensity: 25 },
        { wavelength: 450, intensity: 80 }, // Blue peak
        { wavelength: 500, intensity: 40 },
        { wavelength: 550, intensity: 50 },
        { wavelength: 600, intensity: 45 },
        { wavelength: 660, intensity: 90 }, // Red peak
        { wavelength: 700, intensity: 30 },
        { wavelength: 730, intensity: 25 }, // Far red
        { wavelength: 750, intensity: 15 },
        { wavelength: 800, intensity: 5 }
      ]
    }
    
    // Convert flux to normalized intensities (0-100 scale)
    const blueIntensity = (fixture.blueFlux / totalFlux) * 100
    const greenIntensity = (fixture.greenFlux / totalFlux) * 100
    const redIntensity = (fixture.redFlux / totalFlux) * 100
    const farRedIntensity = (fixture.farRedFlux / totalFlux) * 100
    
    return [
      { wavelength: 380, intensity: 5 },
      { wavelength: 400, intensity: blueIntensity * 0.3 },
      { wavelength: 450, intensity: blueIntensity }, // Blue peak
      { wavelength: 500, intensity: greenIntensity * 0.6 },
      { wavelength: 550, intensity: greenIntensity }, // Green peak
      { wavelength: 600, intensity: redIntensity * 0.4 },
      { wavelength: 660, intensity: redIntensity }, // Red peak
      { wavelength: 700, intensity: farRedIntensity * 0.6 },
      { wavelength: 730, intensity: farRedIntensity }, // Far red peak
      { wavelength: 750, intensity: farRedIntensity * 0.4 },
      { wavelength: 800, intensity: 5 }
    ]
  }

  const currentData = selectedSpectrum === 'dlc_fixture' && selectedDLCFixture
    ? generateDLCSpectrum(selectedDLCFixture)
    : spectrumData[selectedSpectrum as keyof typeof spectrumData] || spectrumData.led_full

  // Calculate metrics
  const calculateMetrics = (data: any[]) => {
    const blue = data.filter(d => d.wavelength >= 400 && d.wavelength <= 500)
      .reduce((sum, d) => sum + d.intensity, 0)
    const green = data.filter(d => d.wavelength > 500 && d.wavelength <= 600)
      .reduce((sum, d) => sum + d.intensity, 0)
    const red = data.filter(d => d.wavelength > 600 && d.wavelength <= 700)
      .reduce((sum, d) => sum + d.intensity, 0)
    const farRed = data.filter(d => d.wavelength > 700 && d.wavelength <= 800)
      .reduce((sum, d) => sum + d.intensity, 0)
    
    const total = blue + green + red + farRed
    
    return {
      blue: ((blue / total) * 100).toFixed(1),
      green: ((green / total) * 100).toFixed(1),
      red: ((red / total) * 100).toFixed(1),
      farRed: ((farRed / total) * 100).toFixed(1),
      redFarRedRatio: (red / farRed).toFixed(2)
    }
  }

  const metrics = calculateMetrics(currentData)

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Spectrum Analysis
                </h1>
                <p className="text-gray-400 mt-1">Compare light spectrums and photosynthetic response</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Controls */}
            <div className="lg:col-span-1 space-y-4">
              {/* Light Source Selection */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700">
                <h3 className="text-white font-semibold mb-4">Light Source</h3>
                <div className="space-y-2">
                  {[
                    { value: 'led_full', label: 'Full Spectrum LED', icon: '💡' },
                    { value: 'hps', label: 'HPS (High Pressure Sodium)', icon: '🔶' },
                    { value: 'cmh', label: 'CMH (Ceramic Metal Halide)', icon: '⚪' },
                    { value: 'sunlight', label: 'Natural Sunlight', icon: '☀️' },
                    { value: 'dlc_fixture', label: 'DLC Fixture Data', icon: '🏭' }
                  ].map(source => (
                    <button
                      key={source.value}
                      onClick={() => setSelectedSpectrum(source.value as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        selectedSpectrum === source.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{source.icon}</span>
                      <span className="text-sm font-medium">{source.label}</span>
                    </button>
                  ))}
                </div>
                
                {/* DLC Fixture Selection */}
                {selectedSpectrum === 'dlc_fixture' && (
                  <div className="mt-4 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search fixtures..."
                        value={fixtureSearch}
                        onChange={(e) => setFixtureSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    
                    {loadingFixtures ? (
                      <div className="text-center text-gray-400 py-4">Loading fixtures...</div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto space-y-1 bg-gray-800/30 rounded-lg p-2 border border-gray-700">
                        {dlcFixtures
                          .filter(fixture => 
                            !fixtureSearch || 
                            fixture.brand.toLowerCase().includes(fixtureSearch.toLowerCase()) ||
                            fixture.manufacturer.toLowerCase().includes(fixtureSearch.toLowerCase()) ||
                            fixture.modelNumber.toLowerCase().includes(fixtureSearch.toLowerCase())
                          )
                          .slice(0, 20)
                          .map(fixture => (
                            <button
                              key={fixture.id}
                              onClick={() => setSelectedDLCFixture(fixture)}
                              className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all border ${
                                selectedDLCFixture?.id === fixture.id
                                  ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25'
                                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <div className="font-medium truncate">{fixture.manufacturer}</div>
                              <div className="text-xs text-gray-400 truncate">{fixture.modelNumber}</div>
                              {fixture.reportedPPF > 0 && (
                                <div className="text-xs text-purple-400 mt-1">
                                  {fixture.reportedPPF.toFixed(0)} PPF
                                </div>
                              )}
                              {/* Show flux distribution if available */}
                              {(fixture.blueFlux + fixture.greenFlux + fixture.redFlux + fixture.farRedFlux) > 0 && (
                                <div className="text-xs text-gray-500 mt-1 flex gap-1">
                                  <span className="text-blue-400">B:{(fixture.blueFlux/(fixture.blueFlux + fixture.greenFlux + fixture.redFlux + fixture.farRedFlux)*100).toFixed(0)}%</span>
                                  <span className="text-red-400">R:{(fixture.redFlux/(fixture.blueFlux + fixture.greenFlux + fixture.redFlux + fixture.farRedFlux)*100).toFixed(0)}%</span>
                                </div>
                              )}
                            </button>
                          ))}
                        {dlcFixtures.length === 0 && (
                          <div className="text-center text-gray-400 py-4">No fixtures available</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Display Options */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4">Display Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPAR}
                      onChange={(e) => setShowPAR(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-300">Show PAR Curve</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compareMode}
                      onChange={(e) => setCompareMode(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-300">Compare Mode</span>
                  </label>
                </div>
                
                {compareMode && (
                  <div className="mt-4 space-y-3">
                    <label className="text-xs text-gray-400">Compare with:</label>
                    <select
                      value={compareSpectrum}
                      onChange={(e) => setCompareSpectrum(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    >
                      <option value="sunlight">Sunlight</option>
                      <option value="hps">HPS</option>
                      <option value="cmh">CMH</option>
                      <option value="led_full">Full Spectrum LED</option>
                      <option value="dlc_fixture">DLC Fixture</option>
                    </select>
                    
                    {compareSpectrum === 'dlc_fixture' && (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search fixtures..."
                            value={fixtureSearch}
                            onChange={(e) => setFixtureSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        
                        <div className="max-h-48 overflow-y-auto space-y-1 bg-gray-800/30 rounded-lg p-2 border border-gray-700">
                          {dlcFixtures
                            .filter(fixture => 
                              !fixtureSearch || 
                              fixture.brand.toLowerCase().includes(fixtureSearch.toLowerCase()) ||
                              fixture.manufacturer.toLowerCase().includes(fixtureSearch.toLowerCase()) ||
                              fixture.modelNumber.toLowerCase().includes(fixtureSearch.toLowerCase())
                            )
                            .slice(0, 15)
                            .map(fixture => (
                              <button
                                key={fixture.id}
                                onClick={() => setCompareDLCFixture(fixture)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border ${
                                  compareDLCFixture?.id === fixture.id
                                    ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-500/25'
                                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border-gray-700 hover:border-gray-600'
                                }`}
                              >
                                <div className="font-medium truncate">{fixture.manufacturer}</div>
                                <div className="text-xs text-gray-400 truncate">{fixture.modelNumber}</div>
                                {fixture.reportedPPF > 0 && (
                                  <div className="text-xs text-orange-400 mt-1">
                                    {fixture.reportedPPF.toFixed(0)} PPF
                                  </div>
                                )}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Spectrum Metrics */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4">Spectrum Breakdown</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-400">Blue (400-500nm)</span>
                      <span className="text-white font-medium">{metrics.blue}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${metrics.blue}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-400">Green (500-600nm)</span>
                      <span className="text-white font-medium">{metrics.green}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${metrics.green}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-400">Red (600-700nm)</span>
                      <span className="text-white font-medium">{metrics.red}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500"
                        style={{ width: `${metrics.red}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-orange-400">Far Red (700-800nm)</span>
                      <span className="text-white font-medium">{metrics.farRed}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500"
                        style={{ width: `${metrics.farRed}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">R:FR Ratio</span>
                    <span className="text-white font-medium">{metrics.redFarRedRatio}:1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spectrum Graph */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-6">Spectral Power Distribution</h3>
                
                {/* Graph Container */}
                <div className="relative h-96 bg-black/50 rounded-lg p-4">
                  <svg className="w-full h-full" viewBox="0 0 800 400">
                    {/* Grid */}
                    <g className="opacity-20">
                      {[0, 100, 200, 300, 400, 500, 600, 700].map(x => (
                        <line
                          key={x}
                          x1={x + 50}
                          y1="20"
                          x2={x + 50}
                          y2="350"
                          stroke="white"
                          strokeWidth="1"
                        />
                      ))}
                      {[0, 50, 100, 150, 200, 250, 300].map(y => (
                        <line
                          key={y}
                          x1="50"
                          y1={y + 50}
                          x2="750"
                          y2={y + 50}
                          stroke="white"
                          strokeWidth="1"
                        />
                      ))}
                    </g>

                    {/* Spectrum bands background */}
                    <rect x="50" y="50" width="100" height="300" fill="url(#blueGradient)" opacity="0.1" />
                    <rect x="150" y="50" width="150" height="300" fill="url(#greenGradient)" opacity="0.1" />
                    <rect x="300" y="50" width="200" height="300" fill="url(#redGradient)" opacity="0.1" />
                    <rect x="500" y="50" width="250" height="300" fill="url(#farRedGradient)" opacity="0.1" />

                    {/* PAR Curve */}
                    {showPAR && (
                      <path
                        d={`M ${parData.map((d, i) => 
                          `${50 + ((d.wavelength - 380) / 420) * 700},${350 - (d.absorption / 100) * 300}`
                        ).join(' L ')}`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.8"
                      />
                    )}

                    {/* Main spectrum curve */}
                    <path
                      d={`M ${currentData.map((d, i) => 
                        `${50 + ((d.wavelength - 380) / 420) * 700},${350 - (d.intensity / 100) * 300}`
                      ).join(' L ')}`}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3"
                    />

                    {/* Compare spectrum */}
                    {compareMode && (
                      <path
                        d={`M ${(compareSpectrum === 'dlc_fixture' && compareDLCFixture
                          ? generateDLCSpectrum(compareDLCFixture)
                          : spectrumData[compareSpectrum as keyof typeof spectrumData] || spectrumData.sunlight
                        ).map((d, i) => 
                          `${50 + ((d.wavelength - 380) / 420) * 700},${350 - (d.intensity / 100) * 300}`
                        ).join(' L ')}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="8,4"
                      />
                    )}

                    {/* Axes */}
                    <line x1="50" y1="350" x2="750" y2="350" stroke="white" strokeWidth="2" />
                    <line x1="50" y1="50" x2="50" y2="350" stroke="white" strokeWidth="2" />

                    {/* X-axis labels */}
                    <text x="50" y="380" fill="white" fontSize="12" textAnchor="middle">380</text>
                    <text x="150" y="380" fill="white" fontSize="12" textAnchor="middle">450</text>
                    <text x="250" y="380" fill="white" fontSize="12" textAnchor="middle">500</text>
                    <text x="350" y="380" fill="white" fontSize="12" textAnchor="middle">550</text>
                    <text x="450" y="380" fill="white" fontSize="12" textAnchor="middle">600</text>
                    <text x="550" y="380" fill="white" fontSize="12" textAnchor="middle">650</text>
                    <text x="650" y="380" fill="white" fontSize="12" textAnchor="middle">700</text>
                    <text x="750" y="380" fill="white" fontSize="12" textAnchor="middle">800</text>

                    {/* Y-axis labels */}
                    <text x="30" y="355" fill="white" fontSize="12" textAnchor="end">0</text>
                    <text x="30" y="255" fill="white" fontSize="12" textAnchor="end">33</text>
                    <text x="30" y="155" fill="white" fontSize="12" textAnchor="end">66</text>
                    <text x="30" y="55" fill="white" fontSize="12" textAnchor="end">100</text>

                    {/* Axis titles */}
                    <text x="400" y="400" fill="white" fontSize="14" textAnchor="middle">Wavelength (nm)</text>
                    <text x="15" y="200" fill="white" fontSize="14" textAnchor="middle" transform="rotate(-90 15 200)">Relative Intensity (%)</text>

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1e40af" />
                      </linearGradient>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient id="farRedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-purple-500" />
                    <span className="text-gray-300">
                      {selectedSpectrum === 'dlc_fixture' && selectedDLCFixture
                        ? `${selectedDLCFixture.manufacturer} ${selectedDLCFixture.modelNumber}`
                        : selectedSpectrum.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {showPAR && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-green-500" style={{ borderTop: '2px dashed' }} />
                      <span className="text-gray-300">PAR Response</span>
                    </div>
                  )}
                  {compareMode && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-orange-500" style={{ borderTop: '2px dashed' }} />
                      <span className="text-gray-300">
                        {compareSpectrum === 'dlc_fixture' && compareDLCFixture
                          ? `${compareDLCFixture.manufacturer} ${compareDLCFixture.modelNumber}`
                          : compareSpectrum.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Growth Stage Recommendations */}
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Leaf className="w-6 h-6 text-green-400" />
                    <h4 className="text-white font-semibold">Vegetative</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Higher blue content promotes compact growth and strong stems.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ideal Blue:</span>
                      <span className="text-blue-400 font-medium">20-30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">R:FR Ratio:</span>
                      <span className="text-white font-medium">1.5-2.0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Sun className="w-6 h-6 text-yellow-400" />
                    <h4 className="text-white font-semibold">Flowering</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Increased red spectrum enhances flowering and fruit development.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ideal Red:</span>
                      <span className="text-red-400 font-medium">30-40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">R:FR Ratio:</span>
                      <span className="text-white font-medium">2.5-4.0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Moon className="w-6 h-6 text-purple-400" />
                    <h4 className="text-white font-semibold">End of Day</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">
                    Far-red treatment can trigger flowering responses.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Far Red:</span>
                      <span className="text-orange-400 font-medium">10-15min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timing:</span>
                      <span className="text-white font-medium">After lights off</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}