'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Database,
  GitBranch,
  Shuffle,
  FileText,
  Cloud,
  Zap,
  Bug,
  Droplets,
  ThermometerSun,
  Wind,
  Sun,
  Moon,
  CloudRain,
  Timer,
  FlaskConical,
  Microscope,
  LineChart,
  Calculator,
  Beaker,
  Sprout,
  TreePine,
  Flower2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  BarChart3,
  PieChart,
  Activity,
  Waves,
  Gauge,
  Target,
  Award,
  TrendingDown,
  Package,
  DollarSign,
  Users,
  Clock,
  Calendar,
  Settings2,
  Save,
  Upload,
  Download,
  Share2,
  Copy,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  StopCircle,
  FastForward,
  Rewind,
  SkipForward,
  Camera,
  Video,
  Image,
  FileVideo,
  Folder,
  FolderOpen,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Power,
  PowerOff,
  Shield,
  Lock,
  Unlock,
  Key,
  UserCheck,
  UserX,
  Mail,
  MessageSquare,
  Phone,
  Video as VideoIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Headphones,
  Radio,
  Satellite,
  Navigation,
  Map,
  MapPin,
  Compass,
  Globe,
  Home,
  Building,
  Factory,
  Warehouse,
  Store,
  ShoppingCart,
  Package2,
  Truck,
  Ship,
  Plane,
  Train,
  Car,
  Bike,
  Bus,
  Fuel,
  Wrench,
  Hammer,
  Screwdriver,
  Scissors,
  Ruler,
  PenTool,
  Brush,
  Palette,
  Eye,
  EyeOff,
  Search,
  ZoomIn,
  ZoomOut,
  Filter,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Hash,
  At,
  Link,
  Paperclip,
  Send,
  Inbox,
  Archive,
  Trash,
  Bookmark,
  Tag,
  Flag,
  Bell,
  BellOff,
  Alarm,
  AlarmOff,
  Watch,
  Hourglass,
  History,
  RotateCcw,
  RotateCw,
  RefreshCcw,
  RefreshCw,
  Loader,
  Loader2,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Minus,
  X,
  Check,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  ChevronsDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowUpLeft,
  CornerUpLeft,
  CornerUpRight,
  CornerDownRight,
  CornerDownLeft,
  Move,
  Maximize,
  Maximize2,
  Minimize,
  Minimize2,
  Expand,
  Shrink,
  Command,
  Cloud as CloudIcon,
  View
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import 3D visualization to avoid SSR issues
const DigitalTwin3DVisualization = dynamic(
  () => import('./DigitalTwin3DVisualization').then(mod => ({ default: mod.DigitalTwin3DVisualization })),
  { 
    ssr: false,
    loading: () => <div className="w-full h-[600px] bg-gray-800 rounded-lg flex items-center justify-center text-white">Loading 3D Visualization...</div>
  }
);

// Enhanced types for more realistic simulation
interface PlantGrowthStage {
  name: string;
  duration: number; // days
  requirements: {
    temperature: { min: number; max: number; optimal: number };
    humidity: { min: number; max: number; optimal: number };
    ppfd: { min: number; max: number; optimal: number };
    dli: { min: number; max: number; optimal: number };
    photoperiod: number; // hours
    vpd: { min: number; max: number; optimal: number };
    co2: { min: number; max: number; optimal: number };
    ec: { min: number; max: number; optimal: number };
    ph: { min: number; max: number; optimal: number };
  };
  stressFactors: {
    overwatering: number;
    underwatering: number;
    nutrientDeficiency: number;
    nutrientToxicity: number;
    lightStress: number;
    heatStress: number;
    coldStress: number;
  };
}

interface PestDiseaseRisk {
  id: string;
  name: string;
  type: 'pest' | 'disease';
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggerConditions: {
    humidity?: { min?: number; max?: number };
    temperature?: { min?: number; max?: number };
    wetnessDuration?: number;
    plantStress?: number;
  };
  impact: {
    yieldReduction: number;
    qualityReduction: number;
    spreadRate: number;
  };
  prevention: string[];
  treatment: string[];
}

