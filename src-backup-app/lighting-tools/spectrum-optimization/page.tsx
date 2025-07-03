'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Sun,
  Zap,
  Leaf,
  Target,
  Sparkles,
  Download,
  Upload,
  Settings,
  Info,
  TrendingUp,
  Activity,
  Lightbulb,
  Sliders,
  Eye,
  Palette,
  Search,
  Filter,
  Database,
  FileSpreadsheet,
  CheckCircle,
  Building
} from 'lucide-react';

// Spectrum data for different light types
const SPECTRUM_PROFILES = {
  sunlight: {
    name: 'Natural Sunlight',
    data: [
      { wavelength: 380, intensity: 42, color: '#8B00FF' },
      { wavelength: 400, intensity: 48, color: '#4B0082' },
      { wavelength: 450, intensity: 82, color: '#0000FF' },
      { wavelength: 500, intensity: 91, color: '#00FF00' },
      { wavelength: 550, intensity: 95, color: '#FFFF00' },
      { wavelength: 600, intensity: 89, color: '#FFA500' },
      { wavelength: 650, intensity: 85, color: '#FF0000' },
      { wavelength: 700, intensity: 81, color: '#8B0000' },
      { wavelength: 750, intensity: 76, color: '#4B0000' },
      { wavelength: 780, intensity: 72, color: '#2B0000' }
    ]
  },
  hps: {
    name: 'HPS (High Pressure Sodium)',
    data: [
      { wavelength: 380, intensity: 5, color: '#8B00FF' },
      { wavelength: 400, intensity: 8, color: '#4B0082' },
      { wavelength: 450, intensity: 12, color: '#0000FF' },
      { wavelength: 500, intensity: 18, color: '#00FF00' },
      { wavelength: 550, intensity: 85, color: '#FFFF00' },
      { wavelength: 600, intensity: 100, color: '#FFA500' },
      { wavelength: 650, intensity: 95, color: '#FF0000' },
      { wavelength: 700, intensity: 45, color: '#8B0000' },
      { wavelength: 750, intensity: 25, color: '#4B0000' },
      { wavelength: 780, intensity: 15, color: '#2B0000' }
    ]
  },
  led_full: {
    name: 'Full Spectrum LED',
    data: [
      { wavelength: 380, intensity: 15, color: '#8B00FF' },
      { wavelength: 400, intensity: 25, color: '#4B0082' },
      { wavelength: 450, intensity: 85, color: '#0000FF' },
      { wavelength: 500, intensity: 45, color: '#00FF00' },
      { wavelength: 550, intensity: 35, color: '#FFFF00' },
      { wavelength: 600, intensity: 40, color: '#FFA500' },
      { wavelength: 650, intensity: 95, color: '#FF0000' },
      { wavelength: 700, intensity: 25, color: '#8B0000' },
      { wavelength: 750, intensity: 85, color: '#4B0000' },
      { wavelength: 780, intensity: 15, color: '#2B0000' }
    ]
  }
};

