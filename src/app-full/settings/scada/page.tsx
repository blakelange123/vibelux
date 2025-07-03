'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Network,
  Plus,
  Settings,
  Database,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Terminal,
  Cpu,
  Zap,
  Gauge,
  Edit,
  Trash2,
  Play,
  Pause,
  Info
} from 'lucide-react';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '@/components/ui/animated-card';
import { 
  getModbusClient, 
  ModbusDevice, 
  ModbusConfig, 
  ScadaTag,
  createFacilityTags 
} from '@/lib/modbus/modbus-client';
import { Switch } from '@/components/ui/switch';

// Mock devices for demo
const mockDevices: ModbusDevice[] = [
  {
    id: 'plc-1',
    name: 'Main PLC - Allen Bradley',
    config: {
      host: '192.168.1.100',
      port: 502,
      unitId: 1,
      timeout: 3000
    },
    tags: createFacilityTags().slice(0, 5),
    connected: true,
    lastUpdate: new Date()
  },
  {
    id: 'plc-2',
    name: 'HVAC Controller',
    config: {
      host: '192.168.1.101',
      port: 502,
      unitId: 2,
      timeout: 3000
    },
    tags: createFacilityTags().slice(5, 10),
    connected: true,
    lastUpdate: new Date()
  },
  {
    id: 'plc-3',
    name: 'Lighting Controller',
    config: {
      host: '192.168.1.102',
      port: 502,
      unitId: 3,
      timeout: 3000
    },
    tags: createFacilityTags().slice(10),
    connected: false
  }
];

