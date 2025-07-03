'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Sun,
  Lightbulb,
  Calculator,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Gauge,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Eye,
  Zap,
  DollarSign,
  Clock,
  Calendar,
  MapPin,
  Building,
  User,
  Settings,
  Layers,
  Grid3x3,
  Maximize2,
  Package,
  Ruler,
  Thermometer,
  Droplets,
  Wind,
  Share2,
  Printer,
  Mail,
  ChevronRight,
  ChevronDown,
  Award,
  ShieldCheck,
  Database,
  Beaker,
  Cannabis,
  Leaf,
  ArrowUp,
  ArrowDown,
  Hash,
  Percent,
  Camera,
  Video
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, ReferenceLine, ReferenceArea } from 'recharts';

interface ReportSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  expanded: boolean;
}

interface FacilityInfo {
  name: string;
  address: string;
  roomName: string;
  roomDimensions: { width: number; height: number; length: number };
  canopyArea: number;
  mountingHeight: number;
  targetPPFD: number;
  photoperiod: number;
  cultivationType: string;
}

interface LightingSystem {
  fixtures: FixtureDetails[];
  totalWattage: number;
  totalPPF: number;
  avgPPFD: number;
  uniformity: number;
  coverageArea: number;
  efficacy: number;
}

interface FixtureDetails {
  id: string;
  model: string;
  manufacturer: string;
  quantity: number;
  wattage: number;
  ppf: number;
  efficacy: number;
  spectrum: string;
  position: { x: number; y: number; z: number };
  beamAngle: number;
  lifetime: number;
  warranty: number;
}

interface PhotometricData {
  ppfdGrid: number[][];
  uniformityRatio: number;
  minPPFD: number;
  maxPPFD: number;
  avgPPFD: number;
  stdDeviation: number;
  cv: number; // Coefficient of variation
  dli: number;
  coverage: {
    above1000: number;
    above800: number;
    above600: number;
    below400: number;
  };
}

interface EnergyAnalysis {
  dailyConsumption: number;
  monthlyConsumption: number;
  yearlyConsumption: number;
  costPerDay: number;
  costPerMonth: number;
  costPerYear: number;
  electricityRate: number;
  demandCharge: number;
  carbonFootprint: number;
  energySavings: number;
}

interface ROIAnalysis {
  initialInvestment: number;
  annualSavings: number;
  paybackPeriod: number;
  tenYearSavings: number;
  roi: number;
  npv: number;
  irr: number;
}

