'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Thermometer, 
  Sun, 
  Droplets,
  Target,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  Settings,
  FileText,
  ChevronRight,
  Layers,
  Activity,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Download,
  Upload,
  Plus,
  Edit3,
  Copy,
  Trash2,
  Eye,
  Calculator,
  MapPin,
  Truck,
  Factory,
  Leaf,
  Zap,
  Wind,
  Shield,
  Bell,
  Filter,
  Search,
  RefreshCw,
  Save,
  Share,
  AlertTriangle,
  Lightbulb,
  Calendar as CalendarIcon
} from 'lucide-react';

// Enhanced interfaces for comprehensive production planning
interface ResourceRequirement {
  id: string;
  name: string;
  type: 'labor' | 'material' | 'equipment' | 'energy' | 'water' | 'nutrients';
  unit: string;
  quantity: number;
  costPerUnit: number;
  supplier?: string;
  leadTime: number;
  critical: boolean;
  scheduledDate: Date;
  actualUsage?: number;
  variance?: number;
}

interface RiskAssessment {
  id: string;
  factor: string;
  category: 'environmental' | 'market' | 'technical' | 'supply' | 'regulatory';
  probability: number; // 0-100%
  impact: number; // 0-100%
  riskScore: number;
  mitigation: string;
  contingency: string;
  status: 'active' | 'mitigated' | 'occurred';
}

interface YieldProjection {
  week: number;
  phase: string;
  expectedYield: number; // kg/m²
  qualityDistribution: {
    gradeA: number;
    gradeB: number;
    gradeC: number;
    waste: number;
  };
  marketValue: number;
  confidence: number; // 0-100%
}

interface ProductionMetrics {
  totalCost: number;
  laborCost: number;
  materialCost: number;
  energyCost: number;
  projectedRevenue: number;
  profitMargin: number;
  roi: number;
  breakEvenWeek: number;
  carbonFootprint: number; // kg CO2 equivalent
  waterUsage: number; // liters
  energyEfficiency: number; // yield per kWh
}

interface ProductionCycle {
  id: string;
  name: string;
  cropType: string;
  area: number; // m²
  plantCount: number;
  startDate: Date;
  harvestDate: Date;
  status: 'planning' | 'seeding' | 'growing' | 'harvesting' | 'completed' | 'failed';
  currentWeek: number;
  progress: number; // 0-100%
  manager: string;
  metrics: ProductionMetrics;
  alerts: Alert[];
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  cycle?: string;
  task?: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
}

interface AdvancedTask {
  id: string;
  name: string;
  description: string;
  week: number;
  day?: number;
  duration: number; // hours
  category: 'seeding' | 'transplanting' | 'cultural' | 'environmental' | 'pest' | 'harvest' | 'packaging' | 'quality';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string[];
  dependencies: string[];
  resources: ResourceRequirement[];
  instructions: string;
  qualityChecks: string[];
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  photos?: string[];
  actualDuration?: number;
  issues?: string[];
}

interface EnvironmentalPreset {
  dayTemp: { min: number; max: number };
  nightTemp: { min: number; max: number };
  humidity: { min: number; max: number };
  co2: number;
  lightIntensity: number; // μmol/m²/s
  photoperiod: number;
  vpd: { min: number; max: number }; // kPa
  airflow: number; // m/s
  ph: { min: number; max: number };
  ec: { min: number; max: number }; // mS/cm
}

interface QualityStandards {
  height: { min: number; max: number; optimal: number };
  diameter?: { min: number; max: number; optimal: number };
  color: string[];
  firmness?: { min: number; max: number };
  brix?: { min: number; max: number };
  weight?: { min: number; max: number }; // grams per unit
  shelfLife: number; // days
  defectTolerance: number; // % acceptable defects
}

interface CropTemplate {
  id: string;
  name: string;
  variety: string;
  category: 'leafy-greens' | 'fruiting' | 'herbs' | 'flowers' | 'microgreens';
  duration: number; // weeks
  phases: ProductionPhase[];
  seedCost: number; // $ per 1000 seeds
  expectedYield: { min: number; max: number; average: number }; // kg/m²
  marketPrice: number; // $/kg
  seasonality: number[]; // multiplier by month
  riskLevel: 'low' | 'medium' | 'high';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  climateZones: string[];
  certifications: string[];
  sustainabilityMetrics: {
    waterEfficiency: number; // L/kg
    energyIntensity: number; // kWh/kg
    carbonFootprint: number; // kg CO2/kg
    biodegradablePackaging: boolean;
  };
}

