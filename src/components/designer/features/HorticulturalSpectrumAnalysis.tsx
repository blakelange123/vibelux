'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart3,
  X,
  Download,
  Eye,
  Settings,
  Lightbulb,
  Leaf,
  Thermometer,
  Zap,
  Calendar,
  TrendingUp,
  Info,
  RefreshCw,
  Target,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  Play,
  Pause
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';

// Professional horticultural spectrum data types
interface SpectrumData {
  wavelength: number[]; // 380-800nm range
  intensity: number[]; // µmol/m²/s at each wavelength
  photosynthetic: number[]; // Photosynthetic photon flux at each wavelength
  morphogenic: number[]; // Plant morphology effects
}

interface HorticulturalMetrics {
  totalPPFD: number; // µmol/m²/s
  parEfficiency: number; // Percentage of total photons in 400-700nm range
  redFarRedRatio: number; // Critical for plant morphology
  blueRedRatio: number; // Important for vegetative vs flowering
  greenMidRatio: number; // 500-600nm penetration efficiency
  uvContent: number; // UV-A content for terpene/THC production
  dli: number; // Daily Light Integral mol/m²/day
  quantumEfficiency: number; // µmol/J
}

interface GrowthStageProfile {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  targetPPFD: [number, number]; // min, max µmol/m²/s
  targetDLI: [number, number]; // min, max mol/m²/day
  spectrumRatios: {
    blue: number; // 400-500nm percentage
    green: number; // 500-600nm percentage
    red: number; // 600-700nm percentage
    farRed: number; // 700-800nm percentage
    uv: number; // 280-400nm percentage
  };
  photoperiod: number; // hours of light per day
  objectives: string[];
}

interface PlantType {
  id: string;
  name: string;
  scientificName: string;
  category: 'cannabis' | 'leafy-greens' | 'tomatoes' | 'herbs' | 'microgreens' | 'flowers';
  growthStages: GrowthStageProfile[];
  environmentalNeeds: {
    temperature: [number, number]; // min, max °C
    humidity: [number, number]; // min, max %
    co2: [number, number]; // min, max ppm
  };
}

