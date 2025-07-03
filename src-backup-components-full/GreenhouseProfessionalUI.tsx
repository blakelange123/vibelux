'use client';

import React, { useState } from 'react';
import { 
  Home, Wind, Thermometer, Droplets, Sun, Zap, 
  Settings, BarChart3, Info, Download, ChevronRight,
  Factory, Gauge, CloudRain, Fan, Lightbulb
} from 'lucide-react';
import {
  PROFESSIONAL_GREENHOUSE_TYPES,
  GreenhouseDesigner,
  type ProfessionalGreenhouse
} from '@/lib/greenhouse-professional';
import { GreenhouseClimateIntegration } from './GreenhouseClimateIntegration';
import { CropGrowthManager } from './CropGrowthManager';
import { GreenhouseAutomationPanel } from './GreenhouseAutomationPanel';

interface GreenhouseProfessionalUIProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGreenhouse: (greenhouse: ProfessionalGreenhouse) => void;
}

export function GreenhouseProfessionalUI({
  isOpen,
  onClose,
  onApplyGreenhouse
}: GreenhouseProfessionalUIProps) {
  const [activeTab, setActiveTab] = useState<'structure' | 'environmental' | 'systems' | 'crops' | 'climate' | 'automation' | 'analysis'>('structure');
  const [greenhouseType, setGreenhouseType] = useState<keyof typeof PROFESSIONAL_GREENHOUSE_TYPES>('venlo');
  const [dimensions, setDimensions] = useState({ width: 30, length: 100 });
  const [climate, setClimate] = useState('temperate');
  const [cropType, setCropType] = useState('tomatoes');
  
  // Environmental settings
  const [targetTemp, setTargetTemp] = useState({ day: 24, night: 18 });
  const [targetHumidity, setTargetHumidity] = useState({ min: 60, max: 80 });
  const [co2Target, setCo2Target] = useState(1000);
  const [ventilation, setVentilation] = useState({ natural: 25, forced: 1 });
  
  if (!isOpen) return null;

  const generateGreenhouse = () => {
    const greenhouse = GreenhouseDesigner.designOptimalLayout(
      dimensions,
      cropType,
      climate
    );
    onApplyGreenhouse(greenhouse);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Professional Greenhouse Designer</h2>
            <p className="text-gray-600">Design industry-standard greenhouse facilities</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'structure', label: 'Structure', icon: Home },
            { id: 'environmental', label: 'Environmental', icon: Thermometer },
            { id: 'systems', label: 'Systems', icon: Settings },
            { id: 'crops', label: 'Crop Planning', icon: Factory },
            { id: 'climate', label: 'Climate Monitor', icon: CloudRain },
            { id: 'automation', label: 'Automation', icon: Gauge },
            { id: 'analysis', label: 'Analysis', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 p-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'structure' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Greenhouse Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(PROFESSIONAL_GREENHOUSE_TYPES).map(([key, type]) => (
                    <div
                      key={key}
                      onClick={() => setGreenhouseType(key as any)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        greenhouseType === key
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold">{type.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">Bay Width: {type.bayWidth}m</p>
                        <p className="text-xs text-gray-500">Height: {type.typicalHeight}m</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Width (m)
                    </label>
                    <input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="10"
                      max="200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Length (m)
                    </label>
                    <input
                      type="number"
                      value={dimensions.length}
                      onChange={(e) => setDimensions({ ...dimensions, length: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="20"
                      max="500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Location & Climate</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Climate Zone
                    </label>
                    <select
                      value={climate}
                      onChange={(e) => setClimate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="tropical">Tropical</option>
                      <option value="arid">Arid/Desert</option>
                      <option value="temperate">Temperate</option>
                      <option value="continental">Continental</option>
                      <option value="polar">Polar/Subarctic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Crop
                    </label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="tomatoes">Tomatoes</option>
                      <option value="cucumbers">Cucumbers</option>
                      <option value="peppers">Peppers</option>
                      <option value="cannabis">Cannabis</option>
                      <option value="leafy_greens">Leafy Greens</option>
                      <option value="ornamentals">Ornamentals</option>
                      <option value="berries">Berries</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'environmental' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Temperature Control</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day Temperature (°C)
                    </label>
                    <input
                      type="number"
                      value={targetTemp.day}
                      onChange={(e) => setTargetTemp({ ...targetTemp, day: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="15"
                      max="35"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Night Temperature (°C)
                    </label>
                    <input
                      type="number"
                      value={targetTemp.night}
                      onChange={(e) => setTargetTemp({ ...targetTemp, night: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="10"
                      max="25"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Humidity Management</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum RH (%)
                    </label>
                    <input
                      type="number"
                      value={targetHumidity.min}
                      onChange={(e) => setTargetHumidity({ ...targetHumidity, min: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="40"
                      max="70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum RH (%)
                    </label>
                    <input
                      type="number"
                      value={targetHumidity.max}
                      onChange={(e) => setTargetHumidity({ ...targetHumidity, max: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="60"
                      max="90"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">CO₂ Enrichment</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target CO₂ Level (ppm)
                  </label>
                  <input
                    type="number"
                    value={co2Target}
                    onChange={(e) => setCo2Target(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="400"
                    max="1500"
                    step="50"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Ventilation Strategy</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Natural Vent Area (% of floor)
                    </label>
                    <input
                      type="number"
                      value={ventilation.natural}
                      onChange={(e) => setVentilation({ ...ventilation, natural: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="15"
                      max="40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Air Changes per Hour
                    </label>
                    <input
                      type="number"
                      value={ventilation.forced}
                      onChange={(e) => setVentilation({ ...ventilation, forced: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="5"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'systems' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    Heating System
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>Type: Hot Water Boiler</p>
                    <p>Fuel: Natural Gas</p>
                    <p>Distribution: Perimeter Rails + Under-bench</p>
                    <p>Capacity: Auto-calculated</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Wind className="w-5 h-5 text-blue-500" />
                    Cooling System
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>Type: {climate === 'arid' ? 'Pad & Fan' : 'Natural Ventilation'}</p>
                    <p>Stages: 3-stage control</p>
                    <p>HAF Fans: Included</p>
                    <p>Efficiency: 85%</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Droplets className="w-5 h-5 text-cyan-500" />
                    Irrigation System
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>Type: {cropType === 'leafy_greens' ? 'Ebb & Flow' : 'Drip'}</p>
                    <p>Zones: 4 independent</p>
                    <p>Control: Climate computer integrated</p>
                    <p>Fertigation: Included</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Sun className="w-5 h-5 text-yellow-500" />
                    Screen System
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>Type: Energy/Shade combo</p>
                    <p>Shading: 50%</p>
                    <p>Energy Saving: 25%</p>
                    <p>Control: Light + Temperature</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-purple-500" />
                    Supplemental Lighting
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>Type: LED Top Light</p>
                    <p>Intensity: 200 μmol/m²/s</p>
                    <p>Control: DLI Target + Dimming</p>
                    <p>Efficiency: 3.0 μmol/J</p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Settings className="w-5 h-5 text-gray-500" />
                    Automation
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>Climate Computer: Priva/Hoogendoorn</p>
                    <p>Sensors: Full weather station</p>
                    <p>Integration: Cloud-based</p>
                    <p>AI Optimization: Available</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crops' && (
            <div className="space-y-6">
              <CropGrowthManager
                selectedCrop={cropType === 'tomatoes' ? 'tomato_indeterminate' : 
                             cropType === 'cannabis' ? 'cannabis_hybrid' :
                             cropType === 'leafy_greens' ? 'lettuce_butterhead' : 
                             'basil_genovese'}
                growArea={dimensions.width * dimensions.length}
                currentDLI={17}
              />
            </div>
          )}

          {activeTab === 'climate' && (
            <div className="space-y-6">
              <GreenhouseClimateIntegration
                greenhouseId={`greenhouse-${Date.now()}`}
                showControls={true}
              />
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-6">
              <GreenhouseAutomationPanel />
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Environmental Performance</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">85%</p>
                    <p className="text-sm text-gray-600">Light Transmission</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">92%</p>
                    <p className="text-sm text-gray-600">Climate Uniformity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">3.2</p>
                    <p className="text-sm text-gray-600">Energy Efficiency</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">45</p>
                    <p className="text-sm text-gray-600">kg/m² Yield Potential</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Cost Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span>Structure & Covering</span>
                    <span className="font-medium">${((dimensions.width * dimensions.length) * 120).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Environmental Systems</span>
                    <span className="font-medium">${((dimensions.width * dimensions.length) * 80).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Automation & Controls</span>
                    <span className="font-medium">${((dimensions.width * dimensions.length) * 40).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold">
                    <span>Total Investment</span>
                    <span>${((dimensions.width * dimensions.length) * 240).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Sustainability Metrics</h4>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Water Usage</p>
                    <p className="text-lg text-green-600">95% efficient (recirculating)</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Energy Source</p>
                    <p className="text-lg text-green-600">CHP Ready + Solar Compatible</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Carbon Footprint</p>
                    <p className="text-lg text-green-600">30% lower than field production</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Certifications</p>
                    <p className="text-lg text-green-600">GlobalGAP, MPS-A Ready</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total Area: {(dimensions.width * dimensions.length).toLocaleString()} m² 
            ({(dimensions.width * dimensions.length * 10.764).toLocaleString()} ft²)
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                // Export functionality
                alert('Export functionality would generate detailed plans, BOQ, and specifications');
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Design
            </button>
            <button
              onClick={generateGreenhouse}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              Apply Design
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}