'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  MessageSquare,
  Phone,
  Mail,
  Camera,
  AlertTriangle,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Leaf,
  Activity,
  Zap,
  DollarSign,
  Shield,
  Users,
  Package,
  Truck,
  Calendar,
  Clock,
  Settings,
  Save,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Wifi,
  Video
} from 'lucide-react';

// Alert categories with all possible alert types
const ALERT_CATEGORIES = {
  environmental: {
    name: 'Environmental Conditions',
    icon: Thermometer,
    color: 'text-blue-500',
    alerts: [
      { id: 'temp_high', name: 'High Temperature', description: 'Temperature exceeds threshold', severity: 'high' },
      { id: 'temp_low', name: 'Low Temperature', description: 'Temperature below threshold', severity: 'high' },
      { id: 'humidity_high', name: 'High Humidity', description: 'Humidity exceeds threshold', severity: 'medium' },
      { id: 'humidity_low', name: 'Low Humidity', description: 'Humidity below threshold', severity: 'medium' },
      { id: 'vpd_out_range', name: 'VPD Out of Range', description: 'Vapor pressure deficit not optimal', severity: 'medium' },
      { id: 'co2_high', name: 'High CO₂', description: 'CO₂ levels exceed safe threshold', severity: 'critical' },
      { id: 'co2_low', name: 'Low CO₂', description: 'CO₂ below enrichment target', severity: 'low' },
    ]
  },
  plantHealth: {
    name: 'Plant Health & Stress',
    icon: Leaf,
    color: 'text-green-500',
    alerts: [
      { id: 'plant_stress_high', name: 'High Plant Stress', description: 'Stress level exceeds 30%', severity: 'high' },
      { id: 'nutrient_deficiency', name: 'Nutrient Deficiency', description: 'N, P, K, Ca, or Mg deficiency detected', severity: 'high' },
      { id: 'disease_risk', name: 'Disease Risk Alert', description: 'Environmental conditions favor disease', severity: 'critical' },
      { id: 'pest_detection', name: 'Pest Detection', description: 'Pests detected via image analysis', severity: 'critical' },
      { id: 'growth_rate_low', name: 'Low Growth Rate', description: 'Growth rate below expected', severity: 'medium' },
      { id: 'photosynthesis_low', name: 'Low Photosynthesis', description: 'Photosynthesis rate suboptimal', severity: 'medium' },
      { id: 'water_stress', name: 'Water Stress', description: 'Plants showing water stress signs', severity: 'high' },
    ]
  },
  lighting: {
    name: 'Lighting System',
    icon: Sun,
    color: 'text-yellow-500',
    alerts: [
      { id: 'light_failure', name: 'Light Fixture Failure', description: 'Fixture offline or malfunctioning', severity: 'critical' },
      { id: 'ppfd_low', name: 'Low Light Intensity', description: 'PPFD below target levels', severity: 'medium' },
      { id: 'spectrum_drift', name: 'Spectrum Drift', description: 'Light spectrum changed significantly', severity: 'low' },
      { id: 'photoperiod_error', name: 'Photoperiod Error', description: 'Lights on/off at wrong time', severity: 'high' },
      { id: 'dli_target_missed', name: 'DLI Target Missed', description: 'Daily light integral not achieved', severity: 'medium' },
    ]
  },
  irrigation: {
    name: 'Irrigation & Nutrients',
    icon: Droplets,
    color: 'text-cyan-500',
    alerts: [
      { id: 'irrigation_failure', name: 'Irrigation System Failure', description: 'Pump or valve malfunction', severity: 'critical' },
      { id: 'ph_drift', name: 'pH Drift', description: 'Solution pH outside range', severity: 'high' },
      { id: 'ec_drift', name: 'EC Drift', description: 'Electrical conductivity outside range', severity: 'high' },
      { id: 'water_leak', name: 'Water Leak Detected', description: 'Unexpected water flow detected', severity: 'critical' },
      { id: 'tank_low', name: 'Tank Level Low', description: 'Nutrient tank needs refill', severity: 'medium' },
      { id: 'dosing_error', name: 'Dosing Error', description: 'Nutrient dosing malfunction', severity: 'high' },
      { id: 'runoff_high', name: 'High Runoff', description: 'Excessive irrigation runoff', severity: 'low' },
    ]
  },
  energy: {
    name: 'Energy & Costs',
    icon: Zap,
    color: 'text-purple-500',
    alerts: [
      { id: 'power_outage', name: 'Power Outage', description: 'Main power lost', severity: 'critical' },
      { id: 'demand_peak', name: 'Demand Peak Warning', description: 'Approaching demand charge limit', severity: 'high' },
      { id: 'energy_cost_high', name: 'High Energy Cost', description: 'Energy costs exceed budget', severity: 'medium' },
      { id: 'equipment_inefficient', name: 'Equipment Inefficiency', description: 'Equipment using excess energy', severity: 'low' },
      { id: 'demand_response', name: 'Demand Response Event', description: 'Utility curtailment requested', severity: 'medium' },
    ]
  },
  security: {
    name: 'Security & Access',
    icon: Shield,
    color: 'text-red-500',
    alerts: [
      { id: 'unauthorized_access', name: 'Unauthorized Access', description: 'Door opened without authorization', severity: 'critical' },
      { id: 'motion_detected', name: 'Motion Detected', description: 'Movement in restricted area', severity: 'high' },
      { id: 'camera_offline', name: 'Camera Offline', description: 'Security camera disconnected', severity: 'medium' },
      { id: 'door_left_open', name: 'Door Left Open', description: 'Entry door open too long', severity: 'medium' },
      { id: 'alarm_triggered', name: 'Alarm Triggered', description: 'Security alarm activated', severity: 'critical' },
    ]
  },
  equipment: {
    name: 'Equipment & Maintenance',
    icon: Settings,
    color: 'text-gray-500',
    alerts: [
      { id: 'equipment_failure', name: 'Equipment Failure', description: 'Critical equipment offline', severity: 'critical' },
      { id: 'maintenance_due', name: 'Maintenance Due', description: 'Scheduled maintenance required', severity: 'low' },
      { id: 'filter_replace', name: 'Filter Replacement', description: 'Air/water filters need replacement', severity: 'low' },
      { id: 'calibration_needed', name: 'Calibration Needed', description: 'Sensors need calibration', severity: 'medium' },
      { id: 'backup_failure', name: 'Backup System Failure', description: 'Backup power/systems offline', severity: 'high' },
    ]
  },
  business: {
    name: 'Business Operations',
    icon: DollarSign,
    color: 'text-green-600',
    alerts: [
      { id: 'harvest_ready', name: 'Harvest Ready', description: 'Plants ready for harvest', severity: 'low' },
      { id: 'inventory_low', name: 'Low Inventory', description: 'Supplies running low', severity: 'medium' },
      { id: 'compliance_issue', name: 'Compliance Issue', description: 'Regulatory compliance problem', severity: 'high' },
      { id: 'order_ready', name: 'Order Ready', description: 'Customer order ready for pickup', severity: 'low' },
      { id: 'payment_due', name: 'Payment Due', description: 'Utility or supplier payment due', severity: 'medium' },
    ]
  }
};

