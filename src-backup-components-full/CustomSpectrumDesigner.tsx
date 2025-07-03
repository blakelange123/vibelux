'use client'

import { useState, useEffect } from 'react'
import { 
  Palette, 
  Sun, 
  Save, 
  Download, 
  Upload,
  Copy,
  Trash2,
  AlertCircle,
  Eye,
  Sliders,
  Target,
  Plus
} from 'lucide-react'

interface SpectrumChannel {
  wavelength: number
  color: string
  name: string
  intensity: number // 0-100%
  efficiency: number // µmol/J
  photosynthetic: boolean
}

interface SpectrumPreset {
  id: string
  name: string
  description: string
  channels: SpectrumChannel[]
  targetCrop?: string
  growthStage?: string
}

interface CustomSpectrumDesignerProps {
  onSpectrumChange?: (spectrum: SpectrumChannel[]) => void
  onPresetSave?: (preset: SpectrumPreset) => void
  existingPresets?: SpectrumPreset[]
}

// Default spectrum channels based on common LED types
const defaultChannels: SpectrumChannel[] = [
  { wavelength: 380, color: '#8B00FF', name: 'UV-A', intensity: 0, efficiency: 1.5, photosynthetic: false },
  { wavelength: 450, color: '#0000FF', name: 'Royal Blue', intensity: 20, efficiency: 2.5, photosynthetic: true },
  { wavelength: 470, color: '#0080FF', name: 'Blue', intensity: 15, efficiency: 2.4, photosynthetic: true },
  { wavelength: 525, color: '#00FF00', name: 'Green', intensity: 5, efficiency: 2.0, photosynthetic: false },
  { wavelength: 590, color: '#FFFF00', name: 'Amber', intensity: 0, efficiency: 2.2, photosynthetic: false },
  { wavelength: 630, color: '#FF4500', name: 'Red-Orange', intensity: 25, efficiency: 2.8, photosynthetic: true },
  { wavelength: 660, color: '#FF0000', name: 'Deep Red', intensity: 30, efficiency: 3.0, photosynthetic: true },
  { wavelength: 730, color: '#8B0000', name: 'Far Red', intensity: 5, efficiency: 2.7, photosynthetic: false },
  { wavelength: 6500, color: '#FFFFFF', name: 'White (6500K)', intensity: 0, efficiency: 2.3, photosynthetic: true }
]

// Built-in presets
const builtInPresets: SpectrumPreset[] = [
  {
    id: 'vegetative',
    name: 'Vegetative Growth',
    description: 'Blue-heavy spectrum for compact vegetative growth',
    targetCrop: 'Universal',
    growthStage: 'Vegetative',
    channels: defaultChannels.map(ch => ({
      ...ch,
      intensity: ch.wavelength === 450 ? 30 : 
                ch.wavelength === 470 ? 25 :
                ch.wavelength === 660 ? 35 :
                ch.wavelength === 730 ? 5 : 5
    }))
  },
  {
    id: 'flowering',
    name: 'Flowering/Fruiting',
    description: 'Red-heavy spectrum with far-red for flowering',
    targetCrop: 'Fruiting Crops',
    growthStage: 'Flowering',
    channels: defaultChannels.map(ch => ({
      ...ch,
      intensity: ch.wavelength === 450 ? 15 : 
                ch.wavelength === 630 ? 30 :
                ch.wavelength === 660 ? 40 :
                ch.wavelength === 730 ? 10 : 5
    }))
  },
  {
    id: 'full-spectrum',
    name: 'Full Spectrum Sunlight',
    description: 'Balanced spectrum mimicking natural sunlight',
    targetCrop: 'Universal',
    growthStage: 'All Stages',
    channels: defaultChannels.map(ch => ({
      ...ch,
      intensity: ch.wavelength === 6500 ? 40 : 
                ch.wavelength === 450 ? 20 :
                ch.wavelength === 660 ? 25 :
                ch.wavelength === 525 ? 10 : 5
    }))
  },
  {
    id: 'emerson-enhancement',
    name: 'Emerson Enhancement',
    description: 'Deep red + far red for enhanced photosynthesis',
    targetCrop: 'High-Light Crops',
    growthStage: 'All Stages',
    channels: defaultChannels.map(ch => ({
      ...ch,
      intensity: ch.wavelength === 660 ? 70 : 
                ch.wavelength === 730 ? 15 :
                ch.wavelength === 450 ? 10 : 5
    }))
  },
  {
    id: 'cannabis-veg',
    name: 'Cannabis Vegetative',
    description: 'Optimal spectrum for cannabis vegetative stage',
    targetCrop: 'Cannabis',
    growthStage: 'Vegetative',
    channels: defaultChannels.map(ch => ({
      ...ch,
      intensity: ch.wavelength === 450 ? 35 : 
                ch.wavelength === 470 ? 20 :
                ch.wavelength === 660 ? 35 :
                ch.wavelength === 6500 ? 10 : 0
    }))
  },
  {
    id: 'cannabis-flower',
    name: 'Cannabis Flowering',
    description: 'Optimal spectrum for cannabis flowering stage',
    targetCrop: 'Cannabis',
    growthStage: 'Flowering',
    channels: defaultChannels.map(ch => ({
      ...ch,
      intensity: ch.wavelength === 450 ? 10 : 
                ch.wavelength === 630 ? 25 :
                ch.wavelength === 660 ? 45 :
                ch.wavelength === 730 ? 10 :
                ch.wavelength === 380 ? 5 : 5
    }))
  }
]

