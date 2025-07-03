'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area } from 'recharts';
import { Camera, Play, Pause, Save, Download, AlertTriangle, TrendingUp, Zap, Activity, Leaf, Wifi, WifiOff } from 'lucide-react';
import { usePAMFluorometer } from '@/hooks/usePAMFluorometer';
import { PAMFluorometerService } from '@/services/sensors/pam-fluorometer.service';
import { toast } from 'sonner';

const stressThresholds = {
  fvFm: {
    healthy: { min: 0.75, max: 0.85 },
    stressed: { min: 0.60, max: 0.74 },
    critical: { min: 0.0, max: 0.59 }
  },
  phi2: {
    healthy: { min: 0.60, max: 0.80 },
    stressed: { min: 0.40, max: 0.59 },
    critical: { min: 0.0, max: 0.39 }
  },
  npq: {
    healthy: { min: 0.5, max: 1.5 },
    stressed: { min: 1.6, max: 3.0 },
    critical: { min: 3.1, max: 10.0 }
  }
};

export default function ChlorophyllFluorescenceTracker() {
  const [selectedProtocol, setSelectedProtocol] = useState<string>('Standard PAM');
  const [selectedPlant, setSelectedPlant] = useState<string>('Plant-001');
  const [selectedLeafPosition, setSelectedLeafPosition] = useState<string>('young-fully-expanded');
  const [measurementProgress, setMeasurementProgress] = useState<number>(0);
  const [projectId, setProjectId] = useState<string>('');
  const [experimentId, setExperimentId] = useState<string>('');
  const [enableRealTime, setEnableRealTime] = useState<boolean>(true);

  // Use the PAM fluorometer hook
  const {
    isConnected,
    isRecording,
    currentReading,
    historicalData,
    lightCurveData,
    deviceStatus,
    error,
    connect,
    disconnect,
    startMeasurement,
    stopMeasurement,
    takeSingleMeasurement,
    generateLightCurve,
    loadHistoricalData,
    exportData,
    calibrate,
    getHealthStatus
  } = usePAMFluorometer({
    autoConnect: false,
    enableWebSocket: enableRealTime,
    plantId: selectedPlant,
    projectId,
    experimentId
  });

  const protocolSettings = PAMFluorometerService.protocols[selectedProtocol];

  // Handle protocol change
  const handleProtocolChange = (protocol: string) => {
    setSelectedProtocol(protocol);
    if (isRecording) {
      toast.warning('Please stop current measurement before changing protocol');
    }
  };

  // Handle device connection
  const handleConnect = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      await connect('MOCK_DEVICE'); // Can be changed to real device type
    }
  };

  // Handle measurement start
  const handleStartMeasurement = async () => {
    if (isRecording) {
      await stopMeasurement();
    } else {
      await startMeasurement(protocolSettings);
    }
  };

  // Handle light curve generation
  const handleGenerateLightCurve = async () => {
    if (!isConnected) {
      toast.error('Please connect PAM device first');
      return;
    }
    await generateLightCurve();
  };

  // Handle data export
  const handleExportData = async () => {
    if (historicalData.length === 0) {
      toast.error('No data to export');
      return;
    }
    await exportData('json');
  };

  const getHealthStatusDisplay = (reading: any): { status: string; color: string; message: string } => {
    const fvFmThreshold = stressThresholds.fvFm;
    const phi2Threshold = stressThresholds.phi2;
    const npqThreshold = stressThresholds.npq;

    if (reading.fvFm >= fvFmThreshold.healthy.min && 
        reading.phi2 >= phi2Threshold.healthy.min &&
        reading.npq <= npqThreshold.healthy.max) {
      return { status: 'Healthy', color: 'text-green-600', message: 'Photosystem II operating optimally' };
    } else if (reading.fvFm >= fvFmThreshold.stressed.min &&
               reading.phi2 >= phi2Threshold.stressed.min) {
      return { status: 'Stressed', color: 'text-yellow-600', message: 'Moderate stress detected - monitor closely' };
    } else {
      return { status: 'Critical', color: 'text-red-600', message: 'Severe stress detected - immediate intervention required' };
    }
  };

  // Update measurement progress
  useEffect(() => {
    if (isRecording && protocolSettings) {
      const interval = setInterval(() => {
        setMeasurementProgress(prev => {
          const newProgress = Math.min(100, prev + (100 / (protocolSettings.totalMeasurementTime / protocolSettings.measurementInterval)));
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, protocolSettings.measurementInterval * 1000);

      return () => clearInterval(interval);
    } else {
      setMeasurementProgress(0);
    }
  }, [isRecording, protocolSettings]);

  // Load historical data on mount and when plant changes
  useEffect(() => {
    if (selectedPlant) {
      loadHistoricalData({ limit: 50 });
    }
  }, [selectedPlant, loadHistoricalData]);

  const healthStatus = currentReading ? getHealthStatusDisplay(currentReading) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      {/* Beautiful gradient header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              Chlorophyll Fluorescence Tracker
            </h1>
            <p className="text-blue-100 text-lg font-medium">
              Real-time monitoring of photosystem II efficiency and plant stress detection
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleConnect}
              className={`${isConnected ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-white/10 hover:bg-white/20'} border-white/30 text-white font-medium h-12 px-4`}
            >
              {isConnected ? <Wifi className="w-5 h-5 mr-2" /> : <WifiOff className="w-5 h-5 mr-2" />}
              {isConnected ? 'Connected' : 'Connect'}
            </Button>
            <Button
              onClick={handleStartMeasurement}
              disabled={!isConnected || !selectedPlant}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold h-12 px-6"
            >
              {isRecording ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {isRecording ? 'Stop' : 'Start'}
            </Button>
            <Button 
              onClick={handleGenerateLightCurve} 
              disabled={!isConnected}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium h-12 px-4"
            >
              <Zap className="w-5 h-5 mr-2" />
              Light Curve
            </Button>
            <Button 
              onClick={handleExportData} 
              disabled={historicalData.length === 0}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium h-12 px-4"
            >
              <Download className="w-5 h-5 mr-2" />
              Export
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>

      <div className="space-y-8">

        {/* Current Status Alert */}
        {healthStatus && (
          <Alert className={`shadow-lg border-2 ${healthStatus.status === 'Critical' ? 'border-red-500 bg-red-50' : 
                           healthStatus.status === 'Stressed' ? 'border-yellow-500 bg-yellow-50' : 
                           'border-green-500 bg-green-50'}`}>
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-base">
              <span className={`font-bold text-lg ${healthStatus.color}`}>{healthStatus.status}</span>: {healthStatus.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Protocol Settings */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Camera className="w-6 h-6 mr-3 text-purple-500" />
                Protocol Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-base font-semibold">Protocol Preset</Label>
                <Select 
                  value={selectedProtocol} 
                  onValueChange={handleProtocolChange}
                >
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard PAM">Standard PAM</SelectItem>
                    <SelectItem value="Stress Detection">Stress Detection</SelectItem>
                    <SelectItem value="Light Curve">Light Curve</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold">Plant ID</Label>
                <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plant-001">Plant-001</SelectItem>
                    <SelectItem value="Plant-002">Plant-002</SelectItem>
                    <SelectItem value="Plant-003">Plant-003</SelectItem>
                    <SelectItem value="Control-A">Control-A</SelectItem>
                    <SelectItem value="Control-B">Control-B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold">Leaf Position</Label>
                <Select value={selectedLeafPosition} onValueChange={setSelectedLeafPosition}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="young-fully-expanded">Young Fully Expanded</SelectItem>
                    <SelectItem value="mature">Mature</SelectItem>
                    <SelectItem value="old">Old</SelectItem>
                    <SelectItem value="sun-exposed">Sun Exposed</SelectItem>
                    <SelectItem value="shaded">Shaded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold">Project ID</Label>
                <Input
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="Optional project ID"
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Experiment ID</Label>
                <Input
                  value={experimentId}
                  onChange={(e) => setExperimentId(e.target.value)}
                  placeholder="Optional experiment ID"
                  className="mt-2 h-12"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={enableRealTime}
                  onChange={(e) => setEnableRealTime(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label className="text-base font-medium">Enable Real-time Updates</Label>
              </div>

              {protocolSettings && (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <p className="text-base font-semibold">Protocol Details:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Dark Adaptation:</span>
                      <span className="font-bold">{protocolSettings.darkAdaptationTime} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Light Intensity:</span>
                      <span className="font-bold">{protocolSettings.actinicLightIntensity} μmol/m²/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Measurement Interval:</span>
                      <span className="font-bold">{protocolSettings.measurementInterval}s</span>
                    </div>
                  </div>
                </div>
              )}

              {isRecording && (
                <div className="pt-4 border-t border-gray-200">
                  <Label className="text-base font-semibold">Measurement Progress</Label>
                  <Progress value={measurementProgress} className="mt-3 h-3" />
                  <p className="text-base font-medium text-gray-700 mt-2">
                    {Math.round(measurementProgress)}% complete
                  </p>
                </div>
              )}

              {deviceStatus && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-base font-semibold mb-2">Device Status</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${deviceStatus.connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span>{deviceStatus.device || 'No device connected'}</span>
                    </div>
                    {deviceStatus.protocol && (
                      <p className="text-xs text-gray-600">Protocol: {deviceStatus.protocol.name}</p>
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

          {/* Current Parameters */}
          <Card className="lg:col-span-2 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Activity className="w-6 h-6 mr-3 text-blue-500" />
                Current Fluorescence Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentReading && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">F₀ (Initial):</span>
                      <span className="text-lg font-bold text-blue-600">{currentReading.f0.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">Fm (Maximum):</span>
                      <span className="text-lg font-bold text-green-600">{currentReading.fm.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">Fv (Variable):</span>
                      <span className="text-lg font-bold text-purple-600">{currentReading.fv.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">Fv/Fm:</span>
                      <span className={`text-lg font-bold ${currentReading.fvFm >= 0.75 ? 'text-green-600' : 
                                                     currentReading.fvFm >= 0.60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {currentReading.fvFm.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">ΦPSII:</span>
                      <span className="text-lg font-bold text-indigo-600">{currentReading.phi2.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">ETR:</span>
                      <span className="text-lg font-bold text-orange-600">{currentReading.etr.toFixed(1)} μmol/m²/s</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">qP:</span>
                      <span className="text-lg font-bold text-cyan-600">{currentReading.qP.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">qN:</span>
                      <span className="text-lg font-bold text-pink-600">{currentReading.qN.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">NPQ:</span>
                      <span className="text-lg font-bold text-yellow-600">{currentReading.npq.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">RFD:</span>
                      <span className="text-lg font-bold text-teal-600">{currentReading.rfd.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">Temperature:</span>
                      <span className="text-lg font-bold text-red-600">{currentReading.metadata?.temperature?.toFixed(1) || '22.0'}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">Status:</span>
                      <Badge 
                        className="px-3 py-1 text-base font-semibold"
                        variant={healthStatus?.status === 'Healthy' ? 'default' : 
                                 healthStatus?.status === 'Stressed' ? 'secondary' : 'destructive'}
                      >
                        {healthStatus?.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="w-6 h-6 mr-3 text-green-500" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {historicalData.length}
                </p>
                <p className="text-base font-medium text-gray-600">Total Measurements</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {historicalData.filter(r => getHealthStatusDisplay(r).status === 'Healthy').length}
                </p>
                <p className="text-base font-medium text-gray-600">Healthy Readings</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {historicalData.filter(r => getHealthStatusDisplay(r).status === 'Critical').length}
                </p>
                <p className="text-base font-medium text-gray-600">Critical Readings</p>
              </div>

              {historicalData.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-base font-medium text-gray-600">Average Fv/Fm:</p>
                  <p className="text-xl font-bold text-purple-600">
                    {(historicalData.reduce((sum, r) => sum + r.fvFm, 0) / historicalData.length).toFixed(3)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Historical Trends */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Fluorescence Trends</CardTitle>
            </CardHeader>
            <CardContent>
            <Tabs defaultValue="efficiency" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
                <TabsTrigger value="quenching">Quenching</TabsTrigger>
              </TabsList>
              
              <TabsContent value="efficiency" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData.slice(-20)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="fvFm" 
                        stroke="#3b82f6" 
                        name="Fv/Fm" 
                        strokeWidth={3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="phi2" 
                        stroke="#10b981" 
                        name="ΦPSII" 
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="quenching" className="space-y-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData.slice(-20)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="qP" 
                        stroke="#f59e0b" 
                        name="qP" 
                        strokeWidth={3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="npq" 
                        stroke="#ef4444" 
                        name="NPQ" 
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

          {/* Light Response Curve */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold">
                <Leaf className="w-6 h-6 mr-3 text-green-500" />
                Light Response Curves
              </CardTitle>
            </CardHeader>
            <CardContent>
            {lightCurveData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lightCurveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="ppfd" 
                      label={{ value: 'PPFD (μmol/m²/s)', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="phi2" 
                      stroke="#3b82f6" 
                      name="ΦPSII" 
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="etr" 
                      stroke="#10b981" 
                      name="ETR (÷10)" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="npq" 
                      stroke="#f59e0b" 
                      name="NPQ" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Zap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-500 mb-4">No light curve data</p>
                  <Button onClick={handleGenerateLightCurve} className="h-12 px-6 text-base font-semibold" disabled={!isConnected}>
                    Generate Light Curve
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}