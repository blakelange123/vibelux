'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  DollarSign, 
  Wifi, 
  Cpu, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  Lightbulb
} from 'lucide-react';

export default function HardwareGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Arduino Sensor Integration Guide</h1>
        <p className="text-muted-foreground">
          Everything you need to know about connecting microcontrollers to VibeLux
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Why Arduino-Compatible Sensors?</CardTitle>
              <CardDescription>
                Cost-effective, flexible monitoring for any cultivation facility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium">Cost Effective</h3>
                  <p className="text-sm text-muted-foreground">
                    $2-25 per sensor node vs $200+ for commercial systems
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Cpu className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Flexible</h3>
                  <p className="text-sm text-muted-foreground">
                    Custom sensors for your specific needs and environment
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium">Scalable</h3>
                  <p className="text-sm text-muted-foreground">
                    Start with one sensor, expand as needed
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Industry Reality
                </h4>
                <p className="text-sm text-muted-foreground">
                  Many successful cultivation facilities use Arduino/ESP32 sensors for monitoring. 
                  VibeLux makes it easy to integrate them with professional-grade analytics and automation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Choose Hardware</h4>
                    <p className="text-sm text-muted-foreground">
                      Pick from popular boards like ESP32 ($5), Arduino Uno ($30), or SAMD51 ($20)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Register Device</h4>
                    <p className="text-sm text-muted-foreground">
                      Use VibeLux device registration to get pre-configured firmware
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Upload & Connect</h4>
                    <p className="text-sm text-muted-foreground">
                      Flash firmware to your board, connect sensors, power on
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Monitor & Automate</h4>
                    <p className="text-sm text-muted-foreground">
                      Data flows to VibeLux dashboard, triggers alerts, enables automation
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hardware" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Hardware by Use Case</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Badge variant="default">Beginner</Badge>
                    First Time Setup
                  </h4>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p><strong>ESP32 Development Board</strong> - $5-8</p>
                    <p className="text-sm text-muted-foreground">
                      Built-in WiFi, lots of tutorials, works with Arduino IDE. Perfect starter choice.
                    </p>
                    <p className="text-sm">
                      <strong>Sensors to try:</strong> DHT22 (temp/humidity), soil moisture probe, light sensor
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Badge variant="secondary">Intermediate</Badge>
                    Multiple Zones
                  </h4>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p><strong>ESP32 + Sensor Shields</strong> - $15-25 per node</p>
                    <p className="text-sm text-muted-foreground">
                      Pre-built sensor boards with multiple inputs. Easy wiring, professional look.
                    </p>
                    <p className="text-sm">
                      <strong>Good for:</strong> Multiple rooms, standardized deployments
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Badge variant="destructive">Advanced</Badge>
                    Professional Development
                  </h4>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p><strong>SAMD51 + Atmel ICE Debugger</strong> - $40-60</p>
                    <p className="text-sm text-muted-foreground">
                      Full debugging capabilities, real-time OS support, professional development workflow.
                    </p>
                    <p className="text-sm">
                      <strong>Best for:</strong> Custom firmware, complex sensor networks, commercial products
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Sensor Combinations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Climate Monitoring ($10-15)</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• DHT22 - Temperature & Humidity</li>
                    <li>• MQ135 - CO2 detection</li>
                    <li>• BH1750 - Light intensity</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Hydroponic System ($8-12)</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• pH sensor probe</li>
                    <li>• EC/TDS meter</li>
                    <li>• Water level sensor</li>
                    <li>• Water temperature</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Security Package ($5-8)</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• PIR motion detector</li>
                    <li>• Door/window contacts</li>
                    <li>• Vibration sensor</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Power Monitoring ($12-20)</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• ACS712 current sensor</li>
                    <li>• Voltage divider</li>
                    <li>• Power calculation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">1. Install Arduino IDE</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Download from arduino.cc - free software for programming microcontrollers
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://www.arduino.cc/en/software" target="_blank">
                        Download Arduino IDE <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">2. Add Board Support</h4>
                    <p className="text-sm text-muted-foreground">
                      For ESP32: File → Preferences → Additional Board Manager URLs
                    </p>
                    <code className="block bg-muted p-2 rounded text-xs mt-2">
                      https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
                    </code>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">3. Install Libraries</h4>
                    <p className="text-sm text-muted-foreground">
                      Tools → Manage Libraries, search for:
                    </p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• WiFi (built-in for ESP32)</li>
                      <li>• ArduinoJson by Benoit Blanchon</li>
                      <li>• DHT sensor library by Adafruit</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">4. Register Device in VibeLux</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Use the device registration wizard to get pre-configured code
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/sensors/devices">Register New Device</a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">5. Upload & Test</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload the generated code, open Serial Monitor to see connection status
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Device Won't Connect to WiFi
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check WiFi credentials, ensure 2.4GHz network (ESP32 doesn't support 5GHz), 
                    verify network allows IoT devices.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Upload Failed / Port Not Found
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Install board drivers, check USB cable (data + power), 
                    try different USB port, hold BOOT button during upload for ESP32.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    Sensor Readings Look Wrong
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check wiring (VCC, GND, data pins), verify sensor power requirements, 
                    calibrate sensors, check for interference.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Data Not Appearing in VibeLux
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verify API key, check device registration, ensure JSON format is correct, 
                    check Serial Monitor for HTTP response codes.
                  </p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Need More Help?</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:support@vibelux.com">Email Support</a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/docs/arduino-troubleshooting" target="_blank">Full Troubleshooting Guide</a>
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