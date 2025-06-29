'use client';

import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Beaker,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  Copy
} from 'lucide-react';
import { CultivationRecipe, RecipeStage } from '@/lib/cultivation/recipe-engine';

interface RecipeCreationWizardProps {
  onClose: () => void;
  onSave: (recipe: Partial<CultivationRecipe>) => void;
  existingRecipe?: CultivationRecipe;
}

export function RecipeCreationWizard({ onClose, onSave, existingRecipe }: RecipeCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Recipe data
  const [recipeName, setRecipeName] = useState(existingRecipe?.name || '');
  const [description, setDescription] = useState(existingRecipe?.description || '');
  const [strainName, setStrainName] = useState(existingRecipe?.strainName || '');
  const [category, setCategory] = useState(existingRecipe?.category || 'hybrid');
  const [difficulty, setDifficulty] = useState(existingRecipe?.metadata?.difficulty || 'intermediate');
  const [stages, setStages] = useState<RecipeStage[]>(existingRecipe?.stages || [
    createDefaultStage('Seedling', 1, 7),
    createDefaultStage('Vegetative', 2, 28),
    createDefaultStage('Flowering', 3, 56),
    createDefaultStage('Flush', 4, 7)
  ]);

  function createDefaultStage(name: string, order: number, duration: number): RecipeStage {
    return {
      id: `stage_${Date.now()}_${order}`,
      name,
      duration,
      order,
      environmental: {
        temperature: {
          day: { min: 72, max: 82, optimal: 77 },
          night: { min: 65, max: 75, optimal: 70 }
        },
        humidity: {
          day: { min: 40, max: 60, optimal: 50 },
          night: { min: 45, max: 65, optimal: 55 }
        },
        co2: {
          day: { min: 800, max: 1500, optimal: 1200 },
          night: { min: 400, max: 600, optimal: 500 }
        },
        vpd: {
          day: { min: 0.8, max: 1.2, optimal: 1.0 },
          night: { min: 0.6, max: 1.0, optimal: 0.8 }
        },
        light: {
          photoperiod: name === 'Flowering' ? 12 : 18,
          intensity: name === 'Seedling' ? 200 : name === 'Vegetative' ? 600 : 900,
          spectrum: {
            red: name === 'Flowering' ? 40 : 30,
            blue: name === 'Vegetative' ? 30 : 20,
            white: 30,
            farRed: name === 'Flowering' ? 5 : 0,
            uv: 0
          },
          sunrise: 30,
          sunset: 30
        }
      },
      irrigation: {
        frequency: 'daily',
        duration: 5,
        ec: { min: 1.2, max: 2.0, optimal: 1.6 },
        ph: { min: 5.8, max: 6.2, optimal: 6.0 },
        nutrients: {
          nitrogen: name === 'Vegetative' ? 150 : 100,
          phosphorus: name === 'Flowering' ? 100 : 50,
          potassium: name === 'Flowering' ? 150 : 100,
          calcium: 100,
          magnesium: 50,
          sulfur: 50,
          micronutrients: {}
        }
      },
      automation: {
        adjustTemperature: true,
        adjustHumidity: true,
        adjustCO2: true,
        adjustLight: true,
        adjustIrrigation: true,
        notifyOnDeviation: true,
        autoCorrectDeviation: true,
        maxDeviationPercent: 10
      }
    };
  }

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
    const recipe: Partial<CultivationRecipe> = {
      id: existingRecipe?.id || `recipe_${Date.now()}`,
      name: recipeName,
      description,
      strainName,
      category: category as any,
      totalDuration,
      stages,
      metadata: {
        author: existingRecipe?.metadata?.author || 'Current User',
        version: existingRecipe?.metadata?.version || '1.0',
        createdAt: existingRecipe?.metadata?.createdAt || new Date(),
        updatedAt: new Date(),
        tags: [],
        notes: '',
        expectedYield: {
          min: 400,
          max: 600,
          average: 500
        },
        difficulty: difficulty as any,
        tested: false,
        successRate: undefined
      }
    };
    onSave(recipe);
  };

  const addStage = () => {
    const newStage = createDefaultStage(`Stage ${stages.length + 1}`, stages.length + 1, 7);
    setStages([...stages, newStage]);
  };

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      const newStages = stages.filter((_, i) => i !== index);
      // Update order numbers
      newStages.forEach((stage, i) => {
        stage.order = i + 1;
      });
      setStages(newStages);
    }
  };

  const duplicateStage = (index: number) => {
    const stageToDuplicate = stages[index];
    const newStage = {
      ...JSON.parse(JSON.stringify(stageToDuplicate)), // Deep clone
      id: `stage_${Date.now()}_${stages.length + 1}`,
      name: `${stageToDuplicate.name} (Copy)`,
      order: stages.length + 1
    };
    setStages([...stages, newStage]);
  };

  const updateStage = (index: number, updates: Partial<RecipeStage>) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], ...updates };
    setStages(newStages);
  };

  const updateStageEnvironmental = (index: number, path: string, value: any) => {
    const newStages = [...stages];
    const keys = path.split('.');
    let current: any = newStages[index].environmental;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setStages(newStages);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {existingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === currentStep
                      ? 'bg-purple-600 text-white'
                      : step < currentStep
                      ? 'bg-purple-200 text-purple-700'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-purple-200' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            {currentStep === 1 && 'Basic Information'}
            {currentStep === 2 && 'Growth Stages'}
            {currentStep === 3 && 'Environmental Settings'}
            {currentStep === 4 && 'Review & Save'}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipe Name *
                </label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Blue Dream - Fast Flower"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Describe your recipe..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Strain Name
                </label>
                <input
                  type="text"
                  value={strainName}
                  onChange={(e) => setStrainName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Blue Dream"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="indica">Indica</option>
                  <option value="sativa">Sativa</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="autoflower">Autoflower</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Growth Stages */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Growth Stages
                </h3>
                <button
                  onClick={addStage}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Stage
                </button>
              </div>

              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => updateStage(index, { name: e.target.value })}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => duplicateStage(index)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                          title="Duplicate stage"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => removeStage(index)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          disabled={stages.length === 1}
                          title="Remove stage"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Duration:
                        </label>
                        <input
                          type="number"
                          value={stage.duration}
                          onChange={(e) => updateStage(index, { duration: parseInt(e.target.value) || 0 })}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          min="1"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      Total cycle duration: {stages.reduce((sum, stage) => sum + stage.duration, 0)} days
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      You can adjust environmental parameters for each stage in the next step.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Environmental Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Environmental Settings
              </h3>

              {stages.map((stage, stageIndex) => (
                <div key={stage.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-medium">
                      {stageIndex + 1}
                    </div>
                    {stage.name} ({stage.duration} days)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Temperature */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Thermometer className="w-4 h-4" />
                        Temperature (°F)
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-12">Day:</span>
                          <input
                            type="number"
                            value={stage.environmental.temperature.day.optimal}
                            onChange={(e) => updateStageEnvironmental(stageIndex, 'temperature.day.optimal', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          />
                          <span className="text-xs text-gray-500">°F</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-12">Night:</span>
                          <input
                            type="number"
                            value={stage.environmental.temperature.night.optimal}
                            onChange={(e) => updateStageEnvironmental(stageIndex, 'temperature.night.optimal', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          />
                          <span className="text-xs text-gray-500">°F</span>
                        </div>
                      </div>
                    </div>

                    {/* Humidity */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Droplets className="w-4 h-4" />
                        Humidity (%)
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-12">Day:</span>
                          <input
                            type="number"
                            value={stage.environmental.humidity.day.optimal}
                            onChange={(e) => updateStageEnvironmental(stageIndex, 'humidity.day.optimal', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-12">Night:</span>
                          <input
                            type="number"
                            value={stage.environmental.humidity.night.optimal}
                            onChange={(e) => updateStageEnvironmental(stageIndex, 'humidity.night.optimal', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                    </div>

                    {/* CO2 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Wind className="w-4 h-4" />
                        CO₂ (PPM)
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-12">Day:</span>
                          <input
                            type="number"
                            value={stage.environmental.co2.day.optimal}
                            onChange={(e) => updateStageEnvironmental(stageIndex, 'co2.day.optimal', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          />
                          <span className="text-xs text-gray-500">ppm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-12">Night:</span>
                          <input
                            type="number"
                            value={stage.environmental.co2.night.optimal}
                            onChange={(e) => updateStageEnvironmental(stageIndex, 'co2.night.optimal', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          />
                          <span className="text-xs text-gray-500">ppm</span>
                        </div>
                      </div>
                    </div>

                    {/* Light */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Sun className="w-4 h-4" />
                        Light Settings
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-20">Photoperiod:</span>
                          <input
                            type="number"
                            value={stage.environmental.light.photoperiod}
                            onChange={(e) => updateStageEnvironmental(stageIndex, 'light.photoperiod', parseFloat(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                            min="0"
                            max="24"
                          />
                          <span className="text-xs text-gray-500">hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-20">PPFD:</span>
                          <input
                            type="number"
                            value={stage.environmental.light.intensity}
                            onChange={(e) => updateStageEnvironmental(stageIndex, 'light.intensity', parseFloat(e.target.value))}
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm"
                          />
                          <span className="text-xs text-gray-500">μmol</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Review & Save */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Review Recipe
              </h3>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Basic Information</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Name:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{recipeName || 'Unnamed Recipe'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Strain:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{strainName || 'Not specified'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Category:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white capitalize">{category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Difficulty:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white capitalize">{difficulty}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Total Duration:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {stages.reduce((sum, stage) => sum + stage.duration, 0)} days
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Growth Stages</h4>
                  <div className="space-y-2">
                    {stages.map((stage, index) => (
                      <div key={stage.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-gray-900 dark:text-white">{stage.name}</span>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">{stage.duration} days</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!recipeName && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Please provide a recipe name before saving.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousStep}
              className={`flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                currentStep === 1 ? 'invisible' : ''
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!recipeName}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Save Recipe
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}