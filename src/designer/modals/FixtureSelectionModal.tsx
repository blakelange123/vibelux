'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Filter,
  Check,
  ChevronRight,
  Zap,
  DollarSign,
  Target,
  Building,
  TrendingUp,
  Star,
  Grid3X3,
  List,
  Info,
  Package,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import type { FixtureModel } from '@/components/FixtureLibrary';

interface FixtureSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fixture: FixtureModel) => void;
  title?: string;
}

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ElementType;
  filter: (fixture: FixtureModel) => boolean;
  active?: boolean;
}

export function FixtureSelectionModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select Fixture"
}: FixtureSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFixture, setSelectedFixture] = useState<FixtureModel | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [fixtures, setFixtures] = useState<FixtureModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load fixtures from API
  useEffect(() => {
    if (isOpen) {
      loadFixtures();
    }
  }, [isOpen]);

  const loadFixtures = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/fixtures');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setFixtures(data);
        } else if (data && Array.isArray(data.fixtures)) {
          // Handle case where API returns { fixtures: [...] }
          // Transform the API data to match FixtureModel interface
          const transformedFixtures = data.fixtures.map((f: any) => ({
            id: f.id,
            brand: f.brand || f.manufacturer,
            model: f.modelNumber || f.productName,
            wattage: f.reportedWattage || f.wattage,
            ppf: f.reportedPPF || f.ppf,
            efficacy: f.reportedPPE || f.efficacy,
            spectrum: f.spectrum || 'Full Spectrum',
            category: f.category,
            price: f.price,
            beamAngle: f.beamAngle || 120,
            dlcQualified: f.dlcQualified,
            dlcPremium: f.dlcPremium
          }));
          setFixtures(transformedFixtures);
        } else {
          console.error('Invalid fixture data format:', data);
          setFixtures([]);
        }
      } else {
        console.error('Failed to fetch fixtures:', response.status);
        setFixtures([]);
      }
    } catch (error) {
      console.error('Failed to load fixtures:', error);
      setFixtures([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick filter definitions
  const quickFilters: QuickFilter[] = [
    {
      id: 'high-efficacy',
      label: 'High Efficacy (≥3.5)',
      icon: TrendingUp,
      filter: (f) => f.efficacy >= 3.5
    },
    {
      id: 'low-wattage',
      label: 'Low Power (<400W)',
      icon: Zap,
      filter: (f) => f.wattage < 400
    },
    {
      id: 'medium-wattage',
      label: 'Medium Power (400-700W)',
      icon: Zap,
      filter: (f) => f.wattage >= 400 && f.wattage <= 700
    },
    {
      id: 'high-wattage',
      label: 'High Power (>700W)',
      icon: Zap,
      filter: (f) => f.wattage > 700
    },
    {
      id: 'budget',
      label: 'Budget Friendly',
      icon: DollarSign,
      filter: (f) => f.price && f.price < 800
    },
    {
      id: 'premium',
      label: 'Premium',
      icon: Star,
      filter: (f) => f.price && f.price >= 1200
    }
  ];

  // Filter and search fixtures
  const filteredFixtures = useMemo(() => {
    // Ensure fixtures is always an array
    if (!Array.isArray(fixtures)) {
      console.error('Fixtures is not an array:', fixtures);
      return [];
    }
    
    let result = fixtures;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.brand?.toLowerCase().includes(query) ||
        f.model?.toLowerCase().includes(query) ||
        f.spectrum?.toLowerCase().includes(query) ||
        f.category?.toLowerCase().includes(query)
      );
    }

    // Apply quick filters
    if (activeFilters.size > 0) {
      quickFilters.forEach(qf => {
        if (activeFilters.has(qf.id)) {
          result = result.filter(qf.filter);
        }
      });
    }

    return result;
  }, [fixtures, searchQuery, activeFilters]);

  // Toggle quick filter
  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filterId)) {
        newFilters.delete(filterId);
      } else {
        newFilters.add(filterId);
      }
      return newFilters;
    });
  };

  // Handle fixture selection
  const handleSelectFixture = (fixture: FixtureModel) => {
    setSelectedFixture(fixture);
  };

  // Confirm selection
  const handleConfirmSelection = () => {
    if (selectedFixture) {
      onSelect(selectedFixture);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by brand, model, spectrum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {quickFilters.map(filter => {
              const Icon = filter.icon;
              const isActive = activeFilters.has(filter.id);
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700 border-blue-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                  {isActive && <Check className="h-3 w-3" />}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {Array.isArray(filteredFixtures) ? filteredFixtures.length : 0} fixtures found
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Fixture List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading fixtures...</div>
          ) : !Array.isArray(filteredFixtures) || filteredFixtures.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No fixtures found matching your criteria</div>
          ) : (
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 gap-4' 
                : 'space-y-2'
              }
            `}>
              {filteredFixtures.map(fixture => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  viewMode={viewMode}
                  isSelected={selectedFixture?.id === fixture.id}
                  onSelect={handleSelectFixture}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected Fixture Details */}
        {selectedFixture && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {selectedFixture.brand} {selectedFixture.model}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      {selectedFixture.wattage}W
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {selectedFixture.ppf} PPF
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {selectedFixture.efficacy} µmol/J
                    </span>
                    {selectedFixture.price && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${selectedFixture.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleConfirmSelection}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Select Fixture
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Fixture Card Component
interface FixtureCardProps {
  fixture: FixtureModel;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: (fixture: FixtureModel) => void;
}

function FixtureCard({ fixture, viewMode, isSelected, onSelect }: FixtureCardProps) {
  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => onSelect(fixture)}
        className={`
          p-4 rounded-lg border cursor-pointer transition-all
          ${isSelected 
            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <Lightbulb className="h-8 w-8 text-gray-400" />
          {isSelected && <Check className="h-5 w-5 text-blue-600" />}
        </div>
        <h4 className="font-semibold text-gray-800 truncate">{fixture.brand}</h4>
        <p className="text-sm text-gray-600 truncate mb-3">{fixture.model}</p>
        
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Power</span>
            <span className="font-medium">{fixture.wattage}W</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">PPF</span>
            <span className="font-medium">{fixture.ppf}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Efficacy</span>
            <span className="font-medium">{fixture.efficacy} µmol/J</span>
          </div>
          {fixture.price && (
            <div className="flex justify-between">
              <span className="text-gray-500">Price</span>
              <span className="font-medium">${fixture.price}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      onClick={() => onSelect(fixture)}
      className={`
        px-4 py-3 rounded-lg border cursor-pointer transition-all
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Lightbulb className="h-6 w-6 text-gray-400" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">
              {fixture.brand} {fixture.model}
            </h4>
            <p className="text-sm text-gray-600">{fixture.spectrum}</p>
          </div>
          <div className="grid grid-cols-4 gap-6 text-sm">
            <div className="text-center">
              <div className="text-gray-500">Power</div>
              <div className="font-semibold">{fixture.wattage}W</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">PPF</div>
              <div className="font-semibold">{fixture.ppf}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Efficacy</div>
              <div className="font-semibold">{fixture.efficacy} µmol/J</div>
            </div>
            {fixture.price && (
              <div className="text-center">
                <div className="text-gray-500">Price</div>
                <div className="font-semibold">${fixture.price}</div>
              </div>
            )}
          </div>
          {isSelected && <Check className="h-5 w-5 text-blue-600 ml-4" />}
        </div>
      </div>
    </div>
  );
}