'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Pencil, BarChart3, Activity, FileDown, 
  Sun, Settings, Save, Upload, Undo, Redo,
  ChevronDown, Sparkles, Zap, Grid3x3,
  Eye, Calculator, Thermometer, Building,
  Leaf, Layers, Share2, HelpCircle, Search,
  BookOpen, Beaker, Info, GitBranch, ClipboardCheck,
  Database, Shield, Bell, Brain, Clock, Globe,
  Home, Tent
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { saveProject, importProject } from '../utils/projectHandlers';
import { cropDatabase, cropCategories, getCropData } from '@/lib/crop-database';
import { CropDetailsModal } from './CropDetailsModal';

interface MinimalTopToolbarProps {
  selectedCrop?: string;
  onCropChange?: (crop: string) => void;
  dliTarget?: number;
  onDliTargetChange?: (value: number) => void;
  cropPresets?: any;
  onModeChange?: (mode: 'design' | 'analyze' | 'simulate' | 'output') => void;
  currentMode?: 'design' | 'analyze' | 'simulate' | 'output';
  photoperiod?: number;
  onPhotoperiodChange?: (value: number) => void;
}

const modeConfigs = {
  design: {
    label: 'Design',
    icon: Pencil,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    actions: [
      { icon: Grid3x3, label: 'Array Tool', action: 'array' },
      { icon: Sparkles, label: 'AI Assistant', action: 'ai-assist' },
      { icon: GitBranch, label: 'Workflows', action: 'workflows' },
      { icon: Layers, label: 'Zones', action: 'zones' },
      { icon: Building, label: 'Import BIM', action: 'import-bim' }
    ]
  },
  analyze: {
    label: 'Analyze',
    icon: BarChart3,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    actions: [
      { icon: Calculator, label: 'Calculations', action: 'calculations' },
      { icon: Database, label: 'Modbus Control', action: 'modbus-control' },
      { icon: Zap, label: 'Power Safety', action: 'power-safety' },
      { icon: Thermometer, label: 'Heat Load', action: 'heat-load' },
      { icon: Shield, label: 'Batch Validation', action: 'batch-validation' },
      { icon: Brain, label: 'Spectrum AI', action: 'spectrum-optimization' }
    ]
  },
  simulate: {
    label: 'Simulate',
    icon: Activity,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    actions: [
      { icon: Activity, label: 'Sensors', action: 'sensors' },
      { icon: Sun, label: 'Light Sim', action: 'light-sim' },
      { icon: Leaf, label: 'Growth Model', action: 'growth' },
      { icon: Eye, label: '3D View', action: '3d-view' },
      { icon: Beaker, label: 'Recipe Sync', action: 'recipe-sync' }
    ]
  },
  output: {
    label: 'Output',
    icon: FileDown,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    actions: [
      { icon: FileDown, label: 'Export', action: 'export' },
      { icon: BarChart3, label: 'Reports', action: 'reports' },
      { icon: ClipboardCheck, label: 'Commissioning', action: 'commissioning' },
      { icon: Share2, label: 'Share', action: 'share' },
      { icon: Bell, label: 'Alerts', action: 'alert-system' }
    ]
  }
};

