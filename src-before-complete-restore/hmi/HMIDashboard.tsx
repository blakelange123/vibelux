'use client';

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Settings,
  Play,
  Pause,
  AlertTriangle,
  Activity,
  Layers,
  Plus,
  Search,
  Download,
  Upload,
  Eye,
  EyeOff,
  Maximize2,
  Grid3x3,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Network,
  X,
  Loader2,
  Move,
  Wrench
} from 'lucide-react';
import { HMIVisualization } from './HMIVisualization';
import { EquipmentSetupWizard } from './EquipmentSetupWizard';
import { EnvironmentalKPIs } from './EnvironmentalKPIs';
import { TelemetryChart } from './TelemetryChart';
import { EquipmentZoneManager, EquipmentZone } from './EquipmentZoneManager';
import { AlarmManager, Alarm } from './AlarmManager';
import { AutomationRulesBuilder, Schedule, AutomationRule } from './AutomationRulesBuilder';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';
import { EquipmentLayoutEditor } from './EquipmentLayoutEditor';
import { MaintenanceScheduler } from './MaintenanceScheduler';
import { 
  EquipmentDefinition, 
  EquipmentDiscoveryService,
  HMILayoutGenerator,
  EquipmentType,
  EQUIPMENT_TEMPLATES 
} from '@/lib/hmi/equipment-registry';
import { climateComputerManager } from '@/lib/integrations/climate-computers/integration-manager';

interface HMIDashboardProps {
  facilityId: string;
  roomId?: string;
}

// Calculate VPD helper function
const calculateVPD = (temp: number, rh: number): number => {
  const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  const avp = (rh / 100) * svp;
  return Number((svp - avp).toFixed(2));
};

