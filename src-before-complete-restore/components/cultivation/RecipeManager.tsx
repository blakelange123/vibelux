'use client';

import React, { useState, useEffect } from 'react';
import { recipeEngine, CultivationRecipe, RecipeStage } from '@/lib/cultivation/recipe-engine';
import { RecipeCreationWizard } from './RecipeCreationWizard';
import {
  BookOpen,
  Plus,
  Play,
  Pause,
  Save,
  Copy,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Beaker,
  Calendar,
  TrendingUp,
  Star,
  Users,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Settings,
  X
} from 'lucide-react';

export function RecipeManager() {
  const [recipes, setRecipes] = useState<CultivationRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<CultivationRecipe | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [view, setView] = useState<'list' | 'grid'>('grid');

  // Load recipes
  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    // In production, load from API
    const templates = recipeEngine.constructor.getTemplates();
    const mockRecipes: CultivationRecipe[] = [
      {
        id: 'recipe_1',
        name: 'Blue Dream - Fast Flower',
        description: 'Optimized recipe for Blue Dream with accelerated flowering',
        strainName: 'Blue Dream',
        category: 'hybrid',
        totalDuration: 63,
        stages: templates[0].stages as RecipeStage[],
        metadata: {
          author: 'Master Grower',
          version: '2.1',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-03-20'),
          tags: ['fast-flower', 'high-yield', 'beginner-friendly'],
          notes: 'Reduced flowering time while maintaining quality',
          expectedYield: { min: 450, max: 550, average: 500 },
          difficulty: 'beginner',
          tested: true,
          successRate: 94
        }
      },
      {
        id: 'recipe_2',
        name: 'OG Kush - Premium Quality',
        description: 'Extended flowering for maximum terpene development',
        strainName: 'OG Kush',
        category: 'indica',
        totalDuration: 77,
        stages: templates[0].stages as RecipeStage[],
        metadata: {
          author: 'Cannabis Labs',
          version: '3.0',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-03-15'),
          tags: ['premium', 'high-terpene', 'advanced'],
          notes: 'Focus on terpene preservation and quality',
          expectedYield: { min: 400, max: 480, average: 440 },
          difficulty: 'advanced',
          tested: true,
          successRate: 88
        }
      },
      {
        id: 'recipe_3',
        name: 'Auto Northern Lights',
        description: 'Autoflower recipe with consistent results',
        strainName: 'Northern Lights Auto',
        category: 'autoflower',
        totalDuration: 70,
        stages: templates[0].stages as RecipeStage[],
        metadata: {
          author: 'Auto Experts',
          version: '1.5',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-02-28'),
          tags: ['autoflower', 'stable', 'energy-efficient'],
          notes: 'Optimized for autoflowering genetics',
          expectedYield: { min: 350, max: 420, average: 385 },
          difficulty: 'intermediate',
          tested: true,
          successRate: 91
        }
      }
    ];
    setRecipes(mockRecipes);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.strainName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'advanced': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'expert': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const RecipeCard = ({ recipe }: { recipe: CultivationRecipe }) => (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => setSelectedRecipe(recipe)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {recipe.name}
          </h3>
          {recipe.strainName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {recipe.strainName}
            </p>
          )}
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(recipe.metadata.difficulty)}`}>
          {recipe.metadata.difficulty}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {recipe.description}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{recipe.totalDuration} days</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>{recipe.metadata.expectedYield.average}g/plant</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <BarChart3 className="w-4 h-4" />
          <span>{recipe.stages.length} stages</span>
        </div>
        {recipe.metadata.successRate && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <CheckCircle className="w-4 h-4" />
            <span>{recipe.metadata.successRate}% success</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {recipe.metadata.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded"
          >
            {tag}
          </span>
        ))}
        {recipe.metadata.tags.length > 3 && (
          <span className="px-2 py-1 text-gray-500 text-xs">
            +{recipe.metadata.tags.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>v{recipe.metadata.version}</span>
        <span>by {recipe.metadata.author}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-500" />
            Cultivation Recipes
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Automated growing protocols for consistent results
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Recipe
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes, strains, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="indica">Indica</option>
              <option value="sativa">Sativa</option>
              <option value="hybrid">Hybrid</option>
              <option value="autoflower">Autoflower</option>
              <option value="custom">Custom</option>
            </select>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-1 rounded ${view === 'grid' ? 'bg-white dark:bg-gray-600' : ''}`}
              >
                Grid
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1 rounded ${view === 'list' ? 'bg-white dark:bg-gray-600' : ''}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Grid/List */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {recipe.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(recipe.metadata.difficulty)}`}>
                      {recipe.metadata.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {recipe.description}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <span>{recipe.totalDuration} days</span>
                  <span>{recipe.metadata.expectedYield.average}g/plant</span>
                  {recipe.metadata.successRate && (
                    <span>{recipe.metadata.successRate}% success</span>
                  )}
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No recipes found</p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Create Your First Recipe
          </button>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {/* Create Recipe Modal */}
      {isCreating && (
        <CreateRecipeModal
          onClose={() => setIsCreating(false)}
          onSave={(recipe) => {
            // Add the new recipe to the list
            setRecipes([...recipes, recipe as CultivationRecipe]);
            setIsCreating(false);
            // In production, save to API
            // await recipeEngine.saveRecipe(recipe);
          }}
        />
      )}
    </div>
  );
}

// Recipe Detail Modal Component
function RecipeDetailModal({ 
  recipe, 
  onClose 
}: { 
  recipe: CultivationRecipe; 
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {recipe.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {recipe.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200 dark:border-gray-700">
            {['overview', 'stages', 'analytics', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {recipe.totalDuration} days
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expected Yield</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {recipe.metadata.expectedYield.average}g
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {recipe.metadata.successRate}%
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Difficulty</p>
                  <p className={`text-xl font-semibold capitalize ${getDifficultyColor(recipe.metadata.difficulty).split(' ')[0]}`}>
                    {recipe.metadata.difficulty}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recipe Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Author:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{recipe.metadata.author}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Version:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{recipe.metadata.version}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="ml-2 text-gray-900 dark:text-white capitalize">{recipe.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Tested:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{recipe.metadata.tested ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.metadata.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {recipe.metadata.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
                  <p className="text-gray-600 dark:text-gray-300">{recipe.metadata.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stages' && (
            <div className="space-y-4">
              {recipe.stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {stage.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {stage.duration} days
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedStage === stage.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedStage === stage.id && (
                    <div className="p-4 pt-0 space-y-4">
                      {/* Environmental Settings */}
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                          Environmental Parameters
                        </h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-white dark:bg-gray-800 p-3 rounded">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                              <Thermometer className="w-4 h-4" />
                              Temperature
                            </div>
                            <p className="text-gray-900 dark:text-white">
                              Day: {stage.environmental.temperature.day.optimal}°F
                            </p>
                            <p className="text-gray-900 dark:text-white">
                              Night: {stage.environmental.temperature.night.optimal}°F
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-3 rounded">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                              <Droplets className="w-4 h-4" />
                              Humidity
                            </div>
                            <p className="text-gray-900 dark:text-white">
                              Day: {stage.environmental.humidity.day.optimal}%
                            </p>
                            <p className="text-gray-900 dark:text-white">
                              Night: {stage.environmental.humidity.night.optimal}%
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-3 rounded">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                              <Wind className="w-4 h-4" />
                              CO₂
                            </div>
                            <p className="text-gray-900 dark:text-white">
                              Day: {stage.environmental.co2.day.optimal} ppm
                            </p>
                            <p className="text-gray-900 dark:text-white">
                              Night: {stage.environmental.co2.night.optimal} ppm
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-3 rounded">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                              <Sun className="w-4 h-4" />
                              Light
                            </div>
                            <p className="text-gray-900 dark:text-white">
                              {stage.environmental.light.photoperiod}h photoperiod
                            </p>
                            <p className="text-gray-900 dark:text-white">
                              {stage.environmental.light.intensity} PPFD
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Irrigation Settings */}
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                          Irrigation & Nutrients
                        </h5>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                            <span className="text-gray-900 dark:text-white capitalize">
                              {stage.irrigation.frequency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                            <span className="text-gray-900 dark:text-white">
                              {stage.irrigation.duration} minutes
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">EC:</span>
                            <span className="text-gray-900 dark:text-white">
                              {stage.irrigation.ec.optimal} mS/cm
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">pH:</span>
                            <span className="text-gray-900 dark:text-white">
                              {stage.irrigation.ph.optimal}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Automation Settings */}
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                          Automation
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(stage.automation).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              {value === true ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : value === false ? (
                                <X className="w-4 h-4 text-gray-400" />
                              ) : null}
                              <span className="text-gray-700 dark:text-gray-300">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between">
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
              <Play className="w-4 h-4" />
              Start Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Recipe Modal Component (simplified for brevity)
function CreateRecipeModal({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void; 
  onSave: (recipe: any) => void;
}) {
  return (
    <RecipeCreationWizard
      onClose={onClose}
      onSave={onSave}
    />
  );
}