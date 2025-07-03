'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2,
  Settings,
  Users,
  Bell,
  Shield,
  Database,
  Zap,
  Save,
  Upload,
  Download,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Thermometer,
  Droplets
} from 'lucide-react';

export default function FacilitySettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    facilityName: 'VibeLux Production Facility A',
    facilityType: 'Indoor Cultivation',
    location: '1234 Green Valley Drive, Denver, CO',
    timezone: 'America/Denver',
    currency: 'USD',
    operatingHours: {
      start: '06:00',
      end: '22:00'
    },
    
    // Operations Settings
    defaultLightCycle: '18/6',
    temperatureUnit: 'fahrenheit',
    autoHarvest: true,
    autoIrrigation: true,
    yieldTracking: true,
    qualityControl: true,
    
    // Notifications
    emailAlerts: true,
    smsAlerts: false,
    systemMaintenance: true,
    harvestReminders: true,
    environmentalAlerts: true,
    equipmentFailure: true,
    
    // Security
    twoFactor: true,
    sessionTimeout: 30,
    ipWhitelist: '',
    auditLogging: true,
    
    // Integration
    scadaEnabled: false,
    apiAccess: true,
    webhookURL: '',
    apiKey: 'vbx_prod_ak_1234567890abcdef'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/facility/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        // Show success notification
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error notification
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `facility-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'facility-settings.json';
    link.click();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Facility Settings</h1>
          <p className="text-gray-300 mt-2">Configure your facility operations and preferences</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Integration
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Facility Information</CardTitle>
              <CardDescription className="text-gray-300">
                Basic information about your cultivation facility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facilityName">Facility Name</Label>
                  <Input
                    id="facilityName"
                    value={settings.facilityName}
                    onChange={(e) => handleSettingChange('facilityName', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="facilityType">Facility Type</Label>
                  <Select
                    value={settings.facilityType}
                    onValueChange={(value) => handleSettingChange('facilityType', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indoor Cultivation">Indoor Cultivation</SelectItem>
                      <SelectItem value="Greenhouse">Greenhouse</SelectItem>
                      <SelectItem value="Outdoor Farm">Outdoor Farm</SelectItem>
                      <SelectItem value="Hybrid Facility">Hybrid Facility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={settings.location}
                  onChange={(e) => handleSettingChange('location', e.target.value)}
                  className="mt-1"
                  placeholder="Full address including city, state, country"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => handleSettingChange('timezone', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => handleSettingChange('currency', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Operating Hours</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <Label htmlFor="startTime" className="text-sm text-gray-400">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={settings.operatingHours.start}
                      onChange={(e) => handleNestedSettingChange('operatingHours', 'start', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime" className="text-sm text-gray-400">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={settings.operatingHours.end}
                      onChange={(e) => handleNestedSettingChange('operatingHours', 'end', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Settings */}
        <TabsContent value="operations" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Cultivation Settings</CardTitle>
              <CardDescription className="text-gray-300">
                Configure your cultivation operations and automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lightCycle">Default Light Cycle</Label>
                  <Select
                    value={settings.defaultLightCycle}
                    onValueChange={(value) => handleSettingChange('defaultLightCycle', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18/6">18/6 (Vegetative)</SelectItem>
                      <SelectItem value="12/12">12/12 (Flowering)</SelectItem>
                      <SelectItem value="24/0">24/0 (Continuous)</SelectItem>
                      <SelectItem value="20/4">20/4 (Extended Veg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tempUnit">Temperature Unit</Label>
                  <Select
                    value={settings.temperatureUnit}
                    onValueChange={(value) => handleSettingChange('temperatureUnit', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                      <SelectItem value="celsius">Celsius (°C)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Automation Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-white">Auto Harvest</p>
                        <p className="text-sm text-gray-400">Automatically schedule harvest dates</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.autoHarvest}
                      onCheckedChange={(checked) => handleSettingChange('autoHarvest', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-white">Auto Irrigation</p>
                        <p className="text-sm text-gray-400">Automated watering schedules</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.autoIrrigation}
                      onCheckedChange={(checked) => handleSettingChange('autoIrrigation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-white">Yield Tracking</p>
                        <p className="text-sm text-gray-400">Track and analyze yield metrics</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.yieldTracking}
                      onCheckedChange={(checked) => handleSettingChange('yieldTracking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-white">Quality Control</p>
                        <p className="text-sm text-gray-400">Automated quality checks</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.qualityControl}
                      onCheckedChange={(checked) => handleSettingChange('qualityControl', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Alert Preferences</CardTitle>
              <CardDescription className="text-gray-300">
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Delivery Methods</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Email Alerts</p>
                      <p className="text-sm text-gray-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.emailAlerts}
                      onCheckedChange={(checked) => handleSettingChange('emailAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div>
                      <p className="font-medium text-white">SMS Alerts</p>
                      <p className="text-sm text-gray-400">Receive critical alerts via SMS</p>
                    </div>
                    <Switch
                      checked={settings.smsAlerts}
                      onCheckedChange={(checked) => handleSettingChange('smsAlerts', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Alert Types</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-white">System Maintenance</p>
                        <p className="text-sm text-gray-400">Updates and maintenance notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.systemMaintenance}
                      onCheckedChange={(checked) => handleSettingChange('systemMaintenance', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-white">Harvest Reminders</p>
                        <p className="text-sm text-gray-400">Notifications for upcoming harvests</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.harvestReminders}
                      onCheckedChange={(checked) => handleSettingChange('harvestReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Thermometer className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-white">Environmental Alerts</p>
                        <p className="text-sm text-gray-400">Temperature, humidity, and air quality alerts</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.environmentalAlerts}
                      onCheckedChange={(checked) => handleSettingChange('environmentalAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-white">Equipment Failure</p>
                        <p className="text-sm text-gray-400">Critical equipment malfunction alerts</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.equipmentFailure}
                      onCheckedChange={(checked) => handleSettingChange('equipmentFailure', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Configuration</CardTitle>
              <CardDescription className="text-gray-300">
                Manage security settings and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-400">Required for all admin access</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.twoFactor}
                    onCheckedChange={(checked) => handleSettingChange('twoFactor', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-white">Audit Logging</p>
                      <p className="text-sm text-gray-400">Log all system activities</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.auditLogging}
                    onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    className="mt-1"
                    min="5"
                    max="480"
                  />
                  <p className="text-sm text-gray-400 mt-1">Auto-logout after inactivity</p>
                </div>
                <div>
                  <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                  <Textarea
                    id="ipWhitelist"
                    value={settings.ipWhitelist}
                    onChange={(e) => handleSettingChange('ipWhitelist', e.target.value)}
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-400 mt-1">One IP range per line</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integration" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">System Integrations</CardTitle>
              <CardDescription className="text-gray-300">
                Configure external system connections and API access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-white">SCADA Integration</p>
                      <p className="text-sm text-gray-400">Connect to SCADA monitoring systems</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.scadaEnabled}
                    onCheckedChange={(checked) => handleSettingChange('scadaEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-white">API Access</p>
                      <p className="text-sm text-gray-400">Enable external API connections</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.apiAccess}
                    onCheckedChange={(checked) => handleSettingChange('apiAccess', checked)}
                  />
                </div>
              </div>

              {settings.apiAccess && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="flex mt-1">
                      <Input
                        id="apiKey"
                        type={showAPIKey ? 'text' : 'password'}
                        value={settings.apiKey}
                        onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                        className="rounded-r-none"
                        readOnly
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-l-none border-l-0"
                        onClick={() => setShowAPIKey(!showAPIKey)}
                      >
                        {showAPIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Use this key for API authentication</p>
                  </div>

                  <div>
                    <Label htmlFor="webhookURL">Webhook URL</Label>
                    <Input
                      id="webhookURL"
                      value={settings.webhookURL}
                      onChange={(e) => handleSettingChange('webhookURL', e.target.value)}
                      placeholder="https://your-endpoint.com/webhook"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-400 mt-1">Receive real-time event notifications</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}