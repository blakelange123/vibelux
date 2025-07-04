'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  Wifi,
  Cable,
  Search,
  CheckCircle,
  AlertCircle,
  Settings,
  Package,
  Zap,
  Droplets,
  Wind,
  Sun,
  Thermometer,
  Activity,
  Database,
  Network
} from 'lucide-react';
import { EquipmentType, EQUIPMENT_TEMPLATES } from '@/lib/hmi/equipment-registry';

interface EquipmentSetupWizardProps {
  onComplete: (equipment: any[]) => void;
  onClose: () => void;
}

const EQUIPMENT_CATEGORIES = [
  {
    name: 'HVAC',
    icon: Wind,
    types: [
      { type: EquipmentType.FAN, name: 'Exhaust Fan', icon: Wind },
      { type: EquipmentType.EXHAUST_FAN, name: 'Intake Fan', icon: Wind },
      { type: EquipmentType.AC_UNIT, name: 'AC Unit', icon: Thermometer },
      { type: EquipmentType.DEHUMIDIFIER, name: 'Dehumidifier', icon: Droplets },
      { type: EquipmentType.HUMIDIFIER, name: 'Humidifier', icon: Droplets },
      { type: EquipmentType.HEATER, name: 'Heater', icon: Thermometer }
    ]
  },
  {
    name: 'Lighting',
    icon: Sun,
    types: [
      { type: EquipmentType.LED_FIXTURE, name: 'LED Fixture', icon: Sun },
      { type: EquipmentType.HPS_FIXTURE, name: 'HPS Fixture', icon: Sun },
      { type: EquipmentType.LIGHT_CONTROLLER, name: 'Light Controller', icon: Settings }
    ]
  },
  {
    name: 'Irrigation',
    icon: Droplets,
    types: [
      { type: EquipmentType.PUMP, name: 'Water Pump', icon: Activity },
      { type: EquipmentType.DOSING_PUMP, name: 'Dosing Pump', icon: Activity },
      { type: EquipmentType.TANK, name: 'Water Tank', icon: Database },
      { type: EquipmentType.VALVE, name: 'Valve', icon: Settings },
      { type: EquipmentType.FILTER, name: 'Filter', icon: Package }
    ]
  },
  {
    name: 'Electrical',
    icon: Zap,
    types: [
      { type: EquipmentType.PANEL, name: 'Electrical Panel', icon: Zap },
      { type: EquipmentType.RELAY, name: 'Relay', icon: Settings },
      { type: EquipmentType.VFD, name: 'VFD', icon: Activity },
      { type: EquipmentType.CONTACTOR, name: 'Contactor', icon: Zap }
    ]
  }
];

const CONNECTION_METHODS = [
  {
    id: 'modbus',
    name: 'Modbus TCP/RTU',
    icon: Cable,
    description: 'Industrial protocol for PLCs and controllers'
  },
  {
    id: 'bacnet',
    name: 'BACnet',
    icon: Network,
    description: 'Building automation protocol'
  },
  {
    id: 'mqtt',
    name: 'MQTT',
    icon: Wifi,
    description: 'IoT messaging protocol'
  },
  {
    id: 'api',
    name: 'REST API',
    icon: Database,
    description: 'HTTP-based integration'
  },
  {
    id: 'manual',
    name: 'Manual Entry',
    icon: Settings,
    description: 'Configure equipment manually'
  }
];

