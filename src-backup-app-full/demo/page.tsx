'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Sparkles,
  Layers,
  Brain,
  Monitor,
  Users,
  Map,
  Zap,
  Calendar,
  BarChart3,
  Leaf,
  Calculator,
  Shield,
  ArrowRight,
  Play,
  Check,
  Building2,
  Thermometer,
  Target,
  DollarSign,
  ChevronRight,
  Lightbulb,
  Activity,
  Gauge,
  TrendingUp,
  Package,
  ShoppingCart,
  FileText,
  X,
  Eye,
  EyeOff,
  Bell,
  Settings,
  HelpCircle,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Maximize2,
  Minimize2,
  Grid3x3,
  Move,
  MousePointer,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Star,
  Heart,
  MessageSquare,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Edit3,
  Trash2,
  Copy,
  Clipboard,
  Save,
  Folder,
  FolderOpen,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  MoreHorizontal,
  MoreVertical,
  Menu,
  LogOut,
  LogIn,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Bluetooth,
  Battery,
  BatteryCharging,
  Power,
  Cpu,
  HardDrive,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Tv,
  Radio,
  Headphones,
  Speaker,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Music,
  Film,
  Image,
  Aperture,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer as ThermometerIcon,
  Home,
  Building,
  MapPin,
  Navigation,
  Compass,
  Globe,
  Flag,
  Bookmark,
  Tag,
  Tags,
  Hash,
  AtSign,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  PhoneOff,
  Mail,
  Send,
  Inbox,
  Archive,
  Paperclip,
  Link as LinkIcon,
  ExternalLink,
  Printer,
  FileText as FileTextIcon,
  File,
  Files,
  FolderPlus,
  FolderMinus,
  Pen,
  PenTool,
  Eraser,
  Ruler,
  Scissors,
  Palette,
  Brush,
  Pipette,
  Crop,
  Sliders,
  Layers as LayersIcon,
  Layout,
  Grid,
  Columns,
  Sidebar,
  Table,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Terminal,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
  Package as PackageIcon,
  Truck,
  ShoppingBag,
  Gift,
  CreditCard,
  Wallet,
  DollarSign as DollarSignIcon,
  Euro,
  PoundSterling,
  Percent,
  PieChart,
  BarChart,
  BarChart2,
  LineChart,
  TrendingDown,
  Award,
  Medal,
  Trophy,
  Target as TargetIcon,
  Crosshair,
  Feather,
  Anchor,
  Box,
  Briefcase,
  Calendar as CalendarIcon,
  Clock,
  Watch as WatchIcon,
  Hourglass,
  Timer,
  Alarm,
  Bell as BellIcon,
  BellOff,
  BellRing,
  BellPlus,
  BellMinus,
  BellDot
} from 'lucide-react';

interface DemoCard {
  title: string;
  description: string;
  icon: any;
  href: string;
  features: string[];
  badge?: string;
  color: string;
}

