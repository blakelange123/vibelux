'use client';

import React, { useState, useEffect } from 'react';
import { recipeEngine, RecipeExecution, CultivationRecipe, Deviation } from '@/lib/cultivation/recipe-engine';
import {
  Play,
  Pause,
  Stop,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Settings,
  MessageSquare,
  BarChart3,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Activity,
  ChevronRight,
  AlertCircle,
  Edit,
  Save,
  X,
  Plus
} from 'lucide-react';

interface ActiveRecipe {
  execution: RecipeExecution;
  recipe: CultivationRecipe;
  currentStage: any;
  progress: number;
  daysRemaining: number;
  healthScore: number;
}

export function RecipeMonitor() {
  const [activeRecipes, setActiveRecipes] = useState<ActiveRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<ActiveRecipe | null>(null);
  const [showDeviations, setShowDeviations] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Load active recipes
  useEffect(() => {
    loadActiveRecipes();
    
    // Subscribe to recipe events
    recipeEngine.on('recipe:started', loadActiveRecipes);
    recipeEngine.on('recipe:stage-advanced', loadActiveRecipes);
    recipeEngine.on('recipe:deviation', handleDeviation);
    recipeEngine.on('recipe:completed', loadActiveRecipes);

    return () => {
      recipeEngine.off('recipe:started', loadActiveRecipes);
      recipeEngine.off('recipe:stage-advanced', loadActiveRecipes);
      recipeEngine.off('recipe:deviation', handleDeviation);
      recipeEngine.off('recipe:completed', loadActiveRecipes);
    };
  }, []);

  const loadActiveRecipes = async () => {
    // Mock data for demo
    const mockActiveRecipes: ActiveRecipe[] = [
      {
        execution: {
          id: 'exec_1',
          recipeId: 'recipe_1',
          projectId: 'project_1',
          roomId: 'room_1',
          startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
          currentStageId: 'veg',
          currentDay: 21,
          status: 'active',
          deviations: [
            {
              id: 'dev_1',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              parameter: 'temperature',
              expectedValue: 75,
              actualValue: 82,
              deviation: 7,
              severity: 'medium',
              resolved: true,
              resolution: 'HVAC adjusted automatically'
            }
          ],
          adjustments: [],
          notes: []
        },
        recipe: {
          id: 'recipe_1',
          name: 'Blue Dream - Fast Flower',
          description: 'Optimized recipe',
          category: 'hybrid',
          totalDuration: 63,
          stages: recipeEngine.constructor.getTemplates()[0].stages as any,
          metadata: {
            author: 'Master Grower',
            version: '2.1',
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: [],
            notes: '',
            expectedYield: { min: 450, max: 550, average: 500 },
            difficulty: 'beginner',
            tested: true
          }
        },
        currentStage: recipeEngine.constructor.getTemplates()[0].stages![0],
        progress: 33,
        daysRemaining: 42,
        healthScore: 92
      },
      {
        execution: {
          id: 'exec_2',
          recipeId: 'recipe_2',
          projectId: 'project_1',
          roomId: 'room_2',
          startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          currentStageId: 'flower',
          currentDay: 45,
          status: 'active',
          deviations: [],
          adjustments: [],
          notes: [
            {
              id: 'note_1',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
              author: 'Grower',
              content: 'Plants looking healthy, slight yellowing on lower leaves',
              type: 'observation'
            }
          ]
        },
        recipe: {
          id: 'recipe_2',
          name: 'OG Kush - Premium',
          description: 'Premium quality focus',
          category: 'indica',
          totalDuration: 77,
          stages: recipeEngine.constructor.getTemplates()[0].stages as any,
          metadata: {
            author: 'Cannabis Labs',
            version: '3.0',
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: [],
            notes: '',
            expectedYield: { min: 400, max: 480, average: 440 },
            difficulty: 'advanced',
            tested: true
          }
        },
        currentStage: recipeEngine.constructor.getTemplates()[0].stages![1],
        progress: 58,
        daysRemaining: 32,
        healthScore: 88
      }
    ];

    setActiveRecipes(mockActiveRecipes);
  };

  const handleDeviation = (data: any) => {
    // Update deviations in real-time
    loadActiveRecipes();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'paused': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'aborted': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const pauseRecipe = async (executionId: string) => {
    // Implement pause logic
  };

  const stopRecipe = async (executionId: string) => {
    // Implement stop logic
  };

  const addNote = async (executionId: string, note: string) => {
    // Implement add note logic
    setNewNote('');
    loadActiveRecipes();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-purple-500" />
            Active Recipes
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and manage running cultivation protocols
          </p>
        </div>
        <button
          onClick={() => setShowDeviations(!showDeviations)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            showDeviations
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Deviations
        </button>
      </div>

      {/* Active Recipe Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activeRecipes.map(recipe => (
          <div
            key={recipe.execution.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            {/* Recipe Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {recipe.recipe.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Room: {recipe.execution.roomId} • Day {recipe.execution.currentDay} of {recipe.recipe.totalDuration}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(recipe.execution.status)}`}>
                {recipe.execution.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{recipe.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${recipe.progress}%` }}
                />
              </div>
            </div>

            {/* Current Stage */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Current Stage: {recipe.currentStage.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {recipe.daysRemaining} days remaining
                  </p>
                </div>
                <div className={`text-2xl font-bold ${getHealthColor(recipe.healthScore)}`}>
                  {recipe.healthScore}%
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2 mb-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <Thermometer className="w-4 h-4 mx-auto mb-1 text-red-500" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Temp</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">75°F</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-gray-600 dark:text-gray-400">RH</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">65%</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <Wind className="w-4 h-4 mx-auto mb-1 text-green-500" />
                <p className="text-xs text-gray-600 dark:text-gray-400">CO₂</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">850ppm</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <Sun className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                <p className="text-xs text-gray-600 dark:text-gray-400">PPFD</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">400</p>
              </div>
            </div>

            {/* Recent Activity */}
            {recipe.execution.deviations.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Recent Activity
                </p>
                <div className="space-y-1">
                  {recipe.execution.deviations.slice(-2).map(deviation => (
                    <div
                      key={deviation.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <AlertCircle className={`w-4 h-4 ${
                        deviation.resolved ? 'text-green-500' : 'text-orange-500'
                      }`} />
                      <span className="text-gray-600 dark:text-gray-400">
                        {deviation.parameter} deviation
                        {deviation.resolved && ' (resolved)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedRecipe(recipe)}
                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
              >
                <BarChart3 className="w-4 h-4" />
                Details
              </button>
              <button
                onClick={() => pauseRecipe(recipe.execution.id)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <Pause className="w-4 h-4" />
              </button>
              <button
                onClick={() => stopRecipe(recipe.execution.id)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                <Stop className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {activeRecipes.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No active recipes</p>
          <button className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Start a Recipe
          </button>
        </div>
      )}

      {/* Deviations Panel */}
      {showDeviations && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            All Deviations
          </h3>
          <div className="space-y-3">
            {activeRecipes.flatMap(recipe => 
              recipe.execution.deviations.map(deviation => (
                <div
                  key={deviation.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`w-5 h-5 ${
                      deviation.resolved ? 'text-green-500' : 'text-orange-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {deviation.parameter} Deviation
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Expected: {deviation.expectedValue}, Actual: {deviation.actualValue}
                        {deviation.resolved && ` • ${deviation.resolution}`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    deviation.severity === 'critical' ? 'bg-red-100 text-red-600' :
                    deviation.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                    deviation.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {deviation.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeExecutionDetail
          activeRecipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onAddNote={(note) => addNote(selectedRecipe.execution.id, note)}
        />
      )}
    </div>
  );
}

// Recipe Execution Detail Modal
function RecipeExecutionDetail({
  activeRecipe,
  onClose,
  onAddNote
}: {
  activeRecipe: ActiveRecipe;
  onClose: () => void;
  onAddNote: (note: string) => void;
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeRecipe.recipe.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Day {activeRecipe.execution.currentDay} • {activeRecipe.currentStage.name}
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
            {['overview', 'parameters', 'history', 'notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Health Score */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Health Score
                </h3>
                <div className={`text-5xl font-bold ${getHealthColor(activeRecipe.healthScore)}`}>
                  {activeRecipe.healthScore}%
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Based on environmental parameters and growth patterns
                </p>
              </div>

              {/* Stage Progress */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Stage Progress
                </h3>
                <div className="space-y-3">
                  {activeRecipe.recipe.stages.map((stage, index) => {
                    const isActive = stage.id === activeRecipe.execution.currentStageId;
                    const isPast = index < activeRecipe.recipe.stages.findIndex(s => s.id === activeRecipe.execution.currentStageId);
                    
                    return (
                      <div
                        key={stage.id}
                        className={`flex items-center gap-4 p-3 rounded-lg ${
                          isActive ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-500' :
                          isPast ? 'bg-gray-50 dark:bg-gray-700' :
                          'bg-gray-50 dark:bg-gray-700 opacity-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          isActive ? 'bg-purple-600 text-white' :
                          isPast ? 'bg-green-600 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {isPast ? <CheckCircle className="w-5 h-5" /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stage.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {stage.duration} days
                          </p>
                        </div>
                        {isActive && (
                          <span className="text-sm text-purple-600 dark:text-purple-400">
                            Active
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Deviations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Deviations
                </h3>
                {activeRecipe.execution.deviations.length > 0 ? (
                  <div className="space-y-2">
                    {activeRecipe.execution.deviations.slice(-5).map(deviation => (
                      <div
                        key={deviation.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className={`w-5 h-5 ${
                            deviation.resolved ? 'text-green-500' : 'text-orange-500'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {deviation.parameter}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(deviation.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {deviation.actualValue} (expected: {deviation.expectedValue})
                          </p>
                          {deviation.resolved && (
                            <p className="text-xs text-green-600">Resolved</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No deviations recorded</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                  rows={3}
                />
                <button
                  onClick={() => {
                    if (newNote.trim()) {
                      onAddNote(newNote);
                      setNewNote('');
                    }
                  }}
                  disabled={!newNote.trim()}
                  className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Add Note
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {activeRecipe.execution.notes.map(note => (
                  <div
                    key={note.id}
                    className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {note.author}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getHealthColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-yellow-600';
  if (score >= 70) return 'text-orange-600';
  return 'text-red-600';
}