export default function PhotometricCalculationReport() {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [includeSections, setIncludeSections] = useState({
    summary: true,
    facilityInfo: true,
    lightingSystem: true,
    photometrics: true,
    uniformity: true,
    energy: true,
    roi: true,
    compliance: true,
    recommendations: true,
    appendix: true
  });

  // Mock data for comprehensive report
  const facilityInfo: FacilityInfo = {
    name: 'Lange Family Farms',
    address: '1234 Cultivation Way, Denver, CO 80202',
    roomName: 'Flower Room 1',
    roomDimensions: { width: 40, height: 10, length: 60 },
    canopyArea: 1800, // sq ft
    mountingHeight: 6, // ft
    targetPPFD: 900,
    photoperiod: 12,
    cultivationType: 'Indoor Cannabis - Flowering Stage'
  };

  const lightingSystem: LightingSystem = {
    fixtures: [
      {
        id: '1',
        model: 'RAZR Modular RM-44-SL-BP8',
        manufacturer: 'Fluence',
        quantity: 48,
        wattage: 645,
        ppf: 1742,
        efficacy: 2.7,
        spectrum: 'Broad Spectrum R4',
        position: { x: 0, y: 6, z: 0 },
        beamAngle: 120,
        lifetime: 50000,
        warranty: 5
      }
    ],
    totalWattage: 30960,
    totalPPF: 83616,
    avgPPFD: 912,
    uniformity: 0.85,
    coverageArea: 1800,
    efficacy: 2.7
  };

  const photometricData: PhotometricData = {
    ppfdGrid: Array(10).fill(null).map(() => 
      Array(15).fill(null).map(() => 850 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 150)
    ),
    uniformityRatio: 0.85,
    minPPFD: 765,
    maxPPFD: 1045,
    avgPPFD: 912,
    stdDeviation: 68,
    cv: 7.5,
    dli: 39.3,
    coverage: {
      above1000: 15,
      above800: 82,
      above600: 98,
      below400: 0
    }
  };

  const energyAnalysis: EnergyAnalysis = {
    dailyConsumption: 371.5,
    monthlyConsumption: 11145,
    yearlyConsumption: 135582,
    costPerDay: 44.58,
    costPerMonth: 1337.40,
    costPerYear: 16269.84,
    electricityRate: 0.12,
    demandCharge: 15,
    carbonFootprint: 67.8, // tons CO2/year
    energySavings: 32 // % vs HPS
  };

  const roiAnalysis: ROIAnalysis = {
    initialInvestment: 65000,
    annualSavings: 12500,
    paybackPeriod: 5.2,
    tenYearSavings: 125000,
    roi: 192,
    npv: 78453,
    irr: 18.5
  };

  // Chart data
  const ppfdDistribution = [
    { range: '< 600', count: 0, percentage: 0 },
    { range: '600-700', count: 12, percentage: 2 },
    { range: '700-800', count: 98, percentage: 16 },
    { range: '800-900', count: 285, percentage: 48 },
    { range: '900-1000', count: 165, percentage: 28 },
    { range: '> 1000', count: 40, percentage: 6 }
  ];

  const uniformityMap = Array(10).fill(null).map((_, y) => 
    Array(15).fill(null).map((_, x) => ({
      x: x * 4,
      y: y * 4,
      value: photometricData.ppfdGrid[y][x]
    }))
  ).flat();

  const spectrumData = [
    { wavelength: 400, intensity: 15, label: 'UV-A' },
    { wavelength: 450, intensity: 85, label: 'Blue' },
    { wavelength: 500, intensity: 45, label: 'Green' },
    { wavelength: 550, intensity: 35, label: 'Yellow' },
    { wavelength: 600, intensity: 25, label: 'Orange' },
    { wavelength: 660, intensity: 95, label: 'Red' },
    { wavelength: 730, intensity: 65, label: 'Far-Red' }
  ];

  const energyComparison = [
    { technology: 'LED (Current)', power: 30.96, efficacy: 2.7, cost: 16270 },
    { technology: 'HPS', power: 48.0, efficacy: 1.7, cost: 25200 },
    { technology: 'CMH', power: 39.6, efficacy: 1.9, cost: 20790 },
    { technology: 'Fluorescent', power: 72.0, efficacy: 1.1, cost: 37800 }
  ];

  const dliTrend = Array(24).fill(null).map((_, hour) => ({
    hour,
    ppfd: hour >= 6 && hour < 18 ? 912 : 0,
    dli: hour >= 6 && hour < 18 ? (912 * (hour - 5) * 0.0036) : 0
  }));

  const qualityMetrics = [
    { metric: 'PPFD Uniformity', score: 85, benchmark: 80, status: 'excellent' },
    { metric: 'Energy Efficiency', score: 92, benchmark: 70, status: 'excellent' },
    { metric: 'Spectrum Quality', score: 88, benchmark: 85, status: 'good' },
    { metric: 'Coverage', score: 98, benchmark: 95, status: 'excellent' },
    { metric: 'DLI Target', score: 95, benchmark: 90, status: 'excellent' }
  ];

  const recommendations = [
    {
      priority: 'high',
      category: 'optimization',
      title: 'Adjust Corner Fixtures',
      description: 'Reduce corner fixture intensity by 10% to improve uniformity',
      impact: 'Increase uniformity from 85% to 92%',
      effort: 'low'
    },
    {
      priority: 'medium',
      category: 'efficiency',
      title: 'Implement Dimming Schedule',
      description: 'Use sunrise/sunset dimming to save 8% energy',
      impact: 'Save $1,300/year in electricity costs',
      effort: 'medium'
    },
    {
      priority: 'low',
      category: 'maintenance',
      title: 'Clean Fixture Lenses',
      description: 'Quarterly cleaning to maintain output',
      impact: 'Prevent 5% light loss over time',
      effort: 'low'
    }
  ];

  const generatePPFDHeatmap = () => {
    return (
      <div className="relative">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="x" 
              domain={[0, 60]}
              label={{ value: 'Length (ft)', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              domain={[0, 40]}
              label={{ value: 'Width (ft)', angle: -90, position: 'insideLeft' }}
            />
            <ZAxis type="number" dataKey="value" domain={[700, 1100]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="text-sm">Position: ({data.x}, {data.y}) ft</p>
                      <p className="text-sm font-medium">PPFD: {data.value} μmol/m²/s</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter
              name="PPFD"
              data={uniformityMap}
              fill={(data: any) => {
                const value = data.value;
                if (value >= 1000) return '#10B981';
                if (value >= 900) return '#34D399';
                if (value >= 800) return '#F59E0B';
                if (value >= 700) return '#FB923C';
                return '#EF4444';
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
        
        {/* Color Legend */}
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-xs">≥1000</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-400 rounded" />
            <span className="text-xs">900-999</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-xs">800-899</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-orange-400 rounded" />
            <span className="text-xs">700-799</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-xs">&lt;700</span>
          </div>
        </div>
      </div>
    );
  };

  const sections: ReportSection[] = [
    {
      id: 'summary',
      title: 'Executive Summary',
      icon: <FileText className="w-5 h-5" />,
      expanded: true,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-green-600" />
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">PPFD Target Achievement</h4>
              <p className="text-2xl font-bold text-green-600 mt-2">101.3%</p>
              <p className="text-sm text-gray-600">912 / 900 μmol/m²/s target</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Grid3x3 className="w-8 h-8 text-blue-600" />
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Uniformity Score</h4>
              <p className="text-2xl font-bold text-blue-600 mt-2">85%</p>
              <p className="text-sm text-gray-600">Min/Avg ratio</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-purple-600" />
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">System Efficacy</h4>
              <p className="text-2xl font-bold text-purple-600 mt-2">2.7 μmol/J</p>
              <p className="text-sm text-gray-600">Industry leading efficiency</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700">
              This photometric analysis confirms that the proposed lighting system for {facilityInfo.name}'s {facilityInfo.roomName} 
              exceeds all target specifications. The Fluence RAZR fixtures deliver an average PPFD of 912 μmol/m²/s with 85% uniformity 
              across the {facilityInfo.canopyArea.toLocaleString()} sq ft canopy area.
            </p>
            <p className="text-gray-700 mt-2">
              Key findings include exceptional energy efficiency at 2.7 μmol/J, projected annual energy savings of $8,930 compared to HPS, 
              and a 5.2-year ROI. The system provides optimal spectrum for flowering stage cultivation with enhanced red and far-red ratios.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'facility',
      title: 'Facility Information',
      icon: <Building className="w-5 h-5" />,
      expanded: true,
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Location Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Facility Name</span>
                <span className="font-medium">{facilityInfo.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Address</span>
                <span className="font-medium">{facilityInfo.address}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Room Designation</span>
                <span className="font-medium">{facilityInfo.roomName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Cultivation Type</span>
                <span className="font-medium">{facilityInfo.cultivationType}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Room Specifications</h4>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Dimensions (L × W × H)</span>
                <span className="font-medium">
                  {facilityInfo.roomDimensions.length} × {facilityInfo.roomDimensions.width} × {facilityInfo.roomDimensions.height} ft
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total Area</span>
                <span className="font-medium">
                  {(facilityInfo.roomDimensions.length * facilityInfo.roomDimensions.width).toLocaleString()} sq ft
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Canopy Area</span>
                <span className="font-medium">{facilityInfo.canopyArea.toLocaleString()} sq ft</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Mounting Height</span>
                <span className="font-medium">{facilityInfo.mountingHeight} ft above canopy</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'lighting',
      title: 'Lighting System Design',
      icon: <Lightbulb className="w-5 h-5" />,
      expanded: true,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Total Fixtures</h4>
              <p className="text-2xl font-bold text-gray-900">
                {lightingSystem.fixtures.reduce((sum, f) => sum + f.quantity, 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {lightingSystem.fixtures[0].model}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Total Power</h4>
              <p className="text-2xl font-bold text-gray-900">
                {(lightingSystem.totalWattage / 1000).toFixed(1)} kW
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {(lightingSystem.totalWattage / facilityInfo.canopyArea).toFixed(1)} W/sq ft
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Total PPF Output</h4>
              <p className="text-2xl font-bold text-gray-900">
                {(lightingSystem.totalPPF / 1000).toFixed(1)}K
              </p>
              <p className="text-sm text-gray-600 mt-1">
                μmol/s total output
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Fixture Specifications</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Power</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PPF</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficacy</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spectrum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lifetime</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lightingSystem.fixtures.map(fixture => (
                    <tr key={fixture.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{fixture.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{fixture.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{fixture.wattage}W</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{fixture.ppf} μmol/s</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{fixture.efficacy} μmol/J</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{fixture.spectrum}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{fixture.lifetime.toLocaleString()} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Spectrum Analysis</h4>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={spectrumData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="wavelength" label={{ value: 'Wavelength (nm)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Relative Intensity (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="intensity" fill="#6366F1" />
                <ReferenceLine x={450} stroke="#3B82F6" strokeDasharray="5 5" label="Blue Peak" />
                <ReferenceLine x={660} stroke="#EF4444" strokeDasharray="5 5" label="Red Peak" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    },
    {
      id: 'photometrics',
      title: 'Photometric Analysis',
      icon: <Sun className="w-5 h-5" />,
      expanded: true,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Average PPFD</p>
              <p className="text-2xl font-bold text-gray-900">{photometricData.avgPPFD}</p>
              <p className="text-xs text-gray-500">μmol/m²/s</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Maximum PPFD</p>
              <p className="text-2xl font-bold text-gray-900">{photometricData.maxPPFD}</p>
              <p className="text-xs text-gray-500">μmol/m²/s</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Minimum PPFD</p>
              <p className="text-2xl font-bold text-gray-900">{photometricData.minPPFD}</p>
              <p className="text-xs text-gray-500">μmol/m²/s</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Daily Light Integral</p>
              <p className="text-2xl font-bold text-gray-900">{photometricData.dli.toFixed(1)}</p>
              <p className="text-xs text-gray-500">mol/m²/day</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">PPFD Distribution Heatmap</h4>
            {generatePPFDHeatmap()}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">PPFD Distribution Analysis</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ppfdDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#6366F1" name="Coverage %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Coverage Statistics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <span className="text-sm font-medium text-gray-700">Above 1000 μmol/m²/s</span>
                  <span className="text-lg font-bold text-green-600">{photometricData.coverage.above1000}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                  <span className="text-sm font-medium text-gray-700">Above 800 μmol/m²/s</span>
                  <span className="text-lg font-bold text-blue-600">{photometricData.coverage.above800}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                  <span className="text-sm font-medium text-gray-700">Above 600 μmol/m²/s</span>
                  <span className="text-lg font-bold text-yellow-600">{photometricData.coverage.above600}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">Below 400 μmol/m²/s</span>
                  <span className="text-lg font-bold text-gray-600">{photometricData.coverage.below400}%</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">DLI Accumulation Over 24 Hours</h4>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={dliTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} />
                <YAxis yAxisId="ppfd" label={{ value: 'PPFD (μmol/m²/s)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="dli" orientation="right" label={{ value: 'Cumulative DLI (mol/m²)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Area yAxisId="ppfd" type="stepAfter" dataKey="ppfd" fill="#6366F1" fillOpacity={0.3} stroke="#6366F1" name="PPFD" />
                <Line yAxisId="dli" type="monotone" dataKey="dli" stroke="#10B981" strokeWidth={2} name="DLI" />
                <ReferenceLine yAxisId="dli" y={39.3} stroke="#EF4444" strokeDasharray="5 5" label="Target DLI" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    },
    {
      id: 'uniformity',
      title: 'Uniformity Analysis',
      icon: <Grid3x3 className="w-5 h-5" />,
      expanded: true,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
              <Gauge className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900">Uniformity Ratio</h4>
              <p className="text-3xl font-bold text-blue-600 mt-2">{(photometricData.uniformityRatio * 100).toFixed(0)}%</p>
              <p className="text-sm text-gray-600 mt-1">Min/Avg PPFD</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
              <Activity className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900">Coefficient of Variation</h4>
              <p className="text-3xl font-bold text-green-600 mt-2">{photometricData.cv.toFixed(1)}%</p>
              <p className="text-sm text-gray-600 mt-1">Lower is better</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center">
              <Target className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900">Standard Deviation</h4>
              <p className="text-3xl font-bold text-purple-600 mt-2">±{photometricData.stdDeviation}</p>
              <p className="text-sm text-gray-600 mt-1">μmol/m²/s</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Uniformity Compliance</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">DLC Horticultural Standard (≥ 0.8)</span>
                </div>
                <span className="text-green-600 font-bold">PASS</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">ASABE Standard (CV ≤ 10%)</span>
                </div>
                <span className="text-green-600 font-bold">PASS</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Industry Best Practice (≥ 0.85)</span>
                </div>
                <span className="text-green-600 font-bold">PASS</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">3D Uniformity Visualization</h4>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">3D visualization showing light cone overlap and intensity gradients</p>
              <p className="text-sm text-gray-500 mt-2">Interactive 3D model available in digital version</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'energy',
      title: 'Energy Analysis',
      icon: <Zap className="w-5 h-5" />,
      expanded: true,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Daily Consumption</h4>
              <p className="text-2xl font-bold text-gray-900">{energyAnalysis.dailyConsumption.toFixed(1)} kWh</p>
              <p className="text-sm text-gray-600 mt-1">${energyAnalysis.costPerDay.toFixed(2)}/day</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Monthly Consumption</h4>
              <p className="text-2xl font-bold text-gray-900">{(energyAnalysis.monthlyConsumption / 1000).toFixed(1)} MWh</p>
              <p className="text-sm text-gray-600 mt-1">${energyAnalysis.costPerMonth.toFixed(0)}/month</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Annual Consumption</h4>
              <p className="text-2xl font-bold text-gray-900">{(energyAnalysis.yearlyConsumption / 1000).toFixed(1)} MWh</p>
              <p className="text-sm text-gray-600 mt-1">${energyAnalysis.costPerYear.toFixed(0)}/year</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Technology Comparison</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={energyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="technology" />
                <YAxis yAxisId="power" label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="cost" orientation="right" label={{ value: 'Annual Cost ($)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Bar yAxisId="power" dataKey="power" fill="#6366F1" name="Power Draw" />
                <Line yAxisId="cost" type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={2} name="Annual Cost" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Energy Savings vs HPS</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Power Reduction</span>
                  <span className="font-bold text-green-600">35.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual kWh Saved</span>
                  <span className="font-bold">74,400 kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Cost Savings</span>
                  <span className="font-bold text-green-600">$8,930</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CO₂ Reduction</span>
                  <span className="font-bold">37.2 tons/year</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Utility Rate Structure</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Energy Rate</span>
                  <span className="font-bold">${energyAnalysis.electricityRate}/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Demand Charge</span>
                  <span className="font-bold">${energyAnalysis.demandCharge}/kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time-of-Use</span>
                  <span className="font-bold">Not Applied</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Power Factor</span>
                  <span className="font-bold">0.95</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'roi',
      title: 'Return on Investment',
      icon: <DollarSign className="w-5 h-5" />,
      expanded: true,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Initial Investment</p>
              <p className="text-2xl font-bold text-gray-900">${(roiAnalysis.initialInvestment / 1000).toFixed(0)}K</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Payback Period</p>
              <p className="text-2xl font-bold text-green-600">{roiAnalysis.paybackPeriod} years</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">10-Year ROI</p>
              <p className="text-2xl font-bold text-blue-600">{roiAnalysis.roi}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Net Present Value</p>
              <p className="text-2xl font-bold text-purple-600">${(roiAnalysis.npv / 1000).toFixed(0)}K</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Cumulative Savings Over Time</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={Array(11).fill(null).map((_, year) => ({
                year,
                savings: year * roiAnalysis.annualSavings,
                investment: year === 0 ? roiAnalysis.initialInvestment : 0,
                net: year * roiAnalysis.annualSavings - roiAnalysis.initialInvestment
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="savings" stackId="1" stroke="#10B981" fill="#10B981" name="Cumulative Savings" />
                <Area type="monotone" dataKey="investment" stackId="2" stroke="#EF4444" fill="#EF4444" name="Initial Investment" />
                <Line type="monotone" dataKey="net" stroke="#6366F1" strokeWidth={2} name="Net Position" />
                <ReferenceLine y={0} stroke="#000" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Financial Benefits Summary</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Energy Cost Reduction</span>
                  <span className="font-bold">$8,930/year</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Maintenance Savings</span>
                  <span className="font-bold">$2,100/year</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">HVAC Savings</span>
                  <span className="font-bold">$1,470/year</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Utility Rebates</span>
                  <span className="font-bold">$8,500</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Tax Incentives</span>
                  <span className="font-bold">$6,500</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Carbon Credits</span>
                  <span className="font-bold">$745/year</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'compliance',
      title: 'Standards Compliance',
      icon: <ShieldCheck className="w-5 h-5" />,
      expanded: true,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Industry Standards</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>DLC Horticultural Qualified</span>
                  </div>
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>UL 8800 Safety Certified</span>
                  </div>
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>IP66 Wet Location Rated</span>
                  </div>
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>FCC Part 15 EMI Compliant</span>
                  </div>
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Performance Metrics</h4>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={qualityMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Actual" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} />
                  <Radar name="Benchmark" dataKey="benchmark" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Certifications & Warranties</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Award className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="font-medium">5-Year Warranty</p>
                <p className="text-sm text-gray-600">Full fixture coverage</p>
              </div>
              <div className="text-center">
                <ShieldCheck className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="font-medium">L90 @ 36,000 hrs</p>
                <p className="text-sm text-gray-600">Lumen maintenance</p>
              </div>
              <div className="text-center">
                <Database className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <p className="font-medium">3rd Party Tested</p>
                <p className="text-sm text-gray-600">Sphere & goniometer</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      icon: <Target className="w-5 h-5" />,
      expanded: true,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      rec.priority === 'high' ? 'bg-red-100' :
                      rec.priority === 'medium' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {rec.priority === 'high' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                       rec.priority === 'medium' ? <Info className="w-5 h-5 text-yellow-600" /> :
                       <Lightbulb className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {rec.priority} priority
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Impact</p>
                    <p className="text-sm font-medium">{rec.impact}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Effort</p>
                    <p className="text-sm font-medium capitalize">{rec.effort}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="text-sm font-medium capitalize">{rec.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Long-Term Optimization Plan</h4>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm">
                <span className="font-medium">Year 1:</span> 
                Implement spectral tuning for strain-specific optimization
              </p>
              <p className="flex items-center gap-2 text-sm">
                <span className="font-medium">Year 2:</span> 
                Add UV supplementation for enhanced terpene production
              </p>
              <p className="flex items-center gap-2 text-sm">
                <span className="font-medium">Year 3:</span> 
                Integrate AI-based predictive control system
              </p>
              <p className="flex items-center gap-2 text-sm">
                <span className="font-medium">Year 5:</span> 
                Upgrade to next-generation fixtures (projected 3.5+ μmol/J)
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    sections.reduce((acc, section) => ({ ...acc, [section.id]: section.expanded }), {})
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleExport = () => {
    // Export logic here
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Photometric Calculation Report</h1>
            <p className="text-blue-100 text-lg">Comprehensive Lighting Analysis & Design Validation</p>
            <div className="mt-4 space-y-1">
              <p className="text-sm text-blue-100">Prepared for: {facilityInfo.name}</p>
              <p className="text-sm text-blue-100">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-sm text-blue-100">Report ID: LFF-2024-001</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="px-3 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-white/20 rounded hover:bg-white/30">
                <Printer className="w-4 h-4" />
              </button>
              <button className="p-2 bg-white/20 rounded hover:bg-white/30">
                <Mail className="w-4 h-4" />
              </button>
              <button className="p-2 bg-white/20 rounded hover:bg-white/30">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">PPFD Average</p>
              <p className="text-2xl font-bold text-gray-900">{photometricData.avgPPFD}</p>
            </div>
            <Sun className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uniformity</p>
              <p className="text-2xl font-bold text-gray-900">{(photometricData.uniformityRatio * 100).toFixed(0)}%</p>
            </div>
            <Grid3x3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Efficacy</p>
              <p className="text-2xl font-bold text-gray-900">{lightingSystem.efficacy} μmol/J</p>
            </div>
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Annual Cost</p>
              <p className="text-2xl font-bold text-gray-900">${(energyAnalysis.costPerYear / 1000).toFixed(1)}K</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ROI Period</p>
              <p className="text-2xl font-bold text-gray-900">{roiAnalysis.paybackPeriod} yrs</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Report Sections */}
      <div className="space-y-4">
        {sections.map(section => (
          <div key={section.id} className="bg-white rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
              {expandedSections[section.id] ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedSections[section.id] && (
              <div className="px-6 pb-6">
                <div className="border-t pt-6">
                  {section.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report Footer */}
      <div className="bg-gray-100 rounded-lg p-6 text-center text-sm text-gray-600">
        <p className="mb-2">
          This report was generated using Vibelux Professional Lighting Design Software v2.0
        </p>
        <p>
          All calculations conform to IES LM-79, LM-80, and DLC Horticultural Lighting standards
        </p>
        <p className="mt-4 font-medium">
          © 2024 Vibelux. Confidential and Proprietary.
        </p>
      </div>
    </div>
  );
}