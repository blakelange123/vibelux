'use client';

import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { X, Layers, Eye, Building, Settings2, Lightbulb } from 'lucide-react';
import { DesignerProvider, useDesigner } from './context/DesignerContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProfessionalLayout } from './layout/ProfessionalLayout';
import { AIDesignAssistant } from '../AIDesignAssistant';
import { ToolPaletteSidebar } from './tools/ToolPaletteSidebar';
import { CompactPropertiesPanel } from './panels/CompactPropertiesPanel';
import { CompactCalculationsPanel } from './panels/CompactCalculationsPanel';
import { SimpleCanvas2D } from './canvas/SimpleCanvas2D';
import { dlcFixturesDatabase } from '@/lib/dlc-fixtures-data';
import { SplitViewLayout } from './layout/SplitViewLayout';
import { MinimalTopToolbar } from './panels/MinimalTopToolbar';
import { ArrayTool } from './tools/ArrayTool';
import { useSelectedObject } from './context/DesignerContext';
import { ElectricalEstimatorPanel } from './panels/ElectricalEstimatorPanel';
import { SolarDLIPanel } from './panels/SolarDLIPanel';
import { EnvironmentalIntegrationPanel } from './panels/EnvironmentalIntegrationPanel';
import { FixtureLibraryCompact } from './panels/FixtureLibraryCompact';
import { LayersPanel } from './panels/LayersPanel';
import { RoomConfigurationPanel } from './panels/RoomConfigurationPanel';
import { GreenhouseConfigurationPanel } from './panels/GreenhouseConfigurationPanel';
import { useCalculations } from './hooks/useCalculations';
import { PPFDTargetArrayTool } from './tools/PPFDTargetArrayTool';
import { BatchPlacementTool } from './tools/BatchPlacementTool';
import { 
  Advanced3DVisualizationPanel,
  AdvancedPPFDMappingPanel,
  LEDThermalManagementPanel,
  PlantBiologyIntegrationPanel,
  MultiZoneControlSystemPanel,
  ResearchPropagationToolsPanel,
  GPURayTracingPanel
} from './panels/AdvancedPanels';
import { MonteCarloRayTracingPanel } from './panels/MonteCarloRayTracingPanel';
import { PredictiveROIModule } from './panels/PredictiveROIModule';
import { FixtureImportWizard } from './panels/FixtureImportWizard';
import { ErrorBoundary } from './utils/ErrorBoundary';
import { FanLibraryPanel } from './panels/FanLibraryPanel';
import { DehumidifierLibraryPanel } from './panels/DehumidifierLibraryPanel';
import { CO2SystemPanel } from './panels/CO2SystemPanel';
import { HVACSystemPanel } from './panels/HVACSystemPanel';
import { IrrigationSystemPanel } from './panels/IrrigationSystemPanel';
import { EnvironmentalControllerPanel } from './panels/EnvironmentalControllerPanel';
import { ElectricalInfrastructurePanel } from './panels/ElectricalInfrastructurePanel';
import { BenchingRackingPanel } from './panels/BenchingRackingPanel';
import { QuickArrayTool } from './tools/QuickArrayTool';
import { UnistrustTool } from './tools/UnistrustTool';
import { IESLightDistributionComparison } from '../IESLightDistributionComparison';
import { WorkflowSelector } from './workflows/IntegratedWorkflows';
import { PowerSafetyModule } from './panels/PowerSafetyModule';
import { CommissioningWorkflow } from './panels/CommissioningWorkflow';
import { NativeZoneManager } from './panels/NativeZoneManager';
import { SensorFusionSystem } from './panels/SensorFusionSystem';
import { ModbusLightingControlPanel } from './panels/ModbusLightingControl';
import { RecipeSyncSystem } from './panels/RecipeSyncSystem';
import { BatchValidationSystem } from './panels/BatchValidationSystem';
import { UnifiedAlertSystem } from './panels/UnifiedAlertSystem';
import { SpectrumOptimizationSystem } from './panels/SpectrumOptimizationSystem';
import { ResearchAssistantPanel } from './panels/ResearchAssistantPanel';

// Lazy load heavy components
import dynamic from 'next/dynamic';
import { FixtureSelectionModal } from './modals/FixtureSelectionModal';
import type { FixtureModel } from '@/components/FixtureLibrary';

const CADToolsPanel = dynamic(() => import('./tools/CADToolsPanel').then(mod => ({ default: mod.CADToolsPanel })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading CAD Tools...</div>
});

const PhotometricEngine = dynamic(() => import('./calculations/PhotometricEngine').then(mod => ({ default: mod.PhotometricEngine })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading Photometric Engine...</div>
});

const AdvancedVisualizationPanel = dynamic(() => import('./visualization/AdvancedVisualizationPanel').then(mod => ({ default: mod.AdvancedVisualizationPanel })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading Visualization...</div>
});

const ProfessionalReports = dynamic(() => import('./reporting/ProfessionalReports').then(mod => ({ default: mod.ProfessionalReports })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading Reports...</div>
});

const StandardsCompliance = dynamic(() => import('./compliance/StandardsCompliancePanel').then(mod => ({ default: mod.StandardsCompliancePanel })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading Standards...</div>
});

const IESManager = dynamic(() => import('./photometric/IESManagerPanel').then(mod => ({ default: mod.IESManagerPanel })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading IES Manager...</div>
});

const SpectrumAnalysis = dynamic(() => import('./panels/SpectralAnalysisPanel').then(mod => ({ default: mod.SpectralAnalysisPanel })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading Spectrum Analysis...</div>
});

