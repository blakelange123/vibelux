'use client';

import React, { useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { DesignerProvider, useDesigner } from './context/DesignerContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { LeftSidebar } from './panels/LeftSidebar';
import { RightSidebar } from './panels/RightSidebar';
import { TopToolbar } from './panels/TopToolbar';
import { Canvas2D } from './canvas/Canvas2D';
import { SplitViewLayout } from './layout/SplitViewLayout';
import { ToolPalette } from './tools/ToolPalette';
import { DraggablePanel } from './panels/DraggablePanel';
import { useCalculations } from './hooks/useCalculations';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAutoSave } from './hooks/useAutoSave';
import { dlcFixturesDatabase } from '@/lib/dlc-fixtures-data';

// Lazy load heavy components
// const Canvas3D = dynamic(() => import('./canvas/Canvas3D'), {
//   ssr: false,
//   loading: () => <div className="flex items-center justify-center h-full bg-gray-900 text-white">Loading 3D view...</div>
// });

const SpectrumAnalysisPanel = dynamic(() => import('./features/SpectrumAnalysisPanel'), {
  ssr: false,
  loading: () => null
});

const EmergencyLightingPanel = dynamic(() => import('./features/EmergencyLightingPanel'), {
  ssr: false,
  loading: () => null
});

const CircuitPlanningPanel = dynamic(() => import('./features/CircuitPlanningPanel'), {
  ssr: false,
  loading: () => null
});

const GreenhouseProfessionalUI = dynamic(() => import('../GreenhouseProfessionalUI').then(mod => ({ default: mod.GreenhouseProfessionalUI })), {
  ssr: false,
  loading: () => null
});

const AIDesignAssistant = dynamic(() => import('../AIDesignAssistant').then(mod => ({ default: mod.AIDesignAssistant })), {
  ssr: false,
  loading: () => null
});

const Advanced3DVisualization = dynamic(() => import('./Advanced3DVisualization').then(mod => ({ default: mod.Advanced3DVisualization })), {
  ssr: false,
  loading: () => null
});

const AdvancedPPFDMapping = dynamic(() => import('./AdvancedPPFDMapping').then(mod => ({ default: mod.AdvancedPPFDMapping })), {
  ssr: false,
  loading: () => null
});

const LEDThermalManagement = dynamic(() => import('./LEDThermalManagement').then(mod => ({ default: mod.LEDThermalManagement })), {
  ssr: false,
  loading: () => null
});

const PlantBiologyIntegration = dynamic(() => import('./PlantBiologyIntegration').then(mod => ({ default: mod.PlantBiologyIntegration })), {
  ssr: false,
  loading: () => null
});

const PlantBiologyWrapper = dynamic(() => import('./PlantBiologyWrapper'), {
  ssr: false,
  loading: () => null
});

const MultiZoneControlSystem = dynamic(() => import('./MultiZoneControlSystem').then(mod => ({ default: mod.MultiZoneControlSystem })), {
  ssr: false,
  loading: () => null
});

const EnvironmentalIntegration = dynamic(() => import('./EnvironmentalIntegration').then(mod => ({ default: mod.EnvironmentalIntegration })), {
  ssr: false,
  loading: () => null
});

const ResearchPropagationTools = dynamic(() => import('./ResearchPropagationTools').then(mod => ({ default: mod.ResearchPropagationTools })), {
  ssr: false,
  loading: () => null
});

const BIMPropertiesPanel = dynamic(() => import('../BIMPropertiesPanel').then(mod => ({ default: mod.BIMPropertiesPanel })), {
  ssr: false,
  loading: () => null
});

// New Professional Tools
const CADToolsPanel = dynamic(() => import('./tools/CADToolsPanel').then(mod => ({ default: mod.CADToolsPanel })), {
  ssr: false,
  loading: () => null
});

