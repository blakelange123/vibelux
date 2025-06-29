"use client"
import { useState, useEffect } from 'react'
import { 
  Beaker,
  Grid3x3,
  Target,
  BarChart3,
  Clock,
  Leaf,
  Settings,
  Copy,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface ExperimentalTreatment {
  id: string
  name: string
  description: string
  lightingParameters: {
    ppfd: number
    photoperiod: number
    spectrum: { [wavelength: number]: number }
    dli: number
  }
  environmentalParameters: {
    temperature: number
    humidity: number
    co2: number
    airflow: number
  }
  replicates: number
  duration: number // days
  samplingSchedule: {
    frequency: 'daily' | 'weekly' | 'biweekly'
    measurements: string[]
  }
}

interface ResearchPlot {
  id: string
  position: { x: number, y: number }
  size: { width: number, height: number }
  treatmentId: string
  status: 'planned' | 'active' | 'completed' | 'failed'
  plantingDate?: Date
  harvestDate?: Date
  measurements: {
    date: Date
    height: number
    leafArea: number
    biomass: number
    chlorophyll: number
    notes: string
  }[]
}

interface PropagationChamber {
  id: string
  name: string
  type: 'seed_germination' | 'cutting_propagation' | 'tissue_culture'
  dimensions: { width: number, length: number, height: number }
  environmentalControl: {
    temperatureRange: { min: number, max: number }
    humidityRange: { min: number, max: number }
    co2Control: boolean
    fogSystem: boolean
  }
  lightingSystem: {
    fixtures: Array<{
      type: 'led_panel' | 'fluorescent' | 'hps'
      power: number
      spectrum: { [wavelength: number]: number }
      coverage: number // percentage of chamber
      dimming: boolean
    }>
    photoperiod: number
    sunrise_sunset: boolean
  }
  monitoring: {
    sensors: string[]
    dataLogging: boolean
    alerts: boolean
  }
}

interface StatisticalAnalysis {
  anova: {
    fValue: number
    pValue: number
    significant: boolean
  }
  tTest: {
    [comparison: string]: {
      tValue: number
      pValue: number
      significant: boolean
    }
  }
  regression: {
    rSquared: number
    coefficients: { [variable: string]: number }
    equation: string
  }
}

interface ResearchPropagationToolsProps {
  room: { width: number, length: number }
  onExperimentUpdate: (experiment: any) => void
}

export function ResearchPropagationTools({
  room,
  onExperimentUpdate
}: ResearchPropagationToolsProps) {
  const [activeTab, setActiveTab] = useState<'design' | 'propagation' | 'analysis'>('design')
  const [treatments, setTreatments] = useState<ExperimentalTreatment[]>([])
  const [plots, setPlots] = useState<ResearchPlot[]>([])
  const [chambers, setChambers] = useState<PropagationChamber[]>([])
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<StatisticalAnalysis | null>(null)

  // Predefined research templates
  const researchTemplates = {
    light_intensity: {
      name: 'Light Intensity Study',
      description: 'Compare different PPFD levels',
      treatments: [
        { name: 'Low Light', ppfd: 200, description: '200 μmol/m²/s treatment' },
        { name: 'Medium Light', ppfd: 400, description: '400 μmol/m²/s treatment' },
        { name: 'High Light', ppfd: 600, description: '600 μmol/m²/s treatment' }
      ]
    },
    spectrum_optimization: {
      name: 'Spectrum Optimization',
      description: 'Test different red:blue ratios',
      treatments: [
        { name: 'High Blue', spectrum: { 450: 40, 660: 60 }, description: '40% blue, 60% red' },
        { name: 'Balanced', spectrum: { 450: 25, 660: 75 }, description: '25% blue, 75% red' },
        { name: 'Low Blue', spectrum: { 450: 15, 660: 85 }, description: '15% blue, 85% red' }
      ]
    },
    photoperiod: {
      name: 'Photoperiod Study',
      description: 'Compare day length effects',
      treatments: [
        { name: 'Short Day', photoperiod: 10, description: '10 hour photoperiod' },
        { name: 'Medium Day', photoperiod: 14, description: '14 hour photoperiod' },
        { name: 'Long Day', photoperiod: 18, description: '18 hour photoperiod' }
      ]
    },
    propagation_environment: {
      name: 'Propagation Environment',
      description: 'Optimal conditions for cuttings',
      treatments: [
        { name: 'Standard', temperature: 22, humidity: 70, description: 'Standard conditions' },
        { name: 'High Humidity', temperature: 22, humidity: 85, description: 'High humidity treatment' },
        { name: 'Warm + Humid', temperature: 26, humidity: 80, description: 'Warm and humid conditions' }
      ]
    }
  }

  // Create experimental treatment
  const createTreatment = (template?: string) => {
    const newTreatment: ExperimentalTreatment = {
      id: `treatment-${Date.now()}`,
      name: template ? researchTemplates[template as keyof typeof researchTemplates].name : 'New Treatment',
      description: template ? researchTemplates[template as keyof typeof researchTemplates].description : '',
      lightingParameters: {
        ppfd: 400,
        photoperiod: 16,
        spectrum: { 450: 20, 525: 5, 660: 70, 730: 5 },
        dli: 23.04
      },
      environmentalParameters: {
        temperature: 24,
        humidity: 65,
        co2: 400,
        airflow: 0.2
      },
      replicates: 4,
      duration: 30,
      samplingSchedule: {
        frequency: 'weekly',
        measurements: ['height', 'leafArea', 'biomass', 'chlorophyll']
      }
    }

    if (template) {
      const templateData = researchTemplates[template as keyof typeof researchTemplates]
      if (templateData.treatments) {
        // Create multiple treatments from template
        const newTreatments = templateData.treatments.map((t, index) => ({
          ...newTreatment,
          id: `treatment-${Date.now()}-${index}`,
          name: t.name,
          description: t.description,
          lightingParameters: {
            ...newTreatment.lightingParameters,
            ...('ppfd' in t && t.ppfd ? { ppfd: t.ppfd } : {}),
            ...('photoperiod' in t && t.photoperiod ? { photoperiod: t.photoperiod } : {}),
            ...('spectrum' in t && t.spectrum ? { spectrum: t.spectrum } : {})
          },
          environmentalParameters: {
            ...newTreatment.environmentalParameters,
            ...('temperature' in t && t.temperature ? { temperature: t.temperature } : {}),
            ...('humidity' in t && t.humidity ? { humidity: t.humidity } : {})
          }
        }))
        setTreatments([...treatments, ...newTreatments])
      }
    } else {
      setTreatments([...treatments, newTreatment])
    }
  }

  // Generate randomized plot layout
  const generatePlotLayout = (treatmentIds: string[], replicates: number) => {
    const newPlots: ResearchPlot[] = []
    const plotSize = { width: 1, height: 1 } // 1m x 1m plots
    const spacing = 0.5 // 0.5m spacing
    
    const plotsPerRow = Math.floor(room.width / (plotSize.width + spacing))
    
    // Create all plot combinations
    const allPlots: { treatmentId: string, replicate: number }[] = []
    treatmentIds.forEach(treatmentId => {
      for (let rep = 0; rep < replicates; rep++) {
        allPlots.push({ treatmentId, replicate: rep })
      }
    })

    // Randomize plot positions (complete randomized design)
    const shuffledPlots = [...allPlots].sort(() => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5)

    shuffledPlots.forEach((plot, index) => {
      const row = Math.floor(index / plotsPerRow)
      const col = index % plotsPerRow
      
      newPlots.push({
        id: `plot-${plot.treatmentId}-${plot.replicate}`,
        position: {
          x: col * (plotSize.width + spacing),
          y: row * (plotSize.height + spacing)
        },
        size: plotSize,
        treatmentId: plot.treatmentId,
        status: 'planned',
        measurements: []
      })
    })

    setPlots(newPlots)
  }

  // Create propagation chamber
  const createPropagationChamber = (type: PropagationChamber['type']) => {
    const chamberConfigs = {
      seed_germination: {
        name: 'Seed Germination Chamber',
        dimensions: { width: 1.2, length: 0.8, height: 0.6 },
        temperatureRange: { min: 20, max: 25 },
        humidityRange: { min: 80, max: 95 },
        photoperiod: 24 // continuous light
      },
      cutting_propagation: {
        name: 'Cutting Propagation Chamber',
        dimensions: { width: 1.5, length: 1.0, height: 1.0 },
        temperatureRange: { min: 22, max: 26 },
        humidityRange: { min: 85, max: 95 },
        photoperiod: 16
      },
      tissue_culture: {
        name: 'Tissue Culture Chamber',
        dimensions: { width: 0.8, length: 0.6, height: 0.8 },
        temperatureRange: { min: 24, max: 26 },
        humidityRange: { min: 60, max: 70 },
        photoperiod: 16
      }
    }

    const config = chamberConfigs[type]
    
    const newChamber: PropagationChamber = {
      id: `chamber-${Date.now()}`,
      name: config.name,
      type,
      dimensions: config.dimensions,
      environmentalControl: {
        temperatureRange: config.temperatureRange,
        humidityRange: config.humidityRange,
        co2Control: type === 'tissue_culture',
        fogSystem: type !== 'tissue_culture'
      },
      lightingSystem: {
        fixtures: [{
          type: 'led_panel',
          power: 50,
          spectrum: { 450: 25, 660: 70, 730: 5 },
          coverage: 100,
          dimming: true
        }],
        photoperiod: config.photoperiod,
        sunrise_sunset: type !== 'seed_germination'
      },
      monitoring: {
        sensors: ['temperature', 'humidity', 'light'],
        dataLogging: true,
        alerts: true
      }
    }

    setChambers([...chambers, newChamber])
  }

  // Simulate statistical analysis
  const performStatisticalAnalysis = () => {
    // Simulate data collection and analysis
    const mockAnalysis: StatisticalAnalysis = {
      anova: {
        fValue: 15.43,
        pValue: 0.0001,
        significant: true
      },
      tTest: {
        'Treatment1_vs_Treatment2': {
          tValue: 3.21,
          pValue: 0.012,
          significant: true
        },
        'Treatment1_vs_Treatment3': {
          tValue: 1.85,
          pValue: 0.089,
          significant: false
        }
      },
      regression: {
        rSquared: 0.78,
        coefficients: {
          'PPFD': 0.023,
          'Temperature': 1.45,
          'Humidity': -0.12
        },
        equation: 'Biomass = 0.023×PPFD + 1.45×Temperature - 0.12×Humidity + 12.3'
      }
    }

    setAnalysisResults(mockAnalysis)
  }

  // Export functions
  const exportResults = () => {
    if (!analysisResults) return;

    const exportData = {
      projectInfo: {
        name: 'Research Experiment',
        date: new Date().toISOString().split('T')[0],
        treatments: treatments.length,
        plots: plots.length,
        chambers: chambers.length
      },
      treatments: treatments,
      plots: plots,
      chambers: chambers,
      statisticalAnalysis: analysisResults,
      metadata: {
        roomDimensions: room,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
    };

    // Create CSV for statistical results
    const csvData = [
      ['Analysis Type', 'Metric', 'Value', 'Significant'],
      ['ANOVA', 'F-Value', analysisResults.anova.fValue.toString(), ''],
      ['ANOVA', 'P-Value', analysisResults.anova.pValue.toString(), analysisResults.anova.significant ? 'Yes' : 'No'],
      ['', '', '', ''],
      ['T-Test Comparisons', '', '', ''],
      ...Object.entries(analysisResults.tTest).map(([comparison, result]) => [
        comparison.replace('_', ' '),
        `t = ${result.tValue.toFixed(2)}`,
        `p = ${result.pValue.toFixed(3)}`,
        result.significant ? 'Yes' : 'No'
      ]),
      ['', '', '', ''],
      ['Regression', 'R-Squared', analysisResults.regression.rSquared.toString(), ''],
      ['Regression', 'Equation', analysisResults.regression.equation, ''],
      ...Object.entries(analysisResults.regression.coefficients).map(([variable, coefficient]) => [
        `Coefficient (${variable})`,
        coefficient.toString(),
        '',
        ''
      ])
    ];

    // Convert to CSV string
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    // Download CSV
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = `research_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    csvLink.click();

    // Download JSON
    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `research_experiment_${new Date().toISOString().split('T')[0]}.json`;
    jsonLink.click();
  };

  const exportExperimentDesign = () => {
    const designData = {
      experimentInfo: {
        name: 'Experimental Design',
        date: new Date().toISOString().split('T')[0],
        roomDimensions: room
      },
      treatments: treatments,
      plotLayout: plots,
      experimentalDesign: {
        designType: 'Completely Randomized Design',
        totalPlots: plots.length,
        treatmentCount: treatments.length,
        replicates: plots.length / treatments.length,
        plotSize: plots[0]?.size || { width: 1, height: 1 }
      }
    };

    const blob = new Blob([JSON.stringify(designData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experimental_design_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const exportPropagationSpecs = () => {
    const specsData = {
      propagationInfo: {
        name: 'Propagation Chamber Specifications',
        date: new Date().toISOString().split('T')[0],
        totalChambers: chambers.length
      },
      chambers: chambers.map(chamber => ({
        ...chamber,
        specifications: {
          volume: chamber.dimensions.width * chamber.dimensions.length * chamber.dimensions.height,
          lightingPower: chamber.lightingSystem.fixtures.reduce((sum, f) => sum + f.power, 0),
          recommendedCapacity: Math.floor(chamber.dimensions.width * chamber.dimensions.length * 10) // 10 plants per m²
        }
      }))
    };

    const blob = new Blob([JSON.stringify(specsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `propagation_specs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Render experimental design interface
  const renderExperimentalDesign = () => (
    <div className="space-y-6">
      {/* Research Templates */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Research Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(researchTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => createTreatment(key)}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
            >
              <h4 className="text-white font-medium">{template.name}</h4>
              <p className="text-sm text-gray-400 mt-1">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Treatment Management */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Experimental Treatments</h3>
          <div className="flex gap-2">
            <button
              onClick={() => createTreatment()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              Add Treatment
            </button>
            {treatments.length > 0 && (
              <>
                <button
                  onClick={() => generatePlotLayout(treatments.map(t => t.id), 4)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  Generate Layout
                </button>
                <button
                  onClick={exportExperimentDesign}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export Design
                </button>
              </>
            )}
          </div>
        </div>

        {treatments.length > 0 ? (
          <div className="space-y-3">
            {treatments.map(treatment => (
              <div
                key={treatment.id}
                className={`p-3 rounded border cursor-pointer transition-all ${
                  selectedTreatment === treatment.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 bg-gray-750 hover:border-gray-600'
                }`}
                onClick={() => setSelectedTreatment(treatment.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{treatment.name}</h4>
                    <p className="text-sm text-gray-400">{treatment.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>PPFD: {treatment.lightingParameters.ppfd}</span>
                      <span>Photoperiod: {treatment.lightingParameters.photoperiod}h</span>
                      <span>Replicates: {treatment.replicates}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Copy treatment logic here
                      }}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Beaker className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No treatments created yet</p>
            <p className="text-sm">Use templates above or create custom treatments</p>
          </div>
        )}
      </div>

      {/* Plot Layout Visualization */}
      {plots.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Plot Layout</h3>
          <div className="relative bg-gray-700 rounded" style={{ height: '300px' }}>
            <svg className="w-full h-full">
              {/* Room outline */}
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="none"
                stroke="#4B5563"
                strokeWidth="2"
              />

              {/* Plots */}
              {plots.map((plot, index) => {
                const treatment = treatments.find(t => t.id === plot.treatmentId)
                const scaleX = 400 / room.width
                const scaleY = 300 / room.length
                
                return (
                  <g key={plot.id}>
                    <rect
                      x={plot.position.x * scaleX}
                      y={plot.position.y * scaleY}
                      width={plot.size.width * scaleX}
                      height={plot.size.height * scaleY}
                      fill={`hsl(${(treatments.findIndex(t => t.id === plot.treatmentId) * 60) % 360}, 60%, 50%)`}
                      fillOpacity="0.3"
                      stroke={`hsl(${(treatments.findIndex(t => t.id === plot.treatmentId) * 60) % 360}, 60%, 50%)`}
                      strokeWidth="2"
                    />
                    <text
                      x={plot.position.x * scaleX + (plot.size.width * scaleX) / 2}
                      y={plot.position.y * scaleY + (plot.size.height * scaleY) / 2}
                      fill="white"
                      fontSize="10"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {treatment?.name.substring(0, 3) || 'T'}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          
          {/* Plot Statistics */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <span className="text-gray-400">Total Plots:</span>
              <span className="text-white ml-2">{plots.length}</span>
            </div>
            <div className="text-center">
              <span className="text-gray-400">Treatments:</span>
              <span className="text-white ml-2">{treatments.length}</span>
            </div>
            <div className="text-center">
              <span className="text-gray-400">Replicates:</span>
              <span className="text-white ml-2">{plots.length / treatments.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Render propagation chamber interface
  const renderPropagationChambers = () => (
    <div className="space-y-6">
      {/* Chamber Types */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Create Propagation Chamber</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { type: 'seed_germination', name: 'Seed Germination', icon: '🌱' },
            { type: 'cutting_propagation', name: 'Cutting Propagation', icon: '🌿' },
            { type: 'tissue_culture', name: 'Tissue Culture', icon: '🧫' }
          ].map(chamber => (
            <button
              key={chamber.type}
              onClick={() => createPropagationChamber(chamber.type as PropagationChamber['type'])}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">{chamber.icon}</div>
              <h4 className="text-white font-medium">{chamber.name}</h4>
            </button>
          ))}
        </div>
      </div>

      {/* Chamber Management */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Propagation Chambers</h3>
          {chambers.length > 0 && (
            <button
              onClick={exportPropagationSpecs}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Export Specs
            </button>
          )}
        </div>
        
        {chambers.length > 0 ? (
          <div className="space-y-4">
            {chambers.map(chamber => (
              <div key={chamber.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">{chamber.name}</h4>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded capitalize">
                    {chamber.type.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Dimensions:</span>
                    <span className="text-white ml-2">
                      {chamber.dimensions.width}×{chamber.dimensions.length}×{chamber.dimensions.height}m
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Temperature:</span>
                    <span className="text-white ml-2">
                      {chamber.environmentalControl.temperatureRange.min}-{chamber.environmentalControl.temperatureRange.max}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Humidity:</span>
                    <span className="text-white ml-2">
                      {chamber.environmentalControl.humidityRange.min}-{chamber.environmentalControl.humidityRange.max}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Photoperiod:</span>
                    <span className="text-white ml-2">{chamber.lightingSystem.photoperiod}h</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs">
                  {chamber.environmentalControl.co2Control && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">CO₂ Control</span>
                  )}
                  {chamber.environmentalControl.fogSystem && (
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">Fog System</span>
                  )}
                  {chamber.monitoring.dataLogging && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">Data Logging</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Leaf className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No propagation chambers created yet</p>
            <p className="text-sm">Create chambers for different propagation methods</p>
          </div>
        )}
      </div>
    </div>
  )

  // Render statistical analysis interface
  const renderStatisticalAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Statistical Analysis</h3>
          <button
            onClick={performStatisticalAnalysis}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Run Analysis
          </button>
        </div>

        {analysisResults ? (
          <div className="space-y-6">
            {/* ANOVA Results */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Analysis of Variance (ANOVA)
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">F-Value:</span>
                  <span className="text-white ml-2">{analysisResults.anova.fValue.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">P-Value:</span>
                  <span className={`ml-2 ${analysisResults.anova.pValue < 0.05 ? 'text-green-400' : 'text-red-400'}`}>
                    {analysisResults.anova.pValue.toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Significant:</span>
                  <span className={`ml-2 ${analysisResults.anova.significant ? 'text-green-400' : 'text-red-400'}`}>
                    {analysisResults.anova.significant ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* T-Test Results */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Pairwise Comparisons (T-Tests)</h4>
              <div className="space-y-2">
                {Object.entries(analysisResults.tTest).map(([comparison, result]) => (
                  <div key={comparison} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{comparison.replace('_', ' ')}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-white">t = {result.tValue.toFixed(2)}</span>
                      <span className={`${result.pValue < 0.05 ? 'text-green-400' : 'text-gray-400'}`}>
                        p = {result.pValue.toFixed(3)}
                      </span>
                      {result.significant ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regression Analysis */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Regression Analysis</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">R-Squared:</span>
                  <span className="text-white">{analysisResults.regression.rSquared.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm mb-2 block">Equation:</span>
                  <code className="text-green-400 text-sm bg-gray-800 p-2 rounded block">
                    {analysisResults.regression.equation}
                  </code>
                </div>
                <div>
                  <span className="text-gray-400 text-sm mb-2 block">Coefficients:</span>
                  <div className="space-y-1">
                    {Object.entries(analysisResults.regression.coefficients).map(([variable, coefficient]) => (
                      <div key={variable} className="flex justify-between text-sm">
                        <span className="text-gray-300">{variable}:</span>
                        <span className="text-white">{coefficient.toFixed(3)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="flex gap-3">
              <button 
                onClick={exportResults}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Results
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import Data
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No analysis results yet</p>
            <p className="text-sm">Run statistical analysis on your experimental data</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Beaker className="w-6 h-6 text-green-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Research & Propagation Tools</h2>
            <p className="text-gray-400">Professional tools for controlled experiments and propagation</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {[
            { id: 'design', label: 'Experimental Design', icon: Grid3x3 },
            { id: 'propagation', label: 'Propagation Chambers', icon: Leaf },
            { id: 'analysis', label: 'Statistical Analysis', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'design' && renderExperimentalDesign()}
      {activeTab === 'propagation' && renderPropagationChambers()}
      {activeTab === 'analysis' && renderStatisticalAnalysis()}
    </div>
  )
}