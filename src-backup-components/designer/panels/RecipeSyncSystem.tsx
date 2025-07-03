'use client';

import React, { useState, useEffect } from 'react';
import {
  Beaker, Sun, Calendar, Clock, Droplets,
  Zap, Leaf, TrendingUp, AlertTriangle, CheckCircle,
  Save, Upload, Download, Play, Pause,
  ChevronRight, ChevronDown, Plus, Trash2,
  Copy, Edit2, X, Info, GitBranch
} from 'lucide-react';
import { useDesigner } from '../context/DesignerContext';
import { useNotifications } from '../context/NotificationContext';
import { cropDatabase, getCropData } from '@/lib/crop-database';

interface NutrientRecipe {
  id: string;
  name: string;
  ec: number; // mS/cm
  ph: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    calcium: number;
    magnesium: number;
    sulfur: number;
    micronutrients: {
      iron: number;
      manganese: number;
      zinc: number;
      copper: number;
      boron: number;
      molybdenum: number;
    };
  };
}

interface LightingRecipe {
  id: string;
  name: string;
  photoperiod: number; // hours
  intensity: number; // PPFD
  dli: number; // mol/m²/day
  spectrum: {
    red: number;
    blue: number;
    green: number;
    farRed: number;
    uv?: number;
  };
  rampTime: number; // minutes
}

interface GrowthStageRecipe {
  id: string;
  stage: 'germination' | 'propagation' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  name: string;
  duration: number; // days
  lightRecipe: LightingRecipe;
  nutrientRecipe: NutrientRecipe;
  environmentTargets: {
    temperature: { day: number; night: number };
    humidity: { day: number; night: number };
    co2: number; // ppm
    vpd: { min: number; max: number };
  };
}

interface CropRecipeProgram {
  id: string;
  name: string;
  cropType: string;
  totalDuration: number; // days
  stages: GrowthStageRecipe[];
  notes: string;
  validated: boolean;
  lastModified: Date;
}

interface RecipeExecution {
  programId: string;
  startDate: Date;
  currentDay: number;
  currentStage: number;
  status: 'active' | 'paused' | 'completed';
  actualValues: {
    ec: number;
    ph: number;
    ppfd: number;
    temperature: number;
    humidity: number;
  };
}

