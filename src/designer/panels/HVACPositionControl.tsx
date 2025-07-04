'use client';

import React, { useState, useEffect } from 'react';
import { 
  Move, 
  RotateCw, 
  MapPin, 
  Wind, 
  Thermometer,
  Settings,
  Eye,
  EyeOff,
  Target,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Maximize,
  Minimize,
  RefreshCw,
  CheckCircle,
  X
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface HVACPositionControlProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function HVACPositionControl({ isOpen = true, onClose }: HVACPositionControlProps) {
  const { state, updateObject } = useDesigner();
  const { showNotification } = useNotifications();
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [showAirflow, setShowAirflow] = useState(true);
  const [precisionMode, setPrecisionMode] = useState(false);
  const [showCFDPreview, setShowCFDPreview] = useState(false);

  // Get all HVAC equipment
  const hvacEquipment = state.objects.filter(obj => obj.type === 'equipment');

  // Position adjustment step size
  const stepSize = precisionMode ? 0.1 : 0.5;

  const handlePositionChange = (axis: 'x' | 'y' | 'z', delta: number) => {
    if (!selectedEquipment) return;

    const newPosition = {
      ...selectedEquipment,
      [axis]: Math.max(0, Math.min(
        axis === 'x' ? state.room.length : 
        axis === 'y' ? state.room.width : 
        state.room.height,
        selectedEquipment[axis] + delta
      ))
    };

    updateObject(selectedEquipment.id, newPosition);
    setSelectedEquipment(newPosition);
    showNotification('info', `${selectedEquipment.name} moved`);
  };

  const handleRotationChange = (delta: number) => {
    if (!selectedEquipment) return;

    const newRotation = (selectedEquipment.rotation || 0) + delta;
    const normalizedRotation = ((newRotation % 360) + 360) % 360;

    const updated = {
      ...selectedEquipment,
      rotation: normalizedRotation
    };

    updateObject(selectedEquipment.id, updated);
    setSelectedEquipment(updated);
    showNotification('info', `${selectedEquipment.name} rotated to ${normalizedRotation}°`);
  };

  const handleSizeChange = (axis: 'width' | 'length' | 'height', delta: number) => {
    if (!selectedEquipment) return;

    const newSize = Math.max(0.5, (selectedEquipment[axis] || 2) + delta);
    const updated = {
      ...selectedEquipment,
      [axis]: newSize
    };

    updateObject(selectedEquipment.id, updated);
    setSelectedEquipment(updated);
  };

  const getOptimalPlacement = (equipment: any) => {
    if (!state.room) return null;

    const suggestions = [];

    switch (equipment.category) {
      case 'MiniSplit':
        suggestions.push({
          position: 'High Wall Mount',
          x: state.room.length * 0.1,
          y: state.room.width * 0.5,
          z: state.room.height * 0.85,
          reason: 'Optimal for air distribution and maintenance access'
        });
        suggestions.push({
          position: 'Corner Mount',
          x: state.room.length * 0.1,
          y: state.room.width * 0.1,
          z: state.room.height * 0.85,
          reason: 'Maximum coverage with diagonal airflow'
        });
        break;
      
      case 'RTU':
        suggestions.push({
          position: 'Roof Center',
          x: state.room.length * 0.5,
          y: state.room.width * 0.5,
          z: state.room.height,
          reason: 'Balanced ductwork distribution and structural support'
        });
        break;
      
      case 'AHU':
        suggestions.push({
          position: 'Mechanical Room',
          x: state.room.length * 0.05,
          y: state.room.width * 0.05,
          z: 0,
          reason: 'Easy maintenance access and optimal ductwork routing'
        });
        break;
    }

    return suggestions;
  };

  const applyOptimalPlacement = (suggestion: any) => {
    if (!selectedEquipment) return;

    const updated = {
      ...selectedEquipment,
      x: suggestion.x,
      y: suggestion.y,
      z: suggestion.z
    };

    updateObject(selectedEquipment.id, updated);
    setSelectedEquipment(updated);
    showNotification('success', `Applied optimal placement: ${suggestion.position}`);
  };

  const calculateAirflowImpact = (equipment: any) => {
    if (!equipment || !state.room) return null;

    // Simple airflow impact calculation
    const roomVolume = state.room.length * state.room.width * state.room.height;
    const capacity = equipment.coolingCapacity || equipment.heatingCapacity || 24000;
    const airChangesPerHour = (capacity / 12000) * 400 / roomVolume; // Rough CFM estimate

    // Position factors
    const centerDistance = Math.sqrt(
      Math.pow(equipment.x - state.room.length / 2, 2) + 
      Math.pow(equipment.y - state.room.width / 2, 2)
    );
    const maxDistance = Math.sqrt(
      Math.pow(state.room.length / 2, 2) + 
      Math.pow(state.room.width / 2, 2)
    );
    const centerFactor = 1 - (centerDistance / maxDistance);

    // Height factor (optimal around 8-10 feet for mini-splits)
    const optimalHeight = state.room.height * 0.75;
    const heightFactor = 1 - Math.abs(equipment.z - optimalHeight) / state.room.height;

    const overallEfficiency = (centerFactor * 0.4 + heightFactor * 0.6) * 100;

    return {
      airChangesPerHour: airChangesPerHour.toFixed(1),
      efficiency: Math.max(0, Math.min(100, overallEfficiency)).toFixed(0),
      coverage: Math.min(100, (capacity / 12000) * 400 / roomVolume * 100).toFixed(0)
    };
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Move className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">HVAC Positioning</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Equipment Selector */}
        <select
          value={selectedEquipment?.id || ''}
          onChange={(e) => {
            const equipment = hvacEquipment.find(eq => eq.id === e.target.value);
            setSelectedEquipment(equipment);
          }}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="">Select HVAC Equipment</option>
          {hvacEquipment.map(eq => (
            <option key={eq.id} value={eq.id}>
              {(eq as any).category} - {(eq as any).name}
            </option>
          ))}
        </select>
      </div>

      {selectedEquipment ? (
        <div className="flex-1 overflow-y-auto">
          {/* Current Position Display */}
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Current Position</h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-400">X (Length)</span>
                <div className="text-white font-mono">{selectedEquipment.x?.toFixed(1) || '0.0'} ft</div>
              </div>
              <div>
                <span className="text-gray-400">Y (Width)</span>
                <div className="text-white font-mono">{selectedEquipment.y?.toFixed(1) || '0.0'} ft</div>
              </div>
              <div>
                <span className="text-gray-400">Z (Height)</span>
                <div className="text-white font-mono">{selectedEquipment.z?.toFixed(1) || '0.0'} ft</div>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-gray-400 text-xs">Rotation</span>
              <div className="text-white font-mono text-xs">{selectedEquipment.rotation || 0}°</div>
            </div>
          </div>

          {/* Position Controls */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Position Controls</h3>
              <button
                onClick={() => setPrecisionMode(!precisionMode)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  precisionMode 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {precisionMode ? 'Precision' : 'Standard'}
              </button>
            </div>

            {/* X/Y Movement Grid */}
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-2">Horizontal Movement (XY)</div>
              <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
                <div></div>
                <button
                  onClick={() => handlePositionChange('y', stepSize)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  <ArrowUp className="w-3 h-3 text-white" />
                </button>
                <div></div>
                <button
                  onClick={() => handlePositionChange('x', -stepSize)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 text-white" />
                </button>
                <div className="p-2 bg-gray-800 rounded">
                  <Crosshair className="w-3 h-3 text-gray-400" />
                </div>
                <button
                  onClick={() => handlePositionChange('x', stepSize)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  <ArrowRight className="w-3 h-3 text-white" />
                </button>
                <div></div>
                <button
                  onClick={() => handlePositionChange('y', -stepSize)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  <ArrowDown className="w-3 h-3 text-white" />
                </button>
                <div></div>
              </div>
            </div>

            {/* Z Movement */}
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-2">Vertical Movement (Z)</div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handlePositionChange('z', stepSize)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-xs"
                >
                  Up ↑
                </button>
                <button
                  onClick={() => handlePositionChange('z', -stepSize)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-xs"
                >
                  Down ↓
                </button>
              </div>
            </div>

            {/* Rotation */}
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-2">Rotation</div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handleRotationChange(-15)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleRotationChange(15)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-xs"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Step Size Indicator */}
            <div className="text-center text-xs text-gray-500">
              Step: {stepSize} ft, Rotation: 15°
            </div>
          </div>

          {/* Airflow Analysis */}
          {selectedEquipment && (
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Airflow Analysis</h3>
                <button
                  onClick={() => setShowAirflow(!showAirflow)}
                  className={`p-1 rounded transition-colors ${
                    showAirflow ? 'text-blue-400' : 'text-gray-500'
                  }`}
                >
                  {showAirflow ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {(() => {
                const impact = calculateAirflowImpact(selectedEquipment);
                return impact ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Air Changes/Hr:</span>
                      <span className="text-white">{impact.airChangesPerHour}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Efficiency:</span>
                      <span className={`${
                        parseInt(impact.efficiency) > 80 ? 'text-green-400' :
                        parseInt(impact.efficiency) > 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {impact.efficiency}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Coverage:</span>
                      <span className="text-white">{impact.coverage}%</span>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Optimal Placement Suggestions */}
          {selectedEquipment && (
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Optimal Placement</h3>
              {getOptimalPlacement(selectedEquipment)?.map((suggestion, index) => (
                <div key={index} className="mb-3 p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{suggestion.position}</span>
                    <button
                      onClick={() => applyOptimalPlacement(suggestion)}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{suggestion.reason}</div>
                  <div className="text-xs text-gray-500">
                    X: {suggestion.x.toFixed(1)} Y: {suggestion.y.toFixed(1)} Z: {suggestion.z.toFixed(1)}
                  </div>
                </div>
              )) || (
                <div className="text-xs text-gray-500 italic">No specific recommendations for this equipment type</div>
              )}
            </div>
          )}

          {/* CFD Impact Preview */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">CFD Impact</h3>
              <button
                onClick={() => setShowCFDPreview(!showCFDPreview)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  showCFDPreview 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Preview
              </button>
            </div>
            
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Wind className="w-3 h-3" />
                <span>Position affects airflow patterns and mixing</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-3 h-3" />
                <span>Height impacts temperature stratification</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3" />
                <span>Rotation determines discharge direction</span>
              </div>
            </div>

            {showCFDPreview && (
              <div className="mt-3 p-3 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                <div className="text-xs text-purple-400 mb-2">CFD Analysis Tips:</div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Avoid short-circuiting between supply and return</li>
                  <li>• Consider obstacle wake effects</li>
                  <li>• Maintain 8-10 ft minimum throw distance</li>
                  <li>• Account for thermal plume interactions</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Select HVAC equipment to position</p>
          </div>
        </div>
      )}
    </div>
  );
}