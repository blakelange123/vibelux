'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Zap, Shield, Info, Star, Download } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { fixtureLibraryManager } from '@/lib/fixture-library-manager';
import { getFixtureCategory } from '@/lib/fixtures-data';
import type { FixtureModel } from '@/components/FixtureLibrary';
import type { CustomFixture } from '@/lib/fixture-library-manager';

interface AdvancedFixture extends FixtureModel {
  beamAngle?: number;
  isDLC?: boolean;
  dlcData?: any;
  thd?: number; // Total Harmonic Distortion percentage
  powerFactor?: number;
  driverType?: 'constant-current' | 'constant-voltage' | 'programmable';
}

export function AdvancedFixtureLibrary() {
  const { dispatch, addObject, state } = useDesigner();
  const { room } = state;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [selectedFixture, setSelectedFixture] = useState<AdvancedFixture | null>(null);
  const [showDLCOnly, setShowDLCOnly] = useState(false);
  const [fixtures, setFixtures] = useState<AdvancedFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMinWattage, setFilterMinWattage] = useState(0);
  const [filterMaxWattage, setFilterMaxWattage] = useState(2000);
  const [filterMinPPF, setFilterMinPPF] = useState(0);
  const [filterMaxPPF, setFilterMaxPPF] = useState(5000);
  const [filterMaxTHD, setFilterMaxTHD] = useState(100); // No THD filter by default
  const [showTHDCompliant, setShowTHDCompliant] = useState(false); // THD < 20% for DLC Premium
  const [sortBy, setSortBy] = useState<'efficacy' | 'thd' | 'ppf' | 'wattage'>('efficacy');

  // Load fixtures on mount
  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async () => {
    setLoading(true);
    try {
      // Load custom fixtures from library manager
      const customFixtures = fixtureLibraryManager.getAllFixtures();
      
      // Load DLC fixtures from API
      const params = new URLSearchParams({
        limit: '1000', // Get all fixtures
        minPPE: '0',
        maxPPE: '10',
        minWattage: '0',
        maxWattage: '2000'
      });
      
      const response = await fetch(`/api/fixtures?${params}`);
      const data = await response.json();
      
      let dlcFixtures: AdvancedFixture[] = [];
      if (data.fixtures && Array.isArray(data.fixtures)) {
        dlcFixtures = data.fixtures.map((f: any) => ({
          id: `dlc-${f.id}`,
          brand: f.brand || f.manufacturer,
          model: f.modelNumber,
          category: f.category || getFixtureCategory(f),
          wattage: f.reportedWattage,
          ppf: f.reportedPPF,
          efficacy: f.reportedPPE,
          spectrum: categorizeSpectrum(f),
          spectrumData: {
            blue: calculateSpectrumPercentage(f.blueFlux, f),
            green: calculateSpectrumPercentage(f.greenFlux, f),
            red: calculateSpectrumPercentage(f.redFlux, f),
            farRed: calculateSpectrumPercentage(f.farRedFlux, f)
          },
          coverage: estimateCoverage(f),
          beamAngle: 120, // Default beam angle for LED fixtures
          isDLC: true,
          thd: estimateTHD(f), // Estimate THD based on fixture characteristics
          powerFactor: f.powerFactor || estimatePowerFactor(f),
          driverType: categorizeDriverType(f),
          dlcData: {
            testedPPF: f.testedPPF || f.reportedPPF,
            testedWattage: f.testedWattage || f.reportedWattage,
            testedPPE: f.testedPPE || f.reportedPPE,
            width: f.width || f.dimensions?.width,
            length: f.length || f.dimensions?.length,
            height: f.height || f.dimensions?.height,
            dimmable: f.dimmable,
            warranty: f.warranty,
            voltage: f.minVoltage && f.maxVoltage ? `${f.minVoltage}-${f.maxVoltage}V` : undefined
          }
        }));
      }
      
      // Combine all fixtures
      const allFixtures: AdvancedFixture[] = [
        ...customFixtures.map(f => ({
          ...f,
          beamAngle: f.photometricData?.beamAngle || 120,
          isDLC: !!f.dlcData
        })),
        ...dlcFixtures
      ];
      
      setFixtures(allFixtures);
    } catch (error) {
      console.error('Error loading fixtures:', error);
      // Fall back to sample fixtures if API fails
      const sampleFixtures = createSampleDLCFixtures();
      setFixtures(sampleFixtures);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions
  const categorizeSpectrum = (fixture: any): string => {
    const totalFlux = (fixture.blueFlux || 0) + (fixture.greenFlux || 0) + 
                     (fixture.redFlux || 0) + (fixture.farRedFlux || 0);
    
    if (totalFlux === 0) return 'Full Spectrum';
    
    const redPercent = ((fixture.redFlux || 0) / totalFlux) * 100;
    const bluePercent = ((fixture.blueFlux || 0) / totalFlux) * 100;
    const farRedPercent = ((fixture.farRedFlux || 0) / totalFlux) * 100;
    
    if (redPercent > 70) return 'Flowering';
    if (bluePercent > 30) return 'Vegetative';
    if (farRedPercent > 5) return 'Full Spectrum + Far Red';
    return 'Full Spectrum';
  };
  
  const calculateSpectrumPercentage = (flux: number | undefined, fixture: any): number => {
    if (!flux) return 0;
    const totalFlux = (fixture.blueFlux || 0) + (fixture.greenFlux || 0) + 
                     (fixture.redFlux || 0) + (fixture.farRedFlux || 0);
    if (totalFlux === 0) return 0;
    return Math.round((flux / totalFlux) * 100);
  };
  
  const estimateCoverage = (fixture: any): number => {
    // Estimate coverage based on PPF (rough approximation)
    // Assuming ~125 PPF per sq ft for typical coverage
    if (fixture.reportedPPF) {
      return Math.round(fixture.reportedPPF / 125);
    }
    return 16; // Default 4x4 ft
  };
  
  const estimateTHD = (fixture: any): number => {
    // Estimate THD based on fixture characteristics
    // Higher quality (higher efficacy) fixtures typically have better drivers with lower THD
    const efficacy = fixture.reportedPPE || 2.0;
    
    if (efficacy >= 2.8) return 8; // Premium drivers
    if (efficacy >= 2.5) return 12; // High-quality drivers
    if (efficacy >= 2.2) return 15; // Standard drivers
    if (efficacy >= 2.0) return 18; // Basic drivers
    return 25; // Lower quality drivers
  };
  
  const estimatePowerFactor = (fixture: any): number => {
    // Estimate power factor based on THD and typical driver characteristics
    const thd = estimateTHD(fixture);
    
    // Power factor decreases with higher THD
    if (thd <= 10) return 0.99;
    if (thd <= 15) return 0.95;
    if (thd <= 20) return 0.92;
    if (thd <= 30) return 0.85;
    return 0.80;
  };
  
  const categorizeDriverType = (fixture: any): 'constant-current' | 'constant-voltage' | 'programmable' => {
    // Categorize driver type based on fixture characteristics
    if (fixture.dimmable === 'Yes' && fixture.reportedPPE >= 2.5) {
      return 'programmable';
    }
    if (fixture.reportedPPE >= 2.3) {
      return 'constant-current';
    }
    return 'constant-voltage';
  };

  // Group and filter fixtures
  const filteredFixtures = useMemo(() => {
    let filtered = fixtures;

    // Apply DLC filter
    if (showDLCOnly) {
      filtered = filtered.filter(f => f.isDLC);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.brand.toLowerCase().includes(term) ||
        f.model.toLowerCase().includes(term) ||
        f.spectrum?.toLowerCase().includes(term)
      );
    }

    // Apply numeric filters
    filtered = filtered.filter(f =>
      f.wattage >= filterMinWattage &&
      f.wattage <= filterMaxWattage &&
      f.ppf >= filterMinPPF &&
      f.ppf <= filterMaxPPF
    );
    
    // Apply THD filter
    if (showTHDCompliant) {
      filtered = filtered.filter(f => (f.thd || 100) < 20); // DLC Premium THD < 20%
    } else if (filterMaxTHD < 100) {
      filtered = filtered.filter(f => (f.thd || 100) <= filterMaxTHD);
    }
    
    // Sort fixtures
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'thd':
          return (a.thd || 100) - (b.thd || 100);
        case 'ppf':
          return b.ppf - a.ppf;
        case 'wattage':
          return a.wattage - b.wattage;
        case 'efficacy':
        default:
          return b.efficacy - a.efficacy;
      }
    });

    return filtered;
  }, [fixtures, searchTerm, showDLCOnly, filterMinWattage, filterMaxWattage, filterMinPPF, filterMaxPPF, filterMaxTHD, showTHDCompliant, sortBy]);

  // Group by brand
  const fixturesByBrand = useMemo(() => {
    return filteredFixtures.reduce((acc, fixture) => {
      if (!acc[fixture.brand]) acc[fixture.brand] = [];
      acc[fixture.brand].push(fixture);
      return acc;
    }, {} as Record<string, AdvancedFixture[]>);
  }, [filteredFixtures]);

  const toggleBrand = (brand: string) => {
    const newExpanded = new Set(expandedBrands);
    if (newExpanded.has(brand)) {
      newExpanded.delete(brand);
    } else {
      newExpanded.add(brand);
    }
    setExpandedBrands(newExpanded);
  };

  const handleSelectFixture = (fixture: AdvancedFixture) => {
    setSelectedFixture(fixture);
    
    // Update global UI state so Canvas2D can use the selected fixture model
    dispatch({ type: 'SET_SELECTED_FIXTURE', payload: fixture });
    
    // Mark as recently used
    if (fixture.id.startsWith('custom-') || fixture.id.startsWith('dlc-')) {
      fixtureLibraryManager.markAsUsed(fixture.id);
    }
  };

  const handlePlaceFixture = () => {
    if (!selectedFixture) return;

    // Set tool to placement mode so user can click to place
    dispatch({ type: 'SET_TOOL', payload: 'place' });
    dispatch({ type: 'SET_OBJECT_TYPE', payload: 'fixture' });
    
    // The selected fixture is already set in global state via handleSelectFixture
    // Canvas2D will use this data when placing the fixture
    
    // Close the panel by dispatching a custom event
    window.dispatchEvent(new CustomEvent('closePanels'));
    
    // Show placement instructions
    window.dispatchEvent(new CustomEvent('showPlacementMode', { 
      detail: { 
        fixture: selectedFixture,
        message: `Click on the canvas to place ${selectedFixture.brand} ${selectedFixture.model}` 
      } 
    }));
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-400 text-sm">Loading fixtures...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 pb-2 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-white">Select Fixture</h3>
          <span className="text-xs text-purple-400 font-medium">{filteredFixtures.length} fixtures</span>
        </div>
        
        {/* Search - Made larger and more prominent */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
          <input
            type="text"
            placeholder="Search by brand, model, or spectrum..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 bg-gray-800 border-2 border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:bg-gray-750 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showDLCOnly}
              onChange={(e) => setShowDLCOnly(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
            />
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-gray-300">DLC Qualified Only</span>
          </label>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showTHDCompliant}
              onChange={(e) => setShowTHDCompliant(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
            />
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-gray-300">THD &lt; 20% (DLC Premium)</span>
          </label>
        </div>
        
        {/* Sort Options */}
        <div className="mt-3">
          <label className="block text-xs text-gray-400 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
          >
            <option value="efficacy">Efficacy (µmol/J)</option>
            <option value="thd">THD (Low to High)</option>
            <option value="ppf">PPF (High to Low)</option>
            <option value="wattage">Wattage (Low to High)</option>
          </select>
        </div>

        {/* Advanced Filters */}
        <details className="mt-3">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
            Advanced Filters
          </summary>
          <div className="mt-2 space-y-2">
            <div>
              <label className="text-xs text-gray-400">Wattage Range</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  value={filterMinWattage}
                  onChange={(e) => setFilterMinWattage(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                  placeholder="Min"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  value={filterMaxWattage}
                  onChange={(e) => setFilterMaxWattage(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                  placeholder="Max"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400">PPF Range</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  value={filterMinPPF}
                  onChange={(e) => setFilterMinPPF(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                  placeholder="Min"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  value={filterMaxPPF}
                  onChange={(e) => setFilterMaxPPF(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                  placeholder="Max"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400">Max THD %</label>
              <input
                type="number"
                value={filterMaxTHD}
                onChange={(e) => setFilterMaxTHD(Number(e.target.value))}
                className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                placeholder="20"
                max="100"
              />
            </div>
          </div>
        </details>
      </div>

      {/* Fixture List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {Object.entries(fixturesByBrand).map(([brand, brandFixtures]) => (
            <div key={brand} className="bg-gray-800/50 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleBrand(brand)}
                className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-700/50 transition-all"
              >
                <span className="text-sm font-medium text-white">{brand}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{brandFixtures.length}</span>
                  {expandedBrands.has(brand) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedBrands.has(brand) && (
                <div className="border-t border-gray-700">
                  {brandFixtures.map(fixture => (
                    <button
                      key={fixture.id}
                      onClick={() => handleSelectFixture(fixture)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-700/50 transition-all ${
                        selectedFixture?.id === fixture.id ? 'bg-purple-600/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white">{fixture.model}</p>
                            {fixture.isDLC && (
                              <div title="DLC Qualified">
                                <Shield className="w-3 h-3 text-green-500" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {fixture.wattage}W • {fixture.ppf} PPF • {fixture.efficacy.toFixed(2)} µmol/J
                          </p>
                          <p className="text-xs text-gray-500">
                            {fixture.spectrum && <span>{fixture.spectrum} • </span>}
                            THD: {fixture.thd || 'N/A'}%
                            {fixture.thd && fixture.thd < 20 && (
                              <span className="text-green-500 ml-1">✓</span>
                            )}
                          </p>
                        </div>
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {Object.keys(fixturesByBrand).length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No fixtures found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Selected Fixture Details - Fixed position at bottom */}
      {selectedFixture && (
        <div className="sticky bottom-0 p-4 border-t-2 border-purple-600 bg-gray-900">
          <div className="bg-purple-600/20 rounded-lg border border-purple-600/50 p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-purple-300 mb-1">Selected Fixture</p>
                <p className="text-sm font-medium text-white">
                  {selectedFixture.brand} {selectedFixture.model}
                </p>
              </div>
              {selectedFixture.isDLC && (
                <Shield className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mt-3">
              <div>
                <span className="text-gray-400">Wattage:</span>
                <span className="text-white ml-1">{selectedFixture.wattage}W</span>
              </div>
              <div>
                <span className="text-gray-400">PPF:</span>
                <span className="text-white ml-1">{selectedFixture.ppf} µmol/s</span>
              </div>
              <div>
                <span className="text-gray-400">Efficacy:</span>
                <span className="text-white ml-1">{selectedFixture.efficacy.toFixed(2)} µmol/J</span>
              </div>
              <div>
                <span className="text-gray-400">Beam Angle:</span>
                <span className="text-white ml-1">{selectedFixture.beamAngle || 120}°</span>
              </div>
              <div>
                <span className="text-gray-400">THD:</span>
                <span className={`ml-1 ${selectedFixture.thd && selectedFixture.thd < 20 ? 'text-green-400' : 'text-white'}`}>
                  {selectedFixture.thd || 'N/A'}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">Power Factor:</span>
                <span className="text-white ml-1">{selectedFixture.powerFactor?.toFixed(2) || 'N/A'}</span>
              </div>
            </div>

            {selectedFixture.dlcData && (
              <div className="mt-3 pt-3 border-t border-purple-600/30">
                <p className="text-xs text-purple-300 mb-1">DLC Test Results</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedFixture.dlcData.testedPPF && (
                    <div>
                      <span className="text-gray-400">Tested PPF:</span>
                      <span className="text-white ml-1">{selectedFixture.dlcData.testedPPF}</span>
                    </div>
                  )}
                  {selectedFixture.dlcData.testedPPE && (
                    <div>
                      <span className="text-gray-400">Tested PPE:</span>
                      <span className="text-white ml-1">{selectedFixture.dlcData.testedPPE.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={handlePlaceFixture}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-600/50 flex items-center justify-center gap-2"
              >
                <span className="text-lg">➕</span>
                Place Fixture
              </button>
              <button
                onClick={() => {
                  // Open THD compliance checker with this fixture's data
                  window.dispatchEvent(new CustomEvent('analyzeTHD', { 
                    detail: { 
                      fixture: selectedFixture,
                      driverType: selectedFixture.driverType || 'constant-current',
                      powerRating: selectedFixture.wattage,
                      hasActivePFC: selectedFixture.powerFactor && selectedFixture.powerFactor > 0.9
                    } 
                  }));
                }}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all"
                title="Analyze THD compliance"
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sample DLC fixtures for demonstration
function createSampleDLCFixtures(): AdvancedFixture[] {
  return [
    {
      id: 'dlc-fluence-spydr-2p',
      brand: 'Fluence',
      model: 'SPYDR 2p',
      category: 'DLC Qualified',
      wattage: 645,
      ppf: 1700,
      efficacy: 2.64,
      spectrum: 'Full Spectrum',
      spectrumData: {
        blue: 18,
        green: 12,
        red: 65,
        farRed: 5
      },
      coverage: 16,
      beamAngle: 120,
      isDLC: true,
      thd: 12,
      powerFactor: 0.95,
      driverType: 'programmable' as const,
      dlcData: {
        testedPPF: 1685,
        testedWattage: 642,
        testedPPE: 2.62,
        width: 47,
        length: 43,
        height: 3.7
      }
    },
    {
      id: 'dlc-gavita-1700e',
      brand: 'Gavita',
      model: 'Pro 1700e LED',
      category: 'DLC Qualified',
      wattage: 645,
      ppf: 1700,
      efficacy: 2.64,
      spectrum: 'Full Spectrum',
      spectrumData: {
        blue: 20,
        green: 10,
        red: 65,
        farRed: 5
      },
      coverage: 16,
      beamAngle: 120,
      isDLC: true,
      dlcData: {
        testedPPF: 1692,
        testedWattage: 643,
        testedPPE: 2.63,
        width: 44,
        length: 44,
        height: 6
      }
    },
    {
      id: 'dlc-growers-choice-roi-e680',
      brand: 'Growers Choice',
      model: 'ROI-E680',
      category: 'DLC Qualified',
      wattage: 680,
      ppf: 1836,
      efficacy: 2.7,
      spectrum: 'Full Spectrum + Far Red',
      spectrumData: {
        blue: 15,
        green: 8,
        red: 67,
        farRed: 10
      },
      coverage: 16,
      beamAngle: 120,
      isDLC: true,
      dlcData: {
        testedPPF: 1825,
        testedWattage: 678,
        testedPPE: 2.69,
        width: 42,
        length: 42,
        height: 4
      }
    },
    {
      id: 'dlc-california-lightworks-megadrive-linear-550',
      brand: 'California Lightworks',
      model: 'MegaDrive Linear 550',
      category: 'DLC Qualified',
      wattage: 550,
      ppf: 1507,
      efficacy: 2.74,
      spectrum: 'Full Spectrum',
      spectrumData: {
        blue: 22,
        green: 15,
        red: 58,
        farRed: 5
      },
      coverage: 12,
      beamAngle: 110,
      isDLC: true,
      dlcData: {
        testedPPF: 1498,
        testedWattage: 548,
        testedPPE: 2.73,
        width: 12,
        length: 44,
        height: 3
      }
    },
    {
      id: 'dlc-photontek-x-680w-pro',
      brand: 'PhotonTek',
      model: 'X 680W PRO',
      category: 'DLC Qualified',
      wattage: 680,
      ppf: 1870,
      efficacy: 2.75,
      spectrum: 'Full Spectrum + Far Red',
      spectrumData: {
        blue: 17,
        green: 10,
        red: 65,
        farRed: 8
      },
      coverage: 16,
      beamAngle: 120,
      isDLC: true,
      dlcData: {
        testedPPF: 1856,
        testedWattage: 677,
        testedPPE: 2.74,
        width: 43,
        length: 43,
        height: 5
      }
    }
  ];
}