export function RecipeSyncSystem({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useDesigner();
  const { showNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'programs' | 'recipes' | 'execution' | 'analytics'>('programs');
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<number>(0);
  
  // Pre-defined recipes
  const [programs, setPrograms] = useState<CropRecipeProgram[]>([
    {
      id: 'lettuce-hydro',
      name: 'Lettuce Hydroponic Standard',
      cropType: 'lettuce',
      totalDuration: 35,
      stages: [
        {
          id: 'lettuce-germ',
          stage: 'germination',
          name: 'Germination',
          duration: 3,
          lightRecipe: {
            id: 'low-light',
            name: 'Low Intensity',
            photoperiod: 16,
            intensity: 100,
            dli: 5.8,
            spectrum: { red: 40, blue: 30, green: 20, farRed: 10 },
            rampTime: 30
          },
          nutrientRecipe: {
            id: 'seedling-mix',
            name: 'Seedling Mix',
            ec: 0.8,
            ph: 5.8,
            nutrients: {
              nitrogen: 50,
              phosphorus: 15,
              potassium: 30,
              calcium: 40,
              magnesium: 15,
              sulfur: 20,
              micronutrients: {
                iron: 2,
                manganese: 0.5,
                zinc: 0.1,
                copper: 0.05,
                boron: 0.5,
                molybdenum: 0.01
              }
            }
          },
          environmentTargets: {
            temperature: { day: 22, night: 20 },
            humidity: { day: 70, night: 75 },
            co2: 400,
            vpd: { min: 0.4, max: 0.6 }
          }
        },
        {
          id: 'lettuce-veg',
          stage: 'vegetative',
          name: 'Vegetative Growth',
          duration: 25,
          lightRecipe: {
            id: 'veg-light',
            name: 'Vegetative High',
            photoperiod: 18,
            intensity: 250,
            dli: 16.2,
            spectrum: { red: 35, blue: 35, green: 20, farRed: 10 },
            rampTime: 15
          },
          nutrientRecipe: {
            id: 'veg-mix',
            name: 'Vegetative Mix',
            ec: 1.6,
            ph: 5.8,
            nutrients: {
              nitrogen: 150,
              phosphorus: 50,
              potassium: 200,
              calcium: 150,
              magnesium: 40,
              sulfur: 60,
              micronutrients: {
                iron: 3,
                manganese: 0.8,
                zinc: 0.3,
                copper: 0.1,
                boron: 0.7,
                molybdenum: 0.05
              }
            }
          },
          environmentTargets: {
            temperature: { day: 23, night: 19 },
            humidity: { day: 65, night: 70 },
            co2: 800,
            vpd: { min: 0.8, max: 1.0 }
          }
        },
        {
          id: 'lettuce-finish',
          stage: 'harvest',
          name: 'Pre-Harvest',
          duration: 7,
          lightRecipe: {
            id: 'finish-light',
            name: 'Finishing Light',
            photoperiod: 16,
            intensity: 200,
            dli: 11.5,
            spectrum: { red: 45, blue: 25, green: 20, farRed: 10 },
            rampTime: 10
          },
          nutrientRecipe: {
            id: 'finish-mix',
            name: 'Finishing Mix',
            ec: 1.2,
            ph: 5.9,
            nutrients: {
              nitrogen: 100,
              phosphorus: 40,
              potassium: 180,
              calcium: 120,
              magnesium: 35,
              sulfur: 50,
              micronutrients: {
                iron: 2.5,
                manganese: 0.6,
                zinc: 0.2,
                copper: 0.08,
                boron: 0.6,
                molybdenum: 0.03
              }
            }
          },
          environmentTargets: {
            temperature: { day: 21, night: 18 },
            humidity: { day: 60, night: 65 },
            co2: 600,
            vpd: { min: 0.8, max: 1.0 }
          }
        }
      ],
      notes: 'Standard recipe for butterhead lettuce in NFT system',
      validated: true,
      lastModified: new Date()
    },
    {
      id: 'tomato-vine',
      name: 'Tomato Vine Crop',
      cropType: 'tomato',
      totalDuration: 120,
      stages: [
        {
          id: 'tomato-prop',
          stage: 'propagation',
          name: 'Propagation',
          duration: 14,
          lightRecipe: {
            id: 'prop-light',
            name: 'Propagation',
            photoperiod: 18,
            intensity: 150,
            dli: 9.7,
            spectrum: { red: 30, blue: 40, green: 20, farRed: 10 },
            rampTime: 30
          },
          nutrientRecipe: {
            id: 'prop-mix',
            name: 'Propagation Mix',
            ec: 1.0,
            ph: 5.8,
            nutrients: {
              nitrogen: 80,
              phosphorus: 40,
              potassium: 80,
              calcium: 80,
              magnesium: 30,
              sulfur: 40,
              micronutrients: {
                iron: 2,
                manganese: 0.5,
                zinc: 0.2,
                copper: 0.05,
                boron: 0.5,
                molybdenum: 0.02
              }
            }
          },
          environmentTargets: {
            temperature: { day: 24, night: 20 },
            humidity: { day: 70, night: 75 },
            co2: 600,
            vpd: { min: 0.6, max: 0.8 }
          }
        },
        {
          id: 'tomato-veg',
          stage: 'vegetative',
          name: 'Vegetative',
          duration: 28,
          lightRecipe: {
            id: 'veg-strong',
            name: 'Strong Vegetative',
            photoperiod: 18,
            intensity: 400,
            dli: 25.9,
            spectrum: { red: 35, blue: 35, green: 20, farRed: 10 },
            rampTime: 15
          },
          nutrientRecipe: {
            id: 'veg-strong-mix',
            name: 'Strong Veg Mix',
            ec: 2.0,
            ph: 5.8,
            nutrients: {
              nitrogen: 180,
              phosphorus: 60,
              potassium: 250,
              calcium: 180,
              magnesium: 50,
              sulfur: 80,
              micronutrients: {
                iron: 3,
                manganese: 1,
                zinc: 0.4,
                copper: 0.1,
                boron: 0.8,
                molybdenum: 0.05
              }
            }
          },
          environmentTargets: {
            temperature: { day: 25, night: 19 },
            humidity: { day: 65, night: 70 },
            co2: 1000,
            vpd: { min: 0.9, max: 1.2 }
          }
        },
        {
          id: 'tomato-flower',
          stage: 'flowering',
          name: 'Flowering',
          duration: 21,
          lightRecipe: {
            id: 'flower-light',
            name: 'Flowering Light',
            photoperiod: 12,
            intensity: 600,
            dli: 25.9,
            spectrum: { red: 50, blue: 20, green: 20, farRed: 10 },
            rampTime: 15
          },
          nutrientRecipe: {
            id: 'flower-mix',
            name: 'Flowering Mix',
            ec: 2.4,
            ph: 5.9,
            nutrients: {
              nitrogen: 160,
              phosphorus: 80,
              potassium: 300,
              calcium: 200,
              magnesium: 60,
              sulfur: 100,
              micronutrients: {
                iron: 3.5,
                manganese: 1.2,
                zinc: 0.5,
                copper: 0.15,
                boron: 1,
                molybdenum: 0.06
              }
            }
          },
          environmentTargets: {
            temperature: { day: 24, night: 18 },
            humidity: { day: 60, night: 65 },
            co2: 1200,
            vpd: { min: 1.0, max: 1.4 }
          }
        },
        {
          id: 'tomato-fruit',
          stage: 'fruiting',
          name: 'Fruiting',
          duration: 57,
          lightRecipe: {
            id: 'fruit-light',
            name: 'Fruiting Light',
            photoperiod: 14,
            intensity: 700,
            dli: 35.3,
            spectrum: { red: 55, blue: 15, green: 20, farRed: 10 },
            rampTime: 10
          },
          nutrientRecipe: {
            id: 'fruit-mix',
            name: 'Fruiting Mix',
            ec: 2.8,
            ph: 6.0,
            nutrients: {
              nitrogen: 140,
              phosphorus: 70,
              potassium: 350,
              calcium: 220,
              magnesium: 70,
              sulfur: 120,
              micronutrients: {
                iron: 4,
                manganese: 1.5,
                zinc: 0.6,
                copper: 0.2,
                boron: 1.2,
                molybdenum: 0.08
              }
            }
          },
          environmentTargets: {
            temperature: { day: 23, night: 17 },
            humidity: { day: 55, night: 60 },
            co2: 1000,
            vpd: { min: 1.2, max: 1.6 }
          }
        }
      ],
      notes: 'High-wire tomato production recipe for greenhouse',
      validated: true,
      lastModified: new Date()
    }
  ]);
  
  const [activeExecution, setActiveExecution] = useState<RecipeExecution | null>(null);
  const [editingProgram, setEditingProgram] = useState<CropRecipeProgram | null>(null);
  
  // Simulate execution progress
  useEffect(() => {
    if (activeExecution && activeExecution.status === 'active') {
      const interval = setInterval(() => {
        // Simulate actual sensor values with some variation
        setActiveExecution(prev => {
          if (!prev) return null;
          return {
            ...prev,
            actualValues: {
              ec: prev.actualValues.ec + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.1,
              ph: prev.actualValues.ph + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.05,
              ppfd: prev.actualValues.ppfd + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 10,
              temperature: prev.actualValues.temperature + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 0.5,
              humidity: prev.actualValues.humidity + (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 2
            }
          };
        });
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [activeExecution]);
  
  const startExecution = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return;
    
    const execution: RecipeExecution = {
      programId,
      startDate: new Date(),
      currentDay: 0,
      currentStage: 0,
      status: 'active',
      actualValues: {
        ec: program.stages[0].nutrientRecipe.ec,
        ph: program.stages[0].nutrientRecipe.ph,
        ppfd: program.stages[0].lightRecipe.intensity,
        temperature: program.stages[0].environmentTargets.temperature.day,
        humidity: program.stages[0].environmentTargets.humidity.day
      }
    };
    
    setActiveExecution(execution);
    setActiveTab('execution');
    showNotification('success', `Started execution: ${program.name}`);
    
    // Apply light recipe to actual zones
    applyLightRecipeToZones(program.stages[0].lightRecipe);
  };
  
  const applyLightRecipeToZones = (lightRecipe: LightingRecipe) => {
    // In a real implementation, this would communicate with the lighting system
    
    // Update VibeLux fixtures to match recipe
    const fixtures = state.objects.filter(obj => obj.type === 'fixture');
    fixtures.forEach(fixture => {
      // This would update fixture settings based on the recipe
      dispatch({
        type: 'UPDATE_OBJECT',
        payload: {
          id: fixture.id,
          updates: {
            dimming: (lightRecipe.intensity / 1000) * 100, // Convert PPFD to dimming %
            spectrum: lightRecipe.spectrum
          }
        }
      });
    });
  };
  
  const createNewProgram = () => {
    const newProgram: CropRecipeProgram = {
      id: `program-${Date.now()}`,
      name: 'New Recipe Program',
      cropType: 'custom',
      totalDuration: 0,
      stages: [],
      notes: '',
      validated: false,
      lastModified: new Date()
    };
    
    setEditingProgram(newProgram);
  };
  
  const saveProgram = (program: CropRecipeProgram) => {
    const totalDuration = program.stages.reduce((sum, stage) => sum + stage.duration, 0);
    const updatedProgram = { 
      ...program, 
      totalDuration,
      lastModified: new Date(),
      validated: validateProgram(program)
    };
    
    if (programs.find(p => p.id === program.id)) {
      setPrograms(programs.map(p => p.id === program.id ? updatedProgram : p));
    } else {
      setPrograms([...programs, updatedProgram]);
    }
    
    setEditingProgram(null);
    showNotification('success', 'Recipe program saved');
  };
  
  const validateProgram = (program: CropRecipeProgram): boolean => {
    // Validation rules
    if (program.stages.length === 0) return false;
    
    for (const stage of program.stages) {
      // Check EC progression
      if (stage.nutrientRecipe.ec < 0.5 || stage.nutrientRecipe.ec > 4.0) return false;
      
      // Check pH range
      if (stage.nutrientRecipe.ph < 5.0 || stage.nutrientRecipe.ph > 7.0) return false;
      
      // Check DLI calculation
      const calculatedDLI = (stage.lightRecipe.intensity * stage.lightRecipe.photoperiod * 3600) / 1000000;
      if (Math.abs(calculatedDLI - stage.lightRecipe.dli) > 0.5) return false;
    }
    
    return true;
  };
  
  const exportProgram = (program: CropRecipeProgram) => {
    const blob = new Blob([JSON.stringify(program, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipe-${program.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Recipe program exported');
  };
  
  const renderProgramsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recipe Programs</h3>
        <button
          onClick={createNewProgram}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Program
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map(program => (
          <div key={program.id} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  {program.name}
                  {program.validated && (
                    <CheckCircle className="w-4 h-4 text-green-500" title="Validated" />
                  )}
                </h4>
                <p className="text-sm text-gray-400">
                  {program.cropType} • {program.totalDuration} days • {program.stages.length} stages
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProgram(program)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => exportProgram(program)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Stage Timeline */}
            <div className="mb-4">
              <div className="flex h-2 bg-gray-700 rounded-full overflow-hidden">
                {program.stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className={`h-full ${
                      stage.stage === 'germination' ? 'bg-green-500' :
                      stage.stage === 'propagation' ? 'bg-blue-500' :
                      stage.stage === 'vegetative' ? 'bg-purple-500' :
                      stage.stage === 'flowering' ? 'bg-pink-500' :
                      stage.stage === 'fruiting' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${(stage.duration / program.totalDuration) * 100}%` }}
                    title={`${stage.name}: ${stage.duration} days`}
                  />
                ))}
              </div>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Avg DLI:</span>
                <p className="font-semibold text-blue-400">
                  {(program.stages.reduce((sum, s) => sum + s.lightRecipe.dli * s.duration, 0) / program.totalDuration).toFixed(1)}
                </p>
              </div>
              <div>
                <span className="text-gray-400">EC Range:</span>
                <p className="font-semibold text-green-400">
                  {Math.min(...program.stages.map(s => s.nutrientRecipe.ec)).toFixed(1)} - {Math.max(...program.stages.map(s => s.nutrientRecipe.ec)).toFixed(1)}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Max PPFD:</span>
                <p className="font-semibold text-yellow-400">
                  {Math.max(...program.stages.map(s => s.lightRecipe.intensity))}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setSelectedProgram(program.id);
                  setActiveTab('recipes');
                }}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
              >
                View Details
              </button>
              <button
                onClick={() => startExecution(program.id)}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                disabled={activeExecution?.status === 'active'}
              >
                <Play className="w-4 h-4" />
                Execute
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderRecipesTab = () => {
    const program = selectedProgram ? programs.find(p => p.id === selectedProgram) : null;
    
    if (!program) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">Select a program to view recipes</p>
        </div>
      );
    }
    
    const stage = program.stages[selectedStage] || program.stages[0];
    
    return (
      <div className="space-y-6">
        {/* Program Header */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">{program.name}</h3>
          <div className="flex gap-2 overflow-x-auto">
            {program.stages.map((s, index) => (
              <button
                key={s.id}
                onClick={() => setSelectedStage(index)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  selectedStage === index
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {s.name} ({s.duration}d)
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Light Recipe */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-500" />
              Light Recipe
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Photoperiod:</span>
                <span className="text-white font-medium">{stage.lightRecipe.photoperiod} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Intensity:</span>
                <span className="text-white font-medium">{stage.lightRecipe.intensity} µmol/m²/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">DLI:</span>
                <span className="text-white font-medium">{stage.lightRecipe.dli} mol/m²/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ramp Time:</span>
                <span className="text-white font-medium">{stage.lightRecipe.rampTime} min</span>
              </div>
              
              <div className="pt-3 border-t border-gray-700">
                <p className="text-gray-400 mb-2">Spectrum:</p>
                <div className="space-y-2">
                  {Object.entries(stage.lightRecipe.spectrum).map(([color, value]) => (
                    <div key={color} className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 capitalize w-16">{color}:</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-full rounded-full ${
                            color === 'red' ? 'bg-red-500' :
                            color === 'blue' ? 'bg-blue-500' :
                            color === 'green' ? 'bg-green-500' :
                            color === 'farRed' ? 'bg-red-700' :
                            'bg-purple-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm text-white w-10 text-right">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Nutrient Recipe */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Beaker className="w-5 h-5 text-green-500" />
              Nutrient Recipe
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">EC:</span>
                <span className="text-white font-medium">{stage.nutrientRecipe.ec} mS/cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">pH:</span>
                <span className="text-white font-medium">{stage.nutrientRecipe.ph}</span>
              </div>
              
              <div className="pt-3 border-t border-gray-700">
                <p className="text-gray-400 mb-2">Macronutrients (ppm):</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">N:</span>
                    <span className="text-white">{stage.nutrientRecipe.nutrients.nitrogen}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">P:</span>
                    <span className="text-white">{stage.nutrientRecipe.nutrients.phosphorus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">K:</span>
                    <span className="text-white">{stage.nutrientRecipe.nutrients.potassium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ca:</span>
                    <span className="text-white">{stage.nutrientRecipe.nutrients.calcium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mg:</span>
                    <span className="text-white">{stage.nutrientRecipe.nutrients.magnesium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">S:</span>
                    <span className="text-white">{stage.nutrientRecipe.nutrients.sulfur}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Environment Targets */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-500" />
            Environment Targets
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Day Temp</p>
              <p className="text-2xl font-bold text-orange-400">{stage.environmentTargets.temperature.day}°C</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Night Temp</p>
              <p className="text-2xl font-bold text-blue-400">{stage.environmentTargets.temperature.night}°C</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Day RH</p>
              <p className="text-2xl font-bold text-cyan-400">{stage.environmentTargets.humidity.day}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">CO₂</p>
              <p className="text-2xl font-bold text-green-400">{stage.environmentTargets.co2} ppm</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderExecutionTab = () => {
    if (!activeExecution) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">No active recipe execution</p>
          <button
            onClick={() => setActiveTab('programs')}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Start a Program
          </button>
        </div>
      );
    }
    
    const program = programs.find(p => p.id === activeExecution.programId);
    if (!program) return null;
    
    const currentStage = program.stages[activeExecution.currentStage];
    const progress = (activeExecution.currentDay / program.totalDuration) * 100;
    
    return (
      <div className="space-y-6">
        {/* Execution Status */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{program.name}</h3>
            <div className="flex items-center gap-3">
              {activeExecution.status === 'active' ? (
                <button
                  onClick={() => setActiveExecution({ ...activeExecution, status: 'paused' })}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={() => setActiveExecution({ ...activeExecution, status: 'active' })}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              )}
              <button
                onClick={() => {
                  setActiveExecution(null);
                  showNotification('info', 'Recipe execution stopped');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Stop
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Day {activeExecution.currentDay} of {program.totalDuration}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Current Stage:</p>
            <p className="text-lg font-semibold text-white">{currentStage.name}</p>
            <p className="text-sm text-gray-400">
              Day {activeExecution.currentDay % currentStage.duration} of {currentStage.duration}
            </p>
          </div>
        </div>
        
        {/* Real-time Monitoring */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">EC</span>
              {Math.abs(activeExecution.actualValues.ec - currentStage.nutrientRecipe.ec) > 0.2 ? (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {activeExecution.actualValues.ec.toFixed(1)}
            </p>
            <p className="text-xs text-gray-400">
              Target: {currentStage.nutrientRecipe.ec}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">pH</span>
              {Math.abs(activeExecution.actualValues.ph - currentStage.nutrientRecipe.ph) > 0.3 ? (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {activeExecution.actualValues.ph.toFixed(1)}
            </p>
            <p className="text-xs text-gray-400">
              Target: {currentStage.nutrientRecipe.ph}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">PPFD</span>
              {Math.abs(activeExecution.actualValues.ppfd - currentStage.lightRecipe.intensity) > 50 ? (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.round(activeExecution.actualValues.ppfd)}
            </p>
            <p className="text-xs text-gray-400">
              Target: {currentStage.lightRecipe.intensity}
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Temp</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-white">
              {activeExecution.actualValues.temperature.toFixed(1)}°C
            </p>
            <p className="text-xs text-gray-400">
              Target: {currentStage.environmentTargets.temperature.day}°C
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">RH</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.round(activeExecution.actualValues.humidity)}%
            </p>
            <p className="text-xs text-gray-400">
              Target: {currentStage.environmentTargets.humidity.day}%
            </p>
          </div>
        </div>
        
        {/* Stage Schedule */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Stage Schedule</h4>
          <div className="space-y-2">
            {program.stages.map((stage, index) => {
              const stageStart = program.stages.slice(0, index).reduce((sum, s) => sum + s.duration, 0);
              const stageEnd = stageStart + stage.duration;
              const isActive = activeExecution.currentDay >= stageStart && activeExecution.currentDay < stageEnd;
              const isPast = activeExecution.currentDay >= stageEnd;
              
              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    isActive ? 'bg-purple-900/30 border border-purple-600' :
                    isPast ? 'bg-gray-700 opacity-50' :
                    'bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isActive ? (
                      <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
                    ) : isPast ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <p className="font-medium text-white">{stage.name}</p>
                      <p className="text-sm text-gray-400">
                        Days {stageStart + 1} - {stageEnd}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">DLI: {stage.lightRecipe.dli}</p>
                    <p className="text-sm text-gray-400">EC: {stage.nutrientRecipe.ec}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recipe Performance Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm text-gray-400 mb-2">Average Cycle Time</h4>
            <p className="text-2xl font-bold text-white">87 days</p>
            <p className="text-sm text-green-400">-3 days vs target</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm text-gray-400 mb-2">Yield Efficiency</h4>
            <p className="text-2xl font-bold text-white">94%</p>
            <p className="text-sm text-green-400">+2% vs baseline</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm text-gray-400 mb-2">Resource Usage</h4>
            <p className="text-2xl font-bold text-white">0.92x</p>
            <p className="text-sm text-green-400">8% savings</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recipe Comparison</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400">Recipe</th>
                <th className="text-center py-2 px-3 text-gray-400">Executions</th>
                <th className="text-center py-2 px-3 text-gray-400">Avg Yield</th>
                <th className="text-center py-2 px-3 text-gray-400">Energy/kg</th>
                <th className="text-center py-2 px-3 text-gray-400">Water/kg</th>
                <th className="text-center py-2 px-3 text-gray-400">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(program => (
                <tr key={program.id} className="border-b border-gray-700">
                  <td className="py-2 px-3 text-white">{program.name}</td>
                  <td className="text-center py-2 px-3 text-gray-300">
                    {Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50) + 10}
                  </td>
                  <td className="text-center py-2 px-3 text-gray-300">
                    {(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5 + 2).toFixed(1)} kg/m²
                  </td>
                  <td className="text-center py-2 px-3 text-gray-300">
                    {(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 50 + 100).toFixed(0)} kWh
                  </td>
                  <td className="text-center py-2 px-3 text-gray-300">
                    {(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 + 30).toFixed(0)} L
                  </td>
                  <td className="text-center py-2 px-3">
                    <span className="text-green-400">
                      {(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 10 + 90).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Optimization Suggestions</h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-900/20 rounded-lg">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Reduce vegetative EC</p>
              <p className="text-sm text-gray-400">
                Analysis shows 5% better growth with EC 1.4 instead of 1.6 during vegetative stage
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Extend flowering photoperiod</p>
              <p className="text-sm text-gray-400">
                Adding 1 hour to flowering photoperiod increased yield by 8% in recent trials
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-yellow-900/20 rounded-lg">
            <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Optimize ramp timing</p>
              <p className="text-sm text-gray-400">
                Shorter sunrise ramps (10 min) show same results with 15% energy savings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-green-500 rounded-lg">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Recipe Synchronization System</h2>
              <p className="text-sm text-gray-400">Coordinate lighting with nutrient schedules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Status Bar */}
        {activeExecution && (
          <div className="bg-gray-800 px-6 py-2 border-b border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Active Recipe:</span>
                <span className="text-white font-medium">
                  {programs.find(p => p.id === activeExecution.programId)?.name}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  activeExecution.status === 'active' ? 'bg-green-900 text-green-300' :
                  activeExecution.status === 'paused' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {activeExecution.status}
                </span>
              </div>
              <span className="text-gray-400">
                Day {activeExecution.currentDay} • Stage {activeExecution.currentStage + 1}
              </span>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="bg-gray-800 px-4 py-2 flex gap-4 border-b border-gray-700">
          {(['programs', 'recipes', 'execution', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'programs' && renderProgramsTab()}
          {activeTab === 'recipes' && renderRecipesTab()}
          {activeTab === 'execution' && renderExecutionTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </div>
        
        {/* Edit Program Modal */}
        {editingProgram && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Edit Recipe Program</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Program Name</label>
                  <input
                    type="text"
                    value={editingProgram.name}
                    onChange={(e) => setEditingProgram({ ...editingProgram, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Crop Type</label>
                  <select
                    value={editingProgram.cropType}
                    onChange={(e) => setEditingProgram({ ...editingProgram, cropType: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  >
                    <option value="custom">Custom</option>
                    {Object.entries(cropDatabase).map(([key, crop]) => (
                      <option key={key} value={key}>{crop.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notes</label>
                  <textarea
                    value={editingProgram.notes}
                    onChange={(e) => setEditingProgram({ ...editingProgram, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                    rows={3}
                  />
                </div>
                
                {/* Add stages section here */}
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setEditingProgram(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveProgram(editingProgram)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    Save Program
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}