'use client';

import React, { useState, useEffect } from 'react';
import {
  Bug,
  Sun,
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Zap,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Info,
  Camera,
  Microscope,
  ShieldCheck,
  ShieldAlert,
  Lightbulb,
  Moon,
  Sunrise,
  Sunset,
  Timer,
  AlertCircle,
  Plus,
  Minus,
  Play,
  Pause,
  ChevronRight,
  Filter,
  Search,
  Database,
  Beaker,
  TestTube,
  Waves,
  Radio,
  Wifi,
  CircuitBoard,
  Sparkles,
  Leaf,
  Cannabis
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts';

interface Pest {
  id: string;
  name: string;
  scientificName: string;
  type: 'insect' | 'mite' | 'fungus' | 'bacteria' | 'virus';
  stage: 'egg' | 'larva' | 'adult' | 'spore' | 'active';
  vulnerableWavelengths: WavelengthRange[];
  population: number;
  growthRate: number; // % per day
  damageLevel: 'low' | 'medium' | 'high' | 'critical';
  preferredConditions: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    lightIntensity: { min: number; max: number };
  };
}

interface WavelengthRange {
  min: number; // nm
  max: number; // nm
  effect: 'lethal' | 'repellent' | 'attractive' | 'disruptive';
  efficacy: number; // 0-100%
  exposureTime: number; // minutes
}

interface IPMProgram {
  id: string;
  name: string;
  description: string;
  targetPests: string[];
  lightRecipe: LightTreatment[];
  schedule: TreatmentSchedule;
  efficacy: number;
  plantSafety: number; // 0-100%
  status: 'active' | 'scheduled' | 'paused' | 'completed';
  results?: TreatmentResult[];
}

interface LightTreatment {
  id: string;
  wavelength: number; // nm
  intensity: number; // μmol/m²/s
  duration: number; // minutes
  pulseFrequency?: number; // Hz
  timing: 'day' | 'night' | 'dawn' | 'dusk';
  purpose: string;
}

interface TreatmentSchedule {
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'custom';
  times: string[]; // HH:MM format
  duration: number; // days
  startDate: Date;
  endDate?: Date;
}

interface TreatmentResult {
  date: Date;
  pestPopulation: { [pestId: string]: number };
  efficacy: number;
  plantHealth: number;
  notes?: string;
}

interface PestDetection {
  id: string;
  timestamp: Date;
  location: string;
  pestId: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number; // 0-100%
  imageUrl?: string;
  actionTaken?: string;
}