// Delivery methods
const DELIVERY_METHODS = [
  { id: 'sms', name: 'SMS Text', icon: MessageSquare, description: 'Text messages to your phone' },
  { id: 'call', name: 'Phone Call', icon: Phone, description: 'Automated voice calls for critical alerts' },
  { id: 'email', name: 'Email', icon: Mail, description: 'Detailed email notifications' },
  { id: 'push', name: 'Push Notification', icon: Smartphone, description: 'Mobile app notifications' },
  { id: 'inapp', name: 'In-App Only', icon: Bell, description: 'Only show in dashboard' },
];

// Time-based rules
const TIME_RULES = [
  { id: 'always', name: 'Always', description: '24/7 alerts' },
  { id: 'business', name: 'Business Hours', description: 'Mon-Fri 8am-6pm' },
  { id: 'critical_only_night', name: 'Critical Only at Night', description: 'Only critical alerts 10pm-6am' },
  { id: 'custom', name: 'Custom Schedule', description: 'Set your own hours' },
];

interface AlertPreference {
  alertId: string;
  enabled: boolean;
  methods: string[];
  escalation?: {
    delayMinutes: number;
    escalateTo: string;
  };
}

interface CameraConfig {
  id: string;
  name: string;
  type: 'ip' | 'nest' | 'ring' | 'wyze' | 'generic';
  url?: string;
  credentials?: {
    username?: string;
    password?: string;
    apiKey?: string;
  };
  zone: string;
  alertAccess: boolean; // Allow direct access from alerts
}

