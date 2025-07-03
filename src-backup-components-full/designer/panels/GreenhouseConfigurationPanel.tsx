'use client';

import React, { useState } from 'react';
import { X, Trees, Sun, CloudRain, Wind, Maximize, ChevronRight, ChevronLeft, Target, Lightbulb } from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { dlcFixturesDatabase } from '@/lib/dlc-fixtures-data';

interface GreenhouseConfigurationPanelProps {
  onClose: () => void;
}

export function GreenhouseConfigurationPanel({ onClose }: GreenhouseConfigurationPanelProps) {
  const { state, dispatch, addObject } = useDesigner();
  const { showNotification } = useNotifications();
  const { room } = state;
  
  // Multi-step wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Local state for form with greenhouse-specific defaults
  const [formData, setFormData] = useState({
    width: room?.width || 30,
    length: room?.length || 96,
    height: room?.height || 14,
    gutterHeight: room?.gutterHeight || 10,
    workingHeight: room?.workingHeight || 3,
    structureType: room?.structureType || 'single-span',
    glazingType: room?.glazingType || 'polycarbonate',
    lightTransmission: room?.lightTransmission || 0.85,
    location: {
      latitude: room?.location?.latitude || 40.7128,
      longitude: room?.location?.longitude || -74.0060,
    },
    supplementalLighting: room?.supplementalLighting || 'photoperiodic',
    targetDLI: room?.targetDLI || 20,
    targetPPFD: room?.targetPPFD || 400,
    shading: room?.shading || false,
    shadingPercentage: room?.shadingPercentage || 30,
    // New lighting-specific fields
    lightingStrategy: 'supplemental', // 'supplemental' or 'full'
    selectedFixture: null as any,
    fixtureQuantity: 0,
    estimatedCoverage: 0,
    cropType: 'lettuce',
  });

  const handleQuickSize = (width: number, length: number, type: string) => {
    setFormData(prev => ({ 
      ...prev, 
      width, 
      length,
      structureType: type,
      height: type === 'gutter-connect' ? 16 : 14,
      gutterHeight: type === 'gutter-connect' ? 12 : 10
    }));
  };

  // Calculate fixture requirements based on PPFD target
  const calculateFixtureRequirements = (fixture: any) => {
    const roomArea = formData.width * formData.length;
    const mountingHeight = formData.workingHeight + 3; // Assume 3ft above working height
    
    // Simple calculation - actual would need photometric data
    const fixtureCoverage = 16; // Assume each fixture covers ~16 sq ft effectively at target PPFD
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

  const handleApply = () => {
    // Validate dimensions
    if (formData.width < 20 || formData.width > 200) {
      showNotification('error', 'Greenhouse width must be between 20 and 200 feet');
      return;
    }
    if (formData.length < 30 || formData.length > 500) {
      showNotification('error', 'Greenhouse length must be between 30 and 500 feet');
      return;
    }

    // Create or update greenhouse
    const greenhouseData = {
      width: formData.width,
      length: formData.length,
      height: formData.height,
      ceilingHeight: formData.height,
      gutterHeight: formData.gutterHeight,
      workingHeight: formData.workingHeight,
      roomType: 'greenhouse',
      structureType: formData.structureType,
      glazingType: formData.glazingType,
      lightTransmission: formData.lightTransmission,
      location: formData.location,
      supplementalLighting: formData.supplementalLighting,
      targetDLI: formData.targetDLI,
      targetPPFD: formData.targetPPFD,
      shading: formData.shading,
      shadingPercentage: formData.shadingPercentage,
      reflectances: {
        ceiling: formData.lightTransmission, // Light transmission through roof
        walls: formData.glazingType === 'glass' ? 0.9 : 0.85,
        floor: 0.2
      },
      windows: [] // Greenhouses are essentially all windows
    };

    if (!room) {
      dispatch({ type: 'SET_ROOM', payload: greenhouseData });
      showNotification('success', `Created ${formData.width}×${formData.length}ft greenhouse`);
    } else {
      dispatch({ type: 'UPDATE_ROOM', payload: greenhouseData });
      showNotification('success', `Greenhouse updated: ${formData.width}×${formData.length}ft`);
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
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900">
          <div className="flex items-center gap-3">
            <Trees className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">
              {room ? 'Edit Greenhouse Configuration' : 'Smart Greenhouse Setup Wizard'}
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
                      i + 1 <= currentStep ? 'bg-green-500' : 'bg-gray-600'
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
          {/* Step 1: Basic Greenhouse Setup */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Trees className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Greenhouse Dimensions & Type</h3>
                <p className="text-gray-400">Let's start with your greenhouse structure and size</p>
              </div>

              {/* Quick Presets */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Presets</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleQuickSize(30, 96, 'single-span')}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                  >
                    <div className="text-white font-medium">30×96 Single Span</div>
                    <div className="text-xs text-gray-400">Standard hobby</div>
                  </button>
                  <button
                    onClick={() => handleQuickSize(42, 144, 'gutter-connect')}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                  >
                    <div className="text-white font-medium">42×144 Gutter</div>
                    <div className="text-xs text-gray-400">Commercial</div>
                  </button>
                  <button
                    onClick={() => handleQuickSize(84, 200, 'gutter-connect')}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                  >
                    <div className="text-white font-medium">84×200 Large</div>
                    <div className="text-xs text-gray-400">Industrial</div>
                  </button>
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Width (ft)</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Length (ft)</label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData(prev => ({ ...prev, length: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* Structure Type */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Structure Type</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      name="structureType"
                      value="single-span"
                      checked={formData.structureType === 'single-span'}
                      onChange={(e) => setFormData(prev => ({ ...prev, structureType: e.target.value }))}
                      className="sr-only"
                    />
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.structureType === 'single-span' 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <div className="font-medium text-white">Single Span</div>
                      <div className="text-xs text-gray-400">Simple A-frame</div>
                    </div>
                  </label>
                  <label className="relative">
                    <input
                      type="radio"
                      name="structureType"
                      value="gutter-connect"
                      checked={formData.structureType === 'gutter-connect'}
                      onChange={(e) => setFormData(prev => ({ ...prev, structureType: e.target.value }))}
                      className="sr-only"
                    />
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.structureType === 'gutter-connect' 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <div className="font-medium text-white">Gutter Connect</div>
                      <div className="text-xs text-gray-400">Multi-bay system</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Lighting Requirements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Lighting Requirements</h3>
                <p className="text-gray-400">Define your target PPFD and lighting strategy</p>
              </div>

              {/* Crop Type Selection */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Crop Type</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'lettuce', label: 'Lettuce', ppfd: 200, dli: 12 },
                    { value: 'tomato', label: 'Tomatoes', ppfd: 400, dli: 20 },
                    { value: 'cannabis', label: 'Cannabis', ppfd: 800, dli: 35 },
                  ].map(crop => (
                    <button
                      key={crop.value}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        cropType: crop.value,
                        targetPPFD: crop.ppfd,
                        targetDLI: crop.dli
                      }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.cropType === crop.value 
                          ? 'border-purple-500 bg-purple-500/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium text-white">{crop.label}</div>
                      <div className="text-xs text-gray-400">{crop.ppfd} PPFD</div>
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
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: Lettuce 150-250, Tomatoes 300-500, Cannabis 600-1000
                </p>
              </div>

              {/* Lighting Strategy */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Lighting Strategy</h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      name="lightingStrategy"
                      value="supplemental"
                      checked={formData.lightingStrategy === 'supplemental'}
                      onChange={(e) => setFormData(prev => ({ ...prev, lightingStrategy: e.target.value }))}
                      className="sr-only"
                    />
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.lightingStrategy === 'supplemental' 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <div className="font-medium text-white">Supplemental</div>
                      <div className="text-xs text-gray-400">Natural + LED</div>
                    </div>
                  </label>
                  <label className="relative">
                    <input
                      type="radio"
                      name="lightingStrategy"
                      value="full"
                      checked={formData.lightingStrategy === 'full'}
                      onChange={(e) => setFormData(prev => ({ ...prev, lightingStrategy: e.target.value }))}
                      className="sr-only"
                    />
                    <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.lightingStrategy === 'full' 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}>
                      <div className="font-medium text-white">Full LED</div>
                      <div className="text-xs text-gray-400">100% artificial</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: DLC Fixture Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Lightbulb className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">DLC Fixture Selection</h3>
                <p className="text-gray-400">Choose the most efficient DLC-certified fixtures</p>
              </div>

              {/* Fixture Selection */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Available DLC Fixtures</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {dlcFixturesDatabase
                    .filter(fixture => fixture.application?.includes('greenhouse') || fixture.application?.includes('horticulture'))
                    .slice(0, 8)
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
                              <p className="text-sm text-gray-400">{fixture.wattage}W • {fixture.ppf} PPF • {(fixture.ppf / fixture.wattage).toFixed(2)} μmol/J</p>
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-white font-medium">{requirements.quantity} fixtures</div>
                              <div className="text-gray-400">{requirements.totalPower}W total</div>
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
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Final Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <Trees className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Review & Create</h3>
                <p className="text-gray-400">Review your greenhouse configuration before creating</p>
              </div>

              {/* Summary */}
              <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Greenhouse Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Dimensions:</span>
                      <div className="text-white font-medium">{formData.width} × {formData.length} ft</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <div className="text-white font-medium capitalize">{formData.structureType.replace('-', ' ')}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Crop:</span>
                      <div className="text-white font-medium capitalize">{formData.cropType}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Target PPFD:</span>
                      <div className="text-white font-medium">{formData.targetPPFD} μmol/m²/s</div>
                    </div>
                  </div>
                </div>

                {formData.selectedFixture && (
                  <div>
                    <h5 className="text-white font-medium mb-2">Lighting System</h5>
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
                        <span className="text-gray-400">Efficiency:</span>
                        <div className="text-white font-medium">{(formData.selectedFixture.ppf / formData.selectedFixture.wattage).toFixed(2)} μmol/J</div>
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
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Create Greenhouse
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
