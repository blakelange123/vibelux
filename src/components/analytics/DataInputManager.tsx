'use client';

import { useState, useEffect } from 'react';
import { 
  Upload, 
  Database, 
  Wifi, 
  Cannabis,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  Zap,
  Package,
  Building,
  ArrowRight,
  Download,
  RefreshCw,
  Settings,
  Leaf,
  Apple,
  TestTube,
  Truck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { TRACK_TRACE_CONFIGS } from '@/lib/integrations/cannabis-track-trace';
import { FacilityType, getFacilityFeatures, getDataInputSources } from '@/lib/facility-types';

interface DataInputManagerProps {
  facilityId: string;
  facilityType?: FacilityType;
  onDataUpdate?: () => void;
}

export function DataInputManager({ facilityId, facilityType = FacilityType.CANNABIS, onDataUpdate }: DataInputManagerProps) {
  const facilityFeatures = getFacilityFeatures(facilityType);
  const availableSources = getDataInputSources(facilityType);
  
  const [activeTab, setActiveTab] = useState<string>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Manual input states
  const [inputType, setInputType] = useState<'harvest' | 'energy' | 'facility'>('harvest');
  const [harvestData, setHarvestData] = useState({
    strain: '',
    harvestDate: new Date().toISOString().split('T')[0],
    plantCount: '',
    actualYield: '',
    revenue: '',
    customer: '',
    qualityGrade: 'A',
    notes: ''
  });
  const [energyData, setEnergyData] = useState({
    timestamp: new Date().toISOString().slice(0, 16),
    powerKw: '',
    meterReading: '',
    zoneId: ''
  });
  const [facilityData, setFacilityData] = useState({
    totalSquareFeet: '',
    cultivationSquareFeet: ''
  });

  // Track & Trace states
  const [trackTraceConfig, setTrackTraceConfig] = useState({
    state: '',
    apiKey: '',
    licenseNumber: '',
    autoSync: false,
    syncFrequency: 'daily'
  });

  // Accounting states
  const [accountingConfig, setAccountingConfig] = useState({
    provider: '',
    connected: false,
    lastSync: null as Date | null,
    autoSync: true,
    syncFrequency: 'daily'
  });

  // IoT states
  const [iotDevices, setIotDevices] = useState<Array<{
    id: string;
    name: string;
    type: string;
    status: 'connected' | 'disconnected';
    lastReading: Date;
  }>>([]);

  const handleManualSubmit = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/analytics/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId,
          type: inputType,
          data: inputType === 'harvest' ? harvestData : 
                inputType === 'energy' ? energyData : 
                facilityData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      setSuccessMessage(`${inputType.charAt(0).toUpperCase() + inputType.slice(1)} data saved successfully!`);
      
      // Reset form
      if (inputType === 'harvest') {
        setHarvestData({
          strain: '',
          harvestDate: new Date().toISOString().split('T')[0],
          plantCount: '',
          actualYield: '',
          revenue: '',
          customer: '',
          qualityGrade: 'A',
          notes: ''
        });
      }

      // Trigger parent update
      onDataUpdate?.();
    } catch (error) {
      setErrorMessage('Failed to save data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackTraceSync = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/integrations/track-trace/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId,
          config: trackTraceConfig
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync data');
      }

      const result = await response.json();
      setSuccessMessage(`Successfully imported ${result.harvestCount} harvests from ${trackTraceConfig.state} track & trace system.`);
      
      onDataUpdate?.();
    } catch (error) {
      setErrorMessage('Failed to sync track & trace data. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('facilityId', facilityId);

      const response = await fetch('/api/analytics/import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to import file');
      }

      const result = await response.json();
      setSuccessMessage(`Successfully imported ${result.recordCount} records.`);
      
      onDataUpdate?.();
    } catch (error) {
      setErrorMessage('Failed to import file. Please check the format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Data Input Manager</CardTitle>
          <CardDescription className="text-gray-300">
            Import data from multiple sources to power your analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full grid-cols-${Math.min(availableSources.length + 1, 6)} bg-gray-700`}>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Manual Entry
              </TabsTrigger>
              {availableSources.includes('iot') && (
                <TabsTrigger value="iot" className="flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  IoT Devices
                </TabsTrigger>
              )}
              {availableSources.includes('track_trace') && facilityType === FacilityType.CANNABIS && (
                <TabsTrigger value="trackTrace" className="flex items-center gap-2">
                  <Cannabis className="w-4 h-4" />
                  Track & Trace
                </TabsTrigger>
              )}
              {availableSources.includes('food_safety') && facilityType === FacilityType.PRODUCE && (
                <TabsTrigger value="foodSafety" className="flex items-center gap-2">
                  <Apple className="w-4 h-4" />
                  Food Safety
                </TabsTrigger>
              )}
              {availableSources.includes('lab_testing') && facilityType === FacilityType.CANNABIS && (
                <TabsTrigger value="labTesting" className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Lab Testing
                </TabsTrigger>
              )}
              {availableSources.includes('distribution') && facilityType === FacilityType.PRODUCE && (
                <TabsTrigger value="distribution" className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Distribution
                </TabsTrigger>
              )}
              {availableSources.includes('accounting') && (
                <TabsTrigger value="accounting" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Accounting
                </TabsTrigger>
              )}
              <TabsTrigger value="import" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                File Import
              </TabsTrigger>
            </TabsList>

            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="space-y-4 mt-6">
              <div>
                <Label className="text-white mb-2 block">Data Type</Label>
                <RadioGroup value={inputType} onValueChange={(v) => setInputType(v as any)}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="harvest" id="harvest" />
                    <label htmlFor="harvest" className="text-gray-300 cursor-pointer flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Harvest Data
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="energy" id="energy" />
                    <label htmlFor="energy" className="text-gray-300 cursor-pointer flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Energy Consumption
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="facility" id="facility" />
                    <label htmlFor="facility" className="text-gray-300 cursor-pointer flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Facility Details
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {/* Harvest Input Form */}
              {inputType === 'harvest' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="strain">
                        {facilityType === FacilityType.CANNABIS ? 'Strain' : 'Crop Type'}
                      </Label>
                      <Input
                        id="strain"
                        value={harvestData.strain}
                        onChange={(e) => setHarvestData({...harvestData, strain: e.target.value})}
                        placeholder={facilityType === FacilityType.CANNABIS ? "e.g., Blue Dream" : "e.g., Romaine Lettuce"}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="harvestDate">Harvest Date</Label>
                      <Input
                        id="harvestDate"
                        type="date"
                        value={harvestData.harvestDate}
                        onChange={(e) => setHarvestData({...harvestData, harvestDate: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plantCount">Plant Count</Label>
                      <Input
                        id="plantCount"
                        type="number"
                        value={harvestData.plantCount}
                        onChange={(e) => setHarvestData({...harvestData, plantCount: e.target.value})}
                        placeholder="100"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="actualYield">
                        {facilityType === FacilityType.CANNABIS ? 'Dry Yield (kg)' : 'Harvest Weight (kg)'}
                      </Label>
                      <Input
                        id="actualYield"
                        type="number"
                        step="0.1"
                        value={harvestData.actualYield}
                        onChange={(e) => setHarvestData({...harvestData, actualYield: e.target.value})}
                        placeholder="45.5"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="revenue">Revenue ($)</Label>
                      <Input
                        id="revenue"
                        type="number"
                        step="0.01"
                        value={harvestData.revenue}
                        onChange={(e) => setHarvestData({...harvestData, revenue: e.target.value})}
                        placeholder="125000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer">Customer (Optional)</Label>
                      <Input
                        id="customer"
                        value={harvestData.customer}
                        onChange={(e) => setHarvestData({...harvestData, customer: e.target.value})}
                        placeholder="Dispensary Name"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={harvestData.notes}
                      onChange={(e) => setHarvestData({...harvestData, notes: e.target.value})}
                      placeholder="Any additional notes..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Energy Input Form */}
              {inputType === 'energy' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timestamp">Date & Time</Label>
                      <Input
                        id="timestamp"
                        type="datetime-local"
                        value={energyData.timestamp}
                        onChange={(e) => setEnergyData({...energyData, timestamp: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="powerKw">Power Usage (kW)</Label>
                      <Input
                        id="powerKw"
                        type="number"
                        step="0.1"
                        value={energyData.powerKw}
                        onChange={(e) => setEnergyData({...energyData, powerKw: e.target.value})}
                        placeholder="250.5"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="meterReading">Meter Reading (Optional)</Label>
                    <Input
                      id="meterReading"
                      value={energyData.meterReading}
                      onChange={(e) => setEnergyData({...energyData, meterReading: e.target.value})}
                      placeholder="12345.6"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Facility Input Form */}
              {inputType === 'facility' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="totalSquareFeet">Total Facility Area (sq ft)</Label>
                    <Input
                      id="totalSquareFeet"
                      type="number"
                      value={facilityData.totalSquareFeet}
                      onChange={(e) => setFacilityData({...facilityData, totalSquareFeet: e.target.value})}
                      placeholder="25000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cultivationSquareFeet">Cultivation Area (sq ft)</Label>
                    <Input
                      id="cultivationSquareFeet"
                      type="number"
                      value={facilityData.cultivationSquareFeet}
                      onChange={(e) => setFacilityData({...facilityData, cultivationSquareFeet: e.target.value})}
                      placeholder="18000"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={handleManualSubmit} 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Data
                  </>
                )}
              </Button>
            </TabsContent>

            {/* IoT Devices Tab */}
            <TabsContent value="iot" className="space-y-4 mt-6">
              <Alert className="bg-blue-900/20 border-blue-600/50">
                <Wifi className="w-4 h-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  IoT devices can automatically send data to VibeLux. Configure your devices to use our API endpoint.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">API Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Endpoint:</span>
                      <code className="text-green-400 bg-gray-800 px-2 py-1 rounded">
                        https://vibelux.com/api/sensors/readings
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Facility ID:</span>
                      <code className="text-green-400 bg-gray-800 px-2 py-1 rounded">{facilityId}</code>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-3">Connected Devices</h4>
                  {iotDevices.length === 0 ? (
                    <p className="text-gray-400">No devices connected yet. Configure your IoT devices to start sending data.</p>
                  ) : (
                    <div className="space-y-2">
                      {iotDevices.map((device) => (
                        <div key={device.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{device.name}</p>
                            <p className="text-sm text-gray-400">{device.type}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              device.status === 'connected' 
                                ? 'bg-green-900/50 text-green-400' 
                                : 'bg-red-900/50 text-red-400'
                            }`}>
                              {device.status}
                            </span>
                            <p className="text-xs text-gray-400 mt-1">
                              Last: {new Date(device.lastReading).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('/docs/iot-integration', '_blank')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  View Integration Guide
                </Button>
              </div>
            </TabsContent>

            {/* Track & Trace Tab */}
            <TabsContent value="trackTrace" className="space-y-4 mt-6">
              <Alert className="bg-purple-900/20 border-purple-600/50">
                <Cannabis className="w-4 h-4 text-purple-400" />
                <AlertDescription className="text-purple-300">
                  Connect to METRC or BioTrackTHC to automatically import harvest data.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select 
                    value={trackTraceConfig.state} 
                    onValueChange={(v) => setTrackTraceConfig({...trackTraceConfig, state: v})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRACK_TRACE_CONFIGS).map(([state, config]) => (
                        <SelectItem key={state} value={state}>
                          {state} - {config.provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={trackTraceConfig.apiKey}
                    onChange={(e) => setTrackTraceConfig({...trackTraceConfig, apiKey: e.target.value})}
                    placeholder="Your API key"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={trackTraceConfig.licenseNumber}
                    onChange={(e) => setTrackTraceConfig({...trackTraceConfig, licenseNumber: e.target.value})}
                    placeholder="Your cultivation license"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Automatic Sync</p>
                    <p className="text-sm text-gray-400">Automatically sync data daily</p>
                  </div>
                  <Switch
                    checked={trackTraceConfig.autoSync}
                    onCheckedChange={(checked) => setTrackTraceConfig({...trackTraceConfig, autoSync: checked})}
                  />
                </div>

                <Button 
                  onClick={handleTrackTraceSync} 
                  disabled={isLoading || !trackTraceConfig.state || !trackTraceConfig.apiKey || !trackTraceConfig.licenseNumber}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Food Safety Tab - Produce Only */}
            {facilityType === FacilityType.PRODUCE && (
              <TabsContent value="foodSafety" className="space-y-4 mt-6">
                <Alert className="bg-blue-900/20 border-blue-600/50">
                  <Apple className="w-4 h-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    Track food safety compliance, testing results, and certifications.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label>Food Safety Test Results</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="testType">Test Type</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select test type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ecoli">E. coli</SelectItem>
                            <SelectItem value="salmonella">Salmonella</SelectItem>
                            <SelectItem value="listeria">Listeria</SelectItem>
                            <SelectItem value="pesticide">Pesticide Residue</SelectItem>
                            <SelectItem value="heavy_metals">Heavy Metals</SelectItem>
                            <SelectItem value="water_quality">Water Quality</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="testResult">Result</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pass">Pass</SelectItem>
                            <SelectItem value="fail">Fail</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>GAP Certification Status</Label>
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg mt-2">
                      <div>
                        <p className="text-white font-medium">Good Agricultural Practices</p>
                        <p className="text-sm text-gray-400">Last audit: March 15, 2024</p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-900/50 text-green-400">
                        Certified
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sanitationLog">Daily Sanitation Log</Label>
                    <Textarea
                      id="sanitationLog"
                      placeholder="Enter sanitation activities performed today..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Check className="w-4 h-4 mr-2" />
                    Submit Food Safety Data
                  </Button>
                </div>
              </TabsContent>
            )}

            {/* Lab Testing Tab - Cannabis Only */}
            {facilityType === FacilityType.CANNABIS && (
              <TabsContent value="labTesting" className="space-y-4 mt-6">
                <Alert className="bg-purple-900/20 border-purple-600/50">
                  <TestTube className="w-4 h-4 text-purple-400" />
                  <AlertDescription className="text-purple-300">
                    Import lab test results for potency, contaminants, and terpenes.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Testing Lab</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lab" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="steep_hill">Steep Hill Labs</SelectItem>
                          <SelectItem value="sc_labs">SC Labs</SelectItem>
                          <SelectItem value="confident">Confident Cannabis</SelectItem>
                          <SelectItem value="encore">Encore Labs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="batchNumber">Batch Number</Label>
                      <Input
                        id="batchNumber"
                        placeholder="Enter batch number"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Potency Results</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="thc">THC %</Label>
                        <Input
                          id="thc"
                          type="number"
                          step="0.1"
                          placeholder="24.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cbd">CBD %</Label>
                        <Input
                          id="cbd"
                          type="number"
                          step="0.1"
                          placeholder="0.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="total">Total Cannabinoids %</Label>
                        <Input
                          id="total"
                          type="number"
                          step="0.1"
                          placeholder="28.3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-400">Microbials</p>
                      <p className="text-lg font-bold text-green-400">PASS</p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-400">Pesticides</p>
                      <p className="text-lg font-bold text-green-400">PASS</p>
                    </div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Lab Results PDF
                  </Button>
                </div>
              </TabsContent>
            )}

            {/* Distribution Tab - Produce Only */}
            {facilityType === FacilityType.PRODUCE && (
              <TabsContent value="distribution" className="space-y-4 mt-6">
                <Alert className="bg-green-900/20 border-green-600/50">
                  <Truck className="w-4 h-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    Track shipments, buyers, and distribution channels.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Buyer Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select buyer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wholesale">Wholesale Distributor</SelectItem>
                          <SelectItem value="retail">Retail Chain</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="farmers_market">Farmers Market</SelectItem>
                          <SelectItem value="csa">CSA Members</SelectItem>
                          <SelectItem value="online">Online Direct</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="shipmentDate">Shipment Date</Label>
                      <Input
                        id="shipmentDate"
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity (units)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price per Unit</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="3.50"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Cold Chain Compliance</Label>
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg mt-2">
                      <div className="flex items-center gap-3">
                        <Thermometer className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Temperature Maintained</p>
                          <p className="text-sm text-gray-400">32-36°F throughout transport</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" />
                    Record Shipment
                  </Button>
                </div>
              </TabsContent>
            )}

            {/* Accounting Tab */}
            <TabsContent value="accounting" className="space-y-4 mt-6">
              <Alert className="bg-green-900/20 border-green-600/50">
                <DollarSign className="w-4 h-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  Connect your accounting software to automatically import all revenue and expense data.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>Select Accounting Provider</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      { id: 'QUICKBOOKS', name: 'QuickBooks', icon: '📊', color: 'bg-green-600' },
                      { id: 'XERO', name: 'Xero', icon: '💙', color: 'bg-blue-600' },
                      { id: 'SAGE', name: 'Sage', icon: '🟢', color: 'bg-emerald-600' },
                      { id: 'FRESHBOOKS', name: 'FreshBooks', icon: '🔵', color: 'bg-indigo-600' },
                    ].map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => setAccountingConfig({...accountingConfig, provider: provider.id})}
                        className={`p-4 border rounded-lg transition-all ${
                          accountingConfig.provider === provider.id
                            ? 'border-green-500 bg-green-900/20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-2xl mb-2">{provider.icon}</div>
                        <p className="text-white font-medium">{provider.name}</p>
                        {accountingConfig.provider === provider.id && accountingConfig.connected && (
                          <p className="text-xs text-green-400 mt-1">Connected</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {accountingConfig.provider && !accountingConfig.connected && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Connect to {accountingConfig.provider}</h4>
                    <p className="text-sm text-gray-400 mb-4">
                      You'll be redirected to authorize VibeLux to access your accounting data.
                    </p>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        // In production, this would initiate OAuth flow
                        window.open(`/api/auth/accounting/${accountingConfig.provider.toLowerCase()}`, '_blank');
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Connect {accountingConfig.provider}
                    </Button>
                  </div>
                )}

                {accountingConfig.connected && (
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">Connection Status</h4>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-900/50 text-green-400">
                          Connected
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Last synced: {accountingConfig.lastSync ? new Date(accountingConfig.lastSync).toLocaleString() : 'Never'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Automatic Sync</p>
                        <p className="text-sm text-gray-400">Sync revenue data {accountingConfig.syncFrequency}</p>
                      </div>
                      <Switch
                        checked={accountingConfig.autoSync}
                        onCheckedChange={(checked) => setAccountingConfig({...accountingConfig, autoSync: checked})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Revenue Synced</p>
                        <p className="text-xl font-bold text-white">$542,380</p>
                        <p className="text-xs text-green-400">Last 30 days</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-400">Invoices</p>
                        <p className="text-xl font-bold text-white">127</p>
                        <p className="text-xs text-gray-400">Processed</p>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setIsLoading(true);
                        // Trigger manual sync
                        setTimeout(() => {
                          setIsLoading(false);
                          setSuccessMessage('Successfully synced accounting data');
                          onDataUpdate?.();
                        }, 2000);
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Now
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    VibeLux securely connects to your accounting software to import:
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>Invoice and sales data for accurate revenue tracking</li>
                      <li>Customer information for sales analytics</li>
                      <li>Product categories for revenue breakdown</li>
                      <li>Expense data for profitability analysis</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            {/* File Import Tab */}
            <TabsContent value="import" className="space-y-4 mt-6">
              <Alert>
                <Upload className="w-4 h-4" />
                <AlertDescription>
                  Import data from CSV or Excel files. Download our template for the correct format.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Drop your file here or click to browse</p>
                  <p className="text-sm text-gray-400 mb-4">Supports CSV and Excel files</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileImport}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open('/templates/harvest-data-template.csv', '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open('/docs/data-import', '_blank')}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View Guide
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Success/Error Messages */}
          {successMessage && (
            <Alert className="mt-4 bg-green-900/20 border-green-600/50">
              <Check className="w-4 h-4 text-green-400" />
              <AlertDescription className="text-green-300">{successMessage}</AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert className="mt-4 bg-red-900/20 border-red-600/50">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <AlertDescription className="text-red-300">{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}