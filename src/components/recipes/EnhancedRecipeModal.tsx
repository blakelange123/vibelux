'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Save,
  Copy,
  AlertCircle,
  Check,
  ChevronRight,
  Beaker,
  Sun,
  Droplets,
  Wind,
  Thermometer,
  Activity,
  Zap,
  BarChart3,
  FileText,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react';
import { SpectrumControl } from './SpectrumControl';

interface GrowthStage {
  id: string;
  name: string;
  duration: number;
  ppfd: number;
  photoperiod: number;
  temperature: { day: number; night: number };
  humidity: { day: number; night: number };
  co2: number;
  spectrum?: Record<string, number>;
  irrigation?: {
    frequency: string;
    amount: number;
    ec: number;
    ph: number;
  };
  notes?: string;
}

interface Recipe {
  name: string;
  cropType: string;
  variety?: string;
  expectedYield: number;
  yieldUnit: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  totalDuration: number;
  stages: GrowthStage[];
  notes?: string;
  tags?: string[];
}

interface EnhancedRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  initialRecipe?: Partial<Recipe>;
}

const defaultStages: GrowthStage[] = [
  {
    id: 'germination',
    name: 'Germination',
    duration: 7,
    ppfd: 100,
    photoperiod: 18,
    temperature: { day: 72, night: 68 },
    humidity: { day: 80, night: 85 },
    co2: 400,
    irrigation: {
      frequency: 'twice daily',
      amount: 50,
      ec: 0.8,
      ph: 5.8
    }
  },
  {
    id: 'seedling',
    name: 'Seedling',
    duration: 14,
    ppfd: 200,
    photoperiod: 18,
    temperature: { day: 73, night: 68 },
    humidity: { day: 70, night: 75 },
    co2: 600,
    irrigation: {
      frequency: 'daily',
      amount: 100,
      ec: 1.2,
      ph: 5.8
    }
  },
  {
    id: 'vegetative',
    name: 'Vegetative',
    duration: 21,
    ppfd: 300,
    photoperiod: 16,
    temperature: { day: 75, night: 68 },
    humidity: { day: 65, night: 70 },
    co2: 800,
    irrigation: {
      frequency: 'twice daily',
      amount: 200,
      ec: 1.8,
      ph: 6.0
    }
  }
];

const cropTypes = [
  { value: 'leafy-greens', label: 'Leafy Greens', icon: '🥬' },
  { value: 'herbs', label: 'Herbs', icon: '🌿' },
  { value: 'microgreens', label: 'Microgreens', icon: '🌱' },
  { value: 'tomatoes', label: 'Tomatoes', icon: '🍅' },
  { value: 'strawberries', label: 'Strawberries', icon: '🍓' },
  { value: 'peppers', label: 'Peppers', icon: '🌶️' },
  { value: 'cucumbers', label: 'Cucumbers', icon: '🥒' },
  { value: 'cannabis', label: 'Cannabis', icon: '🌿' }
];