export default function ScadaSettingsPage() {
  const [devices, setDevices] = useState<ModbusDevice[]>(mockDevices);
  const [selectedDevice, setSelectedDevice] = useState<ModbusDevice | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [scanning, setScanning] = useState(false);
  
  // Form states
  const [newDevice, setNewDevice] = useState<Partial<ModbusDevice>>({
    name: '',
    config: {
      host: '',
      port: 502,
      unitId: 1,
      timeout: 3000
    },
    tags: []
  });

  const modbusClient = getModbusClient();

  useEffect(() => {
    // Initialize Modbus client with devices
    devices.forEach(device => {
      modbusClient.addDevice(device);
    });

    // Listen for device events
    const handleDeviceConnected = (deviceId: string) => {
      setDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, connected: true, lastUpdate: new Date() } : d
      ));
    };

    const handleDeviceDisconnected = (deviceId: string) => {
      setDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, connected: false } : d
      ));
    };

    modbusClient.on('deviceConnected', handleDeviceConnected);
    modbusClient.on('deviceDisconnected', handleDeviceDisconnected);

    return () => {
      modbusClient.off('deviceConnected', handleDeviceConnected);
      modbusClient.off('deviceDisconnected', handleDeviceDisconnected);
    };
  }, []);

  const handleAddDevice = () => {
    const device: ModbusDevice = {
      id: `plc-${Date.now()}`,
      name: newDevice.name || 'New Device',
      config: newDevice.config as ModbusConfig,
      tags: [],
      connected: false
    };
    
    setDevices([...devices, device]);
    modbusClient.addDevice(device);
    setShowAddDevice(false);
    setNewDevice({
      name: '',
      config: {
        host: '',
        port: 502,
        unitId: 1,
        timeout: 3000
      },
      tags: []
    });
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices(devices.filter(d => d.id !== deviceId));
    modbusClient.removeDevice(deviceId);
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(null);
    }
  };

  const handleTestConnection = async (device: ModbusDevice) => {
    setTestResults({ ...testResults, [device.id]: { testing: true } });
    
    // Simulate connection test
    setTimeout(() => {
      const success = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF > 0.3;
      setTestResults({
        ...testResults,
        [device.id]: {
          testing: false,
          success,
          message: success ? 'Connection successful' : 'Connection failed: timeout',
          timestamp: new Date()
        }
      });
    }, 2000);
  };

  const handleScanNetwork = () => {
    setScanning(true);
    // Simulate network scan
    setTimeout(() => {
      setScanning(false);
      // Could add found devices to a list
    }, 3000);
  };

  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">SCADA Configuration</h1>
          <p className="text-muted-foreground">
            Configure Modbus devices and data sources for real-time monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleScanNetwork}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Network className="w-4 h-4 mr-2" />
                Scan Network
              </>
            )}
          </Button>
          <Dialog open={showAddDevice} onOpenChange={setShowAddDevice}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Modbus Device</DialogTitle>
                <DialogDescription>
                  Configure a new Modbus TCP/IP device connection
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Device Name</Label>
                  <Input
                    id="name"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    placeholder="e.g., Main PLC"
                  />
                </div>
                <div>
                  <Label htmlFor="host">IP Address</Label>
                  <Input
                    id="host"
                    value={newDevice.config?.host}
                    onChange={(e) => setNewDevice({
                      ...newDevice,
                      config: { ...newDevice.config!, host: e.target.value }
                    })}
                    placeholder="192.168.1.100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={newDevice.config?.port}
                      onChange={(e) => setNewDevice({
                        ...newDevice,
                        config: { ...newDevice.config!, port: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitId">Unit ID</Label>
                    <Input
                      id="unitId"
                      type="number"
                      value={newDevice.config?.unitId}
                      onChange={(e) => setNewDevice({
                        ...newDevice,
                        config: { ...newDevice.config!, unitId: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={newDevice.config?.timeout}
                    onChange={(e) => setNewDevice({
                      ...newDevice,
                      config: { ...newDevice.config!, timeout: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDevice(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDevice}>Add Device</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Modbus Devices</CardTitle>
              <CardDescription>
                {devices.length} device{devices.length !== 1 ? 's' : ''} configured
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedDevice?.id === device.id ? 'bg-blue-50 dark:bg-blue-950' : ''
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(device.connected)}
                          <p className="font-medium">{device.name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {device.config.host}:{device.config.port}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Unit ID: {device.config.unitId}</span>
                          <span>{device.tags.length} tags</span>
                        </div>
                        {device.lastUpdate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last update: {device.lastUpdate.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestConnection(device);
                          }}
                        >
                          <Activity className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDevice(device.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {testResults[device.id] && (
                      <div className={`mt-2 p-2 rounded text-xs ${
                        testResults[device.id].testing 
                          ? 'bg-blue-100 dark:bg-blue-900' 
                          : testResults[device.id].success 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {testResults[device.id].testing ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Testing connection...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {testResults[device.id].success ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {testResults[device.id].message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Details */}
        <div className="lg:col-span-2">
          {selectedDevice ? (
            <Tabs defaultValue="tags">
              <TabsList className="mb-4">
                <TabsTrigger value="tags">Tags</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                <TabsTrigger value="mapping">Widget Mapping</TabsTrigger>
              </TabsList>

              <TabsContent value="tags">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>SCADA Tags</CardTitle>
                        <CardDescription>
                          Configure data points for {selectedDevice.name}
                        </CardDescription>
                      </div>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tag
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tag Name</TableHead>
                          <TableHead>Register</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDevice.tags.map((tag, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">
                              {tag.tagName}
                            </TableCell>
                            <TableCell>
                              {tag.register.address} ({tag.register.length})
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {tag.register.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {tag.value !== undefined ? (
                                <span className="font-mono">
                                  {tag.value} {tag.register.unit}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">--</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {selectedDevice.tags.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No tags configured. Add tags to start monitoring data.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="config">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Configuration</CardTitle>
                    <CardDescription>
                      Modbus TCP/IP connection settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>IP Address</Label>
                        <Input value={selectedDevice.config.host} readOnly />
                      </div>
                      <div>
                        <Label>Port</Label>
                        <Input value={selectedDevice.config.port} readOnly />
                      </div>
                      <div>
                        <Label>Unit ID</Label>
                        <Input value={selectedDevice.config.unitId} readOnly />
                      </div>
                      <div>
                        <Label>Timeout (ms)</Label>
                        <Input value={selectedDevice.config.timeout} readOnly />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="font-medium mb-2">Communication Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-reconnect">Auto Reconnect</Label>
                          <Switch id="auto-reconnect" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="log-errors">Log Communication Errors</Label>
                          <Switch id="log-errors" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="enable-polling">Enable Polling</Label>
                          <Switch id="enable-polling" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Config
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Config
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="diagnostics">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Diagnostics</CardTitle>
                    <CardDescription>
                      Communication statistics and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Gauge className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">98.5%</p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Zap className="w-6 h-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">12ms</p>
                        <p className="text-xs text-muted-foreground">Avg Response</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Activity className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">1.2k</p>
                        <p className="text-xs text-muted-foreground">Requests/Hour</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-xs text-muted-foreground">Errors Today</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Recent Communication Log</h4>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
                          <div className="text-green-400">[12:34:56] TX: Read Holding Registers 40001-40010</div>
                          <div className="text-blue-400">[12:34:56] RX: Success - 10 registers read</div>
                          <div className="text-green-400">[12:34:57] TX: Write Single Register 40002 = 850</div>
                          <div className="text-blue-400">[12:34:57] RX: Success - Register written</div>
                          <div className="text-green-400">[12:34:58] TX: Read Input Registers 30001-30005</div>
                          <div className="text-red-400">[12:34:59] RX: Error - Timeout (3000ms)</div>
                          <div className="text-yellow-400">[12:35:00] Reconnecting...</div>
                          <div className="text-green-400">[12:35:01] Connected to 192.168.1.100:502</div>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <Terminal className="w-4 h-4 mr-2" />
                        Open Modbus Terminal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mapping">
                <Card>
                  <CardHeader>
                    <CardTitle>Widget Data Mapping</CardTitle>
                    <CardDescription>
                      Map SCADA tags to dashboard widgets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="mb-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Tags from this device can be mapped to dashboard widgets for real-time visualization.
                        Use the format: <code className="font-mono">modbus://{selectedDevice.id}/tagname</code>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      {selectedDevice.tags.slice(0, 5).map((tag, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-mono text-sm">{tag.tagName}</p>
                            <p className="text-xs text-muted-foreground">
                              {tag.register.description || `Register ${tag.register.address}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              modbus://{selectedDevice.id}/{tag.tagName}
                            </code>
                            <Button variant="ghost" size="sm">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <Cpu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a device to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}