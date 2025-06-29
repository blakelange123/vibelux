'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Thermometer, Droplets, Wind, Sun, Gauge,
  Activity, AlertTriangle, TrendingUp, TrendingDown,
  Settings, Plus, Trash2, WifiOff, Wifi,
  Download, RefreshCw, Target, X, Info,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';

interface SensorReading {
  timestamp: Date;
  value: number;
  quality: 'good' | 'warning' | 'error';
}

interface Sensor {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'vpd' | 'par';
  model: string;
  zone?: string;
  status: 'online' | 'offline' | 'error';
  lastReading: SensorReading;
  history: SensorReading[];
  calibration: {
    offset: number;
    lastCalibrated: Date;
  };
  thresholds: {
    min: number;
    max: number;
    optimal: { min: number; max: number };
  };
}

interface ControlRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: {
    sensor: string;
    condition: 'above' | 'below' | 'outside' | 'inside';
    value: number | { min: number; max: number };
  };
  action: {
    type: 'adjust_light' | 'alert' | 'log' | 'control_device';
    target?: string;
    adjustment?: number; // percentage
    message?: string;
  };
  cooldown: number; // minutes
  lastTriggered?: Date;
}

interface SensorGroup {
  id: string;
  name: string;
  sensors: string[];
  aggregation: 'average' | 'min' | 'max' | 'median';
}