interface GeneticTrait {
  id: string;
  name: string;
  category: 'morphology' | 'chemistry' | 'resistance' | 'yield';
  expression: number; // 0-1
  environmentalInfluence: number; // 0-1
  heritability: number; // 0-1
}

interface WeatherPattern {
  date: Date;
  cloudCover: number; // 0-1
  precipitation: number; // mm
  windSpeed: number; // m/s
  solarRadiation: number; // W/m²
  outsideTemp: number;
  outsideHumidity: number;
}

interface MachineLearningModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'timeseries' | 'anomaly';
  accuracy: number;
  lastTrainingDate: Date;
  features: string[];
  predictions: {
    metric: string;
    value: number;
    confidence: number;
    timestamp: Date;
  }[];
}

interface ResourceConsumption {
  electricity: {
    lighting: number;
    hvac: number;
    pumps: number;
    controls: number;
    total: number;
  };
  water: {
    irrigation: number;
    cooling: number;
    humidification: number;
    waste: number;
    total: number;
  };
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    calcium: number;
    magnesium: number;
    sulfur: number;
    micronutrients: number;
    total: number;
  };
  co2: {
    supplementation: number;
    generation: number;
    total: number;
  };
}

interface SimulationEvent {
  id: string;
  timestamp: Date;
  day: number;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'environment' | 'plant' | 'system' | 'pest' | 'disease' | 'maintenance';
  title: string;
  description: string;
  impact?: {
    yield?: number;
    quality?: number;
    cost?: number;
  };
  actionRequired: boolean;
  actionTaken?: string;
}

