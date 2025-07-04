'use client';

import React, { useState } from 'react';
import { 
  MousePointer,
  Square,
  Circle,
  Minus,
  Type,
  Ruler,
  Move,
  RotateCw,
  Copy,
  Lightbulb,
  Grid3x3,
  Eye,
  Calculator,
  Palette,
  FolderOpen,
  Settings,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  FileText,
  BarChart3,
  Building,
  Sun,
  Globe,
  Layers,
  Target,
  Upload,
  Wind,
  Droplets,
  Thermometer,
  Leaf,
  Cpu,
  Sparkles
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: 'select' | 'draw' | 'modify' | 'measure' | 'lighting' | 'view' | 'analyze';
  shortcut?: string;
  description: string;
}

interface ToolPaletteProps {
  selectedTool?: string;
  onToolSelect?: (toolId: string) => void;
  onPanelOpen?: (panelId: string) => void;
}

export function ToolPaletteSidebar({ selectedTool = 'select', onToolSelect, onPanelOpen }: ToolPaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['select', 'draw', 'lighting', 'equipment']);

  const tools: Tool[] = [
    // Select & Move
    { id: 'select', name: 'Select', icon: MousePointer, category: 'select', shortcut: 'V', description: 'Select and move objects' },
    { id: 'multi-select', name: 'Multi-Select', icon: Square, category: 'select', shortcut: 'Shift+V', description: 'Select multiple objects' },
    
    // Draw Tools
    { id: 'rectangle', name: 'Rectangle', icon: Square, category: 'draw', shortcut: 'R', description: 'Draw rectangles and rooms' },
    { id: 'circle', name: 'Circle', icon: Circle, category: 'draw', shortcut: 'C', description: 'Draw circles and curved walls' },
    { id: 'line', name: 'Line', icon: Minus, category: 'draw', shortcut: 'L', description: 'Draw lines and walls' },
    { id: 'text', name: 'Text', icon: Type, category: 'draw', shortcut: 'T', description: 'Add text annotations' },
    
    // Modify Tools
    { id: 'move', name: 'Move', icon: Move, category: 'modify', shortcut: 'M', description: 'Move objects precisely' },
    { id: 'rotate', name: 'Rotate', icon: RotateCw, category: 'modify', shortcut: 'R', description: 'Rotate objects' },
    { id: 'copy', name: 'Copy', icon: Copy, category: 'modify', shortcut: 'Ctrl+D', description: 'Duplicate objects' },
    
    // Measure Tools
    { id: 'measure', name: 'Measure', icon: Ruler, category: 'measure', shortcut: 'M', description: 'Measure distances' },
    
    // Lighting Tools
    { id: 'place', name: 'Add Fixture', icon: Lightbulb, category: 'lighting', shortcut: 'F', description: 'Select this to open fixture library and place fixtures' },
    { id: 'fans', name: 'Add Fans', icon: Wind, category: 'lighting', shortcut: 'W', description: 'Place HVAC fans' },
    { id: 'quick-array', name: 'Quick Array', icon: Sparkles, category: 'lighting', shortcut: 'Q', description: 'Quick fixture array' },
    { id: 'array', name: 'Array Tool', icon: Grid3x3, category: 'lighting', shortcut: 'A', description: 'Create fixture arrays' },
    { id: 'ppfd-array', name: 'PPFD Target Array', icon: Target, category: 'lighting', shortcut: 'P', description: 'Array for target PPFD' },
    { id: 'batch', name: 'Batch Place', icon: Layers, category: 'lighting', shortcut: 'B', description: 'Place multiple fixtures' },
    { id: 'import', name: 'Import IES', icon: Upload, category: 'lighting', shortcut: 'I', description: 'Import IES files' },
    
    // View Tools
    { id: 'view', name: 'View', icon: Eye, category: 'view', shortcut: 'Space', description: 'Pan the view' },
    
    // Equipment Tools (new category)
    { id: 'hvac', name: 'HVAC', icon: Thermometer, category: 'equipment', shortcut: 'H', description: 'Heating & cooling systems' },
    { id: 'dehumidifiers', name: 'Dehumidifiers', icon: Droplets, category: 'equipment', shortcut: 'D', description: 'Add dehumidification' },
    { id: 'co2systems', name: 'CO₂ Systems', icon: Leaf, category: 'equipment', shortcut: 'C', description: 'CO₂ supplementation' },
    { id: 'irrigation', name: 'Irrigation', icon: Droplets, category: 'equipment', shortcut: 'I', description: 'Water & nutrient delivery' },
    { id: 'controllers', name: 'Controllers', icon: Cpu, category: 'equipment', shortcut: 'O', description: 'Automation & control systems' },
    { id: 'electrical', name: 'Electrical', icon: Zap, category: 'equipment', shortcut: 'E', description: 'Power infrastructure' },
    { id: 'benching', name: 'Benching', icon: Layers, category: 'equipment', shortcut: 'B', description: 'Benching & racking systems' },
    { id: 'unistrut', name: 'Unistrut', icon: Building, category: 'equipment', shortcut: 'U', description: 'Hanging systems for fixtures' },
    
    // Analyze Tools
    { id: 'analyzer', name: 'Analyzer', icon: Calculator, category: 'analyze', shortcut: null, description: 'Analyze lighting' },
    { id: 'spectrum', name: 'Spectrum', icon: BarChart3, category: 'analyze', shortcut: null, description: 'Spectrum analysis' },
    { id: 'cfd', name: 'CFD Analysis', icon: Wind, category: 'analyze', shortcut: null, description: 'Airflow & thermal analysis' },
    { id: 'solar', name: 'Solar DLI', icon: Sun, category: 'analyze', shortcut: null, description: 'Solar DLI calculator' },
    { id: 'environment', name: 'Environment', icon: Globe, category: 'analyze', shortcut: null, description: 'Environmental integration' },
    { id: 'electrical', name: 'Electrical', icon: Zap, category: 'analyze', shortcut: null, description: 'Electrical estimator' },
    { id: 'standards', name: 'Standards', icon: Shield, category: 'analyze', shortcut: null, description: 'Compliance checker' },
    { id: 'reports', name: 'Reports', icon: FileText, category: 'analyze', shortcut: null, description: 'Generate reports' }
  ];

  const categories = [
    { id: 'select', name: 'Select', color: 'bg-blue-500' },
    { id: 'draw', name: 'Draw', color: 'bg-green-500' },
    { id: 'modify', name: 'Modify', color: 'bg-yellow-500' },
    { id: 'measure', name: 'Measure', color: 'bg-orange-500' },
    { id: 'lighting', name: 'Lighting', color: 'bg-purple-500' },
    { id: 'equipment', name: 'Equipment', color: 'bg-cyan-500' },
    { id: 'view', name: 'View', color: 'bg-pink-500' },
    { id: 'analyze', name: 'Analyze', color: 'bg-indigo-500' }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleToolClick = (toolId: string) => {
    // Special handling for panel tools
    const panelTools: Record<string, string> = {
      'quick-array': 'quickArrayTool',
      'array': 'arrayTool',
      'ppfd-array': 'ppfdArrayTool',
      'batch': 'batchPlacement',
      'import': 'fixtureImportWizard',
      'fans': 'fanLibrary',
      'hvac': 'hvacSystemPanel',
      'dehumidifiers': 'dehumidifierLibrary',
      'co2systems': 'co2SystemPanel',
      'irrigation': 'irrigationSystemPanel',
      'controllers': 'environmentalControllerPanel',
      'electrical': 'electricalInfrastructurePanel',
      'benching': 'benchingRackingPanel',
      'unistrut': 'unistrustTool',
      'spectrum': 'spectrumAnalysis',
      'cfd': 'cfdAnalysis',
      'solar': 'solarDLI',
      'environment': 'environmentalIntegration',
      'electrical': 'electricalEstimator',
      'standards': 'standardsCompliance',
      'reports': 'professionalReports'
    };

    if (panelTools[toolId] && onPanelOpen) {
      onPanelOpen(panelTools[toolId]);
    } else if (onToolSelect) {
      onToolSelect(toolId);
    }
  };

  return (
    <div className="h-full bg-gray-900 dark:bg-gray-900 flex flex-col text-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white">Tool Palette</h3>
      </div>

      {/* Tool Categories */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {categories.map(category => {
          const categoryTools = tools.filter(tool => tool.category === category.id);
          const isExpanded = expandedCategories.includes(category.id);
          
          if (categoryTools.length === 0) return null;
          
          return (
            <div key={category.id} className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-2 bg-gray-800 hover:bg-gray-750 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${category.color}`} />
                  <span className="text-sm font-medium text-white">{category.name}</span>
                  <span className="text-xs text-gray-500">({categoryTools.length})</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="p-1 bg-gray-800/50 grid grid-cols-2 gap-1">
                  {categoryTools.map(tool => {
                    const Icon = tool.icon;
                    const isSelected = selectedTool === tool.id;
                    
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleToolClick(tool.id)}
                        className={`p-2 rounded transition-colors group relative ${
                          isSelected 
                            ? 'bg-purple-600 text-white' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                        title={`${tool.name} (${tool.shortcut || 'No shortcut'})`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Icon className="w-5 h-5" />
                          <span className="text-xs">{tool.name}</span>
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                          {tool.description}
                          {tool.shortcut && (
                            <div className="text-gray-400 mt-0.5">Shortcut: {tool.shortcut}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-t border-gray-700 space-y-2">
        <button 
          onClick={() => onPanelOpen?.('fixtureLibrary')}
          className="w-full p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm">Fixture Library</span>
        </button>
        <button 
          onClick={() => onPanelOpen?.('fanLibrary')}
          className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Wind className="w-4 h-4" />
          <span className="text-sm">Fan Library</span>
        </button>
        <button 
          onClick={() => onPanelOpen?.('settings')}
          className="w-full p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
}