const MonteCarloSimulation = dynamic(() => import('./panels/MonteCarloSimulationPanel').then(mod => ({ default: mod.MonteCarloSimulationPanel })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading Monte Carlo Simulation...</div>
});

const ProjectManager = dynamic(() => import('./project/ProjectManager').then(mod => ({ default: mod.ProjectManager })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading Project Manager...</div>
});

const FacilityDesignStudio = dynamic(() => import('./features/FacilityDesignStudio').then(mod => ({ default: mod.FacilityDesignStudio })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading Facility Design Studio...</div>
});

const CFDAnalysisPanel = dynamic(() => import('./panels/CFDAnalysisPanel').then(mod => ({ default: mod.CFDAnalysisPanel })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading CFD Analysis...</div>
});

// Compact fixture library panel is now imported from ./panels/FixtureLibraryCompact

function ProfessionalDesignerContent() {
  const { state, dispatch, undo, redo, canUndo, canRedo, showNotification, updateRoom } = useDesigner();
  const { ui, calculations, objects, room } = state;
  
  // Monitor objects array changes for debugging Apply Design
  useEffect(() => {
  }, [objects]);
  const [selectedTool, setSelectedTool] = useState('select');
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [showFixtureSelection, setShowFixtureSelection] = useState(false);
  
  // Enable live PPFD calculations
  const { recalculate, isCalculating } = useCalculations();
  
  // Crop presets and DLI target
  const [selectedCrop, setSelectedCrop] = useState('custom');
  const [dliTarget, setDliTarget] = useState(30);
  const [photoperiod, setPhotoperiod] = useState(12);
  const [currentMode, setCurrentMode] = useState<'design' | 'analyze' | 'simulate' | 'output'>('design');
  
  // Crop preset configurations
  const cropPresets = {
    lettuce: { name: 'Lettuce', dli: 14, ppfd: 250, photoperiod: 16, spectrum: { red: 65, blue: 25, green: 10 } },
    tomatoes: { name: 'Tomatoes', dli: 25, ppfd: 450, photoperiod: 12, spectrum: { red: 70, blue: 20, green: 10 } },
    cannabis: { name: 'Cannabis', dli: 40, ppfd: 800, photoperiod: 12, spectrum: { red: 60, blue: 30, green: 10 } },
    herbs: { name: 'Herbs', dli: 20, ppfd: 350, photoperiod: 16, spectrum: { red: 60, blue: 30, green: 10 } },
    strawberries: { name: 'Strawberries', dli: 18, ppfd: 300, photoperiod: 16, spectrum: { red: 75, blue: 20, green: 5 } },
    custom: { name: 'Custom', dli: 30, ppfd: 500, photoperiod: 12, spectrum: { red: 65, blue: 25, green: 10 } }
  };
  
  // Handle crop change
  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop);
    const preset = cropPresets[crop as keyof typeof cropPresets];
    if (preset) {
      setDliTarget(preset.dli);
      setPhotoperiod(preset.photoperiod);
      
      // Update room with target DLI from preset
      updateRoom({ 
        targetDLI: preset.dli
      });
      
      // Trigger recalculation to update metrics
      recalculate();
      
      // Show notification
      showNotification('success', `Applied ${preset.name} preset: ${preset.dli} DLI target, ${preset.photoperiod}h photoperiod`);
    }
  };

  // Handle mode changes
  React.useEffect(() => {
    // Update UI based on current mode
    switch (currentMode) {
      case 'design':
        // Focus on design tools
        dispatch({ type: 'SET_TOOL', payload: 'select' });
        break;
      case 'analyze':
        // Show analysis panels
        setOpenPanels(prev => ({ ...prev, calculations: true, photometricEngine: true }));
        break;
      case 'simulate':
        // Enable simulation features
        // dispatch({ type: 'UPDATE_UI', payload: { showRealTimeSimulation: true } });
        break;
      case 'output':
        // Show output/export panels
        setOpenPanels(prev => ({ ...prev, professionalReports: true }));
        break;
    }
  }, [currentMode, dispatch]);

  // Define togglePanel function with useCallback to prevent infinite loops
  const togglePanel = useCallback((panelId: string) => {
    setOpenPanels(prev => {
      const newState = {
        ...prev,
        [panelId]: !prev[panelId]
      };
      return newState;
    });
  }, []); // Empty dependency array since we're using functional setState

  // Listen for custom events
  React.useEffect(() => {
    const handleSetObjectType = (e: CustomEvent) => {
      dispatch({ type: 'SET_OBJECT_TYPE', payload: e.detail });
    };
    const handleOpenArrayTool = () => {
      setOpenPanels(prev => ({ ...prev, arrayTool: true }));
    };
    const handleOpenPPFDArrayTool = () => {
      setOpenPanels(prev => ({ ...prev, ppfdArrayTool: true }));
    };
    const handleOpenBatchPlacementTool = () => {
      setOpenPanels(prev => ({ ...prev, batchPlacement: true }));
    };
    const handleTogglePanel = (e: CustomEvent) => {
      const panelId = e.detail;
      if (panelId && typeof panelId === 'string') {
        togglePanel(panelId);
      }
    };
    const handleOpenRoomConfiguration = () => {
      setOpenPanels(prev => ({ ...prev, roomConfiguration: true }));
    };
    const handleOpenGreenhouseConfiguration = () => {
      setOpenPanels(prev => ({ ...prev, greenhouseConfiguration: true }));
    };
    window.addEventListener('setObjectType', handleSetObjectType as EventListener);
    window.addEventListener('openArrayTool', handleOpenArrayTool);
    window.addEventListener('openPPFDArrayTool', handleOpenPPFDArrayTool);
    window.addEventListener('openBatchPlacementTool', handleOpenBatchPlacementTool);
    window.addEventListener('togglePanel', handleTogglePanel as EventListener);
    window.addEventListener('openRoomConfiguration', handleOpenRoomConfiguration);
    window.addEventListener('openGreenhouseConfiguration', handleOpenGreenhouseConfiguration);
    return () => {
      window.removeEventListener('setObjectType', handleSetObjectType as EventListener);
      window.removeEventListener('openArrayTool', handleOpenArrayTool);
      window.removeEventListener('openPPFDArrayTool', handleOpenPPFDArrayTool);
      window.removeEventListener('openBatchPlacementTool', handleOpenBatchPlacementTool);
      window.removeEventListener('togglePanel', handleTogglePanel as EventListener);
      window.removeEventListener('openRoomConfiguration', handleOpenRoomConfiguration);
      window.removeEventListener('openGreenhouseConfiguration', handleOpenGreenhouseConfiguration);
    };
  }, [dispatch, togglePanel]);

  // Create emergency sidebar toggle button
  React.useEffect(() => {
    // Check if button already exists
    if (document.querySelector('.sidebar-emergency-toggle')) {
      return;
    }
    
    // Create toggle button
    const button = document.createElement('button');
    button.className = 'sidebar-emergency-toggle';
    button.textContent = 'Toggle Sidebar';
    
    // Toggle function
    const toggleSidebar = () => {
      setSidebarHidden(prev => !prev);
      document.body.classList.toggle('hide-sidebar');
      const isHidden = document.body.classList.contains('hide-sidebar');
      button.textContent = isHidden ? 'Show Sidebar' : 'Hide Sidebar';
    };
    
    // Add click handler
    button.onclick = toggleSidebar;
    
    // Add to page
    document.body.appendChild(button);
    
    // Also add keyboard shortcut (Alt+S)
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Cleanup
    return () => {
      button.remove();
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  // Add keyboard shortcuts for undo/redo and layers
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is typing in an input field
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true';
      
      // Check for Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
      }
      // Check for Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y for redo
      else if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') || 
               ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
      // Check for 'L' key to toggle layers panel - only if not typing in input
      else if (e.key === 'l' && !e.metaKey && !e.ctrlKey && !e.altKey && !isInputField) {
        e.preventDefault();
        togglePanel('layers');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo, togglePanel]);

  // Add reset designer event listener
  React.useEffect(() => {
    const handleResetDesigner = () => {
      dispatch({ type: 'RESET' });
    };
    
    window.addEventListener('resetDesigner', handleResetDesigner);
    return () => {
      window.removeEventListener('resetDesigner', handleResetDesigner);
    };
  }, [dispatch]);

  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    photometricEngine: false,
    advancedVisualization: false,
    projectManager: false,
    cadTools: false,
    professionalReports: false,
    standardsCompliance: false,
    iesManager: false,
    spectrumAnalysis: false,
    monteCarloSimulation: false,
    arrayTool: false,
    ppfdArrayTool: false,
    batchPlacement: false,
    quickArrayTool: false,
    electricalEstimator: false,
    environmentalIntegration: false,
    solarDLI: false,
    // Advanced dropdown panels
    advanced3DVisualization: false,
    advancedPPFDMapping: false,
    ledThermalManagement: false,
    plantBiologyIntegration: false,
    multiZoneControlSystem: false,
    researchPropagationTools: false,
    facilityDesign: false,
    cfdAnalysis: false,
    predictiveROI: false,
    fixtureImportWizard: false,
    monteCarloRayTracing: false,
    gpuRayTracing: false, // Add GPU ray tracing panel
    layers: false, // Add layers panel
    settings: false, // Add settings panel
    aiAssistant: false, // Add AI assistant panel
    roomConfig: false, // Add room configuration panel
    greenhouseConfig: false, // Add greenhouse configuration panel
    fanLibrary: false, // Add fan library panel
    dehumidifierLibrary: false, // Add dehumidifier library panel
    co2SystemPanel: false, // Add CO2 system panel
    hvacSystemPanel: false, // Add HVAC system panel
    irrigationSystemPanel: false, // Add irrigation system panel
    environmentalControllerPanel: false, // Add environmental controller panel
    electricalInfrastructurePanel: false, // Add electrical infrastructure panel
    benchingRackingPanel: false, // Add benching & racking panel
    unistrustTool: false, // Add unistrut tool
    integratedWorkflows: false, // Add integrated workflows panel
    powerSafetyModule: false, // Add power safety module
    commissioningWorkflow: false, // Add commissioning workflow
    nativeZoneManager: false, // Add native zone manager
    sensorFusionSystem: false, // Add sensor fusion system
    modbusLightingControl: false, // Add modbus lighting control
    recipeSyncSystem: false, // Add recipe sync system
    batchValidationSystem: false, // Add batch validation system
    unifiedAlertSystem: false, // Add unified alert system
    spectrumOptimizationSystem: false, // Add spectrum optimization system
    researchAssistant: false // Add research assistant panel
  });
  
  const selectedObject = useSelectedObject();
  
  // Handle fixture selection from modal
  const handleFixtureSelection = (fixture: FixtureModel) => {
    // Set the selected fixture in state
    dispatch({ type: 'SET_SELECTED_FIXTURE_MODEL', payload: fixture });
    dispatch({ type: 'SET_SELECTED_FIXTURE', payload: fixture });
    dispatch({ type: 'SET_TOOL', payload: 'place' });
    setShowFixtureSelection(false);
    
    // Show notification
    showNotification('info', `Click on the canvas to place ${fixture.brand} ${fixture.model}`);
  };
  
  // Transform calculations data for CompactCalculationsPanel
  const getCalculationResults = () => {
    const fixtures = objects.filter(obj => obj.type === 'fixture' && obj.enabled);
    const totalWattage = fixtures.reduce((sum, f) => sum + ((f as any).model?.wattage || 600), 0);
    const totalPPF = fixtures.reduce((sum, f) => sum + ((f as any).model?.ppf || 1000), 0);
    const energyDensity = room?.width && room?.length ? totalWattage / (room.width * room.length) : 0;
    const efficacy = totalWattage > 0 ? totalPPF / totalWattage : 0;
    
    // Determine compliance status
    let compliance: {
      status: 'pass' | 'fail' | 'warning';
      standard: string;
      message: string;
    } = {
      status: 'pass',
      standard: 'Horticultural Standards',
      message: 'All requirements met'
    };
    
    if (calculations.averagePPFD < 200) {
      compliance = {
        status: 'fail',
        standard: 'Minimum PPFD Requirements',
        message: 'PPFD below minimum threshold (200 µmol/m²/s)'
      };
    } else if (calculations.uniformity < 0.7) {
      compliance = {
        status: 'warning',
        standard: 'Uniformity Standards',
        message: 'Uniformity below recommended threshold (70%)'
      };
    }
    
    return {
      averagePPFD: calculations.averagePPFD,
      uniformity: calculations.uniformity,
      dli: calculations.dli,
      energyDensity: energyDensity,
      efficacy: efficacy,
      totalFixtures: fixtures.length,
      totalWattage: totalWattage,
      compliance
    };
  };

  // Handle fixture drop from library
  const handleFixtureDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fixtureData = e.dataTransfer.getData('fixture');
    if (fixtureData) {
      const fixture = JSON.parse(fixtureData);
      // Set tool to place mode with fixture type
      dispatch({ type: 'SET_TOOL', payload: 'place' });
      dispatch({ type: 'SET_OBJECT_TYPE', payload: 'fixture' });
      // Store the selected fixture data for placement
      dispatch({ type: 'SET_SELECTED_FIXTURE', payload: fixture });
    }
  }, [dispatch]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  // Define persistent panels
  const leftPanels = [
    // Temporarily disable fixture library to see canvas
    // {
    //   id: 'fixtures',
    //   title: 'Fixture Library',
    //   component: FixtureLibraryCompact,
    //   defaultWidth: 280,
    //   position: 'left' as const,
    //   collapsible: true,
    //   resizable: true
    // }
  ];

  const rightPanels = [
    ...(selectedObject ? [{
      id: 'properties',
      title: 'Properties',
      component: () => <CompactPropertiesPanel selectedObject={selectedObject} />,
      defaultWidth: 300,
      position: 'right' as const,
      collapsible: true,
      resizable: true
    }] : []),
    {
      id: 'calculations',
      title: 'Calculations',
      component: () => (
        <CompactCalculationsPanel 
          results={getCalculationResults()}
          isCalculating={isCalculating}
          onViewDetails={() => togglePanel('photometricEngine')}
          onCalculate={recalculate}
          onExport={() => togglePanel('professionalReports')}
        />
      ),
      defaultWidth: 320,
      position: 'right' as const,
      collapsible: true,
      resizable: true
    }
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gray-900 text-white">
      {/* Minimal Top Toolbar with grouped actions */}
      <MinimalTopToolbar 
        selectedCrop={selectedCrop} 
        onCropChange={handleCropChange}
        dliTarget={dliTarget}
        onDliTargetChange={setDliTarget}
        cropPresets={cropPresets}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        photoperiod={photoperiod}
        onPhotoperiodChange={setPhotoperiod}
      />

      {/* Main Layout - Bypassing ProfessionalLayout for now */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tool Palette - Left Side */}
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0">
          <ToolPaletteSidebar 
            selectedTool={ui.selectedTool}
            onToolSelect={(tool) => {
              // If fixture placement tool is selected, show fixture selection modal
              if (tool === 'place') {
                setShowFixtureSelection(true);
              } else {
                dispatch({ type: 'SET_TOOL', payload: tool });
              }
            }}
            onPanelOpen={togglePanel}
          />
        </div>
        {/* Main Canvas with Split View */}
        <div 
          className="flex-1 relative"
          style={{ backgroundColor: '#1f2937' }}
          onDrop={handleFixtureDrop}
          onDragOver={handleDragOver}
        >
          {/* Canvas area with 2D/3D split view */}
          <div className="w-full h-full bg-gray-700">
            <ErrorBoundary>
              <SplitViewLayout />
            </ErrorBoundary>
          </div>
          
          {/* Fixture Placement Guide */}
          {ui.selectedTool === 'place' && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg border border-purple-500 flex items-center gap-2 animate-bounce">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {state.selectedFixture 
                    ? 'Click on the canvas to place your fixture' 
                    : 'Select a fixture from the library first'
                  }
                </span>
              </div>
            </div>
          )}

          {/* Layers Panel - Toggleable */}
          {openPanels.layers && (
            <div className="absolute left-4 top-20 w-72 h-[calc(100vh-200px)] z-40">
              <LayersPanel />
            </div>
          )}
          
          {/* Status Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4 text-xs text-gray-400">
            <div className="flex gap-4">
              <button
                onClick={() => togglePanel('layers')}
                className={`flex items-center gap-1 hover:text-white transition-colors ${openPanels.layers ? 'text-purple-400' : ''}`}
                title="Toggle Layers Panel (L)"
              >
                <Layers className="w-3 h-3" />
                <span>Layers</span>
              </button>
              <button
                onClick={() => togglePanel('roomConfig')}
                className="flex items-center gap-1 hover:text-white transition-colors"
                title="Room Configuration"
              >
                <Building className="w-3 h-3" />
                <span>Room: {room ? `${room.width}×${room.length} ft` : 'None'}</span>
              </button>
              <span>Grid: 1 ft</span>
              <span>Tool: {ui.selectedTool}</span>
            </div>
            <div className="flex gap-4">
              <span>Zoom: 100%</span>
              <span>Objects: {state.objects.length}</span>
              <span>Ready</span>
              <button
                onClick={() => togglePanel('standardsCompliance')}
                className="text-purple-400 hover:text-purple-300 ml-2"
              >
                Standards
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Add Fixture Button */}
        <button
          onClick={() => {
            // Expand right panel if collapsed
            if (rightPanelCollapsed) {
              setRightPanelCollapsed(false);
            }
            // Scroll to fixture library
            setTimeout(() => {
              const fixtureLibrary = document.querySelector('#fixture-library-section');
              if (fixtureLibrary) {
                fixtureLibrary.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }}
          className="absolute bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-purple-600/50 transition-all transform hover:scale-110 flex items-center justify-center group z-40"
          title="Add Fixture"
        >
          <span className="text-2xl">+</span>
          <span className="absolute -top-10 right-0 bg-gray-800 text-white px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Add Fixture
          </span>
        </button>
        
        {/* Right Panel - Properties & Calculations (Collapsible) */}
        <div 
          className={`bg-gray-900 border-l border-gray-700 transition-all duration-300 relative ${
            rightPanelCollapsed ? 'w-12' : ''
          } ${selectedObject ? 'ring-2 ring-purple-500/20' : ''}`}
          style={{ width: rightPanelCollapsed ? '48px' : `${rightPanelWidth}px` }}
        >
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 hover:bg-gray-700 p-1.5 rounded-l-lg border border-r-0 border-gray-700 z-10"
            title={rightPanelCollapsed ? "Expand panel" : "Collapse panel"}
          >
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={rightPanelCollapsed ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
          
          {/* Resize Handle */}
          {!rightPanelCollapsed && (
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-purple-500 bg-transparent transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = rightPanelWidth;
                
                const handleMouseMove = (e: MouseEvent) => {
                  const newWidth = startWidth - (e.clientX - startX);
                  setRightPanelWidth(Math.max(200, Math.min(600, newWidth)));
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          )}
          
          {/* Panel Content */}
          <div className={`overflow-y-auto h-full ${rightPanelCollapsed ? 'hidden' : ''}`}>
            {/* No Selection Message */}
            {!selectedObject && (
              <div className="p-4 text-center text-gray-500 border-b border-gray-700">
                <div className="mb-2">
                  <Settings2 className="w-8 h-8 mx-auto opacity-50" />
                </div>
                <p className="text-sm">No object selected</p>
                <p className="text-xs mt-1">Click on a rectangle or fixture to edit its properties</p>
              </div>
            )}
            
            {/* Properties Panel - Shows when object is selected */}
            {selectedObject && (
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white mb-4 font-semibold flex items-center justify-between">
                  Properties
                  <span className="text-xs text-gray-400">ID: {selectedObject.id}</span>
                </h3>
                <CompactPropertiesPanel 
                  selectedObject={selectedObject}
                  onPropertyChange={(property, value) => {
                    // Update the object property
                    dispatch({
                      type: 'UPDATE_OBJECT',
                      payload: {
                        id: selectedObject.id,
                        updates: { [property.toLowerCase()]: value }
                      }
                    });
                  }}
                  onObjectAction={(action) => {
                    switch (action) {
                      case 'delete':
                        dispatch({ type: 'DELETE_OBJECT', payload: selectedObject.id });
                        showNotification?.('success', 'Object deleted');
                        break;
                      case 'duplicate':
                        // Create a duplicate with offset position
                        const duplicatedObject = {
                          ...selectedObject,
                          id: `${selectedObject.type}_${Date.now()}`,
                          x: selectedObject.x + 2, // Offset by 2 feet
                          y: selectedObject.y + 2,
                          customName: selectedObject.customName ? `${selectedObject.customName} Copy` : undefined
                        };
                        dispatch({ type: 'ADD_OBJECT', payload: duplicatedObject });
                        // Select the new object
                        dispatch({ type: 'SELECT_OBJECT', payload: duplicatedObject.id });
                        showNotification?.('success', 'Object duplicated');
                        break;
                      case 'copy':
                        // Copy object data to clipboard
                        const objectData = JSON.stringify(selectedObject, null, 2);
                        navigator.clipboard.writeText(objectData).then(() => {
                          showNotification?.('success', 'Object copied to clipboard');
                        }).catch(err => {
                          console.error('Failed to copy:', err);
                          showNotification?.('error', 'Failed to copy to clipboard');
                        });
                        break;
                      case 'focus':
                        // Focus/center the canvas on the selected object
                        // This would typically involve updating the canvas pan/zoom to center on the object
                        // For now, we'll dispatch a custom event that the Canvas2D can listen for
                        const focusEvent = new CustomEvent('focusOnObject', { 
                          detail: { 
                            x: selectedObject.x, 
                            y: selectedObject.y,
                            objectId: selectedObject.id 
                          } 
                        });
                        window.dispatchEvent(focusEvent);
                        showNotification?.('info', 'Centered on object');
                        break;
                    }
                  }}
                />
              </div>
            )}
            
            {/* Fixture Library - Moved to top for better visibility */}
            <div 
              id="fixture-library-section" 
              className={`border-b border-gray-700 transition-all duration-300 ${
                ui.selectedTool === 'place' 
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-gradient-to-r from-purple-900/40 to-blue-900/40' 
                  : ''
              }`}
            >
              <div className={`p-4 ${
                ui.selectedTool === 'place' 
                  ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-purple-500/30' 
                  : 'bg-gradient-to-r from-purple-900/30 to-blue-900/30'
              }`}>
                <h3 className="text-white mb-2 font-semibold flex items-center gap-2">
                  <span className="text-purple-400 text-xl">💡</span> 
                  Fixture Library
                  {ui.selectedTool === 'place' && (
                    <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      Active
                    </span>
                  )}
                </h3>
                <p className={`text-xs mb-3 ${
                  ui.selectedTool === 'place' 
                    ? 'text-purple-200 font-medium' 
                    : 'text-gray-400'
                }`}>
                  {ui.selectedTool === 'place' 
                    ? '🎯 Select a fixture below to place it in your design' 
                    : 'Select a fixture below, then click "Place Fixture" to add it to your design'
                  }
                </p>
              </div>
              <div className={`overflow-y-auto transition-all duration-300 ${
                ui.selectedTool === 'place' ? 'max-h-[600px]' : 'max-h-[400px]'
              }`}>
                <FixtureLibraryCompact />
              </div>
            </div>
            
            {/* Calculations Panel */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white mb-4 font-semibold">Calculations</h3>
              <CompactCalculationsPanel 
                results={getCalculationResults()}
                isCalculating={isCalculating}
                onViewDetails={() => togglePanel('photometricEngine')}
                onCalculate={recalculate}
                onExport={() => togglePanel('professionalReports')}
              />
            </div>

            {/* IES Light Distribution Comparison */}
            <div className="p-4">
              <h3 className="text-white mb-4 font-semibold flex items-center gap-2">
                <span className="text-yellow-400">📊</span> Light Distribution Analysis
              </h3>
              <IESLightDistributionComparison />
            </div>
          </div>
          
          {/* Collapsed State Icons */}
          {rightPanelCollapsed && (
            <div className="flex flex-col items-center gap-4 mt-4">
              {selectedObject && (
                <div className="text-gray-500 -rotate-90 whitespace-nowrap text-xs mb-8">
                  Properties
                </div>
              )}
              <div className="text-gray-500 -rotate-90 whitespace-nowrap text-xs">
                Calculations
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Panels */}
      {openPanels.photometricEngine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[90vh] overflow-auto relative">
            <div className="p-6">
              <PhotometricEngine onClose={() => togglePanel('photometricEngine')} />
            </div>
          </div>
        </div>
      )}

      {openPanels.advancedVisualization && (
        <div className="fixed inset-0 bg-black/50 flex z-50">
          <div className="flex-1" onClick={() => togglePanel('advancedVisualization')} />
          <div className="bg-gray-900 h-full border-l border-gray-700 relative">
            <button
              onClick={() => togglePanel('advancedVisualization')}
              className="absolute top-4 left-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <AdvancedVisualizationPanel />
          </div>
        </div>
      )}

      {openPanels.projectManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-7xl w-full h-[95vh] overflow-hidden relative">
            <button
              onClick={() => togglePanel('projectManager')}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <ProjectManager />
          </div>
        </div>
      )}

      {openPanels.cadTools && (
        <div className="fixed inset-0 bg-black/50 flex z-50">
          <div className="bg-gray-900 h-full border-r border-gray-700 relative">
            <button
              onClick={() => togglePanel('cadTools')}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <CADToolsPanel 
              onToolSelect={setSelectedTool}
              selectedTool={selectedTool}
            />
          </div>
          <div className="flex-1" onClick={() => togglePanel('cadTools')} />
        </div>
      )}

      {/* Professional Reports Panel */}
      {openPanels.professionalReports && (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Professional Reports</h2>
            <button
              onClick={() => togglePanel('professionalReports')}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ProfessionalReports />
          </div>
        </div>
      )}

      {/* Standards Compliance Panel */}
      {openPanels.standardsCompliance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[90vh] overflow-hidden relative">
            <button
              onClick={() => togglePanel('standardsCompliance')}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <StandardsCompliance />
          </div>
        </div>
      )}

      {/* IES Manager Panel */}
      {openPanels.iesManager && (
        <div className="fixed inset-0 bg-black/50 flex z-50">
          <div className="flex-1" onClick={() => togglePanel('iesManager')} />
          <div className="bg-gray-900 h-full border-l border-gray-700 relative w-[600px]">
            <button
              onClick={() => togglePanel('iesManager')}
              className="absolute top-4 left-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <IESManager />
          </div>
        </div>
      )}

      {/* Spectrum Analysis Panel */}
      {openPanels.spectrumAnalysis && (
        <SpectrumAnalysis
          onClose={() => togglePanel('spectrumAnalysis')}
        />
      )}
      
      {/* Array Tool */}
      <ArrayTool 
        isOpen={openPanels.arrayTool}
        onClose={() => togglePanel('arrayTool')}
        selectedObject={selectedObject}
      />
      
      {/* PPFD Target Array Tool */}
      <PPFDTargetArrayTool
        isOpen={openPanels.ppfdArrayTool}
        onClose={() => togglePanel('ppfdArrayTool')}
      />
      
      {/* Batch Placement Tool */}
      <BatchPlacementTool
        isOpen={openPanels.batchPlacement}
        onClose={() => togglePanel('batchPlacement')}
        selectedFixture={selectedObject?.type === 'fixture' ? selectedObject as any : null}
      />
      
      {/* Predictive ROI Module */}
      <PredictiveROIModule
        isOpen={openPanels.predictiveROI}
        onClose={() => togglePanel('predictiveROI')}
      />
      
      {/* Fixture Import Wizard */}
      <FixtureImportWizard
        isOpen={openPanels.fixtureImportWizard}
        onClose={() => togglePanel('fixtureImportWizard')}
      />
      
      {/* Electrical Estimator */}
      {openPanels.electricalEstimator && (
        <ElectricalEstimatorPanel 
          onClose={() => togglePanel('electricalEstimator')}
        />
      )}
      
      {/* Solar DLI Panel */}
      {openPanels.solarDLI && (
        <SolarDLIPanel
          onClose={() => togglePanel('solarDLI')}
        />
      )}
      
      {/* Environmental Integration Panel */}
      {openPanels.environmentalIntegration && (
        <EnvironmentalIntegrationPanel
          onClose={() => togglePanel('environmentalIntegration')}
        />
      )}
      
      {/* Advanced Dropdown Panels */}
      {openPanels.advanced3DVisualization && (
        <Advanced3DVisualizationPanel
          onClose={() => togglePanel('advanced3DVisualization')}
        />
      )}
      
      {openPanels.advancedPPFDMapping && (
        <AdvancedPPFDMappingPanel
          onClose={() => togglePanel('advancedPPFDMapping')}
        />
      )}
      
      {openPanels.ledThermalManagement && (
        <LEDThermalManagementPanel
          onClose={() => togglePanel('ledThermalManagement')}
        />
      )}
      
      {openPanels.plantBiologyIntegration && (
        <PlantBiologyIntegrationPanel
          onClose={() => togglePanel('plantBiologyIntegration')}
        />
      )}
      
      {openPanels.multiZoneControlSystem && (
        <MultiZoneControlSystemPanel
          onClose={() => togglePanel('multiZoneControlSystem')}
        />
      )}
      
      {openPanels.researchPropagationTools && (
        <ResearchPropagationToolsPanel
          onClose={() => togglePanel('researchPropagationTools')}
        />
      )}
      
      {openPanels.monteCarloRayTracing && (
        <MonteCarloRayTracingPanel
          onClose={() => togglePanel('monteCarloRayTracing')}
        />
      )}
      
      {openPanels.gpuRayTracing && (
        <GPURayTracingPanel
          onClose={() => togglePanel('gpuRayTracing')}
        />
      )}
      
      {/* Facility Design Studio */}
      {openPanels.facilityDesign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-7xl w-full h-[95vh] overflow-hidden relative">
            <button
              onClick={() => togglePanel('facilityDesign')}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <FacilityDesignStudio />
          </div>
        </div>
      )}
      
      {/* CFD Analysis Panel */}
      {openPanels.cfdAnalysis && (
        <CFDAnalysisPanel
          onClose={() => togglePanel('cfdAnalysis')}
        />
      )}
      
      {/* Monte Carlo Simulation Panel */}
      {openPanels.monteCarloSimulation && (
        <MonteCarloSimulation
          onClose={() => togglePanel('monteCarloSimulation')}
        />
      )}
      
      {/* Settings Panel */}
      {openPanels.settings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Settings</h2>
              <button
                onClick={() => togglePanel('settings')}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Grid Settings</h3>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Show Grid</span>
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_UI', payload: { grid: { ...ui.grid, enabled: !ui.grid.enabled } } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      ui.grid.enabled ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      ui.grid.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </label>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Units</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_UI', payload: { measurement: { unit: 'imperial' } } })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      ui.measurement.unit === 'imperial' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    Imperial (ft)
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_UI', payload: { measurement: { unit: 'metric' } } })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      ui.measurement.unit === 'metric' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    Metric (m)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      
      {/* Room Configuration Panel */}
      {openPanels.roomConfig && (
        <>
          <RoomConfigurationPanel 
            onClose={() => togglePanel('roomConfig')} 
          />
        </>
      )}
      
      {/* Greenhouse Configuration Panel */}
      {openPanels.greenhouseConfig && (
        <GreenhouseConfigurationPanel 
          onClose={() => togglePanel('greenhouseConfig')} 
        />
      )}
      
      {/* Fan Library Panel */}
      {openPanels.fanLibrary && (
        <FanLibraryPanel
          isOpen={openPanels.fanLibrary}
          onClose={() => togglePanel('fanLibrary')}
        />
      )}
      
      {/* Dehumidifier Library Panel */}
      {openPanels.dehumidifierLibrary && (
        <DehumidifierLibraryPanel
          isOpen={openPanels.dehumidifierLibrary}
          onClose={() => togglePanel('dehumidifierLibrary')}
        />
      )}
      
      {/* CO2 System Panel */}
      {openPanels.co2SystemPanel && (
        <CO2SystemPanel
          isOpen={openPanels.co2SystemPanel}
          onClose={() => togglePanel('co2SystemPanel')}
        />
      )}
      
      {/* HVAC System Panel */}
      {openPanels.hvacSystemPanel && (
        <HVACSystemPanel
          isOpen={openPanels.hvacSystemPanel}
          onClose={() => togglePanel('hvacSystemPanel')}
        />
      )}
      
      {/* Irrigation System Panel */}
      {openPanels.irrigationSystemPanel && (
        <IrrigationSystemPanel
          isOpen={openPanels.irrigationSystemPanel}
          onClose={() => togglePanel('irrigationSystemPanel')}
        />
      )}
      
      {/* Environmental Controller Panel */}
      {openPanels.environmentalControllerPanel && (
        <EnvironmentalControllerPanel
          isOpen={openPanels.environmentalControllerPanel}
          onClose={() => togglePanel('environmentalControllerPanel')}
        />
      )}
      
      {/* Electrical Infrastructure Panel */}
      {openPanels.electricalInfrastructurePanel && (
        <ElectricalInfrastructurePanel
          isOpen={openPanels.electricalInfrastructurePanel}
          onClose={() => togglePanel('electricalInfrastructurePanel')}
        />
      )}
      
      {/* Benching & Racking Panel */}
      {openPanels.benchingRackingPanel && (
        <BenchingRackingPanel
          isOpen={openPanels.benchingRackingPanel}
          onClose={() => togglePanel('benchingRackingPanel')}
        />
      )}
      
      {/* Unistrut Tool */}
      {openPanels.unistrustTool && (
        <UnistrustTool
          isOpen={openPanels.unistrustTool}
          onClose={() => togglePanel('unistrustTool')}
        />
      )}
      
      {/* Integrated Workflows */}
      {openPanels.integratedWorkflows && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full h-[80vh] overflow-hidden relative">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Integrated Workflows
              </h2>
              <button
                onClick={() => togglePanel('integratedWorkflows')}
                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(100%-64px)]">
              <WorkflowSelector />
            </div>
          </div>
        </div>
      )}
      
      {/* Power Safety Module */}
      {openPanels.powerSafetyModule && (
        <PowerSafetyModule
          onClose={() => togglePanel('powerSafetyModule')}
        />
      )}
      
      {/* Commissioning Workflow */}
      {openPanels.commissioningWorkflow && (
        <CommissioningWorkflow
          onClose={() => togglePanel('commissioningWorkflow')}
        />
      )}
      
      {/* Native Zone Manager */}
      {openPanels.nativeZoneManager && (
        <NativeZoneManager
          onClose={() => togglePanel('nativeZoneManager')}
        />
      )}
      
      {/* Sensor Fusion System */}
      {openPanels.sensorFusionSystem && (
        <SensorFusionSystem
          onClose={() => togglePanel('sensorFusionSystem')}
        />
      )}
      
      {/* Modbus Lighting Control */}
      {openPanels.modbusLightingControl && (
        <ModbusLightingControlPanel
          onClose={() => togglePanel('modbusLightingControl')}
        />
      )}
      
      {openPanels.recipeSyncSystem && (
        <RecipeSyncSystem
          onClose={() => togglePanel('recipeSyncSystem')}
        />
      )}
      
      {openPanels.batchValidationSystem && (
        <BatchValidationSystem
          onClose={() => togglePanel('batchValidationSystem')}
        />
      )}
      
      {openPanels.unifiedAlertSystem && (
        <UnifiedAlertSystem
          onClose={() => togglePanel('unifiedAlertSystem')}
        />
      )}
      
      {openPanels.spectrumOptimizationSystem && (
        <SpectrumOptimizationSystem
          onClose={() => togglePanel('spectrumOptimizationSystem')}
        />
      )}
      
      {/* Research Assistant Panel */}
      {openPanels.researchAssistant && (
        <ResearchAssistantPanel
          isOpen={openPanels.researchAssistant}
          onClose={() => togglePanel('researchAssistant')}
          selectedCrop={selectedCrop}
          currentPPFD={calculations.averagePPFD}
          currentDLI={calculations.dli}
        />
      )}
      
      {/* Quick Array Tool */}
      {openPanels.quickArrayTool && (
        <QuickArrayTool
          isOpen={openPanels.quickArrayTool}
          onClose={() => togglePanel('quickArrayTool')}
        />
      )}
      
      {/* AI Design Assistant - Outside main container for proper positioning */}
      <AIDesignAssistant
        onDesignGenerated={(newObjects) => {
          
          // Clear existing objects if needed
          dispatch({ type: 'CLEAR_OBJECTS' });
          
          // Add all new objects to the canvas
          newObjects.forEach((obj, index) => {
            dispatch({ type: 'ADD_OBJECT', payload: obj });
          });
          
          // Select the first fixture for properties panel
          const firstFixture = newObjects.find(obj => obj.type === 'fixture');
          if (firstFixture) {
            dispatch({ type: 'SELECT_OBJECT', payload: firstFixture.id });
          }
          
          // Trigger recalculation
          recalculate();
        }}
        roomDimensions={room}
        dlcFixtures={dlcFixturesDatabase}
        currentObjects={objects}
      />
      
      {/* Fixture Selection Modal */}
      <FixtureSelectionModal
        isOpen={showFixtureSelection}
        onClose={() => setShowFixtureSelection(false)}
        onSelect={handleFixtureSelection}
        title="Select Fixture to Place"
      />
    </div>
  );
}