export function EnhancedRecipeModal({
  isOpen,
  onClose,
  onSave,
  initialRecipe
}: EnhancedRecipeModalProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'stages' | 'review'>('basics');
  const [recipe, setRecipe] = useState<Recipe>({
    name: '',
    cropType: '',
    expectedYield: 0,
    yieldUnit: 'g/plant',
    difficulty: 'Medium',
    totalDuration: 0,
    stages: defaultStages,
    ...initialRecipe
  });
  const [selectedStage, setSelectedStage] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateTotalDuration = () => {
    return recipe.stages.reduce((sum, stage) => sum + stage.duration, 0);
  };

  const validateRecipe = () => {
    const newErrors: Record<string, string> = {};
    
    if (!recipe.name) newErrors.name = 'Recipe name is required';
    if (!recipe.cropType) newErrors.cropType = 'Crop type is required';
    if (recipe.expectedYield <= 0) newErrors.yield = 'Expected yield must be greater than 0';
    if (recipe.stages.length === 0) newErrors.stages = 'At least one growth stage is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateRecipe()) {
      onSave({
        ...recipe,
        totalDuration: calculateTotalDuration()
      });
      onClose();
    }
  };

  const updateStage = (index: number, updates: Partial<GrowthStage>) => {
    const newStages = [...recipe.stages];
    newStages[index] = { ...newStages[index], ...updates };
    setRecipe({ ...recipe, stages: newStages });
  };

  const addStage = () => {
    const newStage: GrowthStage = {
      id: `stage-${Date.now()}`,
      name: `Stage ${recipe.stages.length + 1}`,
      duration: 7,
      ppfd: 250,
      photoperiod: 16,
      temperature: { day: 72, night: 68 },
      humidity: { day: 65, night: 70 },
      co2: 600,
      irrigation: {
        frequency: 'daily',
        amount: 150,
        ec: 1.5,
        ph: 6.0
      }
    };
    setRecipe({ ...recipe, stages: [...recipe.stages, newStage] });
  };

  const removeStage = (index: number) => {
    const newStages = recipe.stages.filter((_, i) => i !== index);
    setRecipe({ ...recipe, stages: newStages });
    if (selectedStage >= newStages.length) {
      setSelectedStage(Math.max(0, newStages.length - 1));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Beaker className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-semibold text-white">
                  {initialRecipe ? 'Edit Recipe' : 'Create New Recipe'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {[
                { id: 'basics', label: 'Basic Info', icon: FileText },
                { id: 'stages', label: 'Growth Stages', icon: Activity },
                { id: 'review', label: 'Review & Save', icon: Save }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-6 py-3 flex items-center justify-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gray-800 text-purple-500 border-b-2 border-purple-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'basics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Recipe Name *
                      </label>
                      <input
                        type="text"
                        value={recipe.name}
                        onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                        placeholder="e.g., High Yield Buttercrunch Lettuce"
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 ${
                          errors.name ? 'border-red-500' : 'border-gray-700'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Crop Type *
                      </label>
                      <select
                        value={recipe.cropType}
                        onChange={(e) => setRecipe({ ...recipe, cropType: e.target.value })}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white ${
                          errors.cropType ? 'border-red-500' : 'border-gray-700'
                        }`}
                      >
                        <option value="">Select crop type</option>
                        {cropTypes.map((crop) => (
                          <option key={crop.value} value={crop.value}>
                            {crop.icon} {crop.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Variety/Cultivar
                      </label>
                      <input
                        type="text"
                        value={recipe.variety || ''}
                        onChange={(e) => setRecipe({ ...recipe, variety: e.target.value })}
                        placeholder="e.g., Buttercrunch, Rex, Salanova"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={recipe.difficulty}
                        onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value as any })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="Easy">Easy - Beginner Friendly</option>
                        <option value="Medium">Medium - Some Experience</option>
                        <option value="Hard">Hard - Advanced Grower</option>
                        <option value="Expert">Expert - Master Level</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expected Yield *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={recipe.expectedYield}
                          onChange={(e) => setRecipe({ ...recipe, expectedYield: parseFloat(e.target.value) || 0 })}
                          className={`flex-1 px-4 py-3 bg-gray-800 border rounded-lg text-white ${
                            errors.yield ? 'border-red-500' : 'border-gray-700'
                          }`}
                          min="0"
                          step="0.1"
                        />
                        <select
                          value={recipe.yieldUnit}
                          onChange={(e) => setRecipe({ ...recipe, yieldUnit: e.target.value })}
                          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        >
                          <option value="g/plant">g/plant</option>
                          <option value="kg/m²">kg/m²</option>
                          <option value="lbs/sqft">lbs/sqft</option>
                          <option value="units/plant">units/plant</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        placeholder="Add tags separated by commas"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const tags = e.currentTarget.value.split(',').map(t => t.trim()).filter(t => t);
                            setRecipe({ ...recipe, tags: [...(recipe.tags || []), ...tags] });
                            e.currentTarget.value = '';
                          }
                        }}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                      />
                      {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {recipe.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm flex items-center gap-1"
                            >
                              {tag}
                              <button
                                onClick={() => {
                                  const newTags = recipe.tags?.filter((_, i) => i !== index);
                                  setRecipe({ ...recipe, tags: newTags });
                                }}
                                className="hover:text-purple-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Recipe Notes
                    </label>
                    <textarea
                      value={recipe.notes || ''}
                      onChange={(e) => setRecipe({ ...recipe, notes: e.target.value })}
                      placeholder="Optional notes about this recipe..."
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'stages' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Stage List */}
                  <div className="lg:col-span-1 space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Growth Stages</h3>
                      <button
                        onClick={addStage}
                        className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {recipe.stages.map((stage, index) => (
                      <div
                        key={stage.id}
                        onClick={() => setSelectedStage(index)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedStage === index
                            ? 'bg-purple-600/20 border-purple-500'
                            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{stage.name}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeStage(index);
                            }}
                            className="p-1 hover:bg-gray-700 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                        <div className="text-sm text-gray-400">
                          <p>{stage.duration} days</p>
                          <p>{stage.ppfd} PPFD • {stage.photoperiod}h light</p>
                        </div>
                      </div>
                    ))}

                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Total Duration:</p>
                      <p className="text-2xl font-bold text-white">{calculateTotalDuration()} days</p>
                    </div>
                  </div>

                  {/* Stage Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {recipe.stages.length > 0 && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Stage Name
                          </label>
                          <input
                            type="text"
                            value={recipe.stages[selectedStage].name}
                            onChange={(e) => updateStage(selectedStage, { name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Duration (days)
                            </label>
                            <input
                              type="number"
                              value={recipe.stages[selectedStage].duration}
                              onChange={(e) => updateStage(selectedStage, { duration: parseInt(e.target.value) || 0 })}
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                              min="1"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              CO₂ Level (ppm)
                            </label>
                            <input
                              type="number"
                              value={recipe.stages[selectedStage].co2}
                              onChange={(e) => updateStage(selectedStage, { co2: parseInt(e.target.value) || 0 })}
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                              min="0"
                              max="2000"
                            />
                          </div>
                        </div>

                        {/* Temperature & Humidity */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                              <Thermometer className="w-4 h-4" />
                              Temperature (°F)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Day</label>
                                <input
                                  type="number"
                                  value={recipe.stages[selectedStage].temperature.day}
                                  onChange={(e) => updateStage(selectedStage, {
                                    temperature: {
                                      ...recipe.stages[selectedStage].temperature,
                                      day: parseInt(e.target.value) || 0
                                    }
                                  })}
                                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Night</label>
                                <input
                                  type="number"
                                  value={recipe.stages[selectedStage].temperature.night}
                                  onChange={(e) => updateStage(selectedStage, {
                                    temperature: {
                                      ...recipe.stages[selectedStage].temperature,
                                      night: parseInt(e.target.value) || 0
                                    }
                                  })}
                                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                              <Droplets className="w-4 h-4" />
                              Humidity (%)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Day</label>
                                <input
                                  type="number"
                                  value={recipe.stages[selectedStage].humidity.day}
                                  onChange={(e) => updateStage(selectedStage, {
                                    humidity: {
                                      ...recipe.stages[selectedStage].humidity,
                                      day: parseInt(e.target.value) || 0
                                    }
                                  })}
                                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Night</label>
                                <input
                                  type="number"
                                  value={recipe.stages[selectedStage].humidity.night}
                                  onChange={(e) => updateStage(selectedStage, {
                                    humidity: {
                                      ...recipe.stages[selectedStage].humidity,
                                      night: parseInt(e.target.value) || 0
                                    }
                                  })}
                                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Light Spectrum */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Light Spectrum & Intensity
                          </h4>
                          <SpectrumControl
                            initialSpectrum={recipe.stages[selectedStage].spectrum}
                            onSpectrumChange={(data) => {
                              updateStage(selectedStage, {
                                spectrum: data.spectrum,
                                ppfd: data.ppfd,
                                photoperiod: data.photoperiod
                              });
                            }}
                            stage={recipe.stages[selectedStage].name}
                          />
                        </div>

                        {/* Irrigation */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                            <Droplets className="w-4 h-4" />
                            Irrigation Settings
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                              <select
                                value={recipe.stages[selectedStage].irrigation?.frequency || 'daily'}
                                onChange={(e) => updateStage(selectedStage, {
                                  irrigation: {
                                    ...recipe.stages[selectedStage].irrigation!,
                                    frequency: e.target.value
                                  }
                                })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                              >
                                <option value="hourly">Hourly</option>
                                <option value="twice daily">Twice Daily</option>
                                <option value="daily">Daily</option>
                                <option value="every 2 days">Every 2 Days</option>
                                <option value="weekly">Weekly</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Amount (ml)</label>
                              <input
                                type="number"
                                value={recipe.stages[selectedStage].irrigation?.amount || 0}
                                onChange={(e) => updateStage(selectedStage, {
                                  irrigation: {
                                    ...recipe.stages[selectedStage].irrigation!,
                                    amount: parseInt(e.target.value) || 0
                                  }
                                })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">EC (mS/cm)</label>
                              <input
                                type="number"
                                value={recipe.stages[selectedStage].irrigation?.ec || 0}
                                onChange={(e) => updateStage(selectedStage, {
                                  irrigation: {
                                    ...recipe.stages[selectedStage].irrigation!,
                                    ec: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                step="0.1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">pH</label>
                              <input
                                type="number"
                                value={recipe.stages[selectedStage].irrigation?.ph || 0}
                                onChange={(e) => updateStage(selectedStage, {
                                  irrigation: {
                                    ...recipe.stages[selectedStage].irrigation!,
                                    ph: parseFloat(e.target.value) || 0
                                  }
                                })}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                step="0.1"
                                min="0"
                                max="14"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Stage Notes
                          </label>
                          <textarea
                            value={recipe.stages[selectedStage].notes || ''}
                            onChange={(e) => updateStage(selectedStage, { notes: e.target.value })}
                            placeholder="Optional notes for this stage..."
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'review' && (
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Recipe Summary</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-400">Recipe Name</p>
                        <p className="text-lg font-medium text-white">{recipe.name || 'Unnamed Recipe'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Crop Type</p>
                        <p className="text-lg font-medium text-white">
                          {cropTypes.find(c => c.value === recipe.cropType)?.label || 'Not selected'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Expected Yield</p>
                        <p className="text-lg font-medium text-white">
                          {recipe.expectedYield} {recipe.yieldUnit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Duration</p>
                        <p className="text-lg font-medium text-white">{calculateTotalDuration()} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Difficulty</p>
                        <p className="text-lg font-medium text-white">{recipe.difficulty}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Growth Stages</p>
                        <p className="text-lg font-medium text-white">{recipe.stages.length} stages</p>
                      </div>
                    </div>
                  </div>

                  {/* Stage Timeline */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Growth Timeline</h3>
                    <div className="relative">
                      <div className="absolute left-0 top-6 w-full h-1 bg-gray-700 rounded-full" />
                      <div className="relative flex justify-between">
                        {recipe.stages.map((stage, index) => {
                          const startDay = recipe.stages.slice(0, index).reduce((sum, s) => sum + s.duration, 0);
                          const percentage = (startDay / calculateTotalDuration()) * 100;
                          
                          return (
                            <div
                              key={stage.id}
                              className="relative"
                              style={{ left: `${percentage}%`, position: 'absolute' }}
                            >
                              <div className="w-3 h-3 bg-purple-500 rounded-full" />
                              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center">
                                <p className="text-xs font-medium text-white whitespace-nowrap">
                                  {stage.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Day {startDay + 1}-{startDay + stage.duration}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Environmental Overview */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Environmental Requirements</h3>
                    <div className="space-y-4">
                      {recipe.stages.map((stage) => (
                        <div key={stage.id} className="border-l-2 border-purple-500 pl-4">
                          <h4 className="font-medium text-white mb-2">{stage.name}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Light</p>
                              <p className="text-white">{stage.ppfd} PPFD × {stage.photoperiod}h</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Temp</p>
                              <p className="text-white">{stage.temperature.day}/{stage.temperature.night}°F</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Humidity</p>
                              <p className="text-white">{stage.humidity.day}/{stage.humidity.night}%</p>
                            </div>
                            <div>
                              <p className="text-gray-400">CO₂</p>
                              <p className="text-white">{stage.co2} ppm</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {errors.stages && (
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                      <p className="text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {errors.stages}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-700">
              <div className="flex items-center gap-4">
                {activeTab !== 'basics' && (
                  <button
                    onClick={() => {
                      const tabs: Array<'basics' | 'stages' | 'review'> = ['basics', 'stages', 'review'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1]);
                      }
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Previous
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                
                {activeTab === 'review' ? (
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Recipe
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const tabs: Array<'basics' | 'stages' | 'review'> = ['basics', 'stages', 'review'];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}