export function AlertPreferences() {
  const [preferences, setPreferences] = useState<Record<string, AlertPreference>>({});
  const [globalMethods, setGlobalMethods] = useState<string[]>(['email', 'inapp']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [timeRule, setTimeRule] = useState('always');
  const [quietHours, setQuietHours] = useState({ start: '22:00', end: '06:00' });
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['environmental']);
  const [cameras, setCameras] = useState<CameraConfig[]>([]);
  const [showCameraSetup, setShowCameraSetup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingAlert, setTestingAlert] = useState<string | null>(null);

  // Initialize preferences
  useEffect(() => {
    loadPreferences();
    loadCameras();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/user/alert-preferences');
      const data = await response.json();
      
      if (data.preferences) {
        setPreferences(data.preferences);
        setGlobalMethods(data.globalMethods || ['email', 'inapp']);
        setPhoneNumber(data.phoneNumber || '');
        setEmail(data.email || '');
        setTimeRule(data.timeRule || 'always');
        setQuietHours(data.quietHours || { start: '22:00', end: '06:00' });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const loadCameras = async () => {
    try {
      const response = await fetch('/api/facility/cameras');
      const data = await response.json();
      setCameras(data.cameras || []);
    } catch (error) {
      console.error('Failed to load cameras:', error);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/alert-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          globalMethods,
          phoneNumber,
          email,
          timeRule,
          quietHours,
        }),
      });

      if (response.ok) {
        // Show success notification
        alert('Preferences saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleAlert = (alertId: string) => {
    setPreferences(prev => ({
      ...prev,
      [alertId]: {
        ...prev[alertId],
        alertId,
        enabled: !prev[alertId]?.enabled,
        methods: prev[alertId]?.methods || globalMethods,
      }
    }));
  };

  const toggleMethod = (alertId: string, method: string) => {
    setPreferences(prev => ({
      ...prev,
      [alertId]: {
        ...prev[alertId],
        methods: prev[alertId]?.methods?.includes(method)
          ? prev[alertId].methods.filter(m => m !== method)
          : [...(prev[alertId]?.methods || []), method]
      }
    }));
  };

  const testAlert = async (alertId: string) => {
    setTestingAlert(alertId);
    try {
      await fetch('/api/alerts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      alert('Test alert sent! Check your configured channels.');
    } catch (error) {
      alert('Failed to send test alert');
    } finally {
      setTestingAlert(null);
    }
  };

  const addCamera = (camera: CameraConfig) => {
    setCameras(prev => [...prev, camera]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Alert Preferences</h1>
        <p className="text-gray-400">Configure which alerts you receive and how you want to be notified</p>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Contact Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone Number (SMS & Calls)</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Global Delivery Preferences */}
      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Default Delivery Methods
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {DELIVERY_METHODS.map(method => {
            const Icon = method.icon;
            const isSelected = globalMethods.includes(method.id);
            
            return (
              <button
                key={method.id}
                onClick={() => {
                  setGlobalMethods(prev =>
                    isSelected
                      ? prev.filter(m => m !== method.id)
                      : [...prev, method.id]
                  );
                }}
                className={`p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">{method.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time-based Rules */}
      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Notification Schedule
        </h2>
        
        <div className="space-y-3">
          {TIME_RULES.map(rule => (
            <label key={rule.id} className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="timeRule"
                value={rule.id}
                checked={timeRule === rule.id}
                onChange={(e) => setTimeRule(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="text-white font-medium">{rule.name}</div>
                <div className="text-sm text-gray-400">{rule.description}</div>
              </div>
            </label>
          ))}
        </div>
        
        {timeRule === 'custom' && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Quiet Hours Start</label>
              <input
                type="time"
                value={quietHours.start}
                onChange={(e) => setQuietHours(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Quiet Hours End</label>
              <input
                type="time"
                value={quietHours.end}
                onChange={(e) => setQuietHours(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Camera Integration */}
      <div className="bg-gray-900 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Camera Integration
          </h2>
          <button
            onClick={() => setShowCameraSetup(!showCameraSetup)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
          >
            Add Camera
          </button>
        </div>
        
        {cameras.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cameras.map(camera => (
              <div key={camera.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">{camera.name}</h3>
                    <p className="text-sm text-gray-400">{camera.type} • {camera.zone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {camera.alertAccess && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                        Alert Access
                      </span>
                    )}
                    <button className="text-gray-400 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No cameras configured. Add cameras to view them directly from alerts.</p>
        )}
      </div>

      {/* Alert Categories */}
      <div className="space-y-4 mb-6">
        {Object.entries(ALERT_CATEGORIES).map(([categoryId, category]) => {
          const Icon = category.icon;
          const isExpanded = expandedCategories.includes(categoryId);
          
          return (
            <div key={categoryId} className="bg-gray-900 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  setExpandedCategories(prev =>
                    isExpanded
                      ? prev.filter(c => c !== categoryId)
                      : [...prev, categoryId]
                  );
                }}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${category.color}`} />
                  <span className="text-lg font-medium text-white">{category.name}</span>
                  <span className="text-sm text-gray-400">
                    ({category.alerts.filter(a => preferences[a.id]?.enabled).length}/{category.alerts.length} active)
                  </span>
                </div>
                {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-4 space-y-3">
                  {category.alerts.map(alert => {
                    const pref = preferences[alert.id] || { enabled: false, methods: globalMethods };
                    
                    return (
                      <div key={alert.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={pref.enabled}
                              onChange={() => toggleAlert(alert.id)}
                              className="mt-1"
                            />
                            <div>
                              <h4 className="font-medium text-white">{alert.name}</h4>
                              <p className="text-sm text-gray-400">{alert.description}</p>
                              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                                alert.severity === 'critical' ? 'bg-red-900 text-red-300' :
                                alert.severity === 'high' ? 'bg-orange-900 text-orange-300' :
                                alert.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                                'bg-green-900 text-green-300'
                              }`}>
                                {alert.severity}
                              </span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => testAlert(alert.id)}
                            disabled={!pref.enabled || testingAlert === alert.id}
                            className="text-sm text-purple-400 hover:text-purple-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                          >
                            {testingAlert === alert.id ? 'Sending...' : 'Test'}
                          </button>
                        </div>
                        
                        {pref.enabled && (
                          <div className="flex gap-2 mt-3">
                            {DELIVERY_METHODS.map(method => {
                              const Icon = method.icon;
                              const isSelected = pref.methods?.includes(method.id);
                              
                              return (
                                <button
                                  key={method.id}
                                  onClick={() => toggleMethod(alert.id, method.id)}
                                  className={`p-2 rounded transition-all ${
                                    isSelected
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                  }`}
                                  title={method.name}
                                >
                                  <Icon className="w-4 h-4" />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={savePreferences}
          disabled={saving}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Preferences
            </>
          )}
        </button>
      </div>

      {/* Camera Setup Modal */}
      {showCameraSetup && (
        <CameraSetupModal
          onClose={() => setShowCameraSetup(false)}
          onAdd={addCamera}
        />
      )}
    </div>
  );
}

// Camera Setup Modal Component
function CameraSetupModal({ onClose, onAdd }: { onClose: () => void; onAdd: (camera: CameraConfig) => void }) {
  const [camera, setCamera] = useState<Partial<CameraConfig>>({
    type: 'ip',
    alertAccess: true,
  });

  const handleSubmit = () => {
    if (camera.name && camera.zone) {
      onAdd({
        id: `cam-${Date.now()}`,
        ...camera as CameraConfig,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">Add Camera</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Camera Name</label>
            <input
              type="text"
              value={camera.name || ''}
              onChange={(e) => setCamera(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Flower Room Camera 1"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Camera Type</label>
            <select
              value={camera.type}
              onChange={(e) => setCamera(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="ip">IP Camera</option>
              <option value="nest">Nest Camera</option>
              <option value="ring">Ring Camera</option>
              <option value="wyze">Wyze Camera</option>
              <option value="generic">Generic RTSP</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Zone/Location</label>
            <input
              type="text"
              value={camera.zone || ''}
              onChange={(e) => setCamera(prev => ({ ...prev, zone: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Flower Room A"
            />
          </div>
          
          {camera.type === 'ip' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Camera URL</label>
              <input
                type="text"
                value={camera.url || ''}
                onChange={(e) => setCamera(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                placeholder="rtsp://192.168.1.100:554/stream"
              />
            </div>
          )}
          
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={camera.alertAccess}
              onChange={(e) => setCamera(prev => ({ ...prev, alertAccess: e.target.checked }))}
              className="rounded"
            />
            <span className="text-white">Allow direct access from alerts</span>
          </label>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Add Camera
          </button>
        </div>
      </div>
    </div>
  );
}