export function DigitalTwinEnhancements() {
  const [activeTab, setActiveTab] = useState<'3d-view' | 'ml-predictions' | 'stress-analysis' | 'genetics' | 'weather' | 'optimization'>('3d-view');
  
  // Growth stages for cannabis
  const growthStages: PlantGrowthStage[] = [
    {
      name: 'Germination',
      duration: 7,
      requirements: {
        temperature: { min: 20, max: 26, optimal: 24 },
        humidity: { min: 65, max: 80, optimal: 70 },
        ppfd: { min: 50, max: 150, optimal: 100 },
        dli: { min: 3, max: 9, optimal: 6 },
        photoperiod: 18,
        vpd: { min: 0.4, max: 0.8, optimal: 0.6 },
        co2: { min: 350, max: 600, optimal: 450 },
        ec: { min: 0.5, max: 1.0, optimal: 0.8 },
        ph: { min: 5.5, max: 6.5, optimal: 6.0 }
      },
      stressFactors: {
        overwatering: 0.8,
        underwatering: 0.6,
        nutrientDeficiency: 0.3,
        nutrientToxicity: 0.7,
        lightStress: 0.4,
        heatStress: 0.5,
        coldStress: 0.6
      }
    },
    {
      name: 'Seedling',
      duration: 14,
      requirements: {
        temperature: { min: 20, max: 25, optimal: 23 },
        humidity: { min: 60, max: 70, optimal: 65 },
        ppfd: { min: 100, max: 300, optimal: 200 },
        dli: { min: 6, max: 18, optimal: 12 },
        photoperiod: 18,
        vpd: { min: 0.6, max: 1.0, optimal: 0.8 },
        co2: { min: 400, max: 800, optimal: 600 },
        ec: { min: 0.8, max: 1.3, optimal: 1.0 },
        ph: { min: 5.8, max: 6.3, optimal: 6.0 }
      },
      stressFactors: {
        overwatering: 0.7,
        underwatering: 0.5,
        nutrientDeficiency: 0.4,
        nutrientToxicity: 0.8,
        lightStress: 0.5,
        heatStress: 0.4,
        coldStress: 0.7
      }
    },
    {
      name: 'Vegetative',
      duration: 28,
      requirements: {
        temperature: { min: 22, max: 28, optimal: 25 },
        humidity: { min: 50, max: 70, optimal: 60 },
        ppfd: { min: 400, max: 800, optimal: 600 },
        dli: { min: 26, max: 52, optimal: 39 },
        photoperiod: 18,
        vpd: { min: 0.8, max: 1.2, optimal: 1.0 },
        co2: { min: 600, max: 1500, optimal: 1200 },
        ec: { min: 1.3, max: 2.0, optimal: 1.6 },
        ph: { min: 5.8, max: 6.3, optimal: 6.0 }
      },
      stressFactors: {
        overwatering: 0.5,
        underwatering: 0.4,
        nutrientDeficiency: 0.6,
        nutrientToxicity: 0.6,
        lightStress: 0.3,
        heatStress: 0.4,
        coldStress: 0.5
      }
    },
    {
      name: 'Flowering',
      duration: 56,
      requirements: {
        temperature: { min: 20, max: 26, optimal: 23 },
        humidity: { min: 40, max: 50, optimal: 45 },
        ppfd: { min: 600, max: 1000, optimal: 800 },
        dli: { min: 26, max: 43, optimal: 35 },
        photoperiod: 12,
        vpd: { min: 1.0, max: 1.5, optimal: 1.2 },
        co2: { min: 800, max: 1500, optimal: 1200 },
        ec: { min: 1.5, max: 2.3, optimal: 1.9 },
        ph: { min: 6.0, max: 6.5, optimal: 6.3 }
      },
      stressFactors: {
        overwatering: 0.6,
        underwatering: 0.7,
        nutrientDeficiency: 0.8,
        nutrientToxicity: 0.5,
        lightStress: 0.4,
        heatStress: 0.6,
        coldStress: 0.4
      }
    }
  ];

  // Pest and disease database
  const [pestDiseaseRisks] = useState<PestDiseaseRisk[]>([
    {
      id: 'pm-001',
      name: 'Powdery Mildew',
      type: 'disease',
      probability: 0.15,
      severity: 'high',
      triggerConditions: {
        humidity: { min: 55, max: 100 },
        temperature: { min: 15, max: 30 },
        wetnessDuration: 4
      },
      impact: {
        yieldReduction: 0.25,
        qualityReduction: 0.40,
        spreadRate: 0.8
      },
      prevention: [
        'Maintain humidity below 50%',
        'Ensure proper air circulation',
        'Regular defoliation',
        'UV-C light treatment'
      ],
      treatment: [
        'Sulfur spray',
        'Potassium bicarbonate',
        'Neem oil application',
        'Remove affected leaves'
      ]
    },
    {
      id: 'sm-001',
      name: 'Spider Mites',
      type: 'pest',
      probability: 0.20,
      severity: 'medium',
      triggerConditions: {
        humidity: { max: 40 },
        temperature: { min: 20, max: 35 },
        plantStress: 0.6
      },
      impact: {
        yieldReduction: 0.15,
        qualityReduction: 0.20,
        spreadRate: 0.9
      },
      prevention: [
        'Maintain humidity 50-60%',
        'Regular inspection',
        'Quarantine new plants',
        'Beneficial insects'
      ],
      treatment: [
        'Insecticidal soap',
        'Predatory mites',
        'Spinosad application',
        'Diatomaceous earth'
      ]
    }
  ]);

  // Machine learning predictions
  const [mlModels] = useState<MachineLearningModel[]>([
    {
      id: 'yield-predictor',
      name: 'Yield Prediction Model (Demo)',
      type: 'regression',
      accuracy: 0.75, // More realistic for agricultural predictions
      lastTrainingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      features: ['DLI', 'Temperature', 'CO2', 'EC', 'Genetics', 'Training'],
      predictions: [
        {
          metric: 'Estimated Yield Range',
          value: 52.3,
          confidence: 0.68, // Lower confidence reflects real-world uncertainty
          timestamp: new Date()
        }
      ]
    },
    {
      id: 'anomaly-detector',
      name: 'Environmental Anomaly Detection (Demo)',
      type: 'anomaly',
      accuracy: 0.82, // More realistic accuracy
      lastTrainingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      features: ['Temperature', 'Humidity', 'CO2', 'pH', 'EC'],
      predictions: [
        {
          metric: 'Anomaly Score',
          value: 0.12,
          confidence: 0.76, // More realistic confidence
          timestamp: new Date()
        }
      ]
    }
  ]);

  // Weather simulation
  const generateWeatherPattern = (): WeatherPattern => {
    const baseTemp = 22 + Math.sin(Date.now() / 86400000) * 5;
    return {
      date: new Date(),
      cloudCover: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.8,
      precipitation: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < 0.1 ? crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 : 0,
      windSpeed: crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 + 2,
      solarRadiation: (1 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 0.3) * 800,
      outsideTemp: baseTemp + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
      outsideHumidity: 40 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 40
    };
  };

  const renderMLPredictions = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Machine Learning Models (Simulated Demo)
        </h4>
        
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              These are demonstration values only. Real ML models require extensive training data 
              from actual grow operations to achieve reliable predictions.
            </span>
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mlModels.map(model => (
            <div key={model.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-white">{model.name}</h5>
                <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded-full">
                  {(model.accuracy * 100).toFixed(0)}% accurate
                </span>
              </div>
              
              <div className="space-y-2 mb-3">
                <p className="text-xs text-gray-400">
                  Type: <span className="text-gray-300">{model.type}</span>
                </p>
                <p className="text-xs text-gray-400">
                  Last trained: <span className="text-gray-300">
                    {model.lastTrainingDate.toLocaleDateString()}
                  </span>
                </p>
              </div>
              
              <div className="space-y-2">
                {model.predictions.map((pred, idx) => (
                  <div key={idx} className="p-2 bg-gray-900 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{pred.metric}</span>
                      <span className="text-sm font-bold text-white">
                        {pred.value.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500"
                        style={{ width: `${pred.confidence * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(pred.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 flex gap-2">
                <button className="flex-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors">
                  Retrain
                </button>
                <button className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">AI-Generated Insights</h4>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-400">
                Yield Risk Detected
              </p>
              <p className="text-sm text-gray-300 mt-1">
                Current VPD levels (1.4 kPa) are above typical range for flowering stage. 
                This may impact yield if conditions persist. Consider adjusting temperature or humidity.
              </p>
              <button className="text-xs text-yellow-400 hover:text-yellow-300 mt-2">
                View recommendations →
              </button>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-800 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-400">
                Optimization Opportunity
              </p>
              <p className="text-sm text-gray-300 mt-1">
                Research suggests increasing CO₂ to 1400 ppm during peak photosynthesis hours 
                may improve growth rates. Results vary based on genetics and other environmental factors.
              </p>
              <button className="text-xs text-green-400 hover:text-green-300 mt-2">
                Apply optimization →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStressAnalysis = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-400" />
          Plant Stress Analysis
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(growthStages[2].stressFactors).map(([factor, value]) => (
            <div key={factor} className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">
                {factor.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <div className="flex items-center justify-between">
                <div className={`text-lg font-bold ${
                  value < 0.3 ? 'text-green-400' : 
                  value < 0.6 ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {(value * 100).toFixed(0)}%
                </div>
                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                  value < 0.3 ? 'bg-green-900/50' : 
                  value < 0.6 ? 'bg-yellow-900/50' : 
                  'bg-red-900/50'
                }`}>
                  {value < 0.3 ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                   value < 0.6 ? <AlertCircle className="w-4 h-4 text-yellow-400" /> :
                   <XCircle className="w-4 h-4 text-red-400" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stress Timeline */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Stress Events Timeline</h5>
          <div className="space-y-2">
            {[
              { time: '2h ago', event: 'VPD spike detected', severity: 'medium' },
              { time: '8h ago', event: 'Nutrient solution pH drift', severity: 'low' },
              { time: '1d ago', event: 'Temperature fluctuation', severity: 'high' },
              { time: '3d ago', event: 'Light intensity adjustment', severity: 'low' }
            ].map((event, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <span className="text-gray-500 w-16">{event.time}</span>
                <div className={`w-2 h-2 rounded-full ${
                  event.severity === 'high' ? 'bg-red-400' :
                  event.severity === 'medium' ? 'bg-yellow-400' :
                  'bg-green-400'
                }`} />
                <span className="text-gray-300">{event.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pest & Disease Risk */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bug className="w-5 h-5 text-orange-400" />
          Pest & Disease Risk Assessment
        </h4>
        
        <div className="space-y-4">
          {pestDiseaseRisks.map(risk => (
            <div key={risk.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    risk.type === 'pest' ? 'bg-orange-900/50' : 'bg-red-900/50'
                  }`}>
                    {risk.type === 'pest' ? 
                      <Bug className="w-4 h-4 text-orange-400" /> :
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  <div>
                    <h5 className="font-medium text-white">{risk.name}</h5>
                    <p className="text-xs text-gray-400">
                      {risk.type === 'pest' ? 'Pest' : 'Disease'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">
                    {(risk.probability * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-400">risk</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                <div className="text-center">
                  <p className="text-gray-400">Yield Impact</p>
                  <p className="font-medium text-red-400">
                    -{(risk.impact.yieldReduction * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Quality Impact</p>
                  <p className="font-medium text-orange-400">
                    -{(risk.impact.qualityReduction * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Spread Rate</p>
                  <p className="font-medium text-yellow-400">
                    {(risk.impact.spreadRate * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">
                  Prevention Protocol
                </button>
                <button className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors">
                  Treatment Options
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGenetics = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Dna className="w-5 h-5 text-green-400" />
          Genetic Expression Simulation
        </h4>
        
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Phenotype Expression</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { trait: 'THC Production', genetic: 0.85, environmental: 0.15, current: 0.82 },
              { trait: 'Terpene Profile', genetic: 0.70, environmental: 0.30, current: 0.75 },
              { trait: 'Flower Density', genetic: 0.60, environmental: 0.40, current: 0.68 },
              { trait: 'Disease Resistance', genetic: 0.90, environmental: 0.10, current: 0.88 }
            ].map(trait => (
              <div key={trait.trait} className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2">{trait.trait}</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Genetic</span>
                      <span className="text-gray-300">{(trait.genetic * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${trait.genetic * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Environmental</span>
                      <span className="text-gray-300">{(trait.environmental * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500"
                        style={{ width: `${trait.environmental * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Expression</span>
                      <span className="font-medium text-white">{(trait.current * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breeding Predictions */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Breeding Outcome Predictions</h5>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-900 rounded">
              <span className="text-sm text-gray-300">F1 Hybrid Vigor</span>
              <span className="text-sm font-medium text-green-400">+15% yield potential</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-900 rounded">
              <span className="text-sm text-gray-300">Trait Stability</span>
              <span className="text-sm font-medium text-blue-400">87% uniform</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-900 rounded">
              <span className="text-sm text-gray-300">Cannabinoid Variance</span>
              <span className="text-sm font-medium text-yellow-400">±3.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeather = () => {
    const weather = generateWeatherPattern();
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-700 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CloudIcon className="w-5 h-5 text-blue-400" />
            Environmental Impact Simulation
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CloudIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Cloud Cover</span>
              </div>
              <p className="text-lg font-bold text-white">{(weather.cloudCover * 100).toFixed(0)}%</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Solar Radiation</span>
              </div>
              <p className="text-lg font-bold text-white">{weather.solarRadiation.toFixed(0)} W/m²</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-400">Outside Temp</span>
              </div>
              <p className="text-lg font-bold text-white">{weather.outsideTemp.toFixed(1)}°C</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-400">Wind Speed</span>
              </div>
              <p className="text-lg font-bold text-white">{weather.windSpeed.toFixed(1)} m/s</p>
            </div>
          </div>

          {/* Energy Impact */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-300 mb-3">HVAC Load Prediction</h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Cooling Load</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '65%' }} />
                  </div>
                  <span className="text-sm text-white">65%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Dehumidification</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: '45%' }} />
                  </div>
                  <span className="text-sm text-white">45%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Supplemental Lighting</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: `${weather.cloudCover * 100}%` }} />
                  </div>
                  <span className="text-sm text-white">{(weather.cloudCover * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOptimization = () => (
    <div className="space-y-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-400" />
          Multi-Objective Optimization
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-300 mb-3">Yield Optimization</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Current</span>
                <span className="text-white">48.2g/plant</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Optimized</span>
                <span className="text-green-400">56.7g/plant</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Improvement</span>
                <span className="font-bold text-green-400">+17.6%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-300 mb-3">Quality Optimization</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">THC</span>
                <span className="text-white">22.3% → 24.8%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Terpenes</span>
                <span className="text-white">2.1% → 2.7%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Density</span>
                <span className="text-white">0.68 → 0.75 g/cm³</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-300 mb-3">Cost Optimization</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Energy</span>
                <span className="text-green-400">-22% ($0.31/g)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Water</span>
                <span className="text-green-400">-18% ($0.04/g)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Labor</span>
                <span className="text-green-400">-15% ($0.22/g)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Actions */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Recommended Actions</h5>
          <div className="space-y-2">
            {[
              { action: 'Adjust light spectrum to R:FR ratio 4:1', impact: '+8% yield', effort: 'Low' },
              { action: 'Implement 2-hour CO₂ burst at sunrise', impact: '+5% growth rate', effort: 'Low' },
              { action: 'Switch to adaptive fertigation schedule', impact: '-20% water use', effort: 'Medium' },
              { action: 'Install canopy temperature sensors', impact: '+3% quality', effort: 'Medium' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-900 rounded">
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{item.action}</p>
                  <p className="text-xs text-green-400 mt-1">{item.impact}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.effort === 'Low' ? 'bg-green-900/50 text-green-400' :
                    item.effort === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                    {item.effort} effort
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Add missing DNA icon
  const Dna = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0-18c-1.657 0-3 1.343-3 3s1.343 3 3 3m0-6c1.657 0 3 1.343 3 3s-1.343 3-3 3m0 6c-1.657 0-3 1.343-3 3s1.343 3 3 3m0-6c1.657 0 3 1.343 3 3s-1.343 3-3 3" />
    </svg>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-blue-400" />
          Advanced Simulation Features
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Simulation Engine v2.0</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {[
          { id: '3d-view', label: '3D View', icon: View },
          { id: 'ml-predictions', label: 'ML Predictions', icon: Brain },
          { id: 'stress-analysis', label: 'Stress Analysis', icon: Activity },
          { id: 'genetics', label: 'Genetics', icon: Dna },
          { id: 'weather', label: 'Weather Impact', icon: CloudIcon },
          { id: 'optimization', label: 'Optimization', icon: Calculator }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === '3d-view' && (
        <div className="space-y-6">
          <DigitalTwin3DVisualization />
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-2">3D Visualization Controls</h4>
            <p className="text-xs text-gray-400">
              • Left click + drag to rotate • Right click + drag to pan • Scroll to zoom
            </p>
          </div>
        </div>
      )}
      {activeTab === 'ml-predictions' && renderMLPredictions()}
      {activeTab === 'stress-analysis' && renderStressAnalysis()}
      {activeTab === 'genetics' && renderGenetics()}
      {activeTab === 'weather' && renderWeather()}
      {activeTab === 'optimization' && renderOptimization()}
    </div>
  );
}