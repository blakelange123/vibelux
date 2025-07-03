'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { FalseColorPPFDMap } from '@/components/FalseColorPPFDMap';
import { 
  Settings,
  Eye,
  Save,
  Download,
  Undo,
  Redo,
  Grid,
  Move,
  RotateCw,
  Plus,
  Layers,
  BarChart3,
  Zap,
  Sun,
  ChevronRight,
  ChevronDown,
  Package,
  Map,
  Activity,
  Calendar,
  Thermometer,
  Droplets,
  Brain,
  TrendingUp,
  FileText,
  HelpCircle,
  X
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  expanded: boolean;
}

export function AdvancedDesignerV2() {
  const [activeTab, setActiveTab] = useState<'design' | 'analyze' | 'optimize' | 'export'>('design');
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [showHelp, setShowHelp] = useState(false);
  const [sidebarSections, setSidebarSections] = useState<Section[]>([
    {
      id: 'room',
      title: 'Room Configuration',
      icon: Package,
      description: 'Set room dimensions and shape',
      expanded: true
    },
    {
      id: 'fixtures',
      title: 'Fixture Library',
      icon: Zap,
      description: 'Browse and select fixtures',
      expanded: true
    },
    {
      id: 'layers',
      title: 'Canopy Layers',
      icon: Layers,
      description: 'Multi-tier growing setup',
      expanded: false
    },
    {
      id: 'environment',
      title: 'Environmental Factors',
      icon: Thermometer,
      description: 'Temperature, humidity, CO2',
      expanded: false
    }
  ]);

  const toggleSection = (sectionId: string) => {
    setSidebarSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  const tools = [
    { id: 'select', icon: Move, tooltip: 'Select & Move (V)' },
    { id: 'place', icon: Plus, tooltip: 'Place Fixture (P)' },
    { id: 'rotate', icon: RotateCw, tooltip: 'Rotate (R)' },
    { id: 'grid', icon: Grid, tooltip: 'Toggle Grid (G)' },
  ];

  const tabs = [
    { id: 'design', label: 'Design', icon: Grid },
    { id: 'analyze', label: 'Analyze', icon: BarChart3 },
    { id: 'optimize', label: 'Optimize', icon: Brain },
    { id: 'export', label: 'Export', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header Toolbar */}
      <div className="bg-gray-900/90 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left: Project Info & Tools */}
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-white">Advanced Lighting Designer</h1>
              
              {/* Tool Selection */}
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                {tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`p-2 rounded transition-colors ${
                      selectedTool === tool.id 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                    title={tool.tooltip}
                  >
                    <tool.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* View Options */}
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center: Tabs */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
                <Undo className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
                <Redo className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-700" />
              <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center gap-2 transition-colors">
                <Save className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700 overflow-y-auto">
          <div className="p-4 space-y-4">
            {sidebarSections.map(section => (
              <div key={section.id} className="bg-gray-800/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-5 h-5 text-purple-400" />
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                      <p className="text-xs text-gray-400">{section.description}</p>
                    </div>
                  </div>
                  {section.expanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                
                {section.expanded && (
                  <div className="p-4 pt-0">
                    {section.id === 'room' && <RoomConfiguration />}
                    {section.id === 'fixtures' && <FixtureLibraryPanel />}
                    {section.id === 'layers' && <CanopyLayersPanel />}
                    {section.id === 'environment' && <EnvironmentalPanel />}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Canvas Area */}
        <div className="flex-1 relative bg-gray-950">
          {activeTab === 'design' && <DesignCanvas selectedTool={selectedTool} />}
          
          {activeTab === 'analyze' && <AnalysisView />}
          {activeTab === 'optimize' && <OptimizationView />}
          {activeTab === 'export' && <ExportView />}
        </div>

        {/* Right Panel: Metrics & Analysis */}
        <div className="w-96 bg-gray-900/50 backdrop-blur-xl border-l border-gray-700 overflow-y-auto">
          <MetricsPanel activeTab={activeTab} />
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}

// Component Panels
function RoomConfiguration() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-400 mb-1 block">Room Shape</label>
        <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
          <option>Rectangle</option>
          <option>Square</option>
          <option>L-Shape</option>
          <option>Custom Polygon</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Width (m)</label>
          <input type="number" defaultValue="10" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Length (m)</label>
          <input type="number" defaultValue="10" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-400 mb-1 block">Mounting Height (m)</label>
        <input type="number" defaultValue="3" step="0.1" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" />
      </div>
    </div>
  );
}

function FixtureLibraryPanel() {
  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search fixtures..."
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400"
      />
      <div className="space-y-2">
        <div className="p-3 bg-gray-700/50 rounded hover:bg-gray-700 transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Fluence SPYDR 2p</p>
              <p className="text-xs text-gray-400">630W • 2.7 PPE</p>
            </div>
            <Plus className="w-4 h-4 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CanopyLayersPanel() {
  return (
    <div className="space-y-3">
      <button className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        Add Layer
      </button>
      <div className="space-y-2">
        <div className="p-3 bg-gray-700/50 rounded">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">Ground Level</p>
            <Eye className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400">Height: 0m • Target: 600 PPFD</p>
        </div>
      </div>
    </div>
  );
}

function EnvironmentalPanel() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-400 mb-1 block">Temperature (°C)</label>
        <input type="number" defaultValue="24" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-400 mb-1 block">Humidity (%)</label>
        <input type="number" defaultValue="65" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-400 mb-1 block">CO2 (ppm)</label>
        <input type="number" defaultValue="1000" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" />
      </div>
    </div>
  );
}

function MetricsPanel({ activeTab }: { activeTab: string }) {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-white">Performance Metrics</h2>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 p-3 rounded">
          <p className="text-xs text-gray-400 mb-1">Avg PPFD</p>
          <p className="text-xl font-bold text-white">0 <span className="text-sm text-gray-400">μmol/m²/s</span></p>
        </div>
        <div className="bg-gray-800/50 p-3 rounded">
          <p className="text-xs text-gray-400 mb-1">Uniformity</p>
          <p className="text-xl font-bold text-white">0% <span className="text-sm text-gray-400">avg/max</span></p>
        </div>
        <div className="bg-gray-800/50 p-3 rounded">
          <p className="text-xs text-gray-400 mb-1">DLI</p>
          <p className="text-xl font-bold text-white">0 <span className="text-sm text-gray-400">mol/m²/d</span></p>
        </div>
        <div className="bg-gray-800/50 p-3 rounded">
          <p className="text-xs text-gray-400 mb-1">Power</p>
          <p className="text-xl font-bold text-white">0 <span className="text-sm text-gray-400">kW</span></p>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Spectrum Analysis</h3>
        <div className="h-48 bg-gray-900/50 rounded flex items-center justify-center">
          <p className="text-gray-500 text-sm">No fixtures placed</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">AI Recommendations</h3>
            <p className="text-xs text-gray-400">Add fixtures to get optimization suggestions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisView() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Lighting Analysis</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">PPFD Distribution</h3>
          <div className="h-64 bg-gray-900/50 rounded"></div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Spectrum Coverage</h3>
          <div className="h-64 bg-gray-900/50 rounded"></div>
        </div>
      </div>
    </div>
  );
}

function OptimizationView() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Design Optimization</h2>
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Auto-Layout Generator</h3>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">
            Generate Optimal Layout
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportView() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Export Options</h2>
      <div className="grid grid-cols-2 gap-6">
        <button className="p-6 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
          <FileText className="w-8 h-8 text-purple-400 mb-3" />
          <p className="text-white font-medium">Export PDF Report</p>
        </button>
        <button className="p-6 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
          <Download className="w-8 h-8 text-purple-400 mb-3" />
          <p className="text-white font-medium">Export Design Files</p>
        </button>
      </div>
    </div>
  );
}

function DesignCanvas({ selectedTool }: { selectedTool: string }) {
  const [roomDimensions, setRoomDimensions] = useState({ width: 10, height: 10 });
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [showPPFDMap, setShowPPFDMap] = useState(true);
  const [ppfdData, setPpfdData] = useState<number[][]>([]);

  // Generate mock PPFD data for demonstration
  useEffect(() => {
    const gridSize = 50;
    const data: number[][] = [];
    
    for (let y = 0; y < gridSize; y++) {
      const row: number[] = [];
      for (let x = 0; x < gridSize; x++) {
        // Create a gradient with hotspots where fixtures would be
        let value = 200; // Base PPFD
        
        // Add contribution from mock fixtures
        fixtures.forEach(fixture => {
          const dx = (x - fixture.x * gridSize) / gridSize;
          const dy = (y - fixture.y * gridSize) / gridSize;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const contribution = 600 * Math.exp(-distance * distance * 10);
          value += contribution;
        });
        
        row.push(Math.min(1000, value));
      }
      data.push(row);
    }
    
    setPpfdData(data);
  }, [fixtures]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool === 'place') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setFixtures([...fixtures, { 
        id: Date.now(), 
        x, 
        y, 
        model: 'Generic 600W LED',
        ppf: 1600
      }]);
    }
  };

  return (
    <div className="absolute inset-0 p-4">
      <div className="relative w-full h-full">
        {showPPFDMap ? (
          <div className="w-full h-full">
            <FalseColorPPFDMap
              width={roomDimensions.width}
              height={roomDimensions.height}
              ppfdData={ppfdData}
              colorScale="turbo"
              showGrid={true}
              showContours={true}
              showLabels={false}
              targetPPFD={600}
            />
            <div 
              className="absolute inset-0 cursor-crosshair" 
              onClick={handleCanvasClick}
            >
              {/* Fixture overlays */}
              {fixtures.map(fixture => (
                <div
                  key={fixture.id}
                  className="absolute w-8 h-8 bg-white/20 border-2 border-white rounded-full"
                  style={{
                    left: `${fixture.x * 100}%`,
                    top: `${fixture.y * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-medium">Design Canvas</p>
              <p className="text-sm mt-2">Click "Place Fixture" to start designing</p>
            </div>
          </div>
        )}
        
        {/* Canvas controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setShowPPFDMap(!showPPFDMap)}
            className={`px-3 py-2 rounded flex items-center gap-2 transition-colors ${
              showPPFDMap 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">PPFD Map</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-purple-400 mb-2">Tools</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Select Tool</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">V</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Place Fixture</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">P</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rotate</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">R</kbd>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-purple-400 mb-2">Actions</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Save Project</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">⌘S</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Undo</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">⌘Z</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Redo</span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">⌘⇧Z</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}