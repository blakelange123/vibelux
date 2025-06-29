'use client';

import React, { useState } from 'react';
import { 
  X, Maximize2, Home, Warehouse, Leaf, 
  Building, Tent, Sun, Wind, Droplets,
  Ruler, Square, Box, Grid3x3, Layers3,
  Package, Zap, ChevronRight, ChevronLeft, 
  Target, Lightbulb, Sprout
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { dlcFixturesDatabase } from '@/lib/dlc-fixtures-data';

interface RoomConfigurationPanelProps {
  onClose: () => void;
}

const roomTypes = [
  { id: 'cultivation', label: 'Cultivation', icon: Leaf },
  { id: 'greenhouse', label: 'Greenhouse', icon: Tent },
  { id: 'warehouse', label: 'Warehouse', icon: Warehouse },
  { id: 'residential', label: 'Residential', icon: Home },
  { id: 'commercial', label: 'Commercial', icon: Building },
  { id: 'custom', label: 'Custom', icon: Square }
];

const quickSizes = [
  { label: '20×40', width: 20, length: 40 },
  { label: '30×50', width: 30, length: 50 },
  { label: '40×60', width: 40, length: 60 },
  { label: '50×100', width: 50, length: 100 },
  { label: '60×120', width: 60, length: 120 },
  { label: '100×200', width: 100, length: 200 }
];

// Quick setup presets
const quickSetups = [
  {
    id: 'benches-2',
    label: '2 Benches',
    icon: Grid3x3,
    description: 'Side-by-side rolling benches',
    setup: {
      benches: 2,
      benchWidth: 4,
      benchLength: 'auto', // Will be calculated based on room
      benchHeight: 3,
      aisleWidth: 3
    }
  },
  {
    id: 'benches-3',
    label: '3 Benches',
    icon: Grid3x3,
    description: 'Three parallel benches',
    setup: {
      benches: 3,
      benchWidth: 4,
      benchLength: 'auto',
      benchHeight: 3,
      aisleWidth: 2.5
    }
  },
  {
    id: 'vertical-5',
    label: '5 Vertical Racks',
    icon: Layers3,
    description: '5 tiers, 2.5\' spacing, 1.5\' canopy clearance',
    setup: {
      racks: 1,
      tiers: 5,
      tierSpacing: 2.5,
      canopyClearance: 1.5,
      rackWidth: 4,
      rackLength: 'auto'
    }
  },
  {
    id: 'vertical-3x3',
    label: '3×3 Vertical',
    icon: Package,
    description: '3 racks with 3 tiers each',
    setup: {
      racks: 3,
      tiers: 3,
      tierSpacing: 3,
      canopyClearance: 1.5,
      rackWidth: 4,
      rackLength: 'auto',
      aisleWidth: 3
    }
  }
];

export function RoomConfigurationPanel({ onClose }: RoomConfigurationPanelProps) {
  const { state, dispatch, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const { room } = state;
  
  
  // Multi-step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Local state for form with defaults when room is null
  const [formData, setFormData] = useState({
    width: room?.width || 20,
    length: room?.length || 40,
    height: room?.height || 10,
    workingHeight: room?.workingHeight || 3,
    roomType: room?.roomType || 'cultivation',
    reflectances: {
      ceiling: room?.reflectances?.ceiling || 0.8,
      walls: room?.reflectances?.walls || 0.5,
      floor: room?.reflectances?.floor || 0.2
    },
    // New lighting-specific fields
    targetPPFD: room?.targetPPFD || 600,
    targetDLI: room?.targetDLI || 25,
    cropType: 'lettuce',
    growthStage: 'vegetative',
    selectedFixture: null as any,
    fixtureQuantity: 0,
    estimatedCoverage: 0,
    lightingStrategy: 'full', // Indoor rooms typically use full LED
  });

  const [selectedQuickSetup, setSelectedQuickSetup] = useState<string | null>(null);
  const [autoPopulate, setAutoPopulate] = useState(false);

  const handleQuickSize = (width: number, length: number) => {
    setFormData(prev => ({ ...prev, width, length }));
  };

  // Calculate fixture requirements based on PPFD target
  const calculateFixtureRequirements = (fixture: any) => {
    const roomArea = formData.width * formData.length;
    const mountingHeight = formData.workingHeight + 3; // Assume 3ft above working height
    
    // More accurate calculation for indoor cultivation
    const fixtureCoverage = 12; // Indoor fixtures typically cover ~12 sq ft effectively at target PPFD
    const estimatedQuantity = Math.ceil(roomArea / fixtureCoverage);
    
    return {
      quantity: estimatedQuantity,
      coverage: (estimatedQuantity * fixtureCoverage / roomArea) * 100,
      totalPower: estimatedQuantity * fixture.wattage,
      estimatedPPFD: formData.targetPPFD // Simplified - would use actual calculations
    };
  };

  const handleFixtureSelect = (fixture: any) => {
    const requirements = calculateFixtureRequirements(fixture);
    setFormData(prev => ({
      ...prev,
      selectedFixture: fixture,
      fixtureQuantity: requirements.quantity,
      estimatedCoverage: requirements.coverage
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const populateRoomWithSetup = (roomWidth: number, roomLength: number, roomHeight: number, setupId: string) => {
    const setup = quickSetups.find(s => s.id === setupId);
    if (!setup) return;

    const objects: any[] = [];
    const margin = 2; // Wall margin in feet

    if (setupId.includes('benches')) {
      // Calculate bench layout
      const numBenches = setup.setup.benches as number;
      const benchWidth = setup.setup.benchWidth as number;
      const aisleWidth = setup.setup.aisleWidth as number;
      const benchLength = roomLength - (2 * margin);
      const benchHeight = setup.setup.benchHeight as number;
      
      const totalBenchWidth = numBenches * benchWidth;
      const totalAisleWidth = (numBenches - 1) * aisleWidth;
      const totalWidth = totalBenchWidth + totalAisleWidth;
      
      if (totalWidth > roomWidth - (2 * margin)) {
        showNotification('warning', 'Benches may be too wide for room. Adjusting layout...');
      }
      
      const startX = (roomWidth - totalWidth) / 2;
      
      for (let i = 0; i < numBenches; i++) {
        const x = startX + (i * (benchWidth + aisleWidth));
        const benchId = `bench_${Date.now()}_${i}`;
        
        objects.push({
          id: benchId,
          type: 'rack',
          x: x,
          y: margin,
          width: benchWidth,
          length: benchLength,
          height: benchHeight,
          enabled: true,
          customName: `Rolling Bench ${i + 1}`,
          properties: {
            tiers: 1,
            tierHeight: benchHeight,
            canopyHeight: benchHeight - 0.5,
            style: 'rolling-bench'
          }
        });
      }
    } else if (setupId.includes('vertical')) {
      // Calculate vertical rack layout
      const numRacks = setup.setup.racks as number;
      const numTiers = setup.setup.tiers as number;
      const tierSpacing = setup.setup.tierSpacing as number;
      const canopyClearance = setup.setup.canopyClearance as number;
      const rackWidth = setup.setup.rackWidth as number;
      const aisleWidth = setup.setup.aisleWidth || 4;
      const rackLength = roomLength - (2 * margin);
      
      const totalRackHeight = numTiers * tierSpacing;
      if (totalRackHeight > roomHeight - 2) {
        showNotification('warning', 'Rack height exceeds room height. Reducing tiers...');
      }
      
      const totalRackWidth = numRacks * rackWidth;
      const totalAisleWidth = (numRacks - 1) * aisleWidth;
      const totalWidth = totalRackWidth + totalAisleWidth;
      
      const startX = (roomWidth - totalWidth) / 2;
      
      for (let i = 0; i < numRacks; i++) {
        const x = startX + (i * (rackWidth + aisleWidth));
        const rackId = `rack_${Date.now()}_${i}`;
        
        objects.push({
          id: rackId,
          type: 'rack',
          x: x,
          y: margin,
          width: rackWidth,
          length: rackLength,
          height: totalRackHeight,
          enabled: true,
          customName: `Vertical Rack ${i + 1}`,
          properties: {
            tiers: numTiers,
            tierHeight: tierSpacing,
            canopyHeight: tierSpacing - canopyClearance,
            style: 'vertical-farm'
          }
        });
      }
    }

    return objects;
  };

  const handleApply = () => {
    // Validate dimensions
    if (formData.width < 5 || formData.width > 500) {
      showNotification('error', 'Room width must be between 5 and 500 feet');
      return;
    }
    if (formData.length < 5 || formData.length > 500) {
      showNotification('error', 'Room length must be between 5 and 500 feet');
      return;
    }
    if (formData.height < 6 || formData.height > 50) {
      showNotification('error', 'Room height must be between 6 and 50 feet');
      return;
    }

    // Create or update room
    const roomData = {
      width: formData.width,
      length: formData.length,
      height: formData.height,
      ceilingHeight: formData.height,
      workingHeight: formData.workingHeight,
      roomType: formData.roomType,
      targetPPFD: formData.targetPPFD,
      targetDLI: formData.targetDLI,
      reflectances: formData.reflectances,
      windows: [] // Indoor rooms typically have no windows
    };

    if (!room) {
      dispatch({ type: 'SET_ROOM', payload: roomData });
      showNotification('success', `Created ${formData.width}×${formData.length}ft indoor room`);
    } else {
      dispatch({ type: 'UPDATE_ROOM', payload: roomData });
      showNotification('success', `Indoor room updated: ${formData.width}×${formData.length}ft`);
    }

    // Add fixtures if selected
    if (formData.selectedFixture && formData.fixtureQuantity > 0) {
      const roomCenterX = formData.width / 2;
      const roomCenterY = formData.length / 2;
      const spacing = Math.sqrt((formData.width * formData.length) / formData.fixtureQuantity);
      const cols = Math.floor(formData.width / spacing);
      const rows = Math.ceil(formData.fixtureQuantity / cols);
      
      const startX = roomCenterX - ((cols - 1) * spacing) / 2;
      const startY = roomCenterY - ((rows - 1) * spacing) / 2;
      
      for (let row = 0; row < rows && (row * cols + 0) < formData.fixtureQuantity; row++) {
        for (let col = 0; col < cols && (row * cols + col) < formData.fixtureQuantity; col++) {
          addObject({
            type: 'fixture',
            x: startX + col * spacing,
            y: startY + row * spacing,
            z: formData.workingHeight + 3,
            rotation: 0,
            width: 4,
            length: 2,
            height: 0.5,
            enabled: true,
            model: {
              ...formData.selectedFixture,
              isDLC: true
            },
            dimmingLevel: 100
          });
        }
      }
      
      showNotification('success', `Added ${formData.fixtureQuantity} ${formData.selectedFixture.model} fixtures`);
    }

    // Add quick setup objects if selected
    if (selectedQuickSetup && autoPopulate) {
      const setupObjects = populateRoomWithSetup(formData.width, formData.length, formData.height, selectedQuickSetup);
      setupObjects.forEach(obj => {
        dispatch({
          type: 'ADD_OBJECT',
          payload: obj
        });
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" style={{ zIndex: 9999 }}>
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
          <div className="flex items-center gap-3">
            <Home className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">
              {room ? 'Edit Indoor Room Configuration' : 'Smart Indoor Room Setup Wizard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
              <div className="flex gap-1">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i + 1 <= currentStep ? 'bg-purple-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Room Dimensions & Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Home className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Room Dimensions & Type</h3>
                <p className="text-gray-400">Set up your indoor cultivation space</p>
              </div>

              {/* Room Type */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Room Type</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'cultivation', label: 'Cultivation', icon: Leaf },
                    { id: 'warehouse', label: 'Warehouse', icon: Warehouse },
                    { id: 'commercial', label: 'Commercial', icon: Building }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFormData(prev => ({ ...prev, roomType: type.id }))}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        formData.roomType === type.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <type.icon className="w-6 h-6" />
                      <span className="text-sm font-medium text-white">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Size Presets */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Size Presets</h4>
                <div className="grid grid-cols-3 gap-3">
                  {quickSizes.slice(0, 6).map(size => (
                    <button
                      key={size.label}
                      onClick={() => handleQuickSize(size.width, size.length)}
                      className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                    >
                      <div className="text-white font-medium">{size.label}</div>
                      <div className="text-xs text-gray-400">{size.width * size.length} sq ft</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Dimensions */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Width (ft)</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Length (ft)</label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData(prev => ({ ...prev, length: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Height (ft)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Crop & Lighting Requirements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Sprout className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Crop & Lighting Requirements</h3>
                <p className="text-gray-400">Define what you're growing and lighting needs</p>
              </div>

              {/* Crop Type Selection */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Primary Crop</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'lettuce', label: 'Lettuce', ppfd: 250, dli: 12, icon: '🥬' },
                    { value: 'tomato', label: 'Tomatoes', ppfd: 400, dli: 20, icon: '🍅' },
                    { value: 'herbs', label: 'Herbs', ppfd: 300, dli: 15, icon: '🌿' },
                    { value: 'cannabis', label: 'Cannabis', ppfd: 800, dli: 35, icon: '🌱' },
                  ].map(crop => (
                    <button
                      key={crop.value}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        cropType: crop.value,
                        targetPPFD: crop.ppfd,
                        targetDLI: crop.dli
                      }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.cropType === crop.value 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">{crop.icon}</div>
                      <div className="font-medium text-white">{crop.label}</div>
                      <div className="text-xs text-gray-400">{crop.ppfd} PPFD</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Growth Stage */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Growth Stage</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'seedling', label: 'Sprout', ppfd: 200 },
                    { value: 'vegetative', label: 'Vegetative', ppfd: 400 },
                    { value: 'flowering', label: 'Flowering', ppfd: 800 },
                  ].map(stage => (
                    <button
                      key={stage.value}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        growthStage: stage.value,
                        targetPPFD: Math.max(prev.targetPPFD, stage.ppfd)
                      }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.growthStage === stage.value 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium text-white">{stage.label}</div>
                      <div className="text-xs text-gray-400">{stage.ppfd}+ PPFD</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target PPFD */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Target PPFD (μmol/m²/s)
                </label>
                <input
                  type="number"
                  value={formData.targetPPFD}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetPPFD: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Recommended ranges: Sprout 100-300, Vegetative 400-600, Flowering 600-1000+
                </p>
              </div>
            </div>
          )}

          {/* Step 3: DLC Fixture Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Lightbulb className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">DLC Fixture Selection</h3>
                <p className="text-gray-400">Choose the most efficient certified fixtures for your setup</p>
              </div>

              {/* Fixture Selection */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Available DLC Fixtures</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {dlcFixturesDatabase
                    .filter(fixture => 
                      fixture.application?.includes('indoor') || 
                      fixture.application?.includes('horticulture') ||
                      fixture.application?.includes('cultivation')
                    )
                    .slice(0, 10)
                    .map((fixture, idx) => {
                      const requirements = calculateFixtureRequirements(fixture);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleFixtureSelect(fixture)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            formData.selectedFixture?.model === fixture.model
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium text-white">{fixture.manufacturer} {fixture.model}</h5>
                              <p className="text-sm text-gray-400">
                                {fixture.wattage}W • {fixture.ppf} PPF • {(fixture.ppf / fixture.wattage).toFixed(2)} μmol/J
                              </p>
                              <p className="text-xs text-gray-500">{fixture.formFactor} • {fixture.spectrum}</p>
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-white font-medium">{requirements.quantity} fixtures</div>
                              <div className="text-gray-400">{requirements.totalPower}W total</div>
                              <div className="text-gray-500">{(requirements.totalPower / (formData.width * formData.length)).toFixed(1)} W/ft²</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Selected Fixture Summary */}
              {formData.selectedFixture && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Selected Configuration</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Fixture:</span>
                      <div className="text-white font-medium">{formData.selectedFixture.model}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Quantity:</span>
                      <div className="text-white font-medium">{formData.fixtureQuantity} units</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Power:</span>
                      <div className="text-white font-medium">{formData.fixtureQuantity * formData.selectedFixture.wattage}W</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Power Density:</span>
                      <div className="text-white font-medium">
                        {((formData.fixtureQuantity * formData.selectedFixture.wattage) / (formData.width * formData.length)).toFixed(1)} W/ft²
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Efficiency:</span>
                      <div className="text-white font-medium">{(formData.selectedFixture.ppf / formData.selectedFixture.wattage).toFixed(2)} μmol/J</div>
                    </div>
                    <div>
                      <span className="text-gray-400">DLC Certified:</span>
                      <div className="text-green-400 font-medium">✓ Yes</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Final Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <Home className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Review & Create</h3>
                <p className="text-gray-400">Review your indoor room configuration before creating</p>
              </div>

              {/* Summary */}
              <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Room Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Dimensions:</span>
                      <div className="text-white font-medium">{formData.width} × {formData.length} × {formData.height} ft</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <div className="text-white font-medium capitalize">{formData.roomType}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Area:</span>
                      <div className="text-white font-medium">{formData.width * formData.length} sq ft</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Volume:</span>
                      <div className="text-white font-medium">{formData.width * formData.length * formData.height} cu ft</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-white font-medium mb-2">Crop Requirements</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Crop Type:</span>
                      <div className="text-white font-medium capitalize">{formData.cropType}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Growth Stage:</span>
                      <div className="text-white font-medium capitalize">{formData.growthStage}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Target PPFD:</span>
                      <div className="text-white font-medium">{formData.targetPPFD} μmol/m²/s</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Target DLI:</span>
                      <div className="text-white font-medium">{formData.targetDLI} mol/m²/day</div>
                    </div>
                  </div>
                </div>

                {formData.selectedFixture && (
                  <div>
                    <h5 className="text-white font-medium mb-2">Lighting System</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Fixture:</span>
                        <div className="text-white font-medium">{formData.selectedFixture.manufacturer} {formData.selectedFixture.model}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Quantity:</span>
                        <div className="text-white font-medium">{formData.fixtureQuantity} units</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Total Power:</span>
                        <div className="text-white font-medium">{formData.fixtureQuantity * formData.selectedFixture.wattage}W</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Power Density:</span>
                        <div className="text-white font-medium">
                          {((formData.fixtureQuantity * formData.selectedFixture.wattage) / (formData.width * formData.length)).toFixed(1)} W/ft²
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">System Efficiency:</span>
                        <div className="text-white font-medium">{(formData.selectedFixture.ppf / formData.selectedFixture.wattage).toFixed(2)} μmol/J</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Estimated Annual Power Cost:</span>
                        <div className="text-white font-medium">
                          ${(((formData.fixtureQuantity * formData.selectedFixture.wattage) / 1000) * 12 * 365 * 0.12).toLocaleString()} 
                          <span className="text-xs text-gray-400 ml-1">@ $0.12/kWh</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-800">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-3">
              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Create Indoor Room
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

