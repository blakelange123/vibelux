'use client'

import { useState, useEffect } from 'react'
import { 
  Palette, 
  Building, 
  Eye, 
  EyeOff, 
  Upload, 
  Save,
  RotateCcw,
  Globe,
  Mail,
  Phone,
  Check
} from 'lucide-react'
import { getWhiteLabelConfig, saveWhiteLabelConfig, defaultWhiteLabel, WhiteLabelConfig } from '@/lib/whitelabel-config'

export function WhiteLabelSettings() {
  const [config, setConfig] = useState<WhiteLabelConfig>(defaultWhiteLabel)
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(false)
  
  useEffect(() => {
    setConfig(getWhiteLabelConfig())
  }, [])
  
  const handleSave = () => {
    saveWhiteLabelConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }
  
  const handleReset = () => {
    setConfig(defaultWhiteLabel)
    saveWhiteLabelConfig(defaultWhiteLabel)
  }
  
  const handleColorChange = (type: 'primary' | 'secondary', channel: 'r' | 'g' | 'b', value: string) => {
    const numValue = parseInt(value) || 0
    setConfig(prev => ({
      ...prev,
      [`${type}Color`]: {
        ...prev[`${type}Color`],
        [channel]: Math.min(255, Math.max(0, numValue))
      }
    }))
  }
  
  const rgbToHex = (color: { r: number; g: number; b: number }) => {
    return `#${[color.r, color.g, color.b].map(x => x.toString(16).padStart(2, '0')).join('')}`
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">White Label Settings</h2>
        <p className="text-gray-400">Customize the branding for your exported reports and documents</p>
      </div>
      
      {/* Company Information */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-purple-400" />
          Company Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Company Name</label>
            <input
              type="text"
              value={config.companyName}
              onChange={(e) => setConfig(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Your Company Name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Support Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={config.supportEmail || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="support@company.com"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">Support Phone</label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={config.supportPhone || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, supportPhone: e.target.value }))}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1 block">Website</label>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={config.website || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, website: e.target.value }))}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="https://company.com"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Brand Colors */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          Brand Colors
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Primary Color</label>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-gray-600"
                style={{ backgroundColor: rgbToHex(config.primaryColor) }}
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">R</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={config.primaryColor.r}
                    onChange={(e) => handleColorChange('primary', 'r', e.target.value)}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">G</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={config.primaryColor.g}
                    onChange={(e) => handleColorChange('primary', 'g', e.target.value)}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">B</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={config.primaryColor.b}
                    onChange={(e) => handleColorChange('primary', 'b', e.target.value)}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Secondary Color</label>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-gray-600"
                style={{ backgroundColor: rgbToHex(config.secondaryColor) }}
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">R</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={config.secondaryColor.r}
                    onChange={(e) => handleColorChange('secondary', 'r', e.target.value)}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">G</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={config.secondaryColor.g}
                    onChange={(e) => handleColorChange('secondary', 'g', e.target.value)}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">B</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={config.secondaryColor.b}
                    onChange={(e) => handleColorChange('secondary', 'b', e.target.value)}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Branding Options */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Branding Options</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.hideBranding}
              onChange={(e) => setConfig(prev => ({ ...prev, hideBranding: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
            />
            <div>
              <span className="text-white font-medium">Remove All Branding</span>
              <p className="text-sm text-gray-400">Export documents without any company branding</p>
            </div>
          </label>
        </div>
      </div>
      
      {/* Preview */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-400" />
            Export Preview
          </span>
          <button
            onClick={() => setPreview(!preview)}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            {preview ? 'Hide' : 'Show'} Preview
          </button>
        </h3>
        
        {preview && (
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div style={{ color: rgbToHex(config.primaryColor) }} className="text-xl font-bold mb-2">
              {config.hideBranding ? 'Lighting Design Report' : `${config.companyName} Lighting Design Report`}
            </div>
            <p className="text-gray-400 text-sm mb-4">Generated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-2 text-sm text-gray-300">
              <p>Room Dimensions: 10m × 10m × 3m</p>
              <p>Total Fixtures: 12</p>
              <p>Total Power: 7,560W</p>
              <p>Average PPFD: 650 μmol/m²/s</p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-700 text-xs text-gray-500">
              {config.hideBranding 
                ? `Generated on ${new Date().toLocaleDateString()}`
                : `Generated by ${config.companyName} - Professional Horticultural Lighting Platform`
              }
            </div>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </button>
        
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}