// Error boundary component
class DesignerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Designer Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md">
            <h2 className="text-xl font-bold text-red-500 mb-4">Designer Error</h2>
            <p className="text-gray-300 mb-4">{this.state.error?.message || 'An error occurred'}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AdvancedDesignerProfessional() {
  return (
    <>
      <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden">
        <DesignerErrorBoundary>
          <NotificationProvider>
            <DesignerProvider>
              <Suspense fallback={
                <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <div className="text-2xl mb-2">Loading Designer...</div>
                    <div className="text-sm">Initializing workspace</div>
                  </div>
                </div>
              }>
                <ProfessionalDesignerContent />
              </Suspense>
            </DesignerProvider>
          </NotificationProvider>
        </DesignerErrorBoundary>
      </div>
      
      {/* AI Assistant Button - Absolutely positioned outside main container */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          transition: 'transform 0.3s ease',
        }}
        onClick={() => {
          // Dispatch event to open AI assistant
          window.dispatchEvent(new CustomEvent('openAIAssistant'));
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="AI Design Assistant"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7V12C2 16.5 4.23 20.68 7.62 21.94L12 24L16.38 21.94C19.77 20.68 22 16.5 22 12V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 12H9.01M15 12H15.01M9 16C9 16 10.5 17.5 12 17.5C13.5 17.5 15 16 15 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </>
  );
}