'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Pin,
  PinOff,
  Shield,
  Zap,
  FileText,
  BarChart3,
  Building,
  Sun,
  Globe,
  Move as MoveIcon,
  Layers,
  Target,
  Upload
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

export function ToolPalette({ selectedTool = 'select', onToolSelect, onPanelOpen }: ToolPaletteProps) {
  const [isPinned, setIsPinned] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['select', 'draw', 'lighting']);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 280, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDocked, setIsDocked] = useState<'left' | 'right' | null>(null);
  const [showDropZone, setShowDropZone] = useState<'left' | 'right' | null>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const tools: Tool[] = [
    // Selection & Navigation
    { id: 'select', name: 'Select', icon: MousePointer, category: 'select', shortcut: 'Esc', description: 'Select and move objects' },
    { id: 'pan', name: 'Pan', icon: Move, category: 'select', shortcut: 'Space', description: 'Pan the view' },
    
    // Drawing Tools
    { id: 'line', name: 'Line', icon: Minus, category: 'draw', shortcut: 'L', description: 'Draw lines and walls' },
    { id: 'rectangle', name: 'Rectangle', icon: Square, category: 'draw', shortcut: 'R', description: 'Draw rectangles and rooms' },
    { id: 'circle', name: 'Circle', icon: Circle, category: 'draw', shortcut: 'C', description: 'Draw circles and curved walls' },
    { id: 'text', name: 'Text', icon: Type, category: 'draw', shortcut: 'T', description: 'Add text annotations' },
    
    // Modify Tools
    { id: 'move', name: 'Move', icon: Move, category: 'modify', shortcut: 'M', description: 'Move selected objects' },
    { id: 'rotate', name: 'Rotate', icon: RotateCw, category: 'modify', shortcut: 'RO', description: 'Rotate selected objects' },
    { id: 'copy', name: 'Copy', icon: Copy, category: 'modify', shortcut: 'CO', description: 'Copy selected objects' },
    
    // Measurement Tools
    { id: 'dimension', name: 'Dimension', icon: Ruler, category: 'measure', shortcut: 'D', description: 'Add dimensions' },
    { id: 'measure', name: 'Measure', icon: Ruler, category: 'measure', shortcut: 'ME', description: 'Measure distances' },
    
    // Lighting Tools
    { id: 'fixture', name: 'Add Fixture', icon: Lightbulb, category: 'lighting', shortcut: 'F', description: 'Place lighting fixtures' },
    { id: 'array', name: 'Array Tool', icon: Grid3x3, category: 'lighting', shortcut: 'A', description: 'Create fixture arrays' },
    { id: 'ppfd-array', name: 'PPFD Target', icon: Calculator, category: 'lighting', shortcut: 'P', description: 'Array for target PPFD' },
    { id: 'zone', name: 'Create Zone', icon: Grid3x3, category: 'lighting', shortcut: 'Z', description: 'Create lighting zones' },
    
    // View Tools
    { id: 'zoom-extents', name: 'Zoom Extents', icon: Eye, category: 'view', shortcut: 'ZE', description: 'Zoom to fit all objects' },
    { id: 'false-color', name: 'False Color', icon: Palette, category: 'view', shortcut: 'FC', description: 'Toggle false color view' },
    
    // Analysis Tools
    { id: 'calculate', name: 'Calculate', icon: Calculator, category: 'analyze', shortcut: 'CALC', description: 'Run lighting calculations' },
  ];

  const categories = [
    { id: 'select', name: 'Select', color: 'bg-blue-600' },
    { id: 'draw', name: 'Draw', color: 'bg-green-600' },
    { id: 'modify', name: 'Modify', color: 'bg-yellow-600' },
    { id: 'measure', name: 'Measure', color: 'bg-purple-600' },
    { id: 'lighting', name: 'Lighting', color: 'bg-orange-600' },
    { id: 'view', name: 'View', color: 'bg-cyan-600' },
    { id: 'analyze', name: 'Analyze', color: 'bg-red-600' }
  ];

  const quickActions = [
    { id: 'batchPlacement', name: 'Batch Place', icon: Layers, description: 'Batch Placement Tool' },
    { id: 'fixtureImportWizard', name: 'Import', icon: Upload, description: 'Import Fixtures (IES/DLC)' },
    { id: 'projectManager', name: 'Projects', icon: FolderOpen, description: 'Project Manager' },
    { id: 'facilityDesign', name: 'Facility', icon: Building, description: 'Facility Design Studio' },
    { id: 'photometricEngine', name: 'Analysis', icon: Calculator, description: 'Photometric Engine' },
    { id: 'monteCarloSimulation', name: 'Monte Carlo', icon: Zap, description: 'Monte Carlo Ray-Tracing Simulation' },
    { id: 'gpuRayTracing', name: 'GPU Ray', icon: Zap, description: 'GPU-Accelerated Ray Tracing' },
    { id: 'spectrumAnalysis', name: 'Spectrum', icon: BarChart3, description: 'Spectral Power Distribution Analysis' },
    { id: 'solarDLI', name: 'Solar DLI', icon: Sun, description: 'Solar DLI Calculator' },
    { id: 'environmentalIntegration', name: 'Environment', icon: Globe, description: 'Environmental Integration' },
    { id: 'electricalEstimator', name: 'Electrical', icon: Zap, description: 'Electrical Estimator' },
    { id: 'advancedVisualization', name: 'Render', icon: Palette, description: 'Advanced Visualization' },
    { id: 'professionalReports', name: 'Reports', icon: FileText, description: 'Professional Reports' },
    { id: 'standardsCompliance', name: 'Standards', icon: Shield, description: 'Standards Compliance' },
    { id: 'iesManager', name: 'IES Files', icon: Zap, description: 'IES Manager' }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleToolClick = (toolId: string) => {
    // Special handling for fixture tool
    if (toolId === 'fixture') {
      // Set tool to place mode
      onToolSelect?.('place');
      // Also need to set object type to fixture
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('setObjectType', { detail: 'fixture' }));
      }
    } else if (toolId === 'array') {
      // Open array tool panel
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('openArrayTool'));
      }
    } else if (toolId === 'ppfd-array') {
      // Open PPFD target array tool
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('openPPFDArrayTool'));
      }
    } else {
      onToolSelect?.(toolId);
    }
  };

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'batchPlacement') {
      // Open batch placement tool
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('openBatchPlacementTool'));
      }
    } else {
      onPanelOpen?.(actionId);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if (isDocked) return; // Don't allow dragging when docked
    
    const rect = paletteRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  // Handle drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Check for docking zones
      const rightSidebarWidth = 320; // Width of the calculations panel
      const rightEdge = window.innerWidth - rightSidebarWidth - 100; // Detection zone
      
      if (newX > rightEdge && newY > 200) {
        // Show drop zone indicator
        setShowDropZone('right');
        // Dock to right sidebar below calculations panel
        setIsDocked('right');
        // Position it inside the right sidebar area
        setPosition({ 
          x: window.innerWidth - rightSidebarWidth, // Align with the calculations panel
          y: 500 // Below the calculations panel
        });
      } else if (newX < 300 && newX > 260) {
        // Show drop zone indicator
        setShowDropZone('left');
        // Dock to left sidebar (next to fixture library)
        setIsDocked('left');
        setPosition({ x: 280, y: Math.max(80, newY) });
      } else {
        // Free floating
        setShowDropZone(null);
        setIsDocked(null);
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setShowDropZone(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (isMinimized) {
    return (
      <div 
        ref={paletteRef}
        className="fixed z-50"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'all 0.2s ease'
        }}
      >
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Expand Tool Palette"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Drop zone indicators */}
      {isDragging && showDropZone === 'right' && (
        <div 
          className="fixed bg-purple-500/20 border-2 border-purple-500 border-dashed rounded-lg animate-pulse pointer-events-none"
          style={{
            right: '28px',
            top: '500px',
            width: '264px',
            height: '300px'
          }}
        >
          <div className="flex items-center justify-center h-full text-purple-400 font-medium">
            Drop here to dock
          </div>
        </div>
      )}
      
      {isDragging && showDropZone === 'left' && (
        <div 
          className="fixed left-[280px] top-20 bg-purple-500/20 border-2 border-purple-500 border-dashed rounded-lg animate-pulse pointer-events-none"
          style={{
            width: '264px',
            height: '300px'
          }}
        >
          <div className="flex items-center justify-center h-full text-purple-400 font-medium">
            Drop here to dock
          </div>
        </div>
      )}

      <div 
        ref={paletteRef}
        className={`fixed z-50 ${isPinned ? '' : 'hover:opacity-100 opacity-75'} transition-opacity`}
        style={{ 
          ...(isDocked === 'right' ? {
            right: '28px',
            left: 'auto',
            top: `${position.y}px`,
            width: '264px'
          } : isDocked === 'left' ? {
            left: '280px',
            right: 'auto',
            top: `${position.y}px`,
            width: '264px'
          } : {
            left: `${position.x}px`, 
            top: `${position.y}px`
          }),
          transition: isDragging ? 'none' : 'all 0.2s ease'
        }}
      >
      <div className={`bg-gray-900/95 backdrop-blur-xl border rounded-xl shadow-2xl w-64 max-h-[calc(100vh-100px)] overflow-hidden flex flex-col ${
        isDocked ? 'border-purple-500' : 'border-gray-700'
      } ${isDragging ? 'cursor-grabbing' : ''}`}>
        {/* Header */}
        <div 
          className="p-3 border-b border-gray-700 flex items-center justify-between cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
        >
          <h3 className="text-sm font-semibold text-white select-none">
            Tool Palette
            {isDocked && (
              <span className="text-xs text-purple-400 ml-2">
                (Docked {isDocked})
              </span>
            )}
          </h3>
          <div className="flex gap-1">
            {isDocked && (
              <button
                onClick={() => {
                  setIsDocked(null);
                  setPosition({ x: window.innerWidth / 2 - 132, y: 120 });
                }}
                className="p-1 text-purple-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                title="Undock palette"
              >
                <MoveIcon className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title={isPinned ? "Unpin palette" : "Pin palette"}
            >
              {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Minimize"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
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
                          <Icon className="w-6 h-6 mx-auto mb-1" />
                          <div className="text-sm font-medium truncate">{tool.name}</div>
                          
                          {/* Tooltip */}
                          <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-gray-700">
                            <div className="font-medium">{tool.name}</div>
                            <div className="text-gray-400">{tool.description}</div>
                            {tool.shortcut && (
                              <div className="text-purple-400 mt-1">Shortcut: {tool.shortcut}</div>
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

        {/* Fixture Selector */}
        <div className="p-2 border-t border-gray-700">
          <div className="text-xs font-medium text-gray-400 mb-2">Fixtures</div>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => {
                // Place a basic fixture
                const event = new CustomEvent('setObjectType', { detail: 'fixture' });
                window.dispatchEvent(event);
              }}
              className="p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors group relative"
            >
              <Lightbulb className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-medium">Basic</div>
            </button>
            <button
              onClick={() => {
                // Open fixture library
                onPanelOpen?.('advancedFixtureLibrary');
              }}
              className="p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors group relative"
            >
              <Layers className="w-4 h-4 mx-auto mb-1" />
              <div className="text-xs font-medium">Library</div>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-2 border-t border-gray-700">
          <div className="text-xs font-medium text-gray-400 mb-2">Quick Actions</div>
          <div className="grid grid-cols-3 gap-1">
            {quickActions.map(action => {
              const Icon = action.icon;
              
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors group relative"
                  title={action.description}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-xs font-medium truncate">{action.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}