export function HorticulturalSpectrumAnalysis() {
  const { dispatch } = useDesigner();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [currentSpectrum, setCurrentSpectrum] = useState<SpectrumData | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<string>('cannabis-sativa');
  const [selectedStage, setSelectedStage] = useState<string>('vegetative');
  const [metrics, setMetrics] = useState<HorticulturalMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'spectrum' | 'par' | 'morphogenic' | 'comparison'>('spectrum');
  const [customChannels, setCustomChannels] = useState({
    uv385: 0,
    blue450: 100,
    blue470: 80,
    green520: 20,
    green540: 15,
    red660: 100,
    red680: 60,
    farRed730: 30,
    farRed760: 10
  });

  // Professional plant database for horticulture
  const plantDatabase: PlantType[] = [
    {
      id: 'cannabis-sativa',
      name: 'Cannabis Sativa',
      scientificName: 'Cannabis sativa L.',
      category: 'cannabis',
      growthStages: [
        {
          id: 'seedling',
          name: 'Seedling',
          description: 'Initial growth phase with cotyledons and first true leaves',
          duration: 14,
          targetPPFD: [100, 300],
          targetDLI: [8, 15],
          spectrumRatios: { blue: 35, green: 15, red: 45, farRed: 3, uv: 2 },
          photoperiod: 18,
          objectives: ['Root development', 'Compact growth', 'Disease resistance']
        },
        {
          id: 'vegetative',
          name: 'Vegetative Growth',
          description: 'Rapid growth phase building plant structure',
          duration: 28,
          targetPPFD: [400, 600],
          targetDLI: [25, 35],
          spectrumRatios: { blue: 30, green: 20, red: 45, farRed: 3, uv: 2 },
          photoperiod: 18,
          objectives: ['Biomass accumulation', 'Node development', 'Canopy formation']
        },
        {
          id: 'flowering',
          name: 'Flowering/Bloom',
          description: 'Reproductive phase with bud development',
          duration: 56,
          targetPPFD: [600, 900],
          targetDLI: [35, 50],
          spectrumRatios: { blue: 20, green: 15, red: 55, farRed: 5, uv: 5 },
          photoperiod: 12,
          objectives: ['Flower initiation', 'Terpene production', 'THC/CBD synthesis']
        }
      ],
      environmentalNeeds: {
        temperature: [20, 28],
        humidity: [40, 60],
        co2: [800, 1200]
      }
    },
    {
      id: 'lettuce-butterhead',
      name: 'Lettuce (Butterhead)',
      scientificName: 'Lactuca sativa',
      category: 'leafy-greens',
      growthStages: [
        {
          id: 'germination',
          name: 'Germination',
          description: 'Seed sprouting and initial development',
          duration: 7,
          targetPPFD: [50, 150],
          targetDLI: [6, 12],
          spectrumRatios: { blue: 25, green: 25, red: 45, farRed: 3, uv: 2 },
          photoperiod: 16,
          objectives: ['Uniform germination', 'Strong taproot']
        },
        {
          id: 'juvenile',
          name: 'Juvenile Growth',
          description: 'First true leaves and rapid growth',
          duration: 21,
          targetPPFD: [200, 350],
          targetDLI: [14, 20],
          spectrumRatios: { blue: 30, green: 25, red: 42, farRed: 2, uv: 1 },
          photoperiod: 16,
          objectives: ['Leaf development', 'Compact growth', 'Disease resistance']
        },
        {
          id: 'harvest',
          name: 'Pre-Harvest',
          description: 'Final sizing and quality enhancement',
          duration: 14,
          targetPPFD: [250, 400],
          targetDLI: [16, 22],
          spectrumRatios: { blue: 35, green: 20, red: 40, farRed: 3, uv: 2 },
          photoperiod: 14,
          objectives: ['Color development', 'Flavor compounds', 'Shelf life']
        }
      ],
      environmentalNeeds: {
        temperature: [16, 22],
        humidity: [50, 70],
        co2: [600, 900]
      }
    }
  ];

  // Generate realistic spectrum data based on LED channel settings
  const generateSpectrumData = (): SpectrumData => {
    const wavelengths = Array.from({ length: 421 }, (_, i) => 380 + i); // 380-800nm
    const intensity = new Array(421).fill(0);
    const photosynthetic = new Array(421).fill(0);
    const morphogenic = new Array(421).fill(0);

    // LED channel contributions (Gaussian distributions)
    const channels = [
      { peak: 385, intensity: customChannels.uv385, width: 10 },
      { peak: 450, intensity: customChannels.blue450, width: 20 },
      { peak: 470, intensity: customChannels.blue470, width: 20 },
      { peak: 520, intensity: customChannels.green520, width: 25 },
      { peak: 540, intensity: customChannels.green540, width: 25 },
      { peak: 660, intensity: customChannels.red660, width: 20 },
      { peak: 680, intensity: customChannels.red680, width: 20 },
      { peak: 730, intensity: customChannels.farRed730, width: 25 },
      { peak: 760, intensity: customChannels.farRed760, width: 30 }
    ];

    channels.forEach(channel => {
      wavelengths.forEach((wl, i) => {
        const gaussian = channel.intensity * Math.exp(-0.5 * Math.pow((wl - channel.peak) / channel.width, 2));
        intensity[i] += gaussian;
        
        // PAR range (400-700nm) contributions
        if (wl >= 400 && wl <= 700) {
          photosynthetic[i] = gaussian * 0.8; // 80% photosynthetic efficiency in PAR
        }
        
        // Morphogenic effects (simplified model)
        if (wl >= 400 && wl <= 500) morphogenic[i] = gaussian * 1.2; // Blue morphogenic
        if (wl >= 660 && wl <= 680) morphogenic[i] = gaussian * 1.0; // Red photosynthetic
        if (wl >= 700 && wl <= 800) morphogenic[i] = gaussian * 0.6; // Far-red morphogenic
      });
    });

    return {
      wavelength: wavelengths,
      intensity,
      photosynthetic,
      morphogenic
    };
  };

  // Calculate comprehensive horticultural metrics
  const calculateMetrics = (spectrum: SpectrumData): HorticulturalMetrics => {
    const parRange = spectrum.wavelength.map((wl, i) => wl >= 400 && wl <= 700 ? spectrum.intensity[i] : 0);
    const blueRange = spectrum.wavelength.map((wl, i) => wl >= 400 && wl <= 500 ? spectrum.intensity[i] : 0);
    const greenRange = spectrum.wavelength.map((wl, i) => wl >= 500 && wl <= 600 ? spectrum.intensity[i] : 0);
    const redRange = spectrum.wavelength.map((wl, i) => wl >= 600 && wl <= 700 ? spectrum.intensity[i] : 0);
    const farRedRange = spectrum.wavelength.map((wl, i) => wl >= 700 && wl <= 800 ? spectrum.intensity[i] : 0);
    const uvRange = spectrum.wavelength.map((wl, i) => wl >= 280 && wl <= 400 ? spectrum.intensity[i] : 0);

    const totalPPFD = parRange.reduce((sum, val) => sum + val, 0);
    const totalIntensity = spectrum.intensity.reduce((sum, val) => sum + val, 0);
    const blueTotal = blueRange.reduce((sum, val) => sum + val, 0);
    const redTotal = redRange.reduce((sum, val) => sum + val, 0);
    const farRedTotal = farRedRange.reduce((sum, val) => sum + val, 0);
    const greenTotal = greenRange.reduce((sum, val) => sum + val, 0);
    const uvTotal = uvRange.reduce((sum, val) => sum + val, 0);

    return {
      totalPPFD: Math.round(totalPPFD),
      parEfficiency: Math.round((totalPPFD / totalIntensity) * 100),
      redFarRedRatio: farRedTotal > 0 ? Math.round((redTotal / farRedTotal) * 100) / 100 : 0,
      blueRedRatio: redTotal > 0 ? Math.round((blueTotal / redTotal) * 100) / 100 : 0,
      greenMidRatio: totalPPFD > 0 ? Math.round((greenTotal / totalPPFD) * 100) : 0,
      uvContent: Math.round((uvTotal / totalIntensity) * 100),
      dli: Math.round((totalPPFD * 0.0036 * 16) * 100) / 100, // Assuming 16h photoperiod
      quantumEfficiency: Math.round((totalPPFD / 250) * 100) / 100 // Assuming 250W fixture
    };
  };

  // Analyze spectrum compatibility with selected plant/stage
  const analyzeCompatibility = () => {
    if (!currentSpectrum || !metrics) return null;
    
    const plant = plantDatabase.find(p => p.id === selectedPlant);
    const stage = plant?.growthStages.find(s => s.id === selectedStage);
    
    if (!plant || !stage) return null;

    const issues = [];
    const recommendations = [];

    // PPFD analysis
    if (metrics.totalPPFD < stage.targetPPFD[0]) {
      issues.push(`PPFD too low: ${metrics.totalPPFD} µmol/m²/s (target: ${stage.targetPPFD[0]}-${stage.targetPPFD[1]})`);
      recommendations.push('Increase overall light intensity or reduce fixture height');
    } else if (metrics.totalPPFD > stage.targetPPFD[1]) {
      issues.push(`PPFD too high: ${metrics.totalPPFD} µmol/m²/s (target: ${stage.targetPPFD[0]}-${stage.targetPPFD[1]})`);
      recommendations.push('Reduce light intensity or increase fixture height');
    }

    // DLI analysis
    if (metrics.dli < stage.targetDLI[0]) {
      issues.push(`DLI too low: ${metrics.dli} mol/m²/day (target: ${stage.targetDLI[0]}-${stage.targetDLI[1]})`);
      recommendations.push('Increase photoperiod or light intensity');
    }

    // Spectrum ratio analysis for cannabis
    if (plant.category === 'cannabis') {
      if (selectedStage === 'flowering' && metrics.redFarRedRatio < 10) {
        issues.push('Low Red:Far-Red ratio may reduce flowering response');
        recommendations.push('Increase red (660-680nm) or reduce far-red (700-800nm)');
      }
      
      if (selectedStage === 'vegetative' && metrics.blueRedRatio < 0.5) {
        issues.push('Low Blue:Red ratio may cause excessive stretching');
        recommendations.push('Increase blue (400-500nm) content for compact growth');
      }
    }

    return { issues, recommendations, compatibility: issues.length === 0 ? 'excellent' : issues.length <= 2 ? 'good' : 'poor' };
  };

  // Draw spectrum chart on canvas
  const drawSpectrumChart = () => {
    if (!canvasRef.current || !currentSpectrum) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Set up chart area
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Find max intensity for scaling
    let maxIntensity = 0;
    if (viewMode === 'spectrum') maxIntensity = Math.max(...currentSpectrum.intensity);
    else if (viewMode === 'par') maxIntensity = Math.max(...currentSpectrum.photosynthetic);
    else if (viewMode === 'morphogenic') maxIntensity = Math.max(...currentSpectrum.morphogenic);

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Vertical grid lines (wavelength)
    for (let wl = 400; wl <= 800; wl += 50) {
      const x = margin.left + ((wl - 380) / 420) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + chartHeight);
      ctx.stroke();
    }
    
    // Horizontal grid lines (intensity)
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw spectrum curve
    ctx.strokeStyle = viewMode === 'spectrum' ? '#8b5cf6' : viewMode === 'par' ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const dataToPlot = viewMode === 'spectrum' ? currentSpectrum.intensity : 
                     viewMode === 'par' ? currentSpectrum.photosynthetic : 
                     currentSpectrum.morphogenic;

    currentSpectrum.wavelength.forEach((wl, i) => {
      const x = margin.left + ((wl - 380) / 420) * chartWidth;
      const y = margin.top + chartHeight - (dataToPlot[i] / maxIntensity) * chartHeight;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill area under curve
    ctx.fillStyle = viewMode === 'spectrum' ? '#8b5cf6' + '20' : 
                   viewMode === 'par' ? '#10b981' + '20' : 
                   '#f59e0b' + '20';
    ctx.fill();

    // Draw PAR range highlight (400-700nm)
    if (viewMode === 'spectrum') {
      ctx.fillStyle = '#10b981' + '10';
      const parStart = margin.left + ((400 - 380) / 420) * chartWidth;
      const parEnd = margin.left + ((700 - 380) / 420) * chartWidth;
      ctx.fillRect(parStart, margin.top, parEnd - parStart, chartHeight);
    }

    // Draw wavelength labels
    ctx.fillStyle = '#d1d5db';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let wl = 400; wl <= 800; wl += 100) {
      const x = margin.left + ((wl - 380) / 420) * chartWidth;
      ctx.fillText(`${wl}nm`, x, height - 20);
    }

    // Draw intensity labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + chartHeight - (i / 5) * chartHeight + 4;
      const value = (maxIntensity * i / 5).toFixed(0);
      ctx.fillText(value, margin.left - 10, y);
    }

    // Draw axis labels
    ctx.textAlign = 'center';
    ctx.fillText('Wavelength (nm)', width / 2, height - 5);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(viewMode === 'spectrum' ? 'Intensity (µmol/m²/s/nm)' : 
                viewMode === 'par' ? 'PAR (µmol/m²/s/nm)' : 
                'Morphogenic Effect', 0, 0);
    ctx.restore();
  };

  // Initialize spectrum analysis
  useEffect(() => {
    const spectrum = generateSpectrumData();
    setCurrentSpectrum(spectrum);
    setMetrics(calculateMetrics(spectrum));
  }, [customChannels]);

  // Redraw chart when data changes
  useEffect(() => {
    if (currentSpectrum) {
      drawSpectrumChart();
    }
  }, [currentSpectrum, viewMode]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (currentSpectrum) {
      setMetrics(calculateMetrics(currentSpectrum));
    }
    setIsAnalyzing(false);
  };

  const exportSpectrum = (format: 'csv' | 'pdf' | 'ies') => {
    // Implementation would handle actual export
  };

  const compatibility = analyzeCompatibility();
  const selectedPlantData = plantDatabase.find(p => p.id === selectedPlant);
  const selectedStageData = selectedPlantData?.growthStages.find(s => s.id === selectedStage);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-[95vw] max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Horticultural Spectrum Analysis</h2>
              <p className="text-sm text-gray-400">Professional plant-specific lighting optimization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportSpectrum('pdf')}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'spectrumAnalysis' })}
              className="p-2 hover:bg-gray-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-80 border-r border-gray-700 flex flex-col">
            {/* Plant Selection */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white mb-3">Plant Configuration</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Plant Type</label>
                  <select
                    value={selectedPlant}
                    onChange={(e) => setSelectedPlant(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                  >
                    {plantDatabase.map(plant => (
                      <option key={plant.id} value={plant.id}>{plant.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Growth Stage</label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                  >
                    {selectedPlantData?.growthStages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>
                
                {selectedStageData && (
                  <div className="p-3 bg-gray-800 rounded text-xs">
                    <div className="text-gray-300 space-y-1">
                      <div><strong>Target PPFD:</strong> {selectedStageData.targetPPFD[0]}-{selectedStageData.targetPPFD[1]} µmol/m²/s</div>
                      <div><strong>Target DLI:</strong> {selectedStageData.targetDLI[0]}-{selectedStageData.targetDLI[1]} mol/m²/day</div>
                      <div><strong>Duration:</strong> {selectedStageData.duration} days</div>
                      <div><strong>Photoperiod:</strong> {selectedStageData.photoperiod}h</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LED Channel Controls */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-lg font-medium text-white mb-3">LED Channel Control</h3>
              
              <div className="space-y-3">
                {Object.entries(customChannels).map(([channel, value]) => (
                  <div key={channel} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <label className="text-gray-300 capitalize">
                        {channel.replace(/(\d+)/g, ' $1nm')}
                      </label>
                      <span className="text-white">{value}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => setCustomChannels(prev => ({
                        ...prev,
                        [channel]: Number(e.target.value)
                      }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 font-medium"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Update Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Center Panel - Spectrum Chart */}
          <div className="flex-1 flex flex-col">
            {/* Chart Controls */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex gap-2">
                {[
                  { id: 'spectrum', name: 'Full Spectrum', color: 'purple' },
                  { id: 'par', name: 'PAR Only', color: 'green' },
                  { id: 'morphogenic', name: 'Morphogenic', color: 'yellow' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === mode.id 
                        ? `bg-${mode.color}-600 text-white` 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
              
              <div className="text-sm text-gray-400">
                380-800nm • {currentSpectrum?.wavelength.length} data points
              </div>
            </div>

            {/* Spectrum Chart */}
            <div className="flex-1 p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-full bg-gray-800 rounded-lg"
              />
            </div>
          </div>

          {/* Right Panel - Metrics & Analysis */}
          <div className="w-80 border-l border-gray-700 flex flex-col">
            {/* Metrics */}
            {metrics && (
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white mb-3">Horticultural Metrics</h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-800 p-2 rounded">
                      <div className="text-gray-400">Total PPFD</div>
                      <div className="text-white font-semibold">{metrics.totalPPFD} µmol/m²/s</div>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <div className="text-gray-400">DLI</div>
                      <div className="text-white font-semibold">{metrics.dli} mol/m²/day</div>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <div className="text-gray-400">PAR Efficiency</div>
                      <div className="text-white font-semibold">{metrics.parEfficiency}%</div>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <div className="text-gray-400">Quantum Eff.</div>
                      <div className="text-white font-semibold">{metrics.quantumEfficiency} µmol/J</div>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <div className="text-gray-400">R:FR Ratio</div>
                      <div className="text-white font-semibold">{metrics.redFarRedRatio}</div>
                    </div>
                    <div className="bg-gray-800 p-2 rounded">
                      <div className="text-gray-400">B:R Ratio</div>
                      <div className="text-white font-semibold">{metrics.blueRedRatio}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Compatibility Analysis */}
            {compatibility && (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-medium text-white">Compatibility Analysis</h3>
                  {compatibility.compatibility === 'excellent' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {compatibility.compatibility === 'good' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  {compatibility.compatibility === 'poor' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                </div>

                <div className={`p-3 rounded-lg mb-4 ${
                  compatibility.compatibility === 'excellent' ? 'bg-green-500/10 border border-green-500/20' :
                  compatibility.compatibility === 'good' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                  'bg-red-500/10 border border-red-500/20'
                }`}>
                  <div className={`font-medium ${
                    compatibility.compatibility === 'excellent' ? 'text-green-400' :
                    compatibility.compatibility === 'good' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {compatibility.compatibility.charAt(0).toUpperCase() + compatibility.compatibility.slice(1)} Match
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    For {selectedPlantData?.name} - {selectedStageData?.name}
                  </div>
                </div>

                {compatibility.issues.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-red-400">Issues Found:</h4>
                    {compatibility.issues.map((issue, index) => (
                      <div key={index} className="text-sm text-gray-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        {issue}
                      </div>
                    ))}
                  </div>
                )}

                {compatibility.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-400">Recommendations:</h4>
                    {compatibility.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm text-gray-300 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        {rec}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}