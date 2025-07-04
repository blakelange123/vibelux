"use client"
import { useState } from 'react'
import {
  Leaf,
  BarChart3,
  Beaker,
  TrendingUp,
  Info,
  Download,
  Settings,
  Eye,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Activity,
  Zap
} from 'lucide-react'

interface WavelengthData {
  nm: number
  relativeQuantumEfficiency: number
  mcCreeCurve: number
  photonFlux: number
  weightedFlux: number
}

interface CropActionSpectrum {
  name: string
  description: string
  data: { [wavelength: number]: number }
}

export function PhotosyntheticCalculator() {
  const [spectrumData, setSpectrumData] = useState<WavelengthData[]>([])
  const [selectedCrop, setSelectedCrop] = useState<string>('universal')
  const [ppfd, setPpfd] = useState<number>(500)
  const [calculationResults, setCalculationResults] = useState({
    ypf: 0,
    ppe: 0,
    ppf: 0,
    efficacy: 0,
    dli: 0,
    photoperiod: 12
  })

  // McCree curve data (relative quantum efficiency)
  const mcCreeCurve: { [key: number]: number } = {
    400: 0.25, 410: 0.30, 420: 0.42, 430: 0.55, 440: 0.68, 450: 0.82,
    460: 0.88, 470: 0.91, 480: 0.92, 490: 0.91, 500: 0.88, 510: 0.85,
    520: 0.82, 530: 0.80, 540: 0.78, 550: 0.75, 560: 0.72, 570: 0.68,
    580: 0.65, 590: 0.62, 600: 0.60, 610: 0.68, 620: 0.82, 630: 0.88,
    640: 0.91, 650: 0.94, 660: 0.96, 670: 0.98, 680: 0.99, 690: 1.00,
    700: 0.95, 710: 0.35, 720: 0.15, 730: 0.08, 740: 0.03, 750: 0.01
  }

  // Crop-specific action spectra
  const cropSpectra: { [key: string]: CropActionSpectrum } = {
    universal: {
      name: 'Universal (McCree)',
      description: 'General photosynthesis action spectrum',
      data: mcCreeCurve
    },
    lettuce: {
      name: 'Lettuce',
      description: 'Optimized for leafy greens',
      data: {
        400: 0.20, 410: 0.25, 420: 0.38, 430: 0.52, 440: 0.65, 450: 0.85,
        460: 0.90, 470: 0.92, 480: 0.91, 490: 0.88, 500: 0.85, 510: 0.82,
        520: 0.78, 530: 0.75, 540: 0.72, 550: 0.68, 560: 0.65, 570: 0.62,
        580: 0.58, 590: 0.55, 600: 0.52, 610: 0.65, 620: 0.85, 630: 0.92,
        640: 0.95, 650: 0.97, 660: 0.99, 670: 1.00, 680: 0.98, 690: 0.95,
        700: 0.88, 710: 0.25, 720: 0.10, 730: 0.05, 740: 0.02, 750: 0.01
      }
    },
    tomato: {
      name: 'Tomato',
      description: 'Fruiting crops with high red response',
      data: {
        400: 0.22, 410: 0.28, 420: 0.40, 430: 0.53, 440: 0.66, 450: 0.80,
        460: 0.86, 470: 0.88, 480: 0.89, 490: 0.87, 500: 0.84, 510: 0.81,
        520: 0.78, 530: 0.76, 540: 0.74, 550: 0.71, 560: 0.68, 570: 0.65,
        580: 0.62, 590: 0.60, 600: 0.58, 610: 0.70, 620: 0.87, 630: 0.93,
        640: 0.96, 650: 0.98, 660: 1.00, 670: 1.00, 680: 0.97, 690: 0.92,
        700: 0.85, 710: 0.30, 720: 0.12, 730: 0.06, 740: 0.02, 750: 0.01
      }
    },
    cannabis: {
      name: 'Cannabis',
      description: 'High-value crops with broad spectrum response',
      data: {
        400: 0.30, 410: 0.35, 420: 0.45, 430: 0.58, 440: 0.70, 450: 0.83,
        460: 0.87, 470: 0.90, 480: 0.91, 490: 0.90, 500: 0.87, 510: 0.84,
        520: 0.81, 530: 0.79, 540: 0.77, 550: 0.74, 560: 0.71, 570: 0.68,
        580: 0.65, 590: 0.63, 600: 0.62, 610: 0.72, 620: 0.86, 630: 0.91,
        640: 0.94, 650: 0.96, 660: 0.98, 670: 0.99, 680: 0.98, 690: 0.96,
        700: 0.92, 710: 0.40, 720: 0.18, 730: 0.10, 740: 0.04, 750: 0.02
      }
    }
  }

  const calculateYPF = () => {
    // Example spectrum distribution (would come from actual fixture data)
    const exampleSpectrum = {
      blue: 20, // 400-500nm
      green: 10, // 500-600nm
      red: 65, // 600-700nm
      farRed: 5 // 700-800nm
    }

    let totalYPF = 0
    const totalPPF = ppfd
    const selectedSpectrum = cropSpectra[selectedCrop].data

    // Calculate weighted photon flux for each wavelength range
    Object.entries(selectedSpectrum).forEach(([wavelength, efficiency]) => {
      const nm = parseInt(wavelength)
      let rangePercentage = 0
      
      if (nm >= 400 && nm < 500) rangePercentage = exampleSpectrum.blue / 100
      else if (nm >= 500 && nm < 600) rangePercentage = exampleSpectrum.green / 100
      else if (nm >= 600 && nm < 700) rangePercentage = exampleSpectrum.red / 100
      else if (nm >= 700 && nm < 750) rangePercentage = exampleSpectrum.farRed / 100
      
      const photonFlux = totalPPF * rangePercentage / 10 // Distribute across 10nm bands
      const weightedFlux = photonFlux * efficiency
      totalYPF += weightedFlux
    })

    // Calculate PPE (Photosynthetic Photon Efficacy)
    const ppe = totalYPF / totalPPF
    const dli = (ppfd * calculationResults.photoperiod * 3600) / 1000000

    setCalculationResults({
      ypf: Math.round(totalYPF),
      ppe: Math.round(ppe * 100) / 100,
      ppf: ppfd,
      efficacy: Math.round(ppe * 2.3 * 100) / 100, // μmol/J
      dli: Math.round(dli * 10) / 10,
      photoperiod: calculationResults.photoperiod
    })
  }

  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 0.9) return 'text-green-400'
    if (efficiency >= 0.7) return 'text-yellow-400'
    if (efficiency >= 0.5) return 'text-orange-400'
    return 'text-red-400'
  }

  const exportResults = () => {
    const data = {
      crop: cropSpectra[selectedCrop].name,
      ppfd: ppfd,
      ypf: calculationResults.ypf,
      ppe: calculationResults.ppe,
      efficacy: calculationResults.efficacy,
      dli: calculationResults.dli,
      spectrum: cropSpectra[selectedCrop].data,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ypf-analysis-${selectedCrop}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Photosynthetic Efficiency Calculator</h1>
          <p className="text-gray-400">Calculate YPF, PPE, and crop-specific photosynthetic efficiency</p>
        </div>
        <button
          onClick={exportResults}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Analysis
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Understanding YPF (Yield Photon Flux)</p>
            <p>YPF weights photon flux by the relative quantum efficiency of photosynthesis at each wavelength. 
            This provides a more accurate measure of a light source's effectiveness for plant growth than raw PPFD.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Crop Selection */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-400" />
              Crop Selection
            </h3>
            <div className="space-y-2">
              {Object.entries(cropSpectra).map(([key, spectrum]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCrop(key)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedCrop === key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <p className="font-medium">{spectrum.name}</p>
                  <p className="text-sm opacity-80">{spectrum.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Input Values */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400" />
              Parameters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  PPFD (μmol/m²/s)
                </label>
                <input
                  type="number"
                  value={ppfd}
                  onChange={(e) => setPpfd(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Photoperiod (hours)
                </label>
                <input
                  type="number"
                  value={calculationResults.photoperiod}
                  onChange={(e) => setCalculationResults({
                    ...calculationResults,
                    photoperiod: Number(e.target.value)
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-gray-100"
                />
              </div>
              
              <button
                onClick={calculateYPF}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Calculate
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">YPF</span>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-2xl font-semibold text-gray-100">
                {calculationResults.ypf}
              </p>
              <p className="text-xs text-gray-400 mt-1">μmol/m²/s</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">PPE</span>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-semibold text-gray-100">
                {calculationResults.ppe}
              </p>
              <p className="text-xs text-gray-400 mt-1">YPF/PPF ratio</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Efficacy</span>
                <Lightbulb className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-semibold text-gray-100">
                {calculationResults.efficacy}
              </p>
              <p className="text-xs text-gray-400 mt-1">μmol/J</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">DLI</span>
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-semibold text-gray-100">
                {calculationResults.dli}
              </p>
              <p className="text-xs text-gray-400 mt-1">mol/m²/day</p>
            </div>
          </div>

          {/* Action Spectrum Visualization */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Action Spectrum - {cropSpectra[selectedCrop].name}
            </h3>
            
            <div className="space-y-4">
              {/* Wavelength ranges */}
              <div className="grid grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <p className="text-gray-400 mb-1">UV/Blue</p>
                  <p className="text-blue-400 font-medium">400-500nm</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Green</p>
                  <p className="text-green-400 font-medium">500-600nm</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Red</p>
                  <p className="text-red-400 font-medium">600-700nm</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Far-Red</p>
                  <p className="text-red-600 font-medium">700-750nm</p>
                </div>
              </div>

              {/* Efficiency visualization */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="space-y-2">
                  {[400, 450, 500, 550, 600, 650, 700].map(wavelength => {
                    const efficiency = cropSpectra[selectedCrop].data[wavelength] || 0
                    return (
                      <div key={wavelength} className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 w-16">{wavelength}nm</span>
                        <div className="flex-1 bg-gray-600 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              wavelength < 500 ? 'bg-blue-500' :
                              wavelength < 600 ? 'bg-green-500' :
                              wavelength < 700 ? 'bg-red-500' :
                              'bg-red-700'
                            }`}
                            style={{ width: `${efficiency * 100}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium w-12 text-right ${getEfficiencyColor(efficiency)}`}>
                          {(efficiency * 100).toFixed(0)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Interpretation */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-100 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  Interpretation
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• PPE Score: {calculationResults.ppe >= 0.85 ? (
                    <span className="text-green-400">Excellent - Highly efficient spectrum for {cropSpectra[selectedCrop].name}</span>
                  ) : calculationResults.ppe >= 0.75 ? (
                    <span className="text-yellow-400">Good - Well-suited spectrum with room for optimization</span>
                  ) : (
                    <span className="text-orange-400">Fair - Consider spectrum adjustment for better efficiency</span>
                  )}</p>
                  
                  <p>• YPF indicates {calculationResults.ypf > calculationResults.ppf * 0.9 ? 
                    'spectrum is well-matched to photosynthetic response' : 
                    'potential for spectrum optimization'}</p>
                  
                  <p>• Efficacy of {calculationResults.efficacy} μmol/J is {
                    calculationResults.efficacy >= 2.5 ? 'industry-leading' :
                    calculationResults.efficacy >= 2.0 ? 'competitive' :
                    'below optimal'
                  }</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Optimization Recommendations
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-100">Spectrum Balance</p>
                  <p className="text-sm text-gray-400">
                    {calculationResults.ppe < 0.8 ? 
                      'Consider increasing red (660nm) and reducing green for higher efficiency' :
                      'Current spectrum is well-balanced for photosynthesis'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-100">Intensity Optimization</p>
                  <p className="text-sm text-gray-400">
                    Current DLI of {calculationResults.dli} mol/m²/day is {
                      calculationResults.dli < 12 ? 'low - consider increasing PPFD or photoperiod' :
                      calculationResults.dli < 20 ? 'moderate - suitable for most leafy greens' :
                      calculationResults.dli < 30 ? 'high - ideal for fruiting crops' :
                      'very high - monitor for light stress'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}