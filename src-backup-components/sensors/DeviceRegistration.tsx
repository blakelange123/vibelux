'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Copy, Wifi, Cpu, Zap, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface DeviceConfig {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  location: string;
  sensorTypes: string[];
  connectionType: 'wifi' | 'ethernet' | 'cellular' | 'serial';
  apiKey: string;
}

interface SupportedBoard {
  id: string;
  name: string;
  description: string;
  cost: string;
  connectivity: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  features: string[];
  buyLink?: string;
}

const SUPPORTED_BOARDS: SupportedBoard[] = [
  {
    id: 'esp32',
    name: 'ESP32',
    description: 'Most popular choice - WiFi built-in, powerful, cheap',
    cost: '$3-8',
    connectivity: ['WiFi', 'Bluetooth'],
    difficulty: 'Beginner',
    features: ['Built-in WiFi', 'Low power', 'Many GPIO pins', 'OTA updates'],
    buyLink: 'https://www.amazon.com/s?k=esp32+development+board'
  },
  {
    id: 'esp8266',
    name: 'ESP8266 (NodeMCU)',
    description: 'Cheapest WiFi option for basic sensors',
    cost: '$2-5',
    connectivity: ['WiFi'],
    difficulty: 'Beginner',
    features: ['Ultra cheap', 'WiFi built-in', 'Good for simple sensors'],
    buyLink: 'https://www.amazon.com/s?k=nodemcu+esp8266'
  },
  {
    id: 'samd51',
    name: 'SAMD51 (Adafruit M4)',
    description: 'Professional grade with debugging support',
    cost: '$15-25',
    connectivity: ['USB', 'WiFi (with shield)'],
    difficulty: 'Advanced',
    features: ['ARM Cortex-M4', 'Atmel ICE support', 'High performance', 'Real-time OS capable'],
    buyLink: 'https://www.adafruit.com/product/3857'
  },
  {
    id: 'arduino_uno_wifi',
    name: 'Arduino Uno + WiFi Shield',
    description: 'Classic Arduino with WiFi - most tutorials available',
    cost: '$30-40',
    connectivity: ['WiFi', 'Ethernet'],
    difficulty: 'Beginner',
    features: ['Lots of tutorials', 'Stable platform', 'Easy debugging'],
    buyLink: 'https://store.arduino.cc/products/arduino-uno-wifi-rev2'
  },
  {
    id: 'raspberry_pi_pico_w',
    name: 'Raspberry Pi Pico W',
    description: 'New ARM chip with WiFi, Python support',
    cost: '$6-10',
    connectivity: ['WiFi'],
    difficulty: 'Intermediate',
    features: ['Dual core ARM', 'Python or C++', 'WiFi built-in', 'Good documentation'],
    buyLink: 'https://www.raspberrypi.com/products/raspberry-pi-pico'
  }
];

const SENSOR_TYPES = [
  'Temperature/Humidity (DHT22)',
  'Soil Moisture',
  'pH Sensor',
  'CO2 (MQ135)',
  'Light Intensity (BH1750)',
  'Water Level',
  'Motion Detection',
  'Door/Window Sensors',
  'Current/Power Monitoring',
  'Custom Analog Sensor'
];

