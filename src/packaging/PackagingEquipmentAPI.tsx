'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  Scale,
  Clock,
  Shield,
  Thermometer,
  Wind,
  Droplets,
  Leaf,
  BarChart3,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Save,
  Plus,
  Minus,
  ArrowRight,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  Target,
  Zap,
  Activity
} from 'lucide-react';

interface PackagingEquipment {
  id: string;
  name: string;
  type: 'washer' | 'dryer' | 'cutter' | 'bagger' | 'sealer' | 'labeler' | 'conveyor' | 'sorter';
  manufacturer: string;
  model: string;
  capacity: number; // lbs/hour
  power_consumption: number; // kW
  water_usage?: number; // gallons/hour
  air_usage?: number; // CFM
  status: 'online' | 'offline' | 'maintenance' | 'error';
  location: string;
  last_maintenance: Date;
  next_maintenance: Date;
  operating_hours: number;
  efficiency: number; // percentage
  throughput_current: number; // current lbs/hour
  temperature?: number; // °F
  humidity?: number; // %
  pressure?: number; // PSI
  speed?: number; // units/minute
}

interface ProcessingLine {
  id: string;
  name: string;
  crop_type: 'lettuce' | 'spinach' | 'kale' | 'arugula' | 'herbs' | 'microgreens';
  equipment_sequence: string[];
  target_throughput: number; // lbs/hour
  current_throughput: number;
  quality_score: number; // 0-100
  waste_percentage: number;
  energy_efficiency: number; // kWh/lb
  water_efficiency: number; // gal/lb
  status: 'running' | 'stopped' | 'setup' | 'maintenance';
  shift_data: {
    start_time: Date;
    operator: string;
    batches_processed: number;
    total_weight: number;
    defect_rate: number;
  };
}

interface QualityMetrics {
  visual_quality: number; // 0-100
  freshness_score: number; // 0-100
  contamination_risk: 'low' | 'medium' | 'high';
  shelf_life_estimate: number; // days
  temperature_compliance: boolean;
  packaging_integrity: number; // 0-100
  weight_variance: number; // percentage
  color_consistency: number; // 0-100
}

interface PackagingOrder {
  id: string;
  crop_type: string;
  quantity_ordered: number; // lbs
  quantity_processed: number; // lbs
  package_size: string; // e.g., "5oz", "1lb", "2lb"
  package_type: 'clamshell' | 'bag' | 'box' | 'bulk';
  customer: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: Date;
  quality_requirements: QualityMetrics;
  processing_line: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  estimated_completion: Date;
}

