'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Thermometer, 
  Settings, 
  Plus,
  Trash2,
  Edit3,
  Lightbulb,
  Target,
  Activity,
  Gauge
} from 'lucide-react';

interface LEDFixture {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  specifications: {
    totalWattage: number;
    efficacy: number; // μmol/J
    efficiency: number; // percentage (90% = 10% heat)
    spectrum: {
      red: number;
      blue: number;
      white: number;
      farRed: number;
    };
    dimmingLevel: number; // 0-100%
    thermalDerating: {
      enabled: boolean;
      maxJunctionTemp: number; // °C
      deratingFactor: number; // %/°C
    };
  };
  thermal: {
    heatGeneration: number; // Calculated based on efficiency
    thermalResistance: number; // °C/W
    heatSinkMaterial: 'aluminum' | 'copper' | 'steel';
    heatSinkArea: number; // m²
    fanCooling: {
      enabled: boolean;
      airflow: number; // CFM
      power: number; // W
    };
  };
}

interface LEDControlPanelProps {
  fixtures: LEDFixture[];
  onFixturesChange: (fixtures: LEDFixture[]) => void;
  disabled?: boolean;
}

export function LEDControlPanel({ fixtures, onFixturesChange, disabled = false }: LEDControlPanelProps) {
  const [selectedFixture, setSelectedFixture] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Calculate heat generation based on electrical power and efficiency
  const calculateHeatGeneration = (fixture: LEDFixture): number => {
    const electricalPower = fixture.specifications.totalWattage * (fixture.specifications.dimmingLevel / 100);
    const efficiency = fixture.specifications.efficiency / 100;
    const lightPower = electricalPower * efficiency;
    const heatPower = electricalPower - lightPower;
    
    // Apply thermal derating if enabled
    if (fixture.specifications.thermalDerating.enabled) {
      // Simplified derating calculation - in reality would need junction temperature
      const ambientTemp = 25; // °C
      const junctionTemp = ambientTemp + (heatPower * fixture.thermal.thermalResistance);
      
      if (junctionTemp > fixture.specifications.thermalDerating.maxJunctionTemp) {
        const overTemp = junctionTemp - fixture.specifications.thermalDerating.maxJunctionTemp;
        const deratingFactor = 1 - (overTemp * fixture.specifications.thermalDerating.deratingFactor / 100);
        return heatPower * Math.max(0.1, deratingFactor); // Minimum 10% power
      }
    }
    
    return heatPower;
  };

  // Update fixture thermal properties when specifications change
  const updateFixture = (id: string, updates: Partial<LEDFixture>) => {
    const updatedFixtures = fixtures.map(fixture => {
      if (fixture.id === id) {
        const updated = { ...fixture, ...updates };
        
        // Recalculate heat generation
        updated.thermal.heatGeneration = calculateHeatGeneration(updated);
        
        return updated;
      }
      return fixture;
    });
    
    onFixturesChange(updatedFixtures);
  };

  const addNewFixture = () => {
    const newFixture: LEDFixture = {
      id: `led-${Date.now()}`,
      name: `LED Bank ${fixtures.length + 1}`,
      position: { x: 10, y: 10, z: 3 },
      dimensions: { width: 4, height: 4, depth: 0.1 },
      specifications: {
        totalWattage: 1000,
        efficacy: 2.5,
        efficiency: 45, // 45% efficient = 55% heat
        spectrum: { red: 40, blue: 20, white: 35, farRed: 5 },
        dimmingLevel: 100,
        thermalDerating: {
          enabled: true,
          maxJunctionTemp: 85,
          deratingFactor: 1.0
        }
      },
      thermal: {
        heatGeneration: 550, // Will be recalculated
        thermalResistance: 0.5,
        heatSinkMaterial: 'aluminum',
        heatSinkArea: 2.0,
        fanCooling: {
          enabled: false,
          airflow: 0,
          power: 0
        }
      }
    };
    
    newFixture.thermal.heatGeneration = calculateHeatGeneration(newFixture);
    onFixturesChange([...fixtures, newFixture]);
    setSelectedFixture(newFixture.id);
    setShowAddForm(false);
  };

  const removeFixture = (id: string) => {
    onFixturesChange(fixtures.filter(f => f.id !== id));
    if (selectedFixture === id) {
      setSelectedFixture(null);
    }
  };

  const selected = fixtures.find(f => f.id === selectedFixture);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          LED Fixtures
        </h4>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={disabled}
          className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add LED
        </button>
      </div>

      {/* Fixtures List */}
      <div className="space-y-2 mb-4">
        {fixtures.map(fixture => (
          <div 
            key={fixture.id} 
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedFixture === fixture.id 
                ? 'border-yellow-500 bg-yellow-500/10' 
                : 'border-gray-600 bg-gray-700 hover:bg-gray-650'
            }`}
            onClick={() => setSelectedFixture(fixture.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white">{fixture.name}</span>
                <p className="text-xs text-gray-400 mt-1">
                  {fixture.specifications.totalWattage}W | {fixture.thermal.heatGeneration.toFixed(0)}W heat | 
                  {fixture.specifications.dimmingLevel}% dimmed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  fixture.specifications.dimmingLevel > 90 ? 'bg-green-400' :
                  fixture.specifications.dimmingLevel > 50 ? 'bg-yellow-400' :
                  fixture.specifications.dimmingLevel > 0 ? 'bg-orange-400' :
                  'bg-gray-400'
                }`} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFixture(fixture.id);
                  }}
                  disabled={disabled}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {fixtures.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No LED fixtures configured</p>
            <p className="text-xs">Add fixtures to simulate thermal effects</p>
          </div>
        )}
      </div>

      {/* Selected Fixture Details */}
      {selected && (
        <div className="border-t border-gray-700 pt-4">
          <h5 className="font-medium text-white mb-3 flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            {selected.name} Configuration
          </h5>
          
          <div className="space-y-4">
            {/* Basic Properties */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Total Wattage
                </label>
                <input
                  type="number"
                  value={selected.specifications.totalWattage}
                  onChange={(e) => updateFixture(selected.id, {
                    specifications: {
                      ...selected.specifications,
                      totalWattage: Number(e.target.value)
                    }
                  })}
                  disabled={disabled}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Efficiency (%)
                </label>
                <input
                  type="number"
                  value={selected.specifications.efficiency}
                  onChange={(e) => updateFixture(selected.id, {
                    specifications: {
                      ...selected.specifications,
                      efficiency: Number(e.target.value)
                    }
                  })}
                  disabled={disabled}
                  min="10"
                  max="90"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white disabled:opacity-50"
                />
              </div>
            </div>

            {/* Dimming Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dimming Level: {selected.specifications.dimmingLevel}%
              </label>
              <input
                type="range"
                value={selected.specifications.dimmingLevel}
                onChange={(e) => updateFixture(selected.id, {
                  specifications: {
                    ...selected.specifications,
                    dimmingLevel: Number(e.target.value)
                  }
                })}
                disabled={disabled}
                min="0"
                max="100"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Off</span>
                <span>50%</span>
                <span>Full</span>
              </div>
            </div>

            {/* Position Controls */}
            <div>
              <h6 className="text-sm font-medium text-gray-300 mb-2">Position (meters)</h6>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">X</label>
                  <input
                    type="number"
                    value={selected.position.x}
                    onChange={(e) => updateFixture(selected.id, {
                      position: { ...selected.position, x: Number(e.target.value) }
                    })}
                    disabled={disabled}
                    step="0.1"
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Y</label>
                  <input
                    type="number"
                    value={selected.position.y}
                    onChange={(e) => updateFixture(selected.id, {
                      position: { ...selected.position, y: Number(e.target.value) }
                    })}
                    disabled={disabled}
                    step="0.1"
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Z</label>
                  <input
                    type="number"
                    value={selected.position.z}
                    onChange={(e) => updateFixture(selected.id, {
                      position: { ...selected.position, z: Number(e.target.value) }
                    })}
                    disabled={disabled}
                    step="0.1"
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Thermal Properties */}
            <div className="bg-gray-700 rounded-lg p-3">
              <h6 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                Thermal Properties
              </h6>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Heat Sink Material</label>
                  <select
                    value={selected.thermal.heatSinkMaterial}
                    onChange={(e) => updateFixture(selected.id, {
                      thermal: {
                        ...selected.thermal,
                        heatSinkMaterial: e.target.value as 'aluminum' | 'copper' | 'steel'
                      }
                    })}
                    disabled={disabled}
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white disabled:opacity-50"
                  >
                    <option value="aluminum">Aluminum</option>
                    <option value="copper">Copper</option>
                    <option value="steel">Steel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Thermal Resistance (°C/W)</label>
                  <input
                    type="number"
                    value={selected.thermal.thermalResistance}
                    onChange={(e) => updateFixture(selected.id, {
                      thermal: {
                        ...selected.thermal,
                        thermalResistance: Number(e.target.value)
                      }
                    })}
                    disabled={disabled}
                    step="0.1"
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Calculated Heat Output */}
              <div className="bg-gray-600 rounded p-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Calculated Heat Output:</span>
                  <span className="text-orange-400 font-medium">
                    {selected.thermal.heatGeneration.toFixed(0)} W
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-400">Light Output:</span>
                  <span className="text-green-400">
                    {(selected.specifications.totalWattage * (selected.specifications.dimmingLevel / 100) - selected.thermal.heatGeneration).toFixed(0)} W
                  </span>
                </div>
              </div>
            </div>

            {/* Fan Cooling */}
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h6 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Active Cooling
                </h6>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.thermal.fanCooling.enabled}
                    onChange={(e) => updateFixture(selected.id, {
                      thermal: {
                        ...selected.thermal,
                        fanCooling: {
                          ...selected.thermal.fanCooling,
                          enabled: e.target.checked
                        }
                      }
                    })}
                    disabled={disabled}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-300">Enabled</span>
                </label>
              </div>
              
              {selected.thermal.fanCooling.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Airflow (CFM)</label>
                    <input
                      type="number"
                      value={selected.thermal.fanCooling.airflow}
                      onChange={(e) => updateFixture(selected.id, {
                        thermal: {
                          ...selected.thermal,
                          fanCooling: {
                            ...selected.thermal.fanCooling,
                            airflow: Number(e.target.value)
                          }
                        }
                      })}
                      disabled={disabled}
                      className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Fan Power (W)</label>
                    <input
                      type="number"
                      value={selected.thermal.fanCooling.power}
                      onChange={(e) => updateFixture(selected.id, {
                        thermal: {
                          ...selected.thermal,
                          fanCooling: {
                            ...selected.thermal.fanCooling,
                            power: Number(e.target.value)
                          }
                        }
                      })}
                      disabled={disabled}
                      className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white disabled:opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {fixtures.length > 0 && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-yellow-400">
                {fixtures.reduce((sum, f) => sum + f.specifications.totalWattage * (f.specifications.dimmingLevel / 100), 0).toFixed(0)}W
              </div>
              <div className="text-xs text-gray-400">Total Power</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-400">
                {fixtures.reduce((sum, f) => sum + f.thermal.heatGeneration, 0).toFixed(0)}W
              </div>
              <div className="text-xs text-gray-400">Total Heat</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">
                {(fixtures.reduce((sum, f) => sum + f.specifications.totalWattage * (f.specifications.dimmingLevel / 100) - f.thermal.heatGeneration, 0)).toFixed(0)}W
              </div>
              <div className="text-xs text-gray-400">Light Output</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}