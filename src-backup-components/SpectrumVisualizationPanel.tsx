import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { SpectrumAnalyzer, type SpectralPowerDistribution, type SpectrumMetrics } from '@/lib/spectrum-analysis';
import { Eye, Zap, Leaf, Sun, Moon, Info } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SpectrumVisualizationPanelProps {
  spectra: Array<{
    id: string;
    name: string;
    spd: SpectralPowerDistribution;
    color: string;
    visible?: boolean;
  }>;
  selectedSpectrumId?: string;
  onSpectrumSelect?: (id: string) => void;
  showActionSpectra?: boolean;
  showBands?: boolean;
  height?: string;
}

export function SpectrumVisualizationPanel({
  spectra,
  selectedSpectrumId,
  onSpectrumSelect,
  showActionSpectra = false,
  showBands = true,
  height = '400px'
}: SpectrumVisualizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'spectrum' | 'metrics' | 'ratios'>('spectrum');
  const [visibleSpectra, setVisibleSpectra] = useState<Set<string>>(
    new Set(spectra.map(s => s.id))
  );
  const [showMcCree, setShowMcCree] = useState(false);
  const [showPhytochrome, setShowPhytochrome] = useState(false);
  const [showCryptochrome, setShowCryptochrome] = useState(false);

  const selectedSpectrum = useMemo(() => 
    spectra.find(s => s.id === selectedSpectrumId),
    [spectra, selectedSpectrumId]
  );

  const selectedMetrics = useMemo(() => 
    selectedSpectrum ? SpectrumAnalyzer.analyzeSpectrum(selectedSpectrum.spd) : null,
    [selectedSpectrum]
  );

  const actionSpectra = useMemo(() => 
    SpectrumAnalyzer.getActionSpectra(),
    []
  );

  const chartData = useMemo(() => {
    const datasets: any[] = [];
    
    // Add visible spectra
    spectra.forEach(spectrum => {
      if (visibleSpectra.has(spectrum.id)) {
        const vizData = SpectrumAnalyzer.generateSpectrumVisualizationData(spectrum.spd);
        datasets.push({
          label: spectrum.name,
          data: vizData.intensities,
          borderColor: spectrum.color,
          backgroundColor: spectrum.color + '20',
          borderWidth: spectrum.id === selectedSpectrumId ? 3 : 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4
        });
      }
    });

    // Add action spectra if enabled
    if (showActionSpectra) {
      if (showMcCree) {
        datasets.push({
          label: 'McCree (Photosynthesis)',
          data: actionSpectra.mccree.intensities,
          borderColor: '#00FF00',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0
        });
      }
      
      if (showPhytochrome) {
        datasets.push({
          label: 'Phytochrome Pr',
          data: actionSpectra.phytochromePr.intensities,
          borderColor: '#FF0000',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0
        });
        
        datasets.push({
          label: 'Phytochrome Pfr',
          data: actionSpectra.phytochromePfr.intensities,
          borderColor: '#8B0000',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0
        });
      }
      
      if (showCryptochrome) {
        datasets.push({
          label: 'Cryptochrome',
          data: actionSpectra.cryptochrome.intensities,
          borderColor: '#0000FF',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0
        });
      }
    }

    // Generate wavelength labels
    const wavelengths = [];
    for (let wl = 300; wl <= 800; wl += 10) {
      wavelengths.push(wl);
    }

    return {
      labels: wavelengths,
      datasets
    };
  }, [spectra, visibleSpectra, selectedSpectrumId, showActionSpectra, showMcCree, showPhytochrome, showCryptochrome, actionSpectra]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#ffffff',
          font: { size: 11 },
          padding: 8,
          usePointStyle: true
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Wavelength (nm)',
          color: '#9ca3af'
        },
        grid: {
          color: '#374151',
          lineWidth: 0.5
        },
        ticks: {
          color: '#9ca3af',
          stepSize: 50
        }
      },
      y: {
        title: {
          display: true,
          text: 'Relative Intensity',
          color: '#9ca3af'
        },
        grid: {
          color: '#374151',
          lineWidth: 0.5
        },
        ticks: {
          color: '#9ca3af'
        },
        beginAtZero: true
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const renderMetricsTab = () => {
    if (!selectedMetrics) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          Select a spectrum to view metrics
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Color Metrics</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">CCT:</span>
                <span className="text-white">{selectedMetrics.cct}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CRI:</span>
                <span className="text-white">{selectedMetrics.cri}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">R9:</span>
                <span className="text-white">{selectedMetrics.r9}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duv:</span>
                <span className="text-white">{selectedMetrics.duv.toFixed(4)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Photosynthetic</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">PPF:</span>
                <span className="text-white">{selectedMetrics.ppf.toFixed(0)} μmol/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">YPF:</span>
                <span className="text-white">{selectedMetrics.ypf.toFixed(0)} μmol/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Efficacy:</span>
                <span className="text-white">{selectedMetrics.efficacy.toFixed(2)} μmol/J</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">PAR %:</span>
                <span className="text-white">{selectedMetrics.par.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Spectrum Bands</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">UV:</span>
                <span className="text-purple-400">{selectedMetrics.uv.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Blue:</span>
                <span className="text-blue-400">{selectedMetrics.blue.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Green:</span>
                <span className="text-green-400">{selectedMetrics.green.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Red:</span>
                <span className="text-red-400">{selectedMetrics.red.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Far-Red:</span>
                <span className="text-red-700">{selectedMetrics.farRed.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Plant Response</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">R:B Ratio:</span>
                <span className="text-white">{selectedMetrics.rbRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">R:FR Ratio:</span>
                <span className="text-white">{selectedMetrics.rfrRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pfr/Ptotal:</span>
                <span className="text-white">{(selectedMetrics.pfrPtotal * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRatiosTab = () => {
    if (!selectedMetrics) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          Select a spectrum to view ratios
        </div>
      );
    }

    const getQualityIndicator = (value: number, optimal: { min: number; max: number }) => {
      if (value >= optimal.min && value <= optimal.max) {
        return { color: 'text-green-400', label: 'Optimal' };
      } else if (value < optimal.min * 0.7 || value > optimal.max * 1.3) {
        return { color: 'text-red-400', label: 'Poor' };
      } else {
        return { color: 'text-yellow-400', label: 'Acceptable' };
      }
    };

    return (
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Photomorphogenic Ratios</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Red:Blue Ratio</span>
                <span className="text-lg font-semibold text-white">{selectedMetrics.rbRatio.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-400">
                Optimal: 1.5-3.0 for balanced growth
              </div>
              <div className={`text-xs ${getQualityIndicator(selectedMetrics.rbRatio, { min: 1.5, max: 3.0 }).color}`}>
                {getQualityIndicator(selectedMetrics.rbRatio, { min: 1.5, max: 3.0 }).label}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Red:Far-Red Ratio</span>
                <span className="text-lg font-semibold text-white">{selectedMetrics.rfrRatio.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-400">
                Optimal: 5-15 for compact growth
              </div>
              <div className={`text-xs ${getQualityIndicator(selectedMetrics.rfrRatio, { min: 5, max: 15 }).color}`}>
                {getQualityIndicator(selectedMetrics.rfrRatio, { min: 5, max: 15 }).label}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">Phytochrome Pfr/Ptotal</span>
                <span className="text-lg font-semibold text-white">{(selectedMetrics.pfrPtotal * 100).toFixed(1)}%</span>
              </div>
              <div className="text-xs text-gray-400">
                Optimal: 70-85% for flowering induction
              </div>
              <div className={`text-xs ${getQualityIndicator(selectedMetrics.pfrPtotal * 100, { min: 70, max: 85 }).color}`}>
                {getQualityIndicator(selectedMetrics.pfrPtotal * 100, { min: 70, max: 85 }).label}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Growth Stage Recommendations</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Vegetative: High blue (R:B 1-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300">Flowering: High red (R:B 3-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">EOD Far-red: Low R:FR (1-3)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Spectrum Analysis</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('spectrum')}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'spectrum' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Spectrum
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'metrics' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Metrics
            </button>
            <button
              onClick={() => setActiveTab('ratios')}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'ratios' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Ratios
            </button>
          </div>
        </div>
        
        {activeTab === 'spectrum' && showActionSpectra && (
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setShowMcCree(!showMcCree)}
              className={`px-2 py-1 rounded text-xs ${
                showMcCree ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              McCree
            </button>
            <button
              onClick={() => setShowPhytochrome(!showPhytochrome)}
              className={`px-2 py-1 rounded text-xs ${
                showPhytochrome ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Phytochrome
            </button>
            <button
              onClick={() => setShowCryptochrome(!showCryptochrome)}
              className={`px-2 py-1 rounded text-xs ${
                showCryptochrome ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Cryptochrome
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {activeTab === 'spectrum' && (
          <div style={{ height }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
        
        {activeTab === 'metrics' && renderMetricsTab()}
        {activeTab === 'ratios' && renderRatiosTab()}
      </div>
      
      {spectra.length > 1 && activeTab === 'spectrum' && (
        <div className="border-t border-gray-800 p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Visible Spectra</h4>
          <div className="space-y-1">
            {spectra.map(spectrum => (
              <label key={spectrum.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleSpectra.has(spectrum.id)}
                  onChange={(e) => {
                    const newVisible = new Set(visibleSpectra);
                    if (e.target.checked) {
                      newVisible.add(spectrum.id);
                    } else {
                      newVisible.delete(spectrum.id);
                    }
                    setVisibleSpectra(newVisible);
                  }}
                  className="rounded border-gray-600 bg-gray-800 text-purple-600"
                />
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: spectrum.color }}
                />
                <span
                  className={`text-sm cursor-pointer ${
                    spectrum.id === selectedSpectrumId ? 'text-white font-semibold' : 'text-gray-400'
                  }`}
                  onClick={() => onSpectrumSelect?.(spectrum.id)}
                >
                  {spectrum.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}