export function MinimalTopToolbar({
  selectedCrop = 'custom',
  onCropChange,
  dliTarget = 30,
  onDliTargetChange,
  cropPresets,
  onModeChange,
  currentMode = 'design',
  photoperiod = 12,
  onPhotoperiodChange
}: MinimalTopToolbarProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo, updateRoom } = useDesigner();
  const { showNotification } = useNotifications();
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [showCropMenu, setShowCropMenu] = useState(false);
  const [cropSearch, setCropSearch] = useState('');
  const [selectedCropData, setSelectedCropData] = useState(getCropData(selectedCrop));
  const [showCropDetails, setShowCropDetails] = useState(false);
  const [detailsCrop, setDetailsCrop] = useState<string | null>(null);
  const cropMenuRef = useRef<HTMLDivElement>(null);

  // Close crop menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cropMenuRef.current && !cropMenuRef.current.contains(event.target as Node)) {
        setShowCropMenu(false);
      }
    }

    if (showCropMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCropMenu]);

  const currentModeConfig = modeConfigs[currentMode];

  const handleCropChange = (cropKey: string) => {
    const cropData = getCropData(cropKey);
    setSelectedCropData(cropData);
    onCropChange?.(cropKey);
    if (cropData) {
      onDliTargetChange?.(cropData.dli.optimal);
      // Update room with target DLI from crop data
      updateRoom({ 
        targetDLI: cropData.dli.optimal
      });
      showNotification('success', `Selected ${cropData.name} - Target DLI: ${cropData.dli.optimal}`);
    }
    setShowCropMenu(false);
  };

  const handleShowCropDetails = (cropKey: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDetailsCrop(cropKey);
    setShowCropDetails(true);
    setShowCropMenu(false);
  };

  const filteredCrops = cropSearch 
    ? Object.entries(cropDatabase).filter(([key, crop]) => 
        crop.name.toLowerCase().includes(cropSearch.toLowerCase()) ||
        crop.scientificName?.toLowerCase().includes(cropSearch.toLowerCase()) ||
        crop.category.toLowerCase().includes(cropSearch.toLowerCase())
      )
    : Object.entries(cropDatabase);



  const handleSave = () => {
    try {
      if (!state) {
        console.error('State is undefined');
        showNotification('error', 'No project data to save');
        return;
      }
      
      // Make sure we have valid state data
      if (!state.room || !state.objects) {
        console.error('State is missing required properties:', state);
        showNotification('error', 'Invalid project data');
        return;
      }
      
      const project = saveProject(state);
      
      // Also export as a download for backup
      const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibelux-project-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Project saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      showNotification('error', `Failed to save project: ${(error as any)?.message || error}`);
    }
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const project = await importProject(file);
          dispatch({ type: 'LOAD_PROJECT', payload: project.state as any });
          showNotification('success', `Project "${project.name}" loaded successfully`);
        } catch (error) {
          showNotification('error', 'Failed to load project');
        }
      }
    };
    input.click();
  };

  const handleModeAction = (action: string) => {
    // Handle mode-specific actions
    switch (action) {
      // Design mode actions
      case 'array':
        dispatch({ type: 'SET_TOOL', payload: 'array' });
        break;
      case 'ai-assist':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'aiAssistant' }));
        break;
      case 'zones':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'nativeZoneManager' }));
        break;
      case 'import-bim':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'cadTools' }));
        break;
      case 'workflows':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'integratedWorkflows' }));
        break;
        
      // Analyze mode actions
      case 'calculations':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'photometricEngine' }));
        break;
      case 'modbus-control':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'modbusLightingControl' }));
        break;
      case 'heat-load':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'ledThermalManagement' }));
        break;
      case 'power-safety':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'powerSafetyModule' }));
        break;
        
      // Simulate mode actions
      case 'sensors':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'sensorFusionSystem' }));
        break;
      case 'light-sim':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'photometricEngine' }));
        break;
      case 'growth':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'plantBiologyIntegration' }));
        break;
      case '3d-view':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'advanced3DVisualization' }));
        break;
      case 'recipe-sync':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'recipeSyncSystem' }));
        break;
      case 'batch-validation':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'batchValidationSystem' }));
        break;
      case 'alert-system':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'unifiedAlertSystem' }));
        break;
      case 'spectrum-optimization':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'spectrumOptimizationSystem' }));
        break;
        
      // Output mode actions
      case 'export':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'advancedExport' }));
        break;
      case 'reports':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'professionalReports' }));
        break;
      case 'commissioning':
        window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'commissioningWorkflow' }));
        break;
      case 'share':
        handleShareProject();
        break;
        
      default:
        console.warn(`Unknown action: ${action}`);
        showNotification('warning', `Unknown action: ${action}`);
    }
  };
  
  const handleShareProject = () => {
    // Generate shareable link
    const projectData = saveProject(state);
    const encoded = btoa(JSON.stringify(projectData));
    const shareUrl = `${window.location.origin}/shared/${projectData.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      showNotification('success', 'Project link copied to clipboard!');
    }).catch(() => {
      showNotification('error', 'Failed to copy link');
    });
  };

  return (
    <div className="h-14 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 relative z-50">
      {/* Left Section - Logo and Mode Switcher */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Logo - Compact */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Sun className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none">VibeLux</h1>
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">Pro</span>
          </div>
        </div>

        {/* Mode Switcher - Compact */}
        <div className="relative">
          <button
            onClick={() => setShowModeMenu(!showModeMenu)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
              ${currentModeConfig.bgColor} ${currentModeConfig.borderColor}
              border hover:shadow-sm
            `}
          >
            <currentModeConfig.icon className={`w-4 h-4 ${currentModeConfig.color}`} />
            <span className={`text-sm font-medium ${currentModeConfig.color} hidden md:block`}>
              {currentModeConfig.label}
            </span>
            <ChevronDown className={`w-3 h-3 ${currentModeConfig.color} transition-transform ${showModeMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Mode Dropdown */}
          {showModeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]">
              {Object.entries(modeConfigs).map(([mode, config]) => (
                <button
                  key={mode}
                  onClick={() => {
                    onModeChange?.(mode as any);
                    setShowModeMenu(false);
                  }}
                  onMouseEnter={() => setHoveredMode(mode)}
                  onMouseLeave={() => setHoveredMode(null)}
                  className={`
                    w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700
                    ${currentMode === mode ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  `}
                >
                  <config.icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {config.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mode Actions - Compact */}
        <div className="hidden lg:flex items-center gap-1 px-2 border-l border-gray-200 dark:border-gray-700">
          {currentModeConfig.actions.slice(0, 2).map((action) => (
            <button
              key={action.action}
              onClick={() => handleModeAction(action.action)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group relative"
              title={action.label}
            >
              <action.icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 dark:bg-gray-700 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Center Section - Compact */}
      <div className="flex items-center gap-3 flex-1 justify-center max-w-md">
        {/* Room Type Selector */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => {
              dispatch({ type: 'SET_TOOL', payload: 'room' });
              window.dispatchEvent(new CustomEvent('openRoomConfiguration'));
              showNotification('info', 'Configure indoor room settings');
            }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
              state.room?.roomType === 'cultivation' || state.room?.roomType === 'residential' 
                ? 'bg-purple-600 text-white' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Indoor Room"
          >
            <Home className="w-4 h-4" />
            <span className="text-xs font-medium hidden lg:block">Room</span>
          </button>
          <button
            onClick={() => {
              dispatch({ type: 'SET_TOOL', payload: 'greenhouse' });
              window.dispatchEvent(new CustomEvent('openGreenhouseConfiguration'));
              showNotification('info', 'Configure greenhouse settings');
            }}
            className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
              state.room?.roomType === 'greenhouse' 
                ? 'bg-green-600 text-white' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title="Greenhouse"
          >
            <Tent className="w-4 h-4" />
            <span className="text-xs font-medium hidden lg:block">Greenhouse</span>
          </button>
        </div>

        {/* Enhanced Crop Selector */}
        <div className="relative" ref={cropMenuRef}>
          <button
            onClick={() => setShowCropMenu(!showCropMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-sm transition-all"
          >
            <Leaf className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-green-600 dark:text-green-400 font-medium leading-none">Crop</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-none">
                {selectedCropData?.name || 'Custom'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-green-600 dark:text-green-400" />
          </button>

          {/* Enhanced Crop Dropdown */}
          {showCropMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[320px] max-w-[400px] z-[60]">
              {/* Search Bar */}
              <div className="px-3 pb-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search crops..."
                    value={cropSearch}
                    onChange={(e) => setCropSearch(e.target.value)}
                    className="bg-transparent text-sm outline-none flex-1 text-gray-700 dark:text-gray-300"
                  />
                </div>
              </div>

              {/* Custom Option */}
              <button
                onClick={() => handleCropChange('custom')}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">Custom</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Manual DLI settings</div>
                </div>
              </button>

              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

              {/* Crop Categories */}
              <div className="max-h-80 overflow-y-auto">
                {Object.entries(cropCategories).map(([category, cropKeys]) => {
                  // Check if any crops in this category match the filter
                  const visibleCrops = cropKeys.filter(key => 
                    filteredCrops.some(([filteredKey]) => filteredKey === key)
                  );
                  if (visibleCrops.length === 0) return null;

                  return (
                    <div key={category} className="mb-2">
                      {/* Category Header */}
                      <div className="px-3 py-1">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {category}
                        </div>
                      </div>

                      {/* Category Crops */}
                      {visibleCrops.map(cropKey => {
                        const crop = cropDatabase[cropKey];
                        if (!crop) return null;

                        return (
                          <div
                            key={cropKey}
                            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left group cursor-pointer"
                            onClick={() => handleCropChange(cropKey)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <Leaf className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white text-sm">
                                {crop.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {crop.scientificName} • DLI: {crop.dli.optimal}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                {crop.dli.optimal}
                              </div>
                              <button
                                onClick={(e) => handleShowCropDetails(cropKey, e)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                title="View detailed information"
                              >
                                <Info className="w-3 h-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Footer with source info */}
              <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2 px-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3 h-3" />
                    <span>Based on peer-reviewed research</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{Object.keys(cropDatabase).length}</span>
                    <span>crops</span>
                    <span className="mx-1">•</span>
                    <span className="font-medium">{Object.values(cropDatabase).reduce((total, crop) => total + (crop.sources?.length || 0), 0)}</span>
                    <span>studies</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Photoperiod Input */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Hr:</span>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={photoperiod}
            onChange={(e) => onPhotoperiodChange?.(Number(e.target.value))}
            className="w-10 px-1 py-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>PPFD: <strong className="text-gray-800 dark:text-gray-200">{state.calculations?.averagePPFD?.toFixed(0) || 0}</strong></span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span>DLI: <strong className={`${
            ((state.calculations?.averagePPFD || 0) * photoperiod * 0.0036) >= 40 ? 'text-purple-600 dark:text-purple-400' :
            ((state.calculations?.averagePPFD || 0) * photoperiod * 0.0036) >= 30 ? 'text-blue-600 dark:text-blue-400' :
            ((state.calculations?.averagePPFD || 0) * photoperiod * 0.0036) >= 20 ? 'text-green-600 dark:text-green-400' :
            'text-yellow-600 dark:text-yellow-400'
          }`}>{((state.calculations?.averagePPFD || 0) * photoperiod * 0.0036).toFixed(1)}</strong></span>
        </div>

        {/* Solar DLI Button */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'solarDLI' }));
            showNotification('info', 'Solar DLI Calculator opened');
          }}
          className="px-2 py-1 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-md transition-colors flex items-center gap-1.5"
          title="Solar DLI Calculator"
        >
          <Globe className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          <span className="text-xs font-medium text-green-700 dark:text-green-300">Solar</span>
        </button>
      </div>

      {/* Right Section - Compact */}
      <div className="flex items-center gap-1 relative z-50 flex-shrink-0">
        <button
          onClick={handleSave}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Save Project"
          type="button"
        >
          <Save className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={handleLoad}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Open"
        >
          <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30"
          title="Undo"
        >
          <Undo className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-30"
          title="Redo"
        >
          <Redo className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'settings' }));
            showNotification('info', 'Settings panel opened');
          }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('togglePanel', { detail: 'researchAssistant' }));
            showNotification('info', 'Research Assistant opened');
          }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Research Assistant"
        >
          <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={() => {
            window.open('https://vibelux.com/help', '_blank');
          }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Help"
        >
          <HelpCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Crop Details Modal */}
      {showCropDetails && detailsCrop && (
        <CropDetailsModal
          crop={cropDatabase[detailsCrop]}
          isOpen={showCropDetails}
          onClose={() => {
            setShowCropDetails(false);
            setDetailsCrop(null);
          }}
        />
      )}
    </div>
  );
}