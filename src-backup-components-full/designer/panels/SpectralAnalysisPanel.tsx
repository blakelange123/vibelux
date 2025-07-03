'use client';

import React, { useState, useCallback } from 'react';
import { X, BarChart3, Palette, Settings, Download, Eye, Lightbulb, Flower, Brain } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  SpectralPowerDistributionAnalyzer, 
  SpectralAnalysisResult
} from '@/lib/spectral-power-distribution';

interface SpectralData {
  wavelength: number[];
  intensity: number[];
  metadata?: {
    name: string;
    type: string;
    manufacturer?: string;
  };
}

interface SpectralAnalysisPanelProps {
  onClose: () => void;
}

export function SpectralAnalysisPanel({ onClose }: SpectralAnalysisPanelProps) {
  const { state } = useDesigner();
  const { objects } = state;
  const { showNotification } = useNotifications();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SpectralAnalysisResult | null>(null);
  const [selectedFixture, setSelectedFixture] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<'color' | 'photosynthetic' | 'circadian' | 'horticultural'>('photosynthetic');

  /**
   * Generate realistic LED spectrum for analysis
   */
  const generateLEDSpectrum = useCallback((fixtureModel: any): SpectralData => {
    // Create a realistic horticultural LED spectrum
    const wavelengths: number[] = [];
    const values: number[] = [];
    
    for (let wl = 380; wl <= 780; wl += 10) {
      wavelengths.push(wl);
      
      let intensity = 0;
      
      // Blue peak around 450nm
      if (wl >= 430 && wl <= 470) {
        intensity += 0.7 * Math.exp(-Math.pow((wl - 450) / 15, 2));
      }
      
      // Green peak around 530nm (smaller for horticultural LEDs)
      if (wl >= 510 && wl <= 550) {
        intensity += 0.2 * Math.exp(-Math.pow((wl - 530) / 15, 2));
      }
      
      // Red peak around 660nm
      if (wl >= 640 && wl <= 680) {
        intensity += 1.0 * Math.exp(-Math.pow((wl - 660) / 12, 2));
      }
      
      // Far-red peak around 730nm
      if (wl >= 710 && wl <= 750) {
        intensity += 0.3 * Math.exp(-Math.pow((wl - 730) / 15, 2));
      }
      
      // Add some white phosphor component
      if (wl >= 500 && wl <= 700) {
        intensity += 0.1;
      }
      
      values.push(intensity);
    }
    
    return { wavelength: wavelengths, intensity: values };
  }, []);

  /**
   * Run spectral analysis
   */
  const runAnalysis = useCallback(async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    showNotification('info', 'Analyzing spectral power distribution...');

    try {
      const analyzer = new SpectralPowerDistributionAnalyzer();
      
      // Get enabled fixtures
      const fixtures = objects.filter(obj => obj.type === 'fixture' && obj.enabled);
      
      if (fixtures.length === 0) {
        showNotification('warning', 'No enabled fixtures found for analysis');
        setIsAnalyzing(false);
        return;
      }

      let combinedSpectrum: SpectralData;
      
      if (selectedFixture === 'all') {
        // Combine spectra from all fixtures
        const spectra = fixtures.map(fixture => generateLEDSpectrum((fixture as any).model));
        
        // Initialize combined spectrum
        combinedSpectrum = {
          wavelength: spectra[0].wavelength,
          intensity: spectra[0].wavelength.map(() => 0)
        };
        
        // Sum all spectra
        for (const spectrum of spectra) {
          for (let i = 0; i < spectrum.intensity.length; i++) {
            combinedSpectrum.intensity[i] += spectrum.intensity[i];
          }
        }
        
        // Normalize by number of fixtures
        for (let i = 0; i < combinedSpectrum.intensity.length; i++) {
          combinedSpectrum.intensity[i] /= fixtures.length;
        }
      } else {
        // Analyze specific fixture
        const fixture = fixtures.find(f => f.id === selectedFixture);
        if (!fixture) {
          showNotification('error', 'Selected fixture not found');
          setIsAnalyzing(false);
          return;
        }
        combinedSpectrum = generateLEDSpectrum((fixture as any).model);
      }

      // Run comprehensive analysis
      const analysisResult = analyzer.analyzeSpectrum({
        wavelengths: combinedSpectrum.wavelength,
        values: combinedSpectrum.intensity
      } as any);
      
      setResults(analysisResult);
      showNotification('success', 'Spectral analysis completed successfully');
      
    } catch (error) {
      console.error('Spectral analysis error:', error);
      showNotification('error', 'Spectral analysis failed. Check console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    isAnalyzing,
    objects,
    selectedFixture,
    generateLEDSpectrum,
    showNotification
  ]);

  /**
   * Export analysis results
   */
  const exportResults = useCallback(() => {
    if (!results) return;

    const exportData = {
      analysis: results,
      fixtures: selectedFixture === 'all' ? 'All Fixtures' : selectedFixture,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spectral-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('success', 'Spectral analysis exported successfully');
  }, [results, selectedFixture, showNotification]);

  const enabledFixtures = objects.filter(obj => obj.type === 'fixture' && obj.enabled);

  return (
    <div className="fixed inset-y-0 right-0 w-[900px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold text-white">Spectral Power Distribution Analysis</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Controls */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">Analysis Controls</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Fixture Selection
              </label>
              <select
                value={selectedFixture}
                onChange={(e) => setSelectedFixture(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                disabled={isAnalyzing}
              >
                <option value="all">All Fixtures (Combined)</option>
                {enabledFixtures.map((fixture) => (
                  <option key={fixture.id} value={fixture.id}>
                    {fixture.customName || `${fixture.type} ${fixture.id.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Analysis Focus
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                disabled={isAnalyzing}
              >
                <option value="photosynthetic">Photosynthetic Metrics</option>
                <option value="color">Color Rendering</option>
                <option value="circadian">Circadian Effects</option>
                <option value="horticultural">Horticultural Specific</option>
              </select>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3">
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing || enabledFixtures.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-600 disabled:text-gray-400"
            >
              <BarChart3 className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>

            {results && (
              <button
                onClick={exportResults}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>

          {enabledFixtures.length === 0 && (
            <p className="text-sm text-amber-400 mt-2">
              Add at least one enabled fixture to run spectral analysis
            </p>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="p-4">
            <h3 className="text-lg font-medium text-white mb-4">Analysis Results</h3>

            {/* Metric Type Selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedMetric('photosynthetic')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedMetric === 'photosynthetic'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Flower className="w-4 h-4" />
                Photosynthetic
              </button>
              <button
                onClick={() => setSelectedMetric('color')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedMetric === 'color'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Palette className="w-4 h-4" />
                Color
              </button>
              <button
                onClick={() => setSelectedMetric('circadian')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedMetric === 'circadian'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Brain className="w-4 h-4" />
                Circadian
              </button>
              <button
                onClick={() => setSelectedMetric('horticultural')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedMetric === 'horticultural'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Horticultural
              </button>
            </div>

            {/* Basic Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Luminous Efficacy</div>
                <div className="text-lg font-semibold text-white">
                  {results.luminousEfficacy.toFixed(0)} lm/W
                </div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Color Temperature</div>
                <div className="text-lg font-semibold text-white">
                  {results.colorTemperature.toFixed(0)}K
                </div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Color Rendering Index</div>
                <div className="text-lg font-semibold text-white">
                  {results.colorRenderingIndex.toFixed(0)}
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-3 capitalize">
                {selectedMetric} Analysis
              </h4>
              
              {selectedMetric === 'photosynthetic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">PAR (400-700nm)</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {results.photosynthetic.par.toFixed(1)} W/m²
                    </div>
                    
                    <div className="text-sm text-gray-400">PPFD</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {results.photosynthetic.ppfd.toFixed(0)} μmol/m²/s
                    </div>
                    
                    <div className="text-sm text-gray-400">Photosynthetic Efficacy</div>
                    <div className="text-lg font-semibold text-white">
                      {results.photosynthetic.photosynthetic_efficacy.toFixed(2)} μmol/J
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Blue Ratio (400-500nm)</div>
                    <div className="text-lg font-semibold text-blue-400 mb-2">
                      {(results.photosynthetic.blueRatio * 100).toFixed(1)}%
                    </div>
                    
                    <div className="text-sm text-gray-400">Red Ratio (600-700nm)</div>
                    <div className="text-lg font-semibold text-red-400 mb-2">
                      {(results.photosynthetic.redRatio * 100).toFixed(1)}%
                    </div>
                    
                    <div className="text-sm text-gray-400">Red:Far-Red Ratio</div>
                    <div className="text-lg font-semibold text-white">
                      {results.photosynthetic.redFarRedRatio.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {selectedMetric === 'color' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">CRI Ra</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {results.colorRenderingIndex.toFixed(0)}
                    </div>
                    
                    <div className="text-sm text-gray-400">Color Quality Scale</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {results.colorQualityScale.toFixed(0)}
                    </div>
                    
                    <div className="text-sm text-gray-400">Chromaticity x, y</div>
                    <div className="text-lg font-semibold text-white">
                      {results.chromaticityCoordinates.x.toFixed(3)}, {results.chromaticityCoordinates.y.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Gamut Area Index</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {results.spectralQuality.gamutAreaIndex.toFixed(0)}
                    </div>
                    
                    <div className="text-sm text-gray-400">Memory Color Index</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {results.spectralQuality.memoryColorRenderingIndex.toFixed(0)}
                    </div>
                    
                    <div className="text-sm text-gray-400">Feeling of Contrast</div>
                    <div className="text-lg font-semibold text-white">
                      {results.spectralQuality.feelingOfContrast.toFixed(0)}
                    </div>
                  </div>
                </div>
              )}

              {selectedMetric === 'circadian' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Melanopic Lux</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {results.circadian.melanopicLux.toFixed(0)}
                    </div>
                    
                    <div className="text-sm text-gray-400">Melanopic Ratio</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {results.circadian.melanopicRatio.toFixed(2)}
                    </div>
                    
                    <div className="text-sm text-gray-400">Circadian Stimulus</div>
                    <div className="text-lg font-semibold text-white">
                      {results.circadian.circadianStimulus.toFixed(3)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Circadian Light (CLA)</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {results.circadian.circadianLight.toFixed(0)} lux
                    </div>
                    
                    <div className="text-sm text-gray-400">Equivalent Melanopic Lux</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {results.circadian.equivalentMelanopicLux.toFixed(0)}
                    </div>
                    
                    <div className="text-sm text-gray-400">S/P Ratio</div>
                    <div className="text-lg font-semibold text-white">
                      {results.visualComfort.spRatio.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {selectedMetric === 'horticultural' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Morphogenic Ratio (Blue/Red)</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {results.horticultural.morphogenicRatio.toFixed(3)}
                    </div>
                    
                    <div className="text-sm text-gray-400">Photoperiod Effectiveness</div>
                    <div className="text-lg font-semibold text-white mb-2">
                      {(results.horticultural.photoperiodEffectiveness * 100).toFixed(1)}%
                    </div>
                    
                    <div className="text-sm text-gray-400">Quantum Yield Potential</div>
                    <div className="text-lg font-semibold text-white">
                      {(results.horticultural.quantumYieldPotential * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Chlorophyll a Excitation</div>
                    <div className="text-lg font-semibold text-green-400 mb-2">
                      {results.horticultural.chlorophyllExcitation.a.toFixed(1)}
                    </div>
                    
                    <div className="text-sm text-gray-400">Chlorophyll b Excitation</div>
                    <div className="text-lg font-semibold text-green-500 mb-2">
                      {results.horticultural.chlorophyllExcitation.b.toFixed(1)}
                    </div>
                    
                    <div className="text-sm text-gray-400">Anthocyanin Induction</div>
                    <div className="text-lg font-semibold text-purple-400">
                      {results.horticultural.anthocyaninInduction.toFixed(1)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3 text-purple-400">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
              <span>Analyzing spectral power distribution...</span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Computing photosynthetic, color, and circadian metrics...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}