"use client"

import { useState, useEffect, useMemo } from 'react'
import { 
  X, Search, Filter, Grid, List, Plus, Upload, Download, 
  Star, Clock, Tag, Zap, DollarSign, Package, FileText,
  ChevronRight, ChevronDown, Edit2, Trash2, Copy, Eye,
  BarChart3, Settings, Check, AlertCircle
} from 'lucide-react'
import { fixtureLibraryManager, type CustomFixture, type FixtureFilter } from '@/lib/fixture-library-manager'
import { dlcFixturesParser } from '@/lib/dlc-fixtures-parser'
import type { FixtureModel } from '@/components/FixtureLibrary'

interface FixtureLibraryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectFixture: (fixture: FixtureModel) => void
  selectedFixtureId?: string
}

type ViewMode = 'grid' | 'list'
type TabType = 'all' | 'dlc' | 'custom' | 'favorites' | 'recent'

export function FixtureLibraryDialog({
  isOpen,
  onClose,
  onSelectFixture,
  selectedFixtureId
}: FixtureLibraryDialogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [wattageRange, setWattageRange] = useState<[number, number]>([0, 2000])
  const [ppfRange, setPpfRange] = useState<[number, number]>([0, 5000])
  const [efficacyMin, setEfficacyMin] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showCompareDialog, setShowCompareDialog] = useState(false)
  const [compareFixtures, setCompareFixtures] = useState<string[]>([])
  const [editingFixture, setEditingFixture] = useState<CustomFixture | null>(null)
  const [customFixtures, setCustomFixtures] = useState<CustomFixture[]>([])
  const [dlcFixtures, setDlcFixtures] = useState<FixtureModel[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentlyUsed, setRecentlyUsed] = useState<CustomFixture[]>([])

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      // Load custom fixtures
      const allCustom = fixtureLibraryManager.getAllFixtures()
      setCustomFixtures(allCustom)
      
      // Load DLC fixtures
      const dlc = dlcFixturesParser.getFixtureModels()
      setDlcFixtures(dlc)
      
      // Load favorites
      const favs = fixtureLibraryManager.getFavorites().map(f => f.id)
      setFavorites(favs)
      
      // Load recently used
      const recent = fixtureLibraryManager.getRecentlyUsed()
      setRecentlyUsed(recent)
    }
  }, [isOpen])

  // Get all fixtures based on active tab
  const allFixtures = useMemo(() => {
    let fixtures: FixtureModel[] = []
    
    switch (activeTab) {
      case 'all':
        fixtures = [...dlcFixtures, ...customFixtures]
        break
      case 'dlc':
        fixtures = dlcFixtures
        break
      case 'custom':
        fixtures = customFixtures
        break
      case 'favorites':
        fixtures = [...dlcFixtures, ...customFixtures].filter(f => favorites.includes(f.id))
        break
      case 'recent':
        fixtures = recentlyUsed
        break
    }
    
    return fixtures
  }, [activeTab, dlcFixtures, customFixtures, favorites, recentlyUsed])

  // Get filter options
  const categories = useMemo(() => {
    const cats = new Set<string>()
    allFixtures.forEach(f => cats.add(f.category))
    return ['all', ...Array.from(cats).sort()]
  }, [allFixtures])

  const manufacturers = useMemo(() => {
    const mans = new Set<string>()
    allFixtures.forEach(f => {
      if ('manufacturer' in f && typeof f.manufacturer === 'string') {
        mans.add(f.manufacturer)
      } else if (f.brand) {
        mans.add(f.brand)
      }
    })
    return ['all', ...Array.from(mans).sort()]
  }, [allFixtures])

  const tags = useMemo(() => {
    const tagSet = new Set<string>()
    customFixtures.forEach(f => {
      f.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [customFixtures])

  // Filter fixtures
  const filteredFixtures = useMemo(() => {
    let results = [...allFixtures]
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(f => 
        f.brand.toLowerCase().includes(term) ||
        f.model.toLowerCase().includes(term) ||
        ('manufacturer' in f && typeof f.manufacturer === 'string' && f.manufacturer.toLowerCase().includes(term)) ||
        ('modelNumber' in f && typeof f.modelNumber === 'string' && f.modelNumber.toLowerCase().includes(term))
      )
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      results = results.filter(f => f.category === selectedCategory)
    }
    
    // Manufacturer filter
    if (selectedManufacturer !== 'all') {
      results = results.filter(f => {
        const mfg = 'manufacturer' in f && typeof f.manufacturer === 'string' ? f.manufacturer : f.brand
        return mfg === selectedManufacturer
      })
    }
    
    // Tag filter
    if (selectedTags.length > 0) {
      results = results.filter(f => {
        if ('tags' in f && Array.isArray(f.tags)) {
          return selectedTags.some(tag => (f.tags as string[]).includes(tag))
        }
        return false
      })
    }
    
    // Numerical filters
    results = results.filter(f => 
      f.wattage >= wattageRange[0] && f.wattage <= wattageRange[1] &&
      f.ppf >= ppfRange[0] && f.ppf <= ppfRange[1] &&
      f.efficacy >= efficacyMin
    )
    
    return results
  }, [allFixtures, searchTerm, selectedCategory, selectedManufacturer, selectedTags, wattageRange, ppfRange, efficacyMin])

  const handleSelectFixture = (fixture: FixtureModel) => {
    fixtureLibraryManager.markAsUsed(fixture.id)
    onSelectFixture(fixture)
    onClose()
  }

  const handleToggleFavorite = (fixtureId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const isFav = fixtureLibraryManager.toggleFavorite(fixtureId)
    if (isFav) {
      setFavorites([...favorites, fixtureId])
    } else {
      setFavorites(favorites.filter(id => id !== fixtureId))
    }
  }

  const handleToggleCompare = (fixtureId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (compareFixtures.includes(fixtureId)) {
      setCompareFixtures(compareFixtures.filter(id => id !== fixtureId))
    } else if (compareFixtures.length < 4) {
      setCompareFixtures([...compareFixtures, fixtureId])
    }
  }

  const handleDeleteFixture = (fixtureId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this fixture?')) {
      fixtureLibraryManager.deleteFixture(fixtureId)
      setCustomFixtures(fixtureLibraryManager.getAllFixtures())
    }
  }

  const handleExport = (format: 'json' | 'csv') => {
    const data = format === 'json' 
      ? fixtureLibraryManager.exportToJSON()
      : fixtureLibraryManager.exportToCSV()
    
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fixtures-export-${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Fixture Library</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { id: 'all', label: 'All Fixtures', icon: Package },
              { id: 'dlc', label: 'DLC Certified', icon: Check },
              { id: 'custom', label: 'Custom', icon: Settings },
              { id: 'favorites', label: 'Favorites', icon: Star },
              { id: 'recent', label: 'Recent', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Actions Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search fixtures by brand, model, or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                showFilters ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowCreateDialog(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create
              </button>

              <button
                onClick={() => setShowImportDialog(true)}
                className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>

              <div className="relative group">
                <button className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700">
                  <Download className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 rounded-t-lg"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 rounded-b-lg"
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Manufacturer</label>
                  <select
                    value={selectedManufacturer}
                    onChange={(e) => setSelectedManufacturer(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    {manufacturers.map(man => (
                      <option key={man} value={man}>
                        {man === 'all' ? 'All Manufacturers' : man}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Wattage: {wattageRange[0]}W - {wattageRange[1]}W
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={wattageRange[0]}
                      onChange={(e) => setWattageRange([parseInt(e.target.value), wattageRange[1]])}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={wattageRange[1]}
                      onChange={(e) => setWattageRange([wattageRange[0], parseInt(e.target.value)])}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Min Efficacy: {efficacyMin} μmol/J
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="0.1"
                    value={efficacyMin}
                    onChange={(e) => setEfficacyMin(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {tags.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(selectedTags.filter(t => t !== tag))
                          } else {
                            setSelectedTags([...selectedTags, tag])
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compare Bar */}
          {compareFixtures.length > 0 && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300">
                  {compareFixtures.length} fixtures selected for comparison
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCompareFixtures([])}
                  className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowCompareDialog(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={compareFixtures.length < 2}
                >
                  Compare
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredFixtures.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No fixtures found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search term</p>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFixtures.map(fixture => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  isSelected={selectedFixtureId === fixture.id}
                  isFavorite={favorites.includes(fixture.id)}
                  isComparing={compareFixtures.includes(fixture.id)}
                  onSelect={() => handleSelectFixture(fixture)}
                  onToggleFavorite={(e) => handleToggleFavorite(fixture.id, e)}
                  onToggleCompare={(e) => handleToggleCompare(fixture.id, e)}
                  onEdit={() => setEditingFixture(fixture as CustomFixture)}
                  onDelete={(e) => handleDeleteFixture(fixture.id, e)}
                  canEdit={'isCustom' in fixture && fixture.isCustom === true}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFixtures.map(fixture => (
                <FixtureListItem
                  key={fixture.id}
                  fixture={fixture}
                  isSelected={selectedFixtureId === fixture.id}
                  isFavorite={favorites.includes(fixture.id)}
                  isComparing={compareFixtures.includes(fixture.id)}
                  onSelect={() => handleSelectFixture(fixture)}
                  onToggleFavorite={(e) => handleToggleFavorite(fixture.id, e)}
                  onToggleCompare={(e) => handleToggleCompare(fixture.id, e)}
                  onEdit={() => setEditingFixture(fixture as CustomFixture)}
                  onDelete={(e) => handleDeleteFixture(fixture.id, e)}
                  canEdit={'isCustom' in fixture && fixture.isCustom === true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {filteredFixtures.length} fixtures found
            {searchTerm && ` for "${searchTerm}"`}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              DLC Certified
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              Favorite
            </span>
            <span className="flex items-center gap-1">
              <Settings className="w-3 h-3 text-blue-500" />
              Custom
            </span>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {(showCreateDialog || editingFixture) && (
        <CreateFixtureDialog
          fixture={editingFixture}
          onClose={() => {
            setShowCreateDialog(false)
            setEditingFixture(null)
          }}
          onSave={(fixture) => {
            if (editingFixture) {
              fixtureLibraryManager.updateFixture(editingFixture.id, fixture)
            } else {
              fixtureLibraryManager.createFixture(fixture)
            }
            setCustomFixtures(fixtureLibraryManager.getAllFixtures())
            setShowCreateDialog(false)
            setEditingFixture(null)
          }}
        />
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <ImportDialog
          onClose={() => setShowImportDialog(false)}
          onImport={() => {
            setCustomFixtures(fixtureLibraryManager.getAllFixtures())
            setShowImportDialog(false)
          }}
        />
      )}

      {/* Compare Dialog */}
      {showCompareDialog && compareFixtures.length >= 2 && (
        <CompareDialog
          fixtureIds={compareFixtures}
          onClose={() => setShowCompareDialog(false)}
        />
      )}
    </div>
  )
}

// Fixture Card Component
function FixtureCard({
  fixture,
  isSelected,
  isFavorite,
  isComparing,
  onSelect,
  onToggleFavorite,
  onToggleCompare,
  onEdit,
  onDelete,
  canEdit
}: {
  fixture: FixtureModel
  isSelected: boolean
  isFavorite: boolean
  isComparing: boolean
  onSelect: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
  onToggleCompare: (e: React.MouseEvent) => void
  onEdit: () => void
  onDelete: (e: React.MouseEvent) => void
  canEdit: boolean
}) {
  return (
    <div
      className={`bg-gray-800 rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-purple-500 ${
        isSelected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-700'
      } ${isComparing ? 'ring-2 ring-blue-500/20' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{fixture.brand}</h3>
          <p className="text-sm text-gray-400">{fixture.model}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleFavorite}
            className={`p-1 rounded hover:bg-gray-700 ${
              isFavorite ? 'text-yellow-500' : 'text-gray-500'
            }`}
          >
            <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={onToggleCompare}
            className={`p-1 rounded hover:bg-gray-700 ${
              isComparing ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Wattage</span>
          <span className="text-white font-medium">{fixture.wattage}W</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">PPF</span>
          <span className="text-white font-medium">{fixture.ppf} μmol/s</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Efficacy</span>
          <span className="text-white font-medium">{fixture.efficacy} μmol/J</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Coverage</span>
          <span className="text-white font-medium">{fixture.coverage} ft²</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {fixture.dlcData && (
              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
                DLC
              </span>
            )}
            {'isCustom' in fixture && fixture.isCustom && (
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">
                Custom
              </span>
            )}
          </div>
          {canEdit && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onEdit()}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Fixture List Item Component
function FixtureListItem({
  fixture,
  isSelected,
  isFavorite,
  isComparing,
  onSelect,
  onToggleFavorite,
  onToggleCompare,
  onEdit,
  onDelete,
  canEdit
}: {
  fixture: FixtureModel
  isSelected: boolean
  isFavorite: boolean
  isComparing: boolean
  onSelect: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
  onToggleCompare: (e: React.MouseEvent) => void
  onEdit: () => void
  onDelete: (e: React.MouseEvent) => void
  canEdit: boolean
}) {
  return (
    <div
      className={`bg-gray-800 rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-purple-500 ${
        isSelected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-700'
      } ${isComparing ? 'ring-2 ring-blue-500/20' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 grid grid-cols-6 gap-4 items-center">
          <div className="col-span-2">
            <h3 className="font-semibold text-white">{fixture.brand} {fixture.model}</h3>
            <div className="flex items-center gap-2 mt-1">
              {fixture.dlcData && (
                <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded">
                  DLC
                </span>
              )}
              {'isCustom' in fixture && fixture.isCustom && (
                <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded">
                  Custom
                </span>
              )}
              <span className="text-xs text-gray-500">{fixture.category}</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-white font-medium">{fixture.wattage}W</p>
            <p className="text-xs text-gray-400">Wattage</p>
          </div>
          
          <div className="text-center">
            <p className="text-white font-medium">{fixture.ppf}</p>
            <p className="text-xs text-gray-400">PPF μmol/s</p>
          </div>
          
          <div className="text-center">
            <p className="text-white font-medium">{fixture.efficacy}</p>
            <p className="text-xs text-gray-400">μmol/J</p>
          </div>
          
          <div className="text-center">
            <p className="text-white font-medium">{fixture.coverage}</p>
            <p className="text-xs text-gray-400">Coverage ft²</p>
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onToggleFavorite}
            className={`p-1.5 rounded hover:bg-gray-700 ${
              isFavorite ? 'text-yellow-500' : 'text-gray-500'
            }`}
          >
            <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={onToggleCompare}
            className={`p-1.5 rounded hover:bg-gray-700 ${
              isComparing ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          {canEdit && (
            <>
              <button
                onClick={() => onEdit()}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Create/Edit Fixture Dialog
function CreateFixtureDialog({
  fixture,
  onClose,
  onSave
}: {
  fixture: CustomFixture | null
  onClose: () => void
  onSave: (fixture: Partial<CustomFixture>) => void
}) {
  const [formData, setFormData] = useState<Partial<CustomFixture>>({
    brand: fixture?.brand || '',
    model: fixture?.model || '',
    manufacturer: fixture?.manufacturer || '',
    modelNumber: fixture?.modelNumber || '',
    category: fixture?.category || 'LED Panel',
    wattage: fixture?.wattage || 100,
    ppf: fixture?.ppf || 200,
    efficacy: fixture?.efficacy || 2.0,
    spectrum: fixture?.spectrum || 'Full Spectrum',
    spectrumData: fixture?.spectrumData || {
      blue: 20,
      green: 10,
      red: 65,
      farRed: 5
    },
    coverage: fixture?.coverage || 16,
    price: fixture?.price,
    voltage: fixture?.voltage || '120-277V',
    dimmable: fixture?.dimmable ?? true,
    warranty: fixture?.warranty || 5,
    tags: fixture?.tags || [],
    notes: fixture?.notes || '',
    photometricData: fixture?.photometricData || {
      distribution: 'lambertian',
      beamAngle: 120,
      fieldAngle: 140
    },
    electricalSpecs: fixture?.electricalSpecs || {
      inputVoltage: '120-277V',
      inputCurrent: 1.0,
      powerFactor: 0.95,
      thd: 15
    },
    physicalSpecs: fixture?.physicalSpecs || {
      dimensions: { length: 48, width: 20, height: 4, unit: 'in' },
      weight: { value: 25, unit: 'lb' },
      ipRating: 'IP65'
    },
    mountingOptions: fixture?.mountingOptions || ['Hanging', 'Surface Mount']
  })

  const [errors, setErrors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'basic' | 'photometric' | 'electrical' | 'physical'>('basic')

  const handleSubmit = () => {
    const validationErrors = fixtureLibraryManager.validateFixture(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              {fixture ? 'Edit Fixture' : 'Create Custom Fixture'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'basic', label: 'Basic Info' },
              { id: 'photometric', label: 'Photometric' },
              { id: 'electrical', label: 'Electrical' },
              { id: 'physical', label: 'Physical' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Please fix the following errors:</span>
              </div>
              <ul className="list-disc list-inside text-red-300 text-sm">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Brand *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Model Number</label>
                  <input
                    type="text"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="LED Panel">LED Panel</option>
                  <option value="LED Bar">LED Bar</option>
                  <option value="HPS">HPS</option>
                  <option value="CMH">CMH</option>
                  <option value="Fluorescent">Fluorescent</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Wattage (W) *</label>
                  <input
                    type="number"
                    value={formData.wattage}
                    onChange={(e) => {
                      const wattage = parseFloat(e.target.value)
                      const efficacy = formData.ppf && wattage ? formData.ppf / wattage : formData.efficacy
                      setFormData({ ...formData, wattage, efficacy })
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">PPF (μmol/s) *</label>
                  <input
                    type="number"
                    value={formData.ppf}
                    onChange={(e) => {
                      const ppf = parseFloat(e.target.value)
                      const efficacy = ppf && formData.wattage ? ppf / formData.wattage : formData.efficacy
                      setFormData({ ...formData, ppf, efficacy })
                    }}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Efficacy (μmol/J)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.efficacy?.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Spectrum Distribution (%)</label>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-blue-400">Blue (400-500nm)</label>
                    <input
                      type="number"
                      value={formData.spectrumData?.blue}
                      onChange={(e) => setFormData({
                        ...formData,
                        spectrumData: { ...formData.spectrumData!, blue: parseFloat(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-green-400">Green (500-600nm)</label>
                    <input
                      type="number"
                      value={formData.spectrumData?.green}
                      onChange={(e) => setFormData({
                        ...formData,
                        spectrumData: { ...formData.spectrumData!, green: parseFloat(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-red-400">Red (600-700nm)</label>
                    <input
                      type="number"
                      value={formData.spectrumData?.red}
                      onChange={(e) => setFormData({
                        ...formData,
                        spectrumData: { ...formData.spectrumData!, red: parseFloat(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-orange-400">Far Red (700-800nm)</label>
                    <input
                      type="number"
                      value={formData.spectrumData?.farRed}
                      onChange={(e) => setFormData({
                        ...formData,
                        spectrumData: { ...formData.spectrumData!, farRed: parseFloat(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {(formData.spectrumData?.blue || 0) + (formData.spectrumData?.green || 0) + 
                         (formData.spectrumData?.red || 0) + (formData.spectrumData?.farRed || 0)}%
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Coverage (ft²)</label>
                  <input
                    type="number"
                    value={formData.coverage}
                    onChange={(e) => setFormData({ ...formData, coverage: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Warranty (years)</label>
                  <input
                    type="number"
                    value={formData.warranty || ''}
                    onChange={(e) => setFormData({ ...formData, warranty: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags?.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="e.g., greenhouse, vertical farm, high efficiency"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  rows={3}
                  placeholder="Additional notes or specifications..."
                />
              </div>
            </div>
          )}

          {activeTab === 'photometric' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Light Distribution</label>
                <select
                  value={formData.photometricData?.distribution}
                  onChange={(e) => setFormData({
                    ...formData,
                    photometricData: { 
                      ...formData.photometricData!, 
                      distribution: e.target.value as any 
                    }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="lambertian">Lambertian (Cosine)</option>
                  <option value="gaussian">Gaussian</option>
                  <option value="batwing">Batwing</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Beam Angle (°)</label>
                  <input
                    type="number"
                    value={formData.photometricData?.beamAngle}
                    onChange={(e) => setFormData({
                      ...formData,
                      photometricData: { 
                        ...formData.photometricData!, 
                        beamAngle: parseFloat(e.target.value) 
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Field Angle (°)</label>
                  <input
                    type="number"
                    value={formData.photometricData?.fieldAngle}
                    onChange={(e) => setFormData({
                      ...formData,
                      photometricData: { 
                        ...formData.photometricData!, 
                        fieldAngle: parseFloat(e.target.value) 
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">
                  Upload IES file for accurate photometric data:
                </p>
                <input
                  type="file"
                  accept=".ies,.ldt"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const result = await fixtureLibraryManager.importFromIES(file)
                      if (result.success && result.fixtures.length > 0) {
                        const imported = result.fixtures[0]
                        setFormData({
                          ...formData,
                          customIES: imported.customIES,
                          photometricData: imported.photometricData
                        })
                      }
                    }
                  }}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
              </div>
            </div>
          )}

          {activeTab === 'electrical' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Input Voltage</label>
                  <input
                    type="text"
                    value={formData.electricalSpecs?.inputVoltage}
                    onChange={(e) => setFormData({
                      ...formData,
                      electricalSpecs: { 
                        ...formData.electricalSpecs!, 
                        inputVoltage: e.target.value 
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="e.g., 120-277V"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Input Current (A)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.electricalSpecs?.inputCurrent}
                    onChange={(e) => setFormData({
                      ...formData,
                      electricalSpecs: { 
                        ...formData.electricalSpecs!, 
                        inputCurrent: parseFloat(e.target.value) 
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Power Factor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.electricalSpecs?.powerFactor}
                    onChange={(e) => setFormData({
                      ...formData,
                      electricalSpecs: { 
                        ...formData.electricalSpecs!, 
                        powerFactor: parseFloat(e.target.value) 
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">THD (%)</label>
                  <input
                    type="number"
                    value={formData.electricalSpecs?.thd}
                    onChange={(e) => setFormData({
                      ...formData,
                      electricalSpecs: { 
                        ...formData.electricalSpecs!, 
                        thd: parseFloat(e.target.value) 
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dimmable"
                  checked={formData.dimmable}
                  onChange={(e) => setFormData({ ...formData, dimmable: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600"
                />
                <label htmlFor="dimmable" className="text-sm text-gray-300">
                  Dimmable (0-10V, PWM, etc.)
                </label>
              </div>
            </div>
          )}

          {activeTab === 'physical' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Dimensions</label>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Length</label>
                    <input
                      type="number"
                      value={formData.physicalSpecs?.dimensions.length}
                      onChange={(e) => setFormData({
                        ...formData,
                        physicalSpecs: {
                          ...formData.physicalSpecs!,
                          dimensions: {
                            ...formData.physicalSpecs!.dimensions,
                            length: parseFloat(e.target.value)
                          }
                        }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Width</label>
                    <input
                      type="number"
                      value={formData.physicalSpecs?.dimensions.width}
                      onChange={(e) => setFormData({
                        ...formData,
                        physicalSpecs: {
                          ...formData.physicalSpecs!,
                          dimensions: {
                            ...formData.physicalSpecs!.dimensions,
                            width: parseFloat(e.target.value)
                          }
                        }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Height</label>
                    <input
                      type="number"
                      value={formData.physicalSpecs?.dimensions.height}
                      onChange={(e) => setFormData({
                        ...formData,
                        physicalSpecs: {
                          ...formData.physicalSpecs!,
                          dimensions: {
                            ...formData.physicalSpecs!.dimensions,
                            height: parseFloat(e.target.value)
                          }
                        }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Unit</label>
                    <select
                      value={formData.physicalSpecs?.dimensions.unit}
                      onChange={(e) => setFormData({
                        ...formData,
                        physicalSpecs: {
                          ...formData.physicalSpecs!,
                          dimensions: {
                            ...formData.physicalSpecs!.dimensions,
                            unit: e.target.value as 'mm' | 'in'
                          }
                        }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="in">inches</option>
                      <option value="mm">mm</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Weight</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.physicalSpecs?.weight.value}
                      onChange={(e) => setFormData({
                        ...formData,
                        physicalSpecs: {
                          ...formData.physicalSpecs!,
                          weight: {
                            ...formData.physicalSpecs!.weight,
                            value: parseFloat(e.target.value)
                          }
                        }
                      })}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <select
                      value={formData.physicalSpecs?.weight.unit}
                      onChange={(e) => setFormData({
                        ...formData,
                        physicalSpecs: {
                          ...formData.physicalSpecs!,
                          weight: {
                            ...formData.physicalSpecs!.weight,
                            unit: e.target.value as 'kg' | 'lb'
                          }
                        }
                      })}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="lb">lb</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">IP Rating</label>
                  <input
                    type="text"
                    value={formData.physicalSpecs?.ipRating}
                    onChange={(e) => setFormData({
                      ...formData,
                      physicalSpecs: {
                        ...formData.physicalSpecs!,
                        ipRating: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="e.g., IP65"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Mounting Options</label>
                <input
                  type="text"
                  value={formData.mountingOptions?.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    mountingOptions: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="e.g., Hanging, Surface Mount, Pole Mount"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {fixture ? 'Update Fixture' : 'Create Fixture'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Import Dialog
function ImportDialog({
  onClose,
  onImport
}: {
  onClose: () => void
  onImport: () => void
}) {
  const [importType, setImportType] = useState<'json' | 'csv' | 'ies'>('json')
  const [importData, setImportData] = useState('')
  const [importResult, setImportResult] = useState<any>(null)
  const [isImporting, setIsImporting] = useState(false)

  const handleImport = async () => {
    setIsImporting(true)
    setImportResult(null)

    try {
      let result
      if (importType === 'json') {
        result = await fixtureLibraryManager.importFromJSON(importData)
      } else if (importType === 'csv') {
        result = await fixtureLibraryManager.importFromCSV(importData)
      }

      setImportResult(result)
      if (result?.success) {
        setTimeout(() => {
          onImport()
        }, 2000)
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: [error instanceof Error ? error.message : 'Import failed'],
        fixtures: [],
        warnings: []
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (importType === 'ies') {
      setIsImporting(true)
      const result = await fixtureLibraryManager.importFromIES(file)
      setImportResult(result)
      if (result.success) {
        setTimeout(() => {
          onImport()
        }, 2000)
      }
      setIsImporting(false)
    } else {
      const content = await file.text()
      setImportData(content)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Import Fixtures</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-4">
            {[
              { id: 'json', label: 'JSON' },
              { id: 'csv', label: 'CSV' },
              { id: 'ies', label: 'IES File' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setImportType(type.id as any)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  importType === type.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {importType === 'ies' ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">
                  Upload IES/LDT files to import photometric data
                </p>
                <input
                  type="file"
                  accept=".ies,.ldt"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Paste {importType.toUpperCase()} data or upload file
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-64 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                  placeholder={importType === 'json' 
                    ? '[\n  {\n    "brand": "Example",\n    "model": "LED-1000",\n    ...\n  }\n]'
                    : 'brand,model,wattage,ppf,efficacy\nExample,LED-1000,1000,2700,2.7'}
                />
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept={importType === 'json' ? '.json' : '.csv'}
                  onChange={handleFileUpload}
                  className="block text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600"
                />
              </div>
            </div>
          )}

          {importResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              importResult.success ? 'bg-green-900/20 border border-green-700/50' : 'bg-red-900/20 border border-red-700/50'
            }`}>
              {importResult.success ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span>Successfully imported {importResult.fixtures.length} fixtures</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>Import failed</span>
                  </div>
                  {importResult.errors.map((error: string, i: number) => (
                    <p key={i} className="text-sm text-red-300">{error}</p>
                  ))}
                </div>
              )}

              {importResult.warnings?.length > 0 && (
                <div className="mt-2">
                  <p className="text-yellow-400 text-sm mb-1">Warnings:</p>
                  {importResult.warnings.map((warning: string, i: number) => (
                    <p key={i} className="text-sm text-yellow-300">• {warning}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!importData || isImporting}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Compare Dialog
function CompareDialog({
  fixtureIds,
  onClose
}: {
  fixtureIds: string[]
  onClose: () => void
}) {
  const comparison = fixtureLibraryManager.compareFixtures(fixtureIds)

  if (!comparison || comparison.error) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Fixture Comparison</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">Specification</th>
                  {comparison.fixtures.map((f: any) => (
                    <th key={f.id} className="text-left py-3 px-4">
                      <div className="text-white font-semibold">{f.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {f.isDLC && (
                          <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded">
                            DLC
                          </span>
                        )}
                        {f.isCustom && (
                          <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded">
                            Custom
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-400">Wattage</td>
                  {comparison.fixtures.map((f: any) => (
                    <td key={f.id} className={`py-3 px-4 text-white ${
                      f.id === comparison.analysis.lowestWattage?.id ? 'text-green-400 font-semibold' : ''
                    }`}>
                      {f.wattage}W
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-400">PPF Output</td>
                  {comparison.fixtures.map((f: any) => (
                    <td key={f.id} className={`py-3 px-4 text-white ${
                      f.id === comparison.analysis.highestPPF?.id ? 'text-green-400 font-semibold' : ''
                    }`}>
                      {f.ppf} μmol/s
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-400">Efficacy</td>
                  {comparison.fixtures.map((f: any) => (
                    <td key={f.id} className={`py-3 px-4 text-white ${
                      f.id === comparison.analysis.mostEfficient?.id ? 'text-green-400 font-semibold' : ''
                    }`}>
                      {f.efficacy} μmol/J
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-400">Coverage</td>
                  {comparison.fixtures.map((f: any) => (
                    <td key={f.id} className="py-3 px-4 text-white">
                      {f.coverage} ft²
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-400">PPF/ft²</td>
                  {comparison.fixtures.map((f: any) => (
                    <td key={f.id} className="py-3 px-4 text-white">
                      {f.ppfPerSqFt} μmol/s/ft²
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-400">Price</td>
                  {comparison.fixtures.map((f: any) => (
                    <td key={f.id} className="py-3 px-4 text-white">
                      {f.price ? `$${f.price}` : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-400">$/PPF</td>
                  {comparison.fixtures.map((f: any) => (
                    <td key={f.id} className={`py-3 px-4 text-white ${
                      f.id === comparison.analysis.bestValue?.id ? 'text-green-400 font-semibold' : ''
                    }`}>
                      {f.costPerPPF}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-800">
                  <td className="py-3 px-4 text-gray-400">Spectrum</td>
                  {comparison.fixtures.map((f: any) => (
                    <td key={f.id} className="py-3 px-4">
                      <div className="flex gap-1">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span className="text-xs text-gray-400">{f.spectrumData.blue}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          <span className="text-xs text-gray-400">{f.spectrumData.green}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span className="text-xs text-gray-400">{f.spectrumData.red}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-orange-500 rounded"></div>
                          <span className="text-xs text-gray-400">{f.spectrumData.farRed}%</span>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-white font-semibold mb-3">Analysis Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              {comparison.analysis.mostEfficient && (
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Most Efficient</p>
                    <p className="text-white font-medium">{comparison.analysis.mostEfficient.name}</p>
                  </div>
                </div>
              )}
              {comparison.analysis.bestValue && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Best Value</p>
                    <p className="text-white font-medium">{comparison.analysis.bestValue.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
          <button
            onClick={() => {
              const report = `Fixture Comparison Report\n\n` +
                comparison.fixtures.map((f: any) => 
                  `${f.name}\n` +
                  `- Wattage: ${f.wattage}W\n` +
                  `- PPF: ${f.ppf} μmol/s\n` +
                  `- Efficacy: ${f.efficacy} μmol/J\n` +
                  `- Coverage: ${f.coverage} ft²\n` +
                  `- Price: ${f.price ? `$${f.price}` : 'N/A'}\n\n`
                ).join('')
              
              const blob = new Blob([report], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `fixture-comparison-${new Date().toISOString().split('T')[0]}.txt`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }}
            className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export Report
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}