export function PackagingEquipmentAPI() {
  const [equipment, setEquipment] = useState<PackagingEquipment[]>([]);
  const [processingLines, setProcessingLines] = useState<ProcessingLine[]>([]);
  const [orders, setOrders] = useState<PackagingOrder[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<PackagingEquipment | null>(null);
  const [selectedLine, setSelectedLine] = useState<ProcessingLine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'equipment' | 'lines' | 'orders'>('equipment');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Simulate API data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEquipment(generateSampleEquipment());
      setProcessingLines(generateSampleProcessingLines());
      setOrders(generateSampleOrders());
      setLastUpdate(new Date());
      setIsLoading(false);
    };

    loadData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      updateEquipmentStatus();
      updateLineMetrics();
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const generateSampleEquipment = (): PackagingEquipment[] => [
    {
      id: 'wash-001',
      name: 'Triple Wash Station A',
      type: 'washer',
      manufacturer: 'AgroClean Systems',
      model: 'ACS-3000',
      capacity: 2000,
      power_consumption: 15.2,
      water_usage: 450,
      status: 'online',
      location: 'Wash Bay 1',
      last_maintenance: new Date('2024-05-15'),
      next_maintenance: new Date('2024-06-15'),
      operating_hours: 1247,
      efficiency: 94.2,
      throughput_current: 1850,
      temperature: 42,
      pressure: 35
    },
    {
      id: 'dry-001',
      name: 'Centrifugal Dryer A',
      type: 'dryer',
      manufacturer: 'VegeTech',
      model: 'VT-Spin-500',
      capacity: 1800,
      power_consumption: 22.5,
      air_usage: 850,
      status: 'online',
      location: 'Dry Station 1',
      last_maintenance: new Date('2024-05-20'),
      next_maintenance: new Date('2024-06-20'),
      operating_hours: 987,
      efficiency: 91.8,
      throughput_current: 1650,
      speed: 1200
    },
    {
      id: 'cut-001',
      name: 'Precision Cutter B',
      type: 'cutter',
      manufacturer: 'FreshCut Pro',
      model: 'FCP-Ultra-2000',
      capacity: 1500,
      power_consumption: 8.7,
      status: 'maintenance',
      location: 'Processing Line 2',
      last_maintenance: new Date('2024-06-01'),
      next_maintenance: new Date('2024-07-01'),
      operating_hours: 2156,
      efficiency: 88.5,
      throughput_current: 0,
      speed: 0
    },
    {
      id: 'bag-001',
      name: 'Auto Bagger Station C',
      type: 'bagger',
      manufacturer: 'PackMaster',
      model: 'PM-Auto-3000',
      capacity: 1200,
      power_consumption: 12.1,
      air_usage: 120,
      status: 'online',
      location: 'Packaging Line 3',
      last_maintenance: new Date('2024-05-10'),
      next_maintenance: new Date('2024-06-10'),
      operating_hours: 1654,
      efficiency: 96.7,
      throughput_current: 1150,
      speed: 85
    },
    {
      id: 'seal-001',
      name: 'Heat Sealer Alpha',
      type: 'sealer',
      manufacturer: 'SealTech',
      model: 'ST-Heat-Pro',
      capacity: 1000,
      power_consumption: 6.3,
      status: 'online',
      location: 'Packaging Line 1',
      last_maintenance: new Date('2024-05-25'),
      next_maintenance: new Date('2024-06-25'),
      operating_hours: 743,
      efficiency: 93.4,
      throughput_current: 950,
      temperature: 285,
      speed: 120
    },
    {
      id: 'sort-001',
      name: 'Optical Sorter Prime',
      type: 'sorter',
      manufacturer: 'VisionSort',
      model: 'VS-Optical-5000',
      capacity: 2500,
      power_consumption: 18.9,
      air_usage: 200,
      status: 'error',
      location: 'Quality Control',
      last_maintenance: new Date('2024-05-05'),
      next_maintenance: new Date('2024-06-05'),
      operating_hours: 2891,
      efficiency: 76.2,
      throughput_current: 0,
      speed: 0
    }
  ];

  const generateSampleProcessingLines = (): ProcessingLine[] => [
    {
      id: 'line-lettuce',
      name: 'Lettuce Processing Line',
      crop_type: 'lettuce',
      equipment_sequence: ['wash-001', 'dry-001', 'cut-001', 'bag-001', 'seal-001'],
      target_throughput: 1000,
      current_throughput: 875,
      quality_score: 92,
      waste_percentage: 4.2,
      energy_efficiency: 0.045,
      water_efficiency: 0.25,
      status: 'running',
      shift_data: {
        start_time: new Date(Date.now() - 4 * 60 * 60 * 1000),
        operator: 'Maria Rodriguez',
        batches_processed: 12,
        total_weight: 10500,
        defect_rate: 2.1
      }
    },
    {
      id: 'line-spinach',
      name: 'Spinach Processing Line',
      crop_type: 'spinach',
      equipment_sequence: ['wash-001', 'dry-001', 'sort-001', 'bag-001'],
      target_throughput: 800,
      current_throughput: 0,
      quality_score: 88,
      waste_percentage: 6.1,
      energy_efficiency: 0.052,
      water_efficiency: 0.28,
      status: 'stopped',
      shift_data: {
        start_time: new Date(Date.now() - 6 * 60 * 60 * 1000),
        operator: 'James Chen',
        batches_processed: 8,
        total_weight: 6400,
        defect_rate: 3.7
      }
    },
    {
      id: 'line-herbs',
      name: 'Herbs Processing Line',
      crop_type: 'herbs',
      equipment_sequence: ['wash-001', 'dry-001', 'bag-001', 'seal-001'],
      target_throughput: 400,
      current_throughput: 380,
      quality_score: 95,
      waste_percentage: 2.8,
      energy_efficiency: 0.038,
      water_efficiency: 0.22,
      status: 'running',
      shift_data: {
        start_time: new Date(Date.now() - 3 * 60 * 60 * 1000),
        operator: 'Sarah Kim',
        batches_processed: 6,
        total_weight: 2280,
        defect_rate: 1.4
      }
    }
  ];

  const generateSampleOrders = (): PackagingOrder[] => [
    {
      id: 'order-001',
      crop_type: 'lettuce',
      quantity_ordered: 5000,
      quantity_processed: 3250,
      package_size: '5oz',
      package_type: 'clamshell',
      customer: 'FreshMart Retail',
      priority: 'high',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      quality_requirements: {
        visual_quality: 90,
        freshness_score: 95,
        contamination_risk: 'low',
        shelf_life_estimate: 14,
        temperature_compliance: true,
        packaging_integrity: 98,
        weight_variance: 2.5,
        color_consistency: 92
      },
      processing_line: 'line-lettuce',
      status: 'in_progress',
      estimated_completion: new Date(Date.now() + 6 * 60 * 60 * 1000)
    },
    {
      id: 'order-002',
      crop_type: 'spinach',
      quantity_ordered: 2000,
      quantity_processed: 0,
      package_size: '1lb',
      package_type: 'bag',
      customer: 'Organic Grocers',
      priority: 'medium',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      quality_requirements: {
        visual_quality: 85,
        freshness_score: 90,
        contamination_risk: 'low',
        shelf_life_estimate: 10,
        temperature_compliance: true,
        packaging_integrity: 95,
        weight_variance: 3.0,
        color_consistency: 88
      },
      processing_line: 'line-spinach',
      status: 'pending',
      estimated_completion: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'order-003',
      crop_type: 'herbs',
      quantity_ordered: 800,
      quantity_processed: 650,
      package_size: '2oz',
      package_type: 'clamshell',
      customer: 'Gourmet Kitchen Supply',
      priority: 'urgent',
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      quality_requirements: {
        visual_quality: 98,
        freshness_score: 98,
        contamination_risk: 'low',
        shelf_life_estimate: 7,
        temperature_compliance: true,
        packaging_integrity: 99,
        weight_variance: 1.5,
        color_consistency: 96
      },
      processing_line: 'line-herbs',
      status: 'in_progress',
      estimated_completion: new Date(Date.now() + 3 * 60 * 60 * 1000)
    }
  ];

  const updateEquipmentStatus = () => {
    setEquipment(prev => prev.map(eq => ({
      ...eq,
      throughput_current: eq.status === 'online' ? 
        eq.throughput_current + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 50 : 0,
      efficiency: eq.status === 'online' ? 
        Math.max(75, Math.min(100, eq.efficiency + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2)) : eq.efficiency,
      operating_hours: eq.status === 'online' ? eq.operating_hours + 0.003 : eq.operating_hours
    })));
  };

  const updateLineMetrics = () => {
    setProcessingLines(prev => prev.map(line => ({
      ...line,
      current_throughput: line.status === 'running' ? 
        Math.max(0, line.current_throughput + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 100) : 0,
      quality_score: line.status === 'running' ? 
        Math.max(80, Math.min(100, line.quality_score + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 3)) : line.quality_score
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'maintenance':
      case 'setup':
        return <Settings className="w-4 h-4 text-yellow-500" />;
      case 'error':
      case 'stopped':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'offline':
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
        return 'text-green-500';
      case 'maintenance':
      case 'setup':
        return 'text-yellow-500';
      case 'error':
      case 'stopped':
        return 'text-red-500';
      case 'offline':
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'washer': return <Droplets className="w-5 h-5 text-blue-500" />;
      case 'dryer': return <Wind className="w-5 h-5 text-orange-500" />;
      case 'cutter': return <Edit className="w-5 h-5 text-purple-500" />;
      case 'bagger': return <Package className="w-5 h-5 text-green-500" />;
      case 'sealer': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'labeler': return <Edit className="w-5 h-5 text-pink-500" />;
      case 'conveyor': return <ArrowRight className="w-5 h-5 text-gray-500" />;
      case 'sorter': return <Filter className="w-5 h-5 text-cyan-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredEquipment = equipment.filter(eq => 
    filterStatus === 'all' || eq.status === filterStatus
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading packaging systems...</p>
          <p className="text-gray-400">Connecting to equipment APIs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-400" />
              Packaging Equipment Management
            </h1>
            <p className="text-gray-400">Real-time monitoring and control of leafy greens processing equipment</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Last Updated</p>
              <p className="text-white font-medium">{lastUpdate.toLocaleTimeString()}</p>
            </div>
            
            <button
              onClick={() => {
                updateEquipmentStatus();
                updateLineMetrics();
                setLastUpdate(new Date());
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'equipment', label: 'Equipment Status', icon: Package },
            { id: 'lines', label: 'Processing Lines', icon: ArrowRight },
            { id: 'orders', label: 'Production Orders', icon: Calendar }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Equipment View */}
        {viewMode === 'equipment' && (
          <div className="space-y-6">
            {/* Status Filter */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Filter by status:</span>
              <div className="flex gap-2">
                {['all', 'online', 'offline', 'maintenance', 'error'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      filterStatus === status
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment Grid */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEquipment.map((eq) => (
                <div
                  key={eq.id}
                  className={`bg-gray-900 rounded-lg p-6 border transition-all cursor-pointer ${
                    selectedEquipment?.id === eq.id
                      ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => setSelectedEquipment(eq)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getEquipmentIcon(eq.type)}
                      <div>
                        <h3 className="text-white font-semibold">{eq.name}</h3>
                        <p className="text-gray-400 text-sm">{eq.manufacturer} {eq.model}</p>
                      </div>
                    </div>
                    {getStatusIcon(eq.status)}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Status</span>
                      <span className={`text-sm font-medium ${getStatusColor(eq.status)}`}>
                        {eq.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Throughput</span>
                      <span className="text-white font-medium">
                        {eq.throughput_current.toFixed(0)} / {eq.capacity} lbs/hr
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Efficiency</span>
                      <span className="text-white font-medium">{eq.efficiency.toFixed(1)}%</span>
                    </div>

                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          eq.efficiency >= 90 ? 'bg-green-500' :
                          eq.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${eq.efficiency}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-gray-400 text-xs">Power</p>
                        <p className="text-white text-sm font-medium">{eq.power_consumption} kW</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Hours</p>
                        <p className="text-white text-sm font-medium">{eq.operating_hours.toFixed(0)}h</p>
                      </div>
                    </div>

                    {eq.temperature && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-white text-sm">{eq.temperature}°F</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Lines View */}
        {viewMode === 'lines' && (
          <div className="space-y-6">
            {processingLines.map((line) => (
              <div
                key={line.id}
                className={`bg-gray-900 rounded-lg p-6 border transition-all ${
                  selectedLine?.id === line.id
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'border-gray-800'
                }`}
                onClick={() => setSelectedLine(line)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-green-500" />
                      {line.name}
                    </h3>
                    <p className="text-gray-400">Operator: {line.shift_data.operator}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(line.status)}
                    <span className={`text-sm font-medium ${getStatusColor(line.status)}`}>
                      {line.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Throughput</span>
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-white text-xl font-bold">
                      {line.current_throughput.toFixed(0)}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Target: {line.target_throughput} lbs/hr
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                      <div 
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${Math.min(100, (line.current_throughput / line.target_throughput) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Quality Score</span>
                      <Target className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-white text-xl font-bold">{line.quality_score}</p>
                    <p className="text-gray-400 text-xs">out of 100</p>
                    <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                      <div 
                        className="bg-green-500 h-1 rounded-full"
                        style={{ width: `${line.quality_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Waste %</span>
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    </div>
                    <p className="text-white text-xl font-bold">{line.waste_percentage.toFixed(1)}%</p>
                    <p className="text-gray-400 text-xs">Target: &lt;5%</p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Energy Eff.</span>
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-white text-xl font-bold">{line.energy_efficiency.toFixed(3)}</p>
                    <p className="text-gray-400 text-xs">kWh/lb</p>
                  </div>
                </div>

                {/* Equipment Sequence */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Equipment Sequence</h4>
                  <div className="flex items-center gap-2">
                    {line.equipment_sequence.map((equipId, index) => {
                      const eq = equipment.find(e => e.id === equipId);
                      if (!eq) return null;
                      
                      return (
                        <React.Fragment key={equipId}>
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg">
                            {getEquipmentIcon(eq.type)}
                            <span className="text-white text-sm">{eq.name.split(' ')[0]}</span>
                            {getStatusIcon(eq.status)}
                          </div>
                          {index < line.equipment_sequence.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-500" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders View */}
        {viewMode === 'orders' && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">Order #{order.id}</h3>
                    <p className="text-gray-400">{order.customer} • {order.crop_type} • {order.package_size}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.priority === 'urgent' ? 'bg-red-600 text-white' :
                      order.priority === 'high' ? 'bg-orange-600 text-white' :
                      order.priority === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {order.priority.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-600 text-white' :
                      order.status === 'in_progress' ? 'bg-blue-600 text-white' :
                      order.status === 'pending' ? 'bg-gray-600 text-white' :
                      'bg-yellow-600 text-white'
                    }`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(order.quantity_processed / order.quantity_ordered) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-medium">
                        {((order.quantity_processed / order.quantity_ordered) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {order.quantity_processed} / {order.quantity_ordered} lbs
                    </p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Due Date</p>
                    <p className="text-white font-medium">{order.due_date.toLocaleDateString()}</p>
                    <p className="text-gray-400 text-xs">
                      {Math.ceil((order.due_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                    </p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Package Type</p>
                    <p className="text-white font-medium">{order.package_type}</p>
                    <p className="text-gray-400 text-xs">{order.package_size}</p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Processing Line</p>
                    <p className="text-white font-medium">
                      {processingLines.find(l => l.id === order.processing_line)?.name || 'Unassigned'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      ETA: {order.estimated_completion.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Quality Requirements */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Quality Requirements</h4>
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400">Visual Quality</p>
                      <p className="text-white font-medium">{order.quality_requirements.visual_quality}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Freshness</p>
                      <p className="text-white font-medium">{order.quality_requirements.freshness_score}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Shelf Life</p>
                      <p className="text-white font-medium">{order.quality_requirements.shelf_life_estimate} days</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Weight Variance</p>
                      <p className="text-white font-medium">±{order.quality_requirements.weight_variance}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}