interface ProductionPhase {
  id: string;
  name: string;
  description: string;
  weekStart: number;
  weekEnd: number;
  keyMilestones: string[];
  tasks: AdvancedTask[];
  environment: EnvironmentalPreset;
  quality: QualityStandards;
  resources: ResourceRequirement[];
  risks: RiskAssessment[];
  yieldProjections: YieldProjection[];
  successCriteria: string[];
  troubleshooting: { issue: string; solution: string }[];
}

export function EnhancedProductionPlanner() {
  // State management
  const [activeView, setActiveView] = useState<'dashboard' | 'cycles' | 'calendar' | 'resources' | 'analytics' | 'reports'>('dashboard');
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('tomato-greenhouse');
  const [productionCycles, setProductionCycles] = useState<ProductionCycle[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateCycle, setShowCreateCycle] = useState(false);
  const [teamMembers] = useState(['Alex Chen', 'Sarah Williams', 'Mike Rodriguez', 'Lisa Zhang', 'Tom Anderson']);
  const [facilitySettings, setFacilitySettings] = useState({
    totalArea: 5000, // m²
    zones: 12,
    laborCostPerHour: 18,
    energyCostPerKwh: 0.14,
    waterCostPerLiter: 0.002,
    operatingHours: 16
  });

  // Comprehensive crop templates with real-world data
  const cropTemplates: Record<string, CropTemplate> = {
    'tomato-greenhouse': {
      id: 'tomato-greenhouse',
      name: 'Greenhouse Tomato - Beefsteak',
      variety: 'Big Beef',
      category: 'fruiting',
      duration: 26,
      seedCost: 0.45,
      expectedYield: { min: 35, max: 55, average: 45 },
      marketPrice: 8.50,
      seasonality: [1.2, 1.3, 1.1, 0.9, 0.8, 0.7, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2],
      riskLevel: 'medium',
      difficultyLevel: 'intermediate',
      climateZones: ['temperate', 'subtropical'],
      certifications: ['Organic', 'GAP', 'USDA'],
      sustainabilityMetrics: {
        waterEfficiency: 28,
        energyIntensity: 12,
        carbonFootprint: 1.8,
        biodegradablePackaging: true
      },
      phases: [
        {
          id: 'propagation',
          name: 'Seed & Propagation',
          description: 'Germination and early seedling development in controlled environment',
          weekStart: 1,
          weekEnd: 4,
          keyMilestones: ['Germination (7 days)', 'First true leaves (14 days)', 'Transplant ready (28 days)'],
          environment: {
            dayTemp: { min: 22, max: 25 },
            nightTemp: { min: 18, max: 20 },
            humidity: { min: 75, max: 85 },
            co2: 800,
            lightIntensity: 300,
            photoperiod: 16,
            vpd: { min: 0.4, max: 0.7 },
            airflow: 0.2,
            ph: { min: 5.8, max: 6.2 },
            ec: { min: 1.2, max: 1.6 }
          },
          quality: {
            height: { min: 8, max: 15, optimal: 12 },
            color: ['Green', 'Uniform'],
            weight: { min: 0.5, max: 2.0 },
            shelfLife: 30,
            defectTolerance: 5
          },
          tasks: [
            {
              id: 'seed-prep',
              name: 'Seed Preparation & Sowing',
              description: 'Prepare germination medium and sow seeds with proper spacing',
              week: 1,
              day: 1,
              duration: 4,
              category: 'seeding',
              priority: 'critical',
              assignedTo: ['Alex Chen'],
              dependencies: [],
              instructions: 'Use sterile germination medium, maintain 24°C soil temperature, ensure even moisture',
              qualityChecks: ['Seed viability test', 'Medium pH check', 'Temperature verification'],
              completed: false,
              resources: [],
              issues: []
            }
          ],
          resources: [
            {
              id: 'seeds',
              name: 'Tomato Seeds - Big Beef',
              type: 'material',
              unit: 'seeds',
              quantity: 1200,
              costPerUnit: 0.45,
              leadTime: 7,
              critical: true,
              scheduledDate: new Date(),
              supplier: 'Johnny Seeds'
            }
          ],
          risks: [
            {
              id: 'germ-fail',
              factor: 'Poor germination rate',
              category: 'technical',
              probability: 15,
              impact: 80,
              riskScore: 12,
              mitigation: 'Use certified seeds, control temperature precisely',
              contingency: 'Re-seed immediately, maintain backup seed stock',
              status: 'active'
            }
          ],
          yieldProjections: [],
          successCriteria: ['>90% germination rate', 'Uniform growth', 'No pest issues'],
          troubleshooting: [
            { issue: 'Low germination', solution: 'Check seed age, temperature, and moisture levels' },
            { issue: 'Damping off', solution: 'Improve air circulation, reduce humidity, use fungicide' }
          ]
        }
      ]
    },
    'lettuce-nft': {
      id: 'lettuce-nft',
      name: 'NFT Lettuce - Buttercrunch',
      variety: 'Buttercrunch',
      category: 'leafy-greens',
      duration: 6,
      seedCost: 0.12,
      expectedYield: { min: 12, max: 18, average: 15 },
      marketPrice: 4.50,
      seasonality: [0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.0],
      riskLevel: 'low',
      difficultyLevel: 'beginner',
      climateZones: ['temperate', 'cool'],
      certifications: ['Organic', 'Hydroponic'],
      sustainabilityMetrics: {
        waterEfficiency: 15,
        energyIntensity: 8,
        carbonFootprint: 0.8,
        biodegradablePackaging: true
      },
      phases: []
    },
    'basil-dwc': {
      id: 'basil-dwc',
      name: 'DWC Basil - Genovese',
      variety: 'Genovese',
      category: 'herbs',
      duration: 8,
      seedCost: 0.08,
      expectedYield: { min: 8, max: 14, average: 11 },
      marketPrice: 12.00,
      seasonality: [1.1, 1.2, 1.3, 1.2, 1.0, 0.9, 0.8, 0.8, 0.9, 1.0, 1.1, 1.2],
      riskLevel: 'low',
      difficultyLevel: 'beginner',
      climateZones: ['temperate', 'warm'],
      certifications: ['Organic'],
      sustainabilityMetrics: {
        waterEfficiency: 12,
        energyIntensity: 6,
        carbonFootprint: 0.6,
        biodegradablePackaging: true
      },
      phases: []
    }
  };

  // Initialize with sample data
  useEffect(() => {
    // Sample production cycles
    setProductionCycles([
      {
        id: 'cycle-1',
        name: 'Zone A - Tomatoes Q1',
        cropType: 'tomato-greenhouse',
        area: 400,
        plantCount: 800,
        startDate: new Date(2024, 0, 15),
        harvestDate: new Date(2024, 6, 15),
        status: 'growing',
        currentWeek: 8,
        progress: 35,
        manager: 'Alex Chen',
        metrics: {
          totalCost: 12500,
          laborCost: 4800,
          materialCost: 3200,
          energyCost: 2800,
          projectedRevenue: 28000,
          profitMargin: 55,
          roi: 124,
          breakEvenWeek: 12,
          carbonFootprint: 450,
          waterUsage: 15600,
          energyEfficiency: 3.2
        },
        alerts: []
      },
      {
        id: 'cycle-2',
        name: 'Zone B - Lettuce Rotation 1',
        cropType: 'lettuce-nft',
        area: 200,
        plantCount: 3200,
        startDate: new Date(2024, 1, 1),
        harvestDate: new Date(2024, 2, 15),
        status: 'completed',
        currentWeek: 6,
        progress: 100,
        manager: 'Sarah Williams',
        metrics: {
          totalCost: 3200,
          laborCost: 1200,
          materialCost: 800,
          energyCost: 600,
          projectedRevenue: 7200,
          profitMargin: 56,
          roi: 125,
          breakEvenWeek: 4,
          carbonFootprint: 120,
          waterUsage: 4800,
          energyEfficiency: 4.5
        },
        alerts: []
      }
    ]);

    // Sample alerts
    setAlerts([
      {
        id: 'alert-1',
        type: 'warning',
        title: 'Nutrient Level Low',
        message: 'Zone A reservoir EC below target range. Immediate attention required.',
        cycle: 'cycle-1',
        timestamp: new Date(),
        acknowledged: false,
        actionRequired: true
      },
      {
        id: 'alert-2',
        type: 'info',
        title: 'Harvest Window Opening',
        message: 'Zone B lettuce entering optimal harvest window in 3 days.',
        cycle: 'cycle-2',
        timestamp: new Date(),
        acknowledged: false,
        actionRequired: false
      }
    ]);
  }, []);

  const calculateFacilityMetrics = () => {
    const activeCycles = productionCycles.filter(c => c.status !== 'completed');
    const totalActiveArea = activeCycles.reduce((sum, c) => sum + c.area, 0);
    const utilization = (totalActiveArea / facilitySettings.totalArea) * 100;
    const totalRevenue = productionCycles.reduce((sum, c) => sum + c.metrics.projectedRevenue, 0);
    const totalCost = productionCycles.reduce((sum, c) => sum + c.metrics.totalCost, 0);
    const avgProfitMargin = productionCycles.length > 0 
      ? productionCycles.reduce((sum, c) => sum + c.metrics.profitMargin, 0) / productionCycles.length 
      : 0;

    return {
      utilization,
      totalRevenue,
      totalCost,
      netProfit: totalRevenue - totalCost,
      avgProfitMargin,
      activeCycles: activeCycles.length,
      totalCycles: productionCycles.length
    };
  };

  const facilityMetrics = calculateFacilityMetrics();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Enhanced Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20 mb-4">
          <Factory className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Advanced Production Management
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl mx-auto">
          Enterprise-grade production planning with resource optimization, risk management, and predictive analytics
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-1 border border-gray-800">
        <div className="flex space-x-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'cycles', label: 'Production Cycles', icon: Factory },
            { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
            { id: 'resources', label: 'Resources', icon: Package },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeView === tab.id 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alert Banner */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/30 to-red-900/30 backdrop-blur-xl rounded-xl p-4 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <span className="text-white font-medium">
                {alerts.filter(a => !a.acknowledged).length} active alerts requiring attention
              </span>
            </div>
            <button className="text-amber-400 hover:text-amber-300 text-sm">
              View All
            </button>
          </div>
        </div>
      )}

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Factory className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400 text-sm">Facility Utilization</span>
              </div>
              <p className="text-2xl font-bold text-white">{facilityMetrics.utilization.toFixed(0)}%</p>
              <p className="text-emerald-400 text-sm">
                {facilityMetrics.activeCycles} active cycles
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Revenue (YTD)</span>
              </div>
              <p className="text-2xl font-bold text-white">${(facilityMetrics.totalRevenue/1000).toFixed(0)}k</p>
              <p className="text-green-400 text-sm">
                {facilityMetrics.avgProfitMargin.toFixed(0)}% avg margin
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Net Profit</span>
              </div>
              <p className="text-2xl font-bold text-white">${(facilityMetrics.netProfit/1000).toFixed(0)}k</p>
              <p className="text-blue-400 text-sm">
                {((facilityMetrics.netProfit/facilityMetrics.totalRevenue)*100).toFixed(0)}% margin
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Team Members</span>
              </div>
              <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
              <p className="text-purple-400 text-sm">Active staff</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Sustainability</span>
              </div>
              <p className="text-2xl font-bold text-white">A+</p>
              <p className="text-green-400 text-sm">Carbon neutral</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-gray-400 text-sm">Risk Level</span>
              </div>
              <p className="text-2xl font-bold text-white">Low</p>
              <p className="text-amber-400 text-sm">2 monitoring</p>
            </div>
          </div>

          {/* Active Production Cycles */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Active Production Cycles</h3>
              <button
                onClick={() => setShowCreateCycle(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Cycle
              </button>
            </div>

            <div className="grid gap-4">
              {productionCycles.filter(c => c.status !== 'completed').map(cycle => (
                <div
                  key={cycle.id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedCycle(cycle.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white text-lg">{cycle.name}</h4>
                      <p className="text-gray-400">
                        {cropTemplates[cycle.cropType]?.name} • {cycle.area}m² • {cycle.plantCount.toLocaleString()} plants
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      cycle.status === 'growing' ? 'bg-emerald-500/20 text-emerald-400' :
                      cycle.status === 'seeding' ? 'bg-blue-500/20 text-blue-400' :
                      cycle.status === 'harvesting' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${cycle.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-white">{cycle.progress}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Week</p>
                      <p className="text-lg font-semibold text-white">{cycle.currentWeek}/{cropTemplates[cycle.cropType]?.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Projected Profit</p>
                      <p className="text-lg font-semibold text-green-400">
                        ${(cycle.metrics.projectedRevenue - cycle.metrics.totalCost).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Manager</p>
                      <p className="text-lg font-semibold text-white">{cycle.manager}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Started: {cycle.startDate.toLocaleDateString()}</span>
                    <span>Harvest: {cycle.harvestDate.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional views would be implemented here for cycles, calendar, resources, analytics, and reports */}
      {activeView !== 'dashboard' && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 border border-gray-800 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gray-800 rounded-xl mb-4">
            <Lightbulb className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {activeView.charAt(0).toUpperCase() + activeView.slice(1)} View Coming Soon
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            This advanced view is being developed with comprehensive features for professional production management.
          </p>
        </div>
      )}
    </div>
  );
}