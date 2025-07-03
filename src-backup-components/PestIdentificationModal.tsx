"use client"

import { useState } from 'react'
import { X, Search, Eye, AlertCircle, Camera, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { pestImageLibrary, PestImage } from '@/lib/pest-images'
import { PestImageWithFallback } from './PestImageWithFallback'

interface PestIdentificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPest?: (pestId: string) => void
  selectedPestId?: string
}

export function PestIdentificationModal({ 
  isOpen, 
  onClose, 
  onSelectPest,
  selectedPestId 
}: PestIdentificationModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<PestImage['category'] | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid')
  const [selectedPest, setSelectedPest] = useState<PestImage | null>(null)

  const categories: Array<{ value: PestImage['category'] | 'all'; label: string; color: string }> = [
    { value: 'all', label: 'All Pests', color: 'bg-gray-600' },
    { value: 'insect', label: 'Insects', color: 'bg-green-600' },
    { value: 'mite', label: 'Mites', color: 'bg-orange-600' },
    { value: 'fungal', label: 'Fungal', color: 'bg-purple-600' },
    { value: 'bacterial', label: 'Bacterial', color: 'bg-red-600' },
    { value: 'viral', label: 'Viral', color: 'bg-yellow-600' },
    { value: 'nematode', label: 'Nematode', color: 'bg-blue-600' }
  ]

  const filteredPests = pestImageLibrary.filter(pest => {
    const matchesSearch = searchTerm === '' || 
      pest.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pest.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || pest.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleSelectPest = (pest: PestImage) => {
    if (viewMode === 'grid') {
      setSelectedPest(pest)
      setViewMode('detail')
    } else if (onSelectPest) {
      onSelectPest(pest.id)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Camera className="w-8 h-8 text-green-400" />
                  Pest Identification Guide
                </h2>
                <p className="text-gray-300 mt-1">Visual guide to identify common pests in vertical farming</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by pest name or scientific name..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === category.value
                        ? `${category.color} text-white shadow-lg`
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPests.map(pest => (
                  <motion.div
                    key={pest.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-green-500 transition-all cursor-pointer group"
                    onClick={() => handleSelectPest(pest)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <PestImageWithFallback
                        src={pest.images.damage || pest.images.adult || pest.images.closeup || ''}
                        alt={pest.commonName}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                        <h3 className="text-lg font-semibold text-white">{pest.commonName}</h3>
                        <p className="text-sm text-gray-300 italic">{pest.scientificName}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pest.category === 'insect' ? 'bg-green-900/50 text-green-300' :
                          pest.category === 'mite' ? 'bg-orange-900/50 text-orange-300' :
                          pest.category === 'fungal' ? 'bg-purple-900/50 text-purple-300' :
                          pest.category === 'bacterial' ? 'bg-red-900/50 text-red-300' :
                          pest.category === 'viral' ? 'bg-yellow-900/50 text-yellow-300' :
                          'bg-blue-900/50 text-blue-300'
                        }`}>
                          {pest.category}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{pest.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : selectedPest && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <button
                  onClick={() => {
                    setViewMode('grid')
                    setSelectedPest(null)
                  }}
                  className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  Back to pest list
                </button>

                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{selectedPest.commonName}</h3>
                        <p className="text-lg text-gray-400 italic">{selectedPest.scientificName}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                          selectedPest.category === 'insect' ? 'bg-green-900/50 text-green-300' :
                          selectedPest.category === 'mite' ? 'bg-orange-900/50 text-orange-300' :
                          selectedPest.category === 'fungal' ? 'bg-purple-900/50 text-purple-300' :
                          selectedPest.category === 'bacterial' ? 'bg-red-900/50 text-red-300' :
                          selectedPest.category === 'viral' ? 'bg-yellow-900/50 text-yellow-300' :
                          'bg-blue-900/50 text-blue-300'
                        }`}>
                          {selectedPest.category}
                        </span>
                      </div>
                      {onSelectPest && (
                        <button
                          onClick={() => handleSelectPest(selectedPest)}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-5 h-5" />
                          Select This Pest
                        </button>
                      )}
                    </div>

                    <p className="text-gray-300 mb-6">{selectedPest.description}</p>

                    {/* Image Gallery */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-green-400" />
                        Visual Identification
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(selectedPest.images).map(([type, url]) => url && (
                          <div key={type} className="relative">
                            <PestImageWithFallback
                              src={url}
                              alt={`${selectedPest.commonName} - ${type}`}
                              width={400}
                              height={192}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white capitalize z-10">
                              {type}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Identification Tips */}
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        Identification Tips
                      </h4>
                      <ul className="space-y-2">
                        {selectedPest.identificationTips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-gray-300">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {filteredPests.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No pests found matching your search criteria</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}