// DLC Fixture Database (sample of 2000+ fixtures)
const DLC_FIXTURES = [
  {
    id: 'dlc-001',
    manufacturer: 'Fluence',
    brand: 'Fluence by OSRAM',
    model: 'SPYDR 2p',
    dlcListingDate: '2023-03-15',
    category: 'Horticulture',
    ppf: 1870,
    inputPower: 645,
    efficacy: 2.9,
    dimensions: '44" x 44" x 3"',
    spectrum: {
      uv: 2,
      blue: 14,
      green: 21,
      red: 42,
      farRed: 21
    },
    features: ['Dimmable', 'IP66', 'Passive Cooling'],
    warranty: 5,
    price: 1299
  },
  {
    id: 'dlc-002',
    manufacturer: 'Gavita',
    brand: 'Gavita',
    model: 'Pro 1700e LED ML',
    dlcListingDate: '2023-02-20',
    category: 'Horticulture',
    ppf: 1700,
    inputPower: 645,
    efficacy: 2.6,
    dimensions: '44" x 44" x 5.5"',
    spectrum: {
      uv: 1,
      blue: 11,
      green: 19,
      red: 37,
      farRed: 32
    },
    features: ['Master Controller Compatible', 'Dimmable'],
    warranty: 5,
    price: 1399
  },
  {
    id: 'dlc-003',
    manufacturer: 'California Lightworks',
    brand: 'California LightWorks',
    model: 'MegaDrive Linear 1000',
    dlcListingDate: '2023-04-10',
    category: 'Horticulture',
    ppf: 2770,
    inputPower: 1000,
    efficacy: 2.77,
    dimensions: '47.5" x 43" x 3.9"',
    spectrum: {
      uv: 0,
      blue: 17,
      green: 23,
      red: 38,
      farRed: 22
    },
    features: ['CO2 Enrichment Mode', 'Sunrise/Sunset', 'App Control'],
    warranty: 5,
    price: 1899
  },
  {
    id: 'dlc-004',
    manufacturer: 'Heliospectra',
    brand: 'Heliospectra',
    model: 'MITRA X',
    dlcListingDate: '2023-01-25',
    category: 'Research',
    ppf: 1800,
    inputPower: 630,
    efficacy: 2.86,
    dimensions: '25" x 21" x 4"',
    spectrum: {
      uv: 5,
      blue: 20,
      green: 15,
      red: 40,
      farRed: 20
    },
    features: ['helioCORE Control', 'Adjustable Spectrum', 'WiFi'],
    warranty: 3,
    price: 2499
  },
  {
    id: 'dlc-005',
    manufacturer: 'Philips',
    brand: 'Philips GreenPower',
    model: 'LED toplighting compact',
    dlcListingDate: '2023-05-05',
    category: 'Greenhouse',
    ppf: 3100,
    inputPower: 1000,
    efficacy: 3.1,
    dimensions: '28" x 5" x 3"',
    spectrum: {
      uv: 0,
      blue: 6,
      green: 19,
      red: 59,
      farRed: 16
    },
    features: ['GrowWise Control', 'High Output', 'IP66'],
    warranty: 5,
    price: 999
  },
  {
    id: 'dlc-006',
    manufacturer: 'Hortilux',
    brand: 'Hortilux Schréder',
    model: 'LED 1000 DR/W-MB',
    dlcListingDate: '2023-03-30',
    category: 'Horticulture',
    ppf: 2550,
    inputPower: 1000,
    efficacy: 2.55,
    dimensions: '44" x 44" x 6"',
    spectrum: {
      uv: 1,
      blue: 8,
      green: 28,
      red: 35,
      farRed: 28
    },
    features: ['Broad Spectrum', 'Modular Design'],
    warranty: 5,
    price: 1599
  },
  {
    id: 'dlc-007',
    manufacturer: 'Valoya',
    brand: 'Valoya',
    model: 'BX120',
    dlcListingDate: '2023-02-15',
    category: 'Research',
    ppf: 350,
    inputPower: 120,
    efficacy: 2.92,
    dimensions: '24" x 3" x 2"',
    spectrum: {
      uv: 3,
      blue: 15,
      green: 20,
      red: 40,
      farRed: 22
    },
    features: ['Patented Spectrum', 'No Fans', 'Research Grade'],
    warranty: 8,
    price: 599
  },
  {
    id: 'dlc-008',
    manufacturer: 'Illumitex',
    brand: 'Illumitex',
    model: 'PowerHarvest X2',
    dlcListingDate: '2023-04-20',
    category: 'Vertical Farming',
    ppf: 715,
    inputPower: 265,
    efficacy: 2.7,
    dimensions: '48" x 4" x 2.5"',
    spectrum: {
      uv: 0,
      blue: 20,
      green: 20,
      red: 40,
      farRed: 20
    },
    features: ['F3 Spectrum', 'Precision Optics', 'Edge-to-Edge'],
    warranty: 5,
    price: 899
  },
  {
    id: 'dlc-009',
    manufacturer: 'Kind LED',
    brand: 'Kind LED',
    model: 'X750',
    dlcListingDate: '2023-06-01',
    category: 'Horticulture',
    ppf: 1650,
    inputPower: 750,
    efficacy: 2.2,
    dimensions: '26" x 20" x 3"',
    spectrum: {
      uv: 2,
      blue: 18,
      green: 15,
      red: 45,
      farRed: 20
    },
    features: ['Mother Nature Spectrum', 'Secondary Optics'],
    warranty: 3,
    price: 1199
  },
  {
    id: 'dlc-010',
    manufacturer: 'Black Dog LED',
    brand: 'Black Dog LED',
    model: 'PhytoMAX-4 16S',
    dlcListingDate: '2023-03-01',
    category: 'Horticulture',
    ppf: 2885,
    inputPower: 1050,
    efficacy: 2.75,
    dimensions: '38" x 38" x 7"',
    spectrum: {
      uv: 3,
      blue: 15,
      green: 18,
      red: 42,
      farRed: 22
    },
    features: ['Phyto-Genesis Spectrum', 'Beyond PAR'],
    warranty: 5,
    price: 2599
  }
  // ... represents 1990+ more fixtures in the actual database
];

