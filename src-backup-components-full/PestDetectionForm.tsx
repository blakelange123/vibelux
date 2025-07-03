"use client"

import { useState } from 'react'
import { Camera, MapPin, Calendar, AlertCircle, Save, ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPestImages, pestImageLibrary } from '@/lib/pest-images'
import { PestIdentificationModal } from './PestIdentificationModal'

interface PestDetectionFormProps {
  onSubmit?: (data: any) => void
  onCancel?: () => void
}

export function PestDetectionForm({ onSubmit, onCancel }: PestDetectionFormProps) {
  const [selectedPestId, setSelectedPestId] = useState<string>('')
  const [severity, setSeverity] = useState<'trace' | 'light' | 'moderate' | 'heavy'>('light')
  const [location, setLocation] = useState('')
  const [plantStage, setPlantStage] = useState('')
  const [notes, setNotes] = useState('')
  const [showPestModal, setShowPestModal] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])

  const selectedPest = pestImageLibrary.find(p => p.id === selectedPestId)
  const pestImages = selectedPestId ? getPestImages(selectedPestId) : null

  const severityOptions = [
    { value: 'trace', label: 'Trace', color: 'bg-blue-900/30 text-blue-300 border-blue-700' },
    { value: 'light', label: 'Light', color: 'bg-yellow-900/30 text-yellow-300 border-yellow-700' },
    { value: 'moderate', label: 'Moderate', color: 'bg-orange-900/30 text-orange-300 border-orange-700' },
    { value: 'heavy', label: 'Heavy', color: 'bg-red-900/30 text-red-300 border-red-700' }
  ]

  const plantStages = ['Seedling', 'Vegetative', 'Pre-flowering', 'Flowering', 'Fruiting', 'Mature']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit({
        pestId: selectedPestId,
        severity,
        location,
        plantStage,
        notes,
        photos,
        date: new Date().toISOString(),
        detectionMethod: 'visual'
      })
    }
  }

  return (
    <>
      <PestIdentificationModal
        isOpen={showPestModal}
        onClose={() => setShowPestModal(false)}
        onSelectPest={(pestId) => {
          setSelectedPestId(pestId)
          setShowPestModal(false)
        }}
        selectedPestId={selectedPestId}
      />

      <Card className="bg-gray-900 border-gray-800 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-400" />
            Report Pest Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pest Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pest Type
              </label>
              <div className="space-y-3">
                {selectedPest ? (
                  <div className="flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                    {pestImages && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={pestImages.images.adult || pestImages.images.damage || pestImages.images.closeup || '/placeholder-pest.jpg'}
                          alt={selectedPest.commonName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{selectedPest.commonName}</h4>
                      <p className="text-sm text-gray-400 italic">{selectedPest.scientificName}</p>
                      <p className="text-sm text-gray-400 mt-1">{selectedPest.description}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                      onClick={() => setShowPestModal(true)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white justify-start"
                    onClick={() => setShowPestModal(true)}
                  >
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Select Pest from Visual Guide
                  </Button>
                )}
              </div>
            </div>

            {/* Severity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Severity Level
              </label>
              <div className="grid grid-cols-4 gap-3">
                {severityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSeverity(option.value as any)}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      severity === option.value
                        ? option.color + ' ring-2 ring-offset-2 ring-offset-gray-900'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                required
              >
                <option value="">Select location...</option>
                <option value="Grow Room A - Tier 1">Grow Room A - Tier 1</option>
                <option value="Grow Room A - Tier 2">Grow Room A - Tier 2</option>
                <option value="Grow Room A - Tier 3">Grow Room A - Tier 3</option>
                <option value="Grow Room B - Tier 1">Grow Room B - Tier 1</option>
                <option value="Grow Room B - Tier 2">Grow Room B - Tier 2</option>
                <option value="Grow Room B - Tier 3">Grow Room B - Tier 3</option>
                <option value="Grow Room C - Tier 1">Grow Room C - Tier 1</option>
                <option value="Grow Room C - Tier 2">Grow Room C - Tier 2</option>
                <option value="Grow Room C - Tier 3">Grow Room C - Tier 3</option>
              </select>
            </div>

            {/* Plant Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plant Stage
              </label>
              <div className="grid grid-cols-3 gap-3">
                {plantStages.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setPlantStage(stage)}
                    className={`p-2 rounded-lg border transition-all text-sm ${
                      plantStage === stage
                        ? 'bg-green-900/30 border-green-700 text-green-300'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                placeholder="Describe the infestation, affected plants, environmental conditions..."
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Camera className="w-4 h-4 inline mr-1" />
                Photos
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors cursor-pointer">
                <Camera className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Click to upload photos or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={!selectedPestId || !location || !plantStage}
                className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-700 disabled:text-gray-400"
              >
                <Save className="w-4 h-4 mr-2" />
                Submit Detection Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}