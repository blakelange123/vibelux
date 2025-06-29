'use client';

import React, { useState } from 'react';
import {
  Building2,
  Droplets,
  Wind,
  Sun,
  Gauge,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Thermometer,
  Clock,
  Calendar,
  Map,
  Layers,
  Grid3x3,
  Zap,
  Shield,
  Database,
  Cloud,
  Wifi,
  Monitor,
  Server,
  HardDrive,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Users,
  UserCheck,
  Key,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Play,
  Pause,
  SkipForward,
  Save,
  FolderOpen,
  Copy,
  Clipboard,
  Edit,
  Trash2,
  Info,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Navigation,
  Crosshair,
  Target,
  Compass,
  Move,
  Maximize2,
  Minimize2,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  BookOpen,
  Book,
  Bookmark,
  Tag,
  Tags,
  Hash,
  AtSign,
  DollarSign,
  Percent,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  RotateCcw,
  Repeat,
  Shuffle,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Camera,
  CameraOff,
  Aperture,
  Filter,
  Sliders,
  ToggleLeft,
  ToggleRight,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
  Package,
  Box,
  Archive,
  Inbox,
  Send,
  Printer,
  Scissors,
  Paperclip,
  Link,
  Link2,
  Unlink,
  ExternalLink,
  Anchor,
  Command,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudOff,
  Sunrise,
  Sunset,
  Moon,
  CloudFog,
  Waves,
  Battery,
  BatteryCharging,
  Plug,
  Radio,
  Bluetooth,
  Cast,
  Voicemail,
  PhoneCall,
  PhoneForwarded,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  Airplay,
  Tv,
  Smartphone,
  Tablet,
  Watch,
  Cpu,
  Terminal,
  Code,
  CodepenIcon,
  Codesandbox,
  Coffee,
  Columns,
  CornerDownLeft,
  CornerDownRight,
  CornerLeftDown,
  CornerLeftUp,
  CornerRightDown,
  CornerRightUp,
  CornerUpLeft,
  CornerUpRight,
  Crop,
  Delete,
  Disc,
  DivideCircle,
  DivideSquare,
  Divide,
  DownloadCloud,
  Dribbble,
  Droplet,
  Edit2,
  Edit3,
  Facebook,
  FastForward,
  Feather,
  Figma,
  FileMinus,
  FilePlus,
  File,
  Film,
  FolderMinus,
  FolderPlus,
  Folder,
  Framer,
  Frown,
  Gift,
  Grid,
  Headphones,
  Home,
  Image,
  Instagram,
  Italic,
  Layout,
  LifeBuoy,
  Linkedin,
  List,
  Loader,
  LogIn,
  LogOut,
  MapPin,
  Maximize,
  Meh,
  Menu,
  MessageCircle,
  Minimize,
  MinusCircle,
  MinusSquare,
  MoreHorizontal,
  MoreVertical,
  Mountain,
  MousePointer,
  Music,
  Navigation2,
  PauseCircle,
  PenTool,
  PersonStanding,
  PlayCircle,
  PlusCircle,
  PlusSquare,
  Pocket,
  Power,
  RefreshCcw,
  Rewind,
  Rss,
  Search,
  Share,
  Share2,
  ShieldOff,
  ShoppingBag,
  ShoppingCart,
  Sidebar,
  SkipBack,
  Slack,
  Slash,
  Smile,
  Speaker,
  StopCircle,
  Trash,
  Trello,
  Truck,
  Twitch,
  Twitter,
  Type,
  Umbrella,
  Underline,
  UploadCloud,
  UserMinus,
  UserPlus,
  UserX,
  User,
  WifiOff,
  XCircle,
  XOctagon,
  XSquare,
  X,
  Youtube,
  ZapOff,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { WeatherIntegration } from './WeatherIntegration';
import { EnergyManagement } from './EnergyManagement';

interface CompartmentData {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'alarm' | 'maintenance';
  temperature: number;
  humidity: number;
  co2: number;
  light: number;
  irrigation: {
    ec: number;
    ph: number;
    flow: number;
    volume: number;
  };
  climate: {
    heatingPipes: number;
    coolingPad: boolean;
    screens: number;
    windows: number;
  };
}

interface Strategy {
  id: string;
  name: string;
  type: 'climate' | 'irrigation' | 'lighting' | 'co2';
  active: boolean;
  priority: number;
  conditions: any[];
  actions: any[];
}

interface AlarmConfig {
  id: string;
  parameter: string;
  lowLimit?: number;
  highLimit?: number;
  delay: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  actions: string[];
}

export function PrivaInspiredBMS() {
  const [selectedCompartment, setSelectedCompartment] = useState<string>('comp-1');
  const [viewMode, setViewMode] = useState<'overview' | 'detail' | 'strategy' | 'history' | 'weather' | 'energy'>('overview');
  const [controlMode, setControlMode] = useState<'auto' | 'manual' | 'schedule'>('auto');
  const [climateControls, setClimateControls] = useState({
    temperature: 24.5,
    humidity: 65,
    co2: 850,
    light: 680
  });
  const [equipmentStates, setEquipmentStates] = useState({
    heatingPipes: 45,
    coolingPad: false,
    screens: 30,
    windows: 15
  });
  
  const [compartments] = useState<CompartmentData[]>([
    {
      id: 'comp-1',
      name: 'Compartment 1 - Tomatoes',
      status: 'active',
      temperature: 24.5,
      humidity: 65,
      co2: 850,
      light: 680,
      irrigation: {
        ec: 2.8,
        ph: 5.8,
        flow: 2.4,
        volume: 156
      },
      climate: {
        heatingPipes: 45,
        coolingPad: false,
        screens: 30,
        windows: 15
      }
    },
    {
      id: 'comp-2',
      name: 'Compartment 2 - Lettuce',
      status: 'active',
      temperature: 22.3,
      humidity: 70,
      co2: 750,
      light: 450,
      irrigation: {
        ec: 1.8,
        ph: 6.2,
        flow: 1.8,
        volume: 98
      },
      climate: {
        heatingPipes: 38,
        coolingPad: true,
        screens: 0,
        windows: 25
      }
    },
    {
      id: 'comp-3',
      name: 'Compartment 3 - Herbs',
      status: 'alarm',
      temperature: 26.8,
      humidity: 58,
      co2: 920,
      light: 520,
      irrigation: {
        ec: 2.2,
        ph: 5.5,
        flow: 0,
        volume: 0
      },
      climate: {
        heatingPipes: 0,
        coolingPad: true,
        screens: 60,
        windows: 45
      }
    }
  ]);

  const [strategies] = useState<Strategy[]>([
    {
      id: 'strat-1',
      name: 'Morning Temperature Rise',
      type: 'climate',
      active: true,
      priority: 1,
      conditions: [
        { type: 'time', start: '06:00', end: '08:00' },
        { type: 'temperature', operator: '<', value: 22 }
      ],
      actions: [
        { type: 'heating', target: 'gradual', rate: 2 },
        { type: 'screens', position: 0 },
        { type: 'windows', position: 0 }
      ]
    },
    {
      id: 'strat-2',
      name: 'High Radiation Cooling',
      type: 'climate',
      active: true,
      priority: 2,
      conditions: [
        { type: 'radiation', operator: '>', value: 800 },
        { type: 'temperature', operator: '>', value: 28 }
      ],
      actions: [
        { type: 'screens', position: 80 },
        { type: 'windows', position: 100 },
        { type: 'cooling', activate: true }
      ]
    },
    {
      id: 'strat-3',
      name: 'Night Irrigation',
      type: 'irrigation',
      active: true,
      priority: 1,
      conditions: [
        { type: 'time', start: '22:00', end: '04:00' },
        { type: 'moisture', operator: '<', value: 60 }
      ],
      actions: [
        { type: 'irrigation', duration: 10, interval: 120 },
        { type: 'ec', target: 2.5 },
        { type: 'ph', target: 5.8 }
      ]
    }
  ]);

  const [alarms] = useState<AlarmConfig[]>([
    {
      id: 'alarm-1',
      parameter: 'temperature',
      lowLimit: 15,
      highLimit: 32,
      delay: 300,
      priority: 'high',
      enabled: true,
      actions: ['sms', 'email', 'screen_flash']
    },
    {
      id: 'alarm-2',
      parameter: 'humidity',
      lowLimit: 40,
      highLimit: 85,
      delay: 600,
      priority: 'medium',
      enabled: true,
      actions: ['email', 'log']
    },
    {
      id: 'alarm-3',
      parameter: 'irrigation_ec',
      lowLimit: 1.5,
      highLimit: 3.5,
      delay: 60,
      priority: 'critical',
      enabled: true,
      actions: ['sms', 'email', 'stop_irrigation']
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'idle': return 'text-gray-500';
      case 'alarm': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex h-screen">
        {/* Left Sidebar - Compartment List */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Vibelux BMS</h1>
            <p className="text-gray-400 text-sm">Advanced Cultivation Control System</p>
          </div>

          {/* Control Mode Selector */}
          <div className="mb-6 p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">Control Mode</p>
            <div className="grid grid-cols-3 gap-1 bg-gray-900 rounded p-1">
              {['auto', 'manual', 'schedule'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setControlMode(mode as any)}
                  className={`px-3 py-1 rounded text-sm font-medium capitalize transition-colors ${
                    controlMode === mode
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Compartment List */}
          <div className="space-y-2">
            <h3 className="text-white font-medium mb-3">Compartments</h3>
            {compartments.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setSelectedCompartment(comp.id)}
                className={`w-full p-3 rounded-lg transition-all ${
                  selectedCompartment === comp.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{comp.name}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    comp.status === 'active' ? 'bg-green-500' :
                    comp.status === 'alarm' ? 'bg-red-500 animate-pulse' :
                    comp.status === 'maintenance' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3" />
                    <span>{comp.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    <span>{comp.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3" />
                    <span>{comp.co2} ppm</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sun className="w-3 h-3" />
                    <span>{comp.light} W/m²</span>
                  </div>
                </div>
                {comp.status === 'alarm' && (
                  <div className="mt-2 p-1 bg-red-500/20 rounded text-xs text-red-400">
                    High temperature alert!
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 space-y-2">
            <h3 className="text-white font-medium mb-3">Quick Actions</h3>
            <button className="w-full p-2 bg-gray-800 hover:bg-gray-700 rounded text-left text-sm flex items-center gap-2">
              <Play className="w-4 h-4 text-green-500" />
              Start All Irrigation
            </button>
            <button className="w-full p-2 bg-gray-800 hover:bg-gray-700 rounded text-left text-sm flex items-center gap-2">
              <Pause className="w-4 h-4 text-yellow-500" />
              Pause Climate Control
            </button>
            <button className="w-full p-2 bg-gray-800 hover:bg-gray-700 rounded text-left text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Activate Storm Mode
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {['overview', 'detail', 'strategy', 'history', 'weather', 'energy'].map((mode) => (
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
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Last update: 2 seconds ago</span>
                <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    // Settings functionality
                    alert('Settings panel would open here')
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-auto">
            {viewMode === 'overview' && (
              <div className="space-y-6">
                {/* Climate Overview */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Thermometer className="w-6 h-6 text-orange-500" />
                    Climate Control
                  </h2>
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Temperature</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{climateControls.temperature}</span>
                        <span className="text-gray-400">°C</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="range"
                          min="15"
                          max="35"
                          value={climateControls.temperature}
                          onChange={(e) => setClimateControls(prev => ({...prev, temperature: parseFloat(e.target.value)}))}
                          className="w-full accent-purple-600"
                          disabled={controlMode !== 'manual'}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Humidity</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{climateControls.humidity}</span>
                        <span className="text-gray-400">%</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="range"
                          min="30"
                          max="90"
                          value={climateControls.humidity}
                          onChange={(e) => setClimateControls(prev => ({...prev, humidity: parseFloat(e.target.value)}))}
                          className="w-full accent-purple-600"
                          disabled={controlMode !== 'manual'}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">CO₂</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{climateControls.co2}</span>
                        <span className="text-gray-400">ppm</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="range"
                          min="400"
                          max="1500"
                          value={climateControls.co2}
                          onChange={(e) => setClimateControls(prev => ({...prev, co2: parseFloat(e.target.value)}))}
                          className="w-full accent-purple-600"
                          disabled={controlMode !== 'manual'}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Light</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{climateControls.light}</span>
                        <span className="text-gray-400">W/m²</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={climateControls.light}
                          onChange={(e) => setClimateControls(prev => ({...prev, light: parseFloat(e.target.value)}))}
                          className="w-full accent-purple-600"
                          disabled={controlMode !== 'manual'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Climate Equipment Status */}
                  <div className="mt-6 grid grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Heating Pipes</span>
                        <Gauge className="w-4 h-4 text-orange-500" />
                      </div>
                      <p className="text-white font-medium">{equipmentStates.heatingPipes}°C</p>
                      <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                        <div className="bg-orange-500 h-1 rounded-full" style={{ width: `${equipmentStates.heatingPipes}%` }} />
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Cooling Pad</span>
                        <Wind className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-white font-medium">{equipmentStates.coolingPad ? 'ON' : 'OFF'}</p>
                      <div className="mt-1">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={equipmentStates.coolingPad}
                            onChange={(e) => setEquipmentStates(prev => ({...prev, coolingPad: e.target.checked}))}
                            className="sr-only peer"
                            disabled={controlMode !== 'manual'}
                          />
                          <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Screens</span>
                        <Layers className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-white font-medium">{equipmentStates.screens}%</p>
                      <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                        <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${equipmentStates.screens}%` }} />
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Windows</span>
                        <Square className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-white font-medium">{equipmentStates.windows}%</p>
                      <div className="mt-1 w-full bg-gray-700 rounded-full h-1">
                        <div className="bg-green-500 h-1 rounded-full" style={{ width: `${equipmentStates.windows}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Irrigation Overview */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Droplets className="w-6 h-6 text-blue-500" />
                    Irrigation System
                  </h2>
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">EC Level</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">2.8</span>
                        <span className="text-gray-400">mS/cm</span>
                      </div>
                      <p className="text-green-400 text-xs mt-1">Within range</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">pH Level</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">5.8</span>
                      </div>
                      <p className="text-green-400 text-xs mt-1">Optimal</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Flow Rate</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">2.4</span>
                        <span className="text-gray-400">L/min</span>
                      </div>
                      <p className="text-blue-400 text-xs mt-1">Active</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Daily Volume</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">156</span>
                        <span className="text-gray-400">L</span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">62% of target</p>
                    </div>
                  </div>

                  {/* Irrigation Schedule */}
                  <div className="mt-6">
                    <h3 className="text-white font-medium mb-3">Today's Schedule</h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="space-y-2">
                        {[
                          { time: '06:00', duration: '10 min', volume: '25L', status: 'completed' },
                          { time: '09:00', duration: '8 min', volume: '20L', status: 'completed' },
                          { time: '12:00', duration: '12 min', volume: '30L', status: 'active' },
                          { time: '15:00', duration: '10 min', volume: '25L', status: 'scheduled' },
                          { time: '18:00', duration: '8 min', volume: '20L', status: 'scheduled' },
                        ].map((schedule, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-white">{schedule.time}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-400">{schedule.duration}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-400">{schedule.volume}</span>
                            </div>
                            <span className={`text-sm ${
                              schedule.status === 'completed' ? 'text-green-400' :
                              schedule.status === 'active' ? 'text-blue-400' :
                              'text-gray-400'
                            }`}>
                              {schedule.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'strategy' && (
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <GitBranch className="w-6 h-6 text-purple-500" />
                      Control Strategies
                    </h2>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
                      <Plus className="w-4 h-4" />
                      Add Strategy
                    </button>
                  </div>

                  <div className="space-y-4">
                    {strategies.map((strategy) => (
                      <div key={strategy.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              strategy.active ? 'bg-green-500' : 'bg-gray-500'
                            }`} />
                            <h3 className="text-white font-medium">{strategy.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              strategy.type === 'climate' ? 'bg-orange-600' :
                              strategy.type === 'irrigation' ? 'bg-blue-600' :
                              strategy.type === 'lighting' ? 'bg-yellow-600' :
                              'bg-purple-600'
                            }`}>
                              {strategy.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Priority: {strategy.priority}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={strategy.active}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm mb-2">Conditions</p>
                            <div className="space-y-1">
                              {strategy.conditions.map((condition, idx) => (
                                <p key={idx} className="text-white text-sm">
                                  • {condition.type === 'time' ? `Time: ${condition.start} - ${condition.end}` :
                                     condition.type === 'temperature' ? `Temperature ${condition.operator} ${condition.value}°C` :
                                     condition.type === 'radiation' ? `Radiation ${condition.operator} ${condition.value} W/m²` :
                                     condition.type === 'moisture' ? `Moisture ${condition.operator} ${condition.value}%` :
                                     JSON.stringify(condition)}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-2">Actions</p>
                            <div className="space-y-1">
                              {strategy.actions.map((action, idx) => (
                                <p key={idx} className="text-white text-sm">
                                  • {action.type === 'heating' ? `Heating: ${action.target} at ${action.rate}°C/hr` :
                                     action.type === 'screens' ? `Screens: ${action.position}%` :
                                     action.type === 'windows' ? `Windows: ${action.position}%` :
                                     action.type === 'cooling' ? `Cooling: ${action.activate ? 'ON' : 'OFF'}` :
                                     action.type === 'irrigation' ? `Irrigation: ${action.duration}min every ${action.interval}min` :
                                     action.type === 'ec' ? `EC Target: ${action.target}` :
                                     action.type === 'ph' ? `pH Target: ${action.target}` :
                                     JSON.stringify(action)}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alarm Configuration */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-red-500" />
                    Alarm Configuration
                  </h2>

                  <div className="space-y-3">
                    {alarms.map((alarm) => (
                      <div key={alarm.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getPriorityColor(alarm.priority)}`}>
                              {alarm.priority}
                            </div>
                            <span className="text-white font-medium capitalize">
                              {alarm.parameter.replace('_', ' ')}
                            </span>
                            <span className="text-gray-400">
                              {alarm.lowLimit && `Low: ${alarm.lowLimit}`}
                              {alarm.lowLimit && alarm.highLimit && ' | '}
                              {alarm.highLimit && `High: ${alarm.highLimit}`}
                            </span>
                            <span className="text-gray-400">
                              Delay: {alarm.delay}s
                            </span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={alarm.enabled}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'weather' && (
              <WeatherIntegration />
            )}

            {viewMode === 'energy' && (
              <EnergyManagement />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}