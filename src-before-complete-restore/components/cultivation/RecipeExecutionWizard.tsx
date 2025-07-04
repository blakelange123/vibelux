'use client';

import React, { useState } from 'react';
import { recipeEngine, CultivationRecipe } from '@/lib/cultivation/recipe-engine';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Calendar,
  MapPin,
  Settings,
  Play,
  BookOpen,
  Home,
  Users,
  Zap,
  CheckCircle,
  X
} from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ExecutionConfig {
  recipeId: string;
  projectId: string;
  roomId: string;
  startDate: Date;
  plantCount: number;
  batchName: string;
  notes: string;
  automationOverrides: {
    temperature: boolean;
    humidity: boolean;
    co2: boolean;
    light: boolean;
    irrigation: boolean;
  };
}

export function RecipeExecutionWizard({
  recipe,
  onClose,
  onStart
}: {
  recipe?: CultivationRecipe;
  onClose: () => void;
  onStart: (config: ExecutionConfig) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<ExecutionConfig>({
    recipeId: recipe?.id || '',
    projectId: '',
    roomId: '',
    startDate: new Date(),
    plantCount: 0,
    batchName: '',
    notes: '',
    automationOverrides: {
      temperature: true,
      humidity: true,
      co2: true,
      light: true,
      irrigation: true
    }
  });

  const steps: WizardStep[] = [
    {
      id: 'recipe',
      title: 'Select Recipe',
      description: 'Choose the cultivation recipe to execute',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: 'location',
      title: 'Choose Location',
      description: 'Select the grow room and project',
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'details',
      title: 'Batch Details',
      description: 'Configure batch information',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'automation',
      title: 'Automation Settings',
      description: 'Configure automated controls',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'review',
      title: 'Review & Start',
      description: 'Confirm settings and begin',
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!config.recipeId;
      case 1: return !!config.projectId && !!config.roomId;
      case 2: return config.plantCount > 0 && !!config.batchName;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStart = async () => {
    try {
      await onStart(config);
      onClose();
    } catch (error) {
      console.error('Failed to start recipe:', error);
    }
  };

  // Mock data
  const availableRecipes: CultivationRecipe[] = recipe ? [recipe] : [
    {
      id: 'recipe_1',
      name: 'Blue Dream - Fast Flower',
      description: 'Optimized for speed',
      category: 'hybrid',
      totalDuration: 63,
      stages: [],
      metadata: {
        author: 'Master Grower',
        version: '2.1',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['fast', 'beginner'],
        notes: '',
        expectedYield: { min: 450, max: 550, average: 500 },
        difficulty: 'beginner',
        tested: true
      }
    }
  ];

  const projects = [
    { id: 'project_1', name: 'Main Facility' },
    { id: 'project_2', name: 'R&D Lab' }
  ];

  const rooms = [
    { id: 'room_1', name: 'Flower Room A', projectId: 'project_1' },
    { id: 'room_2', name: 'Flower Room B', projectId: 'project_1' },
    { id: 'room_3', name: 'Veg Room', projectId: 'project_1' },
    { id: 'room_4', name: 'Test Chamber', projectId: 'project_2' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Start Recipe Execution
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index < currentStep ? 'bg-green-600 text-white' :
                    index === currentStep ? 'bg-purple-600 text-white' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}>
                    {index < currentStep ? <Check className="w-5 h-5" /> : step.icon}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      index === currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 250px)' }}>
          {/* Step 1: Select Recipe */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {steps[0].title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {steps[0].description}
                </p>
              </div>

              <div className="space-y-3">
                {availableRecipes.map(r => (
                  <label
                    key={r.id}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      config.recipeId === r.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recipe"
                      value={r.id}
                      checked={config.recipeId === r.id}
                      onChange={(e) => setConfig({ ...config, recipeId: e.target.value })}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {r.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {r.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{r.totalDuration} days</span>
                          <span>{r.metadata.expectedYield.average}g avg yield</span>
                          <span className="capitalize">{r.metadata.difficulty}</span>
                        </div>
                      </div>
                      {config.recipeId === r.id && (
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Choose Location */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {steps[1].title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {steps[1].description}
                </p>
              </div>

              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project
                </label>
                <select
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value, roomId: '' })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Selection */}
              {config.projectId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grow Room
                  </label>
                  <div className="space-y-2">
                    {rooms
                      .filter(room => room.projectId === config.projectId)
                      .map(room => (
                        <label
                          key={room.id}
                          className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                            config.roomId === room.id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="room"
                            value={room.id}
                            checked={config.roomId === room.id}
                            onChange={(e) => setConfig({ ...config, roomId: e.target.value })}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {room.name}
                            </span>
                            {config.roomId === room.id && (
                              <CheckCircle className="w-5 h-5 text-purple-600" />
                            )}
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Batch Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {steps[2].title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {steps[2].description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Batch Name
                  </label>
                  <input
                    type="text"
                    value={config.batchName}
                    onChange={(e) => setConfig({ ...config, batchName: e.target.value })}
                    placeholder="e.g., BD-2024-03-A"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plant Count
                  </label>
                  <input
                    type="number"
                    value={config.plantCount || ''}
                    onChange={(e) => setConfig({ ...config, plantCount: parseInt(e.target.value) || 0 })}
                    placeholder="Number of plants"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={config.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setConfig({ ...config, startDate: new Date(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={config.notes}
                  onChange={(e) => setConfig({ ...config, notes: e.target.value })}
                  placeholder="Any special notes for this batch..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Automation Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {steps[3].title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose which parameters should be automatically controlled
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    <p className="font-medium">Automation Notice</p>
                    <p>
                      Automated controls will adjust your equipment to maintain optimal conditions.
                      You can override these settings at any time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(config.automationOverrides).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setConfig({
                          ...config,
                          automationOverrides: {
                            ...config.automationOverrides,
                            [key]: e.target.checked
                          }
                        })}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {key}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Auto-adjust {key} based on recipe parameters
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm ${value ? 'text-green-600' : 'text-gray-500'}`}>
                      {value ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Review & Start */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {steps[4].title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Review your settings before starting the recipe
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Recipe</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {availableRecipes.find(r => r.id === config.recipeId)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {rooms.find(r => r.id === config.roomId)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Batch Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {config.batchName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Plant Count</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {config.plantCount} plants
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Start Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {config.startDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {availableRecipes.find(r => r.id === config.recipeId)?.totalDuration} days
                    </p>
                  </div>
                </div>

                {config.notes && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Notes</p>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {config.notes}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Automation Settings
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(config.automationOverrides).map(([key, value]) => (
                      <span
                        key={key}
                        className={`px-3 py-1 text-sm rounded-full capitalize ${
                          value
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Play className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    <p className="font-medium">Ready to Start</p>
                    <p>
                      The recipe will begin immediately and environmental controls will be adjusted
                      according to the recipe parameters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Recipe
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}