const demos: DemoCard[] = [
  {
    title: 'Quick Design Demo',
    description: 'Try our simplified lighting design tool - perfect for getting started',
    icon: Layers,
    href: '/designer',
    color: 'purple',
    badge: 'Free Access',
    features: [
      'Basic room layout',
      'Fixture placement',
      'Simple PPFD calculations',
      'PDF export'
    ]
  },
  {
    title: 'Interactive Calculators',
    description: 'Essential cultivation calculators available to everyone',
    icon: Calculator,
    href: '/calculators',
    color: 'green',
    badge: 'Free Tools',
    features: [
      'PPFD calculator',
      'DLI calculator',
      'Basic ROI calculator',
      'VPD calculator'
    ]
  },
  {
    title: 'Collaboration Preview',
    description: 'See how teams work together in real-time',
    icon: Users,
    href: '/demo/collaboration',
    color: 'pink',
    badge: 'Live Demo',
    features: [
      'Real-time cursors',
      'Basic collaboration',
      'Limited to 2 users',
      'View-only mode available'
    ]
  },
  {
    title: 'Sample Reports',
    description: 'View example reports and analytics dashboards',
    icon: BarChart3,
    href: '/features/analytics-intelligence/performance-analytics',
    color: 'blue',
    features: [
      'Sample data only',
      'Report templates',
      'Export examples',
      'Analytics overview'
    ]
  },
  {
    title: 'Video Walkthrough',
    description: 'Watch a guided tour of the platform capabilities',
    icon: Play,
    href: '#video-tour',
    color: 'orange',
    badge: 'Coming Soon',
    features: [
      '10-minute overview',
      'Feature highlights',
      'Use case examples',
      'Q&A section'
    ]
  },
  {
    title: 'Request Full Demo',
    description: 'Schedule a personalized demo with our team',
    icon: Calendar,
    href: '/contact',
    color: 'indigo',
    badge: 'Recommended',
    features: [
      'Personalized walkthrough',
      'Custom use cases',
      'Team training available',
      'Free consultation'
    ]
  }
];

