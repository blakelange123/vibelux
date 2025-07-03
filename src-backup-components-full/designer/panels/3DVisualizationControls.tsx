'use client';

import React, { useState } from 'react';
import {
  Eye,
  Lightbulb,
  Grid3x3,
  Palette,
  Sun,
  Moon,
  Zap,
  Camera,
  Layers,
  Settings,
  Download,
  Upload,
  RotateCw,
  Move3d,
  Box,
  Axis3d
} from 'lucide-react';

interface Visualization3DControlsProps {
  onSettingChange?: (setting: string, value: any) => void;
  onExport?: () => void;
  onImport?: () => void;
}

export function Visualization3DControls({ 
  onSettingChange,
  onExport,
  onImport
}: Visualization3DControlsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('view');
  
  // View settings
  const [viewSettings, setViewSettings] = useState({
    showGrid: true,
    showAxes: true,
    showShadows: true,
    showReflections: false,
    showLightCones: true,
    showMeasurements: false,
    wireframe: false,
    orthographic: false
  });

  // Lighting settings
  const [lightingSettings, setLightingSettings] = useState({
    ambientIntensity: 0.4,
    sunIntensity: 0.6,
    exposureTone: 1.2,
    lightingMode: 'realistic' as 'realistic' | 'flat' | 'diagnostic'
  });

  // Material settings
  const [materialSettings, setMaterialSettings] = useState({
    wallColor: '#3a3a3a',
    floorColor: '#2a2a2a',
    ceilingColor: '#4a4a4a',
    transparency: 1.0,
    roughness: 0.7,
    metalness: 0.1
  });

  // Performance settings
  const [performanceSettings, setPerformanceSettings] = useState({
    quality: 'medium' as 'low' | 'medium' | 'high',
    antialiasing: true,
    shadowQuality: 'medium' as 'low' | 'medium' | 'high',
    maxLights: 50,
    enablePostProcessing: true
  });

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const updateViewSetting = (key: keyof typeof viewSettings, value: boolean) => {
    setViewSettings(prev => ({ ...prev, [key]: value }));
    onSettingChange?.(`view.${key}`, value);
  };

  const updateLightingSetting = <K extends keyof typeof lightingSettings>(
    key: K, 
    value: typeof lightingSettings[K]
  ) => {
    setLightingSettings(prev => ({ ...prev, [key]: value }));
    onSettingChange?.(`lighting.${key}`, value);
  };

  const updateMaterialSetting = <K extends keyof typeof materialSettings>(
    key: K, 
    value: typeof materialSettings[K]
  ) => {
    setMaterialSettings(prev => ({ ...prev, [key]: value }));
    onSettingChange?.(`material.${key}`, value);
  };

  const updatePerformanceSetting = <K extends keyof typeof performanceSettings>(
    key: K, 
    value: typeof performanceSettings[K]
  ) => {
    setPerformanceSettings(prev => ({ ...prev, [key]: value }));
    onSettingChange?.(`performance.${key}`, value);
  };

  return (
    <div className="bg-gray-900 border-r border-gray-700 w-80 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Box className="w-5 h-5 text-purple-500" />
          3D Visualization Controls
        </h2>
      </div>

      {/* Controls Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* View Settings */}
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection('view')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-white font-medium">View Settings</span>
            </div>
            <RotateCw className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedSection === 'view' ? 'rotate-90' : ''
            }`} />
          </button>
          
          {expandedSection === 'view' && (
            <div className="p-4 space-y-3">
              {Object.entries(viewSettings).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateViewSetting(key as keyof typeof viewSettings, e.target.checked)}
                    className="rounded text-purple-600"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Lighting Settings */}
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection('lighting')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-white font-medium">Lighting Settings</span>
            </div>
            <RotateCw className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedSection === 'lighting' ? 'rotate-90' : ''
            }`} />
          </button>
          
          {expandedSection === 'lighting' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Ambient Intensity
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={lightingSettings.ambientIntensity}
                  onChange={(e) => updateLightingSetting('ambientIntensity', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {lightingSettings.ambientIntensity}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Sun Intensity
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={lightingSettings.sunIntensity}
                  onChange={(e) => updateLightingSetting('sunIntensity', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {lightingSettings.sunIntensity}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Lighting Mode
                </label>
                <select
                  value={lightingSettings.lightingMode}
                  onChange={(e) => updateLightingSetting('lightingMode', e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                >
                  <option value="realistic">Realistic</option>
                  <option value="flat">Flat</option>
                  <option value="diagnostic">Diagnostic</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Material Settings */}
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection('materials')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-green-500" />
              <span className="text-white font-medium">Material Settings</span>
            </div>
            <RotateCw className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedSection === 'materials' ? 'rotate-90' : ''
            }`} />
          </button>
          
          {expandedSection === 'materials' && (
            <div className="p-4 space-y-4">
              {['wallColor', 'floorColor', 'ceilingColor'].map((key) => (
                <div key={key}>
                  <label className="block text-sm text-gray-300 mb-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={materialSettings[key as keyof typeof materialSettings] as string}
                      onChange={(e) => updateMaterialSetting(key as any, e.target.value)}
                      className="w-10 h-10 rounded"
                    />
                    <input
                      type="text"
                      value={materialSettings[key as keyof typeof materialSettings] as string}
                      onChange={(e) => updateMaterialSetting(key as any, e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Surface Roughness
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={materialSettings.roughness}
                  onChange={(e) => updateMaterialSetting('roughness', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {materialSettings.roughness}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Settings */}
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection('performance')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-white font-medium">Performance Settings</span>
            </div>
            <RotateCw className={`w-4 h-4 text-gray-400 transition-transform ${
              expandedSection === 'performance' ? 'rotate-90' : ''
            }`} />
          </button>
          
          {expandedSection === 'performance' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Render Quality
                </label>
                <select
                  value={performanceSettings.quality}
                  onChange={(e) => updatePerformanceSetting('quality', e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Quality)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Shadow Quality
                </label>
                <select
                  value={performanceSettings.shadowQuality}
                  onChange={(e) => updatePerformanceSetting('shadowQuality', e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Antialiasing</span>
                <input
                  type="checkbox"
                  checked={performanceSettings.antialiasing}
                  onChange={(e) => updatePerformanceSetting('antialiasing', e.target.checked)}
                  className="rounded text-purple-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Post Processing</span>
                <input
                  type="checkbox"
                  checked={performanceSettings.enablePostProcessing}
                  onChange={(e) => updatePerformanceSetting('enablePostProcessing', e.target.checked)}
                  className="rounded text-purple-600"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <button
          onClick={onExport}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export 3D Scene
        </button>
        
        <button
          onClick={onImport}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import CAD Model
        </button>
      </div>
    </div>
  );
}