export default function IPMLightManagement() {
  const [selectedRoom, setSelectedRoom] = useState('flower-1');
  const [activeProgram, setActiveProgram] = useState<string | null>('program-1');
  const [viewMode, setViewMode] = useState<'monitoring' | 'programs' | 'history'>('monitoring');
  const [timeRange, setTimeRange] = useState('7-days');
  
  // Mock data
  const detectedPests: Pest[] = [
    {
      id: '1',
      name: 'Spider Mites',
      scientificName: 'Tetranychus urticae',
      type: 'mite',
      stage: 'adult',
      vulnerableWavelengths: [
        { min: 280, max: 320, effect: 'lethal', efficacy: 85, exposureTime: 30 },
        { min: 660, max: 680, effect: 'disruptive', efficacy: 60, exposureTime: 120 }
      ],
      population: 450,
      growthRate: 12,
      damageLevel: 'high',
      preferredConditions: {
        temperature: { min: 20, max: 32 },
        humidity: { min: 20, max: 50 },
        lightIntensity: { min: 0, max: 500 }
      }
    },
    {
      id: '2',
      name: 'Thrips',
      scientificName: 'Frankliniella occidentalis',
      type: 'insect',
      stage: 'larva',
      vulnerableWavelengths: [
        { min: 365, max: 385, effect: 'attractive', efficacy: 75, exposureTime: 60 },
        { min: 450, max: 470, effect: 'repellent', efficacy: 65, exposureTime: 180 }
      ],
      population: 120,
      growthRate: 8,
      damageLevel: 'medium',
      preferredConditions: {
        temperature: { min: 15, max: 30 },
        humidity: { min: 40, max: 70 },
        lightIntensity: { min: 100, max: 1000 }
      }
    },
    {
      id: '3',
      name: 'Powdery Mildew',
      scientificName: 'Podosphaera macularis',
      type: 'fungus',
      stage: 'spore',
      vulnerableWavelengths: [
        { min: 250, max: 280, effect: 'lethal', efficacy: 95, exposureTime: 15 },
        { min: 400, max: 420, effect: 'disruptive', efficacy: 70, exposureTime: 90 }
      ],
      population: 2000,
      growthRate: 25,
      damageLevel: 'critical',
      preferredConditions: {
        temperature: { min: 18, max: 24 },
        humidity: { min: 50, max: 90 },
        lightIntensity: { min: 0, max: 200 }
      }
    }
  ];

  const ipmPrograms: IPMProgram[] = [
    {
      id: 'program-1',
      name: 'UV-C Sterilization Protocol',
      description: 'Targeted UV-C treatment for fungal spore elimination',
      targetPests: ['3'], // Powdery Mildew
      lightRecipe: [
        {
          id: '1',
          wavelength: 265,
          intensity: 0.5,
          duration: 15,
          timing: 'night',
          purpose: 'Spore destruction'
        }
      ],
      schedule: {
        frequency: 'daily',
        times: ['03:00'],
        duration: 14,
        startDate: new Date()
      },
      efficacy: 92,
      plantSafety: 95,
      status: 'active'
    },
    {
      id: 'program-2',
      name: 'Multi-Spectrum Pest Deterrent',
      description: 'Combined UV-A and blue light for mite and thrip control',
      targetPests: ['1', '2'],
      lightRecipe: [
        {
          id: '1',
          wavelength: 375,
          intensity: 25,
          duration: 60,
          timing: 'dawn',
          purpose: 'Thrip attraction to traps'
        },
        {
          id: '2',
          wavelength: 300,
          intensity: 2,
          duration: 30,
          timing: 'night',
          purpose: 'Mite reproduction disruption'
        }
      ],
      schedule: {
        frequency: 'weekly',
        times: ['22:00'],
        duration: 28,
        startDate: new Date()
      },
      efficacy: 78,
      plantSafety: 88,
      status: 'scheduled'
    }
  ];

  const populationTrend = Array.from({ length: 14 }, (_, i) => ({
    day: i + 1,
    spiderMites: 500 - i * 25 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50,
    thrips: 150 - i * 8 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20,
    powderyMildew: 2500 - i * 150 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 100,
    treatments: i % 3 === 0 ? 1 : 0
  }));

  const wavelengthEfficacy = [
    { wavelength: '250-280nm', spiderMites: 65, thrips: 45, powderyMildew: 95 },
    { wavelength: '280-320nm', spiderMites: 85, thrips: 55, powderyMildew: 80 },
    { wavelength: '365-385nm', spiderMites: 30, thrips: 75, powderyMildew: 40 },
    { wavelength: '450-470nm', spiderMites: 25, thrips: 65, powderyMildew: 35 },
    { wavelength: '660-680nm', spiderMites: 60, thrips: 20, powderyMildew: 25 }
  ];

  const treatmentHistory = [
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      program: 'UV-C Sterilization',
      target: 'Powdery Mildew',
      efficacy: 94,
      reduction: 72
    },
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      program: 'Blue Light Deterrent',
      target: 'Thrips',
      efficacy: 68,
      reduction: 45
    },
    {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      program: 'UV-A Treatment',
      target: 'Spider Mites',
      efficacy: 82,
      reduction: 58
    }
  ];

  const plantHealthMetrics = {
    overall: 85,
    photosynthesis: 92,
    stressLevel: 18,
    growthRate: 88,
    chlorophyll: 90
  };

  const spectralData = [
    { nm: 250, intensity: 0 },
    { nm: 280, intensity: 0.5 },
    { nm: 320, intensity: 0.8 },
    { nm: 365, intensity: 2.5 },
    { nm: 400, intensity: 15 },
    { nm: 450, intensity: 45 },
    { nm: 500, intensity: 25 },
    { nm: 550, intensity: 15 },
    { nm: 600, intensity: 35 },
    { nm: 660, intensity: 85 },
    { nm: 700, intensity: 65 },
    { nm: 730, intensity: 20 },
    { nm: 780, intensity: 5 }
  ];

  const calculatePopulationGrowth = (pest: Pest, days: number) => {
    return pest.population * Math.pow(1 + pest.growthRate / 100, days);
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bug className="w-8 h-8 text-green-600" />
              IPM Light Management
            </h2>
            <p className="text-gray-600 mt-1">
              Integrated pest management using targeted light wavelengths
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Program
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <select 
              value={selectedRoom} 
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="flower-1">Flower Room 1</option>
              <option value="flower-2">Flower Room 2</option>
              <option value="veg-1">Veg Room 1</option>
              <option value="mother">Mother Room</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="monitoring">Pest Monitoring</option>
              <option value="programs">IPM Programs</option>
              <option value="history">Treatment History</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="24-hours">24 Hours</option>
              <option value="7-days">7 Days</option>
              <option value="14-days">14 Days</option>
              <option value="30-days">30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Active Program</label>
            <select 
              value={activeProgram || ''} 
              onChange={(e) => setActiveProgram(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">None</option>
              {ipmPrograms.map(program => (
                <option key={program.id} value={program.id}>{program.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pest Alert Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-600">3</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Active Threats</h3>
          <p className="text-sm text-gray-600 mt-1">Pest species detected</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-600">2,570</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Total Population</h3>
          <p className="text-sm text-gray-600 mt-1">Combined pest count</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{plantHealthMetrics.overall}%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Plant Health</h3>
          <p className="text-sm text-gray-600 mt-1">Overall health score</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">82%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Treatment Efficacy</h3>
          <p className="text-sm text-gray-600 mt-1">Average effectiveness</p>
        </div>
      </div>

      {viewMode === 'monitoring' && (
        <div className="grid grid-cols-12 gap-6">
          {/* Pest Population Trends */}
          <div className="col-span-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-green-600" />
              Population Dynamics
            </h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={populationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Population', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="spiderMites" stroke="#EF4444" name="Spider Mites" strokeWidth={2} />
                <Line type="monotone" dataKey="thrips" stroke="#F59E0B" name="Thrips" strokeWidth={2} />
                <Line type="monotone" dataKey="powderyMildew" stroke="#8B5CF6" name="Powdery Mildew" strokeWidth={2} />
                <Bar dataKey="treatments" fill="#10B981" name="Treatments" opacity={0.3} />
              </RechartsLineChart>
            </ResponsiveContainer>

            {/* Pest Details */}
            <div className="mt-6 space-y-3">
              {detectedPests.map(pest => (
                <div key={pest.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{pest.name}</h4>
                      <p className="text-sm text-gray-500 italic">{pest.scientificName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pest.damageLevel === 'critical' ? 'bg-red-100 text-red-700' :
                        pest.damageLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                        pest.damageLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {pest.damageLevel} risk
                      </span>
                      <span className="text-sm text-gray-600">
                        Pop: {pest.population}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Growth Rate</p>
                      <p className="font-medium">{pest.growthRate}% / day</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium capitalize">{pest.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stage</p>
                      <p className="font-medium capitalize">{pest.stage}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Vulnerable Wavelengths:</p>
                    <div className="flex gap-2 flex-wrap">
                      {pest.vulnerableWavelengths.map((range, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                          {range.min}-{range.max}nm ({range.effect}, {range.efficacy}%)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Plant Health Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Plant Health Metrics
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Overall Health</span>
                    <span className="text-sm font-medium">{plantHealthMetrics.overall}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${plantHealthMetrics.overall}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Photosynthesis</span>
                    <span className="text-sm font-medium">{plantHealthMetrics.photosynthesis}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${plantHealthMetrics.photosynthesis}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Stress Level</span>
                    <span className="text-sm font-medium">{plantHealthMetrics.stressLevel}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${plantHealthMetrics.stressLevel}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Wavelength Efficacy */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Waves className="w-5 h-5 text-purple-600" />
                Wavelength Efficacy
              </h3>
              
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={wavelengthEfficacy} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="wavelength" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="spiderMites" fill="#EF4444" name="Spider Mites" />
                  <Bar dataKey="thrips" fill="#F59E0B" name="Thrips" />
                  <Bar dataKey="powderyMildew" fill="#8B5CF6" name="Powdery Mildew" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Emergency UV Treatment
                </button>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" />
                  Scan for Pests
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configure Thresholds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'programs' && (
        <div className="space-y-6">
          {/* Active Programs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CircuitBoard className="w-5 h-5 text-purple-600" />
              IPM Light Programs
            </h3>
            
            <div className="space-y-4">
              {ipmPrograms.map(program => (
                <div key={program.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{program.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        program.status === 'active' ? 'bg-green-100 text-green-700' :
                        program.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        program.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {program.status}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Target Pests</p>
                      <p className="text-sm font-medium">
                        {program.targetPests.map(id => 
                          detectedPests.find(p => p.id === id)?.name
                        ).join(', ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Efficacy</p>
                      <p className="text-sm font-medium">{program.efficacy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Plant Safety</p>
                      <p className="text-sm font-medium">{program.plantSafety}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Schedule</p>
                      <p className="text-sm font-medium capitalize">{program.schedule.frequency}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Light Recipe:</p>
                    <div className="flex gap-2 flex-wrap">
                      {program.lightRecipe.map(treatment => (
                        <div key={treatment.id} className="px-3 py-2 bg-purple-50 rounded text-sm">
                          <span className="font-medium">{treatment.wavelength}nm</span>
                          <span className="text-gray-600 ml-2">
                            {treatment.intensity} μmol/m²/s for {treatment.duration}min
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      {program.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spectral Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-600" />
              Active Spectrum Distribution
            </h3>
            
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={spectralData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nm" label={{ value: 'Wavelength (nm)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Intensity', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Area type="monotone" dataKey="intensity" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'history' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Treatment History
          </h3>
          
          <div className="space-y-3">
            {treatmentHistory.map((treatment, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{treatment.program}</h4>
                    <p className="text-sm text-gray-600">
                      Target: {treatment.target} • {treatment.date.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{treatment.efficacy}%</p>
                    <p className="text-sm text-gray-600">-{treatment.reduction}% population</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}