export default function DeviceRegistration() {
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig>({
    deviceId: '',
    deviceName: '',
    deviceType: '',
    location: '',
    sensorTypes: [],
    connectionType: 'wifi',
    apiKey: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const generateApiKey = () => {
    const key = 'vbl_' + Math.random().toString(36).substr(2, 32);
    setDeviceConfig(prev => ({ ...prev, apiKey: key }));
  };

  const generateDeviceId = () => {
    const id = selectedBoard + '_' + Math.random().toString(36).substr(2, 8);
    setDeviceConfig(prev => ({ ...prev, deviceId: id }));
  };

  const handleRegisterDevice = async () => {
    if (!deviceConfig.deviceId || !deviceConfig.deviceName || !deviceConfig.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch('/api/sensors/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceConfig)
      });

      if (response.ok) {
        toast.success('Device registered successfully!');
        setActiveTab('download');
      } else {
        toast.error('Failed to register device');
      }
    } catch (error) {
      toast.error('Error registering device');
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadFirmware = () => {
    const board = SUPPORTED_BOARDS.find(b => b.id === selectedBoard);
    if (!board) return;

    const firmware = generateFirmwareCode(board, deviceConfig);
    const blob = new Blob([firmware], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibelux_${deviceConfig.deviceId}.ino`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Firmware downloaded! Open in Arduino IDE');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Add Arduino-Compatible Sensors</h1>
        <p className="text-muted-foreground">
          Connect any Arduino, ESP32, or microcontroller to VibeLux - hardware agnostic monitoring
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">1. Choose Hardware</TabsTrigger>
          <TabsTrigger value="configure">2. Configure Device</TabsTrigger>
          <TabsTrigger value="download">3. Download & Install</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supported Microcontrollers</CardTitle>
              <CardDescription>
                Choose from popular Arduino-compatible boards. All work with existing VibeLux sensor infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SUPPORTED_BOARDS.map((board) => (
                  <Card 
                    key={board.id} 
                    className={`cursor-pointer transition-all ${
                      selectedBoard === board.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedBoard(board.id);
                      setDeviceConfig(prev => ({ ...prev, deviceType: board.name }));
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{board.name}</CardTitle>
                        <Badge variant={board.difficulty === 'Beginner' ? 'default' : 
                                      board.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}>
                          {board.difficulty}
                        </Badge>
                      </div>
                      <CardDescription>{board.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">{board.cost}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wifi className="h-4 w-4" />
                          <span className="text-sm">{board.connectivity.join(', ')}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {board.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="text-sm text-muted-foreground">
                            • {feature}
                          </div>
                        ))}
                      </div>

                      {board.buyLink && (
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href={board.buyLink} target="_blank" rel="noopener noreferrer">
                            Buy on Amazon
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedBoard && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Selected: {SUPPORTED_BOARDS.find(b => b.id === selectedBoard)?.name}</h3>
                  <Button onClick={() => setActiveTab('configure')}>
                    Configure This Device →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Configuration</CardTitle>
              <CardDescription>
                Set up your {selectedBoard ? SUPPORTED_BOARDS.find(b => b.id === selectedBoard)?.name : 'device'} for VibeLux
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceName">Device Name *</Label>
                  <Input
                    id="deviceName"
                    placeholder="e.g., Greenhouse 1 - Climate Sensor"
                    value={deviceConfig.deviceName}
                    onChange={(e) => setDeviceConfig(prev => ({ ...prev, deviceName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Greenhouse-1, Room-A, Outdoor"
                    value={deviceConfig.location}
                    onChange={(e) => setDeviceConfig(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceId">Device ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="deviceId"
                    placeholder="Auto-generated unique ID"
                    value={deviceConfig.deviceId}
                    onChange={(e) => setDeviceConfig(prev => ({ ...prev, deviceId: e.target.value }))}
                  />
                  <Button variant="outline" onClick={generateDeviceId}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Connection Type</Label>
                <Select 
                  value={deviceConfig.connectionType} 
                  onValueChange={(value: 'wifi' | 'ethernet' | 'cellular' | 'serial') => 
                    setDeviceConfig(prev => ({ ...prev, connectionType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wifi">WiFi</SelectItem>
                    <SelectItem value="ethernet">Ethernet</SelectItem>
                    <SelectItem value="cellular">Cellular</SelectItem>
                    <SelectItem value="serial">USB/Serial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sensor Types (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SENSOR_TYPES.map((sensor) => (
                    <label key={sensor} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={deviceConfig.sensorTypes.includes(sensor)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDeviceConfig(prev => ({
                              ...prev,
                              sensorTypes: [...prev.sensorTypes, sensor]
                            }));
                          } else {
                            setDeviceConfig(prev => ({
                              ...prev,
                              sensorTypes: prev.sensorTypes.filter(s => s !== sensor)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span>{sensor}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    placeholder="Secure API key for device authentication"
                    value={deviceConfig.apiKey}
                    onChange={(e) => setDeviceConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                  <Button variant="outline" onClick={generateApiKey}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleRegisterDevice} disabled={isRegistering} className="flex-1">
                  {isRegistering ? 'Registering...' : 'Register Device'}
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('browse')}>
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="download" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Download Firmware</CardTitle>
              <CardDescription>
                Get pre-configured Arduino code for your {deviceConfig.deviceType}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Device Registered Successfully!</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Device ID:</strong> {deviceConfig.deviceId}
                  </div>
                  <div>
                    <strong>Location:</strong> {deviceConfig.location}
                  </div>
                  <div>
                    <strong>API Key:</strong> 
                    <code className="ml-1 bg-background px-1 rounded">{deviceConfig.apiKey}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(deviceConfig.apiKey)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={downloadFirmware} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Arduino Code (.ino file)
                </Button>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Next Steps:</strong></p>
                  <p>1. Open the downloaded .ino file in Arduino IDE</p>
                  <p>2. Update WiFi credentials in the code</p>
                  <p>3. Install required libraries (listed in code comments)</p>
                  <p>4. Upload to your {deviceConfig.deviceType}</p>
                  <p>5. Your sensor data will appear in VibeLux dashboard automatically</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Need Help?</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/docs/arduino-setup" target="_blank">Setup Guide</a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/docs/troubleshooting" target="_blank">Troubleshooting</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function generateFirmwareCode(board: SupportedBoard, config: DeviceConfig): string {
  // This would generate actual Arduino code based on the board and config
  return `
/*
 * VibeLux Sensor Node - ${config.deviceName}
 * Generated for: ${board.name}
 * Device ID: ${config.deviceId}
 * Location: ${config.location}
 * 
 * This code connects your ${board.name} to VibeLux automatically
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Configuration - UPDATE THESE!
const char* ssid = "YOUR_WIFI_NETWORK";
const char* password = "YOUR_WIFI_PASSWORD";

// VibeLux Configuration - DO NOT CHANGE
const char* vibeluxEndpoint = "https://vibelux.com/api/sensors/readings";
const char* deviceId = "${config.deviceId}";
const char* apiKey = "${config.apiKey}";
const char* location = "${config.location}";

// Sensor Configuration
${config.sensorTypes.map(sensor => `// ${sensor} - Connect to appropriate pins`).join('\n')}

void setup() {
  Serial.begin(115200);
  
  // Initialize sensors
  initializeSensors();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Read sensor data
  float temperature = readTemperature();
  float humidity = readHumidity();
  // Add more sensor readings based on your configuration
  
  // Send to VibeLux
  sendToVibeLux(temperature, humidity);
  
  // Wait 5 minutes before next reading
  delay(300000);
}

void initializeSensors() {
  // Initialize your sensors here
  // Example: dht.begin();
}

float readTemperature() {
  // Replace with actual sensor reading
  return 25.0; // Example value
}

float readHumidity() {
  // Replace with actual sensor reading
  return 50.0; // Example value
}

void sendToVibeLux(float temp, float humidity) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(vibeluxEndpoint);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + String(apiKey));
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["deviceId"] = deviceId;
    doc["location"] = location;
    doc["timestamp"] = millis();
    
    JsonObject measurements = doc.createNestedObject("measurements");
    measurements["temperature"] = temp;
    measurements["humidity"] = humidity;
    
    String payload;
    serializeJson(doc, payload);
    
    int httpCode = http.POST(payload);
    
    if (httpCode > 0) {
      Serial.printf("Data sent successfully. Response: %d\\n", httpCode);
    } else {
      Serial.printf("Error sending data: %s\\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
}

/*
 * Required Libraries (install via Arduino Library Manager):
 * - WiFi (built-in for ESP32)
 * - HTTPClient (built-in for ESP32) 
 * - ArduinoJson by Benoit Blanchon
 * 
 * Add sensor libraries based on your configuration:
${config.sensorTypes.map(sensor => ` * - ${getSensorLibrary(sensor)}`).join('\n')}
 */
`;
}

function getSensorLibrary(sensorType: string): string {
  const libraries: Record<string, string> = {
    'Temperature/Humidity (DHT22)': 'DHT sensor library by Adafruit',
    'Soil Moisture': 'Built-in analogRead()',
    'pH Sensor': 'pH sensor library or analogRead()',
    'CO2 (MQ135)': 'MQ135 library',
    'Light Intensity (BH1750)': 'BH1750 library by Christopher Laws',
    'Water Level': 'Built-in analogRead() or digitalRead()',
    'Motion Detection': 'Built-in digitalRead()',
    'Door/Window Sensors': 'Built-in digitalRead()',
    'Current/Power Monitoring': 'EmonLib or ACS712 library',
    'Custom Analog Sensor': 'Built-in analogRead()'
  };
  
  return libraries[sensorType] || 'Custom library needed';
}