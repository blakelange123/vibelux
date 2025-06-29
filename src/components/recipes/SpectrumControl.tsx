'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Zap,
  Info,
  Plus,
  Minus,
  Copy,
  Save,
  BarChart3,
  Lightbulb,
  Activity
} from 'lucide-react';

interface SpectrumBand {
  name: string;
  range: string;
  wavelengthStart: number;
  wavelengthEnd: number;
  color: string;
  percentage: number;
  effects: string[];
  defaultValue?: number;
}

interface SpectrumProfile {
  id: string;
  name: string;
  description: string;
  bands: Record<string, number>;
  ppfd: number;
  photoperiod: number;
  dli: number;
}

interface SpectrumControlProps {
  onSpectrumChange?: (spectrum: any) => void;
  initialSpectrum?: any;
  stage?: string;
}

const spectrumBands: SpectrumBand[] = [
  {
    name: 'UV',
    range: '280-400 nm',
    wavelengthStart: 280,
    wavelengthEnd: 400,
    color: '#8B00FF',
    percentage: 0,
    effects: ['Increases flavonoids', 'Enhances pest resistance', 'Compact growth'],
    defaultValue: 2
  },
  {
    name: 'Blue',
    range: '400-500 nm',
    wavelengthStart: 400,
    wavelengthEnd: 500,
    color: '#0000FF',
    percentage: 0,
    effects: ['Promotes vegetative growth', 'Stomatal opening', 'Compact morphology'],
    defaultValue: 20
  },
  {
    name: 'Green',
    range: '500-600 nm',
    wavelengthStart: 500,
    wavelengthEnd: 600,
    color: '#00FF00',
    percentage: 0,
    effects: ['Penetrates canopy', 'Photosynthesis in lower leaves', 'Growth regulation'],
    defaultValue: 10
  },
  {
    name: 'Red',
    range: '600-700 nm',
    wavelengthStart: 600,
    wavelengthEnd: 700,
    color: '#FF0000',
    percentage: 0,
    effects: ['Primary photosynthesis', 'Flowering trigger', 'Fruit development'],
    defaultValue: 40
  },
  {
    name: 'Far Red',
    range: '700-800 nm',
    wavelengthStart: 700,
    wavelengthEnd: 800,
    color: '#8B0000',
    percentage: 0,
    effects: ['Shade avoidance', 'Stem elongation', 'Flowering regulation'],
    defaultValue: 8
  },
  {
    name: 'White/Full',
    range: '380-780 nm',
    wavelengthStart: 380,
    wavelengthEnd: 780,
    color: '#FFFFFF',
    percentage: 0,
    effects: ['Natural appearance', 'Worker visibility', 'Balanced growth'],
    defaultValue: 20
  }
];

const presetProfiles: SpectrumProfile[] = [
  {
    id: 'vegetative',
    name: 'Vegetative Growth',
    description: 'High blue for compact vegetative growth',
    bands: { UV: 2, Blue: 30, Green: 10, Red: 35, 'Far Red': 3, 'White/Full': 20 },
    ppfd: 250,
    photoperiod: 18,
    dli: 16.2
  },
  {
    id: 'flowering',
    name: 'Flowering/Fruiting',
    description: 'Red-heavy spectrum for flowering',
    bands: { UV: 3, Blue: 15, Green: 8, Red: 50, 'Far Red': 14, 'White/Full': 10 },
    ppfd: 400,
    photoperiod: 12,
    dli: 17.3
  },
  {
    id: 'leafy-greens',
    name: 'Leafy Greens',
    description: 'Balanced spectrum for lettuce/herbs',
    bands: { UV: 1, Blue: 20, Green: 12, Red: 40, 'Far Red': 7, 'White/Full': 20 },
    ppfd: 200,
    photoperiod: 16,
    dli: 11.5
  },
  {
    id: 'microgreens',
    name: 'Microgreens',
    description: 'High intensity, blue-enhanced',
    bands: { UV: 0, Blue: 25, Green: 10, Red: 45, 'Far Red': 5, 'White/Full': 15 },
    ppfd: 150,
    photoperiod: 16,
    dli: 8.6
  },
  {
    id: 'strawberries',
    name: 'Strawberries',
    description: 'Optimized for berry production',
    bands: { UV: 4, Blue: 18, Green: 8, Red: 45, 'Far Red': 10, 'White/Full': 15 },
    ppfd: 350,
    photoperiod: 14,
    dli: 17.6
  }
];