export function CustomSpectrumDesigner({
  onSpectrumChange,
  onPresetSave,
  existingPresets = []
}: CustomSpectrumDesignerProps) {
  const [channels, setChannels] = useState<SpectrumChannel[]>(defaultChannels)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetDescription, setPresetDescription] = useState('')
  const [customChannels, setCustomChannels] = useState<SpectrumChannel[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const allPresets = [...builtInPresets, ...existingPresets]

  // Calculate metrics
  const totalPPFD = channels.reduce((sum, ch) => {
    if (ch.photosynthetic && ch.wavelength < 1000) { // Exclude white LEDs from simple sum
      return sum + (ch.intensity * ch.efficiency)
    }
    return sum
  }, 0)

  const avgEfficiency = channels.reduce((sum, ch) => {
    const weight = ch.intensity / 100
    return sum + (ch.efficiency * weight)
  }, 0)

  const mcCreeWeightedPPF = channels.reduce((sum, ch) => {
    // McCree curve approximation
    let mcCreeFactor = 1.0
    if (ch.wavelength >= 400 && ch.wavelength <= 700) {
      if (ch.wavelength < 550) {
        mcCreeFactor = 0.85 + (ch.wavelength - 400) * 0.001
      } else if (ch.wavelength < 650) {
        mcCreeFactor = 1.0
      } else {
        mcCreeFactor = 1.0 - (ch.wavelength - 650) * 0.002
      }
    }
    return sum + (ch.intensity * ch.efficiency * mcCreeFactor)
  }, 0)

  const redBlueRatio = (() => {
    const red = channels.filter(ch => ch.wavelength >= 600 && ch.wavelength <= 700)
      .reduce((sum, ch) => sum + ch.intensity, 0)
    const blue = channels.filter(ch => ch.wavelength >= 400 && ch.wavelength <= 500)
      .reduce((sum, ch) => sum + ch.intensity, 0)
    return blue > 0 ? (red / blue).toFixed(2) : '∞'
  })()

  useEffect(() => {
    if (onSpectrumChange) {
      onSpectrumChange(channels)
    }
  }, [channels])

  const handleChannelChange = (index: number, intensity: number) => {
    const newChannels = [...channels]
    newChannels[index].intensity = intensity
    setChannels(newChannels)
  }

  const loadPreset = (presetId: string) => {
    const preset = allPresets.find(p => p.id === presetId)
    if (preset) {
      setChannels(preset.channels)
      setSelectedPreset(presetId)
    }
  }

  const saveAsPreset = () => {
    if (!presetName) return

    const newPreset: SpectrumPreset = {
      id: `custom-${Date.now()}`,
      name: presetName,
      description: presetDescription,
      channels: [...channels]
    }

    if (onPresetSave) {
      onPresetSave(newPreset)
    }

    setShowSaveDialog(false)
    setPresetName('')
    setPresetDescription('')
  }

  const addCustomChannel = () => {
    const newChannel: SpectrumChannel = {
      wavelength: 500,
      color: '#00FF00',
      name: `Custom ${customChannels.length + 1}`,
      intensity: 0,
      efficiency: 2.0,
      photosynthetic: true
    }
    setCustomChannels([...customChannels, newChannel])
    setChannels([...channels, newChannel])
  }

  const removeCustomChannel = (index: number) => {
    const channelIndex = defaultChannels.length + index
    setCustomChannels(customChannels.filter((_, i) => i !== index))
    setChannels(channels.filter((_, i) => i !== channelIndex))
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          Custom Spectrum Designer
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Preset
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Load Preset</label>
        <select
          value={selectedPreset}
          onChange={(e) => loadPreset(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Custom Configuration</option>
          <optgroup label="Built-in Presets">
            {builtInPresets.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name} - {preset.description}
              </option>
            ))}
          </optgroup>
          {existingPresets.length > 0 && (
            <optgroup label="Saved Presets">
              {existingPresets.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Spectrum Visualization */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <div className="h-32 relative mb-2">
          {channels.map((channel, index) => {
            const position = channel.wavelength < 1000 
              ? ((channel.wavelength - 380) / (730 - 380)) * 100
              : 95 // Position white LED at the end
            
            return (
              <div
                key={index}
                className="absolute bottom-0 w-4 transition-all"
                style={{
                  left: `${position}%`,
                  height: `${channel.intensity}%`,
                  backgroundColor: channel.color,
                  opacity: 0.8,
                  boxShadow: `0 0 10px ${channel.color}`
                }}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>380nm</span>
          <span>450nm</span>
          <span>550nm</span>
          <span>650nm</span>
          <span>730nm</span>
        </div>
      </div>

      {/* Spectrum Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400">Relative PPFD</div>
          <div className="text-lg font-semibold">{totalPPFD.toFixed(0)}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400">Avg Efficiency</div>
          <div className="text-lg font-semibold">{avgEfficiency.toFixed(2)} µmol/J</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400">R:B Ratio</div>
          <div className="text-lg font-semibold">{redBlueRatio}:1</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400">McCree PPF</div>
          <div className="text-lg font-semibold">{mcCreeWeightedPPF.toFixed(0)}</div>
        </div>
      </div>

      {/* Channel Controls */}
      <div className="space-y-3">
        {channels.map((channel, index) => (
          <div key={index} className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: channel.color }}
                />
                <div>
                  <span className="text-sm font-medium">{channel.name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {channel.wavelength < 1000 ? `${channel.wavelength}nm` : channel.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showAdvanced && (
                  <>
                    <span className="text-xs text-gray-400">
                      {channel.efficiency} µmol/J
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      channel.photosynthetic ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {channel.photosynthetic ? 'PAR' : 'Non-PAR'}
                    </span>
                  </>
                )}
                <span className="text-sm font-medium w-12 text-right">
                  {channel.intensity}%
                </span>
                {index >= defaultChannels.length && (
                  <button
                    onClick={() => removeCustomChannel(index - defaultChannels.length)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={channel.intensity}
              onChange={(e) => handleChannelChange(index, Number(e.target.value))}
              className="w-full"
              style={{
                background: `linear-gradient(to right, ${channel.color}22 0%, ${channel.color} ${channel.intensity}%, #374151 ${channel.intensity}%, #374151 100%)`
              }}
            />
          </div>
        ))}
      </div>

      {/* Add Custom Channel */}
      {showAdvanced && (
        <button
          onClick={addCustomChannel}
          className="w-full mt-4 py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-gray-300 hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Custom Channel
        </button>
      )}

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="mt-6 bg-gray-700/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Advanced Analysis</h4>
          
          {/* Photosynthetic Action Spectrum */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">PAR Range (400-700nm)</span>
              <span className="font-medium">
                {channels.filter(ch => ch.wavelength >= 400 && ch.wavelength <= 700)
                  .reduce((sum, ch) => sum + ch.intensity, 0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Extended PAR (380-780nm)</span>
              <span className="font-medium">
                {channels.filter(ch => ch.wavelength >= 380 && ch.wavelength <= 780)
                  .reduce((sum, ch) => sum + ch.intensity, 0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Blue (400-500nm)</span>
              <span className="font-medium text-blue-400">
                {channels.filter(ch => ch.wavelength >= 400 && ch.wavelength <= 500)
                  .reduce((sum, ch) => sum + ch.intensity, 0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Green (500-600nm)</span>
              <span className="font-medium text-green-400">
                {channels.filter(ch => ch.wavelength >= 500 && ch.wavelength <= 600)
                  .reduce((sum, ch) => sum + ch.intensity, 0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Red (600-700nm)</span>
              <span className="font-medium text-red-400">
                {channels.filter(ch => ch.wavelength >= 600 && ch.wavelength <= 700)
                  .reduce((sum, ch) => sum + ch.intensity, 0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Far Red (700-800nm)</span>
              <span className="font-medium text-red-600">
                {channels.filter(ch => ch.wavelength >= 700 && ch.wavelength <= 800)
                  .reduce((sum, ch) => sum + ch.intensity, 0)}%
              </span>
            </div>
          </div>

          {/* Phytochrome State */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <div className="text-xs text-gray-400 mb-2">Phytochrome State Estimate</div>
            <div className="flex justify-between text-sm">
              <span>Pr ← → Pfr</span>
              <span className="font-medium">
                {(() => {
                  const r = channels.find(ch => ch.wavelength === 660)?.intensity || 0
                  const fr = channels.find(ch => ch.wavelength === 730)?.intensity || 0
                  const pfrRatio = r > 0 ? (r / (r + fr * 1.4)) : 0
                  return `${(pfrRatio * 100).toFixed(0)}% Pfr`
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Export/Import */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => {
            const data = {
              name: selectedPreset ? allPresets.find(p => p.id === selectedPreset)?.name : 'Custom',
              channels: channels.map(ch => ({
                wavelength: ch.wavelength,
                name: ch.name,
                intensity: ch.intensity
              }))
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `spectrum-${Date.now()}.json`
            a.click()
          }}
          className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.json'
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                  try {
                    const data = JSON.parse(e.target?.result as string)
                    if (data.channels) {
                      const newChannels = channels.map((ch, i) => ({
                        ...ch,
                        intensity: data.channels[i]?.intensity || 0
                      }))
                      setChannels(newChannels)
                      setSelectedPreset('')
                    }
                  } catch (err) {
                    console.error('Failed to parse spectrum file')
                  }
                }
                reader.readAsText(file)
              }
            }
            input.click()
          }}
          className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Spectrum Preset</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Preset Name</label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="My Custom Spectrum"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={3}
                  placeholder="Describe the purpose of this spectrum..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAsPreset}
                disabled={!presetName}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}