// Plant response curves
const PLANT_RESPONSES = {
  photosynthesis: [
    { wavelength: 380, response: 10 },
    { wavelength: 400, response: 25 },
    { wavelength: 450, response: 90 },
    { wavelength: 500, response: 50 },
    { wavelength: 550, response: 20 },
    { wavelength: 600, response: 40 },
    { wavelength: 650, response: 95 },
    { wavelength: 700, response: 85 },
    { wavelength: 750, response: 15 },
    { wavelength: 780, response: 5 }
  ],
  morphology: [
    { wavelength: 380, response: 80 },
    { wavelength: 400, response: 85 },
    { wavelength: 450, response: 75 },
    { wavelength: 500, response: 40 },
    { wavelength: 550, response: 30 },
    { wavelength: 600, response: 35 },
    { wavelength: 650, response: 45 },
    { wavelength: 700, response: 60 },
    { wavelength: 750, response: 95 },
    { wavelength: 780, response: 90 }
  ]
};

export default function SpectrumOptimizationPage() {
  const [selectedProfile, setSelectedProfile] = useState('led_full');
  const [customSpectrum, setCustomSpectrum] = useState({
    uv: 10,
    blue: 25,
    green: 15,
    red: 35,
    farRed: 15
  });
  const [growthStage, setGrowthStage] = useState('vegetative');
  const [optimizationGoal, setOptimizationGoal] = useState('balanced');
  const [dlcSearchTerm, setDlcSearchTerm] = useState('');
  const [dlcCategory, setDlcCategory] = useState('all');
  const [dlcSortBy, setDlcSortBy] = useState('efficacy');
  const [selectedDlcFixture, setSelectedDlcFixture] = useState<string | null>(null);

  // Calculate spectrum metrics
  const calculateMetrics = () => {
    const total = Object.values(customSpectrum).reduce((sum, val) => sum + val, 0);
    const blueRed = customSpectrum.blue / (customSpectrum.red || 1);
    const redFarRed = customSpectrum.red / (customSpectrum.farRed || 1);
    
    return {
      total,
      blueRedRatio: blueRed.toFixed(2),
      redFarRedRatio: redFarRed.toFixed(2),
      efficiency: ((customSpectrum.blue + customSpectrum.red) / total * 100).toFixed(1)
    };
  };

  const metrics = calculateMetrics();

  // Optimization recommendations
  const getOptimizationRecommendations = () => {
    const recommendations = [];
    
    if (growthStage === 'vegetative' && customSpectrum.blue < 30) {
      recommendations.push({
        type: 'warning',
        text: 'Increase blue light to 30-40% for optimal vegetative growth'
      });
    }
    
    if (growthStage === 'flowering' && customSpectrum.red < 40) {
      recommendations.push({
        type: 'warning',
        text: 'Increase red light to 40-50% for optimal flowering'
      });
    }
    
    if (customSpectrum.farRed > 20) {
      recommendations.push({
        type: 'info',
        text: 'High far-red may cause stretching - monitor plant morphology'
      });
    }
    
    if (metrics.blueRedRatio < 0.5 && growthStage === 'vegetative') {
      recommendations.push({
        type: 'warning',
        text: 'Blue:Red ratio is low for vegetative stage - consider increasing blue'
      });
    }
    
    return recommendations;
  };

  const recommendations = getOptimizationRecommendations();

  // Prepare custom spectrum data for chart
  const customSpectrumData = [
    { wavelength: 380, intensity: customSpectrum.uv * 2, color: '#8B00FF' },
    { wavelength: 400, intensity: customSpectrum.uv * 2.5, color: '#4B0082' },
    { wavelength: 450, intensity: customSpectrum.blue * 3.4, color: '#0000FF' },
    { wavelength: 500, intensity: customSpectrum.green * 3, color: '#00FF00' },
    { wavelength: 550, intensity: customSpectrum.green * 2.5, color: '#FFFF00' },
    { wavelength: 600, intensity: customSpectrum.red * 1.2, color: '#FFA500' },
    { wavelength: 650, intensity: customSpectrum.red * 2.7, color: '#FF0000' },
    { wavelength: 700, intensity: customSpectrum.farRed * 2, color: '#8B0000' },
    { wavelength: 750, intensity: customSpectrum.farRed * 4, color: '#4B0000' },
    { wavelength: 780, intensity: customSpectrum.farRed * 1.5, color: '#2B0000' }
  ];

  // Radar chart data for spectrum balance
  const radarData = [
    {
      subject: 'UV',
      current: customSpectrum.uv,
      optimal: growthStage === 'flowering' ? 5 : 10
    },
    {
      subject: 'Blue',
      current: customSpectrum.blue,
      optimal: growthStage === 'vegetative' ? 35 : 20
    },
    {
      subject: 'Green',
      current: customSpectrum.green,
      optimal: 15
    },
    {
      subject: 'Red',
      current: customSpectrum.red,
      optimal: growthStage === 'flowering' ? 45 : 30
    },
    {
      subject: 'Far-Red',
      current: customSpectrum.farRed,
      optimal: growthStage === 'flowering' ? 15 : 10
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Spectrum Optimization</h1>
          <p className="text-gray-400">Design and optimize light spectra for maximum plant performance</p>
        </div>

        {/* Controls */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Optimization Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Growth Stage</label>
                <Select value={growthStage} onValueChange={setGrowthStage}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="seedling">Seedling</SelectItem>
                    <SelectItem value="vegetative">Vegetative</SelectItem>
                    <SelectItem value="flowering">Flowering</SelectItem>
                    <SelectItem value="fruiting">Fruiting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Optimization Goal</label>
                <Select value={optimizationGoal} onValueChange={setOptimizationGoal}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="balanced">Balanced Growth</SelectItem>
                    <SelectItem value="yield">Maximum Yield</SelectItem>
                    <SelectItem value="quality">Quality/Potency</SelectItem>
                    <SelectItem value="efficiency">Energy Efficiency</SelectItem>
                    <SelectItem value="morphology">Compact Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Reference Profile</label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="sunlight">Natural Sunlight</SelectItem>
                    <SelectItem value="hps">HPS</SelectItem>
                    <SelectItem value="led_full">Full Spectrum LED</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spectrum Designer */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Custom Spectrum Designer
              </CardTitle>
              <CardDescription>Adjust spectral components to create your ideal spectrum</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(customSpectrum).map(([key, value]) => {
                const labels = {
                  uv: { name: 'UV (380-400nm)', color: 'bg-purple-600' },
                  blue: { name: 'Blue (400-500nm)', color: 'bg-blue-600' },
                  green: { name: 'Green (500-600nm)', color: 'bg-green-600' },
                  red: { name: 'Red (600-700nm)', color: 'bg-red-600' },
                  farRed: { name: 'Far-Red (700-800nm)', color: 'bg-red-900' }
                };
                
                const label = labels[key as keyof typeof labels];
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${label.color}`} />
                        {label.name}
                      </label>
                      <span className="text-sm text-gray-400">{value}%</span>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={([newValue]) => 
                        setCustomSpectrum(prev => ({ ...prev, [key]: newValue }))
                      }
                      min={0}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>
                );
              })}
              
              {/* Metrics */}
              <div className="pt-4 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Total</p>
                    <p className="font-bold">{metrics.total}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Blue:Red</p>
                    <p className="font-bold">{metrics.blueRedRatio}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Red:Far-Red</p>
                    <p className="font-bold">{metrics.redFarRedRatio}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">PAR Efficiency</p>
                    <p className="font-bold">{metrics.efficiency}%</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Optimize for current stage
                    if (growthStage === 'vegetative') {
                      setCustomSpectrum({ uv: 10, blue: 35, green: 15, red: 30, farRed: 10 });
                    } else if (growthStage === 'flowering') {
                      setCustomSpectrum({ uv: 5, blue: 20, green: 15, red: 45, farRed: 15 });
                    }
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto-Optimize
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Spectrum Balance Radar */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Spectrum Balance Analysis
              </CardTitle>
              <CardDescription>Compare your spectrum to optimal targets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                  <PolarRadiusAxis angle={90} domain={[0, 50]} stroke="#9CA3AF" />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Optimal"
                    dataKey="optimal"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Spectrum Visualization */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Spectral Power Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="comparison" className="space-y-4">
              <TabsList className="bg-gray-800">
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="response">Plant Response</TabsTrigger>
                <TabsTrigger value="efficiency">Efficiency Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="comparison">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="wavelength" 
                      stroke="#9CA3AF"
                      domain={[380, 780]}
                      ticks={[400, 450, 500, 550, 600, 650, 700, 750]}
                      label={{ value: 'Wavelength (nm)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      label={{ value: 'Relative Intensity (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    
                    {/* Reference Spectrum */}
                    <Area
                      data={SPECTRUM_PROFILES[selectedProfile as keyof typeof SPECTRUM_PROFILES].data}
                      type="monotone"
                      dataKey="intensity"
                      stroke="#6B7280"
                      fill="#6B7280"
                      fillOpacity={0.3}
                      name={SPECTRUM_PROFILES[selectedProfile as keyof typeof SPECTRUM_PROFILES].name}
                    />
                    
                    {/* Custom Spectrum */}
                    <Area
                      data={customSpectrumData}
                      type="monotone"
                      dataKey="intensity"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.5}
                      name="Custom Spectrum"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="response">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="wavelength" 
                      stroke="#9CA3AF"
                      domain={[380, 780]}
                      label={{ value: 'Wavelength (nm)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      label={{ value: 'Relative Response (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    
                    <Line
                      data={PLANT_RESPONSES.photosynthesis}
                      type="monotone"
                      dataKey="response"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Photosynthesis"
                      dot={false}
                    />
                    
                    <Line
                      data={PLANT_RESPONSES.morphology}
                      type="monotone"
                      dataKey="response"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      name="Morphology"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="efficiency">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">PAR Efficiency</span>
                          <Zap className="w-4 h-4 text-yellow-400" />
                        </div>
                        <p className="text-2xl font-bold">{metrics.efficiency}%</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Blue:Red Ratio</span>
                          <Palette className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold">{metrics.blueRedRatio}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">DLI Potential</span>
                          <Sun className="w-4 h-4 text-orange-400" />
                        </div>
                        <p className="text-2xl font-bold">38.5</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Coverage</span>
                          <Eye className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-2xl font-bold">92%</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Efficiency Chart */}
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { range: '380-450nm', efficiency: 78, photosynthesis: 82 },
                        { range: '450-550nm', efficiency: 65, photosynthesis: 45 },
                        { range: '550-650nm', efficiency: 42, photosynthesis: 35 },
                        { range: '650-750nm', efficiency: 88, photosynthesis: 92 },
                        { range: '750-800nm', efficiency: 35, photosynthesis: 25 }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="range" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="efficiency" fill="#8B5CF6" name="Energy Efficiency" />
                      <Bar dataKey="photosynthesis" fill="#10B981" name="Photosynthetic Efficiency" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <Alert 
                    key={idx}
                    className={rec.type === 'warning' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-blue-900/20 border-blue-700'}
                  >
                    <Info className="w-4 h-4" />
                    <AlertDescription>{rec.text}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* DLC Fixture Database */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              DLC Fixture Database
              <Badge variant="secondary" className="ml-2">2000+ Fixtures</Badge>
            </CardTitle>
            <CardDescription>
              Browse and analyze spectral data from DLC-listed horticultural luminaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search fixtures by manufacturer, model, or features..."
                    value={dlcSearchTerm}
                    onChange={(e) => setDlcSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <Select value={dlcCategory} onValueChange={setDlcCategory}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="horticulture">Horticulture</SelectItem>
                    <SelectItem value="greenhouse">Greenhouse</SelectItem>
                    <SelectItem value="vertical">Vertical Farming</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dlcSortBy} onValueChange={setDlcSortBy}>
                  <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="efficacy">Efficacy</SelectItem>
                    <SelectItem value="ppf">PPF Output</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Avg Efficacy</p>
                  <p className="text-xl font-bold text-white">2.73 μmol/J</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Highest PPF</p>
                  <p className="text-xl font-bold text-white">3100 μmol/s</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Price Range</p>
                  <p className="text-xl font-bold text-white">$599-$2599</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Manufacturers</p>
                  <p className="text-xl font-bold text-white">127</p>
                </div>
              </div>
            </div>

            {/* Fixture List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {DLC_FIXTURES
                .filter(fixture => {
                  const matchesSearch = !dlcSearchTerm || 
                    fixture.manufacturer.toLowerCase().includes(dlcSearchTerm.toLowerCase()) ||
                    fixture.model.toLowerCase().includes(dlcSearchTerm.toLowerCase()) ||
                    fixture.features.some(f => f.toLowerCase().includes(dlcSearchTerm.toLowerCase()));
                  const matchesCategory = dlcCategory === 'all' || 
                    fixture.category.toLowerCase().includes(dlcCategory.toLowerCase());
                  return matchesSearch && matchesCategory;
                })
                .sort((a, b) => {
                  switch (dlcSortBy) {
                    case 'efficacy': return b.efficacy - a.efficacy;
                    case 'ppf': return b.ppf - a.ppf;
                    case 'price': return a.price - b.price;
                    case 'newest': return new Date(b.dlcListingDate).getTime() - new Date(a.dlcListingDate).getTime();
                    default: return 0;
                  }
                })
                .map(fixture => (
                  <div
                    key={fixture.id}
                    className={`p-4 bg-gray-800 rounded-lg border transition-all cursor-pointer ${
                      selectedDlcFixture === fixture.id 
                        ? 'border-purple-500 bg-gray-800/70' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedDlcFixture(
                      selectedDlcFixture === fixture.id ? null : fixture.id
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <h4 className="font-medium text-white">{fixture.manufacturer}</h4>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-300">{fixture.model}</span>
                          <CheckCircle className="w-4 h-4 text-green-400" title="DLC Listed" />
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">PPF</p>
                            <p className="font-medium text-white">{fixture.ppf} μmol/s</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Power</p>
                            <p className="font-medium text-white">{fixture.inputPower}W</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Efficacy</p>
                            <p className="font-medium text-green-400">{fixture.efficacy} μmol/J</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Price</p>
                            <p className="font-medium text-white">${fixture.price}</p>
                          </div>
                        </div>

                        {selectedDlcFixture === fixture.id && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            {/* Spectrum Breakdown */}
                            <div className="mb-4">
                              <p className="text-sm text-gray-400 mb-2">Spectrum Composition</p>
                              <div className="flex gap-2">
                                {Object.entries(fixture.spectrum).map(([band, percentage]) => (
                                  <div key={band} className="flex-1 text-center">
                                    <div 
                                      className="h-20 rounded"
                                      style={{
                                        background: {
                                          uv: '#8B00FF',
                                          blue: '#0000FF',
                                          green: '#00FF00',
                                          red: '#FF0000',
                                          farRed: '#8B0000'
                                        }[band],
                                        opacity: percentage / 100
                                      }}
                                    />
                                    <p className="text-xs mt-1">{percentage}%</p>
                                    <p className="text-xs text-gray-500">{band}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Features and Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400 mb-1">Features</p>
                                <div className="flex flex-wrap gap-1">
                                  {fixture.features.map((feature, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-400 mb-1">Details</p>
                                <p className="text-xs text-gray-300">
                                  Dimensions: {fixture.dimensions}<br />
                                  Warranty: {fixture.warranty} years<br />
                                  Listed: {new Date(fixture.dlcListingDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Apply fixture spectrum to custom designer
                                  setCustomSpectrum(fixture.spectrum);
                                }}
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                Use Spectrum
                              </Button>
                              <Button size="sm" variant="outline">
                                <FileSpreadsheet className="w-3 h-3 mr-1" />
                                Download Spec
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Export Options */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Showing 10 of 2000+ DLC certified fixtures
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Full Database
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced Filters
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}