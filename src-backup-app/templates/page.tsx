"use client"

import { useState } from 'react'
import { 
  Package, 
  Download, 
  Upload, 
  Copy, 
  Trash2,
  Search,
  Filter,
  Plus,
  Settings,
  Share2,
  Star,
  StarOff,
  Grid,
  List,
  Calendar
} from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: string
  type: 'lighting' | 'schedule' | 'recipe' | 'report' | 'configuration'
  downloads: number
  rating: number
  createdAt: string
  updatedAt: string
  author: string
  isFavorite: boolean
  thumbnail?: string
  tags: string[]
}

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Mock data - in a real app, this would come from an API
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Cannabis Flowering Stage',
      description: 'Optimized lighting schedule and spectrum for cannabis flowering phase',
      category: 'cultivation',
      type: 'recipe',
      downloads: 1250,
      rating: 4.8,
      createdAt: '2024-03-10',
      updatedAt: '2024-03-15',
      author: 'Vibelux Team',
      isFavorite: true,
      tags: ['cannabis', 'flowering', 'commercial']
    },
    {
      id: '2',
      name: 'Lettuce 24/7 Production',
      description: 'Continuous production schedule for leafy greens with optimal DLI',
      category: 'leafy-greens',
      type: 'schedule',
      downloads: 890,
      rating: 4.6,
      createdAt: '2024-03-08',
      updatedAt: '2024-03-12',
      author: 'GrowTech Solutions',
      isFavorite: false,
      tags: ['lettuce', 'vertical-farming', 'continuous']
    },
    {
      id: '3',
      name: 'Greenhouse Supplemental Lighting',
      description: 'Template for supplemental lighting in greenhouse environments',
      category: 'greenhouse',
      type: 'configuration',
      downloads: 750,
      rating: 4.7,
      createdAt: '2024-03-05',
      updatedAt: '2024-03-11',
      author: 'Vibelux Team',
      isFavorite: false,
      tags: ['greenhouse', 'supplemental', 'energy-efficient']
    },
    {
      id: '4',
      name: 'Monthly Energy Report',
      description: 'Comprehensive monthly energy usage and cost analysis report template',
      category: 'reporting',
      type: 'report',
      downloads: 620,
      rating: 4.5,
      createdAt: '2024-03-01',
      updatedAt: '2024-03-10',
      author: 'Analytics Pro',
      isFavorite: true,
      tags: ['energy', 'reporting', 'analytics']
    }
  ])

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'cultivation', label: 'Cultivation' },
    { value: 'leafy-greens', label: 'Leafy Greens' },
    { value: 'greenhouse', label: 'Greenhouse' },
    { value: 'reporting', label: 'Reporting' },
    { value: 'energy', label: 'Energy Management' }
  ]

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'lighting', label: 'Lighting Design' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'recipe', label: 'Light Recipe' },
    { value: 'report', label: 'Report' },
    { value: 'configuration', label: 'Configuration' }
  ]

  const handleFavorite = (id: string) => {
    setTemplates(templates.map(template => 
      template.id === id 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ))
  }

  const handleDownload = (template: Template) => {
    // In a real app, this would trigger a download
    // Update download count
    setTemplates(templates.map(t => 
      t.id === template.id 
        ? { ...t, downloads: t.downloads + 1 }
        : t
    ))
  }

  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory
      const matchesType = filterType === 'all' || template.type === filterType
      return matchesSearch && matchesCategory && matchesType
    })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recipe': return 'bg-purple-500/20 text-purple-400'
      case 'schedule': return 'bg-blue-500/20 text-blue-400'
      case 'report': return 'bg-green-500/20 text-green-400'
      case 'configuration': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-black p-8 pl-72">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Templates
          </h1>
          <p className="text-gray-400">
            Browse and use pre-built templates to quickly set up your lighting systems
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 mb-8 border border-white/10">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                {types.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-black/50 border border-white/10 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Template
            </button>
          </div>
        </div>

        {/* Template Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
              >
                {/* Template Preview */}
                <div className="h-32 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg mb-4 flex items-center justify-center">
                  <Package className="w-12 h-12 text-white/50" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {template.name}
                    </h3>
                    <button
                      onClick={() => handleFavorite(template.id)}
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      {template.isFavorite ? (
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(template.type)}`}>
                      {template.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {template.downloads} downloads
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleDownload(template)}
                      className="flex-1 px-3 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Use
                    </button>
                    <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-6">
                  {/* Icon */}
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-10 h-10 text-white/50" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {template.name}
                        </h3>
                        <p className="text-gray-400">
                          {template.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleFavorite(template.id)}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        {template.isFavorite ? (
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${getTypeColor(template.type)}`}>
                        {template.type}
                      </span>
                      <span>{template.downloads} downloads</span>
                      <span>By {template.author}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Updated {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(template)}
                      className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Use Template
                    </button>
                    <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-8">
            <div className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">
                Upload Template
              </h2>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    placeholder="Describe what this template does"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Category
                    </label>
                    <select className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                      {categories.slice(1).map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Type
                    </label>
                    <select className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none">
                      {types.slice(1).map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Upload File
                  </label>
                  <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition-colors">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2">
                      Drag and drop your template file here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Upload Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}