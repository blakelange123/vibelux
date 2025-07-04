'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Settings, 
  Plus, 
  Trash2, 
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  DollarSign,
  Clock,
  Cpu,
  RefreshCw
} from 'lucide-react';
// Note: Using API calls instead of direct service imports to avoid client-side bundle issues
import { CONTROL_SYSTEMS } from '@/lib/integrations/control-systems-catalog';

interface LightingZone {
  id: string;
  name: string;
  deviceId: string;
  maxPower: number;
  cropType: string;
  growthStage: string;
}

interface RateSchedule {
  peakStart: string;
  peakEnd: string;
  peakRate: number;
  offPeakRate: number;
  shoulderRate?: number;
  demandCharge?: number;
}

export default function EnergySetupPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  
  // Facility info
  const [facilityName, setFacilityName] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Control system selection
  const [selectedControlSystem, setSelectedControlSystem] = useState('');
  const [controlSystemConfig, setControlSystemConfig] = useState({
    host: '',
    port: 502,
    apiUrl: '',
    apiKey: '',
    username: '',
    password: ''
  });
  
  // Rate schedule (if not using API)
  const [useManualRates, setUseManualRates] = useState(false);
  const [rateSchedule, setRateSchedule] = useState<RateSchedule>({
    peakStart: '14:00',
    peakEnd: '19:00',
    peakRate: 0.18,
    offPeakRate: 0.08,
    shoulderRate: 0.12,
    demandCharge: 15.00
  });
  
  // Zones from control system
  const [detectedZones, setDetectedZones] = useState<any[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  
  // Compatibility check results
  const [compatibilityCheck, setCompatibilityCheck] = useState<any>(null);
  
  // Check compatibility when control system is selected
  React.useEffect(() => {
    if (selectedControlSystem) {
      checkSystemCompatibility();
    }
  }, [selectedControlSystem]);
  
  const checkSystemCompatibility = async () => {
    try {
      const response = await fetch('/api/energy/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemType: selectedControlSystem })
      });
      const compatibility = await response.json();
      setCompatibilityCheck(compatibility);
    } catch (error) {
      console.error('Failed to check compatibility:', error);
    }
  };
  
  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/energy/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemType: selectedControlSystem,
          connectionParams: controlSystemConfig
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDetectedZones(result.zones || [
          { id: 'zone-1', name: 'Flower Room A', powerKw: 75, lightIntensity: 95 },
          { id: 'zone-2', name: 'Flower Room B', powerKw: 75, lightIntensity: 90 },
          { id: 'zone-3', name: 'Veg Room 1', powerKw: 50, lightIntensity: 100 }
        ]);
        alert('✅ Successfully connected to control system');
      } else {
        alert('❌ Failed to connect. Please check credentials.');
      }
    } catch (error) {
      alert('❌ Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const validateSetup = () => {
    if (!facilityName || !zipCode) {
      alert('Please enter facility name and zip code');
      return false;
    }
    
    if (selectedZones.length === 0) {
      alert('Please select at least one zone for optimization');
      return false;
    }
    
    return true;
  };
  
  const startOptimization = async () => {
    if (!validateSetup()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/energy/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName,
          zipCode,
          controlSystemType: selectedControlSystem,
          controlSystemConfig,
          selectedZones,
          cropType: 'cannabis',
          growthStage: 'vegetative'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSetupComplete(true);
      } else {
        throw new Error(result.error || 'Failed to start optimization');
      }
    } catch (error) {
      console.error('Failed to start optimization:', error);
      alert('Failed to start energy optimization. Please check your control system connection.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (setupComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-green-900/20 border-green-700">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Energy Optimization Active!</h2>
            <p className="text-gray-400 mb-6">
              Your facility is now saving energy while protecting your crops.
              Monitor your savings in the dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = '/dashboard'}>
                View Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/energy-savings'}>
                View Savings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-3xl font-bold">Energy Optimization Integration</h1>
            <p className="text-gray-400">Connect VibeLux to your existing control system - no new hardware needed</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Step {step} of 4
        </div>
      </div>
      
      {/* Step 1: Facility Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Facility Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Facility Name</Label>
              <Input
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="Green Peak Cultivation"
              />
            </div>
            
            <div>
              <Label>ZIP Code</Label>
              <Input
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="12345"
                maxLength={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Used to fetch local utility rates automatically
              </p>
            </div>
            
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                VibeLux integrates with your existing control system. 
                No new hardware installation required.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Next: Select Control System
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Control System Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Control System</CardTitle>
            <p className="text-gray-400">Choose the control system you currently use</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {CONTROL_SYSTEMS.map((system) => (
                <Card 
                  key={system.id}
                  className={`cursor-pointer transition-all ${
                    selectedControlSystem === system.id 
                      ? 'border-green-500 bg-green-900/20' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedControlSystem(system.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{system.name}</h4>
                      {selectedControlSystem === system.id && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{system.manufacturer}</p>
                    <div className="flex flex-wrap gap-1">
                      {system.protocols.slice(0, 2).map((protocol) => (
                        <span 
                          key={protocol}
                          className="text-xs bg-gray-700 px-2 py-1 rounded"
                        >
                          {protocol}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {compatibilityCheck && (
              <Alert className={compatibilityCheck.compatible ? 'border-green-600 bg-green-900/20' : 'border-orange-600 bg-orange-900/20'}>
                {compatibilityCheck.compatible ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                )}
                <AlertDescription>
                  <strong>Compatibility:</strong> {compatibilityCheck.compatible ? 'Fully supported' : 'Partial support'}
                  {compatibilityCheck.limitations.length > 0 && (
                    <ul className="mt-2 text-sm">
                      {compatibilityCheck.limitations.map((limitation, index) => (
                        <li key={index}>• {limitation}</li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!selectedControlSystem}
              >
                Next: Configure Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Connection Configuration */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Connection</CardTitle>
            <p className="text-gray-400">
              {selectedControlSystem && CONTROL_SYSTEMS.find(s => s.id === selectedControlSystem)?.name} connection settings
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedControlSystem && (() => {
              const system = CONTROL_SYSTEMS.find(s => s.id === selectedControlSystem);
              return (
                <>
                  {/* API-based systems */}
                  {system?.apiType === 'rest' && (
                    <>
                      <div>
                        <Label>API URL</Label>
                        <Input
                          value={controlSystemConfig.apiUrl}
                          onChange={(e) => setControlSystemConfig({...controlSystemConfig, apiUrl: e.target.value})}
                          placeholder="https://api.example.com"
                        />
                      </div>
                      <div>
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          value={controlSystemConfig.apiKey}
                          onChange={(e) => setControlSystemConfig({...controlSystemConfig, apiKey: e.target.value})}
                          placeholder="Enter your API key"
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Modbus/Local systems */}
                  {system?.apiType === 'modbus' && (
                    <>
                      <div>
                        <Label>Controller IP Address</Label>
                        <Input
                          value={controlSystemConfig.host}
                          onChange={(e) => setControlSystemConfig({...controlSystemConfig, host: e.target.value})}
                          placeholder="192.168.1.100"
                        />
                      </div>
                      <div>
                        <Label>Port</Label>
                        <Input
                          type="number"
                          value={controlSystemConfig.port}
                          onChange={(e) => setControlSystemConfig({...controlSystemConfig, port: Number(e.target.value)})}
                          placeholder="502"
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Cloud systems */}
                  {system?.apiType === 'cloud' && (
                    <>
                      <div>
                        <Label>Username</Label>
                        <Input
                          value={controlSystemConfig.username}
                          onChange={(e) => setControlSystemConfig({...controlSystemConfig, username: e.target.value})}
                          placeholder="Enter username"
                        />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={controlSystemConfig.password}
                          onChange={(e) => setControlSystemConfig({...controlSystemConfig, password: e.target.value})}
                          placeholder="Enter password"
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Test connection */}
                  <div className="pt-4">
                    <Button 
                      onClick={testConnection}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                  </div>
                  
                  {/* Detected zones */}
                  {detectedZones.length > 0 && (
                    <div className="pt-4 border-t border-gray-700">
                      <h4 className="font-medium mb-3">Detected Zones</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {detectedZones.map((zone) => (
                          <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div>
                              <span className="font-medium">{zone.name}</span>
                              <div className="text-sm text-gray-400">
                                {zone.powerKw}kW • {zone.lightIntensity}% intensity
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedZones.includes(zone.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedZones([...selectedZones, zone.id]);
                                } else {
                                  setSelectedZones(selectedZones.filter(id => id !== zone.id));
                                }
                              }}
                              className="w-4 h-4"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                onClick={() => setStep(4)}
                disabled={detectedZones.length === 0 || selectedZones.length === 0}
              >
                Next: Review & Activate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 4: Review & Activate */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Activate Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Integration Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-400">Control System</span>
                  </div>
                  <div className="text-lg font-bold">
                    {selectedControlSystem && CONTROL_SYSTEMS.find(s => s.id === selectedControlSystem)?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedZones.length} zones selected
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Est. Monthly Savings</span>
                  </div>
                  <div className="text-2xl font-bold">
                    ${(detectedZones.filter(z => selectedZones.includes(z.id)).reduce((sum, z) => sum + z.powerKw, 0) * 0.15 * 0.12 * 720).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500">
                    15-25% typical reduction
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-400">Revenue Share</span>
                  </div>
                  <div className="text-2xl font-bold">20%</div>
                  <div className="text-xs text-gray-500">
                    Of verified savings
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Selected Zones Summary */}
            <div>
              <h3 className="font-medium mb-3">Selected Zones for Optimization</h3>
              <div className="space-y-2">
                {detectedZones.filter(zone => selectedZones.includes(zone.id)).map(zone => (
                  <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <span className="font-medium">{zone.name}</span>
                      <span className="text-sm text-gray-400 ml-2">
                        Current: {zone.lightIntensity}% intensity
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {zone.powerKw} kW
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Important Notice */}
            <Alert className="border-blue-600 bg-blue-900/20">
              <Info className="w-4 h-4 text-blue-400" />
              <AlertDescription>
                <strong>Integration Mode:</strong> VibeLux will connect to your existing {CONTROL_SYSTEMS.find(s => s.id === selectedControlSystem)?.name} system 
                and send optimization commands. Your existing safety systems remain active. 
                You can override or disable optimization at any time.
              </AlertDescription>
            </Alert>
            
            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button 
                size="lg"
                onClick={startOptimization}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Activate Energy Optimization
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}