export function HMIDashboard({ facilityId, roomId }: HMIDashboardProps) {
  const [equipment, setEquipment] = useState<EquipmentDefinition[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentDefinition | null>(null);
  const [view, setView] = useState<'2D' | '3D'>('2D');
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [systemStatus, setSystemStatus] = useState({
    totalEquipment: 0,
    activeEquipment: 0,
    alarms: 0,
    warnings: 0
  });
  const [zones, setZones] = useState<EquipmentZone[]>([]);
  const [showZones, setShowZones] = useState(false);
  const [environmentalData, setEnvironmentalData] = useState({
    temperature: 24.5,
    humidity: 65,
    co2: 1200,
    light: 650,
    airflow: 0.5
  });
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'visualization' | 'layout' | 'zones' | 'charts' | 'alarms' | 'automation' | 'maintenance'>('visualization');
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-discover equipment on mount
  useEffect(() => {
    discoverEquipment();
  }, [facilityId, roomId]);

  // Auto-refresh telemetry
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      updateTelemetry();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const discoverEquipment = async () => {
    setIsScanning(true);
    setIsLoading(true);
    try {
      // Try to discover from climate computers first
      let discovered: EquipmentDefinition[] = [];
      
      try {
        // Get equipment from integrated climate computers
        const climateEquipment = await climateComputerManager.getAllEquipment(facilityId);
        discovered.push(...climateEquipment);
        
        // Sync data from all climate computers
        await climateComputerManager.syncAll();
      } catch (error) {
        console.warn('Climate computer discovery failed, using demo data:', error);
      }
      
      // If no equipment found, create sample equipment for demo
      if (discovered.length === 0) {
        discovered = await createSampleEquipment();
      }
      
      setEquipment(discovered);
      
      // Update system status
      updateSystemStatus(discovered);
    } catch (error) {
      console.error('Equipment discovery failed:', error);
    } finally {
      setIsScanning(false);
      setIsLoading(false);
    }
  };

  const createSampleEquipment = async (): Promise<EquipmentDefinition[]> => {
    // Simulate equipment discovery with common grow room equipment
    const sampleEquipment: EquipmentDefinition[] = [
      {
        id: 'temp-sensor-1',
        type: EquipmentType.TEMP_SENSOR,
        name: 'Temperature Sensor 1',
        location: 'Room A',
        position: { x: -8, y: 0, z: 0 },
        specifications: { range: '0-50°C', accuracy: '±0.5°C' },
        connections: [],
        controlPoints: [],
        telemetry: [
          { id: 'temperature', name: 'Temperature', value: 24.5, unit: '°C', min: 0, max: 50 }
        ],
        animations: []
      },
      {
        id: 'humidity-sensor-1',
        type: EquipmentType.HUMIDITY_SENSOR,
        name: 'Humidity Sensor 1',
        location: 'Room A',
        position: { x: -6, y: 0, z: 0 },
        specifications: { range: '0-100%', accuracy: '±2%' },
        connections: [],
        controlPoints: [],
        telemetry: [
          { id: 'humidity', name: 'Humidity', value: 65, unit: '%', min: 0, max: 100 }
        ],
        animations: []
      },
      {
        id: 'co2-sensor-1',
        type: EquipmentType.CO2_SENSOR,
        name: 'CO2 Sensor 1',
        location: 'Room A',
        position: { x: -4, y: 0, z: 0 },
        specifications: { range: '0-5000ppm', accuracy: '±50ppm' },
        connections: [],
        controlPoints: [],
        telemetry: [
          { id: 'co2', name: 'CO2', value: 1200, unit: 'ppm', min: 0, max: 5000 }
        ],
        animations: []
      },
      {
        id: 'fan-exhaust-1',
        type: EquipmentType.EXHAUST_FAN,
        name: 'Exhaust Fan 1',
        location: 'Room A',
        position: { x: 5, y: 2, z: 0 },
        specifications: { cfm: 1000, power: 150 },
        connections: [],
        controlPoints: [
          { id: 'power', name: 'Power', type: 'boolean', value: true, writeEnabled: true },
          { id: 'speed', name: 'Speed', type: 'range', value: 75, min: 0, max: 100, unit: '%', writeEnabled: true }
        ],
        telemetry: [
          { id: 'rpm', name: 'RPM', value: 2250, unit: 'RPM', min: 0, max: 3000 },
          { id: 'power_consumption', name: 'Power', value: 0.112, unit: 'kW', min: 0, max: 0.15 }
        ],
        animations: EQUIPMENT_TEMPLATES[EquipmentType.FAN]?.animations || []
      },
      {
        id: 'fan-intake-1',
        type: EquipmentType.FAN,
        name: 'Intake Fan 1',
        location: 'Room A',
        position: { x: -5, y: 2, z: 0 },
        specifications: { cfm: 800, power: 100 },
        connections: [],
        controlPoints: [
          { id: 'power', name: 'Power', type: 'boolean', value: true, writeEnabled: true },
          { id: 'speed', name: 'Speed', type: 'range', value: 60, min: 0, max: 100, unit: '%', writeEnabled: true }
        ],
        telemetry: [
          { id: 'rpm', name: 'RPM', value: 1800, unit: 'RPM', min: 0, max: 3000 },
          { id: 'power_consumption', name: 'Power', value: 0.06, unit: 'kW', min: 0, max: 0.1 }
        ],
        animations: EQUIPMENT_TEMPLATES[EquipmentType.FAN]?.animations || []
      },
      {
        id: 'dehumidifier-1',
        type: EquipmentType.DEHUMIDIFIER,
        name: 'Quest 506',
        location: 'Room A',
        position: { x: 0, y: -3, z: 0 },
        specifications: { capacity: 506, power: 7400 },
        connections: [],
        controlPoints: [
          { id: 'power', name: 'Power', type: 'boolean', value: true, writeEnabled: true },
          { id: 'setpoint', name: 'RH Setpoint', type: 'range', value: 55, min: 30, max: 80, unit: '%', writeEnabled: true }
        ],
        telemetry: [
          { id: 'current_rh', name: 'Current RH', value: 58, unit: '%', min: 0, max: 100 },
          { id: 'water_removed', name: 'Water Removed', value: 125, unit: 'pints/day', min: 0, max: 506 },
          { id: 'power_consumption', name: 'Power', value: 5.2, unit: 'kW', min: 0, max: 7.4 }
        ],
        animations: []
      },
      {
        id: 'pump-nutrient-1',
        type: EquipmentType.DOSING_PUMP,
        name: 'Nutrient Pump A',
        location: 'Room A',
        position: { x: -8, y: -5, z: 0 },
        specifications: { flowRate: 10, pressure: 50 },
        connections: [{ id: 'conn-1', type: 'output', medium: 'water', position: { x: 1, y: 0 } }],
        controlPoints: EQUIPMENT_TEMPLATES[EquipmentType.PUMP]?.controlPoints || [],
        telemetry: EQUIPMENT_TEMPLATES[EquipmentType.PUMP]?.telemetry || [],
        animations: EQUIPMENT_TEMPLATES[EquipmentType.PUMP]?.animations || []
      },
      {
        id: 'tank-nutrient-1',
        type: EquipmentType.TANK,
        name: 'Nutrient Tank A',
        location: 'Room A',
        position: { x: -5, y: -5, z: 0 },
        specifications: { capacity: 100, material: 'HDPE' },
        connections: [{ id: 'conn-2', type: 'input', medium: 'water', position: { x: -1, y: 0 } }],
        controlPoints: EQUIPMENT_TEMPLATES[EquipmentType.TANK]?.controlPoints || [],
        telemetry: [
          { id: 'level', name: 'Level', value: 18, unit: '%', min: 0, max: 100, alarmLow: 20, alarmHigh: 90 },
          { id: 'volume', name: 'Volume', value: 18, unit: 'gal', min: 0, max: 100 },
          { id: 'ph', name: 'pH', value: 6.8, unit: '', min: 0, max: 14, alarmLow: 5.5, alarmHigh: 6.5 },
          { id: 'ec', name: 'EC', value: 2.8, unit: 'mS/cm', min: 0, max: 5, alarmLow: 1.0, alarmHigh: 2.5 }
        ],
        animations: EQUIPMENT_TEMPLATES[EquipmentType.TANK]?.animations || []
      },
      {
        id: 'led-bank-1',
        type: EquipmentType.LED_FIXTURE,
        name: 'LED Bank 1',
        location: 'Room A',
        position: { x: 0, y: 5, z: 2 },
        specifications: { wattage: 645, ppf: 1700 },
        connections: [],
        controlPoints: EQUIPMENT_TEMPLATES[EquipmentType.LED_FIXTURE]?.controlPoints || [],
        telemetry: EQUIPMENT_TEMPLATES[EquipmentType.LED_FIXTURE]?.telemetry || [],
        animations: EQUIPMENT_TEMPLATES[EquipmentType.LED_FIXTURE]?.animations || []
      }
    ];
    
    return sampleEquipment;
  };

  const updateTelemetry = () => {
    // Simulate telemetry updates
    setEquipment(prev => {
      const updated = prev.map(eq => ({
        ...eq,
        telemetry: eq.telemetry.map(t => ({
          ...t,
          value: t.value + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * (t.max - t.min) * 0.02
        }))
      }));
      
      // Update environmental data from sensors
      const tempSensor = updated.find(e => e.type === EquipmentType.TEMP_SENSOR);
      const humiditySensor = updated.find(e => e.type === EquipmentType.HUMIDITY_SENSOR);
      const co2Sensor = updated.find(e => e.type === EquipmentType.CO2_SENSOR);
      
      if (tempSensor || humiditySensor || co2Sensor) {
        setEnvironmentalData(prev => ({
          ...prev,
          temperature: tempSensor?.telemetry[0]?.value || prev.temperature,
          humidity: humiditySensor?.telemetry[0]?.value || prev.humidity,
          co2: co2Sensor?.telemetry[0]?.value || prev.co2
        }));
      }
      
      // Add to telemetry history
      setTelemetryHistory(prev => {
        const newPoint = {
          timestamp: new Date(),
          temperature: tempSensor?.telemetry[0]?.value || 24.5,
          humidity: humiditySensor?.telemetry[0]?.value || 65,
          co2: co2Sensor?.telemetry[0]?.value || 1200
        };
        const history = [...prev, newPoint].slice(-50); // Keep last 50 points
        return history;
      });
      
      return updated;
    });
  };

  const updateSystemStatus = (equip: EquipmentDefinition[]) => {
    const active = equip.filter(e => 
      e.controlPoints.find(cp => cp.id === 'power')?.value === true
    ).length;
    
    let alarmCount = 0;
    let warnings = 0;
    const newAlarms: Alarm[] = [];
    
    equip.forEach(e => {
      e.telemetry.forEach(t => {
        const existingAlarm = alarms.find(a => 
          a.equipmentId === e.id && 
          a.message.includes(t.name) &&
          !a.resolved
        );

        if (t.alarmHigh && t.value > t.alarmHigh) {
          if (!existingAlarm) {
            newAlarms.push({
              id: `alarm-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF}`,
              timestamp: new Date(),
              equipmentId: e.id,
              equipmentName: e.name,
              type: 'critical',
              category: getAlarmCategory(e.type),
              message: `${t.name} too high: ${t.value}${t.unit} (limit: ${t.alarmHigh}${t.unit})`,
              value: t.value,
              unit: t.unit,
              threshold: t.alarmHigh,
              acknowledged: false,
              resolved: false
            });
          }
          alarmCount++;
        } else if (t.alarmLow && t.value < t.alarmLow) {
          if (!existingAlarm) {
            newAlarms.push({
              id: `alarm-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF}`,
              timestamp: new Date(),
              equipmentId: e.id,
              equipmentName: e.name,
              type: 'critical',
              category: getAlarmCategory(e.type),
              message: `${t.name} too low: ${t.value}${t.unit} (limit: ${t.alarmLow}${t.unit})`,
              value: t.value,
              unit: t.unit,
              threshold: t.alarmLow,
              acknowledged: false,
              resolved: false
            });
          }
          alarmCount++;
        } else if (t.alarmHigh && t.value > t.alarmHigh * 0.9) {
          if (!existingAlarm) {
            newAlarms.push({
              id: `alarm-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF}`,
              timestamp: new Date(),
              equipmentId: e.id,
              equipmentName: e.name,
              type: 'warning',
              category: getAlarmCategory(e.type),
              message: `${t.name} approaching high limit: ${t.value}${t.unit}`,
              value: t.value,
              unit: t.unit,
              threshold: t.alarmHigh,
              acknowledged: false,
              resolved: false
            });
          }
          warnings++;
        } else if (t.alarmLow && t.value < t.alarmLow * 1.1) {
          if (!existingAlarm) {
            newAlarms.push({
              id: `alarm-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF}`,
              timestamp: new Date(),
              equipmentId: e.id,
              equipmentName: e.name,
              type: 'warning',
              category: getAlarmCategory(e.type),
              message: `${t.name} approaching low limit: ${t.value}${t.unit}`,
              value: t.value,
              unit: t.unit,
              threshold: t.alarmLow,
              acknowledged: false,
              resolved: false
            });
          }
          warnings++;
        }
      });
    });

    // Add new alarms
    if (newAlarms.length > 0) {
      setAlarms(prev => [...prev, ...newAlarms]);
    }

    // Auto-resolve alarms that are no longer valid
    setAlarms(prev => prev.map(alarm => {
      if (!alarm.resolved) {
        const equipment = equip.find(e => e.id === alarm.equipmentId);
        if (equipment) {
          const telemetry = equipment.telemetry.find(t => alarm.message.includes(t.name));
          if (telemetry) {
            const isStillAlarming = (alarm.type === 'critical' && (
              (telemetry.alarmHigh && telemetry.value > telemetry.alarmHigh) ||
              (telemetry.alarmLow && telemetry.value < telemetry.alarmLow)
            )) || (alarm.type === 'warning' && (
              (telemetry.alarmHigh && telemetry.value > telemetry.alarmHigh * 0.9) ||
              (telemetry.alarmLow && telemetry.value < telemetry.alarmLow * 1.1)
            ));

            if (!isStillAlarming) {
              return { ...alarm, resolved: true, resolvedAt: new Date() };
            }
          }
        }
      }
      return alarm;
    }));
    
    setSystemStatus({
      totalEquipment: equip.length,
      activeEquipment: active,
      alarms: alarmCount,
      warnings
    });
  };

  const getAlarmCategory = (equipmentType: EquipmentType): Alarm['category'] => {
    if (equipmentType.includes('TEMP') || equipmentType.includes('HEATER') || equipmentType.includes('AC')) {
      return 'temperature';
    }
    if (equipmentType.includes('HUMID') || equipmentType.includes('DEHUMIDIFIER')) {
      return 'humidity';
    }
    if (equipmentType.includes('PUMP') || equipmentType.includes('VALVE')) {
      return 'equipment';
    }
    if (equipmentType.includes('LED') || equipmentType.includes('LIGHT')) {
      return 'power';
    }
    return 'system';
  };

  const handleEquipmentControl = (equipmentId: string, controlId: string, value: any) => {
    setEquipment(prev => prev.map(eq => {
      if (eq.id === equipmentId) {
        return {
          ...eq,
          controlPoints: eq.controlPoints.map(cp => 
            cp.id === controlId ? { ...cp, value } : cp
          )
        };
      }
      return eq;
    }));
  };

  const handleZoneControl = (zoneId: string, action: 'on' | 'off' | 'toggle') => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    const newState = action === 'toggle' ? !zone.enabled : action === 'on';
    
    // Update zone state
    setZones(prev => prev.map(z => 
      z.id === zoneId ? { ...z, enabled: newState } : z
    ));

    // Control all equipment in the zone
    zone.equipment.forEach(equipmentId => {
      const powerControl = equipment.find(e => e.id === equipmentId)
        ?.controlPoints.find(cp => cp.id === 'power');
      
      if (powerControl) {
        handleEquipmentControl(equipmentId, 'power', newState);
      }
    });
  };

  const addEquipment = () => {
    // Open equipment addition wizard
    setShowSetupWizard(true);
  };

  const handleAlarmAcknowledge = (alarmId: string, notes?: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId 
        ? { 
            ...alarm, 
            acknowledged: true, 
            acknowledgedBy: 'Operator',
            acknowledgedAt: new Date(),
            notes 
          }
        : alarm
    ));
  };

  const handleAlarmClear = (alarmId: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId 
        ? { ...alarm, resolved: true, resolvedAt: new Date() }
        : alarm
    ));
  };

  const handleAlarmClearAll = () => {
    setAlarms(prev => prev.filter(alarm => !alarm.resolved));
  };

  const handleAlarmExport = () => {
    const csv = [
      ['Timestamp', 'Type', 'Equipment', 'Message', 'Value', 'Acknowledged', 'Resolved'],
      ...alarms.map(alarm => [
        alarm.timestamp.toISOString(),
        alarm.type,
        alarm.equipmentName,
        alarm.message,
        alarm.value ? `${alarm.value}${alarm.unit}` : '',
        alarm.acknowledged ? 'Yes' : 'No',
        alarm.resolved ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alarms-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTestRule = (rule: AutomationRule) => {
    // Test the automation rule
    
    // Simulate rule execution
    if (rule.enabled && rule.actions.length > 0) {
      rule.actions.forEach(action => {
        setTimeout(() => {
          handleEquipmentControl(action.equipmentId, action.controlPointId, action.value);
        }, (action.delay || 0) * 60 * 1000);
      });
      
      // Update last triggered
      setAutomationRules(prev => prev.map(r => 
        r.id === rule.id ? { ...r, lastTriggered: new Date() } : r
      ));
    }
  };

  // Add state for setup wizard
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Monitor className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold">HMI Control Center</h1>
              <p className="text-sm text-gray-400">Real-time Equipment Monitoring & Control</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* System Status */}
            <div className="flex items-center gap-6 px-4 py-2 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm">
                  <span className="font-semibold">{systemStatus.activeEquipment}</span>
                  <span className="text-gray-400">/{systemStatus.totalEquipment} Active</span>
                </span>
              </div>
              
              {systemStatus.alarms > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="text-sm text-red-400">{systemStatus.alarms} Alarms</span>
                </div>
              )}
              
              {systemStatus.warnings > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">{systemStatus.warnings} Warnings</span>
                </div>
              )}
            </div>
            
            {/* Auto Refresh */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="bg-gray-900/50 border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === '2D' ? '3D' : '2D')}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2 text-sm"
            >
              {view === '2D' ? <Grid3x3 className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
              {view} View
            </button>
            
            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2 text-sm"
            >
              {showTelemetry ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Telemetry
            </button>
            
            <button
              onClick={discoverEquipment}
              disabled={isScanning}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Search className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Scan Equipment'}
            </button>
            
            <button
              onClick={addEquipment}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </button>
            
            <button
              onClick={() => setShowIntegrations(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 text-sm"
            >
              <Network className="w-4 h-4" />
              Integrations
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-800 rounded">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-gray-800 rounded">
              <Upload className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-gray-800 rounded">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-gray-800 rounded">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Environmental KPIs */}
      <div className="px-4 md:px-6 py-4 bg-gray-900/50">
        <ErrorBoundary>
          <EnvironmentalKPIs {...environmentalData} />
        </ErrorBoundary>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800 px-4 md:px-6 overflow-x-auto">
        <div className="flex gap-2 md:gap-4 min-w-max">
          <button
            onClick={() => setActiveTab('visualization')}
            className={`py-3 px-3 md:px-4 border-b-2 transition-colors whitespace-nowrap text-sm md:text-base ${
              activeTab === 'visualization' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4 inline mr-1 md:mr-2" />
            <span className="hidden sm:inline">Visualization</span>
            <span className="sm:hidden">View</span>
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'layout' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Move className="w-4 h-4 inline mr-2" />
            Layout
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'zones' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Grid3x3 className="w-4 h-4 inline mr-2" />
            Zones
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'charts' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('alarms')}
            className={`py-3 px-4 border-b-2 transition-colors relative ${
              activeTab === 'alarms' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Alarms
            {alarms.filter(a => !a.acknowledged && !a.resolved).length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-600 text-white text-xs rounded-full animate-pulse">
                {alarms.filter(a => !a.acknowledged && !a.resolved).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'automation' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Automation
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'maintenance' 
                ? 'border-purple-500 text-purple-500' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4 inline mr-2" />
            <span className="hidden sm:inline">Maintenance</span>
            <span className="sm:hidden">Maint.</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-280px)] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-950/80 flex items-center justify-center z-40">
            <LoadingSpinner size="lg" text="Discovering equipment..." />
          </div>
        )}
        
        {activeTab === 'visualization' && (
          <>
            {/* HMI Visualization */}
            <div className="flex-1 p-4">
              <HMIVisualization
                equipment={equipment}
                onEquipmentClick={setSelectedEquipment}
                showTelemetry={showTelemetry}
                view={view}
              />
            </div>
          </>
        )}

        {activeTab === 'layout' && (
          <div className="flex-1 p-6">
            <EquipmentLayoutEditor
              facilityId={facilityId}
              roomId={roomId}
              equipment={equipment.map(eq => ({
                id: eq.id,
                name: eq.name,
                type: eq.type,
                status: (eq.state || 'idle').toLowerCase() as 'running' | 'idle' | 'warning' | 'error',
                icon: eq.type === 'HVAC' ? '🌡️' : 
                      eq.type === 'Lighting' ? '💡' : 
                      eq.type === 'Irrigation' ? '💧' : 
                      eq.type === 'Sensor' ? '📊' : '⚙️'
              }))}
              onSave={(positions) => {
                // Here you would typically save to backend
              }}
            />
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="flex-1 p-6">
            <EquipmentZoneManager
              equipment={equipment}
              zones={zones}
              onZoneUpdate={setZones}
              onZoneControl={handleZoneControl}
            />
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Temperature Trend</h3>
                <TelemetryChart
                  data={telemetryHistory.map(h => ({ 
                    timestamp: h.timestamp, 
                    value: h.temperature 
                  }))}
                  label="Temperature"
                  unit="°C"
                  color="#EF4444"
                  min={15}
                  max={35}
                />
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Humidity Trend</h3>
                <TelemetryChart
                  data={telemetryHistory.map(h => ({ 
                    timestamp: h.timestamp, 
                    value: h.humidity 
                  }))}
                  label="Humidity"
                  unit="%"
                  color="#06B6D4"
                  min={30}
                  max={90}
                />
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">CO₂ Trend</h3>
                <TelemetryChart
                  data={telemetryHistory.map(h => ({ 
                    timestamp: h.timestamp, 
                    value: h.co2 
                  }))}
                  label="CO₂"
                  unit="ppm"
                  color="#10B981"
                  min={300}
                  max={2000}
                />
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">VPD History</h3>
                <TelemetryChart
                  data={telemetryHistory.map(h => ({ 
                    timestamp: h.timestamp, 
                    value: calculateVPD(h.temperature, h.humidity)
                  }))}
                  label="VPD"
                  unit="kPa"
                  color="#8B5CF6"
                  min={0}
                  max={2}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alarms' && (
          <div className="flex-1">
            <AlarmManager
              alarms={alarms}
              onAcknowledge={handleAlarmAcknowledge}
              onClear={handleAlarmClear}
              onClearAll={handleAlarmClearAll}
              onExport={handleAlarmExport}
            />
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="flex-1">
            <AutomationRulesBuilder
              equipment={equipment}
              schedules={schedules}
              rules={automationRules}
              onScheduleUpdate={setSchedules}
              onRuleUpdate={setAutomationRules}
              onTestRule={handleTestRule}
            />
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="flex-1 p-6">
            <MaintenanceScheduler
              equipmentList={equipment.map(eq => ({
                id: eq.id,
                name: eq.name,
                type: eq.type
              }))}
              onTaskUpdate={(task) => {
                // Here you would typically update the backend
              }}
            />
          </div>
        )}
        
        {/* Equipment Details Panel */}
        {selectedEquipment && activeTab === 'visualization' && (
          <div className="w-full md:w-96 absolute md:relative right-0 top-0 h-full bg-gray-900 border-l border-gray-800 p-4 md:p-6 overflow-y-auto shadow-2xl md:shadow-none transition-transform duration-300 transform">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{selectedEquipment.name}</h2>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="p-1 hover:bg-gray-800 rounded"
              >
                ×
              </button>
            </div>
            
            {/* Control Points */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Controls</h3>
              <div className="space-y-3">
                {selectedEquipment.controlPoints.map(control => (
                  <div key={control.id}>
                    <label className="flex items-center justify-between text-sm">
                      <span>{control.name}</span>
                      {control.type === 'boolean' ? (
                        <button
                          onClick={() => handleEquipmentControl(
                            selectedEquipment.id,
                            control.id,
                            !control.value
                          )}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            control.value 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {control.value ? 'ON' : 'OFF'}
                        </button>
                      ) : control.type === 'range' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={control.min}
                            max={control.max}
                            value={control.value}
                            onChange={(e) => handleEquipmentControl(
                              selectedEquipment.id,
                              control.id,
                              Number(e.target.value)
                            )}
                            className="w-24"
                          />
                          <span className="text-xs w-12 text-right">
                            {control.value}{control.unit}
                          </span>
                        </div>
                      ) : (
                        <select
                          value={control.value}
                          onChange={(e) => handleEquipmentControl(
                            selectedEquipment.id,
                            control.id,
                            e.target.value
                          )}
                          className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs"
                        >
                          {control.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Telemetry */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Telemetry</h3>
              <div className="space-y-3">
                {selectedEquipment.telemetry.map(telemetry => {
                  const isAlarm = (telemetry.alarmHigh && telemetry.value > telemetry.alarmHigh) ||
                                 (telemetry.alarmLow && telemetry.value < telemetry.alarmLow);
                  const isWarning = !isAlarm && (
                    (telemetry.alarmHigh && telemetry.value > telemetry.alarmHigh * 0.9) ||
                    (telemetry.alarmLow && telemetry.value < telemetry.alarmLow * 1.1)
                  );
                  
                  return (
                    <div 
                      key={telemetry.id}
                      className={`p-3 rounded-lg ${
                        isAlarm ? 'bg-red-900/20 border border-red-500/30' :
                        isWarning ? 'bg-yellow-900/20 border border-yellow-500/30' :
                        'bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{telemetry.name}</span>
                        <span className={`text-lg font-semibold ${
                          isAlarm ? 'text-red-400' :
                          isWarning ? 'text-yellow-400' :
                          'text-white'
                        }`}>
                          {telemetry.value.toFixed(1)} {telemetry.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            isAlarm ? 'bg-red-500' :
                            isWarning ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ 
                            width: `${((telemetry.value - telemetry.min) / (telemetry.max - telemetry.min)) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{telemetry.min}</span>
                        <span>{telemetry.max}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Equipment Info */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Equipment Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="text-gray-300">{selectedEquipment.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Location</dt>
                  <dd className="text-gray-300">{selectedEquipment.location}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">ID</dt>
                  <dd className="text-gray-300 font-mono text-xs">{selectedEquipment.id}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
      
      {/* Equipment Setup Wizard */}
      {showSetupWizard && (
        <EquipmentSetupWizard
          onComplete={(newEquipment) => {
            const equipmentWithIds = newEquipment.map(eq => ({
              ...eq,
              id: eq.id || `${eq.type}-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF.toString(36).substr(2, 9)}`
            }));
            setEquipment([...equipment, ...equipmentWithIds]);
            setShowSetupWizard(false);
            updateSystemStatus([...equipment, ...equipmentWithIds]);
          }}
          onClose={() => setShowSetupWizard(false)}
        />
      )}
      
      {/* Climate Computer Integrations Modal */}
      {showIntegrations && (
        <ClimateComputerIntegrationsModal
          onClose={() => setShowIntegrations(false)}
          onIntegrationAdded={() => {
            // Refresh equipment discovery
            discoverEquipment();
          }}
        />
      )}
    </div>
  );
}

// Climate Computer Integrations Modal Component
function ClimateComputerIntegrationsModal({ onClose, onIntegrationAdded }: {
  onClose: () => void;
  onIntegrationAdded: () => void;
}) {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredSystems, setDiscoveredSystems] = useState<any[]>([]);

  useEffect(() => {
    // Load existing integrations
    const status = climateComputerManager.getIntegrationStatus();
    setIntegrations(status);
  }, []);

  const autoDiscover = async () => {
    setIsDiscovering(true);
    try {
      const discovered = await climateComputerManager.autoDiscover();
      setDiscoveredSystems(discovered);
    } catch (error) {
      console.error('Auto-discovery failed:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const addIntegration = async (config: any) => {
    try {
      config.enabled = true;
      await climateComputerManager.addIntegration(config);
      
      // Refresh integrations list
      const status = climateComputerManager.getIntegrationStatus();
      setIntegrations(status);
      
      // Remove from discovered list
      setDiscoveredSystems(discoveredSystems.filter(d => d.id !== config.id));
      
      onIntegrationAdded();
    } catch (error) {
      console.error('Failed to add integration:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Climate Computer Integrations</h2>
            <p className="text-sm text-gray-400">Connect to Priva, Hortimax, Argus, and other systems</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Existing Integrations */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-white mb-4">Active Integrations</h3>
            {integrations.length > 0 ? (
              <div className="space-y-3">
                {integrations.map(integration => (
                  <div key={integration.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{integration.name}</h4>
                        <p className="text-sm text-gray-400 capitalize">{integration.brand}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="text-gray-400">Data Points: </span>
                          <span className="text-white">{integration.dataPointCount}</span>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          integration.connected ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </div>
                    {integration.lastSync && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last sync: {new Date(integration.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No integrations configured</p>
            )}
          </div>
          
          {/* Auto Discovery */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Discover Systems</h3>
              <button
                onClick={autoDiscover}
                disabled={isDiscovering}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                {isDiscovering ? (
                  <>
                    <Search className="w-4 h-4 animate-spin inline mr-2" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 inline mr-2" />
                    Auto Discover
                  </>
                )}
              </button>
            </div>
            
            {discoveredSystems.length > 0 ? (
              <div className="space-y-3">
                {discoveredSystems.map(system => (
                  <div key={system.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{system.name}</h4>
                        <p className="text-sm text-gray-400 capitalize">{system.brand}</p>
                        <p className="text-xs text-gray-500">
                          {system.config.host}:{system.config.port || 'default'}
                        </p>
                      </div>
                      <button
                        onClick={() => addIntegration(system)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm"
                      >
                        Add Integration
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-800/50 rounded-lg">
                <Network className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  {isDiscovering ? 'Scanning network for climate computers...' : 'Click "Auto Discover" to scan for climate computers on your network'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}