const PhotometricEngine = dynamic(() => import('./calculations/PhotometricEngine').then(mod => ({ default: mod.PhotometricEngine })), {
  ssr: false,
  loading: () => null
});

const AdvancedVisualizationPanel = dynamic(() => import('./visualization/AdvancedVisualizationPanel').then(mod => ({ default: mod.AdvancedVisualizationPanel })), {
  ssr: false,
  loading: () => null
});

const ProjectManager = dynamic(() => import('./project/ProjectManager').then(mod => ({ default: mod.ProjectManager })), {
  ssr: false,
  loading: () => null
});

const AdvancedFixtureLibrary = dynamic(() => import('./panels/AdvancedFixtureLibrary').then(mod => ({ default: mod.AdvancedFixtureLibrary })), {
  ssr: false,
  loading: () => null
});

function DesignerContent() {
  const { state, dispatch, clearObjects, setRoom, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const { ui } = state;
  
  // Custom hooks for separation of concerns
  useCalculations();
  useKeyboardShortcuts();
  useAutoSave();

  // Listen for AI-generated designs
  useEffect(() => {
    // Check for AI design in sessionStorage on mount
    const storedDesign = sessionStorage.getItem('aiGeneratedDesign');
    if (storedDesign) {
      try {
        const design = JSON.parse(storedDesign);
        applyAIDesign(design);
        sessionStorage.removeItem('aiGeneratedDesign');
      } catch (error) {
        console.error('Error applying stored AI design:', error);
      }
    }

    // Listen for AI design events
    const handleAIDesign = (event: CustomEvent) => {
      if (event.detail) {
        applyAIDesign(event.detail);
      }
    };

    window.addEventListener('applyAIDesign', handleAIDesign as EventListener);
    return () => {
      window.removeEventListener('applyAIDesign', handleAIDesign as EventListener);
    };
  }, []);

  const applyAIDesign = useCallback((design: any) => {
    try {
      // Clear existing objects
      clearObjects();
      
      // Set room dimensions
      setRoom({
        width: design.room.width,
        length: design.room.length,
        height: design.room.height,
        workingHeight: design.room.workingHeight,
        ceilingHeight: design.room.ceilingHeight,
        reflectances: design.room.reflectances
      });

      // Add fixtures
      design.fixtures.forEach((fixture: any, index: number) => {
        addObject({
          type: 'fixture',
          x: fixture.x,
          y: fixture.y,
          z: fixture.z,
          rotation: fixture.rotation || 0,
          width: fixture.width,
          length: fixture.length,
          height: fixture.height || 0.5,
          enabled: fixture.enabled !== false,
          model: fixture.model,
          dimmingLevel: fixture.dimmingLevel || 100
        });
      });

      // Show success notification with summary
      showNotification(
        'success', 
        `AI Design Applied: ${design.fixtures.length} fixtures in ${design.summary.layout} layout`
      );

      // If recommendations exist, show them
      if (design.recommendations && design.recommendations.length > 0) {
        setTimeout(() => {
          showNotification(
            'info',
            `💡 Tip: ${design.recommendations[0]}`
          );
        }, 2000);
      }
    } catch (error) {
      console.error('Error applying AI design:', error);
      showNotification('error', 'Failed to apply AI design. Please try again.');
    }
  }, [clearObjects, setRoom, addObject, showNotification]);

  return (
    <div className="h-screen-safe designer-container flex flex-col bg-gray-900">
      {/* Top Toolbar */}
      <TopToolbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        {/* Left Sidebar */}
        {ui.panels.leftSidebar && <LeftSidebar />}

        {/* Canvas Area */}
        <div className="flex-1 relative bg-gray-800 overflow-hidden designer-canvas">
          <SplitViewLayout />
        </div>

        {/* Right Sidebar */}
        {ui.panels.rightSidebar && <RightSidebar />}
      </div>

      {/* Tool Palette */}
      <ToolPalette 
        selectedTool={ui.selectedTool}
        onToolSelect={(tool) => dispatch({ type: 'SET_TOOL', payload: tool })}
        onPanelOpen={(panel) => dispatch({ type: 'TOGGLE_PANEL', payload: panel })}
      />

      {/* Feature Panels (Modals) */}
      {ui.panels.spectrumAnalysis && <SpectrumAnalysisPanel />}
      {ui.panels.emergencyLighting && <EmergencyLightingPanel />}
      {ui.panels.circuitPlanning && <CircuitPlanningPanel />}
      {ui.panels.greenhouse && (
        <GreenhouseProfessionalUI
          isOpen={true}
          onClose={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'greenhouse' })}
          onApplyGreenhouse={(greenhouse) => {
            // First reset the entire state
            dispatch({ type: 'RESET' });
            
            // Calculate total dimensions from bays
            const totalWidth = greenhouse.structure.bays.reduce((sum, bay) => sum + (bay.width * bay.quantity), 0);
            const totalLength = greenhouse.structure.bays[0]?.length || 100;
            const totalHeight = greenhouse.structure.ridgeHeight;
            
            // Apply greenhouse dimensions to room
            dispatch({ type: 'UPDATE_ROOM', payload: {
              width: totalWidth,
              length: totalLength,
              height: totalHeight
            }});
            
            // Add greenhouse fixtures if supplemental lighting exists
            if (greenhouse.supplementalLighting?.fixtures) {
              greenhouse.supplementalLighting.fixtures.forEach((fixtureGroup, index) => {
                // Add multiple fixtures based on quantity
                for (let i = 0; i < fixtureGroup.quantity; i++) {
                  dispatch({ type: 'ADD_OBJECT', payload: {
                    type: 'fixture',
                    x: (index * 10) + (i * 5), // Distribute fixtures
                    y: totalLength / 2, 
                    z: fixtureGroup.height,
                    width: 4,
                    height: 2,
                    length: 4,
                    rotation: 0,
                    model: {
                      id: `greenhouse-${index}-${i}`,
                      name: fixtureGroup.model,
                      wattage: fixtureGroup.wattage,
                      ppf: fixtureGroup.ppf,
                      beamAngle: 120,
                      manufacturer: 'Greenhouse',
                      efficacy: fixtureGroup.ppf / fixtureGroup.wattage
                    },
                    enabled: true
                  }});
                }
              });
            }
            
            // Show success notification
            showNotification('success', `Professional ${greenhouse.structure.type} greenhouse applied successfully`);
            
            // Close the panel
            dispatch({ type: 'TOGGLE_PANEL', payload: 'greenhouse' });
          }}
        />
      )}
      {ui.panels.aiAssistant && (
        <AIDesignAssistant 
          onDesignGenerated={(design) => {
            // Handle design generation
            // Apply the AI-generated design
            if (design && Array.isArray(design)) {
              applyAIDesign(design);
            }
          }}
          roomDimensions={state.room}
          dlcFixtures={dlcFixturesDatabase}
          currentObjects={state.objects}
        />
      )}
      
      {/* Advanced Designer Components */}
      {ui.panels.advanced3DVisualization && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[80vh] overflow-hidden relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'advanced3DVisualization' })}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <Advanced3DVisualization
              fixtures={state.objects.filter(obj => obj.type === 'fixture').map(f => ({
                id: f.id,
                x: f.x,
                y: f.y,
                z: f.z,
                width: f.width,
                height: f.height,
                power: (f as any).model?.wattage || 100,
                ppfd: (f as any).model?.ppf ? (f as any).model.ppf / ((f.width || 2) * (f.length || 4)) : 400,
                spectrum: (f as any).model?.spectrum || {},
                beamAngle: (f as any).model?.beamAngle || 120,
                mountingHeight: f.z
              }))}
              objects={state.objects}
              room={state.room}
              viewMode="3d"
              onViewModeChange={() => {}}
              onClose={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'advanced3DVisualization' })}
            />
          </div>
        </div>
      )}
      
      {ui.panels.advancedPPFDMapping && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[80vh] overflow-auto relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'advancedPPFDMapping' })}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <div className="p-4">
              <AdvancedPPFDMapping
                fixtures={state.objects.filter(obj => obj.type === 'fixture').map(f => ({
                  id: f.id,
                  x: f.x,
                  y: f.y,
                  z: f.z,
                  power: (f as any).model?.wattage || 100,
                  ppfd: (f as any).model?.ppfd || 400,
                  beamAngle: (f as any).model?.beamAngle || 120
                }))}
                room={{
                  width: state.room.width,
                  length: state.room.length,
                  height: state.room.height,
                  reflectances: state.room.reflectances
                }}
                onPointSelect={(point) => {
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {ui.panels.ledThermalManagement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[80vh] overflow-auto relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'ledThermalManagement' })}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <div className="p-4">
              <LEDThermalManagement
                fixtures={state.objects.filter(obj => obj.type === 'fixture').map(f => ({
                  id: f.id,
                  x: f.x,
                  y: f.y,
                  z: f.z,
                  power: (f as any).model?.wattage || 100,
                  chips: [{
                    id: `chip-${f.id}`,
                    type: 'standard',
                    maxPower: (f as any).model?.wattage || 100,
                    efficiency: (f as any).model?.efficacy || 2.5,
                    thermalResistance: 5,
                    maxJunctionTemp: 125,
                    currentPower: (f as any).model?.wattage || 100,
                    junctionTemp: 85,
                    lifespan: 50000,
                    degradationRate: 0.2
                  }],
                  thermalSystem: {
                    heatSink: {
                      type: 'passive',
                      thermalResistance: 2.5,
                      material: 'aluminum',
                      surfaceArea: 50
                    },
                    cooling: {
                      type: 'natural',
                      airflow: 10,
                      coolantTemp: 25,
                      efficiency: 0.8
                    },
                    ambientTemp: 25,
                    enclosure: {
                      ip_rating: 'IP65',
                      ventilation: 50,
                      thermalMass: 1000
                    }
                  },
                  powerDensity: 10,
                  thermalHotspots: []
                }))}
                ambientTemp={25}
                onFixtureUpdate={(fixtureId, updates) => {
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {ui.panels.plantBiologyIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[80vh] overflow-auto relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'plantBiologyIntegration' })}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <div className="p-4">
              <PlantBiologyWrapper
                selectedSpecies={{
                  id: "lettuce-001",
                  name: "Lettuce",
                  category: "leafy_greens",
                  photosynthesis: {
                    lightSaturation: 800,
                    lightCompensation: 20,
                    co2Saturation: 1000,
                    quantumEfficiency: 0.053,
                    photosystemII_efficiency: 0.85,
                    actionSpectrum: [
                      { wavelength: 450, absorptance: 0.85, quantumYield: 0.8 },
                      { wavelength: 660, absorptance: 0.90, quantumYield: 1.0 },
                      { wavelength: 730, absorptance: 0.25, quantumYield: 0.3 }
                    ]
                  },
                  morphology: {
                    leafAreaIndex: 3.5,
                    canopyExtinction: 0.8,
                    leafThickness: 0.5,
                    chlorophyllContent: 450,
                    canopyHeight: 20
                  },
                  responses: {
                    redFarRedRatio: {
                      stemElongation: (ratio: number) => 1 + (2 - ratio) * 0.3,
                      leafExpansion: (ratio: number) => 1 + (ratio - 1) * 0.2,
                      flowering: (ratio: number) => ratio > 1.5 ? 1 : 0
                    },
                    blueLight: {
                      compactness: (percentage: number) => 1 + percentage * 0.002,
                      chlorophyll: (percentage: number) => 1 + percentage * 0.001,
                      stomatalConductance: (percentage: number) => 1 + percentage * 0.0015
                    },
                    uvResponse: {
                      anthocyanins: (intensity: number) => intensity * 0.0001,
                      flavonoids: (intensity: number) => intensity * 0.00008,
                      morphogenesis: (intensity: number) => intensity * 0.00005
                    }
                  },
                  growthStages: {
                    seedling: { 
                      duration: 7, 
                      dli_requirement: 10, 
                      temperature_optimal: 20, 
                      humidity_optimal: 75,
                      nutrient_ec_optimal: 1.2,
                      spectrum_requirements: { red: 70, blue: 30 }
                    },
                    vegetative: { 
                      duration: 21, 
                      dli_requirement: 15, 
                      temperature_optimal: 22, 
                      humidity_optimal: 65,
                      nutrient_ec_optimal: 1.8,
                      spectrum_requirements: { red: 75, blue: 25 }
                    },
                    harvest: { 
                      duration: 7, 
                      dli_requirement: 12, 
                      temperature_optimal: 18, 
                      humidity_optimal: 60,
                      nutrient_ec_optimal: 2.0,
                      spectrum_requirements: { red: 80, blue: 20 }
                    }
                  },
                  circadianResponse: {
                    dawnDuskSensitivity: 0.7,
                    phaseShiftCapability: 0.5,
                    entrainmentRange: 4
                  },
                  circadianBiology: {
                    photoperiodicResponse: 'day-neutral',
                    criticalPhotoperiod: 12,
                    dawnDuskResponse: true,
                    phaseShiftCapability: 0.5,
                    entrainmentRange: 4
                  }
                }}
                currentStage="vegetative"
                environmentalConditions={{
                  co2: 400,
                  temperature: 24,
                  humidity: 65,
                  airflow: 0.2
                }}
                lightingSystem={{
                  fixtures: state.objects.filter(obj => obj.type === 'fixture').map(f => ({
                    id: f.id,
                    spectrum: { 450: 20, 660: 70, 730: 10 },
                    ppfd: (f as any).model?.ppfd || 400,
                    photoperiod: 16,
                    position: { x: f.x, y: f.y, z: f.z }
                  }))
                }}
                onOptimizationUpdate={(recommendations: any) => {
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {ui.panels.multiZoneControlSystem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[80vh] overflow-auto relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'multiZoneControlSystem' })}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <div className="p-4">
              <MultiZoneControlSystem
                room={state.room}
                fixtures={state.objects.filter(obj => obj.type === 'fixture').map(f => ({
                  id: f.id,
                  name: (f as any).model?.name || 'Fixture',
                  x: f.x,
                  y: f.y,
                  power: (f as any).model?.wattage || 100,
                  channels: { 450: { power: 20, efficiency: 2.5, controllable: true }, 660: { power: 50, efficiency: 2.8, controllable: true } }
                }))}
                onZoneUpdate={(zones) => {
                }}
                onFixtureUpdate={(fixtures) => {
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {ui.panels.environmentalIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[80vh] overflow-auto relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'environmentalIntegration' })}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <div className="p-4">
              <EnvironmentalIntegration
                location={{
                  latitude: 37.7749,
                  longitude: -122.4194,
                  timezone: 'America/Los_Angeles',
                  elevation: 16
                }}
                greenhouse={{
                  type: 'gutter_connected',
                  orientation: 0,
                  roofAngle: 22,
                  sidewallHeight: 4,
                  gutterHeight: 5,
                  bayWidth: 9.6,
                  glazingProperties: {
                    material: 'glass',
                    thickness: 4,
                    transmittance: { visible: 0.90, par: 0.88, infrared: 0.15, uv: 0.05 },
                    angularDependence: (angle: number) => Math.cos(angle * Math.PI / 180),
                    weathering: 0.95,
                    condensation: 0.02
                  },
                  shadingSystem: {
                    type: 'internal',
                    transmittance: 0.7,
                    reflectance: 0.8,
                    automated: true,
                    triggers: { solarRadiation: 600, temperature: 28, lightLevel: 40000 }
                  },
                  ventilation: {
                    type: 'natural',
                    openingArea: 20,
                    efficiency: 0.8
                  }
                }}
                currentWeather={{
                  temperature: 22,
                  humidity: 65,
                  windSpeed: 2.5,
                  cloudCover: 0.3,
                  precipitation: 0,
                  visibility: 15
                }}
                artificialLighting={{
                  fixtures: state.objects.filter(obj => obj.type === 'fixture').map(f => ({
                    id: f.id,
                    power: (f as any).model?.wattage || 100,
                    ppfd: (f as any).model?.ppfd || 400,
                    spectrum: { 450: 20, 660: 70, 730: 10 },
                    position: { x: f.x, y: f.y, z: f.z }
                  }))
                }}
                onLightingAdjustment={(adjustments) => {
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {ui.panels.researchPropagationTools && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[80vh] overflow-auto relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'researchPropagationTools' })}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <div className="p-4">
              <ResearchPropagationTools
                room={state.room}
                onExperimentUpdate={(experiment) => {
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {ui.panels.bimProperties && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full h-[80vh] overflow-auto relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'bimProperties' })}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <div className="p-4">
              <h2 className="text-xl font-semibold text-white mb-4">BIM Properties</h2>
              <BIMPropertiesPanel
                object={state.objects.find(o => o.id === ui.selectedObjectId) || null}
                buildingHierarchy={{
                  project: 'Indoor Growing Facility',
                  building: 'Cultivation Building A',
                  storey: 'Ground Floor',
                  space: state.room.roomType
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Professional CAD Tools Panel */}
      {ui.panels.cadTools && (
        <div className="fixed inset-0 bg-black/50 flex z-50">
          <div className="bg-gray-900 h-full border-r border-gray-700 relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'cadTools' })}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <CADToolsPanel 
              onToolSelect={(tool) => dispatch({ type: 'SET_TOOL', payload: tool })}
              selectedTool={ui.selectedTool}
            />
          </div>
          <div className="flex-1" onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'cadTools' })} />
        </div>
      )}

      {/* Photometric Engine Panel */}
      {ui.panels.photometricEngine && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-6xl w-full h-[90vh] overflow-auto relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'photometricEngine' })}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <div className="p-6">
              <PhotometricEngine />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Visualization Panel */}
      {ui.panels.advancedVisualization && (
        <div className="fixed inset-0 bg-black/50 flex z-50">
          <div className="flex-1" onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'advancedVisualization' })} />
          <div className="bg-gray-900 h-full border-l border-gray-700 relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'advancedVisualization' })}
              className="absolute top-4 left-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <AdvancedVisualizationPanel />
          </div>
        </div>
      )}

      {/* Project Manager Panel */}
      {ui.panels.projectManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-7xl w-full h-[95vh] overflow-hidden relative">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'projectManager' })}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              ×
            </button>
            <ProjectManager />
          </div>
        </div>
      )}

      {/* Advanced Fixture Library Panel */}
      {ui.panels.advancedFixtureLibrary && (
        <DraggablePanel
          title="Professional Fixture Library"
          onClose={() => dispatch({ type: 'TOGGLE_PANEL', payload: 'advancedFixtureLibrary' })}
          defaultWidth={400}
          defaultHeight={600}
          minWidth={350}
          minHeight={400}
          defaultPosition={{ x: window.innerWidth - 450, y: 100 }}
        >
          <AdvancedFixtureLibrary />
        </DraggablePanel>
      )}
    </div>
  );
}

// Main component with providers
export function AdvancedDesigner() {
  return (
    <NotificationProvider>
      <DesignerProvider>
        <DesignerContent />
      </DesignerProvider>
    </NotificationProvider>
  );
}