export function SensorFusionSystem({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'sensors' | 'rules' | 'history' | 'settings'>('sensors');
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: 'temp-1',
      name: 'Zone 1 Temperature',
      type: 'temperature',
      model: 'SXC Digital Sensor',
      zone: 'zone-1',
      status: 'online',
      lastReading: {
        timestamp: new Date(),
        value: 24.5,
        quality: 'good'
      },
      history: [],
      calibration: {
        offset: 0,
        lastCalibrated: new Date()
      },
      thresholds: {
        min: 18,
        max: 30,
        optimal: { min: 22, max: 26 }
      }
    },
    {
      id: 'hum-1',
      name: 'Zone 1 Humidity',
      type: 'humidity',
      model: 'SXC Digital Sensor',
      zone: 'zone-1',
      status: 'online',
      lastReading: {
        timestamp: new Date(),
        value: 65,
        quality: 'good'
      },
      history: [],
      calibration: {
        offset: 0,
        lastCalibrated: new Date()
      },
      thresholds: {
        min: 40,
        max: 80,
        optimal: { min: 55, max: 70 }
      }
    },
    {
      id: 'co2-1',
      name: 'Zone 1 CO2',
      type: 'co2',
      model: 'SXC CO2 Module',
      zone: 'zone-1',
      status: 'online',
      lastReading: {
        timestamp: new Date(),
        value: 1200,
        quality: 'good'
      },
      history: [],
      calibration: {
        offset: 0,
        lastCalibrated: new Date()
      },
      thresholds: {
        min: 400,
        max: 2000,
        optimal: { min: 800, max: 1500 }
      }
    },
    {
      id: 'par-1',
      name: 'Zone 1 PAR',
      type: 'par',
      model: 'Quantum Sensor',
      zone: 'zone-1',
      status: 'online',
      lastReading: {
        timestamp: new Date(),
        value: 450,
        quality: 'good'
      },
      history: [],
      calibration: {
        offset: 0,
        lastCalibrated: new Date()
      },
      thresholds: {
        min: 0,
        max: 1000,
        optimal: { min: 400, max: 600 }
      }
    }
  ]);
  
  const [controlRules, setControlRules] = useState<ControlRule[]>([
    {
      id: 'temp-high',
      name: 'High Temperature Response',
      enabled: true,
      trigger: {
        sensor: 'temp-1',
        condition: 'above',
        value: 28
      },
      action: {
        type: 'adjust_light',
        adjustment: -20, // reduce by 20%
        message: 'Reducing light intensity due to high temperature'
      },
      cooldown: 30
    },
    {
      id: 'co2-optimize',
      name: 'CO2 Optimization',
      enabled: true,
      trigger: {
        sensor: 'co2-1',
        condition: 'inside',
        value: { min: 1200, max: 1500 }
      },
      action: {
        type: 'adjust_light',
        adjustment: 10, // increase by 10%
        message: 'Optimizing light for elevated CO2'
      },
      cooldown: 60
    },
    {
      id: 'vpd-alert',
      name: 'VPD Out of Range',
      enabled: true,
      trigger: {
        sensor: 'vpd-calc',
        condition: 'outside',
        value: { min: 0.8, max: 1.2 }
      },
      action: {
        type: 'alert',
        message: 'VPD is outside optimal range'
      },
      cooldown: 15
    }
  ]);
  
  const [sensorGroups, setSensorGroups] = useState<SensorGroup[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string | null>('temp-1');
  const [dataInterval, setDataInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Calculate VPD from temperature and humidity
  const calculateVPD = (temp: number, humidity: number): number => {
    const svp = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    const avp = (humidity / 100) * svp;
    return Number((svp - avp).toFixed(2));
  };
  
  // Simulate real-time sensor data
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prevSensors => prevSensors.map(sensor => {
        // Simulate realistic sensor fluctuations
        let newValue = sensor.lastReading.value;
        const fluctuation = (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2;
        
        switch (sensor.type) {
          case 'temperature':
            newValue += fluctuation * 0.5;
            break;
          case 'humidity':
            newValue += fluctuation * 2;
            break;
          case 'co2':
            newValue += fluctuation * 50;
            break;
          case 'par':
            // PAR should follow light schedule
            const hour = new Date().getHours();
            if (hour >= 6 && hour <= 18) {
              newValue = 400 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 200;
            } else {
              newValue = 0;
            }
            break;
        }
        
        // Determine quality based on thresholds
        let quality: 'good' | 'warning' | 'error' = 'good';
        if (newValue < sensor.thresholds.min || newValue > sensor.thresholds.max) {
          quality = 'error';
        } else if (
          newValue < sensor.thresholds.optimal.min || 
          newValue > sensor.thresholds.optimal.max
        ) {
          quality = 'warning';
        }
        
        const newReading: SensorReading = {
          timestamp: new Date(),
          value: newValue,
          quality
        };
        
        return {
          ...sensor,
          lastReading: newReading,
          history: [...sensor.history.slice(-99), newReading] // Keep last 100 readings
        };
      }));
      
      // Check control rules
      checkControlRules();
    }, 5000); // Update every 5 seconds
    
    setDataInterval(interval);
    return () => clearInterval(interval);
  }, []);
  
  const checkControlRules = () => {
    controlRules.forEach(rule => {
      if (!rule.enabled) return;
      
      // Check cooldown
      if (rule.lastTriggered) {
        const minutesSinceTriggered = 
          (new Date().getTime() - rule.lastTriggered.getTime()) / (1000 * 60);
        if (minutesSinceTriggered < rule.cooldown) return;
      }
      
      const sensor = sensors.find(s => s.id === rule.trigger.sensor);
      if (!sensor) return;
      
      let triggered = false;
      const value = sensor.lastReading.value;
      
      switch (rule.trigger.condition) {
        case 'above':
          triggered = value > (rule.trigger.value as number);
          break;
        case 'below':
          triggered = value < (rule.trigger.value as number);
          break;
        case 'outside':
          const range = rule.trigger.value as { min: number; max: number };
          triggered = value < range.min || value > range.max;
          break;
        case 'inside':
          const inRange = rule.trigger.value as { min: number; max: number };
          triggered = value >= inRange.min && value <= inRange.max;
          break;
      }
      
      if (triggered) {
        executeAction(rule);
      }
    });
  };
  
  const executeAction = (rule: ControlRule) => {
    switch (rule.action.type) {
      case 'adjust_light':
        // In a real system, this would adjust actual light intensity
        showNotification('info', rule.action.message || 'Adjusting light intensity');
        // Update the light intensity in the state
        if (rule.action.adjustment) {
          const adjustment = 1 + (rule.action.adjustment / 100);
          // This would dispatch an action to adjust fixture intensity
        }
        break;
      case 'alert':
        showNotification('warning', rule.action.message || 'Sensor alert triggered');
        break;
      case 'log':
        break;
    }
    
    // Update last triggered time
    setControlRules(rules => rules.map(r => 
      r.id === rule.id ? { ...r, lastTriggered: new Date() } : r
    ));
  };
  
  const addSensor = () => {
    const newSensor: Sensor = {
      id: `sensor-${Date.now()}`,
      name: 'New Sensor',
      type: 'temperature',
      model: 'Generic',
      status: 'offline',
      lastReading: {
        timestamp: new Date(),
        value: 0,
        quality: 'error'
      },
      history: [],
      calibration: {
        offset: 0,
        lastCalibrated: new Date()
      },
      thresholds: {
        min: 0,
        max: 100,
        optimal: { min: 20, max: 80 }
      }
    };
    setSensors([...sensors, newSensor]);
    setSelectedSensor(newSensor.id);
  };
  
  const calibrateSensor = (sensorId: string) => {
    setSensors(sensors.map(s => 
      s.id === sensorId 
        ? { 
            ...s, 
            calibration: { 
              ...s.calibration, 
              lastCalibrated: new Date() 
            } 
          }
        : s
    ));
    showNotification('success', 'Sensor calibrated successfully');
  };
  
  const getSensorIcon = (type: Sensor['type']) => {
    switch (type) {
      case 'temperature':
        return <Thermometer className="w-5 h-5" />;
      case 'humidity':
        return <Droplets className="w-5 h-5" />;
      case 'co2':
        return <Wind className="w-5 h-5" />;
      case 'light':
      case 'par':
        return <Sun className="w-5 h-5" />;
      case 'vpd':
        return <Gauge className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };
  
  const getSensorUnit = (type: Sensor['type']) => {
    switch (type) {
      case 'temperature':
        return '°C';
      case 'humidity':
        return '%';
      case 'co2':
        return 'ppm';
      case 'light':
        return 'lux';
      case 'par':
        return 'µmol/m²/s';
      case 'vpd':
        return 'kPa';
      default:
        return '';
    }
  };
  
  const renderSensorsTab = () => {
    const currentSensor = sensors.find(s => s.id === selectedSensor);
    
    return (
      <div className="flex gap-6 h-full">
        {/* Sensor List */}
        <div className="w-80 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Sensors</h3>
            <button
              onClick={addSensor}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          
          <div className="space-y-2">
            {sensors.map(sensor => (
              <div
                key={sensor.id}
                onClick={() => setSelectedSensor(sensor.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedSensor === sensor.id
                    ? 'bg-gray-700 ring-2 ring-purple-600'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSensorIcon(sensor.type)}
                    <span className="font-medium text-white">{sensor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {sensor.status === 'online' ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      sensor.lastReading.quality === 'good' ? 'text-green-400' :
                      sensor.lastReading.quality === 'warning' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {sensor.lastReading.value.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400">
                      {getSensorUnit(sensor.type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {sensor.lastReading.value > sensor.history[sensor.history.length - 2]?.value ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* VPD Calculation */}
          <div className="p-4 bg-gray-800 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Calculated VPD</h4>
            {(() => {
              const temp = sensors.find(s => s.type === 'temperature')?.lastReading.value || 0;
              const humidity = sensors.find(s => s.type === 'humidity')?.lastReading.value || 0;
              const vpd = calculateVPD(temp, humidity);
              const isOptimal = vpd >= 0.8 && vpd <= 1.2;
              
              return (
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${isOptimal ? 'text-green-400' : 'text-yellow-400'}`}>
                    {vpd}
                  </span>
                  <span className="text-sm text-gray-400">kPa</span>
                </div>
              );
            })()}
          </div>
        </div>
        
        {/* Sensor Details */}
        {currentSensor && (
          <div className="flex-1 bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{currentSensor.name}</h3>
              <button
                onClick={() => {
                  setSensors(sensors.filter(s => s.id !== currentSensor.id));
                  setSelectedSensor(sensors[0]?.id || null);
                }}
                className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Sensor Configuration */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sensor Name</label>
                <input
                  type="text"
                  value={currentSensor.name}
                  onChange={(e) => setSensors(sensors.map(s => 
                    s.id === currentSensor.id ? { ...s, name: e.target.value } : s
                  ))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Model</label>
                <input
                  type="text"
                  value={currentSensor.model}
                  onChange={(e) => setSensors(sensors.map(s => 
                    s.id === currentSensor.id ? { ...s, model: e.target.value } : s
                  ))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Zone Assignment</label>
                <select
                  value={currentSensor.zone || ''}
                  onChange={(e) => setSensors(sensors.map(s => 
                    s.id === currentSensor.id ? { ...s, zone: e.target.value } : s
                  ))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                >
                  <option value="">No Zone</option>
                  <option value="zone-1">Zone 1</option>
                  <option value="zone-2">Zone 2</option>
                  <option value="zone-3">Zone 3</option>
                  <option value="zone-4">Zone 4</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Calibration Offset</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentSensor.calibration.offset}
                    onChange={(e) => setSensors(sensors.map(s => 
                      s.id === currentSensor.id 
                        ? { ...s, calibration: { ...s.calibration, offset: parseFloat(e.target.value) || 0 } }
                        : s
                    ))}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg"
                    step="0.1"
                  />
                  <button
                    onClick={() => calibrateSensor(currentSensor.id)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Calibrate
                  </button>
                </div>
              </div>
            </div>
            
            {/* Thresholds */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Operating Thresholds</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Minimum</label>
                  <input
                    type="number"
                    value={currentSensor.thresholds.min}
                    onChange={(e) => setSensors(sensors.map(s => 
                      s.id === currentSensor.id 
                        ? { ...s, thresholds: { ...s.thresholds, min: parseFloat(e.target.value) || 0 } }
                        : s
                    ))}
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Maximum</label>
                  <input
                    type="number"
                    value={currentSensor.thresholds.max}
                    onChange={(e) => setSensors(sensors.map(s => 
                      s.id === currentSensor.id 
                        ? { ...s, thresholds: { ...s.thresholds, max: parseFloat(e.target.value) || 0 } }
                        : s
                    ))}
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Optimal Min</label>
                  <input
                    type="number"
                    value={currentSensor.thresholds.optimal.min}
                    onChange={(e) => setSensors(sensors.map(s => 
                      s.id === currentSensor.id 
                        ? { 
                            ...s, 
                            thresholds: { 
                              ...s.thresholds, 
                              optimal: { ...s.thresholds.optimal, min: parseFloat(e.target.value) || 0 }
                            } 
                          }
                        : s
                    ))}
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Optimal Max</label>
                  <input
                    type="number"
                    value={currentSensor.thresholds.optimal.max}
                    onChange={(e) => setSensors(sensors.map(s => 
                      s.id === currentSensor.id 
                        ? { 
                            ...s, 
                            thresholds: { 
                              ...s.thresholds, 
                              optimal: { ...s.thresholds.optimal, max: parseFloat(e.target.value) || 0 }
                            } 
                          }
                        : s
                    ))}
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Live Chart */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-4">Live Data (Last 100 Readings)</h4>
              <div className="h-32 flex items-end gap-1">
                {currentSensor.history.slice(-50).map((reading, index) => {
                  const range = currentSensor.thresholds.max - currentSensor.thresholds.min;
                  const height = ((reading.value - currentSensor.thresholds.min) / range) * 100;
                  
                  return (
                    <div
                      key={index}
                      className={`flex-1 ${
                        reading.quality === 'good' ? 'bg-green-500' :
                        reading.quality === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ height: `${Math.max(2, height)}%` }}
                      title={`${reading.value.toFixed(1)} ${getSensorUnit(currentSensor.type)}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderRulesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Automation Rules</h3>
        <button
          onClick={() => {
            const newRule: ControlRule = {
              id: `rule-${Date.now()}`,
              name: 'New Rule',
              enabled: false,
              trigger: {
                sensor: sensors[0]?.id || '',
                condition: 'above',
                value: 0
              },
              action: {
                type: 'alert',
                message: 'Condition triggered'
              },
              cooldown: 15
            };
            setControlRules([...controlRules, newRule]);
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>
      
      <div className="space-y-4">
        {controlRules.map((rule, index) => (
          <div key={rule.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={rule.name}
                onChange={(e) => {
                  const updated = [...controlRules];
                  updated[index].name = e.target.value;
                  setControlRules(updated);
                }}
                className="text-lg font-medium bg-transparent text-white outline-none"
              />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => {
                      const updated = [...controlRules];
                      updated[index].enabled = e.target.checked;
                      setControlRules(updated);
                    }}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-sm text-white">Enabled</span>
                </label>
                <button
                  onClick={() => setControlRules(controlRules.filter(r => r.id !== rule.id))}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Trigger Configuration */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sensor</label>
                <select
                  value={rule.trigger.sensor}
                  onChange={(e) => {
                    const updated = [...controlRules];
                    updated[index].trigger.sensor = e.target.value;
                    setControlRules(updated);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                >
                  {sensors.map(sensor => (
                    <option key={sensor.id} value={sensor.id}>{sensor.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Condition</label>
                <select
                  value={rule.trigger.condition}
                  onChange={(e) => {
                    const updated = [...controlRules];
                    updated[index].trigger.condition = e.target.value as any;
                    setControlRules(updated);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                  <option value="outside">Outside Range</option>
                  <option value="inside">Inside Range</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Value</label>
                {(rule.trigger.condition === 'above' || rule.trigger.condition === 'below') ? (
                  <input
                    type="number"
                    value={rule.trigger.value as number}
                    onChange={(e) => {
                      const updated = [...controlRules];
                      updated[index].trigger.value = parseFloat(e.target.value) || 0;
                      setControlRules(updated);
                    }}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  />
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={(rule.trigger.value as any).min || 0}
                      onChange={(e) => {
                        const updated = [...controlRules];
                        updated[index].trigger.value = {
                          ...(updated[index].trigger.value as any),
                          min: parseFloat(e.target.value) || 0
                        };
                        setControlRules(updated);
                      }}
                      placeholder="Min"
                      className="w-1/2 px-2 py-2 bg-gray-700 text-white rounded-lg"
                    />
                    <input
                      type="number"
                      value={(rule.trigger.value as any).max || 0}
                      onChange={(e) => {
                        const updated = [...controlRules];
                        updated[index].trigger.value = {
                          ...(updated[index].trigger.value as any),
                          max: parseFloat(e.target.value) || 0
                        };
                        setControlRules(updated);
                      }}
                      placeholder="Max"
                      className="w-1/2 px-2 py-2 bg-gray-700 text-white rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Configuration */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Action</label>
                <select
                  value={rule.action.type}
                  onChange={(e) => {
                    const updated = [...controlRules];
                    updated[index].action.type = e.target.value as any;
                    setControlRules(updated);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                >
                  <option value="adjust_light">Adjust Light</option>
                  <option value="alert">Send Alert</option>
                  <option value="log">Log Event</option>
                  <option value="control_device">Control Device</option>
                </select>
              </div>
              
              {rule.action.type === 'adjust_light' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Adjustment (%)</label>
                  <input
                    type="number"
                    value={rule.action.adjustment || 0}
                    onChange={(e) => {
                      const updated = [...controlRules];
                      updated[index].action.adjustment = parseInt(e.target.value) || 0;
                      setControlRules(updated);
                    }}
                    min="-100"
                    max="100"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Cooldown (min)</label>
                <input
                  type="number"
                  value={rule.cooldown}
                  onChange={(e) => {
                    const updated = [...controlRules];
                    updated[index].cooldown = parseInt(e.target.value) || 0;
                    setControlRules(updated);
                  }}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
            </div>
            
            {rule.lastTriggered && (
              <div className="mt-4 text-xs text-gray-400">
                Last triggered: {rule.lastTriggered.toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sensor Data Export</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Time Range</label>
            <select className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg">
              <option>Last Hour</option>
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Data Points</label>
            <select className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg">
              <option>All Sensors</option>
              {sensors.map(sensor => (
                <option key={sensor.id} value={sensor.id}>{sensor.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Format</label>
            <select className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg">
              <option>CSV</option>
              <option>JSON</option>
              <option>Excel</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={() => {
            // Export sensor data
            const data = {
              exportDate: new Date().toISOString(),
              sensors: sensors.map(s => ({
                ...s,
                history: s.history.slice(-100) // Last 100 readings
              }))
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sensor-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('success', 'Sensor data exported');
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>
      
      {/* Event Log */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Events</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* This would show a log of sensor events and rule triggers */}
          <div className="text-gray-500 text-center py-8">
            Event log would appear here
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sensor Communication</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Protocol</label>
            <select className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg">
              <option>MODBUS TCP</option>
              <option>MODBUS RTU</option>
              <option>MQTT</option>
              <option>REST API</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Polling Interval (seconds)</label>
            <input
              type="number"
              defaultValue="5"
              min="1"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Alert Settings</h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600" />
            <span className="text-white">Enable email notifications</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600" />
            <span className="text-white">Enable SMS alerts for critical events</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 text-purple-600" />
            <span className="text-white">Log all events to database</span>
          </label>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">Alert Email Recipients</label>
          <input
            type="text"
            placeholder="email1@example.com, email2@example.com"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
          />
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Integration</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-white">Light-Sensor Coupling</h4>
            <p className="text-sm text-gray-400 mt-1">Automatically adjust lighting based on sensor feedback</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Sensor Fusion System</h2>
              <p className="text-sm text-gray-400">Real-time environmental monitoring and control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* System Status Bar */}
        <div className="bg-gray-800 px-6 py-2 border-b border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-300">{sensors.filter(s => s.status === 'online').length} Sensors Online</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-300">{sensors.filter(s => s.lastReading.quality === 'warning').length} Warnings</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-gray-300">{controlRules.filter(r => r.enabled).length} Active Rules</span>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-gray-800 px-4 py-2 flex gap-4 border-b border-gray-700">
          {(['sensors', 'rules', 'history', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'sensors' && renderSensorsTab()}
          {activeTab === 'rules' && renderRulesTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  );
}