// Interactive Demo Components
const InteractiveLightingDemo = () => {
  const [ppfd, setPpfd] = useState(600);
  const [hours, setHours] = useState(12);
  const [spectrum, setSpectrum] = useState({ red: 35, blue: 25, green: 15, farRed: 10, white: 15 });
  
  const dli = (ppfd * hours * 3600) / 1000000;
  
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Interactive Lighting Calculator</h3>
      
      <div className="space-y-6">
        {/* PPFD Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-300">PPFD (μmol/m²/s)</label>
            <span className="text-white font-medium">{ppfd}</span>
          </div>
          <input
            type="range"
            min="100"
            max="1500"
            value={ppfd}
            onChange={(e) => setPpfd(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
        
        {/* Hours Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-300">Photoperiod (hours)</label>
            <span className="text-white font-medium">{hours}h</span>
          </div>
          <input
            type="range"
            min="8"
            max="24"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* DLI Result */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-1">Daily Light Integral (DLI)</p>
            <p className="text-4xl font-bold text-green-400">{dli.toFixed(1)}</p>
            <p className="text-gray-400 text-sm mt-1">mol/m²/day</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-300 mb-2">Recommended for:</p>
            <div className="space-y-1">
              {dli < 15 && <p className="text-xs text-blue-400">• Leafy greens, herbs</p>}
              {dli >= 15 && dli < 30 && <p className="text-xs text-green-400">• Tomatoes, peppers</p>}
              {dli >= 30 && <p className="text-xs text-orange-400">• High-light crops</p>}
              {dli >= 45 && <p className="text-xs text-red-400">• Cannabis flowering</p>}
            </div>
          </div>
        </div>
        
        {/* Spectrum Visualization */}
        <div>
          <p className="text-sm text-gray-300 mb-3">Spectrum Composition</p>
          <div className="space-y-2">
            {Object.entries(spectrum).map(([color, value]) => (
              <div key={color} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16 capitalize">{color}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2 relative overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all ${
                      color === 'red' ? 'bg-red-500' :
                      color === 'blue' ? 'bg-blue-500' :
                      color === 'green' ? 'bg-green-500' :
                      color === 'farRed' ? 'bg-red-800' :
                      'bg-gray-300'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-xs text-white w-10 text-right">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InteractiveROIDemo = () => {
  const [fixtures, setFixtures] = useState(20);
  const [wattage, setWattage] = useState(600);
  const [electricityRate, setElectricityRate] = useState(0.12);
  const [yieldIncrease, setYieldIncrease] = useState(15);
  
  const totalWattage = fixtures * wattage;
  const monthlyKwh = (totalWattage * 12 * 30) / 1000; // 12 hours/day, 30 days
  const monthlyCost = monthlyKwh * electricityRate;
  const yearlyCost = monthlyCost * 12;
  const yieldValue = yearlyCost * (yieldIncrease / 100) * 3; // 3x multiplier for crop value
  const netSavings = yieldValue - yearlyCost;
  const roi = ((netSavings / yearlyCost) * 100).toFixed(0);
  
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">ROI Calculator Demo</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-2">Number of Fixtures</label>
            <input
              type="number"
              value={fixtures}
              onChange={(e) => setFixtures(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 block mb-2">Wattage per Fixture</label>
            <input
              type="number"
              value={wattage}
              onChange={(e) => setWattage(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 block mb-2">Electricity Rate ($/kWh)</label>
            <input
              type="number"
              step="0.01"
              value={electricityRate}
              onChange={(e) => setElectricityRate(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-300 block mb-2">Expected Yield Increase (%)</label>
            <input
              type="range"
              min="5"
              max="40"
              value={yieldIncrease}
              onChange={(e) => setYieldIncrease(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-white">{yieldIncrease}%</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total System Wattage</p>
            <p className="text-2xl font-bold text-white">{totalWattage.toLocaleString()}W</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Monthly Energy Cost</p>
            <p className="text-2xl font-bold text-orange-400">${monthlyCost.toFixed(2)}</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Annual Energy Cost</p>
            <p className="text-2xl font-bold text-red-400">${yearlyCost.toFixed(0)}</p>
          </div>
          
          <div className="bg-green-900/20 rounded-lg p-4 border border-green-600">
            <p className="text-gray-300 text-sm">Projected Annual Value</p>
            <p className="text-3xl font-bold text-green-400">${yieldValue.toFixed(0)}</p>
            <p className="text-xs text-green-300 mt-1">ROI: {roi}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InteractiveEnvironmentDemo = () => {
  const [temp, setTemp] = useState(72);
  const [humidity, setHumidity] = useState(55);
  const [co2, setCo2] = useState(800);
  
  // VPD calculation
  const tempC = (temp - 32) * 5/9;
  const es = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const ea = es * (humidity / 100);
  const vpd = es - ea;
  
  const getVPDStatus = () => {
    if (vpd < 0.4) return { status: 'Too Low', color: 'text-blue-400' };
    if (vpd > 1.6) return { status: 'Too High', color: 'text-red-400' };
    if (vpd >= 0.8 && vpd <= 1.2) return { status: 'Optimal', color: 'text-green-400' };
    return { status: 'Acceptable', color: 'text-yellow-400' };
  };
  
  const vpdStatus = getVPDStatus();
  
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Environment Control Demo</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Temperature */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Temperature</label>
              <span className="text-white font-medium">{temp}°F</span>
            </div>
            <input
              type="range"
              min="60"
              max="90"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Humidity */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Relative Humidity</label>
              <span className="text-white font-medium">{humidity}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="80"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* CO2 */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">CO2 Level</label>
              <span className="text-white font-medium">{co2} ppm</span>
            </div>
            <input
              type="range"
              min="400"
              max="1500"
              value={co2}
              onChange={(e) => setCo2(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {/* VPD Display */}
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">VPD (Vapor Pressure Deficit)</p>
            <p className="text-4xl font-bold mb-1 {vpdStatus.color}">{vpd.toFixed(2)} kPa</p>
            <p className={`text-sm ${vpdStatus.color}`}>{vpdStatus.status}</p>
          </div>
          
          {/* Recommendations */}
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-300 mb-2">Recommendations:</p>
            <ul className="space-y-1 text-xs">
              {vpd < 0.4 && <li className="text-blue-400">• Decrease humidity or increase temperature</li>}
              {vpd > 1.6 && <li className="text-red-400">• Increase humidity or decrease temperature</li>}
              {co2 < 600 && <li className="text-yellow-400">• Consider CO2 supplementation</li>}
              {co2 > 1200 && <li className="text-orange-400">• Reduce CO2 to save costs</li>}
              {temp > 82 && <li className="text-red-400">• Temperature too high for most crops</li>}
              {temp < 65 && <li className="text-blue-400">• Temperature may slow growth</li>}
            </ul>
          </div>
          
          {/* Growth Stage Tips */}
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-300 mb-2">Optimal Ranges:</p>
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-gray-400">Vegetative:</p>
                <p className="text-gray-300">VPD: 0.8-1.2 kPa, CO2: 800-1200 ppm</p>
              </div>
              <div>
                <p className="text-gray-400">Flowering:</p>
                <p className="text-gray-300">VPD: 1.0-1.5 kPa, CO2: 800-1000 ppm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LiveCollaborationDemo = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'You', color: 'bg-green-500', x: 50, y: 50 },
    { id: 2, name: 'John D.', color: 'bg-blue-500', x: 150, y: 100 },
    { id: 3, name: 'Sarah M.', color: 'bg-purple-500', x: 250, y: 75 }
  ]);
  const [messages, setMessages] = useState([
    { user: 'John D.', message: 'What if we increase the canopy PPFD here?', time: '2 min ago' },
    { user: 'Sarah M.', message: 'Good idea! Let me adjust the fixture spacing', time: '1 min ago' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Live Collaboration Demo</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Design Canvas */}
        <div>
          <div className="bg-gray-800 rounded-lg p-4 h-64 relative overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 gap-1 p-2">
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} className="bg-gray-700 rounded" />
              ))}
            </div>
            
            {/* User Cursors */}
            {users.map(user => (
              <div
                key={user.id}
                className="absolute transition-all duration-300"
                style={{ left: `${user.x}px`, top: `${user.y}px` }}
              >
                <div className={`w-3 h-3 ${user.color} rounded-full`} />
                <span className="text-xs text-white bg-gray-900 px-1 rounded ml-2">
                  {user.name}
                </span>
              </div>
            ))}
            
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">Live users:</span>
              <div className="flex -space-x-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    className={`w-6 h-6 ${user.color} rounded-full border-2 border-gray-800`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center gap-2">
              <Move className="w-4 h-4" />
              Move
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center gap-2">
              <Square className="w-4 h-4" />
              Add Fixture
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
        
        {/* Chat */}
        <div className="flex flex-col">
          <div className="bg-gray-800 rounded-lg p-4 flex-1 max-h-48 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{msg.user}</span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm"
            />
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
              Send
            </button>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center justify-center gap-2">
              <Video className="w-4 h-4" />
              Video
            </button>
            <button className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center justify-center gap-2">
              <Mic className="w-4 h-4" />
              Audio
            </button>
            <button className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<number | null>(null);
  const [activeInteractiveDemo, setActiveInteractiveDemo] = useState<'lighting' | 'roi' | 'environment' | 'collaboration' | null>(null);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/20 mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                VibeLux Platform Demos
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Explore our comprehensive cultivation platform with interactive demos 
                showcasing design, operations, analytics, and more.
              </p>
              
              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">Live Demos Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">No Sign-up Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Interactive Tours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Interactive Demo Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Live Interactive Demos */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Try It Live - No Sign-up Required</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <button
                  onClick={() => setActiveInteractiveDemo('lighting')}
                  className={`p-4 rounded-xl border transition-all ${
                    activeInteractiveDemo === 'lighting' 
                      ? 'bg-purple-600 border-purple-500 text-white' 
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <Lightbulb className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Lighting Calculator</p>
                  <p className="text-xs mt-1 opacity-80">PPFD & DLI</p>
                </button>
                
                <button
                  onClick={() => setActiveInteractiveDemo('roi')}
                  className={`p-4 rounded-xl border transition-all ${
                    activeInteractiveDemo === 'roi' 
                      ? 'bg-green-600 border-green-500 text-white' 
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">ROI Calculator</p>
                  <p className="text-xs mt-1 opacity-80">Energy & Yield</p>
                </button>
                
                <button
                  onClick={() => setActiveInteractiveDemo('environment')}
                  className={`p-4 rounded-xl border transition-all ${
                    activeInteractiveDemo === 'environment' 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <ThermometerIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Environment</p>
                  <p className="text-xs mt-1 opacity-80">VPD & Climate</p>
                </button>
                
                <button
                  onClick={() => setActiveInteractiveDemo('collaboration')}
                  className={`p-4 rounded-xl border transition-all ${
                    activeInteractiveDemo === 'collaboration' 
                      ? 'bg-pink-600 border-pink-500 text-white' 
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Collaboration</p>
                  <p className="text-xs mt-1 opacity-80">Live Design</p>
                </button>
              </div>
              
              {/* Active Demo Display */}
              {activeInteractiveDemo && (
                <div className="relative">
                  <button
                    onClick={() => setActiveInteractiveDemo(null)}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  {activeInteractiveDemo === 'lighting' && <InteractiveLightingDemo />}
                  {activeInteractiveDemo === 'roi' && <InteractiveROIDemo />}
                  {activeInteractiveDemo === 'environment' && <InteractiveEnvironmentDemo />}
                  {activeInteractiveDemo === 'collaboration' && <LiveCollaborationDemo />}
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-800 pt-12">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Explore More Features</h2>
              <div className="grid lg:grid-cols-3 gap-6">
            {demos.map((demo, index) => {
              const Icon = demo.icon;
              const isSelected = selectedDemo === index;
              
              return (
                <div
                  key={demo.href}
                  className={`group relative bg-gray-900/50 backdrop-blur-xl rounded-xl border transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => setSelectedDemo(isSelected ? null : index)}
                >
                  {demo.badge && (
                    <div className={`absolute -top-3 right-4 px-3 py-1 bg-${demo.color}-600 text-white text-xs font-semibold rounded-full`}>
                      {demo.badge}
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-${demo.color}-500/20 rounded-lg mb-4`}>
                      <Icon className={`w-6 h-6 text-${demo.color}-400`} />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {demo.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4">
                      {demo.description}
                    </p>
                    
                    {isSelected && (
                      <div className="mb-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-300">Key Features:</h4>
                        <ul className="space-y-1">
                          {demo.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                              <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <Link
                      href={demo.href}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isSelected
                          ? `bg-${demo.color}-600 hover:bg-${demo.color}-700 text-white`
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Play className="w-4 h-4" />
                      Try Demo
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          </div>
          
          {/* Demo Limitations Notice */}
          <div className="max-w-4xl mx-auto mt-12 mb-8">
            <div className="bg-yellow-900/20 rounded-xl border border-yellow-500/30 p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-300 mb-2">Demo Limitations</h3>
                  <p className="text-sm text-gray-400">
                    These demos provide a limited preview of VibeLux capabilities. Full platform access includes advanced features like 
                    AI predictions, multi-site management, compliance tools, and proprietary algorithms. 
                    <Link href="/contact" className="text-yellow-400 hover:text-yellow-300 ml-1">
                      Contact us for a complete demonstration.
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Start Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/30 p-8">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Ready to See More?
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg mb-3">
                    <Calculator className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Free Tools</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Try our basic calculators to plan your cultivation facility
                  </p>
                  <Link
                    href="/calculators"
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    Open Calculators →
                  </Link>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mb-3">
                    <Layers className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Quick Design</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Create a simple lighting layout with our basic designer
                  </p>
                  <Link
                    href="/designer"
                    className="text-green-400 hover:text-green-300 text-sm font-medium"
                  >
                    Try Designer →
                  </Link>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-3">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Full Platform</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Schedule a demo to see all features and capabilities
                  </p>
                  <Link
                    href="/contact"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Book Demo →
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Cultivation?
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of growers optimizing their operations with VibeLux
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                Get Started Free
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}