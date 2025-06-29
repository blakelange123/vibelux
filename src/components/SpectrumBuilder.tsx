"use client"
import { useState } from 'react'
import {
  Sliders,
  Plus,
  Minus,
  Save,
  Upload,
  Download,
  Eye,
  Lightbulb,
  BarChart3,
  Palette,
  Copy,
  Trash2,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Sun
} from 'lucide-react'

interface SpectrumPoint {
  wavelength: number
  intensity: number
  color: string
}

interface SpectrumProfile {
  id: string
  name: string
  description: string
  points: SpectrumPoint[]
  totalPPFD: number
  created: Date
}

interface FixtureSpectrum {
  id: string
  name: string
  manufacturer: string
  model: string
  spectrum: SpectrumPoint[]
  maxPPFD: number
  watts: number
}

export function SpectrumBuilder() {
  const [customSpectrum, setCustomSpectrum] = useState<SpectrumPoint[]>(
    generateDefaultSpectrum()
  )
  const [savedProfiles, setSavedProfiles] = useState<SpectrumProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<SpectrumProfile | null>(null)
  const [mixingFixtures, setMixingFixtures] = useState<{ fixture: FixtureSpectrum; quantity: number; dimming: number }[]>([])
  const [targetPPFD, setTargetPPFD] = useState<number>(500)
  const [profileName, setProfileName] = useState<string>('')

  // Available fixtures for mixing
  const availableFixtures: FixtureSpectrum[] = [
    {
      id: '1',
      name: 'Full Spectrum LED',
      manufacturer: 'Fluence',
      model: 'SPYDR 2p',
      spectrum: generateFixtureSpectrum('full'),
      maxPPFD: 1700,
      watts: 645
    },
    {
      id: '2',
      name: 'Red/Blue LED',
      manufacturer: 'Gavita',
      model: '1700e',
      spectrum: generateFixtureSpectrum('redblue'),
      maxPPFD: 1700,
      watts: 645
    },
    {
      id: '3',
      name: 'Far-Red Supplement',
      manufacturer: 'Valoya',
      model: 'FR74',
      spectrum: generateFixtureSpectrum('farred'),
      maxPPFD: 150,
      watts: 74
    },
    {
      id: '4',
      name: 'UV Supplement',
      manufacturer: 'California Lightworks',
      model: 'UVB',
      spectrum: generateFixtureSpectrum('uv'),
      maxPPFD: 50,
      watts: 40
    }
  ]

  function generateDefaultSpectrum(): SpectrumPoint[] {
    const points: SpectrumPoint[] = []
    for (let wavelength = 380; wavelength <= 780; wavelength += 10) {
      let intensity = 0
      let color = '#000000'
      
      // Generate a typical full spectrum LED profile
      if (wavelength >= 440 && wavelength <= 460) {
        intensity = 0.8 // Blue peak
        color = '#0000FF'
      } else if (wavelength >= 630 && wavelength <= 670) {
        intensity = 1.0 // Red peak
        color = '#FF0000'
      } else if (wavelength >= 500 && wavelength <= 600) {
        intensity = 0.3 // Green valley
        color = wavelength < 550 ? '#00FF00' : '#FFFF00'
      } else if (wavelength >= 700 && wavelength <= 750) {
        intensity = 0.1 // Far-red tail
        color = '#8B0000'
      }
      
      points.push({ wavelength, intensity, color })
    }
    return points
  }

  function generateFixtureSpectrum(type: string): SpectrumPoint[] {
    const points: SpectrumPoint[] = []
    for (let wavelength = 380; wavelength <= 780; wavelength += 10) {
      let intensity = 0
      const color = getWavelengthColor(wavelength)
      
      switch (type) {
        case 'full':
          if (wavelength >= 440 && wavelength <= 460) intensity = 0.7
          else if (wavelength >= 630 && wavelength <= 670) intensity = 1.0
          else if (wavelength >= 500 && wavelength <= 600) intensity = 0.4
          else if (wavelength >= 700 && wavelength <= 730) intensity = 0.15
          break
        
        case 'redblue':
          if (wavelength >= 440 && wavelength <= 460) intensity = 0.8
          else if (wavelength >= 630 && wavelength <= 670) intensity = 1.0
          else intensity = 0.05
          break
        
        case 'farred':
          if (wavelength >= 720 && wavelength <= 740) intensity = 1.0
          else if (wavelength >= 700 && wavelength <= 760) intensity = 0.5
          break
        
        case 'uv':
          if (wavelength >= 380 && wavelength <= 400) intensity = 1.0
          else if (wavelength >= 400 && wavelength <= 420) intensity = 0.5
          break
      }
      
      points.push({ wavelength, intensity, color })
    }
    return points
  }

  function getWavelengthColor(wavelength: number): string {
    if (wavelength < 440) return '#8B00FF' // Violet
    if (wavelength < 485) return '#0000FF' // Blue
    if (wavelength < 500) return '#00FFFF' // Cyan
    if (wavelength < 565) return '#00FF00' // Green
    if (wavelength < 590) return '#FFFF00' // Yellow
    if (wavelength < 625) return '#FFA500' // Orange
    if (wavelength < 700) return '#FF0000' // Red
    return '#8B0000' // Far-red
  }

  const updateSpectrumPoint = (wavelength: number, intensity: number) => {
    setCustomSpectrum(spectrum =>
      spectrum.map(point =>
        point.wavelength === wavelength
          ? { ...point, intensity: Math.max(0, Math.min(1, intensity)) }
          : point
      )
    )
  }

  const calculateMixedSpectrum = (): SpectrumPoint[] => {
    const mixedSpectrum: SpectrumPoint[] = generateDefaultSpectrum().map(p => ({ ...p, intensity: 0 }))
    
    mixingFixtures.forEach(({ fixture, quantity, dimming }) => {
      fixture.spectrum.forEach((point, index) => {
        if (mixedSpectrum[index]) {
          mixedSpectrum[index].intensity += point.intensity * quantity * (dimming / 100)
        }
      })
    })
    
    // Normalize to max intensity of 1
    const maxIntensity = Math.max(...mixedSpectrum.map(p => p.intensity))
    if (maxIntensity > 0) {
      mixedSpectrum.forEach(p => p.intensity /= maxIntensity)
    }
    
    return mixedSpectrum
  }

  const calculateTotalPPFD = (spectrum: SpectrumPoint[]): number => {
    return spectrum.reduce((total, point) => {
      if (point.wavelength >= 400 && point.wavelength <= 700) {
        return total + point.intensity * 10 // Simplified calculation
      }
      return total
    }, 0)
  }

  const saveProfile = () => {
    if (!profileName) return
    
    const newProfile: SpectrumProfile = {
      id: Date.now().toString(),
      name: profileName,
      description: `Custom spectrum profile`,
      points: customSpectrum,
      totalPPFD: calculateTotalPPFD(customSpectrum),
      created: new Date()
    }
    
    setSavedProfiles([...savedProfiles, newProfile])
    setProfileName('')
  }

  const loadProfile = (profile: SpectrumProfile) => {
    setCustomSpectrum(profile.points)
    setSelectedProfile(profile)
  }

  const addFixtureToMix = (fixture: FixtureSpectrum) => {
    setMixingFixtures([...mixingFixtures, { fixture, quantity: 1, dimming: 100 }])
  }

  const updateMixingFixture = (index: number, field: 'quantity' | 'dimming', value: number) => {
    setMixingFixtures(fixtures =>
      fixtures.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      )
    )
  }

  const removeMixingFixture = (index: number) => {
    setMixingFixtures(fixtures => fixtures.filter((_, i) => i !== index))
  }

  const exportSpectrum = () => {
    const data = {
      name: profileName || 'Custom Spectrum',
      spectrum: customSpectrum,
      totalPPFD: calculateTotalPPFD(customSpectrum),
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spectrum-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Spectrum Builder & Mixing Calculator</h1>
          <p className="text-gray-400">Design custom spectrums and calculate multi-fixture combinations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportSpectrum}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spectrum Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Custom Spectrum Builder */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" />
                Custom Spectrum Editor
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Profile name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-purple-500 text-gray-100 text-sm"
                />
                <button
                  onClick={saveProfile}
                  disabled={!profileName}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Spectrum Visualization */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <div className="h-48 relative">
                {customSpectrum.map((point, index) => (
                  <div
                    key={point.wavelength}
                    className="absolute bottom-0"
                    style={{
                      left: `${(index / customSpectrum.length) * 100}%`,
                      width: `${100 / customSpectrum.length}%`,
                      height: `${point.intensity * 100}%`,
                      backgroundColor: point.color,
                      opacity: 0.8
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>380nm</span>
                <span>480nm</span>
                <span>580nm</span>
                <span>680nm</span>
                <span>780nm</span>
              </div>
            </div>

            {/* Wavelength Sliders */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {customSpectrum.filter((_, i) => i % 2 === 0).map(point => (
                <div key={point.wavelength} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-16">{point.wavelength}nm</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={point.intensity}
                    onChange={(e) => updateSpectrumPoint(point.wavelength, parseFloat(e.target.value))}
                    className="flex-1"
                    style={{
                      background: `linear-gradient(to right, ${point.color}00, ${point.color})`
                    }}
                  />
                  <span className="text-sm text-gray-100 w-12 text-right">
                    {Math.round(point.intensity * 100)}%
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setCustomSpectrum(generateFixtureSpectrum('full'))}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Full Spectrum
              </button>
              <button
                onClick={() => setCustomSpectrum(generateFixtureSpectrum('redblue'))}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Red/Blue
              </button>
              <button
                onClick={() => setCustomSpectrum(generateDefaultSpectrum())}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Fixture Mixing Calculator */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Multi-Fixture Mixing
            </h2>

            {/* Available Fixtures */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-400 mb-2">Add Fixtures to Mix</p>
              <div className="grid grid-cols-2 gap-2">
                {availableFixtures.map(fixture => (
                  <button
                    key={fixture.id}
                    onClick={() => addFixtureToMix(fixture)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-100">{fixture.name}</p>
                    <p className="text-xs text-gray-400">{fixture.manufacturer} {fixture.model}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Mixed Fixtures List */}
            {mixingFixtures.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-400">Fixture Mix</p>
                {mixingFixtures.map((item, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-100">{item.fixture.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.fixture.maxPPFD} PPFD max • {item.fixture.watts}W
                        </p>
                      </div>
                      <button
                        onClick={() => removeMixingFixture(index)}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateMixingFixture(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Dimming %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.dimming}
                          onChange={(e) => updateMixingFixture(index, 'dimming', parseInt(e.target.value))}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-purple-500 text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mixed Spectrum Result */}
                <div className="bg-gray-900 rounded-lg p-3 mt-4">
                  <p className="text-sm font-medium text-gray-100 mb-2">Mixed Spectrum Result</p>
                  <div className="h-32 relative mb-2">
                    {calculateMixedSpectrum().map((point, index) => (
                      <div
                        key={point.wavelength}
                        className="absolute bottom-0"
                        style={{
                          left: `${(index / customSpectrum.length) * 100}%`,
                          width: `${100 / customSpectrum.length}%`,
                          height: `${point.intensity * 100}%`,
                          backgroundColor: point.color,
                          opacity: 0.8
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-gray-800 rounded p-2">
                      <p className="text-gray-400 text-xs">Total Fixtures</p>
                      <p className="text-gray-100 font-medium">
                        {mixingFixtures.reduce((sum, f) => sum + f.quantity, 0)}
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded p-2">
                      <p className="text-gray-400 text-xs">Total Power</p>
                      <p className="text-gray-100 font-medium">
                        {mixingFixtures.reduce((sum, f) => sum + f.fixture.watts * f.quantity * (f.dimming / 100), 0).toFixed(0)}W
                      </p>
                    </div>
                    <div className="bg-gray-800 rounded p-2">
                      <p className="text-gray-400 text-xs">Est. PPFD</p>
                      <p className="text-gray-100 font-medium">
                        {mixingFixtures.reduce((sum, f) => sum + f.fixture.maxPPFD * f.quantity * (f.dimming / 100), 0).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Profiles & Analysis */}
        <div className="space-y-6">
          {/* Saved Profiles */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Save className="w-5 h-5 text-gray-400" />
              Saved Profiles
            </h3>
            
            {savedProfiles.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No saved profiles yet</p>
            ) : (
              <div className="space-y-2">
                {savedProfiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => loadProfile(profile)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedProfile?.id === profile.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-sm opacity-80">
                      {profile.totalPPFD.toFixed(0)} PPFD • {new Date(profile.created).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Spectrum Analysis */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Spectrum Analysis
            </h3>
            
            <div className="space-y-4">
              {/* PAR Distribution */}
              <div>
                <p className="text-sm font-medium text-gray-400 mb-2">PAR Distribution</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-400">Blue (400-500nm)</span>
                    <span className="text-gray-100">
                      {Math.round(
                        customSpectrum
                          .filter(p => p.wavelength >= 400 && p.wavelength < 500)
                          .reduce((sum, p) => sum + p.intensity, 0) / 10 * 100
                      )}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Green (500-600nm)</span>
                    <span className="text-gray-100">
                      {Math.round(
                        customSpectrum
                          .filter(p => p.wavelength >= 500 && p.wavelength < 600)
                          .reduce((sum, p) => sum + p.intensity, 0) / 10 * 100
                      )}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-400">Red (600-700nm)</span>
                    <span className="text-gray-100">
                      {Math.round(
                        customSpectrum
                          .filter(p => p.wavelength >= 600 && p.wavelength < 700)
                          .reduce((sum, p) => sum + p.intensity, 0) / 10 * 100
                      )}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Ratios */}
              <div>
                <p className="text-sm font-medium text-gray-400 mb-2">Key Ratios</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-700 rounded p-2">
                    <p className="text-xs text-gray-400">R:B Ratio</p>
                    <p className="text-lg font-medium text-gray-100">
                      {(
                        customSpectrum.filter(p => p.wavelength >= 600 && p.wavelength < 700).reduce((sum, p) => sum + p.intensity, 0) /
                        customSpectrum.filter(p => p.wavelength >= 400 && p.wavelength < 500).reduce((sum, p) => sum + p.intensity, 0)
                      ).toFixed(1)}:1
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded p-2">
                    <p className="text-xs text-gray-400">R:FR Ratio</p>
                    <p className="text-lg font-medium text-gray-100">
                      {(
                        customSpectrum.filter(p => p.wavelength >= 600 && p.wavelength < 700).reduce((sum, p) => sum + p.intensity, 0) /
                        customSpectrum.filter(p => p.wavelength >= 700 && p.wavelength < 800).reduce((sum, p) => sum + p.intensity, 0)
                      ).toFixed(1)}:1
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-300">
                    <p className="font-medium mb-1">Spectrum Insights</p>
                    <ul className="space-y-1">
                      <li>• R:B ratio optimal range: 2:1 to 5:1</li>
                      <li>• Add far-red for stem elongation</li>
                      <li>• UV can enhance secondary metabolites</li>
                    </ul>
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