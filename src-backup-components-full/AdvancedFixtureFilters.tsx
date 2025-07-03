'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Filter, Zap, Lightbulb, Shield, Award, Droplets, Gauge, Wind, Database, Settings } from 'lucide-react';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export function AdvancedFixtureFilters({ onFiltersChange, onClose }: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  
  const [filters, setFilters] = useState({
    // Basic filters
    category: 'All',
    manufacturer: 'All',
    ppeRange: { min: 0, max: 10 },
    wattageRange: { min: 0, max: 2000 },
    ppfRange: { min: 0, max: 3000 },
    
    // Spectrum filters
    spectrumType: 'All', // Full Spectrum, Red/Blue, White, Custom
    hasUV: false,
    hasFarRed: false,
    colorTemp: { min: 2700, max: 6500 },
    cri: { min: 70, max: 100 },
    
    // Mounting & Physical
    mountingType: [] as string[], // Surface, Suspended, Track, Stand
    dimensions: {
      maxLength: '',
      maxWidth: '',
      maxHeight: '',
      maxWeight: ''
    },
    ipRating: 'All', // IP65, IP66, IP67, etc.
    
    // Control & Dimming
    dimmingType: [] as string[], // 0-10V, PWM, DALI, Wireless
    hasSmartControl: false,
    hasDaisyChain: false,
    hasScheduling: false,
    
    // Certifications
    certifications: [], // DLC, Energy Star, UL, ETL, etc.
    warranty: { min: 0, max: 10 },
    
    // Performance
    lifespan: { min: 0, max: 100000 },
    ambientTemp: { min: -40, max: 50 },
    powerFactor: { min: 0.9, max: 1.0 },
    thd: { max: 20 }, // Total Harmonic Distortion
    
    // Price & Availability
    priceRange: { min: 0, max: 10000 },
    inStock: false,
    rebateEligible: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const updateFilter = (category: string, value: any) => {
    const newFilters = { ...filters, [category]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      category: 'All',
      manufacturer: 'All',
      ppeRange: { min: 0, max: 10 },
      wattageRange: { min: 0, max: 2000 },
      ppfRange: { min: 0, max: 3000 },
      spectrumType: 'All',
      hasUV: false,
      hasFarRed: false,
      colorTemp: { min: 2700, max: 6500 },
      cri: { min: 70, max: 100 },
      mountingType: [] as string[],
      dimensions: { maxLength: '', maxWidth: '', maxHeight: '', maxWeight: '' },
      ipRating: 'All',
      dimmingType: [] as string[],
      hasSmartControl: false,
      hasDaisyChain: false,
      hasScheduling: false,
      certifications: [],
      warranty: { min: 0, max: 10 },
      lifespan: { min: 0, max: 100000 },
      ambientTemp: { min: -40, max: 50 },
      powerFactor: { min: 0.9, max: 1.0 },
      thd: { max: 20 },
      priceRange: { min: 0, max: 10000 },
      inStock: false,
      rebateEligible: false
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.manufacturer !== 'All') count++;
    if (filters.ppeRange.min > 0 || filters.ppeRange.max < 10) count++;
    if (filters.wattageRange.min > 0 || filters.wattageRange.max < 2000) count++;
    if (filters.spectrumType !== 'All') count++;
    if (filters.hasUV || filters.hasFarRed) count++;
    if (filters.mountingType.length > 0) count++;
    if (filters.dimmingType.length > 0) count++;
    if (filters.certifications.length > 0) count++;
    if (filters.hasSmartControl || filters.hasDaisyChain || filters.hasScheduling) count++;
    if (filters.inStock || filters.rebateEligible) count++;
    return count;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Advanced Filters</h2>
              {activeFilterCount() > 0 && (
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  {activeFilterCount()} active
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Basic Filters */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('basic')}
                className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-white">Basic Filters</span>
                </div>
                {expandedSections.includes('basic') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.includes('basic') && (
                <div className="p-4 space-y-4 bg-gray-800/50">
                  {/* PPE Range with Slider */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      PPE Range: {filters.ppeRange.min} - {filters.ppeRange.max} μmol/J
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={filters.ppeRange.min}
                        onChange={(e) => updateFilter('ppeRange', { ...filters.ppeRange, min: parseFloat(e.target.value) })}
                        className="flex-1"
                      />
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={filters.ppeRange.max}
                        onChange={(e) => updateFilter('ppeRange', { ...filters.ppeRange, max: parseFloat(e.target.value) })}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* PPF Range */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      PPF Output: {filters.ppfRange.min} - {filters.ppfRange.max} μmol/s
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={filters.ppfRange.min}
                        onChange={(e) => updateFilter('ppfRange', { ...filters.ppfRange, min: parseInt(e.target.value) })}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={filters.ppfRange.max}
                        onChange={(e) => updateFilter('ppfRange', { ...filters.ppfRange, max: parseInt(e.target.value) })}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Spectrum Filters */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('spectrum')}
                className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-white">Spectrum & Light Quality</span>
                </div>
                {expandedSections.includes('spectrum') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.includes('spectrum') && (
                <div className="p-4 space-y-4 bg-gray-800/50">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Spectrum Type</label>
                    <select
                      value={filters.spectrumType}
                      onChange={(e) => updateFilter('spectrumType', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="All">All Types</option>
                      <option value="Full Spectrum">Full Spectrum</option>
                      <option value="Red/Blue">Red/Blue</option>
                      <option value="White">White</option>
                      <option value="Custom">Custom Spectrum</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.hasUV}
                        onChange={(e) => updateFilter('hasUV', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-purple-600"
                      />
                      <span className="text-sm text-gray-300">Includes UV (280-400nm)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.hasFarRed}
                        onChange={(e) => updateFilter('hasFarRed', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-purple-600"
                      />
                      <span className="text-sm text-gray-300">Includes Far-Red (700-800nm)</span>
                    </label>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Color Temperature: {filters.colorTemp.min}K - {filters.colorTemp.max}K
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="range"
                        min="2700"
                        max="6500"
                        step="100"
                        value={filters.colorTemp.min}
                        onChange={(e) => updateFilter('colorTemp', { ...filters.colorTemp, min: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-400 w-12">{filters.colorTemp.min}K</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mounting & Physical */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('mounting')}
                className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-white">Mounting & Physical</span>
                </div>
                {expandedSections.includes('mounting') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.includes('mounting') && (
                <div className="p-4 space-y-4 bg-gray-800/50">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Mounting Type</label>
                    <div className="space-y-2">
                      {['Surface Mount', 'Suspended', 'Track', 'Stand/Rack', 'Recessed'].map(type => (
                        <label key={type} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.mountingType.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFilter('mountingType', [...filters.mountingType, type]);
                              } else {
                                updateFilter('mountingType', filters.mountingType.filter(t => t !== type));
                              }
                            }}
                            className="rounded border-gray-600 bg-gray-700 text-purple-600"
                          />
                          <span className="text-sm text-gray-300">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">IP Rating</label>
                    <select
                      value={filters.ipRating}
                      onChange={(e) => updateFilter('ipRating', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="All">All Ratings</option>
                      <option value="IP54">IP54 (Dust Protected)</option>
                      <option value="IP65">IP65 (Dust Tight)</option>
                      <option value="IP66">IP66 (Powerful Jets)</option>
                      <option value="IP67">IP67 (Temporary Immersion)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Control & Dimming */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('control')}
                className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Gauge className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-white">Control & Dimming</span>
                </div>
                {expandedSections.includes('control') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.includes('control') && (
                <div className="p-4 space-y-4 bg-gray-800/50">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Dimming Type</label>
                    <div className="space-y-2">
                      {['0-10V', 'PWM', 'DALI', 'Wireless', 'App Control'].map(type => (
                        <label key={type} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.dimmingType.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFilter('dimmingType', [...filters.dimmingType, type]);
                              } else {
                                updateFilter('dimmingType', filters.dimmingType.filter(t => t !== type));
                              }
                            }}
                            className="rounded border-gray-600 bg-gray-700 text-purple-600"
                          />
                          <span className="text-sm text-gray-300">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.hasSmartControl}
                        onChange={(e) => updateFilter('hasSmartControl', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-purple-600"
                      />
                      <span className="text-sm text-gray-300">Smart/IoT Control</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.hasDaisyChain}
                        onChange={(e) => updateFilter('hasDaisyChain', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-purple-600"
                      />
                      <span className="text-sm text-gray-300">Daisy Chain Capable</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.hasScheduling}
                        onChange={(e) => updateFilter('hasScheduling', e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-purple-600"
                      />
                      <span className="text-sm text-gray-300">Built-in Scheduling</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={resetFilters}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Reset all filters
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}