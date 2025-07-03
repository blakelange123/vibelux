'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Search, Upload, FileText, ChevronRight, Zap, Star, 
  DollarSign, Target, Plus, X, Eye, Download, Info,
  Filter, SlidersHorizontal, ArrowUpDown, Bookmark,
  BookmarkPlus, Clock, TrendingUp, Hash, Building,
  ChevronDown, ChevronUp, RotateCcw, Tag, Database,
  Lightbulb, Package, CheckCircle, AlertCircle
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { FixtureLibrary, type FixtureModel } from '@/components/FixtureLibrary';
import { IESFileUploader } from '@/components/IESFileUploader';
import { IESParser, type IESPhotometricData } from '@/lib/ies-parser-advanced';

interface ExtendedFixture extends FixtureModel {
  iesData?: IESPhotometricData;
  iesFileName?: string;
  hasCustomIES?: boolean;
}

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ElementType;
  filter: (fixture: FixtureModel) => boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: any;
  timestamp: Date;
}

export function EnhancedFixtureLibrary() {
  const { dispatch, state } = useDesigner();
  const [selectedFixture, setSelectedFixture] = useState<ExtendedFixture | null>(null);
  const [showIESUpload, setShowIESUpload] = useState(false);
  const [fixtureIESMap, setFixtureIESMap] = useState<Map<string, { data: IESPhotometricData; fileName: string }>>(new Map());

  // Enhanced search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'smart' | 'exact' | 'fuzzy'>('smart');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Quick filters
  const [activeQuickFilters, setActiveQuickFilters] = useState<Set<string>>(new Set());
  
  // Favorites and recent
  const [favoriteFixtures, setFavoriteFixtures] = useState<Set<string>>(new Set());
  const [recentFixtures, setRecentFixtures] = useState<string[]>([]);
  
  // Saved searches
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);

  // Advanced search fields
  const [advancedSearch, setAdvancedSearch] = useState({
    brand: '',
    model: '',
    dlcId: '',
    wattageMin: '',
    wattageMax: '',
    ppfMin: '',
    ppfMax: '',
    efficacyMin: '',
    efficacyMax: '',
    spectrum: '',
    tags: [] as string[]
  });

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vibelux-fixture-favorites');
    if (saved) setFavoriteFixtures(new Set(JSON.parse(saved)));
    
    const recent = localStorage.getItem('vibelux-fixture-recent');
    if (recent) setRecentFixtures(JSON.parse(recent));
    
    const searches = localStorage.getItem('vibelux-fixture-searches');
    if (searches) setSavedSearches(JSON.parse(searches));
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('vibelux-fixture-favorites', JSON.stringify(Array.from(favoriteFixtures)));
  }, [favoriteFixtures]);

  // Quick filter definitions
  const quickFilters: QuickFilter[] = [
    {
      id: 'high-efficacy',
      label: 'High Efficacy (>3.5)',
      icon: TrendingUp,
      filter: (f) => f.efficacy > 3.5
    },
    {
      id: 'commercial',
      label: 'Commercial (>600W)',
      icon: Building,
      filter: (f) => f.wattage > 600
    },
    {
      id: 'full-spectrum',
      label: 'Full Spectrum',
      icon: Lightbulb,
      filter: (f) => f.spectrum.toLowerCase().includes('full')
    },
    {
      id: 'flowering',
      label: 'Flowering Spectrum',
      icon: Star,
      filter: (f) => f.spectrum.toLowerCase().includes('flower') || (f.spectrumData && f.spectrumData.red > 65)
    },
    {
      id: 'vegetative',
      label: 'Vegetative Spectrum',
      icon: Lightbulb,
      filter: (f) => f.spectrum.toLowerCase().includes('veg') || (f.spectrumData && f.spectrumData.blue > 25)
    },
    {
      id: 'favorites',
      label: 'Favorites Only',
      icon: Bookmark,
      filter: (f) => favoriteFixtures.has(f.id)
    },
    {
      id: 'has-ies',
      label: 'Has IES File',
      icon: FileText,
      filter: (f) => fixtureIESMap.has(f.id)
    }
  ];

  // Smart search function
  const performSmartSearch = useCallback((fixture: FixtureModel, query: string): boolean => {
    const searchLower = query.toLowerCase();
    const searchTerms = searchLower.split(/\s+/);
    
    // Build searchable text
    const searchableText = [
      fixture.brand,
      fixture.model,
      fixture.category,
      fixture.spectrum,
      fixture.voltage || '',
      `${fixture.wattage}w`,
      `${fixture.ppf}ppf`,
      `${fixture.efficacy}ppe`,
      fixture.dlcData?.productId || ''
    ].join(' ').toLowerCase();
    
    // Check if all search terms are found
    return searchTerms.every(term => {
      // Handle numeric ranges (e.g., "400-600w")
      if (term.match(/^\d+-\d+w?$/)) {
        const [min, max] = term.replace('w', '').split('-').map(Number);
        return fixture.wattage >= min && fixture.wattage <= max;
      }
      
      // Handle PPF searches (e.g., ">1000ppf")
      if (term.match(/^[<>]\d+ppf?$/)) {
        const operator = term[0];
        const value = parseInt(term.slice(1));
        return operator === '>' ? fixture.ppf > value : fixture.ppf < value;
      }
      
      // Handle efficacy searches (e.g., ">2.8ppe")
      if (term.match(/^[<>]\d+\.?\d*ppe?$/)) {
        const operator = term[0];
        const value = parseFloat(term.slice(1));
        return operator === '>' ? fixture.efficacy > value : fixture.efficacy < value;
      }
      
      // Regular text search
      return searchableText.includes(term);
    });
  }, []);

  // Advanced search function
  const matchesAdvancedSearch = useCallback((fixture: FixtureModel): boolean => {
    const adv = advancedSearch;
    
    if (adv.brand && !fixture.brand.toLowerCase().includes(adv.brand.toLowerCase())) return false;
    if (adv.model && !fixture.model.toLowerCase().includes(adv.model.toLowerCase())) return false;
    if (adv.dlcId && fixture.dlcData?.productId && !fixture.dlcData.productId.includes(adv.dlcId)) return false;
    
    if (adv.wattageMin && fixture.wattage < parseFloat(adv.wattageMin)) return false;
    if (adv.wattageMax && fixture.wattage > parseFloat(adv.wattageMax)) return false;
    
    if (adv.ppfMin && fixture.ppf < parseFloat(adv.ppfMin)) return false;
    if (adv.ppfMax && fixture.ppf > parseFloat(adv.ppfMax)) return false;
    
    if (adv.efficacyMin && fixture.efficacy < parseFloat(adv.efficacyMin)) return false;
    if (adv.efficacyMax && fixture.efficacy > parseFloat(adv.efficacyMax)) return false;
    
    if (adv.spectrum && !fixture.spectrum.toLowerCase().includes(adv.spectrum.toLowerCase())) return false;
    
    return true;
  }, [advancedSearch]);

  const handleFixtureSelect = useCallback((fixture: FixtureModel) => {
    // Add to recent fixtures
    const newRecent = [fixture.id, ...recentFixtures.filter(id => id !== fixture.id)].slice(0, 10);
    setRecentFixtures(newRecent);
    localStorage.setItem('vibelux-fixture-recent', JSON.stringify(newRecent));
    
    // Check if fixture has custom IES data
    const iesInfo = fixtureIESMap.get(fixture.id);
    const extendedFixture: ExtendedFixture = {
      ...fixture,
      iesData: iesInfo?.data,
      iesFileName: iesInfo?.fileName,
      hasCustomIES: !!iesInfo
    };
    
    setSelectedFixture(extendedFixture);
    setShowIESUpload(false);
  }, [fixtureIESMap, recentFixtures]);

  const handleIESUpload = useCallback((iesData: IESPhotometricData, fileName: string) => {
    if (selectedFixture) {
      // Store IES data for this fixture
      const newMap = new Map(fixtureIESMap);
      newMap.set(selectedFixture.id, { data: iesData, fileName });
      setFixtureIESMap(newMap);
      
      // Update selected fixture
      setSelectedFixture({
        ...selectedFixture,
        iesData,
        iesFileName: fileName,
        hasCustomIES: true
      });
      
      // Notify user
      dispatch({
        type: 'SHOW_NOTIFICATION',
        payload: {
          type: 'success',
          message: `IES file "${fileName}" loaded for ${selectedFixture.brand} ${selectedFixture.model}`
        }
      });
    }
    
    setShowIESUpload(false);
  }, [selectedFixture, fixtureIESMap, dispatch]);

  const toggleFavorite = useCallback((fixtureId: string) => {
    const newFavorites = new Set(favoriteFixtures);
    if (newFavorites.has(fixtureId)) {
      newFavorites.delete(fixtureId);
    } else {
      newFavorites.add(fixtureId);
    }
    setFavoriteFixtures(newFavorites);
  }, [favoriteFixtures]);

  const saveCurrentSearch = useCallback(() => {
    const name = prompt('Name this search:');
    if (name) {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name,
        query: searchQuery,
        filters: {
          quickFilters: Array.from(activeQuickFilters),
          advancedSearch: { ...advancedSearch }
        },
        timestamp: new Date()
      };
      
      const newSearches = [...savedSearches, newSearch];
      setSavedSearches(newSearches);
      localStorage.setItem('vibelux-fixture-searches', JSON.stringify(newSearches));
    }
  }, [searchQuery, activeQuickFilters, advancedSearch, savedSearches]);

  const loadSavedSearch = useCallback((search: SavedSearch) => {
    setSearchQuery(search.query);
    setActiveQuickFilters(new Set(search.filters.quickFilters));
    setAdvancedSearch(search.filters.advancedSearch);
    setShowSavedSearches(false);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setActiveQuickFilters(new Set());
    setAdvancedSearch({
      brand: '',
      model: '',
      dlcId: '',
      wattageMin: '',
      wattageMax: '',
      ppfMin: '',
      ppfMax: '',
      efficacyMin: '',
      efficacyMax: '',
      spectrum: '',
      tags: []
    });
  }, []);

  const handlePlaceFixture = useCallback(() => {
    if (!selectedFixture || !state.room) return;
    
    // Set tool to place mode
    dispatch({ type: 'SET_TOOL', payload: 'place' });
    dispatch({ type: 'SET_OBJECT_TYPE', payload: 'fixture' });
    
    // Create fixture object with IES data if available
    const fixtureData = {
      ...selectedFixture,
      customIES: selectedFixture.hasCustomIES ? {
        data: selectedFixture.iesData,
        fileName: selectedFixture.iesFileName
      } : undefined
    };
    
    // Store the selected fixture data for placement
    dispatch({ type: 'SET_SELECTED_FIXTURE', payload: fixtureData });
    
    // Notify user
    dispatch({
      type: 'SHOW_NOTIFICATION',
      payload: {
        type: 'info',
        message: `Click on the canvas to place ${selectedFixture.brand} ${selectedFixture.model}${selectedFixture.hasCustomIES ? ' (with custom IES)' : ''}`
      }
    });
  }, [selectedFixture, state.room, dispatch]);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Enhanced Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            Advanced Fixture Library
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={saveCurrentSearch}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Save current search"
            >
              <BookmarkPlus className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative"
              title="Saved searches"
            >
              <Bookmark className="w-4 h-4 text-gray-400" />
              {savedSearches.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
              )}
            </button>
            <button
              onClick={clearAllFilters}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Clear all filters"
            >
              <RotateCcw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Smart Search Bar */}
        <div className="relative mb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchMode === 'smart' ? 'Try: "600-800w >2.8ppe flowering" or "gavita 1700e"' : 'Search fixtures...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`p-2.5 rounded-lg transition-colors ${
                showAdvancedSearch ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
              title="Advanced search"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
          
          {/* Search mode selector */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Search mode:</span>
            {(['smart', 'exact', 'fuzzy'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setSearchMode(mode)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  searchMode === mode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <div className="bg-gray-800 rounded-lg p-4 mb-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Brand"
                value={advancedSearch.brand}
                onChange={(e) => setAdvancedSearch(prev => ({ ...prev, brand: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Model"
                value={advancedSearch.model}
                onChange={(e) => setAdvancedSearch(prev => ({ ...prev, model: e.target.value }))}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <input
              type="text"
              placeholder="DLC Product ID"
              value={advancedSearch.dlcId}
              onChange={(e) => setAdvancedSearch(prev => ({ ...prev, dlcId: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Wattage Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={advancedSearch.wattageMin}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, wattageMin: e.target.value }))}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={advancedSearch.wattageMax}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, wattageMax: e.target.value }))}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-400">PPF Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={advancedSearch.ppfMin}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, ppfMin: e.target.value }))}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={advancedSearch.ppfMax}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, ppfMax: e.target.value }))}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Efficacy Range (PPE)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Min"
                  value={advancedSearch.efficacyMin}
                  onChange={(e) => setAdvancedSearch(prev => ({ ...prev, efficacyMin: e.target.value }))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Max"
                  value={advancedSearch.efficacyMax}
                  onChange={(e) => setAdvancedSearch(prev => ({ ...prev, efficacyMax: e.target.value }))}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map(filter => {
            const Icon = filter.icon;
            const isActive = activeQuickFilters.has(filter.id);
            
            return (
              <button
                key={filter.id}
                onClick={() => {
                  const newFilters = new Set(activeQuickFilters);
                  if (isActive) {
                    newFilters.delete(filter.id);
                  } else {
                    newFilters.add(filter.id);
                  }
                  setActiveQuickFilters(newFilters);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-3 h-3" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Recent Fixtures */}
        {recentFixtures.length > 0 && !showSavedSearches && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Recent:</span>
              <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                {recentFixtures.slice(0, 5).map(id => (
                  <button
                    key={id}
                    className="text-xs text-purple-400 hover:text-purple-300 whitespace-nowrap"
                    onClick={() => setSearchQuery(`id:${id}`)}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Saved Searches */}
        {showSavedSearches && savedSearches.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="space-y-2">
              {savedSearches.map(search => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-2 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer"
                  onClick={() => loadSavedSearch(search)}
                >
                  <div>
                    <div className="text-sm text-white">{search.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(search.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSavedSearches(prev => prev.filter(s => s.id !== search.id));
                    }}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixture List with Enhanced Filtering */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Active filters summary */}
          {(activeQuickFilters.size > 0 || searchQuery || showAdvancedSearch) && (
            <div className="mb-3 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Filter className="w-4 h-4" />
                <span>Active filters:</span>
                {searchQuery && (
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">
                    Search: "{searchQuery}"
                  </span>
                )}
                {Array.from(activeQuickFilters).map(filterId => {
                  const filter = quickFilters.find(f => f.id === filterId);
                  return filter ? (
                    <span key={filterId} className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                      {filter.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          <FixtureLibrary 
            onSelectFixture={handleFixtureSelect}
            selectedFixtureId={selectedFixture?.id}
            showDetails={true}
            customFilter={(fixtures) => {
              let filtered = fixtures;
              
              // Apply search
              if (searchQuery) {
                if (searchMode === 'smart') {
                  filtered = filtered.filter(f => performSmartSearch(f, searchQuery));
                } else if (searchMode === 'exact') {
                  filtered = filtered.filter(f => 
                    JSON.stringify(f).toLowerCase().includes(searchQuery.toLowerCase())
                  );
                } else {
                  // Fuzzy search - to be implemented
                  filtered = filtered.filter(f => performSmartSearch(f, searchQuery));
                }
              }
              
              // Apply advanced search
              if (showAdvancedSearch) {
                filtered = filtered.filter(matchesAdvancedSearch);
              }
              
              // Apply quick filters
              activeQuickFilters.forEach(filterId => {
                const quickFilter = quickFilters.find(f => f.id === filterId);
                if (quickFilter) {
                  filtered = filtered.filter(quickFilter.filter);
                }
              });
              
              return filtered;
            }}
          />
        </div>

        {/* Selected Fixture Panel */}
        {selectedFixture && (
          <div className="w-80 border-l border-gray-700 bg-gray-800/50 flex flex-col">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-gray-700 bg-gray-900/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Fixture Details</h3>
                <button
                  onClick={() => setSelectedFixture(null)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="Close details panel"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>
            
            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-1">
                <h4 className="text-white font-medium">{selectedFixture.brand}</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(selectedFixture.id)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Add to favorites"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        favoriteFixtures.has(selectedFixture.id)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => setSelectedFixture(null)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Close details"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{selectedFixture.model}</p>
              {selectedFixture.dlcData?.productId && (
                <div className="flex items-center gap-2 mt-1">
                  <Hash className="w-3 h-3 text-gray-500" />
                  <p className="text-xs text-gray-500">{selectedFixture.dlcData.productId}</p>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Power
                </span>
                <span className="text-gray-200">{selectedFixture.wattage}W</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1">
                  <Target className="w-3 h-3" /> PPF
                </span>
                <span className="text-gray-200">{selectedFixture.ppf} μmol/s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1">
                  <Star className="w-3 h-3" /> Efficacy
                </span>
                <span className="text-gray-200">{selectedFixture.efficacy.toFixed(2)} μmol/J</span>
              </div>
            </div>

            {/* Spectrum Data */}
            <div className="bg-gray-900 rounded-lg p-3 mb-4">
              <h5 className="text-gray-300 font-medium text-sm mb-2">Spectrum Distribution</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-400">Blue (400-500nm)</span>
                  <span className="text-gray-300">{selectedFixture.spectrumData.blue}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-400">Green (500-600nm)</span>
                  <span className="text-gray-300">{selectedFixture.spectrumData.green}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-400">Red (600-700nm)</span>
                  <span className="text-gray-300">{selectedFixture.spectrumData.red}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-pink-400">Far Red (700-800nm)</span>
                  <span className="text-gray-300">{selectedFixture.spectrumData.farRed}%</span>
                </div>
              </div>
            </div>

            {/* IES File Status */}
            <div className="bg-gray-900 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-gray-300 font-medium text-sm">Photometric Data</h5>
                {selectedFixture.hasCustomIES && (
                  <button
                    onClick={() => {
                      const newMap = new Map(fixtureIESMap);
                      newMap.delete(selectedFixture.id);
                      setFixtureIESMap(newMap);
                      setSelectedFixture({
                        ...selectedFixture,
                        iesData: undefined,
                        iesFileName: undefined,
                        hasCustomIES: false
                      });
                    }}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              {selectedFixture.hasCustomIES ? (
                <div className="text-xs">
                  <div className="flex items-center gap-2 text-green-400 mb-1">
                    <CheckCircle className="w-3 h-3" />
                    Custom IES file loaded
                  </div>
                  <div className="text-gray-400 truncate">
                    {selectedFixture.iesFileName}
                  </div>
                  {selectedFixture.iesData && (
                    <div className="mt-2 text-gray-500">
                      <div>Lumens: {selectedFixture.iesData.lumens.toFixed(0)}</div>
                      <div>Test Distance: {selectedFixture.iesData.testDistance}m</div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-400 mb-2">
                    Using default Lambertian distribution
                  </p>
                  <button
                    onClick={() => setShowIESUpload(!showIESUpload)}
                    className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-3 h-3" />
                    Upload IES File
                  </button>
                </div>
              )}
            </div>

            {/* IES Upload Section */}
            {showIESUpload && !selectedFixture.hasCustomIES && (
              <div className="mb-4">
                <IESFileUploader 
                  onFileProcessed={handleIESUpload}
                  onError={(error) => {
                    dispatch({
                      type: 'SHOW_NOTIFICATION',
                      payload: { type: 'error', message: error }
                    });
                  }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handlePlaceFixture}
                className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Place Fixture
              </button>
              
              {selectedFixture.dlcData?.specSheet && (
                <a
                  href={selectedFixture.dlcData.specSheet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Spec Sheet
                </a>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                <div className="text-xs text-gray-300">
                  <p className="mb-1">
                    <strong>Pro tip:</strong> Use smart search for complex queries:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li>"600-800w" for wattage range</li>
                    <li>"{'>'} 2.8ppe" for high efficacy</li>
                    <li>"flowering gavita" for combined search</li>
                  </ul>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}