'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Layers, 
  Settings, 
  Zap, 
  Monitor,
  ChevronRight,
  ArrowLeft,
  Beaker
} from 'lucide-react';
import { ProfessionalCADDesigner } from './designer/ProfessionalCADDesigner';
import { TrialsManager } from './TrialsManager';

interface DesignerMode {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  features: string[];
}

const designerModes: DesignerMode[] = [
  {
    id: 'cad',
    name: 'Professional CAD Designer',
    description: 'Industry-standard 3D design environment for professional cultivation facility planning',
    icon: Box,
    color: 'from-blue-500 to-purple-600',
    features: [
      'Professional 3D modeling with multiple viewports',
      'Comprehensive fixture and equipment libraries',
      'Layer-based design organization',
      'Precision measurement tools with metric/imperial units',
      'Import/export CAD files',
      'Real-time collaboration capabilities'
    ]
  },
  {
    id: 'lighting',
    name: 'Lighting Design Studio',
    description: 'Specialized tools for optimizing light distribution and energy efficiency',
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    features: [
      'PPFD mapping and light distribution analysis',
      'Energy consumption optimization',
      'Fixture placement automation',
      'DLI calculations and recommendations',
      'Spectrum analysis tools',
      'ROI and payback period calculations'
    ]
  },
  {
    id: 'automation',
    name: 'Automation Designer',
    description: 'Design and configure automated systems for climate, irrigation, and monitoring',
    icon: Settings,
    color: 'from-green-500 to-emerald-600',
    features: [
      'Climate control system design',
      'Irrigation network planning',
      'Sensor placement optimization',
      'Control logic configuration',
      'Integration with SCADA systems',
      'Predictive maintenance scheduling'
    ]
  },
  {
    id: 'monitoring',
    name: 'Monitoring & Analytics',
    description: 'Design comprehensive monitoring systems and create custom dashboards',
    icon: Monitor,
    color: 'from-indigo-500 to-blue-600',
    features: [
      'Custom dashboard creation',
      'KPI tracking and alerts',
      'Historical data analysis',
      'Predictive analytics setup',
      'Report generation automation',
      'Compliance monitoring tools'
    ]
  },
  {
    id: 'trials',
    name: 'Statistical Trials',
    description: 'Design and analyze controlled experiments with rigorous statistical methods',
    icon: Beaker,
    color: 'from-purple-500 to-pink-600',
    features: [
      'Experimental design wizard with validated templates',
      'Automated statistical analysis (ANOVA, t-tests, effect sizes)',
      'Power analysis and sample size calculations',
      'Real-time data collection and quality monitoring',
      'Publication-ready scientific reports',
      'Revenue sharing validation through proven results'
    ]
  }
];

export function AdvancedDesigner() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [showModeDetails, setShowModeDetails] = useState<string | null>(null);

  // If CAD mode is selected, show the Professional CAD Designer
  if (selectedMode === 'cad' || selectedMode === null) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedMode('menu')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Designer Selection
            </button>
            <div className="flex items-center gap-2 text-white">
              <Box className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">Professional CAD Designer</span>
            </div>
            <div className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-semibold">
              DLC Fixtures Loaded
            </div>
          </div>
        </div>
        <ProfessionalCADDesigner />
      </div>
    );
  }

  // If Trials mode is selected, show the Trials Manager
  if (selectedMode === 'trials') {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedMode(null)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Designer Selection
            </button>
            <div className="flex items-center gap-2 text-white">
              <Beaker className="w-5 h-5 text-purple-400" />
              <span className="font-semibold">Statistical Trials</span>
            </div>
          </div>
        </div>
        <TrialsManager />
      </div>
    );
  }

  // Show menu selection only when explicitly requested
  if (selectedMode === 'menu') {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Advanced Design Studio</h1>
            <p className="text-gray-400">
              Professional-grade tools for designing, optimizing, and managing cultivation facilities
            </p>
          </div>
        </div>

      {/* Designer Mode Selection */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {designerModes.map((mode) => (
            <div
              key={mode.id}
              className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all duration-200 hover:shadow-lg"
              onMouseEnter={() => setShowModeDetails(mode.id)}
              onMouseLeave={() => setShowModeDetails(null)}
            >
              {/* Mode Header */}
              <div className={`bg-gradient-to-r ${mode.color} p-6`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <mode.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{mode.name}</h3>
                    <p className="text-white/80 text-sm mt-1">{mode.description}</p>
                  </div>
                </div>
              </div>

              {/* Mode Content */}
              <div className="p-6">
                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-300 text-sm uppercase tracking-wide">
                    Key Features
                  </h4>
                  <ul className="space-y-2">
                    {mode.features.slice(0, showModeDetails === mode.id ? mode.features.length : 3).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-400">
                        <ChevronRight className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {showModeDetails !== mode.id && mode.features.length > 3 && (
                      <li className="text-sm text-gray-500 italic">
                        +{mode.features.length - 3} more features...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex-1 bg-gradient-to-r ${mode.color} text-white px-4 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-2`}
                  >
                    Launch {mode.name.split(' ')[0]}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  {mode.id === 'cad' && (
                    <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                      Recommended
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                {mode.id === 'cad' && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-400">3D</div>
                        <div className="text-xs text-gray-500">Viewports</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-400">50+</div>
                        <div className="text-xs text-gray-500">Objects</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-400">CAD</div>
                        <div className="text-xs text-gray-500">Professional</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Getting Started Section */}
        <div className="mt-12 bg-gray-900 rounded-xl border border-gray-800 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              New to facility design? Start with the Professional CAD Designer to create your first 
              cultivation space layout, then expand to specialized tools for lighting optimization 
              and automation design.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setSelectedMode('cad')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform duration-200 flex items-center gap-2"
              >
                <Box className="w-5 h-5" />
                Start with CAD Designer
              </button>
              
              <button className="bg-gray-800 text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                View Documentation
              </button>
              
              <button className="bg-gray-800 text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                Watch Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }
  
  // Default to CAD Designer
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedMode('menu')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Designer Selection
          </button>
          <div className="flex items-center gap-2 text-white">
            <Box className="w-5 h-5 text-blue-400" />
            <span className="font-semibold">Professional CAD Designer</span>
          </div>
          <div className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-semibold">
            DLC Fixtures Ready
          </div>
        </div>
      </div>
      <ProfessionalCADDesigner />
    </div>
  );
}