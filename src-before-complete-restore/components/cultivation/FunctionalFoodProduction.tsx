'use client';

import React, { useState } from 'react';
import {
  Beaker,
  Heart,
  Leaf,
  Shield,
  Target,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Plus,
  Settings,
  Download,
  Upload,
  Save,
  Clock,
  Calendar,
  BarChart3,
  Zap,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  Info,
  Edit,
  Copy,
  Trash2,
  ChevronRight,
  Award,
  FileText,
  Lock,
  Unlock,
  Play
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface NutritionalTarget {
  compound: string;
  currentLevel: number;
  targetLevel: number;
  unit: string;
  category: 'vitamin' | 'mineral' | 'antioxidant' | 'other';
  healthBenefit: string;
}

interface ProductionProtocol {
  id: string;
  name: string;
  description: string;
  targetMarket: string;
  certification: string;
  locked: boolean;
  parameters: {
    temperature: { day: number; night: number };
    humidity: number;
    co2: number;
    ec: number;
    ph: number;
    lightIntensity: number;
    photoperiod: number;
    spectrum: {
      red: number;
      blue: number;
      farRed: number;
      uv: number;
    };
  };
  stressFactors: {
    drought: boolean;
    salinity: boolean;
    temperature: boolean;
    light: boolean;
  };
  duration: number;
  yield: number;
  qualityScore: number;
}

export function FunctionalFoodProduction() {
  const [selectedProtocol, setSelectedProtocol] = useState<string>('low-potassium');
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'protocols' | 'monitor' | 'research'>('protocols');

  // Predefined medical protocols
  const [protocols] = useState<Record<string, ProductionProtocol>>({
    'low-potassium': {
      id: 'low-potassium',
      name: 'Low Potassium Lettuce',
      description: 'For kidney disease patients requiring potassium restriction',
      targetMarket: 'Medical/Hospital',
      certification: 'Medical Grade',
      locked: true,
      parameters: {
        temperature: { day: 22, night: 18 },
        humidity: 65,
        co2: 800,
        ec: 1.2,
        ph: 6.2,
        lightIntensity: 250,
        photoperiod: 14,
        spectrum: { red: 60, blue: 30, farRed: 5, uv: 5 }
      },
      stressFactors: {
        drought: false,
        salinity: false,
        temperature: false,
        light: false
      },
      duration: 35,
      yield: 150,
      qualityScore: 94
    },
    'high-antioxidant': {
      id: 'high-antioxidant',
      name: 'Antioxidant-Enhanced Spinach',
      description: 'Elevated anthocyanin and vitamin C for immune support',
      targetMarket: 'Health Food',
      certification: 'Organic Plus',
      locked: false,
      parameters: {
        temperature: { day: 20, night: 15 },
        humidity: 70,
        co2: 1000,
        ec: 2.0,
        ph: 6.5,
        lightIntensity: 300,
        photoperiod: 16,
        spectrum: { red: 40, blue: 40, farRed: 5, uv: 15 }
      },
      stressFactors: {
        drought: false,
        salinity: true,
        temperature: true,
        light: true
      },
      duration: 42,
      yield: 120,
      qualityScore: 96
    },
    'low-nitrate': {
      id: 'low-nitrate',
      name: 'Low Nitrate Baby Greens',
      description: 'Safe for infant food production with minimal nitrate accumulation',
      targetMarket: 'Baby Food',
      certification: 'Infant Safe',
      locked: true,
      parameters: {
        temperature: { day: 24, night: 20 },
        humidity: 60,
        co2: 600,
        ec: 0.8,
        ph: 6.0,
        lightIntensity: 200,
        photoperiod: 12,
        spectrum: { red: 70, blue: 25, farRed: 5, uv: 0 }
      },
      stressFactors: {
        drought: false,
        salinity: false,
        temperature: false,
        light: false
      },
      duration: 21,
      yield: 180,
      qualityScore: 98
    },
    'therapeutic-herbs': {
      id: 'therapeutic-herbs',
      name: 'Medicinal Herb Protocol',
      description: 'Enhanced bioactive compounds for pharmaceutical applications',
      targetMarket: 'Pharmaceutical',
      certification: 'GMP Certified',
      locked: true,
      parameters: {
        temperature: { day: 25, night: 18 },
        humidity: 55,
        co2: 1200,
        ec: 2.5,
        ph: 6.3,
        lightIntensity: 400,
        photoperiod: 18,
        spectrum: { red: 50, blue: 35, farRed: 10, uv: 5 }
      },
      stressFactors: {
        drought: true,
        salinity: false,
        temperature: false,
        light: true
      },
      duration: 60,
      yield: 80,
      qualityScore: 97
    }
  });

  // Nutritional enhancement targets
  const [nutritionalTargets] = useState<NutritionalTarget[]>([
    { compound: 'Vitamin C', currentLevel: 25, targetLevel: 45, unit: 'mg/100g', category: 'vitamin', healthBenefit: 'Immune support' },
    { compound: 'Anthocyanins', currentLevel: 12, targetLevel: 28, unit: 'mg/100g', category: 'antioxidant', healthBenefit: 'Anti-inflammatory' },
    { compound: 'Potassium', currentLevel: 180, targetLevel: 90, unit: 'mg/100g', category: 'mineral', healthBenefit: 'Kidney-friendly' },
    { compound: 'Nitrates', currentLevel: 450, targetLevel: 150, unit: 'mg/kg', category: 'other', healthBenefit: 'Infant-safe' },
    { compound: 'Lutein', currentLevel: 8, targetLevel: 15, unit: 'mg/100g', category: 'antioxidant', healthBenefit: 'Eye health' },
    { compound: 'Folate', currentLevel: 35, targetLevel: 55, unit: 'μg/100g', category: 'vitamin', healthBenefit: 'Prenatal support' }
  ]);

  // Research data
  const [researchData] = useState(() =>
    Array.from({ length: 14 }, (_, day) => ({
      day: day + 1,
      vitaminC: 20 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 + (day * 2),
      anthocyanins: 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 + (day * 1.5),
      potassium: 180 - (day * 6) + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10,
      nitrates: 450 - (day * 20) + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 30
    }))
  );

  const currentProtocol = protocols[selectedProtocol];

  const getNutritionalProgress = (current: number, target: number) => {
    if (target < current) {
      // For compounds we want to reduce
      return ((current - target) / current) * 100;
    } else {
      // For compounds we want to increase
      return (current / target) * 100;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'vitamin': return '#10b981';
      case 'mineral': return '#3b82f6';
      case 'antioxidant': return '#8b5cf6';
      case 'other': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Beaker className="w-8 h-8 text-green-500" />
              Functional Food Production
            </h2>
            <p className="text-gray-400 mt-1">
              Specialized protocols for medical-grade and enhanced nutritional produce
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {['protocols', 'monitor', 'research'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    viewMode === mode
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              New Protocol
            </button>
          </div>
        </div>

        {/* Protocol Selector */}
        <div className="grid grid-cols-4 gap-4">
          {Object.values(protocols).map((protocol) => (
            <button
              key={protocol.id}
              onClick={() => setSelectedProtocol(protocol.id)}
              className={`p-4 rounded-lg border transition-all ${
                selectedProtocol === protocol.id
                  ? 'bg-purple-600/20 border-purple-500'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-5 h-5 text-red-500" />
                {protocol.locked ? (
                  <Lock className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Unlock className="w-4 h-4 text-green-500" />
                )}
              </div>
              <h3 className="text-white font-medium text-left">{protocol.name}</h3>
              <p className="text-gray-400 text-xs text-left mt-1">{protocol.targetMarket}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">{protocol.duration} days</span>
                <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                  {protocol.certification}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'protocols' && (
        <>
          {/* Protocol Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Environmental Parameters</h3>
                <button
                  onClick={() => setEditMode(!editMode)}
                  disabled={currentProtocol.locked}
                  className={`p-2 rounded-lg transition-colors ${
                    currentProtocol.locked
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-400 text-sm">Temperature</span>
                    </div>
                    <p className="text-white">Day: {currentProtocol.parameters.temperature.day}°C</p>
                    <p className="text-white">Night: {currentProtocol.parameters.temperature.night}°C</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-400 text-sm">Humidity</span>
                    </div>
                    <p className="text-white text-lg">{currentProtocol.parameters.humidity}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-4 h-4 text-green-500" />
                      <span className="text-gray-400 text-sm">CO₂</span>
                    </div>
                    <p className="text-white text-lg">{currentProtocol.parameters.co2} ppm</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-400 text-sm">Light</span>
                    </div>
                    <p className="text-white">{currentProtocol.parameters.lightIntensity} μmol</p>
                    <p className="text-gray-400 text-xs">{currentProtocol.parameters.photoperiod}h period</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-400 text-sm">Nutrient Solution</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-xs">EC</span>
                      <p className="text-white">{currentProtocol.parameters.ec} mS/cm</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">pH</span>
                      <p className="text-white">{currentProtocol.parameters.ph}</p>
                    </div>
                  </div>
                </div>

                {/* Light Spectrum */}
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-400 text-sm">Light Spectrum</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(currentProtocol.parameters.spectrum).map(([color, value]) => (
                      <div key={color} className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs w-16 capitalize">{color}</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              color === 'red' ? 'bg-red-500' :
                              color === 'blue' ? 'bg-blue-500' :
                              color === 'farRed' ? 'bg-pink-600' :
                              'bg-purple-500'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-white text-xs w-10 text-right">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stress Factors */}
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-400 text-sm">Controlled Stress Factors</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(currentProtocol.stressFactors).map(([factor, active]) => (
                      <div key={factor} className="flex items-center gap-2">
                        {active ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-600" />
                        )}
                        <span className="text-gray-300 text-sm capitalize">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Nutritional Targets */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Nutritional Enhancement Targets</h3>
              <div className="space-y-3">
                {nutritionalTargets.map((target) => {
                  const progress = getNutritionalProgress(target.currentLevel, target.targetLevel);
                  const isReduction = target.targetLevel < target.currentLevel;
                  
                  return (
                    <div key={target.compound} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getCategoryColor(target.category) }}
                          />
                          <span className="text-white font-medium">{target.compound}</span>
                        </div>
                        <span className="text-xs text-gray-400">{target.healthBenefit}</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-sm">
                          {target.currentLevel} → {target.targetLevel} {target.unit}
                        </span>
                        <span className={`text-sm font-medium ${
                          progress >= 80 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            progress >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quality Metrics */}
              <div className="mt-6 bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{currentProtocol.qualityScore}%</p>
                    <p className="text-gray-400 text-xs">Quality Score</p>
                  </div>
                  <div>
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{currentProtocol.yield}g/m²</p>
                    <p className="text-gray-400 text-xs">Expected Yield</p>
                  </div>
                  <div>
                    <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-lg font-bold text-white">{currentProtocol.certification}</p>
                    <p className="text-gray-400 text-xs">Certification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                  <Play className="w-4 h-4" />
                  Start Production
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                  <Copy className="w-4 h-4" />
                  Duplicate Protocol
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" />
                  Export Protocol
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'monitor' && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Real-time Nutritional Development</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={researchData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Concentration', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Line 
                type="monotone" 
                dataKey="vitaminC" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Vitamin C (mg/100g)"
              />
              <Line 
                type="monotone" 
                dataKey="anthocyanins" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Anthocyanins (mg/100g)"
              />
              <Line 
                type="monotone" 
                dataKey="potassium" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Potassium (mg/100g)"
              />
              <Line 
                type="monotone" 
                dataKey="nitrates" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Nitrates (mg/kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {viewMode === 'research' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Nutritional Profile Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={[
                { nutrient: 'Vitamin C', standard: 60, enhanced: 95 },
                { nutrient: 'Antioxidants', standard: 50, enhanced: 85 },
                { nutrient: 'Minerals', standard: 70, enhanced: 90 },
                { nutrient: 'Fiber', standard: 80, enhanced: 85 },
                { nutrient: 'Proteins', standard: 60, enhanced: 75 },
                { nutrient: 'Phytochemicals', standard: 40, enhanced: 90 }
              ]}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="nutrient" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar name="Standard" dataKey="standard" stroke="#6b7280" fill="#6b7280" fillOpacity={0.3} />
                <Radar name="Enhanced" dataKey="enhanced" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Research Publications</h3>
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-white font-medium">Low-Potassium Vegetables for CKD Patients</h4>
                <p className="text-gray-400 text-sm mt-1">Journal of Functional Foods, 2023</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Peer Reviewed</span>
                  <span className="text-xs text-gray-400">87 citations</span>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-white font-medium">UV-B Enhancement of Antioxidant Compounds</h4>
                <p className="text-gray-400 text-sm mt-1">Plant Science Today, 2023</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Peer Reviewed</span>
                  <span className="text-xs text-gray-400">52 citations</span>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-white font-medium">Controlled Environment Agriculture for Medical Applications</h4>
                <p className="text-gray-400 text-sm mt-1">Frontiers in Plant Science, 2022</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Peer Reviewed</span>
                  <span className="text-xs text-gray-400">124 citations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}