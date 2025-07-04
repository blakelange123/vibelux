'use client';

import React, { useState, useEffect } from 'react';
import { 
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity,
  Wifi,
  WifiOff,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  Zap,
  Info,
  TestTube,
  Cable,
  Radio,
  Gauge,
  QrCode,
  Copy,
  ExternalLink
} from 'lucide-react';

interface SensorDevice {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'ph' | 'ec' | 'combined';
  manufacturer: string;
  model: string;
  protocol: 'mqtt' | 'http' | 'modbus' | 'serial' | 'bluetooth' | 'zigbee';
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastReading?: {
    value: number;
    unit: string;
    timestamp: Date;
  };
  config?: any;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function SensorSetupWizard({ 
  roomId,
  roomName,
  onComplete 
}: { 
  roomId: string;
  roomName: string;
  onComplete?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [sensors, setSensors] = useState<SensorDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');
  const [connectionConfig, setConnectionConfig] = useState<any>({});
  const [testingConnection, setTestingConnection] = useState(false);

  const steps: WizardStep[] = [
    {
      id: 'protocol',
      title: 'Select Connection Type',
      description: 'Choose how your sensors connect',
      icon: <Cable className="w-5 h-5" />
    },
    {
      id: 'discover',
      title: 'Discover Sensors',
      description: 'Find available sensors on your network',
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 'configure',
      title: 'Configure Sensors',
      description: 'Set up each sensor for your room',
      icon: <Settings className="w-5 h-5" />
    },
    {
      id: 'test',
      title: 'Test & Verify',
      description: 'Ensure sensors are working correctly',
      icon: <Activity className="w-5 h-5" />
    }
  ];

  const protocols = [
    {
      id: 'mqtt',
      name: 'MQTT',
      description: 'WiFi sensors using MQTT protocol',
      icon: <Wifi className="w-5 h-5" />,
      popular: ['Sonoff', 'Shelly', 'Tasmota devices'],
      setup: {
        broker: 'mqtt://localhost:1883',
        topic: 'vibelux/+/+',
        username: '',
        password: ''
      }
    },
    {
      id: 'http',
      name: 'HTTP/REST API',
      description: 'Sensors with web interface',
      icon: <ExternalLink className="w-5 h-5" />,
      popular: ['SensorPush', 'Trolmaster', 'Pulse One'],
      setup: {
        baseUrl: 'http://',
        apiKey: '',
        pollInterval: 60
      }
    },
    {
      id: 'modbus',
      name: 'Modbus RTU/TCP',
      description: 'Industrial sensors and controllers',
      icon: <Gauge className="w-5 h-5" />,
      popular: ['Atlas Scientific', 'Industrial PLCs'],
      setup: {
        connection: 'tcp',
        host: '192.168.1.100',
        port: 502,
        unitId: 1
      }
    },
    {
      id: 'serial',
      name: 'Serial/USB',
      description: 'Direct USB connection',
      icon: <Cable className="w-5 h-5" />,
      popular: ['Arduino sensors', 'USB probes'],
      setup: {
        port: '/dev/ttyUSB0',
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1
      }
    },
    {
      id: 'bluetooth',
      name: 'Bluetooth LE',
      description: 'Wireless Bluetooth sensors',
      icon: <Radio className="w-5 h-5" />,
      popular: ['Xiaomi Mi', 'Govee', 'SensorPush'],
      setup: {
        scanDuration: 30,
        serviceUUID: ''
      }
    },
    {
      id: 'zigbee',
      name: 'Zigbee',
      description: 'Zigbee mesh network devices',
      icon: <Radio className="w-5 h-5" />,
      popular: ['Aqara', 'Sonoff Zigbee', 'Tuya'],
      setup: {
        coordinator: '/dev/ttyUSB0',
        channel: 11,
        panId: '0x1234'
      }
    }
  ];

  // Mock sensor discovery
  const discoverSensors = async () => {
    setScanning(true);
    
    // Simulate network scan
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockSensors: SensorDevice[] = [
      {
        id: 'sensor_1',
        name: 'TH16 Temperature & Humidity',
        type: 'combined',
        manufacturer: 'Sonoff',
        model: 'TH16',
        protocol: selectedProtocol as any,
        status: 'disconnected'
      },
      {
        id: 'sensor_2',
        name: 'Atlas pH Probe',
        type: 'ph',
        manufacturer: 'Atlas Scientific',
        model: 'EZO-pH',
        protocol: selectedProtocol as any,
        status: 'disconnected'
      },
      {
        id: 'sensor_3',
        name: 'CO2 Monitor',
        type: 'co2',
        manufacturer: 'Trolmaster',
        model: 'MBS-S8',
        protocol: selectedProtocol as any,
        status: 'disconnected'
      }
    ];
    
    setSensors(mockSensors);
    setScanning(false);
  };

  const testConnection = async (sensor: SensorDevice) => {
    setTestingConnection(true);
    
    // Update sensor status
    setSensors(prev => prev.map(s => 
      s.id === sensor.id ? { ...s, status: 'configuring' as const } : s
    ));
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful connection with reading
    setSensors(prev => prev.map(s => 
      s.id === sensor.id ? {
        ...s,
        status: 'connected' as const,
        lastReading: {
          value: sensor.type === 'temperature' ? 75.2 :
                 sensor.type === 'humidity' ? 55.5 :
                 sensor.type === 'co2' ? 850 :
                 sensor.type === 'ph' ? 6.2 :
                 sensor.type === 'combined' ? 75.2 : 0,
          unit: sensor.type === 'temperature' ? '°F' :
                sensor.type === 'humidity' ? '%' :
                sensor.type === 'co2' ? 'ppm' :
                sensor.type === 'ph' ? 'pH' : '',
          timestamp: new Date()
        }
      } : s
    ));
    
    setTestingConnection(false);
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="w-5 h-5 text-red-500" />;
      case 'humidity': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'co2': return <Wind className="w-5 h-5 text-green-500" />;
      case 'light': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'ph': return <TestTube className="w-5 h-5 text-purple-500" />;
      case 'ec': return <Zap className="w-5 h-5 text-orange-500" />;
      case 'combined': return <Activity className="w-5 h-5 text-indigo-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sensor Setup for {roomName}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Connect your environmental sensors to start monitoring
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep ? 'bg-green-600 text-white' :
                  index === currentStep ? 'bg-purple-600 text-white' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-5 h-5" /> : step.icon}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    index === currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Step 1: Protocol Selection */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How do your sensors connect?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Select the protocol your sensors use to communicate
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {protocols.map(protocol => (
                <button
                  key={protocol.id}
                  onClick={() => setSelectedProtocol(protocol.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedProtocol === protocol.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedProtocol === protocol.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {protocol.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {protocol.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {protocol.description}
                      </p>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Popular devices:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {protocol.popular.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedProtocol && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Connection Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedProtocol === 'mqtt' && (
                        <>
                          <li>MQTT broker running (Mosquitto recommended)</li>
                          <li>Sensors configured with broker address</li>
                          <li>Network access between sensors and server</li>
                        </>
                      )}
                      {selectedProtocol === 'http' && (
                        <>
                          <li>Sensors accessible via HTTP/HTTPS</li>
                          <li>API credentials if required</li>
                          <li>Static IP or hostname for each sensor</li>
                        </>
                      )}
                      {selectedProtocol === 'modbus' && (
                        <>
                          <li>Modbus gateway or direct connection</li>
                          <li>Device addresses and register maps</li>
                          <li>RS485 adapter for RTU mode</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Connection Configuration */}
        {currentStep === 1 && selectedProtocol && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Configure {protocols.find(p => p.id === selectedProtocol)?.name} Connection
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enter connection details for your sensors
              </p>
            </div>

            {/* MQTT Configuration */}
            {selectedProtocol === 'mqtt' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    MQTT Broker Address
                  </label>
                  <input
                    type="text"
                    placeholder="mqtt://192.168.1.100:1883"
                    value={connectionConfig.broker || ''}
                    onChange={(e) => setConnectionConfig({
                      ...connectionConfig,
                      broker: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username (optional)
                    </label>
                    <input
                      type="text"
                      value={connectionConfig.username || ''}
                      onChange={(e) => setConnectionConfig({
                        ...connectionConfig,
                        username: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password (optional)
                    </label>
                    <input
                      type="password"
                      value={connectionConfig.password || ''}
                      onChange={(e) => setConnectionConfig({
                        ...connectionConfig,
                        password: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic Pattern
                  </label>
                  <input
                    type="text"
                    placeholder="vibelux/+/+"
                    value={connectionConfig.topic || 'vibelux/+/+'}
                    onChange={(e) => setConnectionConfig({
                      ...connectionConfig,
                      topic: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use + for single-level wildcard, # for multi-level
                  </p>
                </div>
              </div>
            )}

            {/* HTTP Configuration */}
            {selectedProtocol === 'http' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sensor IP Address or Hostname
                  </label>
                  <input
                    type="text"
                    placeholder="http://192.168.1.50"
                    value={connectionConfig.baseUrl || ''}
                    onChange={(e) => setConnectionConfig({
                      ...connectionConfig,
                      baseUrl: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key (if required)
                  </label>
                  <input
                    type="text"
                    value={connectionConfig.apiKey || ''}
                    onChange={(e) => setConnectionConfig({
                      ...connectionConfig,
                      apiKey: e.target.value
                    })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Poll Interval (seconds)
                  </label>
                  <input
                    type="number"
                    value={connectionConfig.pollInterval || 60}
                    onChange={(e) => setConnectionConfig({
                      ...connectionConfig,
                      pollInterval: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={discoverSensors}
                disabled={scanning}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {scanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Scan for Sensors
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Configure Discovered Sensors */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Configure Your Sensors
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {sensors.length} sensor(s) found. Configure each one for {roomName}.
              </p>
            </div>

            {sensors.length === 0 ? (
              <div className="text-center py-8">
                <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No sensors found. Please check your connection settings.
                </p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  Back to Connection
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sensors.map(sensor => (
                  <div
                    key={sensor.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSensorIcon(sensor.type)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {sensor.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sensor.manufacturer} {sensor.model}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {sensor.status === 'connected' ? (
                          <span className="flex items-center gap-2 text-green-600">
                            <Wifi className="w-4 h-4" />
                            Connected
                          </span>
                        ) : sensor.status === 'configuring' ? (
                          <span className="flex items-center gap-2 text-yellow-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent" />
                            Testing...
                          </span>
                        ) : (
                          <button
                            onClick={() => testConnection(sensor)}
                            disabled={testingConnection}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>

                    {sensor.status === 'connected' && sensor.lastReading && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Current Reading:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {sensor.lastReading.value} {sensor.lastReading.unit}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Test & Verify */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Test & Verify
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your sensors are connected and sending data
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-300">
                    All sensors connected successfully!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Data is being recorded to the database
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {sensors.filter(s => s.status === 'connected').map(sensor => (
                <div
                  key={sensor.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getSensorIcon(sensor.type)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {sensor.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last update: {sensor.lastReading?.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {sensor.lastReading?.value} {sensor.lastReading?.unit}
                    </p>
                    <p className="text-xs text-green-600">Live</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                Next Steps:
              </h4>
              <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>Set up alert thresholds for each sensor</li>
                <li>Configure data retention policies</li>
                <li>Create dashboards to visualize your data</li>
                <li>Set up automated controls based on sensor readings</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        
        <button
          onClick={() => {
            if (currentStep < steps.length - 1) {
              setCurrentStep(prev => prev + 1);
            } else {
              onComplete?.();
            }
          }}
          disabled={
            (currentStep === 0 && !selectedProtocol) ||
            (currentStep === 2 && sensors.filter(s => s.status === 'connected').length === 0)
          }
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}