export function SpectrumControl({ onSpectrumChange, initialSpectrum, stage = 'Growth' }: SpectrumControlProps) {
  const [spectrum, setSpectrum] = useState<Record<string, number>>(
    initialSpectrum || spectrumBands.reduce((acc, band) => ({
      ...acc,
      [band.name]: band.defaultValue || 0
    }), {})
  );
  
  const [ppfd, setPpfd] = useState(250);
  const [photoperiod, setPhotoperiod] = useState(16);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const calculateDLI = () => {
    return ((ppfd * photoperiod * 3600) / 1000000).toFixed(1);
  };

  const updateSpectrum = (band: string, value: number) => {
    const newSpectrum = { ...spectrum, [band]: Math.max(0, Math.min(100, value)) };
    
    // Normalize to 100%
    const total = Object.values(newSpectrum).reduce((sum, val) => sum + val, 0);
    if (total > 100) {
      const scale = 100 / total;
      Object.keys(newSpectrum).forEach(key => {
        newSpectrum[key] = Math.round(newSpectrum[key] * scale);
      });
    }
    
    setSpectrum(newSpectrum);
    setSelectedProfile(null);
    
    if (onSpectrumChange) {
      onSpectrumChange({
        spectrum: newSpectrum,
        ppfd,
        photoperiod,
        dli: calculateDLI()
      });
    }
  };

  const applyProfile = (profile: SpectrumProfile) => {
    setSpectrum(profile.bands);
    setPpfd(profile.ppfd);
    setPhotoperiod(profile.photoperiod);
    setSelectedProfile(profile.id);
    
    if (onSpectrumChange) {
      onSpectrumChange({
        spectrum: profile.bands,
        ppfd: profile.ppfd,
        photoperiod: profile.photoperiod,
        dli: profile.dli
      });
    }
  };

  const getTotalPercentage = () => {
    return Object.values(spectrum).reduce((sum, val) => sum + val, 0);
  };

  return (
    <div className="space-y-6">
      {/* Preset Profiles */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Quick Presets
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {presetProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => applyProfile(profile)}
              className={`p-3 rounded-lg border transition-all text-left ${
                selectedProfile === profile.id
                  ? 'bg-purple-600/20 border-purple-500'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
            >
              <p className="font-medium text-sm text-white">{profile.name}</p>
              <p className="text-xs text-gray-400 mt-1">{profile.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-gray-500">PPFD: {profile.ppfd}</span>
                <span className="text-gray-500">DLI: {profile.dli}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Spectrum Bands */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Spectrum Composition
          <span className="ml-auto text-xs text-gray-500">
            Total: {getTotalPercentage()}%
          </span>
        </h4>
        
        <div className="space-y-3">
          {spectrumBands.map((band) => (
            <div key={band.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ 
                      backgroundColor: band.color,
                      boxShadow: band.name === 'White/Full' ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : undefined
                    }}
                  />
                  <div>
                    <span className="text-sm font-medium text-white">{band.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{band.range}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSpectrum(band.name, spectrum[band.name] - 5)}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    value={spectrum[band.name] || 0}
                    onChange={(e) => updateSpectrum(band.name, parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-center text-sm"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm text-gray-400 w-8">%</span>
                  <button
                    onClick={() => updateSpectrum(band.name, spectrum[band.name] + 5)}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {/* Visual bar */}
              <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ 
                    backgroundColor: band.color,
                    filter: band.name === 'White/Full' ? 'brightness(0.8)' : undefined
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${spectrum[band.name] || 0}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              {/* Effects tooltip */}
              {showAdvanced && (
                <div className="text-xs text-gray-500 ml-7">
                  {band.effects.join(' • ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Intensity & Photoperiod */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            PPFD (μmol/m²/s)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={ppfd}
              onChange={(e) => {
                setPpfd(parseInt(e.target.value) || 0);
                if (onSpectrumChange) {
                  onSpectrumChange({
                    spectrum,
                    ppfd: parseInt(e.target.value) || 0,
                    photoperiod,
                    dli: calculateDLI()
                  });
                }
              }}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              min="0"
              max="1000"
            />
            <Zap className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Light intensity at canopy</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Photoperiod (hours)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={photoperiod}
              onChange={(e) => {
                setPhotoperiod(parseInt(e.target.value) || 0);
                if (onSpectrumChange) {
                  onSpectrumChange({
                    spectrum,
                    ppfd,
                    photoperiod: parseInt(e.target.value) || 0,
                    dli: calculateDLI()
                  });
                }
              }}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              min="0"
              max="24"
            />
            <Sun className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Hours of light per day</p>
        </div>
      </div>

      {/* Calculated DLI */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">Daily Light Integral (DLI)</p>
            <p className="text-2xl font-bold text-white mt-1">{calculateDLI()} mol/m²/day</p>
          </div>
          <Activity className="w-8 h-8 text-purple-500" />
        </div>
        <div className="mt-3 space-y-1 text-xs text-gray-500">
          <p>• Microgreens: 6-12 DLI</p>
          <p>• Leafy Greens: 12-17 DLI</p>
          <p>• Fruiting Crops: 15-30 DLI</p>
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
      >
        <Info className="w-4 h-4" />
        {showAdvanced ? 'Hide' : 'Show'} spectrum effects
      </button>

      {/* Spectrum Visualization */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Spectrum Visualization</h4>
        <div className="h-32 relative">
          <svg className="w-full h-full">
            {/* Spectrum gradient background */}
            <defs>
              <linearGradient id="spectrumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B00FF" />
                <stop offset="20%" stopColor="#0000FF" />
                <stop offset="40%" stopColor="#00FF00" />
                <stop offset="60%" stopColor="#FFFF00" />
                <stop offset="80%" stopColor="#FF0000" />
                <stop offset="100%" stopColor="#8B0000" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#spectrumGradient)" opacity="0.2" />
            
            {/* Spectrum curve */}
            <path
              d={generateSpectrumCurve(spectrum)}
              fill="none"
              stroke="white"
              strokeWidth="2"
              opacity="0.8"
            />
            <path
              d={generateSpectrumCurve(spectrum) + ' L 100% 100% L 0 100% Z'}
              fill="white"
              opacity="0.1"
            />
          </svg>
          
          {/* Wavelength labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
            <span>280nm</span>
            <span>400nm</span>
            <span>500nm</span>
            <span>600nm</span>
            <span>700nm</span>
            <span>800nm</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate SVG path for spectrum curve
function generateSpectrumCurve(spectrum: Record<string, number>): string {
  const points: Array<[number, number]> = [];
  const width = 100; // percentage
  const height = 100; // percentage
  
  // Map spectrum bands to curve points
  const bandPositions = {
    'UV': 10,
    'Blue': 25,
    'Green': 40,
    'Red': 60,
    'Far Red': 80,
    'White/Full': 50 // Centered as it covers full spectrum
  };
  
  Object.entries(spectrum).forEach(([band, value]) => {
    const x = bandPositions[band as keyof typeof bandPositions] || 50;
    const y = height - (value * 0.8); // Scale to 80% of height
    points.push([x, y]);
  });
  
  // Sort by x position
  points.sort((a, b) => a[0] - b[0]);
  
  // Generate smooth curve using quadratic bezier
  if (points.length === 0) return '';
  
  let path = `M ${points[0][0]}% ${points[0][1]}%`;
  
  for (let i = 1; i < points.length; i++) {
    const cp1x = (points[i-1][0] + points[i][0]) / 2;
    const cp1y = points[i-1][1];
    const cp2x = cp1x;
    const cp2y = points[i][1];
    
    path += ` Q ${cp1x}% ${cp1y}%, ${points[i][0]}% ${points[i][1]}%`;
  }
  
  return path;
}