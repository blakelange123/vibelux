'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Droplets,
  Thermometer,
  Wind,
  Activity,
  ChevronUp,
  ChevronDown,
  Save,
  Play,
  Pause,
  RotateCcw,
  Settings,
  FileText,
  Copy,
  Download,
  Upload,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface DayNightValues {
  day: number;
  night: number;
}

interface SetpointData {
  day: number;
  ph: DayNightValues;
  ec: DayNightValues;
  temperature: DayNightValues;
  humidity: DayNightValues;
  co2: DayNightValues;
  lightIntensity: DayNightValues;
  dosingA: DayNightValues;
  dosingB: DayNightValues;
}

interface Recipe {
  id: string;
  name: string;
  strain: string;
  duration: number;
  description: string;
  setpoints: SetpointData[];
  createdAt: string;
  lastModified: string;
  status: 'draft' | 'active' | 'completed';
}

export function RecipeControlSystem() {
  const [activeRecipe, setActiveRecipe] = useState<Recipe>({
    id: 'recipe-001',
    name: 'Lettuce Standard 45-Day',
    strain: 'Green Butterhead',
    duration: 45,
    description: 'Standard recipe for green butterhead lettuce with optimized VPD control',
    status: 'active',
    createdAt: '2024-01-15',
    lastModified: '2024-01-20',
    setpoints: Array.from({ length: 45 }, (_, i) => {
      const baseTemp = 72 + Math.sin(i * 0.2) * 2;
      const baseHumidity = 65 + Math.cos(i * 0.15) * 5;
      const baseCO2 = 800 + (i / 45) * 400;
      const basePH = 5.8 + Math.sin(i * 0.1) * 0.2;
      const baseEC = 1.2 + (i / 45) * 0.8;
      
      return {
        day: i + 1,
        ph: {
          day: basePH,
          night: basePH + 0.1 // Slightly higher pH at night
        },
        ec: {
          day: baseEC,
          night: baseEC - 0.1 // Slightly lower EC at night
        },
        temperature: {
          day: baseTemp,
          night: baseTemp - 6 // 6°F cooler at night
        },
        humidity: {
          day: baseHumidity,
          night: baseHumidity + 8 // Higher humidity at night
        },
        co2: {
          day: baseCO2,
          night: Math.max(400, baseCO2 - 300) // Lower CO2 at night (no photosynthesis)
        },
        lightIntensity: {
          day: Math.min(100, 40 + (i / 45) * 60),
          night: 0 // No light at night
        },
        dosingA: {
          day: 100,
          night: 80 // Reduced dosing at night
        },
        dosingB: {
          day: 100,
          night: 80 // Reduced dosing at night
        }
      };
    })
  });

  const [currentDay, setCurrentDay] = useState(15);
  const [selectedParameter, setSelectedParameter] = useState<'ph' | 'ec' | 'temperature' | 'humidity' | 'co2'>('temperature');
  const [editMode, setEditMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [dayNightMode, setDayNightMode] = useState<'day' | 'night'>('day');

  const adjustSetpoint = (day: number, parameter: keyof Omit<SetpointData, 'day'>, direction: 'up' | 'down') => {
    if (!editMode) return;
    
    const adjustment = {
      ph: 0.1,
      ec: 0.1,
      temperature: 0.5,
      humidity: 1,
      co2: 50,
      lightIntensity: 5,
      dosingA: 5,
      dosingB: 5
    };

    setActiveRecipe(prev => ({
      ...prev,
      setpoints: prev.setpoints.map(sp => 
        sp.day === day
          ? {
              ...sp,
              [parameter]: {
                ...sp[parameter],
                [dayNightMode]: direction === 'up' 
                  ? sp[parameter][dayNightMode] + adjustment[parameter] 
                  : sp[parameter][dayNightMode] - adjustment[parameter]
              }
            }
          : sp
      ),
      lastModified: new Date().toISOString()
    }));
  };

  const parameterConfig = {
    ph: { label: 'pH', color: '#10b981', unit: '', min: 5.0, max: 7.0 },
    ec: { label: 'EC', color: '#f59e0b', unit: 'mS/cm', min: 0, max: 3 },
    temperature: { label: 'Air Temp', color: '#ef4444', unit: '°F', min: 60, max: 85 },
    humidity: { label: 'Humidity', color: '#3b82f6', unit: '%', min: 40, max: 80 },
    co2: { label: 'CO2', color: '#8b5cf6', unit: 'ppm', min: 400, max: 1500 }
  };

  const visibleDays = 15;
  const startDay = Math.max(0, currentDay - Math.floor(visibleDays / 2));
  const endDay = Math.min(activeRecipe.duration, startDay + visibleDays);
  const visibleSetpoints = activeRecipe.setpoints.slice(startDay, endDay);

  // Prepare chart data with day/night values
  const chartData = visibleSetpoints.map(sp => ({
    day: sp.day,
    dayValue: sp[selectedParameter].day,
    nightValue: sp[selectedParameter].night,
    currentValue: sp[selectedParameter][dayNightMode]
  }));

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Recipe Control System</h2>
            <p className="text-gray-400">Grow / Recipe Control - {activeRecipe.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Upload className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              editMode 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            {editMode ? 'Save Changes' : 'Edit Mode'}
          </button>
        </div>
      </div>

      {/* Recipe Info Bar */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 grid grid-cols-5 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Strain</p>
          <p className="text-white font-semibold">{activeRecipe.strain}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Duration</p>
          <p className="text-white font-semibold">{activeRecipe.duration} days</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Current Day</p>
          <p className="text-green-400 font-semibold">Day {currentDay}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-white font-semibold capitalize">{activeRecipe.status}</p>
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Last Modified</p>
          <p className="text-white font-semibold">{new Date(activeRecipe.lastModified).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Main Control Panel */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">SETPOINTS BY DAY</h3>
          
          {/* Day/Night Toggle */}
          <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => setDayNightMode('day')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                dayNightMode === 'day'
                  ? 'bg-yellow-500 text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4" />
              Day
            </button>
            <button
              onClick={() => setDayNightMode('night')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                dayNightMode === 'night'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4" />
              Night
            </button>
          </div>
        </div>

        {/* Parameter Selection */}
        <div className="flex items-center gap-2 mb-6">
          {Object.entries(parameterConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedParameter(key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedParameter === key
                  ? 'bg-gray-700 text-white ring-2 ring-offset-2 ring-offset-gray-800'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-700'
              }`}
              style={{
                '--tw-ring-color': selectedParameter === key ? config.color : undefined
              } as React.CSSProperties}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Chart Area */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                label={{ value: 'Day', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                domain={[parameterConfig[selectedParameter].min, parameterConfig[selectedParameter].max]}
                label={{ 
                  value: `${parameterConfig[selectedParameter].label} (${parameterConfig[selectedParameter].unit})`, 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: '#9ca3af'
                }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
                formatter={(value, name) => [
                  value.toFixed(1),
                  name === 'dayValue' ? '☀ Day' : name === 'nightValue' ? '🌙 Night' : name
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="dayValue"
                stroke="#fbbf24"
                strokeWidth={2}
                name="Day Values"
                dot={{ fill: '#fbbf24', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="nightValue"
                stroke="#60a5fa"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Night Values"
                dot={{ fill: '#60a5fa', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
              {/* Current day indicator */}
              {currentDay >= startDay && currentDay <= endDay && (
                <line
                  x1={`${((currentDay - startDay) / (endDay - startDay)) * 100}%`}
                  x2={`${((currentDay - startDay) / (endDay - startDay)) * 100}%`}
                  y1="0%"
                  y2="100%"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Day Controls Grid */}
        <div className="grid grid-cols-15 gap-1 mb-6">
          {visibleSetpoints.map((setpoint) => (
            <div
              key={setpoint.day}
              className={`text-center ${
                setpoint.day === currentDay ? 'bg-green-600/20 rounded-lg' : ''
              }`}
            >
              <p className="text-xs text-gray-400 mb-1">Day {setpoint.day}</p>
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => adjustSetpoint(setpoint.day, selectedParameter, 'up')}
                  disabled={!editMode}
                  className={`p-1 rounded ${
                    editMode 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div
                  className="px-2 py-1 bg-gray-700 rounded text-white font-mono text-sm min-w-[50px]"
                  style={{ borderColor: parameterConfig[selectedParameter].color, borderWidth: '1px' }}
                >
                  {setpoint[selectedParameter][dayNightMode].toFixed(1)}
                </div>
                <button
                  onClick={() => adjustSetpoint(setpoint.day, selectedParameter, 'down')}
                  disabled={!editMode}
                  className={`p-1 rounded ${
                    editMode 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dosing Controls */}
        <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-700">
          <div>
            <h4 className="text-white font-medium mb-3">Dosing (%) A</h4>
            <div className="grid grid-cols-15 gap-1">
              {visibleSetpoints.map((setpoint) => (
                <div key={setpoint.day} className="text-center">
                  <div className="px-2 py-1 bg-blue-600/20 rounded text-blue-400 font-mono text-xs">
                    {setpoint.dosingA[dayNightMode]}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Dosing (%) B</h4>
            <div className="grid grid-cols-15 gap-1">
              {visibleSetpoints.map((setpoint) => (
                <div key={setpoint.day} className="text-center">
                  <div className="px-2 py-1 bg-purple-600/20 rounded text-purple-400 font-mono text-xs">
                    {setpoint.dosingB[dayNightMode]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            >
              <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
            </button>
            <button 
              onClick={() => setCurrentDay(Math.min(activeRecipe.duration, currentDay + 1))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            >
              <ChevronUp className="w-4 h-4 rotate-90" />
            </button>
            <button 
              onClick={() => setCurrentDay(1)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Play className="w-4 h-4" />
              Apply Recipe
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              <Save className="w-4 h-4" />
              Save as Template
            </button>
          </div>
        </div>
      </div>

      {/* Alert for active changes */}
      {editMode && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <p className="text-yellow-400 text-sm">
            You are in edit mode. Changes will be saved when you click "Save Changes".
          </p>
        </div>
      )}
    </div>
  );
}