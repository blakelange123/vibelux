'use client';

import React, { useState, useEffect } from 'react';
import {
  Dna,
  Sun,
  Beaker,
  TrendingUp,
  Database,
  Search,
  Filter,
  Plus,
  Edit,
  Copy,
  Download,
  Upload,
  Star,
  Clock,
  Zap,
  Droplets,
  Thermometer,
  Wind,
  ChartBar,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  FlaskConical,
  Leaf,
  Flower2,
  Activity,
  Target,
  Settings,
  Share2,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TerpeneProfile {
  name: string;
  targetPercentage: number;
  currentPercentage?: number;
  effects: string[];
  aroma: string;
  boilingPoint: number; // °F
  optimalSpectrum: {
    uvA: number;
    blue: number;
    green: number;
    red: number;
    farRed: number;
  };
}

interface MorphologyTarget {
  parameter: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  influencingFactors: {
    factor: string;
    impact: 'positive' | 'negative';
    strength: number; // 0-100
  }[];
}

interface StressProtocol {
  id: string;
  name: string;
  type: 'drought' | 'cold' | 'heat' | 'light' | 'nutrient';
  timing: 'vegetative' | 'transition' | 'flowering' | 'ripening';
  duration: number; // days
  intensity: number; // 0-100
  expectedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
  parameters: Record<string, any>;
}

interface LightRecipe {
  id: string;
  name: string;
  strainName: string;
  genetics: string;
  category: 'sativa' | 'indica' | 'hybrid' | 'autoflower';
  createdBy: string;
  createdDate: Date;
  lastModified: Date;
  version: number;
  isPublic: boolean;
  rating: number;
  usageCount: number;
  verified: boolean;
  
  // Growth stages with specific light parameters
  stages: {
    name: string;
    duration: number; // days
    photoperiod: number; // hours
    intensity: number; // μmol/m²/s
    spectrum: {
      uvA: number;
      uvB: number;
      blue: number;
      green: number;
      red: number;
      farRed: number;
    };
    co2Target: number; // ppm
    tempDay: number; // °F
    tempNight: number; // °F
    humidity: number; // %
    vpd: number; // kPa
  }[];
  
  // Terpene optimization
  terpeneTargets: TerpeneProfile[];
  
  // Morphology targets
  morphologyTargets: MorphologyTarget[];
  
  // Stress protocols
  stressProtocols: StressProtocol[];
  
  // Expected outcomes
  expectedYield: {
    min: number;
    max: number;
    unit: 'g/m²' | 'g/plant';
  };
  expectedPotency: {
    thc?: { min: number; max: number };
    cbd?: { min: number; max: number };
    totalCannabinoids?: { min: number; max: number };
  };
  expectedFlowerTime: number; // days
  
  notes: string;
  tags: string[];
}

const mockRecipes: LightRecipe[] = [
  {
    id: 'recipe-001',
    name: 'Blue Dream - High Terpene Protocol',
    strainName: 'Blue Dream',
    genetics: 'Blueberry x Haze',
    category: 'hybrid',
    createdBy: 'Master Grower',
    createdDate: new Date('2024-01-15'),
    lastModified: new Date('2024-03-20'),
    version: 3,
    isPublic: true,
    rating: 4.8,
    usageCount: 245,
    verified: true,
    stages: [
      {
        name: 'Seedling',
        duration: 7,
        photoperiod: 18,
        intensity: 200,
        spectrum: { uvA: 0, uvB: 0, blue: 25, green: 20, red: 50, farRed: 5 },
        co2Target: 400,
        tempDay: 75,
        tempNight: 68,
        humidity: 70,
        vpd: 0.6
      },
      {
        name: 'Vegetative',
        duration: 28,
        photoperiod: 18,
        intensity: 600,
        spectrum: { uvA: 2, uvB: 0, blue: 22, green: 18, red: 53, farRed: 5 },
        co2Target: 800,
        tempDay: 78,
        tempNight: 70,
        humidity: 65,
        vpd: 0.9
      },
      {
        name: 'Transition',
        duration: 14,
        photoperiod: 12,
        intensity: 800,
        spectrum: { uvA: 3, uvB: 0.5, blue: 18, green: 15, red: 58, farRed: 5.5 },
        co2Target: 900,
        tempDay: 77,
        tempNight: 68,
        humidity: 55,
        vpd: 1.2
      },
      {
        name: 'Flowering',
        duration: 42,
        photoperiod: 12,
        intensity: 900,
        spectrum: { uvA: 4, uvB: 1, blue: 15, green: 12, red: 63, farRed: 5 },
        co2Target: 1000,
        tempDay: 76,
        tempNight: 66,
        humidity: 50,
        vpd: 1.4
      },
      {
        name: 'Ripening',
        duration: 14,
        photoperiod: 11,
        intensity: 700,
        spectrum: { uvA: 5, uvB: 2, blue: 12, green: 10, red: 66, farRed: 5 },
        co2Target: 800,
        tempDay: 72,
        tempNight: 62,
        humidity: 45,
        vpd: 1.5
      }
    ],
    terpeneTargets: [
      {
        name: 'Myrcene',
        targetPercentage: 1.2,
        currentPercentage: 0.9,
        effects: ['Sedating', 'Muscle Relaxant'],
        aroma: 'Earthy, Musky',
        boilingPoint: 334,
        optimalSpectrum: { uvA: 3, blue: 20, green: 15, red: 57, farRed: 5 }
      },
      {
        name: 'Pinene',
        targetPercentage: 0.8,
        currentPercentage: 0.6,
        effects: ['Alertness', 'Memory Retention'],
        aroma: 'Pine, Fresh',
        boilingPoint: 311,
        optimalSpectrum: { uvA: 4, blue: 22, green: 18, red: 52, farRed: 4 }
      },
      {
        name: 'Limonene',
        targetPercentage: 0.6,
        currentPercentage: 0.5,
        effects: ['Mood Enhancement', 'Stress Relief'],
        aroma: 'Citrus, Lemon',
        boilingPoint: 349,
        optimalSpectrum: { uvA: 5, blue: 18, green: 16, red: 56, farRed: 5 }
      }
    ],
    morphologyTargets: [
      {
        parameter: 'Internode Spacing',
        currentValue: 2.5,
        targetValue: 2.0,
        unit: 'inches',
        influencingFactors: [
          { factor: 'Blue Light', impact: 'negative', strength: 80 },
          { factor: 'Far-Red', impact: 'positive', strength: 60 },
          { factor: 'DLI', impact: 'negative', strength: 40 }
        ]
      },
      {
        parameter: 'Leaf Area Index',
        currentValue: 3.2,
        targetValue: 4.0,
        unit: 'LAI',
        influencingFactors: [
          { factor: 'Red Light', impact: 'positive', strength: 70 },
          { factor: 'Temperature', impact: 'positive', strength: 50 },
          { factor: 'CO2', impact: 'positive', strength: 60 }
        ]
      },
      {
        parameter: 'Bud Density',
        currentValue: 7.5,
        targetValue: 9.0,
        unit: 'score',
        influencingFactors: [
          { factor: 'UV Light', impact: 'positive', strength: 75 },
          { factor: 'Temperature Differential', impact: 'positive', strength: 65 },
          { factor: 'P/K Ratio', impact: 'positive', strength: 55 }
        ]
      }
    ],
    stressProtocols: [
      {
        id: 'stress-001',
        name: 'UV Stress for Trichome Development',
        type: 'light',
        timing: 'flowering',
        duration: 7,
        intensity: 70,
        expectedOutcome: '20% increase in trichome density',
        riskLevel: 'medium',
        parameters: {
          uvbIntensity: 2.5,
          exposureHours: 3,
          startWeek: 6
        }
      },
      {
        id: 'stress-002',
        name: 'Drought Stress for Terpene Enhancement',
        type: 'drought',
        timing: 'ripening',
        duration: 5,
        intensity: 60,
        expectedOutcome: '15% increase in terpene content',
        riskLevel: 'low',
        parameters: {
          vpdIncrease: 0.3,
          wateringReduction: 40,
          monitoringFrequency: 'twice daily'
        }
      }
    ],
    expectedYield: { min: 450, max: 550, unit: 'g/m²' },
    expectedPotency: { 
      thc: { min: 18, max: 22 },
      cbd: { min: 0.1, max: 0.3 },
      totalCannabinoids: { min: 20, max: 25 }
    },
    expectedFlowerTime: 63,
    notes: 'This recipe focuses on maximizing terpene expression while maintaining high yields. UV supplementation in late flower is critical.',
    tags: ['high-terpene', 'verified', 'commercial', 'intermediate']
  },
  {
    id: 'recipe-002',
    name: 'OG Kush - Dense Bud Protocol',
    strainName: 'OG Kush',
    genetics: 'Hindu Kush x Chemdawg',
    category: 'indica',
    createdBy: 'Research Team',
    createdDate: new Date('2024-02-01'),
    lastModified: new Date('2024-03-15'),
    version: 2,
    isPublic: true,
    rating: 4.6,
    usageCount: 189,
    verified: true,
    stages: [
      {
        name: 'Vegetative',
        duration: 21,
        photoperiod: 18,
        intensity: 700,
        spectrum: { uvA: 1, uvB: 0, blue: 24, green: 16, red: 54, farRed: 5 },
        co2Target: 900,
        tempDay: 80,
        tempNight: 72,
        humidity: 60,
        vpd: 1.0
      },
      {
        name: 'Flowering',
        duration: 56,
        photoperiod: 12,
        intensity: 1000,
        spectrum: { uvA: 5, uvB: 1.5, blue: 13, green: 10, red: 66.5, farRed: 4 },
        co2Target: 1200,
        tempDay: 78,
        tempNight: 65,
        humidity: 45,
        vpd: 1.5
      }
    ],
    terpeneTargets: [
      {
        name: 'Caryophyllene',
        targetPercentage: 0.9,
        currentPercentage: 0.7,
        effects: ['Anti-inflammatory', 'Pain Relief'],
        aroma: 'Spicy, Peppery',
        boilingPoint: 320,
        optimalSpectrum: { uvA: 4, blue: 16, green: 14, red: 60, farRed: 6 }
      },
      {
        name: 'Linalool',
        targetPercentage: 0.5,
        currentPercentage: 0.4,
        effects: ['Calming', 'Anti-anxiety'],
        aroma: 'Floral, Lavender',
        boilingPoint: 388,
        optimalSpectrum: { uvA: 3, blue: 19, green: 17, red: 56, farRed: 5 }
      }
    ],
    morphologyTargets: [
      {
        parameter: 'Bud Density',
        currentValue: 8.0,
        targetValue: 9.5,
        unit: 'score',
        influencingFactors: [
          { factor: 'High Intensity Light', impact: 'positive', strength: 85 },
          { factor: 'Low Humidity', impact: 'positive', strength: 70 },
          { factor: 'Temperature Differential', impact: 'positive', strength: 60 }
        ]
      }
    ],
    stressProtocols: [
      {
        id: 'stress-003',
        name: 'Cold Shock for Purple Expression',
        type: 'cold',
        timing: 'ripening',
        duration: 10,
        intensity: 50,
        expectedOutcome: 'Enhanced purple coloration',
        riskLevel: 'low',
        parameters: {
          nightTemp: 58,
          dayNightDiff: 20,
          startWeek: 7
        }
      }
    ],
    expectedYield: { min: 400, max: 500, unit: 'g/m²' },
    expectedPotency: { 
      thc: { min: 20, max: 25 },
      cbd: { min: 0.1, max: 0.2 },
      totalCannabinoids: { min: 22, max: 27 }
    },
    expectedFlowerTime: 56,
    notes: 'Focus on high light intensity and large day/night temperature differentials for maximum bud density.',
    tags: ['dense-buds', 'high-thc', 'verified', 'indica']
  }
];

export function StrainLightRecipeLibrary() {
  const [recipes, setRecipes] = useState<LightRecipe[]>(mockRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState<LightRecipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'usage' | 'date'>('rating');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'terpenes' | 'morphology' | 'stress' | 'results'>('overview');
  const [compareMode, setCompareMode] = useState(false);
  const [compareRecipes, setCompareRecipes] = useState<string[]>([]);

  // Filter and sort recipes
  const filteredRecipes = recipes
    .filter(recipe => {
      const matchesSearch = recipe.strainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'date':
          return b.lastModified.getTime() - a.lastModified.getTime();
        default:
          return 0;
      }
    });

  // Calculate spectrum distribution for visualization
  const getSpectrumData = (spectrum: Record<string, number>) => {
    return Object.entries(spectrum).map(([wavelength, percentage]) => ({
      wavelength: wavelength.replace(/([A-Z])/g, ' $1').trim(),
      percentage
    }));
  };

  // Generate growth timeline data
  const getTimelineData = (recipe: LightRecipe) => {
    let cumulativeDays = 0;
    return recipe.stages.map(stage => ({
      name: stage.name,
      startDay: cumulativeDays,
      duration: stage.duration,
      intensity: stage.intensity,
      photoperiod: stage.photoperiod,
      endDay: (cumulativeDays += stage.duration)
    }));
  };

  const exportRecipe = (recipe: LightRecipe) => {
    const dataStr = JSON.stringify(recipe, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${recipe.strainName}_${recipe.name}_recipe.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const duplicateRecipe = (recipe: LightRecipe) => {
    const newRecipe: LightRecipe = {
      ...recipe,
      id: `recipe-${Date.now()}`,
      name: `${recipe.name} (Copy)`,
      createdDate: new Date(),
      lastModified: new Date(),
      version: 1,
      usageCount: 0,
      rating: 0,
      verified: false,
      isPublic: false
    };
    setRecipes([...recipes, newRecipe]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Dna className="w-8 h-8 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Strain-Specific Light Recipe Library
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Optimize terpenes, morphology, and phenotype expression
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              compareMode 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <ChartBar className="w-4 h-4" />
            Compare
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Recipe
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search strains, recipes, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Categories</option>
          <option value="sativa">Sativa</option>
          <option value="indica">Indica</option>
          <option value="hybrid">Hybrid</option>
          <option value="autoflower">Autoflower</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="rating">Sort by Rating</option>
          <option value="usage">Sort by Usage</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe List */}
        <div className="lg:col-span-1 space-y-4 max-h-[800px] overflow-y-auto">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedRecipe?.id === recipe.id
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500'
                  : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {recipe.strainName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {recipe.name}
                  </p>
                </div>
                {recipe.verified && (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              <div className="flex items-center gap-3 text-sm mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">{recipe.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">{recipe.usageCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">{recipe.expectedFlowerTime}d</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {recipe.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {compareMode && (
                <div className="mt-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={compareRecipes.includes(recipe.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCompareRecipes([...compareRecipes, recipe.id]);
                        } else {
                          setCompareRecipes(compareRecipes.filter(id => id !== recipe.id));
                        }
                      }}
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Add to comparison
                    </span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recipe Details */}
        {selectedRecipe && (
          <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            {/* Recipe Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedRecipe.strainName}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  {selectedRecipe.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {selectedRecipe.genetics} • {selectedRecipe.category}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => duplicateRecipe(selectedRecipe)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={() => exportRecipe(selectedRecipe)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'overview', label: 'Overview', icon: BookOpen },
                { id: 'stages', label: 'Growth Stages', icon: TrendingUp },
                { id: 'terpenes', label: 'Terpenes', icon: FlaskConical },
                { id: 'morphology', label: 'Morphology', icon: Leaf },
                { id: 'stress', label: 'Stress', icon: Activity },
                { id: 'results', label: 'Results', icon: Target }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Expected Outcomes */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-green-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Expected Yield</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedRecipe.expectedYield.min}-{selectedRecipe.expectedYield.max}
                    </p>
                    <p className="text-sm text-gray-500">{selectedRecipe.expectedYield.unit}</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Beaker className="w-5 h-5 text-purple-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">THC Range</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedRecipe.expectedPotency.thc?.min}-{selectedRecipe.expectedPotency.thc?.max}%
                    </p>
                    <p className="text-sm text-gray-500">Expected potency</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Flower Time</h4>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedRecipe.expectedFlowerTime}
                    </p>
                    <p className="text-sm text-gray-500">days</p>
                  </div>
                </div>

                {/* Recipe Info */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recipe Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Created by:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedRecipe.createdBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Version:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedRecipe.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Modified:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedRecipe.lastModified.toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Usage Count:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedRecipe.usageCount} growers</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Grower Notes</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedRecipe.notes}</p>
                </div>
              </div>
            )}

            {activeTab === 'stages' && (
              <div className="space-y-6">
                {/* Growth Timeline */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Growth Timeline</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getTimelineData(selectedRecipe)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                      <YAxis tick={{ fill: '#6B7280' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#E5E7EB' }}
                      />
                      <Bar dataKey="duration" fill="#8B5CF6" />
                      <Bar dataKey="intensity" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Stage Details */}
                <div className="space-y-4">
                  {selectedRecipe.stages.map((stage, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {stage.name} Stage
                        </h4>
                        <span className="text-sm text-gray-500">
                          {stage.duration} days
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Sun className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-gray-500">Photoperiod</span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stage.photoperiod}h
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-gray-500">Intensity</span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stage.intensity} μmol
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Thermometer className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-500">Temperature</span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stage.tempDay}/{stage.tempNight}°F
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-500">VPD</span>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stage.vpd} kPa
                          </p>
                        </div>
                      </div>
                      
                      {/* Spectrum Visualization */}
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Light Spectrum</p>
                        <div className="h-8 flex rounded overflow-hidden">
                          {stage.spectrum.uvA > 0 && (
                            <div 
                              className="bg-purple-600" 
                              style={{ width: `${stage.spectrum.uvA}%` }}
                              title={`UV-A: ${stage.spectrum.uvA}%`}
                            />
                          )}
                          {stage.spectrum.blue > 0 && (
                            <div 
                              className="bg-blue-500" 
                              style={{ width: `${stage.spectrum.blue}%` }}
                              title={`Blue: ${stage.spectrum.blue}%`}
                            />
                          )}
                          {stage.spectrum.green > 0 && (
                            <div 
                              className="bg-green-500" 
                              style={{ width: `${stage.spectrum.green}%` }}
                              title={`Green: ${stage.spectrum.green}%`}
                            />
                          )}
                          {stage.spectrum.red > 0 && (
                            <div 
                              className="bg-red-500" 
                              style={{ width: `${stage.spectrum.red}%` }}
                              title={`Red: ${stage.spectrum.red}%`}
                            />
                          )}
                          {stage.spectrum.farRed > 0 && (
                            <div 
                              className="bg-red-800" 
                              style={{ width: `${stage.spectrum.farRed}%` }}
                              title={`Far-Red: ${stage.spectrum.farRed}%`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'terpenes' && (
              <div className="space-y-6">
                {/* Terpene Profile Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Target Terpene Profile</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={selectedRecipe.terpeneTargets.map(t => ({
                      terpene: t.name,
                      target: t.targetPercentage,
                      current: t.currentPercentage || 0
                    }))}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="terpene" tick={{ fill: '#6B7280' }} />
                      <PolarRadiusAxis tick={{ fill: '#6B7280' }} />
                      <Radar 
                        name="Target" 
                        dataKey="target" 
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.3} 
                      />
                      <Radar 
                        name="Current" 
                        dataKey="current" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#E5E7EB' }}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Individual Terpene Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRecipe.terpeneTargets.map((terpene, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {terpene.name}
                          </h5>
                          <p className="text-sm text-gray-500">{terpene.aroma}</p>
                        </div>
                        <FlaskConical className="w-5 h-5 text-purple-500" />
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Target:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {terpene.targetPercentage}%
                          </span>
                        </div>
                        {terpene.currentPercentage && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Current:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {terpene.currentPercentage}%
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Boiling Point:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {terpene.boilingPoint}°F
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Effects:</p>
                        <div className="flex flex-wrap gap-1">
                          {terpene.effects.map((effect, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Optimal Spectrum for {terpene.name}:</p>
                        <div className="h-4 flex rounded overflow-hidden">
                          {Object.entries(terpene.optimalSpectrum).map(([spectrum, value]) => (
                            <div 
                              key={spectrum}
                              className={
                                spectrum === 'uvA' ? 'bg-purple-600' :
                                spectrum === 'blue' ? 'bg-blue-500' :
                                spectrum === 'green' ? 'bg-green-500' :
                                spectrum === 'red' ? 'bg-red-500' :
                                'bg-red-800'
                              }
                              style={{ width: `${value}%` }}
                              title={`${spectrum}: ${value}%`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'morphology' && (
              <div className="space-y-6">
                {selectedRecipe.morphologyTargets.map((target, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {target.parameter}
                      </h4>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Target</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {target.targetValue} {target.unit}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Current: {target.currentValue}</span>
                        <span className="text-gray-500">Target: {target.targetValue}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-purple-500 h-3 rounded-full relative"
                          style={{ width: `${(target.currentValue / target.targetValue) * 100}%` }}
                        >
                          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-600 rounded-full border-2 border-white dark:border-gray-800" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Influencing Factors:
                      </p>
                      {target.influencingFactors.map((factor, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              factor.impact === 'positive' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {factor.factor}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  factor.impact === 'positive' ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${factor.strength}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-10 text-right">
                              {factor.strength}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'stress' && (
              <div className="space-y-4">
                {selectedRecipe.stressProtocols.map((protocol) => (
                  <div key={protocol.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {protocol.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {protocol.type.charAt(0).toUpperCase() + protocol.type.slice(1)} stress • {protocol.timing} stage
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        protocol.riskLevel === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        protocol.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {protocol.riskLevel} risk
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {protocol.duration} days
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Intensity</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {protocol.intensity}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expected Outcome</p>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {protocol.expectedOutcome}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Protocol Parameters:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(protocol.parameters).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-500">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                      Expected Results
                    </h4>
                  </div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    These are target ranges based on optimal conditions. Actual results may vary based on 
                    environmental factors, genetics, and grower skill.
                  </p>
                </div>
                
                {/* Results Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                      Cannabinoid Profile
                    </h5>
                    <div className="space-y-2">
                      {selectedRecipe.expectedPotency.thc && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">THC</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedRecipe.expectedPotency.thc.min}-{selectedRecipe.expectedPotency.thc.max}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ 
                                width: `${(selectedRecipe.expectedPotency.thc.max / 30) * 100}%`,
                                marginLeft: `${(selectedRecipe.expectedPotency.thc.min / 30) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {selectedRecipe.expectedPotency.cbd && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">CBD</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedRecipe.expectedPotency.cbd.min}-{selectedRecipe.expectedPotency.cbd.max}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ 
                                width: `${(selectedRecipe.expectedPotency.cbd.max / 30) * 100}%`,
                                marginLeft: `${(selectedRecipe.expectedPotency.cbd.min / 30) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                      Production Metrics
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Yield Range</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedRecipe.expectedYield.min}-{selectedRecipe.expectedYield.max} {selectedRecipe.expectedYield.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Flower Time</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedRecipe.expectedFlowerTime} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Cycle</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedRecipe.stages.reduce((sum, s) => sum + s.duration, 0)} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Success Factors */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 dark:text-green-100 mb-3">
                    Critical Success Factors
                  </h5>
                  <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Maintain precise temperature differentials between day and night cycles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Implement UV supplementation according to stress protocol timing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Monitor and adjust spectrum based on morphology feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Execute stress protocols with precise timing and intensity</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compare Modal */}
      {compareMode && compareRecipes.length > 1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recipe Comparison
                </h3>
                <button
                  onClick={() => {
                    setCompareMode(false);
                    setCompareRecipes([]);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Comparison content would go here */}
              <p className="text-gray-600 dark:text-gray-400">
                Comparing {compareRecipes.length} recipes...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}