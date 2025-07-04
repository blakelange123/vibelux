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
import { AIRecommendationsPanel } from './panels/AIRecommendationsPanel';
import { CollaborationPanel } from '../collaboration/CollaborationPanel';
import { useAuth } from '@clerk/nextjs';

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

const ProjectManager = dynamic(() => import('./projects/ProjectManagerPanel').then(mod => ({ default: mod.ProjectManagerPanel })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading Project Manager...</div>
});

const RackSystem3D = dynamic(() => import('./3d/RackSystem3D').then(mod => ({ default: mod.RackSystem3D })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading 3D Rack System...</div>
});

const FullspaceDesigner = dynamic(() => import('./fullspace/FullspaceDesigner').then(mod => ({ default: mod.FullspaceDesigner })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading Fullspace Designer...</div>
});

const CFDAnalysisPanel = dynamic(() => import('./cfd/CFDAnalysisPanel').then(mod => ({ default: mod.CFDAnalysisPanel })), {
  ssr: false,
  loading: () => <div className="p-4 text-white">Loading CFD Analysis...</div>
});

// Compact fixture library panel is now imported from ./panels/FixtureLibraryCompact

function ProfessionalDesignerContent() {
  const { state, dispatch, undo, redo, canUndo, canRedo, showNotification, updateRoom } = useDesigner();
  const { ui, calculations, objects, room } = state;
  const { userId } = useAuth();
  
  // State definitions - moved to top to prevent reference errors
  const [selectedTool, setSelectedTool] = useState('select');
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [showFixtureSelection, setShowFixtureSelection] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('custom');
  const [dliTarget, setDliTarget] = useState(30);
  const [photoperiod, setPhotoperiod] = useState(12);
  const [currentMode, setCurrentMode] = useState<'design' | 'analyze' | 'simulate' | 'output'>('design');
  
  // Panel visibility state - moved here before any useEffect that uses it
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
    roomConfiguration: false,
    greenhouseConfiguration: false,
    fixtures: false,
    environmentalSettings: false,
    calculations: false,
    layers: false,
    iesDistributionComparison: false,
    fans: false,
    dehumidifiers: false,
    co2System: false,
    hvacSystem: false,
    irrigationSystem: false,
    environmentalController: false,
    electricalInfrastructure: false,
    benchingRacking: false,
    unistrut: false,
    workflowSelector: false,
    powerSafety: false,
    commissioning: false,
    nativeZoneManager: false,
    sensorFusion: false,
    modbusControl: false,
    recipeSync: false,
    batchValidation: false,
    unifiedAlerts: false,
    spectrumOptimization: false,
    researchAssistant: false,
    gpuRayTracing: false,
    collaboration: false,
  });
  
  // Monitor objects array changes for debugging Apply Design
  useEffect(() => {
  }, [objects]);
  
  // Enable live PPFD calculations
  const { recalculate, isCalculating } = useCalculations();
  
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
  }, []); // Empty array is OK here since we're not using state directly in the effect

  // Add keyboard shortcuts for undo/redo and layers
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is typing in an input field
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true';
      
      if (isInputField) return;
      
      // Undo/Redo shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
      
      // Layer panel shortcut (Cmd/Ctrl + L)
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        setOpenPanels(prev => ({ ...prev, layers: !prev.layers }));
      }
      
      // Collaboration panel shortcut (Cmd/Ctrl + Shift + C)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        setOpenPanels(prev => ({ ...prev, collaboration: !prev.collaboration }));
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, undo, redo]);

  // Add global styles for emergency toggle button
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-emergency-toggle {
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 99999;
        background: #8b5cf6;
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .sidebar-emergency-toggle:hover {
        background: #7c3aed;
        transform: translateY(-1px);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
      }
      body.hide-sidebar .tool-palette-sidebar {
        display: none !important;
      }
      body.hide-sidebar main {
        margin-left: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      style.remove();
    };
  }, []);

  const handleFixtureSelect = (fixture: FixtureModel) => {
    // Convert the fixture model to the format expected by the designer
    const convertedFixture = {
      id: fixture.id || `fixture_${Date.now()}`,
      brand: fixture.brand,
      model: fixture.model,
      wattage: fixture.wattage,
      ppf: fixture.ppf,
      efficacy: fixture.efficacy,
      spectrum: fixture.spectrum || 'Full Spectrum',
      dlcQualified: fixture.dlcQualified || false,
      price: fixture.price,
      mountingType: fixture.mountingType || 'overhead',
      dimensions: fixture.dimensions || { length: 48, width: 12, height: 6 },
      beamAngle: fixture.beamAngle || 120,
      category: fixture.category || 'toplighting'
    };
    
    dispatch({ type: 'SET_SELECTED_FIXTURE', payload: convertedFixture });
    setShowFixtureSelection(false);
    dispatch({ type: 'SET_OBJECT_TYPE', payload: 'fixture' });
    
    // Dispatch custom event to open array tool
    window.dispatchEvent(new CustomEvent('openArrayTool'));
  };

  return (
    <ErrorBoundary>
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        overflow: 'hidden',
        backgroundColor: '#111827',
        color: '#f3f4f6',
        position: 'relative'
      }}>
        {/* Tool Palette Sidebar */}
        <ToolPaletteSidebar
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          className="tool-palette-sidebar"
        />
        
        {/* Layers Panel - Floating */}
        {openPanels.layers && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            width: '300px',
            maxHeight: '80vh',
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #374151'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} />
                <span style={{ fontWeight: 500 }}>Layers</span>
              </div>
              <button
                onClick={() => setOpenPanels(prev => ({ ...prev, layers: false }))}
                className="flex items-center gap-1 hover:text-white transition-colors ${openPanels.layers ? 'text-purple-400' : ''}"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '4px'
                }}
              >
              {/* Collaboration Button */}
              <button
                onClick={() => setOpenPanels(prev => ({ ...prev, collaboration: !prev.collaboration }))}
                className={`sidebar-icon ${openPanels.collaboration ? 'active' : ''}`}
                title="Collaboration (Ctrl+Shift+C)"
              >
                <Users size={20} />
              </button>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(80vh - 60px)' }}>
              <LayersPanel />
            </div>
          </div>
        )}
        
        {/* Collaboration Panel */}
        {openPanels.collaboration && userId && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '320px',
            height: '100vh',
            zIndex: 1000
          }}>
            <CollaborationPanel
              roomId={room.id || 'default-room'}
              userId={userId}
              userName="Designer User"
              wsUrl={process.env.NEXT_PUBLIC_WEBSOCKET_URL}
              onObjectAdded={(data) => {
              }}
              onObjectUpdated={(data) => {
              }}
              onObjectDeleted={(data) => {
              }}
            />
          </div>
        )}
        
        {/* Main Content Area */}
        <main style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          marginLeft: sidebarHidden ? '0' : '60px'
        }}>
          {/* Minimal Top Toolbar */}
          <MinimalTopToolbar
            onCropChange={handleCropChange}
            onPhotoperiodChange={setPhotoperiod}
            onOpenPanel={togglePanel}
            openPanels={openPanels}
          />
          
          <SplitViewLayout
            leftContent={
              <div style={{ height: '100%', position: 'relative' }}>
                <SimpleCanvas2D
                  activeTool={selectedTool}
                  canvasRef={React.useRef<HTMLCanvasElement>(null)}
                />
              </div>
            }
            rightContent={
              <div style={{ 
                height: '100%', 
                backgroundColor: '#1f2937',
                borderLeft: '1px solid #374151',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Properties Panel */}
                <CompactPropertiesPanel />
                {/* Calculations Panel */}
                <CompactCalculationsPanel />
              </div>
            }
            rightPanelWidth={rightPanelWidth}
            onWidthChange={setRightPanelWidth}
            rightPanelCollapsed={rightPanelCollapsed}
            onToggleCollapse={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          />
        </main>
        
        {/* Floating Panels */}
        {openPanels.arrayTool && (
          <ArrayTool
            onClose={() => setOpenPanels(prev => ({ ...prev, arrayTool: false }))}
            isOpen={openPanels.arrayTool}
          />
        )}
        
        {openPanels.ppfdArrayTool && (
          <PPFDTargetArrayTool
            onClose={() => setOpenPanels(prev => ({ ...prev, ppfdArrayTool: false }))}
            isOpen={openPanels.ppfdArrayTool}
          />
        )}
        
        {openPanels.batchPlacement && (
          <BatchPlacementTool
            onClose={() => setOpenPanels(prev => ({ ...prev, batchPlacement: false }))}
            isOpen={openPanels.batchPlacement}
          />
        )}
        
        {openPanels.quickArrayTool && (
          <QuickArrayTool
            onClose={() => setOpenPanels(prev => ({ ...prev, quickArrayTool: false }))}
          />
        )}
        
        {openPanels.electricalEstimator && (
          <ElectricalEstimatorPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, electricalEstimator: false }))}
          />
        )}
        
        {openPanels.solarDLI && (
          <SolarDLIPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, solarDLI: false }))}
          />
        )}
        
        {openPanels.environmentalIntegration && (
          <EnvironmentalIntegrationPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, environmentalIntegration: false }))}
          />
        )}
        
        {openPanels.roomConfiguration && (
          <RoomConfigurationPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, roomConfiguration: false }))}
          />
        )}
        
        {openPanels.greenhouseConfiguration && (
          <GreenhouseConfigurationPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, greenhouseConfiguration: false }))}
          />
        )}
        
        {/* Professional Panels - Lazy Loaded */}
        {openPanels.photometricEngine && (
          <Suspense fallback={<div>Loading...</div>}>
            <PhotometricEngine
              onClose={() => setOpenPanels(prev => ({ ...prev, photometricEngine: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.advancedVisualization && (
          <Suspense fallback={<div>Loading...</div>}>
            <AdvancedVisualizationPanel
              onClose={() => setOpenPanels(prev => ({ ...prev, advancedVisualization: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.projectManager && (
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectManager
              onClose={() => setOpenPanels(prev => ({ ...prev, projectManager: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.cadTools && (
          <Suspense fallback={<div>Loading...</div>}>
            <CADToolsPanel
              onClose={() => setOpenPanels(prev => ({ ...prev, cadTools: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.professionalReports && (
          <Suspense fallback={<div>Loading...</div>}>
            <ProfessionalReports
              onClose={() => setOpenPanels(prev => ({ ...prev, professionalReports: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.standardsCompliance && (
          <Suspense fallback={<div>Loading...</div>}>
            <StandardsCompliance
              onClose={() => setOpenPanels(prev => ({ ...prev, standardsCompliance: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.iesManager && (
          <Suspense fallback={<div>Loading...</div>}>
            <IESManager
              onClose={() => setOpenPanels(prev => ({ ...prev, iesManager: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.spectrumAnalysis && (
          <Suspense fallback={<div>Loading...</div>}>
            <SpectrumAnalysis
              onClose={() => setOpenPanels(prev => ({ ...prev, spectrumAnalysis: false }))}
            />
          </Suspense>
        )}
        
        {openPanels.monteCarloSimulation && (
          <MonteCarloRayTracingPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, monteCarloSimulation: false }))}
          />
        )}
        
        {openPanels.cfdAnalysis && (
          <Suspense fallback={<div>Loading...</div>}>
            <CFDAnalysisPanel
              onClose={() => setOpenPanels(prev => ({ ...prev, cfdAnalysis: false }))}
            />
          </Suspense>
        )}
        
        {/* Advanced Panels */}
        {openPanels.advanced3DVisualization && (
          <Advanced3DVisualizationPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, advanced3DVisualization: false }))}
          />
        )}
        
        {openPanels.advancedPPFDMapping && (
          <AdvancedPPFDMappingPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, advancedPPFDMapping: false }))}
          />
        )}
        
        {openPanels.ledThermalManagement && (
          <LEDThermalManagementPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, ledThermalManagement: false }))}
          />
        )}
        
        {openPanels.plantBiologyIntegration && (
          <PlantBiologyIntegrationPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, plantBiologyIntegration: false }))}
          />
        )}
        
        {openPanels.multiZoneControlSystem && (
          <MultiZoneControlSystemPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, multiZoneControlSystem: false }))}
          />
        )}
        
        {openPanels.researchPropagationTools && (
          <ResearchPropagationToolsPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, researchPropagationTools: false }))}
          />
        )}
        
        {openPanels.gpuRayTracing && (
          <GPURayTracingPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, gpuRayTracing: false }))}
          />
        )}
        
        {openPanels.predictiveROI && (
          <PredictiveROIModule
            onClose={() => setOpenPanels(prev => ({ ...prev, predictiveROI: false }))}
          />
        )}
        
        {openPanels.fixtureImportWizard && (
          <FixtureImportWizard
            onClose={() => setOpenPanels(prev => ({ ...prev, fixtureImportWizard: false }))}
          />
        )}
        
        {openPanels.iesDistributionComparison && (
          <IESLightDistributionComparison
            onClose={() => setOpenPanels(prev => ({ ...prev, iesDistributionComparison: false }))}
          />
        )}
        
        {/* Equipment Panels */}
        {openPanels.fans && (
          <FanLibraryPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, fans: false }))}
          />
        )}
        
        {openPanels.dehumidifiers && (
          <DehumidifierLibraryPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, dehumidifiers: false }))}
          />
        )}
        
        {openPanels.co2System && (
          <CO2SystemPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, co2System: false }))}
          />
        )}
        
        {openPanels.hvacSystem && (
          <HVACSystemPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, hvacSystem: false }))}
          />
        )}
        
        {openPanels.irrigationSystem && (
          <IrrigationSystemPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, irrigationSystem: false }))}
          />
        )}
        
        {openPanels.environmentalController && (
          <EnvironmentalControllerPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, environmentalController: false }))}
          />
        )}
        
        {openPanels.electricalInfrastructure && (
          <ElectricalInfrastructurePanel
            onClose={() => setOpenPanels(prev => ({ ...prev, electricalInfrastructure: false }))}
          />
        )}
        
        {openPanels.benchingRacking && (
          <BenchingRackingPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, benchingRacking: false }))}
          />
        )}
        
        {openPanels.unistrut && (
          <UnistrustTool
            onClose={() => setOpenPanels(prev => ({ ...prev, unistrut: false }))}
          />
        )}
        
        {/* Workflow and Integration Panels */}
        {openPanels.workflowSelector && (
          <WorkflowSelector
            onClose={() => setOpenPanels(prev => ({ ...prev, workflowSelector: false }))}
          />
        )}
        
        {openPanels.powerSafety && (
          <PowerSafetyModule
            onClose={() => setOpenPanels(prev => ({ ...prev, powerSafety: false }))}
          />
        )}
        
        {openPanels.commissioning && (
          <CommissioningWorkflow
            onClose={() => setOpenPanels(prev => ({ ...prev, commissioning: false }))}
          />
        )}
        
        {openPanels.nativeZoneManager && (
          <NativeZoneManager
            onClose={() => setOpenPanels(prev => ({ ...prev, nativeZoneManager: false }))}
          />
        )}
        
        {openPanels.sensorFusion && (
          <SensorFusionSystem
            onClose={() => setOpenPanels(prev => ({ ...prev, sensorFusion: false }))}
          />
        )}
        
        {openPanels.modbusControl && (
          <ModbusLightingControlPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, modbusControl: false }))}
          />
        )}
        
        {openPanels.recipeSync && (
          <RecipeSyncSystem
            onClose={() => setOpenPanels(prev => ({ ...prev, recipeSync: false }))}
          />
        )}
        
        {openPanels.batchValidation && (
          <BatchValidationSystem
            onClose={() => setOpenPanels(prev => ({ ...prev, batchValidation: false }))}
          />
        )}
        
        {openPanels.unifiedAlerts && (
          <UnifiedAlertSystem
            onClose={() => setOpenPanels(prev => ({ ...prev, unifiedAlerts: false }))}
          />
        )}
        
        {openPanels.spectrumOptimization && (
          <SpectrumOptimizationSystem
            onClose={() => setOpenPanels(prev => ({ ...prev, spectrumOptimization: false }))}
          />
        )}
        
        {openPanels.researchAssistant && (
          <ResearchAssistantPanel
            onClose={() => setOpenPanels(prev => ({ ...prev, researchAssistant: false }))}
          />
        )}
        
        {/* AI Recommendations Panel - Shows proactive suggestions */}
        <AIRecommendationsPanel />
        
        {/* AI Design Assistant - Always visible */}
        <div className="ai-assistant-container">
          <AIDesignAssistant />
        </div>
        
        {/* Fixture Selection Modal */}
        {showFixtureSelection && (
          <FixtureSelectionModal
            isOpen={showFixtureSelection}
            onClose={() => setShowFixtureSelection(false)}
            onSelectFixture={handleFixtureSelect}
            fixtures={dlcFixturesDatabase}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export function AdvancedDesignerProfessional() {
  return (
    <NotificationProvider>
      <DesignerProvider>
        <ProfessionalDesignerContent />
      </DesignerProvider>
    </NotificationProvider>
  );
}