export function EquipmentSetupWizard({ onComplete, onClose }: EquipmentSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [manualEquipment, setManualEquipment] = useState<any[]>([]);
  
  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    if (method === 'manual') {
      setStep(3); // Skip scanning for manual
    } else {
      setStep(2);
      startDeviceScan(method);
    }
  };
  
  const startDeviceScan = async (method: string) => {
    setIsScanning(true);
    
    // Simulate device scanning
    setTimeout(() => {
      const mockDevices = generateMockDevices(method);
      setDiscoveredDevices(mockDevices);
      setIsScanning(false);
    }, 3000);
  };
  
  const generateMockDevices = (method: string) => {
    const devices = [];
    
    if (method === 'modbus') {
      devices.push(
        {
          id: 'modbus-1',
          name: 'Quest 506 Dehumidifier',
          type: EquipmentType.DEHUMIDIFIER,
          address: '192.168.1.101:502',
          registers: { power: 1, setpoint: 2, current_rh: 3 }
        },
        {
          id: 'modbus-2',
          name: 'VFD Fan Controller',
          type: EquipmentType.VFD,
          address: '192.168.1.102:502',
          registers: { speed: 10, power: 11, fault: 12 }
        }
      );
    } else if (method === 'mqtt') {
      devices.push(
        {
          id: 'mqtt-1',
          name: 'Trolmaster Hydro-X',
          type: 'controller',
          topic: 'trolmaster/hydrox/+',
          devices: ['temp-1', 'humidity-1', 'co2-1']
        }
      );
    }
    
    return devices;
  };
  
  const addManualEquipment = (type: EquipmentType, name: string) => {
    const newEquipment = {
      id: `manual-${Date.now()}`,
      type,
      name,
      ...EQUIPMENT_TEMPLATES[type]
    };
    setManualEquipment([...manualEquipment, newEquipment]);
  };
  
  const completeSetup = () => {
    const equipment = selectedMethod === 'manual' 
      ? manualEquipment 
      : discoveredDevices.filter(d => selectedDevices.has(d.id));
    
    onComplete(equipment);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Equipment Setup Wizard</h2>
            <p className="text-sm text-gray-400">
              Step {step} of 4 - {
                step === 1 ? 'Connection Method' :
                step === 2 ? 'Device Discovery' :
                step === 3 ? 'Equipment Configuration' :
                'Review & Confirm'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Step 1: Connection Method */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-6">
                How would you like to connect your equipment?
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CONNECTION_METHODS.map(method => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleMethodSelect(method.id)}
                      className="p-6 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-purple-500 transition-all text-left"
                    >
                      <Icon className="w-8 h-8 text-purple-400 mb-3" />
                      <h4 className="font-medium text-white mb-1">{method.name}</h4>
                      <p className="text-sm text-gray-400">{method.description}</p>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Integration Support</p>
                    <p className="text-gray-400">
                      VibeLux supports direct integration with Trolmaster, Argus, Priva, and other major control systems.
                      Equipment can also be added manually or through standard protocols.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Device Discovery */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-6">
                Discovering devices on your network...
              </h3>
              
              {isScanning ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <p className="mt-4 text-gray-400">Scanning for {selectedMethod} devices...</p>
                </div>
              ) : (
                <div>
                  {discoveredDevices.length > 0 ? (
                    <>
                      <p className="text-gray-400 mb-4">
                        Found {discoveredDevices.length} device(s). Select the ones you want to add:
                      </p>
                      
                      <div className="space-y-3">
                        {discoveredDevices.map(device => (
                          <label
                            key={device.id}
                            className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDevices.has(device.id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedDevices);
                                if (e.target.checked) {
                                  newSelected.add(device.id);
                                } else {
                                  newSelected.delete(device.id);
                                }
                                setSelectedDevices(newSelected);
                              }}
                              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                            />
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{device.name}</h4>
                              <p className="text-sm text-gray-400">
                                {device.address || device.topic} • Type: {device.type}
                              </p>
                            </div>
                            
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          </label>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => startDeviceScan(selectedMethod)}
                        className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        Scan Again
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No devices found on this network.</p>
                      <button
                        onClick={() => startDeviceScan(selectedMethod)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: Manual Equipment Configuration */}
          {step === 3 && selectedMethod === 'manual' && (
            <div>
              <h3 className="text-lg font-medium text-white mb-6">
                Add equipment manually
              </h3>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Equipment Categories */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Select Equipment Type</h4>
                  
                  <div className="space-y-4">
                    {EQUIPMENT_CATEGORIES.map(category => {
                      const Icon = category.icon;
                      return (
                        <div key={category.name}>
                          <button
                            onClick={() => setSelectedCategory(
                              selectedCategory === category.name ? '' : category.name
                            )}
                            className="w-full flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
                          >
                            <Icon className="w-5 h-5 text-purple-400" />
                            <span className="font-medium text-white">{category.name}</span>
                            <ChevronRight className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${
                              selectedCategory === category.name ? 'rotate-90' : ''
                            }`} />
                          </button>
                          
                          {selectedCategory === category.name && (
                            <div className="mt-2 ml-8 space-y-2">
                              {category.types.map(type => {
                                const TypeIcon = type.icon;
                                return (
                                  <button
                                    key={type.type}
                                    onClick={() => {
                                      const name = prompt(`Enter name for ${type.name}:`);
                                      if (name) {
                                        addManualEquipment(type.type, name);
                                      }
                                    }}
                                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded"
                                  >
                                    <TypeIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-300">{type.name}</span>
                                    <Plus className="w-4 h-4 text-gray-500 ml-auto" />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Added Equipment */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    Added Equipment ({manualEquipment.length})
                  </h4>
                  
                  {manualEquipment.length > 0 ? (
                    <div className="space-y-2">
                      {manualEquipment.map((eq, index) => (
                        <div
                          key={eq.id}
                          className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                        >
                          <Package className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{eq.name}</p>
                            <p className="text-xs text-gray-400">{eq.type}</p>
                          </div>
                          <button
                            onClick={() => {
                              setManualEquipment(manualEquipment.filter((_, i) => i !== index));
                            }}
                            className="p-1 hover:bg-gray-700 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-800/50 rounded-lg">
                      <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No equipment added yet</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Import from file */}
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Import from file</h4>
                    <p className="text-sm text-gray-400">Upload a CSV or JSON file with equipment data</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Choose File
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Review & Confirm */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-6">
                Review your equipment configuration
              </h3>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="grid gap-4">
                  <div className="flex justify-between pb-4 border-b border-gray-700">
                    <span className="text-gray-400">Connection Method</span>
                    <span className="text-white font-medium">{selectedMethod}</span>
                  </div>
                  
                  <div className="flex justify-between pb-4 border-b border-gray-700">
                    <span className="text-gray-400">Total Equipment</span>
                    <span className="text-white font-medium">
                      {selectedMethod === 'manual' ? manualEquipment.length : selectedDevices.size}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 mb-3">Equipment Summary</p>
                    <div className="space-y-2">
                      {(selectedMethod === 'manual' ? manualEquipment : 
                        discoveredDevices.filter(d => selectedDevices.has(d.id))
                      ).map(eq => (
                        <div key={eq.id} className="flex items-center gap-3 p-2 bg-gray-900 rounded">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-white">{eq.name}</span>
                          <span className="text-xs text-gray-500">• {eq.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="text-sm text-gray-300">
                      <p className="font-medium mb-1">Ready to create HMI</p>
                      <p className="text-gray-400">
                        Your equipment will be automatically arranged in the HMI view. 
                        You can customize the layout and add more equipment later.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
              }
            }}
            disabled={step === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${
                  s === step ? 'bg-purple-500' : 
                  s < step ? 'bg-purple-500/50' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => {
              if (step < 4) {
                if (step === 2 && selectedMethod !== 'manual') {
                  setStep(4); // Skip manual config for auto-discovered
                } else {
                  setStep(step + 1);
                }
              } else {
                completeSetup();
              }
            }}
            disabled={
              (step === 2 && !isScanning && selectedDevices.size === 0) ||
              (step === 3 && selectedMethod === 'manual' && manualEquipment.length === 0)
            }
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {step === 4 ? 'Complete Setup' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}