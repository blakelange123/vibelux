'use client';

import React, { useState, useRef } from 'react';
import { SmoothPPFDGradientMap } from './SmoothPPFDGradientMap';
import { useNotifications } from '../context/NotificationContext';
import { 
  Eye, 
  Camera, 
  Palette, 
  Sun, 
  Moon, 
  Layers, 
  Settings, 
  Download, 
  Play,
  Pause,
  RotateCw,
  Maximize,
  Grid3x3,
  Lightbulb,
  Contrast,
  Sliders,
  Target,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ViewMode {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface RenderingSettings {
  quality: 'draft' | 'medium' | 'high' | 'photorealistic';
  shadows: boolean;
  reflections: boolean;
  globalIllumination: boolean;
  materials: boolean;
  antiAliasing: boolean;
  hdri: string;
}

export function AdvancedVisualizationPanel() {
  const { showNotification } = useNotifications();
  const [currentView, setCurrentView] = useState<string>('3d-realistic');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [renderSettings, setRenderSettings] = useState<RenderingSettings>({
    quality: 'medium',
    shadows: true,
    reflections: false,
    globalIllumination: false,
    materials: true,
    antiAliasing: true,
    hdri: 'studio'
  });

  const viewModes: ViewMode[] = [
    {
      id: '3d-realistic',
      name: 'Realistic 3D',
      description: 'Photorealistic rendering with materials',
      icon: Eye
    },
    {
      id: '3d-wireframe',
      name: 'Wireframe',
      description: 'Technical wireframe view',
      icon: Grid3x3
    },
    {
      id: 'false-color',
      name: 'False Color',
      description: 'Illuminance false-color mapping',
      icon: Palette
    },
    {
      id: 'isolux',
      name: 'Isolux Contours',
      description: 'Equal illuminance contour lines',
      icon: Target
    },
    {
      id: 'glare-analysis',
      name: 'Glare Analysis',
      description: 'UGR and visual comfort analysis',
      icon: Contrast
    },
    {
      id: 'section-view',
      name: 'Section View',
      description: 'Cross-sectional analysis',
      icon: Layers
    },
    {
      id: 'ppfd-gradient',
      name: 'PPFD Gradient',
      description: 'Smooth Apple Health-style PPFD visualization',
      icon: Sun
    }
  ];

  const hdriOptions = [
    { id: 'studio', name: 'Studio', description: 'Neutral studio lighting' },
    { id: 'daylight', name: 'Daylight', description: 'Natural daylight' },
    { id: 'sunset', name: 'Sunset', description: 'Warm sunset lighting' },
    { id: 'overcast', name: 'Overcast', description: 'Soft overcast sky' },
    { id: 'night', name: 'Night', description: 'Night scene' }
  ];

  const falseColorScale = [
    { value: 0, color: '#000080', label: '0' },
    { value: 10, color: '#0000FF', label: '10' },
    { value: 20, color: '#00FFFF', label: '20' },
    { value: 30, color: '#00FF00', label: '30' },
    { value: 50, color: '#FFFF00', label: '50' },
    { value: 75, color: '#FF8000', label: '75' },
    { value: 100, color: '#FF0000', label: '100+' }
  ];

  const startTimeAnimation = () => {
    setIsAnimating(!isAnimating);
    // Mock animation control
  };

  const captureView = () => {
    // Mock screenshot functionality
  };

  const exportAnimation = () => {
    // Mock animation export
  };

  const renderQualityOptions = [
    { value: 'draft', label: 'Draft (Fast)', description: 'Quick preview rendering' },
    { value: 'medium', label: 'Medium', description: 'Balanced quality and speed' },
    { value: 'high', label: 'High Quality', description: 'Detailed rendering' },
    { value: 'photorealistic', label: 'Photorealistic', description: 'Ray-traced rendering' }
  ];

  return (
    <div className="w-96 bg-gray-900 border-l border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Advanced Visualization</h2>
        <p className="text-sm text-gray-400">Professional rendering and analysis</p>
      </div>

      {/* View Mode Selector */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">View Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          {viewModes.map(mode => {
            const Icon = mode.icon;
            const isSelected = currentView === mode.id;
            
            return (
              <button
                key={mode.id}
                onClick={() => setCurrentView(mode.id)}
                className={`p-3 rounded-lg border transition-colors ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-600/20 text-white' 
                    : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'
                }`}
                title={mode.description}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs font-medium">{mode.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* False Color Scale (when in false color mode) */}
      {currentView === 'false-color' && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Illuminance Scale (fc)</h3>
          <div className="space-y-2">
            {falseColorScale.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-gray-600"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-300">{item.label}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 p-2 bg-gray-800 rounded text-xs text-gray-400">
            <strong>Legend:</strong> Blue = low light, Red = high light
          </div>
        </div>
      )}

      {/* Time Animation Controls */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Time Animation</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={startTimeAnimation}
              className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${
                isAnimating 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAnimating ? 'Stop' : 'Start'}
            </button>
            <button
              onClick={exportAnimation}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              title="Export Animation"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1">Time of Day</label>
            <input
              type="range"
              min="0"
              max="24"
              step="0.5"
              defaultValue="12"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>00:00</span>
              <span>12:00</span>
              <span>24:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rendering Quality */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Rendering Quality</h3>
        <select
          value={renderSettings.quality}
          onChange={(e) => setRenderSettings({...renderSettings, quality: e.target.value as any})}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
        >
          {renderQualityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="mt-3 space-y-2">
          {[
            { key: 'shadows', label: 'Shadows' },
            { key: 'reflections', label: 'Reflections' },
            { key: 'materials', label: 'Materials' },
            { key: 'antiAliasing', label: 'Anti-aliasing' }
          ].map(option => (
            <label key={option.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{option.label}</span>
              <input
                type="checkbox"
                checked={renderSettings[option.key as keyof RenderingSettings] as boolean}
                onChange={(e) => setRenderSettings({
                  ...renderSettings,
                  [option.key]: e.target.checked
                })}
                className="text-purple-600"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Environment Settings */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-300 mb-3"
        >
          Environment Settings
          {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showSettings && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">HDRI Environment</label>
              <select
                value={renderSettings.hdri}
                onChange={(e) => setRenderSettings({...renderSettings, hdri: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                {hdriOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Environment Intensity</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                defaultValue="1"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Global Illumination</label>
              <input
                type="checkbox"
                checked={renderSettings.globalIllumination}
                onChange={(e) => setRenderSettings({...renderSettings, globalIllumination: e.target.checked})}
                className="text-purple-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Camera Controls</h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => showNotification('info', 'Top view selected')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
          >
            Top View
          </button>
          <button 
            onClick={() => showNotification('info', 'Side view selected')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
          >
            Side View
          </button>
          <button 
            onClick={() => showNotification('info', 'Perspective view selected')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
          >
            Perspective
          </button>
          <button 
            onClick={() => showNotification('info', 'Walkthrough mode selected')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
          >
            Walkthrough
          </button>
        </div>
        
        <div className="mt-3 flex gap-2">
          <button
            onClick={captureView}
            className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm"
          >
            <Camera className="w-4 h-4" />
            Capture
          </button>
          <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analysis Tools */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Analysis Tools</h3>
        <div className="space-y-2">
          <button 
            onClick={() => {
              showNotification('info', 'Select Measurement Tool from the Tool Palette to measure distances');
            }}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm text-left flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Measurement Tool
          </button>
          <button 
            onClick={() => {
              showNotification('info', 'Select Point Illuminance tool from the Tool Palette then click on the canvas');
            }}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm text-left flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Point Illuminance
          </button>
          <button 
            onClick={() => {
              showNotification('info', 'Select Glare Analysis tool from the Tool Palette then click to analyze');
            }}
            className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm text-left flex items-center gap-2"
          >
            <Contrast className="w-4 h-4" />
            Glare Analysis
          </button>
          <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm text-left flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Daylight Factor
          </button>
        </div>
      </div>
    </div>
  );
}