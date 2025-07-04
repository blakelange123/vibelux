'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Layers, 
  Calculator, 
  Lightbulb, 
  Settings, 
  Eye,
  Download,
  Zap,
  Brain,
  Users,
  Building,
  Thermometer,
  Droplets,
  Target,
  BarChart3,
  Grid3x3,
  Camera,
  Share2,
  FileText,
  Cpu,
  Database,
  FlaskConical,
  Package,
  Map,
  Shield,
  Bot,
  Atom,
  Microscope,
  Wrench,
  GitBranch,
  Sun,
  Monitor,
  PieChart,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Save,
  Upload,
  Maximize,
  Minimize,
  ChevronLeft,
  Info
} from 'lucide-react';
import { getSolarDataForZipCode, calculateSupplementalLighting, GREENHOUSE_TYPES } from '@/lib/solar-calculations';

export default function AdvancedDesignerPage() {
  const [selectedTool, setSelectedTool] = useState('select');
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [currentMode, setCurrentMode] = useState<'design' | 'analyze' | 'simulate' | 'output'>('design');
  const [selectedCrop, setSelectedCrop] = useState('cannabis');
  const [projectName, setProjectName] = useState('Untitled Project');
  
  // Crop parameter states
  const [targetDLI, setTargetDLI] = useState(40);
  const [targetPPFD, setTargetPPFD] = useState(800);
  const [photoperiod, setPhotoperiod] = useState(12);
  
  // Greenhouse calculation states
  const [zipCode, setZipCode] = useState('');
  const [greenhouseType, setGreenhouseType] = useState('glass');
  const [solarDLI, setSolarDLI] = useState(0);
  const [calculatedPPFD, setCalculatedPPFD] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [useWinterValues, setUseWinterValues] = useState(false);
  const [monthlyDLI, setMonthlyDLI] = useState<number[]>([]);

  // Professional tools categories
  const toolCategories = {
    design: {
      name: 'Design Tools',
      icon: Layers,
      tools: [
        { id: 'select', name: 'Select', icon: Layers },
        { id: 'fixture', name: 'Fixtures', icon: Lightbulb },
        { id: 'array', name: 'Array Tool', icon: Grid3x3 },
        { id: 'ppfd-array', name: 'PPFD Array', icon: Target },
        { id: 'quick-array', name: 'Quick Array', icon: Zap },
        { id: 'batch-placement', name: 'Batch Placement', icon: Package }
      ]
    },
    analysis: {
      name: 'Analysis',
      icon: BarChart3,
      tools: [
        { id: 'photometric', name: 'Photometric Engine', icon: Calculator },
        { id: 'ppfd-mapping', name: 'PPFD Mapping', icon: Map },
        { id: 'thermal', name: 'Thermal Analysis', icon: Thermometer },
        { id: 'spectrum', name: 'Spectrum Analysis', icon: Sun },
        { id: 'cfd', name: 'CFD Analysis', icon: Cpu },
        { id: 'ray-tracing', name: 'Ray Tracing', icon: Eye }
      ]
    },
    equipment: {
      name: 'Equipment',
      icon: Package,
      tools: [
        { id: 'fans', name: 'Fans', icon: Cpu },
        { id: 'dehumidifiers', name: 'Dehumidifiers', icon: Droplets },
        { id: 'hvac', name: 'HVAC Systems', icon: Building },
        { id: 'co2', name: 'CO2 Systems', icon: FlaskConical },
        { id: 'irrigation', name: 'Irrigation', icon: Droplets },
        { id: 'electrical', name: 'Electrical', icon: Zap }
      ]
    },
    automation: {
      name: 'Automation',
      icon: Bot,
      tools: [
        { id: 'ai-assistant', name: 'AI Assistant', icon: Brain },
        { id: 'workflow', name: 'Workflows', icon: GitBranch },
        { id: 'modbus', name: 'Modbus Control', icon: Database },
        { id: 'sensors', name: 'Sensor Fusion', icon: Microscope },
        { id: 'alerts', name: 'Alert System', icon: Shield },
        { id: 'commissioning', name: 'Commissioning', icon: Wrench }
      ]
    }
  };

  // Professional panels
  const professionalPanels = [
    { id: 'project-manager', name: 'Project Manager', icon: FileText, category: 'core' },
    { id: 'fixture-library', name: 'Fixture Library', icon: Database, category: 'core' },
    { id: 'calculations', name: 'Live Calculations', icon: Calculator, category: 'core' },
    { id: 'layers', name: 'Layers', icon: Layers, category: 'core' },
    { id: '3d-visualization', name: '3D Visualization', icon: Monitor, category: 'visualization' },
    { id: 'ppfd-heatmaps', name: 'PPFD Heat Maps', icon: TrendingUp, category: 'visualization' },
    { id: 'thermal-view', name: 'Thermal View', icon: Thermometer, category: 'visualization' },
    { id: 'advanced-3d', name: 'Advanced 3D', icon: Atom, category: 'advanced' },
    { id: 'monte-carlo', name: 'Monte Carlo Simulation', icon: PieChart, category: 'advanced' },
    { id: 'gpu-raytracing', name: 'GPU Ray Tracing', icon: Cpu, category: 'advanced' },
    { id: 'plant-biology', name: 'Plant Biology Integration', icon: FlaskConical, category: 'biology' },
    { id: 'multi-zone', name: 'Multi-Zone Control', icon: Map, category: 'controls' },
    { id: 'research-tools', name: 'Research Tools', icon: Microscope, category: 'research' },
    { id: 'predictive-roi', name: 'Predictive ROI', icon: TrendingUp, category: 'business' },
    { id: 'professional-reports', name: 'Professional Reports', icon: FileText, category: 'output' },
    { id: 'standards-compliance', name: 'Standards Compliance', icon: Shield, category: 'output' },
    { id: 'collaboration', name: 'Real-time Collaboration', icon: Users, category: 'collaboration' }
  ];

  const togglePanel = (panelId: string) => {
    setOpenPanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  // Solar location data
  const [solarLocation, setSolarLocation] = useState('');

  const cropPresets = {
    cannabis: { name: 'Cannabis', dli: 40, ppfd: 800, photoperiod: 12 },
    tomatoes: { name: 'Tomatoes', dli: 25, ppfd: 450, photoperiod: 12 },
    lettuce: { name: 'Lettuce', dli: 14, ppfd: 250, photoperiod: 16 },
    herbs: { name: 'Herbs', dli: 20, ppfd: 350, photoperiod: 16 },
    strawberries: { name: 'Strawberries', dli: 18, ppfd: 300, photoperiod: 16 }
  };

  // Update values when crop selection changes
  useEffect(() => {
    const preset = cropPresets[selectedCrop as keyof typeof cropPresets];
    if (preset) {
      setTargetDLI(preset.dli);
      setTargetPPFD(preset.ppfd);
      setPhotoperiod(preset.photoperiod);
    }
  }, [selectedCrop]);

  // Calculate solar DLI based on ZIP code
  const calculateSolarDLI = async () => {
    if (!zipCode || zipCode.length !== 5) return;
    
    setIsCalculating(true);
    try {
      const solarData = await getSolarDataForZipCode(zipCode);
      setMonthlyDLI(solarData.monthlyDLI);
      setSolarLocation(solarData.location);
      
      // Use winter minimum if selected, otherwise annual average
      const winterDLI = Math.min(...solarData.monthlyDLI);
      const dliToUse = useWinterValues ? winterDLI : solarData.annualAvgDLI;
      setSolarDLI(dliToUse);
      
      // Auto-calculate required PPFD
      calculateRequiredPPFD(dliToUse);
      
    } catch (error) {
      console.error('Error calculating solar DLI:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Calculate required supplemental PPFD
  const calculateRequiredPPFD = (solarDLIValue?: number) => {
    const currentSolarDLI = solarDLIValue || solarDLI;
    if (currentSolarDLI === 0) return;
    
    const transmission = GREENHOUSE_TYPES[greenhouseType as keyof typeof GREENHOUSE_TYPES].transmission;
    const result = calculateSupplementalLighting(
      targetDLI,
      currentSolarDLI,
      transmission,
      photoperiod
    );
    
    setCalculatedPPFD(result.requiredPPFD);
    
    // Auto-update target PPFD if greenhouse calculations are active
    if (currentSolarDLI > 0) {
      setTargetPPFD(result.requiredPPFD);
    }
  };

  // Recalculate PPFD when relevant values change
  useEffect(() => {
    if (solarDLI > 0) {
      calculateRequiredPPFD();
    }
  }, [targetDLI, photoperiod, greenhouseType, solarDLI]);
  
  // Update DLI when switching between winter/annual
  useEffect(() => {
    if (monthlyDLI.length > 0) {
      const winterDLI = Math.min(...monthlyDLI);
      const annualAvgDLI = monthlyDLI.reduce((a, b) => a + b, 0) / monthlyDLI.length;
      const dliToUse = useWinterValues ? winterDLI : annualAvgDLI;
      setSolarDLI(dliToUse);
      calculateRequiredPPFD(dliToUse);
    }
  }, [useWinterValues, monthlyDLI]);

  // Professional interface modes
  const modes = [
    { id: 'design', name: 'Design', icon: Layers, description: 'Create and edit lighting layouts' },
    { id: 'analyze', name: 'Analyze', icon: BarChart3, description: 'Photometric analysis and calculations' },
    { id: 'simulate', name: 'Simulate', icon: Eye, description: 'Real-time simulations and modeling' },
    { id: 'output', name: 'Output', icon: FileText, description: 'Reports and export tools' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Professional Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/design" 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="h-5 w-px bg-gray-600" />
            <input 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent text-lg font-semibold outline-none border-none"
            />
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">ADVANCED</span>
          </div>
          
          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => setCurrentMode(mode.id as any)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                  currentMode === mode.id 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
                title={mode.description}
              >
                <mode.icon className="w-4 h-4" />
                {mode.name}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Professional Tools */}
        <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        }`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            {!sidebarCollapsed && <h3 className="font-semibold">Professional Tools</h3>}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              {sidebarCollapsed ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
            </button>
          </div>

          {sidebarCollapsed ? (
            /* Collapsed Sidebar - Icon Only */
            <div className="p-2 space-y-2">
              {Object.entries(toolCategories).map(([key, category]) => (
                <button
                  key={key}
                  className="w-full p-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                  title={category.name}
                >
                  <category.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          ) : (
            /* Full Sidebar */
            <div className="p-4 space-y-6 overflow-y-auto h-full">
              {/* Tool Categories */}
              {Object.entries(toolCategories).map(([categoryKey, category]) => (
                <div key={categoryKey}>
                  <div className="flex items-center gap-2 mb-3">
                    <category.icon className="w-4 h-4 text-purple-400" />
                    <h4 className="font-medium text-sm text-gray-300">{category.name}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {category.tools.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        className={`p-3 rounded-lg text-xs transition-colors flex flex-col items-center gap-1 ${
                          selectedTool === tool.id 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        <tool.icon className="w-4 h-4" />
                        <span>{tool.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Professional Panels */}
              <div>
                <h4 className="font-medium text-sm text-gray-300 mb-3 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-purple-400" />
                  Professional Panels
                </h4>
                <div className="space-y-1">
                  {professionalPanels.map(panel => (
                    <button
                      key={panel.id}
                      onClick={() => togglePanel(panel.id)}
                      className={`w-full p-2 rounded text-xs text-left transition-colors flex items-center gap-2 ${
                        openPanels[panel.id] 
                          ? 'bg-purple-600 text-white' 
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <panel.icon className="w-3 h-3" />
                      <span className="flex-1">{panel.name}</span>
                      {openPanels[panel.id] ? 
                        <ChevronDown className="w-3 h-3" /> : 
                        <ChevronRight className="w-3 h-3" />
                      }
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Canvas Area */}
        <div className="flex-1 bg-gray-950 relative">
          {/* Canvas Toolbar */}
          <div className="absolute top-4 left-4 bg-gray-800 rounded-lg shadow-lg p-2 flex items-center gap-2 z-10">
            <select 
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-gray-700 text-sm rounded px-2 py-1 border-0"
            >
              {Object.entries(cropPresets).map(([key, preset]) => (
                <option key={key} value={key}>{preset.name}</option>
              ))}
            </select>
            <div className="text-xs text-gray-400">
              DLI: {cropPresets[selectedCrop as keyof typeof cropPresets].dli}
            </div>
          </div>

          {/* Canvas Area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Eye className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Professional Design Canvas</h3>
              <p className="text-gray-400 max-w-lg mb-6">
                Advanced lighting design environment with professional-grade tools for 
                commercial cultivation facilities. All features are available through the tool palette.
              </p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setSelectedTool('fixture')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  Add Fixtures
                </button>
                <button 
                  onClick={() => togglePanel('calculations')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  View Calculations
                </button>
                <Link 
                  href="/calculators"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Open Calculators
                </Link>
              </div>
            </div>
          </div>

          {/* Live Status Indicators */}
          <div className="absolute bottom-4 left-4 bg-gray-800 rounded-lg p-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Live Calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>3D Rendering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>AI Assistant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Properties & Analysis */}
        {!rightPanelCollapsed && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold">Properties & Analysis</h3>
              <button 
                onClick={() => setRightPanelCollapsed(true)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Tabbed Content */}
            <div className="flex-1 overflow-hidden">
              <div className="border-b border-gray-700">
                <div className="flex">
                  <button className="px-4 py-2 text-sm bg-gray-700 text-white">Properties</button>
                  <button className="px-4 py-2 text-sm text-gray-400 hover:text-white">Calculations</button>
                  <button className="px-4 py-2 text-sm text-gray-400 hover:text-white">Analysis</button>
                </div>
              </div>
              
              <div className="p-4 space-y-6 overflow-y-auto">
                {/* Room Configuration */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Room Configuration
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Length (ft)</label>
                        <input type="number" defaultValue="20" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Width (ft)</label>
                        <input type="number" defaultValue="15" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Height (ft)</label>
                      <input type="number" defaultValue="10" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm" />
                    </div>
                  </div>
                </div>

                {/* Crop Settings */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Crop Parameters
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Target DLI</label>
                      <input 
                        type="number" 
                        value={targetDLI}
                        onChange={(e) => setTargetDLI(Number(e.target.value))}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Target PPFD</label>
                      <input 
                        type="number" 
                        value={targetPPFD}
                        onChange={(e) => setTargetPPFD(Number(e.target.value))}
                        min="0"
                        max="2000"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Photoperiod (hours)</label>
                      <input 
                        type="number" 
                        value={photoperiod}
                        onChange={(e) => setPhotoperiod(Number(e.target.value))}
                        min="0"
                        max="24"
                        step="0.5"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm" 
                      />
                    </div>
                  </div>
                </div>

                {/* Greenhouse Calculations */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Greenhouse Settings
                    <div className="group relative">
                      <Info className="w-3 h-3 text-gray-400 cursor-help" />
                      <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-xs rounded-lg p-3 w-64 -right-2 top-5 border border-gray-600">
                        <div className="text-gray-300 space-y-2">
                          <p>Calculate supplemental lighting needs based on:</p>
                          <ul className="list-disc list-inside text-gray-400">
                            <li>Your location's solar radiation</li>
                            <li>Greenhouse material transmission</li>
                            <li>Target DLI for your crop</li>
                            <li>Photoperiod (hours of light)</li>
                          </ul>
                          <p className="mt-2 text-gray-300">The calculator will determine how much artificial light is needed to reach your target DLI.</p>
                        </div>
                      </div>
                    </div>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">ZIP Code</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="Enter ZIP code"
                          maxLength={5}
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm" 
                        />
                        <button 
                          onClick={() => calculateSolarDLI()}
                          disabled={!zipCode || zipCode.length !== 5 || isCalculating}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm transition-colors"
                        >
                          {isCalculating ? 'Loading...' : 'Calculate'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Greenhouse Type</label>
                      <select 
                        value={greenhouseType}
                        onChange={(e) => setGreenhouseType(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                      >
                        {Object.entries(GREENHOUSE_TYPES).map(([key, type]) => (
                          <option key={key} value={key}>
                            {type.name} ({Math.round(type.transmission * 100)}%)
                          </option>
                        ))}
                      </select>
                    </div>
                    {solarDLI > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-gray-400">Calculation Mode</label>
                          <button
                            onClick={() => setUseWinterValues(!useWinterValues)}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                              useWinterValues 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            {useWinterValues ? 'Winter (Worst Case)' : 'Annual Average'}
                          </button>
                        </div>
                        <div className="bg-blue-900/20 border border-blue-700 rounded p-3 text-sm">
                          <div className="text-blue-400 mb-2">Solar Analysis Results:</div>
                          {solarLocation && (
                            <div className="text-xs text-gray-300 mb-2">Location: {solarLocation}</div>
                          )}
                          <div className="space-y-1 text-xs">
                          <div>{useWinterValues ? 'Winter Min' : 'Annual Avg'} Solar DLI: <span className="text-blue-300">{solarDLI.toFixed(1)} mol/m²/day</span></div>
                          <div>After Transmission: <span className="text-blue-300">{(solarDLI * GREENHOUSE_TYPES[greenhouseType as keyof typeof GREENHOUSE_TYPES].transmission).toFixed(1)} mol/m²/day</span></div>
                          <div>Required Supplemental DLI: <span className="text-yellow-300">{Math.max(0, targetDLI - (solarDLI * GREENHOUSE_TYPES[greenhouseType as keyof typeof GREENHOUSE_TYPES].transmission)).toFixed(1)} mol/m²/day</span></div>
                          <div className="mt-2 pt-2 border-t border-blue-700">
                            <div>Recommended PPFD: <span className="text-green-300">{calculatedPPFD} μmol/m²/s</span></div>
                            <div className="text-gray-400 mt-1">
                              Solar provides {Math.round((solarDLI * GREENHOUSE_TYPES[greenhouseType as keyof typeof GREENHOUSE_TYPES].transmission / targetDLI) * 100)}% of target DLI
                            </div>
                          </div>
                        </div>
                      </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Live Metrics */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Live Metrics
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gray-700 rounded p-3">
                      <div className="text-xs text-gray-400">Average PPFD</div>
                      <div className="text-lg font-semibold text-green-400">0 μmol/m²/s</div>
                    </div>
                    <div className="bg-gray-700 rounded p-3">
                      <div className="text-xs text-gray-400">Uniformity Ratio</div>
                      <div className="text-lg font-semibold text-blue-400">0:1</div>
                    </div>
                    <div className="bg-gray-700 rounded p-3">
                      <div className="text-xs text-gray-400">Energy Efficiency</div>
                      <div className="text-lg font-semibold text-purple-400">0 μmol/J</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => togglePanel('photometric')}
                      className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-left transition-colors flex items-center gap-2"
                    >
                      <Calculator className="w-4 h-4" />
                      Run Photometric Analysis
                    </button>
                    <button 
                      onClick={() => togglePanel('3d-visualization')}
                      className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-left transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Generate 3D View
                    </button>
                    <button 
                      onClick={() => togglePanel('professional-reports')}
                      className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-left transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Generate Report
                    </button>
                    <Link 
                      href="/calculators/environmental"
                      className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm text-left transition-colors flex items-center gap-2"
                    >
                      <Target className="w-4 h-4" />
                      Advanced Calculators
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Right Panel Toggle */}
        {rightPanelCollapsed && (
          <button 
            onClick={() => setRightPanelCollapsed(false)}
            className="w-8 bg-gray-800 border-l border-gray-700 flex items-center justify-center hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Panels Notifications */}
      {Object.entries(openPanels).some(([key, isOpen]) => isOpen) && (
        <div className="fixed bottom-4 right-4 bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">Active Professional Panels</h4>
            <button 
              onClick={() => setOpenPanels({})}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {Object.entries(openPanels)
              .filter(([key, isOpen]) => isOpen)
              .map(([key, isOpen]) => {
                const panel = professionalPanels.find(p => p.id === key);
                return panel ? (
                  <div key={key} className="flex items-center gap-2 text-xs text-gray-300">
                    <panel.icon className="w-3 h-3" />
                    <span>{panel.name}</span>
                    <button 
                      onClick={() => togglePanel(key)}
                      className="ml-auto text-gray-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : null;
              })}
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Professional panels are simulated. Use calculators for working tools.
          </div>
        </div>
      )}
    </div>
  );
}